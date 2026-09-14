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
import { initializeCustomLanguages } from "./Extensions/ThemeLoader.ts";

const container = document.getElementById("root")!;
const root = createRoot(container);

// ==========================================
// TAURI DESKTOP BOOTSTRAP INIT SEQUENCE
// ==========================================
/**
 * Forces the file system directory scanner to map custom files before
 * rendering any frontend layout components, ensuring RAM dictionaries are active.
 */
initializeCustomLanguages()
  .then(() => {
    root.render(
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
  })
  .catch((error: string) => {
    console.error("Critical boot failure: Filesystem scanner crashed", error);
  });
