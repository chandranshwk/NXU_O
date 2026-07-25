import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./contexts/settingsContext.tsx";
import { WorkspaceProvider } from "./contexts/workspaceContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorkspaceProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </WorkspaceProvider>
  </StrictMode>,
);
