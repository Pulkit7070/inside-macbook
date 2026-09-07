#!/usr/bin/env node
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mixOnly=process.argv.includes('--mix-only');
async function run(cmd,args){await new Promise((resolve,reject)=>{const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error(`${cmd} exited ${code}`)));});}
if(!mixOnly) await run(process.execPath,['scripts/render-video.mjs','--url','http://127.0.0.1:4173/?film=1','--duration','20','--output','artifacts/macbook-film-silent.mp4']);
const score='artifacts/macbook-hiphop-score.wav';
if(!existsSync(path.join(root,score))) throw new Error('Generate the original score first: python3 scripts/compose-score.py (NumPy required).');
const ffmpeg=process.env.FFMPEG_PATH || (existsSync('/opt/homebrew/bin/ffmpeg')?'/opt/homebrew/bin/ffmpeg':'ffmpeg');
await run(ffmpeg,['-y','-hide_banner','-loglevel','warning','-i','artifacts/macbook-film-silent.mp4','-i',score,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t','20','-movflags','+faststart','artifacts/macbook-space-black-film.mp4']);
await run(process.execPath,['scripts/verify-video.mjs','--input','artifacts/macbook-space-black-film.mp4','--duration','20','--extract','--output','artifacts/film-review']);
console.log('Finished: artifacts/macbook-space-black-film.mp4');
