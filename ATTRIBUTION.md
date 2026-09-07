# Attribution and reference notes

## Interaction inspiration

[Human Atlas](https://github.com/ashemag/human-atlas) by ashemag inspired the explore/select/isolate/explode interaction pattern. No application code or anatomy assets were copied into this project.

## Hardware references

This illustration targets the **2026 MacBook Pro, 14-inch, M5 Pro**, shown in Silver. Apple also offers Space Black.

Primary Apple references:

- [Technical specifications](https://support.apple.com/en-us/126318): model identity, exterior dimensions, finishes, keyboard, ports, and the 72.4 Wh battery capacity.
- [Repair manual](https://support.apple.com/en-us/125819): component terminology and assembly context.
- [Exploded view and orderable parts](https://support.apple.com/en-us/125815): internal arrangement and left/right fan identification (left 923-14193; right 923-14192).
- [Fans](https://support.apple.com/en-us/125807): rear fan placement and housing references.
- [Logic board](https://support.apple.com/en-us/125802): board shape, cooling layout, and connector relationships.

### Orientation and simplification

Left and right always refer to a seated person facing the keyboard, with the display hinges at the rear. Apple's underside service photos are viewed from the opposite side of the base: viewer-left in those images corresponds to the seated user's right. This distinction matters for the two rear fans and the asymmetric ports.

Proportions and layout are reference-based; all geometry is original and simplified. The 31.26 × 22.12 × 1.55 cm dimensions describe the whole closed notebook, not the base alone. This is not CAD-accurate geometry, a complete parts inventory, or a repair/disassembly guide.

The three battery groups illustrate a single six-cell assembly with 72.4 Wh total capacity. The soldered M5 Pro package is separated only to explain its role. The right I/O group combines connections for teaching: HDMI and SDXC are on the logic board, not one removable daughterboard. Small cables, fasteners, shields, and other details are simplified or omitted; exploded spacing is illustrative.

Apple images are research references only. Locally stored reference images remain in ignored research artifacts and are not bundled or redistributed with the application. No Apple photographs, diagrams, or 3D assets are used as application assets.

## Original assets

All component geometry, keyboard texture, processor label, abstract display wallpaper, and the favicon were created for this project. The display artwork is not an Apple wallpaper. No commercial 3D model is required.

## Dependencies

React, Three.js, React Three Fiber, Drei, Lucide, and other package dependencies retain their respective licenses. Manrope and IBM Plex Mono are bundled through Fontsource and retain their SIL Open Font License notices in their npm packages.

## Trademarks

MacBook Pro, M5 Pro, Apple silicon, and MagSafe are Apple trademarks. This is an independent educational project and is not affiliated with or endorsed by Apple.

## Studio presentation

[Model X Studio](https://model-x-studio.vercel.app/) informed the floating panels, compact assembly bar, and dark studio treatment. The user-provided Human Atlas video informed the miniature component tray. No assets or code from these references are redistributed.

Additional exterior checks used the [2026 side profile](https://content.abt.com/media/images/products/BDP_Images/apple-macbook-pro-14-2026-silver-left.jpg) and a [14-inch M5 underside photograph](https://www.macotakara.jp/macintosh/entry-49753.html). The latter is the 2025 model and is used only as a visual comparison for the cover, feet, and engraving, alongside the 2026 service references. Circuit-level sources and the limits of the teaching layout are recorded in `src/data/board.ts`.
