/**
 * @interface CodeFile
 * @description Universal structural contract for coding problem data.
 *
 * All fields are required except `codeTemplates` and `sampleSolution`,
 * whose absence is meaningful (draft state vs. published state).
 */

import { faker } from "@faker-js/faker";

export interface CodeFile {
  id: number;
  title: string;
  titleSlug: string;
  category: string;

  // ── Required, always present ─────────────────────────────────
  difficulty: "Easy" | "Medium" | "Hard";
  likes: number; // 0 = no reactions yet
  dislikes: number;

  description: {
    markdown: string;
    html: string;
  };
  constraints: string[];
  examples: Array<{
    id: number;
    input: string;
    output: string;
    explanation?: string;
  }>;
  tags: string[];
  testCases: Array<{ input: string; expectedOutput: string }>;

  // ── Optional, absence is meaningful ──────────────────────────
  codeTemplates?: Array<{
    language: string;
    slug: string;
    starterCode: string;
  }>;
  sampleSolution?: Record<string, string>;
}

// ── Static pools ────────────────────────────────────────────────────

const PROBLEM_CATEGORIES = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Tree",
  "Graph",
  "Binary Search",
  "Sorting",
  "Stack",
  "Queue",
  "Heap",
  "Backtracking",
  "Greedy",
  "Bit Manipulation",
  "Math",
  "Two Pointers",
  "Sliding Window",
  "Linked List",
] as const;

const PROBLEM_TAGS = [
  "easy",
  "medium",
  "hard",
  "interview",
  "top-100",
  "recursion",
  "iterative",
  "in-place",
  "streaming",
  "matrix",
  "string",
  "counting",
] as const;

const TEMPLATE_LANGUAGES = [
  { language: "Javascript", slug: "javascript" },
  { language: "Python", slug: "python" },
  { language: "Java", slug: "java" },
  { language: "TypeScript", slug: "typescript" },
  { language: "C++", slug: "cpp" },
  { language: "Go", slug: "go" },
  { language: "Rust", slug: "rust" },
] as const;

const TITLE_SUBJECTS = [
  "Longest",
  "Maximum",
  "Minimum",
  "Balanced",
  "Valid",
  "Merge",
  "Reverse",
  "Sorted",
  "Unique",
  "Missing",
  "Duplicate",
  "Rotated",
] as const;

const TITLE_NOUNS = [
  "Substring",
  "Subarray",
  "Sequence",
  "Array",
  "String",
  "Tree",
  "Path",
  "Matrix",
  "Interval",
  "List",
  "Node",
  "Window",
] as const;

// ── Helpers ─────────────────────────────────────────────────────────

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeTitle = (): string => {
  const subject = faker.helpers.arrayElement(TITLE_SUBJECTS);
  const noun = faker.helpers.arrayElement(TITLE_NOUNS);
  return `${subject} ${noun}`;
};

const makeExample = (index: number): CodeFile["examples"][number] => {
  const input = faker.helpers.arrayElement([
    `nums = [${Array.from({ length: 4 }, () => faker.number.int({ min: -10, max: 10 })).join(",")}]`,
    `s = "${faker.lorem.word()}"`,
    `n = ${faker.number.int({ min: 1, max: 100 })}`,
    `matrix = [[${faker.number.int({ min: 1, max: 9 })},${faker.number.int({ min: 1, max: 9 })}]]`,
  ]);

  const output = faker.helpers.arrayElement([
    `[${faker.number.int({ min: 0, max: 9 })},${faker.number.int({ min: 0, max: 9 })}]`,
    `${faker.number.int({ min: 0, max: 100 })}`,
    `"${faker.lorem.word()}"`,
    `true`,
    `false`,
  ]);

  const example: CodeFile["examples"][number] = {
    id: index + 1,
    input,
    output,
  };

  if (faker.datatype.boolean({ probability: 0.5 })) {
    example.explanation = faker.lorem.sentence();
  }

  return example;
};

const makeConstraints = (): string[] => {
  const pool = [
    `1 <= nums.length <= ${faker.number.int({ min: 100, max: 100_000 })}`,
    `-${faker.number.int({ min: 100, max: 10_000 })} <= nums[i] <= ${faker.number.int({ min: 100, max: 10_000 })}`,
    `All values are unique`,
    `The input is sorted in ascending order`,
    `Only lowercase English letters`,
    `The answer is guaranteed to be unique`,
    `No leading zeros`,
  ];
  return faker.helpers.arrayElements(
    pool,
    faker.number.int({ min: 2, max: 5 }),
  );
};

const makeTestCases = (): CodeFile["testCases"] => {
  const count = faker.number.int({ min: 1, max: 3 });
  return Array.from({ length: count }, () => ({
    input: `[${faker.number.int({ min: 1, max: 9 })},${faker.number.int({ min: 1, max: 9 })}]\n${faker.number.int({ min: 2, max: 18 })}`,
    expectedOutput: `[${faker.number.int({ min: 0, max: 1 })},${faker.number.int({ min: 0, max: 1 })}]`,
  }));
};

const makeTemplates = (): CodeFile["codeTemplates"] => {
  // ~70% chance of having starter templates
  if (!faker.datatype.boolean({ probability: 0.7 })) return undefined;

  const chosen = faker.helpers.arrayElements(
    TEMPLATE_LANGUAGES,
    faker.number.int({ min: 1, max: 3 }),
  );

  return chosen.map(({ language, slug }) => ({
    language,
    slug,
    starterCode:
      slug === "python"
        ? `class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # TODO\n        pass`
        : slug === "java"
          ? `class Solution {\n    public int solve(int[] nums) {\n        // TODO\n        return 0;\n    }\n}`
          : `function solve(nums: number[]): number {\n  // TODO\n  return 0;\n}`,
  }));
};

const makeSampleSolution = (): CodeFile["sampleSolution"] => {
  // ~40% chance of having a reference solution
  if (!faker.datatype.boolean({ probability: 0.4 })) return undefined;

  return {
    javascript: `function solve(nums) {\n  // O(n) reference solution\n  return nums;\n}`,
    python: `class Solution:\n    def solve(self, nums):\n        return nums`,
  };
};

// ── Public generators ──────────────────────────────────────────────

/**
 * Generate a single CodeFile with the given id.
 * Use `generateCodeFiles(n)` when you need a pool.
 */
export const generateCodeFile = (id: number): CodeFile => {
  const title = makeTitle();
  const titleSlug = slugify(title);
  const category = faker.helpers.arrayElement(PROBLEM_CATEGORIES);
  const exampleCount = faker.number.int({ min: 1, max: 4 });

  const markdown = [
    `## ${title}`,
    "",
    `**Category:** ${category}`,
    "",
    faker.lorem.paragraph({ min: 1, max: 3 }),
    "",
    "### Constraints",
    ...makeConstraints().map((c) => `- ${c}`),
  ].join("\n");

  const html = `<h2>${title}</h2><p><strong>Category:</strong> ${category}</p><p>${faker.lorem.paragraph()}</p>`;

  return {
    id,
    title,
    titleSlug,
    category,

    difficulty: faker.helpers.arrayElement(["Easy", "Medium", "Hard"]),
    likes: faker.number.int({ min: 0, max: 50_000 }),
    dislikes: faker.number.int({ min: 0, max: 5_000 }),

    description: { markdown, html },
    constraints: makeConstraints(),
    examples: Array.from({ length: exampleCount }, (_, i) => makeExample(i)),
    tags: faker.helpers.arrayElements(
      PROBLEM_TAGS,
      faker.number.int({ min: 1, max: 4 }),
    ),
    testCases: makeTestCases(),

    codeTemplates: makeTemplates(),
    sampleSolution: makeSampleSolution(),
  };
};

/**
 * Generate `count` code files, starting at `startId` (default 1).
 * Ids are sequential and unique — safe to use as a shared pool.
 */
export const generateCodeFiles = (
  count: number,
  startId: number = 1,
): CodeFile[] =>
  Array.from({ length: count }, (_, i) => generateCodeFile(startId + i));
