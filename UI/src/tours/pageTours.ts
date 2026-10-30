/**
 * @file pageTours.ts
 * @description Per-page spotlight tour definitions. Each export is a list
 * of `TourStep` items that reference `[data-tour="..."]` attributes on the
 * page's DOM. Missing targets are filtered at start time, so you can safely
 * add/remove steps without breaking the tour.
 */

import type { TourStep } from "../components/SpotlightTour";

export const HOME_STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Your workspace",
    body: "Pages, notebooks, code problems, and settings. Hover to expand.",
    placement: "right",
  },
  {
    target: '[data-tour="titlebar-search"]',
    title: "Search Bar",
    body: "Press Ctrl+P to search the current section.",
    placement: "bottom",
  },
  {
    target: '[data-tour="command-bar-modal"]',
    title: "Command Bar",
    body: "Press Ctrl+K from anywhere to open this global navigation menu.",
    placement: "bottom",
    preAction: "nxuo:open-command-bar",
    postAction: "nxuo:close-command-bar",
  },
  {
    target: '[data-tour="home-notebooks"]',
    title: "Notebooks",
    body: "Rich-text documents with tables, images, and code blocks. Click one to open it.",
    placement: "bottom",
  },
];

export const SCRATCHPAD_STEPS: TourStep[] = [
  {
    target: '[data-tour="scratchpad-tabbar"]',
    title: "Your open scratchpads",
    body: "Drag to reorder, F2 to rename, X to close. Click + to open a new pad.",
    placement: "bottom",
  },
  {
    target: '[data-tour="scratchpad-toolbar"]',
    title: "Formatting lives here",
    body: "Font, size, colour, headings, alignment — all in one rail.",
    placement: "bottom",
  },
  {
    target: '[data-tour="scratchpad-editor"]',
    title: "Write freely",
    body: "Everything saves to disk when you press Ctrl+S. Type / at the start of a line to insert headings, lists, tables.",
    placement: "bottom",
  },
];

export const CODEIDE_STEPS: TourStep[] = [
  {
    target: '[data-tour="ide-problem"]',
    title: "The problem",
    body: "Description, examples, and constraints. All local — no network.",
    placement: "right",
  },
  {
    target: '[data-tour="ide-language"]',
    title: "Pick a language",
    body: "Starter code is loaded automatically. Every language uses the compiler installed on your machine.",
    placement: "bottom",
  },
  {
    target: '[data-tour="ide-run"]',
    title: "Run",
    body: "Press Run to compile and execute. Output appears in the panel below.",
    placement: "bottom",
  },
  {
    target: '[data-tour="ide-editor"]',
    title: "Your code",
    body: "Tab inserts 4 spaces. Line numbers update on every row.",
    placement: "bottom",
  },
];

export const FOLDER_STEPS: TourStep[] = [
  {
    target: '[data-tour="folder-header"]',
    title: "The folder",
    body: "Click the icon to design your own pixel stamp. Click the colour swatch to change the folder tint.",
    placement: "bottom",
  },
  {
    target: '[data-tour="folder-contents"]',
    title: "Mixed contents",
    body: "Notebooks, code problems, and nested folders can all live side-by-side. Drag rows to reorder.",
    placement: "top",
  },
];

export const SETTINGS_STEPS: TourStep[] = [
  {
    target: '[data-tour="settings-theme"]',
    title: "Theme & storage",
    body: "Pick a theme, adjust auto-save timing, and choose where files are stored on disk.",
    placement: "bottom",
  },
  {
    target: '[data-tour="settings-shortcuts"]',
    title: "Rebind anything",
    body: "Every keyboard shortcut is editable. Click the pencil to record a new one.",
    placement: "bottom",
  },
  {
    target: '[data-tour="settings-typography"]',
    title: "Typography",
    body: "Default font, size, line height, and list styles — all adjustable here.",
    placement: "bottom",
  },
];

export const NOTEBOOK_STEPS: TourStep[] = [
  {
    target: '[data-tour="notebook-pagerail"]',
    title: "Pages",
    body: "Every page in the notebook lives here. Collapse the rail with the sidebar icon.",
    placement: "right",
  },
  {
    target: '[data-tour="notebook-canvas"]',
    title: "Infinite canvas",
    body: "Scroll to pan, Ctrl+wheel to zoom. Add text nodes with the + button.",
    placement: "bottom",
  },
  {
    target: '[data-tour="notebook-rightrail"]',
    title: "Calendar, tasks, todos",
    body: "All scoped to this notebook. Collapse or expand each panel independently.",
    placement: "left",
  },
];
