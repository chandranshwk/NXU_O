import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettings } from "../contexts/settingsContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotebookStore } from "../contexts/notebook";
import { useEffect, useRef, useState, useMemo } from "react";
import { FiFileText } from "react-icons/fi";
import { TitleBarCentral } from "./TitleBar.central";
import type { SearchItems } from "./SearchDrop";
import TitleBarControl from "./TitleBar.controls";
import { settingsList } from "../Pages/Setting-Sections/settingsList";

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { darkMode } = useSettings();

  const location = useLocation();
  const navigate = useNavigate();
  const { notebooks } = useNotebookStore();

  const isShowRoute =
    location.pathname.startsWith("/document") ||
    location.pathname.startsWith("/") ||
    location.pathname.startsWith("/settings");

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

  const [searching, setSearching] = useState<boolean>(false);
  const { searchQuery, setSearchQuery } = useSettings();
  const [predictiveResults, setPredictiveResults] = useState<string>(" ");

  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pages, setPages] = useState<SearchItems[]>([]);
  const [notes, setNotes] = useState<SearchItems[]>([]);
  const [setting, setSetting] = useState<SearchItems[]>([]);

  // Reset search state if user navigates away from documents
  useEffect(() => {
    if (!isShowRoute) {
      setTimeout(() => {
        setSearching(false);
        setSearchQuery("");
      }, 0);
    }
  }, [isShowRoute, setSearchQuery]);

  const currentNotebookId = (() => {
    const parts = location.pathname.split("/");
    return parts[1] === "document" ? parts[2] : null;
  })();
  useEffect(() => {
    const flattenedNotes = notebooks.flatMap((note) => ({
      id: `${note.id}`,
      name: note.title || "Untitled Page",
      icon: <FiFileText className="size-3.5 opacity-70" />,
      exec: () => {
        setSearching(false);
        setSearchQuery("");
        navigate(`/document/${note.id}`);
      },
      description: `${note.title || "Untitled Notebook"}`,
    }));

    setTimeout(() => {
      setNotes(flattenedNotes);
    }, 0);

    const flattenedSettings = settingsList.flatMap((setting) => ({
      id: `${setting.name} Settings`,
      name: setting.name || "Does not exist",
      icon: <FiFileText className="size-3.5 opacity-70" />,
      exec: () => {
        setSearching(false);
        setSearchQuery(setting.name);
        const elementId = setting.name.toLowerCase().replace(/\s+/g, "-");

        const targetElement = document.getElementById(elementId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth", // Smooth scrolling animation
            block: "center", // Centers the element in the viewport
          });
        }

        setTimeout(() => {
          setSearchQuery("");
        }, 1000);
      },
      description: `${setting.description || "Untitled Notebook"}`,
    }));

    setTimeout(() => {
      setSetting(flattenedSettings);
    }, 0);

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
              navigate(`/document/${notebook.id}?page=${page.id}`);
            },
            description: `${section.title || "Untitled Section"}`,
          })) || [],
      ) || [];
    setTimeout(() => {
      setPages(flattenedPages);
    }, 0);
  }, [currentNotebookId, notebooks, navigate, setSearchQuery]);

  // 2. Compute filtered choices reactively using useMemo instead of a raw function call
  const searchItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (location.pathname.startsWith("/document")) {
      if (query === "") return pages;
      return pages.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    } else if (location.pathname.startsWith("/settings")) {
      if (query === "") return setting;

      return setting.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    } else if (location.pathname.startsWith("/")) {
      if (query === "") return notes;

      return notes.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      );
    } else return [];
  }, [searchQuery, pages, location.pathname, notes, setting]);

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
  const settings = useSettings();
  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      // 1. Break down the shortcut string (e.g., "mod-k") into individual tokens
      const dynamicKeys = settings.searchingKeys.toLowerCase().split("-");

      // 2. Check which modifier keys are required by the shortcut config
      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      // 3. Find the actual text/character key in the array
      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      // 4. Check if the pressed keys match the required hardware modifiers
      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;

      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      // 5. Open or close the command bar if all keys match perfectly
      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault(); // Prevents default browser actions
        setSearching((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);

    // Clean up the event listener on unmount to avoid memory leaks
    return () => window.removeEventListener("keydown", handleCommands);
  }, [searching, settings.searchingKeys]);

  return (
    <div
      data-tauri-drag-region
      className={`flex fixed top-0 right-0 z-999 items-center justify-between w-full h-9 select-none transition-colors duration-200
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
        isShowRoute={isShowRoute}
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
