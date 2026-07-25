import React, { useState, useRef, useEffect, type SetStateAction } from "react";
import StickyEditor from "./StickyEditor";
import { useWorkspace, type ItemsProps } from "../contexts/workspaceContext";
import { useSettings } from "../contexts/settingsContext";
import { FiPlus } from "react-icons/fi";

interface StickyNoteProps {
  id: number;
  index: number;
  content: string | React.ReactNode;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  setItems: React.Dispatch<SetStateAction<ItemsProps[]>>;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  index,
  content,
  initialX,
  initialY,
  initialWidth,
  initialHeight,
  setItems,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track continuous updates via mutable refs to prevent heavy Tiptap re-renders
  const positionRef = useRef({ x: initialX, y: initialY });
  const dimensionsRef = useRef({ width: initialWidth, height: initialHeight });

  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId.current) return;

      animationFrameId.current = requestAnimationFrame(() => {
        animationFrameId.current = null;

        // 🚀 FIXED: Find the actual scrolling parent element container to read its live scroll state offsets
        const scrollParent = containerRef.current?.closest(
          '[data-id="main-scroll-viewport"]',
        );
        const scrollTopOffset = scrollParent ? scrollParent.scrollTop : 0;
        const scrollLeftOffset = scrollParent ? scrollParent.scrollLeft : 0;

        if (isDragging && containerRef.current) {
          // 🚀 FIXED: Inject the viewport scroll offset into the tracking calculation loop
          const nextX = e.clientX - dragOffset.current.x + scrollLeftOffset;
          const nextY = e.clientY - dragOffset.current.y + scrollTopOffset;

          positionRef.current = { x: nextX, y: nextY };

          containerRef.current.style.left = `${nextX}px`;
          containerRef.current.style.top = `${nextY}px`;
        } else if (isResizing && containerRef.current) {
          const deltaX = e.clientX - resizeStart.current.mouseX;
          const deltaY = e.clientY - resizeStart.current.mouseY;

          const nextW = Math.max(120, resizeStart.current.width + deltaX);
          const nextH = Math.max(100, resizeStart.current.height + deltaY);

          dimensionsRef.current = { width: nextW, height: nextH };

          containerRef.current.style.width = `${nextW}px`;
          containerRef.current.style.height = `${nextH}px`;
        }
      });
    };

    const handleMouseUp = () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }

      if (isDragging) {
        setPosition(positionRef.current);
        setIsDragging(false);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, x: positionRef.current.x, y: positionRef.current.y }
              : item,
          ),
        );
      }
      if (isResizing) {
        setDimensions(dimensionsRef.current);
        setIsResizing(false);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  width: dimensionsRef.current.width,
                  height: dimensionsRef.current.height,
                }
              : item,
          ),
        );
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [isDragging, isResizing, id, setItems]);

  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".ProseMirror") || target.closest("button")) return;

    e.stopPropagation();
    setIsDragging(true);

    // 🚀 FIXED: Account for the scroll offset right when the drag action begins
    const scrollParent = containerRef.current?.closest(
      '[data-id="main-scroll-viewport"]',
    );
    const scrollTopOffset = scrollParent ? scrollParent.scrollTop : 0;
    const scrollLeftOffset = scrollParent ? scrollParent.scrollLeft : 0;

    dragOffset.current = {
      x: e.clientX - position.x + scrollLeftOffset,
      y: e.clientY - position.y + scrollTopOffset,
    };
  };

  const { deleteItem } = useWorkspace();
  const { darkMode } = useSettings();

  return (
    <div
      ref={containerRef}
      key={index}
      data-sticky-note
      onMouseDown={handleDragStart}
      className={`absolute group bg-yellow-200 text-slate-800 shadow-md border transition-shadow duration-100 rounded p-2 overflow-hidden flex flex-col ${
        isDragging
          ? "cursor-grabbing shadow-xl z-50 border-blue-400 border-2"
          : "cursor-grab z-30 border-yellow-300/40"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      {/* Delete Trigger Header Actions Wrapper */}
      <div className="absolute top-2 right-2 z-40 flex items-center justify-end no-drag">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteItem(id);
          }}
          className={`flex items-center justify-center w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm border cursor-pointer ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 hover:border-rose-500/30"
              : "bg-white border-yellow-300/60 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
          }`}
          title="Delete Note"
        >
          <FiPlus className="w-4 h-4 rotate-45" />
        </button>
      </div>

      <div className="w-full h-full overflow-y-auto scrollbar-none cursor-text pr-1 z-10 no-drag">
        <StickyEditor
          size="short"
          content={content ? content.toString() : ""}
        />
      </div>

      {/* Resize Anchor Notch */}
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsResizing(true);
          resizeStart.current = {
            width: dimensionsRef.current.width,
            height: dimensionsRef.current.height,
            mouseX: e.clientX,
            mouseY: e.clientY,
          };
        }}
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50 bg-linear-to-br from-transparent to-slate-400/40 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

export default StickyNote;
