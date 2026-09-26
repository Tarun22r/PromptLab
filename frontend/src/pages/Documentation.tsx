const SECTIONS = [
  {
    title: "How evaluation works",
    body: "Every response is scored by a rule-based evaluator: relevance (input/output term overlap), completeness (response length as a depth proxy), consistency (sentence-length variance), and format adherence (JSON validity and schema key coverage, or Markdown structure). Groundedness is reported as unavailable unless a reference document is supplied, rather than faked. No score in PromptLab is randomly generated.",
  },
  {
    title: "Why Demo Mode exists",
    body: "PromptLab works fully without an API key. When LLM_API_KEY is unset, the backend uses a deterministic mock provider instead of a real model call. This means anyone reviewing the project — without provisioning credentials — can exercise every feature: running experiments, comparing prompts, and reading evaluation output. Every mock response is labeled 'Demo response' in the UI so it's never mistaken for a real model output.",
  },
  {
    title: "How prompt versioning works",
    body: "A Prompt has many PromptVersions. Editing a saved prompt's content creates a new version rather than mutating history, so you can always compare v1 against v3 of the same prompt, or restore an earlier version's content into a new experiment.",
  },
  {
    title: "How the backend protects API keys",
    body: "The frontend never receives, stores, or sends an API key. All LLM calls happen inside the FastAPI backend, which reads the key from a server-side environment variable (see backend/.env.example). The React app only talks to PromptLab's own API.",
  },
  {
    title: "Why structured output matters",
    body: "Many real applications parse LLM output programmatically. PromptLab validates JSON-format responses against the target schema and reports missing keys or parse errors explicitly, rather than silently repairing malformed JSON — because in production, silent repair hides the actual failure mode of the prompt.",
  },
  {
    title: "Architecture",
    body: "Frontend: React + TypeScript + Vite + Tailwind. Backend: FastAPI + SQLAlchemy + SQLite. The LLM provider is abstracted behind a single interface (app/services/llm_provider.py) so adding a second real provider later doesn't touch any route handlers.",
  },
];

export default function Documentation() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Documentation</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          How PromptLab is built, and the reasoning behind its core design decisions.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-md border border-border bg-surface px-4 py-3.5">
            <p className="text-sm font-medium text-ink">{s.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
