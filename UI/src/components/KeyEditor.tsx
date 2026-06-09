import React, { useEffect, useRef, useState, type SetStateAction } from "react";
import { motion } from "framer-motion";

interface KeyEditorProps {
  keys: string;
  titleEditor: string;
  darkMode: boolean;
  setOpenKeyEditor: (open: boolean) => void;
  setNewKeys: React.Dispatch<SetStateAction<string[]>>;
}

export default function KeyEditor({
  keys,
  titleEditor,
  darkMode,
  setOpenKeyEditor,
  setNewKeys,
}: KeyEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus container on mount so keypresses work instantly
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // 1. Initialize local state with the initial keys prop passed down
  const [pressedKeys, setPressedKeys] = useState<string[]>(() =>
    keys ? keys.split("-").filter(Boolean) : [],
  );

  const [isNewKey, setIsKey] = useState<boolean>(false);

  return (
    <motion.div
      initial={{ opacity: 0.5, scale: 0.1, y: -150 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      ref={containerRef}
      tabIndex={0}
      className={`w-[calc(50%-10rem)] flex flex-col outline-0 rounded-lg px-4 py-4 min-h-1/2 z-999 absolute shadow  border  top-1/4 left-2/6 ${darkMode ? "bg-[#18181b] border-zinc-300/10" : "bg-zinc-50 border-zinc-600/50"}`}
      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Escape") {
          setOpenKeyEditor(false);
          return;
        }

        // Prevent default browser shortcuts (e.g., Ctrl+D bookmarking) from interrupting
        e.preventDefault();
        setIsKey(true);

        const newChord: string[] = [];

        // 1. Detect active modifiers that are currently held down
        if (e.ctrlKey) newChord.push("Ctrl");
        if (e.shiftKey) newChord.push("Shift");
        if (e.metaKey) newChord.push("Win");
        if (e.key === "PrintScreen" || e.key === "PrtScn")
          newChord.push("PrtSc");

        // 2. Identify and isolate the final action key
        const isModifierOnly = [
          "Control",
          "Shift",
          "Meta",
          "PrintScreen",
          "PrtScn",
        ].includes(e.key);

        if (!isModifierOnly) {
          // Standardize letter capitalization or key formats
          const finalKey = e.key.length === 1 ? e.key.toUpperCase() : e.key;

          // Push the final primary key safely if it isn't recorded yet
          if (!newChord.includes(finalKey)) {
            newChord.push(finalKey);
          }
        }

        // 3. Overwrite state completely with the fresh atomic snapshot
        setPressedKeys(newChord);
      }}
    >
      <div
        className={`h-max uppercase font-semibold mb-4 ml-4 ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}
      >
        {titleEditor}
      </div>
      <div
        className={`flex flex-col gap-4 justify-center border ${darkMode ? "border-zinc-300/10" : "border-zinc-600/50"} flex-1 items-center h-full mx-4`}
      >
        <div className="flex gap-4 justify-center items-center">
          {pressedKeys.map((key, idx) => (
            <>
              <kbd
                key={idx}
                className="size-16 px-3 rounded-md flex items-center justify-center bg-[#45a9f5] text-white shadow-[0_2px_0_#2b8cd7] font-sans text-xs font-semibold select-none border-b border-white/20 min-w-"
              >
                {key.charAt(0).toLocaleUpperCase() +
                  key.substring(1, key.length)}{" "}
                {/* Standard Microsoft Windows Fluent Logo Node */}
              </kbd>
              {idx < pressedKeys.length - 1 && (
                <div
                  className={`font-mono font-extralight text-sm ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}
                >
                  +
                </div>
              )}
            </>
          ))}
        </div>
        {isNewKey && (
          <motion.div
            // 1. ANIMATION CONFIGURATION
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} // Premium custom ease-out
            // 2. LAYOUT STYLING
            className="flex items-center justify-center relative top-12 gap-3.5 mt-8 w-full px-4"
          >
            {/* Cancel Button: Coordinated Subtle Glass */}
            <button
              onClick={() => setOpenKeyEditor(false)}
              className={`h-max w-max px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 ${
                darkMode
                  ? "bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700/80 hover:text-zinc-100 border border-zinc-700/40"
                  : "bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800 border border-zinc-200/60"
              }`}
            >
              Cancel
            </button>

            {/* Confirm Button: Exact color base + optimized hover states */}
            <button
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
      <div
        className={`font-mono h-max text-[10px] font-semibold tracking-widest justify-center w-full mt-2 uppercase flex ${darkMode ? "text-zinc-50" : "text-zinc-900"}`}
      >
        Esc to escape/cancel editing
      </div>
    </motion.div>
  );
}
