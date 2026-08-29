import { PiTextAUnderline } from "react-icons/pi";
import type { editorContextType } from "../contexts/editorContext";
import { formatName } from "./functions";

// 🎨 SUB-COMPONENT A: TEXT COLOR PICKER ACTIONS
export const ColorNames = ({
  darkMode,
  color,
  context,
  total,
  idx,
}: {
  darkMode: boolean;
  color: string;
  context: editorContextType;
  idx: number;
  total: number;
}) => {
  return (
    <button
      onClick={() => {
        context.editor
          ?.chain()
          .focus()
          .setMark("textStyle", { color: color.toLowerCase() })
          .run();
        context.setTextColor(color);
      }}
      className={`size-10 flex items-center justify-center text-xs p-1  rounded-md ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } transition-all duration-150`}
    >
      <PiTextAUnderline
        color={idx === total ? (darkMode ? "#ffffff" : "#000000") : color}
        size={22}
      />
    </button>
  );
};

// 🖍️ SUB-COMPONENT B: UNIFIED BACKGROUND HIGHLIGHTER ACTIONS
export const HighLighterNames = ({
  darkMode,
  color,
  context,
  total,
  idx,
}: {
  darkMode: boolean;
  color: string;
  context: editorContextType;
  idx: number;
  total: number;
}) => {
  return (
    <button
      onClick={() => {
        context.editor
          ?.chain()
          .focus()
          .setMark("textStyle", { backgroundColor: color.toLowerCase() })
          .run();
        context.setHighlightedColor(color);
      }}
      className={`size-10 flex items-center justify-center text-xs p-1 rounded-md ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } transition-all duration-150`}
    >
      <PiTextAUnderline
        color={idx === total ? (darkMode ? "#ffffff" : "#000000") : color}
        size={22}
      />
    </button>
  );
};

// 🔤 SUB-COMPONENT C: FONTS SELECTOR ACTIONS
export const FontNames = ({
  darkMode,
  font,
  context,
}: {
  darkMode: boolean;
  font: string;
  context: editorContextType;
}) => {
  return (
    <button
      onClick={() => {
        context.editor?.chain().focus().setFontFamily(font).run();
        context.setFont(font);
      }}
      style={{ fontFamily: font }}
      className={`w-full text-xs px-2 py-1.5 rounded outline-none ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } text-left font-sans`}
    >
      {formatName(font)}
    </button>
  );
};
