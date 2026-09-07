import { test, expect } from '@playwright/test';

test('teardown, component selection, isolation, filters, and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.part-row')).toHaveCount(20);
  await expect(page.locator('.app')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.getByRole('button', { name: 'Top case', exact: true }).click();
  await expect(page.locator('.inspector')).toContainText('Shown in Space Black');
  await page.getByRole('button', { name: 'All parts', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Explode assembly' })).toHaveValue('100');
  await page.getByRole('textbox', { name: 'Find a component' }).fill('fan');
  await expect(page.locator('.part-row')).toHaveCount(2);
  await page.getByRole('button', { name: 'Left fan', exact: true }).click();
  await expect(page.locator('.inspector h2')).toHaveText('Left fan');
  await page.getByRole('button', { name: 'Isolate component' }).click();
  await expect(page.locator('.part-row')).toHaveCount(1);
  await expect(page.getByRole('slider')).toBeDisabled();
  await page.getByRole('button', { name: 'Show full assembly' }).click();
  await expect(page.locator('.part-row')).toHaveCount(2);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('button', { name: /^Cooling/ }).click();
  await expect(page.locator('.part-row')).toHaveCount(17);
  await expect(page.locator('.inspector h2')).toContainText('beneath the surface');
  await page.getByRole('textbox', { name: 'Find a component' }).fill('unfindable');
  await expect(page.getByText('No matching components.')).toBeVisible();
  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect(page.locator('.part-row')).toHaveCount(20);
  await expect(page.getByRole('slider')).toHaveValue('0');
  await expect(page.getByRole('button', { name: 'Perspective', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('camera controls, dragging, and demo return to an interactive view', async ({ page }) => {
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.drawElements;
    const metrics = window as unknown as { atlasDrawCalls: number };
    metrics.atlasDrawCalls = 0;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      metrics.atlasDrawCalls++;
      return original.apply(this, args);
    };
  });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  const bounds = await page.locator('canvas').boundingBox();
  if (!bounds) throw new Error('Canvas bounds unavailable');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2 + 30, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator('.part-row.selected')).toHaveCount(0);
  await page.getByRole('button', { name: 'Top', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Top', exact: true })).toHaveAttribute('aria-pressed', 'true');
  // Presets must settle: a camera target outside OrbitControls limits used
  // to request frames forever, saturating software-rendered CI browsers.
  await page.waitForTimeout(1000);
  const callsAtRest = await page.evaluate(() => (window as unknown as { atlasDrawCalls: number }).atlasDrawCalls);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => (window as unknown as { atlasDrawCalls: number }).atlasDrawCalls)).toBe(callsAtRest);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  // Freeze demo time so a slow renderer cannot finish the 24-second tour
  // between the start and exit interactions; this scenario tests early exit.
  const demoClockStart = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: demoClockStart });
  await page.clock.pauseAt(new Date(demoClockStart.getTime() + 60_000));
  await page.getByRole('button', { name: /Watch the teardown/ }).click();
  await expect(page.locator('.demo-caption')).toBeVisible();
  await page.getByRole('button', { name: /Exit demo/ }).click();
  await expect(page.locator('.demo-caption')).toHaveCount(0);
  await expect(page.getByRole('slider')).toBeEnabled();
});

test('phone parts panel, inspection, about dialog, and layout', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Parts & systems' }).click();
  await page.getByRole('textbox', { name: 'Find a component' }).fill('M5 Pro');
  await page.getByRole('button', { name: 'M5 Pro', exact: true }).click();
  await expect(page.locator('.inspector h2')).toHaveText('M5 Pro');
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await page.getByRole('button', { name: 'Isolate component' }).click();
  await expect(page.getByRole('button', { name: 'Show full assembly' })).toBeVisible();
  await page.getByRole('button', { name: 'Show full assembly' }).click();
  // Freeze demo time so a slow renderer cannot finish the 24-second tour
  // between the start and exit interactions; this scenario tests early exit.
  const demoClockStart = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: demoClockStart });
  await page.clock.pauseAt(new Date(demoClockStart.getTime() + 60_000));
  await page.getByRole('button', { name: /Watch the teardown/ }).click();
  await expect(page.locator('.inspector')).not.toBeVisible();
  await page.getByRole('button', { name: /Exit demo/ }).click();
  await expect(page.locator('.inspector h2')).toHaveText('M5 Pro');
  await page.getByRole('button', { name: 'Close component details' }).click();
  await page.getByRole('button', { name: 'About this project' }).click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('a failed scene download leaves the component explorer usable', async ({ page }) => {
  await page.route(/\/src\/scene\/Scene\.tsx(?:\?.*)?$/, route => route.abort());
  await page.goto('/');
  await expect(page.getByText('The 3D view couldn’t load.')).toBeVisible();
  await page.getByRole('button', { name: 'Logic board', exact: true }).click();
  await expect(page.locator('.inspector h2')).toHaveText('Logic board');
  await expect(page.locator('.part-row')).toHaveCount(20);
});

for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
  test(`all 20 inventory controls stay visible while inspecting both fans at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.getByRole('button', { name: 'All parts', exact: true }).click();
    const inventory = page.locator('.inventory-item');
    const assertInventoryVisible = async () => {
      await expect(inventory).toHaveCount(20);
      for (const item of await inventory.all()) {
        await expect(item).toBeVisible();
        await expect(item).toBeInViewport({ ratio: 1 });
      }
      // A panel can cover a control while its bounding box remains in the viewport.
      await expect.poll(async () => inventory.evaluateAll(items => items.filter(item => {
        const bounds = item.getBoundingClientRect();
        const target = document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        return !target || !item.contains(target);
      }).map(item => item.getAttribute('aria-label')))).toEqual([]);
      await expect(page.getByRole('slider', { name: 'Explode assembly' })).toHaveValue('100');
    };
    await assertInventoryVisible();
    for (const name of ['Left fan', 'Right fan']) {
      await page.getByRole('button', { name: `Inspect ${name}`, exact: true }).click();
      await expect(page.locator('.inspector h2')).toHaveText(name);
      await expect(page.getByRole('button', { name: `Inspect ${name}`, exact: true })).toHaveClass(/active/);
      await assertInventoryVisible();
    }
  });
}

test('logic board navigation exposes eight functional groups and independent progress', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'All parts', exact: true }).click();
  await page.getByRole('button', { name: 'Explore logic board', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inside the logic board', exact: true })).toBeVisible();
  await expect(page.locator('.part-row')).toHaveCount(8);
  await expect(page.locator('.assembly-canvas')).toHaveCount(0);
  await expect(page.locator('.scene-wrap canvas')).toBeVisible();
  await page.getByRole('button', { name: 'NAND flash storage', exact: true }).click();
  const details = page.getByRole('complementary', { name: 'Circuit details' });
  await expect(details.getByRole('heading')).toHaveText('NAND flash storage');
  await expect(details).toContainText('Nonvolatile flash');
  const progress = page.getByRole('slider', { name: 'Explode assembly' });
  await expect(progress).toHaveValue('0');
  await progress.fill('50');
  await expect(progress).toHaveValue('50');
  await expect(details.getByRole('heading')).toHaveText('NAND flash storage');
  await page.getByRole('button', { name: 'All parts', exact: true }).click();
  await expect(progress).toHaveValue('100');
  await page.getByRole('button', { name: 'Back to MacBook', exact: true }).click();
  await expect(page.locator('.part-row')).toHaveCount(20);
  await expect(page.locator('.inventory-item')).toHaveCount(20);
  await expect(details).toHaveCount(0);
  await expect(progress).toHaveValue('100');
});

test('selected tray component can be inspected with every camera preset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Left fan', exact: true }).click();
  await page.getByRole('button', { name: 'Top', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show full assembly', exact: true })).toBeVisible();
  await expect(page.locator('.inspector h2')).toHaveText('Left fan');
  const canvas = page.locator('.assembly-canvas canvas');
  const images = new Set<string>();
  for (const view of ['Top', 'Front', 'Bottom', 'Left', 'Right', 'Perspective']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await page.waitForTimeout(350);
    images.add(await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL()));
  }
  expect(images.size).toBe(6);
  await page.getByRole('button', { name: 'Show full assembly', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Explode assembly' })).toHaveValue('75');
  await page.getByRole('button', { name: 'All parts', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect Right fan', exact: true }).click();
  await page.getByRole('button', { name: 'Perspective', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show full assembly', exact: true })).toBeVisible();
  await page.waitForTimeout(350);
  const beforeDrag = await canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL());
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Inspection canvas is missing');
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 100, bounds.y + bounds.height / 2 + 40, { steps: 8 });
  await page.mouse.up();
  await expect.poll(() => canvas.evaluate(el => (el as HTMLCanvasElement).toDataURL())).not.toBe(beforeDrag);
  await expect(page.locator('.inspector h2')).toHaveText('Right fan');
  await page.getByRole('button', { name: 'Show full assembly', exact: true }).click();
  await expect(page.locator('.inventory-item')).toHaveCount(20);
});
