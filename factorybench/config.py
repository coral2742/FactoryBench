import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

RUN_DIR = Path(os.getenv("FACTORYBENCH_RUN_DIR", "runs")).resolve()
RUN_DIR.mkdir(parents=True, exist_ok=True)

HF_API_TOKEN = os.getenv("HF_API_TOKEN")

# Azure OpenAI Configuration
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")

# Dataset Registry
DATASETS = {
    "telemetry_literacy": [
        {
            "id": "local_basic",
            "name": "Basic Statistics (10 samples)",
            "source": "local",
            "fixture_path": "datasets/basic_statistics.json",
            "split": "train",
        },
        {
            "id": "local_step_functions",
            "name": "Step Functions (15 samples)",
            "source": "local",
            "fixture_path": "datasets/step_functions.json",
            "split": "train",
        },
        {
            "id": "local_patterns",
            "name": "Pattern Recognition (12 samples)",
            "source": "local",
            "fixture_path": "datasets/pattern_recognition.json",
            "split": "train",
        },
        {
            "id": "hf_factoryset",
            "name": "FS-TL v0.1 (50k samples)",
            "source": "hf",
            "hf_slug": "Forgis/FactorySet",
            "split": "train",
        },
    ]
}

# Model Registry
MODELS = [
    {"id": "mock", "name": "Mock Adapter", "provider": "local"},
    {"id": "azure:gpt-4o", "name": "GPT-4o (Azure)", "provider": "azure"},
    {"id": "azure:gpt-4o-mini", "name": "GPT-4o Mini (Azure)", "provider": "azure"},
    {"id": "azure:gpt-4-turbo", "name": "GPT-4 Turbo (Azure)", "provider": "azure"},
    {"id": "azure:gpt-35-turbo", "name": "GPT-3.5 Turbo (Azure)", "provider": "azure"},
]

# Azure OpenAI pricing (USD per 1K tokens) - updated Nov 2024
# Source: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/
AZURE_PRICING = {
    "azure:gpt-35-turbo": {"input_per_1k": 0.0015, "output_per_1k": 0.002},
    "azure:gpt-4-turbo": {"input_per_1k": 0.01, "output_per_1k": 0.03},
    # gpt-4o-2024-11-20 (latest as of Nov 2024)
    "azure:gpt-4o": {"input_per_1k": 0.0025, "output_per_1k": 0.01},
    # gpt-4o-mini-2024-07-18
    "azure:gpt-4o-mini": {"input_per_1k": 0.00015, "output_per_1k": 0.0006},
}
