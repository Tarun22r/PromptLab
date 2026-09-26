import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import Playground from "./pages/Playground";
import Library from "./pages/Library";
import Experiments from "./pages/Experiments";
import Evaluations from "./pages/Evaluations";
import Techniques from "./pages/Techniques";
import Documentation from "./pages/Documentation";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/playground" replace />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/library" element={<Library />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/techniques" element={<Techniques />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/playground" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
