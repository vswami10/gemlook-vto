import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductCatalog from './components/ProductCatalog.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import Drawer from './components/Drawer.jsx';
import { catalog, getProduct } from './services/catalog.js';
import { useLocalState } from './hooks/useLocalState.js';

const DEFAULT_FIT = {
  overallSize: 1,
  earringSpread: 0,
  earringDrop: 24,
  necklaceHeight: 44,
  necklaceSize: 1,
  metalTone: 50
};

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

function useImage(src) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!src) { setImg(null); return; }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
    image.src = src;
  }, [src]);
  return img;
}

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const faceRef = useRef(null);
  const poseRef = useRef(null);
  const faceResultsRef = useRef(null);
  const poseResultsRef = useRef(null);
  const smoothRef = useRef({});

  const [status, setStatus] = useState('Camera is off. Start camera to try jewelry.');
  const [isLive, setIsLive] = useState(false);
  const [selectedEarring, setSelectedEarring] = useLocalState('gemlook.selectedEarring', 'ear-pearl-drop');
  const [selectedNecklace, setSelectedNecklace] = useLocalState('gemlook.selectedNecklace', 'neck-gold-pendant');
  const [fit, setFit] = useLocalState('gemlook.fit', DEFAULT_FIT);
  const [cart, setCart] = useLocalState('gemlook.cart', []);
  const [wishlist, setWishlist] = useLocalState('gemlook.wishlist', []);
  const [trackingPoints, setTrackingPoints] = useLocalState('gemlook.debugPoints', false);
  const [autoDrape, setAutoDrape] = useLocalState('gemlook.autoDrape', true);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const earring = getProduct(selectedEarring);
  const necklace = getProduct(selectedNecklace);
  const earringImg = useImage(earring?.image);
  const necklaceImg = useImage(necklace?.image);
  const cartItems = useMemo(() => cart.map(id => getProduct(id)).filter(Boolean), [cart]);
  const wishItems = useMemo(() => wishlist.map(id => getProduct(id)).filter(Boolean), [wishlist]);
  const total = useMemo(() => cartItems.reduce((sum, item) => sum + item.price, 0), [cartItems]);

  useEffect(() => {
    if (!location.hash.startsWith('#look=')) return;
    try {
      const data = JSON.parse(atob(decodeURIComponent(location.hash.replace('#look=', ''))));
      if (data.e && getProduct(data.e)) setSelectedEarring(data.e);
      if (data.n && getProduct(data.n)) setSelectedNecklace(data.n);
      if (data.f) setFit({ ...DEFAULT_FIT, ...data.f });
      setStatus('Shared look loaded. Start camera to view it.');
    } catch {
      setStatus('Could not load share link.');
    }
  }, [setFit, setSelectedEarring, setSelectedNecklace]);

  const addUniqueId = (setter, productId) => {
    setter(prev => prev.includes(productId) ? prev : [...prev, productId]);
  };

  const drawDebugPoint = (ctx, x, y, label) => {
    ctx.save();
    ctx.fillStyle = '#22c55e';
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = '12px system-ui';
    ctx.fillText(label, x + 8, y - 8);
    ctx.restore();
  };

  const smoothPoint = (key, x, y, amount = 0.25) => {
    const old = smoothRef.current[key] || { x, y };
    const p = { x: lerp(old.x, x, amount), y: lerp(old.y, y, amount) };
    smoothRef.current[key] = p;
    return p;
  };

  const isVisibleLandmark = landmark => {
    if (!landmark) return false;
    return landmark.x > 0.03 && landmark.x < 0.97 && landmark.y > 0.03 && landmark.y < 0.97;
  };

  const drawJewelry = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -w, 0, w, h);
    ctx.restore();

    const face = faceResultsRef.current?.multiFaceLandmarks?.[0];
    const pose = poseResultsRef.current?.poseLandmarks;

    if (face && earringImg) {
      const leftEar = face[234];
      const rightEar = face[454];
      const chin = face[152];
      const forehead = face[10];
      const faceHeight = Math.abs((chin.y - forehead.y) * h) || h * 0.34;
      const ew = clamp(faceHeight * 0.22 * fit.overallSize, 32, 135);
      const eh = ew * (earringImg.height / earringImg.width);
      const ears = [
        { p: leftEar, key: 'earL', side: -1, label: 'L ear' },
        { p: rightEar, key: 'earR', side: 1, label: 'R ear' }
      ];
      for (const item of ears) {
        if (!isVisibleLandmark(item.p)) continue;
        const rawX = (1 - item.p.x) * w + item.side * fit.earringSpread;
        const rawY = item.p.y * h + fit.earringDrop;
        const pt = smoothPoint(item.key, rawX, rawY, 0.22);
        ctx.drawImage(earringImg, pt.x - ew / 2, pt.y - eh * 0.08, ew, eh);
        if (trackingPoints) drawDebugPoint(ctx, pt.x, pt.y, item.label);
      }
    }

    if (necklaceImg) {
      let cx = w / 2;
      let cy = h * 0.66;
      let baseWidth = w * 0.52;
      let angle = 0;
      let source = 'manual';

      if (autoDrape && pose?.[11] && pose?.[12] && (pose[11].visibility ?? 1) > 0.45 && (pose[12].visibility ?? 1) > 0.45) {
        const l = { x: (1 - pose[11].x) * w, y: pose[11].y * h };
        const r = { x: (1 - pose[12].x) * w, y: pose[12].y * h };
        const sL = smoothPoint('shoulderL', l.x, l.y, 0.18);
        const sR = smoothPoint('shoulderR', r.x, r.y, 0.18);
        cx = (sL.x + sR.x) / 2;
        cy = (sL.y + sR.y) / 2 + fit.necklaceHeight;
        baseWidth = Math.abs(sR.x - sL.x) * 1.08;
        angle = Math.atan2(sR.y - sL.y, sR.x - sL.x);
        source = 'pose';
        if (trackingPoints) {
          drawDebugPoint(ctx, sL.x, sL.y, 'L shoulder');
          drawDebugPoint(ctx, sR.x, sR.y, 'R shoulder');
        }
      } else if (face) {
        const l = face[234], r = face[454], chin = face[152];
        cx = ((1 - l.x) * w + (1 - r.x) * w) / 2;
        cy = chin.y * h + fit.necklaceHeight + 80;
        baseWidth = Math.abs(r.x - l.x) * w * 2.05;
        source = 'face fallback';
      }

      const nw = clamp(baseWidth * fit.necklaceSize * fit.overallSize, 150, w * 0.92);
      const nh = nw * (necklaceImg.height / necklaceImg.width);
      const pt = smoothPoint('necklace', cx, cy, 0.16);
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(angle * 0.45);
      if (fit.metalTone !== 50) {
        ctx.filter = `saturate(${0.7 + fit.metalTone / 60}) contrast(${0.9 + fit.metalTone / 180})`;
      }
      ctx.drawImage(necklaceImg, -nw / 2, -nh * 0.24, nw, nh);
      ctx.restore();
      if (trackingPoints) drawDebugPoint(ctx, pt.x, pt.y, source);
    }
  }, [earringImg, necklaceImg, fit, autoDrape, trackingPoints]);

  useEffect(() => {
    let raf;
    const loop = () => { drawJewelry(); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [drawJewelry]);

  const startCamera = async () => {
    if (!window.FaceMesh || !window.Pose || !window.Camera) {
      setStatus('MediaPipe libraries are still loading. Refresh if this message stays visible.');
      return;
    }
    try {
      setStatus('Requesting camera permission...');
      const video = videoRef.current;
      faceRef.current = new window.FaceMesh({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
      faceRef.current.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.55, minTrackingConfidence: 0.55 });
      faceRef.current.onResults(results => { faceResultsRef.current = results; });
      poseRef.current = new window.Pose({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
      poseRef.current.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.55, minTrackingConfidence: 0.55 });
      poseRef.current.onResults(results => { poseResultsRef.current = results; });
      cameraRef.current = new window.Camera(video, {
        onFrame: async () => {
          if (faceRef.current) await faceRef.current.send({ image: video });
          if (poseRef.current) await poseRef.current.send({ image: video });
        },
        width: 1280,
        height: 720
      });
      await cameraRef.current.start();
      setIsLive(true);
      setStatus('Live try-on running. Tracking face and shoulders on-device.');
    } catch (error) {
      setStatus(`Camera failed: ${error.message}`);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceResultsRef.current = null;
    poseResultsRef.current = null;
    smoothRef.current = {};
    cameraRef.current = null;
    setIsLive(false);
    setStatus('Camera stopped.');
  };

  const snapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      setStatus('Start camera before taking a snapshot.');
      return;
    }
    const link = document.createElement('a');
    link.download = `gemlook-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('Snapshot downloaded.');
  };

  const createShare = () => {
    const payload = { e: selectedEarring, n: selectedNecklace, f: fit };
    const hash = encodeURIComponent(btoa(JSON.stringify(payload)));
    const url = `${location.origin}${location.pathname}#look=${hash}`;
    setShareUrl(url);
    setShareOpen(true);
  };

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus('Share link copied.');
    } catch {
      setStatus('Copy blocked by browser. Select and copy the link manually.');
    }
  };

  const tryProduct = product => {
    if (product.category === 'earrings') setSelectedEarring(product.id);
    if (product.category === 'necklace') setSelectedNecklace(product.id);
    setStatus(`${product.name} selected for try-on.`);
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">GemLook Pro Try-On</p>
          <h1>Virtual Jewelry Try-On</h1>
          <p className="hero-copy">Real-time earrings and necklace virtual try-on with FaceMesh and BlazePose shoulder tracking. Everything runs in your browser.</p>
        </div>
        <div className="hero-actions">
          <button onClick={startCamera} disabled={isLive}>Start Camera</button>
          <button onClick={() => setWishOpen(true)} className="secondary">Wishlist {wishItems.length}</button>
          <button onClick={() => setCartOpen(true)} className="secondary">Cart {cartItems.length}</button>
          <button onClick={createShare} className="secondary">Share</button>
        </div>
      </header>

      <section className="stage-grid">
        <section className="stage-card">
          <div className="status-row"><span className={isLive ? 'dot live' : 'dot'}></span>{status}</div>
          <div className="canvas-wrap">
            <video ref={videoRef} playsInline muted className="source-video" />
            <canvas ref={canvasRef} className="tryon-canvas" />
          </div>
          <div className="quick-switcher">
            {catalog.map(product => <button key={product.id} onClick={() => tryProduct(product)} className={(product.id === selectedEarring || product.id === selectedNecklace) ? 'chip active' : 'chip'}>{product.name}</button>)}
          </div>
        </section>
        <ControlPanel fit={fit} setFit={setFit} trackingPoints={trackingPoints} setTrackingPoints={setTrackingPoints} autoDrape={autoDrape} setAutoDrape={setAutoDrape} onSnapshot={snapshot} onReset={() => setFit(DEFAULT_FIT)} onStop={stopCamera} />
      </section>

      <ProductCatalog selectedEarring={selectedEarring} selectedNecklace={selectedNecklace} onTry={tryProduct} onWish={p => addUniqueId(setWishlist, p.id)} onCart={p => addUniqueId(setCart, p.id)} />

      <Drawer title="Your Cart" open={cartOpen} onClose={() => setCartOpen(false)} items={cartItems} total={total} emptyText="Your cart is empty.">
        <button className="wide">Checkout</button>
      </Drawer>
      <Drawer title="Wishlist" open={wishOpen} onClose={() => setWishOpen(false)} items={wishItems} emptyText="Your wishlist is empty.">
        <button className="wide" onClick={() => { setCart(prev => [...new Set([...prev, ...wishlist])]); setWishlist([]); }}>Move all to cart</button>
      </Drawer>
      <Drawer title="Share Your Look" open={shareOpen} onClose={() => setShareOpen(false)} items={[]} emptyText="Anyone opening this link sees your exact selection and fit auto-applied.">
        <textarea readOnly value={shareUrl} />
        <button className="wide" onClick={copyShare}>Copy share link</button>
        <button className="wide secondary" onClick={snapshot}>Download look image</button>
      </Drawer>
    </main>
  );
}
