import React, { useEffect, useRef, useState } from "react";
import { useSettings } from "../contexts/settingsContext";

export interface HeaderProps {
  idx: number;
  name: string;
  time: string | Date;
  date: string | Date;
  updateAttributes?: (attributes: { [key: string]: unknown }) => void;
  selected?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  idx,
  name,
  time,
  date,
  updateAttributes,
  selected,
}) => {
  const { darkMode } = useSettings();
  const inputRef = useRef<HTMLInputElement>(null);

  const [localValue, setLocalValue] = useState(name);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setLocalValue(name);
  }, [name]);

  const forceInputFocus = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus();
      if (localValue === "Hello from Tiptap!" || localValue === "") {
        inputRef.current.select();
      }
    }
  };

  useEffect(() => {
    if (selected && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        if (localValue === "Hello from Tiptap!" || localValue === "") {
          inputRef.current?.select();
        }
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [selected, localValue]);

  const formatTime = (timeInput: string | Date): string => {
    if (!timeInput) return "";
    const dateObj =
      typeof timeInput === "string" ? new Date(timeInput) : timeInput;
    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      return dateObj
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .toLowerCase();
    }
    return String(timeInput).toLowerCase();
  };

  const formatDate = (dateInput: string | Date): string => {
    if (!dateInput) return "";
    const dateObj =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      return dateObj
        .toLocaleDateString([], { dateStyle: "medium" })
        .toLowerCase();
    }
    return String(dateInput).toLowerCase();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setLocalValue(nextValue);

    if (updateAttributes) {
      updateAttributes({ name: nextValue });
    }
  };

  return (
    <h1
      onMouseDown={forceInputFocus}
      onClick={forceInputFocus}
      className={`p-2 pl-0 font-bold transition-colors w-full duration-200 flex flex-col gap-1 custom-header-block-${idx} ${
        darkMode ? "text-white" : "text-black"
      }`}
      style={{ color: darkMode ? "#ffffff" : "#000000" }}
    >
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleNameChange}
        placeholder="Enter header title..."
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
            window.getSelection()?.removeAllRanges();
          }
        }}
        onFocus={(e) => e.stopPropagation()}
        className={`border-b py-1 pr-5 font-bold tracking-tight outline-none bg-transparent w-full max-w-xl transition-colors ${
          darkMode
            ? "text-white border-zinc-700 focus:border-zinc-500 placeholder-zinc-600"
            : "text-black border-zinc-200 focus:border-zinc-400 placeholder-zinc-400"
        }`}
      />

      <span
        className={`text-[10px] font-normal tracking-wide space-x-1.5 select-none mt-0.5 ${
          darkMode ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        <span>{formatDate(date)}</span>
        <span className={darkMode ? "text-zinc-600" : "text-zinc-300"}>•</span>
        <span>{formatTime(time)}</span>
      </span>
    </h1>
  );
};

export default Header;
