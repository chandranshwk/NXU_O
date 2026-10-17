/**
 * @file RightRail.tsx
 * @component RightRail
 * @description Right-hand rail. Subscribes to the store directly for the
 * active notebook so updates propagate instantly. Collapses with zen mode.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { MockNotebook, MockSubtask } from "../assets/SAMPLE";
import { useNotebookStore } from "../Store/store";
import { useSettings } from "../contexts/settingsContext";
import CalenderNode from "../Helper/Calendar/CalenderNode";
import TaskNode from "../Helper/TaskNode";
import TodoBoard from "../Helper/ToDoBoard";
import { FiChevronDown, FiSidebar } from "react-icons/fi";
import { AnimatePresence, motion } from "motion/react";

interface RightRailProps {
  notebook?: MockNotebook | null;
  darkMode: boolean;
}

const RAIL_WIDTH_EXPANDED = "w-80";
const RAIL_WIDTH_SETTING_ZEN_MODE = "w-9";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const Panel: React.FC<{
  title: string;
  count?: number;
  darkMode: boolean;
  children: React.ReactNode;
  /** Start collapsed? Defaults to false (open). */
  defaultCollapsed?: boolean;
}> = ({ title, count, darkMode, children, defaultCollapsed = false }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section
      className={`flex flex-col overflow-hidden  border ${
        darkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
      }`}
    >
      <header
        className={`flex items-center justify-between px-3 py-2 border-b shrink-0 ${
          darkMode ? "border-zinc-800" : "border-zinc-100"
        }`}
      >
        <h3
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            darkMode ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          {title}
        </h3>

        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span
              className={`text-[10px] font-mono ${
                darkMode ? "text-zinc-500" : "text-zinc-400"
              }`}
            >
              {count}
            </span>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand" : "Collapse"}
            className={`shrink-0 flex items-center justify-center w-5 h-5 rounded outline-none transition-colors ${
              darkMode
                ? "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            } focus-visible:ring-2 focus-visible:ring-blue-500/40`}
          >
            <motion.span
              animate={{ rotate: collapsed ? -90 : 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="flex items-center justify-center"
            >
              <FiChevronDown size={13} />
            </motion.span>
          </button>
        </div>
      </header>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export const RightRail: React.FC<RightRailProps> = ({
  notebook: notebookProp,
  darkMode,
}) => {
  const activeNotebook = useNotebookStore((s) => s.activeNotebook);
  const notebook = activeNotebook ?? notebookProp ?? null;

  const events = notebook?.events ?? [];
  const tasks = notebook?.tasks ?? [];
  const notebookId = notebook?.id ?? "";

  const setting = useSettings();

  const [localExpanded, setLocalExpanded] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLocalExpanded(setting.zenMode);
    }, 0);
  }, [setting.zenMode]);

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);

  const focusedTask = useMemo(
    () => tasks.find((t) => t.id === focusedTaskId) ?? null,
    [tasks, focusedTaskId],
  );

  useEffect(() => {
    setTimeout(() => {
      setFocusedTaskId(null);
    }, 0);
  }, [notebookId]);

  useEffect(() => {
    if (focusedTaskId && !focusedTask) {
      setTimeout(() => {
        setFocusedTaskId(null);
      }, 0);
    }
  }, [focusedTaskId, focusedTask]);

  const setFocusedSubtasks = useCallback(
    (next: MockSubtask[]) => {
      if (!focusedTaskId) return;
      useNotebookStore
        .getState()
        .setTaskSubtasks(notebookId, focusedTaskId, next);
    },
    [notebookId, focusedTaskId],
  );

  const subtaskCount =
    tasks
      .find((t) => t.id === focusedTaskId)
      ?.subtasks.reduce((sum) => sum + 1, 0) ?? 0;

  return (
    <aside
      className={`h-full shrink-0 flex flex-col pb-8 border-l overflow-hidden transition-[width] duration-200 ease-out ${
        localExpanded ? RAIL_WIDTH_SETTING_ZEN_MODE : RAIL_WIDTH_EXPANDED
      } ${
        darkMode
          ? "bg-zinc-950 border-zinc-800"
          : "bg-zinc-50/60 border-zinc-200"
      }`}
    >
      <div
        className={`shrink-0 flex items-center border-b ${
          darkMode ? "border-zinc-800" : "border-zinc-200/80"
        } ${
          localExpanded
            ? "justify-center py-2"
            : "justify-between pl-3 pr-2 py-2"
        }`}
      >
        {!localExpanded && (
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Tools
          </span>
        )}

        <button
          type="button"
          onClick={() => setLocalExpanded(!localExpanded)}
          aria-label={localExpanded ? "Expand rail" : "Collapse rail"}
          title={localExpanded ? "Expand rail" : "Collapse rail"}
          className={`flex items-center justify-center w-6 h-6 rounded outline-none transition-colors ${
            darkMode
              ? "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          } focus-visible:ring-2 focus-visible:ring-blue-500/40`}
        >
          <FiSidebar
            size={13}
            className={`transition-transform duration-200 ${
              localExpanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {!localExpanded && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 pb-6 ">
          <Panel title="Calendar" count={events.length} darkMode={darkMode}>
            <CalenderNode events={events} darkMode={darkMode} />
          </Panel>

          <Panel title="Todos" count={subtaskCount} darkMode={darkMode}>
            <TodoBoard
              subtasks={focusedTask?.subtasks ?? []}
              setSubtasks={setFocusedSubtasks}
              taskTitle={focusedTask?.title ?? null}
              darkMode={darkMode}
            />
          </Panel>

          <Panel title="Tasks" count={tasks.length} darkMode={darkMode}>
            <TaskNode
              notebookId={notebookId}
              tasks={tasks}
              darkMode={darkMode}
              selectedTaskId={focusedTaskId}
              onSelectTask={setFocusedTaskId}
            />
          </Panel>
        </div>
      )}
    </aside>
  );
};

export default RightRail;
