import { Badge } from "../ui/Badge";
import type { ExperimentRun } from "../../types";

const METRIC_ROWS = [
  { key: "relevance", label: "Relevance" },
  { key: "completeness", label: "Completeness" },
  { key: "consistency", label: "Consistency" },
  { key: "format_adherence", label: "Structure" },
];

export function ComparisonTable({ runs }: { runs: ExperimentRun[] }) {
  if (runs.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-zinc-50">
            <th className="px-4 py-2 text-left text-xs font-medium text-ink-muted">Metric</th>
            {runs.map((run) => (
              <th key={run.id} className="px-4 py-2 text-left text-xs font-medium text-ink-muted">
                {run.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRIC_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-border last:border-b-0">
              <td className="px-4 py-2 text-ink-muted">{row.label}</td>
              {runs.map((run) => {
                const metric = run.evaluation?.metrics?.[row.key];
                return (
                  <td key={run.id} className="px-4 py-2 font-medium text-ink">
                    {metric?.score ?? <span className="text-ink-faint">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid gap-3 border-t border-border p-4" style={{ gridTemplateColumns: `repeat(${runs.length}, minmax(0, 1fr))` }}>
        {runs.map((run) => (
          <div key={run.id} className="min-w-0">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-xs font-medium text-ink">{run.label}</span>
              {run.is_demo_response && <Badge tone="accent">Demo</Badge>}
            </div>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded border border-border bg-zinc-50 p-2.5 font-mono text-xs leading-relaxed text-ink">
              {run.response_text}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
