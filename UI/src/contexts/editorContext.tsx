import type { Editor } from "@tiptap/core";
import React, { createContext, useContext, useState } from "react";
import { useSettings } from "./settingsContext";

// 1. The data blueprint for your workspace features
export interface editorContextType {
  editor: Editor | undefined; // Dynamic slot to hold the live text engine instance
  setEditor: React.Dispatch<React.SetStateAction<Editor | undefined>>;
  isBold: boolean;
  setIsBold: React.Dispatch<React.SetStateAction<boolean>>;
  isItalic: boolean;
  setIsItalic: React.Dispatch<React.SetStateAction<boolean>>;
  isUnderline: boolean;
  setIsUnderline: React.Dispatch<React.SetStateAction<boolean>>;
  isStrikethrough: boolean;
  setIsStrikethrough: React.Dispatch<React.SetStateAction<boolean>>;

  highlightedColor: string;
  setHighlightedColor: React.Dispatch<React.SetStateAction<string>>;

  textColor: string;
  setTextColor: React.Dispatch<React.SetStateAction<string>>;
  font: string;
  setFont: React.Dispatch<React.SetStateAction<string>>;
  fontSize: string;
  setFontSize: React.Dispatch<React.SetStateAction<string>>;
  isHeading: (level: number) => boolean;
  toggleHeading: (level: number) => void;

  readText: () => void;
  setReadText: React.Dispatch<React.SetStateAction<() => void>>;

  // FIXED: Standardised into a single string selection token to enforce mutual exclusivity
  alignment: "left" | "center" | "right";
  setAlignment: React.Dispatch<
    React.SetStateAction<"left" | "center" | "right">
  >;

  isBulletList: boolean;
  setIsBulletList: React.Dispatch<React.SetStateAction<boolean>>;
  isOrderedList: boolean;
  setIsOrderedList: React.Dispatch<React.SetStateAction<boolean>>;
  isBlockquote: boolean;
  setIsBlockquote: React.Dispatch<React.SetStateAction<boolean>>;
  isCodeBlock: boolean;
  setIsCodeBlock: React.Dispatch<React.SetStateAction<boolean>>;
}

// Initialize the raw capsule bucket setting an explicit null entry point
/* eslint-disable react-refresh/only-export-components */
export const EditorContext = createContext<editorContextType | null>(null);

// The self-contained state manager component
export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const settings = useSettings();

  const [editor, setEditor] = useState<Editor | undefined>();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  // 🚀 1. ADD CORE STATE VARIABLE FOR THE HIGHLIGHTER MARKER
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

  // Custom state tracking for active headers (null means normal body paragraph)
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
  };

  return (
    <EditorContext.Provider value={editorContextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error(
      "useEditorContext must be executed inside a valid <SettingsProvider>",
    );
  }
  return context;
};
