import { faker } from "@faker-js/faker";

// Extended color palette with soft pastels for backgrounds
const PRESET_COLORS = [
  // Vibrant accents (for section headers)
  "#3b82f6", // blue
  "#f97316", // orange
  "#10b981", // emerald
  "#a855f7", // purple
  "#ec4899", // pink
  "#eab308", // yellow
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber

  // Soft pastels (for node backgrounds)
  "#fef3c7", // light yellow
  "#fce7f3", // light pink
  "#e0f2fe", // light blue
  "#d1fae5", // light green
  "#ede9fe", // light purple
  "#fed7aa", // light orange
  "#fecaca", // light red
  "#cffafe", // light cyan
  "#e5e7eb", // light gray
  "#f3f4f6", // off-white
];

export interface MockPageNode {
  id: string;
  type: "text" | "calendar" | "map" | "todo";
  x: number;
  y: number;
  width: number;
  height?: number;
  content: string;
  backgroundColor?: string; // NEW: background color for the node
}

export interface MockPage {
  id: string;
  sectionId: string;
  title: string;
  createdDate: string;
  createdTime: string;
  nodes: MockPageNode[];
}

export interface MockSection {
  id: string;
  notebookId: string;
  title: string;
  colorHex: string;
  pages: MockPage[];
}

export interface MockNotebook {
  id: string;
  title: string;
  sections: MockSection[];
}

const pickRandomColor = (): string => faker.helpers.arrayElement(PRESET_COLORS);

export const generateMockNotebookData = (
  notebookCount: number = 2,
  sectionsPerPage: number = 3,
  pagesPerSection: number = 4,
): MockNotebook[] => {
  return Array.from({ length: notebookCount }, (): MockNotebook => {
    const notebookId = faker.string.uuid();

    return {
      id: notebookId,
      title: `${faker.commerce.department()} Repository`,
      sections: Array.from({ length: sectionsPerPage }, (): MockSection => {
        const sectionId = faker.string.uuid();

        return {
          id: sectionId,
          notebookId,
          title: faker.commerce.productName(),
          colorHex: pickRandomColor(), // vibrant accent for section
          pages: Array.from({ length: pagesPerSection }, (): MockPage => {
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
              sectionId,
              title: faker.git.commitMessage().split("\n")[0],
              createdDate,
              createdTime,
              nodes: [
                {
                  id: faker.string.uuid(),
                  type: "text",
                  x: faker.number.int({ min: 50, max: 200 }),
                  y: faker.number.int({ min: 50, max: 200 }),
                  width: 550,
                  // Random pastel background for text nodes
                  backgroundColor: pickRandomColor(),
                  content: JSON.stringify(
                    `<h2>${faker.company.catchPhrase()}</h2><p>${faker.lorem.paragraph()}</p>`,
                  ),
                },
                {
                  id: faker.string.uuid(),
                  type: faker.helpers.arrayElement(["calendar", "map", "todo"]),
                  x: faker.number.int({ min: 650, max: 900 }),
                  y: faker.number.int({ min: 100, max: 400 }),
                  width: 320,
                  height: 350,
                  // Different random background for widget nodes
                  backgroundColor: pickRandomColor(),
                  content: JSON.stringify({ title: faker.hacker.noun() }),
                },
              ],
            };
          }),
        };
      }),
    };
  });
};
