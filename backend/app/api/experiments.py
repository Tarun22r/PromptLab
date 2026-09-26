import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.evaluators.rule_based import evaluate_response
from app.models.evaluation import Evaluation
from app.models.experiment import Experiment, ExperimentRun
from app.schemas.experiment import (
    ExperimentCreate,
    ExperimentOut,
    ExperimentRunOut,
    ExperimentSummary,
)
from app.services.llm_provider import get_provider

router = APIRouter(prefix="/api/experiments", tags=["experiments"])


def _run_and_evaluate(db: Session, experiment_id: str, run_payload) -> ExperimentRun:
    provider = get_provider()
    result = provider.complete(
        system_instructions=run_payload.system_instructions,
        user_input=run_payload.user_input,
        model=run_payload.model,
        temperature=run_payload.temperature,
        output_format=run_payload.output_format,
    )

    structured_valid = None
    structured_error = None
    if run_payload.output_format == "json":
        try:
            json.loads(result.text)
            structured_valid = 1
        except json.JSONDecodeError as e:
            structured_valid = 0
            structured_error = str(e)

    run = ExperimentRun(
        experiment_id=experiment_id,
        label=run_payload.label,
        prompt_version_id=run_payload.prompt_version_id,
        model=run_payload.model,
        technique=run_payload.technique,
        temperature=run_payload.temperature,
        system_instructions=run_payload.system_instructions,
        user_input=run_payload.user_input,
        output_format=run_payload.output_format,
        response_text=result.text,
        is_demo_response=1 if result.is_demo else 0,
        latency_ms=result.latency_ms,
        prompt_tokens=result.prompt_tokens,
        completion_tokens=result.completion_tokens,
        structured_valid=structured_valid,
        structured_error=structured_error,
    )
    db.add(run)
    db.flush()

    eval_result = evaluate_response(
        user_input=run_payload.user_input,
        response_text=result.text,
        output_format=run_payload.output_format,
        json_schema=run_payload.json_schema,
    )
    db.add(
        Evaluation(
            run_id=run.id,
            method=eval_result["method"],
            metrics=eval_result["metrics"],
            overall_score=eval_result["overall_score"],
        )
    )
    return run


@router.post("", response_model=ExperimentOut, status_code=201)
def create_experiment(payload: ExperimentCreate, db: Session = Depends(get_db)):
    experiment = Experiment(name=payload.name, task_type=payload.task_type, input_data=payload.input_data)
    db.add(experiment)
    db.flush()

    for run_payload in payload.runs:
        if run_payload.run_now:
            _run_and_evaluate(db, experiment.id, run_payload)
        else:
            db.add(
                ExperimentRun(
                    experiment_id=experiment.id,
                    label=run_payload.label,
                    prompt_version_id=run_payload.prompt_version_id,
                    model=run_payload.model,
                    technique=run_payload.technique,
                    temperature=run_payload.temperature,
                    system_instructions=run_payload.system_instructions,
                    user_input=run_payload.user_input,
                    output_format=run_payload.output_format,
                )
            )

    db.commit()
    db.refresh(experiment)
    return experiment


@router.get("", response_model=list[ExperimentSummary])
def list_experiments(db: Session = Depends(get_db)):
    experiments = (
        db.query(Experiment).options(joinedload(Experiment.runs)).order_by(Experiment.created_at.desc()).all()
    )
    summaries = []
    for exp in experiments:
        summaries.append(
            ExperimentSummary(
                id=exp.id,
                name=exp.name,
                task_type=exp.task_type,
                status=exp.status,
                created_at=exp.created_at,
                run_count=len(exp.runs),
                models=sorted({r.model for r in exp.runs}),
                techniques=sorted({r.technique for r in exp.runs}),
            )
        )
    return summaries


@router.get("/{experiment_id}", response_model=ExperimentOut)
def get_experiment(experiment_id: str, db: Session = Depends(get_db)):
    experiment = db.get(Experiment, experiment_id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return experiment


@router.delete("/{experiment_id}", status_code=204)
def delete_experiment(experiment_id: str, db: Session = Depends(get_db)):
    experiment = db.get(Experiment, experiment_id)
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    db.delete(experiment)
    db.commit()
