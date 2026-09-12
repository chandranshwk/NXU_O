/**
 * @file RightSideDocument.tsx (Snippet 1)
 * @component RightSideDocument
 * @description The main layout section on the right side of the notebook editor canvas.
 * It manages the tabs for notebook sections, local title renaming operations, and
 * section creation pipelines.
 *
 * @architecture
 * - Synchronizes active workspace page data arrays using references from `useNotebookStore`.
 * - Employs a focus hook array setup to switch section labels between text inputs and static triggers on F2 keypress events.
 * - Seamlessly respects global `zenMode` modifiers to collapse the section bar layout when focused.
 */

import React, { useState } from "react";
import type { MockNotebook, MockPage, MockSection } from "../assets/SAMPLE";
import { useNotebookStore } from "../contexts/notebook";
import { useSettings } from "../contexts/settingsContext";
import { InfiniteWorkspace } from "./InfinteWorkspace";

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
  activeSectionIdx,
  currentSection,
  currentPage,
  setActiveSectionIdx,
  handleNavigation,
}) => {
  /** Tracks the specific string ID of the notebook section actively being renamed */
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  /** Local text input state tracking active typing buffers inside section renames */
  const [renameValue, setRenameValue] = useState("");

  /** Extracts zen layout options directly from app universal configuration stores */
  const { zenMode } = useSettings();

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

      <div className="flex-1 w-full relative min-h-0 pointer-events-auto">
        <InfiniteWorkspace
          activeNotebook={activeNotebook}
          currentSection={currentSection}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};
