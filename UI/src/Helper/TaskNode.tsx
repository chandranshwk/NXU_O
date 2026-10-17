/**
 * @file TaskNode.tsx
 * @component TaskNode
 * @description Task list for the right rail. Clicking a task focuses it —
 * its subtasks populate the TodoBoard panel.
 *
 * @architecture
 * - Row click  → focus (populates TodoBoard).
 * - Dot click  → cycle status.
 * - Chevron    → expand/collapse inline subtask list.
 * - Focused row shows a blue accent bar.
 */

import React, { useMemo, useState } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuChevronsUp,
  LuChevronUp,
} from "react-icons/lu";
import { FiPlus, FiX } from "react-icons/fi";
import type { MockTask, MockSubtask } from "../assets/SAMPLE";
import { useNotebookStore } from "../Store/store";

interface TaskNodeProps {
  notebookId: string;
  tasks: MockTask[];
  darkMode: boolean;
  /** Task whose subtasks populate the TodoBoard. */
  selectedTaskId: string | null;
  /** Called with a task id to focus, or null to clear. */
  onSelectTask: (id: string | null) => void;
}

const PRIORITY_RANK: Record<MockTask["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const SECTION_ORDER: MockTask["status"][] = ["in-progress", "todo", "done"];

const SECTION_LABELS: Record<MockTask["status"], string> = {
  "in-progress": "In Progress",
  todo: "To Do",
  done: "Done",
};

const STATUS_DOT: Record<MockTask["status"], string> = {
  done: "bg-emerald-500",
  "in-progress": "bg-blue-500",
  todo: "bg-zinc-400",
};

const formatDueDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const isOverdue = (iso: string | undefined): boolean => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
};

const PriorityIcon: React.FC<{ priority: MockTask["priority"] }> = ({
  priority,
}) => {
  if (priority === "high")
    return <LuChevronsUp className="text-rose-500 shrink-0" size={12} />;
  if (priority === "medium")
    return <LuChevronUp className="text-amber-500 shrink-0" size={12} />;
  return <LuChevronDown className="text-blue-500 shrink-0" size={12} />;
};

const CheckIcon: React.FC = () => (
  <svg
    width="7"
    height="7"
    viewBox="0 0 10 10"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1.5,5 4,7.5 8.5,2.5" />
  </svg>
);

const SubtaskRow: React.FC<{
  subtask: MockSubtask;
  darkMode: boolean;
  onToggle: () => void;
  onDelete: () => void;
}> = ({ subtask, darkMode, onToggle, onDelete }) => (
  <li
    className={`group/sub flex items-start gap-1 rounded transition-colors ${
      darkMode ? "hover:bg-zinc-800/30" : "hover:bg-zinc-50"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="flex items-start gap-2 flex-1 min-w-0 pl-6 pr-1 py-1 text-left rounded outline-none focus-visible:ring-1 focus-visible:ring-blue-500/40"
    >
      <span
        className={`mt-[2px] w-3 h-3 shrink-0 rounded-[3px] border flex items-center justify-center transition-colors ${
          subtask.done
            ? "bg-blue-500 border-blue-500"
            : darkMode
              ? "border-zinc-600 group-hover/sub:border-zinc-400"
              : "border-zinc-300 group-hover/sub:border-zinc-500"
        }`}
      >
        {subtask.done && <CheckIcon />}
      </span>
      <span
        className={`min-w-0 flex-1 text-[11.5px] leading-snug break-words ${
          subtask.done
            ? darkMode
              ? "text-zinc-600 line-through"
              : "text-zinc-400 line-through"
            : darkMode
              ? "text-zinc-400"
              : "text-zinc-600"
        }`}
      >
        {subtask.text}
      </span>
    </button>
    <button
      type="button"
      onClick={onDelete}
      aria-label="Delete subtask"
      className={`shrink-0 mt-[5px] mr-1.5 flex items-center justify-center w-3 h-3 rounded opacity-0 group-hover/sub:opacity-100 focus-visible:opacity-100 transition-opacity ${
        darkMode
          ? "text-zinc-700 hover:text-rose-400"
          : "text-zinc-400 hover:text-rose-500"
      }`}
    >
      <FiX size={10} />
    </button>
  </li>
);

const TaskRow: React.FC<{
  task: MockTask;
  notebookId: string;
  darkMode: boolean;
  isFocused: boolean;
  onSelectTask: (id: string | null) => void;
}> = ({ task, notebookId, darkMode, isFocused, onSelectTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");

  const done = task.status === "done";
  const overdue = isOverdue(task.dueDate);

  const total = task.subtasks.length;
  const doneCount = task.subtasks.filter((s) => s.done).length;
  const allSubsDone = total === 0 || doneCount === total;
  const hasSubs = total > 0;

  const blockedBySubtasks =
    task.status === "in-progress" && hasSubs && !allSubsDone;

  let badgeClass = "";
  if (hasSubs) {
    if (task.status === "in-progress" && !allSubsDone) {
      badgeClass = "text-amber-500 bg-amber-500/10";
    } else if (allSubsDone && !done) {
      badgeClass = "text-emerald-500 bg-emerald-500/10";
    } else if (done) {
      badgeClass = darkMode
        ? "text-zinc-600 bg-zinc-800/60"
        : "text-zinc-400 bg-zinc-100";
    } else {
      badgeClass = darkMode
        ? "text-zinc-500 bg-zinc-800/60"
        : "text-zinc-500 bg-zinc-100";
    }
  }

  const rowTooltip = blockedBySubtasks
    ? `Complete all subtasks first (${doneCount}/${total} done)`
    : (task.description ?? task.title);

  const handleAddSubtask = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    useNotebookStore.getState().addSubtask(notebookId, task.id, trimmed);
    setDraft("");
  };

  return (
    <li
      className={`group rounded-md transition-colors relative ${
        darkMode ? "hover:bg-zinc-800/30" : "hover:bg-zinc-50"
      } ${isFocused ? (darkMode ? "bg-zinc-800/40" : "bg-blue-50/60") : ""}`}
    >
      {isFocused && (
        <span className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full bg-blue-500" />
      )}

      <div className="flex items-start gap-1">
        {/* Chevron — expand/collapse inline subtask list only */}
        {hasSubs ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
            className={`shrink-0 mt-[7px] ml-1 w-4 h-4 flex items-center justify-center rounded outline-none transition-colors ${
              darkMode
                ? "text-zinc-600 hover:text-zinc-300"
                : "text-zinc-400 hover:text-zinc-700"
            }`}
          >
            {expanded ? (
              <LuChevronDown size={11} />
            ) : (
              <LuChevronRight size={11} />
            )}
          </button>
        ) : (
          <span className="shrink-0 w-4 ml-1" aria-hidden />
        )}

        {/* Row body — click focuses this task */}
        <button
          type="button"
          onClick={() => onSelectTask(task.id)}
          title={rowTooltip}
          className="flex items-start gap-1.5 flex-1 min-w-0 px-1 py-1.5 text-left rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <span className="mt-[3px] shrink-0">
            <PriorityIcon priority={task.priority} />
          </span>

          <span
            className={`min-w-0 flex-1 text-[12px] leading-snug break-words ${
              done
                ? darkMode
                  ? "text-zinc-600 line-through decoration-zinc-700"
                  : "text-zinc-400 line-through decoration-zinc-300"
                : darkMode
                  ? "text-zinc-300"
                  : "text-zinc-700"
            }`}
          >
            {task.title}
          </span>

          {hasSubs && (
            <span
              className={`shrink-0 mt-[1px] text-[10px] font-mono px-1 rounded transition-colors ${badgeClass}`}
            >
              {doneCount}/{total}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`shrink-0 mt-[1px] text-[10px] font-mono ${
                overdue && !done
                  ? "text-rose-500"
                  : darkMode
                    ? "text-zinc-500"
                    : "text-zinc-400"
              }`}
            >
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </button>

        {/* Status dot — cycle status */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            useNotebookStore.getState().cycleTaskStatus(notebookId, task.id);
          }}
          aria-label="Cycle task status"
          title={
            blockedBySubtasks
              ? "Blocked — complete all subtasks first"
              : "Click to change status"
          }
          className="shrink-0 mt-[3px] w-5 h-5 flex items-center justify-center rounded-full outline-none transition-colors hover:bg-zinc-700/40 focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status]}`}
          />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() =>
            useNotebookStore.getState().deleteTask(notebookId, task.id)
          }
          aria-label="Delete task"
          className={`shrink-0 mt-[7px] mr-1.5 flex items-center justify-center w-3.5 h-3.5 rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity ${
            darkMode
              ? "text-zinc-600 hover:text-rose-400"
              : "text-zinc-400 hover:text-rose-500"
          }`}
        >
          <FiX size={11} />
        </button>
      </div>

      {expanded && (
        <div className="pb-1">
          {hasSubs && (
            <ul className="space-y-px">
              {task.subtasks.map((sub) => (
                <SubtaskRow
                  key={sub.id}
                  subtask={sub}
                  darkMode={darkMode}
                  onToggle={() =>
                    useNotebookStore
                      .getState()
                      .toggleSubtask(notebookId, task.id, sub.id)
                  }
                  onDelete={() =>
                    useNotebookStore
                      .getState()
                      .deleteSubtask(notebookId, task.id, sub.id)
                  }
                />
              ))}
            </ul>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddSubtask();
            }}
            className={`flex items-center gap-1.5 ml-6 mr-2 mt-1 px-2 py-1 rounded border transition-colors ${
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
          </form>
        </div>
      )}
    </li>
  );
};

const TaskNode: React.FC<TaskNodeProps> = ({
  notebookId,
  tasks,
  darkMode,
  selectedTaskId,
  onSelectTask,
}) => {
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState<Set<MockTask["status"]>>(
    new Set(),
  );

  const grouped = useMemo(() => {
    const groups: Record<MockTask["status"], MockTask[]> = {
      "in-progress": [],
      todo: [],
      done: [],
    };
    for (const t of tasks) groups[t.status].push(t);
    for (const key of SECTION_ORDER) {
      groups[key].sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      );
    }
    return groups;
  }, [tasks]);

  const total = tasks.length;
  const doneCount = grouped.done.length;

  const handleAddTask = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    useNotebookStore.getState().addTask(notebookId, trimmed);
    setDraft("");
  };

  const toggleSection = (status: MockTask["status"]) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  return (
    <div className="flex flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddTask();
        }}
        className={`flex items-center gap-1.5 mx-2 mt-2 mb-1 px-2 py-1.5 rounded-md border transition-colors ${
          darkMode
            ? "bg-zinc-950/60 border-zinc-800/80 focus-within:border-zinc-600"
            : "bg-zinc-50/60 border-zinc-200 focus-within:border-zinc-400"
        }`}
      >
        <FiPlus
          size={12}
          className={darkMode ? "text-zinc-600" : "text-zinc-400"}
        />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a task…"
          className={`flex-1 min-w-0 bg-transparent text-[12px] outline-none ${
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

      {total === 0 && (
        <div
          className={`px-3 py-8 text-center text-[11px] ${
            darkMode ? "text-zinc-600" : "text-zinc-400"
          }`}
        >
          Nothing here yet
        </div>
      )}

      {total > 0 &&
        SECTION_ORDER.map((status) => {
          const group = grouped[status];
          if (group.length === 0) return null;

          const isCollapsed = collapsed.has(status);

          return (
            <section key={status} className="mb-1">
              <button
                type="button"
                onClick={() => toggleSection(status)}
                className={`w-full flex items-center gap-1 px-3 py-1 outline-none transition-colors ${
                  darkMode ? "hover:bg-zinc-800/30" : "hover:bg-zinc-50"
                }`}
              >
                {isCollapsed ? (
                  <LuChevronRight
                    size={11}
                    className={darkMode ? "text-zinc-600" : "text-zinc-400"}
                  />
                ) : (
                  <LuChevronDown
                    size={11}
                    className={darkMode ? "text-zinc-600" : "text-zinc-400"}
                  />
                )}
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    darkMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {SECTION_LABELS[status]}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    darkMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {group.length}
                </span>
              </button>

              {!isCollapsed && (
                <ul className="px-1 pb-1 space-y-px">
                  {group.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      notebookId={notebookId}
                      darkMode={darkMode}
                      isFocused={selectedTaskId === task.id}
                      onSelectTask={onSelectTask}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}

      {total > 0 && (
        <div
          className={`mt-1 mb-2 px-3 text-[10px] font-mono ${
            darkMode ? "text-zinc-600" : "text-zinc-400"
          }`}
        >
          {doneCount} of {total} tasks done
        </div>
      )}
    </div>
  );
};

export default TaskNode;
