import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import {
  FiFolder,
  FiFile,
  FiChevronRight,
  FiHardDrive,
  FiX,
  FiLoader,
  FiCornerLeftUp,
  FiCheckCircle,
  FiFolderPlus,
  FiCheck,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";

interface DirEntry {
  name: string;
  path: string;
  is_dir: boolean;
}

interface FileExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (path: string) => void;
  darkMode: boolean;
}

export const FileExplorerModal: React.FC<FileExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectFolder,
  darkMode,
}) => {
  const [currentPath, setCurrentPath] = useState<string>("");
  const [items, setItems] = useState<DirEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string>("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // New Folder State
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [createError, setCreateError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchDir = async (path: string) => {
    setIsLoading(true);
    setSearchQuery(""); // Clear search when navigating
    try {
      const res = await invoke<DirEntry[]>("read_directory", { path });
      setItems(res);
      setSelectedPath(path);
    } catch (err) {
      console.error("Failed to read directory:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchDir(currentPath);
    setIsCreatingFolder(false);
    setCreateError("");
  }, [currentPath, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentPath("");
        setSelectedPath("");
        setSearchQuery("");
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isCreatingFolder && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCreatingFolder]);

  // Filter items based on search
  // MUST BE PLACED BEFORE THE `if (!isOpen)` RETURN TO AVOID HOOK ERRORS
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [items, searchQuery]);

  // NOW THIS EARLY RETURN IS SAFE
  if (!isOpen) return null;

  // Breadcrumbs logic
  const isWindows = currentPath.includes("\\");
  const separator = isWindows ? "\\" : "/";
  const parts = currentPath.split(/[/\\]/).filter(Boolean);

  const breadcrumbs = parts.map((part, idx) => {
    const isDrive = idx === 0 && part.endsWith(":");
    let pathSoFar = parts.slice(0, idx + 1).join(separator);
    if (isDrive) pathSoFar += separator;
    return { name: part, path: pathSoFar };
  });

  const handleGoUp = () => {
    if (!currentPath) return;
    const parentParts = parts.slice(0, -1);
    const parentPath =
      parentParts.join(separator) +
      (parentParts.length === 1 && parentParts[0].endsWith(":")
        ? separator
        : "");
    setCurrentPath(parentPath);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setIsCreatingFolder(false);
      return;
    }

    setCreateError("");
    try {
      await invoke("create_directory", {
        path: currentPath,
        name: newFolderName.trim(),
      });
      setNewFolderName("");
      setIsCreatingFolder(false);
      await fetchDir(currentPath);
    } catch (err: any) {
      // Show the error inline instead of an alert
      setCreateError(err.toString() || "Failed to create folder");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-4xl h-[650px] rounded-md border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          darkMode
            ? "bg-[#121214] border-zinc-800 text-zinc-200"
            : "bg-white border-zinc-200 text-zinc-800"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-b shrink-0 ${
            darkMode
              ? "border-zinc-800/80 bg-[#18181b]"
              : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FiHardDrive className="text-indigo-500" />
            Select Workspace Directory
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-zinc-800 text-zinc-400"
                : "hover:bg-zinc-200 text-zinc-500"
            }`}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className={`flex items-center gap-2 px-4 py-2 border-b shrink-0 ${
            darkMode
              ? "border-zinc-800/80 bg-[#151518]"
              : "border-zinc-200 bg-zinc-100"
          }`}
        >
          <button
            onClick={handleGoUp}
            disabled={!currentPath}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-30 ${
              darkMode
                ? "hover:bg-zinc-800 text-zinc-300"
                : "hover:bg-zinc-200 text-zinc-600"
            }`}
            title="Go Up"
          >
            <FiCornerLeftUp size={16} />
          </button>

          <div
            className={`flex items-center flex-1 overflow-x-auto custom-scrollbar whitespace-nowrap px-2 py-1.5 rounded border text-xs ${darkMode ? "bg-[#1a1a1c] border-zinc-800/80" : "bg-white border-zinc-200"}`}
          >
            <button
              onClick={() => setCurrentPath("")}
              className="hover:text-indigo-400 transition-colors px-1 font-medium flex items-center gap-1"
            >
              <FiHardDrive size={12} /> Root
            </button>
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                <FiChevronRight
                  className="opacity-40 mx-1 shrink-0"
                  size={12}
                />
                <button
                  onClick={() => setCurrentPath(bc.path)}
                  className={`px-1 transition-colors shrink-0 ${
                    idx === breadcrumbs.length - 1
                      ? "font-semibold text-indigo-500"
                      : "hover:text-indigo-400"
                  }`}
                >
                  {bc.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div
            className={`relative flex items-center px-2 py-1.5 rounded border w-48 transition-colors focus-within:border-indigo-500/50 ${darkMode ? "bg-[#1a1a1c] border-zinc-800/80 text-zinc-300" : "bg-white border-zinc-200 text-zinc-600"}`}
          >
            <FiSearch size={12} className="opacity-50 mr-1.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent outline-none text-xs w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="hover:text-rose-400 shrink-0"
              >
                <FiX size={12} />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setSearchQuery(""); // Clear search so new folder is visible
              setIsCreatingFolder(true);
              setCreateError("");
            }}
            disabled={isCreatingFolder}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors shrink-0 ${
              darkMode
                ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            <FiFolderPlus size={14} />
            New
          </button>
        </div>

        {/* Column Headers */}
        <div
          className={`grid grid-cols-[1fr_120px] px-5 py-2 border-b text-[10px] font-bold uppercase tracking-widest text-zinc-500 ${darkMode ? "border-zinc-800/50" : "border-zinc-200"}`}
        >
          <div>Name</div>
          <div>Type</div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-1 relative">
          {isCreatingFolder && (
            <div
              className={`grid grid-cols-[1fr_120px] px-5 py-2 items-center text-sm border-b ${darkMode ? "bg-indigo-500/5 border-zinc-800/50" : "bg-indigo-50/50 border-zinc-200"}`}
            >
              <div className="flex items-center gap-3 pr-2">
                <FiFolder size={18} className="text-indigo-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    setCreateError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateFolder();
                    if (e.key === "Escape") setIsCreatingFolder(false);
                  }}
                  placeholder="New folder name..."
                  className={`flex-1 bg-transparent outline-none border-b border-indigo-500/50 pb-0.5 text-sm ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}
                />
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleCreateFolder}
                  className="text-emerald-500 hover:text-emerald-400 p-1"
                >
                  <FiCheck size={16} />
                </button>
                <button
                  onClick={() => setIsCreatingFolder(false)}
                  className="text-rose-500 hover:text-rose-400 p-1"
                >
                  <FiX size={16} />
                </button>
              </div>
              {createError && (
                <div className="col-span-2 text-[10px] text-rose-500 flex items-center gap-1 mt-1">
                  <FiAlertCircle /> {createError}
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <FiLoader className="animate-spin text-indigo-500" size={24} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-sm italic">
              {searchQuery ? "No results found" : "Empty folder"}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.path}
                onClick={() => {
                  if (item.is_dir) setSelectedPath(item.path);
                }}
                onDoubleClick={() => {
                  if (item.is_dir) setCurrentPath(item.path);
                }}
                className={`grid grid-cols-[1fr_120px] px-5 py-2.5 items-center cursor-pointer text-sm transition-colors border-b border-transparent ${
                  selectedPath === item.path
                    ? darkMode
                      ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/20"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : darkMode
                      ? "hover:bg-zinc-800/50 text-zinc-300"
                      : "hover:bg-zinc-100 text-zinc-700"
                }`}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  {item.is_dir ? (
                    <FiFolder
                      size={18}
                      className={
                        selectedPath === item.path
                          ? "text-indigo-400 shrink-0"
                          : "text-zinc-400 shrink-0"
                      }
                    />
                  ) : (
                    <FiFile
                      size={18}
                      className="text-zinc-500 opacity-50 shrink-0"
                    />
                  )}
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono truncate">
                  {item.is_dir ? "Folder" : "File"}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t shrink-0 ${
            darkMode
              ? "border-zinc-800/80 bg-[#18181b]"
              : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 truncate max-w-[60%]">
            <FiCheckCircle className="text-emerald-500 shrink-0" />
            {selectedPath || "No folder selected"}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                darkMode
                  ? "hover:bg-zinc-800 text-zinc-400"
                  : "hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedPath) {
                  onSelectFolder(selectedPath);
                  onClose();
                }
              }}
              disabled={!selectedPath}
              className="px-5 py-1.5 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/20"
            >
              Select Folder
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
