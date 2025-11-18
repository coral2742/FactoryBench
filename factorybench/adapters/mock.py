from .base import ModelAdapter


class MockAdapter(ModelAdapter):
    def generate(self, prompt: str) -> str:
        # Always returns zeros; useful for plumbing tests
        return "mean=0 min=0 max=0"
