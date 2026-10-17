/**
 * @file ToDoBoard.tsx
 * @component TodoBoard
 * @description Renders the subtasks of the currently focused task.
 * Parent owns the data — this component adds, toggles, and deletes via
 * `setSubtasks`.
 */

import React, { useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import type { MockSubtask } from "../assets/SAMPLE";

interface TodoBoardProps {
  subtasks: MockSubtask[];
  setSubtasks: (next: MockSubtask[]) => void;
  darkMode: boolean;
  /** Title of the task whose subtasks are shown. Null = nothing selected. */
  taskTitle: string | null;
}

const TodoBoard: React.FC<TodoBoardProps> = ({
  subtasks,
  setSubtasks,
  darkMode,
  taskTitle,
}) => {
  const [draft, setDraft] = useState("");

  const total = subtasks.length;
  const doneCount = subtasks.filter((s) => s.done).length;
  const progress = total === 0 ? 0 : doneCount / total;

  const sorted = [...subtasks].sort((a, b) => Number(a.done) - Number(b.done));

  const handleToggle = (subtaskId: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
    );
  };

  const handleDelete = (subtaskId: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
  };

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const newSubtask: MockSubtask = {
      id: crypto.randomUUID(),
      text: trimmed,
      done: false,
    };

    setSubtasks([...subtasks, newSubtask]);
    setDraft("");
  };

  // ── No task selected ───────────────────────────
  if (!taskTitle) {
    return (
      <div
        className={`px-3 py-8 text-center text-[11px] leading-relaxed ${
          darkMode ? "text-zinc-600" : "text-zinc-400"
        }`}
      >
        No task selected
        <br />
        <span className={darkMode ? "text-zinc-700" : "text-zinc-300"}>
          Click a task to see its subtasks
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* ── HEADER: which task ─────────────────────── */}
      <div
        className={`mx-2 mt-2 mb-1 px-2 py-1.5 rounded-md border text-[11px] ${
          darkMode
            ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
            : "bg-blue-50 border-blue-200 text-blue-700"
        }`}
      >
        <span className="opacity-70 text-[9px] uppercase tracking-wider font-semibold">
          Task
        </span>
        <div className="truncate font-medium" title={taskTitle}>
          {taskTitle}
        </div>
      </div>

      {/* ── ADD SUBTASK INPUT ──────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
        className={`flex items-center gap-1.5 mx-2 mt-1 mb-1 px-2 py-1 rounded-md border transition-colors ${
          darkMode
            ? "bg-zinc-950/60 border-zinc-800/80 focus-within:border-zinc-600"
            : "bg-zinc-50/60 border-zinc-200 focus-within:border-zinc-400"
        }`}
      >
        <FiPlus
          size={10}
          className={darkMode ? "text-zinc-600" : "text-zinc-400"}
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add subtask…"
          className={`flex-1 min-w-0 bg-transparent text-[11px] outline-none ${
            darkMode
              ? "text-zinc-200 placeholder:text-zinc-600"
              : "text-zinc-800 placeholder:text-zinc-400"
          }`}
        />
        {draft.trim() && (
          <kbd
            className={`shrink-0 text-[9px] font-mono px-1 py-0.5 rounded border ${
              darkMode
                ? "text-zinc-500 border-zinc-700/60 bg-zinc-900"
                : "text-zinc-400 border-zinc-200 bg-white"
            }`}
          >
            ↵
          </kbd>
        )}
      </form>

      {/* ── PROGRESS BAR ───────────────────────────── */}
      {total > 0 && (
        <div className="px-3 pt-1.5 pb-2">
          <div
            className={`flex items-center justify-between mb-1.5 text-[10px] font-mono ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            <span>
              {doneCount} / {total}
            </span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div
            className={`h-0.75 rounded-full overflow-hidden ${
              darkMode ? "bg-zinc-800" : "bg-zinc-100"
            }`}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-[width] duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── EMPTY STATE (task has no subtasks) ─────── */}
      {total === 0 && (
        <div
          className={`px-3 pt-4 pb-6 text-center text-[11px] leading-relaxed ${
            darkMode ? "text-zinc-600" : "text-zinc-400"
          }`}
        >
          This task has no subtasks yet
        </div>
      )}

      {/* ── SUBTASK LIST ───────────────────────────── */}
      {total > 0 && (
        <ul className="px-1 pb-1">
          {sorted.map((sub) => (
            <li
              key={sub.id}
              className={`group flex items-start gap-1 rounded-md transition-colors ${
                darkMode ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50"
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(sub.id)}
                aria-label={sub.done ? "Mark as not done" : "Mark as done"}
                className="flex items-start gap-2 flex-1 min-w-0 px-2 py-1.5 text-left rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              >
                <span
                  className={`mt-px w-3.5 h-3.5 shrink-0 rounded-sm border-[1.5px] flex items-center justify-center transition-all duration-150 ${
                    sub.done
                      ? "bg-blue-500 border-blue-500 scale-95"
                      : darkMode
                        ? "border-zinc-600 group-hover:border-zinc-400 group-hover:bg-zinc-800/60"
                        : "border-zinc-300 group-hover:border-zinc-500 group-hover:bg-zinc-100"
                  }`}
                >
                  {sub.done && (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 10 10"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1.5,5 4,7.5 8.5,2.5" />
                    </svg>
                  )}
                </span>

                <span
                  className={`min-w-0 flex-1 text-[12px] leading-snug wrap-break-words transition-colors ${
                    sub.done
                      ? darkMode
                        ? "text-zinc-600 line-through decoration-zinc-700"
                        : "text-zinc-400 line-through decoration-zinc-300"
                      : darkMode
                        ? "text-zinc-300"
                        : "text-zinc-700"
                  }`}
                >
                  {sub.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(sub.id)}
                aria-label="Delete subtask"
                className={`shrink-0 mt-1.75 mr-1.5 flex items-center justify-center w-3.5 h-3.5 rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ${
                  darkMode
                    ? "text-zinc-600 hover:text-rose-400"
                    : "text-zinc-400 hover:text-rose-500"
                }`}
              >
                <FiX size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoBoard;
