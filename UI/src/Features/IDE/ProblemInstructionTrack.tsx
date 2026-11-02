/**
 * @file ProblemInstructionTrack.tsx
 * @component ProblemInstructionTrack
 * @description Isolates the static markdown/HTML prompt renderings, structured variable examples,
 * and program limitations into an independent scrollable layout container.
 */

import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useWorkspaceStore } from "../../Store/store";
import type { CodeFile } from "./CodeIDE.SAMPLE";
import { FiEdit2, FiPlus, FiTrash2, FiCheck, FiX } from "react-icons/fi";

interface ProblemInstructionTrackProps {
  darkMode: boolean;
}

export const ProblemInstructionTrack: React.FC<
  ProblemInstructionTrackProps
> = ({ darkMode }) => {
  const { id } = useParams<{ id: string }>();
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);
  const updateCodeFileMetadata = useWorkspaceStore(
    (s) => s.updateCodeFileMetadata,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editExamples, setEditExamples] = useState<any[]>([]);
  const [editConstraints, setEditConstraints] = useState<string[]>([]);

  const data: CodeFile | undefined = useMemo(() => {
    if (!codeFiles || codeFiles.length === 0) return undefined;
    if (id) {
      const found = codeFiles.find(
        (c) => c.titleSlug === id || c.id.toString() === id,
      );
      if (found) return found;
    }
    return codeFiles[0];
  }, [id, codeFiles]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center p-5 border rounded-xl border-zinc-800/80 bg-zinc-900/40">
        <span className="text-xs font-mono text-zinc-500 animate-pulse">
          No problem data available...
        </span>
      </div>
    );
  }

  const stripHtml = (html: string) => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  const renderDescription = (htmlText: string) => {
    const plainText = stripHtml(htmlText);
    const paragraphs = plainText.split("\n").filter((p) => p.trim() !== "");

    return paragraphs.map((p, i) => {
      const parts = p.split(/("[^"]*")/g);
      return (
        <p key={i} className="mb-2.5 leading-relaxed text-[13px]">
          {parts.map((part, j) => {
            if (part.startsWith('"') && part.endsWith('"')) {
              return (
                <span
                  key={j}
                  className={`px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[11px] border ${
                    darkMode
                      ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                      : "bg-indigo-50 text-indigo-600 border-indigo-100"
                  }`}
                >
                  {part}
                </span>
              );
            }
            return <span key={j}>{part}</span>;
          })}
        </p>
      );
    });
  };

  const handleStartEditing = () => {
    setEditTitle(data.title);
    setEditDesc(stripHtml(data.description.html));
    setEditExamples([...data.examples]);
    setEditConstraints([...data.constraints]);
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = () => {
    updateCodeFileMetadata(data.id.toString(), {
      title: editTitle,
      description: { ...data.description, html: editDesc, markdown: editDesc },
      examples: editExamples,
      constraints: editConstraints.filter((c) => c.trim() !== ""),
    });
    setIsEditing(false);
  };

  const addExample = () => {
    setEditExamples([
      ...editExamples,
      {
        id: (editExamples.length + 1).toString(),
        input: "",
        output: "",
        explanation: "",
      },
    ]);
  };

  const removeExample = (index: number) => {
    setEditExamples(editExamples.filter((_, i) => i !== index));
  };

  const addConstraint = () => {
    setEditConstraints([...editConstraints, ""]);
  };

  const removeConstraint = (index: number) => {
    setEditConstraints(editConstraints.filter((_, i) => i !== index));
  };

  const baseClass = `h-full flex flex-col border rounded-sm overflow-y-auto no-scrollbar transition-colors duration-200 ${
    darkMode ? "bg-zinc-900/40 border-zinc-800/80" : "bg-white border-zinc-200"
  }`;

  // Ultra-clean input class (Notion style)
  const inputClass = `w-full bg-transparent border-b border-transparent hover:border-zinc-700/50 focus:border-indigo-500 outline-none px-1 py-1 text-sm transition-colors ${
    darkMode ? "text-zinc-200" : "text-zinc-800"
  }`;

  // ==========================================
  // EDIT MODE RENDER
  // ==========================================
  if (isEditing) {
    return (
      <div className={baseClass}>
        {/* Compact Sticky Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b backdrop-blur-md ${
            darkMode
              ? "bg-zinc-900/90 border-zinc-800/80"
              : "bg-white/90 border-zinc-200"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
            Editing Problem
          </span>
          <div className="flex gap-1">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors"
              title="Cancel"
            >
              <FiX size={16} />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              title="Save Changes"
            >
              <FiCheck size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-5 pb-12">
          {/* Title Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-50">
              Title
            </label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={`${inputClass} font-semibold text-base`}
            />
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex justify-between items-end mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider opacity-50">
                Description
              </label>
              <span className="text-[9px] opacity-40 italic">
                "Quotes" auto-highlight
              </span>
            </div>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={6}
              className={`w-full bg-transparent border border-zinc-700/50 rounded-md px-3 py-2 text-sm font-sans outline-none focus:border-indigo-500/50 transition-colors resize-y leading-relaxed ${
                darkMode ? "text-zinc-200" : "text-zinc-800"
              }`}
            />
          </div>

          {/* Examples List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider opacity-50">
                Examples
              </label>
              <button
                onClick={addExample}
                className="text-[11px] font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
              >
                <FiPlus size={12} /> Add
              </button>
            </div>

            {editExamples.map((ex, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border mb-2 relative group ${
                  darkMode
                    ? "bg-zinc-950/30 border-zinc-800/60"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <button
                  onClick={() => removeExample(idx)}
                  className="absolute top-2 right-2 p-1 rounded-md text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <FiTrash2 size={12} />
                </button>

                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <label className="block text-[9px] uppercase font-semibold opacity-50 mb-0.5">
                      Input
                    </label>
                    <input
                      value={ex.input}
                      onChange={(e) => {
                        const newEx = [...editExamples];
                        newEx[idx].input = e.target.value;
                        setEditExamples(newEx);
                      }}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-semibold opacity-50 mb-0.5">
                      Output
                    </label>
                    <input
                      value={ex.output}
                      onChange={(e) => {
                        const newEx = [...editExamples];
                        newEx[idx].output = e.target.value;
                        setEditExamples(newEx);
                      }}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-semibold opacity-50 mb-0.5">
                    Explanation (Optional)
                  </label>
                  <input
                    value={ex.explanation || ""}
                    onChange={(e) => {
                      const newEx = [...editExamples];
                      newEx[idx].explanation = e.target.value;
                      setEditExamples(newEx);
                    }}
                    className={`${inputClass} text-xs`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Constraints List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider opacity-50">
                Constraints
              </label>
              <button
                onClick={addConstraint}
                className="text-[11px] font-medium text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
              >
                <FiPlus size={12} /> Add
              </button>
            </div>

            {editConstraints.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1 group">
                <input
                  value={c}
                  onChange={(e) => {
                    const newC = [...editConstraints];
                    newC[idx] = e.target.value;
                    setEditConstraints(newC);
                  }}
                  className={`${inputClass} font-mono text-xs`}
                />
                <button
                  onClick={() => removeConstraint(idx)}
                  className={`shrink-0 p-1 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-colors ${
                    darkMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW MODE RENDER
  // ==========================================
  return (
    <div className={`${baseClass} p-5`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-mono uppercase tracking-wider opacity-40 block">
          {data.category}
        </span>
        <button
          onClick={handleStartEditing}
          className={`p-1.5 rounded-md transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
          }`}
          title="Edit Problem Details"
        >
          <FiEdit2 size={14} />
        </button>
      </div>

      <h1 className="text-lg font-bold tracking-tight mb-3">{data.title}</h1>

      <div className="mb-6">{renderDescription(data.description.html)}</div>

      <div className="flex flex-col gap-2 mb-6 select-text">
        {data.examples.map((example) => (
          <div
            key={example.id}
            className={`p-3 rounded-lg border font-mono text-[11px] ${
              darkMode
                ? "bg-zinc-950/40 border-zinc-800/60"
                : "bg-zinc-50/50 border-zinc-200/80"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1.5">
              Example {example.id}
            </span>
            <div className="space-y-1">
              <div className="break-all">
                <span className="opacity-40">Input:</span> {example.input}
              </div>
              <div className="break-all">
                <span className="opacity-40">Output:</span> {example.output}
              </div>
              {example.explanation && (
                <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 font-sans text-zinc-400 leading-normal">
                  <span className="italic opacity-60">Explanation:</span>{" "}
                  {example.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-zinc-200/60 dark:border-zinc-800/40">
        <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2">
          Constraints
        </h3>
        <ul className="flex flex-col gap-1.5">
          {data.constraints.map((constraint: string, idx: number) => (
            <li
              key={idx}
              className={`font-mono text-[11px] px-2.5 py-1 rounded-md border w-max max-w-full truncate ${
                darkMode
                  ? "bg-zinc-900/60 border-zinc-800/50 text-zinc-300"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              {constraint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
