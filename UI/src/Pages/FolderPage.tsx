/**
 * @file Folder.tsx
 * @component Folder
 * @description Folder interior view. Shows all notebooks and code files
 * grouped by type. Reads the folder id from the URL (`/folder/:id`).
 */

import { useEffect } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { FiArrowLeft, FiBook, FiFolder } from "react-icons/fi";
import { FaFileCode } from "react-icons/fa";
import { useWorkspaceStore } from "../Store/store";
import type { Folder, MockNotebook } from "../assets/SAMPLE";
import type { CodeFile } from "./CodeIDE.SAMPLE";

// ── Type guards ───────────────────────────────────────────────────
const isNotebook = (item: CodeFile | MockNotebook): item is MockNotebook =>
  "pages" in item && "events" in item;

const isCodeFile = (item: CodeFile | MockNotebook): item is CodeFile =>
  "titleSlug" in item && "examples" in item;

// ── Component ────────────────────────────────────────────────────
const FolderContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const folders = useWorkspaceStore((s) => s.folders);
  const initializeData = useWorkspaceStore((s) => s.initializeData);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const folder: Folder | undefined = folders.find((f) => f.id === id);

  if (!folder) {
    return (
      <div
        className={`h-screen w-full flex flex-col items-center justify-center gap-3 ${
          darkMode ? "bg-[#191919] text-zinc-500" : "bg-white text-zinc-500"
        }`}
      >
        <FiFolder size={32} />
        <span className="text-sm font-medium">Locating folder…</span>
      </div>
    );
  }

  const notebooks = folder.content.filter(isNotebook);
  const codeFiles = folder.content.filter(isCodeFile);

  return (
    <div
      className={`h-screen w-full overflow-y-auto font-sans ${
        darkMode ? "bg-[#191919] text-zinc-200" : "bg-white text-zinc-900"
      }`}
    >
      {/* ── Top Navigation / Breadcrumb ────────────────────────── */}
      <div className="max-w-4xl mx-auto w-full px-12 pt-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-colors ${
            darkMode
              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <FiArrowLeft size={14} />
          Folders
        </button>
      </div>

      {/* ── Header (Icon, Title, Description) ─────────────────── */}
      <header className="max-w-4xl mx-auto w-full px-12 pt-6 pb-12">
        <div
          className="text-6xl mb-4 select-none"
          style={{ color: folder.color }}
        >
          <FiFolder strokeWidth={1.5} />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {folder.title}
        </h1>

        <p
          className={`text-[15px] leading-relaxed mb-4 ${
            darkMode ? "text-zinc-400" : "text-zinc-600"
          }`}
        >
          {folder.description}
        </p>

        <div
          className={`text-xs flex items-center gap-2 ${
            darkMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          <span>{folder.content.length} items</span>
          <span>•</span>
          <span>Updated {folder.lastUpdatedDate}</span>
        </div>
      </header>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto w-full px-12 pb-32 space-y-10">
        {folder.content.length === 0 && (
          <div
            className={`py-10 text-sm ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            This folder is empty.
          </div>
        )}

        {/* ── Notebooks ─────────────────────────────────────── */}
        {notebooks.length > 0 && (
          <section>
            <h2
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                darkMode ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              Notebooks
            </h2>

            <div className="flex flex-col">
              {notebooks.map((nb) => (
                <button
                  key={nb.id}
                  type="button"
                  onClick={() => navigate(`/document/${nb.id}`)}
                  className={`group flex items-center justify-between py-2.5 px-2 -mx-2 rounded-md transition-colors ${
                    darkMode ? "hover:bg-zinc-800/50" : "hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FiBook
                      size={18}
                      className={darkMode ? "text-zinc-400" : "text-zinc-500"}
                    />
                    <h3 className="text-[15px] font-medium truncate">
                      {nb.title}
                    </h3>
                  </div>
                  <p
                    className={`text-[13px] opacity-0 group-hover:opacity-100 transition-opacity ${
                      darkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {nb.pages.length} {nb.pages.length === 1 ? "page" : "pages"}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Code files ────────────────────────────────────── */}
        {codeFiles.length > 0 && (
          <section>
            <h2
              className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                darkMode ? "text-zinc-500" : "text-zinc-500"
              }`}
            >
              Problems
            </h2>

            <div className="flex flex-col">
              {codeFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => navigate(`/code/${file.titleSlug}`)}
                  className={`group flex items-center justify-between py-2.5 px-2 -mx-2 rounded-md transition-colors ${
                    darkMode ? "hover:bg-zinc-800/50" : "hover:bg-zinc-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FaFileCode
                      size={16}
                      className={darkMode ? "text-zinc-400" : "text-zinc-500"}
                    />
                    <h3 className="text-[15px] font-medium truncate">
                      {file.title}
                    </h3>
                  </div>

                  <div
                    className={`flex items-center gap-3 text-[13px] opacity-0 group-hover:opacity-100 transition-opacity ${
                      darkMode ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        file.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : file.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {file.difficulty}
                    </span>
                    <span className="truncate w-24 text-right">
                      {file.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const FolderPage = () => <FolderContent />;

export default FolderPage;
