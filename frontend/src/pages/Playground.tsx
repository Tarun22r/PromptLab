import { useState } from "react";
import { Plus, X, Play } from "lucide-react";
import { Select } from "../components/ui/Select";
import { Button } from "../components/ui/Button";
import { InlineError } from "../components/ui/Panel";
import { PromptEditor } from "../components/prompt/PromptEditor";
import { TechniquePanel } from "../components/prompt/TechniquePanel";
import { ResponsePanel } from "../components/prompt/ResponsePanel";
import { EvaluationPanel } from "../components/evaluation/EvaluationPanel";
import { ComparisonTable } from "../components/comparison/ComparisonTable";
import { api, ApiError } from "../services/api";
import { MODELS, TECHNIQUES, type ExperimentRun, type OutputFormat, type Technique } from "../types";

interface Variant {
  label: string;
  taskType: string;
  systemInstructions: string;
  userInput: string;
  outputFormat: OutputFormat;
  model: string;
  technique: Technique;
  temperature: number;
}

function makeVariant(label: string): Variant {
  return {
    label,
    taskType: "general",
    systemInstructions: "",
    userInput: "",
    outputFormat: "text",
    model: "mock-standard",
    technique: "zero-shot",
    temperature: 0.2,
  };
}

const TEMPERATURE_OPTIONS = [0, 0.2, 0.4, 0.7, 1.0].map((v) => ({ value: String(v), label: v.toFixed(1) }));

export default function Playground() {
  const [compareMode, setCompareMode] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([makeVariant("Prompt A")]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single-run result state.
  const [singleResult, setSingleResult] = useState<Awaited<ReturnType<typeof api.generate>> | null>(null);
  const [singleEvaluation, setSingleEvaluation] = useState<Awaited<ReturnType<typeof api.evaluate>> | null>(null);

  // Comparison result state (populated via /api/experiments).
  const [comparisonRuns, setComparisonRuns] = useState<ExperimentRun[]>([]);

  const active = variants[activeIndex];

  const updateActive = (patch: Partial<Variant>) => {
    setVariants((prev) => prev.map((v, i) => (i === activeIndex ? { ...v, ...patch } : v)));
  };

  const addVariant = () => {
    if (variants.length >= 3) return;
    const label = `Prompt ${String.fromCharCode(65 + variants.length)}`;
    setVariants((prev) => [...prev, makeVariant(label)]);
    setActiveIndex(variants.length);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex((i) => Math.max(0, i - (index <= i ? 1 : 0)));
  };

  const runSingle = async () => {
    setRunning(true);
    setError(null);
    setSingleResult(null);
    setSingleEvaluation(null);
    try {
      const result = await api.generate({
        system_instructions: active.systemInstructions,
        user_input: active.userInput,
        technique: active.technique,
        model: active.model,
        temperature: active.temperature,
        output_format: active.outputFormat,
      });
      setSingleResult(result);
      const evaluation = await api.evaluate({
        user_input: active.userInput,
        response_text: result.response_text,
        output_format: active.outputFormat,
      });
      setSingleEvaluation(evaluation);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to run experiment. Check that the backend is running.");
    } finally {
      setRunning(false);
    }
  };

  const runComparison = async () => {
    setRunning(true);
    setError(null);
    setComparisonRuns([]);
    try {
      const experiment = await api.createExperiment({
        name: `Playground comparison — ${new Date().toLocaleString()}`,
        task_type: active.taskType,
        input_data: active.userInput,
        runs: variants.map((v) => ({
          label: v.label,
          model: v.model,
          technique: v.technique,
          temperature: v.temperature,
          system_instructions: v.systemInstructions,
          user_input: v.userInput,
          output_format: v.outputFormat,
          run_now: true,
        })),
      });
      setComparisonRuns(experiment.runs);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to run comparison. Check that the backend is running.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-8 py-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Prompt Playground</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Design, test and evaluate prompts across different tasks and models.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-surface p-0.5">
          <button
            onClick={() => setCompareMode(false)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              !compareMode ? "bg-accent-subtle text-accent-text" : "text-ink-muted hover:text-ink"
            }`}
          >
            Single run
          </button>
          <button
            onClick={() => setCompareMode(true)}
            className={`rounded px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              compareMode ? "bg-accent-subtle text-accent-text" : "text-ink-muted hover:text-ink"
            }`}
          >
            Compare
          </button>
        </div>
      </div>

      {compareMode && (
        <div className="mb-3 flex items-center gap-1.5">
          {variants.map((v, i) => (
            <div
              key={v.label}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                i === activeIndex ? "border-accent bg-accent-subtle text-accent-text" : "border-border text-ink-muted hover:text-ink"
              }`}
            >
              <button onClick={() => setActiveIndex(i)}>{v.label}</button>
              {variants.length > 1 && (
                <button onClick={() => removeVariant(i)} aria-label={`Remove ${v.label}`}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {variants.length < 3 && (
            <button
              onClick={addVariant}
              className="flex items-center gap-1 rounded-md border border-dashed border-border px-2.5 py-1 text-xs text-ink-muted hover:border-border-strong hover:text-ink"
            >
              <Plus className="h-3 w-3" /> Add prompt
            </button>
          )}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-border bg-surface px-4 py-3">
        <Select
          label="Model"
          options={MODELS.map((m) => ({ value: m.id, label: m.label }))}
          value={active.model}
          onChange={(e) => updateActive({ model: e.target.value })}
          className="w-44"
        />
        <Select
          label="Technique"
          options={TECHNIQUES.map((t) => ({ value: t.id, label: t.label }))}
          value={active.technique}
          onChange={(e) => updateActive({ technique: e.target.value as Technique })}
          className="w-40"
        />
        <Select
          label="Temperature"
          options={TEMPERATURE_OPTIONS}
          value={String(active.temperature)}
          onChange={(e) => updateActive({ temperature: Number(e.target.value) })}
          className="w-24"
        />
        <div className="ml-auto">
          <Button
            variant="primary"
            onClick={compareMode ? runComparison : runSingle}
            loading={running}
          >
            <Play className="h-3.5 w-3.5" />
            {compareMode ? "Run Comparison" : "Run Experiment"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <InlineError message={error} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          <PromptEditor
            taskType={active.taskType}
            onTaskTypeChange={(v) => updateActive({ taskType: v })}
            systemInstructions={active.systemInstructions}
            onSystemInstructionsChange={(v) => updateActive({ systemInstructions: v })}
            userInput={active.userInput}
            onUserInputChange={(v) => updateActive({ userInput: v })}
            outputFormat={active.outputFormat}
            onOutputFormatChange={(v) => updateActive({ outputFormat: v })}
          />
          <TechniquePanel technique={active.technique} />
        </div>

        <div className="flex flex-col gap-3">
          {!compareMode && (
            <>
              <ResponsePanel result={singleResult} loading={running} onRegenerate={runSingle} />
              <EvaluationPanel evaluation={singleEvaluation} />
            </>
          )}
          {compareMode && (
            <div className="flex h-full flex-col items-center justify-center rounded-md border border-dashed border-border px-4 py-10 text-center">
              <p className="text-sm text-ink-muted">
                Comparison results appear below once you run the experiment, across all prompt variants.
              </p>
            </div>
          )}
        </div>
      </div>

      {compareMode && comparisonRuns.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-ink">Evaluation results</p>
          <ComparisonTable runs={comparisonRuns} />
        </div>
      )}
    </div>
  );
}
