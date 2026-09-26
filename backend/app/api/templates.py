from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.template import PromptTemplate
from app.schemas.template import PromptTemplateOut

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[PromptTemplateOut])
def list_templates(db: Session = Depends(get_db)):
    return db.query(PromptTemplate).all()
