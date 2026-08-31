/**
 * @file main.tsx (or index.tsx)
 * @description The absolute entry point of the application. It initializes the
 * React root virtual DOM element and injects the global state context trees.
 *
 * @architecture
 * - Hooks directly into the physical 'root' node inside your index.html template file.
 * - Wraps the application in `<StrictMode>` to surface runtime layout warnings during development.
 * - Mounts global providers (`WorkspaceProvider`, `SettingsProvider`) outside the main interface flow.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./contexts/settingsContext.tsx";
import { WorkspaceProvider } from "./contexts/workspaceContext.tsx";

// Mount the compiled React virtual DOM tree cleanly into your main HTML node container
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Global context manager handling spatial node collections and camera focus anchors */}
    <WorkspaceProvider>
      {/* Global preference store managing theme modes, save timers, and keyboard macros */}
      <SettingsProvider>
        {/* Core application layout shell router orchestrator */}
        <App />
      </SettingsProvider>
    </WorkspaceProvider>
  </StrictMode>,
);
