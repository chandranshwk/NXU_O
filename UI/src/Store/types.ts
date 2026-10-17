import type { MockNotebook } from "../assets/SAMPLE";

export type NodeComponentType = "text" | "map";

export interface NotebookState {
  notebooks: MockNotebook[];
  activeNotebook: MockNotebook | null;

  initializeData: () => void;
  setActiveNotebookById: (id: string) => void;

  // ── Page mutations ─────────────────────────────────────────
  addPageToNotebook: (notebookId: string, pageTitle: string) => void;
  renamePage: (notebookId: string, pageId: string, newTitle: string) => void;

  // ── Node mutations ─────────────────────────────────────────
  addNodeToPage: (
    notebookId: string,
    pageId: string,
    nodeType: NodeComponentType,
  ) => void;
  deleteNodeFromPage: (
    notebookId: string,
    pageId: string,
    nodeId: string,
  ) => void;
  updateNodePosition: (
    notebookId: string,
    pageId: string,
    nodeId: string,
    newX: number,
    newY: number,
  ) => void;
  updateNodeSize: (
    notebookId: string,
    pageId: string,
    nodeId: string,
    newWidth: number,
    newHeight: number,
  ) => void;
  updateNodeBackgroundColor: (
    notebookId: string,
    pageId: string,
    nodeId: string,
    newColor: string,
  ) => void;

  // ── Print zone ─────────────────────────────────────────────
  updatePrintZone: (
    notebookId: string,
    pageId: string,
    x: number,
    width: number,
  ) => void;

  // ── Task mutations ─────────────────────────────────────────
  addTask: (notebookId: string, title: string) => void;
  cycleTaskStatus: (notebookId: string, taskId: string) => void;
  deleteTask: (notebookId: string, taskId: string) => void;

  // ── Subtask mutations ──────────────────────────────────────
  addSubtask: (notebookId: string, taskId: string, text: string) => void;
  toggleSubtask: (
    notebookId: string,
    taskId: string,
    subtaskId: string,
  ) => void;
  deleteSubtask: (
    notebookId: string,
    taskId: string,
    subtaskId: string,
  ) => void;
  /** Replaces the entire subtask array on a task. */
  setTaskSubtasks: (
    notebookId: string,
    taskId: string,
    subtasks: import("../assets/SAMPLE").MockSubtask[],
  ) => void;
}
