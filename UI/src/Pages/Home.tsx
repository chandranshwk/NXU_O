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
import type { MockSection } from "../assets/SAMPLE";
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
      className={`p-8 w-full min-h-screen transition-colors duration-200 ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            onClick={() => navigate(`document/${notebook.id}`)}
            className={`border rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:border-blue-500/50 ${
              darkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Card Metadata Header Block */}
            <div className="mb-4">
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Notebook
              </span>
              <h2 className="text-xl font-bold mt-1.5">{notebook.title}</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {notebook.id}
              </p>
            </div>

            {/* Embedded Structural Nested Sections Stream */}
            <div className="flex flex-col gap-4 mt-2">
              {notebook.sections.map((section: MockSection) => (
                <div
                  key={section.id}
                  className="border-l-2 pl-4 py-1"
                  style={{ borderLeftColor: section.colorHex }}
                >
                  {/* Section Title Header Badge */}
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: section.colorHex }}
                    />
                  </div>

                  {/* Section Child Pages List Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {section.pages.map((page) => (
                      <div
                        key={page.id}
                        onClick={(e) => {
                          // Prevent parent card clicks from launching notebook navigation shortcuts
                          e.stopPropagation();
                          navigate(`document/${notebook.id}?page=${page.id}`);
                        }}
                        className={`text-xs p-2 rounded border cursor-pointer font-medium transition-all truncate ${
                          darkMode
                            ? "bg-zinc-850 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            : "bg-gray-50 border-gray-150 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {String(page.title)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
