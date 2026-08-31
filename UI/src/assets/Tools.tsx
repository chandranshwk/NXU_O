/**
 * @file Tools.tsx
 * @description Centralized tools configuration generator for the editor toolbar.
 * Compiles arrays of formatting buttons, layout actions, and heading shortcuts
 * based on simple vs rich layout requirements.
 *
 * @architecture
 * - Returns modular action maps consisting of icons, labels, and execution parameters.
 * - Bridges direct UI clicks with both the TipTap editor chain and parent context stores.
 * - Uses functional loops to dynamically build multiple heading tier configurations.
 */

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
import { MdFormatListBulleted, MdFormatListNumbered } from "react-icons/md";
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
  /** The icon visual component to display on the toolbar rail */
  icon: React.ReactNode;
  /** Display label name of the formatting action used for keys and titles */
  name: string;
  /** Execution callback parsing active editor instances and state context blocks */
  onClick: (editor: Editor, context: editorContextType) => void;
}

/**
 * @function getEditorTools
 * @description Factory function compiling action objects for the text editor toolbar.
 * Appends advanced markers like links or section hooks if rich mode is requested.
 *
 * @param {"simple" | "rich"} type - Formatting density configuration rule.
 * @param {editorContextType} context - Universal editor context manager.
 * @returns {ToolItem[]} Array containing structured toolbar item action maps.
 */
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
    // ==========================================
    // HEADING CHUNK GENERATOR (LEVELS 1-3)
    // ==========================================
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

  // ==========================================
  // EXTENSION: RICH FORMATTING EXPANSIONS
  // ==========================================
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
    );
  }

  return baseTools;
};
