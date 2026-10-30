/**
 * @file WelcomeModal.tsx
 * @component WelcomeModal
 * @description One-time first-run modal. Sets context (local-first, keyboard)
 * and offers jump links to the curated demo content. Dismissed permanently
 * via `useFirstRun("nxuo-welcome-v1")`.
 *
 * @architecture
 * - Reads targets from `useWorkspaceStore` (assumes `initializeData()` ran
 *   before React mounted — see `main.tsx`).
 * - Mounted inside `Layout`, so it renders on first launch regardless of
 *   which route the user lands on.
 * - Bump the storage key suffix (v1 → v2) to re-show to existing users.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiFolder, FiCommand, FiBookOpen, FiX } from "react-icons/fi";
import { useFirstRun } from "../Hooks/useFirstRun";
import { useWorkspaceStore } from "../Store/store";
import { FormatHotkey } from "../assets/FormatHotKeys";
import { useSettings } from "../contexts/settingsContext";
import { startSpotlightTour } from "./SpotlightTour";
import { HOME_STEPS } from "../tours/pageTours";

interface WelcomeModalProps {
  darkMode: boolean;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ darkMode }) => {
  const [isFirstRun, dismiss] = useFirstRun("nxuo-welcome-v1");
  const navigate = useNavigate();
  const settings = useSettings();

  const notebooks = useWorkspaceStore((s) => s.notebooks);
  const folders = useWorkspaceStore((s) => s.folders);
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);

  // Prefer the curated Welcome notebook / Playground folder, fall back to
  // whatever exists.
  const welcomeNotebook =
    notebooks.find((n) => n.id === "demo-welcome-notebook") ?? notebooks[0];
  const playground =
    folders.find((f) => f.id === "demo-playground-folder") ?? folders[0];
  const helloCode =
    codeFiles.find((c) => c.titleSlug === "hello-nxuo") ?? codeFiles[0];

  return (
    <AnimatePresence>
      {isFirstRun && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${
              darkMode
                ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                : "bg-white border-zinc-200 text-zinc-900"
            }`}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div>
                <h1 className="text-base font-bold">Welcome to NXU_O</h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  A local-first workspace for notes, folders, and code.
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Close"
                className={`p-1.5 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-zinc-800 text-zinc-500"
                    : "hover:bg-zinc-100 text-zinc-400"
                }`}
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="px-6 pb-2 space-y-2">
              <Card
                darkMode={darkMode}
                icon={<FiFolder size={16} />}
                title="Everything is local"
                body="Files live in a store/ folder next to the app. No cloud, no account."
              />
              <Card
                darkMode={darkMode}
                icon={<FiCommand size={16} />}
                title="Built for the keyboard"
                body={
                  <>
                    Press{" "}
                    <FormatHotkey hotkeyStr={settings.openCommandBarKeys} />{" "}
                    anywhere to open the command bar. Press <code>?</code> for
                    all shortcuts.
                  </>
                }
              />
              <Card
                darkMode={darkMode}
                icon={<FiBookOpen size={16} />}
                title="Open something to start"
                body={
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {welcomeNotebook && (
                      <JumpChip
                        darkMode={darkMode}
                        label={welcomeNotebook.title || "Open Welcome notebook"}
                        onClick={() => {
                          dismiss();
                          navigate(`/document/${welcomeNotebook.id}`);
                        }}
                      />
                    )}
                    {playground && (
                      <JumpChip
                        darkMode={darkMode}
                        label={playground.title || "Open Playground folder"}
                        onClick={() => {
                          dismiss();
                          navigate(`/folder/${playground.id}`);
                        }}
                      />
                    )}
                    {helloCode && (
                      <JumpChip
                        darkMode={darkMode}
                        label={helloCode.title || "Open Hello, NXU_O"}
                        onClick={() => {
                          dismiss();
                          navigate(`/code/${helloCode.titleSlug}`);
                        }}
                      />
                    )}
                  </div>
                }
              />
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                onClick={() => {
                  dismiss(); // Sets nxuo-welcome-v1 in localStorage
                  setTimeout(
                    () => startSpotlightTour(HOME_STEPS, "nxuo-tour-home-v1"),
                    250,
                  );
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  darkMode
                    ? "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                Show me around
              </button>
              <button
                onClick={dismiss}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                  darkMode
                    ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                    : "bg-zinc-900 text-white hover:bg-black"
                }`}
              >
                Start exploring
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Sub-components ──────────────────────────────────────────────────
const Card: React.FC<{
  darkMode: boolean;
  icon: React.ReactNode;
  title: string;
  body: React.ReactNode;
}> = ({ darkMode, icon, title, body }) => (
  <div
    className={`flex gap-3 p-3 rounded-lg border ${
      darkMode ? "bg-zinc-950/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
    }`}
  >
    <div
      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
        darkMode
          ? "bg-zinc-800 text-zinc-300"
          : "bg-white border border-zinc-200 text-zinc-600"
      }`}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold">{title}</p>
      <div
        className={`text-[11px] mt-0.5 leading-relaxed ${
          darkMode ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        {body}
      </div>
    </div>
  </div>
);

const JumpChip: React.FC<{
  darkMode: boolean;
  label: string;
  onClick: () => void;
}> = ({ darkMode, label, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-md text-[10.5px] font-medium transition-colors ${
      darkMode
        ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
        : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
    }`}
  >
    {label}
  </button>
);
