import json

from fastapi import APIRouter

from app.schemas.generate import GenerateRequest, GenerateResponse
from app.services.llm_provider import get_provider

router = APIRouter(prefix="/api/generate", tags=["generate"])


@router.post("", response_model=GenerateResponse)
def generate(payload: GenerateRequest):
    provider = get_provider()
    result = provider.complete(
        system_instructions=payload.system_instructions,
        user_input=payload.user_input,
        model=payload.model,
        temperature=payload.temperature,
        output_format=payload.output_format,
    )

    structured_valid = None
    structured_error = None
    if payload.output_format == "json":
        try:
            json.loads(result.text)
            structured_valid = True
        except json.JSONDecodeError as e:
            structured_valid = False
            structured_error = str(e)

    return GenerateResponse(
        response_text=result.text,
        is_demo_response=result.is_demo,
        model=payload.model,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        completion_tokens=result.completion_tokens,
        structured_valid=structured_valid,
        structured_error=structured_error,
    )
