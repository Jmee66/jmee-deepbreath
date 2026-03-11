/**
 * Jmee DeepBreath Application
 * Main application logic for breathing, visualization, and apnea training
 */

const APP_VERSION = '2.9';

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

        // BreathingEngine v2 (Canvas 2D + RAF timer)
        this.engine = null;

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

            // Voice settings
            voiceSelectedName: '',  // '' = auto priority, name string = user-selected voice
            voiceRate: 78,          // % (50-120), divided by 100 for TTS rate (0.78 default)

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
                'cardiac-coherence': {
                    duration: 10,
                    frequency: '5.5',
                    ratio: '1:1',
                    hold: 0
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
                'ocean-breath-co2': {
                    duration: 10,
                    inhale: 4,
                    hold: 4,
                    exhale: 16,
                    holdEmpty: 2,
                    preset: 'endurance'
                },
                'breath-light-co2': {
                    duration: 7,
                    inhale: 4,
                    exhale: 6,
                    hold: 3
                },
                'square-flow': {
                    duration: 10,
                    holdDuration: 10,
                    cycles: 15
                },
                'relaxation': {
                    cycles: 4,
                    inhale: 4,
                    hold: 7,
                    exhale: 8
                },
                'pranayama-142': {
                    duration: 10,
                    inhale: 4,
                    hold: 16,
                    exhale: 8
                },
                'nadi-shodhana': {
                    duration: 10,
                    phaseTime: 4
                },
                'kapalabhati': {
                    cycles: 30,
                    speed: 1
                },
                'ujjayi': {
                    duration: 10,
                    inhale: 5,
                    exhale: 5
                },
                'bhramari': {
                    duration: 5,
                    inhale: 4,
                    exhale: 8
                },
                'surya-bhedana': {
                    duration: 5,
                    inhale: 4,
                    hold: 8,
                    exhale: 6
                },
                'body-scan': {
                    zoneDuration: 60
                },
                'deep-sleep-478': {
                    duration: 15,
                    rhythmBong: true
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
                },
                'comfort-zone': {
                    cycles: 5,
                    restDuration: 120,
                    breatheUpDuration: 60
                },
                'comfort-zone-frc': {
                    cycles: 5,
                    restDuration: 120,
                    breatheUpDuration: 60
                },
                'co2-vhl': {
                    cycles: 5,
                    breathsPerCycle: 3,
                    holdDuration: 5,
                    restBreaths: 4
                },
                'co2-vhl-classic': {
                    cycles: 8,
                    breathsPerCycle: 2,
                    holdDuration: 6,
                    restBreaths: 4
                },
                'co2-vhl-static': {
                    cycles: 6,
                    holdDuration: 20,
                    restBreaths: 3,
                    prepDuration: 180,
                    volumeMode: 'frc'
                },
                'imst': {
                    sets: 5,
                    repsPerSet: 30,
                    inhaleDuration: 2,
                    exhaleDuration: 3,
                    restDuration: 60,
                    mode: 'device'
                },
                'passive-breath-hanger': {
                    cycles: 4,
                    prepDuration: 180,
                    restDuration: 90,
                    maxHoldDuration: 300
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

    saveSettings(silent = false) {
        localStorage.setItem('deepbreath_settings', JSON.stringify(this.settings));
        if (!silent) this.showToast('Paramètres enregistrés');
    }

    init() {
        // Clean up old localStorage PIN (now hardcoded)
        localStorage.removeItem('deepbreath_pin_hash');

        // Inject version on lock screen + badge (before PIN check)
        this.injectVersion();

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
        this.setupVolumePanelControls();
        this.setupGuide();
        this.setupWakeLock();
        this.initJournal();
        this.initWeeklyPlan();
        this.setupSync();
        this.setupBackup();
        this.updateComfortZoneProgress();
        this.updateFrcComfortProgress();
        this.setupFavoris();
        this.initChasseModule();
        this.injectVersion();
    }

    injectVersion() {
        const badge = document.getElementById('appVersionBadge');
        if (badge) badge.textContent = `BETA v${APP_VERSION}`;
        const pin = document.getElementById('appVersionPin');
        if (pin) pin.textContent = `v${APP_VERSION}`;
    }

    initChasseModule() {
        window.chasseModule = new ChasseModule();
    }

    initJournal() {
        if (typeof JournalView !== 'undefined') {
            window.journal = new JournalView();
            window.journal.init();
        }
    }

    initWeeklyPlan() {
        if (typeof WeeklyPlan !== 'undefined') {
            window.weeklyPlan = new WeeklyPlan();
            window.weeklyPlan.init();
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
        this._syncListenersAttached = false;
        // Try immediately (works on desktop where elements are accessible at init)
        // Also called from setupNavigation() on first open of settings (mobile fallback)
        this._attachSyncListeners();
    }

    _attachSyncListeners() {
        // Called the first time the settings section becomes visible
        // At that point all elements are guaranteed to be in the DOM and accessible
        if (this._syncListenersAttached) {
            // Already attached — just restore UI state
            this._syncRestoreUI();
            return;
        }
        const sync = window.dataSync;
        if (!sync) return;

        const btnSetup = document.getElementById('btnSyncSetup');
        const btnSyncNow = document.getElementById('btnSyncNow');
        const btnDisconnect = document.getElementById('btnSyncDisconnect');

        if (!btnSetup) return; // section not ready yet

        this._syncListenersAttached = true;

        // --- Configurer ---
        btnSetup.addEventListener('click', async () => {
            const tokenInput = document.getElementById('syncToken');
            const gistIdInput = document.getElementById('syncGistId');
            const token = tokenInput?.value?.trim();
            const existingGistId = gistIdInput?.value?.trim();
            if (!token || token === '••••••••') {
                this.showToast('Entrez votre token GitHub', 'warning');
                return;
            }
            btnSetup.disabled = true;
            btnSetup.textContent = 'Configuration...';
            try {
                if (existingGistId && existingGistId.length > 10) {
                    alert('connect: token=' + token.substring(0,8) + ' gist=' + existingGistId.substring(0,8));
                    await sync.connect(token, existingGistId);
                    this.showToast('✓ Connecté au Gist existant');
                } else {
                    alert('setup: token=' + token.substring(0,8));
                    const gistId = await sync.setup(token);
                    if (gistIdInput) gistIdInput.value = gistId;
                    this.showToast('✓ Sync configurée ! Gist créé.');
                }
                if (tokenInput) tokenInput.value = '••••••••';
                this._syncRestoreUI();
            } catch (err) {
                alert('ERR: ' + String(err) + ' | msg=' + (err && err.message));
                this.showToast('Erreur : ' + (err && err.message ? err.message : String(err)));
            }
            btnSetup.disabled = false;
            btnSetup.textContent = 'Configurer';
        });

        // --- Sync maintenant ---
        if (btnSyncNow) {
            btnSyncNow.addEventListener('click', async () => {
                btnSyncNow.textContent = 'Sync...';
                btnSyncNow.disabled = true;
                try {
                    const diag = await sync.fullSync();
                    try {
                        this._refreshUIAfterSync();
                    } catch (refreshErr) {
                        alert('REFRESH ERR: ' + String(refreshErr) + '\n' + (refreshErr.stack || ''));
                    }
                    const gid = (sync.gistId || '?').substring(0, 8);
                    this.showToast(`[${gid}] L${diag.localBefore}+G${diag.gistSessions}→${diag.mergedCount} push=${diag.pushed?'✓':'✗'} v=${diag.verified}`);
                } catch (err) {
                    alert('SYNC ERR: ' + String(err) + '\n' + (err.stack || ''));
                    this.showToast(`Erreur sync : ${err.message}`, 'error');
                }
                btnSyncNow.textContent = 'Sync maintenant';
                btnSyncNow.disabled = false;
            });
        }

        // --- Déconnecter ---
        if (btnDisconnect) {
            btnDisconnect.addEventListener('click', () => {
                sync.disconnect();
                const tokenInput = document.getElementById('syncToken');
                const gistIdInput = document.getElementById('syncGistId');
                if (tokenInput) tokenInput.value = '';
                if (gistIdInput) gistIdInput.value = '';
                this._syncRestoreUI();
                this.showToast('Sync déconnectée');
            });
        }

        // Restore UI state now that listeners are attached
        this._syncRestoreUI();
    }

    _syncRestoreUI() {
        const sync = window.dataSync;
        if (!sync) return;
        const tokenInput = document.getElementById('syncToken');
        const gistIdInput = document.getElementById('syncGistId');
        const btnSetup = document.getElementById('btnSyncSetup');
        const btnSyncNow = document.getElementById('btnSyncNow');
        const btnDisconnect = document.getElementById('btnSyncDisconnect');
        if (sync.enabled) {
            if (tokenInput) tokenInput.value = '••••••••';
            if (gistIdInput) gistIdInput.value = sync.gistId;
            if (btnSetup) btnSetup.style.display = 'none';
            if (btnSyncNow) btnSyncNow.style.display = '';
            if (btnDisconnect) btnDisconnect.style.display = '';
        } else {
            if (btnSetup) btnSetup.style.display = '';
            if (btnSyncNow) btnSyncNow.style.display = 'none';
            if (btnDisconnect) btnDisconnect.style.display = 'none';
        }
    }

    _refreshUIAfterSync() {
        this.settings = this.loadSettings();
        this.populateSettingsUI();
        if (window.coach) {
            window.coach.sessions = window.coach.loadSessions();
            window.coach.goals = localStorage.getItem('deepbreath_goals') || '';
            window.coach.customPrompt = localStorage.getItem('deepbreath_coach_custom_prompt') || '';
            window.coach.coachSettings = window.coach.loadCoachSettings();
            const cp = document.getElementById('coachCustomPrompt');
            if (cp) cp.value = window.coach.customPrompt;
            const gi = document.getElementById('coachGoals');
            if (gi) gi.value = window.coach.goals;
            if (window.coach.updateStatsDisplay) window.coach.updateStatsDisplay();
            if (window.coach.renderRecentSessions) window.coach.renderRecentSessions();
        }
        if (window.journal) window.journal.render();
        if (window.weeklyPlan) window.weeklyPlan.render();
    }

    // ==========================================
    // Backup — Export & Import all localStorage data
    // ==========================================

    static get BACKUP_KEYS() {
        return [
            'deepbreath_sessions',
            'deepbreath_settings',
            'deepbreath_profile',
            'deepbreath_goals',
            'deepbreath_coach_settings',
            'deepbreath_coach_custom_prompt',
            'deepbreath_chat_history',
            'deepbreath_sequences',
            'deepbreath_weekly_plan',
            'deepbreath_contraction_history',
            'deepbreath_comfort_zone_history',
            'deepbreath_frc_comfort_history',
            'deepbreath_sync_gistId',
            'deepbreath_sync_deviceId',
        ];
        // deepbreath_sync_token intentionnellement exclu
    }

    setupBackup() {
        const btnExport = document.getElementById('btnExportData');
        const btnImport = document.getElementById('btnImportData');
        const fileInput = document.getElementById('importFileInput');
        if (btnExport) btnExport.addEventListener('click', () => this.exportAllData());
        if (btnImport && fileInput) {
            btnImport.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) { this.importAllData(file); fileInput.value = ''; }
            });
        }
    }

    exportAllData() {
        const data = {};
        for (const key of JmeeDeepBreathApp.BACKUP_KEYS) {
            const raw = localStorage.getItem(key);
            if (raw !== null) {
                try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
            }
        }
        const payload = { exportDate: new Date().toISOString(), version: APP_VERSION, appName: 'JmeeDeepBreath', data };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const filename = `deepbreath-backup-${new Date().toISOString().slice(0, 10)}.json`;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        this.showToast('Données exportées !');
    }

    importAllData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const payload = JSON.parse(e.target.result);
                if (!payload.data || typeof payload.data !== 'object') throw new Error('Format invalide');
                for (const key of JmeeDeepBreathApp.BACKUP_KEYS) {
                    if (key in payload.data) {
                        const val = payload.data[key];
                        localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
                    }
                }
                this._refreshUIAfterSync();
                this.showToast('Données importées !');
            } catch (err) {
                this.showToast('Fichier invalide : ' + err.message, 'warning');
            }
        };
        reader.readAsText(file);
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
            // Click to dismiss
            badge.addEventListener('click', () => badge.classList.remove('visible'));
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

                // Attach sync button listeners the first time settings section opens
                if (targetSection === 'settings') {
                    this._attachSyncListeners();
                    // Navigation manuelle → cacher le bouton retour
                    const backBtn = document.getElementById('btnBackToSection');
                    if (backBtn) backBtn.style.display = 'none';
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
                const valEl = document.getElementById('volumeRangeValue');
                if (valEl) valEl.textContent = Math.round(vol * 100) + '%';
            });
        }

        // breath volume value display
        const breathValEl = document.getElementById('breathVolumeValue');
        if (breathValEl && breathVolumeRange) {
            breathValEl.textContent = breathVolumeRange.value + '%';
            breathVolumeRange.addEventListener('input', (e) => {
                breathValEl.textContent = e.target.value + '%';
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

        // --- Voice selector ---
        const voiceSelect = document.getElementById('voiceSelect');
        if (voiceSelect && window.voiceGuide) {
            const populateVoiceSelect = () => {
                const voices = window.voiceGuide.getAvailableVoices();
                // Clear all options except the first "Auto" option
                while (voiceSelect.options.length > 1) voiceSelect.remove(1);

                let separatorAdded = false;
                voices.forEach(v => {
                    // Add a visual separator before non-French voices
                    if (!separatorAdded && !v.lang.startsWith('fr')) {
                        separatorAdded = true;
                        const sep = document.createElement('option');
                        sep.disabled = true;
                        sep.textContent = '── Autres langues ──';
                        voiceSelect.appendChild(sep);
                    }
                    const opt = document.createElement('option');
                    opt.value = v.name;
                    const quality = v.name.toLowerCase().includes('premium') || v.name.toLowerCase().includes('enhanced') ? ' ⭐' : '';
                    const cloud = v.localService ? '' : ' ☁️';
                    const lang = v.lang.startsWith('fr') ? '' : ` [${v.lang}]`;
                    opt.textContent = v.name + quality + cloud + lang;
                    voiceSelect.appendChild(opt);
                });

                // Restore saved selection
                const saved = this.settings.voiceSelectedName || '';
                voiceSelect.value = saved;
                if (saved) {
                    window.voiceGuide.setVoice(saved);
                }
            };

            // Populate now (voices may already be loaded) and when they load async
            populateVoiceSelect();
            window.voiceGuide.onVoicesChanged = populateVoiceSelect;

            voiceSelect.addEventListener('change', (e) => {
                const name = e.target.value;
                window.voiceGuide.setVoice(name || null);
                this.settings.voiceSelectedName = name;
                this.saveSettings(true);
                // Audio feedback with the new voice
                if (window.voiceGuide.enabled) {
                    setTimeout(() => window.voiceGuide.speak('Voix sélectionnée'), 200);
                }
            });
        }

        // --- Speech rate slider ---
        const voiceRateRange = document.getElementById('voiceRateRange');
        const voiceRateValue = document.getElementById('voiceRateValue');
        if (voiceRateRange && window.voiceGuide) {
            // Restore saved rate
            const savedRate = this.settings.voiceRate || 78;
            voiceRateRange.value = savedRate;
            if (voiceRateValue) voiceRateValue.textContent = savedRate + '%';
            window.voiceGuide.setRate(savedRate / 100);

            voiceRateRange.addEventListener('input', (e) => {
                const pct = parseInt(e.target.value);
                if (voiceRateValue) voiceRateValue.textContent = pct + '%';
                window.voiceGuide.setRate(pct / 100);
                this.settings.voiceRate = pct;
                this.saveSettings(true);
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
    // Volume Panel Controls
    // ==========================================

    setupVolumePanelControls() {
        const btn = document.getElementById('volumePanelBtn');
        const panel = document.getElementById('volumePanel');
        const closeBtn = document.getElementById('volumePanelClose');

        if (!btn || !panel) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            // Close spotify if open
            const spotifyPanel = document.getElementById('spotifyPanel');
            if (spotifyPanel) spotifyPanel.style.display = 'none';
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !btn.contains(e.target)) {
                panel.style.display = 'none';
            }
        });
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
                // Recalculer les inputs exercices si on bascule en/hors mode optimal
                this.refreshExerciseSettingsUI();
                this.updateComputedValues();
                this.saveSettings(true);
            });
        });

        // Apnea max time inputs
        const apneaMinutes = document.getElementById('apneaMinutes');
        const apneaSeconds = document.getElementById('apneaSeconds');

        if (apneaMinutes && apneaSeconds) {
            // Set initial values
            apneaMinutes.value = Math.floor(this.settings.apneaMax / 60);
            apneaSeconds.value = this.settings.apneaMax % 60;

            let apneaSaveTimeout;
            const updateApneaMax = () => {
                this.settings.apneaMax = parseInt(apneaMinutes.value || 0) * 60 + parseInt(apneaSeconds.value || 0);
                this.updateComputedValues();
                this.updatePersonalBestDisplay();
                clearTimeout(apneaSaveTimeout);
                apneaSaveTimeout = setTimeout(() => this.saveSettings(true), 300);
            };

            apneaMinutes.addEventListener('input', updateApneaMax);
            apneaSeconds.addEventListener('input', updateApneaMax);
            apneaMinutes.addEventListener('change', updateApneaMax);
            apneaSeconds.addEventListener('change', updateApneaMax);
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

            let saveTimeout;
            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value + '%';
                this.settings[inputId] = parseInt(input.value);
                this.updateComputedValues();
                // Debounce save (slider fires many events)
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => this.saveSettings(true), 300);
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
                this.saveSettings(true);
            });
        }

        // Toggle buttons
        timingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timingBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.guidedTimingMode = btn.dataset.timing;
                this.updateGuidedTimingUI(btn.dataset.timing);
                this.saveSettings(true);
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
        // Ratios fixes par exercice : { param_référence: { param_lié: multiplicateur, ... }, ... }
        const RATIO_LOCKS = {
            'coherent':         { ref: 'inhale', locked: { exhale: 1 } },
            'ujjayi':           { ref: 'inhale', locked: { exhale: 1 } },
            'bhramari':         { ref: 'inhale', locked: { exhale: 2 } },
            'co2-tolerance':    { ref: 'inhale', locked: { exhale: 2 } },
            'breath-light-co2': { ref: 'inhale', locked: { exhale: 1.5, hold: 0.75 } },
            'pranayama-142':    { ref: 'inhale', locked: { hold: 4, exhale: 2 } },
            'relaxation':       { ref: 'inhale', locked: { hold: 1.75, exhale: 2 } },
            'surya-bhedana':    { ref: 'inhale', locked: { hold: 2, exhale: 1.5 } },
            'ocean-breath-co2': { ref: 'inhale', locked: { hold: 2, exhale: 4, holdEmpty: 1 } },
        };

        document.querySelectorAll('.exercise-settings').forEach(section => {
            const exerciseId = section.dataset.exercise;
            const inputs = section.querySelectorAll('input[data-param], select[data-param]');
            const ratio = RATIO_LOCKS[exerciseId];

            inputs.forEach(input => {
                const param = input.dataset.param;

                // Set initial value
                if (this.settings.exercises[exerciseId] && this.settings.exercises[exerciseId][param] !== undefined) {
                    input.value = this.settings.exercises[exerciseId][param];
                }

                // Marquer visuellement les champs verrouillés par ratio (mode manuel)
                if (ratio && param !== ratio.ref && ratio.locked[param] !== undefined) {
                    input.readOnly = true;
                    input.style.opacity = '0.6';
                    input.style.cursor = 'not-allowed';
                    input.title = 'Calculé automatiquement selon le ratio';
                }

                // Update on change or input (debounced) — ignoré en mode optimal (readonly)
                let saveTimeout;
                const applyAndSave = () => {
                    // En mode optimal, les inputs sont en lecture seule — ne rien faire
                    if (this.settings.mode === 'optimal') return;

                    if (!this.settings.exercises[exerciseId]) {
                        this.settings.exercises[exerciseId] = {};
                    }
                    if (input.tagName === 'SELECT') {
                        this.settings.exercises[exerciseId][param] = input.value;
                    } else {
                        const v = parseFloat(input.value);
                        if (!isNaN(v)) {
                            this.settings.exercises[exerciseId][param] = v;

                            // Propagation des ratios si ce champ est la référence
                            if (ratio && param === ratio.ref) {
                                for (const [lockedParam, mult] of Object.entries(ratio.locked)) {
                                    const computed = Math.round(v * mult * 10) / 10;
                                    this.settings.exercises[exerciseId][lockedParam] = computed;
                                    const lockedInput = section.querySelector(`input[data-param="${lockedParam}"]`);
                                    if (lockedInput) lockedInput.value = computed;
                                }
                            }
                        }
                    }
                    // Si modification manuelle d'Ocean Breath, désélectionner le preset actif
                    if (exerciseId === 'ocean-breath-co2') {
                        document.querySelectorAll('.ocean-preset').forEach(b => {
                            b.classList.remove('active');
                            b.style.background = '#1a2a3a';
                            b.style.border = '1px solid #2a3a4a';
                            b.style.color = '#e0e8f0';
                        });
                        if (this.settings.exercises['ocean-breath-co2']) {
                            this.settings.exercises['ocean-breath-co2'].preset = null;
                        }
                    }

                    clearTimeout(saveTimeout);
                    saveTimeout = setTimeout(() => this.saveSettings(true), 300);
                };
                input.addEventListener('change', applyAndSave);
                input.addEventListener('input', applyAndSave);
            });
        });

        // Toggle bong rythme 4-7-8 pendant body scan (Deep Sleep)
        const bongToggle = document.getElementById('deepSleepRhythmBong');
        if (bongToggle) {
            bongToggle.checked = this.settings.exercises?.['deep-sleep-478']?.rhythmBong ?? true;
            bongToggle.addEventListener('change', () => {
                if (!this.settings.exercises['deep-sleep-478']) this.settings.exercises['deep-sleep-478'] = {};
                this.settings.exercises['deep-sleep-478'].rhythmBong = bongToggle.checked;
                this.saveSettings(true);
            });
        }

        // Ocean Breath CO2 — presets Détente / Endurance / Performance
        const oceanPresets = {
            detente:     { inhale: 5, hold: 5,  exhale: 10, holdEmpty: 2 },
            endurance:   { inhale: 4, hold: 4,  exhale: 12, holdEmpty: 2 },
            performance: { inhale: 4, hold: 8,  exhale: 16, holdEmpty: 4 }
        };
        document.querySelectorAll('.ocean-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                const values = oceanPresets[preset];
                if (!values) return;

                // Mettre à jour le style des boutons
                document.querySelectorAll('.ocean-preset').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#1a2a3a';
                    b.style.border = '1px solid #2a3a4a';
                    b.style.color = '#e0e8f0';
                });
                btn.classList.add('active');
                btn.style.background = 'var(--primary)';
                btn.style.border = '1px solid var(--primary)';
                btn.style.color = '#fff';

                // Appliquer les valeurs dans les inputs
                const section = document.querySelector('.exercise-settings[data-exercise="ocean-breath-co2"]');
                if (!section) return;
                for (const [param, val] of Object.entries(values)) {
                    const input = section.querySelector(`input[data-param="${param}"]`);
                    if (input) input.value = val;
                }

                // Sauvegarder
                if (!this.settings.exercises['ocean-breath-co2']) {
                    this.settings.exercises['ocean-breath-co2'] = {};
                }
                Object.assign(this.settings.exercises['ocean-breath-co2'], values);
                this.settings.exercises['ocean-breath-co2'].preset = preset;
                this.saveSettings(true);
            });
        });

        // Restaurer le preset actif au chargement
        const savedPreset = this.settings.exercises?.['ocean-breath-co2']?.preset;
        if (savedPreset) {
            const activeBtn = document.querySelector(`.ocean-preset[data-preset="${savedPreset}"]`);
            if (activeBtn) {
                document.querySelectorAll('.ocean-preset').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = '#1a2a3a';
                    b.style.border = '1px solid #2a3a4a';
                    b.style.color = '#e0e8f0';
                });
                activeBtn.classList.add('active');
                activeBtn.style.background = 'var(--primary)';
                activeBtn.style.border = '1px solid var(--primary)';
                activeBtn.style.color = '#fff';
            }
        }

        // En mode optimal : quand apneaMax change, recalculer tous les inputs exercices en temps réel
        const apneaMinutes = document.getElementById('apneaMinutes');
        const apneaSeconds = document.getElementById('apneaSeconds');
        const refreshOptimalInputs = () => {
            if (this.settings.mode === 'optimal') {
                this.refreshExerciseSettingsUI();
            }
        };
        if (apneaMinutes) apneaMinutes.addEventListener('input', refreshOptimalInputs);
        if (apneaSeconds) apneaSeconds.addEventListener('input', refreshOptimalInputs);
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
        this.refreshExerciseSettingsUI();

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
            const computed = (parseInt(apneaMinutes.value) || 0) * 60 + (parseInt(apneaSeconds.value) || 0);
            if (computed > 0) {
                this.settings.apneaMax = computed;
            }
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

    // Rafraîchit tous les inputs des sections exercice selon le mode actuel
    // Appelé par populateSettingsUI(), changement de mode, changement d'apneaMax, saveApneaResult
    refreshExerciseSettingsUI() {
        const isOptimal = this.settings.mode === 'optimal';
        const RATIO_LOCKS = {
            'coherent':         { ref: 'inhale', locked: { exhale: 1 } },
            'ujjayi':           { ref: 'inhale', locked: { exhale: 1 } },
            'bhramari':         { ref: 'inhale', locked: { exhale: 2 } },
            'co2-tolerance':    { ref: 'inhale', locked: { exhale: 2 } },
            'breath-light-co2': { ref: 'inhale', locked: { exhale: 1.5, hold: 0.75 } },
            'pranayama-142':    { ref: 'inhale', locked: { hold: 4, exhale: 2 } },
            'relaxation':       { ref: 'inhale', locked: { hold: 1.75, exhale: 2 } },
            'surya-bhedana':    { ref: 'inhale', locked: { hold: 2, exhale: 1.5 } },
            'ocean-breath-co2': { ref: 'inhale', locked: { hold: 2, exhale: 4, holdEmpty: 1 } },
        };

        document.querySelectorAll('.exercise-settings').forEach(section => {
            const exerciseId = section.dataset.exercise;
            const inputs = section.querySelectorAll('input[data-param], select[data-param]');
            const ratio = RATIO_LOCKS[exerciseId];

            // En mode optimal : calculer toutes les valeurs depuis apneaMax
            if (isOptimal) {
                const optParams = this.getOptimalParams(exerciseId);
                if (optParams) {
                    inputs.forEach(input => {
                        const param = input.dataset.param;
                        if (optParams[param] !== undefined) {
                            input.value = optParams[param];
                        }
                        // Retirer le readonly inline (CSS gère le verrouillage visuel en mode optimal)
                        input.readOnly = false;
                        input.style.opacity = '';
                        input.style.cursor = '';
                    });
                    return; // section traitée
                }
            }

            // Mode manuel / auto : afficher les valeurs sauvegardées et gérer les ratios
            inputs.forEach(input => {
                const param = input.dataset.param;

                // Restaurer l'état readonly des champs verrouillés par ratio (manuel/auto)
                const isRatioLocked = ratio && param !== ratio.ref && ratio.locked[param] !== undefined;
                if (isRatioLocked) {
                    input.readOnly = true;
                    input.style.opacity = '0.6';
                    input.style.cursor = 'not-allowed';
                } else {
                    // S'assurer que les champs libres sont bien éditables
                    input.readOnly = false;
                    input.style.opacity = '';
                    input.style.cursor = '';
                }

                if (this.settings.exercises[exerciseId]?.[param] !== undefined) {
                    input.value = this.settings.exercises[exerciseId][param];
                }
                // Recalculer les champs verrouillés depuis la valeur de référence
                if (ratio && param === ratio.ref) {
                    const refVal = parseFloat(input.value);
                    if (!isNaN(refVal)) {
                        for (const [lockedParam, mult] of Object.entries(ratio.locked)) {
                            const computed = Math.round(refVal * mult * 10) / 10;
                            const lockedInput = section.querySelector(`input[data-param="${lockedParam}"]`);
                            if (lockedInput) {
                                lockedInput.value = computed;
                                if (!this.settings.exercises[exerciseId]) this.settings.exercises[exerciseId] = {};
                                this.settings.exercises[exerciseId][lockedParam] = computed;
                            }
                        }
                    }
                }
            });
        });
    }

    applySettingsMode() {
        const mode = this.settings.mode; // 'auto' | 'manual' | 'optimal'

        document.body.classList.toggle('manual-mode',  mode === 'manual');
        document.body.classList.toggle('auto-mode',    mode === 'auto');
        document.body.classList.toggle('optimal-mode', mode === 'optimal');

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

    // Config des paramètres optimaux : valeur de base = apneaMax / diviseur, clampée entre min et max
    // Les ratios hold/exhale sont ensuite appliqués automatiquement par le système RATIO_LOCKS
    static get OPTIMAL_CONFIG() {
        return {
            'cyclic-sighing': { param: 'inhale1', divisor: 40, min: 1.5, max: 4  },
            'coherent':       { param: 'inhale',  divisor: 20, min: 4,   max: 8  },
            'box':            { param: 'boxTime', divisor: 20, min: 3,   max: 8  },
            'co2-tolerance':  { param: 'inhale',  divisor: 25, min: 3,   max: 7  },
            'breath-light-co2': { param: 'inhale', divisor: 22, min: 2.5, max: 6 },
            'relaxation':     { param: 'inhale',  divisor: 30, min: 3,   max: 6  },
            'pranayama-142':  { param: 'inhale',  divisor: 25, min: 3,   max: 8  },
            'nadi-shodhana':  { param: 'phaseTime', divisor: 22, min: 3, max: 8  },
            'ujjayi':         { param: 'inhale',  divisor: 20, min: 4,   max: 10 },
            'bhramari':       { param: 'inhale',  divisor: 25, min: 3,   max: 8  },
            'surya-bhedana':  { param: 'inhale',  divisor: 20, min: 3,   max: 8  },
        };
    }

    // Retourne la valeur de base calculée pour un exercice (arrondie à 0.5s)
    getOptimalBaseValue(exerciseId) {
        const cfg = JmeeDeepBreathApp.OPTIMAL_CONFIG[exerciseId];
        if (!cfg) return null;
        const apneaMax = this.settings.apneaMax || 120;
        const raw = apneaMax / cfg.divisor;
        return Math.max(cfg.min, Math.min(cfg.max, Math.round(raw * 2) / 2));
    }

    // Retourne un objet { param: value, ...locked } complet pour un exercice en mode optimal
    getOptimalParams(exerciseId) {
        const cfg = JmeeDeepBreathApp.OPTIMAL_CONFIG[exerciseId];
        if (!cfg) return null;
        const baseVal = this.getOptimalBaseValue(exerciseId);
        const result = { [cfg.param]: baseVal };

        // Appliquer les ratios liés (identique à RATIO_LOCKS)
        const RATIO_LOCKED = {
            'coherent':         { exhale: 1 },
            'ujjayi':           { exhale: 1 },
            'bhramari':         { exhale: 2 },
            'co2-tolerance':    { exhale: 2 },
            'breath-light-co2': { exhale: 1.5, hold: 0.75 },
            'pranayama-142':    { hold: 4, exhale: 2 },
            'relaxation':       { hold: 1.75, exhale: 2 },
            'surya-bhedana':    { hold: 2, exhale: 1.5 },
            'ocean-breath-co2': { hold: 2, exhale: 4, holdEmpty: 1 },
        };
        const ratios = RATIO_LOCKED[exerciseId];
        if (ratios) {
            for (const [lockedParam, mult] of Object.entries(ratios)) {
                result[lockedParam] = Math.round(baseVal * mult * 10) / 10;
            }
        }

        // Cas cyclic-sighing : inhale2 reste 1s fixe, exhale = inhale1 × 3
        if (exerciseId === 'cyclic-sighing') {
            result['inhale2'] = 1;
            result['exhale'] = Math.round(baseVal * 3 * 10) / 10;
        }

        // Cas box : les 4 phases = boxTime
        // Cas nadi-shodhana : phaseTime seul, pas de ratio

        return result;
    }

    // Helper : retourne userVal si non-null/undefined, sinon fallback
    // Corrige le pattern `userVal || fallback` qui traite 0 comme falsy
    _v(userVal, fallback) {
        return (userVal != null && userVal !== '') ? userVal : fallback;
    }

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

        // Comfort zone (and FRC)
        if (exercise.isComfortZone) {
            exercise.cycles = this._v(userSettings.cycles, exercise.cycles);
            exercise.restDuration = this._v(userSettings.restDuration, exercise.restDuration);
            exercise.breatheUpDuration = this._v(userSettings.breatheUpDuration, exercise.breatheUpDuration);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // Contraction tolerance
        if (exercise.isContractionTable) {
            exercise.cycles = this._v(userSettings.cycles, exercise.cycles);
            exercise.weekLevel = this._v(userSettings.weekLevel, exercise.weekLevel);
            exercise.restDuration = this._v(userSettings.restDuration, exercise.restDuration);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // Body scan apnea
        if (exercise.isApneaWithGuidance) {
            exercise.cycles = this._v(userSettings.cycles, exercise.cycles);
            exercise.breatheUpDuration = this._v(userSettings.breatheUpDuration, exercise.breatheUpDuration);
            exercise.restDuration = this._v(userSettings.restDuration, exercise.restDuration);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // Passive Breath Hanger
        if (exercise.isPassiveBreathHanger) {
            exercise.cycles = this._v(userSettings.cycles, exercise.cycles);
            exercise.prepDuration = this._v(userSettings.prepDuration, exercise.prepDuration);
            exercise.restDuration = this._v(userSettings.restDuration, exercise.restDuration);
            exercise.maxHoldDuration = this._v(userSettings.maxHoldDuration, exercise.maxHoldDuration);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // VHL Statique (Woorons — pause longue FRC)
        if (exercise.isVHLStatic) {
            exercise.cycles       = this._v(userSettings.cycles, exercise.cycles);
            exercise.holdDuration = this._v(userSettings.holdDuration, exercise.holdDuration);
            exercise.restBreaths  = this._v(userSettings.restBreaths, exercise.restBreaths);
            exercise.prepDuration = this._v(userSettings.prepDuration, exercise.prepDuration);
            exercise.volumeMode   = this._v(userSettings.volumeMode, exercise.volumeMode);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // VHL (Hypoventilation à bas volume)
        if (exercise.isVHL) {
            exercise.cycles       = this._v(userSettings.cycles, exercise.cycles);
            exercise.breathsPerCycle = this._v(userSettings.breathsPerCycle, exercise.breathsPerCycle);
            exercise.holdDuration = this._v(userSettings.holdDuration, exercise.holdDuration);
            exercise.restBreaths  = this._v(userSettings.restBreaths, exercise.restBreaths);
            exercise.duration     = this._v(userSettings.duration, exercise.duration);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // IMST (Inspiratory Muscle Strength Training)
        if (exercise.isIMST) {
            exercise.sets           = this._v(userSettings.sets, exercise.sets);
            exercise.repsPerSet     = this._v(userSettings.repsPerSet, exercise.repsPerSet);
            exercise.inhaleDuration = this._v(userSettings.inhaleDuration, exercise.inhaleDuration);
            exercise.exhaleDuration = this._v(userSettings.exhaleDuration, exercise.exhaleDuration);
            exercise.restDuration   = this._v(userSettings.restDuration, exercise.restDuration);
            exercise.mode           = this._v(userSettings.mode, exercise.mode);
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // Deep Sleep 4-7-8 — body scan scalable, blocs 4-7-8 fixes
        if (exercise.isDeepSleep) {
            exercise.duration = this._v(userSettings.duration, exercise.duration);
            const totalSec = exercise.duration * 60;
            const FIXED = 30 + 76 * 2;  // installation + 2 blocs 4-7-8 (4 × 19s chacun)
            const budget = totalSec - FIXED;
            const base = exercise.segments.reduce((sum, s) => sum + s.duration, 0);
            if (budget > 0 && base > 0) {
                const ratio = budget / base;
                exercise.segments.forEach(s => {
                    s.duration = Math.max(10, Math.round(s.duration * ratio));
                });
            }
            this._updateDynamicInstructions(exercise, exerciseId);
            return exercise;
        }

        // Mode optimal : surcharger userSettings avec les valeurs calculées depuis apneaMax
        if (this.settings.mode === 'optimal') {
            const optParams = this.getOptimalParams(exerciseId);
            if (optParams) {
                // On fusionne : les params calculés priment sur userSettings
                // Les params non-couverts (duration, cycles...) restent depuis userSettings
                Object.assign(userSettings, optParams);
            }
        }

        // Standard breathing exercises
        switch (exerciseId) {
            case 'cyclic-sighing':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale1, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.inhale2, exercise.phases[1].duration);
                exercise.phases[2].duration = this._v(userSettings.exhale, exercise.phases[2].duration);
                break;

            case 'coherent':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.exhale, exercise.phases[1].duration);
                break;

            case 'cardiac-coherence': {
                exercise.duration = this._v(userSettings.duration, exercise.duration);

                // Fréquence → durée totale du cycle
                const ccFreqMap = {
                    '4.5': 60 / 4.5,
                    '5.0': 12,
                    '5.5': 60 / 5.5,
                    '6.0': 10,
                    '6.5': 60 / 6.5,
                    '7.0': 60 / 7
                };
                const ccFreq = this._v(userSettings.frequency, '5.5');
                const ccTotalCycle = ccFreqMap[ccFreq] || (60 / 5.5);

                // Rétention poumons pleins (secondes)
                const ccHoldRaw = userSettings.hold != null ? parseFloat(userSettings.hold) : 0;
                const ccHold = isNaN(ccHoldRaw) ? 0 : ccHoldRaw;
                const ccBreathTime = ccTotalCycle - ccHold;

                // Ratio → répartition inhale / exhale
                const ccRatioMap = {
                    '1:1':   [0.5,     0.5],
                    '1:1.5': [0.4,     0.6],
                    '1:2':   [1 / 3,   2 / 3]
                };
                const ccRatio = this._v(userSettings.ratio, '1:1');
                const [ccInFrac, ccExFrac] = ccRatioMap[ccRatio] || [0.5, 0.5];

                const ccInhale = Math.round(ccBreathTime * ccInFrac * 10) / 10;
                const ccExhale = Math.round(ccBreathTime * ccExFrac * 10) / 10;

                exercise.phases[0].duration = ccInhale;
                exercise.phases[1].duration = ccHold;
                exercise.phases[2].duration = ccExhale;

                // Supprimer la phase hold si durée = 0 (pas de rétention)
                exercise.phases = exercise.phases.filter(p => p.duration > 0);

                exercise.cyclesPerMinute = parseFloat(ccFreq);
                break;
            }

            case 'box':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                const boxTime = this._v(userSettings.boxTime, 4);
                exercise.phases.forEach(p => p.duration = boxTime);
                break;

            case 'wimhof':
                exercise.rounds = this._v(userSettings.rounds, exercise.rounds);
                exercise.breathsPerRound = this._v(userSettings.breaths, exercise.breathsPerRound);
                exercise.recoveryPhase.duration = this._v(userSettings.recovery, exercise.recoveryPhase.duration);
                break;

            case 'co2-tolerance':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.exhale, exercise.phases[1].duration);
                break;

            case 'breath-light-co2':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                // Recalcule les rounds selon les paramètres base
                const blInhale = this._v(userSettings.inhale, 4);
                const blExhale = this._v(userSettings.exhale, 6);
                const blHold   = this._v(userSettings.hold, 3);
                exercise.rounds = [
                    { label: 'Phase 1 — Mise en place',       durationSec: 90,  instruction: 'Respirez normalement par le nez. Prenez conscience de votre amplitude.',                                              inhale: blInhale,        exhale: blExhale,        hold: 0 },
                    { label: 'Phase 2 — Réduction inspiration', durationSec: 90,  instruction: 'Réduisez légèrement l\'inspiration — à peine moins d\'air qu\'à l\'habitude. Inconfort léger.',                      inhale: Math.max(1.5, blInhale - 1),   exhale: blExhale,        hold: 0 },
                    { label: 'Phase 3 — Réduction + pause',    durationSec: 120, instruction: 'Réduisez aussi l\'expiration. Ajoutez une pause après chaque expiration. L\'envie de respirer augmente — restez calme.', inhale: Math.max(1.5, blInhale - 1),   exhale: Math.max(2, blExhale - 1), hold: blHold },
                    { label: 'Phase 4 — Inconfort contrôlé',   durationSec: 120, instruction: 'Amplitude minimale. Faim d\'air présente — c\'est l\'entraînement. Maintenez la pause sans forcer.',                   inhale: Math.max(1.5, blInhale - 1.5), exhale: Math.max(2, blExhale - 1.5), hold: Math.min(8, blHold + 1) }
                ];
                // Ajuster durées selon duration totale
                {
                    const totalSec = (exercise.duration || 7) * 60;
                    const baseSec = 90 + 90 + 120 + 120; // 420s = 7min
                    if (totalSec !== baseSec) {
                        const scale = totalSec / baseSec;
                        exercise.rounds.forEach(r => { r.durationSec = Math.round(r.durationSec * scale); });
                    }
                }
                break;

            case 'square-flow': {
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                const sfHold = this._v(parseInt(userSettings.holdDuration), 10);
                // cycles=0 signifie "Continu" → on laisse cycles à 0 pour que startBreathingExercise utilise la durée
                const sfCyclesRaw = userSettings.cycles !== undefined ? parseInt(userSettings.cycles) : 15;
                const sfCycles = isNaN(sfCyclesRaw) ? 15 : sfCyclesRaw;
                exercise.holdDuration = sfHold;
                exercise.cycles = sfCycles || undefined; // 0 → undefined → mode durée
                // Mettre à jour la phase de suspension (index 1) avec la durée choisie
                exercise.phases[1].duration = sfHold;
                break;
            }

            case 'relaxation':
                exercise.cycles = this._v(userSettings.cycles, exercise.cycles);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.hold, exercise.phases[1].duration);
                exercise.phases[2].duration = this._v(userSettings.exhale, exercise.phases[2].duration);
                break;

            case 'ocean-breath-co2':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.hold, exercise.phases[1].duration);
                exercise.phases[2].duration = this._v(userSettings.exhale, exercise.phases[2].duration);
                exercise.phases[3].duration = this._v(userSettings.holdEmpty, exercise.phases[3].duration);
                break;

            case 'pranayama-142':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.hold, exercise.phases[1].duration);
                exercise.phases[2].duration = this._v(userSettings.exhale, exercise.phases[2].duration);
                break;

            case 'nadi-shodhana':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                if (userSettings.phaseTime) {
                    exercise.phases.forEach(p => p.duration = userSettings.phaseTime);
                }
                break;

            case 'kapalabhati':
                exercise.cycles = this._v(userSettings.cycles, exercise.cycles);
                if (userSettings.speed) {
                    const half = userSettings.speed / 2;
                    exercise.phases[0].duration = half;
                    exercise.phases[1].duration = half;
                }
                break;

            case 'ujjayi':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.exhale, exercise.phases[1].duration);
                break;

            case 'bhramari':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.exhale, exercise.phases[1].duration);
                break;

            case 'surya-bhedana':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
                exercise.phases[0].duration = this._v(userSettings.inhale, exercise.phases[0].duration);
                exercise.phases[1].duration = this._v(userSettings.hold, exercise.phases[1].duration);
                exercise.phases[2].duration = this._v(userSettings.exhale, exercise.phases[2].duration);
                break;

            case 'diaphragm':
                exercise.duration = this._v(userSettings.duration, exercise.duration);
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

        this._updateDynamicInstructions(exercise, exerciseId);
        return exercise;
    }

    _updateDynamicInstructions(exercise, exerciseId) {
        if (!exercise.instructions) return;

        switch (exerciseId) {
            case 'box':
                exercise.instructions.start =
                    `Box breathing : inspirez, retenez, expirez, retenez - chaque phase dure ${exercise.phases[0].duration} secondes.`;
                break;
            case 'co2-vhl':
                exercise.instructions.start =
                    `Hypoventilation VHL. Respirez normalement ${exercise.breathsPerCycle} cycles, puis expirez et faites une pause poumons bas ${exercise.holdDuration}s. ${exercise.cycles} séries.`;
                exercise.instructions.hold =
                    `Expirez normalement — ne videz pas à fond. Pause ${exercise.holdDuration}s. Poumons à mi-vide.`;
                break;
            case 'co2-vhl-classic':
                exercise.instructions.start =
                    `VHL Classique Woorons. ${exercise.breathsPerCycle} respirations normales, puis expirez normalement et faites une pause poumons bas ${exercise.holdDuration} secondes. ${exercise.cycles} cycles.`;
                exercise.instructions.hold =
                    `Expirez normalement — pas à fond. Pause ${exercise.holdDuration} secondes. Poumons à mi-vide.`;
                break;
            case 'co2-vhl-static':
                exercise.instructions.start =
                    `VHL Statique. Préparation cyclic sighing : double inspirez (snif sonore), expirez lentement. ${Math.round(exercise.prepDuration / 60)} minutes.`;
                break;
            case 'imst':
                exercise.instructions.start =
                    `IMST — ${exercise.repsPerSet} inspirations forcées par série. Inspirez le plus fort et vite possible contre la résistance. ${exercise.sets} séries au total.`;
                exercise.instructions.complete =
                    `Session IMST terminée. ${exercise.sets} séries complètes. Pratique régulière 6 jours/semaine = résultats en 6 semaines.`;
                break;
            case 'wimhof':
                exercise.instructions.start =
                    `Méthode Wim Hof : ${exercise.breathsPerRound} respirations profondes, puis rétention maximale.`;
                break;
            case 'relaxation':
                exercise.instructions.start =
                    `Technique ${exercise.phases[0].duration}-${exercise.phases[1].duration}-${exercise.phases[2].duration} : placez la langue derrière les dents du haut.`;
                break;
            case 'pranayama-142':
                exercise.instructions.start =
                    `Pranayama ${exercise.phases[0].duration}-${exercise.phases[1].duration}-${exercise.phases[2].duration}. Inspirez, retenez, expirez au rythme indiqué.`;
                break;
            case 'ocean-breath-co2':
                exercise.instructions.start =
                    `Ocean Breath CO2 — ${exercise.phases[0].duration}-${exercise.phases[1].duration}-${exercise.phases[2].duration}-${exercise.phases[3].duration}. Expiration longue freinée pour tolérance CO2.`;
                break;
            case 'cardiac-coherence': {
                const freq = exercise.cyclesPerMinute ? exercise.cyclesPerMinute.toFixed(1) : '5.5';
                exercise.instructions.start =
                    `Cohérence cardiaque à ${freq} cycles/min. Respirez au rythme indiqué. Laissez votre cœur se synchroniser.`;
                break;
            }
            case 'square-flow':
                exercise.instructions.start =
                    `Square Flow — Cohérence Plus. Suspension poumons pleins ${exercise.phases[1]?.duration || 10}s avec relâchement différentiel.`;
                break;
        }
    }

    getApneaTableParams(exerciseId, exercise, userSettings) {
        // En mode optimal, les tables d'apnée se comportent comme en mode auto (% de apneaMax)
        const isAutoMode = this.settings.mode === 'auto' || this.settings.mode === 'optimal';
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
            const exerciseId = card.dataset.exercise;

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
                    this.startExercise(exerciseId);
                });
            }

            const configBtn = card.querySelector('.btn-config');
            if (configBtn) {
                configBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const exId = configBtn.dataset.exercise;
                    this.navigateToExerciseSettings(exId);
                });
            }

            // Add favorite button
            if (exerciseId) {
                const actions = card.querySelector('.exercise-actions');
                if (actions) {
                    const isFav = this.isFavorite(exerciseId);
                    const favBtn = document.createElement('button');
                    favBtn.className = 'btn-favorite' + (isFav ? ' is-favorite' : '');
                    favBtn.title = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';
                    favBtn.setAttribute('aria-label', 'Favori');
                    favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
                    favBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleFavorite(exerciseId);
                    });
                    actions.prepend(favBtn);
                }
            }
        });
    }

    navigateToExerciseSettings(exerciseId) {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');

        // Mémoriser la section active avant de quitter
        const currentActive = document.querySelector('.section.active');
        const originSectionId = currentActive ? currentActive.id : null;

        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('[data-section="settings"]').classList.add('active');

        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('settings').classList.add('active');

        // Afficher le bouton retour si on vient d'une autre section
        const backBtn = document.getElementById('btnBackToSection');
        if (backBtn && originSectionId && originSectionId !== 'settings') {
            backBtn.style.display = '';
            // Libeller le bouton avec le nom de la section d'origine
            const originLink = document.querySelector(`[data-section="${originSectionId}"]`);
            const originLabel = originLink ? (originLink.textContent.trim() || originSectionId) : originSectionId;
            backBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 12H5M12 5l-7 7 7 7"/></svg> ${originLabel}`;
            backBtn.onclick = () => {
                // Retourner à la section d'origine
                navLinks.forEach(l => l.classList.remove('active'));
                if (originLink) originLink.classList.add('active');
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(originSectionId).classList.add('active');
                backBtn.style.display = 'none';
            };
        }

        // Find the exercise settings section and scroll to it
        const exerciseSettings = document.querySelector(`.exercise-settings[data-exercise="${exerciseId}"]`);
        if (exerciseSettings) {
            const cardBody = exerciseSettings.closest('.settings-card-body');
            if (cardBody && cardBody.classList.contains('collapsed')) {
                cardBody.classList.remove('collapsed');
                const expandBtn = cardBody.previousElementSibling?.querySelector('.btn-expand');
                if (expandBtn) expandBtn.classList.add('expanded');
            }
            setTimeout(() => {
                exerciseSettings.scrollIntoView({ behavior: 'smooth', block: 'center' });
                exerciseSettings.classList.add('highlight');
                setTimeout(() => exerciseSettings.classList.remove('highlight'), 2000);
            }, 100);
        }
    }

    // ==========================================
    // Favoris
    // ==========================================

    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('deepbreath_favorites') || '[]');
        } catch {
            return [];
        }
    }

    saveFavorites(favs) {
        localStorage.setItem('deepbreath_favorites', JSON.stringify(favs));
    }

    isFavorite(exerciseId) {
        return this.getFavorites().includes(exerciseId);
    }

    toggleFavorite(exerciseId) {
        let favs = this.getFavorites();
        const idx = favs.indexOf(exerciseId);
        if (idx === -1) {
            favs.push(exerciseId);
        } else {
            favs.splice(idx, 1);
        }
        this.saveFavorites(favs);

        // Update all buttons for this exercise (in main sections + favoris section)
        document.querySelectorAll(`.exercise-card[data-exercise="${exerciseId}"] .btn-favorite`).forEach(btn => {
            const isFav = favs.includes(exerciseId);
            btn.classList.toggle('is-favorite', isFav);
            btn.title = isFav ? 'Retirer des favoris' : 'Ajouter aux favoris';
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        });

        this.renderFavorisSection();
    }

    renderFavorisSection() {
        const grid = document.getElementById('favoris-grid');
        const empty = document.getElementById('favoris-empty');
        if (!grid) return;

        const favs = this.getFavorites();
        grid.innerHTML = '';

        if (favs.length === 0) {
            grid.style.display = 'none';
            if (empty) empty.style.display = 'flex';
            return;
        }

        grid.style.display = '';
        if (empty) empty.style.display = 'none';

        // Labels français pour chaque catégorie
        const categoryLabels = {
            'respiration': 'Respiration',
            'apnee': 'Entraînement Apnée',
            'visualisation': 'Visualisation',
            'urgence': 'Urgence',
            'preperformance': 'Pré-Performance',
            'autohypnose': 'Auto-Hypnose',
            'chasse': 'Warm & Breath Up'
        };

        // Ordre d'affichage des groupes
        const categoryOrder = [
            'respiration', 'apnee', 'visualisation', 'urgence',
            'preperformance', 'autohypnose', 'chasse'
        ];

        // Grouper les favoris par catégorie
        const groups = {};
        favs.forEach(exerciseId => {
            const ex = typeof EXERCISES !== 'undefined' ? EXERCISES[exerciseId] : null;
            let cat = ex?.category || 'autre';
            // Fusionner statique/dynamique/profondeur dans chasse
            if (['statique', 'dynamique', 'profondeur'].includes(cat)) cat = 'chasse';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(exerciseId);
        });

        // Afficher chaque groupe dans l'ordre défini
        const allCategories = [...categoryOrder];
        // Ajouter les catégories non listées en fin
        Object.keys(groups).forEach(cat => {
            if (!allCategories.includes(cat)) allCategories.push(cat);
        });

        allCategories.forEach(cat => {
            if (!groups[cat] || groups[cat].length === 0) return;

            // Titre du groupe
            const header = document.createElement('div');
            header.className = 'favoris-group-header';
            header.textContent = categoryLabels[cat] || cat;
            grid.appendChild(header);

            // Sous-grille pour les cartes du groupe
            const subGrid = document.createElement('div');
            subGrid.className = 'favoris-group-grid';
            grid.appendChild(subGrid);

            groups[cat].forEach(exerciseId => {
                const clone = this._cloneFavCard(exerciseId);
                if (clone) subGrid.appendChild(clone);
            });
        });
    }

    _cloneFavCard(exerciseId) {
        const original = document.querySelector(`section:not(#favoris) .exercise-card[data-exercise="${exerciseId}"]`);
        if (!original) return null;

        const clone = original.cloneNode(true);
        clone.setAttribute('data-exercise', exerciseId);

        // Re-wire the start button
        const startBtn = clone.querySelector('.btn-start');
        if (startBtn) {
            startBtn.addEventListener('click', async () => {
                if (window.breathSounds) {
                    if (!window.breathSounds.audioContext) {
                        window.breathSounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    }
                    if (window.breathSounds.audioContext.state === 'suspended') {
                        await window.breathSounds.audioContext.resume();
                    }
                    window.breathSounds.enabled = true;
                }
                this.startExercise(exerciseId);
            });
        }

        // Re-wire config button
        const configBtn = clone.querySelector('.btn-config');
        if (configBtn) {
            configBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateToExerciseSettings(exerciseId);
            });
        }

        // Re-wire favorite button (already cloned as is-favorite)
        const favBtn = clone.querySelector('.btn-favorite');
        if (favBtn) {
            favBtn.classList.add('is-favorite');
            favBtn.title = 'Retirer des favoris';
            favBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(exerciseId);
            });
        }

        return clone;
    }

    setupFavoris() {
        this.renderFavorisSection();
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
        // Bug #9 : guard against double-start (button tapped twice)
        if (this.isRunning) return;

        const exercise = this.getExerciseParams(exerciseId);
        if (!exercise) return;

        // Bug #12 : clean up any lingering timers from a previous exercise
        if (this.phaseTimer) { clearInterval(this.phaseTimer); this.phaseTimer = null; }
        if (this.displayTimer) { clearInterval(this.displayTimer); this.displayTimer = null; }

        // Stop any residual sounds
        if (window.breathSounds) window.breathSounds.stop();

        this.currentExercise = exercise;
        this.currentExercise.id = exerciseId;
        this.isRunning = true;
        this.isPaused = false;
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.elapsedTime = 0;
        this.exerciseStartTime = Date.now();
        this.exercisePausedTotal = 0;
        this._exercisePauseStart = null;

        // Bug #10/#11 : reset all exercise-specific state variables
        // Breath Light
        this._blRoundIndex = 0;
        this._blCycleInRound = 1;
        this._blRoundStartTime = null;
        // Passive Breath Hanger
        this._pbhCycle = 1;
        this._pbhHoldTimes = [];
        this._pbhUrgeTime = null;
        this._pbhHoldStart = null;
        this._pbhPausedTime = 0;
        this._pbhPauseStart = null;
        this._pbhPrepMidSpoken = false;   // Bug #11 : reset here, not at end of prep
        // VHL
        this._vhlSerie = 1;
        this._vhlBreathInCycle = 1;
        this._vhlRestBreathCount = 0;
        // VHL Statique
        this._vhlsCycle = 1;
        this._vhlsHoldStart = null;
        this._vhlsPausedMs = 0;           // Bug #15 : always reset pause accumulator
        this._vhlsPauseStart = null;
        // IMST
        this._imstSet = 1;
        this._imstRep = 1;
        // Wim Hof
        this.wimHofRound = 1;
        this.wimHofBreath = 1;

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

        // Switch between Canvas (new engine) and Legacy circle containers
        const canvasContainer = document.getElementById('breathCanvasContainer');
        const circleContainer = document.getElementById('breathCircleContainer');
        const isLegacyExercise = exercise.isComfortZone || exercise.isApneaWithGuidance ||
            exercise.isContractionTable || exercise.isApneaTable || exercise.isDeepSleep ||
            exercise.isGuided || exercise.isWimHof ||
            exercise.isPassiveBreathHanger || exercise.isVHLStatic || exercise.isVHL;

        if (isLegacyExercise) {
            // Phase 2 exercises: use legacy CSS circle
            if (canvasContainer) canvasContainer.style.display = 'none';
            if (circleContainer) circleContainer.style.display = '';
        } else {
            // Standard breathing exercises: use new Canvas engine
            if (canvasContainer) canvasContainer.style.display = '';
            if (circleContainer) circleContainer.style.display = 'none';
        }

        // Determine exercise type and start
        if (exercise.isComfortZone) {
            this.startComfortZone();
        } else if (exercise.isApneaWithGuidance) {
            this.startApneaWithGuidance();
        } else if (exercise.isContractionTable) {
            this.startContractionTable();
        } else if (exercise.isApneaTable) {
            this.startApneaTable();
        } else if (exercise.isDeepSleep) {
            this.startDeepSleepExercise();
        } else if (exercise.isGuided) {
            this.startGuidedExercise();
        } else if (exercise.isWimHof) {
            this.startWimHofExercise();
        } else if (exercise.isBreathLight) {
            this.startBreathLightExercise();
        } else if (exercise.isPassiveBreathHanger) {
            this.startPassiveBreathHanger();
        } else if (exercise.isVHLStatic) {
            this.startVHLStaticExercise();
        } else if (exercise.isVHL) {
            this.startVHLExercise();
        } else if (exercise.isIMST) {
            this.startIMSTExercise();
        } else {
            this.startBreathingExercise();
        }
    }

    // ==========================================
    // Standard Breathing Exercise
    // ==========================================

    startBreathingExercise() {
        const exercise = this.currentExercise;

        // Guard: exercise must have phases array to use the engine
        if (!exercise.phases || exercise.phases.length === 0) {
            console.warn('startBreathingExercise: no phases, showing info only');
            document.getElementById('exerciseInstruction').textContent =
                exercise.description || 'Suivez les instructions de cet exercice.';
            document.getElementById('cycleCounter').textContent = '';
            return;
        }

        const totalCycles = exercise.cycles || Math.floor(exercise.duration * 60 / this.getCycleDuration());

        document.getElementById('exerciseInstruction').textContent =
            (exercise.instructions && exercise.instructions.start) || exercise.description || '';

        const canvas = document.getElementById('breathCanvas');
        const overlay = document.getElementById('beOverlay');
        if (!canvas) {
            console.error('BreathEngine v3: canvas #breathCanvas not found');
            return;
        }

        window.BreathEngine.mount(canvas, overlay);
        window.BreathEngine.configure(this._buildV3Config(exercise, totalCycles, {
            onPhaseChange: (phaseName, duration) => {
                // Trouver la phase v2 correspondante pour l'instruction texte
                const v2Phase = this._v3PhaseToV2(exercise, phaseName);
                const instr = exercise.instructions || {};
                const label = v2Phase
                    ? (instr[v2Phase.name] || v2Phase.instruction || v2Phase.subText || v2Phase.name || '')
                    : '';
                document.getElementById('exerciseInstruction').textContent = label;

                // Voix guide — 2 premiers cycles seulement
                if (window.voiceGuide && label && this.currentCycle <= 2) {
                    window.voiceGuide.speakWithDelay(label, 300);
                }

                // Cyclic Sighing : deuxième inspire → son spécial
                if (v2Phase && v2Phase.name === 'Inspirez +' && window.breathSounds && !exercise.isKapalabhati) {
                    window.breathSounds.stop();
                    window.breathSounds.playSecondInhale();
                }
            },
            onCycleComplete: (cycleNumber) => {
                this.currentCycle = cycleNumber + 1;
                document.getElementById('cycleCounter').textContent =
                    `Cycle ${this.currentCycle} / ${totalCycles}`;
            },
            onTick: (state) => {
                this.elapsedTime = state.totalElapsed;
            },
            onComplete: () => {
                this.completeExercise();
            }
        }));

        // Stocker une référence pour les appels pause/resume/stop
        this.engine = window.BreathEngine;

        // Voix de départ : parler avant le countdown (reprend le comportement v2)
        const startInstruction = exercise.instructions?.start;
        if (window.voiceGuide && startInstruction) {
            window.voiceGuide.speak(startInstruction, () => {
                if (!this.isRunning) return; // exercice fermé pendant la voix
                setTimeout(() => window.BreathEngine.start(), 600);
            });
        } else {
            window.BreathEngine.start();
        }
    }

    // ==========================================
    // Custom Breathing Exercise (from Multi Timer)
    // ==========================================

    /**
     * Start a custom breathing exercise from Multi Timer.
     * Receives a pre-built exercise object (not from EXERCISES constant).
     * Uses the main exercise modal with BreathingEngine v2.0.
     */
    async startCustomBreathingExercise(exerciseObj) {
        if (this.isRunning) return;

        // Clean up any lingering timers
        if (this.phaseTimer) { clearInterval(this.phaseTimer); this.phaseTimer = null; }
        if (this.displayTimer) { clearInterval(this.displayTimer); this.displayTimer = null; }
        if (window.breathSounds) window.breathSounds.stop();

        // Set state
        this.currentExercise = exerciseObj;
        this.isRunning = true;
        this.isPaused = false;
        this.currentPhaseIndex = 0;
        this.currentCycle = 1;
        this.elapsedTime = 0;
        this.exerciseStartTime = Date.now();
        this.exercisePausedTotal = 0;
        this._exercisePauseStart = null;

        // Prevent screen sleep
        this.requestWakeLock();

        // Initialize breath sounds
        if (window.breathSounds) {
            if (!window.breathSounds.audioContext) {
                window.breathSounds.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (window.breathSounds.audioContext.state === 'suspended') {
                try { await window.breathSounds.audioContext.resume(); } catch(e) {}
            }
            window.breathSounds.enabled = true;
        }

        // Show exercise modal
        const modal = document.getElementById('exerciseModal');
        modal.classList.add('active');

        // Title + Canvas container
        document.getElementById('exerciseTitle').textContent = exerciseObj.name;
        const canvasContainer = document.getElementById('breathCanvasContainer');
        const circleContainer = document.getElementById('breathCircleContainer');
        if (canvasContainer) canvasContainer.style.display = '';
        if (circleContainer) circleContainer.style.display = 'none';

        // Hide special exercise UI elements
        const specialEls = ['btnMarkContraction', 'contractionCounter', 'btnComfortStop', 'hangerControls'];
        specialEls.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

        // Configure BreathingEngine
        const totalCycles = exerciseObj.cycles || 10;
        document.getElementById('cycleCounter').textContent = `Cycle 1 / ${totalCycles}`;
        document.getElementById('exerciseInstruction').textContent =
            exerciseObj.instructions?.start || exerciseObj.description || '';

        const canvas = document.getElementById('breathCanvas');
        const overlay = document.getElementById('beOverlay');
        if (!canvas) return;

        window.BreathEngine.mount(canvas, overlay);
        window.BreathEngine.configure(this._buildV3Config(exerciseObj, totalCycles, {
            onPhaseChange: (phaseName, duration) => {
                const v2Phase = this._v3PhaseToV2(exerciseObj, phaseName);
                const instr = exerciseObj.instructions || {};
                const label = v2Phase
                    ? (instr[v2Phase.name] || v2Phase.instruction || v2Phase.subText || v2Phase.name || '')
                    : '';
                document.getElementById('exerciseInstruction').textContent = label;
                if (window.voiceGuide && label && this.currentCycle <= 2) {
                    window.voiceGuide.speakWithDelay(label, 300);
                }
            },
            onCycleComplete: (cycleNumber) => {
                this.currentCycle = cycleNumber + 1;
                document.getElementById('cycleCounter').textContent =
                    `Cycle ${this.currentCycle} / ${totalCycles}`;
            },
            onTick: (state) => {
                this.elapsedTime = state.totalElapsed;
            },
            onComplete: () => {
                this.completeExercise();
            }
        }));

        this.engine = window.BreathEngine;

        const startInstruction = exerciseObj.instructions?.start;
        if (window.voiceGuide && startInstruction) {
            window.voiceGuide.speak(startInstruction, () => {
                if (!this.isRunning) return;
                setTimeout(() => window.BreathEngine.start(), 600);
            });
        } else {
            window.BreathEngine.start();
        }
    }

    getCycleDuration() {
        const phases = this.currentExercise?.phases;
        if (!phases || phases.length === 0) return 1; // guard division by zero
        return phases.reduce((sum, p) => sum + p.duration, 0) || 1;
    }

    // ==========================================
    // BreathEngine v3 — helpers de conversion
    // ==========================================

    /**
     * Convertit un exercice v2 {phases:[{name,action,duration}]} en config v3
     * Le format v3 utilise un dict indexé par phase-type (inhale/holdFull/exhale/holdEmpty/recovery)
     */
    _buildV3Config(exercise, totalCycles, callbacks) {
        const phases = exercise.phases || [];
        const v3Phases = {
            preparation: { enabled: false, duration: 0 },
            inhale:      { enabled: false, duration: 0, label: 'Inspirer' },
            holdFull:    { enabled: false, duration: 0, label: 'Retenir' },
            exhale:      { enabled: false, duration: 0, label: 'Expirer' },
            holdEmpty:   { enabled: false, duration: 0, label: 'Retenir' },
            recovery:    { enabled: false, duration: 0, label: 'Repos' },
        };

        // Déterminer quelles phases v3 activer depuis le tableau v2
        let prevAction = null;
        for (const p of phases) {
            const action = p.action;
            let v3Key = null;

            if (action === 'inhale') {
                // Si déjà une inhale mappée, ignorer les suivantes (ex: Cyclic Sighing double inhale)
                if (!v3Phases.inhale.enabled) {
                    v3Key = 'inhale';
                }
            } else if (action === 'hold' || action === 'holdFull') {
                // hold après inhale = holdFull, hold après exhale = holdEmpty
                v3Key = (prevAction === 'exhale' || prevAction === 'holdEmpty') ? 'holdEmpty' : 'holdFull';
            } else if (action === 'holdEmpty') {
                v3Key = 'holdEmpty';
            } else if (action === 'exhale') {
                v3Key = 'exhale';
            } else if (action === 'recovery') {
                v3Key = 'recovery';
            }

            if (v3Key) {
                v3Phases[v3Key] = {
                    enabled: true,
                    duration: p.duration,
                    label: p.name || v3Phases[v3Key].label,
                    easing: 'cubicInOut',
                    silent: !!exercise.isKapalabhati,
                };
            }
            prevAction = action;
        }

        return {
            totalCycles,
            countdownDuration: 2,
            phases: v3Phases,
            volume: this.settings.soundVolume !== undefined ? this.settings.soundVolume : 0.5,
            muted: !(this.settings.soundEnabled !== false),
            onPhaseChange:   callbacks.onPhaseChange   || null,
            onCycleComplete: callbacks.onCycleComplete || null,
            onComplete:      callbacks.onComplete      || null,
            onTick:          callbacks.onTick          || null,
        };
    }

    /**
     * Trouve la phase v2 qui correspond à un nom de phase v3
     * Utilisé pour récupérer l'instruction texte et la voix
     */
    _v3PhaseToV2(exercise, v3PhaseName) {
        const phases = exercise.phases || [];
        // Mapping v3 key → action(s) v2 attendus
        const actionMap = {
            inhale:    ['inhale'],
            holdFull:  ['hold', 'holdFull'],
            exhale:    ['exhale'],
            holdEmpty: ['holdEmpty', 'hold'],
            recovery:  ['recovery'],
        };
        const targets = actionMap[v3PhaseName] || [];

        // Trouver la première phase v2 dont l'action correspond
        // Pour holdEmpty, on veut le hold qui suit un exhale
        if (v3PhaseName === 'holdEmpty') {
            for (let i = 1; i < phases.length; i++) {
                if ((phases[i].action === 'hold' || phases[i].action === 'holdEmpty') &&
                    phases[i - 1].action === 'exhale') {
                    return phases[i];
                }
            }
        }
        if (v3PhaseName === 'holdFull') {
            for (let i = 1; i < phases.length; i++) {
                if ((phases[i].action === 'hold' || phases[i].action === 'holdFull') &&
                    phases[i - 1].action === 'inhale') {
                    return phases[i];
                }
            }
            // fallback : premier hold
            return phases.find(p => p.action === 'hold' || p.action === 'holdFull') || null;
        }
        return phases.find(p => targets.includes(p.action)) || null;
    }

    // ==========================================
    // Legacy Phase Engine (kept for Phase 2 special exercises)
    // ==========================================

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

        // Play breath sound for this phase (only for non-guided, non-kapalabhati exercises)
        // Bug #6 : Kapalabhati has 0.5s phases — playing a new sound every 0.5s would stack
        // 30+ overlapping sounds. Skip entirely for kapalabhati.
        if (window.breathSounds && !exercise.isGuided && !exercise.isKapalabhati) {
            // Bug #5 : always stop the previous sound before starting a new one
            window.breathSounds.stop();
            // 2nd inhale of Cyclic Sighing — short distinct tap
            if (phase.name === 'Inspirez +') {
                window.breathSounds.playSecondInhale();
            } else {
                // For hold phases, determine if it's holdEmpty based on previous action
                let soundPhase = phase.action;
                if (phase.action === 'hold' && previousAction === 'exhale') {
                    soundPhase = 'holdEmpty';
                }
                window.breathSounds.playPhase(soundPhase, phase.duration);
            }
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

        // Remove ALL state classes (Bug #3 : always clean every class)
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        // Bug #1/#4 : force reflow so the browser registers the class removal
        // before we set --phase-duration and re-add the action class.
        // Without this, rapid inhale→exhale transitions may not restart the CSS animation.
        void circle.offsetWidth;

        // Set transition duration BEFORE adding the new class (Bug #1)
        circle.style.setProperty('--phase-duration', `${phase.duration}s`);

        // Determine the correct action class
        let actionClass = phase.action;

        // For hold phases, determine if lungs are full or empty based on previous action
        if (phase.action === 'hold') {
            if (previousAction === 'exhale') {
                actionClass = 'holdEmpty';
            } else {
                actionClass = 'hold';
            }
        }

        // Add appropriate class — now after reflow + duration set
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
            // Bug F : stop immediately if exercise was closed (race-condition guard)
            if (!this.isRunning) {
                clearInterval(this.phaseTimer);
                this.phaseTimer = null;
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
    // Breath Light CO2 Exercise (Oxygen Advantage)
    // ==========================================

    startBreathLightExercise() {
        const exercise = this.currentExercise;
        this._blRoundIndex = 0;

        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;
        document.getElementById('cycleCounter').textContent = '';

        const canvas  = document.getElementById('breathCanvas');
        const overlay = document.getElementById('beOverlay');
        if (!canvas) return;
        window.BreathEngine.mount(canvas, overlay);
        this.engine = window.BreathEngine;

        const launchRound = () => {
            if (!this.isRunning) return;
            const rounds = exercise.rounds;

            if (this._blRoundIndex >= rounds.length) {
                this.completeExercise();
                return;
            }

            const round = rounds[this._blRoundIndex];
            const cycleDur = round.inhale + round.exhale + (round.hold || 0);
            const totalCycles = Math.max(1, Math.round(round.durationSec / cycleDur));

            // Construire les phases v3 selon la config du round
            const holdEnabled = round.hold > 0;
            const v3Phases = {
                preparation: { enabled: false, duration: 0 },
                inhale:      { enabled: true,  duration: round.inhale, label: 'Inspirez',  easing: 'cubicInOut' },
                holdFull:    { enabled: false, duration: 0 },
                exhale:      { enabled: true,  duration: round.exhale, label: 'Expirez',   easing: 'cubicInOut' },
                holdEmpty:   { enabled: holdEnabled, duration: holdEnabled ? round.hold : 0, label: 'Pause', easing: 'sineInOut' },
                recovery:    { enabled: false, duration: 0 },
            };

            document.getElementById('cycleCounter').textContent = round.label;
            document.getElementById('exerciseInstruction').textContent = round.instruction;

            if (window.voiceGuide?.enabled) {
                window.voiceGuide.speak(round.label + '. ' + round.instruction);
            }

            window.BreathEngine.configure({
                totalCycles,
                countdownDuration: 0,
                phases: v3Phases,
                onPhaseChange: (phaseName) => {
                    document.getElementById('exerciseInstruction').textContent = round.instruction;
                },
                onCycleComplete: (cycleNumber) => {
                    document.getElementById('cycleCounter').textContent =
                        `${round.label}  •  Cycle ${cycleNumber + 1} / ${totalCycles}`;
                },
                onComplete: () => {
                    if (!this.isRunning) return;
                    this._blRoundIndex++;
                    const nextRound = exercise.rounds[this._blRoundIndex];
                    if (nextRound) {
                        if (window.voiceGuide?.enabled) {
                            window.voiceGuide.speak('Prochaine phase : ' + nextRound.label);
                        }
                        setTimeout(() => launchRound(), 1500);
                    } else {
                        this.completeExercise();
                    }
                },
            });

            window.BreathEngine.start();
        };

        if (window.voiceGuide?.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => { if (this.isRunning) launchRound(); }, 800);
            });
        } else {
            setTimeout(() => launchRound(), 2500);
        }
    }

    // ==========================================
    // Passive Breath Hanger (Molchanovs / Néry)
    // ==========================================

    startPassiveBreathHanger() {
        const exercise = this.currentExercise;
        this._pbhCycle = 1;
        this._pbhHoldTimes = [];          // hold durations per cycle (auto-measured)
        this._pbhUrgeTime = null;         // first urge time per hold
        this._pbhHoldStart = null;
        this._pbhPausedTime = 0;
        this._pbhPauseStart = null;

        document.getElementById('cycleCounter').textContent =
            `Cycle 1 / ${exercise.cycles}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        // Show "first urge" button (hidden by default in modal, revealed here)
        const btnUrge = document.getElementById('btnHangerUrge');
        const btnStop = document.getElementById('btnHangerStop');
        if (btnUrge) btnUrge.style.display = 'none';
        if (btnStop) btnStop.style.display = 'none';

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => {
                    if (!this.isRunning) return;
                    this._pbhRunPrepPhase();
                }, 800);
            });
        } else {
            setTimeout(() => this._pbhRunPrepPhase(), 2000);
        }
    }

    _pbhRunPrepPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const prepDur = exercise.prepDuration || 180;

        document.getElementById('breathPhase').textContent = 'Préparation';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.prep;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._pbhCycle} / ${exercise.cycles} — Double soupir`;

        // Visual: inhale animation (cyclic sighing feel)
        this.updateBreathPhase({ name: 'Préparation', action: 'inhale', duration: 4 }, null);

        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', prepDur);
        }
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.prep);
        }

        // Count-down during prep
        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        const prepStart = Date.now();
        let pausedMs = 0;
        let pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) { clearInterval(this.phaseTimer); return; }
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) { pausedMs += Date.now() - pauseStart; pauseStart = null; }

            const elapsed = (Date.now() - prepStart - pausedMs) / 1000;
            const remaining = Math.max(0, prepDur - elapsed);
            timerDisplay.textContent = this.formatTime(remaining);
            progressBar.style.strokeDashoffset = circumference * (1 - elapsed / prepDur);

            // Mid-point voice reminder
            if (elapsed >= prepDur / 2 && !this._pbhPrepMidSpoken) {
                this._pbhPrepMidSpoken = true;
                if (window.voiceGuide && window.voiceGuide.enabled) {
                    window.voiceGuide.speak('Continuez. Presque prêt pour la suspension.');
                }
            }

            if (elapsed >= prepDur) {
                clearInterval(this.phaseTimer);
                this.phaseTimer = null;
                this._pbhPrepMidSpoken = false;
                if (window.breathSounds) window.breathSounds.stop();
                this._pbhRunInhalePhase();
            }
        }, 100);
    }

    _pbhRunInhalePhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        document.getElementById('breathPhase').textContent = 'Inspirez 80%';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.inhale;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._pbhCycle} / ${exercise.cycles} — Inspiration`;

        const inhaleDur = 4; // 4 sec inhale to 80%
        this.updateBreathPhase({ name: 'Inspirez', action: 'inhale', duration: inhaleDur }, 'exhale');

        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', inhaleDur);
        }
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.inhale);
        }

        this.startPhaseTimer(inhaleDur, () => {
            if (!this.isRunning) return;
            if (window.breathSounds) window.breathSounds.stop();
            this._pbhRunHoldPhase();
        });
    }

    _pbhRunHoldPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        document.getElementById('breathPhase').textContent = 'Suspension';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.hold;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._pbhCycle} / ${exercise.cycles} — Suspension`;

        // Hold circle animation
        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'holdEmpty', 'hold', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', '1s');
        circle.classList.add('hold', 'active');

        // Show control buttons
        const btnUrge = document.getElementById('btnHangerUrge');
        const btnStop = document.getElementById('btnHangerStop');
        if (btnUrge) { btnUrge.style.display = ''; btnUrge.disabled = false; btnUrge.textContent = '⚡ 1ère envie'; }
        if (btnStop) { btnStop.style.display = ''; }

        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        this._pbhHoldStart = Date.now();
        this._pbhPausedTime = 0;
        this._pbhPauseStart = null;
        this._pbhUrgeTime = null;
        const maxDur = exercise.maxHoldDuration || 300;
        const refMax = this.settings.apneaMax || 120;

        // Wire buttons
        if (btnUrge) {
            btnUrge.onclick = () => {
                if (!this._pbhUrgeTime) {
                    const now = (Date.now() - this._pbhHoldStart - this._pbhPausedTime) / 1000;
                    this._pbhUrgeTime = Math.round(now);
                    btnUrge.disabled = true;
                    btnUrge.textContent = `⚡ ${this.formatTime(this._pbhUrgeTime)}`;
                    if (window.voiceGuide && window.voiceGuide.enabled) {
                        window.voiceGuide.speak('Première envie notée. Continuez.');
                    }
                }
            };
        }
        if (btnStop) {
            btnStop.onclick = () => {
                const elapsed = (Date.now() - this._pbhHoldStart - this._pbhPausedTime) / 1000;
                this._pbhEndHold(elapsed);
            };
        }

        if (window.breathSounds) {
            window.breathSounds.playPhase('hold', maxDur);
        }
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.hold);
        }

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) { clearInterval(this.phaseTimer); return; }
            if (this.isPaused) {
                if (!this._pbhPauseStart) this._pbhPauseStart = Date.now();
                return;
            }
            if (this._pbhPauseStart) {
                this._pbhPausedTime += Date.now() - this._pbhPauseStart;
                this._pbhPauseStart = null;
            }

            const elapsed = (Date.now() - this._pbhHoldStart - this._pbhPausedTime) / 1000;
            timerDisplay.textContent = this.formatTime(elapsed);
            progressBar.style.strokeDashoffset = circumference * (1 - Math.min(elapsed / refMax, 1));

            if (elapsed >= maxDur) {
                this._pbhEndHold(elapsed);
            }
        }, 100);
    }

    _pbhEndHold(holdDuration) {
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;

        // Hide buttons
        const btnUrge = document.getElementById('btnHangerUrge');
        const btnStop = document.getElementById('btnHangerStop');
        if (btnUrge) btnUrge.style.display = 'none';
        if (btnStop) btnStop.style.display = 'none';

        if (window.breathSounds) window.breathSounds.stop();

        // Record hold data
        this._pbhHoldTimes.push({
            cycle: this._pbhCycle,
            duration: Math.round(holdDuration),
            timeToUrge: this._pbhUrgeTime
        });

        this._pbhRunExhalePhase();
    }

    _pbhRunExhalePhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        document.getElementById('breathPhase').textContent = 'Expirez lentement';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.exhale;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._pbhCycle} / ${exercise.cycles} — Expiration`;

        const exhaleDur = 10;
        this.updateBreathPhase({ name: 'Expirez', action: 'exhale', duration: exhaleDur }, 'hold');

        if (window.breathSounds) {
            window.breathSounds.stop();
            window.breathSounds.playPhase('exhale', exhaleDur);
        }
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.exhale);
        }

        this.startPhaseTimer(exhaleDur, () => {
            if (!this.isRunning) return;
            if (window.breathSounds) window.breathSounds.stop();
            this._pbhCycle++;
            if (this._pbhCycle > exercise.cycles) {
                this._pbhComplete();
            } else {
                this._pbhRunRestPhase();
            }
        });
    }

    _pbhRunRestPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const restDur = exercise.restDuration || 90;

        document.getElementById('breathPhase').textContent = 'Récupération';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.rest;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._pbhCycle} / ${exercise.cycles} — Repos`;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('hold', 'holdEmpty', 'exhale', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', `${restDur}s`);
        circle.classList.add('inhale', 'active');

        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', restDur);
        }
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.rest);
        }

        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        const restStart = Date.now();
        let pausedMs = 0;
        let pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) { clearInterval(this.phaseTimer); return; }
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) { pausedMs += Date.now() - pauseStart; pauseStart = null; }

            const elapsed = (Date.now() - restStart - pausedMs) / 1000;
            const remaining = Math.max(0, restDur - elapsed);
            timerDisplay.textContent = this.formatTime(remaining);
            progressBar.style.strokeDashoffset = circumference * (1 - elapsed / restDur);

            if (elapsed >= restDur) {
                clearInterval(this.phaseTimer);
                this.phaseTimer = null;
                if (window.breathSounds) window.breathSounds.stop();
                this._pbhRunInhalePhase(); // cyclic sighing uniquement au démarrage
            }
        }, 100);
    }

    _pbhComplete() {
        // Save raw hold data to localStorage for progression tracking
        const durations = this._pbhHoldTimes.map(h => h.duration);
        const best = durations.length ? Math.max(...durations) : 0;
        const avg  = durations.length ? Math.round(durations.reduce((a,b) => a+b,0) / durations.length) : 0;

        // Store in pending session for coach to retrieve
        this._pbhSessionData = {
            holds: this._pbhHoldTimes,
            best,
            avg
        };

        // Show summary
        const summary = this._pbhHoldTimes.map((h,i) =>
            `C${i+1}: ${this.formatTime(h.duration)}${h.timeToUrge ? ' (⚡'+this.formatTime(h.timeToUrge)+')' : ''}`
        ).join(' — ');
        document.getElementById('exerciseInstruction').textContent =
            `${summary} — Meilleur: ${this.formatTime(best)}`;

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(this.currentExercise.instructions.complete);
        }

        setTimeout(() => this.completeExercise(), 2000);
    }

    // ==========================================
    // VHL — Hypoventilation à bas volume (Woorons)
    // Protocole : N respirations normales → pause end-expiratory → répéter X cycles → repos
    // ==========================================

    startVHLExercise() {
        const exercise = this.currentExercise;
        this._vhlCycle = 1;          // cycle de pause en cours (1..cycles)
        this._vhlSerie = 1;          // série (une série = breathsPerCycle respirations + 1 pause)
        this._vhlBreathInCycle = 1;  // respiration courante dans le cycle
        this._vhlSeriesTotal = exercise.cycles || 5;
        this._vhlBreathsPerCycle = exercise.breathsPerCycle || 3;
        this._vhlHoldDuration = exercise.holdDuration || 5;
        this._vhlRestBreaths = exercise.restBreaths || 4;
        this._vhlRestBreathCount = 0;
        this._vhlPhase = 'breathe'; // 'breathe' | 'hold' | 'rest'

        document.getElementById('cycleCounter').textContent =
            `Série 1 / ${this._vhlSeriesTotal}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        if (window.voiceGuide?.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => {
                    if (!this.isRunning) return;
                    this._vhlRunBreathePhase();
                }, 800);
            });
        } else {
            setTimeout(() => this._vhlRunBreathePhase(), 3000);
        }
    }

    _vhlRunBreathePhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        // Si on a fait tous les cycles → fin
        if (this._vhlSerie > this._vhlSeriesTotal) {
            this.completeExercise();
            return;
        }

        this._vhlPhase = 'breathe';
        this._vhlBreathInCycle = 1;

        document.getElementById('breathPhase').textContent = 'Respirez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.breathe;
        document.getElementById('cycleCounter').textContent =
            `Série ${this._vhlSerie} / ${this._vhlSeriesTotal} — Respirez ${this._vhlBreathsPerCycle}×`;

        this._vhlRunOneBreath();
    }

    _vhlRunOneBreath() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        if (this._vhlBreathInCycle > this._vhlBreathsPerCycle) {
            // Toutes les respirations faites → pause VHL
            this._vhlRunHoldPhase();
            return;
        }

        // Inspiration
        document.getElementById('breathPhase').textContent = 'Inspirez';
        document.getElementById('cycleCounter').textContent =
            `Série ${this._vhlSerie}/${this._vhlSeriesTotal} — Resp. ${this._vhlBreathInCycle}/${this._vhlBreathsPerCycle}`;
        this.updateBreathPhase({ name: 'Inspirez', action: 'inhale', duration: 3 },
            this._vhlBreathInCycle === 1 ? 'holdEmpty' : 'exhale');

        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) window.breathSounds.playPhase('inhale', 3);
        if (this._vhlBreathInCycle === 1 && window.voiceGuide?.enabled) {
            window.voiceGuide.speak(exercise.instructions.breathe);
        }

        this.startPhaseTimer(3, () => {
            if (!this.isRunning) return;
            // Expiration
            document.getElementById('breathPhase').textContent = 'Expirez';
            this.updateBreathPhase({ name: 'Expirez', action: 'exhale', duration: 3 }, 'inhale');

            if (window.breathSounds) window.breathSounds.stop();
            if (window.breathSounds) window.breathSounds.playPhase('exhale', 3);

            this.startPhaseTimer(3, () => {
                if (!this.isRunning) return;
                this._vhlBreathInCycle++;
                // Petite pause entre les respirations (0.5s)
                setTimeout(() => this._vhlRunOneBreath(), 500);
            });
        });
    }

    _vhlRunHoldPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const holdDur = this._vhlHoldDuration;

        this._vhlPhase = 'hold';
        document.getElementById('breathPhase').textContent = 'Pause CO₂';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.hold;
        document.getElementById('cycleCounter').textContent =
            `Série ${this._vhlSerie}/${this._vhlSeriesTotal} — Pause ${holdDur}s (poumons bas)`;

        // Cercle holdEmpty = poumons vides/bas
        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', `${holdDur}s`);
        circle.classList.add('holdEmpty', 'active');

        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) window.breathSounds.playPhase('holdEmpty', holdDur);
        if (window.voiceGuide?.enabled) window.voiceGuide.speak(exercise.instructions.hold);

        // Timer décompte de la pause
        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        const holdStart = Date.now();
        let pausedMs = 0, pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) { clearInterval(this.phaseTimer); return; }
            if (this.isPaused) {
                if (!pauseStart) pauseStart = Date.now();
                return;
            }
            if (pauseStart) { pausedMs += Date.now() - pauseStart; pauseStart = null; }

            const elapsed = (Date.now() - holdStart - pausedMs) / 1000;
            const remaining = Math.max(0, holdDur - elapsed);
            timerDisplay.textContent = this.formatTime(remaining);
            progressBar.style.strokeDashoffset = circumference * (1 - elapsed / holdDur);

            if (elapsed >= holdDur) {
                clearInterval(this.phaseTimer);
                this.phaseTimer = null;
                if (window.breathSounds) window.breathSounds.stop();
                this._vhlSerie++;
                if (this._vhlSerie > this._vhlSeriesTotal) {
                    this.completeExercise();
                } else {
                    this._vhlRunRestPhase();
                }
            }
        }, 100);
    }

    _vhlRunRestPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const restCount = this._vhlRestBreaths;

        this._vhlPhase = 'rest';
        this._vhlRestBreathCount = 0;

        document.getElementById('breathPhase').textContent = 'Récupérez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.rest;
        document.getElementById('cycleCounter').textContent =
            `Repos — Série ${this._vhlSerie}/${this._vhlSeriesTotal} dans ${restCount} respirations`;

        const circle = document.getElementById('breathCircle');
        // Bug C : also remove inhale/exhale to avoid stacked scale classes
        circle.classList.remove('inhale', 'exhale', 'holdEmpty', 'hold', 'active');

        if (window.voiceGuide?.enabled) window.voiceGuide.speak(exercise.instructions.rest);

        this._vhlRunRestBreath(restCount);
    }

    _vhlRunRestBreath(remaining) {
        if (!this.isRunning) return;
        if (remaining <= 0) {
            if (window.breathSounds) window.breathSounds.stop();
            this._vhlRunBreathePhase();
            return;
        }

        document.getElementById('breathTimer').textContent = `${remaining}`;
        document.getElementById('cycleCounter').textContent =
            `Repos libre — encore ${remaining} souffle${remaining > 1 ? 's' : ''}`;

        // inhale 3s
        const circle = document.getElementById('breathCircle');
        circle.classList.remove('exhale', 'holdEmpty', 'hold', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', '3s');
        circle.classList.add('inhale', 'active');
        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) window.breathSounds.playPhase('inhale', 3);

        this.startPhaseTimer(3, () => {
            if (!this.isRunning) return;
            // exhale 3s
            circle.classList.remove('inhale', 'active');
            void circle.offsetWidth;
            circle.style.setProperty('--phase-duration', '3s');
            circle.classList.add('exhale', 'active');
            if (window.breathSounds) window.breathSounds.stop();
            if (window.breathSounds) window.breathSounds.playPhase('exhale', 3);
            this.startPhaseTimer(3, () => {
                this._vhlRunRestBreath(remaining - 1);
            });
        });
    }

    // ==========================================
    // VHL Statique (Woorons — pause longue FRC)
    // ==========================================

    startVHLStaticExercise() {
        const exercise = this.currentExercise;
        this._vhlsCycle = 1;
        this._vhlsSeriesTotal = exercise.cycles || 6;
        this._vhlsHoldDuration = exercise.holdDuration || 20;
        this._vhlsRestBreaths = exercise.restBreaths || 3;
        this._vhlsPrepDuration = exercise.prepDuration || 180;
        this._vhlsVolumeMode = exercise.volumeMode || 'frc';
        this._vhlsHoldStart = null;
        this._vhlsPausedMs = 0;
        this._vhlsPauseStart = null;

        document.getElementById('cycleCounter').textContent =
            `Cycle 1 / ${this._vhlsSeriesTotal}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        const btnUrge = document.getElementById('btnHangerUrge');
        const btnStop = document.getElementById('btnHangerStop');
        if (btnUrge) btnUrge.style.display = 'none';
        if (btnStop) btnStop.style.display = 'none';

        if (window.voiceGuide?.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => {
                    if (!this.isRunning) return;
                    this._vhlsRunPrepPhase();
                }, 800);
            });
        } else {
            setTimeout(() => this._vhlsRunPrepPhase(), 2000);
        }
    }

    _vhlsRunPrepPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const prepDur = this._vhlsPrepDuration;

        document.getElementById('breathPhase').textContent = 'Préparation';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.prep;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._vhlsCycle}/${this._vhlsSeriesTotal} — Cyclic Sighing ${prepDur}s`;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'holdEmpty', 'hold', 'exhale', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', '5s');
        circle.classList.add('inhale', 'active');

        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) window.breathSounds.playPhase('inhale', prepDur);
        if (window.voiceGuide?.enabled) window.voiceGuide.speak(exercise.instructions.prep);

        this.startPhaseTimer(prepDur, () => {
            this._vhlsRunHoldPhase();
        });
    }

    _vhlsRunHoldPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const holdDur = this._vhlsHoldDuration;

        document.getElementById('breathPhase').textContent = 'Pause VHL';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.hold;
        document.getElementById('cycleCounter').textContent =
            `Cycle ${this._vhlsCycle}/${this._vhlsSeriesTotal} — Pause ${holdDur}s (poumons bas)`;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', `${holdDur}s`);
        circle.classList.add('holdEmpty', 'active');

        const btnStop = document.getElementById('btnHangerStop');
        if (btnStop) {
            btnStop.style.display = '';
            btnStop.onclick = () => {
                if (!this._vhlsHoldStart) return;
                const elapsed = (Date.now() - this._vhlsHoldStart - this._vhlsPausedMs) / 1000;
                this._vhlsEndHold(elapsed);
            };
        }

        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) window.breathSounds.playPhase('holdEmpty', holdDur);
        if (window.voiceGuide?.enabled) window.voiceGuide.speak(exercise.instructions.hold);

        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        this._vhlsHoldStart = Date.now();
        this._vhlsPausedMs = 0;
        this._vhlsPauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);
        this.phaseTimer = setInterval(() => {
            if (!this.isRunning) { clearInterval(this.phaseTimer); return; }
            if (this.isPaused) {
                if (!this._vhlsPauseStart) this._vhlsPauseStart = Date.now();
                return;
            }
            if (this._vhlsPauseStart) {
                this._vhlsPausedMs += Date.now() - this._vhlsPauseStart;
                this._vhlsPauseStart = null;
            }

            const elapsed = (Date.now() - this._vhlsHoldStart - this._vhlsPausedMs) / 1000;
            const remaining = Math.max(0, holdDur - elapsed);
            timerDisplay.textContent = this.formatTime(remaining);
            progressBar.style.strokeDashoffset = circumference * (1 - elapsed / holdDur);

            if (elapsed >= holdDur) {
                clearInterval(this.phaseTimer);
                this.phaseTimer = null;
                this._vhlsEndHold(elapsed);
            }
        }, 100);
    }

    _vhlsEndHold(duration) {
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;
        if (window.breathSounds) window.breathSounds.stop();
        const btnStop = document.getElementById('btnHangerStop');
        if (btnStop) btnStop.style.display = 'none';
        this._vhlsRunRestPhase();
    }

    _vhlsRunRestPhase() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;
        const restCount = this._vhlsRestBreaths;

        document.getElementById('breathPhase').textContent = 'Récupérez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.rest;
        document.getElementById('cycleCounter').textContent =
            `Récup — Cycle ${this._vhlsCycle}/${this._vhlsSeriesTotal} dans ${restCount} souffles`;

        const circle = document.getElementById('breathCircle');
        // Bug D : also remove inhale/exhale to avoid stacked scale classes
        circle.classList.remove('inhale', 'exhale', 'holdEmpty', 'hold', 'active');

        if (window.voiceGuide?.enabled) window.voiceGuide.speak(exercise.instructions.rest);

        this._vhlsRunRestBreath(restCount);
    }

    _vhlsRunRestBreath(remaining) {
        if (!this.isRunning) return;
        if (remaining <= 0) {
            if (window.breathSounds) window.breathSounds.stop();
            this._vhlsCycle++;
            if (this._vhlsCycle > this._vhlsSeriesTotal) {
                this.completeExercise();
            } else {
                this._vhlsRunHoldPhase(); // cyclic sighing uniquement au démarrage
            }
            return;
        }

        document.getElementById('breathTimer').textContent = `${remaining}`;
        document.getElementById('cycleCounter').textContent =
            `Récup — encore ${remaining} souffle${remaining > 1 ? 's' : ''}`;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('exhale', 'holdEmpty', 'hold', 'active');
        void circle.offsetWidth;
        circle.style.setProperty('--phase-duration', '3s');
        circle.classList.add('inhale', 'active');
        if (window.breathSounds) window.breathSounds.stop();
        if (window.breathSounds) window.breathSounds.playPhase('inhale', 3);

        this.startPhaseTimer(3, () => {
            if (!this.isRunning) return;
            circle.classList.remove('inhale', 'active');
            void circle.offsetWidth;
            circle.style.setProperty('--phase-duration', '3s');
            circle.classList.add('exhale', 'active');
            if (window.breathSounds) window.breathSounds.stop();
            if (window.breathSounds) window.breathSounds.playPhase('exhale', 3);
            this.startPhaseTimer(3, () => {
                this._vhlsRunRestBreath(remaining - 1);
            });
        });
    }

    // ==========================================
    // IMST Exercise (Inspiratory Muscle Strength Training)
    // ==========================================

    startIMSTExercise() {
        const ex = this.currentExercise;
        this._imstSet       = 1;
        this._imstSetsTotal = ex.sets           || 5;
        this._imstRepsTotal = ex.repsPerSet     || 30;
        this._imstInhale    = ex.inhaleDuration || 2;
        this._imstExhale    = ex.exhaleDuration || 3;
        this._imstRest      = ex.restDuration   || 60;

        document.getElementById('exerciseInstruction').textContent = ex.instructions.start;

        const canvas  = document.getElementById('breathCanvas');
        const overlay = document.getElementById('beOverlay');
        if (!canvas) return;
        window.BreathEngine.mount(canvas, overlay);
        this.engine = window.BreathEngine;

        const launchSet = () => {
            if (!this.isRunning) return;
            const set = this._imstSet;
            const setsTotal = this._imstSetsTotal;

            document.getElementById('exerciseInstruction').textContent =
                ex.mode === 'device' ? ex.instructions.inhale : (ex.instructions.inhale_free || ex.instructions.inhale);

            window.BreathEngine.configure({
                totalCycles:       this._imstRepsTotal,
                countdownDuration: 0,
                phases: {
                    preparation: { enabled: false, duration: 0 },
                    inhale:      { enabled: true,  duration: this._imstInhale, label: 'Inspirez fort !', easing: 'cubicInOut', silent: true },
                    holdFull:    { enabled: false, duration: 0 },
                    exhale:      { enabled: true,  duration: this._imstExhale, label: 'Relâchez',        easing: 'cubicInOut', silent: true },
                    holdEmpty:   { enabled: false, duration: 0 },
                    recovery:    { enabled: false, duration: 0 },
                },
                onPhaseChange: (phaseName) => {
                    if (phaseName === 'inhale') {
                        document.getElementById('exerciseInstruction').textContent =
                            ex.mode === 'device' ? 'Inspirez fort contre la résistance !' : 'Inspiration diaphragmatique maximale !';
                        this._imstPlayBip();
                    } else if (phaseName === 'exhale') {
                        document.getElementById('exerciseInstruction').textContent = 'Relâchez passivement.';
                    }
                },
                onCycleComplete: (cycleNumber) => {
                    document.getElementById('cycleCounter').textContent =
                        `Série ${set}/${setsTotal} — Rep ${cycleNumber + 1}/${this._imstRepsTotal}`;
                },
                onComplete: () => {
                    if (!this.isRunning) return;
                    if (this._imstSet >= this._imstSetsTotal) {
                        this.completeExercise();
                        return;
                    }
                    // Repos entre séries
                    this._imstSet++;
                    window.BreathEngine.reset();
                    const nextSet = this._imstSet;
                    document.getElementById('cycleCounter').textContent =
                        `Repos — Série ${nextSet}/${setsTotal} dans…`;
                    document.getElementById('exerciseInstruction').textContent = ex.instructions.rest;
                    if (window.voiceGuide?.enabled) {
                        window.voiceGuide.speak(`Série ${nextSet - 1} terminée. Repos.`);
                    }
                    this.startPhaseTimer(this._imstRest, () => {
                        if (!this.isRunning) return;
                        launchSet();
                    });
                },
            });

            document.getElementById('cycleCounter').textContent =
                `Série ${set}/${setsTotal} — Rep 1/${this._imstRepsTotal}`;
            window.BreathEngine.start();
        };

        if (window.voiceGuide?.enabled) {
            window.voiceGuide.speak(ex.instructions.start, () => {
                setTimeout(() => { if (this.isRunning) launchSet(); }, 800);
            });
        } else {
            setTimeout(() => launchSet(), 2500);
        }
    }

    _imstPlayBip() {
        try {
            const ctx = window.breathSounds?.audioContext;
            if (!ctx || ctx.state === 'suspended') return;
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = 520;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.09);
        } catch (e) { /* silently ignore */ }
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

        // Play breath sound (Bug #5 : stop before play)
        if (window.breathSounds) {
            window.breathSounds.stop();
            window.breathSounds.playPhase('inhale', inhalePhase.duration);
        }

        this.startPhaseTimer(inhalePhase.duration, () => {
            // Exhale
            const exhalePhase = exercise.phases[1];
            this.updateBreathPhase(exhalePhase, 'inhale'); // Previous was inhale
            document.getElementById('exerciseInstruction').textContent = exercise.instructions[exhalePhase.name];

            // Play breath sound (Bug #5 : stop before play)
            if (window.breathSounds) {
                window.breathSounds.stop();
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
            if (!this.isRunning) return;  // Bug G : guard orphan setTimeout
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

                    setTimeout(() => {
                        if (!this.isRunning) return;  // Bug G : guard orphan setTimeout
                        this.runWimHofBreathing();
                    }, 2000);
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
                    if (!this.isRunning) return;  // Bug H : guard orphan setTimeout
                    this.runGuidedSegment();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                if (!this.isRunning) return;  // Bug H : guard orphan setTimeout
                this.runGuidedSegment();
            }, 3000);
        }
    }

    startDeepSleepExercise() {
        const exercise = this.currentExercise;
        this.guidedSegmentIndex = 0;
        this.deepSleepRhythmActive = false;  // s'assurer que la boucle rythme est éteinte au démarrage

        document.getElementById('exerciseInstruction').textContent = exercise.installation.instruction;
        document.getElementById('breathPhase').textContent = 'Installation';
        document.getElementById('cycleCounter').textContent = 'Préparation...';
        document.getElementById('breathCircle').classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        const runSequence = () => {
            if (!this.isRunning) return;
            this.startPhaseTimer(exercise.installation.duration, () => {
                if (!this.isRunning) return;
                // Bloc 4-7-8 ouverture
                document.getElementById('cycleCounter').textContent = 'Ouverture — cycle 1/4';
                this.run478Block(4, 4, () => {
                    if (!this.isRunning) return;
                    // Body scan
                    this.guidedSegmentIndex = 0;
                    this.runDeepSleepBodyScan(() => {
                        if (!this.isRunning) return;
                        // Bloc 4-7-8 clôture
                        document.getElementById('cycleCounter').textContent = 'Clôture — cycle 1/4';
                        this.run478Block(4, 4, () => {
                            this.completeExercise();
                        });
                    });
                });
            });
        };

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                if (!this.isRunning) return;
                runSequence();
            });
        } else {
            setTimeout(runSequence, 3000);
        }
    }

    run478Block(remaining, total, onComplete) {
        if (remaining <= 0) { onComplete(); return; }
        if (!this.isRunning) return;
        if (this.isPaused) {
            if (window.voiceGuide) window.voiceGuide.pause();
            setTimeout(() => this.run478Block(remaining, total, onComplete), 100);
            return;
        }

        const ex = this.currentExercise;
        const cycleNum = total - remaining + 1;
        document.getElementById('cycleCounter').textContent = `Cycle ${cycleNum} / ${total}`;

        // Inhale 4s — stop son en premier pour éviter tout overlap
        if (window.breathSounds) window.breathSounds.stop();
        this.updateBreathPhase({ name: 'Inspirez', action: 'inhale', duration: 4 }, 'exhale');
        document.getElementById('exerciseInstruction').textContent = ex.instructions.inhale478;
        if (window.voiceGuide?.enabled) window.voiceGuide.speak(ex.instructions.inhale478);
        if (window.breathSounds) window.breathSounds.playPhase('inhale', 4);

        this.startPhaseTimer(4, () => {
            if (!this.isRunning) return;
            // Hold 7s
            if (window.breathSounds) window.breathSounds.stop();
            this.updateBreathPhase({ name: 'Retenez', action: 'hold', duration: 7 }, 'inhale');
            document.getElementById('exerciseInstruction').textContent = ex.instructions.hold478;
            if (window.voiceGuide?.enabled) window.voiceGuide.speak(ex.instructions.hold478);
            if (window.breathSounds) window.breathSounds.playPhase('hold', 7);

            this.startPhaseTimer(7, () => {
                if (!this.isRunning) return;
                // Exhale 8s
                if (window.breathSounds) window.breathSounds.stop();
                this.updateBreathPhase({ name: 'Expirez', action: 'exhale', duration: 8 }, 'hold');
                document.getElementById('exerciseInstruction').textContent = ex.instructions.exhale478;
                if (window.voiceGuide?.enabled) window.voiceGuide.speak(ex.instructions.exhale478);
                if (window.breathSounds) window.breathSounds.playPhase('exhale', 8);

                this.startPhaseTimer(8, () => {
                    this.run478Block(remaining - 1, total, onComplete);
                });
            });
        });
    }

    runDeepSleepBodyScan(onComplete) {
        if (!this.isRunning) return;
        if (this.isPaused) {
            if (window.voiceGuide) window.voiceGuide.pause();
            setTimeout(() => this.runDeepSleepBodyScan(onComplete), 100);
            return;
        }
        if (window.voiceGuide) window.voiceGuide.resume();

        const exercise = this.currentExercise;

        // Démarrer la boucle rythme 4-7-8 de fond au premier segment (bong discret)
        const rhythmBong = this.settings.exercises?.['deep-sleep-478']?.rhythmBong ?? true;
        if (this.guidedSegmentIndex === 0 && !this.deepSleepRhythmActive && rhythmBong) {
            this.deepSleepRhythmActive = true;
            this.run478Rhythm();
        }

        if (this.guidedSegmentIndex >= exercise.segments.length) {
            // Arrêter le rythme de fond avant de passer au bloc clôture
            this.deepSleepRhythmActive = false;
            onComplete();
            return;
        }

        const segment = exercise.segments[this.guidedSegmentIndex];
        document.getElementById('breathPhase').textContent = segment.zone;
        document.getElementById('exerciseInstruction').textContent = segment.instruction;
        document.getElementById('cycleCounter').textContent =
            `Body scan ${this.guidedSegmentIndex + 1} / ${exercise.segments.length}`;

        // Pas d'animation cercle pendant le body scan
        document.getElementById('breathCircle').classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        const isAdaptive = this.settings.guidedTimingMode === 'adaptive';
        const pauseAfterVoice = this.settings.guidedPauseAfterVoice || 8;

        if (isAdaptive && window.voiceGuide?.enabled) {
            window.voiceGuide.speak(segment.instruction, () => {
                if (!this.isRunning) return;
                this.startPhaseTimer(pauseAfterVoice, () => {
                    this.guidedSegmentIndex++;
                    this.runDeepSleepBodyScan(onComplete);
                });
            });
            this.startAdaptiveVoiceTimer(segment.instruction);
        } else if (isAdaptive) {
            const est = Math.max(3, segment.instruction.length / 15);
            this.startPhaseTimer(est + pauseAfterVoice, () => {
                this.guidedSegmentIndex++;
                this.runDeepSleepBodyScan(onComplete);
            });
        } else {
            if (window.voiceGuide?.enabled) window.voiceGuide.speak(segment.instruction);
            this.startPhaseTimer(segment.duration, () => {
                this.guidedSegmentIndex++;
                this.runDeepSleepBodyScan(onComplete);
            });
        }
    }

    run478Rhythm() {
        if (!this.deepSleepRhythmActive || !this.isRunning) return;
        if (this.isPaused) {
            setTimeout(() => this.run478Rhythm(), 200);
            return;
        }

        // Bong discret — début phase inhale
        if (window.breathSounds) window.breathSounds.playTransition();

        setTimeout(() => {
            if (!this.deepSleepRhythmActive || !this.isRunning) return;
            if (this.isPaused) { setTimeout(() => this.run478Rhythm(), 200); return; }

            // Bong discret — début phase hold
            if (window.breathSounds) window.breathSounds.playTransition();

            setTimeout(() => {
                if (!this.deepSleepRhythmActive || !this.isRunning) return;
                if (this.isPaused) { setTimeout(() => this.run478Rhythm(), 200); return; }

                // Bong discret — début phase exhale
                if (window.breathSounds) window.breathSounds.playTransition();

                setTimeout(() => {
                    this.run478Rhythm(); // prochain cycle 4-7-8
                }, 8000);
            }, 7000);
        }, 4000);
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

        // Play breath sound cues for guided exercises (ex: Flow & Release cyclic sighing phases)
        if (window.breathSounds) {
            if (phaseName === 'Inspirez +') {
                window.breathSounds.playSecondInhale();
            } else if (phaseName === 'Inspirez') {
                window.breathSounds.playTransition();
            }
        }

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
    // Comfort Zone Static Apnea
    // ==========================================

    startComfortZone() {
        const exercise = this.currentExercise; // Already has user settings from getExerciseParams()
        this.comfortCycle = 1;
        this.comfortHolds = [];
        this.comfortIsFrc = exercise.isFrc || false;

        document.getElementById('cycleCounter').textContent =
            `Round ${this.comfortCycle} / ${exercise.cycles}`;
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.start;

        // Setup stop button handler
        const btnStop = document.getElementById('btnComfortStop');
        if (btnStop) {
            btnStop.onclick = () => {
                if (this._comfortHoldStart) {
                    const elapsed = (Date.now() - this._comfortHoldStart - this._comfortPausedTime) / 1000;
                    this.endComfortHold(elapsed);
                }
            };
        }

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.start, () => {
                setTimeout(() => {
                    if (!this.isRunning) return;
                    this.runComfortCycle();
                }, 800);
            });
        } else {
            setTimeout(() => this.runComfortCycle(), 3000);
        }
    }

    runComfortCycle() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        document.getElementById('cycleCounter').textContent =
            `Round ${this.comfortCycle} / ${exercise.cycles}`;

        // Phase 1: Breathing preparation
        document.getElementById('breathPhase').textContent = 'Respirez';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.breathe;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('hold', 'active', 'holdEmpty');
        circle.classList.add('inhale');

        if (window.breathSounds) {
            window.breathSounds.playPhase('inhale', exercise.breatheUpDuration);
        }
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(exercise.instructions.breathe);
        }

        this.startPhaseTimer(exercise.breatheUpDuration, () => {
            if (!this.isRunning) return;
            this.startComfortHold();
        });
    }

    startComfortHold() {
        if (!this.isRunning) return;
        const exercise = this.currentExercise;

        document.getElementById('breathPhase').textContent = this.comfortIsFrc ? 'Apnée FRC' : 'Apnée';
        document.getElementById('exerciseInstruction').textContent = exercise.instructions.hold;

        const circle = document.getElementById('breathCircle');
        circle.classList.remove('inhale', 'exhale', 'holdEmpty', 'hold', 'active');
        if (this.comfortIsFrc) {
            circle.classList.add('holdEmpty', 'active');
        } else {
            circle.classList.add('hold', 'active');
        }

        // Show comfort stop button
        const btnStop = document.getElementById('btnComfortStop');
        if (btnStop) btnStop.style.display = '';

        // Count-up timer
        const timerDisplay = document.getElementById('breathTimer');
        const progressBar = document.getElementById('progressBar');
        const circumference = 2 * Math.PI * 90;
        this._comfortHoldStart = Date.now();
        this._comfortPausedTime = 0;
        let pauseStart = null;

        if (this.phaseTimer) clearInterval(this.phaseTimer);

        if (window.breathSounds) {
            window.breathSounds.playPhase('hold', exercise.maxHoldDuration || 300);
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
                this._comfortPausedTime += Date.now() - pauseStart;
                pauseStart = null;
            }

            const elapsed = (Date.now() - this._comfortHoldStart - this._comfortPausedTime) / 1000;
            timerDisplay.textContent = this.formatTime(elapsed);

            // Progress based on apneaMax or 120s default
            const estimatedMax = this.settings.apneaMax || 120;
            const progress = Math.min(elapsed / estimatedMax, 1);
            progressBar.style.strokeDashoffset = circumference * (1 - progress);

            // Safety: auto-stop at maxHoldDuration
            const maxDuration = exercise.maxHoldDuration || 300;
            if (elapsed >= maxDuration) {
                this.endComfortHold(elapsed);
            }
        }, 100);
    }

    endComfortHold(holdDuration) {
        clearInterval(this.phaseTimer);
        this.phaseTimer = null;

        // Hide stop button
        const btnStop = document.getElementById('btnComfortStop');
        if (btnStop) btnStop.style.display = 'none';

        // Save hold time
        this.comfortHolds.push({
            cycle: this.comfortCycle,
            duration: Math.round(holdDuration)
        });

        // Voice feedback
        const label = this.comfortIsFrc ? 'en apnée FRC' : 'en zone de confort';
        const feedback = `${this.formatTime(holdDuration)} ${label}. Bravo !`;
        document.getElementById('exerciseInstruction').textContent = feedback;

        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(feedback);
        }

        // Next cycle or complete
        this.comfortCycle++;
        const exercise = this.currentExercise;

        if (this.comfortCycle > exercise.cycles) {
            // All rounds done
            setTimeout(() => this.completeComfortZone(), 2000);
        } else {
            // Rest phase then next round
            document.getElementById('breathPhase').textContent = 'Repos';
            document.getElementById('exerciseInstruction').textContent = exercise.instructions.stop;
            document.getElementById('cycleCounter').textContent =
                `Repos — Round ${this.comfortCycle} / ${exercise.cycles} suivant`;

            const circle = document.getElementById('breathCircle');
            circle.classList.remove('hold', 'active');
            circle.classList.add('inhale');

            if (window.breathSounds) {
                window.breathSounds.playPhase('inhale', exercise.restDuration);
            }

            this.startPhaseTimer(exercise.restDuration, () => {
                if (!this.isRunning) return;
                this.runComfortCycle();
            });
        }
    }

    completeComfortZone() {
        // Save to comfort zone history
        try {
            const durations = this.comfortHolds.map(h => h.duration);
            const best = Math.max(...durations);
            const average = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

            const historyKey = this.comfortIsFrc ? 'deepbreath_frc_comfort_history' : 'deepbreath_comfort_zone_history';
            const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
            existing.push({
                date: new Date().toISOString(),
                holds: this.comfortHolds,
                best,
                average,
                restDuration: this.currentExercise.restDuration,
                breatheUpDuration: this.currentExercise.breatheUpDuration
            });
            // Keep last 50 sessions
            if (existing.length > 50) existing.splice(0, existing.length - 50);
            localStorage.setItem(historyKey, JSON.stringify(existing));

            // Show summary in instruction
            const summary = this.comfortHolds.map(h => this.formatTime(h.duration)).join(', ');
            const typeLabel = this.comfortIsFrc ? 'FRC' : '';
            document.getElementById('exerciseInstruction').textContent =
                `${typeLabel} Rounds: ${summary} — Record: ${this.formatTime(best)} — Moyenne: ${this.formatTime(average)}`;

            // Update progression display
            if (this.comfortIsFrc) {
                this.updateFrcComfortProgress();
            } else {
                this.updateComfortZoneProgress();
            }
        } catch (e) {
            console.warn('Could not save comfort zone history:', e);
        }

        // Injecter les résultats dans currentExercise pour que coach.js les copie dans sessionParams
        try {
            const durations2 = this.comfortHolds.map(h => h.duration);
            if (durations2.length > 0) {
                this.currentExercise.holdResults = durations2;
                this.currentExercise.holdBest    = Math.max(...durations2);
                this.currentExercise.holdAverage = Math.round(durations2.reduce((a, b) => a + b, 0) / durations2.length);
            }
        } catch (e) {}

        // Trigger standard exercise completion (feedback modal)
        this.completeExercise();
    }

    updateComfortZoneProgress() {
        const container = document.getElementById('comfortZoneProgress');
        const chart = document.getElementById('comfortZoneChart');
        const bestEl = document.getElementById('comfortZoneBest');
        if (!container || !chart) return;

        try {
            const history = JSON.parse(localStorage.getItem('deepbreath_comfort_zone_history') || '[]');
            if (history.length === 0) {
                container.style.display = 'none';
                return;
            }

            container.style.display = '';
            const last10 = history.slice(-10);
            const maxBest = Math.max(...last10.map(s => s.best));

            // Build bar chart
            let html = '<div class="comfort-bars">';
            for (const session of last10) {
                const pct = maxBest > 0 ? Math.round((session.best / maxBest) * 100) : 0;
                const date = new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                html += `<div class="comfort-bar-row">
                    <span class="comfort-bar-date">${date}</span>
                    <div class="comfort-bar-track">
                        <div class="comfort-bar-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="comfort-bar-value">${this.formatTime(session.best)}</span>
                </div>`;
            }
            html += '</div>';
            chart.innerHTML = html;

            // Best overall
            const allTimeBest = Math.max(...history.map(s => s.best));
            if (bestEl) {
                bestEl.textContent = `Record: ${this.formatTime(allTimeBest)}`;
            }

            // Trend
            if (last10.length >= 2) {
                const recent = last10[last10.length - 1].best;
                const previous = last10[last10.length - 2].best;
                const trend = recent > previous ? ' ↑' : recent < previous ? ' ↓' : ' →';
                if (bestEl) bestEl.textContent += trend;
            }
        } catch (e) {
            console.warn('Could not update comfort zone progress:', e);
        }
    }

    updateFrcComfortProgress() {
        const container = document.getElementById('frcComfortProgress');
        const chart = document.getElementById('frcComfortChart');
        const bestEl = document.getElementById('frcComfortBest');
        if (!container || !chart) return;

        try {
            const history = JSON.parse(localStorage.getItem('deepbreath_frc_comfort_history') || '[]');
            if (history.length === 0) {
                container.style.display = 'none';
                return;
            }

            container.style.display = '';
            const last10 = history.slice(-10);
            const maxBest = Math.max(...last10.map(s => s.best));

            // Build bar chart
            let html = '<div class="comfort-bars">';
            for (const session of last10) {
                const pct = maxBest > 0 ? Math.round((session.best / maxBest) * 100) : 0;
                const date = new Date(session.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                html += `<div class="comfort-bar-row">
                    <span class="comfort-bar-date">${date}</span>
                    <div class="comfort-bar-track">
                        <div class="comfort-bar-fill" style="width:${pct}%"></div>
                    </div>
                    <span class="comfort-bar-value">${this.formatTime(session.best)}</span>
                </div>`;
            }
            html += '</div>';
            chart.innerHTML = html;

            // Best overall
            const allTimeBest = Math.max(...history.map(s => s.best));
            if (bestEl) {
                bestEl.textContent = `Record FRC: ${this.formatTime(allTimeBest)}`;
            }

            // Trend
            if (last10.length >= 2) {
                const recent = last10[last10.length - 1].best;
                const previous = last10[last10.length - 2].best;
                const trend = recent > previous ? ' ↑' : recent < previous ? ' ↓' : ' →';
                if (bestEl) bestEl.textContent += trend;
            }
        } catch (e) {
            console.warn('Could not update FRC comfort progress:', e);
        }
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
                setTimeout(() => {
                    if (!this.isRunning) return;  // Bug I : guard orphan setTimeout
                    this.runApneaGuidedCycle();
                }, 1000);
            });
        } else {
            setTimeout(() => {
                if (!this.isRunning) return;  // Bug I : guard orphan setTimeout
                this.runApneaGuidedCycle();
            }, 3000);
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
            window.breathSounds.stop();
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

            // Recalculer les exercices si en mode optimal
            if (this.settings.mode === 'optimal') {
                this.refreshExerciseSettingsUI();
            }

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

        // Stop BreathingEngine v3 if active
        if (this.engine) {
            this.engine.reset();
            this.engine = null;
        }

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

        // Reset legacy circle and timer display
        const circle = document.getElementById('breathCircle');
        if (circle) {
            circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');
            circle.style.removeProperty('--phase-duration');
        }

        document.getElementById('breathTimer').textContent = '0.0';
        const progressBar = document.getElementById('progressBar');
        if (progressBar) progressBar.style.strokeDashoffset = 2 * Math.PI * 90;

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

        // Stop BreathingEngine v3 (if it hasn't already completed)
        if (this.engine) {
            const st = this.engine.getCurrentState();
            if (st && st.state !== 'completed' && st.state !== 'idle') {
                this.engine.stop();
            }
            this.engine = null;
        }

        clearInterval(this.phaseTimer);
        this.phaseTimer = null;

        // Allow screen to sleep again
        this.releaseWakeLock();

        // Stop sounds (engine.stop already stops sounds, but guard for legacy exercises)
        if (window.voiceGuide) window.voiceGuide.stop();
        if (window.breathSounds) {
            window.breathSounds.stop();
            window.breathSounds.playComplete(); // Play completion chime
        }

        // Update legacy text elements
        const breathPhase = document.getElementById('breathPhase');
        if (breathPhase) breathPhase.textContent = 'Terminé';
        const completionMessage = 'Excellent travail ! Prenez un moment pour ressentir les effets de cet exercice.';
        document.getElementById('exerciseInstruction').textContent = completionMessage;

        // Speak completion message
        if (window.voiceGuide && window.voiceGuide.enabled) {
            window.voiceGuide.speak(completionMessage);
        }

        // Reset legacy circle
        const circle = document.getElementById('breathCircle');
        if (circle) circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        // Square Flow — Seuil de confort (ajustement automatique de la suspension)
        if (this.currentExercise && this.currentExercise.id === 'square-flow') {
            setTimeout(() => {
                if (this.isRunning) return;
                this._showSquareFlowComfortButtons();
            }, 1800);
            return;
        }

        // Show feedback modal or auto-close
        if (window.coach) {
            // Calculate total exercise duration (excluding pauses)
            const pauseNow = this._exercisePauseStart ? (Date.now() - this._exercisePauseStart) : 0;
            const totalDuration = this.exerciseStartTime
                ? (Date.now() - this.exerciseStartTime - this.exercisePausedTotal - pauseNow) / 1000
                : this.elapsedTime;
            setTimeout(() => {
                if (!this.isRunning) {
                    window.coach.showFeedbackModal(this.currentExercise, totalDuration);
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

    _showSquareFlowComfortButtons() {
        // Overlay de seuil de confort pour Square Flow
        const existing = document.getElementById('squareFlowComfort');
        if (existing) existing.remove();

        const currentHold = (this.settings.exercises['square-flow'] && this.settings.exercises['square-flow'].holdDuration) || 10;

        const overlay = document.createElement('div');
        overlay.id = 'squareFlowComfort';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,26,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3000;gap:20px;padding:30px;text-align:center;';

        overlay.innerHTML = `
            <p style="color:#4a9eff;font-size:1.1rem;font-weight:600;margin:0;">Seuil de confort — Suspension</p>
            <p style="color:#e0e8f0;font-size:0.95rem;margin:0;">Suspension actuelle : <strong>${currentHold}s</strong>. Comment était-ce ?</p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
                <button id="sfTooShort" style="padding:12px 24px;border-radius:10px;border:none;background:#4ade80;color:#0a1a0a;font-weight:700;font-size:1rem;cursor:pointer;">Trop court ↑ +2s</button>
                <button id="sfJustRight" style="padding:12px 24px;border-radius:10px;border:none;background:#4a9eff;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;">Parfait ✓</button>
                <button id="sfTooLong" style="padding:12px 24px;border-radius:10px;border:none;background:#f87171;color:#fff;font-weight:700;font-size:1rem;cursor:pointer;">Trop long ↓ −2s</button>
            </div>
        `;

        document.body.appendChild(overlay);

        const applyAndClose = (delta) => {
            overlay.remove();
            if (delta !== 0) {
                if (!this.settings.exercises['square-flow']) this.settings.exercises['square-flow'] = {};
                const newHold = Math.max(3, Math.min(30, currentHold + delta));
                this.settings.exercises['square-flow'].holdDuration = newHold;

                // Mettre à jour le select dans la modale de réglages
                const sel = document.querySelector('.exercise-settings[data-exercise="square-flow"] select[data-param="holdDuration"]');
                if (sel) {
                    // Cherche l'option la plus proche ou ajoute une option dynamique
                    let found = false;
                    for (const opt of sel.options) {
                        if (parseInt(opt.value) === newHold) { opt.selected = true; found = true; break; }
                    }
                    if (!found) {
                        const opt = document.createElement('option');
                        opt.value = newHold;
                        opt.textContent = `${newHold} s — Personnalisé`;
                        opt.selected = true;
                        sel.appendChild(opt);
                    }
                }

                this.saveSettings(true);
                this.showToast(`Suspension ajustée à ${newHold}s pour la prochaine séance`);
            }

            // Passer au feedback coach standard
            if (window.coach) {
                const pauseNow = this._exercisePauseStart ? (Date.now() - this._exercisePauseStart) : 0;
                const totalDuration = this.exerciseStartTime
                    ? (Date.now() - this.exerciseStartTime - this.exercisePausedTotal - pauseNow) / 1000
                    : this.elapsedTime;
                if (!this.isRunning) {
                    window.coach.showFeedbackModal(this.currentExercise, totalDuration);
                }
            } else {
                setTimeout(() => { if (!this.isRunning) this.closeExercise(); }, 3000);
            }
        };

        document.getElementById('sfTooShort').addEventListener('click', () => applyAndClose(+2));
        document.getElementById('sfJustRight').addEventListener('click', () => applyAndClose(0));
        document.getElementById('sfTooLong').addEventListener('click', () => applyAndClose(-2));
    }

    closeExercise() {
        this.isRunning = false;
        this.isPaused = false;

        // Stop BreathingEngine v3 if active
        if (this.engine) {
            this.engine.stop();
            this.engine = null;
        }

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

        // Reset legacy circle
        const circle = document.getElementById('breathCircle');
        if (circle) circle.classList.remove('inhale', 'exhale', 'hold', 'holdEmpty', 'active');

        // Hide contraction UI
        const btnContraction = document.getElementById('btnMarkContraction');
        const counterDiv = document.getElementById('contractionCounter');
        if (btnContraction) btnContraction.style.display = 'none';
        if (counterDiv) counterDiv.style.display = 'none';
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        // Track pause time for total exercise duration
        if (this.isPaused) {
            this._exercisePauseStart = Date.now();
        } else if (this._exercisePauseStart) {
            this.exercisePausedTotal += Date.now() - this._exercisePauseStart;
            this._exercisePauseStart = null;
        }

        // Delegate to BreathingEngine v3 if active (standard exercises)
        if (this.engine) {
            const st = this.engine.getCurrentState();
            if (st && st.state !== 'idle' && st.state !== 'completed') {
                if (this.isPaused) {
                    this.engine.pause();
                } else {
                    this.engine.resume();
                }
            } else {
                // Legacy exercises: manual voice pause/resume
                if (this.isPaused) {
                    if (window.voiceGuide) window.voiceGuide.pause();
                } else {
                    if (window.voiceGuide) window.voiceGuide.resume();
                }
            }
        } else {
            // No engine — legacy voice pause/resume
            if (this.isPaused) {
                if (window.voiceGuide) window.voiceGuide.pause();
            } else {
                if (window.voiceGuide) window.voiceGuide.resume();
            }
        }

        const pauseBtn = document.getElementById('btnPause');
        if (this.isPaused) {
            pauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                </svg>
            `;
            // Show pause text (legacy circle only; canvas handles its own display)
            if (!this.engine) {
                document.getElementById('breathPhase').textContent = 'Pause';
            }
        } else {
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

// ═══════════════════════════════════════════════════════════════
// CHASSE SOUS-MARINE — Module autonome
// ═══════════════════════════════════════════════════════════════

class ChasseModule {
    constructor() {
        this.recupTimer = null;
        this.recupTotal = 0;
        this.recupRemaining = 0;
        this.guidedTimer = null;
        this.guidedPhases = [];
        this.guidedPhaseIndex = 0;
        this.guidedPhaseRemaining = 0;
        this.guidedPaused = false;
        this.init();
    }

    init() {
        this.setupTabSwitcher();
        this.setupGuidedModalButtons();
    }

    // ── Tab switcher (Chasse / Statique / Dynamique / Profondeur / Synthèse) ──
    setupTabSwitcher() {
        document.querySelectorAll('.chasse-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chasse-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.chasseTab;
                document.querySelectorAll('.chasse-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById('chasse-panel-' + target);
                if (panel) panel.classList.add('active');
            });
        });
    }

    // Définition des protocoles guidés
    getProtocolPhases(protocol) {
        const protocols = {
            'chasse-terre': {
                title: 'Récupération Post-Équipement',
                phases: [
                    { label: 'Normoventilation', duration: 300, action: 'hold', color: 'hold',
                      instruction: 'Assieds-toi ou allonge-toi. Respiration naturelle : inspire 3s par le nez, expire 5s par la bouche. Objectif : FC < 75 bpm avant l\'entrée dans l\'eau.' }
                ]
            },
            'chasse-eau': {
                title: 'Acclimatation Eau',
                phases: [
                    { label: 'Entrée progressive', duration: 60, action: 'hold', color: 'hold',
                      instruction: 'Entrée lente dans l\'eau. Immerse le visage 2-3 secondes. Respiration normale — amorce le réflexe de plongée.' },
                    { label: 'Flottaison calme', duration: 180, action: 'exhale', color: 'exhale',
                      instruction: 'Allonge-toi sur le ventre, masque dans l\'eau, tuba en bouche. Ne regarde pas encore le fond. Respiration calme.' },
                    { label: 'Respiration diaphragmatique', duration: 240, action: 'inhale', color: 'inhale',
                      instruction: 'Inspire 4s (ventre gonfle) → Pause 1s → Expire 6-8s passive. Yeux semi-fermés. Relâchement progressif. La rate se pré-contracte.' }
                ]
            },
            'chasse-breatheup': {
                title: 'Breathe-Up Pré-Descente',
                phases: [
                    { label: 'Centrage', duration: 30, action: 'hold', color: 'hold',
                      instruction: 'Stop. Ferme les yeux. Relâchement progressif : pieds → mollets → cuisses → abdomen → épaules → mâchoire.' },
                    { label: 'Breathe-up (Expire 10s)', duration: 40, action: 'exhale', color: 'exhale',
                      instruction: 'Inspire 5s → Pause 1-2s → Expire 10s lente et passive. 2-3 cycles. Corps relâché. Diaphragme.' },
                    { label: 'Visualisation', duration: 10, action: 'hold', color: 'hold',
                      instruction: 'Visualise ta descente : trajectoire, équilibration, fond. Prépare le cycle final.' },
                    { label: 'Cycle final — Expire', duration: 5, action: 'exhale', color: 'exhale',
                      instruction: 'Grande expiration : 80-90% de l\'air sorti, lente.' },
                    { label: 'Last breath — Inspire', duration: 5, action: 'inhale', color: 'inhale',
                      instruction: 'Grande inspiration en 3 phases : ventre → côtes → épaules. TLC 100%. Duck-dive immédiatement !' }
                ]
            },
            'statique-coherence': {
                title: 'Cohérence Cardiaque — Statique',
                phases: [
                    { label: 'Cohérence cardiaque', duration: 120, action: 'hold', color: 'hold',
                      instruction: 'Inspire 5s / Expire 5s. Diaphragmatique. Yeux fermés. Allongé si possible. Active le système parasympathique. FC cible < 65 bpm.' }
                ]
            },
            'statique-prep': {
                title: 'Préparation Apnée Statique',
                phases: [
                    { label: 'Cohérence cardiaque', duration: 120, action: 'hold', color: 'hold',
                      instruction: 'Inspire 5s / Expire 5s. Diaphragmatique. Yeux fermés. Allongé. FC cible < 65 bpm.' },
                    { label: 'Breathe-up PFI', duration: 90, action: 'exhale', color: 'exhale',
                      instruction: 'Inspire 2-5s → Pause 1-2s → Expire 8-10s lente et passive. 4 cycles/min. PaCO₂ stable. Corps relâché.' },
                    { label: 'Expire 80-90%', duration: 5, action: 'exhale', color: 'exhale',
                      instruction: 'Grande expiration passive : 80-90% de l\'air sorti.' },
                    { label: 'Last breath — TLC 100%', duration: 8, action: 'inhale', color: 'inhale',
                      instruction: '1. Ventre gonfle (lobes inférieurs) → 2. Côtes s\'écartent (lobes médians) → 3. Épaules montent, gorge ouverte (apex). Fluide, 4-5s. TLC 100%. Glotte fermée.' }
                ]
            },
            'dynamique-coherence': {
                title: 'Cohérence Cardiaque — Dynamique',
                phases: [
                    { label: 'Cohérence cardiaque', duration: 120, action: 'hold', color: 'hold',
                      instruction: 'Au mur, immobile. Inspire 5s / Expire 5s. Diaphragmatique. Ne pas s\'échauffer juste avant. FC cible < 65 bpm.' }
                ]
            },
            'dynamique-prep': {
                title: 'Préparation Apnée Dynamique',
                phases: [
                    { label: 'Cohérence cardiaque', duration: 120, action: 'hold', color: 'hold',
                      instruction: 'Au mur, immobile. Inspire 5s / Expire 5s. Corps relâché. FC cible < 65 bpm.' },
                    { label: 'Breathe-up long', duration: 120, action: 'exhale', color: 'exhale',
                      instruction: 'Inspire 5s → Pause 1-2s → Expire 10s. Plus long qu\'en statique. Position horizontale si possible.' },
                    { label: 'Expire', duration: 5, action: 'exhale', color: 'exhale',
                      instruction: 'Grande expiration douce.' },
                    { label: 'Last breath — 90-95% TLC', duration: 8, action: 'inhale', color: 'inhale',
                      instruction: 'Abdo → Costal → Apical. STOP à 90-95% du maximum. Pas le max absolu (tension → traînée). Push-off → nage.' }
                ]
            },
            'profondeur-coherence': {
                title: 'Cohérence Méditée — Profondeur',
                phases: [
                    { label: 'Cohérence + méditation', duration: 180, action: 'hold', color: 'hold',
                      instruction: 'Flottaison dorsale idéale. Inspire 5s / Expire 5s. Yeux fermés. Visualise ta plongée : trajectoire, virages, comportement au fond. FC cible < 60 bpm.' }
                ]
            },
            'profondeur-prep': {
                title: 'Préparation Apnée en Profondeur',
                phases: [
                    { label: 'Cohérence méditée', duration: 180, action: 'hold', color: 'hold',
                      instruction: 'Flottaison dorsale. Inspire 5s / Expire 5s. Yeux fermés. Visualise ta plongée complète. FC cible < 60 bpm.' },
                    { label: 'Breathe-up profond', duration: 120, action: 'exhale', color: 'exhale',
                      instruction: 'Inspire 5s → Pause 1-2s → Expire 10s. Le plus lent et méditatif. Laisse le corps guider.' },
                    { label: 'Expire', duration: 5, action: 'exhale', color: 'exhale',
                      instruction: 'Grande expiration lente.' },
                    { label: 'Last breath — TLC 100%', duration: 10, action: 'inhale', color: 'inhale',
                      instruction: 'Abdo → Costal → Apical. MAXIMUM physiologique. Gorge grande ouverte. Descente fluide et verticale. Égalisation dès 0,5m.' }
                ]
            }
        };
        return protocols[protocol] || null;
    }

    // ── Modal de timer guidé ──
    setupGuidedModalButtons() {
        // Modal is already in HTML — just attach listeners
        const pauseBtn = document.getElementById('chasseTimerPauseBtn');
        const stopBtn = document.getElementById('chasseTimerStopBtn');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePauseGuided());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopGuided());
    }

    startGuidedProtocol(protocolId) {
        const def = this.getProtocolPhases(protocolId);
        if (!def) { console.error('[Chasse] Protocol not found:', protocolId); return; }
        const modal = document.getElementById('chasseTimerModal');
        if (!modal) { console.error('[Chasse] Modal #chasseTimerModal not found'); return; }

        this.guidedPhases = def.phases;
        this.guidedPhaseIndex = 0;
        this.guidedPaused = false;

        const titleEl = document.getElementById('chasseTimerTitle');
        if (titleEl) titleEl.textContent = def.title;
        modal.classList.add('open');
        this.runGuidedPhase();
    }

    runGuidedPhase() {
        if (this.guidedTimer) clearInterval(this.guidedTimer);
        if (this.guidedPhaseIndex >= this.guidedPhases.length) {
            this.guidedComplete();
            return;
        }

        const phase = this.guidedPhases[this.guidedPhaseIndex];
        this.guidedPhaseRemaining = phase.duration;

        const totalPhases = this.guidedPhases.length;
        document.getElementById('chasseTimerPhase').textContent =
            `Phase ${this.guidedPhaseIndex + 1} / ${totalPhases} — ${phase.label}`;
        document.getElementById('chasseTimerInstruction').textContent = phase.instruction;
        document.getElementById('chasseTimerAction').textContent = phase.label;

        // Ring color
        const ring = document.getElementById('chasseRingProgress');
        ring.className = 'chasse-ring-progress ' + (phase.color || 'hold');
        const circumference = 2 * Math.PI * 62; // r=62

        this.updateGuidedDisplay(phase.duration, phase.duration, circumference);

        this.guidedTimer = setInterval(() => {
            if (this.guidedPaused) return;
            this.guidedPhaseRemaining--;
            this.updateGuidedDisplay(this.guidedPhaseRemaining, phase.duration, circumference);
            if (this.guidedPhaseRemaining <= 0) {
                clearInterval(this.guidedTimer);
                this.guidedPhaseIndex++;
                setTimeout(() => this.runGuidedPhase(), 500);
            }
        }, 1000);
    }

    updateGuidedDisplay(remaining, total, circumference) {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('chasseTimerCount').textContent =
            mins > 0 ? `${mins}:${String(secs).padStart(2,'0')}` : String(remaining);

        const progress = remaining / total;
        const offset = circumference * (1 - progress);
        document.getElementById('chasseRingProgress').style.strokeDasharray = circumference;
        document.getElementById('chasseRingProgress').style.strokeDashoffset = offset;
    }

    guidedComplete() {
        document.getElementById('chasseTimerPhase').textContent = 'Terminé !';
        document.getElementById('chasseTimerInstruction').textContent =
            'Protocole terminé. Respire naturellement quelques instants avant de continuer.';
        document.getElementById('chasseTimerCount').textContent = '✓';
        document.getElementById('chasseRingProgress').style.strokeDashoffset = 0;
        document.getElementById('chasseRingProgress').style.stroke = '#34d399';
        setTimeout(() => this.stopGuided(), 3000);
    }

    togglePauseGuided() {
        this.guidedPaused = !this.guidedPaused;
        document.getElementById('chasseTimerPauseBtn').textContent =
            this.guidedPaused ? 'Reprendre' : 'Pause';
    }

    stopGuided() {
        if (this.guidedTimer) clearInterval(this.guidedTimer);
        this.guidedTimer = null;
        this.guidedPaused = false;
        document.getElementById('chasseTimerModal').classList.remove('open');
    }

    // ── Recovery quick timer ──
    startRecupTimer(seconds, btn) {
        // Highlight active button
        document.querySelectorAll('.btn-recup-quick').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        if (this.recupTimer) clearInterval(this.recupTimer);
        this.recupTotal = seconds;
        this.recupRemaining = seconds;

        const display = document.getElementById('recupTimerDisplay');
        if (!display) { console.error('[Chasse] recupTimerDisplay not found'); return; }
        display.style.display = 'flex';

        const circumference = 2 * Math.PI * 52; // r=52
        this.updateRecupDisplay(seconds, seconds, circumference);

        this.recupTimer = setInterval(() => {
            this.recupRemaining--;
            this.updateRecupDisplay(this.recupRemaining, this.recupTotal, circumference);

            if (this.recupRemaining <= 0) {
                this.stopRecupTimer();
                document.getElementById('recupTimerPhase').textContent = 'Prêt à replonger !';
                document.getElementById('recupTimerCount').textContent = '✓';
                document.getElementById('recupRingProgress').style.stroke = '#34d399';
                // Play a gentle bell if available
                if (window.app && window.app.playZenBell) window.app.playZenBell();
            }
        }, 1000);
    }

    updateRecupDisplay(remaining, total, circumference) {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const countEl = document.getElementById('recupTimerCount');
        const phaseEl = document.getElementById('recupTimerPhase');
        const ringEl = document.getElementById('recupRingProgress');

        if (countEl) countEl.textContent = `${mins}:${String(secs).padStart(2,'0')}`;
        if (phaseEl) phaseEl.textContent = remaining > 0 ? 'Récupération' : 'Prêt !';

        if (ringEl) {
            const progress = remaining / total;
            const offset = circumference * (1 - progress);
            ringEl.style.strokeDasharray = circumference;
            ringEl.style.strokeDashoffset = offset;
        }
    }

    stopRecupTimer() {
        if (this.recupTimer) clearInterval(this.recupTimer);
        this.recupTimer = null;
        document.querySelectorAll('.btn-recup-quick').forEach(b => b.classList.remove('active'));
        const display = document.getElementById('recupTimerDisplay');
        if (display) display.style.display = 'none';
    }
}

// Les fonctions startProtocol / startRecup / stopRecup sont définies dans wbu-timer.js

