from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.evaluation import EvaluationOut


class ExperimentRunCreate(BaseModel):
    label: str = "Run"
    prompt_version_id: Optional[str] = None
    model: str = "mock-standard"
    technique: str = "zero-shot"
    temperature: float = 0.2
    system_instructions: str = ""
    user_input: str = ""
    output_format: str = "text"
    json_schema: Optional[dict] = None
    # If true, backend runs generation + evaluation immediately.
    run_now: bool = True


class ExperimentCreate(BaseModel):
    name: str
    task_type: str = "general"
    input_data: str = ""
    runs: list[ExperimentRunCreate] = []


class ExperimentRunOut(BaseModel):
    id: str
    label: str
    model: str
    technique: str
    temperature: float
    system_instructions: str
    user_input: str
    output_format: str
    response_text: str
    is_demo_response: bool
    latency_ms: int
    prompt_tokens: int
    completion_tokens: int
    structured_valid: Optional[bool] = None
    structured_error: Optional[str] = None
    created_at: datetime
    evaluation: Optional[EvaluationOut] = None

    class Config:
        from_attributes = True

    @staticmethod
    def from_orm_run(run):
        data = ExperimentRunOut.model_validate(run, from_attributes=True)
        data.is_demo_response = bool(run.is_demo_response)
        data.structured_valid = (
            bool(run.structured_valid) if run.structured_valid is not None else None
        )
        return data


class ExperimentOut(BaseModel):
    id: str
    name: str
    task_type: str
    input_data: str
    status: str
    created_at: datetime
    runs: list[ExperimentRunOut] = []

    class Config:
        from_attributes = True


class ExperimentSummary(BaseModel):
    id: str
    name: str
    task_type: str
    status: str
    created_at: datetime
    run_count: int
    models: list[str]
    techniques: list[str]
