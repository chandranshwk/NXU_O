



* Set up a global state store to track the active section, active page, and camera zoom/pan offsets.
* ~~Build a horizontal top-bar to render active section tabs using their hex color values.~~
* ~~Build a vertical left-side panel to list pages belonging only to the active section tab.~~
* ~~Implement a shortcut or toggle button to completely hide or show the left-side panel.~~
* ~~Set up a local database connection inside the frontend to load and save page data directly to the local machine.~~
* Create a full-screen viewport container that captures mouse wheel and pointer drag events to calculate pan and zoom values.
* Implement a background HTML5 canvas layer that listens for mouse coordinates to draw freehand lines when sketch mode is active.
* Add event propagation intercepts on all interactive widgets so clicking inside a widget does not drag or pan the background canvas.
* Create a double-click listener on the canvas workspace to map screen coordinates to canvas space and insert a new text node.
* Wrap the Tiptap editor inside an absolutely positioned container styled with CSS transforms based on the node layout values.
* Set a fixed default width constraint on the text container while letting the height calculate automatically based on text length.
* Build a slash-command dropdown menu inside the Tiptap instance to quickly format headings and lists.
* Build a separate right-click or shortcut menu on the open canvas workspace to spawn non-text widgets at the pointer position.
* Write a visibility bounding-box calculation to unmount or skip rendering a ny canvas nodes whose coordinates sit entirely outside the current viewport.
* Ensure switching between section tabs caches the current view position in memory before loading the new page content to keep tab transitions instant.



