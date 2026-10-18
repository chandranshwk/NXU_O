/**
 * @file main.tsx (or index.tsx)
 * @description The absolute entry point of the application. It initializes the
 * React root virtual DOM element and injects the global state context trees.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./contexts/settingsContext.tsx";
import { WorkspaceProvider } from "./contexts/workspaceContext.tsx";
import { initializeCustomLanguages } from "./Extensions/ThemeLoader.ts";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

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
        <ErrorBoundary>
          {/* Global context manager handling spatial node collections and camera focus anchors */}
          <WorkspaceProvider>
            {/* Global preference store managing theme modes, save timers, and keyboard macros */}
            <SettingsProvider>
              {/* Core application layout shell router orchestrator */}
              <App />
            </SettingsProvider>
          </WorkspaceProvider>
        </ErrorBoundary>
      </StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error("Critical boot failure: Filesystem scanner crashed", error);

    //  FALLBACK: If Tauri fails to load the filesystem, render the error boundary anyway
    // so the user doesn't just stare at a blank white screen.
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-white font-mono p-8">
            <div className="max-w-md text-center">
              <h1 className="text-xl font-bold text-red-500 mb-2">
                Boot Sequence Failed
              </h1>
              <p className="text-zinc-400 text-sm mb-4">
                Could not initialize the local filesystem.
              </p>
              <pre className="text-xs bg-zinc-900 p-4 rounded-lg overflow-auto text-left border border-zinc-800">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </div>
          </div>
        </ErrorBoundary>
      </StrictMode>,
    );
  });
