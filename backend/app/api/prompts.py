from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.prompt import Prompt, PromptVersion
from app.schemas.prompt import PromptCreate, PromptOut, PromptUpdate

router = APIRouter(prefix="/api/prompts", tags=["prompts"])


@router.post("", response_model=PromptOut, status_code=201)
def create_prompt(payload: PromptCreate, db: Session = Depends(get_db)):
    prompt = Prompt(
        name=payload.name,
        description=payload.description,
        task_type=payload.task_type,
        technique=payload.technique,
        tags=payload.tags,
    )
    db.add(prompt)
    db.flush()

    version = PromptVersion(
        prompt_id=prompt.id,
        version_number=1,
        **payload.version.model_dump(),
    )
    db.add(version)
    db.commit()
    db.refresh(prompt)
    return prompt


@router.get("", response_model=list[PromptOut])
def list_prompts(
    search: str | None = None,
    technique: str | None = None,
    task_type: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Prompt)
    if search:
        like = f"%{search.lower()}%"
        query = query.filter(Prompt.name.ilike(like) | Prompt.description.ilike(like))
    if technique:
        query = query.filter(Prompt.technique == technique)
    if task_type:
        query = query.filter(Prompt.task_type == task_type)
    return query.order_by(Prompt.updated_at.desc()).all()


@router.get("/{prompt_id}", response_model=PromptOut)
def get_prompt(prompt_id: str, db: Session = Depends(get_db)):
    prompt = db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt


@router.put("/{prompt_id}", response_model=PromptOut)
def update_prompt(prompt_id: str, payload: PromptUpdate, db: Session = Depends(get_db)):
    prompt = db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    for field in ("name", "description", "task_type", "technique", "tags"):
        value = getattr(payload, field)
        if value is not None:
            setattr(prompt, field, value)

    if payload.version is not None:
        next_number = (prompt.versions[-1].version_number + 1) if prompt.versions else 1
        version = PromptVersion(
            prompt_id=prompt.id,
            version_number=next_number,
            **payload.version.model_dump(),
        )
        db.add(version)

    db.commit()
    db.refresh(prompt)
    return prompt


@router.delete("/{prompt_id}", status_code=204)
def delete_prompt(prompt_id: str, db: Session = Depends(get_db)):
    prompt = db.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    db.delete(prompt)
    db.commit()


@router.post("/{prompt_id}/duplicate", response_model=PromptOut, status_code=201)
def duplicate_prompt(prompt_id: str, db: Session = Depends(get_db)):
    original = db.get(Prompt, prompt_id)
    if not original:
        raise HTTPException(status_code=404, detail="Prompt not found")
    latest = original.versions[-1]

    copy = Prompt(
        name=f"{original.name} (copy)",
        description=original.description,
        task_type=original.task_type,
        technique=original.technique,
        tags=list(original.tags or []),
    )
    db.add(copy)
    db.flush()
    db.add(
        PromptVersion(
            prompt_id=copy.id,
            version_number=1,
            system_instructions=latest.system_instructions,
            user_input_template=latest.user_input_template,
            output_format=latest.output_format,
            json_schema=latest.json_schema,
            model=latest.model,
            temperature=latest.temperature,
        )
    )
    db.commit()
    db.refresh(copy)
    return copy
