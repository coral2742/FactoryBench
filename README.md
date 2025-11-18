# FactoryBench

A comprehensive benchmark for evaluating AI model performance on industrial machine troubleshooting and repair instruction generation.

## Overview

FactoryBench is designed to test how well AI models can generate step-by-step instructions to fix industrial machines based on:
- Multivariate time series data
- Machine manuals and documentation
- Machine metadata (including fault codes)
- Factory process context and dependencies

All datasets across all stages are maintained in the external FactorySet repository
(currently hosted under Xelerit-Robotics and migrating to Forgis):
https://github.com/Xelerit-Robotics/FactorySet
and mirrored to Hugging Face Datasets (for streaming at scale).

## Architecture

### Frontend
- **Framework**: Remix
- **Hosting**: Vercel
- **Purpose**: Interactive interface for running benchmarks, visualizing results, and comparing model performance

### Development Stages

FactoryBench follows a modular development approach with progressive complexity:

#### Stage 1: Time Series Understanding (Current Focus)
**Goal**: Evaluate basic time series comprehension capabilities

**Capabilities Tested**:
- Step function detection and analysis
- Statistical measures (max, min, average, coefficient of variation, etc.)
- Pattern recognition in multivariate sensor data
- Anomaly detection in temporal data

**Dataset**: Synthetic and semi-synthetic time series with known properties

**Evaluation Metrics**:
- Accuracy of statistical calculations
- Correct identification of step changes
- Pattern detection precision/recall

#### Stage 2: Intermediate Evaluation (Planned)
**Goal**: Bridge the gap between basic time series understanding and full troubleshooting

**Capabilities Tested** (TBD):
- Correlation between sensor readings and fault types
- Basic diagnostic reasoning
- Understanding of machine state transitions
- Context integration (manual snippets + sensor data)

**Dataset**: Partially curated real-world examples with simplified troubleshooting scenarios

#### Stage 3: Full Troubleshooting with FactorySet (Final Goal)
**Goal**: Evaluate complete diagnostic and instruction generation capabilities

**Capabilities Tested**:
- Multi-modal input integration (time series + manuals + metadata)
- Step-by-step repair instruction generation
- Contextual understanding of factory process dependencies
- Fault code interpretation and correlation
- Root cause analysis

**Dataset**: **FactorySet** - A high-quality curated dataset containing:
- Real industrial machine failure scenarios
- Corresponding sensor data (multivariate time series)
- Relevant manual sections and documentation
- Machine metadata and fault codes
- Process context and dependencies
- Expert-validated repair instructions (ground truth)

**Evaluation Metrics**:
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
Model Input → Model API → Response → Scoring → Results Dashboard
```

**Features**:
- Multi-modal input formatting
- Support for various model APIs (OpenAI, Anthropic, local models, etc.)
- Automated scoring against ground truth
- Human evaluation interface (for subjective metrics)
- Comparative analysis across models

### 3. Frontend Application (Remix)
```
/
├── /benchmarks          # List available benchmarks (Stage 1, 2, 3)
├── /benchmark/:id       # Run specific benchmark
├── /results             # Historical results and leaderboard
├── /dataset             # Dataset browser (FactorySet)
└── /compare             # Model comparison tool
```

**Key Features**:
- Real-time benchmark execution
- Interactive time series visualization
- Model response comparison
- Leaderboard and performance metrics
- Dataset exploration and preview

### 4. Backend/API (Suggested)
```
/api
├── /evaluate            # Submit evaluation job
├── /models              # Manage model configurations
├── /datasets            # Access benchmark datasets
├── /results             # Retrieve evaluation results
└── /metrics             # Custom metric definitions
```

### 5. Database Schema (Suggested)
```
- Benchmarks (stage, version, description)
- Datasets (time_series, manuals, metadata)
- Evaluations (model, benchmark, timestamp, config)
- Results (evaluation_id, scores, model_outputs)
- Models (name, provider, api_config)
```

## Technology Stack (Recommended)

### Frontend
- **Remix** (React framework)
- **TailwindCSS** (styling)
- **Recharts/D3.js** (time series visualization)
- **shadcn/ui** (component library)

### Backend
- **Node.js/TypeScript** (API server)
- **tRPC** or **REST API** (API layer)
- **PostgreSQL** (structured data)
- **TimescaleDB** extension (time series optimization)
- **S3/R2** (dataset storage)

### Infrastructure
- **Vercel** (frontend hosting)
- **Railway/Render/AWS** (backend hosting - if needed)
- **Redis** (caching, job queue)

### Model Integration
- **LangChain/LlamaIndex** (optional, for complex workflows)
- Model provider SDKs (OpenAI, Anthropic, etc.)

## Development Environment

Use uv virtual environments (Forgis standard):

```powershell
pipx install uv
uv venv
uv pip install -e ".[dev]"
```

Environment variables (examples): `OPENAI_API_KEY`, `HF_API_TOKEN`, `DATABASE_URL`, `REDIS_URL`, `FACTORYBENCH_S3_URL`.

## Dataset Structure: FactorySet

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
    - `Forgis/FactorySet-stage1-timeseries-synthetic`
    - `Forgis/FactorySet-stage2-intermediate`
    - `Forgis/FactorySet-stage3-industrial`
  
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

### Stage 1 (Time Series)
- Statistical accuracy: >95%
- Pattern detection F1-score
- Processing time per sample

### Stage 2 (Intermediate)
- TBD based on specific capabilities tested

### Stage 3 (Full Troubleshooting)
- Instruction correctness: % of steps correct
- Safety score: compliance with safety protocols
- Completeness: % of necessary steps included
- Efficiency: ratio of necessary to total steps
- Expert rating: 1-5 scale by domain experts
- Time to resolution (simulated)

## Roadmap

- [ ] **Phase 1**: Setup Remix frontend + Vercel deployment
- [ ] **Phase 2**: Implement Stage 1 benchmark (time series understanding)
- [ ] **Phase 3**: Create initial synthetic dataset for Stage 1
- [ ] **Phase 4**: Build evaluation engine and scoring system
- [ ] **Phase 5**: Develop results dashboard and visualization
- [ ] **Phase 6**: Design Stage 2 intermediate benchmarks
- [ ] **Phase 7**: Begin FactorySet curation (Stage 3 dataset)
- [ ] **Phase 8**: Implement full troubleshooting evaluation (Stage 3)
- [ ] **Phase 9**: Add human evaluation interface
- [ ] **Phase 10**: Public leaderboard and API access

## Contributing

FactorySet curation is a critical component. Contributions of real-world industrial scenarios with expert-validated solutions are highly valued.

## License

TBD

---

**Status**: Stage 1 - Time Series Understanding (In Development)
