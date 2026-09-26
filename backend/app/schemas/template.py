from typing import Optional

from pydantic import BaseModel


class PromptTemplateOut(BaseModel):
    id: str
    name: str
    description: str
    task_type: str
    technique: str
    system_instructions: str
    user_input_template: str
    output_format: str
    json_schema: Optional[dict] = None
    tags: list[str]

    class Config:
        from_attributes = True
