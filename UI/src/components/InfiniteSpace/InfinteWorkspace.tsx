import React from "react";
import { CiMinimize1 } from "react-icons/ci";
import { AiOutlineExpandAlt } from "react-icons/ai";

import { NodeContentFactory } from "../../Extensions/NodeContentFactory";
import type {
  MockNotebook,
  MockPage,
  MockPageNode,
  MockSection,
} from "../../assets/SAMPLE";
import { useSettings } from "../../contexts/settingsContext";
import { useWorkspacePanZoom } from "./InfiniteWorkspace.useWorkspace";
import { DrawingCanvasLayer } from "./infiniteWorkspace.drawingCanvas";
import { BrushPropertiesPanel } from "./InfiniteWorkspace.SketchProperties";
import { EraserPropertiesPanel } from "./InfiniteWorkspace.EraserPanel";
import CanvasNodeWrapper from "../../contexts/Canvas/CanvasNodeWrapper";

interface InfiniteWorkspaceProps {
  activeNotebook: MockNotebook | null;
  currentSection: MockSection | undefined;
  currentPage: MockPage | undefined;
}

export const InfiniteWorkspace: React.FC<InfiniteWorkspaceProps> = ({
  currentPage,
  activeNotebook,
  currentSection,
}) => {
  const { zenMode, setZenMode } = useSettings();
  const { darkMode } = useSettings();

  const {
    localTitle,
    setLocalTitle,
    commitTitleChange,
    pan,
    zoom,
    isDragging,
    viewportNodeRef,
    handleMouseDown,
    drawingCanvasRef,
    activeCanvasTool,
    handleDrawStart,
    handleDrawOrEraseMove,
    handleDrawEnd,
    mouseScreenPos,
    isPaintingActive,
    brushColor,
    setBrushColor,
    strokeWidth,
    setStrokeWidth,
    eraserSize,
    setEraserSize,
    brushType,
    setBrushType,
  } = useWorkspacePanZoom({
    currentPage,
    activeNotebook,
    currentSection,
    darkMode,
  });

  const isDrawingOrErasing =
    activeCanvasTool === "Sketch" || activeCanvasTool === "Erase";

  return (
    <div
      className={`flex-1 relative w-full h-full overflow-hidden px-4 py-2 pr-1 flex flex-col select-none ${darkMode ? "bg-zinc-950" : "bg-zinc-50"}`}
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

        {/* SKETCH CONFIG PANEL WITH DROP-UP COLOR SELECTOR */}
        {activeCanvasTool === "Sketch" && (
          <BrushPropertiesPanel
            darkMode={darkMode}
            brushType={brushType}
            setBrushType={setBrushType}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
          />
        )}

        {activeCanvasTool === "Erase" && (
          <EraserPropertiesPanel
            darkMode={darkMode}
            eraserSize={eraserSize}
            setEraserSize={setEraserSize}
          />
        )}
      </div>

      <div
        ref={viewportNodeRef}
        id="infinite-canvas-viewport"
        onMouseDown={handleMouseDown}
        className={`w-full flex-1 relative overflow-hidden border z-0 pointer-events-auto ${
          isDrawingOrErasing
            ? isPaintingActive
              ? ""
              : activeCanvasTool === "Sketch"
                ? "cursor-crosshair"
                : "cursor-cell"
            : isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
        } ${darkMode ? "border-zinc-900 bg-zinc-950" : "border-zinc-200 bg-zinc-50"}`}
        style={{
          touchAction: "none",
          backgroundImage: darkMode
            ? "radial-gradient(#27272a 1px, transparent 1px)"
            : "radial-gradient(#e4e4e7 1px, transparent 1px)",
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          cursor: isDrawingOrErasing && isPaintingActive ? "none" : undefined,
        }}
      >
        {isDrawingOrErasing && isPaintingActive && mouseScreenPos.x !== 0 && (
          <div
            className="fixed rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-50 backdrop-blur-[0.5px] flex items-center justify-center"
            style={{
              left: `${mouseScreenPos.x}px`,
              top: `${mouseScreenPos.y}px`,
              width:
                activeCanvasTool === "Erase"
                  ? `${(eraserSize * 2) / zoom}px`
                  : `${strokeWidth / zoom}px`,
              height:
                activeCanvasTool === "Erase"
                  ? `${(eraserSize * 2) / zoom}px`
                  : `${strokeWidth / zoom}px`,
              backgroundColor:
                activeCanvasTool === "Erase"
                  ? "rgba(161, 161, 170, 0.2)"
                  : brushColor,
              border:
                activeCanvasTool === "Erase"
                  ? "1.5px solid rgba(113, 113, 122, 0.5)"
                  : "none",
            }}
          />
        )}

        <div
          id="infinite-grid-layer"
          className="absolute top-0 left-0 w-1250 h-1250"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <DrawingCanvasLayer
            drawingCanvasRef={drawingCanvasRef}
            activeCanvasTool={activeCanvasTool}
            zoom={zoom}
            onMouseDown={handleDrawStart}
            onMouseMove={handleDrawOrEraseMove}
            onMouseUp={handleDrawEnd}
            onMouseLeave={handleDrawEnd}
          />

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
                onSelect={(id) => console.log("Focused node item layout:", id)}
              >
                <NodeContentFactory node={node} />
              </CanvasNodeWrapper>
            ))}
        </div>
      </div>
    </div>
  );
};
