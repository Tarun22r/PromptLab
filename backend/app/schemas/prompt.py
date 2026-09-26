from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PromptVersionBase(BaseModel):
    system_instructions: str = ""
    user_input_template: str = ""
    output_format: str = Field(default="text", pattern="^(text|json|markdown)$")
    json_schema: Optional[dict] = None
    model: str = "mock-standard"
    temperature: float = 0.2


class PromptVersionOut(PromptVersionBase):
    id: str
    version_number: int
    created_at: datetime

    class Config:
        from_attributes = True


class PromptCreate(BaseModel):
    name: str
    description: str = ""
    task_type: str = "general"
    technique: str = "zero-shot"
    tags: list[str] = []
    version: PromptVersionBase


class PromptUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    technique: Optional[str] = None
    tags: Optional[list[str]] = None
    # Supplying `version` creates a NEW version rather than mutating history.
    version: Optional[PromptVersionBase] = None


class PromptOut(BaseModel):
    id: str
    name: str
    description: str
    task_type: str
    technique: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime
    versions: list[PromptVersionOut] = []

    class Config:
        from_attributes = True
