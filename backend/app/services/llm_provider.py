"""
LLM provider abstraction.

The rest of the app never talks to an LLM SDK directly — it calls
`get_provider().complete(...)`. This keeps the door open to swapping in
Anthropic, Gemini, or a local model later without touching route handlers.

If no API key is configured (app.core.config.Settings.demo_mode), the
DemoProvider is used instead: deterministic, clearly-labeled mock output.
This is what lets the app run fully without credentials.
"""
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.core.config import get_settings
from app.services.demo_provider import generate_demo_response


@dataclass
class CompletionResult:
    text: str
    is_demo: bool
    latency_ms: int
    prompt_tokens: int
    completion_tokens: int


def estimate_tokens(text: str) -> int:
    """Rough token estimate (~4 chars/token), used consistently by both
    the demo provider and the frontend character/token counter so numbers
    displayed to the user are at least internally consistent."""
    return max(1, len(text) // 4)


class LLMProvider(ABC):
    @abstractmethod
    def complete(
        self,
        system_instructions: str,
        user_input: str,
        model: str,
        temperature: float,
        output_format: str,
    ) -> CompletionResult:
        ...


class OpenAICompatibleProvider(LLMProvider):
    """Talks to any OpenAI-compatible /chat/completions endpoint. This is
    intentionally provider-agnostic: base_url and model are configurable so
    the same code path works for OpenAI, and for OpenAI-compatible gateways
    in front of other model providers."""

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.llm_api_key
        self.base_url = settings.llm_base_url

    def complete(self, system_instructions, user_input, model, temperature, output_format):
        import httpx

        start = time.perf_counter()
        messages = []
        if system_instructions:
            messages.append({"role": "system", "content": system_instructions})
        messages.append({"role": "user", "content": user_input})

        payload = {"model": model, "messages": messages, "temperature": temperature}
        if output_format == "json":
            payload["response_format"] = {"type": "json_object"}

        with httpx.Client(timeout=60.0) as client:
            resp = client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()

        latency_ms = int((time.perf_counter() - start) * 1000)
        text = data["choices"][0]["message"]["content"]
        usage = data.get("usage", {})
        return CompletionResult(
            text=text,
            is_demo=False,
            latency_ms=latency_ms,
            prompt_tokens=usage.get("prompt_tokens", estimate_tokens(system_instructions + user_input)),
            completion_tokens=usage.get("completion_tokens", estimate_tokens(text)),
        )


class DemoLLMProvider(LLMProvider):
    """Deterministic, offline mock provider. Same input -> same output, so
    the app is genuinely useful for exploring comparison/evaluation flows
    without ever pretending to be a real model call."""

    def complete(self, system_instructions, user_input, model, temperature, output_format):
        start = time.perf_counter()
        text = generate_demo_response(system_instructions, user_input, output_format, temperature)
        # Simulated latency proportional to output length keeps the UI's
        # loading state honest-feeling without an artificial fixed delay.
        latency_ms = 180 + min(len(text), 2000) // 4
        return CompletionResult(
            text=text,
            is_demo=True,
            latency_ms=latency_ms,
            prompt_tokens=estimate_tokens(system_instructions + user_input),
            completion_tokens=estimate_tokens(text),
        )


def get_provider() -> LLMProvider:
    settings = get_settings()
    if settings.demo_mode:
        return DemoLLMProvider()
    return OpenAICompatibleProvider()
