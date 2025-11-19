# FactoryBench

Lean benchmark for evaluating AI model performance on industrial troubleshooting — from telemetry literacy to guided remediation — with a minimal Python backend and a clean Remix frontend.

## Overview

FactoryBench evaluates how well AI models can generate step-by-step instructions to fix industrial machines based on:
- Multivariate time series data
- Machine manuals and documentation
- Machine metadata (including fault codes)
- Factory process context and dependencies

All datasets across all stages live in the external FactorySet repository
(currently hosted under Xelerit-Robotics and migrating to Forgis):
https://github.com/Xelerit-Robotics/FactorySet
and are mirrored to Hugging Face Datasets for streaming at scale.

## Architecture

### Frontend
- Framework: Remix (React)
- Hosting: Vercel (planned)
- Purpose: Leaderboard, run browser, and basic dataset metadata views

### Development Stages

FactoryBench follows a modular development approach with progressive complexity:

#### Stage 1: Telemetry Literacy (Current Focus)
Goal: Evaluate basic time series comprehension capabilities

Capabilities Tested:
- Step function detection and analysis
- Statistical measures (max, min, average, coefficient of variation, etc.)
- Pattern recognition in multivariate sensor data
- Anomaly detection in temporal data

Dataset: Synthetic and semi-synthetic time series with known properties

Evaluation Metrics:
- Accuracy of statistical calculations
- Correct identification of step changes
- Pattern detection precision/recall

#### Stage 2: Root Cause Analysis (Planned)
Goal: Bridge the gap between basic time series understanding and full troubleshooting

Capabilities Tested (TBD):
- Correlation between sensor readings and fault types
- Basic diagnostic reasoning
- Understanding of machine state transitions
- Context integration (manual snippets + sensor data)

Dataset: Partially curated real-world examples with simplified troubleshooting scenarios

#### Stage 3: Guided Remediation with FactorySet (Final Goal)
Goal: Evaluate complete diagnostic and instruction generation capabilities

Capabilities Tested:
- Multi-modal input integration (time series + manuals + metadata)
- Step-by-step repair instruction generation
- Contextual understanding of factory process dependencies
- Fault code interpretation and correlation
- Root cause analysis

Dataset: FactorySet — a curated dataset containing:
- Real industrial machine failure scenarios
- Corresponding sensor data (multivariate time series)
- Relevant manual sections and documentation
- Machine metadata and fault codes
- Process context and dependencies
- Expert-validated repair instructions (ground truth)

Evaluation Metrics:
- Instruction correctness and completeness
- Safety compliance
- Efficiency (unnecessary steps)
- Logical flow and ordering
- Context awareness

## Ideal System Components

### 1. Data Pipeline
```
Raw Data → Preprocessing → Feature Extraction → Storage
                                                   ↓
                                            Benchmark API
```

**Components**:
- Time series ingestion and validation
- Manual/documentation parser
- Metadata normalization
- Version control for datasets (FactorySet stages)

### 2. Evaluation Engine
```
Samples → Prompt Builder → Model Adapter → Parser → Scoring → Artifact
```

Features:
- Stage 1 deterministic scoring (mean/min/max abs errors)
- Model adapters (Azure OpenAI, mock); logging + reproducible run manifests
- Local JSON artifacts for runs in `runs/`

### 3. Frontend Application (Remix)
```
/
├── /leaderboard         # Historical results and leaderboard
├── /runs/:id            # Run detail (aggregate + raw)
└── /                    # Overview
```

Key Features:
- Leaderboard and simple run explorer
- Static-first; switches to API once available

### 4. Backend/API (MVP implemented)
```
GET  /healthz
GET  /runs              # list run summaries
GET  /runs/{id}         # retrieve run artifact
POST /runs              # create a new telemetry_literacy run
```

### 5. Persistence (MVP)
- Local JSON files under `runs/` (artifact + manifest)
- Upgradable later to Postgres/S3 without changing public APIs

## Technology Stack

### Frontend
- Remix (React), CSS variables themed with Forgis palette

### Backend
- Python FastAPI + Uvicorn, Click CLI
- HF Datasets for optional data loading

### Model Integration
- Azure OpenAI SDK, Mock adapter by default

## Development Environment

Use uv virtual environments (Forgis standard):

```powershell
pipx install uv
uv venv
uv pip install -e ".[dev]"
```

Environment variables (examples): `HF_API_TOKEN`, `WANDB_API_KEY`, `DATABASE_URL`, `REDIS_URL`, `FACTORYBENCH_S3_URL`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_ENDPOINT`.

Fallback (without uv):
```powershell
python -m venv .venv
./.venv/Scripts/python -m pip install --upgrade pip
./.venv/Scripts/python -m pip install -e .
```

## Quick Start (Local)

Prereqs: Python 3.11+, Node 18+, npm

1) Install Python deps and set env (optional for Azure):
```powershell
pipx install uv
uv venv
uv pip install -e .
Copy-Item .env.example .env -ErrorAction SilentlyContinue
# Optional if using Azure OpenAI adapter
$env:AZURE_OPENAI_API_KEY="<your_key>"
$env:AZURE_OPENAI_ENDPOINT="<your_endpoint>"
```

2) Start the API (Stage 1: telemetry_literacy):
```powershell
uv run uvicorn factorybench.api.app:app --reload --port 5173
```

3) Create a sample run (mock model):
```powershell
uv run python -m factorybench.cli run-stage1 --model mock --limit 5
```

4) Frontend (Remix) in another terminal:
```powershell
Push-Location frontend
npm install
# Optional: point UI to API if not default
$env:API_BASE="http://127.0.0.1:5173"
npm run dev
Pop-Location
```

Routes:
- API: `GET http://127.0.0.1:5173/runs`, `GET /runs/{id}`, `POST /runs`
- Frontend: `/` (overview), `/leaderboard`, `/runs/:id`

HF datasets (optional when available):
```powershell
uv run python -m factorybench.cli run-stage1 --dataset-source hf --hf-slug Forgis/FactorySet-telemetry_literacy --hf-split train --limit 50 --model mock
```

## Dataset Structure: FactorySet (illustrative)

```
FactorySet/
├── metadata.json                    # Dataset version, statistics
├── stage1_timeseries/
│   ├── simple/                     # Basic statistical tests
│   ├── intermediate/               # Pattern detection
│   └── advanced/                   # Complex multivariate
├── stage2_intermediate/            # TBD
└── stage3_full/
    ├── scenario_001/
    │   ├── timeseries.parquet      # Sensor data
    │   ├── manual.pdf              # Relevant manual pages
    │   ├── metadata.json           # Fault codes, machine info
    │   ├── context.json            # Process dependencies
    │   └── ground_truth.json       # Expert instructions
    ├── scenario_002/
    └── ...
```

Data hosting:
- Canonical schemas/scripts live in the FactorySet GitHub repo (migrating to Forgis org): https://github.com/Xelerit-Robotics/FactorySet
- Large data artifacts are mirrored to Hugging Face Datasets for streaming access.

Hugging Face mirrors (to be created later):
- An HF slug is the dataset identifier on Hugging Face Hub, e.g., `org/name`.
- Recommended naming once ready (Forgis org):
    - `Forgis/FactorySet-telemetry_literacy`
    - `Forgis/FactorySet-root_cause_analysis`
    - `Forgis/FactorySet-guided_remediation`
  
We’ll replace these with the actual slugs after the HF repos are created.

## Evaluation Workflow

1. **Select Benchmark Stage** (1, 2, or 3)
2. **Choose Model(s)** to evaluate
3. **Configure Parameters** (temperature, prompting strategy, etc.)
4. **Run Evaluation** (parallel or sequential)
5. **Automated Scoring** against ground truth
6. **Optional Human Review** (for Stage 3)
7. **View Results** in dashboard
8. **Compare Models** side-by-side

## Success Metrics

### Stage 1 (Telemetry Literacy)
- Statistical accuracy: >95%
- Pattern detection F1-score
- Processing time per sample

### Stage 2 (Root Cause Analysis)
- TBD based on specific capabilities tested

### Stage 3 (Guided Remediation)
- Instruction correctness: % of steps correct
- Safety score: compliance with safety protocols
- Completeness: % of necessary steps included
- Efficiency: ratio of necessary to total steps
- Expert rating: 1-5 scale by domain experts
- Time to resolution (simulated)

## Quick Start (Local)

Prereqs: Python 3.11+, Node 18+, npm

1) Install Python deps and set env (optional for Azure):
```powershell
pipx install uv
uv venv
uv pip install -e .
Copy-Item .env.example .env -ErrorAction SilentlyContinue
# Optional if using Azure OpenAI adapter
$env:AZURE_OPENAI_API_KEY="<your_key>"
$env:AZURE_OPENAI_ENDPOINT="<your_endpoint>"
```

2) Start the API (Stage 1: telemetry_literacy):
```powershell
uv run uvicorn factorybench.api.app:app --reload --port 5173
```

3) Create a sample run (mock model):
```powershell
uv run python -m factorybench.cli run-stage1 --model mock --limit 5
```

4) Frontend (Remix) in another terminal:
```powershell
Push-Location frontend
npm install
$env:API_BASE="http://127.0.0.1:5173"
npm run dev
Pop-Location
```

Routes:
- API: `GET http://127.0.0.1:5173/runs`, `GET /runs/{id}`, `POST /runs`
- Frontend: `/` (overview), `/leaderboard`, `/runs/:id`

## Roadmap

- [x] Phase 1: Implement Stage 1 MVP (telemetry_literacy) backend + CLI + API
- [x] Phase 2: Minimal Remix frontend (leaderboard + run detail)
- [ ] Phase 3: Add HF dataset integration presets & docs
- [ ] Phase 4: Reports and richer metrics visualization
- [ ] Phase 5: Stage 2 (root_cause_analysis) task specs
- [ ] **Phase 6**: Design Stage 2 intermediate benchmarks
- [ ] **Phase 7**: Begin FactorySet curation (Stage 3 dataset)
- [ ] **Phase 8**: Implement guided_remediation evaluation (Stage 3)
- [ ] **Phase 9**: Add human evaluation interface
- [ ] **Phase 10**: Public leaderboard and API access

## Contributing

FactorySet curation is a critical component. Contributions of real-world industrial scenarios with expert-validated solutions are highly valued.

## License

TBD

---

**Status**: Stage 1 — Telemetry Literacy (MVP running)
