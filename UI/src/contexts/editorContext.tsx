/**
 * @file editorContext.tsx
 * @description Central shared context manager that coordinates state variables
 * across the text editor canvas.
 *
 * @architecture
 * - Synchronizes text style parameters (bold, font selection, alignment states)
 *   with current text block selections.
 * - Manages drawing toolbar selections (`activeCanvasTool`) for whiteboard interfaces.
 * - Adjusts display color modes automatically based on global dark mode configurations.
 */

import type { Editor } from "@tiptap/core";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./settingsContext";
import type { CanvasToolName } from "../Pages/Document/Toolbar";

export interface editorContextType {
  /** Active TipTap editor engine instance receiving user command dispatches */
  editor: Editor | undefined;
  /** Method used to bind specific input editors to selection listener arrays */
  setEditor: React.Dispatch<React.SetStateAction<Editor | undefined>>;
  /** Active state flag reporting bold typography styles */
  isBold: boolean;
  setIsBold: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active state flag reporting italic typography styles */
  isItalic: boolean;
  setIsItalic: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active state flag reporting underline text decoration styles */
  isUnderline: boolean;
  setIsUnderline: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active state flag reporting strikethrough text decoration styles */
  isStrikethrough: boolean;
  setIsStrikethrough: React.Dispatch<React.SetStateAction<boolean>>;

  /** Raw Hex background marker transparency highlight color string */
  highlightedColor: string;
  setHighlightedColor: React.Dispatch<React.SetStateAction<string>>;

  /** Active text color Hex parameter mapping font designs */
  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  /** Font family layout string identifying typeface selections */
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  /** Active font size design constraint layout tracking character slices */
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  /** Evaluation method verifying if matching headline sizes are active */
  isHeading: (level: number) => boolean;
  /** Changes active text lines to matching heading block elements */
  toggleHeading: (level: number) => void;

  /** Dynamic callback utility slot mapping text-to-speech actions */
  readText: () => void;
  setReadText: React.Dispatch<React.SetStateAction<() => void>>;

  /** Enforces mutual exclusivity between left, center, and right text alignments */
  alignment: "left" | "center" | "right";
  setAlignment: React.Dispatch<
    React.SetStateAction<"left" | "center" | "right">
  >;

  /** Active state flag tracking bullet list structures */
  isBulletList: boolean;
  setIsBulletList: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active state flag tracking ordered item list structures */
  isOrderedList: boolean;
  setIsOrderedList: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active state flag tracking quote indentation formatting blocks */
  isBlockquote: boolean;
  setIsBlockquote: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active state flag tracking inline syntax code styling cards */
  isCodeBlock: boolean;
  setIsCodeBlock: React.Dispatch<React.SetStateAction<boolean>>;
  /** Active toolbar mode selector defining canvas tool states */
  activeCanvasTool: CanvasToolName | "Select";
  setActiveCanvasTool: React.Dispatch<
    React.SetStateAction<CanvasToolName | "Select">
  >;
}

/* eslint-disable react-refresh/only-export-components */
export const EditorContext = createContext<editorContextType | null>(null);

/**
 * @component EditorProvider
 * @description State provider that wraps text canvases, initializes
 * style attributes, and watches global app configurations.
 */
export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const settings = useSettings();
  const darkMode = settings.darkMode;

  const [editor, setEditor] = useState<Editor | undefined>();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const [highlightedColor, setHighlightedColor] = useState("");

  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isBlockquote, setIsBlockquote] = useState(false);
  const [isCodeBlock, setIsCodeBlock] = useState(false);
  const [textColor, setTextColor] = useState(settings.defaultColor);
  const [font, setFont] = useState(settings.defaultFont);
  const [fontSize, setFontSize] = useState<string>(settings.defaultFontSize);
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    "left",
  );

  /** Tracks active headline tier configurations (null defaults back to raw paragraph text) */
  const [activeHeadingLevel, setActiveHeadingLevel] = useState<number | null>(
    null,
  );

  const [readText, setReadText] = useState<() => void>(() => () => {});

  const isHeading = (level: number) => {
    return activeHeadingLevel === level;
  };

  const toggleHeading = (level: number) => {
    setActiveHeadingLevel(level);
  };

  const [activeCanvasTool, setActiveCanvasTool] = useState<
    CanvasToolName | "Select"
  >("Select");

  // ==========================================
  // LIFECYCLE 1: CLEAR UTILITY RESET LOOP
  // ==========================================
  /**
   * Listens for the "Clear" canvas tool action. It reverts the active tool state
   * back to "Select" mode after 100ms to prevent sticky toolbar selections.
   */
  useEffect(() => {
    const reset = () => {
      if (activeCanvasTool === "Clear") {
        setActiveCanvasTool("Select");
      }
    };

    setTimeout(reset, 100);
  }, [activeCanvasTool]);

  // ==========================================
  // LIFECYCLE 2: DARK MODE TEXT ALIGNER
  // ==========================================
  /**
   * Adjusts default fallback font hex values whenever theme states shift,
   * preventing invisible font rendering over black or white screens.
   */
  useEffect(() => {
    if (!darkMode)
      setTimeout(() => {
        setTextColor("#000000");
      }, 0);
    else
      setTimeout(() => {
        setTextColor("#ffffff");
      }, 0);
  }, [darkMode]);

  const editorContextValue: editorContextType = {
    editor,
    setEditor,
    isBold,
    setIsBold,
    isItalic,
    setIsItalic,
    isUnderline,
    setIsUnderline,
    isStrikethrough,
    setIsStrikethrough,

    highlightedColor,
    setHighlightedColor,

    textColor,
    setTextColor,
    font,
    setFont,
    readText,
    setReadText,

    isHeading,
    toggleHeading,

    fontSize,
    setFontSize,
    alignment,
    setAlignment,

    isBulletList,
    setIsBulletList,
    isOrderedList,
    setIsOrderedList,
    isBlockquote,
    setIsBlockquote,
    isCodeBlock,
    setIsCodeBlock,
    activeCanvasTool,
    setActiveCanvasTool,
  };

  return (
    <EditorContext.Provider value={editorContextValue}>
      {children}
    </EditorContext.Provider>
  );
};

/**
 * @hook useEditorContext
 * @description Direct hook used to hook up floating text toolbars, dropdowns,
 * and lines to shared style configurations.
 */
export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error(
      "useEditorContext must be executed inside a valid <SettingsProvider>",
    );
  }
  return context;
};
