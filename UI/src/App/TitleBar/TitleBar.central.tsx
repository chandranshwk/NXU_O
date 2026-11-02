// TitleBar.central.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import SearchDrop, { type SearchItems } from "./SearchDrop";
import ShortcutChip from "../../components/UI/ShortcutChip";
import { useWorkspaceStore } from "../../Store/store";

interface TitleBarCentralProps {
  searching: boolean;
  setSearching: (searching: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  predictiveResults: string;
  isShowRoute: boolean;
  darkMode: boolean;
  location: { pathname: string };
  notebooks: Array<{ id: string; title: string }>;
  searchItems: SearchItems[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCloseSearch: (e: React.MouseEvent) => void;
  getTitleText: (pathname: string) => string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const TitleBarCentral: React.FC<TitleBarCentralProps> = ({
  searching,
  setSearching,
  searchQuery,
  setSearchQuery,
  predictiveResults,
  isShowRoute,
  darkMode,
  location,
  notebooks,
  searchItems,
  activeIndex,
  setActiveIndex,
  handleKeyDown,
  handleCloseSearch,
  getTitleText,
  inputRef,
}) => {
  // Subscribe to the isDirty flag
  const isDirty = useWorkspaceStore((s) => s.isDirty);
  const isCodeDirty = useWorkspaceStore((s) => s.isCodeDirty);

  return (
    <motion.div
      data-tour="titlebar-search"
      layout
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`text-xs font-semibold tracking-wide h-7 flex items-center p-1.5 px-4 rounded-lg select-none relative ${
        isShowRoute
          ? searching
            ? "w-[40%] max-w-100 cursor-text " +
              (darkMode
                ? "bg-zinc-800 text-zinc-200"
                : "bg-zinc-200/80 text-zinc-800")
            : "w-auto min-w-50 justify-center cursor-pointer " +
              (darkMode
                ? "text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800"
                : "text-zinc-700 bg-zinc-200/50 hover:bg-zinc-200")
          : "w-auto justify-center cursor-default text-zinc-500 bg-transparent"
      }`}
    >
      <AnimatePresence mode="wait">
        {!searching ? (
          <motion.div
            key="display-mode"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (isShowRoute) setSearching(true);
            }}
            className="flex items-center justify-center gap-2 w-full whitespace-nowrap"
          >
            {isShowRoute && (
              <FiSearch className="text-sm opacity-70 shrink-0" />
            )}
            <span className="truncate">{getTitleText(location.pathname)}</span>
            <span className="opacity-30 shrink-0">—</span>
            <span
              className={`font-mono text-[10px] tracking-normal shrink-0 ${
                (location.pathname.startsWith("/document/") ||
                  location.pathname.startsWith("/code/")) &&
                (isDirty || isCodeDirty)
                  ? "text-amber-500 font-bold"
                  : "opacity-50"
              }`}
            >
              {location.pathname.startsWith("/document/") ||
              location.pathname.startsWith("/code/")
                ? isDirty || isCodeDirty
                  ? "Unsaved Changes"
                  : "Saved"
                : "NXU_0"}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="search-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <FiSearch className="text-sm opacity-50 shrink-0" />

            <div
              className="relative flex-1 h-full flex items-center"
              data-search-area
            >
              <input
                ref={(el) => {
                  if (inputRef) inputRef.current = el;
                  if (el) {
                    requestAnimationFrame(() => {
                      el.focus();
                    });
                  }
                }}
                type="text"
                placeholder={`Search ${notebooks.find((notebook) => notebook.id === location.pathname.split("/")[2])?.title || location.pathname.startsWith("/settings") ? "Settings" : "everything"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-xs z-10 relative ${
                  darkMode
                    ? "text-zinc-200 placeholder-zinc-500"
                    : "text-zinc-800 placeholder-zinc-400"
                }`}
              />

              {searchQuery && predictiveResults && (
                <div
                  className="absolute left-0 pointer-events-none text-xs font-normal select-none flex whitespace-pre"
                  style={{ padding: 0 }}
                >
                  <span className="opacity-0">{searchQuery}</span>
                  <span
                    className={`opacity-35 select-none ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
                  >
                    {predictiveResults}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleCloseSearch}
              className={`p-0.5 rounded-md transition-colors ${darkMode ? "hover:bg-zinc-700 text-zinc-400" : "hover:bg-zinc-300 text-zinc-600"}`}
            >
              <MdClose className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isShowRoute && (
        <ShortcutChip
          hotkey="search"
          label="Press"
          title="Search within this page"
          darkMode={darkMode}
          className="ml-2 shrink-0"
        />
      )}

      <AnimatePresence>
        {searching && isShowRoute && (
          <SearchDrop
            searchItems={searchItems}
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
