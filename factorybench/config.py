import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

RUN_DIR = Path(os.getenv("FACTORYBENCH_RUN_DIR", "runs")).resolve()
RUN_DIR.mkdir(parents=True, exist_ok=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Azure OpenAI Configuration
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")

# Dataset Registry
DATASETS = {
    "telemetry_literacy": [
        {
            "id": "local_stage1",
            "name": "Local Stage 1 (3 samples)",
            "source": "local",
            "fixture_path": "fixtures/stage1.json",
            "split": "train",
        },
        # Future HF datasets will be added here
        # {
        #     "id": "hf_tl_full",
        #     "name": "HF Telemetry Literacy Full",
        #     "source": "hf",
        #     "hf_slug": "Xelerit-Robotics/telemetry-literacy",
        #     "split": "train",
        # },
    ]
}

# Model Registry
MODELS = [
    {"id": "mock", "name": "Mock Adapter", "provider": "local"},
    {"id": "openai:gpt-4", "name": "GPT-4", "provider": "openai"},
    {"id": "openai:gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "openai"},
    {"id": "openai:gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "openai"},
    {"id": "azure:gpt-4o", "name": "GPT-4o (Azure)", "provider": "azure"},
    {"id": "azure:gpt-4o-mini", "name": "GPT-4o Mini (Azure)", "provider": "azure"},
    {"id": "azure:gpt-4-turbo", "name": "GPT-4 Turbo (Azure)", "provider": "azure"},
    {"id": "azure:gpt-35-turbo", "name": "GPT-3.5 Turbo (Azure)", "provider": "azure"},
]
