# NXU_O Workspace Engine

NXU_O is a premium, high-performance, keyboard-driven desktop markdown editor and note-taking workspace. Built for power users who value local-first speed and minimalist design, NXU_O acts as a digital workspace engine providing friction-free document management directly on your operating system.

---

## 🛠️ Tech Stack & Architecture

NXU_O leverages a lightweight, security-first desktop shell layer coupled with an advanced modern frontend:

- **Core Shell Engine:** [Tauri v2](https://tauri.app) — Provides a highly optimized native compiled desktop binary container wrapper via Rust, completely replacing bloated resource-heavy runtime wrappers.
- **Routing Framework:** [React Router Dom](https://reactrouter.com) — Set up with a native Hash Router configuration ensuring reliable cross-page asset resolution and view navigation inside isolated Tauri operating system frames.
- **Interface Layer:** [React 19](https://react.dev) + [TypeScript](https://typescriptlang.org) — Ensures predictable, type-safe development compiling with a single atomic state workflow.
- **Design Utility Engine:** [Tailwind CSS v4](https://tailwindcss.com) — Complete custom utility theme configurations powering reactive system theme modes and layout structures.
- **Text Editor Canvas:** [TipTap Core Engine](https://tiptap.dev) — Backed by ProseMirror native editing transactions to handle complex markdown serialization without layout glitches.
- **Motion Architecture:** [Framer Motion](https://framer.com) — Driving smooth, physics-backed modal entrances and fluid interface transitions.

---

## ⚡ Key Architectural Choices

### What NXU_O Uses:

- **Atomic Context Centralization:** Global application configuration data—including custom keyboard shortcut registers, typography scaling, and theme states—is completely handled by a custom `SettingsProvider` context wrapper.
- **Dynamic OS-Level Keyboard Listening:** Leverages a custom, layout-agnostic keyboard shortcut parser that reads hardware event matrices (`e.ctrlKey`, `e.shiftKey`, `e.key`) sequentially. This allows users to register custom key chords dynamically from the settings panel.
- **Derived System Appearance Matching:** Uses native browser `window.matchMedia` background threads to listen to underlying Windows or macOS theme changes in real-time, syncing dark mode classes instantly without double-render flashes.

### What NXU_O Avoids (Architectural Exclusions):

- **No Electron Bloat:** NXU_O deliberately shuns Electron. By utilizing Tauri, the final compiled desktop package is only a fraction of the size and consumes minimal system memory.
- **No Synchronous Side-Effect Effects:** Avoids cascading render triggers inside React state lifecycles. All settings calculations and theme transitions are computed inside single-frame passes to satisfy modern strict compilation linters.
- **No Stale Hardcoded Shortcuts:** Avoids caching hardcoded key codes. The shortcut system relies strictly on modern string representations that unbind and clean themselves automatically upon component unmounting.

---

## 🚀 Getting Started

### Prerequisites

Make sure your machine has the standard Tauri compilation tools installed (Rust compiler, Node.js package manager, and system-specific build tools).

### Development Setup

1. Clone the repository down to your computer.
2. Install frontend project node dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite compiler and launch the Tauri native application shell simultaneously:
   ```bash
   npm run tauri dev
   ```

### Production Bundling

To compile the highly optimized native standalone application binary and ready-to-distribute operating system installers:

```bash
npm run tauri build
```
