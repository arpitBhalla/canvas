<div align="center">
  <img src="public/logo.svg" alt="Imprintly" width="64" height="64" />

  # Imprintly

  Design once. Imprint a copy for every row. A browser-based canvas editor that turns one design into a personalized batch — Canva-style editing meets mail merge.

  <sub>React · TypeScript · Vite · Zustand · Tailwind</sub>
</div>

---

## What it does

Imprintly lets you:

- **Design** multiple projects on a fixed-size canvas with text, shapes, images, freehand paths, and QR codes.
- **Bind text, images, and QR codes to variables** with `{{column}}` syntax.
- **Connect data** from CSV files, pasted JSON, or live HTTP/JSON APIs.
- **Preview imprints** record-by-record before exporting.
- **Export** the merged result as a multi-page PDF, a ZIP of PNGs (one per record), or the raw template JSON.

Every project lives in your browser's `localStorage`. There is no backend.

## Highlights

| Area | What's included |
|------|------|
| Multi-project | Home gallery with live thumbnails, rename / duplicate / delete, deep-link routes (`/project/:id`) |
| Templates | **Built-in starters** for invoices, certificates, business cards, and social posts in the new-project modal — pre-populated with `{{column}}` placeholders |
| Editing | Drag, resize, **rotate** (15° snap with Shift), **multi-select**, marquee select, **smart snap guides**, **group / ungroup**, z-order, **layers panel** with drag-reorder, lock, opacity |
| Text | 45 curated Google Fonts loaded on demand, bold / italic / underline / strikethrough, alignment, line-height, **letter spacing**, padding, fill + background color |
| Shapes | Rectangle, circle, triangle, star, line, arrow — with fill / stroke / **gradient** / radius / **shadow** |
| Paths | **Freehand**, curve (smooth spline), and straight-line pen tools with optional arrowheads, closed-shape fill, color, thickness, shadow |
| Images | Click-to-upload, drag-and-drop, **paste from clipboard**, paste a URL, or **bind to a column** for per-record images. **Crop** modal with draggable rectangle. Adjust **brightness / contrast / saturation / blur**, border radius, drop shadow |
| QR codes | First-class element. Bind value to a `{{column}}` for unique-per-record QRs (tickets, certificates), pick foreground / background, error-correction level (L/M/Q/H), and quiet-zone margin |
| Data | CSV upload, JSON paste, **live API fetch** with optional dot-path into the response |
| Variables | `{{column}}` tokens in text, image src, or QR value. **Per-element "hide when column is empty"** for conditional layouts |
| Brand kit | Save colors per project from any color picker; reuse them everywhere |
| Power | **Command palette** (`⌘K`), **right-click context menu**, alignment toolbar with **distribute by gap or center**, undo / redo (50 steps), debounced auto-save, zoom |
| Export | Multi-page PDF, ZIP of PNGs (one per record, with progress), and template JSON download — heavy export libs **lazy-load on demand** |

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

1. **Create a project.** From the home page, click **New project** and pick a template (Invoice, Certificate, Business card, Social post) or start from a Blank canvas.
2. **Add elements.** From the editor toolbar, add Text / Rectangle / Circle / Image / QR. Use the pen group for straight, curved, or freehand paths. Drag images onto the canvas, or paste them with `⌘V`.
3. **Arrange.** Multi-select with shift-click or marquee, then use the alignment toolbar in the right sidebar to align, distribute by gap, or group. Drag the violet pin above any selected element to rotate (Shift snaps to 15°).
4. **Bind variables.** Connect data on the left (CSV / JSON / API). Click any column chip in the **Variables** tab to insert a `{{column}}` token into the active text element. For images and QR codes, use the "Bind to a column" dropdown in their property panels.
5. **Hide conditionally.** In the right sidebar, set "Hide when column is empty" to skip an element on records that don't have a value for that column.
6. **Preview.** Click **Preview** in the header to step through each record with the data merged in.
7. **Export.** Click **PDF** for a single multi-page PDF, or **PNG zip** for one image per record.

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
| `⌘ G` / `Ctrl G` | Group selected |
| `⌘ ⇧ G` / `Ctrl Shift G` | Ungroup selected |
| `⌘ D` / `Ctrl D` | Duplicate selected |
| `⌘ Z` / `Ctrl Z` | Undo |
| `⌘ ⇧ Z` / `Ctrl Shift Z` | Redo |
| `Delete` / `Backspace` | Delete selected element(s) |
| `Arrow keys` | Move selected 1 px |
| `Shift + Arrow` | Move selected 10 px |
| `Shift + click` | Add / remove element from selection |
| `Shift + drag rotate` | Snap rotation to 15° |
| `⌘ V` | Paste image from clipboard |
| `Right-click` | Context menu (duplicate, lock, z-order, delete) |
| `Esc` | Deselect / cancel pen / close preview |

Shortcuts pause while a text element is in edit mode or while focus is in any input.

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
│   ├── canvas/                 # Canvas, draggable element wrapper, per-type renderers,
│   │                           #   snap guides, context menu
│   ├── layout/                 # Header, LeftSidebar, RightSidebar
│   ├── projects/               # ProjectCard, TemplatePreview, CreateProjectModal
│   ├── properties/             # Per-type inspector + reusable primitives
│   │                           #   (Slider, ColorField, Gradient, Shadow, CropModal, …)
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
│   ├── qr.ts                   # QR matrix builder + SVG element factory
│   ├── style.ts                # Shadow / gradient / image-filter → CSS helpers
│   ├── pdf.ts                  # html2canvas → jsPDF export (lazy-loaded)
│   ├── imageExport.ts          # html2canvas → JSZip PNG export (lazy-loaded)
│   └── variables.ts            # `{{var}}` tokenizer + replacer + visibility helpers
├── constants/                  # Defaults, Google Fonts list, built-in template gallery
└── types/                      # Shared TypeScript interfaces
```

## Architecture

There are two stores. **`projectsStore`** is the on-disk source of truth, persisted under `canvas-projects-v1` in `localStorage`. **`editorStore`** is the in-memory active editor with full undo/redo via `zundo`.

`ProjectEditor` connects them: on mount it hydrates the editor from the project; whenever the editor's template changes, it writes back to `projectsStore` after a 500 ms debounce.

Rendering is plain DOM (`react-rnd` for drag/resize, no Konva or Fabric). Lines, arrows, pen-tool paths, and QR codes render as inline SVG. PDFs are produced by snapshotting an offscreen DOM replica with `html2canvas` and stitching the pages with `jsPDF`. PNG ZIPs reuse the same DOM snapshot pipeline through `jszip`. Web fonts are awaited via `document.fonts.ready` before snapshotting so Google Fonts render correctly in the export.

The PDF and PNG-ZIP modules are **dynamically imported** when the user clicks the export buttons, so the editor's first-load bundle stays light (~135 KB gzipped).

There's a one-time migration from the legacy single-template key (`canvas-template`) into a project named "Untitled Template" the first time the new schema runs.

## Tech stack

- **React 18** + **TypeScript** with **Vite 6**
- **Zustand 5** for state, **zundo** for undo/redo
- **react-router-dom 7** for routing
- **react-rnd** for drag and resize
- **Tailwind CSS 3** for styling
- **lucide-react** for icons
- **papaparse** for CSV, **qrcode** for QR rendering, **html2canvas + jsPDF** for PDF, **jszip** for PNG batches
- **Google Fonts** loaded dynamically via `<link>` injection

## Privacy

Everything runs locally. Projects, uploaded images, CSV files, and pasted JSON never leave your browser. The only outbound network calls are:

- Google Fonts stylesheets when you select a font.
- Whatever URL you enter on the API data tab (your responsibility — no proxying).

## License

MIT.
