#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i++) {
  if (['--extract', '--help'].includes(args[i])) options[args[i].slice(2)] = true;
  else if (['--input', '--output', '--duration', '--fps', '--width', '--height'].includes(args[i])) {
    const key = args[i].slice(2);
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value for --${key}`);
    options[key] = args[++i];
  } else throw new Error(`Unknown option: ${args[i]}`);
}
if (options.help) {
  console.log('Usage: node scripts/verify-video.mjs [--input FILE] [--extract] [--output REVIEW_DIR] [--duration 24] [--fps 30] [--width 1920] [--height 1080]');
  process.exit(0);
}
const input = path.resolve(root, options.input ?? 'artifacts/inside-macbook-m5-pro.mp4');
const reviewDir = path.resolve(root, options.output ?? 'artifacts/video-review');
const expected = { duration: Number(options.duration ?? 24), fps: Number(options.fps ?? 30), width: Number(options.width ?? 1920), height: Number(options.height ?? 1080) };
if (Object.values(expected).some(value => !Number.isFinite(value) || value <= 0)) throw new Error('Expected values must be positive numbers.');
function binary(name) { return process.env[`${name.toUpperCase()}_PATH`] || (existsSync(`/opt/homebrew/bin/${name}`) ? `/opt/homebrew/bin/${name}` : name); }
async function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve(stdout) : reject(new Error(`${command} exited with code ${code}: ${stderr}`)));
  });
}
const probe = JSON.parse(await run(binary('ffprobe'), ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', input]));
const video = probe.streams.find(stream => stream.codec_type === 'video');
if (!video) throw new Error('No video stream found.');
const [numerator, denominator] = video.avg_frame_rate.split('/').map(Number);
const actual = { codec: video.codec_name, pixelFormat: video.pix_fmt, duration: Number(video.duration ?? probe.format.duration), fps: numerator / denominator, width: video.width, height: video.height, frames: Number(video.nb_frames), bytes: (await stat(input)).size };
const failures = [];
if (actual.codec !== 'h264') failures.push(`codec ${actual.codec}, expected h264`);
if (actual.pixelFormat !== 'yuv420p') failures.push(`pixel format ${actual.pixelFormat}, expected yuv420p`);
for (const key of ['width', 'height']) if (actual[key] !== expected[key]) failures.push(`${key} ${actual[key]}, expected ${expected[key]}`);
if (Math.abs(actual.fps - expected.fps) > 0.001) failures.push(`fps ${actual.fps}, expected ${expected.fps}`);
if (!Number.isFinite(actual.duration) || Math.abs(actual.duration - expected.duration) > 0.01) failures.push(`duration ${actual.duration}, expected ${expected.duration}`);
if (!Number.isFinite(actual.fps)) failures.push('frame rate is unavailable');
if (Number.isFinite(actual.frames) && actual.frames !== Math.round(expected.duration * expected.fps)) failures.push(`frame count ${actual.frames}, expected ${Math.round(expected.duration * expected.fps)}`);
console.log(JSON.stringify({ input, ...actual, sizeMiB: Number((actual.bytes / 1048576).toFixed(2)), valid: failures.length === 0, failures }, null, 2));
if (failures.length) process.exit(1);
if (options.extract) {
  await mkdir(reviewDir, { recursive: true });
  await writeFile(path.join(reviewDir, 'ffprobe.json'), JSON.stringify(probe, null, 2) + '\n');
  const frames = [...new Set([0, ...[0.2, 0.4, 0.6, 0.8].map(fraction => Math.round(expected.duration * expected.fps * fraction)), Math.round(expected.duration * expected.fps) - 1])];
  for (const frame of frames) {
    const destination = path.join(reviewDir, `frame-${String(frame).padStart(5, '0')}.png`);
    await run(binary('ffmpeg'), ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-vf', `select=eq(n\\,${frame})`, '-frames:v', '1', destination]);
    console.log(`Review frame ${frame}: ${destination}`);
  }
}
