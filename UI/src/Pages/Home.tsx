/**
 * @file Home.tsx
 * @component Home
 * @description Workspace dashboard. Lists all notebooks in a masonry grid.
 */

import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { motion } from "motion/react"; // ⚡ Imported motion
import Notebooks from "../components/Notebooks";
import { useWorkspaceStore } from "../Store/store";
import Folders from "../components/Folders";
import Codes from "../components/Codes";

// Reusable animation props for the grids
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const Home = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const navigate = useNavigate();

  const notebooks = useWorkspaceStore((s) => s.notebooks);
  const folders = useWorkspaceStore((s) => s.folders);
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);
  const initializeData = useWorkspaceStore((s) => s.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div
      className={`p-8 w-full mb-10 min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* HEADER */}
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
          className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 shadow-md transition-all active:scale-95"
          onClick={() => navigate(`document/${uuidv4()}`)}
        >
          Create New Note
        </button>
      </div>

      {/* ==========================================
          NOTEBOOK GRID
          ========================================== */}
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4 ml-6">
        Notebooks
      </h2>
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-row flex-wrap gap-6 p-6 w-full select-none"
      >
        {notebooks.slice(0, 5).map((notebook) => (
          // ⚡ The `layout` prop tells Framer Motion to smoothly animate
          // the X/Y position when the window resizes or items wrap.
          <motion.div layout key={notebook.id}>
            <Notebooks
              notebook={notebook}
              darkMode={darkMode}
              totalPages={notebook.pages.length}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* ==========================================
          CODE-FILES GRID
          ========================================== */}
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4 ml-6 mt-8">
        Code Problems
      </h2>
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-row flex-wrap gap-6 p-6 w-full select-none"
      >
        {codeFiles.slice(0, 5).map((code) => (
          <motion.div layout key={code.title}>
            <Codes darkMode={darkMode} codeFile={code} />
          </motion.div>
        ))}
      </motion.div>

      {/* ==========================================
          FOLDER GRID
          ========================================== */}
      <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-4 ml-6 mt-8">
        Folders
      </h2>
      <motion.div
        layout
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-row flex-wrap gap-6 p-6 w-full select-none"
      >
        {folders.slice(0, 5).map((folder) => (
          <motion.div layout key={folder.title}>
            <Folders darkMode={darkMode} folder={folder} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
