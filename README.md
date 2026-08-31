# NXU_O Workspace Engine

NXU_O is a fast, keyboard-first markdown editor and note-taking app for your computer. It is built for anyone who wants a clean, distraction-free space to manage notes and documents locally on their machine.

---

## Tech Stack & Architecture

NXU_O combines a lightweight desktop engine with a modern frontend:

- **Desktop Shell Engine:** [Tauri v2](https://tauri.app) — Uses Rust to run a fast, native desktop app. It replaces heavy, slow apps like Electron and uses very little RAM.
- **State Management:** [Zustand](https://pmnd.rs) — Handles the notebook, section, and page structure while saving everything to your browser storage automatically.
- **Routing:** [React Router Dom](https://reactrouter.com) — Uses a Hash Router setup to ensure page navigation works reliably inside Tauri's app window.
- **Frontend:** [React 19](https://react.dev) + [TypeScript](https://typescriptlang.org) — Keeps the code base type-safe, simple, and predictable.
- **Design & Styling:** [Tailwind CSS v4](https://tailwindcss.com) — Powers the user interface layouts and dark mode themes.
- **Editor Canvas:** [TipTap Core Engine](https://tiptap.dev) — Handles the markdown writing space, text styling, and interactive layouts like whiteboard cards.
- **Animations:** [Framer Motion / Motion v11](https://framer.com) — Makes tabs, panels, and drag-and-drop actions move smoothly.

---

## Key Architectural Choices

### What NXU_O Uses:

- **Drag-and-Drop Cards:** Free-floating whiteboard cards use your computer's built-in pointer tools and hardware-accelerated movements to move and resize with zero lag.
- **Central Settings Context:** One clean `SettingsProvider` file handles all your custom preferences, font choices, and key bindings.
- **Two-Tier Storage:** Notes you are actively working on are backed up instantly to local browser memory so you never lose work if the app closes. Pressing `Ctrl + S` runs a Tauri command to save your raw markdown files directly to your hard drive.
- **Custom Hotkeys:** A simple key listener reads your keyboard inputs (`Ctrl`, `Shift`, etc.) in order, letting you re-bind shortcuts on the fly from the settings page.
- **Auto Dark Mode:** The app watches your computer's system theme (Windows or macOS) and matches light or dark mode instantly without any screen flashing.

### What NXU_O Avoids:

- **No Electron Bloat:** No heavy browser environments are bundled with the app. The final app size is small and lightweight.
- **No Stuttering Renders:** Background tasks (like resizing text or checking file layouts) are delayed by tiny fractions of a second using `queueMicrotask` so typing always feels perfectly responsive.
- **No Hardcoded Keys:** Hotkeys are stored as editable text strings rather than frozen code numbers, which clean themselves up when you leave a page.
- **No Locked Card Sizes:** Text blocks expand naturally based on how many paragraphs you write, while other widgets can be sized freely in any direction.

---

## Getting Started

### Prerequisites

Make sure you have standard Tauri build tools ready on your machine (Rust compiler, Node.js, and your OS-specific build tools).

### Setup and Development

1. Clone the repository to your computer.
2. Install the project dependencies:
   ```bash
   npm install
   ```
3. Run the development server and open the desktop app window together:
   ```bash
   npm run tauri dev
   ```

### Building a Standalone App

To bundle your code into a fast, native installer file for your specific computer operating system:

```bash
npm run tauri build
```
