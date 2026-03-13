/* ============================================================
   BREATHENGINE V4 — Moteur standalone
   ============================================================

   INTÉGRATION REACT
   -----------------
   1. Copier ce fichier dans /public/breathengine-v3.js
   2. Dans index.html : <script src="/breathengine-v3.js"></script>
   3. Dans ton composant React :

   ```jsx
   import { useEffect, useRef } from 'react'

   export function BreathOrb({ exercise, onComplete }) {
     const canvasRef  = useRef(null)
     const overlayRef = useRef(null)

     useEffect(() => {
       // Monte le moteur sur les éléments React
       window.BreathEngine.mount(canvasRef.current, overlayRef.current)
       return () => window.BreathEngine.destroy()
     }, [])

     useEffect(() => {
       if (!exercise) return
       window.BreathEngine.run({
         ...exercise,          // config complète fournie par l'exo
         onComplete,
       })
       return () => window.BreathEngine.stop()
     }, [exercise])

     return (
       <div style={{ position: 'relative', width: '100%', height: '100%' }}>
         <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
         <div ref={overlayRef} style={{
           position: 'absolute', inset: 0,
           display: 'flex', flexDirection: 'column',
           alignItems: 'center', justifyContent: 'flex-start',
           paddingTop: '8%',
           pointerEvents: 'none', userSelect: 'none',
         }}>
           <div className="be-phase-label" />
         </div>
       </div>
     )
   }
   ```

   CSS minimal à inclure dans ton projet (ou Tailwind équivalent) :
   ```css
   .be-phase-label { opacity: 0; transition: opacity 0.6s ease; }
   .be-visible { opacity: 1 !important; }
   .be-phase-label { font-size: clamp(1.1rem,3.5vmin,1.8rem); font-weight:300; letter-spacing:.25em; text-transform:uppercase; color:rgba(255,255,255,.75); }
   ```

   API PUBLIQUE
   ------------
   window.BreathEngine.mount(canvasEl, overlayEl)  — attacher à des éléments existants
   window.BreathEngine.configure(config)            — appliquer une config (stop si en cours)
   window.BreathEngine.init()                       — Promise — pré-chauffe AudioContext
   window.BreathEngine.start()                      — lance countdown puis exercice
   window.BreathEngine.stop()                       — arrêt immédiat → idle
   window.BreathEngine.pause()
   window.BreathEngine.resume()
   window.BreathEngine.reset()                      — stop + clear canvas
   window.BreathEngine.skip()                       — phase suivante immédiatement
   window.BreathEngine.setVolume(0.0–1.0)
   window.BreathEngine.setMuted(bool)
   window.BreathEngine.getCurrentState()            — snapshot état complet
   window.BreathEngine.run(config)                  — Promise — configure + start, résout sur onComplete
   window.BreathEngine.destroy()                    — nettoyage complet (unmount React)

   SCHÉMA DE CONFIG
   ----------------
   {
     totalCycles: 6,            // 0 = infini jusqu'à stop()
     countdownDuration: 3,      // secondes de décompte avant le début (0 = désactivé)
     backgroundColor: '#000000',
     colors: {
       preparation: { hue: 210, saturation: 60, lightness: 42 },
       inhale:      { hue: 210, saturation: 60, lightness: 42 },
       holdFull:    { hue: 220, saturation: 50, lightness: 35 },
       exhale:      { hue: 270, saturation: 50, lightness: 48 },
       holdEmpty:   { hue: 270, saturation: 40, lightness: 30 },
       recovery:    { hue: 210, saturation: 40, lightness: 62 },
     },
     phases: {
       preparation: { enabled: true,  duration: 4, label: 'Préparer', easing: 'cubicInOut', silent: false, audioUrl: null },
       inhale:      { enabled: true,  duration: 4, label: 'Inspirer', easing: 'cubicInOut', audioUrl: null },
       holdFull:    { enabled: true,  duration: 4, label: 'Retenir',  easing: 'sineInOut',  audioUrl: null },
       exhale:      { enabled: true,  duration: 6, label: 'Expirer',  easing: 'cubicInOut', audioUrl: null },
       holdEmpty:   { enabled: false, duration: 0, label: 'Retenir',  easing: 'sineInOut',  audioUrl: null },
       recovery:    { enabled: false, duration: 0, label: 'Repos',    easing: 'quartOut',   audioUrl: null },
     },
     volume: 0.5,
     muted: false,
     onPhaseChange:   (phaseName, duration) => {},
     onCycleComplete: (cycleNumber) => {},
     onComplete:      () => {},
     onTick:          (state) => {},   // chaque frame RAF
     onCountdownTick: (remaining) => {},
   }
   ============================================================ */

/* ============================================================
   [1] CONFIG DEFAULTS
   ============================================================ */
const CONFIG_DEFAULTS = {
  totalCycles: 6,
  countdownDuration: 0,
  backgroundColor: '#000000',

  colors: {
    preparation: { hue: 215, saturation: 45, lightness: 32 },
    inhale:      { hue: 215, saturation: 45, lightness: 32 },
    holdFull:    { hue: 220, saturation: 50, lightness: 35 },
    exhale:      { hue: 270, saturation: 50, lightness: 48 },
    holdEmpty:   { hue: 270, saturation: 40, lightness: 30 },
    recovery:    { hue: 210, saturation: 40, lightness: 62 },
  },

  phases: {
    preparation: { enabled: false, duration: 0, label: 'Préparer', easing: 'cubicInOut', silent: false, audioUrl: null },
    inhale:      { enabled: true,  duration: 4, label: 'Inspirer', easing: 'cubicInOut', silent: false, audioUrl: null },
    holdFull:    { enabled: true,  duration: 4, label: 'Retenir',  easing: 'sineInOut',  silent: false, audioUrl: null },
    exhale:      { enabled: true,  duration: 6, label: 'Expirer',  easing: 'cubicInOut', silent: false, audioUrl: null },
    holdEmpty:   { enabled: false, duration: 0, label: 'Retenir',  easing: 'sineInOut',  silent: false, audioUrl: null },
    recovery:    { enabled: false, duration: 0, label: 'Repos',    easing: 'quartOut',   silent: false, audioUrl: null },
  },

  volume: 0.5,
  muted: false,

  onPhaseChange:    null,
  onCycleComplete:  null,
  onComplete:       null,
  onTick:           null,
  onCountdownTick:  null,
};

const PHASE_ORDER = ['preparation','inhale','holdFull','exhale','holdEmpty','recovery'];

function mergeConfig(user) {
  const cfg = JSON.parse(JSON.stringify(CONFIG_DEFAULTS));
  if (!user) return cfg;
  if (user.totalCycles        !== undefined) cfg.totalCycles        = user.totalCycles;
  if (user.countdownDuration  !== undefined) cfg.countdownDuration  = user.countdownDuration;
  if (user.backgroundColor    !== undefined) cfg.backgroundColor    = user.backgroundColor;
  if (user.volume             !== undefined) cfg.volume             = user.volume;
  if (user.muted              !== undefined) cfg.muted              = user.muted;
  if (user.colors) {
    for (const k of Object.keys(user.colors)) {
      cfg.colors[k] = Object.assign({}, cfg.colors[k] || {}, user.colors[k]);
    }
  }
  if (user.phases) {
    for (const k of Object.keys(user.phases)) {
      cfg.phases[k] = Object.assign({}, cfg.phases[k] || {}, user.phases[k]);
    }
  }
  for (const cb of ['onPhaseChange','onCycleComplete','onComplete','onTick','onCountdownTick']) {
    if (typeof user[cb] === 'function') cfg[cb] = user[cb];
  }
  return cfg;
}

/* ============================================================
   [2] EASING LIB
   ============================================================ */
const EasingLib = {
  linear:      t => t,
  cubicInOut:  t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2,
  sineInOut:   t => -(Math.cos(Math.PI*t) - 1) / 2,
  quartOut:    t => 1 - Math.pow(1-t, 4),
  cubicIn:     t => t*t*t,
  cubicOut:    t => 1 - Math.pow(1-t, 3),

  get(name) { return this[name] || this.cubicInOut; },

  lerpAngle(a, b, t) {
    let diff = b - a;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return a + diff * t;
  },
  lerp(a, b, t)       { return a + (b - a) * t; },
  clamp(v, lo, hi)    { return Math.max(lo, Math.min(hi, v)); },
};

/* ============================================================
   [3] AUDIO ENGINE
   ============================================================ */
class AudioEngine {
  constructor() {
    this._ctx        = null;
    this._masterGain = null;
    this._phaseGain  = null;
    this._nodes      = [];
    this._buffers    = new Map();
    this._bufferPromises = new Map();
    this._volume     = 0.5;
    this._muted      = false;
    this._initialized = false;
  }

  async init(config) {
    if (this._ctx && this._ctx.state !== 'closed') {
      if (this._ctx.state === 'suspended') await this._ctx.resume();
      this._applyVolume();
      return;
    }
    // iOS Safari : réutiliser l'AudioContext pré-créé synchroniquement dans le tap handler
    const AC = window.AudioContext || window.webkitAudioContext;
    this._ctx = (window._beAudioCtx && window._beAudioCtx.state !== 'closed')
      ? window._beAudioCtx
      : new AC();
    if (this._ctx.state === 'suspended') {
      try { await this._ctx.resume(); } catch(e) {}
    }

    this._masterGain = this._ctx.createGain();
    this._masterGain.connect(this._ctx.destination);
    this._phaseGain = this._ctx.createGain();
    this._phaseGain.connect(this._masterGain);

    this._volume = config ? config.volume : 0.5;
    this._muted  = config ? config.muted  : false;
    this._applyVolume();
    this._initialized = true;

    if (config) await this._preloadBuffers(config);
  }

  async _preloadBuffers(config) {
    const promises = [];
    for (const phaseName of PHASE_ORDER) {
      const ph = config.phases[phaseName];
      if (ph && ph.audioUrl) {
        const p = fetch(ph.audioUrl)
          .then(r => r.arrayBuffer())
          .then(ab => this._ctx.decodeAudioData(ab))
          .then(buf => { this._buffers.set(phaseName, buf); })
          .catch(() => {});
        this._bufferPromises.set(phaseName, p);
        promises.push(p);
      }
    }
    await Promise.all(promises);
  }

  _applyVolume() {
    if (!this._masterGain) return;
    const v = this._muted ? 0 : Math.max(0, Math.min(1, this._volume));
    this._masterGain.gain.setTargetAtTime(v, this._ctx.currentTime, 0.05);
  }

  setVolume(v) { this._volume = v; this._applyVolume(); }
  setMuted(m)  { this._muted  = m; this._applyVolume(); }

  /* Bip court pour le décompte — freq en Hz, dur en secondes */
  playBeep(freq, dur) {
    if (!this._initialized || this._muted) return;
    const ctx = this._ctx;
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type      = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(this._volume * 0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.02);
    this._nodes.push(osc);
  }

  stopAll() {
    for (const n of this._nodes) {
      try { n.stop(); } catch(e) {}
      try { n.disconnect(); } catch(e) {}
    }
    this._nodes = [];
    if (this._phaseGain) {
      this._phaseGain.gain.cancelScheduledValues(this._ctx.currentTime);
      this._phaseGain.gain.setValueAtTime(0.0001, this._ctx.currentTime);
    }
  }

  playPhase(phaseName, durationSec, phaseConfig) {
    if (!this._initialized) return;
    this.stopAll();
    if (phaseConfig && phaseConfig.silent) return;
    const buf = this._buffers.get(phaseName);
    if (buf) {
      this._playBuffer(buf, durationSec);
    } else {
      this._synthesize(phaseName, durationSec);
    }
  }

  _playBuffer(buffer, durationSec) {
    const ctx = this._ctx;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop   = true;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, ctx.currentTime);
    const fadeStart = ctx.currentTime + Math.max(0, durationSec - 1.5);
    gain.gain.setValueAtTime(1, fadeStart);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSec);
    src.connect(gain);
    gain.connect(this._phaseGain);
    src.start(ctx.currentTime);
    src.stop(ctx.currentTime + durationSec + 0.1);
    this._nodes.push(src);
  }

  _synthesize(phaseName, durationSec) {
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const end = now + durationSec;
    switch (phaseName) {
      case 'preparation': this._synthPreparation(ctx, now, end, durationSec); break;
      case 'inhale':      this._synthInhale(ctx, now, end, durationSec);      break;
      case 'holdFull':    this._synthHoldFull(ctx, now, end, durationSec);    break;
      case 'exhale':      this._synthExhale(ctx, now, end, durationSec);      break;
      case 'holdEmpty':   this._synthHoldEmpty(ctx, now, end, durationSec);   break;
      case 'recovery':    this._synthRecovery(ctx, now, end, durationSec);    break;
    }
  }

  _createOsc(ctx, type, freq) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.value = freq;
    return o;
  }
  _createGainEnv(ctx, startVal) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(startVal, ctx.currentTime);
    return g;
  }

  _synthPreparation(ctx, now, end, dur) {
    const osc  = this._createOsc(ctx, 'sine', 55);
    const gain = this._createGainEnv(ctx, 0.0001);
    gain.gain.linearRampToValueAtTime(0.04, now + Math.min(2, dur * 0.4));
    gain.gain.setValueAtTime(0.04, end - 1);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain); gain.connect(this._phaseGain);
    osc.start(now); osc.stop(end + 0.05);
    this._nodes.push(osc);
  }

  _synthInhale(ctx, now, end, dur) {
    const s = 82, e2 = 164;
    const osc1 = this._createOsc(ctx, 'sine', s);
    osc1.frequency.exponentialRampToValueAtTime(e2, end);
    const g1 = this._createGainEnv(ctx, 0.0001);
    const at = Math.min(1.2, dur * 0.25);
    g1.gain.linearRampToValueAtTime(0.6, now + at);
    g1.gain.setValueAtTime(0.6, end - 0.3);
    g1.gain.exponentialRampToValueAtTime(0.0001, end + 0.05);

    const osc2 = this._createOsc(ctx, 'sine', s * 2);
    osc2.frequency.exponentialRampToValueAtTime(e2 * 2, end);
    const g2 = this._createGainEnv(ctx, 0.0001);
    g2.gain.linearRampToValueAtTime(0.15, now + at);
    g2.gain.setValueAtTime(0.15, end - 0.3);
    g2.gain.exponentialRampToValueAtTime(0.0001, end + 0.05);

    const osc3 = this._createOsc(ctx, 'sine', s * 3);
    osc3.frequency.exponentialRampToValueAtTime(e2 * 3, end);
    const g3 = this._createGainEnv(ctx, 0.0001);
    g3.gain.linearRampToValueAtTime(0.06, now + at);
    g3.gain.setValueAtTime(0.06, end - 0.3);
    g3.gain.exponentialRampToValueAtTime(0.0001, end + 0.05);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.8;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.5;
    lfo.connect(lfoGain); lfoGain.connect(osc1.frequency);
    lfo.start(now); lfo.stop(end + 0.05);

    for (const [osc, g] of [[osc1,g1],[osc2,g2],[osc3,g3]]) {
      osc.connect(g); g.connect(this._phaseGain);
      osc.start(now); osc.stop(end + 0.05);
    }
    this._nodes.push(osc1, osc2, osc3, lfo);
  }

  _synthHoldFull(ctx, now, end, dur) {
    const freq = 164;
    const osc1 = this._createOsc(ctx, 'sine', freq);
    const g1   = this._createGainEnv(ctx, 0.55);
    g1.gain.exponentialRampToValueAtTime(0.25, end - 0.3);
    g1.gain.exponentialRampToValueAtTime(0.0001, end);
    const osc2 = this._createOsc(ctx, 'sine', freq * 2);
    const g2   = this._createGainEnv(ctx, 0.13);
    g2.gain.exponentialRampToValueAtTime(0.04, end);
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.3;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.018;
    lfo.connect(lfoG); lfoG.connect(g1.gain);
    lfo.start(now); lfo.stop(end + 0.05);
    for (const [osc, g] of [[osc1,g1],[osc2,g2]]) {
      osc.connect(g); g.connect(this._phaseGain);
      osc.start(now); osc.stop(end + 0.05);
    }
    this._nodes.push(osc1, osc2, lfo);
  }

  _synthExhale(ctx, now, end, dur) {
    const s = 164, e2 = 82;
    const osc1 = this._createOsc(ctx, 'sine', s);
    osc1.frequency.exponentialRampToValueAtTime(e2, end);
    const g1 = this._createGainEnv(ctx, 0.55);
    g1.gain.setValueAtTime(0.55, now + 0.1);
    g1.gain.linearRampToValueAtTime(0.33, end - 0.3);
    g1.gain.exponentialRampToValueAtTime(0.0001, end);
    const osc2 = this._createOsc(ctx, 'sine', s * 2);
    osc2.frequency.exponentialRampToValueAtTime(e2 * 2, end);
    const g2 = this._createGainEnv(ctx, 0.12);
    g2.gain.exponentialRampToValueAtTime(0.0001, end);
    const osc3 = this._createOsc(ctx, 'sine', s * 3);
    osc3.frequency.exponentialRampToValueAtTime(e2 * 3, end);
    const g3 = this._createGainEnv(ctx, 0.10);
    g3.gain.exponentialRampToValueAtTime(0.0001, end);
    for (const [osc, g] of [[osc1,g1],[osc2,g2],[osc3,g3]]) {
      osc.connect(g); g.connect(this._phaseGain);
      osc.start(now); osc.stop(end + 0.05);
    }
    this._nodes.push(osc1, osc2, osc3);
  }

  _synthHoldEmpty(ctx, now, end, dur) {
    const osc  = this._createOsc(ctx, 'sine', 65);
    const gain = this._createGainEnv(ctx, 0.0001);
    gain.gain.linearRampToValueAtTime(0.12, now + Math.min(1.5, dur * 0.3));
    gain.gain.setValueAtTime(0.12, end - 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain); gain.connect(this._phaseGain);
    osc.start(now); osc.stop(end + 0.05);
    this._nodes.push(osc);
  }

  _synthRecovery(ctx, now, end, dur) {
    const osc  = this._createOsc(ctx, 'sine', 110);
    const gain = this._createGainEnv(ctx, 0.0001);
    gain.gain.linearRampToValueAtTime(0.18, now + Math.min(2, dur * 0.4));
    gain.gain.setValueAtTime(0.18, end - 1.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain); gain.connect(this._phaseGain);
    osc.start(now); osc.stop(end + 0.05);
    this._nodes.push(osc);
  }

  destroy() {
    this.stopAll();
    // Ne pas fermer le contexte partagé (_beAudioCtx) — iOS ne peut pas en recréer un sans tap
    if (this._ctx && this._ctx !== window._beAudioCtx) {
      this._ctx.close();
    }
    this._ctx = null;
    this._buffers.clear();
    this._bufferPromises.clear();
    this._initialized = false;
  }
}

/* ============================================================
   [4] ANIMATION ENGINE
   ============================================================ */
class AnimationEngine {
  constructor(canvas) {
    this._canvas  = canvas;
    this._ctx     = canvas.getContext('2d');
    this._dpr     = Math.min(window.devicePixelRatio || 1, 2); // cap à 2 pour perf mobile
    this._size    = 0;
    this._cx      = 0;
    this._cy      = 0;
    this._baseR   = 0;
    // iOS Safari/Chrome ne supporte pas ctx.filter — détection à la construction
    this._hasFilter = typeof this._ctx.filter !== 'undefined';

    this._scale        = 1.0;
    this._hue          = 215;
    this._sat          = 45;
    this._lit          = 32;
    this._startScale   = 1.0;
    this._targetScale  = 1.0;
    this._previousPhase = null;
    this._startHue     = 215;
    this._targetHue    = 215;
    this._startSat     = 45;
    this._targetSat    = 45;
    this._startLit     = 32;
    this._targetLit    = 32;
    this._phaseEasing  = 'cubicInOut';
    this._pulsePhase   = 0;
    this._pulseAmp     = 0;
    this._pulseFreq    = 0;
    this._wave         = null;
    this._bgColor      = '#000000';
    this._arcMode      = 'draw';   // 'draw' = horaire croissant | 'erase' = anti-horaire décroissant

    this._countdown    = null;     // null = caché | number = affiché au centre
    this._cycleText    = null;     // null = caché | string = affiché sous le décompte

    this._resize();
    this._ro = new ResizeObserver(() => {
      this._resize();
      // Si le moteur n'est pas en train de tourner, redessiner l'idle après resize
      if (!this._rafId) this.renderIdle();
    });
    this._ro.observe(canvas.parentElement || document.body);
  }

  _resize() {
    const parent = this._canvas.parentElement || document.body;
    const rect   = parent.getBoundingClientRect();
    const w = Math.max(rect.width,  200);
    // iOS : aspect-ratio peut donner height=0, fallback sur width
    const h = Math.max(rect.height > 10 ? rect.height : rect.width, 200);
    this._canvas.width  = w * this._dpr;
    this._canvas.height = h * this._dpr;
    this._ctx.scale(this._dpr, this._dpr);
    this._size  = Math.min(w, h);
    this._cx    = w / 2;
    this._cy    = h / 2;
    this._baseR = this._size * 0.22;
  }

  setBackground(color) { this._bgColor = color; }

  setCountdown(seconds) { this._countdown = seconds; }
  setCycleText(str)     { this._cycleText  = str; }
  clearHUD()            { this._countdown = null; this._cycleText = null; }

  // Prépare l'orbe en taille 1, sans arc — pour countdown et voix de départ
  setReadyState() {
    this._scale       = 1.0;
    this._startScale  = 1.0;
    this._targetScale = 1.0;
    this._arcMode     = 'none';
    this._pulseAmp    = 0;
    this._wave        = null;
  }

  setPhaseTarget(phaseName, phaseConfig, colorConfig, phaseIndexInCycle) {
    const c = (colorConfig && colorConfig[phaseName]) || {};

    this._startScale = this._scale;
    this._startHue   = this._hue;
    this._startSat   = this._sat;
    this._startLit   = this._lit;

    // Taille 1 (base) = 1.0   — idle / preparation / début
    // Taille 2 (+27.5%) = 1.275 — inhale max, holdFull
    // Taille 3 (-25%) = 0.75  — exhale max, holdEmpty, recovery (+30% vs ancien 0.575)
    switch (phaseName) {
      case 'preparation':
        this._targetScale = 1.0;
        this._pulseAmp = 0; this._pulseFreq = 0;
        break;
      case 'inhale':
        this._targetScale = 1.275;
        this._pulseAmp = 0; this._pulseFreq = 0;
        break;
      case 'holdFull':
        this._targetScale = 1.275;
        this._pulseAmp = 0.013; this._pulseFreq = 0.4;
        break;
      case 'exhale':
        this._targetScale = 0.75;
        this._pulseAmp = 0; this._pulseFreq = 0;
        break;
      case 'holdEmpty':
        this._targetScale = 0.75;
        this._pulseAmp = 0.008; this._pulseFreq = 0.25;
        break;
      case 'recovery':
        this._targetScale = 0.75;
        this._pulseAmp = 0.008; this._pulseFreq = 0.25;
        break;
    }

    this._targetHue = c.hue        !== undefined ? c.hue        : 200;
    this._targetSat = c.saturation !== undefined ? c.saturation : 45;
    this._targetLit = c.lightness  !== undefined ? c.lightness  : 40;
    this._phaseEasing = (phaseConfig && phaseConfig.easing) || 'cubicInOut';
    this._previousPhase = phaseName;

    // Pas d'arc pendant la preparation
    // arcIndex est déjà calculé sans la preparation par le sequencer
    if (phaseName === 'preparation') {
      this._arcMode = 'none';
    } else {
      this._arcMode = (phaseIndexInCycle % 2 === 0) ? 'draw' : 'erase';
    }

    if (phaseName !== 'preparation') {
      this._wave = { progress: 0, hue: this._targetHue, sat: this._targetSat, lit: this._targetLit };
    }
  }

  triggerWave() {
    this._wave = { progress: 0, hue: this._hue, sat: this._sat, lit: this._lit };
  }

  render(progress, phaseProgress, totalElapsed) {
    const ctx = this._ctx;
    const w   = this._canvas.width  / this._dpr;
    const h   = this._canvas.height / this._dpr;

    const p      = EasingLib.clamp(progress, 0, 1);
    const easeFn = EasingLib.get(this._phaseEasing);
    const ep     = easeFn(p);                        // pour la scale (suit l'easing de la phase)
    const cp     = EasingLib.sineInOut(p);           // pour les couleurs : toujours doux, toute la durée

    this._scale = EasingLib.lerp(this._startScale, this._targetScale, ep);
    this._hue   = EasingLib.lerpAngle(this._startHue, this._targetHue, cp);
    this._sat   = EasingLib.lerp(this._startSat, this._targetSat, cp);
    this._lit   = EasingLib.lerp(this._startLit, this._targetLit, cp);

    if (this._pulseAmp > 0) {
      this._pulsePhase += (Math.PI * 2 * this._pulseFreq) / 60;
      this._scale += Math.sin(this._pulsePhase) * this._pulseAmp;
    }

    const r = this._baseR * this._scale;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this._bgColor;
    ctx.fillRect(0, 0, w, h);

    const hsl0 = `hsla(${this._hue},${this._sat}%,${this._lit + 10}%,0)`;

    if (this._hasFilter) {
      ctx.save();
      ctx.filter = 'blur(18px)';
      const glow1 = ctx.createRadialGradient(this._cx, this._cy, r * 0.5, this._cx, this._cy, r * 3.8);
      glow1.addColorStop(0, `hsla(${this._hue},${this._sat}%,${this._lit}%,0.10)`);
      glow1.addColorStop(1, hsl0);
      ctx.fillStyle = glow1; ctx.fillRect(0, 0, w, h);
      const glow2 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 2.2);
      glow2.addColorStop(0, `hsla(${this._hue},${Math.min(100,this._sat+10)}%,${this._lit+15}%,0.14)`);
      glow2.addColorStop(1, hsl0);
      ctx.fillStyle = glow2; ctx.fillRect(0, 0, w, h);
      const glow3 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 1.4);
      glow3.addColorStop(0, `hsla(${this._hue},${Math.min(100,this._sat+20)}%,${this._lit+22}%,0.18)`);
      glow3.addColorStop(1, hsl0);
      ctx.fillStyle = glow3; ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else {
      // iOS fallback : glows via gradients sans blur
      const glow1 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 3.8);
      glow1.addColorStop(0,   `hsla(${this._hue},${this._sat}%,${this._lit}%,0.12)`);
      glow1.addColorStop(0.5, `hsla(${this._hue},${this._sat}%,${this._lit}%,0.05)`);
      glow1.addColorStop(1,   hsl0);
      ctx.fillStyle = glow1; ctx.fillRect(0, 0, w, h);
      const glow2 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 2.0);
      glow2.addColorStop(0,   `hsla(${this._hue},${Math.min(100,this._sat+10)}%,${this._lit+15}%,0.16)`);
      glow2.addColorStop(1,   hsl0);
      ctx.fillStyle = glow2; ctx.fillRect(0, 0, w, h);
    }

    const bodyGrad = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r);
    bodyGrad.addColorStop(0,    `hsla(${this._hue},${Math.min(100,this._sat+15)}%,${Math.min(100,this._lit+18)}%,0.92)`);
    bodyGrad.addColorStop(0.55, `hsla(${this._hue},${this._sat}%,${this._lit}%,0.85)`);
    bodyGrad.addColorStop(1,    `hsla(${this._hue},${this._sat}%,${this._lit}%,0)`);
    ctx.beginPath();
    ctx.arc(this._cx, this._cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad; ctx.fill();

    // Arc de progression
    // Mode 'draw'  : arc grandit dans le sens horaire  (0 → complet)
    // Mode 'erase' : arc rétrécit dans le sens anti-horaire (complet → 0)
    //   → on garde le segment restant en dessinant de arcStart courant jusqu'à 12h + 2π
    const arcR = r - 4;
    const TWO_PI = Math.PI * 2;
    const TOP    = -Math.PI / 2;          // 12 heures

    if (this._arcMode === 'draw') {
      // phaseProgress 0→1 : arc de TOP jusqu'à TOP + progress*2π
      if (phaseProgress > 0) {
        const arcEnd = TOP + TWO_PI * phaseProgress;
        ctx.beginPath();
        ctx.arc(this._cx, this._cy, arcR, TOP, arcEnd);
        ctx.strokeStyle = `hsla(${this._hue},100%,88%,0.75)`;
        ctx.lineWidth   = 8;
        ctx.lineCap     = 'round';
        ctx.stroke();
      }
    } else if (this._arcMode === 'erase') {
      // Mode 'erase' : phaseProgress 0→1 : arc de (TOP + progress*2π) jusqu'à TOP+2π
      // quand progress=0 → arc complet ; quand progress=1 → arc vide
      if (phaseProgress < 1) {
        const arcStart = TOP + TWO_PI * phaseProgress;
        const arcEnd   = TOP + TWO_PI;
        ctx.beginPath();
        ctx.arc(this._cx, this._cy, arcR, arcStart, arcEnd);
        ctx.strokeStyle = `hsla(${this._hue},100%,88%,0.75)`;
        ctx.lineWidth   = 8;
        ctx.lineCap     = 'round';
        ctx.stroke();
      }
    }
    // Mode 'none' (preparation) : pas d'arc

    // HUD canvas : décompte au centre du globe + numéro de cycle en dessous
    if (this._countdown !== null) {
      const sec = Math.ceil(this._countdown);
      const fontSize = Math.round(this._baseR * 0.72);
      ctx.save();
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = `100 ${fontSize}px 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle    = `rgba(255,255,255,0.90)`;
      ctx.fillText(sec > 0 ? String(sec) : '', this._cx, this._cy);
      ctx.restore();
    }

    if (this._cycleText !== null) {
      const cycFontSize = Math.round(this._baseR * 0.22);
      ctx.save();
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'top';
      ctx.font         = `300 ${cycFontSize}px 'Helvetica Neue', Arial, sans-serif`;
      ctx.fillStyle    = `rgba(255,255,255,0.40)`;
      ctx.fillText(this._cycleText, this._cx, this._cy + this._baseR * 0.44);
      ctx.restore();
    }

    if (this._wave) {
      this._wave.progress += 0.0096; // -20% vitesse → +20% durée visible
      const wp = this._wave.progress;
      if (wp >= 1) {
        this._wave = null;
      } else {
        const wEase   = 1 - Math.pow(1 - wp, 2);
        const maxR    = r * 1.22;
        const wRadius = r + (maxR - r) * wEase;
        const wAlpha  = Math.pow(1 - wp, 1.4) * 0.42; // décroissance plus douce, plus lumineux
        const wWidth  = 1.5 + (1 - wp) * 2.5;
        const wBlur   = wp * 20;
        // La wave suit la couleur courante de l'orbe (this._hue/sat/lit)
        ctx.save();
        if (this._hasFilter) ctx.filter = `blur(${wBlur.toFixed(1)}px)`;
        ctx.beginPath();
        ctx.arc(this._cx, this._cy, wRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${this._hue},${Math.min(100,this._sat+10)}%,${Math.min(100,this._lit+25)}%,${wAlpha.toFixed(3)})`;
        ctx.lineWidth   = wWidth;
        ctx.stroke();
        if (this._hasFilter) ctx.filter = 'none';
        ctx.restore();
      }
    }

  }

  renderIdle() {
    // Rendu identique à render() à progress=0 — pas de saut visuel au démarrage
    const ctx = this._ctx;
    const w = this._canvas.width  / this._dpr;
    const h = this._canvas.height / this._dpr;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = this._bgColor;
    ctx.fillRect(0, 0, w, h);

    const r    = this._baseR * this._scale;
    const hue  = this._hue;
    const sat  = this._sat;
    const lit  = this._lit;
    const hsl0 = `hsla(${hue},${sat}%,${lit + 10}%,0)`;

    if (this._hasFilter) {
      ctx.save();
      ctx.filter = 'blur(18px)';
      const glow1 = ctx.createRadialGradient(this._cx, this._cy, r * 0.5, this._cx, this._cy, r * 3.8);
      glow1.addColorStop(0, `hsla(${hue},${sat}%,${lit}%,0.10)`);
      glow1.addColorStop(1, hsl0);
      ctx.fillStyle = glow1; ctx.fillRect(0, 0, w, h);
      const glow2 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 2.2);
      glow2.addColorStop(0, `hsla(${hue},${Math.min(100,sat+10)}%,${lit+15}%,0.14)`);
      glow2.addColorStop(1, hsl0);
      ctx.fillStyle = glow2; ctx.fillRect(0, 0, w, h);
      const glow3 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 1.4);
      glow3.addColorStop(0, `hsla(${hue},${Math.min(100,sat+20)}%,${lit+22}%,0.18)`);
      glow3.addColorStop(1, hsl0);
      ctx.fillStyle = glow3; ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } else {
      const glow1 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 3.8);
      glow1.addColorStop(0,   `hsla(${hue},${sat}%,${lit}%,0.12)`);
      glow1.addColorStop(0.5, `hsla(${hue},${sat}%,${lit}%,0.05)`);
      glow1.addColorStop(1,   hsl0);
      ctx.fillStyle = glow1; ctx.fillRect(0, 0, w, h);
      const glow2 = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r * 2.0);
      glow2.addColorStop(0, `hsla(${hue},${Math.min(100,sat+10)}%,${lit+15}%,0.16)`);
      glow2.addColorStop(1, hsl0);
      ctx.fillStyle = glow2; ctx.fillRect(0, 0, w, h);
    }

    const bodyGrad = ctx.createRadialGradient(this._cx, this._cy, 0, this._cx, this._cy, r);
    bodyGrad.addColorStop(0,    `hsla(${hue},${Math.min(100,sat+15)}%,${Math.min(100,lit+18)}%,0.92)`);
    bodyGrad.addColorStop(0.55, `hsla(${hue},${sat}%,${lit}%,0.85)`);
    bodyGrad.addColorStop(1,    `hsla(${hue},${sat}%,${lit}%,0)`);
    ctx.beginPath();
    ctx.arc(this._cx, this._cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad; ctx.fill();
  }

  destroy() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }
}

/* ============================================================
   [5] PHASE SEQUENCER
   ============================================================ */
class PhaseSequencer {
  constructor(audioEngine, animEngine) {
    this._audio  = audioEngine;
    this._anim   = animEngine;
    this._overlayEl = null;  // set via setOverlay()

    this._state  = 'idle';
    this._config = null;
    this._enabledPhases = [];
    this._rafId         = null;
    this._cdRafId       = null;
    this._phaseIndex    = 0;
    this._cycle         = 0;
    this._phaseStartTime    = 0;
    this._phasePausedMs     = 0;
    this._pauseStartTime    = 0;
    this._exerciseStartTime = 0;
    this._exercisePausedMs  = 0;
    this._lastRafTime   = 0;
    this._tabHiddenTime = 0;

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this._onVisibilityChange);
  }

  setOverlay(overlayEl) {
    this._overlayEl = overlayEl;
  }

  configure(config) {
    this._config = config;
    this._enabledPhases = PHASE_ORDER.filter(n => {
      const p = config.phases[n];
      return p && p.enabled && p.duration > 0;
    });
  }

  start() {
    if (this._state !== 'idle' && this._state !== 'completed') this.stop();
    this._phaseIndex       = 0;
    this._cycle            = 0;
    this._exercisePausedMs = 0;
    const cd = this._config && this._config.countdownDuration > 0
      ? this._config.countdownDuration : 0;
    if (cd > 0) {
      this._beginCountdown(cd);
    } else {
      this._beginExercise();
    }
  }

  stop() {
    this._cancelCdRaf();
    this._cancelRaf();
    this._audio.stopAll();
    this._state = 'idle';
    this._hideOverlay();
    this._anim.clearHUD();
    this._anim.renderIdle();
    this._updateOverlayText('', '');
  }

  pause() {
    if (this._state !== 'running') return;
    this._cancelRaf();
    this._pauseStartTime = performance.now();
    this._audio.stopAll();
    this._state = 'paused';
  }

  resume() {
    if (this._state !== 'paused') return;
    const delta = performance.now() - this._pauseStartTime;
    this._phasePausedMs    += delta;
    this._exercisePausedMs += delta;
    this._state = 'running';
    const ph       = this._enabledPhases[this._phaseIndex];
    const phConfig = this._config.phases[ph];
    const elapsed  = (performance.now() - this._phaseStartTime - this._phasePausedMs) / 1000;
    const remaining = phConfig.duration - elapsed;
    if (remaining > 0.2) this._audio.playPhase(ph, remaining, phConfig);
    this._scheduleRaf();
  }

  skip() {
    if (this._state !== 'running' && this._state !== 'paused') return;
    if (this._state === 'paused') this.resume();
    this._advancePhase();
  }

  getCurrentState() {
    const now = performance.now();
    let phaseProgress = 0, phaseElapsed = 0, phaseDuration = 0;
    if (this._state === 'running' || this._state === 'paused') {
      const elapsed = now - this._phaseStartTime - this._phasePausedMs;
      const ph  = this._enabledPhases[this._phaseIndex];
      const dur = this._config ? (this._config.phases[ph] || {}).duration || 0 : 0;
      phaseDuration = dur;
      phaseElapsed  = Math.min(elapsed / 1000, dur);
      phaseProgress = EasingLib.clamp(elapsed / (dur * 1000), 0, 1);
    }
    const totalElapsed = (this._state === 'running' || this._state === 'paused')
      ? (now - this._exerciseStartTime - this._exercisePausedMs) / 1000 : 0;
    return {
      state:          this._state,
      phaseIndex:     this._phaseIndex,
      phaseName:      this._enabledPhases[this._phaseIndex] || '',
      phaseProgress,
      phaseElapsed,
      phaseRemaining: Math.max(0, phaseDuration - phaseElapsed),
      cycle:          this._cycle + 1,
      totalCycles:    this._config ? this._config.totalCycles : 0,
      totalElapsed,
    };
  }

  /* ---- Private ---- */

  _q(cls) {
    return this._overlayEl ? this._overlayEl.querySelector('.' + cls) : document.getElementById('be-' + cls.replace('-',''));
  }

  _beginCountdown(durationSec) {
    this._state = 'countdown';
    this._anim.setBackground(this._config.backgroundColor);
    // Globe taille 1, sans arc, sans wave
    this._anim.setReadyState();
    this._updateOverlayLabel('Prêt');
    this._showOverlay();
    const startTime = performance.now();
    const totalMs   = durationSec * 1000;
    let lastBeepSec = -1;   // évite les bips en double

    const loop = (now) => {
      if (this._state !== 'countdown') return;
      const elapsed   = now - startTime;
      const remaining = Math.max(0, (totalMs - elapsed) / 1000);

      // Bip à chaque seconde entière (ex: 5.0, 4.0, 3.0, 2.0, 1.0)
      const sec = Math.ceil(remaining);
      if (sec !== lastBeepSec && remaining > 0.05) {
        lastBeepSec = sec;
        // Son : bip grave pour 5/4/3, bip aigu pour 2/1
        if (sec <= 2) {
          this._audio.playBeep(880, 0.12);   // 2, 1 → aigu, court
        } else {
          this._audio.playBeep(440, 0.18);   // 5, 4, 3 → grave, un peu plus long
        }
      }

      // Affichage visuel : seulement pour 3 et au-dessus
      if (remaining > 2.0) {
        this._anim.setCountdown(remaining);
      } else {
        this._anim.setCountdown(null);  // 2, 1 → on efface le chiffre
      }

      // render() avec progress=0 : globe fixe taille 1, pas d'arc
      this._anim.render(0, 0, 0);
      if (this._config.onCountdownTick) this._config.onCountdownTick(remaining);
      if (elapsed >= totalMs - 16) {
        this._anim.clearHUD();
        this._beginExercise();
        return;
      }
      this._cdRafId = requestAnimationFrame(loop);
    };
    this._cdRafId = requestAnimationFrame(loop);
  }

  _cancelCdRaf() {
    if (this._cdRafId) { cancelAnimationFrame(this._cdRafId); this._cdRafId = null; }
  }

  _beginExercise() {
    this._state             = 'running';
    this._exerciseStartTime = performance.now();
    this._exercisePausedMs  = 0;
    this._showOverlay();
    this._startPhase(0);
    this._scheduleRaf();
  }

  _startPhase(index) {
    this._phaseIndex     = index;
    this._phaseStartTime = performance.now();
    this._phasePausedMs  = 0;
    this._pulsePhase     = 0;

    const phaseName = this._enabledPhases[index];
    const phConfig  = this._config.phases[phaseName];
    const colorCfg  = this._config.colors;

    // arcIndex : index sans compter la preparation, pour que phase1=0(draw), phase2=1(erase)…
    const prepOffset = this._enabledPhases[0] === 'preparation' ? 1 : 0;
    const arcIndex = index - prepOffset;
    this._anim.setPhaseTarget(phaseName, phConfig, colorCfg, arcIndex);
    this._audio.playPhase(phaseName, phConfig.duration, phConfig);
    this._updateOverlayLabel(phConfig.label || phaseName);

    if (this._config.onPhaseChange) this._config.onPhaseChange(phaseName, phConfig.duration);
  }

  _scheduleRaf() {
    const loop = (now) => {
      if (this._state !== 'running') return;
      this._lastRafTime = now;
      const phaseName = this._enabledPhases[this._phaseIndex];
      const phConfig  = this._config.phases[phaseName];
      const durMs     = phConfig.duration * 1000;
      const elapsedMs = now - this._phaseStartTime - this._phasePausedMs;
      const progress  = EasingLib.clamp(elapsedMs / durMs, 0, 1);

      this._anim.render(progress, progress, (now - this._exerciseStartTime - this._exercisePausedMs) / 1000);

      const remaining = Math.max(0, (durMs - elapsedMs) / 1000);
      this._updateTimer(remaining);
      this._anim.setCountdown(remaining);
      const totalCyc = this._config.totalCycles > 0 ? this._config.totalCycles : '∞';
      this._anim.setCycleText(`${this._cycle + 1} / ${totalCyc}`);
      if (this._config.onTick) this._config.onTick(this.getCurrentState());

      if (elapsedMs >= durMs - 16) {
        this._advancePhase();
        if (this._state === 'running') this._rafId = requestAnimationFrame(loop);
        return;
      }
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  _advancePhase() {
    const nextIndex = this._phaseIndex + 1;
    if (nextIndex >= this._enabledPhases.length) {
      this._cycle++;
      if (this._config.onCycleComplete) this._config.onCycleComplete(this._cycle);
      if (this._config.totalCycles > 0 && this._cycle >= this._config.totalCycles) {
        this._complete();
        return;
      }
      this._startPhase(0);
    } else {
      this._startPhase(nextIndex);
    }
  }

  _complete() {
    this._cancelRaf();
    this._audio.stopAll();
    this._state = 'completed';
    this._hideOverlay();
    this._anim.clearHUD();
    this._anim.renderIdle();
    if (this._config.onComplete) this._config.onComplete();
  }

  _cancelRaf() {
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  _showOverlay() {
    const el = this._q('be-phase-label');
    if (el) el.classList.add('be-visible');
  }

  _hideOverlay() {
    const el = this._q('be-phase-label');
    if (el) el.classList.remove('be-visible');
  }

  _updateOverlayLabel(label) {
    const el = this._q('be-phase-label');
    if (el) el.textContent = label;
  }

  _updateTimer(seconds) {
    // Timer désactivé — pas d'affichage de chiffres
  }

  _updateOverlayText(label, timer) {
    const le = this._q('be-phase-label');
    const te = this._q('be-timer');
    if (le) le.textContent = label;
    if (te) te.textContent = timer;
  }

  _onVisibilityChange() {
    if (document.hidden) {
      this._tabHiddenTime = performance.now();
    } else {
      if (this._state === 'running' && this._tabHiddenTime > 0) {
        const hiddenMs = performance.now() - this._tabHiddenTime;
        if (hiddenMs > 2000) {
          this._phasePausedMs    += hiddenMs;
          this._exercisePausedMs += hiddenMs;
        }
        this._tabHiddenTime = 0;
      }
    }
  }

  destroy() {
    this._cancelCdRaf();
    this._cancelRaf();
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
  }
}

/* ============================================================
   [6] BREATH ENGINE CORE
   ============================================================ */
class BreathEngineCore {
  constructor() {
    this._canvas    = null;
    this._overlayEl = null;
    this._audio     = new AudioEngine();
    this._anim      = null;
    this._sequencer = null;
    this._config    = mergeConfig(null);
  }

  /* Attacher le moteur à des éléments DOM existants (React refs, etc.) */
  mount(canvasEl, overlayEl) {
    // Démonter proprement si déjà monté
    if (this._sequencer) this._sequencer.destroy();
    if (this._anim)      this._anim.destroy();

    this._canvas    = canvasEl;
    this._overlayEl = overlayEl || null;

    this._anim      = new AnimationEngine(this._canvas);
    this._sequencer = new PhaseSequencer(this._audio, this._anim);
    this._sequencer.setOverlay(this._overlayEl);
    this._sequencer.configure(this._config);
    this._anim.setBackground(this._config.backgroundColor);
    this._anim.renderIdle();
  }

  configure(userConfig) {
    const wasRunning = this._sequencer && ['running','paused','countdown'].includes(this._sequencer._state);
    if (wasRunning) this._sequencer.stop();
    this._config = mergeConfig(userConfig);
    if (this._sequencer) {
      this._sequencer.configure(this._config);
      this._anim.setBackground(this._config.backgroundColor);
      this._audio.setVolume(this._config.volume);
      this._audio.setMuted(this._config.muted);
      this._anim.renderIdle();
    }
  }

  async init() {
    await this._audio.init(this._config);
  }

  async start() {
    if (!this._sequencer) throw new Error('BreathEngine: appeler mount() avant start()');
    await this._audio.init(this._config);
    this._sequencer.start();
  }

  stop()   { this._sequencer && this._sequencer.stop(); }
  pause()  { this._sequencer && this._sequencer.pause(); }
  resume() { this._sequencer && this._sequencer.resume(); }
  skip()   { this._sequencer && this._sequencer.skip(); }

  reset() {
    if (this._sequencer) this._sequencer.stop();
    if (this._anim) this._anim.renderIdle();
  }

  /* Force un recalcul du canvas (utile quand le container était caché au mount) */
  refresh() {
    if (this._anim) {
      this._anim._resize();
      this._anim.renderIdle();
    }
  }

  setVolume(v) { this._audio.setVolume(v); this._config.volume = v; }
  setMuted(m)  { this._audio.setMuted(m);  this._config.muted  = m; }

  getCurrentState() { return this._sequencer ? this._sequencer.getCurrentState() : null; }

  run(userConfig) {
    return new Promise((resolve) => {
      const cfg = Object.assign({}, userConfig || {}, {
        onComplete: () => {
          if (userConfig && typeof userConfig.onComplete === 'function') userConfig.onComplete();
          resolve();
        }
      });
      this.configure(cfg);
      this.start();
    });
  }

  destroy() {
    if (this._sequencer) this._sequencer.destroy();
    if (this._anim)      this._anim.destroy();
    this._audio.destroy();
  }
}

/* ============================================================
   [7] API BOOTSTRAP — window.BreathEngine
   ============================================================ */
(function() {
  const core = new BreathEngineCore();

  window.BreathEngine = {
    mount(canvasEl, overlayEl) { core.mount(canvasEl, overlayEl); },
    configure(config)          { core.configure(config); },
    init()                     { return core.init(); },
    start()                    { return core.start(); },
    stop()                     { core.stop(); },
    pause()                    { core.pause(); },
    resume()                   { core.resume(); },
    reset()                    { core.reset(); },
    refresh()                  { core.refresh(); },
    skip()                     { core.skip(); },
    setVolume(v)               { core.setVolume(v); },
    setMuted(m)                { core.setMuted(m); },
    getCurrentState()          { return core.getCurrentState(); },
    run(config)                { return core.run(config); },
    destroy()                  { core.destroy(); },
  };

  /* postMessage bridge (iframe mode) */
  if (window !== window.top) {
    const COMMANDS = ['mount','configure','start','stop','pause','resume','reset','skip','setVolume','setMuted'];
    const wrapCallbacks = (cfg) => {
      if (!cfg) return cfg;
      const wrapped = Object.assign({}, cfg);
      for (const cb of ['onPhaseChange','onCycleComplete','onComplete','onTick','onCountdownTick']) {
        const orig = typeof cfg[cb] === 'function' ? cfg[cb] : null;
        wrapped[cb] = (...args) => {
          if (orig) orig(...args);
          try { window.parent.postMessage({ type: 'BE_EVENT', event: cb, data: args }, '*'); } catch(e) {}
        };
      }
      return wrapped;
    };
    window.addEventListener('message', (e) => {
      if (!e.data || e.data.type !== 'BE_COMMAND') return;
      const cmd  = e.data.command;
      const args = e.data.args || [];
      if (!COMMANDS.includes(cmd)) return;
      if (cmd === 'configure') {
        window.BreathEngine.configure(wrapCallbacks(args[0]));
      } else {
        const fn = window.BreathEngine[cmd];
        if (typeof fn === 'function') fn(...args);
      }
      try { e.source.postMessage({ type: 'BE_ACK', command: cmd }, '*'); } catch(err) {}
    });
  }
})();
