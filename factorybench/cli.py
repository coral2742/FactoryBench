import json
import click

from .data.loader_tl import load_telemetry_literacy
from .adapters.mock import MockAdapter
from .adapters.openai import OpenAIAdapter
from .eval.runner import run_telemetry_literacy
from .config import OPENAI_API_KEY


@click.group()
def cli():
    """FactoryBench CLI"""


@cli.command("run-stage1")
@click.option("--model", default="mock", help="mock | openai:<model>")
@click.option("--dataset-source", default="local", type=click.Choice(["local", "hf"]))
@click.option("--hf-slug", default=None)
@click.option("--hf-split", default="train")
@click.option("--fixture-path", default="fixtures/stage1.json")
@click.option("--limit", default=10, type=int)
def run_stage1(model, dataset_source, hf_slug, hf_split, fixture_path, limit):
    """Evaluate telemetry_literacy (Stage 1) and write a run JSON."""
    samples = load_telemetry_literacy(
        source=dataset_source,
        path=fixture_path,
        hf_slug=hf_slug,
        split=hf_split,
        limit=limit,
    )
    if model == "mock":
        adapter, model_name = MockAdapter(), "mock"
    else:
        if model.startswith("openai:"):
            name = model.split(":", 1)[1]
        else:
            name = model
        if not OPENAI_API_KEY:
            raise click.UsageError("OPENAI_API_KEY not configured; use model=mock or set key")
        adapter, model_name = OpenAIAdapter(model=name), f"openai:{name}"

    run = run_telemetry_literacy(
        samples=samples,
        adapter=adapter,
        model_name=model_name,
        dataset_meta={
            "source": dataset_source,
            "hf_slug": hf_slug,
            "split": hf_split,
            "limit": limit,
            "fixture_path": fixture_path,
        },
    )
    click.echo(json.dumps({"run_id": run["run_id"], "aggregate": run["aggregate"]}, indent=2))


@cli.command("components:test")
@click.option("--time-series-encoder", default="default")
@click.option("--limit", default=5, type=int)
def components_test(time_series_encoder, limit):
    """Placeholder for future component tests; currently runs mock Stage 1."""
    click.echo(
        "components:test is a placeholder; running mock Stage 1 to verify plumbing..."
    )
    samples = load_telemetry_literacy(limit=limit)
    run = run_telemetry_literacy(
        samples=samples,
        adapter=MockAdapter(),
        model_name="mock",
        dataset_meta={"source": "local", "limit": limit, "fixture_path": "fixtures/stage1.json"},
    )
    click.echo(json.dumps({"run_id": run["run_id"], "aggregate": run["aggregate"]}, indent=2))


if __name__ == "__main__":
    cli()
