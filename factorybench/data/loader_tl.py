from typing import Any, Dict, List, Optional
import json
from pathlib import Path

try:
    from datasets import load_dataset
except Exception:  # pragma: no cover
    load_dataset = None  # type: ignore


def load_telemetry_literacy(
    source: str = "local",
    path: str = "fixtures/stage1.json",
    hf_slug: Optional[str] = None,
    split: str = "train",
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    if source == "hf":
        if load_dataset is None:
            raise RuntimeError("datasets not installed")
        if not hf_slug:
            raise ValueError("hf_slug required for source='hf'")
        ds = load_dataset(hf_slug, split=split, streaming=False)
        rows: List[Dict[str, Any]] = []
        for r in ds:
            rows.append(
                {
                    "id": r.get("id"),
                    "series": list(r.get("series", [])),
                    "reference": dict(r.get("reference", {})),
                }
            )
            if limit and len(rows) >= limit:
                break
        return rows

    # local
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Fixture not found: {p}")
    with p.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return data[:limit] if limit else data
