/**
 * @file CodeIDE.tsx
 * @component CodeIDE
 * @description The primary application gateway module for the local practice simulator code editor workspace.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import { invoke } from "@tauri-apps/api/core";
import { getCodeWorkspaceExtensions } from "../Editor/Config/TipTapEditor";
import { SettingsProvider, useSettings } from "../../contexts/settingsContext";
import { EditorProvider } from "../Editor/editorContext";
import { ScratchProvider } from "../Scratchpad/scratchContext";
import type { CodeFile } from "./CodeIDE.SAMPLE";
import { ProblemInstructionTrack } from "./ProblemInstructionTrack";
import { CodeWorkspaceHeader } from "./CodeWorkspaceHeader";
import { LineNumberExtension } from "../Editor/Extensions/LineNumberExtension";
import { CodeHighlightExtension } from "../Editor/Extensions/CodeHighlightExtension";
import { CodeTabExtension } from "../Editor/Extensions/CodeTabExtension";
import { useWorkspaceStore } from "../../Store/store";
import { useTourAutoStart } from "../../Hooks/useTourAutoStart";
import { CODEIDE_STEPS } from "../../Tours/pageTours";
import { FiTerminal, FiX } from "react-icons/fi";

// Fallback just in case the JSON file fails to load
const FALLBACK_LANGS = [
  { name: "Python", slug: "python", extension: "py", commentPrefix: "#" },
];

const CodeIDEContent: React.FC = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const settings = useSettings();
  const { id } = useParams<{ id: string }>();

  const codeFiles = useWorkspaceStore((s) => s.codeFiles);
  const updateCodeFileCode = useWorkspaceStore((s) => s.updateCodeFileCode);
  const saveCodeFileToDisk = useWorkspaceStore((s) => s.saveCodeFileToDisk);

  // Dynamic Languages State
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>("Python");

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<{
    stdout: string;
    stderr: string;
    success: boolean;
  } | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Load Languages from Rust dynamically
  useEffect(() => {
    invoke<Record<string, any>>("get_available_languages")
      .then((langMap) => {
        const langArray = Object.values(langMap);
        setAvailableLanguages(langArray);

        const savedLang = localStorage.getItem("ide_selected_language");
        const isValid = langArray.some((l) => l.name === savedLang);
        if (isValid && savedLang) {
          setSelectedLang(savedLang);
        } else if (langArray.length > 0) {
          setSelectedLang(langArray[0].name);
        }
      })
      .catch((err) => {
        console.error("Failed to load languages, using fallback", err);
        setAvailableLanguages(FALLBACK_LANGS);
      });
  }, []);

  const problem: CodeFile | undefined = useMemo(() => {
    if (!codeFiles || codeFiles.length === 0) return undefined;
    if (id) {
      const found = codeFiles.find(
        (c) => c.titleSlug === id || c.id.toString() === id,
      );
      if (found) return found;
    }
    return codeFiles[0];
  }, [id, codeFiles]);

  useTourAutoStart({
    storageKey: "nxuo-tour-codeide-v1",
    steps: CODEIDE_STEPS,
    enabled: !!problem,
  });

  const isTransitioningRef = useRef<boolean>(false);
  const lastLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("ide_selected_language", selectedLang);
    } catch (e) {}
  }, [selectedLang]);

  const currentThemeColor = darkMode ? "#e4e4e7" : "#18181b";
  useEffect(() => {
    if (settings.defaultColor !== currentThemeColor) {
      settings.setDefaultColor(currentThemeColor);
    }
  }, [currentThemeColor, settings]);

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
    content: "",
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();
      if (problem) {
        updateCodeFileCode(problem.id.toString(), selectedLang, currentHTML);
      }
    },
  });

  useEffect(() => {
    if (
      !editor ||
      editor.isDestroyed ||
      !problem ||
      availableLanguages.length === 0
    )
      return;

    const currentKey = `${problem.id}-${selectedLang}`;
    if (lastLoadedRef.current === currentKey) return;

    lastLoadedRef.current = currentKey;
    isTransitioningRef.current = true;

    const template = problem?.codeTemplates?.find(
      (t) => t.language === selectedLang,
    );

    let targetContent = template?.starterCode;

    if (!targetContent) {
      const langConfig = availableLanguages.find(
        (l) => l.name === selectedLang,
      );
      const prefix = langConfig?.commentPrefix || "//";
      targetContent = `${prefix} Write your ${selectedLang} solution here\n`;
    }

    editor.commands.setContent(targetContent, { emitUpdate: false });

    const langConfig = availableLanguages.find((l) => l.name === selectedLang);
    const langSlug = langConfig?.slug || "javascript";
    const { state, view } = editor;
    const transaction = state.tr.setMeta("setLanguage", langSlug);
    view.dispatch(transaction);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 50);
  }, [problem?.id, selectedLang, editor, availableLanguages]);

  // ==========================================
  // MANUAL SAVE ONLY (CTRL+S)
  // ==========================================
  useEffect(() => {
    const handleSave = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (problem) {
          saveCodeFileToDisk(problem.id.toString());
        }
      }
    };

    window.addEventListener("keydown", handleSave);

    return () => {
      window.removeEventListener("keydown", handleSave);
    };
  }, [problem, saveCodeFileToDisk]);

  const handleRunCode = async () => {
    if (!editor || !problem) return;

    const code = editor.getText();
    const langConfig = availableLanguages.find((l) => l.name === selectedLang);

    if (!langConfig) return;

    setIsRunning(true);
    setIsTerminalOpen(true);
    setTerminalOutput(null);

    // Get the first example's input to feed into the program
    const testInput = problem.examples?.[0]?.input || "";

    try {
      const result = await invoke<{
        stdout: string;
        stderr: string;
        success: boolean;
      }>("execute_code", {
        languageSlug: langConfig.slug,
        code: code,
        fileId: problem.id.toString(),
        stdinInput: testInput, // <-- Pass it here!
      });

      setTerminalOutput(result);
    } catch (err: any) {
      setTerminalOutput({
        stdout: "",
        stderr: err.toString() || "Failed to execute code.",
        success: false,
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (!problem) {
    return (
      <div
        className={`w-full h-[calc(100vh-2.25rem)] flex items-center justify-center ${darkMode ? "bg-[#121214] text-zinc-500" : "bg-gray-50 text-gray-400"}`}
      >
        <span className="font-mono text-sm animate-pulse">
          No code problems found. Go to the Home page to create one!
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-1 pl-2 pr-3.5 w-full h-[calc(100vh-2.25rem)] grid grid-cols-3 gap-1 transition-colors duration-200 overflow-hidden select-none ${
        darkMode ? "bg-[#121214] text-zinc-100" : "bg-gray-50 text-zinc-800"
      }`}
    >
      <div data-tour="ide-problem" className="col-span-1 h-full min-h-0">
        <ProblemInstructionTrack darkMode={darkMode} />
      </div>

      <div className="col-span-2 flex flex-col h-full overflow-hidden w-[calc(100%+0.5rem)] relative">
        <CodeWorkspaceHeader
          darkMode={darkMode}
          languages={availableLanguages}
          selectedLanguage={selectedLang}
          onLanguageChange={(lang) => setSelectedLang(lang)}
          onSave={() => saveCodeFileToDisk(problem.id.toString())}
          onRun={handleRunCode}
          isRunning={isRunning}
        />

        <div
          data-tour="ide-editor"
          className={`flex-1 w-full min-h-0 overflow-y-auto border-x border-b transition-colors focus-within:ring-1 focus-within:ring-indigo-500/20 ${
            isTerminalOpen ? "rounded-none border-b-0" : "rounded-b-sm"
          } ${
            darkMode
              ? "bg-[#151518] border-zinc-800/80"
              : "bg-zinc-50/50 border-zinc-200"
          }`}
        >
          <EditorContent
            editor={editor}
            className={`w-full min-h-full flex flex-col font-mono text-xs transition-colors duration-200 [&_.tiptap]:flex-1 [&_.tiptap]:outline-none [&_.tiptap]:p-2 ${
              darkMode
                ? "bg-[#151518] [&_.tiptap]:text-zinc-200"
                : "bg-zinc-50/50 [&_.tiptap]:text-zinc-800"
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

        {/* Terminal Panel */}
        {isTerminalOpen && (
          <div
            className={`h-64 shrink-0 flex flex-col border-x border-b rounded-b-xl overflow-hidden font-mono text-xs ${
              darkMode
                ? "bg-[#0c0c0d] border-zinc-800/80 text-zinc-300"
                : "bg-white border-zinc-200 text-zinc-700"
            }`}
          >
            <div
              className={`flex items-center justify-between px-3 py-1.5 border-b ${darkMode ? "border-zinc-800/80 bg-[#121214]" : "border-zinc-200 bg-zinc-100"}`}
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
                <FiTerminal /> Output
              </div>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity"
              >
                <FiX size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 whitespace-pre-wrap">
              {isRunning ? (
                <span className="text-amber-500 animate-pulse">
                  Compiling and executing...
                </span>
              ) : terminalOutput ? (
                <>
                  {terminalOutput.stdout && (
                    <div
                      className={
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }
                    >
                      {terminalOutput.stdout}
                    </div>
                  )}
                  {terminalOutput.stderr && (
                    <div className="text-rose-500 mt-2">
                      {terminalOutput.stderr}
                    </div>
                  )}
                  {!terminalOutput.stdout && !terminalOutput.stderr && (
                    <span className="opacity-50 italic">
                      Process finished with exit code 0 (no output)
                    </span>
                  )}
                </>
              ) : (
                <span className="opacity-50 italic">
                  Press "Run" to execute your code.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
