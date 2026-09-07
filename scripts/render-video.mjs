#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i++) {
  const key = args[i];
  if (key === '--resume' || key === '--help') options[key.slice(2)] = true;
  else if (['--url', '--output', '--fps', '--duration', '--frames', '--scale'].includes(key)) {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for ${key}`);
    options[key.slice(2)] = args[++i];
  } else throw new Error(`Unknown option: ${key}`);
}
if (options.help) {
  console.log('Usage: node scripts/render-video.mjs [--url URL] [--output FILE] [--fps 30] [--duration 24] [--frames 0,240,480,719] [--scale 0.5|1920x1080] [--resume]\nStart the app on port 4173 first. Subset renders capture images only. Resume requires an identical source and render manifest.');
  process.exit(0);
}
const fps = Number(options.fps ?? 30);
const duration = Number(options.duration ?? 24);
if (!Number.isFinite(fps) || fps <= 0 || !Number.isFinite(duration) || duration <= 0) throw new Error('FPS and duration must be positive numbers.');
const totalFrames = Math.round(fps * duration);
if (totalFrames < 1 || Math.abs(totalFrames - fps * duration) > 1e-6) throw new Error('Duration times FPS must be a positive integer.');
let width = 1920, height = 1080;
if (options.scale) {
  const dimensions = /^(\d+)x(\d+)$/.exec(options.scale);
  if (dimensions) [width, height] = dimensions.slice(1).map(Number);
  else { const scale = Number(options.scale); width = Math.round(1920 * scale); height = Math.round(1080 * scale); }
}
if (![width, height].every(n => Number.isInteger(n) && n > 0 && n % 2 === 0)) throw new Error('Dimensions must be positive even integers for H.264.');
const url = new URL(options.url ?? 'http://127.0.0.1:4173/?render=1');
url.searchParams.set('render', '1');
const output = path.resolve(root, options.output ?? 'artifacts/inside-macbook-m5-pro.mp4');
const framesDir = path.resolve(root, 'artifacts/video-frames');
const selectedFrames = options.frames ? [...new Set(options.frames.split(',').map(Number))].sort((a, b) => a - b) : Array.from({ length: totalFrames }, (_, i) => i);
if (!selectedFrames.length || selectedFrames.some(n => !Number.isInteger(n) || n < 0 || n >= totalFrames)) throw new Error(`Frame indices must be integers from 0 to ${totalFrames - 1}.`);

async function sourceFingerprint() {
  const hash = createHash('sha256');
  async function visit(relative) {
    const absolute = path.join(root, relative);
    if (!existsSync(absolute)) return;
    if ((await stat(absolute)).isDirectory()) {
      for (const name of (await readdir(absolute)).sort()) await visit(path.join(relative, name));
    } else { hash.update(relative); hash.update(await readFile(absolute)); }
  }
  for (const item of ['src', 'public', 'index.html', 'package.json', 'package-lock.json', 'vite.config.js', 'vite.config.ts', 'scripts/render-video.mjs']) await visit(item);
  return hash.digest('hex');
}
const manifest = { version: 1, url: url.href, fps, duration, width, height, totalFrames, format: 'jpeg', quality: 95, sourceFingerprint: await sourceFingerprint() };
const manifestPath = path.join(framesDir, 'manifest.json');
if (options.resume) {
  if (!existsSync(manifestPath)) throw new Error('Cannot resume: no frame manifest exists. Run without --resume.');
  const existing = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (JSON.stringify(existing) !== JSON.stringify(manifest)) throw new Error('Cannot resume: source or render settings changed. Run without --resume to replace old frames.');
} else {
  await rm(framesDir, { recursive: true, force: true });
  await mkdir(framesDir, { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}
const fallback = '/Users/psudokit/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync(fallback) ? fallback : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const framePath = frame => path.join(framesDir, `frame-${String(frame).padStart(5, '0')}.jpg`);
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  page.on('pageerror', error => console.error(`Page error: ${error.message}`));
  console.log(`Loading ${url.href} at ${width}x${height}; capturing ${selectedFrames.length} frames.`);
  await page.goto(url.href, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => typeof window.__atlasRenderFrame === 'function' && document.querySelector('canvas'), undefined, { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const started = Date.now();
  let captured = 0, skipped = 0;
  for (const [index, frame] of selectedFrames.entries()) {
    const destination = framePath(frame);
    if (options.resume && existsSync(destination) && (await stat(destination)).size > 0) skipped++;
    else {
      await page.evaluate(async t => { await window.__atlasRenderFrame(t); }, frame / fps);
      const bytes = await page.screenshot({ type: 'jpeg', quality: 95, fullPage: false, animations: 'disabled' });
      await writeFile(`${destination}.tmp`, bytes);
      await rename(`${destination}.tmp`, destination);
      captured++;
    }
    if ((index + 1) % 30 === 0 || index === selectedFrames.length - 1) console.log(`Frames ${index + 1}/${selectedFrames.length}; captured ${captured}, resumed ${skipped}; ${((Date.now() - started) / 1000).toFixed(1)}s elapsed.`);
  }
} finally { await browser.close(); }
if (options.frames) {
  console.log(`Subset capture complete: ${framesDir}. Run without --frames for MP4 export.`);
  process.exit(0);
}
await mkdir(path.dirname(output), { recursive: true });
const ffmpeg = process.env.FFMPEG_PATH || (existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : 'ffmpeg');
console.log(`Encoding ${output}`);
await new Promise((resolve, reject) => {
  const child = spawn(ffmpeg, ['-y', '-hide_banner', '-framerate', String(fps), '-start_number', '0', '-i', path.join(framesDir, 'frame-%05d.jpg'), '-frames:v', String(totalFrames), '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { stdio: 'inherit' });
  child.once('error', reject);
  child.once('exit', code => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
});
console.log(`Export complete: ${output} (${((await stat(output)).size / 1048576).toFixed(2)} MiB). Verify with node scripts/verify-video.mjs`);
