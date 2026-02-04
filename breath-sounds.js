/**
 * Breath Sounds - Gentle audio cues for breathing phases
 * Uses Web Audio API to generate soft, calming tones
 */

class BreathSounds {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.7; // Slightly reduced for softer sound

        // Different sound characteristics per phase
        // Lower frequencies for deeper, more calming tones
        this.phaseSettings = {
            inhale: {
                baseFreq: 130,       // C3 - deep, calming
                endFreq: 196,        // G3 - gentle rise
                waveform: 'sine',
                filterFreq: 800,     // Softer filter
                attack: 0.8,         // Slower attack for gentleness
                release: 0.5
            },
            exhale: {
                baseFreq: 196,       // G3
                endFreq: 130,        // C3 - gentle fall
                waveform: 'sine',
                filterFreq: 700,
                attack: 0.5,
                release: 0.8
            },
            hold: {
                baseFreq: 165,       // E3 - stable, warm
                endFreq: 165,
                waveform: 'sine',
                filterFreq: 600,
                attack: 0.6,
                release: 0.6
            },
            holdEmpty: {
                baseFreq: 110,       // A2 - deeper for empty hold
                endFreq: 110,
                waveform: 'sine',
                filterFreq: 500,
                attack: 0.6,
                release: 0.8
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
                console.log('BreathSounds: AudioContext created, state:', this.audioContext.state);
            }
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('BreathSounds: AudioContext resumed, state:', this.audioContext.state);
            }
            // Force enable
            this.enabled = true;
            console.log('BreathSounds: Initialized - enabled:', this.enabled, 'volume:', this.volume, 'state:', this.audioContext.state);
        } catch (e) {
            console.error('BreathSounds: Failed to initialize AudioContext', e);
        }
    }

    /**
     * Test sound - plays a short beep to verify audio is working
     */
    async testSound() {
        console.log('BreathSounds: Testing sound...');

        // Make sure context is ready
        if (!this.audioContext) {
            await this.init();
        }

        if (!this.audioContext) {
            console.error('BreathSounds: No audio context for test');
            return;
        }

        // Resume if suspended
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        console.log('BreathSounds: AudioContext state:', this.audioContext.state);

        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = 440; // A4 - standard tuning note

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0.5, now);  // Higher volume for test
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            osc.start(now);
            osc.stop(now + 0.3);

            console.log('BreathSounds: Test sound played successfully');
        } catch (e) {
            console.error('BreathSounds: Error playing test sound:', e);
        }
    }

    /**
     * Play a soft tone for a breathing phase
     * @param {string} phase - 'inhale', 'exhale', 'hold', 'holdEmpty'
     * @param {number} duration - Duration in seconds
     */
    playPhase(phase, duration) {
        console.log('BreathSounds: playPhase called -', phase, duration + 's');

        if (!this.enabled) {
            console.log('BreathSounds: Sounds disabled');
            return;
        }

        if (this.volume === 0) {
            console.log('BreathSounds: Volume is 0');
            return;
        }

        // Create AudioContext if needed (synchronously)
        if (!this.audioContext) {
            console.log('BreathSounds: Creating AudioContext...');
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('BreathSounds: AudioContext created, state:', this.audioContext.state);
            } catch (e) {
                console.error('BreathSounds: Failed to create AudioContext', e);
                return;
            }
        }

        // Resume context if suspended (can happen on mobile)
        if (this.audioContext.state === 'suspended') {
            console.log('BreathSounds: Resuming suspended context...');
            this.audioContext.resume().then(() => {
                console.log('BreathSounds: Context resumed, now playing...');
                this._doPlayPhase(phase, duration);
            });
            return;
        }

        console.log('BreathSounds: Playing phase', phase, 'for', duration, 'seconds, volume:', this.volume, 'context state:', this.audioContext.state);
        this._doPlayPhase(phase, duration);
    }

    /**
     * Internal method to actually play the phase sound
     */
    _doPlayPhase(phase, duration) {
        console.log('BreathSounds: _doPlayPhase executing for', phase, 'duration:', duration);

        // Stop any current sound immediately to start fresh
        this.stopCurrent();

        // Get phase-specific settings
        const settings = this.getPhaseSettings(phase);

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = settings.waveform;

        // Create gain node for volume envelope
        const gainNode = this.audioContext.createGain();

        // Create a low-pass filter to soften the sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = settings.filterFreq;
        filter.Q.value = 0.5; // Lower Q for softer sound

        // Very subtle vibrato for organic feel
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibrato.frequency.value = 1.5; // Very slow
        vibratoGain.gain.value = 1; // Very subtle

        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);

        // Connect: oscillator -> filter -> gain -> output
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        // Ensure attack and release don't exceed duration
        const safeAttack = Math.min(settings.attack, duration * 0.4);
        const safeRelease = Math.min(settings.release, duration * 0.4);

        // Set frequency sweep based on phase - use exponential for smoother transition
        oscillator.frequency.setValueAtTime(settings.baseFreq, now);
        oscillator.frequency.exponentialRampToValueAtTime(
            Math.max(settings.endFreq, 20), // Prevent going to 0
            now + duration
        );

        // Volume envelope - use exponential ramps to avoid clicks
        const peakVolume = this.volume; // Full volume

        // Start from a tiny value (not 0) to allow exponential ramp
        gainNode.gain.setValueAtTime(0.0001, now);

        // Smooth exponential fade in
        gainNode.gain.exponentialRampToValueAtTime(peakVolume, now + safeAttack);

        // Sustain with gentle variation
        const sustainTime = duration - safeAttack - safeRelease;
        if (sustainTime > 0) {
            if (phase === 'inhale') {
                // Gentle crescendo during inhale
                gainNode.gain.exponentialRampToValueAtTime(
                    peakVolume * 1.1,
                    now + safeAttack + sustainTime
                );
            } else if (phase === 'exhale') {
                // Gentle decrescendo during exhale
                gainNode.gain.exponentialRampToValueAtTime(
                    peakVolume * 0.7,
                    now + safeAttack + sustainTime
                );
            } else {
                // Hold steady
                gainNode.gain.setValueAtTime(peakVolume, now + safeAttack + sustainTime);
            }
        }

        // Smooth exponential fade out - must end at tiny value, not 0
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        // Start oscillators
        vibrato.start(now);
        oscillator.start(now);

        // Schedule stop with buffer after fade completes
        vibrato.stop(now + duration + 0.5);
        oscillator.stop(now + duration + 0.5);

        // Store references for cleanup
        this.currentNodes = [oscillator, vibrato, gainNode, filter];
        this.currentGain = gainNode;

        // Cleanup on end
        oscillator.onended = () => {
            this.currentNodes = [];
            this.currentGain = null;
        };

        console.log('BreathSounds: Sound started successfully for', phase, '- will play for', duration, 'seconds');
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
     * Smoothly fade out current sound instead of abrupt stop
     */
    fadeOutCurrent() {
        if (this.currentGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            try {
                // Cancel scheduled changes and fade out smoothly
                this.currentGain.gain.cancelScheduledValues(now);
                this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
                this.currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            } catch (e) {
                // Ignore if already stopped
            }
        }
        // Clear nodes after fade
        setTimeout(() => {
            this.currentNodes.forEach(node => {
                try {
                    if (node.disconnect) node.disconnect();
                } catch (e) {}
            });
            this.currentNodes = [];
        }, 200);
    }

    /**
     * Get settings for a phase
     */
    getPhaseSettings(phase) {
        switch (phase) {
            case 'inhale':
                return this.phaseSettings.inhale;
            case 'exhale':
                return this.phaseSettings.exhale;
            case 'hold':
            case 'holdFull':
                return this.phaseSettings.hold;
            case 'holdEmpty':
                return this.phaseSettings.holdEmpty;
            default:
                return this.phaseSettings.hold;
        }
    }

    /**
     * Play a soft chime for phase transition
     */
    playTransition() {
        if (!this.enabled || !this.audioContext || this.volume === 0) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        oscillator.type = 'sine';
        oscillator.frequency.value = 165; // E3 - lower, softer chime

        filter.type = 'lowpass';
        filter.frequency.value = 300;
        filter.Q.value = 0.5;

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const now = this.audioContext.currentTime;

        // Very soft, gradual chime - no clicks
        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(this.volume * 0.15, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        oscillator.start(now);
        oscillator.stop(now + 1.0);
    }

    /**
     * Play completion sound - gentle low notes
     */
    playComplete() {
        if (!this.enabled || !this.audioContext || this.volume === 0) return;

        const notes = [110, 130, 165]; // A2, C3, E3 - even lower chord
        const noteDuration = 0.8;

        notes.forEach((freq, i) => {
            setTimeout(() => {
                if (!this.audioContext) return;

                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();

                oscillator.type = 'sine';
                oscillator.frequency.value = freq;

                filter.type = 'lowpass';
                filter.frequency.value = 350;
                filter.Q.value = 0.5;

                oscillator.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                const now = this.audioContext.currentTime;

                // Smooth exponential envelope - no clicks
                gainNode.gain.setValueAtTime(0.0001, now);
                gainNode.gain.exponentialRampToValueAtTime(this.volume * 0.2, now + 0.25);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration + 0.8);

                oscillator.start(now);
                oscillator.stop(now + noteDuration + 1.0);
            }, i * 400); // Slightly longer delay between notes
        });
    }

    /**
     * Stop current sound with smooth fade out
     */
    stop() {
        if (this.currentGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            try {
                // Smooth fade out over 150ms to avoid click
                this.currentGain.gain.cancelScheduledValues(now);
                this.currentGain.gain.setValueAtTime(this.currentGain.gain.value, now);
                this.currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            } catch (e) {}
        }

        // Disconnect after fade completes
        setTimeout(() => {
            this.currentNodes.forEach(node => {
                try {
                    if (node.stop) node.stop();
                    if (node.disconnect) node.disconnect();
                } catch (e) {
                    // Already stopped
                }
            });
            this.currentNodes = [];
            this.currentGain = null;
        }, 200);
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
console.log('BreathSounds loaded, window.breathSounds:', window.breathSounds);
