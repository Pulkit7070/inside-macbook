# Inside a MacBook

An interactive 3D study of the 14-inch MacBook Pro (2021). Pull apart 20 original, simplified assemblies; explore five systems; select and isolate a component; and play a 45-second cinematic walkthrough.

![The MacBook explorer in its exploded view](docs/preview.png)

## Run

Requires Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. No API keys, accounts, or external model downloads are required. Fonts are bundled locally.

## Explore

- Drag to orbit, scroll or use +/− to zoom.
- Scrub the bottom slider from assembled to exploded.
- Toggle system visibility or search components. Press `/` to focus search.
- Select a part in the scene or list. Selecting an internal component from the list opens the assembly so you can see it.
- Isolate a component to inspect it; returning restores the previous system filters.
- Choose perspective, top, or front views. Reset restores the initial view and all components.
- Watch the teardown plays the shared model through a deterministic 45-second timeline. Exit demo or press Escape to return to your previous exploration state.

## Validate and build

```sh
npm run check
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Browser checks use a local Vite server automatically. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium executable. Production assets are written to `dist/`; serve that directory using a static host. The project does not deploy itself.

## Structure

- `src/data/parts.ts`: component explanations and system membership.
- `src/state/explorer.ts`: selection, filters, isolation, and explosion state.
- `src/scene/geometry.tsx`: original procedural meshes and textures.
- `src/scene/MacBook.tsx`: assembly transforms and picking.
- `src/scene/Scene.tsx`: lighting, camera controls, and rendering.
- `src/scene/timeline.ts`: reusable cinematic timeline.
- `src/App.tsx` and `src/styles.css`: responsive HTML interface.

The MP4 export and editable video package are a separate follow-on deliverable; this repository currently implements the website and in-browser demo.

## Reference and accuracy

The geometry is an original educational illustration, not a service model. Dimensions, placement, component grouping, and exploded positions are simplified. The processor is shown separately for explanation; the scene is not a physical disassembly sequence. See [ATTRIBUTION.md](ATTRIBUTION.md) for references and trademark notes.

## License

Original source and procedural geometry are MIT licensed. Dependencies retain their own licenses.
