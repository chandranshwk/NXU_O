/**
 * @file FormatHotkey.tsx
 * @component FormatHotkey
 * @description A visual keyboard shortcut formatter. It takes a hyphenated hotkey
 * configuration string (e.g., "Mod-Shift-K") and converts its modifier keywords into
 * standard, platform-specific typography design icon shapes.
 *
 * @architecture
 * - Acts as an atomized display component inside configuration lists and settings grids.
 * - Parses incoming modifier tokens down to pure system vector icons without using text strings.
 * - Standardizes alphanumeric action tokens to clean uppercase formats.
 */

import React from "react";
import { LuArrowUp, LuOption } from "react-icons/lu";
import { ImWindows } from "react-icons/im";
import { BsCommand } from "react-icons/bs";

interface HotkeyProps {
  /** The dash-separated shortcut configuration sequence string received from preferences */
  hotkeyStr: string;
}

export const FormatHotkey: React.FC<HotkeyProps> = ({ hotkeyStr }) => {
  // Return empty layout safeguards if string fields arrive blank
  if (!hotkeyStr) return null;

  // Split out separate shortcut key string parts
  const parts = hotkeyStr.split("-");

  return (
    <div className="flex items-center gap-1 text-xs select-none">
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        let icon: React.ReactNode = null;
        let text: string = "";

        // ==========================================
        // MODIFIER SYMBOL VECTOR MAPPING ENGINE
        // ==========================================
        switch (lowerPart) {
          case "mod":
          case "cmd":
          case "command":
            icon = <BsCommand className="size-3" />; // ⌘ Mac OS command key symbol
            break;
          case "ctrl":
          case "control":
            icon = <BsCommand className="size-3 font-black" />; // ⌃ Control key layout symbol
            break;
          case "alt":
          case "option":
            icon = <LuOption className="size-3" />; // ⌥ Alternative option key layout symbol
            break;
          case "shift":
            icon = <LuArrowUp className="size-3" />; // ⇧ Arrow character shift symbol
            break;
          case "win":
          case "windows":
          case "meta":
            icon = <ImWindows className="size-3" />; // ⊞ Desktop native meta menu symbol
            break;
          default:
            // Standardize literal text strings to uniform capitals
            text = part.length === 1 ? part.toUpperCase() : part;
            break;
        }

        return (
          <div key={index} className="flex items-center">
            {/* Visual Key-cap Component Wrapper */}
            {icon ? icon : <div className="text-xs">{text}</div>}

            {/* Separator arithmetic concatenation character tag */}
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
