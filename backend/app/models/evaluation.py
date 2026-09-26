from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.prompt import gen_id


class Evaluation(Base):
    """Evaluation results for a single experiment run.

    `method` records how the scores were produced ("rule_based" or
    "llm_judge") so the UI can label results honestly rather than implying
    every score came from an LLM judge.
    """

    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, default=gen_id)
    run_id = Column(String, ForeignKey("experiment_runs.id"), nullable=False, unique=True)

    method = Column(String, default="rule_based")  # rule_based | llm_judge | unavailable
    metrics = Column(JSON, default=dict)  # {name: {score, explanation}}
    overall_score = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("ExperimentRun", back_populates="evaluation")
