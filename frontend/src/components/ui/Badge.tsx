type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-zinc-100 text-ink-muted",
  accent: "bg-accent-subtle text-accent-text",
  success: "bg-status-successSubtle text-status-success",
  warning: "bg-status-warningSubtle text-status-warning",
  danger: "bg-status-dangerSubtle text-status-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
