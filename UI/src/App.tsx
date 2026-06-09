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

function Layout() {
  const settings = useSettings();

  const [openCommandBar, setOpenCommandBar] = useState<boolean>(false);

  // Sync dark mode state with HTML class list for Tailwind CSS
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // Command Bar Shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      // 1. Break down your custom string shortcut into a manageable array
      const dynamicKeys = settings.openCommandBarKeys.toLowerCase().split("-");

      // 2. Evaluate individual modifier flags dynamically based on your array contents
      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      // 3. Find the action character key (the array element that isn't a modifier)
      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      // 4. Verify that the hardware matches your configuration perfectly
      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;

      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      // 5. Fire the toggle command only if every condition passes
      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault();
        setOpenCommandBar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);

    // Clean up the active event listener to prevent event stacking memory leaks
    return () => window.removeEventListener("keydown", handleCommands);
  }, [settings.openCommandBarKeys]);

  return (
    <div
      className={`${settings.darkMode ? "bg-black/95" : "bg-slate-100"}  h-screen flex transition-colors duration-200`}
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

      {/* The main workspace content changes based on the route */}
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

// Router configuration using Hash Router for safe Tauri navigation
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
