/**
 * SoundEngine v1.1 — Unified audio system for DeepBreath app
 *
 * iOS fixes v1.1:
 *   - AudioContext unlock sur touchend + click (capture phase)
 *   - Warmup silencieux sur Safari iOS (buffer 10ms)
 *   - Gestion état 'interrupted' (verrouillage écran iPhone)
 *   - Brown noise : fade in/out sur le buffer pour éviter les clics au loop
 *   - visibilitychange + focus + statechange pour reprise auto
 *   - speechSynthesis : timeout de sécurité réduit (50ms/char), cancel avant reprise
 *   - Création AudioContext différée (jamais avant geste utilisateur)
 */

const SoundEngine = (() => {

    // ─────────────────────────────────────────────────────────────────────────
    // SETTINGS
    // ─────────────────────────────────────────────────────────────────────────
    const STORAGE_KEY = 'soundengine_settings';

    const defaults = {
        oceanVolume:       0.2,
        oceanEnabled:      true,
        breathVolume:      0.4,
        breathEnabled:     true,
        breathTheme:       'zen',
        voiceVolume:       0.5,
        voiceEnabled:      true,
        voiceRate:         0.78,
        voiceRatePct:      78,
        voiceSelectedName: null,
        masterVolume:      1.0,
        duckAmount:        0.35,
    };

    let settings = { ...defaults };

    function saveSettings() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) settings = { ...defaults, ...JSON.parse(raw) };
        } catch (e) {}
    }

    // Synchronise les closures breath/voice depuis settings
    // Appelée après loadSettings() une fois que les layers sont créés
    function _applySettingsToLayers() {
        breath.setVolume(settings.breathVolume);
        breath.setTheme(settings.breathTheme);
        breath.enabled = settings.breathEnabled;
        voice.setVolume(settings.voiceVolume);
        voice.setRate(settings.voiceRate);
        voice.setVoice(settings.voiceSelectedName);
        voice.enabled = settings.voiceEnabled;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUDIO CONTEXT — singleton, créé uniquement après geste utilisateur
    // ─────────────────────────────────────────────────────────────────────────
    let ctx = null;
    let masterGainNode = null;
    let _unlocked = false;
    let _warmDone = false;

    function _createContext() {
        if (ctx) return;
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Partager le contexte avec BreathEngine v4 (iOS : évite un 2e AudioContext suspended)
        window._beAudioCtx = ctx;
        masterGainNode = ctx.createGain();
        masterGainNode.gain.value = settings.masterVolume;
        masterGainNode.connect(ctx.destination);

        // Écoute les changements d'état (iOS : 'interrupted' quand écran verrouillé)
        ctx.addEventListener('statechange', () => {
            if (ctx.state === 'interrupted' || ctx.state === 'suspended') {
                // Sera repris au prochain geste ou visibilitychange
            }
        });
    }

    function getContext() {
        _createContext();
        return ctx;
    }

    async function ensureRunning() {
        _createContext();
        if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
            try { await ctx.resume(); } catch (e) {}
        }
        // Warmup silencieux iOS Safari (une seule fois)
        if (!_warmDone && ctx.state === 'running') {
            _warmDone = true;
            _iosSafariWarmup();
        }
        return ctx;
    }

    // Joue un buffer silencieux 10ms — débloque l'audio sur Safari iOS
    function _iosSafariWarmup() {
        try {
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.01), ctx.sampleRate);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
            src.stop(ctx.currentTime + 0.01);
        } catch (e) {}
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UNLOCK iOS — écoute touchend ET click en phase capture
    // S'autodétruit après le premier unlock réussi
    // ─────────────────────────────────────────────────────────────────────────
    function _setupUnlock() {
        const unlock = async () => {
            if (_unlocked) return;
            _createContext();
            if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
                try { await ctx.resume(); } catch (e) {}
            }
            if (ctx.state === 'running') {
                _unlocked = true;
                _warmDone = true;
                _iosSafariWarmup();
                document.removeEventListener('touchend', unlock, true);
                document.removeEventListener('click',    unlock, true);
            }
        };
        document.addEventListener('touchend', unlock, true);
        document.addEventListener('click',    unlock, true);
    }
    _setupUnlock();

    // Reprise auto sur retour au premier plan
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && ctx) {
            if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
                ctx.resume().catch(() => {});
            }
        }
    });
    window.addEventListener('focus', () => {
        if (ctx && (ctx.state === 'suspended' || ctx.state === 'interrupted')) {
            ctx.resume().catch(() => {});
        }
    });
    // iOS : pageshow se déclenche aussi au retour depuis une autre app
    window.addEventListener('pageshow', () => {
        if (ctx && (ctx.state === 'suspended' || ctx.state === 'interrupted')) {
            ctx.resume().catch(() => {});
        }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // OCEAN LAYER
    // ─────────────────────────────────────────────────────────────────────────
    const ocean = (() => {
        let isPlaying  = false;
        let oceanGain  = null;
        let baseVolume = settings.oceanVolume;
        let nodes      = [];
        let isDucked   = false;

        // Buffer bruit brun avec fade in/out pour éviter les clics au loop iOS
        function createNoiseBuffer() {
            const ac = getContext();
            // 4 secondes pour cacher le point de loop
            const bufferSize = 4 * ac.sampleRate;
            const buf  = ac.createBuffer(1, bufferSize, ac.sampleRate);
            const data = buf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (last + 0.02 * white) / 1.02;
                last = data[i];
                data[i] *= 3.5;
            }
            // Fade 50ms aux deux extrémités pour un loop sans clic
            const fade = Math.floor(ac.sampleRate * 0.05);
            for (let i = 0; i < fade; i++) {
                data[i]                        *= i / fade;
                data[bufferSize - 1 - i]       *= i / fade;
            }
            const src = ac.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            src.loopStart = 0;
            src.loopEnd   = buf.duration;
            return src;
        }

        function createWaveLayer(freq, q, speed, minG, maxG, phase) {
            const ac    = getContext();
            const noise = createNoiseBuffer();
            const filter = ac.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = freq;
            filter.Q.value = q;
            const gain = ac.createGain();
            gain.gain.value = minG;
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(oceanGain);
            noise.start();
            nodes.push({ noise, filter, gain });
            modulateWave(gain, filter, freq, minG, maxG, speed, phase);
        }

        function modulateWave(gainNode, filterNode, baseFreq, minG, maxG, speed, phase) {
            const tick = () => {
                if (!isPlaying) return;
                const ac  = getContext();
                const now = ac.currentTime;
                const dur = speed + Math.random() * speed * 0.3;
                const peak    = maxG * (0.8 + Math.random() * 0.2);
                const safeMin = Math.max(minG, 0.001);

                gainNode.gain.cancelScheduledValues(now);
                gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                gainNode.gain.linearRampToValueAtTime(peak,    now + dur * 0.20);
                gainNode.gain.setValueAtTime(peak,             now + dur * 0.28);
                gainNode.gain.exponentialRampToValueAtTime(safeMin, now + dur * 0.75);
                gainNode.gain.linearRampToValueAtTime(minG,   now + dur * 0.78);
                gainNode.gain.setValueAtTime(minG,             now + dur);

                filterNode.frequency.cancelScheduledValues(now);
                filterNode.frequency.setValueAtTime(filterNode.frequency.value, now);
                filterNode.frequency.linearRampToValueAtTime(baseFreq * 1.4, now + dur * 0.20);
                filterNode.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + dur * 0.75);
                filterNode.frequency.linearRampToValueAtTime(baseFreq,       now + dur);

                setTimeout(tick, dur * 1000);
            };
            setTimeout(tick, phase * 1000);
        }

        function buildSoundscape() {
            const ac = getContext();
            oceanGain = ac.createGain();
            oceanGain.gain.value = 0;
            oceanGain.connect(masterGainNode);

            createWaveLayer(80,   0.5, 8,   0.1,  0.3,  0);
            createWaveLayer(250,  0.8, 6,   0.08, 0.25, 1.5);
            createWaveLayer(800,  1.2, 5,   0.05, 0.15, 3);
            createWaveLayer(2000, 2,   4,   0.02, 0.08, 2);
            createWaveLayer(4000, 3,   3.5, 0.01, 0.04, 4);
            createWaveLayer(400,  0.7, 7,   0.06, 0.18, 5);

            const now = ac.currentTime;
            oceanGain.gain.setValueAtTime(0, now);
            oceanGain.gain.linearRampToValueAtTime(baseVolume, now + 2);
        }

        async function start() {
            if (isPlaying) return;
            await ensureRunning();
            isPlaying = true;
            buildSoundscape();
            settings.oceanEnabled = true;
            saveSettings();
        }

        function stop() {
            if (!isPlaying) return;
            isPlaying = false;
            if (oceanGain && ctx) {
                const now = ctx.currentTime;
                oceanGain.gain.linearRampToValueAtTime(0, now + 1);
                setTimeout(() => {
                    nodes.forEach(({ noise }) => { try { noise.stop(); } catch (e) {} });
                    nodes = [];
                    if (oceanGain) { try { oceanGain.disconnect(); } catch (e) {} oceanGain = null; }
                }, 1500);
            }
            settings.oceanEnabled = false;
            saveSettings();
        }

        function toggle() {
            if (isPlaying) {
                stop();
                return false;
            } else {
                start(); // async — isPlaying sera true après ensureRunning()
                return true;
            }
        }

        function setVolume(val) {
            baseVolume = Math.max(0, Math.min(1, val));
            settings.oceanVolume = baseVolume;
            if (oceanGain && isPlaying && !isDucked) {
                const now = ctx.currentTime;
                oceanGain.gain.cancelScheduledValues(now);
                oceanGain.gain.setValueAtTime(oceanGain.gain.value, now);
                oceanGain.gain.linearRampToValueAtTime(baseVolume, now + 0.3);
            }
            saveSettings();
        }

        function duck(active) {
            if (!oceanGain || !ctx) return;
            isDucked = active;
            const now    = ctx.currentTime;
            const target = active ? baseVolume * settings.duckAmount : baseVolume;
            oceanGain.gain.cancelScheduledValues(now);
            oceanGain.gain.setValueAtTime(oceanGain.gain.value, now);
            oceanGain.gain.linearRampToValueAtTime(target, active ? 0.3 : 0.8);
        }

        return {
            get isPlaying() { return isPlaying; },
            get volume()    { return baseVolume; },
            start, stop, toggle, setVolume, duck
        };
    })();

    // ─────────────────────────────────────────────────────────────────────────
    // BREATH LAYER
    // ─────────────────────────────────────────────────────────────────────────
    const breath = (() => {
        let enabled      = settings.breathEnabled;
        let volume       = settings.breathVolume;
        let theme        = settings.breathTheme;
        let currentNodes = [];
        let currentGain  = null;

        const zenSettings = {
            inhale:    { baseFreq: 82,  endFreq: 123, harmonics: [2,3,5],   harmonicGains: [0.3,0.15,0.05],     filterFreq: 500, attack: 1.5, release: 1.0 },
            exhale:    { baseFreq: 123, endFreq: 82,  harmonics: [2,3,5],   harmonicGains: [0.25,0.12,0.04],    filterFreq: 450, attack: 0.8, release: 1.5 },
            hold:      { baseFreq: 98,  endFreq: 98,  harmonics: [2,3,4,6], harmonicGains: [0.2,0.1,0.06,0.03], filterFreq: 400, attack: 1.0, release: 1.0 },
            holdEmpty: { baseFreq: 65,  endFreq: 65,  harmonics: [2,3,5],   harmonicGains: [0.2,0.08,0.03],     filterFreq: 350, attack: 1.2, release: 1.5 }
        };

        function getZenSettings(phase) {
            switch (phase) {
                case 'inhale':    return zenSettings.inhale;
                case 'exhale':    return zenSettings.exhale;
                case 'hold':
                case 'holdFull':  return zenSettings.hold;
                case 'holdEmpty': return zenSettings.holdEmpty;
                default:          return zenSettings.hold;
            }
        }

        function stopCurrent() {
            currentNodes.forEach(node => {
                try { if (node.stop) node.stop(); } catch (e) {}
                try { if (node.disconnect) node.disconnect(); } catch (e) {}
            });
            currentNodes = [];
            currentGain  = null;
        }

        function fadeOutCurrent() {
            if (currentGain && ctx) {
                const now = ctx.currentTime;
                try {
                    currentGain.gain.cancelScheduledValues(now);
                    currentGain.gain.setValueAtTime(currentGain.gain.value, now);
                    currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
                } catch (e) {}
            }
            const toStop = currentNodes;
            currentNodes = [];
            currentGain  = null;
            setTimeout(() => {
                toStop.forEach(node => { try { if (node.disconnect) node.disconnect(); } catch (e) {} });
            }, 400);
        }

        function playBowlStrike(freq, duration, vol) {
            const ac  = getContext();
            const now = ac.currentTime;
            [
                { mult: 1,   v: vol,        decay: duration       },
                { mult: 2,   v: vol * 0.2,  decay: duration * 0.7 },
                { mult: 3,   v: vol * 0.08, decay: duration * 0.5 }
            ].forEach(({ mult, v, decay }) => {
                const osc  = ac.createOscillator();
                const gain = ac.createGain();
                const filt = ac.createBiquadFilter();
                osc.type = 'sine';
                osc.frequency.value    = freq * mult;
                filt.type              = 'lowpass';
                filt.frequency.value   = freq * mult * 4;
                filt.Q.value           = 0.3;
                osc.connect(filt); filt.connect(gain); gain.connect(masterGainNode);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(v, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(v * 0.6, now + duration * 0.3);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
                osc.start(now); osc.stop(now + decay + 0.1);
            });
        }

        function playZen(phase, duration) {
            stopCurrent();
            const ac  = getContext();
            const s   = getZenSettings(phase);
            const now = ac.currentTime;
            const all = [];

            const safeAttack  = Math.min(s.attack,  duration * 0.4);
            const safeRelease = Math.min(s.release, duration * 0.4);
            const peak = volume * 0.6;

            const osc    = ac.createOscillator();
            const gainN  = ac.createGain();
            const filter = ac.createBiquadFilter();
            const vib    = ac.createOscillator();
            const vibG   = ac.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(s.baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(Math.max(s.endFreq, 20), now + duration);
            filter.type = 'lowpass'; filter.frequency.value = s.filterFreq; filter.Q.value = 0.3;
            vib.frequency.value = 0.8; vibG.gain.value = 0.5;
            vib.connect(vibG); vibG.connect(osc.frequency);
            osc.connect(filter); filter.connect(gainN); gainN.connect(masterGainNode);

            gainN.gain.setValueAtTime(0.0001, now);
            gainN.gain.exponentialRampToValueAtTime(peak, now + safeAttack);
            const sust = duration - safeAttack - safeRelease;
            if (sust > 0) {
                if (phase === 'inhale')      gainN.gain.exponentialRampToValueAtTime(peak * 1.05, now + safeAttack + sust);
                else if (phase === 'exhale') gainN.gain.exponentialRampToValueAtTime(peak * 0.6,  now + safeAttack + sust);
                else                         gainN.gain.setValueAtTime(peak, now + safeAttack + sust);
            }
            gainN.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            vib.start(now); osc.start(now);
            vib.stop(now + duration + 0.5); osc.stop(now + duration + 0.5);
            all.push(osc, vib, gainN, filter, vibG);

            (s.harmonics || [2,3]).forEach((mult, i) => {
                const hOsc  = ac.createOscillator();
                const hGain = ac.createGain();
                const hFilt = ac.createBiquadFilter();
                hOsc.type = 'sine';
                hOsc.frequency.setValueAtTime(s.baseFreq * mult, now);
                hOsc.frequency.exponentialRampToValueAtTime(Math.max(s.endFreq * mult, 20), now + duration);
                hFilt.type = 'lowpass'; hFilt.frequency.value = s.filterFreq * 0.8; hFilt.Q.value = 0.2;
                hOsc.connect(hFilt); hFilt.connect(hGain); hGain.connect(masterGainNode);
                const hVol = peak * (s.harmonicGains[i] || 0.1);
                hGain.gain.setValueAtTime(0.0001, now);
                hGain.gain.exponentialRampToValueAtTime(hVol, now + safeAttack * 1.3);
                hGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);
                hOsc.start(now); hOsc.stop(now + duration + 0.5);
                all.push(hOsc, hGain, hFilt);
            });

            currentNodes = all;
            currentGain  = gainN;
            osc.onended  = () => { currentNodes = []; currentGain = null; };
        }

        function playHarp(phase, duration) {
            stopCurrent();
            const ac  = getContext();
            const now = ac.currentTime;
            const all = [];
            const peak = volume * 0.45;

            const configs = {
                inhale:    { notes: [261.6, 329.6, 392.0, 523.3, 659.3], sustained: false },
                exhale:    { notes: [659.3, 523.3, 392.0, 329.6, 261.6], sustained: false },
                hold:      { notes: [261.6, 329.6, 392.0], sustained: true },
                holdEmpty: { notes: [130.8, 196.0], sustained: true, quiet: true }
            };
            const config = configs[phase] || configs.hold;

            if (config.sustained) {
                const padVol = config.quiet ? peak * 0.3 : peak * 0.5;
                config.notes.forEach((freq, i) => {
                    const osc = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
                    osc.type = 'sine'; osc.frequency.value = freq;
                    f.type = 'lowpass'; f.frequency.value = freq * 3; f.Q.value = 0.2;
                    osc.connect(f); f.connect(g); g.connect(masterGainNode);
                    const nv = padVol / config.notes.length;
                    const atk = Math.min(1.5, duration * 0.3), rel = Math.min(1.5, duration * 0.3);
                    g.gain.setValueAtTime(0.0001, now);
                    g.gain.exponentialRampToValueAtTime(nv, now + atk);
                    g.gain.exponentialRampToValueAtTime(nv * 0.7, now + duration - rel);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
                    osc.start(now); osc.stop(now + duration + 0.5);
                    all.push(osc, g, f);
                    if (i === 0) currentGain = g;
                });
            } else {
                const n = config.notes.length;
                const spread  = Math.min(duration * 0.7, n * 0.4);
                const spacing = spread / n;
                const noteDur = Math.max(1.0, duration * 0.6);
                config.notes.forEach((freq, i) => {
                    const t = now + i * spacing;
                    const osc = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
                    const osc2 = ac.createOscillator(), g2 = ac.createGain();
                    osc.type = 'triangle'; osc.frequency.value = freq;
                    f.type = 'lowpass'; f.frequency.value = freq * 4; f.Q.value = 0.5;
                    osc.connect(f); f.connect(g); g.connect(masterGainNode);
                    const nv = peak * (0.6 - i * 0.05);
                    g.gain.setValueAtTime(0.0001, t);
                    g.gain.exponentialRampToValueAtTime(nv, t + 0.015);
                    g.gain.exponentialRampToValueAtTime(nv * 0.4, t + noteDur * 0.3);
                    g.gain.exponentialRampToValueAtTime(0.0001, t + noteDur);
                    osc2.type = 'sine'; osc2.frequency.value = freq * 2;
                    osc2.connect(g2); g2.connect(masterGainNode);
                    g2.gain.setValueAtTime(0.0001, t);
                    g2.gain.exponentialRampToValueAtTime(nv * 0.15, t + 0.01);
                    g2.gain.exponentialRampToValueAtTime(0.0001, t + noteDur * 0.5);
                    osc.start(t); osc.stop(t + noteDur + 0.1);
                    osc2.start(t); osc2.stop(t + noteDur + 0.1);
                    all.push(osc, g, f, osc2, g2);
                    if (i === 0) currentGain = g;
                });
            }
            currentNodes = all;
            const first = all.find(n => n instanceof OscillatorNode);
            if (first) first.onended = () => { currentNodes = []; currentGain = null; };
        }

        async function playPhase(phase, duration) {
            if (!enabled || volume === 0) return;
            await ensureRunning();
            if (theme === 'harp') playHarp(phase, duration);
            else                  playZen(phase, duration);
        }

        async function playTransition() {
            if (!enabled) return;
            await ensureRunning();
            const ac = getContext(), now = ac.currentTime;
            [1, 2.5].forEach((mult, i) => {
                const osc = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
                osc.type = 'sine'; osc.frequency.value = 131 * mult;
                f.type = 'lowpass'; f.frequency.value = 400; f.Q.value = 0.3;
                osc.connect(f); f.connect(g); g.connect(masterGainNode);
                const v = volume * (i === 0 ? 0.12 : 0.04);
                g.gain.setValueAtTime(0.0001, now);
                g.gain.exponentialRampToValueAtTime(v, now + 0.015);
                g.gain.exponentialRampToValueAtTime(v * 0.4, now + 0.5);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
                osc.start(now); osc.stop(now + 1.6);
            });
        }

        async function playComplete() {
            if (!enabled) return;
            await ensureRunning();
            [65, 98, 165].forEach((freq, i) => {
                setTimeout(() => playBowlStrike(freq, 3.0, volume * 0.25), i * 600);
            });
        }

        async function playSecondInhale() {
            if (!enabled || volume === 0) return;
            await ensureRunning();
            const ac = getContext(), now = ac.currentTime;
            [1, 2, 3].forEach((mult, i) => {
                const osc = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
                osc.type = 'sine'; osc.frequency.value = 330 * mult;
                f.type = 'lowpass'; f.frequency.value = 330 * mult * 3; f.Q.value = 0.3;
                osc.connect(f); f.connect(g); g.connect(masterGainNode);
                const vols = [0.18, 0.07, 0.02], v = volume * vols[i];
                g.gain.setValueAtTime(0.0001, now);
                g.gain.exponentialRampToValueAtTime(v, now + 0.01);
                g.gain.exponentialRampToValueAtTime(v * 0.3, now + 0.25);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
                osc.start(now); osc.stop(now + 0.8);
            });
        }

        async function testSound() {
            await ensureRunning();
            playBowlStrike(174, 1.5, volume * 0.35);
        }

        function setTheme(t)  { if (t === 'zen' || t === 'harp') { theme = t; settings.breathTheme = t; saveSettings(); } }
        function setVolume(v) { volume = Math.max(0, Math.min(1, v)); settings.breathVolume = volume; saveSettings(); }
        function toggle()     { enabled = !enabled; if (!enabled) fadeOutCurrent(); settings.breathEnabled = enabled; saveSettings(); return enabled; }
        function stop()       { fadeOutCurrent(); }

        return {
            get enabled() { return enabled; },
            set enabled(v) { enabled = v; },
            get volume()   { return volume; },
            get theme()    { return theme; },
            playPhase, playTransition, playComplete, playSecondInhale,
            testSound, setTheme, setVolume, toggle, stop, stopCurrent
        };
    })();

    // ─────────────────────────────────────────────────────────────────────────
    // VOICE LAYER
    // ─────────────────────────────────────────────────────────────────────────
    const voice = (() => {
        const synth = window.speechSynthesis;
        let voiceObj          = null;
        let enabled           = settings.voiceEnabled;
        let volume            = settings.voiceVolume;
        let rate              = settings.voiceRate;
        let pitch             = 1.0;
        let speaking          = false;
        let selectedVoiceName = settings.voiceSelectedName;
        let _safetyTimeout    = null;
        let _lastVoiceCount   = 0;
        let onVoicesChanged   = null;

        function loadVoice() {
            if (!synth) return;
            const voices = synth.getVoices();
            const fr = voices.filter(v => v.lang.startsWith('fr'));
            if (selectedVoiceName) {
                const match = fr.find(v => v.name === selectedVoiceName);
                if (match) { voiceObj = match; return; }
            }
            const premium = fr.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced'));
            const audrey  = fr.find(v => v.name.includes('Audrey'));
            const amelie  = fr.find(v => v.name.includes('Ameli'));
            const thomas  = fr.find(v => v.name.includes('Thomas'));
            const local   = fr.find(v => v.localService);
            voiceObj = premium || audrey || amelie || thomas || local || fr[0] || voices[0];
        }

        function pollVoices() {
            let attempts = 0;
            const id = setInterval(() => {
                attempts++;
                const voices = synth ? synth.getVoices() : [];
                if (voices.length !== _lastVoiceCount) {
                    _lastVoiceCount = voices.length;
                    loadVoice();
                    if (onVoicesChanged) onVoicesChanged();
                }
                if (attempts >= 20) clearInterval(id);
            }, 500);
        }

        if (synth) {
            if (synth.onvoiceschanged !== undefined) {
                synth.onvoiceschanged = () => { loadVoice(); if (onVoicesChanged) onVoicesChanged(); };
            }
            loadVoice();
            pollVoices();
        }

        // iOS : speechSynthesis se bloque si l'app va en arrière-plan
        // On cancel au retour en premier plan pour repartir proprement
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && synth && speaking) {
                synth.cancel();
                speaking = false;
                ocean.duck(false);
            }
        });

        function speak(text, onEnd = null) {
            if (!enabled || !synth || !text) {
                if (onEnd) setTimeout(onEnd, 50);
                return;
            }

            // Cancel toute parole en cours (important sur iOS)
            synth.cancel();
            if (_safetyTimeout) { clearTimeout(_safetyTimeout); _safetyTimeout = null; }

            let fired = false;
            const fire = () => {
                if (fired) return;
                fired    = true;
                speaking = false;
                if (_safetyTimeout) { clearTimeout(_safetyTimeout); _safetyTimeout = null; }
                ocean.duck(false);
                if (onEnd) onEnd();
            };

            const utt = new SpeechSynthesisUtterance(text);
            if (voiceObj) utt.voice = voiceObj;
            utt.volume = volume;
            utt.rate   = rate;
            utt.pitch  = pitch;
            utt.lang   = 'fr-FR';

            utt.onstart = () => { speaking = true; ocean.duck(true); };
            utt.onend   = () => fire();
            utt.onerror = (e) => {
                // 'interrupted' est normal sur iOS quand on cancel — ignorer silencieusement
                if (e.error !== 'interrupted' && e.error !== 'canceled') {
                    console.warn('VoiceLayer error:', e.error);
                }
                fire();
            };

            // Petit délai sur iOS pour laisser le cancel précédent se propager
            setTimeout(() => { synth.speak(utt); }, 50);

            // Timeout de sécurité : 50ms/char + 2s de marge (plus précis que 80ms)
            const ms = Math.max(3000, text.length * 50 + 2000);
            _safetyTimeout = setTimeout(() => {
                if (!fired) { synth.cancel(); fire(); }
            }, ms);
        }

        function speakWithDelay(text, delay = 500, onEnd = null) {
            setTimeout(() => speak(text, onEnd), delay);
        }

        function stop() {
            if (_safetyTimeout) { clearTimeout(_safetyTimeout); _safetyTimeout = null; }
            if (synth) { synth.cancel(); speaking = false; }
            ocean.duck(false);
        }

        function pause()  { if (synth && speaking) synth.pause(); }
        function resume() { if (synth) synth.resume(); }

        function toggle()     { enabled = !enabled; if (!enabled) stop(); settings.voiceEnabled = enabled; saveSettings(); return enabled; }
        function setVolume(v) { volume = Math.max(0, Math.min(1, v)); settings.voiceVolume = volume; saveSettings(); }
        function setRate(v)   { rate = Math.max(0.5, Math.min(2, v)); settings.voiceRate = rate; settings.voiceRatePct = Math.round(rate * 100); saveSettings(); }
        function setVoice(n)  { selectedVoiceName = n || null; settings.voiceSelectedName = selectedVoiceName; loadVoice(); saveSettings(); }

        function getAvailableVoices() {
            if (!synth) return [];
            const all  = synth.getVoices();
            const fr   = all.filter(v => v.lang.startsWith('fr'));
            const rest = all.filter(v => !v.lang.startsWith('fr'));
            return [...fr, ...rest];
        }

        function isAvailable() { return 'speechSynthesis' in window; }

        return {
            get enabled()  { return enabled; },
            set enabled(v) { enabled = v; },
            get volume()   { return volume; },
            get rate()     { return rate; },
            get speaking() { return speaking; },
            set onVoicesChanged(fn) { onVoicesChanged = fn; },
            speak, speakWithDelay, stop, pause, resume,
            toggle, setVolume, setRate, setVoice,
            getAvailableVoices, isAvailable, loadVoice
        };
    })();

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────
    async function init() {
        // Ne recharge pas les settings depuis localStorage ici :
        // loadSettings() est déjà appelé au démarrage de l'app (SoundEngine.loadSettings())
        // et les états enabled/volume sont gérés en temps réel par les toggles/sliders.
        // Ré-appeler loadSettings() ici écraserait les changements faits par l'utilisateur
        // entre l'init de l'app et le démarrage de l'exercice.

        await ensureRunning();

        if (settings.oceanEnabled && !ocean.isPlaying) {
            await ocean.start();
        }
    }

    function setMasterVolume(val) {
        settings.masterVolume = Math.max(0, Math.min(1, val));
        if (masterGainNode) masterGainNode.gain.value = settings.masterVolume;
        saveSettings();
    }

    return {
        init,
        ocean,
        breath,
        voice,
        setMasterVolume,
        saveSettings,
        // loadSettings public : charge depuis localStorage ET synchronise les layers
        loadSettings() {
            loadSettings();
            _applySettingsToLayers();
        },
        get context() { return ctx; }
    };

})();

// ─────────────────────────────────────────────────────────────────────────────
// Legacy shims — window.oceanSound / breathSounds / voiceGuide inchangés
// ─────────────────────────────────────────────────────────────────────────────
window.SoundEngine = SoundEngine;

window.oceanSound = {
    get isPlaying()   { return SoundEngine.ocean.isPlaying; },
    start:            () => SoundEngine.ocean.start(),
    stop:             () => SoundEngine.ocean.stop(),
    toggle:           () => SoundEngine.ocean.toggle(),
    setVolume:        (v) => SoundEngine.ocean.setVolume(v),
    getIsPlaying:     () => SoundEngine.ocean.isPlaying
};

window.breathSounds = {
    get enabled()     { return SoundEngine.breath.enabled; },
    set enabled(v)    { SoundEngine.breath.enabled = v; },
    get volume()      { return SoundEngine.breath.volume; },
    get theme()       { return SoundEngine.breath.theme; },
    playPhase:        (p, d) => SoundEngine.breath.playPhase(p, d),
    playTransition:   ()     => SoundEngine.breath.playTransition(),
    playComplete:     ()     => SoundEngine.breath.playComplete(),
    playSecondInhale: ()     => SoundEngine.breath.playSecondInhale(),
    testSound:        ()     => SoundEngine.breath.testSound(),
    setTheme:         (t)    => SoundEngine.breath.setTheme(t),
    setVolume:        (v)    => SoundEngine.breath.setVolume(v),
    getVolume:        ()     => SoundEngine.breath.volume,
    getTheme:         ()     => SoundEngine.breath.theme,
    toggle:           ()     => SoundEngine.breath.toggle(),
    stop:             ()     => SoundEngine.breath.stop(),
    init:             async () => {}
};

window.voiceGuide = {
    get enabled()      { return SoundEngine.voice.enabled; },
    set enabled(v)     { SoundEngine.voice.enabled = v; },
    get speaking()     { return SoundEngine.voice.speaking; },
    get volume()       { return SoundEngine.voice.volume; },
    get rate()         { return SoundEngine.voice.rate; },
    speak:             (t, cb)    => SoundEngine.voice.speak(t, cb),
    speakWithDelay:    (t, d, cb) => SoundEngine.voice.speakWithDelay(t, d, cb),
    stop:              ()         => SoundEngine.voice.stop(),
    pause:             ()         => SoundEngine.voice.pause(),
    resume:            ()         => SoundEngine.voice.resume(),
    toggle:            ()         => SoundEngine.voice.toggle(),
    setVolume:         (v)        => SoundEngine.voice.setVolume(v),
    setRate:           (r)        => SoundEngine.voice.setRate(r),
    setVoice:          (n)        => SoundEngine.voice.setVoice(n),
    loadVoice:         ()         => SoundEngine.voice.loadVoice(),
    isAvailable:       ()         => SoundEngine.voice.isAvailable(),
    getAvailableVoices: ()        => SoundEngine.voice.getAvailableVoices(),
    set onVoicesChanged(fn)       { SoundEngine.voice.onVoicesChanged = fn; }
};
