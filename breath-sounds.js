/**
 * Breath Sounds - Zen meditation audio cues for breathing phases
 * Uses Web Audio API to generate tibetan bowl, singing bowl, and deep drone tones
 * Designed for a calming, meditative experience
 */

class BreathSounds {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5; // Lower default for zen feel
        this.theme = 'zen'; // 'zen' | 'harp'

        // Zen-style phase settings — deep, warm, harmonic-rich
        // Inspired by tibetan singing bowls and meditation drones
        this.phaseSettings = {
            inhale: {
                baseFreq: 82,        // E2 - deep, grounding
                endFreq: 123,        // B2 - gentle rise (perfect fifth)
                harmonics: [2, 3, 5],// Overtones for bowl-like richness
                harmonicGains: [0.3, 0.15, 0.05],
                filterFreq: 500,
                attack: 1.5,         // Very slow, meditative attack
                release: 1.0
            },
            exhale: {
                baseFreq: 123,       // B2
                endFreq: 82,         // E2 - gentle descent
                harmonics: [2, 3, 5],
                harmonicGains: [0.25, 0.12, 0.04],
                filterFreq: 450,
                attack: 0.8,
                release: 1.5         // Long, fading release
            },
            hold: {
                baseFreq: 98,        // G2 - warm, stable
                endFreq: 98,
                harmonics: [2, 3, 4, 6],
                harmonicGains: [0.2, 0.1, 0.06, 0.03],
                filterFreq: 400,
                attack: 1.0,
                release: 1.0
            },
            holdEmpty: {
                baseFreq: 65,        // C2 - very deep, still
                endFreq: 65,
                harmonics: [2, 3, 5],
                harmonicGains: [0.2, 0.08, 0.03],
                filterFreq: 350,
                attack: 1.2,
                release: 1.5
            }
        };

        this.currentNodes = [];
        this.currentGain = null;
    }

    /**
     * Initialize audio context (must be called after user interaction)
     */
    async init() {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            this.enabled = true;
        } catch (e) {
            // AudioContext unavailable
        }
    }

    /**
     * Test sound - plays a soft singing bowl strike
     */
    async testSound() {
        if (!this.audioContext) {
            await this.init();
        }
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            this._playBowlStrike(174, 1.5, 0.35); // F3 singing bowl
        } catch (e) {
            // Ignore errors
        }
    }

    /**
     * Play a singing bowl strike — fundamental + harmonics with long decay
     */
    _playBowlStrike(freq, duration, vol) {
        const now = this.audioContext.currentTime;
        const nodes = [];

        // Fundamental
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = freq * 4;
        filter.Q.value = 0.3;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        // Bowl-like envelope: quick attack, very long natural decay
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(vol, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(vol * 0.6, now + duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.start(now);
        osc.stop(now + duration + 0.1);
        nodes.push(osc, gain, filter);

        // 2nd harmonic (octave) — characteristic of singing bowls
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 2;
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);

        gain2.gain.setValueAtTime(0.0001, now);
        gain2.gain.exponentialRampToValueAtTime(vol * 0.2, now + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.7);

        osc2.start(now);
        osc2.stop(now + duration + 0.1);
        nodes.push(osc2, gain2);

        // 3rd harmonic (fifth above octave)
        const osc3 = this.audioContext.createOscillator();
        const gain3 = this.audioContext.createGain();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 3;
        osc3.connect(gain3);
        gain3.connect(this.audioContext.destination);

        gain3.gain.setValueAtTime(0.0001, now);
        gain3.gain.exponentialRampToValueAtTime(vol * 0.08, now + 0.01);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.5);

        osc3.start(now);
        osc3.stop(now + duration + 0.1);
        nodes.push(osc3, gain3);

        return nodes;
    }

    /**
     * Play a soft tone for a breathing phase
     * @param {string} phase - 'inhale', 'exhale', 'hold', 'holdEmpty'
     * @param {number} duration - Duration in seconds
     */
    playPhase(phase, duration) {
        if (!this.enabled || this.volume === 0) return;

        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                return;
            }
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this._doPlayPhase(phase, duration);
            });
            return;
        }

        this._doPlayPhase(phase, duration);
    }

    /**
     * Set sound theme
     * @param {string} theme - 'zen' | 'harp'
     */
    setTheme(theme) {
        if (theme === 'zen' || theme === 'harp') {
            this.theme = theme;
        }
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.theme;
    }

    /**
     * Internal method — zen drone with harmonics for phase sound
     */
    _doPlayPhase(phase, duration) {
        // Route to the active theme
        if (this.theme === 'harp') {
            this._doPlayPhaseHarp(phase, duration);
            return;
        }
        this._doPlayPhaseZen(phase, duration);
    }

    /**
     * Harp theme — glissando arpeggios for inhale/exhale, soft pads for hold
     */
    _doPlayPhaseHarp(phase, duration) {
        this.stopCurrent();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const allNodes = [];
        const peakVol = this.volume * 0.45;

        // Note definitions per phase
        const harpConfig = {
            inhale: {
                notes: [261.6, 329.6, 392.0, 523.3, 659.3], // C4-E4-G4-C5-E5 ascending
                direction: 'up'
            },
            exhale: {
                notes: [659.3, 523.3, 392.0, 329.6, 261.6], // E5-C5-G4-E4-C4 descending
                direction: 'down'
            },
            hold: {
                notes: [261.6, 329.6, 392.0], // C major chord sustained
                sustained: true
            },
            holdEmpty: {
                notes: [130.8, 196.0], // C3 + G3 — very gentle low pad
                sustained: true,
                quiet: true
            }
        };

        const config = harpConfig[phase] || harpConfig.hold;

        if (config.sustained) {
            // Sustained pad — soft chord
            const padVol = config.quiet ? peakVol * 0.3 : peakVol * 0.5;
            config.notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.value = freq;

                filter.type = 'lowpass';
                filter.frequency.value = freq * 3;
                filter.Q.value = 0.2;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);

                const noteVol = padVol / config.notes.length;
                const attack = Math.min(1.5, duration * 0.3);
                const release = Math.min(1.5, duration * 0.3);

                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(noteVol, now + attack);
                gain.gain.exponentialRampToValueAtTime(noteVol * 0.7, now + duration - release);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

                osc.start(now);
                osc.stop(now + duration + 0.5);
                allNodes.push(osc, gain, filter);

                // Store first gain for stop()
                if (i === 0) this.currentGain = gain;
            });
        } else {
            // Arpeggio — plucked notes spread across the phase duration
            const noteCount = config.notes.length;
            const totalSpread = Math.min(duration * 0.7, noteCount * 0.4);
            const spacing = totalSpread / noteCount;
            const noteDur = Math.max(1.0, duration * 0.6);

            config.notes.forEach((freq, i) => {
                const noteStart = now + i * spacing;
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                // Triangle wave — softer, more harp-like than sine
                osc.type = 'triangle';
                osc.frequency.value = freq;

                filter.type = 'lowpass';
                filter.frequency.value = freq * 4;
                filter.Q.value = 0.5;

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);

                // Plucked envelope: very fast attack, natural decay
                const noteVol = peakVol * (0.6 - i * 0.05); // slightly quieter each note
                gain.gain.setValueAtTime(0.0001, noteStart);
                gain.gain.exponentialRampToValueAtTime(noteVol, noteStart + 0.015);
                gain.gain.exponentialRampToValueAtTime(noteVol * 0.4, noteStart + noteDur * 0.3);
                gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDur);

                osc.start(noteStart);
                osc.stop(noteStart + noteDur + 0.1);
                allNodes.push(osc, gain, filter);

                // 2nd harmonic for richness (octave, quieter)
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();
                osc2.type = 'sine';
                osc2.frequency.value = freq * 2;
                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);

                gain2.gain.setValueAtTime(0.0001, noteStart);
                gain2.gain.exponentialRampToValueAtTime(noteVol * 0.15, noteStart + 0.01);
                gain2.gain.exponentialRampToValueAtTime(0.0001, noteStart + noteDur * 0.5);

                osc2.start(noteStart);
                osc2.stop(noteStart + noteDur + 0.1);
                allNodes.push(osc2, gain2);

                // Store first gain for stop()
                if (i === 0) this.currentGain = gain;
            });
        }

        this.currentNodes = allNodes;

        // Cleanup on last node end
        const lastNode = allNodes.find(n => n instanceof OscillatorNode);
        if (lastNode) {
            lastNode.onended = () => {
                this.currentNodes = [];
                this.currentGain = null;
            };
        }
    }

    /**
     * Internal method — zen drone with harmonics for phase sound (original)
     */
    _doPlayPhaseZen(phase, duration) {
        this.stopCurrent();
        if (!this.audioContext) return;

        const settings = this.getPhaseSettings(phase);
        const now = this.audioContext.currentTime;
        const allNodes = [];

        const safeAttack = Math.min(settings.attack, duration * 0.4);
        const safeRelease = Math.min(settings.release, duration * 0.4);
        const peakVolume = this.volume * 0.6; // Zen: softer peak

        // === Fundamental oscillator ===
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(settings.baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(
            Math.max(settings.endFreq, 20),
            now + duration
        );

        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = settings.filterFreq;
        filter.Q.value = 0.3; // Very gentle filter

        // Subtle vibrato — slow, organic
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibrato.frequency.value = 0.8; // Even slower than before
        vibratoGain.gain.value = 0.5;  // Very subtle pitch wobble

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Volume envelope
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(peakVolume, now + safeAttack);

        const sustainTime = duration - safeAttack - safeRelease;
        if (sustainTime > 0) {
            if (phase === 'inhale') {
                gainNode.gain.exponentialRampToValueAtTime(
                    peakVolume * 1.05, now + safeAttack + sustainTime
                );
            } else if (phase === 'exhale') {
                gainNode.gain.exponentialRampToValueAtTime(
                    peakVolume * 0.6, now + safeAttack + sustainTime
                );
            } else {
                gainNode.gain.setValueAtTime(peakVolume, now + safeAttack + sustainTime);
            }
        }
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        vibrato.start(now);
        osc.start(now);
        vibrato.stop(now + duration + 0.5);
        osc.stop(now + duration + 0.5);
        allNodes.push(osc, vibrato, gainNode, filter, vibratoGain);

        // === Harmonic overtones (singing bowl character) ===
        const harmonics = settings.harmonics || [2, 3];
        const harmonicGains = settings.harmonicGains || [0.2, 0.1];

        harmonics.forEach((mult, i) => {
            const hOsc = this.audioContext.createOscillator();
            const hGain = this.audioContext.createGain();
            const hFilter = this.audioContext.createBiquadFilter();

            hOsc.type = 'sine';
            hOsc.frequency.setValueAtTime(settings.baseFreq * mult, now);
            hOsc.frequency.exponentialRampToValueAtTime(
                Math.max(settings.endFreq * mult, 20),
                now + duration
            );

            hFilter.type = 'lowpass';
            hFilter.frequency.value = settings.filterFreq * 0.8;
            hFilter.Q.value = 0.2;

            hOsc.connect(hFilter);
            hFilter.connect(hGain);
            hGain.connect(this.audioContext.destination);

            const hVol = peakVolume * (harmonicGains[i] || 0.1);

            // Harmonics fade in slower and fade out faster (natural bowl behavior)
            hGain.gain.setValueAtTime(0.0001, now);
            hGain.gain.exponentialRampToValueAtTime(hVol, now + safeAttack * 1.3);
            hGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

            hOsc.start(now);
            hOsc.stop(now + duration + 0.5);
            allNodes.push(hOsc, hGain, hFilter);
        });

        this.currentNodes = allNodes;
        this.currentGain = gainNode;

        osc.onended = () => {
            this.currentNodes = [];
            this.currentGain = null;
        };
    }

    /**
     * Stop current sound immediately
     */
    stopCurrent() {
        this.currentNodes.forEach(node => {
            try {
                if (node.stop) node.stop();
                if (node.disconnect) node.disconnect();
            } catch (e) {}
        });
        this.currentNodes = [];
        this.currentGain = null;
    }

    /**
     * Smoothly fade out current sound
     */
    fadeOutCurrent() {
        if (this.currentGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            try {
                this.currentGain.gain.cancelScheduledValues(now);
                this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
                this.currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            } catch (e) {}
        }
        setTimeout(() => {
            this.currentNodes.forEach(node => {
                try {
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
            this.currentNodes = [];
        }, 400);
    }

    /**
     * Get settings for a phase
     */
    getPhaseSettings(phase) {
        switch (phase) {
            case 'inhale': return this.phaseSettings.inhale;
            case 'exhale': return this.phaseSettings.exhale;
            case 'hold':
            case 'holdFull': return this.phaseSettings.hold;
            case 'holdEmpty': return this.phaseSettings.holdEmpty;
            default: return this.phaseSettings.hold;
        }
    }

    /**
     * Play a soft singing bowl chime for phase transition
     */
    playTransition() {
        if (!this.enabled || !this.audioContext || this.volume === 0) return;

        // Soft bowl tap — two harmonically related tones
        const freq = 131; // C3
        const now = this.audioContext.currentTime;

        [1, 2.5].forEach((mult, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = freq * mult;

            filter.type = 'lowpass';
            filter.frequency.value = 400;
            filter.Q.value = 0.3;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            const vol = this.volume * (i === 0 ? 0.12 : 0.04);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(vol * 0.4, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

            osc.start(now);
            osc.stop(now + 1.6);
        });
    }

    /**
     * Play completion sound — deep tibetan bowl chord, long resonance
     */
    playComplete() {
        if (!this.enabled || !this.audioContext || this.volume === 0) return;

        // Three bowl strikes: C2, G2, E3 — open, resonant voicing
        const bowlNotes = [65, 98, 165];
        const delays = [0, 600, 1200];

        bowlNotes.forEach((freq, i) => {
            setTimeout(() => {
                if (!this.audioContext) return;
                this._playBowlStrike(freq, 3.0, this.volume * 0.25);
            }, delays[i]);
        });
    }

    /**
     * Stop current sound with smooth fade out
     */
    stop() {
        if (this.currentGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            try {
                this.currentGain.gain.cancelScheduledValues(now);
                this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
                this.currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            } catch (e) {}
        }

        // Capture references NOW — not inside the timeout — so that if playPhase()
        // is called immediately after stop(), its new nodes are NOT disconnected by this timeout.
        const nodesToStop = this.currentNodes;
        this.currentNodes = [];
        this.currentGain = null;

        setTimeout(() => {
            nodesToStop.forEach(node => {
                try {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
        }, 400);
    }

    /**
     * Play a short, higher-pitched bowl tap for the 2nd inhale (Cyclic Sighing top-off)
     * Distinct from the main inhale — quick, light, like a gentle reminder
     */
    playSecondInhale() {
        if (!this.enabled || this.volume === 0) return;
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => this._doPlaySecondInhale());
            return;
        }
        this._doPlaySecondInhale();
    }

    _doPlaySecondInhale() {
        if (!this.audioContext) return;
        const now = this.audioContext.currentTime;
        // Higher freq (E4 = 330 Hz), very short decay — a quick "top-off" tap
        [1, 2, 3].forEach((mult, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = 330 * mult;

            filter.type = 'lowpass';
            filter.frequency.value = 330 * mult * 3;
            filter.Q.value = 0.3;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            const vols = [0.18, 0.07, 0.02];
            const vol = this.volume * vols[i];
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(vol * 0.3, now + 0.25);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

            osc.start(now);
            osc.stop(now + 0.8);
        });
    }

    /**
     * Toggle sounds on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stop();
        }
        return this.enabled;
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    /**
     * Get current volume
     */
    getVolume() {
        return this.volume;
    }
}

// Create global instance
window.breathSounds = new BreathSounds();
