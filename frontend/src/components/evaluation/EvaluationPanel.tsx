import { HelpCircle } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { Evaluation } from "../../types";

const METRIC_LABELS: Record<string, string> = {
  relevance: "Relevance",
  completeness: "Completeness",
  consistency: "Consistency",
  format_adherence: "Format adherence",
  groundedness: "Groundedness",
};

function scoreTone(score: number | null) {
  if (score === null) return "neutral" as const;
  if (score >= 80) return "success" as const;
  if (score >= 55) return "warning" as const;
  return "danger" as const;
}

export function EvaluationPanel({ evaluation }: { evaluation: Evaluation | null }) {
  if (!evaluation) {
    return (
      <div className="rounded-md border border-border bg-surface px-4 py-6 text-center">
        <p className="text-sm text-ink-faint">Evaluation unavailable</p>
        <p className="mt-1 text-xs text-ink-faint">Run an experiment to generate evaluation metrics.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-xs font-medium text-ink-muted">Evaluation results</span>
        <Badge tone={evaluation.method === "llm_judge" ? "accent" : "neutral"}>
          {evaluation.method === "llm_judge" ? "LLM Evaluation" : "Rule-based"}
        </Badge>
      </div>
      <div className="divide-y divide-border">
        {Object.entries(evaluation.metrics).map(([key, metric]) => (
          <div key={key} className="flex items-start justify-between gap-4 px-4 py-2.5">
            <div className="min-w-0">
              <p className="text-sm text-ink">{METRIC_LABELS[key] ?? key}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{metric.explanation}</p>
            </div>
            <div className="shrink-0 pt-0.5">
              {metric.score === null ? (
                <span className="flex items-center gap-1 text-xs text-ink-faint">
                  <HelpCircle className="h-3 w-3" /> N/A
                </span>
              ) : (
                <Badge tone={scoreTone(metric.score)}>{metric.score}/100</Badge>
              )}
            </div>
          </div>
        ))}
      </div>
      {evaluation.overall_score !== null && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <span className="text-xs font-medium text-ink-muted">Overall</span>
          <span className="text-sm font-medium text-ink">{evaluation.overall_score}/100</span>
        </div>
      )}
    </div>
  );
}
