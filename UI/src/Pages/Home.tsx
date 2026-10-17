/**
 * @file Home.tsx
 * @component Home
 * @description Workspace dashboard. Lists all notebooks in a masonry grid.
 *
 * @architecture
 * - Connects to the local data store using `useNotebookStore`.
 * - Clicking a card deep-links into the notebook.
 */

import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useNotebookStore } from "../Store/store";
import Notebooks from "../components/Notebooks";

const Home = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const navigate = useNavigate();

  // Granular selectors — avoids re-render on every store mutation elsewhere.
  const notebooks = useNotebookStore((s) => s.notebooks);
  const initializeData = useNotebookStore((s) => s.initializeData);

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
          HEADER
          ========================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-8 border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Workspace Repository
          </h1>
          <p
            className={`text-sm mt-1 ${
              darkMode ? "text-zinc-400" : "text-gray-500"
            }`}
          >
            Local-first database workspace manager
          </p>
        </div>

        <button
          type="button"
          className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 shadow-md transition-all"
          onClick={() => navigate(`document/${uuidv4()}`)}
        >
          Create New Note
        </button>
      </div>

      {/* ==========================================
          NOTEBOOK GRID
          ========================================== */}
      <div className="flex flex-row flex-wrap gap-6 p-6 w-full select-none">
        {notebooks.map((notebook) => (
          <Notebooks
            key={notebook.id}
            notebook={notebook}
            darkMode={darkMode}
            totalPages={notebook.pages.length}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
