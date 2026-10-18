import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { WorkspaceState } from "./types";
import {
  createNode,
  generateTimestamp,
  mapNode,
  mapNotebook,
  mapPage,
  mapPrintZone,
  removeItemById,
  updateItemById,
  type TreeUpdateResult,
} from "./utils";
import {
  generateMockFolderData,
  generateMockNotebookData,
  type MockPage,
  type MockSubtask,
  type MockTask,
} from "../assets/SAMPLE";
import { generateCodeFiles } from "../Pages/CodeIDE.SAMPLE";

const DEFAULT_PRINT_WIDTH = 794;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => {
      const commit = (result: TreeUpdateResult) =>
        set({
          notebooks: result.notebooks,
          activeNotebook: result.activeNotebook ?? get().activeNotebook,
        });

      const findPage = (notebookId: string, pageId: string) =>
        get()
          .notebooks.find((n) => n.id === notebookId)
          ?.pages.find((p) => p.id === pageId);

      return {
        notebooks: [],
        folders: [],
        codeFiles: [],
        activeNotebook: null,

        initializeData: () => {
          if (get().notebooks.length > 0) return;

          const notebooks = generateMockNotebookData(18, 5, 3);
          const codeFiles = generateCodeFiles(18);
          const folders = generateMockFolderData(notebooks, codeFiles, 6);

          set({ notebooks, folders, codeFiles });
        },

        setActiveNotebookById: (id) => {
          set({
            activeNotebook: get().notebooks.find((n) => n.id === id) ?? null,
          });
        },

        renamePage: (notebookId, pageId, newTitle) => {
          commit(
            mapPage(get().notebooks, notebookId, pageId, (p) => ({
              ...p,
              title: newTitle,
            })),
          );
        },

        addPageToNotebook: (notebookId, pageTitle) => {
          const { createdDate, createdTime } = generateTimestamp();

          const newPage: MockPage = {
            id: crypto.randomUUID(),
            notebookId,
            title: pageTitle,
            createdDate,
            createdTime,
            printZone: { x: 40, width: DEFAULT_PRINT_WIDTH },
            nodes: [],
            strokes: [],
          };

          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              pages: [...nb.pages, newPage],
            })),
          );
        },

        updateNodePosition: (notebookId, pageId, nodeId, newX, newY) => {
          commit(
            mapNode(get().notebooks, notebookId, pageId, nodeId, (n) => ({
              ...n,
              x: newX,
              y: newY,
            })),
          );
        },

        updateNodeSize: (notebookId, pageId, nodeId, newWidth, newHeight) => {
          commit(
            mapNode(get().notebooks, notebookId, pageId, nodeId, (n) => ({
              ...n,
              width: newWidth,
              height: newHeight,
            })),
          );
        },

        updateNodeBackgroundColor: (notebookId, pageId, nodeId, newColor) => {
          commit(
            mapNode(get().notebooks, notebookId, pageId, nodeId, (n) => ({
              ...n,
              backgroundColor: newColor,
            })),
          );
        },

        addNodeToPage: (notebookId, pageId, nodeType) => {
          const targetPage = findPage(notebookId, pageId);

          if (!targetPage) {
            console.warn("[addNodeToPage] stale id chain", {
              notebookId,
              pageId,
            });
            return;
          }

          const node = createNode(nodeType, targetPage.nodes.length);

          commit(
            mapPage(get().notebooks, notebookId, pageId, (p) => ({
              ...p,
              nodes: [...p.nodes, node],
            })),
          );
        },

        deleteNodeFromPage: (notebookId, pageId, nodeId) => {
          const targetPage = findPage(notebookId, pageId);

          if (!targetPage) {
            console.warn("[deleteNodeFromPage] stale id chain", {
              notebookId,
              pageId,
            });
            return;
          }

          commit(
            mapPage(get().notebooks, notebookId, pageId, (p) => ({
              ...p,
              nodes: removeItemById(p.nodes, nodeId),
            })),
          );
        },

        updatePrintZone: (notebookId, pageId, x, width) => {
          commit(
            mapPrintZone(get().notebooks, notebookId, pageId, (zone) => ({
              ...zone,
              x,
              width,
            })),
          );
        },

        // ── Task mutations ────────────────────────────────────
        addTask: (notebookId, title) => {
          const trimmed = title.trim();
          if (!trimmed) return;

          const newTask: MockTask = {
            id: crypto.randomUUID(),
            title: trimmed,
            status: "todo",
            priority: "medium",
            subtasks: [],
          };

          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: [...nb.tasks, newTask],
            })),
          );
        },

        cycleTaskStatus: (notebookId, taskId) => {
          const notebook = get().notebooks.find((n) => n.id === notebookId);
          const task = notebook?.tasks.find((t) => t.id === taskId);
          if (!task) return;

          const hasIncompleteSubtasks =
            task.subtasks.length > 0 && task.subtasks.some((s) => !s.done);

          let next: MockTask["status"];
          if (task.status === "todo") {
            next = "in-progress";
          } else if (task.status === "in-progress") {
            if (hasIncompleteSubtasks) return;
            next = "done";
          } else {
            next = "todo";
          }

          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: updateItemById(nb.tasks, taskId, (t) => ({
                ...t,
                status: next,
              })),
            })),
          );
        },

        deleteTask: (notebookId, taskId) => {
          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: removeItemById(nb.tasks, taskId),
            })),
          );
        },

        // ── Subtask mutations ─────────────────────────────────
        addSubtask: (notebookId, taskId, text) => {
          const trimmed = text.trim();
          if (!trimmed) return;

          const newSubtask: MockSubtask = {
            id: crypto.randomUUID(),
            text: trimmed,
            done: false,
          };

          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: updateItemById(nb.tasks, taskId, (task) => ({
                ...task,
                subtasks: [...task.subtasks, newSubtask],
              })),
            })),
          );
        },

        toggleSubtask: (notebookId, taskId, subtaskId) => {
          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: updateItemById(nb.tasks, taskId, (task) => ({
                ...task,
                subtasks: updateItemById(task.subtasks, subtaskId, (s) => ({
                  ...s,
                  done: !s.done,
                })),
              })),
            })),
          );
        },

        deleteSubtask: (notebookId, taskId, subtaskId) => {
          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: updateItemById(nb.tasks, taskId, (task) => ({
                ...task,
                subtasks: removeItemById(task.subtasks, subtaskId),
              })),
            })),
          );
        },

        setTaskSubtasks: (notebookId, taskId, subtasks) => {
          commit(
            mapNotebook(get().notebooks, notebookId, (nb) => ({
              ...nb,
              tasks: updateItemById(nb.tasks, taskId, (task) => ({
                ...task,
                subtasks,
              })),
            })),
          );
        },
      };
    },
    {
      name: "caldera-workspace-storage-v6",
    },
  ),
);
