import React, { useState, useRef, useEffect } from "react";

interface DropdownProps {
  icon: React.ReactNode;
  title: string;
  darkMode: boolean;
  children: React.ReactNode;
  width?: string;
  type: "blocks" | "col";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the popup window automatically if the developer clicks anywhere outside of it
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
      {type == "col" ? (
        <div ref={dropdownRef} className={` relative inline-block text-left`}>
          {/* TRIGGER TRIGGER BUTTON ELEMENT */}
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
              className={`${width ? width : "w-4 h-4"}  flex items-center justify-center`}
            >
              {icon}
            </div>
          </button>

          {/* FLOATING POPUP LAYOUT CONTAINER BOX */}
          {isOpen && (
            <div
              className={`absolute left-0 mt-1 ${wDropDown ? wDropDown : "w-40"} rounded-lg shadow-xl border p-1 z-50 flex flex-col gap-0.5 outline-none ${
                darkMode
                  ? "bg-[#1f1f23] border-[#242425ab] text-zinc-200"
                  : "bg-white border-slate-200 text-gray-700"
              }`}
              onClick={() => setIsOpen(false)} // Snap shut automatically after clicking a choice option
            >
              {children}
            </div>
          )}
        </div>
      ) : (
        <div
          ref={dropdownRef}
          className={`relative inline-block text-left ${darkMode ? "bg-zinc-800" : "bg-white"}`}
        >
          {/* TRIGGER BUTTON ELEMENT */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={`p-2 rounded flex items-center justify-center gap-1 transition-all outline-none border border-transparent ${
              isOpen
                ? "shadow-inner font-semibold"
                : darkMode
                  ? "hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  : "hover:bg-gray-200 text-gray-500 hover:text-gray-900"
            }`}
          >
            <div
              className={`${width ? width : "w-4"} h-4 flex items-center justify-center`}
            >
              {icon}
            </div>
          </button>

          {/* 🎨 FIXED NON-COL POPUP: CONVERTS INTO A TEXTLESS 3-COLUMN ICON MATRIX GRID */}
          {isOpen && (
            <div
              className={`absolute left-0 mt-1 min-w-30 shadow-xl border p-2 z-50 outline-none 
      grid grid-cols-3 justify-items-center gap-y-1
      [&_span]:hidden [&_button]:p-1 [&_button]:flex [&_button]:items-center [&_button]:justify-center
      
      last:col-span-3 [&_>_*:last-child]:col-span-3 [&_>_*:last-child]:w-full [&_>_*:last-child]:text-center
      
      ${
        darkMode
          ? "bg-[#1f1f23] border-[#242425ab] text-zinc-200"
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
