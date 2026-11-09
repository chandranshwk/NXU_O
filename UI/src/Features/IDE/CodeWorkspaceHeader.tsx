import React, { useState, useRef, useEffect } from "react";
import {
  FiCode,
  FiSave,
  FiPlay,
  FiLoader,
  FiChevronDown,
  FiCheck,
  FiDownload,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import type { LanguageConfig } from "./LanguageConfig";

export interface CodeWorkspaceHeaderProps {
  darkMode: boolean;
  languages: LanguageConfig[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onSave: () => void;
  onExport: () => void; // <-- ADDED
  onRun: () => void;
  isRunning?: boolean;
}

export const CodeWorkspaceHeader: React.FC<CodeWorkspaceHeaderProps> = ({
  darkMode,
  languages,
  selectedLanguage,
  onLanguageChange,
  onSave,
  onExport,
  onRun,
  isRunning = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`flex items-center justify-between px-4 h-11 border rounded-t-md shrink-0 select-none ${
        darkMode
          ? "bg-[#18181c] border-zinc-800/80"
          : "bg-white border-zinc-200"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
          <FiCode className="text-emerald-500 font-bold" size={16} />
          Coding Space
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 text-xs px-2.5 py-1 rounded-md border outline-none font-semibold transition-all cursor-pointer ${
              darkMode
                ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {selectedLanguage}
            <FiChevronDown
              size={14}
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className={`absolute top-full left-0 mt-1 w-[340px] rounded-lg shadow-xl border overflow-hidden z-50 flex flex-col p-2 ${
                  darkMode
                    ? "bg-zinc-900 border-zinc-800 text-zinc-200"
                    : "bg-white border-zinc-200 text-zinc-700"
                }`}
              >
                <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto no-scrollbar">
                  {languages.map((lang) => (
                    <button
                      key={lang.slug}
                      onClick={() => {
                        onLanguageChange(lang.name);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left rounded-md transition-colors truncate ${
                        selectedLanguage === lang.name
                          ? darkMode
                            ? "bg-indigo-500/10 text-indigo-400 font-semibold"
                            : "bg-indigo-50 text-indigo-600 font-semibold"
                          : darkMode
                            ? "hover:bg-zinc-800 text-zinc-400"
                            : "hover:bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      <span className="truncate pr-1">{lang.name}</span>
                      {selectedLanguage === lang.name && (
                        <FiCheck size={12} className="shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          title="Run Code"
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            darkMode
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
          }`}
        >
          {isRunning ? (
            <FiLoader size={12} className="animate-spin" />
          ) : (
            <FiPlay size={12} className="fill-current" />
          )}
          {isRunning ? "Running..." : "Run"}
        </button>
        <button
          type="button"
          onClick={onExport}
          title="Export raw file to disk"
          className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          }`}
        >
          <FiDownload size={14} />
        </button>

        {/* Save JSON Button */}
        <button
          type="button"
          onClick={onSave}
          title="Save to internal database"
          className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          }`}
        >
          <FiSave size={14} />
        </button>
      </div>
    </div>
  );
};

export default CodeWorkspaceHeader;
