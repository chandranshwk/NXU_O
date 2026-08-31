/**
 * @file Pages.tsx (Snippet 1)
 * @component Pages
 * @description Tab manager header for scratchpads. It handles tab switching,
 * horizontal dragging for reordering, multi-device screen breakpoints, and
 * page renaming utilities.
 *
 * @architecture
 * - Leverages `motion/react` (Framer Motion) `Reorder` components to handle x-axis sorting.
 * - Monitors screen width metrics using an optimized `resize` event handler break loop.
 * - Forces tab truncation onto single slots when window footprints drop beneath xl (1280px) bounds.
 */

import React, { useRef, useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoMdClose, IoMdAdd } from "react-icons/io";
import { VscTerminal } from "react-icons/vsc";
import { Reorder, AnimatePresence } from "motion/react";
import { useScratchContext, type FileItem } from "../contexts/scratchContext";
import { CgSpinner } from "react-icons/cg";

interface Props {
  /** Shared dark mode setting flag used to switch visual palette ranges */
  darkMode: boolean;
  /** Comprehensive directory list array housing all existing scratchpad records */
  allPads: FileItem[];
  /** Upstream state dispatcher modifying global file storage registry items */
  setAllPads: React.Dispatch<React.SetStateAction<FileItem[]>>;
  /** Collection mapping pad rows actively opened in tabs across the bar */
  activeSlots: FileItem[];
  /** Upstream state dispatcher modifying open tab row configurations */
  setActiveSlots: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

const Pages: React.FC<Props> = ({
  darkMode,
  allPads,
  setAllPads,
  activeSlots,
  setActiveSlots,
}) => {
  /** Visibility toggle flag controlling the dropdown overflow menu layout pane */
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  /** Tracks the specific string filename currently chosen for inline renaming */
  const [editingTabName, setEditingTabName] = useState<string | null>(null);
  /** Local text input state tracking active typing buffers inside rename inputs */
  const [renameValue, setRenameValue] = useState<string>("");

  /** Backup variable caching open tab structures before screen constraints downscale widths */
  const [rememberedSlots, setRememberedSlots] =
    useState<FileItem[]>(activeSlots);
  /** Breakpoint indicator reporting true if window footprints fall below 1280px boundaries */
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  /** Root anchor reference monitoring click bounds across dropdown list cards */
  const dropdownRef = useRef<HTMLDivElement>(null);
  /** Focus link target used to capture text text highlights when editing fields launch */
  const inputRef = useRef<HTMLInputElement>(null);
  /** Core state provider tracking scratchpad variables and disk command actions */
  const settings = useScratchContext();

  /** Index position pointing to the active targeted tab row */
  const activeTab = settings.activeSlot;
  /** Activity flag tracking background write loading streams */
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // ==========================================
  // LIFECYCLE 1: RESPONSIBLE RESPONSIVE RE-FLOW
  // ==========================================
  /**
   * Screen Boundary Monitoring Hook: Monitors window modifications [31/08/2026].
   * If screen real estate drops below 1280px, it isolates focus down to exactly
   * 1 visible slot; it restores the full tab array once window fields maximize.
   */
  useEffect(() => {
    const handleResize = () => {
      const smallBreakpoint = window.innerWidth < 1280; // Matches Tailwind's 'xl' breakpoint
      setIsSmallScreen(smallBreakpoint);

      if (smallBreakpoint) {
        // If transitioning down to compact views, isolate down to exactly the active tab
        const currentActiveSlot = activeSlots[activeTab];
        if (currentActiveSlot && activeSlots.length > 1) {
          // Store a backup copy of your current open files layout first
          setRememberedSlots(activeSlots);
          setActiveSlots([currentActiveSlot]);
          settings.setActiveSlot(0); // Reset slot pointer to the single open slot safely
        }
      } else {
        // When maximized back out, restore the original multi-tab structure smoothly
        if (rememberedSlots.length > 0 && activeSlots.length === 1) {
          setActiveSlots(rememberedSlots);

          // Locate where the current filename position maps inside the re-aligned index
          const currentActiveName = activeSlots[0]?.name;
          const restoredIndex = rememberedSlots.findIndex(
            (s) => s.name === currentActiveName,
          );
          if (restoredIndex !== -1) {
            settings.setActiveSlot(restoredIndex);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    // Execute an initial check on load to configure proper layout constraints
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab, activeSlots, rememberedSlots, settings, setActiveSlots]);

  // ==========================================
  // LIFECYCLE 2: AUTOMATED TEXT FOCUS SECTOR
  // ==========================================
  /** Shifts typing focus parameters directly down to rename elements on command triggers */
  useEffect(() => {
    if (editingTabName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Highlight existing text layout automatically
    }
  }, [editingTabName]);

  // ==========================================
  // LIFECYCLE 3: OVERLAY PANEL DISMISSAL CAPTURE
  // ==========================================
  /** Automatically dismisses the file picker dropdown if clicking background elements */
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

  /** Filters out active tab instances to list closed document targets inside overflow paths */
  const hiddenPads = allPads.filter((pad) => {
    if (isSmallScreen) {
      return pad.name !== activeSlots[0]?.name;
    }
    return !activeSlots.some((slot) => slot.name === pad.name);
  });

  const currentActiveName = activeSlots[activeTab]
    ? activeSlots[activeTab].name
    : "";

  // ==========================================
  // ARRANGEMENT HANDLERS: DRAG REORDER SYNC
  // ==========================================
  /** Updates the array order when dragging operations complete on tab items */
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

  // ==========================================
  // BACKEND DISPATCH: TAURI SYSTEM RENAME
  // ==========================================
  /** Validates entry strings, checks for collisions, and writes updates down to disk */
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
                  ${isEditing ? "cursor-default" : "cursor-grab "}
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
                        // Escape Hatch: Closes the editing input wrapper without saving changes
                        if (e.key === "Escape") setEditingTabName(null);
                      }}
                      className={`w-full outline-none font-medium bg-transparent text-xs ${
                        darkMode ? "text-white" : "text-black"
                      }`}
                    />
                  ) : (
                    /* STATIC NAME LABEL SEGMENT */
                    <span className="truncate pointer-events-none">
                      {slotItem.name}
                    </span>
                  )}
                </div>

                {/* ==========================================
                    TAB CLOSURE INTERACTION ROUTER CONTROL
                    ========================================== */}
                {!isEditing && (
                  <div className="flex items-center justify-center w-5 h-5 relative shrink-0">
                    {/* Tab Close Trigger Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Block focus changes from triggering on the background tab card row
                        const nextSlots = activeSlots.filter(
                          (_, i) => i !== idx,
                        );
                        setActiveSlots(nextSlots);

                        // Structural index correction: prevents active slots from falling beyond array lengths
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

                    {/* Unsaved indicator circle (hidden when mouse hovers over options) */}
                    {!isSaved && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full group-hover:hidden ${
                          darkMode ? "bg-zinc-50" : "bg-zinc-900"
                        }`}
                      />
                    )}

                    {/* ==========================================
                        REAL-TIME CORE DISK MONITOR SWATCH
                        ========================================== */}
                    {isActive && settings.saveStatus && (
                      <span
                        className={`absolute z-20 inline-flex items-center justify-center w-6 h-5 rounded-md shadow-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-1 duration-200 group-hover:hidden`}
                      >
                        {settings.saveStatus === "Saving..." && (
                          /* Spinning Loader Swatch Loop */
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

      {/* ==========================================
          OVERFLOW NAVIGATION TRACK SYSTEM
          ========================================== */}
      <div className="relative" ref={dropdownRef}>
        {/* Overflow Trigger Arrow Actuator */}
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

        {/* OVERFLOW DRAWER OVERLAY MATRIX BOX */}
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
                  /* HIDDEN ELEMENT LIST ROW ITEM */
                  <div
                    key={index}
                    onClick={() => {
                      if (isSmallScreen) {
                        setActiveSlots([item]);
                        settings.setActiveSlot(0);
                      } else {
                        const updatedSlots = [...activeSlots];
                        // Limit visible tab slots strictly to a maximum configuration of 3 rows
                        if (activeSlots.length < 3) {
                          setActiveSlots([...activeSlots, item]);
                          settings.setActiveSlot(activeSlots.length);
                        } else {
                          // Swap out non-focused rows cleanly to clear placement spaces
                          if (activeTab !== 2) updatedSlots[2] = item;
                          else updatedSlots[1] = item;
                          setActiveSlots(updatedSlots);
                        }
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
                /* FALLBACK STATE MAP CARD VALUE */
                <div className="px-3 py-2 text-xs italic text-gray-500">
                  All pads are active
                </div>
              )}
            </div>

            {/* ==========================================
                ACTION ELEMENT ROAD: ASYNC SPAN NEW DRAFT PAGE
                ========================================== */}
            <div
              className={`border-t px-2 py-1.5 ${darkMode ? "border-[#3c3c3c] bg-[#121212]" : "border-gray-200 bg-gray-50"}`}
            >
              <button
                disabled={isCreating}
                onClick={async () => {
                  setIsCreating(true);

                  // Injects a deliberate 300ms aesthetic frame freeze to simulate desktop file allocation threads
                  await new Promise((resolve) => setTimeout(resolve, 300));

                  const nextNum = allPads.length + 1;
                  const newName = `Scratch ${nextNum}`;

                  const newPadItem: FileItem = {
                    name: newName,
                    isSaved: true,
                  };

                  setAllPads([...allPads, newPadItem]);

                  if (activeSlots.length < 3) {
                    setActiveSlots([...activeSlots, newPadItem]);
                    settings.setActiveSlot(activeSlots.length);
                  } else {
                    const updatedSlotsCopy = [...activeSlots];
                    updatedSlotsCopy[activeTab] = newPadItem;
                    setActiveSlots(updatedSlotsCopy);
                  }

                  setIsCreating(false);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center justify-center gap-1.5 w-full py-1.5 rounded text-xs font-medium transition-all duration-150
                  ${isCreating ? "opacity-70 cursor-not-allowed" : ""}
                  ${
                    darkMode
                      ? "bg-[#181818] text-gray-200 hover:bg-[#212121] hover:text-white"
                      : "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {isCreating ? (
                  /* ASYNC WRITING LOADING STATE INDICATOR DISPLAY LOOP */
                  <>
                    <CgSpinner className="animate-spin h-3.5 w-3.5" />
                    <span>Creating Pad...</span>
                  </>
                ) : (
                  /* STANDARD STATIC INVITATION ACCENT */
                  <>
                    <IoMdAdd className="w-3.5 h-3.5" />
                    <span>Add New Pad</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pages;
