import { faker } from "@faker-js/faker";

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
