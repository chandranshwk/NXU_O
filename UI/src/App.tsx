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
  useRouteError, //  Added useRouteError
} from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import CommandBar from "./components/CommandBar";
import Home from "./Pages/Home";
import ScratchPad from "./Pages/ScratchPad";
import GraphView from "./Pages/GraphView";
import Settings from "./Pages/Settings";
import { SettingsProvider, useSettings } from "./contexts/settingsContext";
import NewDocument from "./Pages/NewDocument";
import { TitleBar } from "./App/TitleBar";
import { EventsProvider } from "./contexts/EventsContext";
import { CanvasProvider } from "./contexts/Canvas/CanvasContext";
import CodeIDE from "./Pages/CodeIDE";
import Folder from "./Pages/FolderPage";
import { ErrorScreen } from "./components/ErrorScreen";
import { WelcomeModal } from "./components/WelcomeModal";
import SpotlightTour from "./components/SpotlightTour";

//  Wrapper to connect React Router's error state to your custom ErrorScreen
function RouteErrorBoundary() {
  const error = useRouteError();
  return <ErrorScreen error={error} />;
}

/**
 * @layout Layout
 * @description The main visual shell of the app. It handles the sidebar layout,
 * custom scrollbar styling, and the global keyboard shortcut engine.
 */
function Layout() {
  const settings = useSettings();

  /** Tracks whether the spotlight command bar is open */
  const [openCommandBar, setOpenCommandBar] = useState<boolean>(false);

  // ==========================================
  // DARK MODE HTML CLASS SYNC
  // ==========================================
  /**
   * Mirrors `settings.darkMode` onto the <html> root so Tailwind's `dark:`
   * variants cascade through the whole tree.
   *
   * `useLayoutEffect` runs before paint, so a fresh hydration lands with the
   * correct class already applied — no flash of the wrong theme.
   *
   * The animated circular reveal is NOT handled here. Every caller that
   * changes the theme (CommandBar, BGEcho, OS preference listener, etc.)
   * goes through the wrapped `setDarkMode` in `settingsContext.tsx`, which
   * opens the View Transition, flushes the React commit synchronously, and
   * plays the clip-path animation. This effect then simply reflects the
   * resulting boolean onto the DOM as part of that same commit.
   */
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  // ==========================================
  // KEYBOARD SHORTCUT TRIGGER
  // ==========================================
  /**
   * Listens for the user's custom keyboard shortcut to open the Command Bar.
   * It splits the shortcut string, checks for modifiers, and triggers the menu.
   */
  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      // 1. Break down the shortcut string (e.g., "mod-k") into individual tokens
      const dynamicKeys = settings.openCommandBarKeys.toLowerCase().split("-");

      // 2. Check which modifier keys are required by the shortcut config
      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      // 3. Find the actual text/character key in the array
      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      // 4. Check if the pressed keys match the required hardware modifiers
      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;

      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      // 5. Open or close the command bar if all keys match perfectly
      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault(); // Prevents default browser actions
        setOpenCommandBar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);

    // Clean up the event listener on unmount to avoid memory leaks
    return () => window.removeEventListener("keydown", handleCommands);
  }, [settings.openCommandBarKeys]);

  // ==========================================
  // SCROLLBAR COLOR VARIABLES
  // ==========================================
  /**
   * Sets theme colors for the scrollbar based on dark mode.
   * These variables are passed into the main container's inline styles.
   */
  const colorTrack = settings.darkMode ? "#262627" : "#DDDDDD";
  const thumbColor = settings.darkMode ? "#D8D9DC" : "#222223";
  const thumbHover = settings.darkMode ? "#B1B8C1" : "#40526C";

  // ==========================================
  // TOUR MODAL EVENT LISTENERS
  // ==========================================
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

  return (
    <>
      <TitleBar />
      <WelcomeModal darkMode={settings.darkMode} />
      <SpotlightTour darkMode={settings.darkMode} />
      <div
        // Background is driven by the `dark` class (not the boolean) so it
        // flips together with the class toggle inside the View Transition
        // callback — keeping old/new snapshots internally consistent.
        // `transition-colors` is intentionally omitted: the View Transition
        // handles the animation, and a CSS transition would freeze mid-flight
        // into the "new" snapshot and cause visible stutter.
        className={`h-screen fixed top-9 w-screen flex ${!settings.darkMode ? "bg-[#f4f4f5]" : "bg-black/95"}`}
        style={
          {
            "--colorTrack": colorTrack,
            "--thumbColor": thumbColor,
            "--thumbHover": thumbHover,
          } as React.CSSProperties
        }
      >
        {/* Overlay command bar */}
        {openCommandBar && (
          <CommandBar
            darkMode={settings.darkMode}
            setDarkMode={settings.setDarkMode}
            isOpen={openCommandBar}
            onClose={() => setOpenCommandBar(false)}
          />
        )}

        {/* Navigation sidebar */}
        <Sidebar darkMode={settings.darkMode} />

        {/* Main content workspace area */}
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

// ==========================================
// ROUTE CONFIGURATION
// ==========================================
/**
 * Application route tree. Uses createHashRouter to make sure
 * routing remains reliable inside the Tauri desktop wrapper.
 */
const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    //  Use the wrapper component so it can pass the error to ErrorScreen
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

      // This handles 404s (invalid URLs) inside the Layout
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
