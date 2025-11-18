from typing import Any, Dict, List
from datetime import datetime, timezone
import json
from pathlib import Path

from ..config import RUN_DIR
from ..adapters.base import ModelAdapter
from ..metrics.telemetry_literacy import score_sample, aggregate


def build_prompt(series: list[float]) -> str:
    return (
        "You are given a numeric time series. Compute and return only these values:\n"
        "mean=<float> min=<float> max=<float>\n"
        f"Series: {series}\n"
        "Output format: mean=<float> min=<float> max=<float>"
    )


def run_telemetry_literacy(
    samples: List[Dict[str, Any]],
    adapter: ModelAdapter,
    model_name: str,
    dataset_meta: Dict[str, Any],
) -> Dict[str, Any]:
    started = datetime.now(timezone.utc)
    results: List[Dict[str, Any]] = []
    scores: List[Dict[str, Any]] = []

    for s in samples:
        pred_text = adapter.generate(build_prompt(s["series"]))
        sc = score_sample(s, pred_text)
        scores.append(sc)
        results.append(
            {
                "id": s.get("id"),
                "series": s.get("series"),
                "reference": s.get("reference"),
                "prediction_text": pred_text,
                "metrics": sc,
            }
        )

    agg = aggregate(scores)
    run = {
        "run_id": started.strftime("tl-%Y%m%dT%H%M%S"),
        "stage": "telemetry_literacy",
        "model": model_name,
        "started_at": started.isoformat(),
        "ended_at": datetime.now(timezone.utc).isoformat(),
        "dataset": dataset_meta,
        "aggregate": agg,
        "results": results,
        "version": "0.1.0",
    }

    # persist
    RUN_DIR.mkdir(parents=True, exist_ok=True)
    out_path = Path(RUN_DIR) / f"{run['run_id']}.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(run, f, indent=2)
    return run
