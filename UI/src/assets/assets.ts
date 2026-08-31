/**
 * @file assets.ts
 * @description Central layout asset library containing mock dashboard file sets,
 * supported typeface catalogs, style hex vectors, list formatting parameters,
 * and operational button evaluation methods.
 *
 * @architecture
 * - Collects application configuration arrays used down lists, selectors, and dropdown windows.
 * - Simulates local repository directories via mock document generation chains backed by Faker.js.
 * - Bundles utility functions evaluating matching context styles to coordinate active states.
 */

import { faker } from "@faker-js/faker";
import type { editorContextType } from "../contexts/editorContext";

export interface TEXT_ODocument {
  /** Numerical tracking index assigned to the file entity */
  id: number;
  /** Categorizes whether files render under word or portable document templates */
  type: "pdf" | "words";
  /** Clean string title naming the target file template */
  name: string;
  /** System asset format tracking extensions */
  extension: ".docx" | ".pdf";
  /** Descriptive explainer string detailing document focus states */
  des: string;
  /** Quantitative indicator reporting network sharing thresholds */
  sharedCount: number;
  /** Quantitative indicator reporting file retrieval statistics */
  downloadCount: number;
  /** Timestamp text string measuring active modification events */
  editedAt: string;
  /** Label marker pairing entries to parent organizational folder tags */
  project: string;
  /** Visual tracking status tagging life lifecycle boundaries */
  status: "Final" | "In Review" | "Draft";
  /** String layout metric tracking physical document disk sizing footprints */
  size: string;
}

/** Array collection generating mock recent document data matrices to simulate repository files */
export const RECENT_FILES = Array.from({ length: 20 }, (_, index) => {
  const type = faker.helpers.arrayElement(["pdf", "words"]);
  const extension = type === "words" ? ".docx" : ".pdf";

  return {
    id: index + 1,
    type: type,
    name: faker.system.fileName().split(".").slice(0, -1).join("-"),
    extension: extension,
    des: faker.lorem.sentence({ min: 20, max: 25 }),
    sharedCount: faker.number.int({ min: 0, max: 50 }),
    downloadCount: faker.number.int({ min: 0, max: 500 }),
    editedAt: faker.helpers.arrayElement([
      "2 hours ago",
      "5 hours ago",
      "Yesterday",
      "2 days ago",
      "Last week",
      "Oct 12",
    ]),
    project: faker.helpers.arrayElement([
      "Finance Core",
      "Marketing 2024",
      "Product Dev",
      "FLOW_O Launch",
    ]),
    status: faker.helpers.arrayElement(["Final", "In Review", "Draft"]),
    size: `${faker.number.float({ min: 0.5, max: 15, fractionDigits: 1 })} MB`,
  };
});

/** Static template list cataloging supported local system typeface configurations */
export const FONTS = [
  "AptosLocal",
  "CalibriLocal",
  "sans-serif",
  "system-ui",
  "arial",
  "serif",
  "georgia",
  "times-new-roman",
  "JetBrainsMonoLocal",
  "monospace",
  "courier-new",
  "lucida-console",
];

/** Static palette map tracking uniform interface theme color hex vectors */
export const COLORS = [
  "#64748b",
  "#71717a",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#f43f5e",
  `#000000`,
  "#ffffff",
];

/** String list mapping prefix list selectors assigned onto ordered list nodes */
export const ORDEREDLISTRESPRESENTER = [
  "decimal",
  "armenian",
  "decimal-leading-zero",
  "disc",
  "georgian",
  ...["alpha", "latin", "roman", "greek"].map((el) => `lower-${el}`),
  ...["alpha", "latin", "roman", "greek"].map((el) => `upper-${el}`),
];

/**
 * @function checkIsActive
 * @description Audits incoming element option names with active state hooks,
 * reporting indicators to light up matching interface items on toolbars.
 *
 * @param {string} name - The label title of the formatting item to examine.
 * @param {editorContextType} context - Universal editor context manager.
 * @returns {boolean} True if the format selection is active under current highlights.
 */
export const checkIsActive = (
  name: string,
  context: editorContextType,
): boolean => {
  switch (name) {
    case "Bold":
      return context.isBold;
    case "Italic":
      return context.isItalic;
    case "Underline":
      return context.isUnderline;
    case "Strikethrough":
      return context.isStrikethrough;
    case "Bullet List":
      return context.isBulletList;
    case "Ordered List":
      return context.isOrderedList;
    case "Blockquote":
      return context.isBlockquote;
    case "Code Block":
      return context.isCodeBlock;
    case "Left Align":
      return context.alignment === "left";
    case "Center Align":
      return context.alignment === "center";
    case "Right Align":
      return context.alignment === "right";
    case "Heading 1":
      return context.isHeading(1);
    case "Heading 2":
      return context.isHeading(2);
    case "Heading 3":
      return context.isHeading(3);
    case "Heading 4":
      return context.isHeading(4);
    case "Heading 5":
      return context.isHeading(5);
    case "Heading 6":
      return context.isHeading(6);
    default:
      return false;
  }
};
