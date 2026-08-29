import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generateMockNotebookData,
  type MockNotebook,
  type MockPage,
  type MockSection,
} from "../assets/SAMPLE";

// Helper to generate random color
const presetHexColors = [
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#ec4899",
  "#eab308",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#fef3c7",
  "#fce7f3",
  "#e0f2fe",
  "#d1fae5",
  "#ede9fe",
  "#fed7aa",
  "#fecaca",
  "#cffafe",
  "#e5e7eb",
  "#f3f4f6",
];
const getRandomColor = () =>
  presetHexColors[Math.floor(Math.random() * presetHexColors.length)];

interface NotebookState {
  notebooks: MockNotebook[];
  activeNotebook: MockNotebook | null;
  initializeData: () => void;
  setActiveNotebookById: (id: string) => void;
  addSectionToNotebook: (notebookId: string, sectionTitle: string) => void;
  addPageToSection: (
    notebookId: string,
    sectionId: string,
    newPageTitle: string,
  ) => void;
  renameSection: (
    notebookId: string,
    sectionId: string,
    newTitle: string,
  ) => void;
  renamePage: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    newTitle: string,
  ) => void;
  updateNodePosition: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    nodeId: string,
    newX: number,
    newY: number,
  ) => void;
  updateNodeSize: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    nodeId: string,
    newWidth: number,
    newHeight: number,
  ) => void;
  // NEW: update node background color
  updateNodeBackgroundColor: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    nodeId: string,
    newColor: string,
  ) => void;
}

export const useNotebookStore = create<NotebookState>()(
  persist(
    (set, get) => ({
      notebooks: [],
      activeNotebook: null,

      initializeData: () => {
        if (get().notebooks.length > 0) return;
        const data = generateMockNotebookData(3, 4, 5);
        set({ notebooks: data });
      },

      setActiveNotebookById: (id: string) => {
        const matched = get().notebooks.find((n) => n.id === id) || null;
        set({ activeNotebook: matched });
      },

      renameSection: (notebookId, sectionId, newTitle) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map((section) => {
            if (section.id !== sectionId) return section;
            return { ...section, title: newTitle };
          });

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      renamePage: (notebookId, sectionId, pageId, newTitle) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map((section) => {
            if (section.id !== sectionId) return section;

            const updatedPages = section.pages.map((page) => {
              if (page.id !== pageId) return page;
              return { ...page, title: newTitle };
            });

            return { ...section, pages: updatedPages };
          });

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      addSectionToNotebook: (notebookId, sectionTitle) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const newSectionId = crypto.randomUUID();
          const now = new Date();
          const createdDate = now.toISOString().split("T")[0];
          const timeParts = now.toTimeString().split(" ")[0].split(":");
          const createdTime = `${timeParts[0]}:${timeParts[1]}`;

          const newSection: MockSection = {
            id: newSectionId,
            notebookId: notebook.id,
            title: sectionTitle,
            colorHex: getRandomColor(),
            pages: [
              {
                id: crypto.randomUUID(),
                sectionId: newSectionId,
                title: "Untitled Page 1",
                createdDate,
                createdTime,
                nodes: [],
              },
            ],
          };

          const updatedNotebook = {
            ...notebook,
            sections: [...notebook.sections, newSection],
          };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      addPageToSection: (notebookId, sectionId, newPageTitle) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map((section) => {
            if (section.id !== sectionId) return section;

            const now = new Date();
            const createdDate = now.toISOString().split("T")[0];
            const timeParts = now.toTimeString().split(" ")[0].split(":");
            const createdTime = `${timeParts[0]}:${timeParts[1]}`;

            const newPage: MockPage = {
              id: crypto.randomUUID(),
              sectionId: section.id,
              title: newPageTitle,
              createdDate,
              createdTime,
              nodes: [],
            };

            return {
              ...section,
              pages: [...section.pages, newPage],
            };
          });

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      updateNodePosition: (
        notebookId,
        sectionId,
        pageId,
        nodeId,
        newX,
        newY,
      ) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map((section) => {
            if (section.id !== sectionId) return section;

            const updatedPages = section.pages.map((page) => {
              if (page.id !== pageId) return page;

              const updatedNodes = page.nodes.map((node) => {
                if (node.id !== nodeId) return node;
                return { ...node, x: newX, y: newY };
              });

              return { ...page, nodes: updatedNodes };
            });

            return { ...section, pages: updatedPages };
          });

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      updateNodeSize: (
        notebookId,
        sectionId,
        pageId,
        nodeId,
        newWidth,
        newHeight,
      ) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map((section) => {
            if (section.id !== sectionId) return section;

            const updatedPages = section.pages.map((page) => {
              if (page.id !== pageId) return page;

              const updatedNodes = page.nodes.map((node) => {
                if (node.id !== nodeId) return node;
                return { ...node, width: newWidth, height: newHeight };
              });

              return { ...page, nodes: updatedNodes };
            });

            return { ...section, pages: updatedPages };
          });

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      // NEW: update node background color
      updateNodeBackgroundColor: (
        notebookId,
        sectionId,
        pageId,
        nodeId,
        newColor,
      ) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map((section) => {
            if (section.id !== sectionId) return section;

            const updatedPages = section.pages.map((page) => {
              if (page.id !== pageId) return page;

              const updatedNodes = page.nodes.map((node) => {
                if (node.id !== nodeId) return node;
                return { ...node, backgroundColor: newColor };
              });

              return { ...page, nodes: updatedNodes };
            });

            return { ...section, pages: updatedPages };
          });

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },
    }),
    {
      name: "caldera-notebook-storage",
    },
  ),
);
