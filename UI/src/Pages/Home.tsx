/**
 * @file Home.tsx
 * @component Home
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Notebooks from "../components/Notebooks";
import { useWorkspaceStore } from "../Store/store";
import Folders from "../components/Folders";
import Codes from "../components/Codes";
import { BiChevronDown } from "react-icons/bi";
import { FiChevronDown, FiCode, FiFileText, FiFolder } from "react-icons/fi";

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

  const [expandedSection, setExpandedSection] = useState<
    ("Notebook" | "Code" | "Folders")[]
  >(["Folders"]);

  const toggleSection = (section: "Notebook" | "Code" | "Folders") => {
    setExpandedSection((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCreateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateNotebook = () => {
    const id = useWorkspaceStore.getState().addNotebook("Untitled Notebook");
    navigate(`document/${id}`);
    setIsCreateOpen(false);
  };

  const handleCreateFolder = () => {
    const id = useWorkspaceStore.getState().addFolder("Untitled Folder");
    navigate(`folder/${id}`);
    setIsCreateOpen(false);
  };

  const handleCreateCodeFile = () => {
    const slug = useWorkspaceStore.getState().addCodeFile("Untitled Problem");
    navigate(`code/${slug}`);
    setIsCreateOpen(false);
  };

  return (
    <div
      className={`p-8 w-full mb-10 min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
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

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCreateOpen((prev) => !prev)}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 shadow-md transition-all active:scale-95 flex items-center gap-2"
          >
            Create New
            <FiChevronDown
              size={16}
              className={`transition-transform duration-200 ${isCreateOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isCreateOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border py-1.5 z-50 overflow-hidden ${
                darkMode
                  ? "bg-zinc-900 border-zinc-700 text-zinc-200"
                  : "bg-white border-zinc-200 text-zinc-800"
              }`}
            >
              <button
                onClick={handleCreateNotebook}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                }`}
              >
                <FiFileText size={16} className="text-blue-500" />
                Notebook
              </button>

              <button
                onClick={handleCreateFolder}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                }`}
              >
                <FiFolder size={16} className="text-amber-500" />
                Folder
              </button>

              <button
                onClick={handleCreateCodeFile}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                  darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                }`}
              >
                <FiCode size={16} className="text-emerald-500" />
                Code Problem
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NOTEBOOK GRID */}
      <div className="flex items-center justify-between w-full mt-4 px-6 pr-18">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
          Notebooks
        </h2>
        <button
          onClick={() => toggleSection("Notebook")}
          type="button"
          className="flex items-center justify-center p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
        >
          <motion.div
            animate={{ rotate: expandedSection.includes("Notebook") ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <BiChevronDown size={20} />
          </motion.div>
        </button>
      </div>

      <motion.div
        layout
        className="flex flex-row flex-wrap gap-6 p-6 w-full select-none"
      >
        <AnimatePresence mode="popLayout">
          {notebooks
            .slice(
              0,
              expandedSection.includes("Notebook") ? notebooks.length : 5,
            )
            .map((notebook) => (
              <motion.div
                layout
                key={notebook.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.15 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Notebooks
                  notebook={notebook}
                  darkMode={darkMode}
                  totalPages={notebook.pages.length}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* CODE-FILES GRID */}
      <div className="flex items-center justify-between w-full mt-4 px-6 pr-18">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
          Code Problems
        </h2>
        <button
          onClick={() => toggleSection("Code")}
          type="button"
          className="flex items-center justify-center p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
        >
          <motion.div
            animate={{ rotate: expandedSection.includes("Code") ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <BiChevronDown size={20} />
          </motion.div>
        </button>
      </div>

      <motion.div
        layout
        className="flex flex-row flex-wrap gap-6 p-6 w-full select-none"
      >
        <AnimatePresence mode="popLayout">
          {codeFiles
            .slice(0, expandedSection.includes("Code") ? codeFiles.length : 5)
            .map((code) => (
              <motion.div
                layout
                //  FIXED: Use code.id instead of code.title
                key={code.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.15 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Codes darkMode={darkMode} codeFile={code} />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* FOLDER GRID */}
      <div className="flex items-center justify-between w-full mt-4 px-6 pr-18">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
          Folders
        </h2>
        <button
          onClick={() => toggleSection("Folders")}
          type="button"
          className="flex items-center justify-center p-1.5 rounded-md text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95"
        >
          <motion.div
            animate={{ rotate: expandedSection.includes("Folders") ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <BiChevronDown size={20} />
          </motion.div>
        </button>
      </div>

      <motion.div
        layout
        className="flex flex-row flex-wrap gap-6 p-6 w-full select-none"
      >
        <AnimatePresence mode="popLayout">
          {folders
            .slice(0, expandedSection.includes("Folders") ? folders.length : 4)
            .map((folder) => (
              <motion.div
                layout
                key={folder.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  transition: { duration: 0.15 },
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Folders darkMode={darkMode} folder={folder} />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Home;
