import type {
  Folder,
  MockNotebook,
  MockSubtask,
  NodeComponentType,
} from "../assets/SAMPLE";
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";

export interface WorkspaceState {
  // ── Top-level collections ──────────────────────────────────
  notebooks: MockNotebook[];
  folders: Folder[];
  codeFiles: CodeFile[];

  activeNotebook: MockNotebook | null;

  /** Tracks if the active notebook has unsaved changes */
  isDirty: boolean;

  /** Tracks if the active code file has unsaved changes */
  isCodeDirty: boolean;

  /** A minified JSON string of the active notebook as it was when last saved */
  lastSavedNotebookJson: string | null;

  initializeData: () => Promise<void>;
  setActiveNotebookById: (id: string) => void;
  saveNotebookToDisk: (notebookId: string) => Promise<void>;

  // ── Top-level creation mutations ───────────────────────────
  addNotebook: (title?: string) => string;
  deleteNotebook: (id: string) => void;
  addFolder: (title?: string) => string;
  deleteFolder: (id: string) => void;
  addCodeFile: (title?: string) => string;

  // Added saveCodeFileToDisk here
  saveCodeFileToDisk: (codeId: string) => Promise<void>;

  // Changed id to string | number to match CodeFile.id
  deleteCodeFile: (id: string | number) => void;

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

  updateNodeContent: (
    notebookId: string,
    pageId: string,
    nodeId: string,
    newContent: string,
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
  setTaskSubtasks: (
    notebookId: string,
    taskId: string,
    subtasks: MockSubtask[],
  ) => void;

  // ── Folder mutations ──────────────────────────────────────
  updateFolderBody: (folderId: string, body: string) => void;
  updateFolderFooter: (folderId: string, footer: string) => void;
  addItemToFolder: (
    folderId: string,
    item: MockNotebook | CodeFile | Folder,
  ) => void;
  reorderFolderContent: (
    folderId: string,
    newContent: (MockNotebook | CodeFile | Folder)[],
  ) => void;
  renameFolder: (folderId: string, newTitle: string) => void;
  updateFolderColor: (folderId: string, newColor: string) => void;
  updateFolderDescription: (folderId: string, newDescription: string) => void;
  updateFolderIcon: (folderId: string, icon: string | undefined) => void;

  // ── CodeFile mutations ─────────────────────────────────────
  updateCodeFileCode: (codeId: string, language: string, code: string) => void;
  clearCodeDirty: () => void;
}
