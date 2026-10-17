import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSettings } from "../contexts/settingsContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useNotebookStore } from "../Store/store";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FiFileText, FiSettings, FiExternalLink } from "react-icons/fi";
import { RiHomeLine } from "react-icons/ri";
import { LuNotepadText, LuCode } from "react-icons/lu";
import { GrNodes } from "react-icons/gr";
import { TitleBarCentral } from "./TitleBar.central";
import type { SearchItems } from "./SearchDrop";
import TitleBarControl from "./TitleBar.controls";
import type { MenuTab, AddAction } from "./TitleBar.WindowMenu";
import { settingsList } from "../Pages/Setting-Sections/settingsList";

const MAX_TABS = 8;

const PAGES = [
  { key: "/", icon: <RiHomeLine size={16} />, label: "Home", link: "/" },
  {
    key: "/scratchpad",
    icon: <LuNotepadText size={16} />,
    label: "Scratch Pad",
    link: "/scratchpad",
  },
  { key: "/ide", icon: <LuCode size={16} />, label: "Code IDE", link: "/ide" },
  {
    key: "/graph",
    icon: <GrNodes size={16} />,
    label: "Graph View",
    link: "/graph",
  },
  {
    key: "/settings",
    icon: <FiSettings size={15} />,
    label: "Settings",
    link: "/settings",
  },
] as const;

/**
 * The notebook store may not (yet) declare `addNotebook` in its type.
 * Rather than reaching for `any`, describe the shape we actually use.
 */
type NotebookStoreView = ReturnType<typeof useNotebookStore.getState> & {
  addNotebook?: (title: string) => { id: string } | undefined;
};

export function TitleBar() {
  const appWindow = getCurrentWindow();
  const { darkMode, searchQuery, setSearchQuery, searchingKeys } =
    useSettings();

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
      const docTitle = notebooks.find((n) => n.id === docId)?.title;
      return docTitle && docTitle !== "" ? docTitle : "Untitled Notebook";
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
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const currentNotebookId = useMemo(() => {
    const parts = location.pathname.split("/");
    return parts[1] === "document" ? parts[2] : null;
  }, [location.pathname]);

  // ── Tabs ──────────────────────────────────────────────────
  const [tabs, setTabs] = useState<MenuTab[]>([
    { id: "/", title: "Home", icon: PAGES[0].icon },
  ]);

  const addTab = useCallback((tab: MenuTab) => {
    setTabs((prev) =>
      prev.some((t) => t.id === tab.id) || prev.length >= MAX_TABS
        ? prev
        : [...prev, tab],
    );
  }, []);

  const addCustomTab = useCallback(
    (label: string, destination: string) => {
      addTab({
        id: `custom:${destination}`,
        title: label,
        icon: <FiExternalLink size={15} />,
      });
    },
    [addTab],
  );

  const closeTab = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (id.startsWith("doc:")) {
      if (currentNotebookId === id.slice(4)) navigate("/");
    } else if (id === location.pathname) {
      navigate("/");
    }
  };

  const navigateToTab = useCallback(
    (id: string) => {
      if (id.startsWith("doc:")) {
        navigate(`/document/${id.slice(4)}`);
        return;
      }
      if (id.startsWith("custom:")) {
        const dest = id.slice(7);
        if (/^https?:\/\//i.test(dest)) {
          window.open(dest, "_blank", "noopener,noreferrer");
          return;
        }
        navigate(dest);
        return;
      }
      navigate(id);
    },
    [navigate],
  );

  // ── Create actions ────────────────────────────────────────
  const atLimit = tabs.length >= MAX_TABS;
  const limitHint = atLimit ? "Full" : undefined;

  const createActions: AddAction[] = useMemo(
    () => [
      {
        id: "new-document",
        label: "New Document",
        icon: <FiFileText size={15} />,
        hint: limitHint,
        disabled: atLimit,
        onClick: () => {
          const store = useNotebookStore.getState() as NotebookStoreView;
          const created = store.addNotebook?.("Untitled Notebook");
          const id = created?.id ?? store.activeNotebook?.id;
          if (id) {
            addTab({
              id: `doc:${id}`,
              title: "Untitled Notebook",
              icon: <FiFileText size={15} />,
            });
          }
        },
      },
      {
        id: "new-note",
        label: "New Note",
        icon: <LuNotepadText size={15} />,
        hint: limitHint,
        disabled: atLimit,
        onClick: () => {
          addTab({
            id: "/scratchpad",
            title: "New Note",
            icon: <LuNotepadText size={15} />,
          });
        },
      },
      {
        id: "new-code",
        label: "New Code File",
        icon: <LuCode size={15} />,
        hint: limitHint,
        disabled: atLimit,
        onClick: () => {
          addTab({
            id: "/ide",
            title: "New Code File",
            icon: <LuCode size={15} />,
          });
        },
      },
    ],
    [atLimit, limitHint, addTab],
  );

  const pageLinks: AddAction[] = useMemo(
    () =>
      PAGES.map((p) => ({
        id: p.key,
        label: p.label,
        icon: p.icon,
        disabled: atLimit && !tabs.some((t) => t.id === p.key),
        hint: atLimit && !tabs.some((t) => t.id === p.key) ? "Full" : undefined,
        onClick: () => {
          addTab({ id: p.key, title: p.label, icon: p.icon });
        },
      })),
    [atLimit, tabs, addTab],
  );

  // ── Search index ──────────────────────────────────────────
  // Derived from stores via useMemo instead of mirrored into state
  // via an effect. No cascading renders, no stale reads.

  const notes = useMemo<SearchItems[]>(
    () =>
      notebooks.map((note) => ({
        id: `${note.id}`,
        name: note.title || "Untitled Page",
        icon: <FiFileText className="size-3.5 opacity-70" />,
        exec: () => {
          setSearching(false);
          setSearchQuery("");
          navigate(`/document/${note.id}`);
        },
        description: note.title || "Untitled Notebook",
      })),
    [notebooks, navigate, setSearchQuery],
  );

  const setting = useMemo<SearchItems[]>(
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

  const searchItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filter = (items: SearchItems[]) =>
      query === ""
        ? items
        : items.filter(
            (item) =>
              item.name.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query),
          );

    if (location.pathname.startsWith("/document")) return filter(pages);
    if (location.pathname.startsWith("/settings")) return filter(setting);
    if (location.pathname.startsWith("/")) return filter(notes);
    return [];
  }, [searchQuery, pages, location.pathname, notes, setting]);

  // Derived — no state, no effect.
  const predictiveResults = useMemo(() => {
    if (searchItems.length === 0 || !searchItems[activeIndex]) return "";
    const currentItemName = searchItems[activeIndex].name;
    const currentQuery = searchQuery.toLowerCase().trim();
    if (currentQuery && currentItemName.toLowerCase().includes(currentQuery)) {
      const matchIndex = currentItemName.toLowerCase().indexOf(currentQuery);
      return currentItemName.slice(matchIndex + currentQuery.length);
    }
    return "";
  }, [searchItems, activeIndex, searchQuery]);

  // Reset search UI when we navigate off a searchable route.
  // This is a legitimate synchronization with an external value
  // (the URL) — the setStates are conditional on route change and
  // there is no cleaner derivation available because the query lives
  // in a context we don't own.
  useEffect(() => {
    if (!isShowRoute) {
      setTimeout(() => {
        setSearching(false);
        setSearchQuery("");
      }, 0);
    }
  }, [isShowRoute, setSearchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearching(false);
      setSearchQuery("");
    } else if (e.key === "Tab") {
      if (searchQuery && predictiveResults.trim() !== "") {
        e.preventDefault();
        // predictiveResults is derived; recomputing on next render
        // naturally clears the stale suggestion.
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

  return (
    <div
      data-tauri-drag-region
      className={`flex fixed top-0 right-0 z-999 items-center justify-between w-full h-9 select-none transition-colors duration-200
        ${
          darkMode
            ? "bg-zinc-900 border-b border-zinc-800 text-zinc-400"
            : "bg-zinc-100 border-b border-zinc-300 text-zinc-600"
        }`}
    >
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
          className={`text-[10px] font-bold tracking-wider uppercase ${
            darkMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          NXU_0
        </span>
      </div>

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

      <TitleBarControl
        appWindow={appWindow}
        darkMode={darkMode}
        tabs={tabs}
        maxTabs={MAX_TABS}
        createActions={createActions}
        pageLinks={pageLinks}
        onSelectTab={navigateToTab}
        onCloseTab={closeTab}
        onAddCustomTab={addCustomTab}
      />
    </div>
  );
}
