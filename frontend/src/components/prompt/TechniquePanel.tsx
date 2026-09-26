import { TECHNIQUES, type Technique } from "../../types";

export function TechniquePanel({ technique }: { technique: Technique }) {
  const info = TECHNIQUES.find((t) => t.id === technique);
  if (!info) return null;
  return (
    <div className="rounded-md border border-border bg-zinc-50 px-3.5 py-2.5">
      <p className="text-xs font-medium text-ink">{info.label} prompting</p>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{info.description}</p>
    </div>
  );
}
