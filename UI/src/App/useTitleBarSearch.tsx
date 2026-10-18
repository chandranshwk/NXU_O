import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { NavigateFunction } from "react-router-dom";
import { FiBook, FiCode, FiFileText, FiFolder } from "react-icons/fi";
import { settingsList } from "../Pages/Setting-Sections/settingsList";
import type { Folder, MockNotebook } from "../assets/SAMPLE";
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";
import type { SearchItems } from "./SearchDrop";
import {
  computePredictiveResult,
  filterByQuery,
  pickSearchScope,
  isNotebook,
  isCodeFile, // ⚡ Added isCodeFile import
} from "./titleBarUtils";

interface UseTitleBarSearchOptions {
  notebooks: MockNotebook[];
  folders: Folder[];
  codeFiles: CodeFile[];
  currentNotebookId: string | null;
  pathname: string;
  navigate: NavigateFunction;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchingKeys: string;
  isShowRoute: boolean;
}

interface UseTitleBarSearchResult {
  searching: boolean;
  setSearching: React.Dispatch<React.SetStateAction<boolean>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  inputRef: RefObject<HTMLInputElement | null>;
  searchItems: SearchItems[];
  predictiveResults: string;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleCloseSearch: (e: React.MouseEvent) => void;
}

export const useTitleBarSearch = ({
  notebooks,
  folders,
  codeFiles,
  currentNotebookId,
  pathname,
  navigate,
  searchQuery,
  setSearchQuery,
  searchingKeys,
  isShowRoute,
}: UseTitleBarSearchOptions): UseTitleBarSearchResult => {
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Index builders ───────────────────────────────────────────

  const homeItems = useMemo<SearchItems[]>(() => {
    const nbItems: SearchItems[] = notebooks.map((nb) => ({
      id: `home-nb:${nb.id}`,
      name: nb.title || "Untitled Notebook",
      icon: <FiBook className="size-3.5 opacity-70" />,
      exec: () => {
        setSearching(false);
        setSearchQuery("");
        navigate(`/document/${nb.id}`);
      },
      description: `Notebook · ${nb.pages.length} pages`,
    }));

    const folderItems: SearchItems[] = folders.map((f) => ({
      id: `home-folder:${f.id}`,
      name: f.title || "Untitled Folder",
      icon: <FiFolder className="size-3.5 opacity-70" />,
      exec: () => {
        setSearching(false);
        setSearchQuery("");
        navigate(`/folder/${f.id}`);
      },
      description: `Folder · ${f.content.length} items`,
    }));

    const codeItems: SearchItems[] = codeFiles.map((c) => ({
      id: `home-code:${c.id}`,
      name: c.title || "Untitled Problem",
      icon: <FiCode className="size-3.5 opacity-70" />,
      exec: () => {
        setSearching(false);
        setSearchQuery("");
        navigate(`/code/${c.titleSlug}`);
      },
      description: `Problem · ${c.difficulty} · ${c.category}`,
    }));

    // Extract all pages from all notebooks
    const globalPageItems: SearchItems[] = notebooks.flatMap((nb) =>
      nb.pages.map((pg) => ({
        id: `home-pg:${pg.id}`,
        name: pg.title || "Untitled Page",
        icon: <FiFileText className="size-3.5 opacity-70" />,
        exec: () => {
          setSearching(false);
          setSearchQuery("");
          navigate(`/document/${nb.id}?page=${pg.id}`);
        },
        description: `Page in ${nb.title}`,
      })),
    );

    return [...nbItems, ...folderItems, ...codeItems, ...globalPageItems];
  }, [notebooks, folders, codeFiles, navigate, setSearchQuery]);

  const settingsItems = useMemo<SearchItems[]>(
    () =>
      settingsList.map((s) => ({
        id: `${s.name} Settings`,
        name: s.name || "Does not exist",
        icon: <FiFileText className="size-3.5 opacity-70" />,
        exec: () => {
          setSearching(false);
          setSearchQuery(s.name);
          const elementId = s.name.toLowerCase().replace(/\s+/g, "-");
          const targetElement = document.getElementById(elementId);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
          window.setTimeout(() => setSearchQuery(""), 1000);
        },
        description: s.description || "Untitled Notebook",
      })),
    [setSearchQuery],
  );

  const pages = useMemo<SearchItems[]>(() => {
    if (!currentNotebookId) return [];
    const notebook = notebooks.find((nb) => nb.id === currentNotebookId);
    if (!notebook) return [];
    return (
      notebook.pages?.map((page) => ({
        id: `${page.id}`,
        name: page.title || "Untitled Page",
        icon: <FiFileText className="size-3.5 opacity-70" />,
        exec: () => {
          setSearching(false);
          setSearchQuery("");
          navigate(`/document/${notebook.id}?page=${page.id}`);
        },
        description: `${page.createdDate}`,
      })) ?? []
    );
  }, [currentNotebookId, notebooks, navigate, setSearchQuery]);

  const currentFolderId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[1] === "folder" ? parts[2] : null;
  }, [pathname]);

  const folderContents = useMemo<SearchItems[]>(() => {
    if (!currentFolderId) return [];
    const folder = folders.find((f) => f.id === currentFolderId);
    if (!folder) return [];

    return folder.content.map((item) => {
      if (isNotebook(item)) {
        return {
          id: `folder-nb:${item.id}`,
          name: item.title || "Untitled Notebook",
          icon: <FiBook className="size-3.5 opacity-70" />,
          exec: () => {
            setSearching(false);
            setSearchQuery("");
            navigate(`/document/${item.id}`);
          },
          description: `Notebook · ${item.pages.length} pages`,
        };
      } else if (isCodeFile(item)) {
        // ⚡ Added explicit check for CodeFile
        return {
          id: `folder-code:${item.id}`,
          name: item.title || "Untitled Problem",
          icon: <FiCode className="size-3.5 opacity-70" />,
          exec: () => {
            setSearching(false);
            setSearchQuery("");
            navigate(`/code/${item.titleSlug}`);
          },
          description: `Problem · ${item.difficulty} · ${item.category}`,
        };
      } else {
        // ⚡ Fallback for Folder
        return {
          id: `folder-folder:${item.id}`,
          name: item.title || "Untitled Folder",
          icon: <FiFolder className="size-3.5 opacity-70" />,
          exec: () => {
            setSearching(false);
            setSearchQuery("");
            navigate(`/folder/${item.id}`);
          },
          description: `Folder · ${item.content.length} items`,
        };
      }
    });
  }, [currentFolderId, folders, navigate, setSearchQuery]);

  // ── Derived search results ──────────────────────────────────
  const searchItems = useMemo<SearchItems[]>(() => {
    const scope = pickSearchScope(pathname);
    if (scope === "folder") return filterByQuery(folderContents, searchQuery);
    if (scope === "pages") return filterByQuery(pages, searchQuery);
    if (scope === "settings") return filterByQuery(settingsItems, searchQuery);
    if (scope === "notes")
      return filterByQuery(homeItems, searchQuery).slice(0, 30);
    return [];
  }, [pathname, folderContents, pages, settingsItems, homeItems, searchQuery]);

  const predictiveResults = useMemo(
    () => computePredictiveResult(searchItems, activeIndex, searchQuery),
    [searchItems, activeIndex, searchQuery],
  );

  // ── Handlers ────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearching(false);
      setSearchQuery("");
    } else if (e.key === "Tab") {
      if (searchQuery && predictiveResults.trim() !== "") {
        e.preventDefault();
        setSearchQuery((prev) => prev + predictiveResults);
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
      searchItems[activeIndex]?.exec();
    }
  };

  const handleCloseSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearching(false);
    setSearchQuery("");
  };

  // ── Route reset ─────────────────────────────────────────────
  useEffect(() => {
    if (!isShowRoute) {
      setTimeout(() => {
        setSearching(false);
        setSearchQuery("");
      }, 0);
    }
  }, [isShowRoute, setSearchQuery]);

  // ── Command shortcut ────────────────────────────────────────
  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      const dynamicKeys = searchingKeys.toLowerCase().split("-");

      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );
      if (!primaryKeyToken) return;

      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;
      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault();
        setSearching((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);
    return () => window.removeEventListener("keydown", handleCommands);
  }, [searchingKeys]);

  return {
    searching,
    setSearching,
    activeIndex,
    setActiveIndex,
    inputRef,
    searchItems,
    predictiveResults,
    handleKeyDown,
    handleCloseSearch,
  };
};
