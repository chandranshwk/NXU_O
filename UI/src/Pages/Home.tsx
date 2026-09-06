/**
 * @file Home.tsx
 * @component Home
 * @description The landing page or dashboard for the application. It lists all
 * available notebooks, sections, and sub-pages in a dense repository grid view.
 *
 * @architecture
 * - Connects to the local data store using `useNotebookStore`.
 * - Displays a grid where clicking a card goes to a specific notebook.
 * - Allows direct deep-linking into individual sub-pages via query parameters.
 */

import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useNotebookStore } from "../contexts/notebook";

const Home = () => {
  /** Accesses dark mode state provided globally by the main layout shell */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const navigate = useNavigate();

  /** Connects to our central notebook data store and data loader methods */
  const { notebooks, initializeData } = useNotebookStore();

  // ==========================================
  // LIFECYCLE: DATA REPOSITORY INITIALIZER
  // ==========================================
  /**
   * Automatically initializes and refreshes notebook data on component mount
   * to ensure local files stay perfectly synced with the repository view.
   */
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div
      className={`p-8 w-full mb-10 min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* ==========================================
          HEADER SECTION (TITLE & ACTION CONTROL)
          ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-8 border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Workspace Repository
          </h1>
          <p
            className={`text-sm mt-1 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Local-first database workspace manager
          </p>
        </div>

        {/* ACTION TRIGGER: SPAWN BLANK NEW LOGICAL NOTE ELEMENT */}
        <button
          className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 shadow-md transition-all"
          onClick={() => navigate(`document/${uuidv4()}`)}
        >
          Create New Note
        </button>
      </div>

      {/* ==========================================
          WORKSPACE GRID LAYER (NOTEBOOK REPOSITORY)
          ========================================== */}
      {/* ========================================================= */}
      {/* PINTEREST MASONRY WRAPPER */}
      {/* ========================================================= */}
      <div className="columns-4 gap-6 p-6 w-full space-y-6 select-none">
        {notebooks.map((notebook) => {
          const totalPages = notebook.sections.reduce(
            (acc, s) => acc + s.pages.length,
            0,
          );
          const sectionCount = notebook.sections.length;

          return (
            <div
              key={notebook.id}
              onClick={() => navigate(`document/${notebook.id}`)}
              /* break-inside-avoid-column prevents the notebook from snapping in half between columns */
              className="break-inside-avoid-column relative group/notebook w-full inline-block cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:rotate-[0.5deg]"
              style={{ perspective: "1000px" }}
            >
              {/* ========================================================= */}
              {/* 1. EXPOSED STACKED PAPER SHEETS */}
              {/* ========================================================= */}
              <div
                className={`absolute inset-y-1 right-px left-3.75 rounded-r-md border-y border-r z-0 transition-transform duration-300 group-hover/notebook:translate-x-0.5
          ${darkMode ? "bg-zinc-800 border-zinc-700/60 shadow-[inset_-3px_0_6px_rgba(0,0,0,0.3)]" : "bg-zinc-50 border-zinc-200 shadow-[inset_-3px_0_4px_rgba(0,0,0,0.05)]"}`}
              >
                <div
                  className={`absolute right-0.75 inset-y-0 w-px ${darkMode ? "bg-zinc-700/40" : "bg-zinc-200"}`}
                />
                <div
                  className={`absolute right-1.25 inset-y-0 w-px ${darkMode ? "bg-zinc-700/20" : "bg-zinc-300/60"}`}
                />
              </div>

              {/* ========================================================= */}
              {/* 2. FRONT HARDCOVER ASSEMBLY */}
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

                {/* B. THE ELASTIC CLOSURE STRAP */}
                <div
                  className={`absolute right-4 inset-y-0 w-2 z-20 opacity-85 transition-all duration-300 group-hover/notebook:right-3.5
            ${darkMode ? "bg-zinc-800 border-x border-zinc-700/40" : "bg-zinc-200 border-x border-zinc-300/80"}`}
                />

                {/* C. COVER TYPOGRAPHY AREA (Grows cleanly without breaking card geometry) */}
                <div className="flex flex-col justify-between p-4 pr-7 w-full relative z-10 gap-6">
                  <div className="space-y-1">
                    {/* Note: line-clamp is removed here so long titles can naturally stretch the book height downward */}
                    <h2
                      className={`text-lg font-bold tracking-tight leading-snug transition-colors duration-200
                ${darkMode ? "text-zinc-200 group-hover/notebook:text-white" : "text-zinc-800 group-hover/notebook:text-black"}`}
                    >
                      {notebook.title}
                    </h2>
                    <p
                      className={`text-[12px] font-semibold tracking-wide font-mono opacity-40 ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
                    >
                      {sectionCount} {sectionCount === 1 ? "sec" : "secs"}
                    </p>
                  </div>

                  {/* D. RIBBON TAB MARKERS & METALLIC PAGE BADGE */}
                  <div className="flex items-center justify-between gap-1.5 mt-auto">
                    <div className="flex items-center gap-0.5 flex-1 max-w-11.25">
                      {notebook.sections.map((section) => (
                        <div
                          key={section.id}
                          title={section.title}
                          className="h-1 rounded-full flex-1 max-w-2 opacity-85 transition-transform duration-200 group-hover/notebook:scale-y-110"
                          style={{ backgroundColor: section.colorHex }}
                        />
                      ))}
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
        })}
      </div>
    </div>
  );
};

export default Home;
