/**
 * @file RightSideDocument.tsx (Snippet 1)
 * @component RightSideDocument
 * @description The main layout section on the right side of the notebook editor canvas.
 * It manages the tabs for notebook sections, local title renaming operations, and
 * section creation pipelines.
 *
 * @architecture
 * - Synchronises active workspace page data arrays using references from `useNotebookStore`.
 * - Employs a focus hook array setup to switch section labels between text inputs and static triggers on F2 keypress events.
 * - Seamlessly respects global `zenMode` modifiers to collapse the section bar layout when focused.
 */

import React, { useState, useEffect } from "react";
import type {
  MockNotebook,
  MockPage,
  MockPageNode,
  MockSection,
} from "../assets/SAMPLE";
import { useNotebookStore } from "../contexts/notebook";
import { useSettings } from "../contexts/settingsContext";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { CiMinimize1 } from "react-icons/ci";
import { CanvasNodeWrapper } from "../contexts/CanvasNodeWrapper";
import { NodeContentFactory } from "../Extensions/NodeContentFactory";

interface RightSideDocumentProps {
  /** Shared dark mode setting flag used to switch visual palette ranges */
  darkMode: boolean;
  /** Active notebook repository object containing current structural sub-trees */
  activeNotebook: MockNotebook | null;
  /** The target parent section model currently selected by the user */
  currentSection: MockSection | undefined;
  /** Active document sub-page meta layer containing content card nodes */
  currentPage: MockPage | undefined;
  /** Index mapping position of the section tab actively opened in viewports */
  activeSectionIdx: number;
  /** State modifier updating targeted horizontal tab section indices */
  setActiveSectionIdx: (idx: number) => void;
  /** Navigation router utility mapping sub-page transitions via query string metrics */
  handleNavigation: (pageId: string) => void;
}

export const RightSideDocument: React.FC<RightSideDocumentProps> = ({
  darkMode,
  activeNotebook,
  currentSection,
  currentPage,
  activeSectionIdx,
  setActiveSectionIdx,
  handleNavigation,
}) => {
  /** Tracks the specific string ID of the notebook section actively being renamed */
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  /** Local text input state tracking active typing buffers inside section renames */
  const [renameValue, setRenameValue] = useState("");
  /** Local text input state tracking active typing buffers inside document title inputs */
  const [localTitle, setLocalTitle] = useState("");

  // ==========================================
  // LIFECYCLE: TITLE VALUE DISPLAY SYNCHRONIZER
  // ==========================================
  /**
   * Listens for sub-page transition operations. Automatically refreshes
   * local input values with updated page titles when reference handles change out.
   */
  useEffect(() => {
    if (currentPage?.title) {
      setTimeout(() => {
        setLocalTitle(String(currentPage.title));
      }, 0);
    } else {
      setTimeout(() => {
        setLocalTitle("");
      }, 0);
    }
  }, [currentPage?.id, currentPage?.title]);

  // ==========================================
  // STATE ACTION: COMMIT SUB-PAGE TITLE CHANGES
  // ==========================================
  /** Validates heading input strings and logs modifications back into global notebook store structures */
  const commitTitleChange = () => {
    const trimmed = localTitle.trim();
    if (
      !activeNotebook ||
      !currentSection ||
      !currentPage ||
      trimmed === "" ||
      trimmed === currentPage.title
    ) {
      return;
    }
    const { renamePage } = useNotebookStore.getState();
    if (renamePage) {
      renamePage(activeNotebook.id, currentSection.id, currentPage.id, trimmed);
    }
  };

  /** Extracts zen layout options directly from app universal configuration stores */
  const { zenMode, setZenMode } = useSettings();

  return (
    <div className="h-full flex-1 flex flex-col overflow-hidden">
      {/* ==========================================
          TOP RAIL: HORIZONTAL WORKFLOW SECTION TABS BAR
          ========================================== */}
      {!zenMode && (
        <div
          className={`h-max flex items-end border-b gap-1 pt-1.5 shrink-0 ${
            darkMode
              ? "bg-[#0a0a0aad] border-zinc-800"
              : "bg-zinc-100 border-zinc-200"
          }`}
        >
          {activeNotebook?.sections.map((section: MockSection, idx: number) => {
            const isSectionSelected = idx === activeSectionIdx;
            const isEditingThisSection = editingSectionId === section.id;

            /* ==========================================
               BRANCH A: ACTIVE EDITING RE-LABEL INPUT BLOCK
               ========================================== */
            if (isEditingThisSection) {
              return (
                <input
                  key={section.id}
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => {
                    if (
                      renameValue.trim() !== "" &&
                      renameValue.trim() !== section.title
                    ) {
                      const { renameSection } = useNotebookStore.getState();
                      if (renameSection)
                        renameSection(
                          activeNotebook.id,
                          section.id,
                          renameValue.trim(),
                        );
                    }
                    setEditingSectionId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (
                        renameValue.trim() !== "" &&
                        renameValue.trim() !== section.title
                      ) {
                        const { renameSection } = useNotebookStore.getState();
                        if (renameSection)
                          renameSection(
                            activeNotebook.id,
                            section.id,
                            renameValue.trim(),
                          );
                      }
                      setEditingSectionId(null);
                    } else if (e.key === "Escape") {
                      setEditingSectionId(null); // Dismiss changes safely
                    }
                  }}
                  style={{
                    borderBottomColor: section.colorHex,
                    // Linearly grows input fields to fit variable length title strings smoothly
                    width: `${Math.max(renameValue.length * 8 + 24, 90)}px`,
                  }}
                  className={`px-4 py-2 text-xs font-semibold border-b-2 outline-none bg-transparent transition-all ${
                    darkMode
                      ? "text-zinc-100 bg-zinc-900"
                      : "text-zinc-900 bg-white"
                  }`}
                />
              );
            }

            /* ==========================================
               BRANCH B: STATIC TAB BUTTON LAYOUT ELEMENT
               ========================================== */
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSectionIdx(idx);
                  if (section.pages && section.pages.length > 0) {
                    handleNavigation(section.pages[0].id);
                  }
                }}
                onKeyDown={(e) => {
                  // Capture F2 triggers to swap labels over to text input fields
                  if (e.key === "F2") {
                    setEditingSectionId(section.id);
                    setRenameValue(section.title);
                  }
                }}
                style={{
                  borderBottomColor: isSectionSelected
                    ? section.colorHex
                    : "transparent", // Highlight selected tabs using custom section indicator bars
                }}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all outline-none ${
                  isSectionSelected
                    ? darkMode
                      ? "text-zinc-100 bg-zinc-900"
                      : "text-zinc-900 bg-white"
                    : darkMode
                      ? "text-zinc-500 hover:text-zinc-300"
                      : "text-zinc-500 hover:text-zinc-700"
                }`}
                title="Press F2 to rename this section"
              >
                {section.title}
              </button>
            );
          })}

          {/* ==========================================
              ACTION ELEMENT: APPEND NEW NOTEBOOK SECTION TABS LAYER
              ========================================== */}
          <button
            type="button"
            onClick={() => {
              const defaultSectionTitle = `Section ${activeNotebook ? activeNotebook.sections.length + 1 : 0}`;
              const { addSectionToNotebook } = useNotebookStore.getState();
              if (addSectionToNotebook)
                addSectionToNotebook(
                  activeNotebook ? activeNotebook.id : "",
                  defaultSectionTitle,
                );

              const updatedSections =
                useNotebookStore.getState().activeNotebook?.sections;
              if (updatedSections && updatedSections.length > 0) {
                const targetIdx = updatedSections.length - 1;
                setActiveSectionIdx(targetIdx);
                const initialPage = updatedSections[targetIdx].pages[0];
                if (initialPage) {
                  handleNavigation(initialPage.id);
                }
              }
            }}
            className={`px-3 py-2 text-xs font-bold border-b-2 border-transparent transition-all outline-none h-full ${
              darkMode
                ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            + Add Section
          </button>
        </div>
      )}

      {/* ==========================================
          PRIMARY WORKSPACE CANVAS PANELS LOWER FLOOR
          ========================================== */}
      <div
        className={`flex-1 relative overflow-hidden px-4 py-2 flex flex-col ${
          darkMode ? "bg-zinc-950" : "bg-zinc-50"
        }`}
      >
        {currentPage && (
          <div className="relative w-full max-w-2xl flex flex-col group ">
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={commitTitleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                } else if (e.key === "Escape") {
                  setLocalTitle(
                    currentPage?.title ? String(currentPage.title) : "",
                  );
                  e.currentTarget.blur();
                }
              }}
              placeholder="Untitled Page"
              className={`w-full text-2xl font-extrabold tracking-tight bg-transparent outline-none pb-2 transition-all duration-200 placeholder:opacity-20 ${
                darkMode
                  ? "text-zinc-100 hover:text-white placeholder:text-zinc-400"
                  : "text-zinc-900 hover:text-zinc-950 placeholder:text-zinc-500"
              }`}
            />

            {/* ==========================================
                SUB-HEADER METADATA LAYER: TIME STAMPS
                ========================================== */}
            {(currentPage?.createdDate || currentPage?.createdTime) && (
              <div
                className={`text-[11px] font-mono mb-1 transition-colors tracking-wide ${
                  darkMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                <span>Created on {String(currentPage.createdDate)}</span>
                <span className="mx-2 opacity-40">•</span>
                <span>{String(currentPage.createdTime)}</span>
              </div>
            )}

            {/* Static alignment background layout divider line */}
            <span
              className={`absolute bottom-6 left-0 h-[1.5px] w-full transition-colors ${
                darkMode ? "bg-zinc-800" : "bg-zinc-200"
              }`}
            />

            {/* Dynamic expanding accent bar that triggers upon input box focus */}
            <span
              className={`absolute bottom-6 left-0 h-[1.5px] w-full transition-transform duration-300 origin-left scale-x-0 group-focus-within:scale-x-100 ${
                darkMode ? "bg-zinc-400" : "bg-zinc-700"
              }`}
            />
          </div>
        )}

        {/* Empty title validation helper warning badge */}
        {localTitle.trim() === "" && (
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mt-1 animate-pulse">
            Empty titles default to previous configuration on blur
          </span>
        )}

        {/* ==========================================
            CONTROL INTERFACE: ZEN MODE TOGGLE ACTION
            ========================================== */}
        <button
          type="button"
          onClick={() => setZenMode((prev) => !prev)}
          className={`absolute top-2 right-4 p-2 rounded-md transition-all border outline-none shadow-sm z-20 ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200"
          }`}
          title={zenMode ? "Minimize Canvas View" : "Maximize Canvas View"}
        >
          <div className="text-base flex items-center justify-center">
            {zenMode ? <CiMinimize1 /> : <AiOutlineExpandAlt />}
          </div>
        </button>

        {/* ==========================================
            SPATIAL MATRIX: INFINITE GEOMETRY CANVAS VIEWPORT
            ========================================== */}
        <div
          id="infinite-canvas-viewport"
          className="w-full flex-1 relative overflow-hidden"
        >
          <div className="absolute inset-0">
            {/* Loop through absolute node data arrays and spawn their component factory blocks */}
            {currentPage?.nodes &&
              currentPage.nodes.map((node: MockPageNode) => (
                <CanvasNodeWrapper
                  key={node.id}
                  node={node}
                  notebookId={activeNotebook ? activeNotebook.id : ""}
                  sectionId={currentSection!.id}
                  pageId={currentPage.id}
                  darkMode={darkMode}
                  isSelected={false} // Placeholder variable state until selection store is mounted
                  onSelect={(id) =>
                    console.log("Focused node layout item:", id)
                  }
                >
                  {/* Dynamic Factory Router maps components based on data signatures (text, calendar, etc.) */}
                  <NodeContentFactory node={node} />
                </CanvasNodeWrapper>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
