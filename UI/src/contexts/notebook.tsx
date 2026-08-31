/**
 * @file notebook.ts (Snippet 1)
 * @description Central spatial data store managed via Zustand. It coordinates deep,
 * multi-level mutations across notebooks, sections, and pages while maintaining
 * local persistence through middleware syncs.
 *
 * @architecture
 * - Leverages Zustand's `persist` middleware to automatically dump operational states down to localStorage.
 * - Uses nested immutable map loops to compute absolute card position coordinate modifications safely.
 * - Implements a unified state update dispatch macro that refreshes active focus pointers simultaneously.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  generateMockNotebookData,
  type MockNotebook,
  type MockPage,
  type MockSection,
} from "../assets/SAMPLE";

/** Static design palette listing soft visual pastels used to tint background card canvas wrappers */
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

/** Selects a random hex color value out of the central palette array */
const getRandomColor = () =>
  presetHexColors[Math.floor(Math.random() * presetHexColors.length)];

interface NotebookState {
  /** Array tracking the full multi-level repository notebook folder hierarchy */
  notebooks: MockNotebook[];
  /** Reference link pointing straight to the notebook model actively open in focus */
  activeNotebook: MockNotebook | null;
  /** Populates local states with dummy notebook trees upon initial clean launch sequences */
  initializeData: () => void;
  /** Focus navigator mapping state data profiles straight from router search keys */
  setActiveNotebookById: (id: string) => void;
  /** Injects a new section branch entry into the active target notebook array */
  addSectionToNotebook: (notebookId: string, sectionTitle: string) => void;
  /** Appends a new blank page layout layer inside verified parent section lines */
  addPageToSection: (
    notebookId: string,
    sectionId: string,
    newPageTitle: string,
  ) => void;
  /** Mutates section title markers directly within matching notebook arrays */
  renameSection: (
    notebookId: string,
    sectionId: string,
    newTitle: string,
  ) => void;
  /** Mutates sub-page title markers directly within matching section lines */
  renamePage: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    newTitle: string,
  ) => void;
  /** Saves modified absolute x/y coordinates directly down to selected canvas cards */
  updateNodePosition: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    nodeId: string,
    newX: number,
    newY: number,
  ) => void;
  /** Saves modified boundary width/height rules directly down to selected canvas cards */
  updateNodeSize: (
    notebookId: string,
    sectionId: string,
    pageId: string,
    nodeId: string,
    newWidth: number,
    newHeight: number,
  ) => void;
  /** Saves modified background panel tint configurations down to selected canvas cards */
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

      // ==========================================
      // STATE ACTION: INITIAL REPOSITORY SEED
      // ==========================================
      initializeData: () => {
        // Guard clause: Block execution if state arrays hold hydrated parameters
        if (get().notebooks.length > 0) return;
        const data = generateMockNotebookData(3, 4, 5);
        set({ notebooks: data });
      },

      // ==========================================
      // STATE ACTION: ACTIVE OBJECT SELECTOR
      // ==========================================
      setActiveNotebookById: (id: string) => {
        const matched = get().notebooks.find((n) => n.id === id) || null;
        set({ activeNotebook: matched });
      },

      // ==========================================
      // STATE ACTION: MUTATE SECTION LABELS
      // ==========================================
      renameSection: (notebookId, sectionId, newTitle) => {
        const currentNotebooks = get().notebooks;
        let updatedActiveNotebook: MockNotebook | null = null;

        // Traverse the tree immutably to swap descriptors inside matching section branches
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

      // ==========================================
      // STATE ACTION: MUTATE SUB-PAGE LABELS
      // ==========================================
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

      // ==========================================
      // STATE ACTION: APPEND SECTION BLOCK BRANCH
      // ==========================================
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

          // Automatically inject an initial page canvas to prevent zero-length child breaks
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

      // ==========================================
      // STATE ACTION: APPEND SUB-PAGE SHEET CANVASES
      // ==========================================
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

      // ==========================================
      // GEOMETRY: MUTATE SPATIAL COORDINATE PLACEMENTS
      // ==========================================
      /** Deeply iterates to specific canvas card IDs to apply translation vector modifications */
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

      // ==========================================
      // GEOMETRY: MUTATE SPATIAL CARD DIMENSIONS
      // ==========================================
      /** Deeply iterates to specific canvas card IDs to apply explicit width and height dimensions */
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

      // ==========================================
      // DESIGN: MUTATE NODE PANEL BACKDROP HEX
      // ==========================================
      /** Deeply iterates to specific canvas card IDs to overwrite container background colors */
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
      /** The unique identifier key string assigned for local storage caching */
      name: "caldera-notebook-storage",
    },
  ),
);
