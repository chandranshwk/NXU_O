/**
 * @file KeyEditor.tsx
 * @component KeyEditor
 * @description A keyboard capture component. Renders as an overlay dialog
 * modal to listen, capture, and standardize raw user hotkey inputs into combined
 * key strings (e.g., "Ctrl-Shift-K").
 *
 * @architecture
 * - Injects a `tabIndex={0}` flag onto the wrapper layer to capture direct hardware keystrokes on mount.
 * - Utilizes custom `onKeyDown` arrays to extract active modifier properties (`ctrlKey`, `shiftKey`).
 * - Dispatches complete key combination string arrays up towards the parent settings layout panel.
 */

import React, { useEffect, useRef, useState, type SetStateAction } from "react";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

interface KeyEditorProps {
  /** Active hotkey configuration string passed from initial storage registers */
  keys: string;
  /** Header string identifier describing the specific command action being edited */
  titleEditor: string;
  /** Shared dark mode setting flag used to switch visual palette ranges */
  darkMode: boolean;
  /** Dismissal modifier closing the modal canvas visibility overlay */
  setOpenKeyEditor: (open: boolean) => void;
  /** Upstream state dispatcher saving recorded hotkey combination arrays */
  setNewKeys: React.Dispatch<SetStateAction<string[]>>;
}

export default function KeyEditor({
  keys,
  titleEditor,
  darkMode,
  setOpenKeyEditor,
  setNewKeys,
}: KeyEditorProps) {
  /** Boundary container ref link focus target catching input event frames */
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // LIFECYCLE: KEYBOARD HOOK INITIALIZER
  // ==========================================
  /** Automatically sets focus parameters on mount so key captures activate immediately */
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  /** Local state array compiling individual recorded modifier and character string entries */
  const [pressedKeys, setPressedKeys] = useState<string[]>(() =>
    keys ? keys.split("-").filter(Boolean) : [],
  );

  /** Visibility flag controlling the slide-in display state for action save buttons */
  const [isNewKey, setIsKey] = useState<boolean>(false);

  return (
    /* MAIN FRAMER-MOTION MODAL OVERLAY SHEET CONTAINER */
    <motion.div
      initial={{ opacity: 0.5, scale: 0.1, y: -150 }}
      key={uuidv4()}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      ref={containerRef}
      tabIndex={0}
      className={`w-[calc(50%-10rem)] flex flex-col outline-0 rounded-lg px-4 py-4 min-h-1/2 z-999 absolute shadow border top-1/4 left-2/6 ${darkMode ? "bg-[#18181b] border-zinc-300/10" : "bg-zinc-50 border-zinc-600/50"}`}
      // ==========================================
      // ⌨️ KEY DOWN ATOMIC RECORDING ENGINE
      // ==========================================
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        // Instant escape hatch route back out if clicking Esc
        if (e.key === "Escape") {
          setOpenKeyEditor(false);
          return;
        }

        // Intercept native browser macro overrides (e.g. tracking Ctrl+P print frames)
        e.preventDefault();
        setIsKey(true);

        const newChord: string[] = [];

        // 1. Audit status trackers verifying active hardware modifiers currently held down
        if (e.ctrlKey) newChord.push("Ctrl");
        if (e.shiftKey) newChord.push("Shift");
        if (e.metaKey) newChord.push("Win");
        if (e.key === "PrintScreen" || e.key === "PrtScn")
          newChord.push("PrtSc");

        // 2. Separate active macro strings from standard literal key inputs
        const isModifierOnly = [
          "Control",
          "Shift",
          "Meta",
          "PrintScreen",
          "PrtScn",
        ].includes(e.key);

        if (!isModifierOnly) {
          // Standardize letter casing outputs into uniform uppercase labels
          const finalKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;

          // Prevent duplication if the standard text token sits recorded inside chords
          if (!newChord.includes(finalKey)) {
            newChord.push(finalKey);
          }
        }

        // 3. Commit the structural key snapshot directly down to local arrays
        setPressedKeys(newChord);
      }}
    >
      {/* Target Key-cap Configuration Header Tag Label */}
      <div
        className={`h-max uppercase font-semibold mb-4 ml-4 ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}
      >
        {titleEditor}
      </div>

      {/* ==========================================
          VISUAL ELEMENT INTERFACE RESYNC CONTAINER
          ========================================== */}
      <div
        className={`flex flex-col gap-4 justify-center border ${darkMode ? "border-zinc-300/10" : "border-zinc-600/50"} flex-1 items-center h-full mx-4`}
      >
        {/* Render key arrays as distinct OS-style kbd block capsules */}
        <div className="flex gap-4 justify-center items-center">
          {pressedKeys.map((key, idx) => (
            <React.Fragment key={idx}>
              <kbd className="size-16 px-3 rounded-md flex items-center justify-center bg-[#45a9f5] text-white shadow-[0_2px_0_#2b8cd7] font-sans text-xs font-semibold select-none border-b border-white/20 min-w-">
                {key.charAt(0).toLocaleUpperCase() +
                  key.substring(1, key.length)}
              </kbd>

              {/* Splice partitioning mathematical separator tags */}
              {idx < pressedKeys.length - 1 && (
                <div
                  className={`font-mono font-extralight text-sm ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}
                >
                  +
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ==========================================
            SLIDE-IN FOULER FOOTER (SAVE DISPATCH BUTTONS)
            ========================================== */}
        {isNewKey && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} // Clean responsive timing matrix
            className="flex items-center justify-center relative top-12 gap-3.5 mt-8 w-full px-4"
          >
            {/* Cancel Trigger: Drop focus states and snap shut overlays */}
            <button
              type="button"
              onClick={() => setOpenKeyEditor(false)}
              className={`h-max w-max px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 ${
                darkMode
                  ? "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100 border border-zinc-700/40"
                  : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 border border-zinc-200/60"
              }`}
            >
              Cancel
            </button>

            {/* Confirm Trigger: Dispatch fresh macro array strings up to store records */}
            <button
              type="button"
              className={`h-max w-max px-7 py-3 rounded-md text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 shadow-md active:scale-95 ${
                darkMode
                  ? "bg-[#667ef799] hover:bg-[#667ef7cc] shadow-[#584cf4]/10 hover:shadow-[#584cf4]/20 border border-indigo-400/20"
                  : "bg-[#667ef799] hover:bg-[#667ef7e6] shadow-[#4f46e5]/10 hover:shadow-[#4f46e5]/20 border border-indigo-500/10"
              }`}
              onClick={() => {
                setNewKeys(pressedKeys);
                setOpenKeyEditor(false);
              }}
            >
              Confirm
            </button>
          </motion.div>
        )}
      </div>

      {/* Floating utility dismissal tooltip navigation prompt */}
      <div
        className={`font-mono h-max text-[10px] font-semibold tracking-widest justify-center w-full mt-2 uppercase flex ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}
      >
        Esc to escape/cancel editing
      </div>
    </motion.div>
  );
}
