// TitleBar.central.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import SearchDrop, { type SearchItems } from "./SearchDrop"; // Adjust path to match your folder tree
import type { MockSection } from "../assets/SAMPLE";

// Explicitly define your separated central search bar properties interface
interface TitleBarCentralProps {
  searching: boolean;
  setSearching: (searching: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  predictiveResults: string;
  isDocumentRoute: boolean;
  darkMode: boolean;
  location: { pathname: string };
  notebooks: Array<{ id: string; title: string; sections: MockSection[] }>;
  searchItems: SearchItems[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCloseSearch: (e: React.MouseEvent) => void;
  getTitleText: (pathname: string) => string;
  inputRef: React.RefObject<HTMLInputElement | null>; // Received from parent container
}

export const TitleBarCentral: React.FC<TitleBarCentralProps> = ({
  searching,
  setSearching,
  searchQuery,
  setSearchQuery,
  predictiveResults,
  isDocumentRoute,
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
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`text-xs font-semibold tracking-wide h-7 flex items-center p-1.5 px-4 rounded-lg select-none relative ${
        isDocumentRoute
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
      onClick={() => {
        if (!searching && isDocumentRoute) setSearching(true);
      }}
    >
      {/* Input Field View State Transitions */}
      <AnimatePresence mode="wait">
        {!searching ? (
          <motion.div
            key="display-mode"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center gap-2 w-full whitespace-nowrap"
          >
            {isDocumentRoute && (
              <FiSearch className="text-sm opacity-70 shrink-0" />
            )}
            <span className="truncate">{getTitleText(location.pathname)}</span>
            <span className="opacity-30 shrink-0">—</span>
            <span className="opacity-50 font-mono text-[10px] tracking-normal shrink-0">
              {location.pathname.startsWith("/document/") ? "Saved" : "NXU_0"}
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

            <div className="relative flex-1 h-full flex items-center">
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
                placeholder={`Search ${notebooks.find((notebook) => notebook.id === location.pathname.split("/")[2])?.title || "everything"}...`}
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

      {/* Isolated Dropdown Animations to let spring mathematics execute cleanly */}
      <AnimatePresence>
        {searching && isDocumentRoute && (
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
