export default function ControlPanel({ fit, setFit, trackingPoints, setTrackingPoints, autoDrape, setAutoDrape, onSnapshot, onReset, onStop }) {
  const update = (key, value) => setFit(prev => ({ ...prev, [key]: Number(value) }));
  return (
    <section className="panel controls-panel">
      <div className="panel-title">Fine-Tune Fit</div>
      <p className="muted">Auto-saved per browser. Use sliders for final fit correction.</p>
      <label>Overall Size <input type="range" min="0.45" max="1.8" step="0.01" value={fit.overallSize} onChange={e => update('overallSize', e.target.value)} /></label>
      <label>Earring Spread <input type="range" min="-120" max="120" step="1" value={fit.earringSpread} onChange={e => update('earringSpread', e.target.value)} /></label>
      <label>Earring Drop <input type="range" min="-80" max="160" step="1" value={fit.earringDrop} onChange={e => update('earringDrop', e.target.value)} /></label>
      <label>Necklace Height <input type="range" min="-140" max="180" step="1" value={fit.necklaceHeight} onChange={e => update('necklaceHeight', e.target.value)} /></label>
      <label>Necklace Size <input type="range" min="0.55" max="1.7" step="0.01" value={fit.necklaceSize} onChange={e => update('necklaceSize', e.target.value)} /></label>
      <label>Metal Tone <input type="range" min="0" max="100" step="1" value={fit.metalTone} onChange={e => update('metalTone', e.target.value)} /></label>
      <label className="check"><input type="checkbox" checked={autoDrape} onChange={e => setAutoDrape(e.target.checked)} /> Auto-drape necklace using BlazePose shoulders</label>
      <label className="check"><input type="checkbox" checked={trackingPoints} onChange={e => setTrackingPoints(e.target.checked)} /> Show tracking points</label>
      <div className="toolbar small-gap">
        <button onClick={onSnapshot}>Snapshot</button>
        <button onClick={onReset} className="secondary">Reset fit</button>
        <button onClick={onStop} className="danger">Stop</button>
      </div>
    </section>
  );
}
