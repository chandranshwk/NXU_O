import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettings } from "../contexts/settingsContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotebookStore } from "../contexts/notebook";
import { useEffect, useRef, useState, useMemo } from "react";
import { FiFileText } from "react-icons/fi";
import { TitleBarCentral } from "./TitleBar.central";
import type { SearchItems } from "./SearchDrop";
import TitleBarControl from "./TitleBar.controls";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { darkMode } = useSettings();

  const location = useLocation();
  const navigate = useNavigate();
  const { notebooks } = useNotebookStore();

  const isDocumentRoute = location.pathname.startsWith("/document");

  const getTitleText = (pathname: string): string => {
    if (pathname === "/") return "Home Panel";
    const parts = pathname.split("/");
    const rawPath = parts[1] !== "document" ? parts[1] : parts[2];
    if (!rawPath) return "Home Panel";

    const formattedPath = rawPath.charAt(0).toUpperCase() + rawPath.slice(1);

    if (pathname.startsWith("/document/")) {
      const docId = parts[2];
      const docTitle = notebooks.find(
        (notebook) => notebook.id === docId,
      )?.title;
      return docTitle && docTitle !== "" ? `${docTitle}` : "Untitled Notebook";
    }

    switch (formattedPath.toLowerCase()) {
      case "settings":
        return "Settings Panel";
      case "graph":
        return "Graph View";
      case "scratchpad":
        return "Scratchpad Editor";
      default:
        return formattedPath;
    }
  };

  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictiveResults, setPredictiveResults] = useState<string>(" ");

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pages, setPages] = useState<SearchItems[]>([]);

  // Reset search state if user navigates away from documents
  useEffect(() => {
    if (!isDocumentRoute) {
      setTimeout(() => {
        setSearching(false);
        setSearchQuery("");
      }, 0);
    }
  }, [isDocumentRoute]);

  const currentNotebookId = (() => {
    const parts = location.pathname.split("/");
    return parts[1] === "document" ? parts[2] : null;
  })();
  useEffect(() => {
    if (!currentNotebookId) {
      setTimeout(() => {
        setPages([]);
      }, 0);
      return;
    }

    const notebook = notebooks.find((nb) => nb.id === currentNotebookId);
    if (!notebook) return;

    const flattenedPages =
      notebook.sections?.flatMap(
        (section) =>
          section.pages?.map((page) => ({
            id: `${notebook.id}-${section.id}-${page.id}`,
            name: page.title || "Untitled Page",
            icon: <FiFileText className="size-3.5 opacity-70" />,
            exec: () => {
              setSearching(false);
              setSearchQuery("");
            },
            description: `${section.title || "Untitled Section"}`,
          })) || [],
      ) || [];
    setTimeout(() => {
      setPages(flattenedPages);
    }, 0);
  }, [currentNotebookId, notebooks, navigate]);

  // 2. Compute filtered choices reactively using useMemo instead of a raw function call
  const searchItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (query === "") return pages;

    return pages.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );
  }, [searchQuery, pages]);

  // Wired input controls for arrow keys, escape, and autocomplete fill actions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearching(false);
      setSearchQuery("");
    } else if (e.key === "Tab") {
      if (searchQuery && predictiveResults.trim() !== "") {
        e.preventDefault();
        setSearchQuery((prev) => prev + predictiveResults);
        setPredictiveResults(" ");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % searchItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchItems.length > 0) {
        setActiveIndex(
          (prev) => (prev - 1 + searchItems.length) % searchItems.length,
        );
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchItems[activeIndex]) {
        searchItems[activeIndex].exec();
      }
    }
  };

  const handleCloseSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearching(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!searchItems || searchItems.length === 0 || !searchItems[activeIndex]) {
      setTimeout(() => {
        setPredictiveResults(" ");
      }, 0);
      return;
    }

    const currentItemName = searchItems[activeIndex].name;
    const currentQuery = searchQuery.toLowerCase().trim();

    if (currentQuery && currentItemName.toLowerCase().includes(currentQuery)) {
      const matchIndex = currentItemName.toLowerCase().indexOf(currentQuery);
      const predictiveSuggestion = currentItemName.slice(
        matchIndex + currentQuery.length,
      );
      setTimeout(() => {
        setPredictiveResults(predictiveSuggestion);
      }, 0);
    } else {
      setTimeout(() => {
        setPredictiveResults(" ");
      }, 0);
    }
  }, [searchItems, activeIndex, searchQuery]);

  return (
    <div
      data-tauri-drag-region
      className={`flex relative z-50 items-center justify-between w-full h-9 select-none transition-colors duration-200
        ${darkMode ? "bg-zinc-900 border-b border-zinc-800 text-zinc-400" : "bg-zinc-100 border-b border-zinc-300 text-zinc-600"}`}
    >
      {/* 1. Left Side: App Icon/Status */}
      <div className="flex items-center pl-3 gap-2 pointer-events-none">
        <img
          src="/icon-OXU_O.png"
          alt="Logo"
          className={`size-5 rounded-full border transition-transform duration-300 relative ${
            darkMode
              ? "border-slate-700 shadow-lg"
              : "border-slate-200 shadow-sm"
          }`}
        />
        <span
          className={`text-[10px] font-bold tracking-wider uppercase ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
        >
          NXU_0
        </span>
      </div>

      {/* 2. Center Component with All Required Parameters Injected */}
      <TitleBarCentral
        searching={searching}
        setSearching={setSearching}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        predictiveResults={predictiveResults}
        isDocumentRoute={isDocumentRoute}
        darkMode={darkMode}
        location={location}
        notebooks={notebooks}
        searchItems={searchItems}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        handleKeyDown={handleKeyDown}
        handleCloseSearch={handleCloseSearch}
        getTitleText={getTitleText}
        inputRef={inputRef}
      />

      {/* 3. Right Side: Window Controls */}

      <TitleBarControl appWindow={appWindow} darkMode={darkMode} />
    </div>
  );
}
