import {
  getCurrentWindow,
  type Window as TauriWindow,
} from "@tauri-apps/api/window";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useSettings } from "../contexts/settingsContext";
import { useWorkspaceStore } from "../Store/store";
import { TitleBarCentral } from "./TitleBar.central";
import TitleBarControl from "./TitleBar.controls";
import { MAX_TABS, getTitleText } from "./titleBarUtils";
import { useTitleBarSearch } from "./useTitleBarSearch";
import { useTitleBarTabs } from "./useTitleBarTabs";
import { useNavigationHistory } from "./useNavigationHistory";
import { useRecentPages, type RecentPage } from "./useRecentPages";
import { RecentPagesDropdown, type RecentItem } from "./RecentPagesDropdown";
import type { MockNotebook, Folder } from "../assets/SAMPLE";

/** Build a human-readable label for a visited URL. */
const formatRecentItem = (
  page: RecentPage,
  notebooks: MockNotebook[],
  folders: Folder[],
): RecentItem => {
  const [path, query] = page.url.split("?");
  const segs = path.split("/").filter(Boolean);
  const params = new URLSearchParams(query ?? "");

  if (segs[0] === "document" && segs[1]) {
    const nb = notebooks.find((n) => n.id === segs[1]);
    const nbTitle = nb?.title || "Untitled Notebook";
    const pageId = params.get("page");
    if (pageId && nb) {
      const pg = nb.pages.find((p) => p.id === pageId);
      return {
        url: page.url,
        label: pg?.title || nbTitle,
        detail: "Page",
        visitedAt: page.visitedAt,
      };
    }
    return {
      url: page.url,
      label: nbTitle,
      detail: "Notebook",
      visitedAt: page.visitedAt,
    };
  }

  if (segs[0] === "folder" && segs[1]) {
    const f = folders.find((x) => x.id === segs[1]);
    return {
      url: page.url,
      label: f?.title || "Folder",
      detail: "Folder",
      visitedAt: page.visitedAt,
    };
  }

  const known: Record<string, string> = {
    settings: "Settings",
    ide: "Code IDE",
    scratchpad: "Scratchpad",
    graph: "Graph View",
  };

  if (segs.length === 0) {
    return { url: page.url, label: "Home", visitedAt: page.visitedAt };
  }

  if (known[segs[0]]) {
    return { url: page.url, label: known[segs[0]], visitedAt: page.visitedAt };
  }

  return {
    url: page.url,
    label: segs[segs.length - 1],
    detail: segs.slice(0, -1).join("/") || undefined,
    visitedAt: page.visitedAt,
  };
};

export function TitleBar() {
  const isTauri =
    typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

  const appWindow = isTauri
    ? getCurrentWindow()
    : ({
        minimize: () => console.log("Browser: minimize"),
        toggleMaximize: () => console.log("Browser: maximize"),
        close: () => console.log("Browser: close"),
        isMaximized: async () => false,
        onResized: () => Promise.resolve(() => {}),
      } as unknown as TauriWindow);
  const { darkMode, searchQuery, setSearchQuery, searchingKeys } =
    useSettings();

  const location = useLocation();
  const navigate = useNavigate();
  const notebooks = useWorkspaceStore((s) => s.notebooks);
  const folders = useWorkspaceStore((s) => s.folders);
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);

  const { canGoBack, canGoForward, goBack, goForward } = useNavigationHistory();

  //  Using the new cache hook
  const { recent, hasRecent, navigateTo, clear } = useRecentPages();
  const [recentOpen, setRecentOpen] = useState(false);

  const isShowRoute =
    location.pathname.startsWith("/document") ||
    location.pathname.startsWith("/folder") || // Added folder just in case
    location.pathname.startsWith("/") ||
    location.pathname.startsWith("/settings");

  const currentNotebookId = useMemo(() => {
    const parts = location.pathname.split("/");
    return parts[1] === "document" ? parts[2] : null;
  }, [location.pathname]);

  const getTitleTextBound = useCallback(
    (pathname: string) => getTitleText(pathname, notebooks, folders),
    [notebooks, folders],
  );

  const recentItems = useMemo(
    () => recent.map((p) => formatRecentItem(p, notebooks, folders)),
    [recent, notebooks, folders],
  );

  const search = useTitleBarSearch({
    notebooks,
    folders,
    codeFiles,
    currentNotebookId,
    pathname: location.pathname,
    navigate,
    searchQuery,
    setSearchQuery,
    searchingKeys,
    isShowRoute,
  });

  const tabsState = useTitleBarTabs({
    navigate,
    pathname: location.pathname,
    currentNotebookId,
  });

  return (
    <div
      data-tauri-drag-region
      className={`flex fixed top-0 right-0 z-999 items-center justify-between w-full h-9 select-none transition-colors duration-200 ${
        darkMode
          ? "bg-zinc-900 border-b border-zinc-800 text-zinc-400"
          : "bg-zinc-100 border-b border-zinc-300 text-zinc-600"
      }`}
    >
      <div className="flex items-center pl-3 gap-2 pointer-events-none">
        <span
          className={`text-[10px] font-bold tracking-wider uppercase ${
            darkMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          NXU_0
        </span>

        <div
          className="flex items-center pointer-events-auto ml-3 relative"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center rounded-md">
            {/*  BACK BUTTON */}
            <button
              type="button"
              onClick={goBack}
              disabled={!canGoBack}
              aria-label="Go back"
              className={`group/btn relative flex items-center justify-center w-6 h-6 rounded-l-md transition-colors ${
                !canGoBack
                  ? darkMode
                    ? "text-zinc-700 cursor-not-allowed"
                    : "text-zinc-300 cursor-not-allowed"
                  : darkMode
                    ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <FiChevronLeft size={20} />
              {/* Tooltip */}
              <span
                className={`text-[10px] tracking-wide pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-9999 opacity-0 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 transition-all duration-150 ease-out ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-100"
                }`}
              >
                Back
              </span>
            </button>

            {/*  FORWARD BUTTON */}
            <button
              type="button"
              onClick={goForward}
              disabled={!canGoForward}
              aria-label="Go forward"
              className={`group/btn relative flex items-center justify-center w-6 h-6 rounded-r-md transition-colors ml-0.5 ${
                !canGoForward
                  ? darkMode
                    ? "text-zinc-700 cursor-not-allowed"
                    : "text-zinc-300 cursor-not-allowed"
                  : darkMode
                    ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
              }`}
            >
              <FiChevronRight size={20} />
              {/* Tooltip */}
              <span
                className={`text-[10px] tracking-wide pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-9999 opacity-0 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 transition-all duration-150 ease-out ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-100"
                }`}
              >
                Forward
              </span>
            </button>
          </div>

          {/*  RECENT PAGES BUTTON */}
          <button
            type="button"
            disabled={!hasRecent} //  Disabled only if there's no cache
            aria-label="Recent pages"
            onClick={() => setRecentOpen((v) => !v)}
            className={`group/btn relative flex items-center justify-center rounded-md transition-colors ${
              !hasRecent
                ? darkMode
                  ? "text-zinc-700 cursor-not-allowed"
                  : "text-zinc-300 cursor-not-allowed"
                : darkMode
                  ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
            }`}
          >
            <FiChevronRight size={14} className="rotate-90 m-2" />
            {/* Tooltip */}
            <span
              className={`text-[10px] tracking-wide pointer-events-none absolute left-1/2 -translate-x-1/2 top-[calc(100%+6px)] px-2 py-1 rounded-md shadow-lg whitespace-nowrap z-9999 opacity-0 translate-y-1 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 transition-all duration-150 ease-out ${
                darkMode
                  ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                  : "bg-zinc-900 text-zinc-100"
              }`}
            >
              Recent Pages
            </span>
          </button>

          {recentOpen && (
            <RecentPagesDropdown
              items={recentItems}
              darkMode={darkMode}
              onSelect={(url) => {
                navigateTo(url);
                setRecentOpen(false);
              }}
              onClear={clear}
              onClose={() => setRecentOpen(false)}
            />
          )}
        </div>
      </div>

      <TitleBarCentral
        searching={search.searching}
        setSearching={search.setSearching}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        predictiveResults={search.predictiveResults}
        isShowRoute={isShowRoute}
        darkMode={darkMode}
        location={location}
        notebooks={notebooks}
        searchItems={search.searchItems}
        activeIndex={search.activeIndex}
        setActiveIndex={search.setActiveIndex}
        handleKeyDown={search.handleKeyDown}
        handleCloseSearch={search.handleCloseSearch}
        getTitleText={getTitleTextBound}
        inputRef={search.inputRef}
      />

      <TitleBarControl
        appWindow={appWindow}
        darkMode={darkMode}
        tabs={tabsState.tabs}
        maxTabs={MAX_TABS}
        createActions={tabsState.createActions}
        pageLinks={tabsState.pageLinks}
        onSelectTab={tabsState.navigateToTab}
        onCloseTab={tabsState.closeTab}
        onAddCustomTab={tabsState.addCustomTab}
      />
    </div>
  );
}
