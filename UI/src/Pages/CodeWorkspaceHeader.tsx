/**
 * @file CodeWorkspaceHeader.tsx
 * @component CodeWorkspaceHeader
 * @description Standardized action toolbar row layout managing runtime selection frameworks and manual workspace saves.
 *
 * @architecture
 * - Explicitly types property bounds using a strict contract definition layer.
 * - Single source of truth driven directly by parent properties.
 * - Adheres to a minimalist 2D interface profile utilizing raw element parameters instead of heavy graphics.
 */

import React from "react";
import { FiCode, FiSave } from "react-icons/fi";

export interface CodeWorkspaceHeaderProps {
  darkMode: boolean;
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onSave: () => void;
  /** Guard variable tracking whether language matrices exist; locks selection paths on empty values */
  hasTemplates?: boolean;
}

export const CodeWorkspaceHeader: React.FC<CodeWorkspaceHeaderProps> = ({
  darkMode,
  languages,
  selectedLanguage,
  onLanguageChange,
  onSave,
  hasTemplates = false,
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

        {/* Runtime Target Selection Dropdown Box — locked when no templates exist */}
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={!hasTemplates}
          title={
            hasTemplates
              ? "Select runtime language"
              : "No code templates available for this problem"
          }
          className={`text-xs px-2.5 py-1 rounded-md border outline-none font-semibold transition-all ${
            !hasTemplates ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
              : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300"
          }`}
        >
          {languages.map((lang, idx) => (
            <option key={idx} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Right Operations Core Action Triggers */}
      <div className="flex items-center gap-2">
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
