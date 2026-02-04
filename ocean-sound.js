/**
 * OceanSound - Realistic ocean wave sound generator using Web Audio API
 * Creates natural-sounding ocean waves with sac (ebb) and ressac (flow)
 */
class OceanSound {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.volume = 0.5;
        this.masterGain = null;
        this.nodes = [];
    }

    /**
     * Initialize the audio context (must be called after user interaction)
     */
    init() {
        if (this.audioContext) return;

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0;
    }

    /**
     * Create a noise source (brown noise for ocean-like sound)
     */
    createNoiseSource() {
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        // Generate brown noise (more natural for ocean sounds)
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Boost volume
        }

        const whiteNoise = this.audioContext.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        return whiteNoise;
    }

    /**
     * Create a wave layer with specific characteristics
     */
    createWaveLayer(frequency, q, waveSpeed, minGain, maxGain, phase = 0) {
        const noise = this.createNoiseSource();

        // Bandpass filter to shape the sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = frequency;
        filter.Q.value = q;

        // Gain for volume modulation (wave ebb and flow)
        const gain = this.audioContext.createGain();
        gain.gain.value = minGain;

        // Connect: noise -> filter -> gain -> master
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        // Start the noise
        noise.start();

        // Store for cleanup
        this.nodes.push({ noise, filter, gain });

        // Create wave modulation
        this.modulateWave(gain, minGain, maxGain, waveSpeed, phase);

        return { noise, filter, gain };
    }

    /**
     * Modulate gain to create wave-like volume changes
     */
    modulateWave(gainNode, minGain, maxGain, speed, phase) {
        const modulate = () => {
            if (!this.isPlaying) return;

            const now = this.audioContext.currentTime;
            const duration = speed + (Math.random() * speed * 0.3); // Add randomness

            // Wave coming in (ressac)
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);

            // Smooth rise
            gainNode.gain.linearRampToValueAtTime(
                maxGain * (0.8 + Math.random() * 0.2),
                now + duration * 0.4
            );

            // Peak hold briefly
            gainNode.gain.setValueAtTime(
                maxGain * (0.8 + Math.random() * 0.2),
                now + duration * 0.45
            );

            // Wave going out (sac) - slower decay
            gainNode.gain.linearRampToValueAtTime(
                minGain,
                now + duration
            );

            // Schedule next wave
            setTimeout(() => modulate(), duration * 1000);
        };

        // Start with phase offset
        setTimeout(() => modulate(), phase * 1000);
    }

    /**
     * Create the full ocean soundscape
     */
    createOceanscape() {
        // Layer 1: Deep rumble (low frequency waves)
        this.createWaveLayer(80, 0.5, 8, 0.1, 0.3, 0);

        // Layer 2: Mid-range wave body
        this.createWaveLayer(250, 0.8, 6, 0.08, 0.25, 1.5);

        // Layer 3: Higher frequency wash
        this.createWaveLayer(800, 1.2, 5, 0.05, 0.15, 3);

        // Layer 4: Foam and spray (high frequency)
        this.createWaveLayer(2000, 2, 4, 0.02, 0.08, 2);

        // Layer 5: Very subtle high shimmer
        this.createWaveLayer(4000, 3, 3.5, 0.01, 0.04, 4);

        // Layer 6: Additional wave for complexity
        this.createWaveLayer(400, 0.7, 7, 0.06, 0.18, 5);
    }

    /**
     * Start playing ocean sounds
     */
    start() {
        console.log('OceanSound: start() called, isPlaying:', this.isPlaying);
        if (this.isPlaying) return;

        this.init();
        this.isPlaying = true;

        // Resume context if suspended
        if (this.audioContext.state === 'suspended') {
            console.log('OceanSound: Resuming suspended context...');
            this.audioContext.resume().then(() => {
                console.log('OceanSound: Context resumed, creating soundscape');
                this._startSoundscape();
            });
        } else {
            console.log('OceanSound: Context ready, creating soundscape');
            this._startSoundscape();
        }
    }

    /**
     * Internal method to start the soundscape after context is ready
     */
    _startSoundscape() {
        // Create the ocean soundscape
        this.createOceanscape();

        // Fade in
        const now = this.audioContext.currentTime;
        this.masterGain.gain.setValueAtTime(0, now);
        this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 2);
        console.log('OceanSound: Soundscape started, volume:', this.volume);
    }

    /**
     * Stop playing ocean sounds
     */
    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;

        if (this.masterGain && this.audioContext) {
            const now = this.audioContext.currentTime;
            this.masterGain.gain.linearRampToValueAtTime(0, now + 1);

            // Clean up nodes after fade out
            setTimeout(() => {
                this.nodes.forEach(({ noise }) => {
                    try {
                        noise.stop();
                    } catch (e) {
                        // Already stopped
                    }
                });
                this.nodes = [];
            }, 1500);
        }
    }

    /**
     * Set volume (0-1)
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));

        if (this.masterGain && this.isPlaying) {
            const now = this.audioContext.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.3);
        }
    }

    /**
     * Toggle play/pause
     */
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
        return this.isPlaying;
    }

    /**
     * Check if playing
     */
    getIsPlaying() {
        return this.isPlaying;
    }
}

// Export for use
window.OceanSound = OceanSound;
