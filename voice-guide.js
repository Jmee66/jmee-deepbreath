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
