import { NavLink } from "react-router-dom";
import {
  FlaskConical,
  Library,
  LineChart,
  SlidersHorizontal,
  BookOpen,
  FileText,
  Settings,
} from "lucide-react";

const workspaceLinks = [
  { to: "/playground", label: "Playground", icon: SlidersHorizontal },
  { to: "/experiments", label: "Experiments", icon: FlaskConical },
  { to: "/library", label: "Prompt Library", icon: Library },
  { to: "/evaluations", label: "Evaluations", icon: LineChart },
];

const resourceLinks = [
  { to: "/techniques", label: "Prompt Techniques", icon: BookOpen },
  { to: "/documentation", label: "Documentation", icon: FileText },
];

function NavSection({ title, links }: { title: string; links: typeof workspaceLinks }) {
  return (
    <div>
      <p className="px-2.5 text-xs font-medium text-ink-faint">{title}</p>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                isActive
                  ? "bg-accent-subtle text-accent-text font-medium"
                  : "text-ink-muted hover:bg-zinc-100 hover:text-ink"
              }`
            }
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-[228px] shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-12 items-center gap-2 border-b border-border px-3.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-ink text-[10px] font-semibold text-white">
          P
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink">PromptLab</span>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-4">
        <NavSection title="Workspace" links={workspaceLinks} />
        <NavSection title="Resources" links={resourceLinks} />
      </nav>

      <div className="border-t border-border p-2.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors duration-150 ${
              isActive ? "bg-accent-subtle text-accent-text font-medium" : "text-ink-muted hover:bg-zinc-100 hover:text-ink"
            }`
          }
        >
          <Settings className="h-3.5 w-3.5" strokeWidth={1.9} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
