/**
 * WeeklyPlan — Plan de semaine personnalisé par IA
 * Génère un programme 7 jours via Claude/OpenAI, avec lancement direct
 * des exercices et sauvegarde des ressentis dans le journal.
 */

class WeeklyPlan {
    constructor() {
        this.data = this.load();       // { plans: [], currentPlanId: null }
        this.viewingPlanId = null;     // plan actuellement affiché
        this.isGenerating = false;
        this._noteDebounceTimers = {}; // timers debounce par dayIndex
    }

    // ─────────────────────────────────────────────
    // STORAGE
    // ─────────────────────────────────────────────

    load() {
        try {
            const raw = localStorage.getItem('deepbreath_weekly_plan');
            if (raw) {
                const parsed = JSON.parse(raw);
                return { plans: parsed.plans || [], currentPlanId: parsed.currentPlanId || null };
            }
        } catch (e) { console.warn('WeeklyPlan: load error', e); }
        return { plans: [], currentPlanId: null };
    }

    save() {
        try {
            localStorage.setItem('deepbreath_weekly_plan', JSON.stringify(this.data));
        } catch (e) { console.warn('WeeklyPlan: save error', e); }
    }

    loadCoachSettings() {
        try {
            const raw = localStorage.getItem('deepbreath_coach_settings');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { provider: 'claude', apiKey: '', model: 'claude-sonnet-4-20250514' };
    }

    // ─────────────────────────────────────────────
    // WEEK UTILS
    // ─────────────────────────────────────────────

    getMondayOfCurrentWeek() {
        const today = new Date();
        const day = today.getDay(); // 0=dim, 1=lun…
        const diff = (day === 0) ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diff);
        return monday.toISOString().slice(0, 10);
    }

    getWeekDates(mondayStr) {
        const dates = [];
        const monday = new Date(mondayStr + 'T12:00:00'); // midi pour éviter DST
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d.toISOString().slice(0, 10));
        }
        return dates;
    }

    getMondayOfPlan(plan) {
        return plan ? plan.weekStart : this.getMondayOfCurrentWeek();
    }

    // ─────────────────────────────────────────────
    // DATA ACCESS
    // ─────────────────────────────────────────────

    getCurrentPlan() {
        if (!this.data.currentPlanId) return null;
        return this.data.plans.find(p => p.id === this.data.currentPlanId) || null;
    }

    getViewingPlan() {
        if (!this.viewingPlanId) return this.getCurrentPlan();
        return this.data.plans.find(p => p.id === this.viewingPlanId) || this.getCurrentPlan();
    }

    getPlanById(id) {
        return this.data.plans.find(p => p.id === id) || null;
    }

    getPlanForWeek(mondayStr) {
        return this.data.plans.find(p => p.weekStart === mondayStr) || null;
    }

    // ─────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────

    isExerciseDone(dayDate, exerciseId) {
        try {
            const sessions = JSON.parse(localStorage.getItem('deepbreath_sessions') || '[]');
            return sessions.some(s =>
                s.date && s.date.slice(0, 10) === dayDate &&
                s.exerciseId === exerciseId
            );
        } catch (e) { return false; }
    }

    getExerciseStatus(dayDate, exerciseId) {
        const today = new Date().toISOString().slice(0, 10);
        const done = this.isExerciseDone(dayDate, exerciseId);
        if (done) return 'done';
        if (dayDate < today) return 'missed';
        return 'todo';
    }

    refreshExerciseStatuses() {
        const plan = this.getViewingPlan();
        if (!plan) return;
        plan.days.forEach(day => {
            day.exercises.forEach(exercise => {
                const item = document.querySelector(
                    `#weekGrid .plan-exercise-item[data-exercise-id="${exercise.exerciseId}"][data-day-date="${day.date}"]`
                );
                if (!item) return;
                const status = this.getExerciseStatus(day.date, exercise.exerciseId);
                item.className = `plan-exercise-item status-${status}`;
                this._updateExerciseItemDOM(item, status);
            });
        });
    }

    _updateExerciseItemDOM(item, status) {
        const iconEl = item.querySelector('.plan-exercise-status-icon');
        const btn = item.querySelector('.btn-start-exercise');
        if (iconEl) iconEl.innerHTML = this._statusIcon(status);
        if (btn) {
            if (status === 'done') {
                btn.textContent = 'Refaire';
                btn.classList.add('btn-redo');
            } else {
                btn.textContent = 'Démarrer';
                btn.classList.remove('btn-redo');
            }
        }
    }

    _statusIcon(status) {
        if (status === 'done') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polyline points="20,6 9,17 4,12"/></svg>`;
        }
        if (status === 'missed') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        }
        // todo
        return `<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><circle cx="12" cy="12" r="6"/></svg>`;
    }

    // ─────────────────────────────────────────────
    // AI GENERATION
    // ─────────────────────────────────────────────

    async generatePlan() {
        if (this.isGenerating) return;

        const coachSettings = this.loadCoachSettings();
        if (!coachSettings.apiKey || coachSettings.apiKey.trim() === '') {
            // Afficher l'état "no API key" sans rediriger — rester sur la section Plan
            this._showNoApiKeyState();
            return;
        }
        if (!navigator.onLine) {
            window.app?.showToast('Connexion requise pour générer un plan', 'warning');
            return;
        }

        this.isGenerating = true;
        this._showLoading(true);

        try {
            const userMessage = this.buildGenerationPrompt();
            const systemPrompt = `Tu es un coach spécialisé en apnée et entraînement respiratoire au sec. Tu tutoies l'élève. Direct, concret, expert en tables CO2/O2, tolérance, breathe-up, relaxation. Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour.`;

            let result;
            if (coachSettings.provider === 'openai') {
                result = await this.callOpenAIRaw(systemPrompt, userMessage, coachSettings);
            } else {
                result = await this.callClaudeRaw(systemPrompt, userMessage, coachSettings);
            }

            const aiData = this.parseAIResponse(result.text);
            const mondayStr = this.getMondayOfCurrentWeek();
            const weekDates = this.getWeekDates(mondayStr);
            const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

            const plan = {
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                weekStart: mondayStr,
                weekEnd: weekDates[6],
                title: aiData.title || 'Plan Semaine',
                aiRationale: aiData.rationale || '',
                days: aiData.days.map((day, i) => ({
                    dayIndex: i,
                    date: weekDates[i],
                    label: dayLabels[i],
                    exercises: day.exercises || [],
                    notes: '',
                    notesUpdatedAt: null
                }))
            };

            // Conserver les notes existantes si le plan de la même semaine est régénéré
            const existingPlan = this.getPlanForWeek(mondayStr);
            if (existingPlan) {
                plan.days.forEach((day, i) => {
                    if (existingPlan.days[i]) {
                        day.notes = existingPlan.days[i].notes || '';
                        day.notesUpdatedAt = existingPlan.days[i].notesUpdatedAt || null;
                    }
                });
                this.data.plans = this.data.plans.filter(p => p.weekStart !== mondayStr);
            }

            this.data.plans.push(plan);
            if (this.data.plans.length > 10) {
                this.data.plans = this.data.plans.slice(-10);
            }
            this.data.currentPlanId = plan.id;
            this.viewingPlanId = plan.id;
            this.save();

            this.isGenerating = false;
            this._showLoading(false);
            this.render();
            window.app?.showToast('Plan généré !');

        } catch (e) {
            this.isGenerating = false;
            this._showLoading(false);
            console.error('WeeklyPlan: generation failed', e);
            this.render();
            window.app?.showToast('Erreur génération : ' + e.message, 'warning');
        }
    }

    buildGenerationPrompt() {
        const exercises = window.EXERCISES || {};
        const settings = window.app ? window.app.settings : {};
        const apneaMax = settings.apneaMax || 120;
        const apneaMin = Math.floor(apneaMax / 60);
        const apneaSec = apneaMax % 60;
        const apneaFormatted = apneaMin > 0
            ? `${apneaMin}min ${apneaSec > 0 ? apneaSec + 's' : ''}`.trim()
            : `${apneaSec}s`;

        const profile = (window.coach && typeof window.coach.buildProfileSummary === 'function')
            ? window.coach.buildProfileSummary()
            : 'Profil non renseigné.';

        const goals = localStorage.getItem('deepbreath_goals') || 'Non définis.';

        const sessions = JSON.parse(localStorage.getItem('deepbreath_sessions') || '[]');
        const recentSessions = sessions.slice(-30).map(s =>
            `${s.date?.slice(0, 10) || '?'} | ${s.exerciseName || '?'} (${s.category || '?'}) | ${Math.floor((s.duration || 0) / 60)}min | Ressenti:${s.feeling || '?'}/5`
        ).join('\n') || 'Aucune session enregistrée.';

        // Catalogue : uniquement les exercices qui ont un id valide (pas urgence/quick)
        const excludedCategories = ['urgence'];
        const catalog = Object.entries(exercises)
            .filter(([id, ex]) => !excludedCategories.includes(ex.category))
            .map(([id, ex]) => `${id} | ${ex.name} | ${ex.category || 'general'} | ${ex.duration || '?'}min`)
            .join('\n');

        const mondayStr = this.getMondayOfCurrentWeek();
        const weekDates = this.getWeekDates(mondayStr);
        const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        const datesLine = dayLabels.map((label, i) => `${label}: ${weekDates[i]}`).join(', ');

        return `Génère un plan d'entraînement pour la semaine du ${mondayStr}.

## Profil de l'élève
${profile}

## Objectifs
${goals}

## Apnée max actuelle
${apneaFormatted} (${apneaMax} secondes)

## Historique récent (30 dernières sessions)
${recentSessions}

## Exercices disponibles dans l'app
Format: exerciseId | Nom | catégorie | durée estimée
${catalog}

## Dates de la semaine
${datesLine}

## Consignes
- 1 à 3 exercices par jour maximum
- Respecte la progressivité (échauffement/respiration avant tables, CO2 avant O2)
- Inclus des jours de repos si nécessaire (dimanche au moins)
- Adapte en fonction de l'historique et du niveau
- Mets les exercices dans l'ordre logique de la séance (éveil respiratoire → travail principal → récupération)

## Format de réponse (JSON strict, sans markdown)
{
  "title": "Titre court du programme (ex: Semaine CO2 progressive)",
  "rationale": "Explication 2-3 phrases : pourquoi ce plan maintenant, quelle progression.",
  "days": [
    { "dayIndex": 0, "exercises": [{ "exerciseId": "...", "estimatedDuration": 10 }] },
    { "dayIndex": 1, "exercises": [] }
  ]
}

Règles : exerciseId = exactement les IDs de la liste ci-dessus. exercises=[] pour un jour de repos. Le tableau days contient EXACTEMENT 7 objets avec dayIndex 0 à 6.`;
    }

    parseAIResponse(text) {
        // Nettoyer fences markdown éventuelles
        let clean = text.trim();
        const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenceMatch) clean = fenceMatch[1].trim();

        // Essayer d'extraire un objet JSON si du texte parasite est présent
        if (!clean.startsWith('{')) {
            const jsonMatch = clean.match(/\{[\s\S]*\}/);
            if (jsonMatch) clean = jsonMatch[0];
        }

        let parsed;
        try {
            parsed = JSON.parse(clean);
        } catch (e) {
            throw new Error('Réponse IA non lisible — réessaie');
        }

        if (!parsed.days || !Array.isArray(parsed.days)) {
            throw new Error('Structure du plan invalide (pas de tableau days)');
        }

        // Tolérer moins de 7 jours : compléter avec des jours vides
        while (parsed.days.length < 7) {
            parsed.days.push({ dayIndex: parsed.days.length, exercises: [] });
        }

        // Valider et nettoyer les exerciseIds
        const knownExercises = window.EXERCISES || {};
        parsed.days = parsed.days.slice(0, 7).map((day, i) => ({
            dayIndex: i,
            exercises: (day.exercises || [])
                .filter(ex => {
                    if (!ex.exerciseId) return false;
                    if (!knownExercises[ex.exerciseId]) {
                        console.warn(`WeeklyPlan: exerciseId inconnu "${ex.exerciseId}" ignoré`);
                        return false;
                    }
                    return true;
                })
                .map((ex, order) => ({
                    exerciseId: ex.exerciseId,
                    exerciseName: knownExercises[ex.exerciseId].name,
                    estimatedDuration: ex.estimatedDuration || knownExercises[ex.exerciseId].duration || 10,
                    order
                }))
        }));

        return parsed;
    }

    async callClaudeRaw(systemPrompt, userMessage, settings) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                signal: controller.signal,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: settings.model || 'claude-sonnet-4-20250514',
                    max_tokens: 2048,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userMessage }]
                })
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `Erreur API ${response.status}`);
            }
            const data = await response.json();
            const text = data.content?.[0]?.text;
            if (!text) throw new Error('Réponse vide de Claude');
            return { text };
        } catch (e) {
            clearTimeout(timeout);
            if (e.name === 'AbortError') throw new Error('Timeout — réessaie');
            throw e;
        }
    }

    async callOpenAIRaw(systemPrompt, userMessage, settings) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                signal: controller.signal,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model || 'gpt-4o-mini',
                    max_tokens: 2048,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ]
                })
            });
            clearTimeout(timeout);
            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error?.message || `Erreur API ${response.status}`);
            }
            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) throw new Error('Réponse vide de l\'API');
            return { text };
        } catch (e) {
            clearTimeout(timeout);
            if (e.name === 'AbortError') throw new Error('Timeout — réessaie');
            throw e;
        }
    }

    // ─────────────────────────────────────────────
    // NOTES → JOURNAL
    // ─────────────────────────────────────────────

    saveNote(planId, dayIndex, noteText) {
        const plan = this.getPlanById(planId);
        if (!plan || !plan.days[dayIndex]) return;

        plan.days[dayIndex].notes = noteText;
        plan.days[dayIndex].notesUpdatedAt = new Date().toISOString();
        this.save();

        if (noteText.trim()) {
            this.pushNoteToJournal(plan.days[dayIndex].date, noteText);
        }
    }

    pushNoteToJournal(dateStr, noteText) {
        try {
            const sessions = JSON.parse(localStorage.getItem('deepbreath_sessions') || '[]');
            const dayLabel = `[Plan Semaine] ${noteText}`;
            let modified = false;

            sessions.forEach(s => {
                if (!s.date || s.date.slice(0, 10) !== dateStr) return;
                const existing = s.notes || '';
                // Éviter les doublons
                if (!existing.includes(noteText.trim())) {
                    s.notes = existing ? `${existing}\n${dayLabel}` : dayLabel;
                    modified = true;
                }
            });

            if (modified) {
                localStorage.setItem('deepbreath_sessions', JSON.stringify(sessions));
                if (window.coach) {
                    window.coach.sessions = sessions;
                    window.coach.renderRecentSessions?.();
                }
                if (window.journal) window.journal.render?.();
            }
        } catch (e) {
            console.warn('WeeklyPlan: pushNoteToJournal error', e);
        }
    }

    onSessionSaved(session) {
        // Quand une session est sauvegardée, vérifier si on a une note pour ce jour
        // et la pousser dans le journal si ce n'est pas encore fait
        const plan = this.getCurrentPlan();
        if (!plan || !session.date) return;

        const sessionDate = session.date.slice(0, 10);
        const day = plan.days.find(d => d.date === sessionDate);
        if (day && day.notes && day.notes.trim()) {
            this.pushNoteToJournal(sessionDate, day.notes);
        }
    }

    _showNoApiKeyState() {
        const emptyEl = document.getElementById('planEmpty');
        const loading = document.getElementById('planLoading');
        const grid = document.getElementById('weekGrid');
        const rationale = document.getElementById('planRationale');

        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'none';
        if (rationale) rationale.style.display = 'none';
        if (emptyEl) {
            emptyEl.style.display = 'flex';
            emptyEl.innerHTML = `
                <div class="plan-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" width="56" height="56">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <h3>Clé API manquante</h3>
                <p>Pour générer un plan personnalisé, configure ta clé API dans la section <strong>Coach IA</strong>.</p>
                <p class="plan-empty-hint">
                    1. Va dans l'onglet <strong>Coach</strong> dans la navigation<br>
                    2. Clique sur <strong>⚙ Réglages du Coach</strong><br>
                    3. Entre ta clé API Claude ou OpenAI<br>
                    4. Reviens ici et clique <strong>Générer un plan</strong>
                </p>
                <button class="btn-generate-plan" style="margin-top:var(--space-md)" onclick="document.querySelector('[data-section=coach]')?.click()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Aller dans le Coach IA
                </button>`;
        }
    }

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    render() {
        const plan = this.getViewingPlan();
        this._renderWeekLabel(plan);
        this._renderNavButtons(plan);

        if (this.isGenerating) {
            this._showState('loading');
            return;
        }

        if (!plan) {
            this._showState('empty');
            return;
        }

        this._showState('grid');
        this._renderRationale(plan);
        this._renderWeekGrid(plan);
        this._bindExerciseButtons();
        this._bindNotesSaving(plan);
    }

    _showState(state) {
        const loading = document.getElementById('planLoading');
        const empty = document.getElementById('planEmpty');
        const grid = document.getElementById('weekGrid');
        const rationale = document.getElementById('planRationale');

        if (loading) loading.style.display = (state === 'loading') ? 'flex' : 'none';
        if (empty) empty.style.display = (state === 'empty') ? 'flex' : 'none';
        if (grid) grid.style.display = (state === 'grid') ? 'grid' : 'none';
        if (rationale) rationale.style.display = (state === 'grid') ? 'block' : 'none';
    }

    _showLoading(show) {
        const loading = document.getElementById('planLoading');
        const empty = document.getElementById('planEmpty');
        const grid = document.getElementById('weekGrid');
        const rationale = document.getElementById('planRationale');
        const btn = document.getElementById('btnGeneratePlan');

        if (show) {
            if (loading) loading.style.display = 'flex';
            if (empty) empty.style.display = 'none';
            if (grid) grid.style.display = 'none';
            if (rationale) rationale.style.display = 'none';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="animation:spin 0.8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Génération en cours…`;
            }
        } else {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg> Générer un plan`;
            }
        }
    }

    _renderRationale(plan) {
        const rationaleEl = document.getElementById('planRationaleText');
        if (rationaleEl && plan.aiRationale) {
            rationaleEl.textContent = plan.aiRationale;
        }

        // Titre du plan
        const titleEl = document.getElementById('planTitle');
        if (titleEl && plan.title) {
            titleEl.textContent = plan.title;
        }
    }

    _renderWeekLabel(plan) {
        const labelEl = document.getElementById('planWeekLabel');
        if (!labelEl) return;

        if (plan) {
            const start = this._formatDateMedium(plan.weekStart);
            const end = this._formatDateMedium(plan.weekEnd);
            labelEl.textContent = `${start} – ${end}`;
        } else {
            const monday = this.getMondayOfCurrentWeek();
            const weekDates = this.getWeekDates(monday);
            labelEl.textContent = `${this._formatDateMedium(monday)} – ${this._formatDateMedium(weekDates[6])}`;
        }
    }

    _renderNavButtons(plan) {
        const prevBtn = document.getElementById('planPrevWeek');
        const nextBtn = document.getElementById('planNextWeek');
        if (!prevBtn || !nextBtn) return;

        const plans = this.data.plans;
        const viewingIdx = plan ? plans.findIndex(p => p.id === plan.id) : -1;

        prevBtn.disabled = viewingIdx <= 0;
        nextBtn.disabled = viewingIdx >= plans.length - 1 || viewingIdx === -1;
    }

    _renderWeekGrid(plan) {
        const grid = document.getElementById('weekGrid');
        if (!grid) return;

        const today = new Date().toISOString().slice(0, 10);
        grid.innerHTML = plan.days.map(day => this._renderDayCard(day, today)).join('');

        // Scroll vers aujourd'hui sur mobile
        const todayCard = grid.querySelector('.day-card.today');
        if (todayCard) {
            setTimeout(() => {
                todayCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }, 100);
        }
    }

    _renderDayCard(day, today) {
        const isToday = day.date === today;
        const isPast = day.date < today;
        const dayClass = isToday ? 'today' : isPast ? 'past' : 'future';

        const exercisesHTML = day.exercises.length > 0
            ? day.exercises.map(ex => this._renderExerciseItem(ex, day.date)).join('')
            : `<div class="plan-rest-day">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4l3 3"/></svg>
                Repos
               </div>`;

        const todayBadgeHTML = isToday
            ? `<div class="today-badge">Aujourd'hui</div>`
            : '';

        return `
        <div class="day-card ${dayClass}" data-day-index="${day.dayIndex}" data-date="${day.date}">
            <div class="day-card-header">
                <div class="day-name">${this.escapeHtml(day.label)}</div>
                <div class="day-date">${this._formatDateShort(day.date)}</div>
                ${todayBadgeHTML}
            </div>
            <div class="day-exercises">
                ${exercisesHTML}
            </div>
            <div class="day-notes-area">
                <textarea class="day-notes-input"
                    placeholder="Ressentis du jour…"
                    data-day-index="${day.dayIndex}"
                    rows="2">${this.escapeHtml(day.notes || '')}</textarea>
            </div>
        </div>`;
    }

    _renderExerciseItem(exercise, dayDate) {
        const status = this.getExerciseStatus(dayDate, exercise.exerciseId);
        const statusIcon = this._statusIcon(status);
        const btnLabel = status === 'done' ? 'Refaire' : 'Démarrer';
        const btnClass = status === 'done' ? 'btn-start-exercise btn-redo' : 'btn-start-exercise';
        const durationLabel = exercise.estimatedDuration ? `${exercise.estimatedDuration} min` : '';

        return `
        <div class="plan-exercise-item status-${status}"
             data-exercise-id="${this.escapeHtml(exercise.exerciseId)}"
             data-day-date="${dayDate}">
            <div class="plan-exercise-info">
                <span class="plan-exercise-name">${this.escapeHtml(exercise.exerciseName)}</span>
                ${durationLabel ? `<span class="plan-exercise-duration">${durationLabel}</span>` : ''}
            </div>
            <div class="plan-exercise-actions">
                <span class="plan-exercise-status-icon">${statusIcon}</span>
                <button class="${btnClass}" data-exercise-id="${this.escapeHtml(exercise.exerciseId)}">
                    ${btnLabel}
                </button>
            </div>
        </div>`;
    }

    // ─────────────────────────────────────────────
    // EVENT SETUP
    // ─────────────────────────────────────────────

    init() {
        // S'assurer que le plan affiché correspond à la semaine courante si possible
        const currentWeekPlan = this.getPlanForWeek(this.getMondayOfCurrentWeek());
        if (currentWeekPlan) {
            this.data.currentPlanId = currentWeekPlan.id;
            this.viewingPlanId = currentWeekPlan.id;
        } else if (this.data.plans.length > 0) {
            // Afficher le plan le plus récent
            const latest = this.data.plans[this.data.plans.length - 1];
            this.viewingPlanId = latest.id;
        }

        this._setupGenerateButton();
        this._setupWeekNavigation();
        this.render();
    }

    _setupGenerateButton() {
        const btn = document.getElementById('btnGeneratePlan');
        if (btn) {
            btn.addEventListener('click', () => this.generatePlan());
        }
    }

    _setupWeekNavigation() {
        const prevBtn = document.getElementById('planPrevWeek');
        const nextBtn = document.getElementById('planNextWeek');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const plans = this.data.plans;
                const viewingIdx = plans.findIndex(p => p.id === this.viewingPlanId);
                if (viewingIdx > 0) {
                    this.viewingPlanId = plans[viewingIdx - 1].id;
                    this.render();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const plans = this.data.plans;
                const viewingIdx = plans.findIndex(p => p.id === this.viewingPlanId);
                if (viewingIdx >= 0 && viewingIdx < plans.length - 1) {
                    this.viewingPlanId = plans[viewingIdx + 1].id;
                    this.render();
                }
            });
        }
    }

    _bindExerciseButtons() {
        const grid = document.getElementById('weekGrid');
        if (!grid) return;

        grid.querySelectorAll('.btn-start-exercise').forEach(btn => {
            btn.addEventListener('click', () => {
                const exerciseId = btn.dataset.exerciseId;
                if (exerciseId && window.app) {
                    window.app.startExercise(exerciseId);
                }
            });
        });
    }

    _bindNotesSaving(plan) {
        const grid = document.getElementById('weekGrid');
        if (!grid || !plan) return;

        grid.querySelectorAll('.day-notes-input').forEach(textarea => {
            textarea.addEventListener('input', () => {
                const dayIndex = parseInt(textarea.dataset.dayIndex);
                if (isNaN(dayIndex)) return;

                // Debounce 600ms
                if (this._noteDebounceTimers[dayIndex]) {
                    clearTimeout(this._noteDebounceTimers[dayIndex]);
                }
                this._noteDebounceTimers[dayIndex] = setTimeout(() => {
                    this.saveNote(plan.id, dayIndex, textarea.value);
                    delete this._noteDebounceTimers[dayIndex];
                }, 600);
            });
        });
    }

    // ─────────────────────────────────────────────
    // UTILS
    // ─────────────────────────────────────────────

    generateId() {
        return 'plan_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    }

    escapeHtml(text) {
        if (typeof text !== 'string') return String(text || '');
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    _formatDateShort(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr + 'T12:00:00');
            return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } catch (e) { return dateStr; }
    }

    _formatDateMedium(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr + 'T12:00:00');
            return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } catch (e) { return dateStr; }
    }
}

// ─────────────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────────────
// Initialisé par app.js via initWeeklyPlan()
// Le CSS pour @keyframes spin est dans styles.css
