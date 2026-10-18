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
import { useOutletContext, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import { getCodeWorkspaceExtensions } from "../assets/TipTapEditor";
import { SettingsProvider, useSettings } from "../contexts/settingsContext";
import { EditorProvider } from "../contexts/editorContext";
import { useScratchContext, ScratchProvider } from "../contexts/scratchContext";
import type { CodeFile } from "./CodeIDE.SAMPLE";
import { ProblemInstructionTrack } from "./ProblemInstructionTrack";
import { CodeWorkspaceHeader } from "./CodeWorkspaceHeader";
import { LineNumberExtension } from "../Extensions/LineNumberExtension";
import { CodeHighlightExtension } from "../Extensions/CodeHighlightExtension";
import { CodeTabExtension } from "../Extensions/CodeTabExtension";
import { useWorkspaceStore } from "../Store/store";
import { AVAILABLE_LANGUAGES } from "../components/LanguageConfig";

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

  /**
   * Extract the problem ID/slug from the URL and locate it in the global store
   */
  const { id } = useParams<{ id: string }>();
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);

  const problem: CodeFile | undefined = useMemo(() => {
    if (!id) return undefined;
    return codeFiles.find((c) => c.titleSlug === id || c.id.toString() === id);
  }, [id, codeFiles]);

  /** Guard reference to block cyclic updates and race conditions during explicit buffer transaction executions */
  const isTransitioningRef = useRef<boolean>(false);

  /** Track selected execution target language, persisting to local storage */
  const [selectedLang, setSelectedLang] = useState<string>(() => {
    try {
      const savedLang = localStorage.getItem("ide_selected_language");
      // Verify the saved language is valid in our new config
      const isValid = AVAILABLE_LANGUAGES.some((l) => l.name === savedLang);
      return isValid && savedLang ? savedLang : "Python";
    } catch {
      return "Python";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("ide_selected_language", selectedLang);
    } catch (e) {
      console.error("Failed to persist active language parameter:", e);
    }
  }, [selectedLang]);

  /** Ensure editor text color adapts to the theme */
  const currentThemeColor = darkMode ? "#e4e4e7" : "#18181b";

  useEffect(() => {
    if (settings.defaultColor !== currentThemeColor) {
      settings.setDefaultColor(currentThemeColor);
    }
  }, [currentThemeColor, settings]);

  /** Core Editor Initialization */
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
    content: "", // Start empty, populated by the useEffect below
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();
      if (scratch.info !== currentHTML) {
        scratch.setInfo(currentHTML);
      }
    },
  });

  // ==========================================
  // STATE SYNCHRONIZER: CONTENT & HIGHLIGHTING
  // ==========================================
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    isTransitioningRef.current = true;

    // 1. Try to find a starter template for the selected language
    const template = problem?.codeTemplates?.find(
      (t) => t.language === selectedLang,
    );

    let targetContent = template?.starterCode;

    // 2. Fallback template if the problem doesn't have this language
    if (!targetContent) {
      const langConfig = AVAILABLE_LANGUAGES.find(
        (l) => l.name === selectedLang,
      );
      const prefix = langConfig?.commentPrefix || "//";
      targetContent = `${prefix} Write your ${selectedLang} solution here\n`;
    }

    // 3. Prevent cursor jumps if content is identical
    if (editor.getText() !== targetContent) {
      editor.commands.setContent(targetContent);
    }

    isTransitioningRef.current = false;

    // 4. Trigger Syntax Highlighting UI update
    const langConfig = AVAILABLE_LANGUAGES.find((l) => l.name === selectedLang);
    const langSlug = langConfig?.slug || "javascript";

    const { state, view } = editor;
    const transaction = state.tr.setMeta("setLanguage", langSlug);
    view.dispatch(transaction);
  }, [problem, selectedLang, editor]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
  };

  const handleSaveLocalWorkspace = () => {
    if (!editor) return;
    console.log(
      "Committing buffer sequence safely down to system file logs:",
      editor.getHTML(),
    );
  };

  const handleRunCode = async () => {
    if (!editor) return;

    const code = editor.getText();
    const langConfig = AVAILABLE_LANGUAGES.find((l) => l.name === selectedLang);

    if (!langConfig) return;

    console.log(`Executing ${langConfig.name}...`);
    console.log(`Code:\n${code}`);

    //  TAURI INTEGRATION POINT
    // Uncomment and adjust when your Rust backend is ready:
    /*
    try {
      import { invoke } from "@tauri-apps/api/core";
      const output = await invoke("execute_code", { 
        language: langConfig.slug, 
        code: code 
      });
      console.log("Terminal Output:", output);
      // You can pass `output` to a terminal component here
    } catch (err) {
      console.error("Execution failed:", err);
    }
    */
  };

  // ==========================================
  // RENDER GUARD
  // ==========================================
  if (!problem) {
    return (
      <div
        className={`w-full h-[calc(100vh-2.25rem)] flex items-center justify-center ${
          darkMode ? "bg-[#121214] text-zinc-500" : "bg-gray-50 text-gray-400"
        }`}
      >
        <span className="font-mono text-sm animate-pulse">
          Loading workspace module...
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-3 w-full h-[calc(100vh-2.25rem)] grid grid-cols-3 gap-3 transition-colors duration-200 overflow-hidden select-none ${
        darkMode ? "bg-[#121214] text-zinc-100" : "bg-gray-50 text-zinc-800"
      }`}
    >
      {/** Column 1: Left Problem Track Navigation Pane */}
      <div className="col-span-1 h-full min-h-0">
        <ProblemInstructionTrack darkMode={darkMode} />
      </div>

      {/** Column 2 & 3: Right Pure Coding Simulator Panel Matrix Layout */}
      <div className="col-span-2 flex flex-col h-full overflow-hidden w-[calc(100%+0.5rem)]">
        <CodeWorkspaceHeader
          darkMode={darkMode}
          languages={AVAILABLE_LANGUAGES}
          selectedLanguage={selectedLang}
          onLanguageChange={handleLanguageChange}
          onSave={handleSaveLocalWorkspace}
          onRun={handleRunCode}
        />

        {/** Scrollable Text Canvas */}
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
