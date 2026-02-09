/**
 * Coach AI - Personalized breathing coach with session tracking
 * Uses Claude/OpenAI API for intelligent recommendations
 */

class CoachAI {
    constructor() {
        this.sessions = this.loadSessions();
        this.goals = localStorage.getItem('deepbreath_goals') || '';
        this.profile = this.loadProfile();
        this.coachSettings = this.loadCoachSettings();
        this.chatHistory = [];
        this.isLoading = false;
        this.pendingSession = null;

        this.init();
    }

    // ==========================================
    // Initialization
    // ==========================================

    init() {
        this.setupFeedbackModal();
        this.setupChat();
        this.setupProfile();
        this.setupCoachSettings();
        this.setupExportImport();
        this.updateStatsDisplay();
        this.renderRecentSessions();
        this.showWelcomeMessage();
    }

    // ==========================================
    // Settings
    // ==========================================

    getDefaultCoachSettings() {
        return {
            provider: 'claude',
            apiKey: '',
            model: 'claude-sonnet-4-20250514',
            autoSuggest: false
        };
    }

    loadCoachSettings() {
        const saved = localStorage.getItem('deepbreath_coach_settings');
        if (saved) {
            try {
                return { ...this.getDefaultCoachSettings(), ...JSON.parse(saved) };
            } catch (e) {
                return this.getDefaultCoachSettings();
            }
        }
        return this.getDefaultCoachSettings();
    }

    saveCoachSettings() {
        localStorage.setItem('deepbreath_coach_settings', JSON.stringify(this.coachSettings));
    }

    setupCoachSettings() {
        const provider = document.getElementById('coachProvider');
        const apiKey = document.getElementById('coachApiKey');
        const model = document.getElementById('coachModel');
        const autoSuggest = document.getElementById('coachAutoSuggest');
        const goalsInput = document.getElementById('coachGoals');

        if (provider) {
            provider.value = this.coachSettings.provider;
            provider.addEventListener('change', () => {
                this.coachSettings.provider = provider.value;
                this.updateModelOptions();
                this.saveCoachSettings();
            });
        }

        if (apiKey) {
            apiKey.value = this.coachSettings.apiKey;
            apiKey.addEventListener('change', () => {
                this.coachSettings.apiKey = apiKey.value.trim();
                this.saveCoachSettings();
            });
        }

        if (model) {
            this.updateModelOptions();
            model.value = this.coachSettings.model;
            model.addEventListener('change', () => {
                this.coachSettings.model = model.value;
                this.saveCoachSettings();
            });
        }

        if (autoSuggest) {
            autoSuggest.checked = this.coachSettings.autoSuggest;
            autoSuggest.addEventListener('change', () => {
                this.coachSettings.autoSuggest = autoSuggest.checked;
                this.saveCoachSettings();
            });
        }

        if (goalsInput) {
            goalsInput.value = this.goals;
            goalsInput.addEventListener('change', () => {
                this.goals = goalsInput.value.trim();
                localStorage.setItem('deepbreath_goals', this.goals);
            });
        }
    }

    updateModelOptions() {
        const model = document.getElementById('coachModel');
        if (!model) return;

        const currentValue = model.value;
        model.innerHTML = '';

        if (this.coachSettings.provider === 'claude') {
            model.innerHTML = `
                <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
                <option value="claude-haiku-4-20250414">Claude Haiku (rapide)</option>
            `;
        } else {
            model.innerHTML = `
                <option value="gpt-4o-mini">GPT-4o Mini (rapide)</option>
                <option value="gpt-4o">GPT-4o</option>
            `;
        }

        // Restore selection if still valid
        const options = Array.from(model.options).map(o => o.value);
        if (options.includes(currentValue)) {
            model.value = currentValue;
        }
        this.coachSettings.model = model.value;
    }

    // ==========================================
    // Athlete Profile
    // ==========================================

    getDefaultProfile() {
        return {
            age: null,
            height: null,
            weight: null,
            vo2max: null,
            hrRest: null,
            staticMax: null,
            staticDry: null,
            dynMax: null,
            depthMax: null,
            firstContraction: null,
            apneaLevel: '',
            sports: '',
            trainingFreq: '',
            currentState: '',
            notes: ''
        };
    }

    loadProfile() {
        const saved = localStorage.getItem('deepbreath_profile');
        if (saved) {
            try {
                return { ...this.getDefaultProfile(), ...JSON.parse(saved) };
            } catch (e) {
                return this.getDefaultProfile();
            }
        }
        return this.getDefaultProfile();
    }

    saveProfile() {
        localStorage.setItem('deepbreath_profile', JSON.stringify(this.profile));
    }

    setupProfile() {
        // Toggle collapse
        const toggle = document.getElementById('coachProfileToggle');
        const body = document.getElementById('coachProfileBody');
        toggle?.addEventListener('click', () => {
            body?.classList.toggle('collapsed');
            toggle.classList.toggle('open');
        });

        // Populate inputs from saved profile
        document.querySelectorAll('[data-profile]').forEach(input => {
            const key = input.dataset.profile;
            const value = this.profile[key];
            if (value != null && value !== '') {
                input.value = value;
            }
        });

        // Save button
        const saveBtn = document.getElementById('btnSaveProfile');
        saveBtn?.addEventListener('click', () => {
            this.collectProfile();
            this.saveProfile();
            if (window.app) window.app.showToast('Profil enregistre');
        });
    }

    collectProfile() {
        document.querySelectorAll('[data-profile]').forEach(input => {
            const key = input.dataset.profile;
            const val = input.value.trim();
            if (input.type === 'number') {
                this.profile[key] = val ? parseFloat(val) : null;
            } else {
                this.profile[key] = val;
            }
        });
    }

    buildProfileSummary() {
        const p = this.profile;
        const lines = [];

        // Physio
        if (p.age) lines.push(`Age : ${p.age} ans`);
        if (p.height) lines.push(`Taille : ${p.height} cm`);
        if (p.weight) lines.push(`Poids : ${p.weight} kg`);
        if (p.vo2max) lines.push(`VO2max estimee : ${p.vo2max} ml/kg/min`);
        if (p.hrRest) lines.push(`FC repos : ${p.hrRest} bpm`);

        // Apnee
        if (p.staticMax) lines.push(`Statique max (eau) : ${p.staticMax}s (${this.formatTimeSec(p.staticMax)})`);
        if (p.staticDry) lines.push(`Statique dry max : ${p.staticDry}s (${this.formatTimeSec(p.staticDry)})`);
        if (p.dynMax) lines.push(`Dynamique max : ${p.dynMax}m`);
        if (p.depthMax) lines.push(`Profondeur max : ${p.depthMax}m`);
        if (p.firstContraction) lines.push(`1ere contraction : ${p.firstContraction}s`);
        if (p.apneaLevel) lines.push(`Niveau apnee : ${p.apneaLevel}`);

        // Sport
        if (p.sports) lines.push(`Sports : ${p.sports}`);
        if (p.trainingFreq) lines.push(`Frequence : ${p.trainingFreq}x/sem`);
        if (p.currentState) lines.push(`Etat actuel : ${p.currentState}`);
        if (p.notes) lines.push(`Notes : ${p.notes}`);

        return lines.length > 0 ? lines.join('\n') : 'Profil non renseigne.';
    }

    formatTimeSec(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}min${s > 0 ? s + 's' : ''}` : `${s}s`;
    }

    // ==========================================
    // Session Storage
    // ==========================================

    loadSessions() {
        const saved = localStorage.getItem('deepbreath_sessions');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return [];
            }
        }
        return [];
    }

    saveSessions() {
        localStorage.setItem('deepbreath_sessions', JSON.stringify(this.sessions));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    // ==========================================
    // Post-Exercise Feedback Modal
    // ==========================================

    setupFeedbackModal() {
        const closeBtn = document.getElementById('feedbackModalClose');
        const skipBtn = document.getElementById('btnSkipFeedback');
        const saveBtn = document.getElementById('btnSaveFeedback');

        closeBtn?.addEventListener('click', () => this.skipFeedback());
        skipBtn?.addEventListener('click', () => this.skipFeedback());
        saveBtn?.addEventListener('click', () => this.saveFeedback());

        // Setup rating buttons
        document.querySelectorAll('.feedback-rating').forEach(group => {
            group.querySelectorAll('.rating-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    group.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            });
        });

        // Close on backdrop click
        const modal = document.getElementById('feedbackModal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.skipFeedback();
        });
    }

    showFeedbackModal(exercise, duration) {
        this.pendingSession = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            category: exercise.category || this.getCategoryFromExercise(exercise.id),
            duration: Math.round(duration),
            date: new Date().toISOString(),
            completed: true
        };

        const nameEl = document.getElementById('feedbackExerciseName');
        if (nameEl) nameEl.textContent = exercise.name;

        // Reset form
        this.resetFeedbackForm();

        document.getElementById('feedbackModal')?.classList.add('active');
    }

    resetFeedbackForm() {
        // Reset ratings to defaults
        document.querySelectorAll('.feedback-rating').forEach(group => {
            group.querySelectorAll('.rating-btn').forEach(btn => btn.classList.remove('active'));
        });

        // Set default: feeling=3, stressBefore=3, stressAfter=2
        this.setDefaultRating('feedbackFeeling', 3);
        this.setDefaultRating('feedbackStressBefore', 3);
        this.setDefaultRating('feedbackStressAfter', 2);

        const notes = document.getElementById('feedbackNotes');
        if (notes) notes.value = '';
    }

    setDefaultRating(groupId, value) {
        const group = document.getElementById(groupId);
        if (!group) return;
        const btn = group.querySelector(`.rating-btn[data-value="${value}"]`);
        if (btn) btn.classList.add('active');
    }

    getSelectedRating(groupId) {
        const group = document.getElementById(groupId);
        if (!group) return null;
        const active = group.querySelector('.rating-btn.active');
        return active ? parseInt(active.dataset.value) : null;
    }

    saveFeedback() {
        if (!this.pendingSession) return;

        const session = {
            ...this.pendingSession,
            id: this.generateId(),
            feeling: this.getSelectedRating('feedbackFeeling'),
            stressBefore: this.getSelectedRating('feedbackStressBefore'),
            stressAfter: this.getSelectedRating('feedbackStressAfter'),
            notes: (document.getElementById('feedbackNotes')?.value || '').trim()
        };

        this.sessions.push(session);
        this.saveSessions();
        this.closeFeedbackModal();
        this.updateStatsDisplay();
        this.renderRecentSessions();

        if (window.app) window.app.showToast('Session enregistree');
    }

    skipFeedback() {
        if (this.pendingSession) {
            // Save minimal session data
            const session = {
                ...this.pendingSession,
                id: this.generateId(),
                feeling: null,
                stressBefore: null,
                stressAfter: null,
                notes: ''
            };

            this.sessions.push(session);
            this.saveSessions();
            this.updateStatsDisplay();
            this.renderRecentSessions();
        }

        this.closeFeedbackModal();
    }

    closeFeedbackModal() {
        this.pendingSession = null;
        document.getElementById('feedbackModal')?.classList.remove('active');
        if (window.app) window.app.closeExercise();
    }

    getCategoryFromExercise(exerciseId) {
        const ex = window.EXERCISES?.[exerciseId];
        return ex?.category || 'respiration';
    }

    // ==========================================
    // Stats Computation
    // ==========================================

    computeStats() {
        const sessions = this.sessions;
        if (sessions.length === 0) {
            return {
                totalSessions: 0,
                currentStreak: 0,
                avgStressBefore: '-',
                avgStressAfter: '-',
                avgStressReduction: '-',
                favoriteExercise: null
            };
        }

        const totalSessions = sessions.length;

        // Streak: consecutive days with sessions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let streak = 0;
        let checkDate = new Date(today);
        while (true) {
            const dateStr = checkDate.toISOString().slice(0, 10);
            const hasSession = sessions.some(s => s.date?.slice(0, 10) === dateStr);
            if (hasSession) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Average stress
        const withStress = sessions.filter(s => s.stressBefore != null && s.stressAfter != null);
        const avgBefore = withStress.length > 0
            ? (withStress.reduce((a, s) => a + s.stressBefore, 0) / withStress.length).toFixed(1)
            : '-';
        const avgAfter = withStress.length > 0
            ? (withStress.reduce((a, s) => a + s.stressAfter, 0) / withStress.length).toFixed(1)
            : '-';
        const avgReduction = withStress.length > 0
            ? (withStress.reduce((a, s) => a + (s.stressBefore - s.stressAfter), 0) / withStress.length).toFixed(1)
            : '-';

        // Most practiced exercise
        const counts = {};
        sessions.forEach(s => {
            counts[s.exerciseName] = (counts[s.exerciseName] || 0) + 1;
        });
        const favorite = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        return {
            totalSessions,
            currentStreak: streak,
            avgStressBefore: avgBefore,
            avgStressAfter: avgAfter,
            avgStressReduction: avgReduction,
            favoriteExercise: favorite
        };
    }

    updateStatsDisplay() {
        const stats = this.computeStats();

        const totalEl = document.getElementById('coachTotalSessions');
        const streakEl = document.getElementById('coachStreak');
        const reductionEl = document.getElementById('coachAvgStressReduction');

        if (totalEl) totalEl.textContent = stats.totalSessions;
        if (streakEl) streakEl.textContent = stats.currentStreak;
        if (reductionEl) {
            reductionEl.textContent = stats.avgStressReduction !== '-'
                ? `-${stats.avgStressReduction}`
                : '-';
        }
    }

    // ==========================================
    // Chat Interface
    // ==========================================

    setupChat() {
        const sendBtn = document.getElementById('coachSendBtn');
        const input = document.getElementById('coachInput');

        this.attachedFileText = null;
        this.attachedFileName = null;

        sendBtn?.addEventListener('click', () => this.sendMessage());

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input?.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 160) + 'px';
        });

        // Quick action buttons
        document.querySelectorAll('.coach-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                if (prompt) {
                    const input = document.getElementById('coachInput');
                    if (input) input.value = prompt;
                    this.sendMessage();
                }
            });
        });

        // File attachment
        const attachBtn = document.getElementById('coachAttachBtn');
        const fileInput = document.getElementById('coachFileInput');
        const attachedDiv = document.getElementById('coachAttachedFile');
        const fileNameSpan = document.getElementById('attachedFileName');
        const removeBtn = document.getElementById('attachedFileRemove');

        attachBtn?.addEventListener('click', () => fileInput?.click());

        fileInput?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            e.target.value = '';

            try {
                const text = await this.extractFileText(file);
                if (text && text.trim()) {
                    this.attachedFileText = text.trim();
                    this.attachedFileName = file.name;
                    if (fileNameSpan) fileNameSpan.textContent = file.name;
                    if (attachedDiv) attachedDiv.style.display = 'inline-flex';
                } else {
                    if (window.app) window.app.showToast('Fichier vide ou illisible', 'warning');
                }
            } catch (err) {
                console.error('File extraction error:', err);
                if (window.app) window.app.showToast('Impossible de lire ce fichier', 'warning');
            }
        });

        removeBtn?.addEventListener('click', () => {
            this.clearAttachment();
        });
    }

    clearAttachment() {
        this.attachedFileText = null;
        this.attachedFileName = null;
        const attachedDiv = document.getElementById('coachAttachedFile');
        if (attachedDiv) attachedDiv.style.display = 'none';
    }

    async extractFileText(file) {
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'txt') {
            return await file.text();
        }

        if ((ext === 'docx' || ext === 'doc') && typeof mammoth !== 'undefined') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        }

        if (ext === 'docx' || ext === 'doc') {
            throw new Error('Librairie mammoth non chargee');
        }

        throw new Error('Format non supporte');
    }

    showWelcomeMessage() {
        const messagesDiv = document.getElementById('coachMessages');
        if (!messagesDiv) return;

        const stats = this.computeStats();
        let welcome;

        if (stats.totalSessions === 0) {
            welcome = `Salut. Je suis ton coach apnee et respiration.\n\nDis-moi ton niveau, tes objectifs et ton record actuel en statique. Je te construis un programme adapte.\n\nTu peux aussi lancer directement un exercice — je te demanderai ton ressenti apres chaque session pour ajuster la suite.`;
        } else {
            welcome = `${stats.totalSessions} session${stats.totalSessions > 1 ? 's' : ''} au compteur`;
            if (stats.currentStreak > 1) {
                welcome += `, ${stats.currentStreak} jours d'affilee`;
            }
            welcome += `.\n\nOn fait quoi aujourd'hui ?`;
        }

        this.renderMessage(welcome, 'assistant');
    }

    async sendMessage() {
        const input = document.getElementById('coachInput');
        const hasText = input && input.value.trim();
        const hasFile = this.attachedFileText;

        if ((!hasText && !hasFile) || this.isLoading) return;

        let userMessage = (input?.value || '').trim();
        let displayMessage = userMessage;
        let aiMessage = userMessage;

        // Si fichier attache, l'integrer dans le message AI
        if (hasFile) {
            const fileLabel = this.attachedFileName || 'fichier';
            displayMessage = userMessage
                ? `📎 ${fileLabel}\n\n${userMessage}`
                : `📎 ${fileLabel}`;

            const fileContent = this.attachedFileText.slice(0, 50000); // ~14 pages max
            aiMessage = userMessage
                ? `Voici le contenu du fichier "${fileLabel}" :\n\n---\n${fileContent}\n---\n\nMa demande : ${userMessage}`
                : `Voici le contenu du fichier "${fileLabel}" que je veux que tu analyses :\n\n---\n${fileContent}\n---\n\nAnalyse ce document et donne-moi tes recommandations.`;

            this.clearAttachment();
        }

        if (input) {
            input.value = '';
            input.style.height = 'auto';
        }

        // Show user message
        this.renderMessage(displayMessage, 'user');

        // Show loading indicator
        this.showTypingIndicator();
        this.isLoading = true;

        // Call AI
        const response = await this.callAI(aiMessage);
        this.isLoading = false;

        // Remove loading indicator
        this.hideTypingIndicator();

        if (response.error) {
            this.renderMessage(response.error, 'assistant error');
        } else {
            this.renderMessage(response.text, 'assistant');
        }
    }

    renderMessage(content, role) {
        const messagesDiv = document.getElementById('coachMessages');
        if (!messagesDiv) return;

        const msgDiv = document.createElement('div');
        const isError = role.includes('error');
        const baseRole = role.replace(' error', '');
        msgDiv.className = `coach-message coach-message-${baseRole}${isError ? ' coach-message-error' : ''}`;

        // Parse [EXERCICE:id] into clickable buttons
        let html = this.escapeHtml(content);
        html = html.replace(/\[EXERCICE:([a-z0-9-]+)\]/g, (match, exerciseId) => {
            const exercise = window.EXERCISES?.[exerciseId];
            if (exercise) {
                return `<button class="coach-exercise-link" data-exercise="${exerciseId}">${exercise.name}</button>`;
            }
            return match;
        });

        // Basic markdown
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');

        msgDiv.innerHTML = html;
        messagesDiv.appendChild(msgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Attach click handlers to exercise links
        msgDiv.querySelectorAll('.coach-exercise-link').forEach(btn => {
            btn.addEventListener('click', () => {
                const exId = btn.dataset.exercise;
                if (window.app) window.app.startExercise(exId);
            });
        });
    }

    showTypingIndicator() {
        const messagesDiv = document.getElementById('coachMessages');
        if (!messagesDiv) return;

        const indicator = document.createElement('div');
        indicator.className = 'coach-message coach-message-assistant coach-typing';
        indicator.id = 'coachTyping';
        indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
        messagesDiv.appendChild(indicator);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('coachTyping');
        if (indicator) indicator.remove();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // AI API Calls
    // ==========================================

    async callAI(userMessage) {
        const settings = this.coachSettings;

        if (!settings.apiKey) {
            return this.getOfflineResponse(userMessage);
        }

        // Check network
        if (!navigator.onLine) {
            return this.getOfflineResponse(userMessage);
        }

        const systemPrompt = this.buildSystemPrompt();

        // Add to chat history
        this.chatHistory.push({ role: 'user', content: userMessage });

        // Keep last 20 messages
        const messages = this.chatHistory.slice(-20);

        try {
            let result;
            if (settings.provider === 'claude') {
                result = await this.callClaude(systemPrompt, messages, settings);
            } else {
                result = await this.callOpenAI(systemPrompt, messages, settings);
            }

            this.chatHistory.push({ role: 'assistant', content: result.text });
            return result;
        } catch (e) {
            // Remove the failed user message from history
            this.chatHistory.pop();
            return { error: `Erreur de connexion : ${e.message}` };
        }
    }

    async callClaude(systemPrompt, messages, settings) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: settings.model || 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                system: systemPrompt,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `Erreur ${response.status}`);
        }

        const data = await response.json();
        return { text: data.content[0].text };
    }

    async callOpenAI(systemPrompt, messages, settings) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({
                model: settings.model || 'gpt-4o-mini',
                max_tokens: 4096,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `Erreur ${response.status}`);
        }

        const data = await response.json();
        return { text: data.choices[0].message.content };
    }

    // ==========================================
    // System Prompt Builder
    // ==========================================

    buildSystemPrompt() {
        const exercises = window.EXERCISES || {};
        const exerciseList = Object.entries(exercises).map(([id, ex]) =>
            `- [EXERCICE:${id}] ${ex.name} (${ex.category || 'general'}, ${ex.duration || '?'} min) : ${ex.description || ''}`
        ).join('\n');

        const recentSessions = this.sessions.slice(-50).map(s =>
            `${s.date?.slice(0, 10)} | ${s.exerciseName} | ${Math.floor(s.duration / 60)}min | Ressenti:${s.feeling || '?'}/5 | Stress:${s.stressBefore || '?'}->${s.stressAfter || '?'}${s.notes ? ' | Note: ' + s.notes : ''}`
        ).join('\n');

        const stats = this.computeStats();

        return `Tu es un coach specialise en apnee et entrainement respiratoire au sec. Tu tutoies l'eleve. Tu es direct, sans fioriture, concret. Pas de bla-bla motivationnel creux. Tu vas droit au but.

## Ton profil
- Expert en entrainement a l'apnee statique et dynamique au sec
- Tu connais les dernieres techniques et recherches : tables CO2/O2, tolerance aux contractions, breathe-up structure, reflexe de plongee, cyclic sighing (Stanford 2023), coherence cardiaque pour le HRV, methode Wim Hof, PETTLEP, sophrologie appliquee a l'apnee
- Tu construis des programmes progressifs adaptes au niveau reel de l'eleve
- Tu pousses a progresser mais sans bruler les etapes — la securite d'abord
- Tu adaptes les exercices au fur et a mesure selon les retours de session (ressenti, stress, performances)
- Tu privilegies toujours l'entrainement au sec avant l'eau

## Application
Tu as acces a un moteur d'exercices. Quand tu recommandes un exercice, utilise EXACTEMENT le format [EXERCICE:exercise-id] pour generer un bouton cliquable qui lance directement l'exercice dans l'app.

## Exercices disponibles dans l'app
${exerciseList}

## Profil de l'eleve
${this.buildProfileSummary()}

## Historique de l'eleve (${this.sessions.length} sessions)
${recentSessions || 'Aucune session enregistree.'}

## Stats
- Sessions : ${stats.totalSessions}
- Serie : ${stats.currentStreak} jours
- Stress moyen avant/apres : ${stats.avgStressBefore} -> ${stats.avgStressAfter} (reduction : ${stats.avgStressReduction})
- Exercice favori : ${stats.favoriteExercise || '-'}

## Objectifs de l'eleve
${this.goals || 'Non definis — demande-lui ses objectifs.'}

## Regles strictes
- TOUJOURS en francais, tutoiement
- Reponses courtes et directes (2-3 paragraphes max)
- Quand tu proposes un exercice, utilise [EXERCICE:id] — c'est obligatoire
- Propose des seances concretes, pas juste des conseils vagues
- Adapte l'intensite et le volume selon le PROFIL (records, niveau, etat actuel) et l'HISTORIQUE des sessions
- Utilise les records de l'eleve (statique max, dry, dynamique, profondeur) pour calibrer les tables et durees
- Si le profil indique "reprise" ou "fatigue", reduis l'intensite ; si "progression" ou "pic", pousse-le
- Pour l'apnee : respecte la progressivite (CO2 tolerance avant O2 performance, contractions avant records)
- Si l'eleve mentionne du stress ou de l'anxiete, oriente vers les exercices urgence/relaxation avant l'apnee
- Ne repete jamais l'historique ou le profil sauf si on te le demande
- Si tu proposes un programme sur plusieurs jours, structure-le clairement (Jour 1, Jour 2, etc.)
- Si le profil est vide, demande les infos essentielles : niveau apnee, statique max, etat d'entrainement`;
    }

    // ==========================================
    // Offline Fallback
    // ==========================================

    getOfflineResponse(prompt) {
        const lower = prompt.toLowerCase();

        if (lower.includes('stress') || lower.includes('anxie') || lower.includes('calm') || lower.includes('redescendre')) {
            return {
                text: `Pas de connexion, mais voila le protocole anti-stress :\n\n1. [EXERCICE:physiological-sigh] Soupir physiologique — pour couper le pic immediat\n2. [EXERCICE:cyclic-sighing] Cyclic Sighing 5 min — redescente profonde\n3. [EXERCICE:coherent] Coherente 10 min — stabilisation du systeme nerveux\n\nConfigure ta cle API dans Parametres > Coach IA pour que je puisse adapter.`
            };
        }

        if (lower.includes('apnee') || lower.includes('apnea') || lower.includes('sec') || lower.includes('table')) {
            return {
                text: `Hors-ligne. Seance type apnee au sec :\n\n1. [EXERCICE:predive] Echauffement respiratoire (5 min)\n2. [EXERCICE:co2-table] Table CO2 — tolerance de base\n3. [EXERCICE:no-contraction] Table sans contraction — controle mental\n\nSi tu veux de l'O2 : [EXERCICE:o2-table] Table O2 (apres la CO2, jamais avant).\n\nPour un programme adapte a ton niveau, configure la cle API.`
            };
        }

        if (lower.includes('bilan') || lower.includes('progress') || lower.includes('stat')) {
            const stats = this.computeStats();
            let text = `Bilan :\n\n`;
            text += `- **${stats.totalSessions}** sessions\n`;
            text += `- **${stats.currentStreak}** jours d'affilee\n`;
            text += `- Stress : ${stats.avgStressBefore} -> ${stats.avgStressAfter}`;
            if (stats.avgStressReduction !== '-') {
                text += ` (reduction ${stats.avgStressReduction})`;
            }
            text += `\n`;
            if (stats.favoriteExercise) {
                text += `- Favori : ${stats.favoriteExercise}\n`;
            }
            text += `\nConfigure la cle API pour une analyse detaillee et des recommandations.`;
            return { text };
        }

        if (lower.includes('programme') || lower.includes('semaine') || lower.includes('plan')) {
            return {
                text: `Hors-ligne — programme type semaine au sec :\n\n**Jour 1-3** : [EXERCICE:co2-table] Table CO2 + [EXERCICE:coherent] Coherente 10 min\n**Jour 4** : Repos actif — [EXERCICE:cyclic-sighing] Cyclic Sighing\n**Jour 5-6** : [EXERCICE:o2-table] Table O2 + [EXERCICE:no-contraction] Sans contraction\n**Jour 7** : Repos\n\nPour un programme personnalise, configure la cle API.`
            };
        }

        return {
            text: `Hors-ligne. Seance rapide :\n\n- [EXERCICE:cyclic-sighing] Cyclic Sighing (echauffement)\n- [EXERCICE:co2-table] Table CO2 (travail de fond)\n\nPour des seances sur mesure, configure ta cle API dans Parametres > Coach IA.`
        };
    }

    // ==========================================
    // Recent Sessions List
    // ==========================================

    renderRecentSessions() {
        const container = document.getElementById('coachSessionsList');
        if (!container) return;

        const recent = this.sessions.slice(-20).reverse();

        if (recent.length === 0) {
            container.innerHTML = '<p class="coach-empty">Aucune session enregistree. Lancez un exercice pour commencer.</p>';
            return;
        }

        container.innerHTML = recent.map(s => `
            <div class="coach-session-item">
                <div class="coach-session-info">
                    <strong>${this.escapeHtml(s.exerciseName)}</strong>
                    <span class="coach-session-date">${this.formatDate(s.date)}</span>
                </div>
                <div class="coach-session-meta">
                    <span>${Math.floor(s.duration / 60)} min</span>
                    ${s.feeling ? `<span>Ressenti : ${s.feeling}/5</span>` : ''}
                    ${s.stressBefore != null && s.stressAfter != null ? `<span>Stress : ${s.stressBefore} → ${s.stressAfter}</span>` : ''}
                </div>
                ${s.notes ? `<p class="coach-session-notes">${this.escapeHtml(s.notes)}</p>` : ''}
            </div>
        `).join('');
    }

    formatDate(isoDate) {
        if (!isoDate) return '';
        try {
            const d = new Date(isoDate);
            return d.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return isoDate.slice(0, 10);
        }
    }

    // ==========================================
    // Export / Import
    // ==========================================

    setupExportImport() {
        const exportBtn = document.getElementById('btnExportSessions');
        const exportExcelBtn = document.getElementById('btnExportExcel');
        const exportWordBtn = document.getElementById('btnExportWord');
        const importBtn = document.getElementById('btnImportSessions');
        const importFileInput = document.getElementById('importSessionsFile');

        exportBtn?.addEventListener('click', () => this.exportJSON());
        exportExcelBtn?.addEventListener('click', () => this.exportExcel());
        exportWordBtn?.addEventListener('click', () => this.exportWord());
        importBtn?.addEventListener('click', () => importFileInput?.click());
        importFileInput?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.importFile(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // ==========================================
    //  EXPORT JSON
    // ==========================================

    exportJSON() {
        const data = {
            version: 2,
            exportDate: new Date().toISOString(),
            sessions: this.sessions,
            goals: this.goals,
            profile: this.profile
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, `deepbreath-sessions-${new Date().toISOString().slice(0, 10)}.json`);
        if (window.app) window.app.showToast('Export JSON termine');
    }

    // ==========================================
    //  EXPORT EXCEL
    // ==========================================

    exportExcel() {
        if (typeof XLSX === 'undefined') {
            if (window.app) window.app.showToast('Librairie Excel non chargee', 'warning');
            return;
        }

        const wb = XLSX.utils.book_new();

        // --- Feuille 1 : Sessions ---
        const sessionsData = this.sessions.map(s => ({
            'ID': s.id || '',
            'Date': s.date ? new Date(s.date) : '',
            'Exercice': s.exerciseName || '',
            'ID Exercice': s.exerciseId || '',
            'Categorie': s.category || '',
            'Duree (s)': s.duration || 0,
            'Duree (min)': s.duration ? Math.round(s.duration / 60 * 10) / 10 : 0,
            'Complete': s.completed ? 'Oui' : 'Non',
            'Stress Avant': s.stressBefore ?? '',
            'Stress Apres': s.stressAfter ?? '',
            'Reduction': (s.stressBefore != null && s.stressAfter != null)
                ? s.stressBefore - s.stressAfter : '',
            'Ressenti': s.feeling ?? '',
            'Notes': s.notes || ''
        }));

        const ws1 = XLSX.utils.json_to_sheet(sessionsData);
        ws1['!cols'] = [
            {wch:14}, {wch:18}, {wch:25}, {wch:15}, {wch:15},
            {wch:10}, {wch:12}, {wch:10}, {wch:12}, {wch:12},
            {wch:10}, {wch:10}, {wch:30}
        ];
        XLSX.utils.book_append_sheet(wb, ws1, 'Sessions');

        // --- Feuille 2 : Profil ---
        const p = this.profile;
        const profileRows = [
            ['Profil Athlete', ''],
            ['Age', p.age || ''],
            ['Taille (cm)', p.height || ''],
            ['Poids (kg)', p.weight || ''],
            ['VO2max (ml/kg/min)', p.vo2max || ''],
            ['FC Repos (bpm)', p.hrRest || ''],
            ['', ''],
            ['Apnee', ''],
            ['Statique max eau (s)', p.staticMax || ''],
            ['Statique dry max (s)', p.staticDry || ''],
            ['Dynamique max (m)', p.dynMax || ''],
            ['Profondeur max (m)', p.depthMax || ''],
            ['1ere contraction (s)', p.firstContraction || ''],
            ['Niveau apnee', p.apneaLevel || ''],
            ['', ''],
            ['Entrainement', ''],
            ['Sports', p.sports || ''],
            ['Frequence (x/sem)', p.trainingFreq || ''],
            ['Etat actuel', p.currentState || ''],
            ['Notes', p.notes || '']
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(profileRows);
        ws2['!cols'] = [{wch:25}, {wch:30}];
        XLSX.utils.book_append_sheet(wb, ws2, 'Profil');

        // --- Feuille 3 : Stats ---
        const stats = this.computeStats();
        const statsRows = [
            ['Statistiques', ''],
            ['Sessions totales', stats.totalSessions],
            ['Serie actuelle (jours)', stats.currentStreak],
            ['Stress moyen avant', stats.avgStressBefore],
            ['Stress moyen apres', stats.avgStressAfter],
            ['Reduction stress moyenne', stats.avgStressReduction],
            ['Exercice favori', stats.favoriteExercise || '-'],
            ['', ''],
            ['Objectifs', this.goals || ''],
            ['Date export', new Date().toLocaleDateString('fr-FR')]
        ];
        const ws3 = XLSX.utils.aoa_to_sheet(statsRows);
        ws3['!cols'] = [{wch:25}, {wch:30}];
        XLSX.utils.book_append_sheet(wb, ws3, 'Stats');

        // --- Telecharger ---
        const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbOut], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        this.downloadBlob(blob, `deepbreath-sessions-${new Date().toISOString().slice(0, 10)}.xlsx`);
        if (window.app) window.app.showToast('Export Excel termine');
    }

    // ==========================================
    //  EXPORT WORD (rapport)
    // ==========================================

    exportWord() {
        if (typeof docx === 'undefined') {
            if (window.app) window.app.showToast('Librairie Word non chargee', 'warning');
            return;
        }

        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
                HeadingLevel, AlignmentType, WidthType } = docx;

        const stats = this.computeStats();
        const p = this.profile;
        const exportDate = new Date().toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // --- Profil (champs non vides) ---
        const profileLines = [];
        if (p.age) profileLines.push(`Age : ${p.age} ans`);
        if (p.height) profileLines.push(`Taille : ${p.height} cm`);
        if (p.weight) profileLines.push(`Poids : ${p.weight} kg`);
        if (p.vo2max) profileLines.push(`VO2max : ${p.vo2max} ml/kg/min`);
        if (p.hrRest) profileLines.push(`FC repos : ${p.hrRest} bpm`);
        if (p.staticMax) profileLines.push(`Statique max eau : ${p.staticMax}s`);
        if (p.staticDry) profileLines.push(`Statique dry : ${p.staticDry}s`);
        if (p.dynMax) profileLines.push(`Dynamique max : ${p.dynMax}m`);
        if (p.depthMax) profileLines.push(`Profondeur max : ${p.depthMax}m`);
        if (p.firstContraction) profileLines.push(`1ere contraction : ${p.firstContraction}s`);
        if (p.apneaLevel) profileLines.push(`Niveau : ${p.apneaLevel}`);
        if (p.sports) profileLines.push(`Sports : ${p.sports}`);
        if (p.trainingFreq) profileLines.push(`Frequence : ${p.trainingFreq}x/sem`);
        if (p.currentState) profileLines.push(`Etat actuel : ${p.currentState}`);

        // --- Tableau sessions (50 dernieres) ---
        const cols = ['Date', 'Exercice', 'Duree', 'Stress', 'Ressenti', 'Notes'];
        const headerRow = new TableRow({
            children: cols.map(text => new TableCell({
                children: [new Paragraph({
                    children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 20, font: 'Helvetica' })]
                })],
                shading: { fill: '1a365d', type: 'clear', color: 'auto' }
            }))
        });

        const recentSessions = this.sessions.slice(-50);
        const sessionRows = recentSessions.map(s => {
            const cells = [
                s.date ? new Date(s.date).toLocaleDateString('fr-FR') : '-',
                s.exerciseName || '-',
                s.duration ? `${Math.floor(s.duration / 60)}min ${s.duration % 60}s` : '-',
                (s.stressBefore != null && s.stressAfter != null)
                    ? `${s.stressBefore} → ${s.stressAfter}` : '-',
                s.feeling ? `${s.feeling}/5` : '-',
                s.notes || ''
            ];
            return new TableRow({
                children: cells.map(text => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: String(text), size: 18, font: 'Helvetica' })]
                    })]
                }))
            });
        });

        // --- Construction du document ---
        const children = [
            new Paragraph({
                children: [new TextRun({ text: 'Rapport d\'Entrainement', bold: true, size: 36, font: 'Helvetica' })],
                heading: HeadingLevel.TITLE
            }),
            new Paragraph({
                children: [new TextRun({ text: `Jmee DeepBreath — ${exportDate}`, italics: true, color: '666666', size: 22 })]
            }),
            new Paragraph({ text: '' })
        ];

        // Profil
        if (profileLines.length > 0) {
            children.push(new Paragraph({
                children: [new TextRun({ text: 'Profil Athlete', bold: true, size: 28, font: 'Helvetica' })],
                heading: HeadingLevel.HEADING_1
            }));
            profileLines.forEach(line => {
                children.push(new Paragraph({
                    children: [new TextRun({ text: line, size: 22, font: 'Helvetica' })],
                    bullet: { level: 0 }
                }));
            });
            children.push(new Paragraph({ text: '' }));
        }

        // Stats
        children.push(new Paragraph({
            children: [new TextRun({ text: 'Statistiques', bold: true, size: 28, font: 'Helvetica' })],
            heading: HeadingLevel.HEADING_1
        }));
        [
            `Sessions totales : ${stats.totalSessions}`,
            `Serie en cours : ${stats.currentStreak} jours`,
            `Stress moyen avant : ${stats.avgStressBefore}`,
            `Stress moyen apres : ${stats.avgStressAfter}`,
            `Reduction stress : ${stats.avgStressReduction}`,
            `Exercice favori : ${stats.favoriteExercise || '-'}`
        ].forEach(line => {
            children.push(new Paragraph({
                children: [new TextRun({ text: line, size: 22, font: 'Helvetica' })],
                bullet: { level: 0 }
            }));
        });
        children.push(new Paragraph({ text: '' }));

        // Historique sessions
        if (sessionRows.length > 0) {
            children.push(new Paragraph({
                children: [new TextRun({ text: `Historique des Sessions (${recentSessions.length} dernieres)`, bold: true, size: 28, font: 'Helvetica' })],
                heading: HeadingLevel.HEADING_1
            }));
            children.push(new Table({
                rows: [headerRow, ...sessionRows],
                width: { size: 100, type: WidthType.PERCENTAGE }
            }));
            children.push(new Paragraph({ text: '' }));
        }

        // Objectifs
        if (this.goals) {
            children.push(new Paragraph({
                children: [new TextRun({ text: 'Objectifs', bold: true, size: 28, font: 'Helvetica' })],
                heading: HeadingLevel.HEADING_1
            }));
            children.push(new Paragraph({
                children: [new TextRun({ text: this.goals, size: 22, font: 'Helvetica' })]
            }));
            children.push(new Paragraph({ text: '' }));
        }

        // Footer
        children.push(new Paragraph({
            children: [new TextRun({
                text: `Genere par Jmee DeepBreath le ${exportDate}`,
                italics: true, color: '999999', size: 16, font: 'Helvetica'
            })],
            alignment: AlignmentType.CENTER
        }));

        const doc = new Document({
            sections: [{ children }]
        });

        Packer.toBlob(doc).then(blob => {
            this.downloadBlob(blob, `deepbreath-rapport-${new Date().toISOString().slice(0, 10)}.docx`);
            if (window.app) window.app.showToast('Rapport Word exporte');
        }).catch(() => {
            if (window.app) window.app.showToast('Erreur export Word', 'warning');
        });
    }

    // ==========================================
    //  IMPORT (dispatch JSON / Excel)
    // ==========================================

    importFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (ext === 'json') {
            this.importJSON(file);
        } else if (ext === 'xlsx') {
            this.importExcel(file);
        } else {
            if (window.app) window.app.showToast('Format non supporte (.json ou .xlsx)', 'warning');
        }
    }

    importJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.sessions && Array.isArray(data.sessions)) {
                    const existingIds = new Set(this.sessions.map(s => s.id));
                    const newSessions = data.sessions.filter(s => !existingIds.has(s.id));

                    this.sessions = [...this.sessions, ...newSessions];
                    this.sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
                    this.saveSessions();

                    if (data.goals && !this.goals) {
                        this.goals = data.goals;
                        localStorage.setItem('deepbreath_goals', this.goals);
                    }

                    if (data.profile && !this.profile.apneaLevel && !this.profile.staticMax) {
                        this.profile = { ...this.getDefaultProfile(), ...data.profile };
                        this.saveProfile();
                    }

                    this.updateStatsDisplay();
                    this.renderRecentSessions();
                    if (window.app) window.app.showToast(`${newSessions.length} session${newSessions.length > 1 ? 's' : ''} importee${newSessions.length > 1 ? 's' : ''}`);
                } else {
                    throw new Error('Format invalide');
                }
            } catch (err) {
                if (window.app) window.app.showToast('Fichier JSON invalide', 'warning');
            }
        };
        reader.readAsText(file);
    }

    importExcel(file) {
        if (typeof XLSX === 'undefined') {
            if (window.app) window.app.showToast('Librairie Excel non chargee', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array', cellDates: true });

                // Lire feuille Sessions
                const sessionsSheet = wb.Sheets['Sessions'] || wb.Sheets[wb.SheetNames[0]];
                if (!sessionsSheet) throw new Error('Aucune feuille Sessions');

                const rows = XLSX.utils.sheet_to_json(sessionsSheet);
                const importedSessions = rows.map(row => ({
                    id: row['ID'] || `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    date: row['Date'] instanceof Date
                        ? row['Date'].toISOString()
                        : (row['Date'] || new Date().toISOString()),
                    exerciseName: row['Exercice'] || '',
                    exerciseId: row['ID Exercice'] || '',
                    category: row['Categorie'] || '',
                    duration: parseFloat(row['Duree (s)']) || 0,
                    completed: row['Complete'] === 'Oui' || row['Complete'] === true,
                    stressBefore: row['Stress Avant'] != null && row['Stress Avant'] !== ''
                        ? parseInt(row['Stress Avant']) : null,
                    stressAfter: row['Stress Apres'] != null && row['Stress Apres'] !== ''
                        ? parseInt(row['Stress Apres']) : null,
                    feeling: row['Ressenti'] != null && row['Ressenti'] !== ''
                        ? parseInt(row['Ressenti']) : null,
                    notes: row['Notes'] || ''
                })).filter(s => s.exerciseName);

                // Deduplique par ID
                const existingIds = new Set(this.sessions.map(s => s.id));
                const newSessions = importedSessions.filter(s => !existingIds.has(s.id));

                this.sessions = [...this.sessions, ...newSessions];
                this.sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
                this.saveSessions();

                // Importer profil si present et profil actuel vide
                const profilSheet = wb.Sheets['Profil'];
                if (profilSheet && !this.profile.staticMax && !this.profile.apneaLevel) {
                    this.importProfileFromSheet(profilSheet);
                }

                this.updateStatsDisplay();
                this.renderRecentSessions();
                if (window.app) window.app.showToast(
                    `${newSessions.length} session${newSessions.length > 1 ? 's' : ''} importee${newSessions.length > 1 ? 's' : ''}`
                );
            } catch (err) {
                console.error('Import Excel:', err);
                if (window.app) window.app.showToast('Fichier Excel invalide', 'warning');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    importProfileFromSheet(sheet) {
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const map = {};
        rows.forEach(row => {
            if (row[0] && row[1] != null && row[1] !== '') map[row[0]] = row[1];
        });

        const fieldMap = {
            'Age': 'age', 'Taille (cm)': 'height', 'Poids (kg)': 'weight',
            'VO2max (ml/kg/min)': 'vo2max', 'FC Repos (bpm)': 'hrRest',
            'Statique max eau (s)': 'staticMax', 'Statique dry max (s)': 'staticDry',
            'Dynamique max (m)': 'dynMax', 'Profondeur max (m)': 'depthMax',
            '1ere contraction (s)': 'firstContraction', 'Niveau apnee': 'apneaLevel',
            'Sports': 'sports', 'Frequence (x/sem)': 'trainingFreq',
            'Etat actuel': 'currentState', 'Notes': 'notes'
        };

        for (const [label, key] of Object.entries(fieldMap)) {
            if (map[label] != null) this.profile[key] = map[label];
        }
        this.saveProfile();
    }

    // ==========================================
    //  HELPER : telechargement blob
    // ==========================================

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize after app.js
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.coach = new CoachAI();
    }, 100);
});
