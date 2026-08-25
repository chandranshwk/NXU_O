import { faker } from "@faker-js/faker";
import type { editorContextType } from "../contexts/editorContext";

export interface TEXT_ODocument {
  id: number;
  type: "pdf" | "words";
  name: string;
  extension: ".docx" | ".pdf";
  des: string;
  sharedCount: number;
  downloadCount: number;
  editedAt: string;
  project: string;
  status: "Final" | "In Review" | "Draft";
  size: string;
}

export const RECENT_FILES = Array.from({ length: 20 }, (_, index) => {
  const type = faker.helpers.arrayElement(["pdf", "words"]);
  const extension = type === "words" ? ".docx" : ".pdf";

  return {
    id: index + 1,
    // Column: File (Icon/Type)
    type: type,
    // Column: Name
    name: faker.system.fileName().split(".").slice(0, -1).join("-"),
    extension: extension,
    // Column: Description
    des: faker.lorem.sentence({ min: 20, max: 25 }),
    // Column: Shared (Count)
    sharedCount: faker.number.int({ min: 0, max: 50 }),
    // Column: Downloads
    downloadCount: faker.number.int({ min: 0, max: 500 }),
    // Column: Last Modified
    editedAt: faker.helpers.arrayElement([
      "2 hours ago",
      "5 hours ago",
      "Yesterday",
      "2 days ago",
      "Last week",
      "Oct 12",
    ]),
    // Extra metadata for the UI
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

export const ORDEREDLISTRESPRESENTER = [
  "decimal",
  "armenian",
  "decimal-leading-zero",
  "disc",
  "georgian",
  ...["alpha", "latin", "roman", "greek"].map((el) => `lower-${el}`),
  ...["alpha", "latin", "roman", "greek"].map((el) => `upper-${el}`),
];

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
