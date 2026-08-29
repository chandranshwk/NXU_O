// FloatingToolbar.data.tsx
import { useMemo } from "react";
import type { Editor } from "@tiptap/core";
import { BsParagraph, BsBlockquoteLeft } from "react-icons/bs";
import { PiListBulletsLight } from "react-icons/pi";
import { RiListOrdered } from "react-icons/ri";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiItalic,
  FiUnderline,
} from "react-icons/fi";
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
  LuStrikethrough,
} from "react-icons/lu";

export interface EditorProperties {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikeThrough: boolean;
  alignment: string;
}

interface UseToolbarConfigsProps {
  editor: Editor;
  properties: EditorProperties;
  darkMode: boolean;
}

export const useToolbarConfigs = ({
  editor,
  properties,
  darkMode,
}: UseToolbarConfigsProps) => {
  return useMemo(() => {
    // Dynamic color helper that handles theme conditions and selection active-states in tandem
    const getIconColor = (isActive: boolean) => {
      if (isActive) return "white";
      return darkMode ? "rgb(161, 161, 170)" : "black"; // zinc-400 for dark mode, black for light mode
    };

    const TOOLS = [
      {
        label: "Bold",
        isActive: properties.isBold,
        icon: <FiBold color={getIconColor(properties.isBold)} size={14} />,
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        },
      },
      {
        label: "Italic",
        isActive: properties.isItalic,
        icon: <FiItalic color={getIconColor(properties.isItalic)} size={14} />,
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        },
      },
      {
        label: "Underline",
        isActive: properties.isUnderline,
        icon: (
          <FiUnderline color={getIconColor(properties.isUnderline)} size={14} />
        ),
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        },
      },
      {
        label: "Strike through",
        isActive: properties.isStrikeThrough,
        icon: (
          <LuStrikethrough
            color={getIconColor(properties.isStrikeThrough)}
            size={14}
            className={properties.isStrikeThrough ? "text-bold" : undefined}
          />
        ),
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        },
      },
      {
        label: "Align Left",
        isActive: properties.alignment === "left",
        icon: (
          <FiAlignLeft
            color={getIconColor(properties.alignment === "left")}
            size={14}
            className={
              properties.alignment === "left" ? "text-bold" : undefined
            }
          />
        ),
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("left").run();
        },
      },
      {
        label: "Align Center",
        isActive: properties.alignment === "center",
        icon: (
          <FiAlignCenter
            color={getIconColor(properties.alignment === "center")}
            size={14}
            className={
              properties.alignment === "center" ? "text-bold" : undefined
            }
          />
        ),
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("center").run();
        },
      },
      {
        label: "Align Right",
        isActive: properties.alignment === "right",
        icon: (
          <FiAlignRight
            color={getIconColor(properties.alignment === "right")}
            size={14}
            className={
              properties.alignment === "right" ? "text-bold" : undefined
            }
          />
        ),
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setTextAlign("right").run();
        },
      },
    ];

    const TYPES = [
      {
        id: "paragraph",
        icon: <BsParagraph />,
        label: "Paragraph",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setParagraph().run();
        },
      },
      {
        id: "h1",
        icon: <LuHeading1 />,
        label: "Heading 1",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 1 }).run();
        },
      },
      {
        id: "h2",
        icon: <LuHeading2 />,
        label: "Heading 2",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 2 }).run();
        },
      },
      {
        id: "h3",
        icon: <LuHeading3 />,
        label: "Heading 3",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 3 }).run();
        },
      },
      {
        id: "h4",
        icon: <LuHeading4 />,
        label: "Heading 4",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 4 }).run();
        },
      },
      {
        id: "h5",
        icon: <LuHeading5 />,
        label: "Heading 5",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 5 }).run();
        },
      },
      {
        id: "h6",
        icon: <LuHeading6 />,
        label: "Heading 6",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().setHeading({ level: 6 }).run();
        },
      },
      {
        id: "blockquote",
        icon: <BsBlockquoteLeft />,
        label: "Quote",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleBlockquote().run();
        },
      },
      {
        id: "bulletList",
        icon: <PiListBulletsLight />,
        label: "Bullet List",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        id: "orderedList",
        icon: <RiListOrdered />,
        label: "Ordered List",
        action: (e: React.MouseEvent) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        },
      },
    ];

    const TEXTSTYLE = [
      {
        name: "Text",
        array: [
          { name: "Auto", hex: "inherit" },
          { name: "Gray", hex: darkMode ? "#9ca3af" : "#4b5563" }, // Soft charcoal vs Muted steel
          { name: "Brown", hex: darkMode ? "#c27854" : "#603813" }, // Warm amber bark vs Soft espresso
          { name: "Red", hex: darkMode ? "#f87171" : "#c24141" }, // Pastel coral red vs Premium crimson
          { name: "Orange", hex: darkMode ? "#fb923c" : "#b45309" }, // Autumn orange vs Burnt ochre
          { name: "Yellow", hex: darkMode ? "#fcd34d" : "#854d0e" }, // Honey gold vs Deep mustard yellow
          { name: "Green", hex: darkMode ? "#4ade80" : "#15803d" }, // Sage mint green vs Rich forest jade
          { name: "Blue", hex: darkMode ? "#60a5fa" : "#1d4ed8" }, // Classic pastel blue vs Corporate indigo
          { name: "Purple", hex: darkMode ? "#c084fc" : "#6d28d9" }, // Soft lavender vs Elegant royal purple
          { name: "Pink", hex: darkMode ? "#f472b6" : "#be185d" }, // Pale rose pink vs Deep berry pink
        ],
      },
      {
        name: "Highlight",
        array: [
          { name: "Auto", hex: "transparent" },
          // Subtly blended transparencies that adapt flawlessly over both white and dark zinc surfaces
          {
            name: "Gray",
            hex: darkMode
              ? "rgba(156, 163, 175, 0.15)"
              : "rgba(107, 114, 128, 0.1)",
          },
          {
            name: "Brown",
            hex: darkMode
              ? "rgba(194, 120, 84, 0.15)"
              : "rgba(96, 56, 19, 0.08)",
          },
          {
            name: "Red",
            hex: darkMode
              ? "rgba(248, 113, 113, 0.15)"
              : "rgba(194, 65, 65, 0.08)",
          },
          {
            name: "Orange",
            hex: darkMode
              ? "rgba(251, 146, 60, 0.15)"
              : "rgba(180, 83, 9, 0.08)",
          },
          {
            name: "Yellow",
            hex: darkMode
              ? "rgba(252, 211, 77, 0.15)"
              : "rgba(254, 240, 138, 0.55)",
          }, // Cozy, non-radioactive marker yellow
          {
            name: "Green",
            hex: darkMode
              ? "rgba(74, 222, 128, 0.12)"
              : "rgba(21, 128, 61, 0.08)",
          },
          {
            name: "Blue",
            hex: darkMode
              ? "rgba(96, 165, 250, 0.15)"
              : "rgba(29, 78, 216, 0.07)",
          },
          {
            name: "Purple",
            hex: darkMode
              ? "rgba(192, 132, 252, 0.15)"
              : "rgba(109, 40, 217, 0.07)",
          },
          {
            name: "Pink",
            hex: darkMode
              ? "rgba(244, 114, 182, 0.12)"
              : "rgba(190, 24, 93, 0.07)",
          },
        ],
      },
    ];

    return { TOOLS, TYPES, TEXTSTYLE };
    // Hook triggers recalculations ONLY when context dependencies alter state
  }, [properties, editor, darkMode]);
};
