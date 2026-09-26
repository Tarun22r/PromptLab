import { useState } from "react";
import { Check, Copy, RotateCw, Save, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import type { GenerateResult } from "../../types";

interface Props {
  result: GenerateResult | null;
  loading: boolean;
  onRegenerate: () => void;
  onSave?: () => void;
}

export function ResponsePanel({ result, loading, onRegenerate, onSave }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.response_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-muted">Model response</span>
          {result?.is_demo_response && <Badge tone="accent">Demo response</Badge>}
        </div>
        {result && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={copy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onRegenerate} loading={loading}>
              <RotateCw className="h-3.5 w-3.5" /> Regenerate
            </Button>
            {onSave && (
              <Button variant="ghost" size="sm" onClick={onSave}>
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="min-h-[140px] px-4 py-3">
        {loading && (
          <div className="flex flex-col gap-2">
            <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-zinc-100" />
          </div>
        )}
        {!loading && !result && (
          <p className="text-sm text-ink-faint">Run an experiment to see the model's response here.</p>
        )}
        {!loading && result && (
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-ink">
            {result.response_text}
          </pre>
        )}
      </div>

      {result?.structured_valid === false && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded border border-status-danger/20 bg-status-dangerSubtle px-3 py-2 text-xs text-status-danger">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-medium">Invalid structured output</p>
            <p className="mt-0.5 text-status-danger/90">{result.structured_error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-2 text-xs text-ink-muted">
          <span>Model: {result.model}</span>
          <span>Latency: {result.latency_ms}ms</span>
          <span>
            Tokens: {result.prompt_tokens} in / {result.completion_tokens} out
          </span>
          {result.structured_valid === true && <Badge tone="success">Valid JSON</Badge>}
        </div>
      )}
    </div>
  );
}
