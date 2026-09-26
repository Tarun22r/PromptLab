from typing import Optional

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    system_instructions: str = ""
    user_input: str
    technique: str = "zero-shot"
    model: str = "mock-standard"
    temperature: float = Field(default=0.2, ge=0.0, le=2.0)
    output_format: str = Field(default="text", pattern="^(text|json|markdown)$")
    json_schema: Optional[dict] = None


class GenerateResponse(BaseModel):
    response_text: str
    is_demo_response: bool
    model: str
    latency_ms: int
    prompt_tokens: int
    completion_tokens: int
    structured_valid: Optional[bool] = None
    structured_error: Optional[str] = None
