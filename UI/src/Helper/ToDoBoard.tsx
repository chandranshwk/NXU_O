import React, { useEffect, useRef, useState } from "react";
import { useSettings } from "../contexts/settingsContext";
import { FaPlus } from "react-icons/fa";
import { ToDoHeader } from "./ToDoHeader";
import { ToDoList } from "./ToDoList";

export interface ToDoItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ToDoBoardProps {
  idx: number;
  title: string;
  items: ToDoItem[];
  time: string | Date;
  date: string | Date;
  updateAttributes?: (attributes: { [key: string]: unknown }) => void;
  selected?: boolean;
}

const ToDoBoard: React.FC<ToDoBoardProps> = ({
  idx,
  title,
  items = [],
  time,
  date,
  updateAttributes,
}) => {
  const { darkMode } = useSettings();
  const boardRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [localTitle, setLocalTitle] = useState(title);
  const [localItems, setLocalItems] = useState<ToDoItem[]>(items);
  const [activeItemFocusId, setActiveItemFocusId] = useState<string | null>(
    null,
  );

  const [positionX, setPositionX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartOffset = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalTitle(title);
    }, 0);
    return () => clearTimeout(timer);
  }, [title]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalItems(items);
    }, 0);
    return () => clearTimeout(timer);
  }, [items]);

  useEffect(() => {
    if (activeItemFocusId && inputRefs.current[activeItemFocusId]) {
      const timer = setTimeout(() => {
        const inputElement = inputRefs.current[activeItemFocusId];
        if (inputElement && document.activeElement !== inputElement) {
          inputElement.focus();
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [activeItemFocusId, localItems.length]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalTitle(nextVal);
    if (updateAttributes)
      updateAttributes({ title: nextVal, items: localItems });
  };

  const handleItemTextChange = (id: string, newText: string) => {
    setLocalItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, text: newText } : it)),
    );
  };

  const handleItemBlur = () => {
    if (updateAttributes)
      updateAttributes({ title: localTitle, items: localItems });
  };

  const handleToggleCheck = (id: string) => {
    const nextItems = localItems.map((it) =>
      it.id === id ? { ...it, done: !it.done } : it,
    );
    setLocalItems(nextItems);
    if (updateAttributes)
      updateAttributes({ title: localTitle, items: nextItems });
  };

  const handleAddNewItem = () => {
    const newId = crypto.randomUUID();
    const nextItems = [...localItems, { id: newId, text: "", done: false }];
    setLocalItems(nextItems);
    setActiveItemFocusId(newId);
    if (updateAttributes)
      updateAttributes({ title: localTitle, items: nextItems });
  };

  const handleRemoveItem = (id: string) => {
    const nextItems = localItems.filter((it) => it.id !== id);
    setLocalItems(nextItems);
    delete inputRefs.current[id];
    if (updateAttributes)
      updateAttributes({ title: localTitle, items: nextItems });
  };

  const startCardDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("input") ||
      target.closest("button") ||
      target.closest(".no-drag")
    )
      return;

    e.preventDefault();
    setIsDragging(true);
    dragStartOffset.current = e.clientX - positionX;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseDragMove = (e: MouseEvent) => {
      if (animationFrameId.current) return;

      animationFrameId.current = requestAnimationFrame(() => {
        animationFrameId.current = null;
        const nextX = e.clientX - dragStartOffset.current;

        if (boardRef.current) {
          boardRef.current.style.transform = `translate(${nextX}px, 0px)`;
        }

        setPositionX(nextX);
      });
    };

    const stopCardDrag = () => {
      setIsDragging(false);
      if (updateAttributes)
        updateAttributes({ title: localTitle, items: localItems });
    };

    window.addEventListener("mousemove", handleMouseDragMove, {
      passive: true,
    });
    window.addEventListener("mouseup", stopCardDrag);

    return () => {
      window.removeEventListener("mousemove", handleMouseDragMove);
      window.removeEventListener("mouseup", stopCardDrag);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [isDragging, localTitle, localItems, updateAttributes, positionX]);

  // 🚀 FIXED: Switched logic to capture-phase mousedown coordinates
  const forceInputFocus = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Ignore if user clicked form inputs or button controls directly
    if (
      target.tagName === "INPUT" ||
      target.closest("button") ||
      target.closest("a")
    ) {
      return;
    }

    const clickY = e.clientY;

    // Scan bounding rows top-to-bottom to trigger precise item focusing
    for (const item of localItems) {
      const inputEl = inputRefs.current[item.id];
      if (inputEl) {
        const rowContainer = inputEl.closest("[data-row-id]");
        if (rowContainer) {
          const rect = rowContainer.getBoundingClientRect();
          if (clickY >= rect.top && clickY <= rect.bottom) {
            e.preventDefault();
            // Prevent TipTap context theft
            e.stopPropagation();
            inputEl.focus();
            return;
          }
        }
      }
    }

    // Fall back to title input element focus
    if (
      titleInputRef.current &&
      document.activeElement !== titleInputRef.current
    ) {
      e.preventDefault();
      titleInputRef.current.focus();
    }
  };

  const formatTime = (ti: string | Date) =>
    typeof ti === "string"
      ? ti
      : ti
          .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          .toLowerCase();

  const formatDate = (di: string | Date) =>
    typeof di === "string"
      ? di
      : di.toLocaleDateString([], { dateStyle: "medium" }).toLowerCase();

  return (
    <div
      ref={boardRef}
      contentEditable={false}
      onDoubleClickCapture={startCardDrag}
      // 🚀 FIXED: Changed event type from onClick to onMouseDown
      onMouseDown={forceInputFocus}
      // 🚀 FIXED: Hard-block mouseup/click bubblings so TipTap can't intercept release states
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ transform: `translate(${positionX}px, 0px)` }}
      className={`p-4 rounded-xl border flex flex-col gap-3 w-full max-w-xl mx-auto select-none transition-shadow duration-150 custom-todo-board-${idx} ${
        isDragging
          ? "cursor-grabbing shadow-xl z-50 ring-2 ring-emerald-500/20"
          : "cursor-grab shadow-sm"
      } ${darkMode ? "bg-zinc-900/40 border-zinc-800/80 text-zinc-100" : "bg-zinc-50 border-zinc-200/60 text-zinc-800"} resize overflow-hidden`}
    >
      <ToDoHeader
        darkMode={darkMode}
        localTitle={localTitle}
        date={date}
        time={time}
        titleInputRef={titleInputRef}
        handleTitleChange={handleTitleChange}
        formatDate={formatDate}
        formatTime={formatTime}
      />
      <ToDoList
        localItems={localItems}
        darkMode={darkMode}
        inputRefs={inputRefs}
        handleToggleCheck={handleToggleCheck}
        handleItemTextChange={handleItemTextChange}
        handleItemBlur={handleItemBlur}
        setActiveItemFocusId={setActiveItemFocusId}
        handleAddNewItem={handleAddNewItem}
        handleRemoveItem={handleRemoveItem}
      />
      <button
        type="button"
        onClick={handleAddNewItem}
        className={`mt-1 flex items-center justify-center gap-1.5 py-1.5 border border-dashed rounded-lg text-[11px] font-medium transition-all cursor-pointer outline-none ${
          darkMode
            ? "border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            : "border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100/40"
        }`}
      >
        <FaPlus className="w-3.5 h-3.5" /> Add new task
      </button>
    </div>
  );
};

export default ToDoBoard;
