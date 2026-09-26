from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MetricResult(BaseModel):
    score: Optional[int] = None  # 0-100, null if not applicable
    explanation: str


class EvaluateRequest(BaseModel):
    run_id: Optional[str] = None
    # Ad-hoc evaluation (no stored run) is also supported for the Playground.
    user_input: Optional[str] = None
    response_text: Optional[str] = None
    output_format: str = "text"
    json_schema: Optional[dict] = None
    task_type: str = "general"


class EvaluationOut(BaseModel):
    id: str
    method: str
    metrics: dict[str, MetricResult]
    overall_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
