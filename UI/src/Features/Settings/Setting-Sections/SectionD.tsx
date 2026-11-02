/**
 * @file SectionD.tsx
 * @component SectionD
 * @description The configurations panel for interface design presets and cache controls.
 * Manages editor margin styles and handles destructive cache actions to restore corrupted editor states.
 */

import React, { useState, type SetStateAction } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiTrash2, FiAlertTriangle, FiX } from "react-icons/fi";
import { Cards } from "../../../components/UI/Cards";
import { useNavigate } from "react-router-dom";

interface props {
  /** Shared dark mode setting flag used to switch interface theme style variables */
  darkMode: boolean;
  /** Tracks active workspace margin padding selected on screens ('compact' | 'wide') */
  marginPreset: string;
  /** State modifier updating active text layout constraints */
  setMarginPreset: React.Dispatch<SetStateAction<string>>;
}

/**
 * @component SectionD
 * @description Renders layout preference adjustments targeting scratchpad width variables
 * and handles the cache wipe action button.
 */
const SectionD: React.FC<props> = ({
  darkMode,
  marginPreset,
  setMarginPreset,
}) => {
  // ==========================================
  // MODAL & CONFIRMATION STATE
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetString, setTargetString] = useState("");
  const [userInput, setUserInput] = useState("");
  const navigate = useNavigate();

  // ==========================================
  // DESTRUCTIVE ACTIONS
  // ==========================================
  const openConfirmationModal = () => {
    // Generate a random 7-character string (e.g., "a8f2k9x")
    const randomString = Math.random().toString(36).substring(2, 9);
    setTargetString(randomString);
    setUserInput("");
    setIsModalOpen(true);
  };

  const handlePurgeCache = () => {
    if (userInput !== targetString) return;

    try {
      // 1. Clear specific onboarding and hint keys
      const keysToRemove = [
        "nxuo-welcome-v1",
        "nxuo-tour-home-v1",
        "nxuo-tour-settings-v1",
        "nxuo-tour-codeide-v1",
        "nxuo-tour-scratchpad-v1",
        "nxuo-tour-folder-v1",
        "nxuo-tour-notebook-v1",
        "nxuo-hint-sidebar-v1",
        "nxuo-hint-commandbar-v1",
        "nxuo-hint-scratchpad-save-v1",
      ];

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // 2. Clear session storage (tour cooldown)
      sessionStorage.removeItem("nxuo-last-tour-dismiss");

      // 3. Clear scratchpad draft caches (starts with noxuo_draft_)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("noxuo_draft_")) {
          localStorage.removeItem(key);
        }
      });

      navigate("/");

      // 4. Reload the app to apply the fresh state
      window.location.reload();
    } catch (error) {
      console.error("Failed to purge cache:", error);
      alert("Failed to purge cache. Please clear your browser data manually.");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 mt-2">
        {/* Category Section Group Label Title */}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
          <FiEye className="w-3.5 h-3.5" /> Interface Layout Presets
        </h3>

        {/* ==========================================
            ROW OPTION 1: COLUMN PADDING LAYOUT SELECTOR
            ========================================== */}
        <Cards
          type="normal"
          title="Scratchpad Column Padding Preset"
          description="Toggle text side boundaries to choose between structured center columns or edge-to-edge views."
          darkMode={darkMode}
        >
          <select
            value={marginPreset}
            onChange={(e) => setMarginPreset(e.target.value)}
            className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
              darkMode
                ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                : "bg-zinc-50 border-zinc-300 text-zinc-700"
            }`}
          >
            <option value="compact">Compact centered column</option>
            <option value="wide">Full width edge-to-edge</option>
          </select>
        </Cards>

        {/* ==========================================
            ROW OPTION 2: DESTRUCTIVE CACHE PURGE BUTTON
            ========================================== */}
        <Cards
          type="destructive" // Applies a red theme tint configuration onto the card housing layout
          title="Destructive Cache Purge"
          description="Instantly clear out all cached scratchpad drafts and reset the onboarding tours to see them again."
          darkMode={darkMode}
        >
          {/* Destructive Action Trigger */}
          <button
            type="button"
            onClick={openConfirmationModal}
            className="flex items-center gap-1.5 w-max px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded border border-transparent transition-colors active:scale-95"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Purge Cache
          </button>
        </Cards>
      </div>

      {/* ==========================================
          CONFIRMATION MODAL OVERLAY
          ========================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-zinc-200"
              }`}
            >
              {/* Header */}
              <div
                className={`px-5 py-4 border-b flex items-center justify-between ${
                  darkMode
                    ? "border-zinc-800 bg-red-500/5"
                    : "border-zinc-100 bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-full bg-red-500/10 text-red-500">
                    <FiAlertTriangle size={16} />
                  </div>
                  <h2 className="text-sm font-bold text-red-500">
                    Purge Local Cache
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`p-1 rounded-md transition-colors ${
                    darkMode
                      ? "hover:bg-zinc-800 text-zinc-500"
                      : "hover:bg-zinc-200 text-zinc-400"
                  }`}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5">
                <p
                  className={`text-xs leading-relaxed mb-4 ${
                    darkMode ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  This action will permanently delete all cached scratchpad
                  drafts and reset your onboarding tours.{" "}
                  <strong>This cannot be undone.</strong>
                </p>

                <div
                  className={`p-3 rounded-lg border mb-5 ${
                    darkMode
                      ? "bg-zinc-950/50 border-zinc-800"
                      : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <p
                    className={`text-[11px] mb-2 ${
                      darkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Please type{" "}
                    <code className="px-1.5 py-0.5 bg-zinc-800 text-zinc-200 rounded font-mono text-[11px] font-bold">
                      {targetString}
                    </code>{" "}
                    to confirm.
                  </p>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type the code here..."
                    className={`w-full bg-transparent border rounded-md px-3 py-2 text-sm font-mono outline-none transition-colors ${
                      darkMode
                        ? "border-zinc-700 text-zinc-200 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                        : "border-zinc-300 text-zinc-900 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                    }`}
                    autoFocus
                  />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                      darkMode
                        ? "text-zinc-300 hover:bg-zinc-800"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePurgeCache}
                    disabled={userInput !== targetString}
                    className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                      userInput === targetString
                        ? "bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/20 active:scale-95"
                        : "bg-red-600/50 cursor-not-allowed opacity-50"
                    }`}
                  >
                    I understand, purge data
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SectionD;
