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

import { motion, AnimatePresence, type Variants } from "framer-motion"; // <-- Added type Variants
import { useNavigate } from "react-router-dom";
import {
  FiFolder,
  FiCommand,
  FiBookOpen,
  FiX,
  FiArrowRight,
  FiCode,
  FiLayers,
  FiZap,
} from "react-icons/fi";
import { useFirstRun } from "../../Hooks/useFirstRun";
import { useWorkspaceStore } from "../../Store/store";
import { FormatHotkey } from "../UI/FormatHotKeys";
import { useSettings } from "../../contexts/settingsContext";
import { startSpotlightTour } from "./SpotlightTour";
import { HOME_STEPS } from "../../Tours/pageTours";

interface WelcomeModalProps {
  darkMode: boolean;
}

// TypeScript needs these explicitly typed as Variants to accept "spring"
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ darkMode }) => {
  const [isFirstRun, dismiss] = useFirstRun("nxuo-welcome-v1");
  const navigate = useNavigate();
  const settings = useSettings();

  const notebooks = useWorkspaceStore((s) => s.notebooks);
  const folders = useWorkspaceStore((s) => s.folders);
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);

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
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className={`fixed inset-0 z-99999 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto ${
            darkMode
              ? "bg-[#09090b] text-zinc-100"
              : "bg-[#fafafa] text-zinc-900"
          }`}
        >
          {/* Ambient Background Glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className={`absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 ${
                darkMode ? "bg-indigo-500" : "bg-blue-400"
              }`}
            />
            <div
              className={`absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 ${
                darkMode ? "bg-emerald-500" : "bg-teal-400"
              }`}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={dismiss}
            aria-label="Close"
            className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-10 ${
              darkMode
                ? "hover:bg-zinc-800 text-zinc-400"
                : "hover:bg-zinc-200 text-zinc-500"
            }`}
          >
            <FiX size={24} />
          </button>

          {/* Main Content Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl w-full flex flex-col items-center relative z-10 mt-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Welcome
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
                Meet{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 to-emerald-500">
                  NXU_O
                </span>
              </h1>
              <p
                className={`text-base sm:text-lg max-w-2xl mx-auto ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}
              >
                A local-first, keyboard-centric workspace for your notes, code
                problems, and physical-feeling folders. No cloud, no accounts,
                no latency.
              </p>
            </motion.div>

            {/* Feature Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12"
            >
              <FeatureCard
                darkMode={darkMode}
                icon={<FiZap size={24} />}
                iconColor="text-amber-500"
                iconBg="bg-amber-500/10"
                title="Instant & Local"
                description="Everything runs and saves directly on your disk via Rust. No internet required."
              />
              <FeatureCard
                darkMode={darkMode}
                icon={<FiCommand size={24} />}
                iconColor="text-indigo-500"
                iconBg="bg-indigo-500/10"
                title="Keyboard First"
                description={
                  <>
                    Built to keep your hands on the keys. Press{" "}
                    <FormatHotkey hotkeyStr={settings.openCommandBarKeys} />{" "}
                    anywhere.
                  </>
                }
              />
              <FeatureCard
                darkMode={darkMode}
                icon={<FiLayers size={24} />}
                iconColor="text-emerald-500"
                iconBg="bg-emerald-500/10"
                title="Tactile Workspace"
                description="Manage notebooks, drag-and-drop folders, and write code all in one integrated UI."
              />
            </motion.div>

            {/* Quick Jump Section */}
            <motion.div
              variants={itemVariants}
              className="w-full max-w-3xl mb-12 text-center"
            >
              <p
                className={`text-sm font-medium mb-4 uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Jump right in
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {welcomeNotebook && (
                  <JumpPill
                    darkMode={darkMode}
                    icon={<FiBookOpen />}
                    label="Read the Welcome Notebook"
                    onClick={() => {
                      dismiss();
                      navigate(`/document/${welcomeNotebook.id}`);
                    }}
                  />
                )}
                {playground && (
                  <JumpPill
                    darkMode={darkMode}
                    icon={<FiFolder />}
                    label="Explore the Playground Folder"
                    onClick={() => {
                      dismiss();
                      navigate(`/folder/${playground.id}`);
                    }}
                  />
                )}
                {helloCode && (
                  <JumpPill
                    darkMode={darkMode}
                    icon={<FiCode />}
                    label="Solve Hello, NXU_O"
                    onClick={() => {
                      dismiss();
                      navigate(`/code/${helloCode.titleSlug}`);
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* Footer Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
            >
              <button
                onClick={() => {
                  dismiss();
                  setTimeout(
                    () => startSpotlightTour(HOME_STEPS, "nxuo-tour-home-v1"),
                    300,
                  );
                }}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-zinc-700"
                    : "bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-300 shadow-sm"
                }`}
              >
                <FiCommand size={16} />
                Take the tour
              </button>

              <button
                onClick={dismiss}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  darkMode
                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    : "bg-zinc-900 text-white hover:bg-black shadow-[0_0_20px_rgba(0,0,0,0.2)]"
                }`}
              >
                Start exploring
                <FiArrowRight size={16} />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ── Sub-components ──────────────────────────────────────────────────

const FeatureCard: React.FC<{
  darkMode: boolean;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  description: React.ReactNode;
}> = ({ darkMode, icon, iconColor, iconBg, title, description }) => (
  <div
    className={`p-6 rounded-2xl border flex flex-col items-start transition-all duration-300 hover:-translate-y-1 ${
      darkMode
        ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50"
        : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-md"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconBg} ${iconColor}`}
    >
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p
      className={`text-sm leading-relaxed ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
    >
      {description}
    </p>
  </div>
);

const JumpPill: React.FC<{
  darkMode: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ darkMode, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
      darkMode
        ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
        : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm"
    }`}
  >
    <span className={darkMode ? "text-zinc-500" : "text-zinc-400"}>{icon}</span>
    {label}
  </button>
);
