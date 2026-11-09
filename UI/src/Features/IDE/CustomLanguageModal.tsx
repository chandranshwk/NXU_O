import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { invoke } from "@tauri-apps/api/core";
import { FiX, FiCheck, FiCode, FiInfo } from "react-icons/fi";

interface CustomLanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
}

export const CustomLanguageModal: React.FC<CustomLanguageModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ext, setExt] = useState("");
  const [commentPrefix, setCommentPrefix] = useState("//");
  const [runCmd, setRunCmd] = useState("");
  const [compileCmd, setCompileCmd] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const runCmdRef = useRef<HTMLInputElement>(null);
  const compileCmdRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name || !slug || !ext || !runCmd) return;
    setIsSaving(true);

    const config = {
      name,
      slug,
      extension: ext,
      commentPrefix,
      isCustom: true,
      runCmd: runCmd.split(" ").filter(Boolean),
      ...(compileCmd.trim()
        ? { compileCmd: compileCmd.split(" ").filter(Boolean) }
        : {}),
    };

    try {
      await invoke("save_custom_language", { slug, config });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to inject tokens at the cursor position
  const insertToken = (
    ref: React.RefObject<HTMLInputElement | null>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    token: string,
  ) => {
    const input = ref.current;
    if (!input) return;

    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const current = input.value;

    // Add spaces around the token for convenience
    const before = current.slice(0, start);
    const after = current.slice(end);
    const spaceBefore = before.length > 0 && !before.endsWith(" ") ? " " : "";
    const spaceAfter = after.length > 0 && !after.startsWith(" ") ? " " : "";

    const newValue = `${before}${spaceBefore}${token}${spaceAfter}${after}`;
    setter(newValue);

    // Refocus and move cursor to after the token
    setTimeout(() => {
      input.focus();
      const newCursorPos =
        start + spaceBefore.length + token.length + spaceAfter.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1.5 ml-1 ${
    darkMode ? "text-zinc-500" : "text-zinc-400"
  }`;

  const inputClass = `w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all border font-mono ${
    darkMode
      ? "bg-[#1a1a1c]/50 border-zinc-800 text-zinc-200 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-zinc-600"
      : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-zinc-400"
  }`;

  const TokenBtn = ({
    token,
    onClick,
  }: {
    token: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-bold transition-colors ${
        darkMode
          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20"
          : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
      }`}
    >
      + {token}
    </button>
  );

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-xl rounded-md border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
          darkMode
            ? "bg-[#121214] border-zinc-800 text-zinc-200"
            : "bg-white border-zinc-200 text-zinc-800"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            darkMode
              ? "border-zinc-800/80 bg-[#18181b]"
              : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-md ${darkMode ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
            >
              <FiCode size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Add Custom Language
              </h2>
              <p
                className={`text-[10px] ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Configure a new compiler or interpreter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-zinc-800 text-zinc-400"
                : "hover:bg-zinc-200 text-zinc-500"
            }`}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brainfuck"
                className={`${inputClass} font-sans`}
              />
            </div>
            <div>
              <label className={labelClass}>Slug (ID)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="e.g. brainfuck"
                className={`${inputClass} font-sans`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>File Extension</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">
                  .
                </span>
                <input
                  value={ext}
                  onChange={(e) => setExt(e.target.value.replace(/\./g, ""))}
                  placeholder="bf"
                  className={`${inputClass} pl-6`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Comment Prefix</label>
              <input
                value={commentPrefix}
                onChange={(e) => setCommentPrefix(e.target.value)}
                placeholder="e.g. #"
                className={inputClass}
              />
            </div>
          </div>

          <div
            className={`h-px w-full my-1 ${darkMode ? "bg-zinc-800/50" : "bg-zinc-100"}`}
          />

          {/* Run Command */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Run Command
              </label>
              <TokenBtn
                token="{file}"
                onClick={() => insertToken(runCmdRef, setRunCmd, "{file}")}
              />
            </div>
            <input
              ref={runCmdRef}
              value={runCmd}
              onChange={(e) => setRunCmd(e.target.value)}
              placeholder="e.g. python {file}"
              className={inputClass}
            />
            <div
              className={`mt-2 text-[11px] leading-relaxed ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}
            >
              <span className="font-semibold text-indigo-400">{"{file}"}</span>{" "}
              is replaced by the absolute path to the temporary code file (e.g.,{" "}
              <code className="opacity-70">C:\temp\run_123.py</code>).
            </div>
          </div>

          {/* Compile Command */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label
                className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
              >
                Compile Command{" "}
                <span className="opacity-50 lowercase normal-case">
                  (optional)
                </span>
              </label>
              <div className="flex gap-1.5">
                <TokenBtn
                  token="{file}"
                  onClick={() =>
                    insertToken(compileCmdRef, setCompileCmd, "{file}")
                  }
                />
                <TokenBtn
                  token="{exePath}"
                  onClick={() =>
                    insertToken(compileCmdRef, setCompileCmd, "{exePath}")
                  }
                />
              </div>
            </div>
            <input
              ref={compileCmdRef}
              value={compileCmd}
              onChange={(e) => setCompileCmd(e.target.value)}
              placeholder="e.g. gcc {file} -o {exePath}"
              className={inputClass}
            />
            <div
              className={`mt-2 text-[11px] leading-relaxed ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}
            >
              <span className="font-semibold text-indigo-400">{"{file}"}</span>{" "}
              is the source file.{" "}
              <span className="font-semibold text-indigo-400">
                {"{exePath}"}
              </span>{" "}
              is the path where the compiled binary should be saved (e.g.,{" "}
              <code className="opacity-70">C:\temp\run_123.exe</code>).
            </div>
          </div>

          {/* Live Example Preview */}
          {(runCmd || compileCmd) && (
            <div
              className={`mt-2 p-3 rounded-md border text-xs font-mono ${darkMode ? "bg-[#151518] border-zinc-800/60" : "bg-zinc-50 border-zinc-200"}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                <FiInfo /> Live Preview
              </div>
              {compileCmd && (
                <div
                  className={`mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-600"}`}
                >
                  <span className="text-emerald-500 mr-2">$</span>
                  {compileCmd
                    .replace(/{file}/g, ext ? `main.${ext}` : "main")
                    .replace(/{exePath}/g, ext ? `main.exe` : "main")}
                </div>
              )}
              {runCmd && (
                <div className={darkMode ? "text-zinc-400" : "text-zinc-600"}>
                  <span className="text-emerald-500 mr-2">$</span>
                  {runCmd
                    .replace(/{file}/g, ext ? `main.${ext}` : "main")
                    .replace(/{exePath}/g, ext ? `main.exe` : "main")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-4 border-t flex justify-end gap-2 ${
            darkMode
              ? "border-zinc-800/80 bg-[#18181b]"
              : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              darkMode
                ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                : "hover:bg-zinc-200 text-zinc-600 hover:text-zinc-800"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name || !slug || !ext || !runCmd}
            className="px-5 py-2 text-xs font-bold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <FiCheck size={14} /> {isSaving ? "Saving..." : "Save Language"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
