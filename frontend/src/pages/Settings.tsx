import { useEffect, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { api } from "../services/api";

export default function Settings() {
  const [demoMode, setDemoMode] = useState<boolean | null>(null);

  useEffect(() => {
    api.health().then((r) => setDemoMode(r.demo_mode)).catch(() => setDemoMode(null));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-8 py-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-ink">Settings</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          API and evaluation configuration. API keys are never exposed to the browser.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-surface px-4 py-3.5">
          <p className="text-sm font-medium text-ink">API configuration</p>
          <p className="mt-1 text-sm text-ink-muted">
            {demoMode === null && "Checking connection to backend…"}
            {demoMode === true && (
              <>
                No API key configured on the backend.{" "}
                <Badge tone="accent">Demo Mode active</Badge> — responses are deterministic mock
                output.
              </>
            )}
            {demoMode === false && (
              <>
                <Badge tone="success">Connected</Badge> — an LLM API key is configured on the
                backend.
              </>
            )}
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            To configure a provider, set <code className="font-mono">LLM_API_KEY</code> and{" "}
            <code className="font-mono">LLM_BASE_URL</code> in{" "}
            <code className="font-mono">backend/.env</code>. Keys are read server-side only.
          </p>
        </div>

        <div className="rounded-md border border-border bg-surface px-4 py-3.5">
          <p className="text-sm font-medium text-ink">Model configuration</p>
          <p className="mt-1 text-sm text-ink-muted">
            Default model and available options are defined in{" "}
            <code className="font-mono">frontend/src/types/index.ts</code> and can be extended
            without backend changes, since the provider abstraction accepts any model string.
          </p>
        </div>

        <div className="rounded-md border border-border bg-surface px-4 py-3.5">
          <p className="text-sm font-medium text-ink">Evaluation settings</p>
          <p className="mt-1 text-sm text-ink-muted">
            Evaluation currently uses PromptLab's built-in rule-based evaluator. An LLM-judge
            evaluator can be added behind the same interface in{" "}
            <code className="font-mono">app/evaluators/</code> without changing the API contract.
          </p>
        </div>

        <div className="rounded-md border border-border bg-surface px-4 py-3.5">
          <p className="text-sm font-medium text-ink">Theme</p>
          <p className="mt-1 text-sm text-ink-muted">
            Light mode only, by design — this is a technical workspace, not a chat product.
          </p>
        </div>
      </div>
    </div>
  );
}
