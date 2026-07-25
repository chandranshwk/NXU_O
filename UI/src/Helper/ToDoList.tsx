import React from "react";
import { ToDoItemRow } from "./ToDoItemRow";
import { type ToDoItem } from "./ToDoBoard";

interface ToDoListProps {
  localItems: ToDoItem[];
  darkMode: boolean;
  inputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
  handleToggleCheck: (id: string) => void;
  handleItemTextChange: (id: string, text: string) => void;
  handleItemBlur: () => void;
  setActiveItemFocusId: (id: string) => void;
  handleAddNewItem: () => void;
  handleRemoveItem: (id: string) => void;
}

export const ToDoList: React.FC<ToDoListProps> = ({
  localItems,
  darkMode,
  inputRefs,
  handleToggleCheck,
  handleItemTextChange,
  handleItemBlur,
  setActiveItemFocusId,
  handleAddNewItem,
  handleRemoveItem,
}) => {
  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1 no-scrollbar cursor-default">
      {localItems.map((item) => (
        <ToDoItemRow
          key={item.id}
          item={item}
          darkMode={darkMode}
          inputRefSetter={(el) => {
            inputRefs.current[item.id] = el;
          }}
          handleToggleCheck={handleToggleCheck}
          handleItemTextChange={handleItemTextChange}
          handleItemBlur={handleItemBlur}
          setActiveItemFocusId={setActiveItemFocusId}
          handleAddNewItem={handleAddNewItem}
          handleRemoveItem={handleRemoveItem}
        />
      ))}
    </div>
  );
};
