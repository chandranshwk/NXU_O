/**
 * @file SAMPLE.ts
 * @description Mock data engine and type architecture using Faker.js.
 * Defines the core hierarchical local database data structures (Notebooks -> Sections -> Pages -> Nodes)
 * supporting spatial canvas data synchronization.
 *
 * @architecture
 * - Explicitly structures type declarations to enforce geometric spatial attributes (x, y coordinates, heights, widths).
 * - Implements a deterministic dummy seed routine generating mock nodes configured with stringified HTML content blocks.
 * - Outsources uniform soft hex styling values via modular preset color tracking arrays.
 */

import { faker } from "@faker-js/faker";

/** Palette index storing structural vibrant headers alongside theme-adaptive soft canvas pastel fills */
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
  /** Universally unique identity identifier assigned by generation handlers */
  id: string;
  /** Component factory routing tag string selecting active structural blocks */
  type: "text" | "calendar" | "map" | "todo";
  /** Horizontal vector positioning parameter relative to infinite whiteboard grid margins */
  x: number;
  /** Vertical vector positioning parameter relative to infinite whiteboard grid margins */
  y: number;
  /** Absolute width sizing boundary mask parameter inside coordinates */
  width: number;
  /** Absolute height sizing boundary mask parameter (ignored by flexible auto text nodes) */
  height?: number;
  /** Primary data payload string containing stringified HTML blocks or serialized JSON arrays */
  content: string;
  /** Hex string defining the custom background panel tint configuration */
  backgroundColor?: string;
}

export interface MockPage {
  /** Unique reference signature matching this specific sub-page layer */
  id: string;
  /** Parent reference tracking matching section branch locations */
  sectionId: string;
  /** Document layout header title string label */
  title: string;
  /** String ISO layout date stamp formatting creation frame timelines */
  createdDate: string;
  /** String layout time block identifier formatting creation frame timelines */
  createdTime: string;
  /** Array stream cataloging absolute positioned content card records */
  nodes: MockPageNode[];
}

export interface MockSection {
  /** Unique reference signature matching this specific branch line */
  id: string;
  /** Parent reference tracking matching root workspace folder directories */
  notebookId: string;
  /** Navigational tab string text header name */
  title: string;
  /** Vibrant visual identification border marker hex string configuration */
  colorHex: string;
  /** Multi-page record list container mapping structural page nodes */
  pages: MockPage[];
}

export interface MockNotebook {
  /** Root directory tracking unique identity identifiers */
  id: string;
  /** Master workspace identifier text string label */
  title: string;
  /** Nested arrays string strands mapping internal sections branches */
  sections: MockSection[];
}

/** Pulls a random color choice value out of the central preset color palette index array */
const pickRandomColor = (): string => faker.helpers.arrayElement(PRESET_COLORS);

/**
 * @function generateMockNotebookData
 * @description Populates mock notebook database arrays to simulate real user storage contexts.
 * Provides structural rich text cards alongside a balanced layout of companion interactive widgets.
 *
 * @param {number} [notebookCount=2] - Quantity specifying total master workspace folders to generate.
 * @param {number} [sectionsPerPage=3] - Quantity specifying section partition branches to attach per entry.
 * @param {number} [pagesPerSection=4] - Quantity specifying page node leaves to stitch under branches.
 * @returns {MockNotebook[]} Array containing populated mock data repository streams.
 */
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
          colorHex: pickRandomColor(), // Applies an eye-catching signature color code marker
          pages: Array.from({ length: pagesPerSection }, (): MockPage => {
            const pageId = faker.string.uuid();
            const rawDateInstance = faker.date.recent();

            // Isolate clean date and time markers from full datetime payload tracks
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
                // 1. Every document page receives an initial rich-text editor block baseline structure
                {
                  id: faker.string.uuid(),
                  type: "text",
                  x: faker.number.int({ min: 50, max: 200 }),
                  y: faker.number.int({ min: 50, max: 200 }),
                  width: 550,
                  backgroundColor: pickRandomColor(),
                  content: JSON.stringify(
                    `<h2>${faker.company.catchPhrase()}</h2><p>${faker.lorem.paragraph()}</p>`,
                  ),
                },
                // 2. Automatically spawn a companion floating widget node helper directly beside it
                {
                  id: faker.string.uuid(),
                  type: faker.helpers.arrayElement(["calendar", "map", "todo"]),
                  x: faker.number.int({ min: 650, max: 900 }),
                  y: faker.number.int({ min: 100, max: 400 }),
                  width: 320,
                  height: 350,
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
