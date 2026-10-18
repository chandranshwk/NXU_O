/**
 * @file CodeIDE.tsx
 * @component CodeIDE
 * @description The primary application gateway module for the local practice simulator code editor workspace.
 * It manages context routing states, synchronizes active text editor frames via TipTap hooks, and handles
 * layout state distributions inside the problem prompt track and coding workspace panels.
 *
 * @architecture
 * - Utilizes an isolated local context matrix layer wrapping `SettingsProvider`, `EditorProvider`, and `ScratchProvider`.
 * - Employs absolute layout structural sizing algorithms to freeze window height shifts inside native desktop app viewports.
 * - Adheres strictly to a minimalist 2D user interface convention utilizing clean semantic elements without unnecessary graphic icons.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import { getCodeWorkspaceExtensions } from "../assets/TipTapEditor";
import { SettingsProvider, useSettings } from "../contexts/settingsContext";
import { EditorProvider } from "../contexts/editorContext";
import { useScratchContext, ScratchProvider } from "../contexts/scratchContext";
import { generateCodeFile, type CodeFile } from "./CodeIDE.SAMPLE";
import { ProblemInstructionTrack } from "./ProblemInstructionTrack";
import { CodeWorkspaceHeader } from "./CodeWorkspaceHeader";
import { LineNumberExtension } from "../Extensions/LineNumberExtension";
import { CodeHighlightExtension } from "../Extensions/CodeHighlightExtension";
import { CodeTabExtension } from "../Extensions/CodeTabExtension";

/** Supported programming runtime frameworks populated inside the workspace configuration selector dock */
const LANGUAGES = ["Java", "Python", "Javascript", "C++", "C"];

/**
 * @component CodeIDEContent
 * @description Internal layout management controller wrapping localized state contexts and layout listeners.
 */
const CodeIDEContent: React.FC = () => {
  /** Capture dark mode state parameters propagated via standard multi-tier outlet router contexts */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  /** Retrieve global settings properties and text track state modifiers */
  const settings = useSettings();
  const scratch = useScratchContext();

  /** Guard reference to block cyclic updates and race conditions during explicit buffer transaction executions */
  const isTransitioningRef = useRef<boolean>(false);

  /**
   * Single source of truth for the active problem.
   * Generated once via `useMemo` so its identity is stable across renders
   * and across the code-editor lifecycle.
   */
  const problem: CodeFile = useMemo(() => generateCodeFile(1), []);

  /** Track selected execution target language initialized locally to Python */
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    try {
      const savedLang = localStorage.getItem("ide_selected_language");
      return savedLang ? savedLang : "Python";
    } catch (e) {
      console.warn("Failed to read initial language from localStorage:", e);
      return "Python"; // Safe fallback standard
    }
  });

  /**
   * Automatically commits any toolbar language updates straight down to system
   * client disk cache records every time a user flips the language selector dropdown.
   */
  useEffect(() => {
    try {
      localStorage.setItem("ide_selected_language", selectedLang);
    } catch (e) {
      console.error(
        "Failed to persist active language parameter to localStorage:",
        e,
      );
    }
  }, [selectedLang]);

  /**
   * Moves the theme color state synchronization block
   * inside a useEffect hook. This safely prevents the "Cannot update a component while rendering a different component" error.
   */
  const currentThemeColor = darkMode ? "#e4e4e7" : "#18181b";

  useEffect(() => {
    if (settings.defaultColor !== currentThemeColor) {
      settings.setDefaultColor(currentThemeColor);
    }
  }, [currentThemeColor, settings]);

  /**
   * @hook useEditor
   * @description Core interactive input editor engine. Employs structural width parameters and clamps browser defaults.
   * Utilizes optional chaining to safely read template buffers without triggering runtime evaluation faults.
   */
  const codeExtensions = getCodeWorkspaceExtensions();
  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "max-w-full w-full outline-none font-mono text-xs p-4 leading-relaxed break-all h-full min-h-full",
        spellcheck: "false",
        autocorrect: "off",
        autocapitalize: "off",
      },
    },
    extensions: [
      ...codeExtensions,
      LineNumberExtension,
      CodeHighlightExtension,
      CodeTabExtension,
    ],
    content:
      problem.codeTemplates?.find((t) => t.language === selectedLang)
        ?.starterCode || "",
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();
      if (scratch.info !== currentHTML) {
        scratch.setInfo(currentHTML);
      }
    },
  });

  // ==========================================
  // PURE PROSE-MIRROR STATE SYNCHRONIZER
  // ==========================================
  /**
   * Watches language selection state changes and dispatches a transaction
   * carrying custom metadata tokens to forcefully break ProseMirror's cache.
   */
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const { state, view } = editor;

    // Create a transaction and attach custom metadata to force a state update
    const transaction = state.tr.setMeta("setLanguage", selectedLang);

    // Dispatch the transaction to trigger an immediate, comprehensive repaint pass
    view.dispatch(transaction);
  }, [selectedLang, editor]);

  /**
   * @function handleLanguageChange
   * @description Intercepts active selection updates from the workspace toolbar and swaps the structural
   * editor content buffer with corresponding code signature templates safely using optional chaining.
   * Explicitly clears content to forcefully wipe out old stale language HTML tags.
   */
  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    if (!editor) return;

    isTransitioningRef.current = true;

    const template = problem.codeTemplates?.find((t) => t.language === lang);
    const targetContent = template ? template.starterCode : "";

    // Wipe old language spans entirely before rendering the new text block canvas string
    editor.commands.clearContent();
    editor.commands.setContent(targetContent);

    isTransitioningRef.current = false;
  };

  /**
   * @function handleSaveLocalWorkspace
   * @description Commits active memory character blocks securely down to system files or temporary logs.
   */
  const handleSaveLocalWorkspace = () => {
    if (!editor) return;
    console.log(
      "Committing buffer sequence safely down to system file logs:",
      editor.getHTML(),
    );
  };

  return (
    <div
      className={`p-3 w-full h-[calc(100vh-2.25rem)] grid grid-cols-3 gap-3 transition-colors duration-200 overflow-hidden select-none ${
        darkMode ? "bg-[#121214] text-zinc-100" : "bg-gray-50 text-zinc-800"
      }`}
    >
      {/** Column 1: Left Problem Track Navigation Pane mapping directly to the active problem */}
      <div className="col-span-1 h-full min-h-0">
        <ProblemInstructionTrack data={problem} darkMode={darkMode} />
      </div>

      {/** Column 2 & 3: Right Pure Coding Simulator Panel Matrix Layout */}
      <div className="col-span-2 flex flex-col h-full overflow-hidden w-[calc(100%+0.5rem)]">
        {/** Integrated Workspace Operations Action Navigation Dock Row */}
        <CodeWorkspaceHeader
          darkMode={darkMode}
          languages={LANGUAGES}
          selectedLanguage={selectedLang}
          onLanguageChange={handleLanguageChange}
          onSave={handleSaveLocalWorkspace}
          hasTemplates={!!problem.codeTemplates}
        />

        {/** Scrollable Text Canvas housing container wrapper element with structural layout controls */}
        <div
          className={`flex-1 w-full min-h-0 overflow-y-auto rounded-b-xl border-x border-b transition-colors focus-within:ring-1 focus-within:ring-indigo-500/20 ${
            darkMode
              ? "bg-[#151518] border-zinc-800/80"
              : "bg-zinc-50/50 border-zinc-200"
          }`}
        >
          <EditorContent
            editor={editor}
            className={`w-full min-h-full flex flex-col font-mono text-xs transition-colors duration-200
              [&_.tiptap]:flex-1 [&_.tiptap]:outline-none [&_.tiptap]:p-2
              ${
                darkMode
                  ? "bg-[#151518] border-zinc-800/80 [&_.tiptap]:text-zinc-200"
                  : "bg-zinc-50/50 border-zinc-200 [&_.tiptap]:text-zinc-800"
              }`}
            style={
              {
                "--editor-line-height": "10px",
                "--editor-font-size": settings.defaultFontSize,
                "--editor-ordered-list-representer":
                  settings.defaultOLRepresenter,
                "--editor-font-color": settings.defaultColor,
              } as React.CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
};

/**
 * @component CodeIDE
 * @description Structural setup entry point mounting core baseline context providers safely above execution frames.
 */
const CodeIDE = () => {
  return (
    <SettingsProvider>
      <EditorProvider>
        <ScratchProvider>
          <CodeIDEContent />
        </ScratchProvider>
      </EditorProvider>
    </SettingsProvider>
  );
};

export default CodeIDE;
