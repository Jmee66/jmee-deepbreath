/**
 * BreathingEngine — Moteur de respiration autonome
 * Timer précis (requestAnimationFrame + performance.now)
 * Animation Canvas 2D (cercles concentriques style xhalr)
 * Synchronisation son + voix
 *
 * Usage:
 *   const engine = new BreathingEngine(canvas, { soundEngine, voiceEngine });
 *   engine.configure({ phases, totalCycles, ... });
 *   engine.start();
 */

// ============================================================
// CanvasRenderer — rendu visuel Canvas 2D
// ============================================================

class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;

        // Dimensions logiques
        this.width = 0;
        this.height = 0;
        this.cx = 0;   // centre X
        this.cy = 0;   // centre Y
        this.baseRadius = 0;

        // Animation state
        this.scale = 1.0;           // scale courant (interpolé)
        this.prevScale = 1.0;       // scale au début de la phase
        this.targetScale = 1.0;     // scale cible fin de phase
        this.colorHue = 200;        // teinte HSL (bleu)
        this.cycleHueShift = 0;     // shift par cycle
        this.rings = 4;             // nombre de cercles concentriques
        this.pulsePhase = 0;        // pour le subtle pulse pendant hold

        // Thème visuel
        this.theme = 'night';       // 'night' | 'day'

        this.resize();

        // Resize listener
        this._resizeHandler = () => this.resize();
        window.addEventListener('resize', this._resizeHandler);
    }

    resize() {
        const rect = this.canvas.parentElement
            ? this.canvas.parentElement.getBoundingClientRect()
            : { width: 300, height: 300 };

        // Taille carrée basée sur le plus petit côté du container
        const size = Math.min(rect.width, rect.height, 440);

        this.width = size;
        this.height = size;
        this.canvas.width = size * this.dpr;
        this.canvas.height = size * this.dpr;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        this.cx = size / 2;
        this.cy = size / 2;
        this.baseRadius = size * 0.28;  // rayon de base du cercle principal
    }

    /**
     * Appelé à chaque frame par BreathingEngine
     * @param {Object} phase   - { name, action, duration, subText? }
     * @param {number} progress - 0.0 → 1.0 dans la phase courante
     * @param {number} remaining - secondes restantes
     * @param {number} cycle    - cycle courant (1-based)
     * @param {number} totalCycles
     */
    render(phase, progress, remaining, cycle, totalCycles) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Calculer le scale selon l'action
        const eased = this._easeInOutSine(progress);
        this.scale = this.prevScale + (this.targetScale - this.prevScale) * eased;

        // Subtle pulse pendant hold
        if (phase.action === 'hold' || phase.action === 'holdEmpty') {
            this.pulsePhase += 0.03;
            this.scale += Math.sin(this.pulsePhase) * 0.008;
        }

        // Hue shift par cycle (subtle)
        const hue = (this.colorHue + this.cycleHueShift + cycle * 8) % 360;

        // Dessiner les rings (du plus grand au plus petit)
        this._drawRings(ctx, this.scale, hue);

        // Glow
        this._drawGlow(ctx, this.scale, hue);

        // Progress arc
        this._drawProgressArc(ctx, progress, hue);

        // Texte central
        this._drawCenterText(ctx, phase, remaining);
    }

    /**
     * Préparer la transition vers une nouvelle phase
     */
    setPhaseTarget(action) {
        this.prevScale = this.scale;
        this.pulsePhase = 0;

        switch (action) {
            case 'inhale':
                this.targetScale = 1.35;
                break;
            case 'exhale':
                this.targetScale = 0.65;
                break;
            case 'hold':
                this.targetScale = this.scale; // reste où on est
                break;
            case 'holdEmpty':
                this.targetScale = this.scale; // reste où on est
                break;
            default:
                this.targetScale = 1.0;
        }
    }

    // —— Dessin ——

    _drawRings(ctx, scale, hue) {
        for (let i = this.rings - 1; i >= 0; i--) {
            const ringScale = scale * (1 + i * 0.18);  // chaque ring 18% plus grand
            const radius = this.baseRadius * ringScale;
            const alpha = 0.08 + (this.rings - 1 - i) * 0.10; // inner = plus opaque

            // Gradient radial pour chaque ring
            const grad = ctx.createRadialGradient(
                this.cx, this.cy, radius * 0.3,
                this.cx, this.cy, radius
            );

            const sat = 55 + i * 5;
            const light = 50 + i * 3;
            grad.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${alpha * 0.5})`);
            grad.addColorStop(0.7, `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`);
            grad.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);

            ctx.beginPath();
            ctx.arc(this.cx, this.cy, radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // Contour subtil pour le ring intérieur
            if (i === 0) {
                ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${alpha * 1.5})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }

    _drawGlow(ctx, scale, hue) {
        const radius = this.baseRadius * scale;
        const grad = ctx.createRadialGradient(
            this.cx, this.cy, radius * 0.8,
            this.cx, this.cy, radius * 1.6
        );
        grad.addColorStop(0, `hsla(${hue}, 60%, 55%, 0.12)`);
        grad.addColorStop(0.5, `hsla(${hue}, 60%, 55%, 0.04)`);
        grad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.beginPath();
        ctx.arc(this.cx, this.cy, radius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    _drawProgressArc(ctx, progress, hue) {
        const radius = this.baseRadius * 1.85; // juste en dehors des rings
        const lineWidth = 3;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + Math.PI * 2 * progress;

        // Track (fond)
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue}, 30%, 30%, 0.15)`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        // Progress
        if (progress > 0.001) {
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, radius, startAngle, endAngle);
            ctx.strokeStyle = `hsla(${hue}, 65%, 60%, 0.7)`;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    _drawCenterText(ctx, phase, remaining) {
        // Nom de phase
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = `600 ${this.width * 0.055}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(phase.name || '', this.cx, this.cy - this.width * 0.04);

        // Timer
        const timerText = remaining > 0 ? remaining.toFixed(1) : '0.0';
        ctx.font = `300 ${this.width * 0.11}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(timerText, this.cx, this.cy + this.width * 0.05);

        // SubText (si présent)
        if (phase.subText) {
            ctx.font = `400 ${this.width * 0.032}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

            // Word wrap simple
            const maxWidth = this.width * 0.55;
            const words = phase.subText.split(' ');
            let line = '';
            let y = this.cy + this.width * 0.12;
            for (const word of words) {
                const test = line + (line ? ' ' : '') + word;
                if (ctx.measureText(test).width > maxWidth && line) {
                    ctx.fillText(line, this.cx, y);
                    line = word;
                    y += this.width * 0.04;
                } else {
                    line = test;
                }
            }
            if (line) ctx.fillText(line, this.cx, y);
        }
    }

    // —— Easing ——

    _easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    // —— Cleanup ——

    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
    }
}


// ============================================================
// BreathingEngine — moteur principal
// ============================================================

class BreathingEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.renderer = new CanvasRenderer(canvas);

        // Sub-engines (injected)
        this.soundEngine = options.soundEngine || null;   // BreathSounds / SoundEngine
        this.voiceEngine = options.voiceEngine || null;   // VoiceGuide

        // Timer state
        this.rafId = null;
        this.phaseStartTime = 0;    // performance.now() au début de la phase
        this.phasePausedTime = 0;   // ms cumulées en pause pour la phase courante
        this.exercisePausedTime = 0; // ms cumulées en pause pour l'exercice entier
        this.pauseStartTime = 0;    // performance.now() quand pause activée
        this.exerciseStartTime = 0; // performance.now() au tout début

        // Phase state machine
        this.phases = [];
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.totalCycles = 0;

        // Global state
        this.state = 'idle';  // 'idle' | 'countdown' | 'running' | 'paused' | 'completed'

        // Configuration
        this.config = {
            phases: [],
            totalCycles: 0,
            duration: 0,              // minutes
            soundTheme: 'zen',
            instructions: {},         // {start: '...', phaseName: '...'}
            countdownDuration: 2,     // secondes avant début
        };

        // Callbacks
        this.onPhaseStart = null;     // (phase, phaseIndex, cycle) => {}
        this.onPhaseEnd = null;       // (phase, phaseIndex, cycle) => {}
        this.onCycleEnd = null;       // (cycle) => {}
        this.onComplete = null;       // () => {}
        this.onTick = null;           // ({elapsed, remaining, progress, totalElapsed, phase, cycle}) => {}
        this.onCountdownTick = null;  // (remaining) => {}

        // Previous phase action (pour distinguer hold full vs hold empty)
        this._prevAction = null;

        // Countdown state
        this._countdownDurationMs = 2000;
        this._countdownStartTime = 0;
        this._countdownPausedAccum = 0;
        this._stateBeforePause = null;
    }

    // ============================================================
    // API publique
    // ============================================================

    /**
     * Configure le moteur pour un exercice
     */
    configure(config) {
        // Guard: stop if engine is currently running
        if (this.state !== 'idle' && this.state !== 'completed') {
            this.stop();
        }

        Object.assign(this.config, config);

        this.phases = config.phases || [];
        this.totalCycles = (config.totalCycles != null && config.totalCycles > 0)
            ? config.totalCycles
            : this._calcCyclesFromDuration();

        // Callbacks
        if (config.onPhaseStart) this.onPhaseStart = config.onPhaseStart;
        if (config.onPhaseEnd) this.onPhaseEnd = config.onPhaseEnd;
        if (config.onCycleEnd) this.onCycleEnd = config.onCycleEnd;
        if (config.onComplete) this.onComplete = config.onComplete;
        if (config.onTick) this.onTick = config.onTick;
        if (config.onCountdownTick) this.onCountdownTick = config.onCountdownTick;

        // Sound theme
        if (this.soundEngine && config.soundTheme) {
            if (typeof this.soundEngine.setTheme === 'function') {
                this.soundEngine.setTheme(config.soundTheme);
            }
        }

        // Reset state
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.phasePausedTime = 0;
        this.exercisePausedTime = 0;
        this._prevAction = null;
        this.state = 'idle';
    }

    /**
     * Lance l'exercice (avec countdown optionnel)
     */
    start() {
        if (this.state === 'running' || this.state === 'countdown') return;
        if (this.phases.length === 0) { this.state = 'idle'; return; }

        this.state = 'countdown';
        this.exerciseStartTime = performance.now();
        this._countdownDurationMs = (this.config.countdownDuration || 2) * 1000;

        // Voice: annonce de départ
        if (this.voiceEngine && this.config.instructions?.start) {
            this.voiceEngine.speak(this.config.instructions.start);
        }

        // Countdown
        this._countdownStartTime = performance.now();
        this._countdownPausedAccum = 0;

        this.rafId = requestAnimationFrame((t) => this._countdownTick(t));
    }

    /**
     * Countdown animation loop (extracted as named method for pause/resume)
     */
    _countdownTick(timestamp) {
        if (this.state === 'completed' || this.state === 'idle') return;
        if (this.state === 'paused') return; // paused during countdown

        const countdownMs = this._countdownDurationMs;
        const elapsed = timestamp - this._countdownStartTime - this._countdownPausedAccum;
        const remaining = Math.max(0, (countdownMs - elapsed) / 1000);

        // Dessiner countdown sur le canvas
        this._renderCountdown(remaining);

        if (this.onCountdownTick) this.onCountdownTick(remaining);

        if (elapsed >= countdownMs) {
            // Adjust exerciseStartTime so totalElapsed starts from NOW (not from countdown start)
            this.exerciseStartTime = performance.now();
            this._startPhase();
            return;
        }
        this.rafId = requestAnimationFrame((t) => this._countdownTick(t));
    }

    /**
     * Pause
     */
    pause() {
        if (this.state !== 'running' && this.state !== 'countdown') return;
        this._stateBeforePause = this.state; // remember if we were in countdown or running
        this.state = 'paused';
        this.pauseStartTime = performance.now();

        // Stop animation
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Pause sound
        if (this.soundEngine) this.soundEngine.stop();

        // Pause voice
        if (this.voiceEngine) this.voiceEngine.pause();
    }

    /**
     * Resume
     */
    resume() {
        if (this.state !== 'paused') return;

        // Accumulate paused time (both phase and exercise level)
        const pauseDelta = performance.now() - this.pauseStartTime;
        this.phasePausedTime += pauseDelta;
        this.exercisePausedTime += pauseDelta;
        this.pauseStartTime = 0; // reset to avoid stale reference

        // Restore state to what it was before pause (countdown or running)
        const wasCountdown = this._stateBeforePause === 'countdown';

        // Resume voice
        if (this.voiceEngine) this.voiceEngine.resume();

        if (wasCountdown) {
            // Re-enter countdown — the countdown RAF loop checks state, so just
            // set state back and restart the loop. countdownStartTime is adjusted.
            this.state = 'countdown';
            this._countdownPausedAccum = (this._countdownPausedAccum || 0) + pauseDelta;
            this.rafId = requestAnimationFrame((t) => this._countdownTick(t));
            return;
        }

        this.state = 'running';

        // Re-play sound for remaining duration
        const phase = this.phases[this.currentPhaseIndex];
        if (phase) {
            const elapsed = (performance.now() - this.phaseStartTime - this.phasePausedTime) / 1000;
            const remaining = phase.duration - elapsed;
            if (remaining > 0.5 && this.soundEngine) {
                const soundAction = this._getSoundAction(phase);
                this.soundEngine.playPhase(soundAction, remaining);
            }
        }

        // Restart animation loop
        this.rafId = requestAnimationFrame((t) => this._tick(t));
    }

    /**
     * Stop complet
     */
    stop() {
        this.state = 'idle';

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        if (this.soundEngine) this.soundEngine.stop();
        if (this.voiceEngine) this.voiceEngine.stop();

        // Clear canvas
        const ctx = this.renderer.ctx;
        ctx.clearRect(0, 0, this.renderer.width, this.renderer.height);
    }

    /**
     * Reset (retour à idle, prêt à relancer)
     */
    reset() {
        this.stop();
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.phasePausedTime = 0;
        this.exercisePausedTime = 0;
        this._prevAction = null;
    }

    /**
     * Force passage à la phase suivante (pour exercices spéciaux)
     */
    skipToNextPhase() {
        if (this.state !== 'running') return;
        this._nextPhase();
    }

    /**
     * Change les phases dynamiquement (Breath Light rounds)
     * Reset le phase index à 0 et continue
     */
    setPhases(phases) {
        this.phases = phases;
        this.currentPhaseIndex = 0;
    }

    /**
     * Retourne l'état courant (pour UI externe)
     */
    getCurrentState() {
        const phase = this.phases[this.currentPhaseIndex] || null;
        let elapsed = 0;
        let remaining = 0;

        if (phase && this.state === 'running') {
            elapsed = (performance.now() - this.phaseStartTime - this.phasePausedTime) / 1000;
            remaining = Math.max(0, phase.duration - elapsed);
        }

        return {
            state: this.state,
            phase: phase,
            phaseIndex: this.currentPhaseIndex,
            cycle: this.currentCycle,
            totalCycles: this.totalCycles,
            phaseElapsed: elapsed,
            phaseRemaining: remaining,
            totalElapsed: this.state !== 'idle'
                ? (performance.now() - this.exerciseStartTime - this.exercisePausedTime) / 1000
                : 0
        };
    }

    /**
     * Promise-based run : lance une séquence et résout quand c'est fini
     * Pour les exercices spéciaux (async/await pattern)
     */
    run(config) {
        return new Promise((resolve) => {
            const prevOnComplete = config.onComplete;
            config.onComplete = () => {
                if (prevOnComplete) prevOnComplete();
                resolve();
            };
            this.configure(config);
            this.start();
        });
    }

    /**
     * Lance une phase unique jusqu'à ce que skipToNextPhase() soit appelé
     * Retourne le temps écoulé en secondes
     */
    runUntilStopped(config) {
        return new Promise((resolve) => {
            const phase = config.phase || config.phases?.[0];
            if (!phase) { resolve(0); return; }

            // Phase avec durée très longue (sera stoppée manuellement)
            const maxDuration = phase.duration === Infinity ? 3600 : phase.duration;
            const actualPhase = { ...phase, duration: maxDuration };

            this.configure({
                phases: [actualPhase],
                totalCycles: 1,
                countdownDuration: 0,
                onComplete: () => {
                    const elapsed = (performance.now() - this.phaseStartTime - this.phasePausedTime) / 1000;
                    resolve(Math.min(elapsed, maxDuration));
                },
                ...config
            });
            this.start();
        });
    }

    // ============================================================
    // Timer interne — requestAnimationFrame
    // ============================================================

    _tick(timestamp) {
        if (this.state !== 'running') return;

        const phase = this.phases[this.currentPhaseIndex];
        if (!phase) { this._complete(); return; }

        // Skip phases with duration <= 0 (avoid NaN progress)
        if (!phase.duration || phase.duration <= 0) {
            this._nextPhase();
            return;
        }

        // Calcul précis du temps écoulé dans la phase
        const elapsedMs = timestamp - this.phaseStartTime - this.phasePausedTime;
        const elapsedSec = elapsedMs / 1000;
        const remaining = Math.max(0, phase.duration - elapsedSec);
        const progress = Math.min(1, elapsedSec / phase.duration);

        // Rendu Canvas
        this.renderer.render(phase, progress, remaining, this.currentCycle, this.totalCycles);

        // Callback tick
        if (this.onTick) {
            const totalElapsed = (timestamp - this.exerciseStartTime - this.exercisePausedTime) / 1000;
            this.onTick({
                elapsed: elapsedSec,
                remaining: remaining,
                progress: progress,
                totalElapsed: totalElapsed,
                phase: phase,
                cycle: this.currentCycle,
                totalCycles: this.totalCycles
            });
        }

        // Phase terminée ?
        if (remaining <= 0.016) {  // ~1 frame de tolérance
            this._nextPhase();
            return;
        }

        this.rafId = requestAnimationFrame((t) => this._tick(t));
    }

    // ============================================================
    // Gestion des phases
    // ============================================================

    _startPhase() {
        if (this.phases.length === 0) return;

        this.state = 'running';
        this.phaseStartTime = performance.now();
        this.phasePausedTime = 0;

        const phase = this.phases[this.currentPhaseIndex];

        // Préparer l'animation
        this.renderer.setPhaseTarget(phase.action);

        // Callback — return false to skip engine's default sound
        let skipSound = false;
        if (this.onPhaseStart) {
            skipSound = this.onPhaseStart(phase, this.currentPhaseIndex, this.currentCycle) === false;
        }

        // Son (skipped if onPhaseStart returned false)
        if (this.soundEngine && !skipSound) {
            this.soundEngine.stop();
            const soundAction = this._getSoundAction(phase);
            this.soundEngine.playPhase(soundAction, phase.duration);
        }

        // Voice (instruction de phase, pas à chaque cycle pour éviter spam)
        if (this.voiceEngine && this.currentCycle <= 2) {
            const instruction = this.config.instructions?.[phase.name];
            if (instruction && this.currentPhaseIndex === 0 && this.currentCycle === 1) {
                // Ne pas parler au tout début (start instruction déjà dite)
            } else if (instruction && this.currentCycle <= 2) {
                // Voix guide les 2 premiers cycles seulement
                this.voiceEngine.speakWithDelay(instruction, 300);
            }
        }

        // Lancer la boucle RAF
        this.rafId = requestAnimationFrame((t) => this._tick(t));
    }

    _nextPhase() {
        const phase = this.phases[this.currentPhaseIndex];

        // Callback fin de phase
        if (this.onPhaseEnd) {
            this.onPhaseEnd(phase, this.currentPhaseIndex, this.currentCycle);
        }

        // Mémoriser l'action précédente (pour hold detection)
        this._prevAction = phase.action;

        // Avancer
        this.currentPhaseIndex++;

        // Fin de cycle ?
        if (this.currentPhaseIndex >= this.phases.length) {
            this.currentPhaseIndex = 0;

            if (this.onCycleEnd) this.onCycleEnd(this.currentCycle);

            this.currentCycle++;

            // Fin de l'exercice ?
            if (this.currentCycle > this.totalCycles) {
                this._complete();
                return;
            }
        }

        // Démarrer la phase suivante
        this.phaseStartTime = performance.now();
        this.phasePausedTime = 0; // reset pour la nouvelle phase (exercisePausedTime persiste)

        const nextPhase = this.phases[this.currentPhaseIndex];
        if (!nextPhase) { this._complete(); return; } // safety guard

        this.renderer.setPhaseTarget(nextPhase.action);

        // Callback — return false to skip engine's default sound
        let skipSound = false;
        if (this.onPhaseStart) {
            skipSound = this.onPhaseStart(nextPhase, this.currentPhaseIndex, this.currentCycle) === false;
        }

        // Son (skipped if onPhaseStart returned false)
        if (this.soundEngine && !skipSound) {
            this.soundEngine.stop();
            const soundAction = this._getSoundAction(nextPhase);
            this.soundEngine.playPhase(soundAction, nextPhase.duration);
        }

        // Continuer le RAF
        this.rafId = requestAnimationFrame((t) => this._tick(t));
    }

    _complete() {
        if (this.state === 'completed') return; // guard double-call
        this.state = 'completed';

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Son de fin
        if (this.soundEngine) {
            this.soundEngine.stop();
            if (typeof this.soundEngine.playComplete === 'function') {
                this.soundEngine.playComplete();
            }
        }

        if (this.onComplete) this.onComplete();
    }

    // ============================================================
    // Helpers
    // ============================================================

    _calcCyclesFromDuration() {
        if (!this.phases.length || !this.config.duration) return 1;
        const cycleDuration = this.phases.reduce((sum, p) => sum + p.duration, 0);
        if (cycleDuration <= 0) return 1;
        return Math.floor(this.config.duration * 60 / cycleDuration);
    }

    _getSoundAction(phase) {
        // Distinguer hold plein vs hold vide
        if (phase.action === 'hold') {
            if (this._prevAction === 'exhale' || this._prevAction === 'holdEmpty') {
                return 'holdEmpty';
            }
            return 'hold';
        }
        return phase.action;
    }

    _renderCountdown(remaining) {
        const ctx = this.renderer.ctx;
        const w = this.renderer.width;
        const h = this.renderer.height;

        ctx.clearRect(0, 0, w, h);

        // Dessiner un cercle calme en attendant
        const hue = 200;
        const radius = this.renderer.baseRadius;
        const grad = ctx.createRadialGradient(
            this.renderer.cx, this.renderer.cy, radius * 0.3,
            this.renderer.cx, this.renderer.cy, radius
        );
        grad.addColorStop(0, `hsla(${hue}, 55%, 50%, 0.15)`);
        grad.addColorStop(0.7, `hsla(${hue}, 55%, 50%, 0.25)`);
        grad.addColorStop(1, `hsla(${hue}, 55%, 50%, 0)`);

        ctx.beginPath();
        ctx.arc(this.renderer.cx, this.renderer.cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Texte "Prêt"
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `600 ${w * 0.06}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Prêt', this.renderer.cx, this.renderer.cy - w * 0.03);

        // Countdown
        ctx.font = `300 ${w * 0.12}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(Math.ceil(remaining).toString(), this.renderer.cx, this.renderer.cy + w * 0.06);
    }

    /**
     * Destroy — cleanup complet
     */
    destroy() {
        this.stop();
        this.renderer.destroy();

        // Clear all callbacks to prevent memory leaks
        this.onPhaseStart = null;
        this.onPhaseEnd = null;
        this.onCycleEnd = null;
        this.onComplete = null;
        this.onTick = null;
        this.onCountdownTick = null;

        // Clear references
        this.soundEngine = null;
        this.voiceEngine = null;
        this.phases = [];
    }
}

// Export global (vanilla JS, no build tools)
window.BreathingEngine = BreathingEngine;
window.CanvasRenderer = CanvasRenderer;
