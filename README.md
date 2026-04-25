<div align="center">
  <img src="public/logo.svg" alt="Canvas Studio" width="64" height="64" />

  # Canvas Studio

  A browser-based canvas editor for designing templates and merging them with structured data — Canva-like editing meets mail merge.

  <sub>React · TypeScript · Vite · Zustand · Tailwind</sub>
</div>

---

## What it does

Canvas Studio lets you:

- **Design** multiple projects on a fixed-size canvas with text, shapes, and images.
- **Bind text to variables** with `{{placeholder}}` syntax.
- **Connect data** from CSV files, pasted JSON, or live HTTP/JSON APIs.
- **Preview merged output** record-by-record before exporting.
- **Export** the merged result as a multi-page PDF or the template as JSON.

Every project lives in your browser's `localStorage`. There is no backend.

## Highlights

| Area | What's included |
|------|------|
| Multi-project | Home gallery with live thumbnails, rename / duplicate / delete, deep-link routes (`/project/:id`) |
| Drawing | Drag, resize, rotate-aware layout, z-order, lock, opacity, snap-to-bounds |
| Text | 45 curated Google Fonts loaded on demand, bold / italic / underline, alignment, line-height, padding, fill + background color |
| Shapes | Rectangle, circle, fill / stroke, stroke width, border radius |
| Images | Click-to-upload, drag-and-drop onto the canvas, or paste a URL |
| Data | CSV upload, JSON paste, **live API fetch** with optional dot-path into the response |
| Export | Multi-page PDF (one page per record) and template JSON download |
| UX | Undo / redo (50 steps), keyboard nudge, zoom, debounced auto-save |

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Other scripts:

```bash
npm run build        # tsc -b && vite build
npm run preview      # serve the production build
```

Requires Node 20+.

## Using it

1. **Create a project.** From the home page, click **New project**, pick a canvas size, name it, and create.
2. **Add elements.** From the editor toolbar, add Text / Rectangle / Circle / Image. Drag images directly onto the canvas to upload them.
3. **Bind variables.** Connect data on the left (CSV / JSON / API). Click any column chip in the **Variables** tab to insert a `{{column}}` token into the active text element.
4. **Preview.** Click **Preview** in the header to step through each record with the data merged in.
5. **Export.** Click **PDF** to render every record into a multi-page PDF. **Export** downloads the raw template JSON.

### Connecting an API

Open the **Data → API** tab in the left sidebar:

| Field | Example |
|------|------|
| Endpoint URL | `https://jsonplaceholder.typicode.com/users` |
| Array path | _(empty for a top-level array)_ or e.g. `data.results` |

The endpoint must return JSON and CORS must allow your origin. The fetched array is normalized — every value is coerced to a string and nested objects/arrays become JSON. The **↻** button on the data card refetches.

## Keyboard shortcuts

| Shortcut | Action |
|------|------|
| `Delete` / `Backspace` | Delete selected element |
| `Cmd / Ctrl + D` | Duplicate selected |
| `Cmd / Ctrl + Z` | Undo |
| `Cmd / Ctrl + Shift + Z` | Redo |
| `Arrow keys` | Move 1 px |
| `Shift + Arrow` | Move 10 px |
| `Esc` | Deselect / close preview |

Shortcuts pause while a text element is in edit mode.

## Project structure

```
src/
├── pages/                      # Route-level views
│   ├── Home.tsx                # Project gallery
│   └── ProjectEditor.tsx       # Loads a project, debounced auto-save
├── store/
│   ├── editorStore.ts          # Active editor state (Zustand + Zundo for undo/redo)
│   └── projectsStore.ts        # Persisted project list (localStorage v1 schema)
├── components/
│   ├── canvas/                 # Canvas, draggable element wrapper, per-type renderers
│   ├── layout/                 # Header, LeftSidebar, RightSidebar
│   ├── projects/               # ProjectCard, TemplatePreview, CreateProjectModal
│   ├── properties/             # Per-type inspector + reusable primitives (Slider, ColorField, …)
│   ├── data/                   # CSV / JSON / API source UI + table preview
│   ├── variables/              # Variable insertion buttons
│   └── preview/                # Merge preview modal
├── hooks/
│   ├── useCanvasKeyboard.ts    # Global keyboard shortcuts
│   └── useCanvasDropZone.ts    # Drag-and-drop image upload
├── utils/
│   ├── api.ts                  # Live API fetcher with dot-path extraction
│   ├── csv.ts                  # CSV / JSON parsers
│   ├── fonts.ts                # On-demand Google Fonts loader
│   ├── pdf.ts                  # html2canvas → jsPDF export
│   └── variables.ts            # `{{var}}` tokenizer + replacer
├── constants/                  # Defaults + curated Google Fonts list
└── types/                      # Shared TypeScript interfaces
```

## Architecture

There are two stores. **`projectsStore`** is the on-disk source of truth, persisted under `canvas-projects-v1` in `localStorage`. **`editorStore`** is the in-memory active editor with full undo/redo via `zundo`.

`ProjectEditor` connects them: on mount it hydrates the editor from the project; whenever the editor's template changes, it writes back to `projectsStore` after a 500 ms debounce.

Rendering is plain DOM (`react-rnd` for drag/resize, no Konva or Fabric). PDFs are produced by snapshotting an offscreen DOM replica with `html2canvas` and stitching the pages with `jsPDF`. Web fonts are awaited via `document.fonts.ready` before snapshotting so Google Fonts render correctly in the export.

There's a one-time migration from the legacy single-template key (`canvas-template`) into a project named "Untitled Template" the first time the new schema runs.

## Tech stack

- **React 18** + **TypeScript** with **Vite 6**
- **Zustand 5** for state, **zundo** for undo/redo
- **react-router-dom 7** for routing
- **react-rnd** for drag and resize
- **Tailwind CSS 3** for styling
- **lucide-react** for icons
- **papaparse** for CSV, **html2canvas + jsPDF** for export
- **Google Fonts** loaded dynamically via `<link>` injection

## Privacy

Everything runs locally. Projects, uploaded images, CSV files, and pasted JSON never leave your browser. The only outbound network calls are:

- Google Fonts stylesheets when you select a font.
- Whatever URL you enter on the API data tab (your responsibility — no proxying).

## License

MIT.
