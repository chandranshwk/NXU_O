import React, { useRef, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { VscTerminal } from "react-icons/vsc";
import { Reorder, AnimatePresence } from "motion/react";
import { useScratchContext, type FileItem } from "../contexts/scratchContext";
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
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [editingTabName, setEditingTabName] = useState<string | null>(null); // Tracks tab name being renamed
  const [renameValue, setRenameValue] = useState<string>(""); // Temporary state holding current typed changes

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const settings = useScratchContext();

  const activeTab = settings.activeSlot;

  // Auto-focus the rename input layout box when F2 is triggered
  useEffect(() => {
    if (editingTabName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Highlight existing text layout automatically
    }
  }, [editingTabName]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const hiddenPads = allPads.filter(
    (pad) => !activeSlots.some((slot) => slot.name === pad.name),
  );
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

  // Submits the name change to Tauri backend disk system
  const submitRename = async (oldName: string) => {
    const cleanedName = renameValue.trim();
    if (!cleanedName || cleanedName === oldName) {
      setEditingTabName(null);
      return;
    }

    // Verify if name already exists inside current list items
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

  return (
    <div className="flex w-full mt-2 items-end px-2 pt-2 select-none gap-1">
      <Reorder.Group
        axis="x"
        values={activeSlots.map((el) => el.name)}
        onReorder={handleReorder}
        className="flex gap-1 items-end"
      >
        <AnimatePresence initial={false}>
          {activeSlots.map((slotItem, idx) => {
            const tabStringName = slotItem.name;
            const isActive = idx === activeTab;
            const isEditing = editingTabName === tabStringName;

            const targetPad = allPads.find((p) => p.name === tabStringName);
            const isSaved = targetPad ? targetPad.isSaved : true;

            console.log(activeSlots);

            return (
              <Reorder.Item
                key={tabStringName}
                value={tabStringName}
                onClick={() => !isEditing && settings.setActiveSlot(idx)}
                drag={!isEditing ? "x" : false} // Disable dragging layout when editing tab labels
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`
                  flex items-center justify-between 
                  w-40 h-9 px-3 text-xs font-medium shrink-0 select-none group relative
                  ${isEditing ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
                  ${isActive ? "flex items-center justify-between w-40" : "hidden xl:flex items-center justify-between w-40"}
                  ${
                    darkMode
                      ? isActive
                        ? "bg-[#121211] text-gray-200 border-b border-white/50"
                        : "bg-transparent text-gray-400 hover:bg-[#191919]"
                      : isActive
                        ? "bg-[#ffffff] text-gray-800 border-b border-black/50"
                        : "bg-transparent text-gray-500 hover:bg-[#e4e4e7]"
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
                  <VscTerminal className="w-4 h-4 opacity-80 shrink-0" />
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
                        ${darkMode ? "text-gray-400 hover:bg-[#202020] hover:text-white" : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"}
                      `}
                    >
                      <IoMdClose className="w-3.5 h-3.5" />
                    </button>

                    {!isSaved && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full group-hover:hidden ${
                          darkMode ? "bg-zinc-50" : "bg-zinc-900"
                        }`}
                      />
                    )}
                    {isActive && settings.saveStatus && (
                      <span
                        className={`absolute z-20 inline-flex items-center justify-center w-6 h-5 rounded-md shadow-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 group-hover:hidden`}
                      >
                        {/* DYNAMIC REACT-ICONS SWITCHER */}
                        {settings.saveStatus === "Saving..." && (
                          /* PURE BUFFER SPINNER LOADER */
                          <CgSpinner className="animate-spin h-3.5 w-3.5 text-amber-200" />
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

      {/* DROPDOWN TRACK */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center justify-center gap-1
            h-8 px-2 mb-0.5 rounded-md transition-all duration-150 text-xs font-medium
            ${darkMode ? "text-gray-400 hover:bg-[#1b1b1b] hover:text-white" : "text-gray-500 hover:bg-[#ffffff] hover:text-gray-900 hover:shadow-sm"}
          `}
        >
          <FaChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            className={`
              absolute left-0 mt-1 w-48 shadow-lg border z-50 overflow-hidden rounded-md
              ${darkMode ? "bg-[#141413] border-[#3c3c3c] text-gray-300" : "bg-white border-gray-200 text-gray-700"}
            `}
          >
            <div className="max-h-48 overflow-y-auto pb-1">
              {hiddenPads.length > 0 ? (
                hiddenPads.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const updatedSlots = [...activeSlots];

                      if (activeSlots.length < 3) {
                        setActiveSlots([...activeSlots, item]);
                        settings.setActiveSlot(activeSlots.length);
                      } else {
                        if (activeTab !== 2) updatedSlots[2] = item;
                        else updatedSlots[1] = item;
                        setActiveSlots(updatedSlots);
                      }

                      setIsOpen(false);
                    }}
                    className={`
                      flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer
                      ${darkMode ? "hover:bg-[#191919] hover:text-white" : "hover:bg-gray-50 hover:text-gray-900"}
                    `}
                  >
                    <VscTerminal className="w-3.5 h-3.5 opacity-60" />
                    <span className="truncate">{item.name}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-xs italic text-gray-500">
                  All pads are active
                </div>
              )}
            </div>

            <div
              className={`border-t px-2 py-1.5 ${darkMode ? "border-[#3c3c3c] bg-[#121212]" : "border-gray-200 bg-gray-50"}`}
            >
              <button
                onClick={() => {
                  const nextNum = allPads.length + 1;
                  const newName = `Scratch ${nextNum}`;

                  // 1. Define a cleanly structured new pad item object
                  const newPadItem: FileItem = {
                    name: newName,
                    isSaved: false,
                  };

                  // 2. Add it to your global tracking array
                  setAllPads([...allPads, newPadItem]);

                  if (activeSlots.length < 3) {
                    // If there's room, append the new object cleanly to the end of the tabs bar
                    setActiveSlots([...activeSlots, newPadItem]);
                    settings.setActiveSlot(activeSlots.length);
                  } else {
                    // ✨ FIX: Clone your slots array and replace the active index with the new OBJECT structure
                    const updatedSlotsCopy = [...activeSlots];
                    updatedSlotsCopy[activeTab] = newPadItem;
                    setActiveSlots(updatedSlotsCopy);
                  }
                  setIsOpen(false);
                }}
                className={`
                  flex items-center justify-center gap-1.5 w-full py-1 rounded text-xs font-medium transition-colors
                  ${
                    darkMode
                      ? "bg-[#181818] text-gray-200 hover:bg-[#212121] hover:text-white"
                      : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <IoMdAdd className="w-3.5 h-3.5" />
                Add New Pad
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pages;
