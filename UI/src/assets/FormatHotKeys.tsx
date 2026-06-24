import React from "react";
import { LuArrowUp, LuOption } from "react-icons/lu";
import { ImWindows } from "react-icons/im";
import { BsCommand } from "react-icons/bs";

interface HotkeyProps {
  hotkeyStr: string;
}

export const FormatHotkey: React.FC<HotkeyProps> = ({ hotkeyStr }) => {
  if (!hotkeyStr) return null;

  const parts = hotkeyStr.split("-");

  return (
    <div className="flex items-center gap-1 text-xs select-none">
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        let icon: React.ReactNode = null;
        let text: string = "";

        // Pure Icon Mapping Matrix (No fallback text strings)
        switch (lowerPart) {
          case "mod":
          case "cmd":
          case "command":
            icon = <BsCommand className="size-3" />; // ⌘ Command Icon
            break;
          case "ctrl":
          case "control":
            icon = <BsCommand className="size-3 font-black" />; // ⌃ Control Icon
            break;
          case "alt":
          case "option":
            icon = <LuOption className="size-3" />; // ⌥ Option Icon
            break;
          case "shift":
            icon = <LuArrowUp className="size-3" />; // ⇧ Shift Icon
            break;
          case "win":
          case "windows":
          case "meta":
            icon = <ImWindows className="size-3" />; // ⊞ Windows Icon
            break;
          default:
            // Standardizes alpha keys to uppercase, preserves multi-letter keys like "Enter"
            text = part.length === 1 ? part.toUpperCase() : part;
            break;
        }

        return (
          <div key={index} className="flex gap-0">
            {/* Keyboard keycap styling */}
            {icon ? icon : <div className="text-xs">{text}</div>}

            {/* Separator plus sign */}
            {index < parts.length - 1 && (
              <span className="text-zinc-400 font-light mx-1 select-none px-0.5 text-[10px]">
                +
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
