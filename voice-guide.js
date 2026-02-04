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
        this.rate = 0.85; // Slower for calm delivery
        this.pitch = 0.85; // Lower pitch for deeper feminine voice
        this.speaking = false;

        // Load French voice
        this.loadVoice();

        // Reload voices when they become available
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoice();
        }
    }

    loadVoice() {
        const voices = this.synth.getVoices();

        // Prefer French voices, prioritize high-quality feminine voices
        const frenchVoices = voices.filter(v => v.lang.startsWith('fr'));

        // Priority order for feminine French voices (high quality):
        // 1. Audrey (macOS premium) - calm feminine voice
        // 2. Amélie (macOS premium) - natural feminine
        // 3. Marie (if available) - soft feminine
        // 4. Any premium/enhanced French voice
        // 5. Local French voice
        this.voice = frenchVoices.find(v => v.name.includes('Audrey')) ||
                     frenchVoices.find(v => v.name.includes('Amelie') || v.name.includes('Amélie')) ||
                     frenchVoices.find(v => v.name.includes('Marie')) ||
                     frenchVoices.find(v => v.name.includes('Sandrine')) ||
                     frenchVoices.find(v => v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced')) ||
                     frenchVoices.find(v => v.localService) || // Prefer local voices (higher quality)
                     frenchVoices[0] ||
                     voices.find(v => v.lang.startsWith('fr')) ||
                     voices[0];

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
     * Check if TTS is available
     */
    isAvailable() {
        return 'speechSynthesis' in window;
    }

    /**
     * Get available voices for settings
     */
    getAvailableVoices() {
        return this.synth.getVoices().filter(v => v.lang.startsWith('fr'));
    }
}

// Create global instance
window.voiceGuide = new VoiceGuide();
