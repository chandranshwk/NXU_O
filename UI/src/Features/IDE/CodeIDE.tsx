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

const FALLBACK_LANGS = [
  { name: "Python", slug: "python", extension: "py", commentPrefix: "#" },
];

// ==========================================
// TEXT <-> DOC HELPERS
// ==========================================

const looksLikeHtml = (text: string): boolean => {
  const hasOpen = /<p[\s>]/i.test(text) || /<div[\s>]/i.test(text);
  const hasClose =
    /<\/p>/i.test(text) || /<\/div>/i.test(text) || /<br\s*\/?>/i.test(text);
  return hasOpen && hasClose;
};

const stripHtmlToText = (html: string): string => {
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<\/blockquote>/gi, "\n");

  text = text.replace(/<[^>]+>/g, "");

  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;

  return textarea.value.replace(/\n{3,}/g, "\n\n").replace(/^\n+|\n+$/g, "");
};

const buildDocFromText = (text: string) => {
  const lines = text.split("\n");
  return {
    type: "doc",
    content: lines.map((line) =>
      line.length > 0
        ? { type: "paragraph", content: [{ type: "text", text: line }] }
        : { type: "paragraph" },
    ),
  };
};

const CodeIDEContent: React.FC = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const settings = useSettings();
  const { id } = useParams<{ id: string }>();

  const codeFiles = useWorkspaceStore((s) => s.codeFiles);
  const updateCodeFileCode = useWorkspaceStore((s) => s.updateCodeFileCode);

  const saveCodeFileToJson = useWorkspaceStore((s) => s.saveCodeFileToJson);
  const exportCodeToDisk = useWorkspaceStore((s) => s.exportCodeToDisk);

  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>(
    localStorage.getItem("ide_selected_language") || "Python",
  );

  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<{
    stdout: string;
    stderr: string;
    success: boolean;
  } | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const [customInput, setCustomInput] = useState("");
  const [activeExampleIdx, setActiveExampleIdx] = useState<number>(0);

  useEffect(() => {
    invoke<Record<string, any>>("get_available_languages")
      .then(async (langMap) => {
        const allLangArray = Object.values(langMap);
        const installedSlugs = await invoke<string[]>(
          "get_installed_languages",
        );
        let filtered = allLangArray.filter((lang) =>
          installedSlugs.includes(lang.slug),
        );

        if (filtered.length === 0 && langMap["python"]) {
          filtered = [langMap["python"]];
        }

        setAvailableLanguages(filtered);

        const savedLang = localStorage.getItem("ide_selected_language");
        const isValid = filtered.some((l) => l.name === savedLang);

        if (isValid && savedLang) {
          setSelectedLang(savedLang);
        } else if (filtered.length > 0) {
          setSelectedLang(filtered[0].name);
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
          "nxuo-ide-tiptap max-w-full w-full outline-none font-mono text-xs p-4 leading-relaxed break-all h-full min-h-full",
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

      const rawText = currentEditor.state.doc.textBetween(
        0,
        currentEditor.state.doc.content.size,
        "\n",
        "\n",
      );

      if (problem) {
        updateCodeFileCode(problem.id.toString(), selectedLang, rawText);
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

    let rawText = template?.starterCode ?? "";

    if (looksLikeHtml(rawText)) {
      rawText = stripHtmlToText(rawText);
    }

    if (!rawText) {
      const langConfig = availableLanguages.find(
        (l) => l.name === selectedLang,
      );
      const prefix = langConfig?.commentPrefix || "//";
      rawText = `${prefix} Write your ${selectedLang} solution here\n`;
    }

    editor.commands.setContent(buildDocFromText(rawText), {
      emitUpdate: false,
    });

    const langConfig = availableLanguages.find((l) => l.name === selectedLang);
    const langSlug = langConfig?.slug || "javascript";
    const { state, view } = editor;
    const transaction = state.tr.setMeta("setLanguage", langSlug);
    view.dispatch(transaction);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 50);
  }, [problem?.id, selectedLang, editor, availableLanguages]);

  useEffect(() => {
    const handleSave = (e?: KeyboardEvent) => {
      if (e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
        } else {
          return;
        }
      }
      if (problem) {
        saveCodeFileToJson(problem.id.toString());
      }
    };

    window.addEventListener("keydown", handleSave);
    const autoSaveInterval = setInterval(handleSave, 30_000);

    return () => {
      window.removeEventListener("keydown", handleSave);
      clearInterval(autoSaveInterval);
    };
  }, [problem, saveCodeFileToJson]);

  // Reset tab to Example 1 when switching problems
  useEffect(() => {
    setActiveExampleIdx(0);
  }, [problem?.id]);

  // Sync STDIN with the selected Example Tab
  useEffect(() => {
    if (activeExampleIdx === -1) return; // -1 means Custom, don't overwrite

    const example = problem?.examples?.[activeExampleIdx];
    if (example && example.input) {
      setCustomInput(example.input.replace(/\\n/g, "\n"));
    } else {
      setCustomInput("");
    }
  }, [problem?.id, activeExampleIdx]);

  const handleRunCode = async () => {
    if (!editor || !problem) return;

    const code = editor.getText();
    const langConfig = availableLanguages.find((l) => l.name === selectedLang);
    if (!langConfig) return;

    setIsRunning(true);
    setIsTerminalOpen(true);
    setTerminalOutput(null);

    // Ensure literal \n is converted to real newlines for the Rust backend
    const finalInput = customInput.replace(/\\n/g, "\n");

    try {
      const result = await invoke<{
        stdout: string;
        stderr: string;
        success: boolean;
      }>("execute_code", {
        languageSlug: langConfig.slug,
        code: code,
        fileId: problem.id.toString(),
        stdinInput: finalInput,
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
    <>
      <style>{`
        .tiptap.nxuo-ide-tiptap,
        .tiptap.nxuo-ide-tiptap * {
          white-space: pre-wrap !important;
          tab-size: 4;
          -moz-tab-size: 4;
        }
        .tiptap.nxuo-ide-tiptap p {
          margin: 0 !important;
          padding: 0 !important;
          font-size: 0.75rem !important;
          line-height: 1.5 !important;
        }
      `}</style>

      <div
        className={`p-3 w-full h-[calc(100vh-2.25rem)] flex gap-3 transition-colors duration-200 overflow-hidden select-none ${
          darkMode ? "bg-[#121214] text-zinc-100" : "bg-gray-50 text-zinc-800"
        }`}
      >
        <div data-tour="ide-problem" className="h-full min-h-0 overflow-hidden">
          <ProblemInstructionTrack darkMode={darkMode} />
        </div>

        <div className="flex flex-col flex-1 h-full overflow-hidden w-full relative">
          <CodeWorkspaceHeader
            darkMode={darkMode}
            languages={availableLanguages}
            selectedLanguage={selectedLang}
            onLanguageChange={(lang) => setSelectedLang(lang)}
            onSave={() => saveCodeFileToJson(problem.id.toString())}
            onExport={() => exportCodeToDisk(problem.id.toString())}
            onRun={handleRunCode}
            isRunning={isRunning}
          />

          {/* EDITOR AREA */}
          <div
            data-tour="ide-editor"
            className={`flex-1 w-full min-h-0 overflow-y-auto border-x transition-colors focus-within:ring-1 focus-within:ring-indigo-500/20 ${
              isTerminalOpen ? "border-b-0" : "border-b rounded-b-md"
            } ${
              darkMode
                ? "bg-[#151518] border-zinc-800/80"
                : "bg-zinc-50/50 border-zinc-200"
            }`}
          >
            <EditorContent
              editor={editor}
              className={`w-full min-h-full flex flex-col font-mono text-xs transition-colors duration-200 [&_.tiptap]:flex-1 [&_.tiptap]:outline-none [&_.tiptap]:p-2 [&_.tiptap]:whitespace-pre-wrap ${
                darkMode
                  ? "bg-[#151518] [&_.tiptap]:text-zinc-200"
                  : "bg-zinc-50/50 [&_.tiptap]:text-zinc-800"
              }`}
              style={
                {
                  "--editor-line-height": "1.5",
                  "--editor-font-size": "0.75rem",
                  "--editor-ordered-list-representer":
                    settings.defaultOLRepresenter,
                  "--editor-font-color": settings.defaultColor,
                } as React.CSSProperties
              }
            />
          </div>

          {/* NEW: EXAMPLE SELECTOR TABS */}
          <div
            className={`flex items-center gap-1 px-3 pt-2 pb-0 border-x shrink-0 ${
              darkMode
                ? "bg-[#18181b] border-zinc-800/80"
                : "bg-zinc-100 border-zinc-200"
            }`}
          >
            {problem.examples?.map((ex, idx) => (
              <button
                key={ex.id || idx}
                onClick={() => setActiveExampleIdx(idx)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-t-md border-t border-x transition-colors ${
                  activeExampleIdx === idx
                    ? darkMode
                      ? "bg-[#151518] border-zinc-800/80 text-zinc-200 border-b-transparent"
                      : "bg-white border-zinc-200 text-zinc-800 border-b-transparent"
                    : darkMode
                      ? "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                      : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                }`}
              >
                Example {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setActiveExampleIdx(-1)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-t-md border-t border-x transition-colors ${
                activeExampleIdx === -1
                  ? darkMode
                    ? "bg-[#151518] border-zinc-800/80 text-zinc-200 border-b-transparent"
                    : "bg-white border-zinc-200 text-zinc-800 border-b-transparent"
                  : darkMode
                    ? "bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                    : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
              }`}
            >
              Custom
            </button>
          </div>

          {/* STDIN INPUT BAR */}
          <div
            className={`flex items-center px-3 py-2 border-x border-b shrink-0 transition-colors ${
              isTerminalOpen ? "border-b-0" : "rounded-b-md"
            } ${
              darkMode
                ? "bg-[#151518] border-zinc-800/80"
                : "bg-white border-zinc-200"
            }`}
          >
            <span className="text-zinc-500 mr-2 text-[10px] uppercase font-bold tracking-wider">
              Input (Stdin):
            </span>
            <input
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setActiveExampleIdx(-1); // Switch to Custom tab if user types
              }}
              placeholder="Type your test input here before running..."
              className={`flex-1 bg-transparent outline-none text-xs font-mono ${
                darkMode
                  ? "text-emerald-300 placeholder-zinc-600"
                  : "text-emerald-600 placeholder-zinc-400"
              }`}
              disabled={isRunning}
            />
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className="text-[10px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 ml-4 transition-colors"
            >
              {isTerminalOpen ? "Hide Console" : "Show Console"}
            </button>
          </div>

          {/* TERMINAL OUTPUT AREA */}
          {isTerminalOpen && (
            <div
              className={`h-64 shrink-0 flex flex-col border-x border-b rounded-b-md overflow-hidden font-mono text-xs ${
                darkMode
                  ? "bg-[#0c0c0d] border-zinc-800/80 text-zinc-300"
                  : "bg-white border-zinc-200 text-zinc-700"
              }`}
            >
              <div
                className={`flex items-center justify-between px-3 py-1.5 border-b ${
                  darkMode
                    ? "border-zinc-800/80 bg-[#121214]"
                    : "border-zinc-200 bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60">
                  <FiTerminal /> Output Console
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
    </>
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
