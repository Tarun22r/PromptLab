import { TECHNIQUES } from "../types";

export default function Techniques() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Prompt Techniques</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Reference for the prompting techniques available in the Playground.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border rounded-md border border-border bg-surface">
        {TECHNIQUES.map((t) => (
          <div key={t.id} className="px-4 py-3.5">
            <p className="text-sm font-medium text-ink">{t.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
