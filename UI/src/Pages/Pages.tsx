import React, { useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { VscTerminal } from "react-icons/vsc";
import { Reorder, AnimatePresence } from "motion/react"; // Use "framer-motion" if on an older version
import { useScratchContext } from "../contexts/scratchContext";

interface Props {
  darkMode: boolean;
  allPads: string[];
  setAllPads: React.Dispatch<React.SetStateAction<string[]>>;
  activeSlots: string[];
  setActiveSlots: React.Dispatch<React.SetStateAction<string[]>>;
}

const Pages: React.FC<Props> = ({
  darkMode,
  allPads,
  setAllPads,
  activeSlots,
  setActiveSlots,
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settings = useScratchContext();

  const activeTab = settings.activeSlot;

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

  const hiddenPads = allPads.filter((pad) => !activeSlots.includes(pad));
  const currentActiveName = activeSlots[activeTab];

  // Handler for when motion reorders the items mid-drag
  const handleReorder = (newOrder: string[]) => {
    // Find where the previously active tab name ended up in the new layout order
    const newActiveIndex = newOrder.indexOf(currentActiveName);
    setActiveSlots(newOrder);
    if (newActiveIndex !== -1) {
      settings.setActiveSlot(newActiveIndex);
    }
  };

  return (
    <div className="flex w-full mt-2 items-end px-2 pt-2 select-none gap-1">
      {/* 1. FRAMER MOTION REORDER AXIS WRAPPER */}
      <Reorder.Group
        axis="x"
        values={activeSlots}
        onReorder={handleReorder}
        className="flex gap-1 items-end"
      >
        <AnimatePresence initial={false}>
          {activeSlots.map((name, idx) => {
            const isActive = idx === activeTab;

            return (
              // 2. EACH TAB BECOMES A REORDER ITEM WITH SPRING ANIMATIONS
              <Reorder.Item
                key={name} // Vital for motion layout tracking
                value={name}
                onClick={() => settings.setActiveSlot(idx)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className={`
                  flex items-center justify-between 
                  w-40 h-9 px-3 text-xs font-medium cursor-grab active:cursor-grabbing
                  shrink-0 select-none
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
              >
                <div className="flex items-center gap-2 truncate pointer-events-none">
                  <VscTerminal className="w-4 h-4 opacity-80 shrink-0" />
                  <span className="truncate">{name}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextSlots = activeSlots.filter((_, i) => i !== idx);
                    setActiveSlots(nextSlots);

                    if (activeTab >= nextSlots.length) {
                      settings.setActiveSlot(Math.max(0, nextSlots.length - 1));
                    } else if (activeTab === idx) {
                      settings.setActiveSlot(Math.max(0, idx - 1));
                    }
                  }}
                  className={`p-0.5 rounded transition-colors duration-100 ${
                    darkMode
                      ? "text-gray-400 hover:bg-[#202020] hover:text-white"
                      : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  <IoMdClose className="w-3.5 h-3.5" />
                </button>
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
              absolute left-0 mt-1 w-48 shadow-lg border z-50 overflow-hidden
              ${darkMode ? "bg-[#141413] border-[#3c3c3c] text-gray-300" : "bg-white border-gray-200 text-gray-700"}
            `}
          >
            <div className="max-h-48 overflow-y-auto pb-1">
              {hiddenPads.length > 0 ? (
                hiddenPads.map((name, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const updatedSlots = [...activeSlots];

                      if (activeSlots.length < 3) {
                        setActiveSlots([...activeSlots, name]);
                        settings.setActiveSlot(activeSlots.length);
                      } else {
                        if (activeTab !== 2) updatedSlots[2] = name;
                        else updatedSlots[1] = name;
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
                    <span className="truncate">{name}</span>
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
                  setAllPads([...allPads, newName]);

                  const updatedSlots = [...activeSlots];
                  if (activeSlots.length < 3) {
                    setActiveSlots([...activeSlots, newName]);
                    settings.setActiveSlot(activeSlots.length);
                  } else {
                    updatedSlots[activeTab] = newName;
                    setActiveSlots(updatedSlots);
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
