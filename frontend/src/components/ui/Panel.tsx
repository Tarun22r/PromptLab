export function Panel({
  children,
  className = "",
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-border bg-surface ${noPadding ? "" : "p-4"} ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-border px-4 py-3">
      <div>
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded border border-status-danger/20 bg-status-dangerSubtle px-3 py-2 text-sm text-status-danger">
      {message}
    </div>
  );
}
