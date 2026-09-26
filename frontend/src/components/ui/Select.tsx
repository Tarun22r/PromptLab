import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  label?: string;
}

export function Select({ options, label, className = "", id, ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`h-8 w-full appearance-none rounded border border-border bg-surface pl-2.5 pr-7 text-sm text-ink transition-colors duration-150 hover:border-border-strong focus:border-accent ${className}`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
      </div>
    </div>
  );
}
