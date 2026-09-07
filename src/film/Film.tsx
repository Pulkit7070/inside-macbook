import {useEffect,useState} from 'react';
import {flushSync} from 'react-dom';
import Scene from '../scene/Scene';
import BoardDetail from '../scene/BoardDetail';
import {initialState} from '../state/explorer';
import './film.css';
const clamp=(v:number)=>Math.min(1,Math.max(0,v));
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const cuts=[0,3.4375,6.25,9.0625,13.75,17.5,20];
export default function Film(){
 const [time,setTime]=useState(0);
 useEffect(()=>{window.__atlasRenderFrame=async t=>{flushSync(()=>setTime(t));await document.fonts.ready;await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>r()))));};return()=>{delete window.__atlasRenderFrame;};},[]);
 const t=Math.min(time,19.999),shot=Math.max(0,cuts.findIndex((v,i)=>t>=v&&t<cuts[i+1]));
 const local=t-cuts[shot],length=cuts[shot+1]-cuts[shot],p=local/length;
 const titleIn=ease(local/.45),titleOut=1-ease((local-length+.35)/.35);
 const entry=1-ease(local/.32),exit=ease((local-length+.22)/.22);
 const flash=Math.max(entry*(shot?1:0),exit)*.85;
 const zoom=shot===0?1.1+p*.2:shot===1?1.18-p*.12:shot===2?1.12+p*.08:shot===3?1:shot===4?1.06+p*.12:1.12-p*.12;
 const board=shot===1;
 const isolated=shot===0?'processor':shot===4?'left-fan':null;
 const explosion=shot===3?ease(p):shot===5?(1-ease(p/.65))*.6:0;
 const state={...initialState,enabledSystems:[...initialState.enabledSystems],selectedId:null,isolatedId:isolated,explosion};
 const titles=['Small chip.','Big possibilities.','One remarkable machine.','Every piece has a purpose.','Built to keep its cool.','Complex. Made clear.'];
 const subtitles=['M5 PRO · 2026','COMPUTE / MEMORY / STORAGE','MACBOOK PRO · 14-INCH','20 ASSEMBLIES · ONE SYSTEM','DUAL-FAN THERMAL SYSTEM','EXPLORE INSIDE.'];
 return <main className={`film shot-${shot}`}>
  <div className="film-brand">inside<span>.</span></div><span className="film-edition">AN OBJECT STUDY / 001</span>
  <div className="film-stage" style={{transform:`translateX(${entry*(shot%2?70:-70)}px) scale(${zoom+exit*.10})`,filter:`blur(${(entry+exit)*5}px)`}}>
   {board?<BoardDetail progress={ease(p)} selectedId={p<.4?'board-soc':p<.7?'board-memory':'board-storage'} onSelect={()=>{}}/>:<Scene state={state} view={isolated?'top':'perspective'} resetKey={shot} reducedMotion={true} zoom={isolated?1.25:1} demoAngle={isolated?undefined:.52+p*.23} lid={shot===2?.3+ease(p/.5)*1.64:1.945} onSelect={()=>{}}/>}
  </div>
  <div className="film-copy" style={{opacity:titleIn*titleOut,transform:`translateY(${(1-titleIn)*28}px)`}}><p>{subtitles[shot]}</p><h1>{titles[shot]}</h1><i style={{transform:`scaleX(${ease(local/.75)})`}}/></div>
  {shot===0&&<div className="film-orbit" style={{transform:`translate(-50%,-50%) rotate(${p*32}deg) scale(${.85+p*.25})`,opacity:.12*titleIn}}/>}
  {shot===3&&<div className="film-counter">{Math.round(ease(p)*20).toString().padStart(2,'0')}<small>COMPONENTS REVEALED</small></div>}
  <div className="film-chapters">{['CHIP','CIRCUITS','MACBOOK','TEARDOWN','THERMALS','INSIDE.'].map((name,i)=><span key={name} className={i===shot?'current':''}>{name}</span>)}</div>
  <div className="film-flash" style={{opacity:flash}}/><div className="film-end-fade" style={{opacity:ease((t-19.65)/.35)}}/>
 </main>;
}
