import { create } from "zustand";
import { persist } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";

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
  type MockPage,
  type MockSubtask,
  type MockTask,
  type Folder,
  type MockNotebook,
} from "../assets/SAMPLE";
import { type CodeFile } from "../Pages/CodeIDE.SAMPLE";

import {
  welcomeNotebook,
  shortcutsNotebook,
  playgroundFolder,
  gettingStartedCode,
} from "./demoContent";

const DEFAULT_PRINT_WIDTH = 794;

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => {
      const commit = (result: TreeUpdateResult) => {
        const updatedNotebook = result.activeNotebook;
        let newIsDirty = get().isDirty;

        if (
          updatedNotebook &&
          get().activeNotebook?.id === updatedNotebook.id
        ) {
          const currentJson = JSON.stringify(updatedNotebook);
          newIsDirty = currentJson !== get().lastSavedNotebookJson;
        }

        set({
          notebooks: result.notebooks,
          activeNotebook: updatedNotebook ?? get().activeNotebook,
          isDirty: newIsDirty,
        });
      };

      const findPage = (notebookId: string, pageId: string) =>
        get()
          .notebooks.find((n) => n.id === notebookId)
          ?.pages.find((p) => p.id === pageId);

      return {
        notebooks: [],
        folders: [],
        codeFiles: [],
        activeNotebook: null,
        isDirty: false,
        isCodeDirty: false,
        lastSavedNotebookJson: null,

        initializeData: async () => {
          if (get().notebooks.length > 0) return;

          let loadedNotebooks: MockNotebook[] = [];
          let loadedCodes: CodeFile[] = [];

          try {
            const loadedStrings = await invoke<string[]>("load_all_notebooks");
            loadedNotebooks = loadedStrings.map(
              (str) => JSON.parse(str) as MockNotebook,
            );
          } catch (err) {
            console.warn("Could not load notebooks from disk:", err);
          }

          try {
            const loadedCodesStrings = await invoke<string[]>(
              "load_all_code_files",
            );
            loadedCodes = loadedCodesStrings.map(
              (str) => JSON.parse(str) as CodeFile,
            );
          } catch (err) {
            console.warn("Could not load code files from disk:", err);
          }

          if (loadedNotebooks.length > 0 || loadedCodes.length > 0) {
            set({
              notebooks:
                loadedNotebooks.length > 0
                  ? loadedNotebooks
                  : [welcomeNotebook, shortcutsNotebook],
              codeFiles:
                loadedCodes.length > 0 ? loadedCodes : [gettingStartedCode],
              folders: [playgroundFolder],
            });
          } else {
            const notebooks = [welcomeNotebook, shortcutsNotebook].map(
              (nb) => ({
                ...nb,
                pages: nb.pages.map((p) => ({ ...p, notebookId: nb.id })),
              }),
            );

            set({
              notebooks,
              folders: [playgroundFolder],
              codeFiles: [gettingStartedCode],
              isDirty: false,
              lastSavedNotebookJson: null,
            });

            for (const nb of notebooks) {
              try {
                await invoke("save_notebook", {
                  notebookId: nb.id,
                  contents: JSON.stringify(nb, null, 2),
                });
              } catch (e) {
                console.error("Failed to seed demo notebook to disk", e);
              }
            }

            try {
              await invoke("save_code_file", {
                codeId: gettingStartedCode.id.toString(),
                contents: JSON.stringify(gettingStartedCode, null, 2),
              });
            } catch (e) {
              console.error("Failed to seed demo code file to disk", e);
            }
          }
        },

        setActiveNotebookById: (id) => {
          const notebook = get().notebooks.find((n) => n.id === id) ?? null;

          set({
            activeNotebook: notebook,
            isDirty: false,
            lastSavedNotebookJson: notebook ? JSON.stringify(notebook) : null,
          });
        },

        saveNotebookToDisk: async (notebookId: string) => {
          const notebook = get().notebooks.find((n) => n.id === notebookId);
          if (!notebook) return;

          try {
            await invoke("save_notebook", {
              notebookId: notebook.id,
              contents: JSON.stringify(notebook, null, 2),
            });
            console.log(`[Disk] Saved notebook: ${notebook.title}`);

            if (get().activeNotebook?.id === notebookId) {
              set({
                isDirty: false,
                lastSavedNotebookJson: JSON.stringify(notebook),
              });
            }
          } catch (error) {
            console.error(
              `[Disk] Failed to save notebook ${notebookId}:`,
              error,
            );
          }
        },

        // ── Code File Mutations ────────────────────────────────────
        saveCodeFileToDisk: async (codeId: string) => {
          const codeFile = get().codeFiles.find(
            (c) => c.id.toString() === codeId,
          );
          if (!codeFile) return;

          try {
            // 1. Save internal JSON metadata
            await invoke("save_code_file", {
              codeId: codeFile.id.toString(),
              contents: JSON.stringify(codeFile, null, 2),
            });

            // 2. Find out which language is currently active in the IDE
            const activeLangName =
              localStorage.getItem("ide_selected_language") || "Python";
            const activeTemplate = codeFile.codeTemplates?.find(
              (t) => t.language === activeLangName,
            );

            // 3. Only export the file for the active language
            if (activeTemplate) {
              const safeTitle = codeFile.title
                .replace(/[\\/:*?"<>|]/g, "-")
                .trim();

              const extMap: Record<string, string> = {
                python: "py",
                javascript: "js",
                java: "java",
                cpp: "cpp",
              };
              const ext = extMap[activeTemplate.slug] || "txt";

              const extractCode = (html: string) => {
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
                text = textarea.value;

                return text.replace(/\n{3,}/g, "\n\n").trim();
              };

              const rawCode = extractCode(activeTemplate.starterCode);

              await invoke("export_raw_code", {
                filename: `${safeTitle}.${ext}`,
                contents: rawCode,
              });
            }

            console.log(
              `[Disk] Saved and exported code file: ${codeFile.title} (${activeLangName})`,
            );
            set({ isCodeDirty: false });
          } catch (error) {
            console.error(`[Disk] Failed to save code file ${codeId}:`, error);
          }
        },

        updateCodeFileCode: (codeId, language, code) => {
          set((state) => ({
            codeFiles: state.codeFiles.map((c) => {
              if (c.id.toString() !== codeId.toString()) return c;

              return {
                ...c,
                codeTemplates: c.codeTemplates?.map((t) =>
                  t.language === language ? { ...t, starterCode: code } : t,
                ),
              };
            }),
            isCodeDirty: true,
          }));
        },

        updateCodeFileMetadata: (codeId, metadata) => {
          set((state) => ({
            codeFiles: state.codeFiles.map((c) => {
              if (c.id.toString() !== codeId.toString()) return c;
              return {
                ...c,
                ...metadata,
              };
            }),
            isCodeDirty: true,
          }));
        },

        clearCodeDirty: () => set({ isCodeDirty: false }),

        addNotebook: (title = "Untitled Notebook") => {
          const notebookId = crypto.randomUUID();
          const pageId = crypto.randomUUID();
          const { createdDate, createdTime } = generateTimestamp();

          const newNotebook: MockNotebook = {
            id: notebookId,
            title,
            events: [],
            tasks: [],
            pages: [
              {
                id: pageId,
                notebookId,
                title: "Untitled Page 1",
                createdDate,
                createdTime,
                printZone: { x: 40, width: DEFAULT_PRINT_WIDTH },
                nodes: [],
                strokes: [],
              },
            ],
          };

          set((state) => ({ notebooks: [newNotebook, ...state.notebooks] }));
          setTimeout(() => get().saveNotebookToDisk(notebookId), 0);

          return notebookId;
        },

        deleteNotebook: (id) => {
          set((state) => ({
            notebooks: state.notebooks.filter((n) => n.id !== id),
            activeNotebook:
              state.activeNotebook?.id === id ? null : state.activeNotebook,
          }));

          invoke("delete_notebook", { notebookId: id }).catch((err) =>
            console.error("Failed to delete notebook from disk", err),
          );
        },

        addFolder: (title = "Untitled Folder") => {
          const folderId = crypto.randomUUID();
          const { createdDate } = generateTimestamp();

          const newFolder: Folder = {
            id: folderId,
            title,
            color: "#3b82f6",
            description: "A new workspace folder.",
            createdDate,
            lastUpdatedDate: createdDate,
            content: [],
          };

          set((state) => ({ folders: [newFolder, ...state.folders] }));
          return folderId;
        },

        deleteFolder: (id) => {
          set((state) => ({
            folders: state.folders.filter((f) => f.id !== id),
          }));
        },

        addCodeFile: (title = "Untitled Problem") => {
          const timestamp = Date.now();
          const slug = `${title.toLowerCase().replace(/\s+/g, "-")}`;

          const newFile: CodeFile = {
            id: timestamp,
            title,
            titleSlug: slug,
            category: "Uncategorized",
            difficulty: "Easy",
            likes: 0,
            dislikes: 0,
            description: {
              markdown: `## ${title}\n\nWrite your problem description here.`,
              html: `<h2>${title}</h2><p>Write your problem description here.</p>`,
            },
            constraints: [],
            examples: [],
            tags: [],
            testCases: [],
            codeTemplates: [
              {
                language: "Python",
                slug: "python",
                starterCode:
                  "class Solution:\n    def solve(self):\n        # TODO\n        pass",
              },
              {
                language: "JavaScript",
                slug: "javascript",
                starterCode: "function solve() {\n  // TODO\n}",
              },
              {
                language: "Java",
                slug: "java",
                starterCode:
                  "class Solution {\n    public void solve() {\n        // TODO\n    }\n}",
              },
            ],
          };

          set((state) => ({ codeFiles: [newFile, ...state.codeFiles] }));
          setTimeout(() => get().saveCodeFileToDisk(newFile.id.toString()), 0);

          return newFile.titleSlug;
        },

        deleteCodeFile: (id) => {
          const fileToDelete = get().codeFiles.find(
            (c) => c.id.toString() === id.toString(),
          );

          set((state) => ({
            codeFiles: state.codeFiles.filter(
              (c) => c.id.toString() !== id.toString(),
            ),
          }));

          invoke("delete_code_file", { codeId: id.toString() }).catch((err) =>
            console.error("Failed to delete internal code file", err),
          );

          if (fileToDelete) {
            const safeTitle = fileToDelete.title
              .replace(/[\\/:*?"<>|]/g, "-")
              .trim();
            const exts = ["py", "js", "java", "cpp", "txt"];
            exts.forEach((ext) => {
              invoke("delete_raw_code", {
                filename: `${safeTitle}.${ext}`,
              }).catch(() => {
                // Ignore errors for missing extensions
              });
            });
          }
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

        updateNodeContent: (notebookId, pageId, nodeId, newContent) => {
          commit(
            mapNode(get().notebooks, notebookId, pageId, nodeId, (n) => ({
              ...n,
              content: newContent,
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
          if (!targetPage) return;

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
          if (!targetPage) return;

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

        addItemToFolder: (folderId, item) => {
          set((state) => ({
            folders: state.folders.map((f) => {
              if (f.id !== folderId) return f;
              if ("content" in item && item.id === folderId) return f;
              if (f.content.some((c) => c.id === item.id)) return f;
              return { ...f, content: [...f.content, item] };
            }),
          }));
        },

        reorderFolderContent: (folderId, newContent) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId ? { ...f, content: newContent } : f,
            ),
          }));
        },
        updateFolderBody: (folderId, body) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    body,
                    lastUpdatedDate: new Date().toISOString().split("T")[0],
                  }
                : f,
            ),
          }));
        },

        updateFolderFooter: (folderId, footer) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    footer,
                    lastUpdatedDate: new Date().toISOString().split("T")[0],
                  }
                : f,
            ),
          }));
        },

        renameFolder: (folderId, newTitle) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    title: newTitle,
                    lastUpdatedDate: new Date().toISOString().split("T")[0],
                  }
                : f,
            ),
          }));
        },

        updateFolderColor: (folderId, newColor) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    color: newColor,
                    lastUpdatedDate: new Date().toISOString().split("T")[0],
                  }
                : f,
            ),
          }));
        },

        updateFolderDescription: (folderId, newDescription) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId
                ? {
                    ...f,
                    description: newDescription,
                    lastUpdatedDate: new Date().toISOString().split("T")[0],
                  }
                : f,
            ),
          }));
        },

        updateFolderIcon: (folderId, icon) => {
          set((state) => ({
            folders: state.folders.map((f) =>
              f.id === folderId ? { ...f, icon } : f,
            ),
          }));
        },
      };
    },
    {
      name: "caldera-workspace-storage-v8",
      partialize: (state) => ({
        folders: state.folders,
      }),
    },
  ),
);
