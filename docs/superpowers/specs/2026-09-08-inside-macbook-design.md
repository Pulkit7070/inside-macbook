# Inside a MacBook

Approved concept: an interactive exploded-view MacBook explorer, accompanied by a reproducible 45-second demo video and a GitHub repository containing the app, assets, and video source.

## Experience

Reference the 14-inch 2021 MacBook Pro. Use original simplified geometry guided by published teardown references; describe the result as an educational illustration, not an exact service model. Do not imply mechanical disassembly order or dimensional accuracy. The primary reference is https://www.ifixit.com/News/54122/macbook-pro-2021-teardown, with interaction inspiration from https://github.com/ashemag/human-atlas. Record asset provenance and code attribution in ATTRIBUTION.md. No third-party geometry or photos will be redistributed without checking their license.

The desktop composition uses a warm off-white studio, soft grounding shadows, a large centered object, compact system filters on the left, a component inspector on the right, and an explosion slider along the bottom. Muted typography and one restrained orange accent support the model. The initial view shows an open, assembled laptop from an elevated three-quarter angle.

Users can orbit, zoom, select visible parts, isolate a selection, search component names, toggle systems, and smoothly scrub between assembled and exploded arrangements. Reset restores the initial camera, visibility, selection, and slider. Hidden components cannot be picked. Clearing isolation restores the preceding system filter state. A searchable component list provides an alternative to picking geometry. On phones the inspector becomes a bottom sheet and controls must leave the model usable.

## Model scope

Create 20 selectable assemblies: top case, bottom cover, display assembly, keyboard, trackpad, logic board, processor package, left fan, right fan, heatsink/heatpipe assembly, left speaker, right speaker, three battery groups, left I/O assembly, right I/O assembly, MagSafe assembly, left hinge, and right hinge. Group them under enclosure, power, cooling, computing, and display; keyboard and trackpad belong to enclosure, while I/O assemblies belong to computing. Small decorative features may be grouped with a parent rather than separately selectable.

Each part has a stable identifier, name, system, short factual explanation, material, and assembled/exploded transforms. Use thin rounded aluminum panels, dark detailed boards, visible fan blades, battery cells, and a convincing keyboard. Simplified component placement is explicit in the About text. Do not claim physics simulation for cooling or electrical overlays.

## Implementation boundaries

Use React, TypeScript, Vite, and Three.js with React Three Fiber for a static app requiring no API keys. The component catalog owns descriptions and identifiers. Geometry builders own reusable original meshes. The scene owns rendering and picking. UI state owns filters, selection, and isolation. A timeline module owns deterministic camera, lid, explosion, and annotation motion. The same scene and timeline are used for interactive playback and video export, avoiding a separate fake demo.

Keep geometry and materials reusable. Cap pixel ratio for rendering performance and offer reduced motion. Keyboard-operable HTML controls expose names and current values. Provide a readable fallback when WebGL is unavailable and clear progress/error states for video rendering. Normal orbit gestures must not accidentally select parts.

## Video

Deliver a 1920×1080 H.264 MP4 at 30 fps, 45 seconds long, plus editable source and a documented render command. Use a deterministic frame-driven render path, with a browser capture/encoding approach selected after checking available tooling. The first export is silent with on-screen captions; no music license is required.

Sequence: 0–5 seconds closed-laptop hero and title; 5–10 lid opens; 10–20 enclosure and major assemblies separate; 20–29 cooling and logic-board closeups with component labels; 29–35 demonstrate selection/isolation in the actual interface; 35–41 reassemble; 41–45 title and actual GitHub repository link. Demo mode hides unnecessary panels during the cinematic portions. Camera poses must keep relevant parts within frame, and captions must remain readable.

## Deliverables and validation

Deliver app source, original geometry source, component data, video timeline/export tooling, MP4, preview image, README with install/run/build/render instructions, attribution, and a GitHub repository. Create the repository through the authenticated account after implementation, subject to tool availability. Do not deploy a website as part of validation. Inspect remote CI after pushing and fix failures caused by this project.

Before completion, run type checking and a production build; verify selection, search, isolation restoration, filters, reset, slider endpoints, and tap-versus-drag behavior in a browser. Inspect desktop and narrow mobile layouts and capture evidence. Test catalog identifiers and state transitions where meaningful. Verify exported video resolution, codec, frame rate, and duration and inspect representative frames from every sequence segment for clipping and missing geometry. Clearly report any unavailable browser/device checks or external publishing blockers.

## Scope limits

One laptop reference, one finished UI direction, and one landscape video. No simulated electronics, repair instructions, account system, backend, purchased assets, or additional objects are needed for the first version. A later portrait cut can reuse the timeline but is outside this initial scope.
