/**
 * @file SAMPLE.ts
 * @description Mock data engine and type architecture using Faker.js.
 *
 * @architecture
 * - Hierarchy: Notebook → Page → Node.
 * - Notebooks own: pages, events, tasks.
 * - Folders are containers referencing notebooks and code files; they do not parent them.
 * - Todos are not a separate entity — they are the subtasks nested under tasks.
 */

import { faker } from "@faker-js/faker";
import type { MatrixEvent } from "../Helper/Calendar/CalenderNode";
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";

export type CanvasNodeType = "text" | "map" | "image";

export interface MockPageNode {
  id: string;
  type: CanvasNodeType;
  x: number;
  y: number;
  width: number;
  height?: number;
  content: string;
  backgroundColor?: string;
}

export interface MockStroke {
  id: string;
  tool: "pen" | "eraser";
  color: string;
  width: number;
  points: { x: number; y: number }[];
}

export interface Folder {
  id: string;
  title: string;
  color: string;
  description: string;
  /** ISO date string (YYYY-MM-DD). Matches MockPage for persist-safe round-trip. */
  createdDate: string;
  /** ISO date string (YYYY-MM-DD). */
  lastUpdatedDate: string;
  content: (CodeFile | MockNotebook)[];
}

export interface MockPrintZone {
  x: number;
  width: number;
}

export interface MockPage {
  id: string;
  notebookId: string;
  title: string;
  createdDate: string;
  createdTime: string;
  printZone: MockPrintZone;
  nodes: MockPageNode[];
  strokes: MockStroke[];
}

/**
 * A checkbox item nested under a task. This is the *only* todo shape — there
 * is no separate notebook-level todo list.
 */
export interface MockSubtask {
  id: string;
  text: string;
  done: boolean;
}

export interface MockTask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: { id: string; name: string; avatar: string };
  subtasks: MockSubtask[];
}

export interface MockNotebook {
  id: string;
  title: string;
  pages: MockPage[];
  events: MatrixEvent[];
  tasks: MockTask[];
}

const PRESET_COLORS = [
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
] as const;

const pickRandomColor = (): string => faker.helpers.arrayElement(PRESET_COLORS);

export const mockMatrixEvents = (count = 24): MatrixEvent[] => {
  return Array.from({ length: count }, (): MatrixEvent => {
    const randomDate = faker.date.between({
      from: "2026-09-01T00:00:00.000Z",
      to: "2026-09-30T23:59:59.000Z",
    });
    const formattedDate = randomDate.toISOString().split("T")[0];

    return {
      id: faker.string.uuid(),
      title: faker.lorem.words({ min: 2, max: 4 }),
      description: faker.lorem.sentence(),
      date: formattedDate,
      type: faker.helpers.arrayElement(["deadline", "personal", "work"]),
      priority: faker.helpers.arrayElement(["low", "medium", "high"]),
      status: faker.helpers.arrayElement([
        "pending",
        "completed",
        "in-progress",
      ]),
      isAllDay: faker.datatype.boolean({ probability: 0.3 }),
      color: faker.helpers.arrayElement([
        "#3b82f6",
        "#ef4444",
        "#10b981",
        "#f59e0b",
      ]),
      assignee: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
      },
    };
  });
};

const DEFAULT_PRINT_WIDTH = 794;

export const generateMockNotebookData = (
  notebookCount: number = 18,
  pagesPerNotebook: number = 5,
  nodesPerPage: number = 3,
): MockNotebook[] => {
  return Array.from({ length: notebookCount }, (): MockNotebook => {
    const notebookId = faker.string.uuid();

    return {
      id: notebookId,
      title: `${faker.commerce.department()} ${faker.science.chemicalElement().name} ${faker.book.genre()} Repository`,

      events: mockMatrixEvents(),

      tasks: Array.from(
        { length: 8 },
        (): MockTask => ({
          id: faker.string.uuid(),
          title: faker.hacker.phrase(),
          description: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(["todo", "in-progress", "done"]),
          priority: faker.helpers.arrayElement(["low", "medium", "high"]),
          dueDate: faker.date.soon({ days: 30 }).toISOString().split("T")[0],
          subtasks: Array.from(
            { length: faker.number.int({ min: 0, max: 5 }) },
            (): MockSubtask => ({
              id: faker.string.uuid(),
              text: faker.hacker.phrase(),
              done: faker.datatype.boolean(),
            }),
          ),
        }),
      ),

      pages: Array.from({ length: pagesPerNotebook }, (): MockPage => {
        const pageId = faker.string.uuid();
        const rawDateInstance = faker.date.recent();

        const createdDate = rawDateInstance.toISOString().split("T")[0];
        const rawTimeParts = rawDateInstance
          .toTimeString()
          .split(" ")[0]
          .split(":");
        const createdTime = `${rawTimeParts[0]}:${rawTimeParts[1]}`;

        return {
          id: pageId,
          notebookId,
          title: faker.git.commitMessage().split("\n")[0],
          createdDate,
          createdTime,
          printZone: { x: 40, width: DEFAULT_PRINT_WIDTH },
          nodes: Array.from(
            { length: nodesPerPage },
            (): MockPageNode => ({
              id: faker.string.uuid(),
              type: "text",
              x: faker.number.int({ min: 80, max: 200 }),
              y: faker.number.int({ min: 80, max: 600 }),
              width: 550,
              backgroundColor: pickRandomColor(),
              content: JSON.stringify(
                `<h2>${faker.company.catchPhrase()}</h2><p>${faker.lorem.paragraph()}</p>`,
              ),
            }),
          ),
          strokes: [],
        };
      }),
    };
  });
};

export const generateMockFolderData = (
  notebookPool: MockNotebook[],
  codePool: CodeFile[],
  folderCount: number = 5,
  notebookRange: [number, number] = [0, 3],
  codeFileRange: [number, number] = [0, 2],
): Folder[] => {
  return Array.from({ length: folderCount }, (): Folder => {
    const nbCount = faker.number.int({
      min: notebookRange[0],
      max: Math.min(notebookRange[1], notebookPool.length),
    });
    const cfCount = faker.number.int({
      min: codeFileRange[0],
      max: Math.min(codeFileRange[1], codePool.length),
    });

    const notebooks = faker.helpers.arrayElements(notebookPool, nbCount);
    const codeFiles = faker.helpers.arrayElements(codePool, cfCount);

    // Shuffle so a folder reads as a mixed bag, not "notebooks then code."
    const content: (CodeFile | MockNotebook)[] = faker.helpers.shuffle([
      ...notebooks,
      ...codeFiles,
    ]);

    return {
      id: faker.string.uuid(),
      title: `${faker.commerce.department()} ${faker.science.chemicalElement().name} ${faker.book.genre()} Folder`,
      color: pickRandomColor(),
      description: faker.lorem.sentence(),
      createdDate: faker.date.past().toISOString().split("T")[0],
      lastUpdatedDate: faker.date.recent().toISOString().split("T")[0],
      content,
    };
  });
};
