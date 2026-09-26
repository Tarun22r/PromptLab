from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.evaluators.rule_based import evaluate_response
from app.models.evaluation import Evaluation
from app.models.experiment import ExperimentRun
from app.schemas.evaluation import EvaluateRequest, EvaluationOut

router = APIRouter(prefix="/api/evaluate", tags=["evaluate"])


@router.post("", response_model=EvaluationOut)
def evaluate(payload: EvaluateRequest, db: Session = Depends(get_db)):
    run: ExperimentRun | None = None
    if payload.run_id:
        run = db.get(ExperimentRun, payload.run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Experiment run not found")
        user_input = run.user_input
        response_text = run.response_text
        output_format = run.output_format
    else:
        if payload.response_text is None:
            raise HTTPException(
                status_code=422, detail="Provide either run_id or response_text to evaluate."
            )
        user_input = payload.user_input or ""
        response_text = payload.response_text
        output_format = payload.output_format

    result = evaluate_response(
        user_input=user_input,
        response_text=response_text,
        output_format=output_format,
        json_schema=payload.json_schema,
    )

    if run:
        existing = db.query(Evaluation).filter(Evaluation.run_id == run.id).first()
        if existing:
            db.delete(existing)
            db.flush()
        evaluation = Evaluation(
            run_id=run.id,
            method=result["method"],
            metrics=result["metrics"],
            overall_score=result["overall_score"],
        )
        db.add(evaluation)
        db.commit()
        db.refresh(evaluation)
        return evaluation

    # Ad-hoc evaluation not tied to a stored run — return without persisting.
    return EvaluationOut(
        id="adhoc",
        method=result["method"],
        metrics=result["metrics"],
        overall_score=result["overall_score"],
        created_at=datetime.utcnow(),
    )
