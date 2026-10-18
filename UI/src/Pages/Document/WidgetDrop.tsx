import React from "react";
import { FiType, FiPlus } from "react-icons/fi";
import { useCanvas } from "../../contexts/Canvas/CanvasContext";
import type { NodeComponentType } from "../../assets/SAMPLE";

// Semantic visual anchors for node types
const NODE_TYPES: {
  type: NodeComponentType;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
}[] = [
  {
    type: "text",
    label: "Text",
    desc: "Notes & markdown",
    Icon: FiType,
    accent: "bg-blue-50 text-blue-600 border-blue-100",
  },
];

const WidgetDrop = () => {
  const canvas = useCanvas();

  if (!canvas.widgetOpen) return null;

  const handleAddNode = (type: NodeComponentType) => {
    canvas.addNode?.(type);
    canvas.setWidgetOpen?.(false);
  };

  return (
    <div
      className="absolute top-20 right-6 z-50 flex w-72 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
      role="menu"
      aria-label="Canvas blocks"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-[13px] font-semibold tracking-tight text-slate-900">
          Add Node
        </h3>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
          Select a node to place on the canvas
        </p>
      </div>

      {/* Block list */}
      <div className="custom-scrollbar max-h-95 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
        {NODE_TYPES.map(({ type, label, desc, Icon, accent }) => (
          <button
            key={type}
            type="button"
            role="menuitem"
            onClick={() => handleAddNode(type)}
            className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[15px] transition-transform duration-150 group-hover:scale-[1.04] ${accent}`}
            >
              <Icon />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-slate-700 transition-colors group-hover:text-slate-900">
                {label}
              </span>
              <span className="block truncate text-[11px] leading-relaxed text-slate-400">
                {desc}
              </span>
            </span>

            <FiPlus className="shrink-0 text-[15px] text-slate-300 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default WidgetDrop;
