/**
 * @file App.tsx
 * @component App
 * @description The main file that sets up the layout, routes, and global settings for the app.
 *
 * @architecture
 * - Uses settings from `src/contexts/settingsContext.tsx`.
 * - Sidebar stays fixed while pages change inside the Outlet.
 * - CommandBar opens on top as an overlay.
 *
 * @platform
 * Uses Hash Router so navigation works correctly inside Tauri without breaking local file paths.
 */

import { useEffect, useState } from "react";
import { createHashRouter, RouterProvider, Outlet } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import CommandBar from "./components/CommandBar";
import Home from "./Pages/Home";
import ScratchPad from "./Pages/ScratchPad";
import GraphView from "./Pages/GraphView";
import Settings from "./Pages/Settings";
import { useSettings } from "./contexts/settingsContext";
import NewDocument from "./Pages/NewDocument";

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
   * Automatically adds or removes the 'dark' class on the HTML root element.
   * This lets Tailwind's dark mode selectors work across the entire app instantly.
   */
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
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

  return (
    <div
      className={`${settings.darkMode ? "bg-black/95" : "bg-slate-100"} h-screen flex transition-colors duration-200`}
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
    children: [
      { index: true, element: <Home /> },
      { path: "scratchpad", element: <ScratchPad /> },
      { path: "graph", element: <GraphView /> },
      { path: "settings", element: <Settings /> },
      { path: "document/:id", element: <NewDocument /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
