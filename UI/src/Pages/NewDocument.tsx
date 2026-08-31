/**
 * @file NewDocument.tsx
 * @component NewDocument
 * @description The notebook multi-page document editor page. It handles sidebar
 * page lists, creating new pages, switching sections, and entering zen mode.
 *
 * @architecture
 * - Manages multi-level document sync using `useNotebookStore`.
 * - Toggles structural layouts based on URL query parameters (`?page=...`).
 * - Encapsulates text canvases using `<RightSideDocument />`.
 */

import { useEffect, useState } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { EditorProvider } from "../contexts/editorContext";
import { ScratchProvider } from "../contexts/scratchContext";
import Toolbar from "./Document/Toolbar";
import type { MockPage, MockSection } from "../assets/SAMPLE";
import { useNotebookStore } from "../contexts/notebook";
import { RightSideDocument } from "../components/RightSideDocument";
import { useSettings } from "../contexts/settingsContext";

/**
 * @component NewDocumentContent
 * @description Coordinates notebook navigation arrays, sidebar view states,
 * page initialization lifecycles, and hotkey actions.
 */
const NewDocumentContent = () => {
  /** Accesses global app theme preferences passed from the shell root template */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  /** Extracts the unique directory ID directly out of the router match parameters */
  const { id } = useParams<{ id: string }>();

  /** Extracts targeted sub-page filters straight from window address metrics */
  const [searchParams] = useSearchParams();
  const targetPageId = searchParams.get("page");

  /** Local toggle flag used to close the notebook navigation sidebar array */
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  /** Connects to the data layer state store to mutate notebook values */
  const { activeNotebook, setActiveNotebookById, initializeData } =
    useNotebookStore();

  /** Tracks the positional index of the section currently chosen by the user */
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const settings = useSettings();

  // ==========================================
  // 📁 LIFECYCLE 1: NOTEBOOK LOADER CORE
  // ==========================================
  /**
   * Initializes local stores and claims active directory context references
   * each time the root routing ID changes.
   */
  useEffect(() => {
    initializeData();
    if (id) {
      setActiveNotebookById(id);
    }
  }, [id, initializeData, setActiveNotebookById]);

  // ==========================================
  // 🧭 LIFECYCLE 2: TARGET SUB-PAGE SYNCHRONIZER
  // ==========================================
  /**
   * Scans notebook section sub-arrays on load. If a sub-page match is found,
   * it pushes focus straight to that section without losing tracking coordinates.
   */
  useEffect(() => {
    if (activeNotebook && targetPageId) {
      activeNotebook.sections.forEach((sec: MockSection, idx: number) => {
        if (sec.pages.some((p) => p.id === targetPageId)) {
          setActiveSectionIdx(idx);
        }
      });
    }
  }, [activeNotebook, targetPageId]);

  // ==========================================
  // LIFECYCLE 3: ZEN MODE SHORTCUT DECODER
  // ==========================================
  /**
   * Listens for keyboard key codes to toggle zen mode, cleanly parsing user strings
   * like "Ctrl-Alt-Z" down to layout modifier events at runtime.
   */
  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      const dynamicKeys = settings.zenModeShortcut.toLowerCase().split("-");

      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;

      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);
    return () => window.removeEventListener("keydown", handleCommands);
  }, [settings.zenModeShortcut]);

  // ==========================================
  // CRITICAL STRUCTURAL RENDER GUARD
  // ==========================================
  if (!activeNotebook) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-zinc-500 bg-zinc-950">
        Locating active workspace node...
      </div>
    );
  }

  // Calculate layout models with structural fallbacks
  const currentSection = activeNotebook.sections[activeSectionIdx];
  const currentPage =
    currentSection?.pages.find((p) => p.id === targetPageId) ||
    currentSection?.pages[0];

  /** Routes address coordinates towards chosen page node parameters */
  const handleNavigation = (pageId: string) => {
    navigate(`/document/${activeNotebook.id}?page=${pageId}`);
  };

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden relative ${
        !darkMode ? "bg-white text-zinc-900" : "bg-[#18181b] text-zinc-100"
      }`}
    >
      {/* 1. Global Toolbar Layer */}
      <Toolbar />

      {/* 2. Primary Workspace Split Panel View */}
      <div className="h-full w-full flex flex-1 overflow-hidden">
        {/* ==========================================
            LEFT SIDEBAR: SECTION NAVIGATION RAILS
            ========================================== */}
        {showSidebar && !settings.zenMode && (
          <div
            className={`h-full w-1/6 min-w-55 max-w-[320px] border-r flex flex-col p-4 gap-4 ${
              darkMode
                ? "bg-zinc-950/80 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            {/* Title Metadata Container */}
            <div>
              <h2 className="text-sm font-bold truncate">
                {activeNotebook.title}
              </h2>
              <span className="text-[10px] opacity-40 font-mono block truncate">
                {activeNotebook.id}
              </span>
            </div>

            {/* Scrollable Page Button Stream Block */}
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">
                Section Pages
              </span>

              {currentSection?.pages.map((page: MockPage) => {
                const isSelectedPage = page.id === targetPageId;
                return (
                  <div
                    key={page.id}
                    onClick={() => handleNavigation(page.id)}
                    className={`text-xs p-2 rounded-md transition-all truncate cursor-pointer font-medium ${
                      isSelectedPage
                        ? "bg-blue-600 text-white shadow"
                        : darkMode
                          ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                          : "hover:bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {String(page.title)}
                  </div>
                );
              })}

              {/* ACTION TRIGGER: APPEND NEW DRAFT BLANK BLOCK PAGE */}
              <div
                onClick={() => {
                  if (!currentSection) return;
                  const defaultTitle = "Untitled Page";

                  const { addPageToSection } = useNotebookStore.getState();
                  addPageToSection(
                    activeNotebook.id,
                    currentSection.id,
                    defaultTitle,
                  );

                  const latestPages =
                    useNotebookStore.getState().activeNotebook?.sections[
                      activeSectionIdx
                    ]?.pages;
                  if (latestPages && latestPages.length > 0) {
                    const newlyCreatedPage =
                      latestPages[latestPages.length - 1];
                    handleNavigation(newlyCreatedPage.id);
                  }
                }}
                className={`text-xs p-2 rounded-md transition-all truncate cursor-pointer font-medium text-center border border-dashed border-transparent hover:border-zinc-700 ${
                  darkMode
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "hover:bg-zinc-200 text-zinc-600"
                }`}
              >
                + Add New Page
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            RIGHT SIDEVIEWPORT: ACTIVE CANVAS CORE
            ========================================== */}
        <RightSideDocument
          darkMode={darkMode}
          activeNotebook={activeNotebook}
          currentSection={currentSection}
          currentPage={currentPage}
          activeSectionIdx={activeSectionIdx}
          setActiveSectionIdx={setActiveSectionIdx}
          handleNavigation={handleNavigation}
        />
      </div>
    </div>
  );
};

/**
 * @component NewDocument
 * @description Context initialization wrapper. Safely sets up state contexts
 * around the core content layer prior to document rendering.
 */
const NewDocument = () => {
  return (
    <EditorProvider>
      <ScratchProvider>
        <NewDocumentContent />
      </ScratchProvider>
    </EditorProvider>
  );
};
export default NewDocument;
