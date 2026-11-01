/**
 * @file demoContent.ts
 * @description Hand-authored onboarding content. Seeded once on first launch
 * so testers land in a workspace that showcases every feature (rich-text
 * notebook, mixed folder, runnable code problem) instead of empty states.
 *
 * Bump `DEMO_CONTENT_VERSION` if you change the content and want it re-seeded
 * — see `initializeData` in `store.ts`.
 */

import { faker } from "@faker-js/faker";
import type {
  MockNotebook,
  Folder,
  MockPage,
  MockPageNode,
} from "../assets/SAMPLE";
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";

const DEFAULT_PRINT_WIDTH = 794;
const today = () => new Date().toISOString().split("T")[0];
const now = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// ── Helpers to keep the content data terse ──────────────────────────
const textNode = (id: string, y: number, html: string): MockPageNode => ({
  id,
  type: "text",
  x: 80,
  y,
  width: 550,
  content: JSON.stringify(html),
});

const page = (
  notebookId: string,
  id: string,
  title: string,
  nodes: MockPageNode[],
): MockPage => ({
  id,
  notebookId,
  title,
  createdDate: today(),
  createdTime: now(),
  printZone: { x: 40, width: DEFAULT_PRINT_WIDTH },
  nodes,
  strokes: [],
});

// ── Notebook 1: Welcome to NXU_O ────────────────────────────────────
const welcomeId = "demo-welcome-notebook";

export const welcomeNotebook: MockNotebook = {
  id: welcomeId,
  title: "Welcome to NXU_O",
  events: [],
  tasks: [
    {
      id: "demo-task-1",
      title: "Take a look around",
      status: "in-progress",
      priority: "medium",
      subtasks: [
        { id: "demo-sub-1", text: "Open each page below", done: false },
        { id: "demo-sub-2", text: "Try Ctrl+K from any page", done: false },
        { id: "demo-sub-3", text: "Toggle dark mode", done: false },
      ],
    },
  ],
  pages: [
    page(welcomeId, "demo-page-1", "Everything is local", [
      textNode(
        "demo-node-1-1",
        80,
        `<h2>Everything is local</h2>` +
          `<p>NXU_O never sends your notes anywhere. Your files live in a <code>store/</code> folder next to the app executable. Close the app, copy that folder to another machine, and your work follows.</p>` +
          `<p>Press <strong>Ctrl+S</strong> in the scratchpad to save. There is no sync delay — writes hit the disk immediately.</p>`,
      ),
    ]),
    page(welcomeId, "demo-page-2", "Built for the keyboard", [
      textNode(
        "demo-node-2-1",
        80,
        `<h2>Built for the keyboard</h2>` +
          `<p>Press <strong>Ctrl+K</strong> anywhere to open the command bar. Type to search notebooks, folders, and code problems. Arrow keys to navigate, <strong>Enter</strong> to open.</p>` +
          `<ul>` +
          `<li><strong>Ctrl+P</strong> &mdash; search the current page's content</li>` +
          `<li><strong>Ctrl+Shift+S</strong> &mdash; open the scratchpad</li>` +
          `<li><strong>Ctrl+Shift+Z</strong> &mdash; toggle zen mode</li>` +
          `<li><strong>?</strong> &mdash; see all shortcuts</li>` +
          `</ul>` +
          `<p>Every shortcut is re-bindable from <em>Settings &rarr; Activation Shortcuts</em>.</p>`,
      ),
    ]),
    page(welcomeId, "demo-page-3", "What you can build", [
      textNode(
        "demo-node-3-1",
        80,
        `<h2>What you can build</h2>` +
          `<ul>` +
          `<li><strong>Notebooks</strong> &mdash; rich-text notes with headings, tables, images, and code blocks.</li>` +
          `<li><strong>Folders</strong> &mdash; drag notebooks and problems in, nest them, color-code them.</li>` +
          `<li><strong>Code problems</strong> &mdash; a LeetCode-style IDE with local execution and syntax highlighting.</li>` +
          `</ul>` +
          `<p>Open the <strong>Playground</strong> folder in the sidebar to see a workspace that mixes all three.</p>`,
      ),
    ]),
  ],
};

// ── Notebook 2: A second showcase notebook ──────────────────────────
const secondId = "demo-shortcuts-notebook";

export const shortcutsNotebook: MockNotebook = {
  id: secondId,
  title: "Common shortcuts",
  events: [],
  tasks: [],
  pages: [
    page(secondId, "demo-page-s1", "Everything at a glance", [
      textNode(
        "demo-node-s1",
        80,
        `<h2>Everything at a glance</h2>` +
          `<table>` +
          `<tr><th>Action</th><th>Shortcut</th></tr>` +
          `<tr><td>Command bar</td><td><code>Ctrl+K</code></td></tr>` +
          `<tr><td>Search page</td><td><code>Ctrl+P</code></td></tr>` +
          `<tr><td>Scratchpad</td><td><code>Ctrl+Shift+S</code></td></tr>` +
          `<tr><td>Zen mode</td><td><code>Ctrl+Shift+Z</code></td></tr>` +
          `<tr><td>All shortcuts</td><td><code>?</code></td></tr>` +
          `</table>`,
      ),
    ]),
  ],
};

// ── Code problem: Hello, NXU_O ──────────────────────────────────────
export const gettingStartedCode: CodeFile = {
  id: faker.number.int(),
  title: "Hello, NXU_O",
  titleSlug: "hello-nxuo",
  category: "Getting Started",
  difficulty: "Easy",
  likes: 0,
  dislikes: 0,
  description: {
    markdown: "Print hello world.",
    html:
      `<h2>Hello, NXU_O</h2>` +
      `<p>Write a program that prints <code>"Hello, NXU_O!"</code>.</p>` +
      `<p>Pick your language from the dropdown, edit the code, and press <strong>Run</strong>.</p>`,
  },
  constraints: ["Your chosen language's compiler/runtime must be installed."],
  examples: [
    {
      id: 1,
      input: "(none)",
      output: "Hello, NXU_O!",
    },
  ],
  tags: ["basics"],
  testCases: [],
  codeTemplates: [
    {
      language: "Python",
      slug: "python",
      starterCode: "",
    },
    {
      language: "JavaScript",
      slug: "javascript",
      starterCode: "",
    },
    {
      language: "Java",
      slug: "java",
      starterCode: "public class Solution {\n   \n}",
    },
    {
      language: "C++",
      slug: "cpp",
      starterCode: "",
    },
  ],
};

// ── Folder: Playground ──────────────────────────────────────────────
export const playgroundFolder: Folder = {
  id: "demo-playground-folder",
  title: "Playground",
  color: "#3b82f6",
  description:
    "Try a notebook, a code problem, and a nested folder — everything's pre-wired.",
  createdDate: today(),
  lastUpdatedDate: today(),
  content: [welcomeNotebook, shortcutsNotebook, gettingStartedCode],
};
