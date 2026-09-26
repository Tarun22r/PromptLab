import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircleDot } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { api } from "../../services/api";

export function AppShell() {
  const [demoMode, setDemoMode] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .health()
      .then((res) => setDemoMode(res.demo_mode))
      .catch(() => setDemoMode(null));
  }, []);

  return (
    <div className="flex h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {demoMode && (
          <div className="flex h-7 items-center justify-center gap-1.5 border-b border-accent-subtle bg-accent-subtle text-xs text-accent-text">
            <CircleDot className="h-3 w-3" strokeWidth={2} />
            Demo Mode — no API key configured. Responses are deterministic mock output.
          </div>
        )}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
