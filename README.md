# PromptLab

**AI Prompt Engineering & Evaluation Platform**

A workspace for designing, running, comparing, and evaluating LLM prompts as a systematic engineering process — not another chatbot.

## Overview

PromptLab treats prompt engineering the way you'd treat any other engineering discipline: write a prompt, run it against a model, evaluate the output against concrete criteria, compare it against alternatives, and iterate with version history. The core loop is:

```
Prompt → Model → Response → Evaluation → Comparison → Improvement
```

## Problem statement

Most people write LLM prompts by trial and error in a chat window, with no record of what was tried, no consistent way to judge whether a change actually helped, and no way to compare two candidate prompts side by side on the same input. PromptLab makes that process visible and repeatable: every run is stored, every response is evaluated against explainable metrics, and every saved prompt keeps its full version history.

## Features

- **Prompt Playground** — a developer-style editor (system instructions, user input, output format) with live character/token counts and `{{variable}}` support, run against a configurable model, technique, and temperature.
- **Prompt comparison** — define up to three prompt variants ("Prompt A/B/C"), run the same input against each, and see evaluation scores and raw responses side by side.
- **Transparent evaluation engine** — every response is scored on relevance, completeness, consistency, format adherence, and (when applicable) groundedness. Every score has a written explanation of how it was computed. Nothing is randomly generated.
- **Structured output validation** — define a JSON schema, and PromptLab validates the model's response against it, reporting missing keys or parse errors instead of silently repairing invalid JSON.
- **Prompt Library** — save, search, filter, duplicate, and delete named prompts.
- **Prompt versioning** — every edit to a saved prompt creates a new version rather than overwriting history.
- **Experiment history** — every run (single or comparison) is stored and browsable later.
- **Starter templates** — eight ready-made prompts (classification, extraction, summarization, sentiment analysis, SQL generation) demonstrating good prompt structure.
- **Demo Mode** — the entire app works with zero API keys configured, using a deterministic mock provider. Every mock response is explicitly labeled "Demo response."

## Architecture

```
Browser (React)
   │  fetch /api/*
   ▼
FastAPI backend
   │
   ├── LLM provider abstraction (real OpenAI-compatible call, or DemoLLMProvider)
   ├── Rule-based evaluator (no external calls)
   └── SQLAlchemy → SQLite
```

The frontend never sees an API key. All model calls happen server-side, behind a single `LLMProvider` interface (`backend/app/services/llm_provider.py`), so adding a second real provider later means writing one new class, not touching any route handler.

### Prompt engineering techniques implemented

Zero-shot, one-shot, few-shot, role prompting, structured output, classification, extraction, and summarization are all selectable in the Playground, each with a short explanation of what it does and when to use it (see `frontend/src/types/index.ts` and the in-app **Prompt Techniques** page).

### Evaluation methodology

`backend/app/evaluators/rule_based.py` computes each metric from a measurable property of the input/output pair:

| Metric | How it's computed |
|---|---|
| Relevance | Overlap between distinct terms in the input and the response |
| Completeness | Response length, used as a coarse proxy for depth of coverage |
| Consistency | Variance in sentence length, as a heuristic for rambling/padding |
| Format adherence | JSON validity + schema key coverage, or Markdown structural markers |
| Groundedness | Reported as **unavailable** unless a reference document is supplied — never faked |

The `Evaluation.method` field is either `"rule_based"` or `"llm_judge"`, so the UI can label results honestly. An LLM-judge evaluator could be added behind the same interface without changing the API contract — it does not exist in this build.

### How hallucination can occur

Because Demo Mode's responses are built from the user's own input text (via keyword extraction) rather than model reasoning, they cannot answer questions that require knowledge outside that input — this is a useful, concrete illustration of why grounding and evaluation matter even for real model calls, where a fluent-sounding response can still be factually ungrounded.

## Technology stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts (where charts are used), React Router.

**Backend:** Python, FastAPI, SQLAlchemy, Pydantic, httpx.

**Data:** SQLite (local development).

## Project structure

```
promptlab/
├── frontend/
│   ├── src/
│   │   ├── components/   # layout, ui primitives, prompt/eval/comparison widgets
│   │   ├── pages/        # Playground, Library, Experiments, Evaluations, ...
│   │   ├── services/     # api.ts — thin fetch wrapper
│   │   ├── types/        # shared TS types mirroring backend schemas
│   │   └── utils/        # token estimation, variable extraction
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/          # prompts, experiments, evaluate, generate, templates
│   │   ├── core/         # config, database, seed data
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # LLM provider abstraction + demo provider
│   │   └── evaluators/   # rule-based evaluator
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

## Installation

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API is now at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app is now at `http://localhost:5173`, proxying `/api` to the backend.

### Docker (optional)

```bash
docker compose up
```

## Environment variables

See `backend/.env.example`:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLAlchemy connection string (defaults to local SQLite file) |
| `LLM_PROVIDER` | Provider identifier, for future multi-provider support |
| `LLM_API_KEY` | Server-side only. **Leave empty to run in Demo Mode.** |
| `LLM_BASE_URL` | Base URL for an OpenAI-compatible `/chat/completions` endpoint |
| `LLM_DEFAULT_MODEL` | Default model string sent to the provider |
| `CORS_ORIGINS` | Allowed origins for the frontend dev server |

## Demo Mode

If `LLM_API_KEY` is unset, `Settings.demo_mode` is `True` and every request routes to `DemoLLMProvider`, which generates deterministic, keyword-derived mock text (or JSON/Markdown, depending on the requested output format). The UI shows a persistent banner and labels every mock response with a "Demo response" badge — it is never presented as a real model output. This lets anyone run the full project without provisioning credentials.


## Future improvements

- A real LLM-judge evaluator (`method: "llm_judge"`), gated behind an explicit opt-in, to complement the rule-based scores.
- Multi-provider support (Anthropic, Gemini) behind the existing `LLMProvider` interface.
- User accounts (the `User` model referenced in the original design is not yet implemented — all data is currently single-tenant).
- Prompt diffing between versions in the Library.
- Export of an experiment's results as a shareable report.

## What's not implemented

In the interest of not claiming features that don't exist: there is no authentication/user model yet, no charting library visualizations in the Evaluations page (results are shown as tables, since a table was the clearer representation for this data), and the "restore an earlier version" action described in prompt versioning is exposed via the API (`PUT /api/prompts/{id}` with a new `version` payload copied from an old one) rather than as a dedicated one-click UI button.
