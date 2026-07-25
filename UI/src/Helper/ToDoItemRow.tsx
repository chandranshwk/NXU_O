import React from "react";
import { FaCheckCircle, FaCircle, FaTrash } from "react-icons/fa";
import type { ToDoItem } from "./ToDoBoard";

interface ToDoItemRowProps {
  item: ToDoItem;
  darkMode: boolean;
  inputRefSetter: (el: HTMLInputElement | null) => void;
  handleToggleCheck: (id: string) => void;
  handleItemTextChange: (id: string, text: string) => void;
  handleItemBlur: () => void;
  setActiveItemFocusId: (id: string) => void;
  handleAddNewItem: () => void;
  handleRemoveItem: (id: string) => void;
}

export const ToDoItemRow: React.FC<ToDoItemRowProps> = ({
  item,
  darkMode,
  inputRefSetter,
  handleToggleCheck,
  handleItemTextChange,
  handleItemBlur,
  setActiveItemFocusId,
  handleAddNewItem,
  handleRemoveItem,
}) => {
  return (
    <div
      data-row-id={item.id}
      className="flex items-center gap-2.5 group/row w-full transition-all"
    >
      <button
        type="button"
        onClick={() => handleToggleCheck(item.id)}
        className="text-zinc-400 hover:text-emerald-500 transition-colors outline-none cursor-pointer shrink-0"
      >
        {item.done ? (
          <FaCheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
        ) : (
          <FaCircle className="w-4 h-4 dark:text-zinc-700 text-zinc-300 group-hover/row:text-zinc-400" />
        )}
      </button>

      <input
        ref={inputRefSetter}
        type="text"
        value={item.text}
        onChange={(e) => handleItemTextChange(item.id, e.target.value)}
        onBlur={handleItemBlur}
        placeholder="List item description..."
        onFocus={(e) => {
          e.stopPropagation();
          setActiveItemFocusId(item.id);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddNewItem();
          }
        }}
        className={`flex-1 text-xs outline-none bg-transparent py-0.5 border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-800 transition-all ${
          item.done
            ? "line-through opacity-40 text-zinc-400 dark:text-zinc-500"
            : darkMode
              ? "text-zinc-200 placeholder-zinc-600"
              : "text-zinc-800 placeholder-zinc-400"
        }`}
      />

      <button
        type="button"
        onClick={() => handleRemoveItem(item.id)}
        className="opacity-0 group-hover/row:opacity-100 text-zinc-400 hover:text-red-500 transition-all p-0.5 rounded outline-none cursor-pointer shrink-0"
      >
        <FaTrash className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
