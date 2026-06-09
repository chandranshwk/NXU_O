import React from "react";
import { FiBold, FiItalic, FiAnchor, FiUnderline } from "react-icons/fi";
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuHeading4,
  LuHeading5,
  LuHeading6,
} from "react-icons/lu";
import {
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdOutlineFormatListBulleted,
  MdOutlineGridOn,
} from "react-icons/md";
import { RxSection } from "react-icons/rx";
import { type editorContextType } from "../contexts/editorContext";
import type { Editor } from "@tiptap/core";
import {
  GrStrikeThrough,
  GrTextAlignCenter,
  GrTextAlignLeft,
  GrTextAlignRight,
} from "react-icons/gr";

export interface ToolItem {
  icon: React.ReactNode;
  name: string;
  // 🛠️ FIXED: Made context a mandatory argument to match your array calls perfectly
  onClick: (editor: Editor, context: editorContextType) => void;
}

export const getEditorTools = (
  type: "simple" | "rich",
  context: editorContextType,
): ToolItem[] => {
  const baseTools: ToolItem[] = [
    {
      icon: <FiBold />,
      name: "Bold",
      onClick: (editor) => {
        editor?.chain().focus().toggleBold().run();
        context.setIsBold((prev) => !prev);
      },
    },
    {
      icon: <FiItalic />,
      name: "Italic",
      onClick: (editor) => {
        editor?.chain().focus().toggleItalic().run();
        context.setIsItalic((prev) => !prev);
      },
    },
    {
      icon: <FiUnderline />,
      name: "Underline",
      onClick: (editor) => {
        editor?.chain().focus().toggleUnderline?.().run();
        context.setIsUnderline((prev) => !prev);
      },
    },
    {
      icon: <GrStrikeThrough />,
      name: "Strikethrough",
      onClick: (editor) => {
        editor?.chain().focus().toggleStrike().run();
        context.setIsStrikethrough((prev) => !prev);
      },
    },
    {
      icon: <GrTextAlignLeft />,
      name: "Left Align",
      onClick: (editor) => {
        editor?.chain().focus().setTextAlign("left").run();
        context.setAlignment("left");
      },
    },
    {
      icon: <GrTextAlignCenter />,
      name: "Center Align",
      onClick: (editor) => {
        editor?.chain().focus().setTextAlign("center").run();
        context.setAlignment("center");
      },
    },
    {
      icon: <GrTextAlignRight />,
      name: "Right Align",
      onClick: (editor) => {
        editor?.chain().focus().setTextAlign("right").run();
        context.setAlignment("right");
      },
    },
    {
      icon: <MdFormatListNumbered />,
      name: "Ordered List",
      onClick: (editor) => {
        editor?.chain().focus().toggleOrderedList().run();
      },
    },
    {
      icon: <MdFormatListBulleted />,
      name: "Bullet List",
      onClick: (editor) => {
        editor?.chain().focus().toggleBulletList().run();
      },
    },
    ...([1, 2, 3] as const).map((level) => {
      const Icons = [
        LuHeading1,
        LuHeading2,
        LuHeading3,
        LuHeading4,
        LuHeading5,
        LuHeading6,
      ];
      const HeadingIcon = Icons[level - 1];
      return {
        icon: <HeadingIcon />,
        name: `Heading ${level}`,
        onClick: (editor: Editor) => {
          editor?.chain().focus().toggleHeading({ level }).run();
          context.toggleHeading(level);
        },
      };
    }),
  ];

  if (type === "rich") {
    baseTools.push(
      {
        icon: <RxSection />,
        name: "Section",
        onClick: () => {
          console.log("Section block created flatly");
        },
      },
      {
        icon: <FiAnchor />,
        name: "Anchor Link",
        onClick: (editor) => {
          const url = window.prompt("Enter link URL:");
          if (url) editor?.chain().focus().setLink({ href: url }).run();
        },
      },
      {
        icon: <MdOutlineFormatListBulleted />,
        name: "Bullet List",
        onClick: (editor) => {
          editor?.chain().focus().toggleBulletList().run();
          context.setIsBulletList((prev) => !prev);
        },
      },
      {
        icon: <MdOutlineGridOn />,
        name: "Table Grid",
        onClick: () => {
          console.log("Table Grid template layout triggered");
        },
      },
    );
  }

  return baseTools;
};
