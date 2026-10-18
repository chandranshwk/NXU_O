# NXU_O Workspace Engine

NXU_O is a fast, keyboard-first local workspace and coding environment for your computer. It is built for anyone who wants a clean, distraction-free space to manage notes, organize physical-feeling folders, and practice code locally on their machine—without relying on the cloud.

---

## Key Features

- **Tactile Workspace UI:** A dashboard where Notebooks render as 3D physical books, Code Problems as IDE windows, and Folders as fanned-out paper containers.
- **Custom Pixel Stamps:** A built-in 16x16 pixel-art editor and emoji picker allows users to design custom stickers for their folders, complete with an HSL color picker.
- **Native Scratchpad:** A fast, tabbed markdown editor that writes directly to the local disk via Rust. It features `Ctrl+S` interception, crash recovery via shadow drafts, and dynamic tab renaming.
- **Integrated Code IDE:** A LeetCode-style split-screen coding environment with dynamic, JSON-based syntax highlighting that reads custom language themes directly from the local filesystem.
- **Notion-Style Folders:** Nested drag-and-drop (`@dnd-kit`) to organize groups of items, inline-editable titles/descriptions, and continuous canvas text areas.

---

## Tech Stack & Architecture

NXU_O combines a lightweight desktop engine with a modern frontend:

- **Desktop Shell Engine:** [Tauri v2](https://tauri.app) — Uses Rust to run a fast, native desktop app. It replaces heavy, slow apps like Electron and uses very little RAM.
- **State Management:** [Zustand](https://pmnd.rs) — Handles the workspace structure while saving everything to your browser storage automatically.
- **Routing:** [React Router Dom](https://reactrouter.com) — Uses a Hash Router setup to ensure page navigation works reliably inside Tauri's app window.
- **Frontend:** [React 19](https://react.dev) + [TypeScript](https://typescriptlang.org) — Keeps the code base type-safe, simple, and predictable.
- **Design & Styling:** [Tailwind CSS v4](https://tailwindcss.com) — Powers the user interface layouts and dark mode themes.
- **Editor Canvas:** [TipTap Core Engine](https://tiptap.dev) — Handles the markdown writing space, text styling, and the Code IDE input.
- **Drag and Drop:** [Dnd-kit](https://dndkit.com) — Powers the physics-based, nested drag-and-drop lists in the Folder views.
- **Animations:** [Framer Motion / Motion v11](https://framer.com) — Makes tabs, panels, and drag-and-drop actions move smoothly.

---

## Key Architectural Choices

### What NXU_O Uses:

- **Two-Tier Storage (Rust + LocalStorage):** Notes you are actively working on are backed up instantly to local browser memory so you never lose work if the app crashes. Pressing `Ctrl + S` runs a Rust command to save your raw markdown files directly to your hard drive.
- **Portable Storage Architecture:** NXU_O does not use AppData or Windows Registry. It creates a `store/` folder next to the executable containing your `.md` files, custom syntax highlighting themes, and settings.
- **Drag-and-Drop Cards:** Free-floating whiteboard cards use your computer's built-in pointer tools and hardware-accelerated movements to move and resize with zero lag.
- **Canvas-Based Pixel Editor:** The custom folder icons are drawn on a 16x16 HTML canvas and exported as lightweight Base64 strings, allowing them to be stored directly in Zustand without needing external file uploads.
- **Central Settings Context:** One clean `SettingsProvider` file handles all your custom preferences, font choices, and key bindings.
- **Custom Hotkeys:** A simple key listener reads your keyboard inputs (`Ctrl`, `Shift`, etc.) in order, letting you re-bind shortcuts on the fly from the settings page.
- **Auto Dark Mode:** The app watches your computer's system theme (Windows or macOS) and matches light or dark mode instantly without any screen flashing.

### What NXU_O Avoids:

- **No Electron Bloat:** No heavy browser environments are bundled with the app. The final app size is small and lightweight.
- **No Stuttering Renders:** Background tasks (like resizing text or checking file layouts) are delayed by tiny fractions of a second using `queueMicrotask` so typing always feels perfectly responsive.
- **No Cloud Lock-in:** Everything is local. No accounts, no subscriptions, no telemetry.
- **No Hardcoded Keys:** Hotkeys are stored as editable text strings rather than frozen code numbers, which clean themselves up when you leave a page.
- **No Locked Card Sizes:** Text blocks expand naturally based on how many paragraphs you write, while other widgets can be sized freely in any direction.

---

## Getting Started

### Prerequisites

Make sure you have standard Tauri build tools ready on your machine (Rust compiler, Node.js, and your OS-specific build tools like C++ build tools and WebView2).

### Setup and Development

1. Clone the repository to your computer.
2. Install the project dependencies:
   ```bash
   npm install
   ```

---

## Getting Started

### Prerequisites

Make sure you have standard Tauri build tools ready on your machine (Rust compiler, Node.js, and your OS-specific build tools like C++ build tools and WebView2).

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

The output binaries will be located in `src-tauri/target/release/bundle/`.

---

## How to Contribute

NXU_O is an ambitious passion project, and contributions are highly encouraged. Whether you are fixing bugs, refining the Rust backend, or designing new UI paradigms, your help is welcome.

### Areas Looking for Help

- **Local File Importing:** Implementing Tauri's FS plugins to allow importing `.docx`, `.xlsx`, and `.pdf` files directly into folders.
- **Code Execution:** Building the Rust bridge to execute local code snippets and stream `stdout` to the IDE interface.
- **Theme Editor UI:** Creating a visual interface to replace the manual JSON editing for syntax highlighting themes.
- **Testing:** Writing unit and integration tests for the Zustand stores and Rust file handlers.

### Contribution Guidelines

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure your code follows the existing TypeScript/Rust conventions and that you test your changes across both light and dark modes before submitting a PR.

---

## Roadmap

- [ ] Implement native file system imports for standard document types.
- [ ] Add an in-app graphical theme creator for the Code IDE.
- [ ] Implement local compilation and execution for Python, JavaScript, and Rust.
- [ ] Expand the Scratchpad to support advanced markdown attachments and image drag-and-drop.

## License

Distributed under the MIT License. See `LICENSE` for more information.
