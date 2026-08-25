import { faker } from "@faker-js/faker";

export interface MockPageNode {
  id: string;
  type: "text" | "calendar" | "map" | "todo";
  x: number;
  y: number;
  width: number;
  height?: number;
  content: string;
}

export interface MockPage {
  id: string;
  sectionId: string;
  title: string;
  createdDate: string;
  createdTime: string; // Truncated time tracker (HH:MM)
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

export const generateMockNotebookData = (
  notebookCount: number = 2,
  sectionsPerPage: number = 3,
  pagesPerSection: number = 4,
): MockNotebook[] => {
  const presetHexColors = [
    "#3b82f6",
    "#f97316",
    "#10b981",
    "#a855f7",
    "#ec4899",
    "#eab308",
  ];

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
          colorHex: faker.helpers.arrayElement(presetHexColors),
          pages: Array.from({ length: pagesPerSection }, (): MockPage => {
            const pageId = faker.string.uuid();
            const rawDateInstance = faker.date.recent();

            // Extract the standard YYYY-MM-DD string
            const createdDate = rawDateInstance.toISOString().split("T")[0];

            // FIXED: Extract HH:MM:SS, split by colons, and join only hours and minutes
            const rawTimeParts = rawDateInstance
              .toTimeString()
              .split(" ")[0]
              .split(":");
            const createdTime = `${rawTimeParts[0]}:${rawTimeParts[1]}`; // Outputs: "20:59"

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
                  content: JSON.stringify({
                    type: "doc",
                    content: [
                      {
                        type: "heading",
                        attrs: { level: 2 },
                        content: [
                          { type: "text", text: faker.company.catchPhrase() },
                        ],
                      },
                      {
                        type: "paragraph",
                        content: [
                          { type: "text", text: faker.lorem.paragraph() },
                        ],
                      },
                    ],
                  }),
                },
                {
                  id: faker.string.uuid(),
                  type: faker.helpers.arrayElement(["calendar", "map", "todo"]),
                  x: faker.number.int({ min: 650, max: 900 }),
                  y: faker.number.int({ min: 100, max: 400 }),
                  width: 320,
                  height: 350,
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
