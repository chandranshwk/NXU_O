import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFileCode } from "react-icons/fa";
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";

interface CodesProps {
  codeFile: CodeFile;
  darkMode: boolean;
}

const Codes: React.FC<CodesProps> = ({ codeFile, darkMode }) => {
  const navigate = useNavigate();

  // 1. Determine the extension based on available templates (your original logic)
  const extension =
    codeFile.codeTemplates?.[0]?.slug === "python"
      ? "py"
      : codeFile.codeTemplates?.[0]?.slug === "java"
        ? "java"
        : "ts";

  // 2. Get the language name for the dynamic icon color
  const primaryTemplate = codeFile.codeTemplates?.[0];
  const languageName = primaryTemplate?.language || "Code";

  // 3. Deterministic color based on the language name
  const getLanguageColor = (lang: string) => {
    let hash = 0;
    for (let i = 0; i < lang.length; i++) {
      hash = lang.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  const langColor = getLanguageColor(languageName);

  // Difficulty coloring
  const diffColor =
    codeFile.difficulty === "Easy"
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : codeFile.difficulty === "Medium"
        ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
        : "text-rose-500 bg-rose-500/10 border-rose-500/20";

  return (
    <div
      onClick={() => navigate(`/code/${codeFile.titleSlug}`)}
      className={`relative w-60 h-55 rounded-md border flex flex-col cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden ${
        darkMode
          ? "bg-[#1e1e1e] border-[#333] hover:border-zinc-600 shadow-black/50"
          : "bg-white border-zinc-200 hover:border-zinc-300 shadow-zinc-200/50"
      }`}
    >
      {/* ── 1. VS CODE STYLE TITLE BAR ────────────────────────────── */}
      <div
        className={`h-8 px-3 flex items-center justify-between border-b shrink-0 ${
          darkMode
            ? "bg-[#252526] border-[#333] text-zinc-400"
            : "bg-[#f3f3f3] border-zinc-200 text-zinc-500"
        }`}
      >
        <span className="text-[10px] font-mono opacity-60 flex items-center gap-1.5">
          {/* ⚡ Added the dynamic icon here */}
          <FaFileCode
            size={12}
            style={{ color: langColor }}
            className="opacity-100"
          />
          <span className="opacity-50 ml-1">~/problems/</span>
          <span className={darkMode ? "text-zinc-300" : "text-zinc-800"}>
            {codeFile.titleSlug}.{extension}
          </span>
        </span>
      </div>

      {/* ── 2. EDITOR CONTENT AREA ────────────────────────────────── */}
      <div className="flex-1 p-5 flex flex-col relative">
        {/* Title & Category */}
        <div className="mb-4 z-10">
          <h3
            className={`text-[15px] font-bold leading-tight mb-1 line-clamp-2 ${
              darkMode ? "text-zinc-100" : "text-zinc-900"
            }`}
          >
            {codeFile.title}
          </h3>
          <p
            className={`text-[11px] font-mono ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            // {codeFile.category}
          </p>
        </div>

        {/* Fake Syntax Highlighted Code Snippet (Texture) */}
        <div className="flex flex-col gap-2 mt-2 opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded-sm bg-purple-500/50" />
            <div className="w-16 h-2 rounded-sm bg-blue-500/50" />
            <div className="w-8 h-2 rounded-sm bg-zinc-500/30" />
          </div>
          <div className="flex items-center gap-2 pl-4">
            <div className="w-6 h-2 rounded-sm bg-emerald-500/50" />
            <div className="w-24 h-2 rounded-sm bg-zinc-500/30" />
          </div>
          <div className="flex items-center gap-2 pl-4">
            <div className="w-12 h-2 rounded-sm bg-yellow-500/50" />
            <div className="w-10 h-2 rounded-sm bg-zinc-500/30" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-2 rounded-sm bg-zinc-500/50" />
          </div>
        </div>
      </div>

      {/* ── 3. STATUS BAR (Footer) ────────────────────────────────── */}
      <div
        className={`h-7 px-4 flex items-center justify-between border-t shrink-0 text-[10px] font-mono ${
          darkMode
            ? "bg-[#007acc]/10 border-[#333] text-zinc-400"
            : "bg-blue-50 border-zinc-200 text-blue-700/70"
        }`}
      >
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className={`px-1 rounded border ${diffColor}`}>
              {codeFile.difficulty}
            </span>
          </span>
          <span>{codeFile.testCases.length} Tests</span>
        </div>
        <span className="opacity-70">{codeFile.likes.toLocaleString()} ★</span>
      </div>
    </div>
  );
};

export default Codes;
