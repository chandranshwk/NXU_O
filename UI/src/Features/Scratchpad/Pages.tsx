import React, { useRef, useEffect, useState } from "react";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { VscTerminal } from "react-icons/vsc";
import { Reorder, AnimatePresence } from "motion/react";
import { useScratchContext, type FileItem } from "./scratchContext";
import { CgSpinner } from "react-icons/cg";

interface Props {
  darkMode: boolean;
  allPads: FileItem[];
  setAllPads: React.Dispatch<React.SetStateAction<FileItem[]>>;
  activeSlots: FileItem[];
  setActiveSlots: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

const Pages: React.FC<Props> = ({
  darkMode,
  allPads,
  setAllPads,
  activeSlots,
  setActiveSlots,
}) => {
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const settings = useScratchContext();

  const activeTab = settings.activeSlot;

  useEffect(() => {
    if (editingTabName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabName]);

  const currentActiveName = activeSlots[activeTab]
    ? activeSlots[activeTab].name
    : "";

  const handleReorder = (newOrderStrings: string[]) => {
    const restructuredSlots = newOrderStrings.map((stringName) => {
      const existingObj = activeSlots.find((slot) => slot.name === stringName);
      return existingObj ? existingObj : { name: stringName, isSaved: true };
    });

    setActiveSlots(restructuredSlots);
    const newActiveIndex = newOrderStrings.indexOf(currentActiveName);
    if (newActiveIndex !== -1) {
      settings.setActiveSlot(newActiveIndex);
    }
  };

  const submitRename = async (oldName: string) => {
    const cleanedName = renameValue.trim();
    if (!cleanedName || cleanedName === oldName) {
      setEditingTabName(null);
      return;
    }
    const nameExists = allPads.some(
      (p) => p.name.toLowerCase() === cleanedName.toLowerCase(),
    );
    if (nameExists) {
      alert("A pad with that name already exists!");
      setEditingTabName(null);
      return;
    }
    await settings.handleRenamePage(oldName, cleanedName);
    setEditingTabName(null);
  };

  const handleCreatePad = async () => {
    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const nextNum = allPads.length + 1;
    const newName = `Scratch ${nextNum}`;
    const newPadItem: FileItem = { name: newName, isSaved: true };

    setAllPads([...allPads, newPadItem]);
    setActiveSlots([...activeSlots, newPadItem]);
    settings.setActiveSlot(activeSlots.length);

    setIsCreating(false);
  };

  return (
    <div className="flex w-full items-end px-4 select-none gap-1 overflow-hidden">
      <Reorder.Group
        axis="x"
        values={activeSlots.map((el) => el.name)}
        onReorder={handleReorder}
        className="flex gap-1 items-end overflow-x-auto no-scrollbar flex-1"
      >
        <AnimatePresence initial={false}>
          {activeSlots.map((slotItem, idx) => {
            const tabStringName = slotItem.name;
            const isActive = idx === activeTab;
            const isEditing = editingTabName === tabStringName;
            const targetPad = allPads.find((p) => p.name === tabStringName);
            const isSaved = targetPad ? targetPad.isSaved : true;

            return (
              <Reorder.Item
                key={tabStringName}
                value={tabStringName}
                onClick={() => !isEditing && settings.setActiveSlot(idx)}
                drag={!isEditing ? "x" : false}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`
                  flex items-center justify-between shrink-0
                  w-40 h-9 px-3 text-xs font-medium select-none group relative
                  rounded-t-md transition-colors duration-150
                  ${isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
                  ${
                    darkMode
                      ? isActive
                        ? "bg-[#121214] text-zinc-200 border-b-2 border-indigo-500"
                        : "bg-transparent text-zinc-500 hover:bg-zinc-800/40 hover:text-zinc-300 border-b-2 border-transparent"
                      : isActive
                        ? "bg-white text-zinc-800 border-b-2 border-indigo-500 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]"
                        : "bg-transparent text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700 border-b-2 border-transparent"
                  }
                `}
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "F2") {
                    e.preventDefault();
                    setRenameValue(slotItem.name);
                    setEditingTabName(slotItem.name);
                  }
                }}
              >
                <div className="flex items-center gap-2 truncate w-full pr-1">
                  <VscTerminal
                    size={13}
                    className={`shrink-0 transition-opacity ${isActive ? "opacity-100 text-indigo-500" : "opacity-50"}`}
                  />
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => submitRename(tabStringName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitRename(tabStringName);
                        if (e.key === "Escape") setEditingTabName(null);
                      }}
                      className={`w-full outline-none font-medium bg-transparent text-xs ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    />
                  ) : (
                    <span className="truncate pointer-events-none">
                      {slotItem.name}
                    </span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center justify-center w-5 h-5 relative shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextSlots = activeSlots.filter(
                          (_, i) => i !== idx,
                        );
                        setActiveSlots(nextSlots);
                        if (activeTab >= nextSlots.length) {
                          settings.setActiveSlot(
                            Math.max(0, nextSlots.length - 1),
                          );
                        } else if (activeTab === idx) {
                          settings.setActiveSlot(Math.max(0, idx - 1));
                        }
                      }}
                      className={`
                        absolute inset-0 z-10 hidden group-hover:flex items-center justify-center rounded transition-colors duration-100 
                        ${darkMode ? "text-zinc-400 hover:bg-zinc-700 hover:text-white" : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"}
                      `}
                    >
                      <IoMdClose className="w-3.5 h-3.5" />
                    </button>

                    {!isSaved && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full group-hover:hidden ${darkMode ? "bg-indigo-400" : "bg-indigo-500"}`}
                      />
                    )}

                    {isActive && settings.saveStatus && (
                      <span
                        className={`absolute z-20 inline-flex items-center justify-center w-6 h-5 rounded-md shadow-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 group-hover:hidden`}
                      >
                        {settings.saveStatus === "Saving..." && (
                          <CgSpinner className="animate-spin h-3.5 w-3.5 text-amber-500" />
                        )}
                      </span>
                    )}
                  </div>
                )}
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Integrated Add Button */}
      <button
        onClick={handleCreatePad}
        disabled={isCreating}
        className={`
          flex items-center justify-center w-8 h-8 mb-0.5 rounded-md transition-all duration-150 shrink-0
          ${darkMode ? "text-zinc-400 hover:bg-zinc-800 hover:text-white" : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"}
          ${isCreating ? "opacity-50 cursor-not-allowed" : "active:scale-95"}
        `}
        title="New Pad"
      >
        {isCreating ? (
          <CgSpinner className="animate-spin w-4 h-4" />
        ) : (
          <IoMdAdd className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default Pages;
