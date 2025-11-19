from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any, List
from pathlib import Path
import json

from ..config import RUN_DIR, OPENAI_API_KEY, DATASETS, MODELS
from ..stages import Stage, normalize_stage
from ..data.loader_tl import load_telemetry_literacy
from ..adapters.mock import MockAdapter
from ..adapters.openai import OpenAIAdapter
from ..eval.runner import run_telemetry_literacy
from ..viz.charts import generate_all_charts

app = FastAPI(title="FactoryBench API", version="0.1.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHARTS_DIR = Path("charts")


class RunRequest(BaseModel):
    stage: Literal["telemetry_literacy"] = "telemetry_literacy"
    model: str = Field(default="mock", description="mock | openai:gpt-5 | openai:<name>")
    dataset_source: Literal["local", "hf"] = "local"
    hf_slug: Optional[str] = None
    split: str = "train"
    limit: Optional[int] = 25
    fixture_path: str = "fixtures/stage1.json"


@app.get("/healthz")
def healthz():
    return {"ok": True}


@app.get("/runs")
def list_runs(
    model: Optional[List[str]] = Query(None),
    dataset: Optional[List[str]] = Query(None),
    stage: Optional[str] = None,
):
    """List runs with optional filtering by model, dataset source, and stage."""
    RUN_DIR.mkdir(parents=True, exist_ok=True)
    items = []
    for p in sorted(Path(RUN_DIR).glob("*.json")):
        try:
            with p.open("r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Apply filters
            if model and data.get("model") not in model:
                continue
            if stage and data.get("stage") != stage:
                continue
            if dataset:
                dataset_source = data.get("dataset", {}).get("source")
                if dataset_source not in dataset:
                    continue
            
            items.append(
                {
                    "run_id": data.get("run_id"),
                    "stage": data.get("stage"),
                    "model": data.get("model"),
                    "aggregate": data.get("aggregate", {}),
                    "dataset": data.get("dataset", {}),
                }
            )
        except Exception:
            continue
    return {"items": items, "count": len(items)}


@app.get("/runs/{run_id}")
def get_run(run_id: str):
    p = Path(RUN_DIR) / f"{run_id}.json"
    if not p.exists():
        raise HTTPException(status_code=404, detail="Run not found")
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)


@app.post("/runs")
def create_run(req: RunRequest):
    try:
        stage = normalize_stage(req.stage)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if stage != Stage.telemetry_literacy:
        raise HTTPException(status_code=400, detail="Only telemetry_literacy supported in MVP")

    samples = load_telemetry_literacy(
        source=req.dataset_source,
        path=req.fixture_path,
        hf_slug=req.hf_slug,
        split=req.split,
        limit=req.limit,
    )
    if not samples:
        raise HTTPException(status_code=400, detail="No samples loaded")

    adapter, model_name = _resolve_adapter(req.model)

    dataset_meta = {
        "source": req.dataset_source,
        "hf_slug": req.hf_slug,
        "split": req.split,
        "limit": req.limit,
        "fixture_path": req.fixture_path,
    }
    run = run_telemetry_literacy(samples, adapter, model_name, dataset_meta)
    return run


def _resolve_adapter(model: str):
    model = (model or "").strip()
    if model == "mock":
        return MockAdapter(), "mock"
    if model.startswith("openai:"):
        name = model.split(":", 1)[1] or "gpt-5"
        if not OPENAI_API_KEY:
            raise HTTPException(status_code=400, detail="OPENAI_API_KEY not configured")
        return OpenAIAdapter(model=name), f"openai:{name}"
    if OPENAI_API_KEY:
        return OpenAIAdapter(model=model or "gpt-5"), f"openai:{model or 'gpt-5'}"
    raise HTTPException(status_code=400, detail="Unknown model; try model=mock or openai:<name>")


@app.get("/charts/{chart_type}")
def get_chart(
    chart_type: str, 
    regenerate: bool = False,
    model: Optional[List[str]] = Query(None),
    dataset: Optional[List[str]] = Query(None),
):
    """Get a generated chart image with optional filtering."""
    # Always regenerate when filters are provided to ensure charts reflect current filter state
    should_regenerate = regenerate or model or dataset or not CHARTS_DIR.exists()
    
    if should_regenerate:
        generate_all_charts(RUN_DIR, CHARTS_DIR, model_filters=model, dataset_filters=dataset)
    
    chart_file = CHARTS_DIR / f"{chart_type}.png"
    if not chart_file.exists():
        raise HTTPException(status_code=404, detail=f"Chart {chart_type} not found")
    
    return FileResponse(chart_file, media_type="image/png")


@app.post("/charts/regenerate")
def regenerate_charts(
    model: Optional[List[str]] = Query(None),
    dataset: Optional[List[str]] = Query(None),
):
    """Regenerate all charts from current runs with optional filtering."""
    generate_all_charts(RUN_DIR, CHARTS_DIR, model_filters=model, dataset_filters=dataset)
    return {"status": "ok", "charts_dir": str(CHARTS_DIR), "filters": {"model": model, "dataset": dataset}}


@app.get("/metadata/models")
def get_models():
    """Get available models from registry and discovered from runs."""
    discovered_models = set()
    RUN_DIR.mkdir(parents=True, exist_ok=True)
    for p in Path(RUN_DIR).glob("*.json"):
        try:
            with p.open("r", encoding="utf-8") as f:
                data = json.load(f)
                model = data.get("model")
                if model:
                    discovered_models.add(model)
        except Exception:
            continue
    
    # Combine registry models with discovered ones
    all_models = {m["id"]: m for m in MODELS}
    for model_id in discovered_models:
        if model_id not in all_models:
            all_models[model_id] = {
                "id": model_id,
                "name": model_id,
                "provider": "custom",
            }
    
    return {"models": list(all_models.values())}


@app.get("/metadata/datasets")
def get_datasets(stage: Optional[str] = None):
    """Get available datasets from registry."""
    if stage:
        return {"datasets": DATASETS.get(stage, [])}
    return {"datasets": DATASETS}
