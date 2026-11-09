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

  const baseClass = `w-128 h-full flex flex-col border rounded-sm overflow-y-auto no-scrollbar transition-colors duration-200 ${
    darkMode ? "bg-[#121214] border-zinc-800/80" : "bg-white border-zinc-200"
  }`;

  // Clean, seamless input styles
  const inputClass = `w-full bg-[#1a1a1c] border border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 ${
    darkMode ? "text-zinc-200" : "text-zinc-800"
  }`;

  const textareaClass = `${inputClass} resize-none leading-relaxed font-sans`;

  // ==========================================
  // EDIT MODE RENDER
  // ==========================================
  if (isEditing) {
    return (
      <div className={baseClass}>
        {/* Sticky Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b backdrop-blur-md ${
            darkMode
              ? "bg-[#121214]/90 border-zinc-800/80"
              : "bg-white/90 border-zinc-200"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
            Editing Problem
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                darkMode
                  ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <FiX size={14} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
            >
              <FiCheck size={14} /> Save
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-8 pb-12">
          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">
              Title
            </label>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className={`${inputClass} font-semibold text-base`}
              placeholder="Problem Title"
            />
          </div>

          {/* Description Textarea */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-end ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
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
              className={textareaClass}
              placeholder="Write your problem description here..."
            />
          </div>

          {/* Examples List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Examples
              </label>
              <button
                onClick={addExample}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-medium transition-colors"
              >
                <FiPlus size={12} /> Add Example
              </button>
            </div>

            {editExamples.map((ex, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 relative group flex flex-col gap-3 transition-colors ${
                  darkMode
                    ? "bg-[#18181b] border-zinc-800/80 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-zinc-500">
                    Example {idx + 1}
                  </span>
                  <button
                    onClick={() => removeExample(idx)}
                    className={`p-1.5 rounded-md transition-colors ${
                      darkMode
                        ? "text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                        : "text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
                    }`}
                    title="Remove Example"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
                      Input
                    </label>
                    <textarea
                      value={ex.input}
                      onChange={(e) => {
                        const newEx = [...editExamples];
                        newEx[idx].input = e.target.value;
                        setEditExamples(newEx);
                      }}
                      rows={3}
                      className={`${textareaClass} font-mono text-xs`}
                      placeholder="e.g. 5\n10"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
                      Output
                    </label>
                    <textarea
                      value={ex.output}
                      onChange={(e) => {
                        const newEx = [...editExamples];
                        newEx[idx].output = e.target.value;
                        setEditExamples(newEx);
                      }}
                      rows={3}
                      className={`${textareaClass} font-mono text-xs`}
                      placeholder="e.g. 15"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 ml-1">
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
                    placeholder="Explain why this happens..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Constraints List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Constraints
              </label>
              <button
                onClick={addConstraint}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-medium transition-colors"
              >
                <FiPlus size={12} /> Add Constraint
              </button>
            </div>

            {editConstraints.map((c, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <input
                  value={c}
                  onChange={(e) => {
                    const newC = [...editConstraints];
                    newC[idx] = e.target.value;
                    setEditConstraints(newC);
                  }}
                  className={`${inputClass} font-mono text-xs`}
                  placeholder="e.g. 1 <= nums.length <= 100"
                />
                <button
                  onClick={() => removeConstraint(idx)}
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    darkMode
                      ? "text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10"
                      : "text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
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
        {data.examples.map((example, idx) => (
          <div
            key={example.id || idx}
            className={`p-3 rounded-lg border font-mono text-[11px] ${
              darkMode
                ? "bg-zinc-950/40 border-zinc-800/60"
                : "bg-zinc-50/50 border-zinc-200/80"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1.5">
              Example {idx + 1}
            </span>
            <div className="space-y-1">
              <div className="break-all whitespace-pre-wrap">
                <span className="opacity-40">Input:</span>{" "}
                {example.input?.replace(/\\n/g, "\n")}
              </div>
              <div className="break-all whitespace-pre-wrap">
                <span className="opacity-40">Output:</span>{" "}
                {example.output?.replace(/\\n/g, "\n")}
              </div>
              {example.explanation && (
                <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 font-sans text-zinc-400 leading-normal whitespace-pre-wrap">
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
