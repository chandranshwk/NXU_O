/**
 * @file HelpOverlay.tsx
 * @component HelpOverlay
 * @description Full keyboard-shortcuts reference overlay. Opened by the `?`
 * button in TitleBar.tsx, or by pressing `?` anywhere (except inside inputs).
 * Reads every shortcut from `useSettings`, so it always reflects the user's
 * current bindings.
 *
 * @architecture
 * - Controlled component: parent owns `isOpen` via `<HelpOverlay />` mount.
 * - Self-dismisses on `Escape`.
 * - Rendered in-place (not portalled) — `z-[99999]` sits above the TitleBar's
 *   `z-999` and the CommandBar's `z-999`.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useSettings } from "../contexts/settingsContext";
import { FormatHotkey } from "../assets/FormatHotKeys";
import { startSpotlightTour } from "./SpotlightTour";

interface HelpOverlayProps {
  darkMode: boolean;
  onClose: () => void;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  darkMode,
  onClose,
}) => {
  const settings = useSettings();

  // Escape closes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const rows = [
    { label: "Open command bar", keys: settings.openCommandBarKeys },
    { label: "Search current page", keys: settings.searchingKeys },
    { label: "Open scratchpad", keys: settings.scratchpadOpenShortcut },
    { label: "Toggle zen mode", keys: settings.zenModeShortcut },
    { label: "Focus notes view", keys: settings.notesViewShortcut },
    {
      label: "Toggle folder explorer",
      keys: settings.folderExplorerShortcut,
    },
    {
      label: "Strike through text",
      keys: settings.defaultStrikeThroughShortcut,
    },
    { label: "Save (in scratchpad)", keys: "Ctrl-S" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md rounded-xl border shadow-2xl p-5 ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-100"
              : "bg-white border-zinc-200 text-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Keyboard shortcuts</h2>
              <p
                className={`text-[10px] mt-0.5 ${
                  darkMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                All shortcuts are re-bindable in Settings
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`p-1.5 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200"
                  : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="flex flex-col">
            {rows.map((r) => (
              <div
                key={r.label}
                className={`flex items-center justify-between py-2 text-xs border-b last:border-b-0 ${
                  darkMode ? "border-zinc-800/60" : "border-zinc-100"
                }`}
              >
                <span className={darkMode ? "text-zinc-300" : "text-zinc-600"}>
                  {r.label}
                </span>
                <FormatHotkey hotkeyStr={r.keys} />
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              onClose();
              setTimeout(() => startSpotlightTour(), 150);
            }}
            className={`mt-3 w-full py-1.5 text-[11px] font-medium rounded-md transition-colors ${
              darkMode
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
          >
            Replay the walkthrough
          </button>

          <p
            className={`mt-4 pt-3 text-[10px] border-t ${
              darkMode
                ? "border-zinc-800 text-zinc-500"
                : "border-zinc-100 text-zinc-400"
            }`}
          >
            Press{" "}
            <kbd
              className={`px-1 rounded ${
                darkMode ? "bg-zinc-800" : "bg-zinc-100"
              }`}
            >
              ?
            </kbd>{" "}
            anywhere to reopen ·{" "}
            <kbd
              className={`px-1 rounded ${
                darkMode ? "bg-zinc-800" : "bg-zinc-100"
              }`}
            >
              Esc
            </kbd>{" "}
            to close
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HelpOverlay;
