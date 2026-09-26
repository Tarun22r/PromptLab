import { useMemo, useState } from "react";
import { Braces, Eraser, WrapText } from "lucide-react";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { estimateTokens, extractVariables } from "../../utils/tokenEstimate";
import type { OutputFormat } from "../../types";

interface Props {
  taskType: string;
  onTaskTypeChange: (v: string) => void;
  systemInstructions: string;
  onSystemInstructionsChange: (v: string) => void;
  userInput: string;
  onUserInputChange: (v: string) => void;
  outputFormat: OutputFormat;
  onOutputFormatChange: (v: OutputFormat) => void;
}

const TASK_TYPES = [
  { value: "general", label: "General" },
  { value: "classification", label: "Classification" },
  { value: "extraction", label: "Extraction" },
  { value: "summarization", label: "Summarization" },
  { value: "sentiment-analysis", label: "Sentiment analysis" },
  { value: "code-generation", label: "Code generation" },
];

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
];

function VariableChips({ variables }: { variables: string[] }) {
  if (variables.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 px-4 pb-2.5">
      {variables.map((v) => (
        <code
          key={v}
          className="rounded-sm bg-accent-subtle px-1.5 py-0.5 font-mono text-xs text-accent-text"
        >
          {"{{"}
          {v}
          {"}}"}
        </code>
      ))}
    </div>
  );
}

export function PromptEditor({
  taskType,
  onTaskTypeChange,
  systemInstructions,
  onSystemInstructionsChange,
  userInput,
  onUserInputChange,
  outputFormat,
  onOutputFormatChange,
}: Props) {
  const [activeField, setActiveField] = useState<"system" | "user">("user");

  const systemVars = useMemo(() => extractVariables(systemInstructions), [systemInstructions]);
  const userVars = useMemo(() => extractVariables(userInput), [userInput]);
  const totalChars = systemInstructions.length + userInput.length;
  const totalTokens = estimateTokens(systemInstructions + userInput);

  const insertVariable = () => {
    const name = window.prompt("Variable name (without braces):", "variable_name");
    if (!name) return;
    const token = `{{${name.trim()}}}`;
    if (activeField === "system") {
      onSystemInstructionsChange(systemInstructions + token);
    } else {
      onUserInputChange(userInput + token);
    }
  };

  const clearAll = () => {
    onSystemInstructionsChange("");
    onUserInputChange("");
  };

  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-ink-muted">Task</span>
          <Select
            options={TASK_TYPES}
            value={taskType}
            onChange={(e) => onTaskTypeChange(e.target.value)}
            className="w-44"
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-ink-faint">
          <span>{totalChars.toLocaleString()} chars</span>
          <span>~{totalTokens.toLocaleString()} tokens</span>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="px-4 pt-3 text-xs font-medium text-ink-muted">System instructions</div>
        <textarea
          value={systemInstructions}
          onFocus={() => setActiveField("system")}
          onChange={(e) => onSystemInstructionsChange(e.target.value)}
          placeholder="You are a...&#10;&#10;Define the model's role, constraints, and output expectations."
          rows={4}
          className="w-full resize-none border-0 bg-transparent px-4 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <VariableChips variables={systemVars} />
      </div>

      <div>
        <div className="px-4 pt-3 text-xs font-medium text-ink-muted">User input</div>
        <textarea
          value={userInput}
          onFocus={() => setActiveField("user")}
          onChange={(e) => onUserInputChange(e.target.value)}
          placeholder="The task input, e.g.&#10;Customer message: {{customer_message}}"
          rows={6}
          className="w-full resize-none border-0 bg-transparent px-4 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <VariableChips variables={userVars} />
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={insertVariable}>
            <Braces className="h-3.5 w-3.5" /> Insert variable
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <Eraser className="h-3.5 w-3.5" /> Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <WrapText className="h-3.5 w-3.5 text-ink-faint" />
          <Select
            options={FORMATS}
            value={outputFormat}
            onChange={(e) => onOutputFormatChange(e.target.value as OutputFormat)}
            className="w-32"
          />
        </div>
      </div>
    </div>
  );
}
