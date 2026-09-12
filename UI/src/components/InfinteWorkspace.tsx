import React, { useState, useRef, useEffect } from "react";
import { CiMinimize1 } from "react-icons/ci";
import { AiOutlineExpandAlt } from "react-icons/ai";
import CanvasNodeWrapper from "../contexts/CanvasNodeWrapper";
import { NodeContentFactory } from "../Extensions/NodeContentFactory";
import type {
  MockNotebook,
  MockPage,
  MockPageNode,
  MockSection,
} from "../assets/SAMPLE";
import { useSettings } from "../contexts/settingsContext";
import { useNotebookStore } from "../contexts/notebook";
import { useCanvas } from "../contexts/CanvasContext";

interface props {
  /** Active notebook repository object containing current structural sub-trees */
  activeNotebook: MockNotebook | null;
  /** The target parent section model currently selected by the user */
  currentSection: MockSection | undefined;
  /** Active document sub-page meta layer containing content card nodes */
  currentPage: MockPage | undefined;
}

export const InfiniteWorkspace: React.FC<props> = ({
  currentPage,
  activeNotebook,
  currentSection,
}) => {
  const [localTitle, setLocalTitle] = useState("");

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

  const { zenMode, setZenMode } = useSettings();
  const { darkMode } = useSettings();

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { setPanning } = useCanvas();
  const { zoom, setZoom } = useCanvas();
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Track viewport with a native DOM reference node block instead
  const viewportNodeRef = useRef<HTMLDivElement | null>(null);

  // ==========================================
  // PAN MECHANICS: BACKDROP INTERACTION DRAGGER
  // ==========================================
  // ==========================================
  // PAN MECHANICS: SYSTEM BACKDROP DRAGGER
  // ==========================================
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isBackgroundClick =
      target === viewportNodeRef.current ||
      target.id === "infinite-canvas-viewport" ||
      target.id === "infinite-grid-layer";

    if (
      !isBackgroundClick ||
      target.closest("input") ||
      target.closest("button")
    ) {
      return;
    }

    setIsDragging(true);
    setPanning(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  // Bind move and release to the global window space dynamically
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setPanning(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, pan.x, pan.y, setPanning]);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      // Intercepts '+' (which registers as '=') or '-' when holding Ctrl/Cmd
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "=" || e.key === "+" || e.key === "-")
      ) {
        e.preventDefault(); // Stifles Tauri's native full-window text scale zoom

        setZoom((prev) => {
          const step = e.key === "-" ? -0.2 : 0.2;
          return Math.min(Math.max(prev + step, 0.2), 3.0); // Clamps layout scales safely
        });
      }
    };

    window.addEventListener("keydown", handleKeys, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeys, { capture: true });
  }, []);

  return (
    <div
      className={`flex-1 relative w-full h-full overflow-hidden px-4 py-2 pr-1 flex flex-col select-none ${
        darkMode ? "bg-zinc-950" : "bg-zinc-50"
      }`}
    >
      {currentPage && (
        <div className="relative w-full max-w-2xl flex flex-col group z-10">
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={commitTitleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") {
                setLocalTitle(
                  currentPage?.title ? String(currentPage.title) : "",
                );
                e.currentTarget.blur();
              }
            }}
            placeholder="Untitled Page"
            className={`w-full text-2xl font-extrabold tracking-tight bg-transparent outline-none pb-2 transition-all duration-200 placeholder:opacity-20 ${
              darkMode
                ? "text-zinc-100 placeholder:text-zinc-400"
                : "text-zinc-900 placeholder:text-zinc-500"
            }`}
          />
          {(currentPage?.createdDate || currentPage?.createdTime) && (
            <div
              className={`text-[11px] font-mono tracking-wide ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              <span>Created on {String(currentPage.createdDate)}</span>
              <span className="mx-2 opacity-40">•</span>
              <span>{String(currentPage.createdTime)}</span>
            </div>
          )}
          <span
            className={`absolute bottom-5 left-0 h-[1.5px] w-full ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
          />
          <span
            className={`absolute bottom-5 left-0 h-[1.5px] w-full transition-transform duration-300 origin-left scale-x-0 group-focus-within:scale-x-100 ${darkMode ? "bg-zinc-400" : "bg-zinc-700"}`}
          />
        </div>
      )}

      {/* Control Action Buttons */}
      <div
        className={`fixed ${zenMode ? "top-26" : "top-36"} right-4 flex flex-col gap-2 z-20`}
      >
        <button
          type="button"
          onClick={() => setZenMode((prev: boolean) => !prev)}
          className={`p-2 rounded-md transition-all border outline-none shadow-sm ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <div className="text-base flex items-center justify-center">
            {zenMode ? <CiMinimize1 /> : <AiOutlineExpandAlt />}
          </div>
        </button>
      </div>

      {/* SPATIAL MATRIX FRAME VIEWPORT */}
      <div
        ref={viewportNodeRef}
        id="infinite-canvas-viewport"
        onMouseDown={handleMouseDown}
        className={`w-full flex-1 relative overflow-hidden border z-0 pointer-events-auto ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${darkMode ? "border-zinc-900 bg-zinc-950" : "border-zinc-200 bg-zinc-50"}`}
        style={{
          touchAction: "none",
          backgroundImage: darkMode
            ? "radial-gradient(#27272a 1px, transparent 1px)"
            : "radial-gradient(#e4e4e7 1px, transparent 1px)",
          // Scale the dots step interval size alongside the current numeric zoom value
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          // Track the background offset accurately to match your canvas coordinates
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* INFINITE MATRIX TRANSFORM LAYER */}
        <div
          id="infinite-grid-layer"
          className="absolute top-0 left-0 w-0 h-0"
          style={{
            // The translate handles your coordinates, while scale handles your single numeric zoom
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {currentPage?.nodes &&
            currentPage.nodes.map((node: MockPageNode) => (
              <CanvasNodeWrapper
                key={node.id}
                node={node}
                notebookId={activeNotebook ? activeNotebook.id : ""}
                sectionId={currentSection!.id}
                pageId={currentPage.id}
                darkMode={darkMode}
                isSelected={false}
                onSelect={(id) => console.log("Focused node layout item:", id)}
              >
                <NodeContentFactory node={node} />
              </CanvasNodeWrapper>
            ))}
        </div>
      </div>
    </div>
  );
};
