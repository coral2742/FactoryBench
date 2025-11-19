from typing import Any, Dict, List, Optional
import json
from pathlib import Path

try:
    from datasets import load_dataset
except Exception:  # pragma: no cover
    load_dataset = None  # type: ignore


def load_telemetry_literacy(
    source: str = "local",
    path: str = "datasets/basic_statistics.json",
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
            # HF dataset structure: id, timestamps, values, domain, subtype, statistics
            rows.append(
                {
                    "id": r.get("id"),
                    "timestamps": list(r.get("timestamps", [])),
                    "values": list(r.get("values", [])),
                    "domain": r.get("domain"),
                    "subtype": r.get("subtype"),
                    "statistics": dict(r.get("statistics", {})),
                }
            )
            if limit and len(rows) >= limit:
                break
        return rows

    # local - new format only (timestamps, values, statistics)
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Dataset not found: {p}")
    with p.open("r", encoding="utf-8") as f:
        data = json.load(f)
    
    return data[:limit] if limit else data
