import { useEffect, useState } from "react";
import { Search, Library as LibraryIcon, Copy, Trash2, Plus } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { InlineError } from "../components/ui/Panel";
import { api } from "../services/api";
import type { Prompt } from "../types";

export default function Library() {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Prompt | null>(null);

  const load = async (query?: string) => {
    try {
      const data = await api.listPrompts(query ? { search: query } : undefined);
      setPrompts(data);
    } catch {
      setError("Couldn't load the prompt library. Check that the backend is running.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined), 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const duplicate = async (id: string) => {
    await api.duplicatePrompt(id);
    load(search || undefined);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this prompt and all its versions? This can't be undone.")) return;
    await api.deletePrompt(id);
    setSelected(null);
    load(search || undefined);
  };

  return (
    <div className="mx-auto max-w-5xl px-8 py-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Prompt Library</h1>
          <p className="mt-0.5 text-sm text-ink-muted">Saved prompts, versioned and searchable.</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="h-8 w-full rounded border border-border bg-surface pl-8 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {error && <InlineError message={error} />}

      {prompts && prompts.length === 0 && (
        <EmptyState
          icon={LibraryIcon}
          title="No saved prompts yet"
          description="Save a prompt from the Playground after running an experiment to build your library."
        />
      )}

      {prompts && prompts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex flex-col gap-2">
            {prompts.map((p) => {
              const latest = p.versions[p.versions.length - 1];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`rounded-md border bg-surface px-4 py-3 text-left transition-colors duration-150 ${
                    selected?.id === p.id ? "border-accent" : "border-border hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <div className="flex items-center gap-1.5">
                      <Badge tone="neutral">{p.technique}</Badge>
                      <span className="text-xs text-ink-faint">v{latest?.version_number ?? 1}</span>
                    </div>
                  </div>
                  {p.description && <p className="mt-1 text-xs text-ink-muted">{p.description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.tags.map((t) => (
                      <Badge key={t} tone="accent">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            {selected ? (
              <div className="rounded-md border border-border bg-surface p-4">
                <p className="text-sm font-medium text-ink">{selected.name}</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Task type: {selected.task_type} · Created{" "}
                  {new Date(selected.created_at).toLocaleDateString()}
                </p>
                <p className="mt-3 text-xs font-medium text-ink-muted">Latest version</p>
                <pre className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded border border-border bg-zinc-50 p-2 font-mono text-xs text-ink">
                  {selected.versions[selected.versions.length - 1]?.system_instructions || "—"}
                </pre>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => duplicate(selected.id)}>
                    <Copy className="h-3.5 w-3.5" /> Duplicate
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(selected.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
                <p className="mt-3 text-xs text-ink-faint">
                  {selected.versions.length} version{selected.versions.length !== 1 ? "s" : ""} saved
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-xs text-ink-faint">
                Select a prompt to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
