import React from "react";
import { FiCode, FiSave, FiPlay } from "react-icons/fi";
import type { LanguageConfig } from "../components/LanguageConfig";

export interface CodeWorkspaceHeaderProps {
  darkMode: boolean;
  languages: LanguageConfig[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onSave: () => void;
  onRun: () => void; //  Added
}

export const CodeWorkspaceHeader: React.FC<CodeWorkspaceHeaderProps> = ({
  darkMode,
  languages,
  selectedLanguage,
  onLanguageChange,
  onSave,
  onRun,
}) => {
  return (
    <div
      className={`flex items-center justify-between px-4 h-11 border rounded-t-xl shrink-0 select-none ${
        darkMode
          ? "bg-[#18181c] border-zinc-800/80"
          : "bg-white border-zinc-200"
      }`}
    >
      {/* Left Operations Control Cluster */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold tracking-tight">
          <FiCode className="text-emerald-500 font-bold" size={16} />
          Coding Space
        </div>

        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className={`text-xs px-2.5 py-1 rounded-md border outline-none font-semibold transition-all cursor-pointer ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
          }`}
        >
          {languages.map((lang) => (
            <option key={lang.slug} value={lang.name}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Right Operations Core Action Triggers */}
      <div className="flex items-center gap-2">
        {/* Run Action Trigger */}
        <button
          type="button"
          onClick={onRun}
          title="Run Code"
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border transition-all active:scale-95 cursor-pointer ${
            darkMode
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
          }`}
        >
          <FiPlay size={12} className="fill-current" />
          Run
        </button>

        {/* Save/Commit Action Trigger */}
        <button
          type="button"
          onClick={onSave}
          title="Save compilation adjustments"
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
