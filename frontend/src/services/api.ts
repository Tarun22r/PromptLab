import type {
  Evaluation,
  Experiment,
  ExperimentSummary,
  GenerateResult,
  Prompt,
  PromptTemplate,
} from "../types";

const BASE = "/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      // ignore parse failure, fall back to statusText
    }
    throw new ApiError(detail, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  health: () => request<{ status: string; demo_mode: boolean }>("/health"),

  // Prompts
  listPrompts: (params?: { search?: string; technique?: string; task_type?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Prompt[]>(`/prompts${qs ? `?${qs}` : ""}`);
  },
  getPrompt: (id: string) => request<Prompt>(`/prompts/${id}`),
  createPrompt: (body: unknown) =>
    request<Prompt>("/prompts", { method: "POST", body: JSON.stringify(body) }),
  updatePrompt: (id: string, body: unknown) =>
    request<Prompt>(`/prompts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePrompt: (id: string) => request<void>(`/prompts/${id}`, { method: "DELETE" }),
  duplicatePrompt: (id: string) =>
    request<Prompt>(`/prompts/${id}/duplicate`, { method: "POST" }),

  // Templates
  listTemplates: () => request<PromptTemplate[]>("/templates"),

  // Generate (ad-hoc, Playground single-run)
  generate: (body: unknown) =>
    request<GenerateResult>("/generate", { method: "POST", body: JSON.stringify(body) }),

  // Evaluate (ad-hoc or by run_id)
  evaluate: (body: unknown) =>
    request<Evaluation>("/evaluate", { method: "POST", body: JSON.stringify(body) }),

  // Experiments
  listExperiments: () => request<ExperimentSummary[]>("/experiments"),
  getExperiment: (id: string) => request<Experiment>(`/experiments/${id}`),
  createExperiment: (body: unknown) =>
    request<Experiment>("/experiments", { method: "POST", body: JSON.stringify(body) }),
  deleteExperiment: (id: string) => request<void>(`/experiments/${id}`, { method: "DELETE" }),
};

export { ApiError };
