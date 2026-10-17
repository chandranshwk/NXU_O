import React from "react";
import type { MockNotebook } from "../assets/SAMPLE";
import { useNavigate } from "react-router-dom";

interface NotebooksProps {
  notebook: MockNotebook;
  darkMode: boolean;
  totalPages: number;
}

/** Colored ticks in the notebook's footer. Cycles so each page gets a hue. */
const PAGE_TICK_COLORS = [
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#ec4899",
  "#eab308",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
];

const Notebooks: React.FC<NotebooksProps> = ({
  notebook,
  darkMode,
  totalPages,
}) => {
  const navigate = useNavigate();

  // Cap the visible ticks so a 200-page notebook doesn't paint a solid bar.
  const MAX_TICKS = 8;
  const visiblePages = notebook.pages.slice(0, MAX_TICKS);
  const overflow = Math.max(0, notebook.pages.length - MAX_TICKS);

  return (
    <div
      key={notebook.id}
      onClick={() => navigate(`document/${notebook.id}`)}
      className="break-inside-avoid-column h-65 relative group/notebook w-61 inline-block cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:rotate-[-0.5deg]"
      style={{ perspective: "1000px" }}
    >
      {/* ========================================================= */}
      {/* 1. EXPOSED STACKED PAPER SHEETS                           */}
      {/* ========================================================= */}
      <div
        className={`absolute inset-y-1 right-px left-1 h-65 w-61 rounded-r-md border-y border-r z-0 transition-transform duration-300 group-hover/notebook:translate-x-2 group-hover/notebook:rotate-[0.5deg]
          ${darkMode ? "bg-zinc-800 border-zinc-700/60 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.3)]" : "bg-zinc-50 border-zinc-200"}`}
      >
        <div
          className={`absolute right-0.75 h-64.5 inset-y-0 w-px ${darkMode ? "bg-zinc-700/40" : "bg-zinc-600/20"}`}
        />
        <div
          className={`absolute right-1.25 h-64.5 inset-y-0 w-px ${darkMode ? "bg-zinc-700/20" : "bg-zinc-600/50"}`}
        />
      </div>

      {/* ========================================================= */}
      {/* 2. FRONT HARDCOVER ASSEMBLY                               */}
      {/* ========================================================= */}
      <div
        className={`relative z-10 flex h-full rounded-r-xl rounded-l-[3px] overflow-hidden border-y border-r transition-shadow duration-300
            ${
              darkMode
                ? "bg-zinc-900 border-zinc-800/80 shadow-[4px_8px_20px_rgba(0,0,0,0.4)] group-hover/notebook:shadow-[12px_16px_32px_rgba(0,0,0,0.5)] group-hover/notebook:border-zinc-700"
                : "bg-white border-zinc-200/90 shadow-[4px_6px_14px_rgba(0,0,0,0.04)] group-hover/notebook:shadow-[10px_14px_24px_rgba(0,0,0,0.06)] group-hover/notebook:border-zinc-300"
            }`}
      >
        {/* A. PHYSICAL BOOK BINDING SPINE */}
        <div
          className={`w-4.5 min-h-35 border-r shrink-0 relative transition-colors duration-300
            ${darkMode ? "bg-zinc-950/80 border-zinc-900/50" : "bg-zinc-100 border-zinc-200"}`}
        >
          <div className="absolute inset-y-0 right-0 w-0.5 bg-black/5 dark:bg-white/5" />
          <div className="absolute inset-y-0 left-0 w-0.75 bg-linear-to-r from-black/10 to-transparent" />
        </div>

        {/* B. ELASTIC CLOSURE STRAP */}
        <div
          className={`absolute right-4 inset-y-0 w-2 z-20 opacity-85 transition-all duration-300 group-hover/notebook:right-3.5
            ${darkMode ? "bg-zinc-800 border-x border-zinc-700/40" : "bg-zinc-200 border-x border-zinc-300/80"}`}
        />

        {/* C. COVER TYPOGRAPHY AREA */}
        <div className="flex flex-col justify-between p-4 pr-7 w-full relative z-10 gap-6">
          <div className="space-y-1">
            <h2
              className={`text-lg font-bold tracking-tight leading-snug transition-colors duration-200
                ${darkMode ? "text-zinc-200 group-hover/notebook:text-white" : "text-zinc-800 group-hover/notebook:text-black"}`}
            >
              {notebook.title}
            </h2>
          </div>

          {/* D. PAGE TICKS & PAGE COUNT BADGE */}
          <div className="flex items-center justify-between gap-1.5 mt-auto">
            <div className="flex items-center gap-0.5 flex-1 max-w-11.25">
              {visiblePages.slice(0, 5).map((page, idx) => (
                <div
                  key={page.id}
                  title={page.title}
                  className="h-0.5 min-w-2 rounded-full flex-1 max-w-2 opacity-85 transition-transform duration-200 group-hover/notebook:scale-y-110"
                  style={{
                    backgroundColor:
                      PAGE_TICK_COLORS[idx % PAGE_TICK_COLORS.length],
                  }}
                />
              ))}
              {overflow > 0 && (
                <span
                  className={`text-[9px] font-mono ml-1 ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                  title={`${overflow} more ${overflow === 1 ? "page" : "pages"}`}
                >
                  +{overflow - 5}
                </span>
              )}
            </div>

            <span
              className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded transition-all duration-200 shrink-0
                ${
                  darkMode
                    ? "bg-zinc-800/80 text-zinc-400 border border-zinc-700/30 group-hover/notebook:text-indigo-300"
                    : "bg-zinc-100 text-zinc-500 border border-zinc-200/60 group-hover/notebook:text-indigo-600"
                }`}
            >
              {totalPages}p
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notebooks;
