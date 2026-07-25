import React from "react";

interface ToDoHeaderProps {
  darkMode: boolean;
  localTitle: string;
  date: string | Date;
  time: string | Date;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatDate: (d: string | Date) => string;
  formatTime: (t: string | Date) => string;
}

export const ToDoHeader: React.FC<ToDoHeaderProps> = ({
  darkMode,
  localTitle,
  date,
  time,
  titleInputRef,
  handleTitleChange,
  formatDate,
  formatTime,
}) => {
  return (
    <div className="flex flex-col gap-0.5 border-b pb-2 border-zinc-200/40 dark:border-zinc-800/40 no-drag cursor-default">
      <input
        ref={titleInputRef}
        type="text"
        value={localTitle}
        onChange={handleTitleChange}
        placeholder="Enter checklist title..."
        className={`font-bold text-sm tracking-tight outline-none bg-transparent w-full ${
          darkMode
            ? "text-zinc-100 placeholder-zinc-600"
            : "text-zinc-900 placeholder-zinc-400"
        }`}
      />
      <div className="flex items-center gap-1.5 text-[9px] font-normal text-zinc-400 select-none">
        <span>{formatDate(date)}</span>
        <span className="opacity-40">•</span>
        <span>{formatTime(time)}</span>
      </div>
    </div>
  );
};
