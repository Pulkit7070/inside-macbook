import { flushSync } from 'react-dom';
import { Component, lazy, Suspense, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Box, Check, ChevronDown, ChevronLeft, CircleHelp, Cpu, Eye, Focus, Layers3, Maximize2, Minus, MousePointer2, MoveUpRight, Pause, Play, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { boardParts, BOARD_DISCLAIMER } from './data/board';
import { getPart, parts, systems } from './data/parts';
import { initialState, reducer, visibleParts } from './state/explorer';
import { DEMO_DURATION, sampleTimeline } from './scene/timeline';
import type { View } from './scene/Scene';

declare global { interface Window { __atlasRenderFrame?: (seconds: number) => Promise<void> } }
const renderMode = new URLSearchParams(window.location.search).has('render');
const BoardDetail = lazy(() => import('./scene/BoardDetail'));
const Scene = lazy(() => import('./scene/Scene'));

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="canvas-fallback"><strong>The 3D view couldn’t load.</strong><p>You can still explore the component list. Refresh the page to try loading the model again.</p><button onClick={() => window.location.reload()}>Reload page</button></div> : this.props.children;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [boardOpen, setBoardOpen] = useState(false);
  const [boardProgress, setBoardProgress] = useState(0);
  const [boardSelectedId, setBoardSelectedId] = useState('board-soc');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<View>('perspective');
  const [resetKey, setResetKey] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [mobileParts, setMobileParts] = useState(false);
  const [demo, setDemo] = useState(renderMode);
  const [demoTime, setDemoTime] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const about = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => setReducedMotion(media.matches); media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!demo || renderMode) return;
    let frame = 0; const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      if (t >= DEMO_DURATION) { setDemo(false); setDemoTime(24); setBoardOpen(true); setBoardProgress(1); dispatch({type:'explosion', value:1}); return; }
      setDemoTime(t); frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [demo]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileParts(false); setFocusMode(false); setDemo(false); }
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !about.current?.open) {
        event.preventDefault(); setMobileParts(true); requestAnimationFrame(() => search.current?.focus());
      }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, []);

  useEffect(() => {
    window.__atlasRenderFrame = async seconds => {
      await Promise.all([import('./scene/Scene'), import('./scene/BoardDetail')]);
      flushSync(() => { setDemo(true); setDemoTime(seconds); });
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const deadline = performance.now()+15000;
      while(document.querySelector('.loading-view')) { if(performance.now()>deadline) throw new Error('Scene loading timed out'); await new Promise<void>(resolve => requestAnimationFrame(() => resolve())); }
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    };
    return () => { delete window.__atlasRenderFrame; };
  }, []);
  const timeline = useMemo(() => sampleTimeline(demoTime), [demoTime]);
  const boardMode = demo ? timeline.board : boardOpen;
  const boardAmount = demo ? timeline.boardProgress : boardProgress;
  const boardSelected = boardParts.find(p => p.id === (demo ? timeline.boardSelectedId : boardSelectedId)) ?? boardParts[0];
  const renderedState = demo ? { ...initialState, enabledSystems: [...initialState.enabledSystems], explosion: timeline.explosion, selectedId: timeline.selectedId } : state;
  const visible = visibleParts(state);
  const results = visible.filter(part => `${part.name} ${part.system} ${part.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = renderedState.selectedId ? getPart(renderedState.selectedId) : undefined;
  const selectedSystem = systems.find(system => system.id === selected?.system);
  const percent = Math.round((boardMode ? boardAmount : renderedState.explosion) * 100);

  const reset = () => {
    setBoardOpen(false); setBoardProgress(0); dispatch({ type: 'reset' }); setQuery(''); setView('perspective'); setZoom(1); setResetKey(n => n + 1); setDemo(false); setMobileParts(false);
  };
  const select = (id: string, fromList = false) => {
    dispatch({ type: 'select', id }); setMobileParts(false);
    if (fromList && !state.isolatedId && !['top-case', 'display', 'keyboard', 'trackpad'].includes(id) && state.explosion < 0.6) dispatch({ type: 'explosion', value: 0.75 });
  };
  const startDemo = () => { setDemoTime(0); setMobileParts(false); setDemo(true); };

  return <div className={`app ${boardMode ? 'board-mode' : ''} ${focusMode ? 'focus-mode' : ''} ${demo ? 'demo-mode' : ''} ${renderMode ? 'render-mode' : ''} ${!boardMode && renderedState.explosion >= .98 && !renderedState.isolatedId ? 'inventory-mode' : ''}`}>
    <header className="header">
      <a className="brand" href="/" aria-label="Inside a MacBook home"><span className="brand-icon"><Layers3 size={21} strokeWidth={1.65} /></span><span>inside<span className="brand-period">.</span></span></a>
      <div className="breadcrumb"><span>AN OBJECT EXPLORER</span><i /><span>MACBOOK PRO</span></div>
      <div className="header-actions"><button className="about-button" aria-label="About this project" onClick={() => about.current?.showModal()}><CircleHelp size={16} /><span>About this project</span></button>
        <button key={demo ? "exit-demo" : "start-demo"} className={`demo-button ${demo ? 'playing' : ''}`} onClick={demo ? () => setDemo(false) : startDemo}>{demo ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}{demo ? 'Exit demo' : 'Watch the teardown'}<span className="demo-duration">24s</span></button>
      </div>
    </header>

    <main className="workspace">
      <button className="mobile-parts-button" onClick={() => setMobileParts(v => !v)} aria-expanded={mobileParts} aria-controls="assembly-sidebar"><SlidersHorizontal size={15} />Parts & systems<ChevronDown size={14} /></button>
      {mobileParts && <button className="mobile-backdrop" aria-label="Close parts panel" onClick={() => setMobileParts(false)} />}
      <aside id="assembly-sidebar" className={`sidebar ${mobileParts ? 'mobile-open' : ''}`} aria-label="Parts and systems">
        <div className="sidebar-heading"><div className="eyebrow">LOOK A LITTLE CLOSER</div><h2>{boardMode ? "Inside the board" : "The assembly"}<span>.</span></h2><p>{boardMode ? "8 functional groups · circuit study" : "20 assemblies · 8 board groups"}</p></div>
        <fieldset className="systems" disabled={demo}><legend className="section-label">SYSTEMS <span>VISIBILITY</span></legend>
          {systems.map(system => {
            const enabled = state.enabledSystems.includes(system.id);
            return <button key={system.id} className={`system-row ${enabled ? '' : 'system-off'}`} aria-pressed={enabled} onClick={() => dispatch({ type: 'toggle-system', id: system.id })} title={system.description}>
              <span className="system-dot" style={{ background: system.color }} /><span>{system.label}</span><span className="system-count">{parts.filter(p => p.system === system.id).length}</span><span className="visibility-check">{enabled && <Check size={11} strokeWidth={2.5} />}</span>
            </button>;
          })}
        </fieldset>
        <div className="parts-heading"><span className="section-label">COMPONENTS</span><span className="count-pill">{boardMode ? boardParts.length : results.length}</span></div>
        <label className="search-field"><Search size={14} /><input ref={search} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a component" aria-label="Find a component" disabled={demo} />{query ? <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button> : <kbd>/</kbd>}</label>
        <div className="parts-list" aria-label="Component list">
          {boardMode ? boardParts.map(part => <button key={part.id} className={`part-row ${boardSelected.id === part.id ? "selected" : ""}`} onClick={() => setBoardSelectedId(part.id)}><span className="part-indicator" /><span>{part.name}</span><ArrowUpRight size={13} /></button>) : results.map(part => <button key={part.id} disabled={demo} className={`part-row ${selected?.id === part.id ? 'selected' : ''}`} aria-pressed={selected?.id === part.id} onClick={() => select(part.id, true)}><span className="part-indicator" /><span>{part.name}</span><ArrowUpRight size={13} /></button>)}
          {results.length === 0 && <div className="empty-list"><Search size={21} /><p>{query ? 'No matching components.' : 'All systems are hidden.'}</p><button onClick={query ? () => setQuery('') : reset}>{query ? 'Clear search' : 'Show all components'}</button></div>}
        </div>
        <div className="sidebar-foot"><span className="live-dot" />Original 3D illustration<CircleHelp size={13} /></div>
      </aside>

      <section className="viewer" aria-label="MacBook explorer">
        <div className="viewer-heading"><div><div className="eyebrow">ENGINEERED, LAYER BY LAYER</div><h1>{boardMode ? "Inside the logic board" : "MacBook Pro"}</h1><p>14-inch <span>/</span> 2026 <span>/</span> M5 Pro</p></div><div className="live-label"><span />INTERACTIVE 3D</div></div>
        <div className="scene-wrap">
          <div className="datum datum-left"><span>+</span></div><div className="datum datum-right"><span>+</span></div>
          <SceneBoundary><Suspense fallback={<div className="loading-view"><Layers3 size={28} /><span>Preparing the assembly</span><i /></div>}>
            {!boardMode && <div className="assembly-canvas"><Scene state={renderedState} view={view} resetKey={resetKey} onSelect={id => { if (!demo) select(id); }} reducedMotion={reducedMotion || renderMode}
              lid={demo ? timeline.lid : undefined} demoAngle={demo ? timeline.angle : undefined} zoom={zoom} /></div>}
            {boardMode && <BoardDetail progress={boardAmount} selectedId={boardSelected.id} onSelect={id => { if(!demo) setBoardSelectedId(id); }} />}
          </Suspense></SceneBoundary>
          {!boardMode && renderedState.explosion >= .98 && !renderedState.isolatedId && <div className="inventory-labels" aria-label="Component tray">{parts.map(part => <button disabled={!renderedState.enabledSystems.includes(part.system)} key={part.id} className={`inventory-item ${selected?.id === part.id ? 'active' : ''}`} onClick={() => { if (!demo) select(part.id); }} aria-label={`Inspect ${part.name}`}><span>{part.name}</span></button>)}</div>}
          {!visible.length && !demo && <div className="scene-empty"><Eye size={24} /><p>Nothing in view</p><button onClick={reset}>Show all components <ArrowRight size={14} /></button></div>}
        </div>
        {!demo && <button className="board-entry" onClick={() => {setBoardOpen(!boardOpen);setMobileParts(false);}}><Cpu size={14}/>{boardOpen ? 'Back to MacBook' : 'Explore logic board'}<ArrowUpRight size={12}/></button>}
        {boardMode && <aside className="board-details" aria-label="Circuit details"><div className="eyebrow">CIRCUIT STUDY / {boardParts.indexOf(boardSelected)+1} OF 8</div><h2>{boardSelected.name}</h2><p>{boardSelected.description}</p><p>{boardSelected.detail}</p><a href={boardSelected.source} target="_blank" rel="noreferrer">Reference <ArrowUpRight size={12}/></a><small>{BOARD_DISCLAIMER}</small></aside>}
        {!demo && <>
          <div className="scene-top-controls"><div className="view-switch" aria-label="Camera view">{(['perspective', 'top', 'front', 'bottom', 'left', 'right'] as const).map(v => <button key={v} className={view === v ? 'active' : ''} aria-pressed={view === v} onClick={() => setView(v)}>{v.charAt(0).toUpperCase() + v.slice(1)}</button>)}</div>
            {state.isolatedId && <button className="return-button" onClick={() => dispatch({ type: 'clear-isolation' })}><ChevronLeft size={14} />Show assembly</button>}
          </div>
          <div className="viewport-actions"><button aria-label="Zoom in" title="Zoom in" disabled={zoom >= 1.6} onClick={() => setZoom(v => Math.min(1.6, v + 0.15))}><Plus size={17} /></button><button aria-label="Zoom out" title="Zoom out" disabled={zoom <= 0.7} onClick={() => setZoom(v => Math.max(0.7, v - 0.15))}><Minus size={17} /></button><span /><button aria-label={focusMode ? 'Exit expanded view' : 'Expand view'} title="Expand view" onClick={() => setFocusMode(v => !v)}><Maximize2 size={15} /></button></div>
          <div className="orbit-hint"><MousePointer2 size={12} /><span>Drag to rotate</span><i /><span>Scroll to zoom</span></div>
          <div className="model-note">ILLUSTRATIVE MODEL <span>·</span> NOT TO SCALE</div>
        </>}
        {demo && <div className="demo-caption"><span className="eyebrow">INSIDE A MACBOOK</span><h2>{timeline.caption}</h2><div className="demo-progress"><i style={{ width: `${demoTime / DEMO_DURATION * 100}%` }} /></div><span className="demo-timer">{String(Math.floor(demoTime)).padStart(2, '0')} / 24 SEC</span></div>}
      </section>

      <aside className={`inspector ${selected ? 'has-selection' : ''}`} aria-label="Component details" aria-live="polite">
        {selected ? <>
          <div className="inspector-top"><span className="section-label">COMPONENT DETAILS</span><button aria-label="Close component details" onClick={() => { dispatch({ type: 'clear-isolation' }); dispatch({ type: 'select', id: null }); }}><X size={15} /></button></div>
          <div className="component-symbol">{state.explosion >= .98 ? <Suspense fallback={null}><Scene state={{...initialState,selectedId:selected.id,isolatedId:selected.id}} onSelect={() => {}} view="perspective" resetKey={0} reducedMotion={true} zoom={1.6} /></Suspense> : <><Box size={42} strokeWidth={1} /><span className="symbol-corner">+</span></>}</div>
          <div className="system-tag"><span style={{ background: selectedSystem?.color }} />{selectedSystem?.label}</div>
          <h2>{selected.name}</h2><p className="part-description">{selected.description}</p><p className="part-detail">{selected.detail}</p><p className="part-location"><b>POSITION</b><br />{selected.location}</p>
          <div className="material-info"><span className="section-label">MATERIAL / ASSEMBLY</span><p>{selected.material}</p></div>
          <button className="isolate-button" onClick={() => dispatch({ type: state.isolatedId ? 'clear-isolation' : 'isolate' })}>{state.isolatedId ? <Layers3 size={15} /> : <Focus size={15} />}{state.isolatedId ? 'Show full assembly' : 'Isolate component'}<ArrowUpRight size={14} /></button>
          <div className="selection-note">{state.isolatedId ? 'Only this component is visible.' : 'Selected in the 3D view.'}</div>
        </> : <>
          <div className="inspector-top"><span className="section-label">A NEW PERSPECTIVE</span><ArrowDownLeft size={17} /></div>
          <div className="explore-icon"><Layers3 size={46} strokeWidth={0.9} /><span>+</span></div>
          <h2>There’s more<br />beneath the surface.</h2><p className="intro-description">Pull it apart. Follow a system.<br />Get to know the pieces that<br className="desktop-break" /> make it work.</p>
          <div className="instruction"><span className="instruction-icon"><SlidersHorizontal size={16} /></span><div><strong>Separate the layers</strong><p>Move the slider below.</p></div></div>
          <div className="instruction"><span className="instruction-icon"><MousePointer2 size={16} /></span><div><strong>Pick something curious</strong><p>Click any part to look closer.</p></div></div>
          <button className="suggested-part" onClick={() => select('logic-board', true)}><Cpu size={17} /><span>Start with the logic board</span><ArrowUpRight size={14} /></button>
        </>}
        <div className="inspector-footer"><span>THE REFERENCE</span><p>MacBook Pro, 14-inch (2026)</p><button onClick={() => about.current?.showModal()}>Sources & project notes<ArrowUpRight size={12} /></button></div>
      </aside>

      <section className="teardown-controls" aria-label="Teardown controls">
        <div className="teardown-label"><span className="slider-icon"><Layers3 size={19} strokeWidth={1.5} /></span><div><h2>{boardMode ? "Inside the circuits" : "Take it apart"}</h2><p>One layer at a time.</p></div></div>
        <div className="slider-control"><div className="slider-endpoints"><button disabled={demo || (!boardMode && !!state.isolatedId)} onClick={() => boardMode ? setBoardProgress(0) : dispatch({ type: 'explosion', value: 0 })}>Assembled</button><span className="explosion-value">{percent}<span>%</span></span><button disabled={demo || (!boardMode && !!state.isolatedId)} onClick={() => boardMode ? setBoardProgress(1) : dispatch({ type: 'explosion', value: 1 })}>All parts <MoveUpRight size={11} /></button></div>
          <input type="range" min="0" max="100" step="1" value={percent} disabled={demo || (!boardMode && !!state.isolatedId)} onChange={e => boardMode ? setBoardProgress(Number(e.target.value)/100) : dispatch({ type: 'explosion', value: Number(e.target.value) / 100 })} aria-label="Explode assembly" aria-valuetext={`${percent}% exploded`} style={{ '--progress': `${percent}%` } as React.CSSProperties} />
          <div className="slider-ticks" aria-hidden="true">{Array.from({ length: 21 }, (_, i) => <i key={i} />)}</div>
        </div>
        <button className="reset-button" onClick={reset}><RotateCcw size={15} />Reset view</button>
      </section>
    </main>
    <footer className="footer"><span>COMPLEX THINGS. A LITTLE CLEARER.</span><span>Explore slowly. Stay curious.<span className="footer-mark">✳</span></span></footer>

    <dialog ref={about} className="about-dialog" onClick={e => { if (e.target === about.current) about.current.close(); }}>
      <div className="dialog-heading"><span className="eyebrow">ABOUT INSIDE.</span><button aria-label="Close about" onClick={() => about.current?.close()}><X size={20} /></button></div>
      <h2>Understanding starts<br />with looking closer.</h2><p>An interactive study of the engineering inside a 14-inch MacBook Pro from 2026. Explore 20 simplified assemblies across five systems.</p>
      <p>The geometry is an original educational illustration. Component placement, dimensions, and separation are simplified; this is not a repair guide or a mechanically accurate teardown sequence.</p>
      <div className="about-sources"><a href="https://support.apple.com/en-us/125815" target="_blank" rel="noreferrer">2026 service reference · Apple<ArrowUpRight size={15} /></a><a href="https://github.com/ashemag/human-atlas" target="_blank" rel="noreferrer">Interaction inspiration · Human Atlas<ArrowUpRight size={15} /></a></div>
      <p className="about-small">Independent project. MacBook Pro, M5 Pro, and MagSafe are Apple trademarks. This project is not affiliated with Apple.</p>
      <button className="isolate-button" onClick={() => about.current?.close()}>Back to exploring<ArrowRight size={16} /></button>
    </dialog>
  </div>;
}
