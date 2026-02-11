/**
 * DataSync — Cross-device sync via GitHub Gist (private)
 * Intercepts localStorage writes to auto-push, pulls on app open.
 * API key is NEVER synced.
 */

class DataSync {
    constructor() {
        this.gistId = localStorage.getItem('deepbreath_sync_gistId') || '';
        this.token = localStorage.getItem('deepbreath_sync_token') || '';
        this.enabled = !!(this.gistId && this.token);
        this.isSyncing = false;
        this.pendingPush = false;
        this.pushDebounceTimer = null;
        this.DEBOUNCE_MS = 500;
        this._dirty = false;
        this.lastPullTimestamp = null;
        this.etag = null;
        this.deviceId = this.getOrCreateDeviceId();

        // Keys to sync (order matters for display)
        this.SYNC_KEYS = [
            'deepbreath_sessions',
            'deepbreath_profile',
            'deepbreath_goals',
            'deepbreath_chat_history',
            'deepbreath_settings',
            'deepbreath_coach_settings',
            'deepbreath_sequences',
            'deepbreath_contraction_history'
        ];

        // Intercept localStorage writes for auto-push
        this._interceptLocalStorage();

        // Online/offline handlers
        window.addEventListener('online', () => {
            if (this.pendingPush) this.push();
        });

        // Push when app goes to background — keepalive survives page close
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.enabled && this._dirty) {
                clearTimeout(this.pushDebounceTimer);
                this.pushDebounceTimer = null;
                this._pushKeepalive();
            }
        });

        // Setup sync status button click (top bar)
        this._initSyncButton();

        // Show correct status on load
        if (this.enabled) {
            this._updateStatusUI('synced');
        }
    }

    _initSyncButton() {
        const btn = document.getElementById('syncStatusBtn');
        if (!btn) {
            console.warn('[Sync] syncStatusBtn not found in DOM');
            return;
        }
        const sync = this;
        btn.addEventListener('click', async () => {
            try {
                console.log('[Sync] Button clicked, enabled:', sync.enabled);
                if (sync.enabled) {
                    // Visual feedback immediately
                    btn.classList.add('sync-syncing');
                    const beforeCount = sync._getLocal('deepbreath_sessions', []).length;
                    await sync.fullSync();
                    sync._reloadModules();
                    const afterCount = sync._getLocal('deepbreath_sessions', []).length;
                    const msg = `Sync: ${beforeCount} → ${afterCount} sessions`;
                    console.log('[Sync]', msg);
                    sync._showSyncToast(msg);
                } else {
                    const navLink = document.querySelector('[data-section="settings"]');
                    if (navLink) navLink.click();
                    setTimeout(() => {
                        document.getElementById('syncToken')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 200);
                    sync._showSyncToast('Configurez la sync');
                }
            } catch (e) {
                console.error('[Sync] Button handler error:', e);
                sync._showSyncToast('Erreur sync: ' + e.message);
            }
        });
        console.log('[Sync] Button handler attached to', btn);
    }

    _showSyncToast(msg) {
        // Try app.showToast, fallback to native toast
        if (window.app && window.app.showToast) {
            window.app.showToast(msg);
        } else {
            // Fallback: create simple toast directly
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 20px;border-radius:8px;z-index:9999;font-size:14px;';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 3000);
        }
    }

    // ==========================================
    // Device ID
    // ==========================================

    getOrCreateDeviceId() {
        let id = localStorage.getItem('deepbreath_sync_deviceId');
        if (!id) {
            const ua = navigator.userAgent;
            const short = ua.includes('iPhone') ? 'iPhone' :
                          ua.includes('iPad') ? 'iPad' :
                          ua.includes('Android') ? 'Android' :
                          ua.includes('Mac') ? 'Mac' :
                          ua.includes('Windows') ? 'Windows' : 'Device';
            id = `${short}-${Date.now().toString(36)}`;
            localStorage.setItem('deepbreath_sync_deviceId', id);
        }
        return id;
    }

    // ==========================================
    // Setup — Create Gist
    // ==========================================

    async setup(token) {
        this.token = token.trim();
        if (!this.token) throw new Error('Token vide');

        // Test token validity
        const testResp = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!testResp.ok) throw new Error('Token GitHub invalide');

        // Create private Gist with current data
        const payload = this._buildPayload();
        const resp = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: 'Jmee DeepBreath — Sync Data (auto-generated)',
                public: false,
                files: {
                    'deepbreath-sync.json': {
                        content: JSON.stringify(payload, null, 2)
                    }
                }
            })
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.message || `Erreur GitHub ${resp.status}`);
        }

        const gist = await resp.json();
        this.gistId = gist.id;
        this.enabled = true;

        localStorage.setItem('deepbreath_sync_token', this.token);
        localStorage.setItem('deepbreath_sync_gistId', this.gistId);

        return this.gistId;
    }

    // ==========================================
    // Connect to existing Gist
    // ==========================================

    async connect(token, gistId) {
        this.token = token.trim();
        this.gistId = gistId.trim();
        if (!this.token || !this.gistId) throw new Error('Token ou Gist ID manquant');

        // Verify access
        const resp = await fetch(`https://api.github.com/gists/${this.gistId}`, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (!resp.ok) throw new Error(`Gist introuvable ou token invalide (${resp.status})`);

        this.enabled = true;
        localStorage.setItem('deepbreath_sync_token', this.token);
        localStorage.setItem('deepbreath_sync_gistId', this.gistId);

        // Pull immediately
        await this.pull();
    }

    // ==========================================
    // Disconnect
    // ==========================================

    disconnect() {
        this.enabled = false;
        this.gistId = '';
        this.token = '';
        this.etag = null;
        localStorage.removeItem('deepbreath_sync_token');
        localStorage.removeItem('deepbreath_sync_gistId');
        this._updateStatusUI('disconnected');
    }

    // ==========================================
    // Pull (fetch from Gist + merge)
    // ==========================================

    async pull() {
        if (!this.enabled || this.isSyncing) return false;
        if (!navigator.onLine) return false;

        this.isSyncing = true;
        this._updateStatusUI('syncing');

        try {
            const headers = { 'Authorization': `Bearer ${this.token}` };
            if (this.etag) headers['If-None-Match'] = this.etag;

            const resp = await fetch(`https://api.github.com/gists/${this.gistId}`, { headers });

            if (resp.status === 304) {
                // Not modified
                this.isSyncing = false;
                this._updateStatusUI('synced');
                return false;
            }

            if (resp.status === 401) {
                this._updateStatusUI('error', 'Token invalide');
                this.isSyncing = false;
                return false;
            }

            if (resp.status === 404) {
                this._updateStatusUI('error', 'Gist supprimé');
                this.isSyncing = false;
                return false;
            }

            if (!resp.ok) {
                this._updateStatusUI('error', `Erreur ${resp.status}`);
                this.isSyncing = false;
                return false;
            }

            this.etag = resp.headers.get('ETag');
            const gist = await resp.json();
            const file = gist.files?.['deepbreath-sync.json'];
            if (!file?.content) {
                this.isSyncing = false;
                this._updateStatusUI('synced');
                return false;
            }

            const remote = JSON.parse(file.content);
            if (!remote?.data) {
                console.log('[Sync] Pull: remote has no data field');
                this.isSyncing = false;
                return false;
            }

            const remoteSessions = remote.data?.deepbreath_sessions;
            const localSessions = this._getLocal('deepbreath_sessions', []);
            console.log('[Sync] Pull: remote device:', remote.deviceId,
                        '| remote sessions:', remoteSessions?.length || 0,
                        '| local sessions:', localSessions.length);

            // Merge remote into local
            const merged = this._merge(remote);
            if (merged) {
                const mergedSessions = merged.deepbreath_sessions;
                console.log('[Sync] Pull: merged sessions:', mergedSessions?.length || 0);
                // Write merged data back to localStorage (without triggering push)
                this._writeWithoutIntercept(merged);
                console.log('[Sync] Pull: written to localStorage');
                // Verify write
                const verify = this._getLocal('deepbreath_sessions', []);
                console.log('[Sync] Pull: verify localStorage sessions:', verify.length);
            } else {
                console.log('[Sync] Pull: no changes detected by merge');
            }

            // Always reload modules to sync memory ↔ localStorage
            this._reloadModules();

            this.lastPullTimestamp = new Date();
            this.isSyncing = false;
            this._updateStatusUI('synced');
            console.log('[Sync] Pull complete, data applied:', !!merged);
            return !!merged;

        } catch (e) {
            this.isSyncing = false;
            this._updateStatusUI('error', e.message);
            return false;
        }
    }

    // ==========================================
    // Push (upload to Gist)
    // ==========================================

    async push() {
        if (!this.enabled || this.isSyncing) {
            this.pendingPush = true;
            console.log('[Sync] Push deferred (enabled:', this.enabled, 'syncing:', this.isSyncing, ')');
            return false;
        }
        if (!navigator.onLine) {
            this.pendingPush = true;
            console.log('[Sync] Push deferred (offline)');
            return false;
        }

        this.isSyncing = true;
        this.pendingPush = false;
        this._updateStatusUI('syncing');

        try {
            const payload = this._buildPayload();
            const sessionCount = payload.data?.deepbreath_sessions?.length || 0;
            console.log('[Sync] Pushing', sessionCount, 'sessions to Gist');
            const resp = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        'deepbreath-sync.json': {
                            content: JSON.stringify(payload, null, 2)
                        }
                    }
                })
            });

            if (!resp.ok) {
                this._updateStatusUI('error', `Push échoué (${resp.status})`);
                this.pendingPush = true;
                this.isSyncing = false;
                return false;
            }

            this.etag = resp.headers.get('ETag');
            this.isSyncing = false;
            this._dirty = false;
            this._updateStatusUI('synced');
            console.log('[Sync] Push success');
            return true;

        } catch (e) {
            this.isSyncing = false;
            this.pendingPush = true;
            this._updateStatusUI('error', e.message);
            console.warn('[Sync] Push error:', e.message);
            return false;
        }
    }

    // ==========================================
    // Debounced push scheduler
    // ==========================================

    schedulePush() {
        if (!this.enabled) return;
        this._dirty = true;
        clearTimeout(this.pushDebounceTimer);
        this.pushDebounceTimer = setTimeout(() => this.push(), this.DEBOUNCE_MS);
    }

    async forcePush() {
        // Bypass debounce — immediate push
        clearTimeout(this.pushDebounceTimer);
        this.pushDebounceTimer = null;
        // Wait if currently syncing
        if (this.isSyncing) {
            await new Promise(r => setTimeout(r, 500));
        }
        return this.push();
    }

    /**
     * Full sync: pull remote (merge), then push merged result.
     * Clears etag to force a fresh fetch (avoids 304).
     */
    async fullSync() {
        if (!this.enabled) return;
        console.log('[Sync] fullSync start');
        clearTimeout(this.pushDebounceTimer);
        this.pushDebounceTimer = null;
        // Wait for any in-flight sync to finish (up to 5s)
        for (let i = 0; i < 10 && this.isSyncing; i++) {
            await new Promise(r => setTimeout(r, 500));
        }
        // Force unlock if still stuck
        this.isSyncing = false;
        // Clear etag to force fresh pull (not 304)
        this.etag = null;
        // 1. Pull remote data + merge into local
        const pulled = await this.pull();
        console.log('[Sync] fullSync pull result:', pulled);
        // 2. Push merged local data back to Gist
        this._dirty = true;
        const pushed = await this.push();
        console.log('[Sync] fullSync push result:', pushed);
        console.log('[Sync] fullSync complete');
    }

    /**
     * Fire-and-forget push with keepalive — survives page close.
     * Used by visibilitychange handler when user leaves the app.
     */
    _pushKeepalive() {
        if (!this.enabled || !navigator.onLine) return;
        try {
            const payload = this._buildPayload();
            console.log('[Sync] Keepalive push:', payload.data?.deepbreath_sessions?.length || 0, 'sessions');
            fetch(`https://api.github.com/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    files: {
                        'deepbreath-sync.json': {
                            content: JSON.stringify(payload, null, 2)
                        }
                    }
                }),
                keepalive: true
            });
            this._dirty = false;
        } catch (e) {
            console.warn('[Sync] Keepalive push failed:', e);
        }
    }

    // ==========================================
    // Build sync payload
    // ==========================================

    _buildPayload() {
        const data = {};

        for (const key of this.SYNC_KEYS) {
            const raw = localStorage.getItem(key);
            if (raw === null) continue;

            if (key === 'deepbreath_coach_settings') {
                // Strip API key — never sync it
                try {
                    const parsed = JSON.parse(raw);
                    const { apiKey, ...safe } = parsed;
                    data[key] = safe;
                } catch {
                    data[key] = raw;
                }
            } else if (key === 'deepbreath_goals') {
                data[key] = raw; // String, not JSON
            } else {
                try {
                    data[key] = JSON.parse(raw);
                } catch {
                    data[key] = raw;
                }
            }
        }

        return {
            version: 1,
            lastModified: new Date().toISOString(),
            deviceId: this.deviceId,
            data
        };
    }

    // ==========================================
    // Merge strategies
    // ==========================================

    _merge(remote) {
        if (!remote?.data) { console.log('[Sync] Merge: no remote data'); return null; }

        const localTimestamp = this.lastPullTimestamp || new Date(0);
        const remoteTimestamp = new Date(remote.lastModified || 0);
        const remoteData = remote.data;
        let changed = false;
        console.log('[Sync] Merge: remote from', remote.deviceId, 'at', remote.lastModified);

        // Sessions — union by ID
        if (remoteData.deepbreath_sessions) {
            const localSessions = this._getLocal('deepbreath_sessions', []);
            console.log('[Sync] Sessions: local', localSessions.length, 'remote', remoteData.deepbreath_sessions.length);
            const merged = this._mergeSessions(localSessions, remoteData.deepbreath_sessions);
            if (merged.length !== localSessions.length || JSON.stringify(merged) !== JSON.stringify(localSessions)) {
                remoteData.deepbreath_sessions = merged;
                changed = true;
            } else {
                remoteData.deepbreath_sessions = localSessions;
            }
        }

        // Contraction history — union by date+weekLevel
        if (remoteData.deepbreath_contraction_history) {
            const localHist = this._getLocal('deepbreath_contraction_history', []);
            const merged = this._mergeContractionHistory(localHist, remoteData.deepbreath_contraction_history);
            if (merged.length !== localHist.length) {
                remoteData.deepbreath_contraction_history = merged;
                changed = true;
            } else {
                remoteData.deepbreath_contraction_history = localHist;
            }
        }

        // Sequences — union by key
        if (remoteData.deepbreath_sequences) {
            const localSeq = this._getLocal('deepbreath_sequences', {});
            const merged = { ...remoteData.deepbreath_sequences, ...localSeq };
            if (Object.keys(merged).length !== Object.keys(localSeq).length) {
                remoteData.deepbreath_sequences = merged;
                changed = true;
            } else {
                remoteData.deepbreath_sequences = localSeq;
            }
        }

        // Coach settings — merge but preserve local API key
        if (remoteData.deepbreath_coach_settings) {
            const localCoach = this._getLocal('deepbreath_coach_settings', {});
            const localKey = localCoach.apiKey; // preserve
            remoteData.deepbreath_coach_settings = {
                ...remoteData.deepbreath_coach_settings,
                apiKey: localKey // re-inject local API key
            };
            changed = true;
        }

        // Last-write-wins for simple keys
        const lwwKeys = ['deepbreath_profile', 'deepbreath_goals', 'deepbreath_chat_history', 'deepbreath_settings'];
        for (const key of lwwKeys) {
            if (remoteData[key] !== undefined) {
                const localVal = localStorage.getItem(key);
                const remoteVal = key === 'deepbreath_goals'
                    ? remoteData[key]
                    : JSON.stringify(remoteData[key]);
                if (localVal !== remoteVal) {
                    changed = true;
                }
            }
        }

        console.log('[Sync] Merge result: changed =', changed);
        return changed ? remoteData : null;
    }

    _mergeSessions(local, remote) {
        const byId = new Map();
        for (const s of (remote || [])) { if (s?.id) byId.set(s.id, s); }
        for (const s of (local || [])) { if (s?.id) byId.set(s.id, s); } // local wins
        return Array.from(byId.values())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    _mergeContractionHistory(local, remote) {
        const key = (s) => `${s.date}_${s.weekLevel}`;
        const byKey = new Map();
        for (const s of (remote || [])) byKey.set(key(s), s);
        for (const s of (local || [])) byKey.set(key(s), s);
        return Array.from(byKey.values())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // ==========================================
    // localStorage helpers
    // ==========================================

    _getLocal(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    _writeWithoutIntercept(data) {
        this._skipIntercept = true;
        for (const key of this.SYNC_KEYS) {
            if (data[key] === undefined) continue;
            const val = key === 'deepbreath_goals'
                ? data[key]
                : JSON.stringify(data[key]);
            localStorage.setItem(key, val);
        }
        this._skipIntercept = false;
    }

    // ==========================================
    // localStorage interception
    // ==========================================

    _interceptLocalStorage() {
        const originalSetItem = localStorage.setItem.bind(localStorage);
        const sync = this;

        localStorage.setItem = function(key, value) {
            originalSetItem(key, value);
            if (!sync._skipIntercept && key.startsWith('deepbreath_') && sync.enabled) {
                if (key === 'deepbreath_sessions') {
                    // Sessions: push immediately (no debounce) — critical data
                    sync._dirty = true;
                    sync.push();
                } else {
                    sync.schedulePush();
                }
            }
        };
    }

    // ==========================================
    // Reload app modules after merge
    // ==========================================

    _reloadModules() {
        // Coach
        if (window.coach) {
            window.coach.sessions = window.coach.loadSessions();
            window.coach.profile = window.coach.loadProfile();
            window.coach.goals = localStorage.getItem('deepbreath_goals') || '';
            window.coach.chatHistory = window.coach.loadChatHistory();
            if (window.coach.updateStatsDisplay) window.coach.updateStatsDisplay();
            if (window.coach.renderRecentSessions) window.coach.renderRecentSessions();
        }
        // Journal
        if (window.journal) {
            window.journal.render();
        }
        // MultiTimer
        if (window.multiTimer) {
            window.multiTimer.sequences = window.multiTimer.loadSequences();
            window.multiTimer.renderSequenceCards();
        }
        // App settings
        if (window.app) {
            window.app.settings = window.app.loadSettings();
        }
    }

    // ==========================================
    // Status UI updates
    // ==========================================

    _updateStatusUI(status, message) {
        const btn = document.getElementById('syncStatusBtn');
        const statusText = document.getElementById('syncStatusText');
        const lastSyncEl = document.getElementById('syncLastTime');

        if (btn) {
            btn.className = 'sync-status-btn';
            btn.classList.add(`sync-${status}`);
            btn.title = status === 'synced' ? 'Synchronisé'
                      : status === 'syncing' ? 'Synchronisation...'
                      : status === 'error' ? `Erreur: ${message}`
                      : 'Sync non configurée';
        }

        if (statusText) {
            statusText.textContent = status === 'synced' ? 'Synchronisé'
                                   : status === 'syncing' ? 'Synchronisation...'
                                   : status === 'error' ? `Erreur : ${message}`
                                   : 'Non configuré';
            statusText.className = `sync-status-label sync-${status}`;
        }

        if (lastSyncEl && status === 'synced') {
            lastSyncEl.textContent = 'à l\'instant';
        }
    }
}

// Create global instance
window.dataSync = new DataSync();
