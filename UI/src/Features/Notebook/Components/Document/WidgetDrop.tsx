import React, { useEffect, useRef } from "react";
import { FiType, FiPlus } from "react-icons/fi";
import { useCanvas } from "../../Canvas/Canvas/CanvasContext";
import type { NodeComponentType } from "../../../../assets/SAMPLE";

// Semantic visual anchors for node types
const NODE_TYPES: {
  type: NodeComponentType;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  accentLight: string;
  accentDark: string;
}[] = [
  {
    type: "text",
    label: "Text Block",
    desc: "Add a markdown text node",
    Icon: FiType,
    accentLight: "bg-zinc-100 text-zinc-700 border-zinc-200",
    accentDark: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
];

interface WidgetDropProps {
  darkMode: boolean;
}

const WidgetDrop: React.FC<WidgetDropProps> = ({ darkMode }) => {
  const canvas = useCanvas();
  const menuRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // OUTSIDE CLICK HANDLER
  // ==========================================
  useEffect(() => {
    if (!canvas.widgetOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // If clicking inside the menu itself, do nothing
      if (menuRef.current && menuRef.current.contains(target)) {
        return;
      }

      // If clicking the "Widget" button in the toolbar, let the button's
      // onClick handle the toggle so it doesn't immediately close and reopen.
      if (target.closest('[title="Widget"]')) {
        return;
      }

      // Otherwise, click was outside -> close menu
      canvas.setWidgetOpen(false);
    };

    // Use mousedown to close it before the click event fires on other elements
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [canvas.widgetOpen, canvas.setWidgetOpen]);

  if (!canvas.widgetOpen) return null;

  const handleAddNode = (type: NodeComponentType) => {
    canvas.addNode?.(type);
    canvas.setWidgetOpen?.(false);
  };

  return (
    <div
      ref={menuRef}
      className={`absolute top-14 right-4 z-[99999] flex w-64 flex-col overflow-hidden rounded-sm border shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 ${
        darkMode
          ? "bg-[#121214] border-zinc-800 shadow-black/60"
          : "bg-white border-zinc-300 shadow-zinc-300/50"
      }`}
      role="menu"
      aria-label="Canvas blocks"
    >
      {/* Sharp, Technical Header */}
      <div
        className={`px-3 py-2 border-b flex items-center justify-between ${
          darkMode
            ? "border-zinc-800 bg-[#18181b]"
            : "border-zinc-200 bg-zinc-50"
        }`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            darkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Insert Widget
        </span>
      </div>

      {/* Block list */}
      <div className="flex-1 p-1">
        {NODE_TYPES.map(
          ({ type, label, desc, Icon, accentLight, accentDark }) => (
            <button
              key={type}
              type="button"
              role="menuitem"
              onClick={() => handleAddNode(type)}
              className={`group flex w-full items-center gap-3 rounded-sm px-2 py-2.5 text-left outline-none transition-colors ${
                darkMode
                  ? "hover:bg-zinc-800/80 focus-visible:bg-zinc-800/80"
                  : "hover:bg-zinc-100 focus-visible:bg-zinc-100"
              }`}
            >
              {/* Sharp Icon Box */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border text-[13px] ${
                  darkMode ? accentDark : accentLight
                }`}
              >
                <Icon />
              </span>

              <span className="min-w-0 flex-1 flex flex-col justify-center">
                <span
                  className={`block truncate text-[12px] font-semibold tracking-wide ${
                    darkMode ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`block truncate text-[10px] ${
                    darkMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {desc}
                </span>
              </span>

              <FiPlus
                className={`shrink-0 text-[14px] opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${
                  darkMode ? "text-zinc-400" : "text-zinc-500"
                }`}
              />
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default WidgetDrop;
