import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generateMockNotebookData,
  type MockNotebook,
  type MockPage,
  type MockSection,
} from "../assets/SAMPLE";

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
        const matched =
          get().notebooks.find((n: MockNotebook) => n.id === id) || null;
        set({ activeNotebook: matched });
      },

      renameSection: (
        notebookId: string,
        sectionId: string,
        newTitle: string,
      ) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook: MockNotebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map(
            (section: MockSection) => {
              if (section.id !== sectionId) return section;

              return { ...section, title: newTitle };
            },
          );

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      renamePage: (
        notebookId: string,
        sectionId: string,
        pageId: string,
        newTitle: string,
      ) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook: MockNotebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map(
            (section: MockSection) => {
              if (section.id !== sectionId) return section;

              const updatedPages = section.pages.map((page: MockPage) => {
                if (page.id !== pageId) return page;
                return { ...page, title: newTitle };
              });

              return { ...section, pages: updatedPages };
            },
          );

          const updatedNotebook = { ...notebook, sections: updatedSections };
          updatedActiveNotebook = updatedNotebook;
          return updatedNotebook;
        });

        set({
          notebooks: nextNotebooks,
          activeNotebook: updatedActiveNotebook || get().activeNotebook,
        });
      },

      addSectionToNotebook: (notebookId: string, sectionTitle: string) => {
        const presetHexColors = [
          "#3b82f6",
          "#f97316",
          "#10b981",
          "#a855f7",
          "#ec4899",
          "#eab308",
        ];
        const randomColor =
          presetHexColors[Math.floor(Math.random() * presetHexColors.length)];

        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook: MockNotebook) => {
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
            colorHex: randomColor,
            pages: [
              {
                id: crypto.randomUUID(),
                sectionId: newSectionId,
                title: "Untitled Page 1",
                createdDate: createdDate,
                createdTime: createdTime,
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

      addPageToSection: (
        notebookId: string,
        sectionId: string,
        newPageTitle: string,
      ) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        const nextNotebooks = currentNotebooks.map((notebook: MockNotebook) => {
          if (notebook.id !== notebookId) return notebook;

          const updatedSections = notebook.sections.map(
            (section: MockSection) => {
              if (section.id !== sectionId) return section;

              const now = new Date();
              const createdDate = now.toISOString().split("T")[0];
              const timeParts = now.toTimeString().split(" ")[0].split(":");
              const createdTime = `${timeParts[0]}:${timeParts[1]}`;

              const newPage: MockPage = {
                id: crypto.randomUUID(),
                sectionId: section.id,
                title: newPageTitle,
                createdDate: createdDate,
                createdTime: createdTime,
                nodes: [],
              };

              return {
                ...section,
                pages: [...section.pages, newPage],
              };
            },
          );

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
