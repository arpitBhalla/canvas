<div align="center">
  <img src="public/logo.svg" alt="Imprintly" width="64" height="64" />

  # Imprintly

  Design once. Imprint a copy for every row. A browser-based canvas editor that turns one design into a personalized batch — Canva-style editing meets mail merge.

  <sub>React · TypeScript · Vite · Zustand · Tailwind</sub>
</div>

---

## What it does

Imprintly lets you:

- **Design** multiple projects on a fixed-size canvas with text, shapes, images, and freehand paths.
- **Bind text and images to variables** with `{{column}}` syntax.
- **Connect data** from CSV files, pasted JSON, or live HTTP/JSON APIs.
- **Preview imprints** record-by-record before exporting.
- **Export** the merged result as a multi-page PDF, a ZIP of PNGs (one per record), or the raw template JSON.

Every project lives in your browser's `localStorage`. There is no backend.

## Highlights

| Area | What's included |
|------|------|
| Multi-project | Home gallery with live thumbnails, rename / duplicate / delete, deep-link routes (`/project/:id`) |
| Editing | Drag, resize, **multi-select**, marquee select, **smart snap guides**, z-order, **layers panel** with drag-reorder, lock, opacity, snap-to-bounds |
| Text | 45 curated Google Fonts loaded on demand, bold / italic / underline / strikethrough, alignment, line-height, **letter spacing**, padding, fill + background color |
| Shapes | Rectangle, circle, triangle, star, line, arrow — with fill / stroke / **gradient** / radius / **shadow** |
| Paths | **Freehand**, curve (smooth spline), and straight-line pen tools with optional arrowheads, closed-shape fill, color, thickness, shadow |
| Images | Click-to-upload, drag-and-drop onto the canvas, **paste from clipboard**, paste a URL, or **bind to a column** for per-record images. Adjust **brightness / contrast / saturation / blur**, border radius, drop shadow |
| Data | CSV upload, JSON paste, **live API fetch** with optional dot-path into the response |
| Variables | `{{column}}` tokens in text or image src, **per-element "hide when column is empty"** for conditional layouts |
| Brand kit | Save colors per project from any color picker; reuse them everywhere |
| Power | **Command palette** (`⌘K` / `Ctrl K`), full keyboard nudge, undo / redo (50 steps), debounced auto-save, zoom |
| Export | Multi-page PDF, ZIP of PNGs (one per record, with progress), and template JSON download |

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

1. **Create a project.** From the home page, click **New project**, pick a canvas size, name it.
2. **Add elements.** From the editor toolbar, add Text / Rectangle / Circle / Image. Use the pen group for straight, curved, or freehand paths. Drag images onto the canvas, or paste them with `⌘V`.
3. **Bind variables.** Connect data on the left (CSV / JSON / API). Click any column chip in the **Variables** tab to insert a `{{column}}` token into the active text element. For images, use the "Bind to a column" dropdown in the image properties.
4. **Hide conditionally.** In the right sidebar, set "Hide when column is empty" to skip an element on records that don't have a value for that column.
5. **Preview.** Click **Preview** in the header to step through each record with the data merged in.
6. **Export.** Click **PDF** for a single multi-page PDF, or **PNG zip** for one image per record.

### Connecting an API

Open the **Data → API** tab in the left sidebar:

| Field | Example |
|------|------|
| Endpoint URL | `https://jsonplaceholder.typicode.com/users` |
| Array path | _(empty for a top-level array)_ or e.g. `data.results` |

The endpoint must return JSON and CORS must allow your origin. Each value is coerced to a string and nested objects/arrays become JSON. The **↻** button on the data card refetches.

## Keyboard shortcuts

| Shortcut | Action |
|------|------|
| `⌘ K` / `Ctrl K` | Open command palette |
| `⌘ A` / `Ctrl A` | Select all |
| `Delete` / `Backspace` | Delete selected element(s) |
| `⌘ D` / `Ctrl D` | Duplicate selected |
| `⌘ Z` / `Ctrl Z` | Undo |
| `⌘ ⇧ Z` / `Ctrl Shift Z` | Redo |
| `Arrow keys` | Move selected 1 px |
| `Shift + Arrow` | Move selected 10 px |
| `Shift + click` | Add / remove element from selection |
| `⌘ V` | Paste image from clipboard |
| `Esc` | Deselect / cancel pen / close preview |

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
│   ├── canvas/                 # Canvas, draggable element wrapper, per-type renderers, snap guides
│   ├── layout/                 # Header, LeftSidebar, RightSidebar
│   ├── projects/               # ProjectCard, TemplatePreview, CreateProjectModal
│   ├── properties/             # Per-type inspector + reusable primitives (Slider, ColorField, Gradient, Shadow, …)
│   ├── layers/                 # Layers panel
│   ├── data/                   # CSV / JSON / API source UI + table preview
│   ├── variables/              # Variable insertion buttons
│   ├── preview/                # Merge preview modal
│   └── CommandPalette.tsx      # ⌘K palette
├── hooks/
│   ├── useCanvasKeyboard.ts    # Global keyboard shortcuts
│   ├── useCanvasDropZone.ts    # Drag-and-drop image upload
│   └── useClipboardPaste.ts    # ⌘V image paste
├── utils/
│   ├── api.ts                  # Live API fetcher with dot-path extraction
│   ├── csv.ts                  # CSV / JSON parsers
│   ├── fonts.ts                # On-demand Google Fonts loader
│   ├── path.ts                 # Pen-tool point smoothing + d-string builder
│   ├── style.ts                # Shadow / gradient / image-filter → CSS helpers
│   ├── pdf.ts                  # html2canvas → jsPDF export
│   ├── imageExport.ts          # html2canvas → JSZip PNG export
│   └── variables.ts            # `{{var}}` tokenizer + replacer + visibility helpers
├── constants/                  # Defaults + curated Google Fonts list
└── types/                      # Shared TypeScript interfaces
```

## Architecture

There are two stores. **`projectsStore`** is the on-disk source of truth, persisted under `canvas-projects-v1` in `localStorage`. **`editorStore`** is the in-memory active editor with full undo/redo via `zundo`.

`ProjectEditor` connects them: on mount it hydrates the editor from the project; whenever the editor's template changes, it writes back to `projectsStore` after a 500 ms debounce.

Rendering is plain DOM (`react-rnd` for drag/resize, no Konva or Fabric). Lines, arrows, and pen-tool paths render as inline SVG with markers. PDFs are produced by snapshotting an offscreen DOM replica with `html2canvas` and stitching the pages with `jsPDF`. PNG ZIPs reuse the same DOM snapshot pipeline through `jszip`. Web fonts are awaited via `document.fonts.ready` before snapshotting so Google Fonts render correctly in the export.

There's a one-time migration from the legacy single-template key (`canvas-template`) into a project named "Untitled Template" the first time the new schema runs.

## Tech stack

- **React 18** + **TypeScript** with **Vite 6**
- **Zustand 5** for state, **zundo** for undo/redo
- **react-router-dom 7** for routing
- **react-rnd** for drag and resize
- **Tailwind CSS 3** for styling
- **lucide-react** for icons
- **papaparse** for CSV, **html2canvas + jsPDF** for PDF, **jszip** for PNG batches
- **Google Fonts** loaded dynamically via `<link>` injection

## Privacy

Everything runs locally. Projects, uploaded images, CSV files, and pasted JSON never leave your browser. The only outbound network calls are:

- Google Fonts stylesheets when you select a font.
- Whatever URL you enter on the API data tab (your responsibility — no proxying).

## License

MIT.
