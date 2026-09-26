from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import evaluate, experiments, generate, prompts, templates
from app.core.config import get_settings
from app.core.database import SessionLocal, init_db
from app.core.seed import seed_templates

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    try:
        seed_templates(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": settings.demo_mode}


app.include_router(prompts.router)
app.include_router(experiments.router)
app.include_router(evaluate.router)
app.include_router(generate.router)
app.include_router(templates.router)
