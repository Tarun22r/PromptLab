import { useEffect, useState } from "react";
import { FlaskConical, Trash2 } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { EvaluationPanel } from "../components/evaluation/EvaluationPanel";
import { ComparisonTable } from "../components/comparison/ComparisonTable";
import { api } from "../services/api";
import type { Experiment, ExperimentSummary } from "../types";
import { useNavigate } from "react-router-dom";

export default function Experiments() {
  const [experiments, setExperiments] = useState<ExperimentSummary[] | null>(null);
  const [detail, setDetail] = useState<Experiment | null>(null);
  const navigate = useNavigate();

  const load = () => api.listExperiments().then(setExperiments);

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (id: string) => {
    const exp = await api.getExperiment(id);
    setDetail(exp);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this experiment and all its runs?")) return;
    await api.deleteExperiment(id);
    setDetail(null);
    load();
  };

  if (detail) {
    return (
      <div className="mx-auto max-w-5xl px-8 py-6">
        <button
          onClick={() => setDetail(null)}
          className="mb-3 text-xs font-medium text-ink-muted hover:text-ink"
        >
          ← Back to experiments
        </button>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-ink">{detail.name}</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              {new Date(detail.created_at).toLocaleString()} · {detail.task_type}
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => remove(detail.id)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>

        {detail.runs.length > 1 ? (
          <ComparisonTable runs={detail.runs} />
        ) : (
          detail.runs[0] && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-md border border-border bg-surface p-4">
                <p className="mb-2 text-xs font-medium text-ink-muted">Response</p>
                <pre className="whitespace-pre-wrap font-mono text-sm text-ink">
                  {detail.runs[0].response_text}
                </pre>
              </div>
              <EvaluationPanel evaluation={detail.runs[0].evaluation} />
            </div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Experiments</h1>
          <p className="mt-0.5 text-sm text-ink-muted">History of prompt runs and comparisons.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate("/playground")}>
          New experiment
        </Button>
      </div>

      {experiments && experiments.length === 0 && (
        <EmptyState
          icon={FlaskConical}
          title="No experiments yet"
          description="Run your first prompt experiment to see results here."
          actionLabel="Create experiment"
          onAction={() => navigate("/playground")}
        />
      )}

      {experiments && experiments.length > 0 && (
        <div className="flex flex-col gap-2">
          {experiments.map((exp) => (
            <button
              key={exp.id}
              onClick={() => openDetail(exp.id)}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-left transition-colors duration-150 hover:border-border-strong"
            >
              <div>
                <p className="text-sm font-medium text-ink">{exp.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {new Date(exp.created_at).toLocaleString()} · {exp.run_count} run
                  {exp.run_count !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {exp.techniques.map((t) => (
                  <Badge key={t} tone="neutral">
                    {t}
                  </Badge>
                ))}
                <Badge tone={exp.status === "completed" ? "success" : "warning"}>{exp.status}</Badge>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
