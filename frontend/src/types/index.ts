export type OutputFormat = "text" | "json" | "markdown";

export type Technique =
  | "zero-shot"
  | "one-shot"
  | "few-shot"
  | "role-prompting"
  | "structured-output"
  | "classification"
  | "extraction"
  | "summarization";

export const TECHNIQUES: { id: Technique; label: string; description: string }[] = [
  {
    id: "zero-shot",
    label: "Zero-shot",
    description: "Ask the model to perform the task directly, with no examples of correct output.",
  },
  {
    id: "one-shot",
    label: "One-shot",
    description: "Provide a single worked example before the task to anchor the expected output shape.",
  },
  {
    id: "few-shot",
    label: "Few-shot",
    description: "Provide several representative examples before the task to guide output behavior.",
  },
  {
    id: "role-prompting",
    label: "Role prompting",
    description: "Assign the model a persona or role to shape tone, priorities, and domain framing.",
  },
  {
    id: "structured-output",
    label: "Structured output",
    description: "Constrain the response to a defined schema, typically JSON, for downstream parsing.",
  },
  {
    id: "classification",
    label: "Classification",
    description: "Ask the model to assign input to one of a fixed, enumerated set of labels.",
  },
  {
    id: "extraction",
    label: "Extraction",
    description: "Pull specific fields or entities out of unstructured text into a defined shape.",
  },
  {
    id: "summarization",
    label: "Summarization",
    description: "Condense longer input into a shorter representation while preserving key information.",
  },
];

export interface PromptVersion {
  id: string;
  version_number: number;
  system_instructions: string;
  user_input_template: string;
  output_format: OutputFormat;
  json_schema: Record<string, unknown> | null;
  model: string;
  temperature: number;
  created_at: string;
}

export interface Prompt {
  id: string;
  name: string;
  description: string;
  task_type: string;
  technique: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  versions: PromptVersion[];
}

export interface MetricResult {
  score: number | null;
  explanation: string;
}

export interface Evaluation {
  id: string;
  method: "rule_based" | "llm_judge" | "unavailable";
  metrics: Record<string, MetricResult>;
  overall_score: number | null;
  created_at: string;
}

export interface ExperimentRun {
  id: string;
  label: string;
  model: string;
  technique: string;
  temperature: number;
  system_instructions: string;
  user_input: string;
  output_format: OutputFormat;
  response_text: string;
  is_demo_response: boolean;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  structured_valid: boolean | null;
  structured_error: string | null;
  created_at: string;
  evaluation: Evaluation | null;
}

export interface Experiment {
  id: string;
  name: string;
  task_type: string;
  input_data: string;
  status: string;
  created_at: string;
  runs: ExperimentRun[];
}

export interface ExperimentSummary {
  id: string;
  name: string;
  task_type: string;
  status: string;
  created_at: string;
  run_count: number;
  models: string[];
  techniques: string[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  task_type: string;
  technique: string;
  system_instructions: string;
  user_input_template: string;
  output_format: OutputFormat;
  json_schema: Record<string, unknown> | null;
  tags: string[];
}

export interface GenerateResult {
  response_text: string;
  is_demo_response: boolean;
  model: string;
  latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  structured_valid: boolean | null;
  structured_error: string | null;
}

export const MODELS = [
  { id: "mock-standard", label: "Mock — Standard" },
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
  { id: "claude-sonnet", label: "Claude Sonnet" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];
