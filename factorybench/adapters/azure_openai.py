import os
from dotenv import load_dotenv
from .base import ModelAdapter

load_dotenv()


class AzureOpenAIAdapter(ModelAdapter):
    def __init__(
        self,
        deployment: str,
        api_version: str | None = None,
        endpoint: str | None = None,
        api_key: str | None = None,
    ):
        from openai import AzureOpenAI
        
        self.client = AzureOpenAI(
            api_version=api_version or os.getenv("AZURE_OPENAI_API_VERSION"),
            azure_endpoint=endpoint or os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=api_key or os.getenv("AZURE_OPENAI_API_KEY"),
        )
        self.deployment = deployment

    def generate(self, prompt: str) -> str:
        resp = self.client.chat.completions.create(
            model=self.deployment,
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
        )
        return resp.choices[0].message.content or ""
