from sqlalchemy import Column, String, Text, JSON

from app.core.database import Base
from app.models.prompt import gen_id


class PromptTemplate(Base):
    """Read-mostly starter templates, seeded at startup. These demonstrate
    good prompt structure for common tasks and can be cloned into the
    user's own Prompt Library."""

    __tablename__ = "prompt_templates"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    task_type = Column(String, default="general")
    technique = Column(String, default="zero-shot")
    system_instructions = Column(Text, default="")
    user_input_template = Column(Text, default="")
    output_format = Column(String, default="text")
    json_schema = Column(JSON, nullable=True)
    tags = Column(JSON, default=list)
