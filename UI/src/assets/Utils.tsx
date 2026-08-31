/**
 * @file utils.tsx
 * @description A collection of modular sub-component swatches for the toolbar.
 * Provides atomized button components to handle character updates like inline font colors,
 * background highlights, and font family families.
 *
 * @architecture
 * - Plugs straight into the reusable matrix formats provided by `<ToolbarDropdown />`.
 * - Dispatches transactional inline formatting instructions directly into TipTap via `setMark`.
 * - Holds selection focus locked using chained text commands to avoid typing disruptions.
 */

import { PiTextAUnderline } from "react-icons/pi";
import type { editorContextType } from "../contexts/editorContext";
import { formatName } from "./functions";

// =========================================================================
// SUB-COMPONENT A: TEXT COLOR PICKER ACTIONS
// =========================================================================
/**
 * Renders an atomized color picker button element swatch. Applies inline color
 * properties directly to highlighted text sections without losing cursor focus.
 */
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
      type="button"
      onClick={() => {
        // Inject inline custom text styles and update context tags instantly
        context.editor
          ?.chain()
          .focus()
          .setMark("textStyle", { color: color.toLowerCase() })
          .run();
        context.setTextColor(color);
      }}
      className={`size-10 flex items-center justify-center text-xs p-1 rounded-md ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } transition-all duration-150`}
    >
      <PiTextAUnderline
        // Visual Fallback Rule: Renders high-contrast monochrome icons for the final index swatch card
        color={idx === total ? (darkMode ? "#ffffff" : "#000000") : color}
        size={22}
      />
    </button>
  );
};

// =========================================================================
// SUB-COMPONENT B: UNIFIED BACKGROUND HIGHLIGHTER ACTIONS
// =========================================================================
/**
 * Renders an atomized background highlight swatch. Implements text background changes
 * across the selected data strings.
 */
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
      type="button"
      onClick={() => {
        // Inject custom background styling tags and update active highlight indicators
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

// =========================================================================
// SUB-COMPONENT C: FONTS SELECTOR ACTIONS
// =========================================================================
/**
 * Renders a full-width font family row option trigger. Modifies active typography selection blocks
 * using styled list elements.
 */
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
      type="button"
      onClick={() => {
        // Dispatch type family re-assignments directly down to active text markers
        context.editor?.chain().focus().setFontFamily(font).run();
        context.setFont(font);
      }}
      style={{ fontFamily: font }}
      className={`w-full text-xs px-2 py-1.5 rounded outline-none ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } text-left font-sans`}
    >
      {/* Clean labels into readable names via regex helpers */}
      {formatName(font)}
    </button>
  );
};
