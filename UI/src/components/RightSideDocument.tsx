/**
 * @file RightSideDocument.tsx
 * @component RightSideDocument
 * @description Right-hand workspace container. Publishes the active page id
 * into `CanvasContext`, lays out the canvas and the widget rail side-by-side.
 *
 * @architecture
 * - Reads the current page from props (resolved by the parent).
 * - Mirrors `currentPage.id` into `CanvasContext` so canvas actions
 *   (`addNode`, node mutations) have a valid target.
 * - Two-column layout: canvas flex-1 on the left, RightRail fixed on the right.
 */

import React, { useEffect } from "react";
import type { MockNotebook, MockPage } from "../assets/SAMPLE";
import { useCanvas } from "../contexts/Canvas/CanvasContext";
import { InfiniteWorkspace } from "./InfiniteSpace/InfinteWorkspace";
import RightRail from "./RightRail";

interface RightSideDocumentProps {
  darkMode: boolean;
  activeNotebook: MockNotebook | null;
  currentPage: MockPage | undefined;
}

export const RightSideDocument: React.FC<RightSideDocumentProps> = ({
  darkMode,
  activeNotebook,
  currentPage,
}) => {
  const { setActivePageId } = useCanvas();

  // ==========================================
  // SYNC: MIRROR ACTIVE PAGE INTO CANVAS CONTEXT
  // ==========================================
  /**
   * Publishes the rendered page id so `addNode` / `deleteSelectedNode` /
   * node geometry actions know which page to target.
   */
  useEffect(() => {
    setActivePageId(currentPage?.id ?? null);
  }, [currentPage?.id, setActivePageId]);

  return (
    <div className="h-full flex-1 flex flex-row overflow-hidden">
      <InfiniteWorkspace
        activeNotebook={activeNotebook}
        currentPage={currentPage}
        darkMode={darkMode}
      />
      <RightRail notebook={activeNotebook} darkMode={darkMode} />
    </div>
  );
};
