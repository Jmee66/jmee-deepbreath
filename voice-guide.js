/**
 * Voice Guide - Text-to-Speech for guided exercises
 * Uses Web Speech API for oral guidance
 */

class VoiceGuide {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voice = null;
        this.enabled = true;
        this.volume = 0.8;
        this.rate = 0.78; // Slower for more natural, calm delivery
        this.pitch = 1.0; // Natural pitch (avoid distortion)
        this.speaking = false;
        this.selectedVoiceName = null; // null = auto priority, string = user-selected voice
        this.onVoicesChanged = null;   // optional callback for app.js to repopulate voice selector
        this._lastVoiceCount = 0;

        // Load French voice
        this.loadVoice();

        // Reload voices when they become available (standard event)
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoice();
                if (this.onVoicesChanged) this.onVoicesChanged();
            };
        }

        // iOS workaround: voices (especially downloaded high-res ones) load late
        // and onvoiceschanged may not fire. Poll until the list stabilises.
        this._pollVoices();
    }

    _pollVoices() {
        let attempts = 0;
        const maxAttempts = 20; // up to ~10 seconds
        const interval = setInterval(() => {
            attempts++;
            const voices = this.synth.getVoices();
            if (voices.length !== this._lastVoiceCount) {
                this._lastVoiceCount = voices.length;
                this.loadVoice();
                if (this.onVoicesChanged) this.onVoicesChanged();
            }
            if (attempts >= maxAttempts) clearInterval(interval);
        }, 500);
    }

    loadVoice() {
        const voices = this.synth.getVoices();

        // Prefer French voices, prioritize high-quality feminine voices
        const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));

        // If user manually selected a voice, use it in priority
        if (this.selectedVoiceName) {
            const preferred = frenchVoices.find(v => v.name === this.selectedVoiceName);
            if (preferred) {
                this.voice = preferred;
                console.log('Voice Guide: Using preferred voice', this.voice.name);
                return;
            }
        }

        // Priority order for natural French voices:
        // 1. Premium/Enhanced voices (downloaded from macOS settings)
        // 2. Audrey, Amélie - high quality feminine voices
        // 3. Thomas - good masculine voice
        // 4. Any local French voice (better quality than remote)
        const premiumVoice = frenchVoices.find(v =>
            v.name.toLowerCase().includes('premium') ||
            v.name.toLowerCase().includes('enhanced')
        );
        const audreyVoice = frenchVoices.find(v => v.name.includes('Audrey'));
        const amelieVoice = frenchVoices.find(v => v.name.includes('Amelie') || v.name.includes('Amélie'));
        const thomasVoice = frenchVoices.find(v => v.name.includes('Thomas'));
        const localVoice = frenchVoices.find(v => v.localService);

        this.voice = premiumVoice || audreyVoice || amelieVoice || thomasVoice ||
                     localVoice || frenchVoices[0] || voices[0];

        // Log available voices for debugging
        if (frenchVoices.length > 0) {
            console.log('Voice Guide: Available French voices:',
                frenchVoices.map(v => `${v.name} (${v.lang})`).join(', '));
        }

        if (this.voice) {
            console.log('Voice Guide: Using voice', this.voice.name, this.voice.lang);
        }
    }

    /**
     * Speak text with optional callback when done
     */
    speak(text, onEnd = null) {
        if (!this.enabled || !this.synth || !text) return;

        // Cancel any ongoing speech
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);

        if (this.voice) {
            utterance.voice = this.voice;
        }

        utterance.volume = this.volume;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.lang = 'fr-FR';

        utterance.onstart = () => {
            this.speaking = true;
        };

        utterance.onend = () => {
            this.speaking = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.warn('Voice Guide error:', e);
            this.speaking = false;
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }

    /**
     * Speak with a pause before (useful for transitions)
     */
    speakWithDelay(text, delay = 500, onEnd = null) {
        setTimeout(() => {
            this.speak(text, onEnd);
        }, delay);
    }

    /**
     * Stop current speech
     */
    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.speaking = false;
        }
    }

    /**
     * Pause speech
     */
    pause() {
        if (this.synth && this.speaking) {
            this.synth.pause();
        }
    }

    /**
     * Resume speech
     */
    resume() {
        if (this.synth) {
            this.synth.resume();
        }
    }

    /**
     * Toggle voice guidance on/off
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
     * Set speech rate (0.5 to 2.0)
     */
    setRate(rate) {
        this.rate = Math.max(0.5, Math.min(2, rate));
    }

    /**
     * Set voice by name (null = revert to auto priority)
     */
    setVoice(name) {
        this.selectedVoiceName = name || null;
        this.loadVoice();
    }

    /**
     * Check if TTS is available
     */
    isAvailable() {
        return 'speechSynthesis' in window;
    }

    /**
     * Get available voices for settings.
     * Returns French voices first, then all others — so that downloaded
     * high-res voices with unexpected lang codes (iOS quirk) are still visible.
     */
    getAvailableVoices() {
        const all = this.synth.getVoices();
        const french = all.filter(v => v.lang.startsWith('fr'));
        const others = all.filter(v => !v.lang.startsWith('fr'));
        return [...french, ...others];
    }
}

// Create global instance
window.voiceGuide = new VoiceGuide();
