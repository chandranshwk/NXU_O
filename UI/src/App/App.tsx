/**
 * @file App.tsx
 * @component App
 * @description The main file that sets up the layout, routes, and global settings for the app.
 *
 * @architecture
 * - Uses settings from `src/contexts/settingsContext.tsx`.
 * - Sidebar stays fixed while pages change inside the Outlet.
 * - CommandBar opens on top as an overlay.
 * - The dark-mode circular reveal is handled entirely by `setDarkMode` inside
 *   `settingsContext.tsx`; this file only mirrors `settings.darkMode` onto
 *   the <html> `dark` class so Tailwind's `dark:` variants apply.
 *
 * @platform
 * Uses Hash Router so navigation works correctly inside Tauri without breaking local file paths.
 */

import { useEffect, useLayoutEffect, useState } from "react";
import {
  createHashRouter,
  RouterProvider,
  Outlet,
  useRouteError,
} from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar";
import CommandBar from "./CommandBar";
import Home from "../Features/Workspace/Home";
import ScratchPad from "../Features/Scratchpad/ScratchPad";
import GraphView from "../Features/Workspace/GraphView";
import Settings from "../Features/Settings/Settings";
import { SettingsProvider, useSettings } from "../contexts/settingsContext";
import NewDocument from "../Features/Notebook/NewDocument";
import { TitleBar } from "./TitleBar/TitleBar";
import { EventsProvider } from "../contexts/EventsContext";
import { CanvasProvider } from "../Features/Notebook/Canvas/Canvas/CanvasContext";
import CodeIDE from "../Features/IDE/CodeIDE";
import Folder from "../Features/Workspace/FolderPage";
import { ErrorScreen } from "../components/ErrorScreen";
import { WelcomeModal } from "../components/Modals/WelcomeModal";
import SpotlightTour from "../components/Modals/SpotlightTour";
import { useWorkspaceStore } from "../Store/store";

function RouteErrorBoundary() {
  const error = useRouteError();
  return <ErrorScreen error={error} />;
}

function Layout() {
  const settings = useSettings();
  const [openCommandBar, setOpenCommandBar] = useState<boolean>(false);

  // Zustand state for saves
  const activeNotebook = useWorkspaceStore((s) => s.activeNotebook);
  const isDirty = useWorkspaceStore((s) => s.isDirty);
  const saveNotebookToDisk = useWorkspaceStore((s) => s.saveNotebookToDisk);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      const dynamicKeys = settings.openCommandBarKeys.toLowerCase().split("-");
      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");
      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;
      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault();
        setOpenCommandBar((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleCommands);
    return () => window.removeEventListener("keydown", handleCommands);
  }, [settings.openCommandBarKeys]);

  useEffect(() => {
    const handleOpen = () => setOpenCommandBar(true);
    const handleClose = () => setOpenCommandBar(false);
    window.addEventListener("nxuo:open-command-bar", handleOpen);
    window.addEventListener("nxuo:close-command-bar", handleClose);
    return () => {
      window.removeEventListener("nxuo:open-command-bar", handleOpen);
      window.removeEventListener("nxuo:close-command-bar", handleClose);
    };
  }, []);

  // ==========================================
  // MANUAL (CTRL+S) & AUTO-SAVE (30s) ENGINE
  // ==========================================
  useEffect(() => {
    const handleSave = (e?: KeyboardEvent) => {
      if (e) {
        // Only trigger on Ctrl+S / Cmd+S
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
        } else {
          return;
        }
      }

      // Save if we have an active notebook in the document view and it's dirty
      if (activeNotebook && isDirty) {
        saveNotebookToDisk(activeNotebook.id);
      }
    };

    window.addEventListener("keydown", handleSave);

    // 30-second auto-save interval
    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 30_000);

    return () => {
      window.removeEventListener("keydown", handleSave);
      clearInterval(autoSaveInterval);
    };
  }, [activeNotebook, isDirty, saveNotebookToDisk]);

  const colorTrack = settings.darkMode ? "#262627" : "#DDDDDD";
  const thumbColor = settings.darkMode ? "#D8D9DC" : "#222223";
  const thumbHover = settings.darkMode ? "#B1B8C1" : "#40526C";

  return (
    <>
      <TitleBar />
      <WelcomeModal darkMode={settings.darkMode} />
      <SpotlightTour darkMode={settings.darkMode} />
      <div
        className={`h-screen fixed top-9 w-screen flex ${!settings.darkMode ? "bg-[#f4f4f5]" : "bg-black/95"}`}
        style={
          {
            "--colorTrack": colorTrack,
            "--thumbColor": thumbColor,
            "--thumbHover": thumbHover,
          } as React.CSSProperties
        }
      >
        {openCommandBar && (
          <CommandBar
            darkMode={settings.darkMode}
            setDarkMode={settings.setDarkMode}
            isOpen={openCommandBar}
            onClose={() => setOpenCommandBar(false)}
          />
        )}
        <Sidebar darkMode={settings.darkMode} />
        <div className="flex-1 overflow-auto ">
          <Outlet
            context={{
              darkMode: settings.darkMode,
              setDarkMode: settings.setDarkMode,
            }}
          />
        </div>
      </div>
    </>
  );
}

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: "scratchpad", element: <ScratchPad /> },
      { path: "graph", element: <GraphView /> },
      { path: "settings", element: <Settings /> },
      { path: "ide", element: <CodeIDE /> },
      { path: "document/:id", element: <NewDocument /> },
      { path: "folder/:id", element: <Folder /> },
      { path: "code/:id", element: <CodeIDE /> },
      { path: "*", element: <ErrorScreen is404 /> },
    ],
  },
]);

function App() {
  return (
    <SettingsProvider>
      <CanvasProvider>
        <EventsProvider>
          <RouterProvider router={router} />
        </EventsProvider>
      </CanvasProvider>
    </SettingsProvider>
  );
}

export default App;
