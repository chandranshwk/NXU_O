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

const NewDocumentContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const targetPageId = searchParams.get("page");
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  const { activeNotebook, setActiveNotebookById, initializeData } =
    useNotebookStore();
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const settings = useSettings();
  // Sync data arrays safely on mount
  useEffect(() => {
    initializeData();
    if (id) {
      setActiveNotebookById(id);
    }
  }, [id, initializeData, setActiveNotebookById]);

  // Sync default active section if navigating to a specific sub-page directly
  useEffect(() => {
    if (activeNotebook && targetPageId) {
      activeNotebook.sections.forEach((sec: MockSection, idx: number) => {
        if (sec.pages.some((p) => p.id === targetPageId)) {
          setActiveSectionIdx(idx);
        }
      });
    }
  }, [activeNotebook, targetPageId]);

  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      // 1. Break down your custom string shortcut into a manageable array
      const dynamicKeys = settings.zenModeShortcut.toLowerCase().split("-");

      // 2. Evaluate individual modifier flags dynamically based on your array contents
      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      // 3. Find the action character key (the array element that isn't a modifier)
      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      // 4. Verify that the hardware matches your configuration perfectly
      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;

      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      // 5. Fire the toggle command only if every condition passes
      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault();
        setShowSidebar((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);

    // Clean up the active event listener to prevent event stacking memory leaks
    return () => window.removeEventListener("keydown", handleCommands);
  }, [settings.zenModeShortcut]);

  // CRITICAL STRUCTURAL GUARD: Kept cleanly placed right before calculations to protect layout boundaries
  if (!activeNotebook) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-zinc-500 bg-zinc-950">
        Locating active workspace node...
      </div>
    );
  }

  // Compute active variables safely with optional fallbacks
  const currentSection = activeNotebook.sections[activeSectionIdx];
  const currentPage =
    currentSection?.pages.find((p) => p.id === targetPageId) ||
    currentSection?.pages[0];

  const handleNavigation = (pageId: string) => {
    navigate(`/document/${activeNotebook.id}?page=${pageId}`);
  };

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden relative ${
        !darkMode ? "bg-white text-zinc-900" : "bg-[#18181b] text-zinc-100"
      }`}
    >
      {/* 1. Global Toolbar */}
      <Toolbar />

      {/* 2. Primary Workspace Split */}
      <div className="h-full w-full flex flex-1 overflow-hidden">
        {/* Left Side: 1/6 Width Navigation Column */}
        {showSidebar && !settings.zenMode && (
          <div
            className={`h-full w-1/6 min-w-55 max-w-[320px] border-r flex flex-col p-4 gap-4 ${
              darkMode
                ? "bg-zinc-950/80 border-zinc-800"
                : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div>
              <h2 className="text-sm font-bold truncate">
                {activeNotebook.title}
              </h2>
              <span className="text-[10px] opacity-40 font-mono block truncate">
                {activeNotebook.id}
              </span>
            </div>

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

              {/* Create New Page Functional Interface Trigger Block */}
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

        {/* Right Side Viewport: Injected child component with clean parameter wiring */}
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
