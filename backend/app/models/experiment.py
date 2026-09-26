from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.prompt import gen_id


class Experiment(Base):
    """A named container for one or more runs against a given task/input,
    optionally comparing multiple prompt versions (A/B/C)."""

    __tablename__ = "experiments"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    task_type = Column(String, default="general")
    input_data = Column(Text, default="")  # the shared test input used across runs
    status = Column(String, default="completed")  # pending | running | completed | failed
    created_at = Column(DateTime, default=datetime.utcnow)

    runs = relationship(
        "ExperimentRun", back_populates="experiment", cascade="all, delete-orphan"
    )


class ExperimentRun(Base):
    """A single prompt-version execution belonging to an experiment (e.g.
    'Prompt A' in a comparison, or the sole run of a single-prompt test)."""

    __tablename__ = "experiment_runs"

    id = Column(String, primary_key=True, default=gen_id)
    experiment_id = Column(String, ForeignKey("experiments.id"), nullable=False)
    label = Column(String, default="Run")  # e.g. "Prompt A"

    prompt_version_id = Column(String, ForeignKey("prompt_versions.id"), nullable=True)
    model = Column(String, default="mock-standard")
    technique = Column(String, default="zero-shot")
    temperature = Column(Float, default=0.2)

    system_instructions = Column(Text, default="")
    user_input = Column(Text, default="")
    output_format = Column(String, default="text")

    response_text = Column(Text, default="")
    is_demo_response = Column(Integer, default=1)  # 1 = demo/mock, 0 = real API call
    latency_ms = Column(Integer, default=0)
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)

    structured_valid = Column(Integer, nullable=True)  # null if not applicable
    structured_error = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    experiment = relationship("Experiment", back_populates="runs")
    evaluation = relationship(
        "Evaluation", back_populates="run", uselist=False, cascade="all, delete-orphan"
    )
