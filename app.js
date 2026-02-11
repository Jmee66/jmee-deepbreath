/**
 * Jmee DeepBreath Application
 * Main application logic for breathing, visualization, and apnea training
 */

// PIN universel — hash SHA-256 (PIN + salt)
const APP_PIN_HASH = 'a901ad9a879a52cc86938876ae060f26cec5b31e848e96248720a0dc95c11238';

class JmeeDeepBreathApp {
    constructor() {
        this.oceanSound = new OceanSound();
        this.currentExercise = null;
        this.isRunning = false;
        this.isPaused = false;
        this.currentPhaseIndex = 0;
        this.currentCycle = 0;
        this.phaseTimer = null;
        this.displayTimer = null;
        this.elapsedTime = 0;

        // Wake Lock to prevent screen from sleeping during exercises
        this.wakeLock = null;

        // Settings
        this.settings = this.loadSettings();

        this.init();
    }

    // ==========================================
    // Default Settings
    // ==========================================

    getDefaultSettings() {
        return {
            mode: 'auto', // 'auto' or 'manual'
            apneaMax: 120, // 2 minutes in seconds

            // Guided exercise timing
            guidedTimingMode: 'adaptive', // 'adaptive' or 'fixed'
            guidedPauseAfterVoice: 8, // seconds of pause after voice instruction

            // Auto mode percentages
            co2HoldPercent: 50,
            o2StartPercent: 30,
            o2EndPercent: 75,
            noContractionPercent: 30,

            // Exercise-specific settings
            exercises: {
                'cyclic-sighing': {
                    duration: 5,
                    inhale1: 2,
                    inhale2: 1,
                    exhale: 6
                },
                'coherent': {
                    duration: 10,
                    inhale: 5.5,
                    exhale: 5.5
                },
                'box': {
                    duration: 5,
                    boxTime: 4
                },
                'wimhof': {
                    rounds: 3,
                    breaths: 30,
                    recovery: 15
                },
                'co2-tolerance': {
                    duration: 5,
                    inhale: 4,
                    exhale: 8
                },
                'relaxation': {
                    cycles: 4,
                    inhale: 4,
                    hold: 7,
                    exhale: 8
                },
                'body-scan': {
                    zoneDuration: 60
                },
                'pettlep': {
                    phasePhysical: 60,
                    phaseEnvironment: 60,
                    phaseTask: 120,
                    phaseTiming: 120,
                    phaseLearning: 60,
                    phaseEmotion: 60,
                    phasePerspective: 60
                },
                'sophro': {
                    segmentDuration: 90
                },
                'pmr': {
                    muscleDuration: 25
                },
                'focus': {
                    duration: 10
                },
                'predive': {
                    duration: 10
                },
                'co2-table': {
                    cycles: 8,
                    holdTime: 60, // manual mode
                    restStart: 105,
                    restEnd: 15
                },
                'o2-table': {
                    cycles: 8,
                    holdStart: 36, // manual mode
                    holdEnd: 90,   // manual mode
                    restTime: 120
                },
                'no-contraction': {
                    cycles: 6,
                    holdTime: 36, // manual mode
                    restTime: 60
                },
                'diaphragm': {
                    duration: 10
                },
                'contraction-tolerance': {
                    cycles: 4,
                    weekLevel: 1,
                    restDuration: 120
                },
                'body-scan-apnea': {
                    cycles: 3,
                    breatheUpDuration: 60,
                    restDuration: 120
                },
                'breathe-up-structure': {
                    mode: 'standard'
                }
            }
        };
    }

    loadSettings() {
        const saved = localStorage.getItem('deepbreath_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure all keys exist
                return this.mergeSettings(this.getDefaultSettings(), parsed);
            } catch (e) {
                return this.getDefaultSettings();
            }
        }
        return this.getDefaultSettings();
    }

    mergeSettings(defaults, saved) {
        const result = { ...defaults };
        for (const key in saved) {
            if (typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
                result[key] = this.mergeSettings(defaults[key] || {}, saved[key]);
            } else {
                result[key] = saved[key];
            }
        }
        return result;
    }

    saveSettings() {
        localStorage.setItem('deepbreath_settings', JSON.stringify(this.settings));
        this.showToast('Paramètres enregistrés');
    }

    init() {
        // Clean up old localStorage PIN (now hardcoded)
        localStorage.removeItem('deepbreath_pin_hash');

        // Check PIN lock before anything else
        if (this.checkPINLock()) {
            // App is locked — wait for PIN verification
            return;
        }
        this.initApp();
    }

    initApp() {
        this.setupNavigation();
        this.setupSoundControls();
        this.setupVoiceControls();
        this.setupExerciseCards();
        this.setupModal();
        this.setupApneaTest();
        this.setupSettings();
        this.updatePersonalBestDisplay();
        this.applySettingsMode();
        this.setupOfflineMode();
        this.setupSpotifyControls();
        this.setupGuide();
        this.setupWakeLock();
        this.initJournal();
        this.setupSync();
    }

    initJournal() {
        if (typeof JournalView !== 'undefined') {
            window.journal = new JournalView();
            window.journal.init();
        }
    }

    // ==========================================
    // Wake Lock & Visibility (prevent sleep)
    // ==========================================

    setupWakeLock() {
        // Re-acquire wake lock when page becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isRunning) {
                this.onResumeFromBackground();
            }
        });
    }

    async requestWakeLock() {
        if (!('wakeLock' in navigator)) return;
        try {
            this.wakeLock = await navigator.wakeLock.request('screen');
            this.wakeLock.addEventListener('release', () => {
                this.wakeLock = null;
            });
        } catch (e) {
            // Wake lock request failed silently
        }
    }

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    }

    /**
     * Called when the page returns to foreground during an exercise.
     * Resumes AudioContext and speech synthesis that the browser suspended.
     */
    onResumeFromBackground() {
        // Re-acquire wake lock (browser releases it when page goes hidden)
        this.requestWakeLock();

        // Resume AudioContext for breath sounds
        if (window.breathSounds && window.breathSounds.audioContext) {
            if (window.breathSounds.audioContext.state === 'suspended') {
                window.breathSounds.audioContext.resume();
            }
        }

        // Resume AudioContext for ocean sound
        if (this.oceanSound && this.oceanSound.audioContext) {
            if (this.oceanSound.audioContext.state === 'suspended') {
                this.oceanSound.audioContext.resume();
            }
        }

        // Resume speech synthesis
        if (window.voiceGuide && window.voiceGuide.synth) {
            // speechSynthesis can get stuck after background; cancel and let
            // the next scheduled speak() call re-trigger it naturally
            if (window.voiceGuide.speaking) {
                window.voiceGuide.synth.cancel();
                window.voiceGuide.speaking = false;
            }
        }
    }

    // ==========================================
    // Offline Mode (Service Worker)
    // ==========================================

    // ==========================================
    // Sync — Cross-device via GitHub Gist
    // ==========================================

    setupSync() {
        const sync = window.dataSync;
        if (!sync) return;

        const tokenInput = document.getElementById('syncToken');
        const gistIdInput = document.getElementById('syncGistId');
        const btnSetup = document.getElementById('btnSyncSetup');
        const btnSyncNow = document.getElementById('btnSyncNow');
        const btnDisconnect = document.getElementById('btnSyncDisconnect');

        // Restore UI state
        if (sync.enabled) {
            if (tokenInput) tokenInput.value = '••••••••';
            if (gistIdInput) gistIdInput.value = sync.gistId;
            if (btnSetup) btnSetup.style.display = 'none';
            if (btnSyncNow) btnSyncNow.style.display = '';
            if (btnDisconnect) btnDisconnect.style.display = '';
            // Auto full sync on open (pull remote, merge, push merged)
            sync.fullSync().then(() => {
                this._refreshUIAfterSync();
            });
        }

        // Setup button
        if (btnSetup) {
            btnSetup.addEventListener('click', async () => {
                const token = tokenInput?.value?.trim();
                const existingGistId = gistIdInput?.value?.trim();
                if (!token || token === '••••••••') {
                    this.showToast('Entrez votre token GitHub');
                    return;
                }
                btnSetup.disabled = true;
                btnSetup.textContent = 'Configuration...';
                try {
                    if (existingGistId && existingGistId.length > 10) {
                        await sync.connect(token, existingGistId);
                        this.showToast('Connecté au Gist existant');
                    } else {
                        const gistId = await sync.setup(token);
                        if (gistIdInput) gistIdInput.value = gistId;
                        this.showToast('Sync configurée ! Gist créé.');
                    }
                    if (tokenInput) tokenInput.value = '••••••••';
                    btnSetup.style.display = 'none';
                    if (btnSyncNow) btnSyncNow.style.display = '';
                    if (btnDisconnect) btnDisconnect.style.display = '';
                } catch (e) {
                    this.showToast(`Erreur : ${e.message}`);
                }
                btnSetup.disabled = false;
                btnSetup.textContent = 'Configurer';
            });
        }

        // Manual sync — pull first (get remote + merge), then push (send merged result)
        if (btnSyncNow) {
            btnSyncNow.addEventListener('click', async () => {
                btnSyncNow.textContent = 'Sync...';
                btnSyncNow.disabled = true;
                await sync.fullSync();
                this._refreshUIAfterSync();
                this.showToast('Synchronisé ✓');
                btnSyncNow.textContent = 'Sync maintenant';
                btnSyncNow.disabled = false;
            });
        }

        // Disconnect
        if (btnDisconnect) {
            btnDisconnect.addEventListener('click', () => {
                sync.disconnect();
                if (tokenInput) tokenInput.value = '';
                if (gistIdInput) gistIdInput.value = '';
                if (btnSetup) btnSetup.style.display = '';
                if (btnSyncNow) btnSyncNow.style.display = 'none';
                btnDisconnect.style.display = 'none';
                this.showToast('Sync déconnectée');
            });
        }
    }

    _refreshUIAfterSync() {
        if (window.coach) {
            window.coach.sessions = window.coach.loadSessions();
            if (window.coach.updateStatsDisplay) window.coach.updateStatsDisplay();
            if (window.coach.renderRecentSessions) window.coach.renderRecentSessions();
        }
        if (window.journal) window.journal.render();
    }

    setupOfflineMode() {
        const offlineToggle = document.getElementById('offlineToggle');

        // Check if service workers are supported
        if (!('serviceWorker' in navigator)) {
            if (offlineToggle) offlineToggle.style.display = 'none';
            return;
        }

        // Check current offline status
        this.isOfflineMode = localStorage.getItem('offlineMode') === 'true';
        this.updateOfflineUI();

        // Listen for online/offline events
        window.addEventListener('online', () => this.handleConnectivityChange(true));
        window.addEventListener('offline', () => this.handleConnectivityChange(false));

        // Toggle button click
        if (offlineToggle) {
            offlineToggle.addEventListener('click', () => this.toggleOfflineMode());
        }

        // Register service worker if offline mode is enabled
        if (this.isOfflineMode) {
            this.registerServiceWorker();
        }
    }

    async toggleOfflineMode() {
        this.isOfflineMode = !this.isOfflineMode;
        localStorage.setItem('offlineMode', this.isOfflineMode.toString());

        if (this.isOfflineMode) {
            await this.registerServiceWorker();
            this.showToast('Mode hors-ligne activé');
        } else {
            await this.unregisterServiceWorker();
            this.showToast('Mode en ligne activé');
        }

        this.updateOfflineUI();
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration.scope);

            // Force check for updates
            registration.update();

            // Force activate waiting worker
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // New version available — activate and reload
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            console.log('New Service Worker installed, reloading...');
                            window.location.reload();
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    async unregisterServiceWorker() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }

            // Clear caches
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
                await caches.delete(cacheName);
            }
        } catch (error) {
            console.error('Service Worker unregistration failed:', error);
        }
    }

    updateOfflineUI() {
        const offlineToggle = document.getElementById('offlineToggle');

        if (offlineToggle) {
            offlineToggle.classList.toggle('offline', this.isOfflineMode);
            offlineToggle.title = this.isOfflineMode ? 'Mode hors-ligne (cliquer pour revenir en ligne)' : 'Mode en ligne (cliquer pour activer hors-ligne)';
        }

        // Show/hide offline badge if actually offline
        this.updateConnectivityBadge();
    }

    handleConnectivityChange(isOnline) {
        this.updateConnectivityBadge();

        if (!isOnline) {
            this.showToast('Connexion perdue - Mode hors-ligne actif', 'warning');
        } else if (this.isOfflineMode) {
            this.showToast('Connexion rétablie - Mode hors-ligne toujours actif');
        }
    }

    updateConnectivityBadge() {
        let badge = document.querySelector('.offline-badge');

        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'offline-badge';
            badge.textContent = 'Hors-ligne';
            document.body.appendChild(badge);
        }

        const isActuallyOffline = !navigator.onLine;
        badge.classList.toggle('visible', isActuallyOffline);
    }

    // ==========================================
    // Navigation
    // ==========================================

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetSection = link.dataset.section;

                // Update nav
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Update sections
                sections.forEach(s => s.classList.remove('active'));
                const target = document.getElementById(targetSection);
                if (target) target.classList.add('active');

                // Auto-scroll coach chat to bottom when opening
                if (targetSection === 'coach') {
                    const coachMessages = document.getElementById('coachMessages');
                    if (coachMessages) coachMessages.scrollTop = coachMessages.scrollHeight;
                }
            });
        });

        // Feature cards navigation
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const targetSection = card.dataset.goto;
                const navLink = document.querySelector(`[data-section="${targetSection}"]`);
                if (navLink) navLink.click();
            });
        });
    }

    // ==========================================
    // Ocean Sound Controls
    // ==========================================

    setupSoundControls() {
        const soundToggle = document.getElementById('soundToggle');
        const volumeRange = document.getElementById('volumeRange');
        const breathSoundToggle = document.getElementById('breathSoundToggle');
        const breathVolumeRange = document.getElementById('breathVolumeRange');

        // Ocean sound toggle
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                const isPlaying = this.oceanSound.toggle();
                soundToggle.classList.toggle('active', isPlaying);
            });
        }

        // Ocean volume
        if (volumeRange) {
            volumeRange.addEventListener('input', (e) => {
                this.oceanSound.setVolume(e.target.value / 100);
            });
        }

        // Breath sound toggle
        if (breathSoundToggle) {
            breathSoundToggle.addEventListener('click', function() {
                // Toggle state
                if (window.breathSounds) {
                    window.breathSounds.enabled = !window.breathSounds.enabled;
                    breathSoundToggle.classList.toggle('active', window.breathSounds.enabled);

                    // Play test sound when enabling
                    if (window.breathSounds.enabled) {
                        window.breathSounds.testSound();
                    }
                }
            });
        }

        // Breath sound volume
        if (breathVolumeRange && window.breathSounds) {
            // Initialize volume from slider value (slider is 0-100, we want 0-1)
            const initialVolume = breathVolumeRange.value / 100;
            window.breathSounds.setVolume(initialVolume);

            breathVolumeRange.addEventListener('input', (e) => {
                const vol = e.target.value / 100;
                window.breathSounds.setVolume(vol);
            });
        }
    }

    // ==========================================
    // Voice Guide Controls
    // ==========================================

    setupVoiceControls() {
        const voiceToggle = document.getElementById('voiceToggle');

        if (voiceToggle && window.voiceGuide) {
            // Check if voice guide is available
            if (!window.voiceGuide.isAvailable()) {
                voiceToggle.style.display = 'none';
                return;
            }

            voiceToggle.addEventListener('click', () => {
                const isEnabled = window.voiceGuide.toggle();
                voiceToggle.classList.toggle('active', isEnabled);

                // Give feedback
                if (isEnabled) {
                    window.voiceGuide.speak('Guidage vocal activé');
                }
            });
        }
    }

    // ==========================================
    // Spotify Controls
    // ==========================================

    setupSpotifyControls() {
        const spotifyBtn = document.getElementById('spotifyBtn');
        const spotifyPanel = document.getElementById('spotifyPanel');
        const spotifyClose = document.getElementById('spotifyClose');
        const spotifyCustomOpen = document.getElementById('spotifyCustomOpen');
        const spotifyCustomUrl = document.getElementById('spotifyCustomUrl');

        if (spotifyBtn && spotifyPanel) {
            spotifyBtn.addEventListener('click', () => {
                const isVisible = spotifyPanel.style.display !== 'none';
                spotifyPanel.style.display = isVisible ? 'none' : 'block';
            });

            if (spotifyClose) {
                spotifyClose.addEventListener('click', () => {
                    spotifyPanel.style.display = 'none';
                });
            }

            if (spotifyCustomOpen && spotifyCustomUrl) {
                spotifyCustomOpen.addEventListener('click', () => {
                    const url = spotifyCustomUrl.value.trim();
                    if (url && url.includes('spotify.com')) {
                        window.open(url, '_blank');
                        spotifyPanel.style.display = 'none';
                    }
                });

                spotifyCustomUrl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') spotifyCustomOpen.click();
                });
            }

            // Close panel when clicking outside
            document.addEventListener('click', (e) => {
                if (!spotifyPanel.contains(e.target) && !spotifyBtn.contains(e.target)) {
                    spotifyPanel.style.display = 'none';
                }
            });
        }
    }

    // ==========================================
    // Settings
    // ==========================================

    setupSettings() {
        // Mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.mode = btn.dataset.mode;
                this.applySettingsMode();
                this.updateComputedValues();
            });
        });

        // Apnea max time inputs
        const apneaMinutes = document.getElementById('apneaMinutes');
        const apneaSeconds = document.getElementById('apneaSeconds');

        if (apneaMinutes && apneaSeconds) {
            // Set initial values
            apneaMinutes.value = Math.floor(this.settings.apneaMax / 60);
            apneaSeconds.value = this.settings.apneaMax % 60;

            const updateApneaMax = () => {
                this.settings.apneaMax = parseInt(apneaMinutes.value || 0) * 60 + parseInt(apneaSeconds.value || 0);
                this.updateComputedValues();
                this.updatePersonalBestDisplay();
            };

            apneaMinutes.addEventListener('input', updateApneaMax);
            apneaSeconds.addEventListener('input', updateApneaMax);
        }

        // Quick test button
        const btnQuickTest = document.getElementById('btnQuickTest');
        if (btnQuickTest) {
            btnQuickTest.addEventListener('click', () => {
                document.getElementById('apneaTestModal').classList.add('active');
                this.resetApneaTest();
            });
        }

        // Percentage sliders with computed value updates
        this.setupPercentageSlider('co2HoldPercent', 'co2HoldValue');
        this.setupPercentageSlider('o2StartPercent', 'o2StartValue');
        this.setupPercentageSlider('o2EndPercent', 'o2EndValue');
        this.setupPercentageSlider('noContractionPercent', 'noContractionValue');

        // Expandable sections
        document.querySelectorAll('.btn-expand').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const targetId = btn.dataset.target;
                const target = document.getElementById(targetId);
                if (target) {
                    target.classList.toggle('collapsed');
                    btn.classList.toggle('expanded');
                }
            });

            // Also allow clicking on header
            const header = btn.closest('.settings-card-header');
            if (header) {
                header.addEventListener('click', () => {
                    btn.click();
                });
            }
        });

        // Guided timing mode toggle
        this.setupGuidedTimingToggle();

        // Exercise settings inputs
        this.setupExerciseSettingsInputs();

        // Save and reset buttons
        document.getElementById('btnSaveSettings')?.addEventListener('click', () => {
            this.collectSettingsFromUI();
            this.saveSettings();
        });

        document.getElementById('btnResetSettings')?.addEventListener('click', () => {
            if (confirm('Réinitialiser tous les paramètres ?')) {
                this.settings = this.getDefaultSettings();
                this.populateSettingsUI();
                this.saveSettings();
            }
        });

        // Populate UI with current settings
        this.populateSettingsUI();

        // Initial computed values
        this.updateComputedValues();
    }

    setupPercentageSlider(inputId, valueId) {
        const input = document.getElementById(inputId);
        const valueDisplay = document.getElementById(valueId);

        if (input && valueDisplay) {
            input.value = this.settings[inputId];
            valueDisplay.textContent = input.value + '%';

            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value + '%';
                this.settings[inputId] = parseInt(input.value);
                this.updateComputedValues();
            });
        }
    }

    updateComputedValues() {
        const apneaMax = this.settings.apneaMax;

        // CO2 table computed value
        const co2Computed = document.getElementById('co2Computed');
        if (co2Computed) {
            const val = Math.round(apneaMax * (this.settings.co2HoldPercent / 100));
            co2Computed.textContent = `= ${this.formatTime(val)}`;
        }

        // O2 table computed value
        const o2Computed = document.getElementById('o2Computed');
        if (o2Computed) {
            const start = Math.round(apneaMax * (this.settings.o2StartPercent / 100));
            const end = Math.round(apneaMax * (this.settings.o2EndPercent / 100));
            o2Computed.textContent = `= ${this.formatTime(start)} → ${this.formatTime(end)}`;
        }

        // No contraction computed value
        const ncComputed = document.getElementById('noContractionComputed');
        if (ncComputed) {
            const val = Math.round(apneaMax * (this.settings.noContractionPercent / 100));
            ncComputed.textContent = `= ${this.formatTime(val)}`;
        }

        // Update hint text based on mode
        const hint = document.getElementById('apneaHint');
        if (hint) {
            if (this.settings.mode === 'auto') {
                hint.textContent = 'En mode auto, les exercices seront calculés en % de ce temps';
            } else {
                hint.textContent = 'Vous pouvez définir les durées exactes dans les paramètres ci-dessous';
            }
        }
    }

    setupGuidedTimingToggle() {
        const timingBtns = document.querySelectorAll('.timing-btn');
        const adaptiveSettings = document.querySelectorAll('.adaptive-setting');
        const fixedSettings = document.querySelectorAll('.fixed-timing-setting');
        const hint = document.getElementById('guidedTimingHint');
        const pauseInput = document.getElementById('guidedPauseAfterVoice');

        // Set initial state from settings
        const currentMode = this.settings.guidedTimingMode || 'adaptive';
        timingBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timing === currentMode);
        });
        this.updateGuidedTimingUI(currentMode);

        // Set initial pause value
        if (pauseInput) {
            pauseInput.value = this.settings.guidedPauseAfterVoice || 8;
            pauseInput.addEventListener('change', () => {
                this.settings.guidedPauseAfterVoice = parseInt(pauseInput.value) || 8;
            });
        }

        // Toggle buttons
        timingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timingBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.guidedTimingMode = btn.dataset.timing;
                this.updateGuidedTimingUI(btn.dataset.timing);
            });
        });
    }

    updateGuidedTimingUI(mode) {
        const adaptiveSettings = document.querySelectorAll('.adaptive-setting');
        const fixedSettings = document.querySelectorAll('.fixed-timing-setting');
        const hint = document.getElementById('guidedTimingHint');

        const isAdaptive = mode === 'adaptive';

        adaptiveSettings.forEach(el => el.style.display = isAdaptive ? 'flex' : 'none');
        fixedSettings.forEach(el => el.style.display = isAdaptive ? 'none' : 'flex');

        if (hint) {
            hint.textContent = isAdaptive
                ? 'Mode adaptatif : le timer attend la fin de l\'instruction vocale + pause'
                : 'Mode fixe : chaque phase a une durée fixe en secondes';
        }
    }

    setupExerciseSettingsInputs() {
        document.querySelectorAll('.exercise-settings').forEach(section => {
            const exerciseId = section.dataset.exercise;
            const inputs = section.querySelectorAll('input[data-param], select[data-param]');

            inputs.forEach(input => {
                const param = input.dataset.param;

                // Set initial value
                if (this.settings.exercises[exerciseId] && this.settings.exercises[exerciseId][param] !== undefined) {
                    input.value = this.settings.exercises[exerciseId][param];
                }

                // Update on change
                input.addEventListener('change', () => {
                    if (!this.settings.exercises[exerciseId]) {
                        this.settings.exercises[exerciseId] = {};
                    }
                    // For select elements, keep string value; for inputs, parse as number
                    if (input.tagName === 'SELECT') {
                        this.settings.exercises[exerciseId][param] = input.value;
                    } else {
                        this.settings.exercises[exerciseId][param] = parseFloat(input.value);
                    }
                });
            });
        });
    }

    populateSettingsUI() {
        // Mode
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.settings.mode);
        });

        // Guided timing mode
        document.querySelectorAll('.timing-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.timing === this.settings.guidedTimingMode);
        });
        const pauseInput = document.getElementById('guidedPauseAfterVoice');
        if (pauseInput) {
            pauseInput.value = this.settings.guidedPauseAfterVoice || 8;
        }
        this.updateGuidedTimingUI(this.settings.guidedTimingMode || 'adaptive');

        // Apnea max
        const apneaMinutes = document.getElementById('apneaMinutes');
        const apneaSeconds = document.getElementById('apneaSeconds');
        if (apneaMinutes) apneaMinutes.value = Math.floor(this.settings.apneaMax / 60);
        if (apneaSeconds) apneaSeconds.value = this.settings.apneaMax % 60;

        // Percentages
        ['co2HoldPercent', 'o2StartPercent', 'o2EndPercent', 'noContractionPercent'].forEach(key => {
            const input = document.getElementById(key);
            const valueDisplay = document.getElementById(key.replace('Percent', 'Value'));
            if (input) {
                input.value = this.settings[key];
                if (valueDisplay) valueDisplay.textContent = this.settings[key] + '%';
            }
        });

        // Exercise settings
        document.querySelectorAll('.exercise-settings').forEach(section => {
            const exerciseId = section.dataset.exercise;
            const inputs = section.querySelectorAll('input[data-param], select[data-param]');

            inputs.forEach(input => {
                const param = input.dataset.param;
                if (this.settings.exercises[exerciseId]?.[param] !== undefined) {
                    input.value = this.settings.exercises[exerciseId][param];
                }
            });
        });

        this.applySettingsMode();
    }

    collectSettingsFromUI() {
        // Mode
        const activeMode = document.querySelector('.mode-btn.active');
        if (activeMode) {
            this.settings.mode = activeMode.dataset.mode;
        }

        // Guided timing mode
        const activeTimingBtn = document.querySelector('.timing-btn.active');
        if (activeTimingBtn) {
            this.settings.guidedTimingMode = activeTimingBtn.dataset.timing;
        }
        const pauseInput = document.getElementById('guidedPauseAfterVoice');
        if (pauseInput) {
            this.settings.guidedPauseAfterVoice = parseInt(pauseInput.value) || 8;
        }

        // Apnea max
        const apneaMinutes = document.getElementById('apneaMinutes');
        const apneaSeconds = document.getElementById('apneaSeconds');
        if (apneaMinutes && apneaSeconds) {
            this.settings.apneaMax = parseInt(apneaMinutes.value) * 60 + parseInt(apneaSeconds.value);
        }

        // Percentages
        ['co2HoldPercent', 'o2StartPercent', 'o2EndPercent', 'noContractionPercent'].forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                this.settings[key] = parseInt(input.value);
            }
        });

        // Exercise settings
        document.querySelectorAll('.exercise-settings').forEach(section => {
            const exerciseId = section.dataset.exercise;
            const inputs = section.querySelectorAll('input[data-param], select[data-param]');

            if (!this.settings.exercises[exerciseId]) {
                this.settings.exercises[exerciseId] = {};
            }

            inputs.forEach(input => {
                const param = input.dataset.param;
                if (input.tagName === 'SELECT') {
                    this.settings.exercises[exerciseId][param] = input.value;
                } else {
                    this.settings.exercises[exerciseId][param] = parseFloat(input.value);
                }
            });
        });
    }

    applySettingsMode() {
        const isManual = this.settings.mode === 'manual';

        document.body.classList.toggle('manual-mode', isManual);
        document.body.classList.toggle('auto-mode', !isManual);

        // CSS handles the visibility now via body classes
    }

    showToast(message, type = 'success') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ==========================================
    // Get Exercise Parameters
    // ==========================================

    getExerciseParams(exerciseId) {
        const baseExercise = EXERCISES[exerciseId];
        if (!baseExercise) {
            this.showToast('Exercice inconnu', 'warning');
            return null;
        }
        const userSettings = this.settings.exercises[exerciseId] || {};

        // Clone the base exercise
        const exercise = JSON.parse(JSON.stringify(baseExercise));

        // Apply user settings based on exercise type
        if (exercise.isApneaTable) {
            return this.getApneaTableParams(exerciseId, exercise, userSettings);
        }

        // Contraction tolerance
        if (exercise.isContractionTable) {
            exercise.cycles = userSettings.cycles || exercise.cycles;
            exercise.weekLevel = userSettings.weekLevel || exercise.weekLevel;
            exercise.restDuration = userSettings.restDuration || exercise.restDuration;
            return exercise;
        }

        // Body scan apnea
        if (exercise.isApneaWithGuidance) {
            exercise.cycles = userSettings.cycles || exercise.cycles;
            exercise.breatheUpDuration = userSettings.breatheUpDuration || exercise.breatheUpDuration;
            exercise.restDuration = userSettings.restDuration || exercise.restDuration;
            return exercise;
        }

        // Standard breathing exercises
        switch (exerciseId) {
            case 'cyclic-sighing':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale1 || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.inhale2 || exercise.phases[1].duration;
                exercise.phases[2].duration = userSettings.exhale || exercise.phases[2].duration;
                break;

            case 'coherent':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.exhale || exercise.phases[1].duration;
                break;

            case 'box':
                exercise.duration = userSettings.duration || exercise.duration;
                const boxTime = userSettings.boxTime || 4;
                exercise.phases.forEach(p => p.duration = boxTime);
                break;

            case 'wimhof':
                exercise.rounds = userSettings.rounds || exercise.rounds;
                exercise.breathsPerRound = userSettings.breaths || exercise.breathsPerRound;
                exercise.recoveryPhase.duration = userSettings.recovery || exercise.recoveryPhase.duration;
                break;

            case 'co2-tolerance':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.exhale || exercise.phases[1].duration;
                break;

            case 'relaxation':
                exercise.cycles = userSettings.cycles || exercise.cycles;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.hold || exercise.phases[1].duration;
                exercise.phases[2].duration = userSettings.exhale || exercise.phases[2].duration;
                break;

            case 'pranayama-142':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.hold || exercise.phases[1].duration;
                exercise.phases[2].duration = userSettings.exhale || exercise.phases[2].duration;
                break;

            case 'nadi-shodhana':
                exercise.duration = userSettings.duration || exercise.duration;
                if (userSettings.phaseTime) {
                    exercise.phases.forEach(p => p.duration = userSettings.phaseTime);
                }
                break;

            case 'kapalabhati':
                exercise.cycles = userSettings.cycles || exercise.cycles;
                if (userSettings.speed) {
                    const half = userSettings.speed / 2;
                    exercise.phases[0].duration = half;
                    exercise.phases[1].duration = half;
                }
                break;

            case 'ujjayi':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.exhale || exercise.phases[1].duration;
                break;

            case 'bhramari':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.exhale || exercise.phases[1].duration;
                break;

            case 'surya-bhedana':
                exercise.duration = userSettings.duration || exercise.duration;
                exercise.phases[0].duration = userSettings.inhale || exercise.phases[0].duration;
                exercise.phases[1].duration = userSettings.hold || exercise.phases[1].duration;
                exercise.phases[2].duration = userSettings.exhale || exercise.phases[2].duration;
                break;

            case 'diaphragm':
                exercise.duration = userSettings.duration || exercise.duration;
                break;
        }

        // Guided exercises
        if (exercise.isGuided && exercise.segments) {
            if (exerciseId === 'pettlep') {
                // PETTLEP: each phase has its own duration setting
                const phaseMapping = {
                    'Physical': 'phasePhysical',
                    'Environment': 'phaseEnvironment',
                    'Task': 'phaseTask',
                    'Timing': 'phaseTiming',
                    'Learning': 'phaseLearning',
                    'Emotion': 'phaseEmotion',
                    'Perspective': 'phasePerspective'
                };

                exercise.segments.forEach(segment => {
                    const settingKey = phaseMapping[segment.phase];
                    if (settingKey && userSettings[settingKey]) {
                        segment.duration = userSettings[settingKey];
                    }
                });
            } else {
                const durationKey = {
                    'body-scan': 'zoneDuration',
                    'sophro': 'segmentDuration',
                    'pmr': 'muscleDuration',
                    'focus': 'duration',
                    'predive': 'duration'
                }[exerciseId];

                if (durationKey && userSettings[durationKey]) {
                    if (durationKey === 'duration') {
                        // Scale all segments proportionally
                        const originalTotal = exercise.segments.reduce((sum, s) => sum + s.duration, 0);
                        const newTotal = userSettings.duration * 60;
                        const ratio = newTotal / originalTotal;
                        exercise.segments.forEach(s => s.duration = Math.round(s.duration * ratio));
                    } else {
                        // Set all segments to same duration
                        exercise.segments.forEach(s => s.duration = userSettings[durationKey]);
                    }
                }
            }
        }

        return exercise;
    }

    getApneaTableParams(exerciseId, exercise, userSettings) {
        const isAutoMode = this.settings.mode === 'auto';
        const apneaMax = this.settings.apneaMax;

        exercise.cycles = userSettings.cycles || exercise.cycles;

        if (exerciseId === 'co2-table') {
            if (isAutoMode) {
                exercise.holdTime = Math.round(apneaMax * (this.settings.co2HoldPercent / 100));
            } else {
                exercise.holdTime = userSettings.holdTime || 60;
            }
            exercise.restStart = userSettings.restStart || 105;
            exercise.restEnd = userSettings.restEnd || 15;

            // Generate rest pattern
            const restStep = exercise.cycles > 1 ? (exercise.restStart - exercise.restEnd) / (exercise.cycles - 1) : 0;
            exercise.restPattern = [];
            for (let i = 0; i < exercise.cycles; i++) {
                exercise.restPattern.push(Math.round(exercise.restStart - (restStep * i)));
            }
        }

        if (exerciseId === 'o2-table') {
            let holdStart, holdEnd;
            if (isAutoMode) {
                holdStart = Math.round(apneaMax * (this.settings.o2StartPercent / 100));
                holdEnd = Math.round(apneaMax * (this.settings.o2EndPercent / 100));
            } else {
                holdStart = userSettings.holdStart || 36;
                holdEnd = userSettings.holdEnd || 90;
            }
            exercise.restDuration = userSettings.restTime || 120;

            // Generate hold pattern
            const holdStep = exercise.cycles > 1 ? (holdEnd - holdStart) / (exercise.cycles - 1) : 0;
            exercise.holdPattern = [];
            for (let i = 0; i < exercise.cycles; i++) {
                exercise.holdPattern.push(Math.round(holdStart + (holdStep * i)));
            }
        }

        if (exerciseId === 'no-contraction') {
            if (isAutoMode) {
                exercise.holdTime = Math.round(apneaMax * (this.settings.noContractionPercent / 100));
            } else {
                exercise.holdTime = userSettings.holdTime || 36;
            }
            exercise.restDuration = userSettings.restTime || 60;
        }

        return exercise;
    }

    // ==========================================
    // Exercise Cards
    // ==========================================

    setupExerciseCards() {
        document.querySelectorAll('.exercise-card').forEach(card => {
            const startBtn = card.querySelector('.btn-start');
            if (startBtn) {
                startBtn.addEventListener('click', async () => {
                    // Initialize audio on user click (required by browsers)
                    if (window.breathSounds) {
                        // Create AudioContext synchronously on click
                        if (!window.breathSounds.audioContext) {
                            window.breathSounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        }
                        if (window.breathSounds.audioContext.state === 'suspended') {
                            await window.breathSounds.audioContext.resume();
                        }
                        // Make sure sounds are enabled
                        window.breathSounds.enabled = true;
                    }
                    const exerciseId = card.dataset.exercise;
                    this.startExercise(exerciseId);
                });
            }

            const configBtn = card.querySelector('.btn-config');
            if (configBtn) {
                configBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const exerciseId = configBtn.dataset.exercise;
                    this.navigateToExerciseSettings(exerciseId);
                });
            }
        });
    }

    navigateToExerciseSettings(exerciseId) {
        // Navigate to settings section
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('[data-section="settings"]').classList.add('active');

        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('settings').classList.add('active');

        // Find the exercise settings section and scroll to it
        const exerciseSettings = document.querySelector(`.exercise-settings[data-exercise="${exerciseId}"]`);
        if (exerciseSettings) {
            // Make sure the parent settings-card-body is visible
            const cardBody = exerciseSettings.closest('.settings-card-body');
            if (cardBody && cardBody.classList.contains('collapsed')) {
                cardBody.classList.remove('collapsed');
                const expandBtn = cardBody.previousElementSibling?.querySelector('.btn-expand');
                if (expandBtn) expandBtn.classList.add('expanded');
            }

            // Scroll to and highlight the exercise settings
            setTimeout(() => {
                exerciseSettings.scrollIntoView({ behavior: 'smooth', block: 'center' });
                exerciseSettings.classList.add('highlight');
                setTimeout(() => exerciseSettings.classList.remove('highlight'), 2000);
            }, 100);
        }
    }

    // ==========================================
    // Modal Controls
    // ==========================================

    setupModal() {
        const modal = document.getElementById('exerciseModal');
        const closeBtn = document.getElementById('modalClose');
        const pauseBtn = document.getElementById('btnPause');
        const stopBtn = document.getElementById('btnStop');
        const resetBtn = document.getElementById('btnReset');

        closeBtn.addEventListener('click', () => this.closeExercise());
        pauseBtn.addEventListener('click', () => this.togglePause());
        stopBtn.addEventListener('click', () => this.closeExercise());
        resetBtn.addEventListener('click', () => this.resetExercise());

        // Contraction button
        const contractionBtn = document.getElementById('btnMarkContraction');
        if (contractionBtn) {
            contractionBtn.addEventListener('click', () => this.markContraction());
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeExercise();
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
            if (!modal.classList.contains('active')) return;

            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            } else if (e.code === 'Escape') {
                this.closeExercise();
            }
        });
    }

    // ==========================================
    // Exercise Control
    // ==========================================

    async startExercise(exerciseId) {
        const exercise = this.getExerciseParams(exerciseId);
        if (!exercise) return;

        this.currentExercise = exercise;
        this.currentExercise.id = exerciseId;
        this.isRunning = true;
        this.isPaused = false;
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.elapsedTime = 0;

        // Prevent screen from sleeping during exercise
        this.requestWakeLock();

        // Initialize breath sounds - ensure AudioContext is running
        if (window.breathSounds) {
            // Create AudioContext if it doesn't exist
            if (!window.breathSounds.audioContext) {
                window.breathSounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            // Resume if suspended — MUST await on mobile
            if (window.breathSounds.audioContext.state === 'suspended') {
                try { await window.breathSounds.audioContext.resume(); } catch(e) {}
            }
            // Force enable sounds
            window.breathSounds.enabled = true;
        }

        // Show modal
        const modal = document.getElementById('exerciseModal');
        modal.classList.add('active');

        // Update title
        document.getElementById('exerciseTitle').textContent = exercise.name;

        // Determine exercise type and start
        if (exercise.isApneaWithGuidance) {
            this.startApneaWithGuidance();
        } else if (exercise.isContractionTable) {
            this.startContractionTable();
        } else if (exercise.isApneaTable) {
            this.startApneaTable();
        } else if (exercise.isGuided) {
            this.startGuidedExercise();
        } else if (exercise.isWimHof) {
            this.startWimHofExercise();
        } else {
            this.startBreathingExercise();
        }
    }

    // ==========================================
    // Standard Breathing Exercise
    // ==========================================

    startBreathingExercise() {
        const exercise = this.currentExercise;
        const totalCycles = exercise.cycles || Math.floor(exercise.duration * 60 / this.getCycleDuration());

        document.getElementById('cycleCounter').textContent = `Cycle ${this.currentCycle} / ${totalCycles}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        // Start after brief delay
        setTimeout(() => {
            this.runBreathingPhase(totalCycles);
        }, 2000);
    }

    getCycleDuration() {
        return this.currentExercise.phases.reduce((sum, p) => sum + p.duration, 0);
    }

    runBreathingPhase(totalCycles) {
        if (!this.isRunning) return;
        if (this.isPaused) {
            // Stop breath sounds when paused
            if (window.breathSounds) window.breathSounds.stop();
            setTimeout(() => this.runBreathingPhase(totalCycles), 100);
            return;
        }

        const exercise = this.currentExercise;
        const phase = exercise.phases[this.currentPhaseIndex];

        // Get the previous phase action (for hold detection)
        let previousAction = null;
        if (this.currentPhaseIndex > 0) {
            previousAction = exercise.phases[this.currentPhaseIndex - 1].action;
        } else if (this.currentCycle > 1) {
            // If we're at the start of a new cycle, previous was the last phase
            previousAction = exercise.phases[exercise.phases.length - 1].action;
        }

        // Update UI with previous action context
        this.updateBreathPhase(phase, previousAction);
        document.getElementById('exerciseInstruction').textContent =
            exercise.instructions[phase.name] || phase.instruction || '';
        document.getElementById('cycleCounter').textContent = `Cycle ${this.currentCycle} / ${totalCycles}`;

        // Play breath sound for this phase (only for non-guided exercises)
        if (window.breathSounds && !exercise.isGuided) {
            // For hold phases, determine if it's holdEmpty based on previous action
            let soundPhase = phase.action;
            if (phase.action === 'hold' && previousAction === 'exhale') {
                soundPhase = 'holdEmpty';
            }
            window.breathSounds.playPhase(soundPhase, phase.duration);
        }

        // Start phase timer
        this.startPhaseTimer(phase.duration, () => {
            this.currentPhaseIndex++;

            if (this.currentPhaseIndex >= exercise.phases.length) {
                this.currentPhaseIndex = 0;
                this.currentCycle++;

                if (this.currentCycle > totalCycles) {
                    this.completeExercise();
                    return;
                }
            }

            this.runBreathingPhase(totalCycles);
        });
    }

    updateBreathPhase(phase, previousAction = null) {
        const circle = document.getElementById('breathCircle');
        const phaseText = document.getElementById('breathPhase');

        // Remove all state classes
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        // Set the transition duration to match the phase duration
        circle.style.setProperty('--phase-duration', `${phase.duration}s`);

        // Determine the correct action class
        let actionClass = phase.action;

        // For hold phases, determine if lungs are full or empty based on previous action
        if (phase.action === 'hold') {
            // If we just inhaled, we're holding with full lungs
            // If we just exhaled, we're holding with empty lungs
            if (previousAction === 'exhale') {
                actionClass = 'holdEmpty';
            } else {
                actionClass = 'hold'; // Default to full lungs hold
            }
        }

        // Add appropriate class
        circle.classList.add(actionClass, 'active');

        // Update phase text
        phaseText.textContent = phase.name;

        // Return the action used (for tracking in next phase)
        return phase.action;
    }

    startPhaseTimer(duration, callback) {
        if (this.phaseTimer) clearInterval(this.phaseTimer);

        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        const durationMs = Math.round(duration * 1000);
        const startTime = Date.now();
        let pausedTime = 0;
        let pauseStart = null;

        // Initial display
        timerDisplay.textContent = duration.toFixed(1);
        progressBar.style.strokeDashoffset = circumference;

        this.phaseTimer = setInterval(() => {
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) {
                pausedTime += Date.now() - pauseStart;
                pauseStart = null;
            }

            const elapsed = Date.now() - startTime - pausedTime;
            const remainingMs = durationMs - elapsed;
            const remaining = Math.max(0, remainingMs / 1000);

            // Update timer display
            timerDisplay.textContent = remaining.toFixed(1);

            // Update elapsed time
            this.elapsedTime = elapsed / 1000;

            // Update progress
            const progress = Math.min(1, elapsed / durationMs);
            progressBar.style.strokeDashoffset = circumference * (1 - progress);

            if (remainingMs <= 50) {
                clearInterval(this.phaseTimer);
                this.phaseTimer = null;
                timerDisplay.textContent = '0.0';
                progressBar.style.strokeDashoffset = 0;
                callback();
            }
        }, 100);
    }

    // ==========================================
    // Wim Hof Exercise
    // ==========================================

    startWimHofExercise() {
        const exercise = this.currentExercise;
        this.wimHofRound = 1;
        this.wimHofBreath = 1;

        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;
        document.getElementById('cycleCounter').textContent = `Round ${this.wimHofRound} / ${exercise.rounds}`;

        setTimeout(() => {
            this.runWimHofBreathing();
        }, 3000);
    }

    runWimHofBreathing() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;

        if (this.wimHofBreath > exercise.breathsPerRound) {
            // Move to retention phase
            this.runWimHofRetention();
            return;
        }

        document.getElementById('cycleCounter').textContent =
            `Round ${this.wimHofRound}/${exercise.rounds} — Respiration ${this.wimHofBreath}/${exercise.breathsPerRound}`;

        // Inhale
        const inhalePhase = exercise.phases[0];
        this.updateBreathPhase(inhalePhase, 'exhale'); // Previous was exhale
        document.getElementById('exerciseInstruction').textContent = exercise.instructions[inhalePhase.name];

        // Play breath sound
        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', inhalePhase.duration);
        }

        this.startPhaseTimer(inhalePhase.duration, () => {
            // Exhale
            const exhalePhase = exercise.phases[1];
            this.updateBreathPhase(exhalePhase, 'inhale'); // Previous was inhale
            document.getElementById('exerciseInstruction').textContent = exercise.instructions[exhalePhase.name];

            // Play breath sound
            if (window.breathSounds) {
                window.breathSounds.playPhase('exhale', exhalePhase.duration);
            }

            this.startPhaseTimer(exhalePhase.duration, () => {
                this.wimHofBreath++;
                this.runWimHofBreathing();
            });
        });
    }

    runWimHofRetention() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;

        document.getElementById('exerciseInstruction').textContent =
            'Après votre dernière expiration, retenez aussi longtemps que possible. Appuyez sur ESPACE quand vous devez respirer.';

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale');
        circle.classList.add('hold', 'active');
        document.getElementById('breathPhase').textContent = 'Rétention';

        // Start counting up using Date.now() for accuracy
        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        progressBar.style.strokeDasharray = circumference;
        const estimatedMax = (this.settings?.apneaMax || 120) * 1.2; // 20% above user max
        const retentionStart = Date.now();
        let pausedTime = 0;
        let pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        this.phaseTimer = setInterval(() => {
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) {
                pausedTime += Date.now() - pauseStart;
                pauseStart = null;
            }

            const retentionTime = (Date.now() - retentionStart - pausedTime) / 1000;
            timerDisplay.textContent = this.formatTime(retentionTime);
            // Progressive fill based on estimated max retention
            const progress = Math.min(retentionTime / estimatedMax, 1);
            progressBar.style.strokeDashoffset = circumference * (1 - progress);
        }, 100);

        // Wait for spacebar — store on this for cleanup in closeExercise()
        this.wimHofSpaceHandler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.code === 'Space' && this.isRunning) {
                e.preventDefault();
                e.stopImmediatePropagation();
                clearInterval(this.phaseTimer);
                document.removeEventListener('keydown', this.wimHofSpaceHandler);
                this.wimHofSpaceHandler = null;
                this.runWimHofRecovery();
            }
        };
        document.addEventListener('keydown', this.wimHofSpaceHandler);
    }

    runWimHofRecovery() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;

        document.getElementById('exerciseInstruction').textContent =
            `Inspirez à fond et retenez ${exercise.recoveryPhase.duration} secondes`;

        this.updateBreathPhase({ name: 'Récupération', action: 'inhale', duration: 2 }, 'hold');

        // Brief inhale
        setTimeout(() => {
            const circle = document.getElementById('breathCircle');
            circle.classList.remove('inhale');
            circle.classList.add('hold');
            document.getElementById('breathPhase').textContent = 'Rétention';

            this.startPhaseTimer(exercise.recoveryPhase.duration, () => {
                this.wimHofRound++;

                if (this.wimHofRound > exercise.rounds) {
                    this.completeExercise();
                } else {
                    this.wimHofBreath = 1;
                    document.getElementById('exerciseInstruction').textContent =
                        `Round ${this.wimHofRound} - Recommencez les respirations`;

                    setTimeout(() => this.runWimHofBreathing(), 2000);
                }
            });
        }, 2000);
    }

    // ==========================================
    // Guided Exercise (Body Scan, PETTLEP, etc.)
    // ==========================================

    startGuidedExercise() {
        const exercise = this.currentExercise;
        this.guidedSegmentIndex = 0;

        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;
        document.getElementById('cycleCounter').textContent =
            `${this.guidedSegmentIndex + 1} / ${exercise.segments.length}`;

        // Hide breath circle animation for guided exercises
        document.getElementById('breathCircle').classList.remove('inhale', 'exhale', 'hold', 'holdEmpty');
        document.getElementById('breathPhase').textContent = 'Guidé';

        // Speak intro if voice guide is available and enabled
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => {
                    this.runGuidedSegment();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                this.runGuidedSegment();
            }, 3000);
        }
    }

    runGuidedSegment() {
        if (!this.isRunning) return;
        if (this.isPaused) {
            // Also pause voice if paused
            if (window.voiceGuide) window.voiceGuide.pause();
            setTimeout(() => this.runGuidedSegment(), 100);
            return;
        }

        // Resume voice if was paused
        if (window.voiceGuide) window.voiceGuide.resume();

        const exercise = this.currentExercise;

        if (this.guidedSegmentIndex >= exercise.segments.length) {
            this.completeExercise();
            return;
        }

        const segment = exercise.segments[this.guidedSegmentIndex];
        const phaseName = segment.zone || segment.phase || segment.muscle || 'Guidé';

        // Update UI
        document.getElementById('breathPhase').textContent = phaseName;
        document.getElementById('exerciseInstruction').textContent = segment.instruction;
        document.getElementById('cycleCounter').textContent =
            `${this.guidedSegmentIndex + 1} / ${exercise.segments.length}`;

        const isAdaptive = this.settings.guidedTimingMode === 'adaptive';
        const pauseAfterVoice = this.settings.guidedPauseAfterVoice || 8;

        if (isAdaptive && window.voiceGuide && window.voiceGuide.enabled) {
            // ADAPTIVE MODE: wait for voice to finish + pause
            const voiceStartTime = Date.now();

            window.voiceGuide.speak(segment.instruction, () => {
                // Voice finished speaking
                if (!this.isRunning) return;

                const voiceDuration = (Date.now() - voiceStartTime) / 1000;
                const totalDuration = voiceDuration + pauseAfterVoice;

                // Start a countdown for the pause period
                this.startPhaseTimer(pauseAfterVoice, () => {
                    this.guidedSegmentIndex++;
                    this.runGuidedSegment();
                });
            });

            // Show an estimated timer while voice is speaking
            // Use a simple counting timer that will be replaced when voice ends
            this.startAdaptiveVoiceTimer(segment.instruction);
        } else if (isAdaptive && (!window.voiceGuide || !window.voiceGuide.enabled)) {
            // Adaptive mode but voice is off: estimate duration from text length
            const estimatedSpeechTime = Math.max(3, segment.instruction.length / 15);
            const totalDuration = estimatedSpeechTime + pauseAfterVoice;

            this.startPhaseTimer(totalDuration, () => {
                this.guidedSegmentIndex++;
                this.runGuidedSegment();
            });
        } else {
            // FIXED MODE: use segment.duration as before
            if (window.voiceGuide && window.voiceGuide.enabled) {
                window.voiceGuide.speak(segment.instruction);
            }

            this.startPhaseTimer(segment.duration, () => {
                this.guidedSegmentIndex++;
                this.runGuidedSegment();
            });
        }
    }

    /**
     * Show a count-up timer while voice is speaking (adaptive mode)
     */
    startAdaptiveVoiceTimer(instruction) {
        // Clear any existing timer
        if (this.phaseTimer) clearInterval(this.phaseTimer);

        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const startTime = Date.now();
        let pausedTime = 0;
        let pauseStart = null;

        // Estimate total time for progress bar
        const estimatedTotal = Math.max(5, instruction.length / 12);

        timerDisplay.textContent = '...';

        this.phaseTimer = setInterval(() => {
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) {
                pausedTime += Date.now() - pauseStart;
                pauseStart = null;
            }

            const elapsed = (Date.now() - startTime - pausedTime) / 1000;

            // Show elapsed time
            timerDisplay.textContent = elapsed.toFixed(1);

            // Approximate progress
            const progress = Math.min(elapsed / estimatedTotal, 0.95);
            const circumference = 2 * Math.PI * 90;
            progressBar.style.strokeDashoffset = circumference * (1 - progress);
        }, 100);
    }

    // ==========================================
    // Contraction Tolerance Table
    // ==========================================

    startContractionTable() {
        const exercise = this.currentExercise;
        this.contractionCycle = 1;
        this.contractionCount = 0;
        this.contractionOnset = null;
        this.contractionHoldStart = null;
        this.contractionCueIndex = 0;
        this.contractionHistory = [];

        const weekConfig = exercise.weekConfigs[exercise.weekLevel] || exercise.weekConfigs[1];
        this.contractionBeyond = weekConfig.beyondContraction;

        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.contractionCycle} / ${exercise.cycles}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        // Show contraction UI
        const btnContraction = document.getElementById('btnMarkContraction');
        const counterDiv = document.getElementById('contractionCounter');
        if (btnContraction) btnContraction.style.display = 'none'; // Hidden during rest
        if (counterDiv) {
            counterDiv.style.display = 'block';
            counterDiv.textContent = 'Contractions : 0';
        }

        // Speak intro
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => this.runContractionCycle(), 1000);
            });
        } else {
            setTimeout(() => this.runContractionCycle(), 3000);
        }
    }

    runContractionCycle() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;

        if (this.contractionCycle > exercise.cycles) {
            this.completeContractionExercise();
            return;
        }

        // Reset contraction tracking for this cycle
        this.contractionCount = 0;
        this.contractionOnset = null;
        this.contractionCueIndex = 0;

        const counterDiv = document.getElementById('contractionCounter');
        if (counterDiv) counterDiv.textContent = 'Contractions : 0';

        // Hide contraction button during rest
        const btnContraction = document.getElementById('btnMarkContraction');
        if (btnContraction) btnContraction.style.display = 'none';

        // Rest phase (breathe)
        document.getElementById('breathPhase').textContent = 'Respirez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.breathe;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.contractionCycle} / ${exercise.cycles} — Repos`;

        this.updateBreathPhase({ name: 'Respirez', action: 'inhale', duration: exercise.restDuration }, 'hold');

        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', exercise.restDuration);
        }

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.breathe);
        }

        this.startPhaseTimer(exercise.restDuration, () => {
            this.runContractionHold();
        });
    }

    runContractionHold() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;

        // Show contraction button
        const btnContraction = document.getElementById('btnMarkContraction');
        if (btnContraction) btnContraction.style.display = 'block';

        document.getElementById('breathPhase').textContent = 'Apnée';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.hold;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.contractionCycle} / ${exercise.cycles} — Apnée`;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'holdEmpty');
        circle.classList.add('hold', 'active');
        circle.style.setProperty('--phase-duration', '1s');

        // Count up timer (open-ended hold)
        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        this.contractionHoldStart = Date.now();
        let pausedTime = 0;
        let pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        if (window.breathSounds) {
            window.breathSounds.playPhase('hold', 300); // Long hold
        }

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.hold);
        }

        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(this.phaseTimer);
                return;
            }
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) {
                pausedTime += Date.now() - pauseStart;
                pauseStart = null;
            }

            const elapsed = (Date.now() - this.contractionHoldStart - pausedTime) / 1000;
            timerDisplay.textContent = this.formatTime(elapsed);

            // Progress based on estimated max (use apneaMax as reference)
            const estimatedMax = this.settings.apneaMax || 120;
            const progress = Math.min(elapsed / estimatedMax, 1);
            progressBar.style.strokeDashoffset = circumference * (1 - progress);

            // Check if we should auto-end (beyondContraction seconds after first contraction)
            if (this.contractionOnset !== null) {
                const timeSinceContraction = elapsed - this.contractionOnset;
                if (timeSinceContraction >= this.contractionBeyond) {
                    this.endContractionHold(elapsed);
                }
            }
        }, 100);
    }

    markContraction() {
        if (!this.isRunning || this.isPaused) return;

        const exercise = this.currentExercise;
        const holdStart = this.contractionHoldStart;
        if (!holdStart) return;

        const elapsed = (Date.now() - holdStart) / 1000;

        this.contractionCount++;

        // Record onset of first contraction
        if (this.contractionCount === 1) {
            this.contractionOnset = elapsed;
        }

        // Update counter display
        const counterDiv = document.getElementById('contractionCounter');
        if (counterDiv) counterDiv.textContent = `Contractions : ${this.contractionCount}`;

        // Show instruction text
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.contraction;

        // Voice reframing cue
        if (window.voiceGuide && window.voiceGuide.enabled) {
            const cue = exercise.reframingCues[this.contractionCueIndex % exercise.reframingCues.length];
            window.voiceGuide.speak(cue);
            this.contractionCueIndex++;
        }

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }

    endContractionHold(holdDuration) {
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;

        // Hide contraction button
        const btnContraction = document.getElementById('btnMarkContraction');
        if (btnContraction) btnContraction.style.display = 'none';

        // Save cycle data
        this.contractionHistory.push({
            cycle: this.contractionCycle,
            holdDuration: Math.round(holdDuration),
            contractionCount: this.contractionCount,
            contractionOnset: this.contractionOnset ? Math.round(this.contractionOnset) : null
        });

        // Voice feedback
        const feedback = `Bien joué. ${this.formatTime(holdDuration)} d'apnée, ${this.contractionCount} contractions.`;
        document.getElementById('exerciseInstruction').textContent = feedback;

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(feedback);
        }

        // Move to next cycle
        this.contractionCycle++;
        setTimeout(() => this.runContractionCycle(), 3000);
    }

    completeContractionExercise() {
        // Save contraction history to localStorage
        try {
            const historyKey = 'deepbreath_contraction_history';
            const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
            existing.push({
                date: new Date().toISOString(),
                weekLevel: this.currentExercise.weekLevel,
                cycles: this.contractionHistory
            });
            // Keep last 50 sessions
            if (existing.length > 50) existing.splice(0, existing.length - 50);
            localStorage.setItem(historyKey, JSON.stringify(existing));
        } catch (e) {
            console.warn('Could not save contraction history:', e);
        }

        // Hide contraction UI
        const btnContraction = document.getElementById('btnMarkContraction');
        const counterDiv = document.getElementById('contractionCounter');
        if (btnContraction) btnContraction.style.display = 'none';
        if (counterDiv) counterDiv.style.display = 'none';

        this.completeExercise();
    }

    // ==========================================
    // Apnea with Guided Body Scan
    // ==========================================

    startApneaWithGuidance() {
        const exercise = this.currentExercise;
        this.apneaGuidedCycle = 1;

        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.apneaGuidedCycle} / ${exercise.cycles}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        // Speak intro
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => this.runApneaGuidedCycle(), 1000);
            });
        } else {
            setTimeout(() => this.runApneaGuidedCycle(), 3000);
        }
    }

    runApneaGuidedCycle() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;

        if (this.apneaGuidedCycle > exercise.cycles) {
            this.completeExercise();
            return;
        }

        // Breathe-up phase
        document.getElementById('breathPhase').textContent = 'Respirez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.breathe;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.apneaGuidedCycle} / ${exercise.cycles} — Breathe-up`;

        this.updateBreathPhase({ name: 'Respirez', action: 'inhale', duration: exercise.breatheUpDuration }, 'hold');

        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', exercise.breatheUpDuration);
        }

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.breathe);
        }

        this.startPhaseTimer(exercise.breatheUpDuration, () => {
            this.runGuidedScanDuringHold();
        });
    }

    runGuidedScanDuringHold() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;
        const apneaMax = this.settings.apneaMax || 120;
        const holdTarget = Math.round(apneaMax * exercise.holdTargets[this.apneaGuidedCycle - 1]);

        document.getElementById('breathPhase').textContent = 'Apnée';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.hold;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.apneaGuidedCycle} / ${exercise.cycles} — Apnée (${this.formatTime(holdTarget)})`;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'holdEmpty');
        circle.classList.add('hold', 'active');
        circle.style.setProperty('--phase-duration', '1s');

        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        const holdStart = Date.now();
        let pausedTime = 0;
        let pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        if (window.breathSounds) {
            window.breathSounds.playPhase('hold', holdTarget);
        }

        // Schedule body scan segments during hold
        const scanSegments = [...exercise.scanSegments];
        const totalScanDuration = scanSegments.reduce((sum, s) => sum + s.duration, 0);
        let scanSegmentStartElapsed = 0;
        let scanIndex = 0;
        let inSilentMode = false;
        let rapidScanStarted = false;

        // Speak first scan segment
        if (scanSegments.length > 0 && window.voiceGuide && window.voiceGuide.enabled) {
            setTimeout(() => {
                if (this.isRunning && !this.isPaused) {
                    window.voiceGuide.speak(scanSegments[0].instruction);
                    document.getElementById('exerciseInstruction').textContent = scanSegments[0].instruction;
                }
            }, 1000);
        }

        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(this.phaseTimer);
                return;
            }
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) {
                pausedTime += Date.now() - pauseStart;
                pauseStart = null;
            }

            const elapsed = (Date.now() - holdStart - pausedTime) / 1000;
            const remaining = Math.max(0, holdTarget - elapsed);
            timerDisplay.textContent = this.formatTime(remaining);

            // Progress
            const progress = Math.min(elapsed / holdTarget, 1);
            progressBar.style.strokeDashoffset = circumference * (1 - progress);

            // Body scan scheduling — use elapsed time delta instead of float accumulation
            const scanSegmentElapsed = elapsed - scanSegmentStartElapsed;

            // Check if current scan segment is done, move to next
            if (scanIndex < scanSegments.length) {
                const currentSegment = scanSegments[scanIndex];
                if (scanSegmentElapsed >= currentSegment.duration) {
                    scanSegmentStartElapsed = elapsed;
                    scanIndex++;

                    if (scanIndex < scanSegments.length && window.voiceGuide && window.voiceGuide.enabled) {
                        window.voiceGuide.speak(scanSegments[scanIndex].instruction);
                        document.getElementById('exerciseInstruction').textContent = scanSegments[scanIndex].instruction;
                    }
                }
            } else if (!inSilentMode && !rapidScanStarted) {
                // Scan complete, enter silent mode
                inSilentMode = true;
                if (window.voiceGuide && window.voiceGuide.enabled) {
                    window.voiceGuide.speak(exercise.silentModeInstruction);
                }
                document.getElementById('exerciseInstruction').textContent = exercise.silentModeInstruction;
            }

            // Rapid scan when close to end (last 15 seconds)
            if (!rapidScanStarted && remaining <= 15 && remaining > 0) {
                rapidScanStarted = true;
                inSilentMode = false;
                this.runRapidScan(exercise.rapidScanSegments);
            }

            // Hold complete
            if (elapsed >= holdTarget) {
                this.endApneaGuidedHold();
            }
        }, 100);
    }

    runRapidScan(rapidSegments) {
        if (!rapidSegments || rapidSegments.length === 0) return;

        let idx = 0;
        const speakNext = () => {
            if (idx >= rapidSegments.length || !this.isRunning) return;
            const seg = rapidSegments[idx];
            document.getElementById('exerciseInstruction').textContent = seg.instruction;
            if (window.voiceGuide && window.voiceGuide.enabled) {
                window.voiceGuide.speak(seg.instruction, () => {
                    idx++;
                    if (idx < rapidSegments.length) {
                        setTimeout(speakNext, 500);
                    }
                });
            } else {
                idx++;
                setTimeout(speakNext, seg.duration * 1000);
            }
        };
        speakNext();
    }

    endApneaGuidedHold() {
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;

        if (window.breathSounds) window.breathSounds.stop();

        const feedback = `Cycle ${this.apneaGuidedCycle} terminé. Respirez normalement.`;
        document.getElementById('exerciseInstruction').textContent = feedback;
        document.getElementById('breathPhase').textContent = 'Repos';

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(feedback);
        }

        this.apneaGuidedCycle++;

        if (this.apneaGuidedCycle > this.currentExercise.cycles) {
            setTimeout(() => this.completeExercise(), 3000);
        } else {
            // Rest before next cycle
            setTimeout(() => {
                this.updateBreathPhase({ name: 'Repos', action: 'inhale', duration: this.currentExercise.restDuration }, 'hold');

                if (window.breathSounds) {
                    window.breathSounds.playPhase('inhale', this.currentExercise.restDuration);
                }

                this.startPhaseTimer(this.currentExercise.restDuration, () => {
                    this.runApneaGuidedCycle();
                });
            }, 2000);
        }
    }

    // ==========================================
    // Apnea Tables
    // ==========================================

    startApneaTable() {
        const exercise = this.currentExercise;

        this.apneaCycle = 1;
        this.generateApneaTable();

        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.apneaCycle} / ${exercise.cycles}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        setTimeout(() => {
            this.runApneaCycle();
        }, 3000);
    }

    generateApneaTable() {
        const exercise = this.currentExercise;
        this.apneaTable = [];

        const exerciseId = exercise.id || this.currentExercise.id;

        if (exerciseId === 'co2-table') {
            for (let i = 0; i < exercise.cycles; i++) {
                this.apneaTable.push({
                    hold: exercise.holdTime,
                    rest: exercise.restPattern[i]
                });
            }
        } else if (exerciseId === 'o2-table') {
            for (let i = 0; i < exercise.cycles; i++) {
                this.apneaTable.push({
                    hold: exercise.holdPattern[i],
                    rest: exercise.restDuration
                });
            }
        } else if (exerciseId === 'no-contraction') {
            for (let i = 0; i < exercise.cycles; i++) {
                this.apneaTable.push({
                    hold: exercise.holdTime,
                    rest: exercise.restDuration
                });
            }
        }
    }

    runApneaCycle() {
        if (!this.isRunning) return;

        const exercise = this.currentExercise;
        const cycleData = this.apneaTable[this.apneaCycle - 1];

        if (!cycleData) {
            this.completeExercise();
            return;
        }

        // Breathing phase
        document.getElementById('breathPhase').textContent = 'Respirez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.breathe;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this.apneaCycle} / ${exercise.cycles} — Repos`;

        this.updateBreathPhase({ name: 'Respirez', action: 'inhale', duration: cycleData.rest }, 'hold');

        // Play breath sound for rest phase
        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', cycleData.rest);
        }

        this.startPhaseTimer(cycleData.rest, () => {
            // Hold phase
            document.getElementById('breathPhase').textContent = 'Apnée';
            document.getElementById('exerciseInstruction').textContent =
                `${exercise.instructions.hold} — Objectif: ${this.formatTime(cycleData.hold)}`;
            document.getElementById('cycleCounter').textContent =
                `Cycle ${this.apneaCycle} / ${exercise.cycles} — Apnée`;

            this.updateBreathPhase({ name: 'Apnée', action: 'hold', duration: cycleData.hold }, 'inhale');

            // Play breath sound for hold phase
            if (window.breathSounds) {
                window.breathSounds.playPhase('hold', cycleData.hold);
            }

            this.startPhaseTimer(cycleData.hold, () => {
                this.apneaCycle++;

                if (this.apneaCycle > exercise.cycles) {
                    this.completeExercise();
                } else {
                    this.runApneaCycle();
                }
            });
        });
    }

    // ==========================================
    // Apnea Test
    // ==========================================

    setupApneaTest() {
        const testBtn = document.getElementById('startTest');
        const modal = document.getElementById('apneaTestModal');
        const closeBtn = document.getElementById('testModalClose');
        const startHoldBtn = document.getElementById('btnStartHold');
        const stopHoldBtn = document.getElementById('btnStopHold');
        const saveBtn = document.getElementById('btnSaveResult');

        testBtn?.addEventListener('click', () => {
            modal.classList.add('active');
            this.resetApneaTest();
        });

        closeBtn?.addEventListener('click', () => {
            modal.classList.remove('active');
            this.stopApneaTest();
        });

        startHoldBtn?.addEventListener('click', () => {
            this.startApneaHold();
        });

        stopHoldBtn?.addEventListener('click', () => {
            this.stopApneaHold();
        });

        saveBtn?.addEventListener('click', () => {
            this.saveApneaResult();
        });
    }

    resetApneaTest() {
        document.getElementById('testTimer').textContent = '0:00';
        document.getElementById('testStatus').textContent = 'Prêt';
        document.getElementById('testInstruction').textContent =
            'Prenez 3 respirations calmes, puis inspirez profondément et retenez votre souffle aussi longtemps que possible.';
        document.getElementById('btnStartHold').style.display = 'inline-block';
        document.getElementById('btnStopHold').style.display = 'none';
        document.getElementById('testResultDisplay').style.display = 'none';
    }

    startApneaHold() {
        this.testStartTime = Date.now();
        if (this.testTimer) clearInterval(this.testTimer);
        this.testTimer = null;

        document.getElementById('btnStartHold').style.display = 'none';
        document.getElementById('btnStopHold').style.display = 'inline-block';
        document.getElementById('testStatus').textContent = 'En cours...';

        this.testTimer = setInterval(() => {
            const elapsed = (Date.now() - this.testStartTime) / 1000;
            document.getElementById('testTimer').textContent = this.formatTime(elapsed);
        }, 100);
    }

    stopApneaHold() {
        if (this.testTimer) {
            clearInterval(this.testTimer);
        }

        const elapsed = (Date.now() - this.testStartTime) / 1000;
        this.lastTestResult = elapsed;

        document.getElementById('btnStopHold').style.display = 'none';
        document.getElementById('testStatus').textContent = 'Terminé';
        document.getElementById('testResultDisplay').style.display = 'block';
        document.getElementById('resultTime').textContent = this.formatTime(elapsed);

        // Analysis
        let analysis = '';
        if (elapsed < 30) {
            analysis = 'Niveau débutant. Avec l\'entraînement, vous progresserez rapidement.';
        } else if (elapsed < 60) {
            analysis = 'Bon niveau. Vous avez une base solide pour progresser.';
        } else if (elapsed < 120) {
            analysis = 'Très bon niveau. Vous avez une excellente capacité de rétention.';
        } else {
            analysis = 'Niveau avancé. Capacité exceptionnelle !';
        }
        document.getElementById('resultAnalysis').textContent = analysis;
    }

    stopApneaTest() {
        if (this.testTimer) {
            clearInterval(this.testTimer);
        }
    }

    saveApneaResult() {
        if (this.lastTestResult) {
            this.settings.apneaMax = Math.round(this.lastTestResult);

            // Update UI
            const apneaMinutes = document.getElementById('apneaMinutes');
            const apneaSeconds = document.getElementById('apneaSeconds');
            if (apneaMinutes) apneaMinutes.value = Math.floor(this.settings.apneaMax / 60);
            if (apneaSeconds) apneaSeconds.value = this.settings.apneaMax % 60;

            this.updatePersonalBestDisplay();
            this.saveSettings();

            document.getElementById('apneaTestModal').classList.remove('active');
        }
    }

    updatePersonalBestDisplay() {
        const display = document.getElementById('personalBest');
        if (display && this.settings.apneaMax) {
            display.textContent = this.formatTime(this.settings.apneaMax);
        } else if (display) {
            display.textContent = '--:--';
        }
    }

    // ==========================================
    // Exercise Reset
    // ==========================================

    resetExercise() {
        if (!this.currentExercise) return;

        // Temporarily stop running to halt any ongoing loops
        this.isRunning = false;

        // Stop all current timers
        if (this.phaseTimer) {
            clearInterval(this.phaseTimer);
            this.phaseTimer = null;
        }
        if (this.displayTimer) {
            clearInterval(this.displayTimer);
            this.displayTimer = null;
        }

        // Stop sounds
        if (window.voiceGuide) window.voiceGuide.stop();
        if (window.breathSounds) window.breathSounds.stop();

        // Reset state variables
        this.isPaused = false;
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.elapsedTime = 0;

        // Reset Wim Hof specific state
        this.wimHofRound = 1;
        this.wimHofBreath = 1;

        // Reset guided exercise state
        this.guidedSegmentIndex = 0;

        // Reset apnea state
        this.apneaCycle = 1;

        // Reset contraction state
        this.contractionCycle = 1;
        this.contractionCount = 0;
        this.contractionOnset = null;
        this.contractionHoldStart = null;
        this.contractionHistory = [];

        // Reset body scan apnea state
        this.apneaGuidedCycle = 1;

        // Reset pause button icon
        const pauseBtn = document.getElementById('btnPause');
        pauseBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
        `;

        // Reset circle and timer display
        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');
        circle.style.removeProperty('--phase-duration');

        document.getElementById('breathTimer').textContent = '0.0';
        document.getElementById('progressBar').style.strokeDashoffset = 2 * Math.PI * 90;

        // Re-initialize breath sounds
        if (window.breathSounds) {
            window.breathSounds.init();
        }

        // Wait a tick to ensure everything is cleared, then restart
        setTimeout(() => {
            // Now set running to true
            this.isRunning = true;

            // Restart the same exercise type
            if (this.currentExercise.isApneaWithGuidance) {
                this.startApneaWithGuidance();
            } else if (this.currentExercise.isContractionTable) {
                this.startContractionTable();
            } else if (this.currentExercise.isApneaTable) {
                this.startApneaTable();
            } else if (this.currentExercise.isGuided) {
                this.startGuidedExercise();
            } else if (this.currentExercise.isWimHof) {
                this.startWimHofExercise();
            } else {
                this.startBreathingExercise();
            }
        }, 100);
    }

    // ==========================================
    // Exercise Completion
    // ==========================================

    completeExercise() {
        this.isRunning = false;
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;

        // Allow screen to sleep again
        this.releaseWakeLock();

        // Stop sounds
        if (window.voiceGuide) window.voiceGuide.stop();
        if (window.breathSounds) {
            window.breathSounds.stop();
            window.breathSounds.playComplete(); // Play completion chime
        }

        document.getElementById('breathPhase').textContent = 'Terminé';
        const completionMessage = 'Excellent travail ! Prenez un moment pour ressentir les effets de cet exercice.';
        document.getElementById('exerciseInstruction').textContent = completionMessage;

        // Speak completion message
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(completionMessage);
        }

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        // Show feedback modal or auto-close
        if (window.coach) {
            setTimeout(() => {
                if (!this.isRunning) {
                    window.coach.showFeedbackModal(this.currentExercise, this.elapsedTime);
                }
            }, 2000);
        } else {
            setTimeout(() => {
                if (!this.isRunning) {
                    this.closeExercise();
                }
            }, 5000);
        }
    }

    closeExercise() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;
        clearInterval(this.displayTimer);
        this.displayTimer = null;

        // Clean up Wim Hof spacebar handler if still attached
        if (this.wimHofSpaceHandler) {
            document.removeEventListener('keydown', this.wimHofSpaceHandler);
            this.wimHofSpaceHandler = null;
        }

        // Allow screen to sleep again
        this.releaseWakeLock();

        // Stop all sounds
        if (window.voiceGuide) window.voiceGuide.stop();
        if (window.breathSounds) window.breathSounds.stop();

        document.getElementById('exerciseModal').classList.remove('active');

        // Reset circle
        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        // Hide contraction UI
        const btnContraction = document.getElementById('btnMarkContraction');
        const counterDiv = document.getElementById('contractionCounter');
        if (btnContraction) btnContraction.style.display = 'none';
        if (counterDiv) counterDiv.style.display = 'none';
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        const pauseBtn = document.getElementById('btnPause');
        if (this.isPaused) {
            // Pause voice
            if (window.voiceGuide) window.voiceGuide.pause();

            pauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                </svg>
            `;
            document.getElementById('breathPhase').textContent = 'Pause';
        } else {
            // Resume voice
            if (window.voiceGuide) window.voiceGuide.resume();

            pauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            `;
        }
    }

    // ==========================================
    // Guide Section
    // ==========================================

    setupGuide() {
        // Objective filter buttons
        document.querySelectorAll('.guide-objective-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.guide-objective-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterGuideExercises();
            });
        });

        // Level filter buttons
        document.querySelectorAll('.guide-level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.guide-level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterGuideExercises();
            });
        });

        // Inject guide details (science + practice) into cards
        this.injectGuideDetails();

        // Click on exercise item → toggle details panel (accordion)
        document.querySelectorAll('.guide-exercise-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // If clicking the "start" button inside details, don't toggle
                if (e.target.closest('.guide-detail-start')) return;

                const details = item.querySelector('.guide-exercise-details');
                if (!details) return;

                // Accordion: close other open details
                document.querySelectorAll('.guide-exercise-item.guide-expanded').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('guide-expanded');
                        const otherDetails = other.querySelector('.guide-exercise-details');
                        if (otherDetails) otherDetails.classList.add('collapsed');
                    }
                });

                // Toggle this card
                details.classList.toggle('collapsed');
                item.classList.toggle('guide-expanded');

                // Scroll into view if expanded
                if (!details.classList.contains('collapsed')) {
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            });
        });

        // Click "Lancer l'exercice" button inside details
        document.querySelectorAll('.guide-detail-start').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const exerciseId = btn.dataset.exerciseId;
                if (exerciseId && EXERCISES[exerciseId]) {
                    this.startExercise(exerciseId);
                }
            });
        });
    }

    injectGuideDetails() {
        const details = window.GUIDE_DETAILS || {};

        document.querySelectorAll('.guide-exercise-item[data-exercise-id]').forEach(item => {
            const id = item.dataset.exerciseId;
            const data = details[id];
            if (!data) return;

            // Add toggle chevron to header
            const header = item.querySelector('.guide-exercise-header');
            if (header && !header.querySelector('.guide-detail-toggle')) {
                const toggle = document.createElement('span');
                toggle.className = 'guide-detail-toggle';
                toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>';
                header.appendChild(toggle);
            }

            // Build details section
            const detailsDiv = document.createElement('div');
            detailsDiv.className = 'guide-exercise-details collapsed';

            const scienceHtml = `
                <div class="guide-detail-science">
                    <h5>🔬 Principe scientifique</h5>
                    <p>${data.science}</p>
                </div>`;

            const practiceItems = data.practice.map(step => `<li>${step}</li>`).join('');
            const practiceHtml = `
                <div class="guide-detail-practice">
                    <h5>🎯 Comment pratiquer</h5>
                    <ul>${practiceItems}</ul>
                </div>`;

            const startBtn = EXERCISES[id]
                ? `<button class="guide-detail-start" data-exercise-id="${id}">▶ Lancer l'exercice</button>`
                : '';

            detailsDiv.innerHTML = scienceHtml + practiceHtml + startBtn;
            item.appendChild(detailsDiv);
        });
    }

    filterGuideExercises() {
        // Collapse any expanded card when filters change
        document.querySelectorAll('.guide-exercise-item.guide-expanded').forEach(item => {
            item.classList.remove('guide-expanded');
            const d = item.querySelector('.guide-exercise-details');
            if (d) d.classList.add('collapsed');
        });

        const activeObjective = document.querySelector('.guide-objective-btn.active')?.dataset.objective || 'all';
        const activeLevel = document.querySelector('.guide-level-btn.active')?.dataset.level || 'all';

        let visibleCount = 0;

        document.querySelectorAll('.guide-exercise-item').forEach(item => {
            const objectives = (item.dataset.objectives || '').split(',');
            const level = item.dataset.level || '';

            const matchObjective = activeObjective === 'all' || objectives.includes(activeObjective);
            const matchLevel = activeLevel === 'all' || level === activeLevel;

            if (matchObjective && matchLevel) {
                item.classList.remove('guide-hidden');
                visibleCount++;
            } else {
                item.classList.add('guide-hidden');
            }
        });

        // Hide empty categories
        document.querySelectorAll('.guide-category').forEach(category => {
            const visibleItems = category.querySelectorAll('.guide-exercise-item:not(.guide-hidden)');
            category.style.display = visibleItems.length > 0 ? '' : 'none';
        });

        // Update result count
        const countEl = document.getElementById('guideResultCount');
        if (countEl) {
            const total = document.querySelectorAll('.guide-exercise-item').length;
            if (activeObjective === 'all' && activeLevel === 'all') {
                countEl.innerHTML = `<strong>${total}</strong> exercices disponibles`;
            } else {
                countEl.innerHTML = `<strong>${visibleCount}</strong> exercice${visibleCount > 1 ? 's' : ''} sur ${total}`;
            }
        }

        // Show/hide no results message
        const noResultsEl = document.getElementById('guideNoResults');
        if (noResultsEl) {
            noResultsEl.style.display = visibleCount === 0 ? '' : 'none';
        }
    }

    // ==========================================
    // Utilities
    // ==========================================

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ==========================================
    //  PIN LOCK
    // ==========================================

    checkPINLock() {
        // Always show lock screen — universal PIN
        const lockScreen = document.getElementById('pinLockScreen');
        if (lockScreen) lockScreen.style.display = 'flex';
        document.body.classList.add('app-locked');

        // Setup unlock handlers
        const unlockBtn = document.getElementById('pinUnlockBtn');
        const pinInput = document.getElementById('pinInput');

        unlockBtn?.addEventListener('click', () => this.verifyPIN());
        pinInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.verifyPIN();
        });

        // Focus the input
        setTimeout(() => pinInput?.focus(), 300);

        return true;
    }

    async verifyPIN() {
        const pinInput = document.getElementById('pinInput');
        const pinError = document.getElementById('pinError');
        if (!pinInput) return;

        const inputPIN = pinInput.value.trim();
        if (!inputPIN) return;

        const inputHash = await this.hashPIN(inputPIN);

        if (inputHash === APP_PIN_HASH) {
            // Correct — unlock
            const lockScreen = document.getElementById('pinLockScreen');
            if (lockScreen) lockScreen.style.display = 'none';
            document.body.classList.remove('app-locked');
            pinInput.value = '';
            if (pinError) pinError.style.display = 'none';

            // Continue app init
            this.initApp();
        } else {
            // Wrong PIN
            if (pinError) pinError.style.display = 'block';
            pinInput.classList.add('shake');
            setTimeout(() => pinInput.classList.remove('shake'), 400);
            pinInput.value = '';
            pinInput.focus();
        }
    }

    async hashPIN(pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin + 'deepbreath_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // PIN settings removed — PIN is hardcoded and universal
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JmeeDeepBreathApp();
});
