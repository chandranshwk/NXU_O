/**
 * @file ToolbarDropdown.tsx
 * @component ToolbarDropdown
 * @description A multi-purpose toolbar dropdown chassis. It dynamically adapts
 * its rendering geometry into either a traditional vertical text list or a high-density,
 * 3-column visual icon matrix grid based on formatting preferences.
 *
 * @architecture
 * - Controls menu closure triggers by listening to raw background mousedown event captures.
 * - Exploits CSS grid selectors to hide textual span descriptions when switching to grid layouts.
 * - Enforces absolute boundary layering via z-50 metrics to bypass container scroll truncation.
 */

import React, { useState, useRef, useEffect } from "react";

interface DropdownProps {
  /** Target icon asset rendered on the primary activation trigger button */
  icon: React.ReactNode;
  /** Label identifier displaying fallback tooltips upon hover events */
  title: string;
  /** Shared dark mode setting flag used to switch palette ranges */
  darkMode: boolean;
  /** Child list buttons or grid swatches injected into the popup pane */
  children: React.ReactNode;
  /** Optional override constraint altering standard visual button widths */
  width?: string;
  /** Structural mode controller: 'col' maps a text list, 'blocks' maps an icon grid */
  type: "blocks" | "col";
  /** Optional dimension string defining specific layout overlay panel widths */
  wDropDown?: string;
}

export const ToolbarDropdown: React.FC<DropdownProps> = ({
  icon,
  title,
  darkMode,
  children,
  width,
  type,
  wDropDown,
}) => {
  /** Visibility toggle flag controlling the floating context overlay card */
  const [isOpen, setIsOpen] = useState(false);
  /** Node reference point monitoring outside background click intersections */
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // LIFECYCLE: BACKGROUND DISMISSAL CAPTURE
  // ==========================================
  /**
   * Universal Outside Click Disposer: Intercepts raw window mousedown events.
   * Instantly dismisses visible overlays if click operations land outside bounds.
   */
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      {/* ==========================================
          BRANCH A: STANDARD COLUMNAR VALUE DROPDOWN LIST (type == "col")
          ========================================== */}
      {type == "col" ? (
        <div ref={dropdownRef} className={` relative inline-block text-left`}>
          {/* CONTROL SWITCH ACTUATOR NODE */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            title={title}
            className={`rounded flex items-center justify-center group gap-1 transition-all outline-none border border-transparent ${
              isOpen
                ? " shadow-inner font-semibold"
                : darkMode
                  ? "hover:bg-black text-zinc-400 hover:text-white"
                  : "hover:bg-zinc-100 text-gray-500 hover:text-zinc-900"
            }`}
          >
            <div
              className={`${width ? width : "w-4 h-4"} gap-4 flex items-center justify-center`}
            >
              {icon}
            </div>
          </button>

          {/* FLOATING TEXTUAL POPUP ITEM STREAM SHEET */}
          {isOpen && (
            <div
              className={`absolute left-0 mt-1 ${wDropDown ? wDropDown : "w-40"} rounded-lg shadow-xl border p-1 z-50 flex flex-col gap-0.5 outline-none ${
                darkMode
                  ? "bg-[#121211] border-[#242425ab] text-zinc-200"
                  : "bg-white border-slate-200 text-gray-700"
              }`}
              onClick={() => setIsOpen(false)} // Snap menu shut automatically after selecting an option
            >
              {children}
            </div>
          )}
        </div>
      ) : (
        /* ==========================================
           BRANCH B: COMPACT 3-COLUMN ICON MATRIX SELECTION GRID (type == "blocks")
           ========================================== */
        <div
          ref={dropdownRef}
          className={`relative inline-block text-left rounded-md ${darkMode ? "bg-[#191919]" : "bg-white"}`}
        >
          {/* GRID ACTIVATOR ENTRY BUTTON */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`p-2 rounded flex items-center justify-center gap-1 transition-all outline-none border border-transparent ${
              isOpen
                ? "shadow-inner font-semibold"
                : darkMode
                  ? "hover:bg-zinc-900 text-zinc-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            }`}
          >
            <div
              className={`${width ? width : "w-4"} h-4 flex items-center justify-center`}
            >
              {icon}
            </div>
          </button>

          {/* COMPACT MATRIX GRID PANEL OVERLAY
              Bypasses text descriptions by forcing span nodes hidden (`[&_span]:hidden`).
              Enforces clear horizontal sizing alignment inside item slots. */}
          {isOpen && (
            <div
              className={`absolute left-0 mt-1 min-w-30 shadow-xl border p-2 z-50 outline-none 
      grid grid-cols-3 justify-items-center gap-y-1
      [&_span]:hidden [&_button]:p-1 [&_button]:flex [&_button]:items-center [&_button]:justify-center
      
      /* Special layout rule: Expand the final option block to span the full grid width */
      last:col-span-3 [&_>_*:last-child]:col-span-3 [&_>_*:last-child]:w-full [&_>_*:last-child]:text-center
      
      ${
        darkMode
          ? "bg-[#121211] border-[#242425ab] text-zinc-200"
          : "bg-white border-slate-200 text-gray-700"
      }
    `}
              onClick={() => setIsOpen(false)}
            >
              {children}
            </div>
          )}
        </div>
      )}
    </>
  );
};
