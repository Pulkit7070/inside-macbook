import { test, expect } from '@playwright/test';

test('teardown, component selection, isolation, filters, and reset', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.part-row')).toHaveCount(20);
  await page.getByRole('button', { name: 'Exploded', exact: true }).click();
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
  await page.getByRole('textbox', { name: 'Find a component' }).fill('processor');
  await page.getByRole('button', { name: 'Processor', exact: true }).click();
  await expect(page.locator('.inspector h2')).toHaveText('Processor');
  await expect(page.locator('.sidebar')).not.toBeVisible();
  await page.getByRole('button', { name: 'Isolate component' }).click();
  await expect(page.getByRole('button', { name: 'Show full assembly' })).toBeVisible();
  await page.getByRole('button', { name: 'Show full assembly' }).click();
  await page.getByRole('button', { name: /Watch the teardown/ }).click();
  await expect(page.locator('.inspector')).not.toBeVisible();
  await page.getByRole('button', { name: /Exit demo/ }).click();
  await expect(page.locator('.inspector h2')).toHaveText('Processor');
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
