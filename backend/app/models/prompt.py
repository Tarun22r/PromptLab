import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


def gen_id() -> str:
    return uuid.uuid4().hex[:12]


class Prompt(Base):
    """A saved, named prompt in the library. Holds metadata; the actual
    content lives in versions so history is preserved."""

    __tablename__ = "prompts"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    task_type = Column(String, default="general")
    technique = Column(String, default="zero-shot")
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = relationship(
        "PromptVersion", back_populates="prompt", cascade="all, delete-orphan",
        order_by="PromptVersion.version_number",
    )


class PromptVersion(Base):
    """An immutable snapshot of a prompt's content at a point in time."""

    __tablename__ = "prompt_versions"

    id = Column(String, primary_key=True, default=gen_id)
    prompt_id = Column(String, ForeignKey("prompts.id"), nullable=False)
    version_number = Column(Integer, nullable=False)

    system_instructions = Column(Text, default="")
    user_input_template = Column(Text, default="")
    output_format = Column(String, default="text")  # text | json | markdown
    json_schema = Column(JSON, nullable=True)

    model = Column(String, default="mock-standard")
    temperature = Column(Float, default=0.2)

    created_at = Column(DateTime, default=datetime.utcnow)

    prompt = relationship("Prompt", back_populates="versions")
