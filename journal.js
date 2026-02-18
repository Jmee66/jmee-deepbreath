/**
 * Journal View — Spreadsheet-like training log
 * Displays all sessions in an editable table
 */

class JournalView {
    constructor() {
        this.sortColumn = 'date';
        this.sortDirection = 'desc';
        this.filterQuery = '';
        this.editingCell = null;
    }

    init() {
        this.tbody = document.getElementById('journalBody');
        this.countEl = document.getElementById('journalCount');
        this.searchInput = document.getElementById('journalSearch');
        this.addBtn = document.getElementById('journalAddBtn');

        if (!this.tbody) return;

        // Sort on header click
        document.querySelectorAll('.journal-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => this.sortBy(th.dataset.sort));
        });

        // Search / filter
        this.searchInput?.addEventListener('input', (e) => {
            this.filterQuery = e.target.value.trim().toLowerCase();
            this.render();
        });

        // Add session
        this.addBtn?.addEventListener('click', () => this.addSession());

        // Export Excel
        document.getElementById('journalExportBtn')?.addEventListener('click', () => {
            if (window.coach && typeof window.coach.exportExcel === 'function') {
                window.coach.exportExcel();
            } else {
                alert('Export non disponible. Assurez-vous que la bibliothèque XLSX est chargée.');
            }
        });

        // Repair sessions with missing/zero durations from detailed data
        this.repairDurations();

        // Initial render
        this.render();
    }

    // ==========================================
    // Data access
    // ==========================================

    getSessions() {
        return window.coach?.sessions || [];
    }

    // ==========================================
    // Render
    // ==========================================

    render() {
        if (!this.tbody) return;

        let sessions = [...this.getSessions()];

        // Filter
        if (this.filterQuery) {
            sessions = sessions.filter(s => {
                const text = [
                    s.exerciseName || '',
                    s.category || '',
                    s.notes || '',
                    this.formatDate(s.date)
                ].join(' ').toLowerCase();
                return text.includes(this.filterQuery);
            });
        }

        // Sort
        sessions.sort((a, b) => {
            let valA = a[this.sortColumn];
            let valB = b[this.sortColumn];

            // Handle nulls
            if (valA == null) valA = '';
            if (valB == null) valB = '';

            // Numeric fields
            if (['duration', 'feeling', 'stressBefore', 'stressAfter'].includes(this.sortColumn)) {
                valA = Number(valA) || 0;
                valB = Number(valB) || 0;
            }

            // Date field
            if (this.sortColumn === 'date') {
                valA = new Date(valA).getTime() || 0;
                valB = new Date(valB).getTime() || 0;
            }

            // String comparison
            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = (valB || '').toLowerCase();
            }

            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Update count
        if (this.countEl) {
            const total = this.getSessions().length;
            const shown = sessions.length;
            this.countEl.textContent = this.filterQuery
                ? `${shown} / ${total} sessions`
                : `${total} session${total !== 1 ? 's' : ''}`;
        }

        // Update sort indicators in headers
        document.querySelectorAll('.journal-table th[data-sort]').forEach(th => {
            const col = th.dataset.sort;
            const label = th.textContent.replace(/\s*[↕↑↓]\s*$/, '').trim();
            if (col === this.sortColumn) {
                th.textContent = `${label} ${this.sortDirection === 'asc' ? '↑' : '↓'}`;
                th.classList.add('sorted');
            } else {
                th.textContent = `${label} ↕`;
                th.classList.remove('sorted');
            }
        });

        // Render rows
        this.tbody.innerHTML = '';

        if (sessions.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyTd = document.createElement('td');
            emptyTd.colSpan = 9;
            emptyTd.className = 'journal-empty';
            emptyTd.textContent = this.filterQuery ? 'Aucun resultat' : 'Aucune session enregistree. Cliquez "+ Ajouter" pour commencer.';
            emptyRow.appendChild(emptyTd);
            this.tbody.appendChild(emptyRow);
            return;
        }

        sessions.forEach(session => {
            this.tbody.appendChild(this.renderRow(session));
        });
    }

    renderRow(session) {
        const tr = document.createElement('tr');
        tr.dataset.id = session.id;
        tr.classList.add('journal-row-clickable');

        // Row click → open edit modal
        tr.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('.journal-actions') ||
                target.tagName === 'INPUT' ||
                target.tagName === 'SELECT' ||
                target.tagName === 'BUTTON' ||
                target.closest('.journal-cell.editing')) {
                return;
            }
            this.editNotes(session.id);
        });

        // Date
        const tdDate = this.createCell(session, 'date', this.formatDate(session.date));
        tr.appendChild(tdDate);

        // Exercise name
        const tdExercise = this.createCell(session, 'exerciseName', session.exerciseName || '—');
        tr.appendChild(tdExercise);

        // Category
        const tdCategory = this.createCell(session, 'category', this.formatCategory(session.category));
        tr.appendChild(tdCategory);

        // Duration (display in min:sec)
        const tdDuration = this.createCell(session, 'duration', this.formatDuration(session.duration));
        tr.appendChild(tdDuration);

        // Feeling (hidden on mobile)
        const tdFeeling = this.createCell(session, 'feeling', session.feeling ? `${session.feeling}/5` : '—');
        tdFeeling.classList.add('journal-col-hide');
        tr.appendChild(tdFeeling);

        // Stress Before (hidden on mobile)
        const tdStressBefore = this.createCell(session, 'stressBefore', session.stressBefore ? `${session.stressBefore}/5` : '—');
        tdStressBefore.classList.add('journal-col-hide');
        tr.appendChild(tdStressBefore);

        // Stress After (hidden on mobile)
        const tdStressAfter = this.createCell(session, 'stressAfter', session.stressAfter ? `${session.stressAfter}/5` : '—');
        tdStressAfter.classList.add('journal-col-hide');
        tr.appendChild(tdStressAfter);

        // Notes (hidden on mobile)
        const tdNotes = this.createCell(session, 'notes', session.notes || '—');
        tdNotes.classList.add('journal-col-hide');
        if (session.notes && session.notes.length > 30) {
            tdNotes.title = session.notes;
            tdNotes.querySelector('.journal-cell-text').textContent = session.notes.substring(0, 30) + '...';
        }
        tr.appendChild(tdNotes);

        // Actions
        const tdActions = document.createElement('td');
        tdActions.className = 'journal-actions';
        tdActions.innerHTML = `
            <button class="journal-btn-edit" title="Notes">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            </button>
            <button class="journal-btn-delete" title="Supprimer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
            </button>`;
        tdActions.querySelector('.journal-btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            this.editNotes(session.id);
        });
        tdActions.querySelector('.journal-btn-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSession(session.id);
        });
        tr.appendChild(tdActions);

        return tr;
    }

    createCell(session, field, displayValue) {
        const td = document.createElement('td');
        td.className = 'journal-cell';
        td.dataset.field = field;
        const span = document.createElement('span');
        span.className = 'journal-cell-text';
        span.textContent = displayValue;
        td.appendChild(span);
        // Double-click to edit inline (single click opens detail)
        td.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.startEdit(td, session.id, field);
        });
        return td;
    }

    // ==========================================
    // Inline editing
    // ==========================================

    startEdit(td, sessionId, field) {
        // Don't re-enter edit mode
        if (td.classList.contains('editing')) return;

        // Close any other editing cell
        this.cancelEdit();

        const session = this.getSessions().find(s => s.id === sessionId);
        if (!session) return;

        td.classList.add('editing');
        this.editingCell = td;

        let input;

        switch (field) {
            case 'date':
                input = document.createElement('input');
                input.type = 'date';
                input.value = session.date ? new Date(session.date).toISOString().split('T')[0] : '';
                break;

            case 'exerciseName':
                input = document.createElement('input');
                input.type = 'text';
                input.value = session.exerciseName || '';
                input.placeholder = 'Nom de l\'exercice';
                break;

            case 'category':
                input = document.createElement('select');
                const categories = [
                    { value: 'respiration', label: 'Respiration' },
                    { value: 'apnea', label: 'Apnee' },
                    { value: 'visualisation', label: 'Visualisation' },
                    { value: 'autre', label: 'Autre' }
                ];
                categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat.value;
                    opt.textContent = cat.label;
                    if (session.category === cat.value) opt.selected = true;
                    input.appendChild(opt);
                });
                break;

            case 'duration':
                input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.step = '1';
                input.value = session.duration ? Math.round(session.duration / 60) : '';
                input.placeholder = 'Minutes';
                break;

            case 'feeling':
            case 'stressBefore':
            case 'stressAfter':
                input = document.createElement('select');
                const emptyOpt = document.createElement('option');
                emptyOpt.value = '';
                emptyOpt.textContent = '—';
                input.appendChild(emptyOpt);
                for (let i = 1; i <= 5; i++) {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = `${i}/5`;
                    if (session[field] === i) opt.selected = true;
                    input.appendChild(opt);
                }
                break;

            case 'notes':
                input = document.createElement('input');
                input.type = 'text';
                input.value = session.notes || '';
                input.placeholder = 'Notes...';
                break;

            default:
                return;
        }

        input.className = 'journal-cell-input';
        td.innerHTML = '';
        td.appendChild(input);
        input.focus();

        // Save on Enter
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveEdit(sessionId, field, input.value);
            }
            if (e.key === 'Escape') {
                this.cancelEdit();
                this.render();
            }
        });

        // Save on blur (with small delay for click events)
        input.addEventListener('blur', () => {
            setTimeout(() => {
                if (td.classList.contains('editing')) {
                    this.saveEdit(sessionId, field, input.value);
                }
            }, 150);
        });

        // For select, save immediately on change
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', () => {
                this.saveEdit(sessionId, field, input.value);
            });
        }
    }

    saveEdit(sessionId, field, value) {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Parse value based on field
        switch (field) {
            case 'date':
                if (value) {
                    session.date = new Date(value).toISOString();
                }
                break;
            case 'duration':
                session.duration = Math.round((parseFloat(value) || 0) * 60); // min → sec
                break;
            case 'feeling':
            case 'stressBefore':
            case 'stressAfter':
                session[field] = value ? parseInt(value) : null;
                break;
            case 'exerciseName':
            case 'category':
            case 'notes':
                session[field] = value;
                break;
        }

        // Save to localStorage
        if (window.coach) {
            window.coach.saveSessions();
            window.coach.renderRecentSessions();
            window.coach.updateStatsDisplay();
        }

        this.editingCell = null;
        this.render();
    }

    cancelEdit() {
        if (this.editingCell) {
            this.editingCell.classList.remove('editing');
            this.editingCell = null;
            this.render();
        }
    }

    // ==========================================
    // Edit notes (mobile-friendly)
    // ==========================================

    editNotes(sessionId) {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Build modal
        const overlay = document.createElement('div');
        overlay.className = 'journal-edit-overlay';

        const stressOptions = (val) => [1,2,3,4,5].map(n =>
            `<option value="${n}"${val == n ? ' selected' : ''}>${n}/5</option>`
        ).join('');

        const categoryOptions = [
            { value: 'respiration', label: 'Respiration' },
            { value: 'apnea', label: 'Apnée' },
            { value: 'visualisation', label: 'Visualisation' },
            { value: 'autre', label: 'Autre' }
        ].map(c => `<option value="${c.value}"${session.category === c.value ? ' selected' : ''}>${c.label}</option>`).join('');

        const dateVal = session.date ? new Date(session.date).toISOString().split('T')[0] : '';
        const durationMin = session.duration ? Math.floor(session.duration / 60) : 0;
        const durationSec = session.duration ? session.duration % 60 : 0;

        overlay.innerHTML = `
            <div class="journal-edit-modal">
                <div class="journal-edit-header">
                    <h3>Modifier la session</h3>
                    <button class="journal-edit-close">&times;</button>
                </div>
                <div class="journal-edit-body">
                    <div class="journal-edit-row">
                        <label>Date</label>
                        <input type="date" id="jeDate" value="${dateVal}">
                    </div>
                    <div class="journal-edit-row">
                        <label>Exercice</label>
                        <input type="text" id="jeName" value="${(session.exerciseName || '').replace(/"/g, '&quot;')}" placeholder="Nom de l'exercice">
                    </div>
                    <div class="journal-edit-row">
                        <label>Catégorie</label>
                        <select id="jeCategory">${categoryOptions}</select>
                    </div>
                    <div class="journal-edit-row">
                        <label>Durée</label>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input type="number" id="jeDurationMin" min="0" value="${durationMin}" style="width:70px;"> min
                            <input type="number" id="jeDurationSec" min="0" max="59" value="${durationSec}" style="width:70px;"> sec
                        </div>
                    </div>
                    <div class="journal-edit-row">
                        <label>Ressenti</label>
                        <select id="jeFeeling">
                            <option value="">—</option>
                            ${stressOptions(session.feeling)}
                        </select>
                    </div>
                    <div class="journal-edit-row">
                        <label>Stress avant</label>
                        <select id="jeStressBefore">
                            <option value="">—</option>
                            ${stressOptions(session.stressBefore)}
                        </select>
                    </div>
                    <div class="journal-edit-row">
                        <label>Stress après</label>
                        <select id="jeStressAfter">
                            <option value="">—</option>
                            ${stressOptions(session.stressAfter)}
                        </select>
                    </div>
                    <div class="journal-edit-row" style="flex-direction:column;align-items:stretch;">
                        <label>Notes / sensations</label>
                        <textarea id="jeNotes" rows="4" style="margin-top:8px;width:100%;resize:vertical;">${(session.notes || '').replace(/</g, '&lt;')}</textarea>
                    </div>
                </div>
                <div class="journal-edit-footer">
                    <button class="btn-secondary" id="jeBtnCancel">Annuler</button>
                    <button class="btn-primary" id="jeBtnSave">Enregistrer</button>
                </div>
            </div>`;

        document.body.appendChild(overlay);

        const close = () => overlay.remove();

        overlay.querySelector('.journal-edit-close').addEventListener('click', close);
        overlay.querySelector('#jeBtnCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        overlay.querySelector('#jeBtnSave').addEventListener('click', () => {
            const dateInput = overlay.querySelector('#jeDate').value;
            if (dateInput) session.date = new Date(dateInput).toISOString();

            session.exerciseName = overlay.querySelector('#jeName').value.trim();
            session.category = overlay.querySelector('#jeCategory').value;

            const mins = parseInt(overlay.querySelector('#jeDurationMin').value) || 0;
            const secs = parseInt(overlay.querySelector('#jeDurationSec').value) || 0;
            session.duration = mins * 60 + secs;

            const feeling = overlay.querySelector('#jeFeeling').value;
            session.feeling = feeling ? parseInt(feeling) : null;
            const sb = overlay.querySelector('#jeStressBefore').value;
            session.stressBefore = sb ? parseInt(sb) : null;
            const sa = overlay.querySelector('#jeStressAfter').value;
            session.stressAfter = sa ? parseInt(sa) : null;

            session.notes = overlay.querySelector('#jeNotes').value;

            if (window.coach) {
                window.coach.saveSessions();
                window.coach.renderRecentSessions();
                window.coach.updateStatsDisplay();
            }
            this.render();
            close();
        });

        // Focus first field
        setTimeout(() => overlay.querySelector('#jeName').focus(), 50);
    }

    // ==========================================
    // Repair missing durations from detailed data
    // ==========================================

    repairDurations() {
        const sessions = this.getSessions();
        if (!sessions || sessions.length === 0) return;

        let repaired = false;

        // Load all detailed histories once
        let czHistory, frcHistory, ctHistory;
        try { czHistory = JSON.parse(localStorage.getItem('deepbreath_comfort_zone_history') || '[]'); } catch(e) { czHistory = []; }
        try { frcHistory = JSON.parse(localStorage.getItem('deepbreath_frc_comfort_history') || '[]'); } catch(e) { frcHistory = []; }
        try { ctHistory = JSON.parse(localStorage.getItem('deepbreath_contraction_history') || '[]'); } catch(e) { ctHistory = []; }

        sessions.forEach(session => {
            const sessionDate = new Date(session.date).getTime();
            if (isNaN(sessionDate)) return;

            // Try comfort zone
            const czMatch = czHistory.find(h => Math.abs(new Date(h.date).getTime() - sessionDate) < 60000);
            if (czMatch && czMatch.holds && czMatch.holds.length > 0) {
                const totalHoldTime = czMatch.holds.reduce((sum, h) => sum + (h.duration || 0), 0);
                const rest = czMatch.restDuration || 90;
                const breatheUp = czMatch.breatheUpDuration || 45;
                const estimated = Math.round(totalHoldTime + (czMatch.holds.length - 1) * rest + czMatch.holds.length * breatheUp);
                // Repair if: no duration, too short, or over-estimated (>1.5x estimate)
                if (!session.duration || session.duration < 10 || session.duration > estimated * 1.5) {
                    session.duration = estimated;
                    repaired = true;
                }
                return;
            }

            // Try FRC
            const frcMatch = frcHistory.find(h => Math.abs(new Date(h.date).getTime() - sessionDate) < 60000);
            if (frcMatch && frcMatch.holds && frcMatch.holds.length > 0) {
                const totalHoldTime = frcMatch.holds.reduce((sum, h) => sum + (h.duration || 0), 0);
                const rest = frcMatch.restDuration || 90;
                const breatheUp = frcMatch.breatheUpDuration || 45;
                const estimated = Math.round(totalHoldTime + (frcMatch.holds.length - 1) * rest + frcMatch.holds.length * breatheUp);
                if (!session.duration || session.duration < 10 || session.duration > estimated * 1.5) {
                    session.duration = estimated;
                    repaired = true;
                }
                return;
            }

            // Try contraction
            const ctMatch = ctHistory.find(h => Math.abs(new Date(h.date).getTime() - sessionDate) < 60000);
            if (ctMatch && ctMatch.cycles && ctMatch.cycles.length > 0) {
                const totalHoldTime = ctMatch.cycles.reduce((sum, c) => sum + (c.holdDuration || 0), 0);
                const estimated = Math.round(totalHoldTime + (ctMatch.cycles.length - 1) * 90);
                if (!session.duration || session.duration < 10 || session.duration > estimated * 1.5) {
                    session.duration = estimated;
                    repaired = true;
                }
                return;
            }

            // Fallback: calculate expected duration from exercise definition
            if ((!session.duration || session.duration < 10) && session.exerciseId) {
                const expected = this.calculateExpectedDuration(session.exerciseId);
                if (expected && expected > 0) {
                    session.duration = expected;
                    repaired = true;
                }
            }
        });

        if (repaired && window.coach) {
            window.coach.saveSessions();
        }
    }

    calculateExpectedDuration(exerciseId) {
        if (typeof EXERCISES === 'undefined') return null;
        const exercise = EXERCISES[exerciseId];
        if (!exercise) return null;

        // Exercices avec phases (respiration classique)
        if (exercise.phases && !exercise.isApneaTable && !exercise.isWimHof) {
            const cycleDuration = exercise.phases.reduce((sum, p) => sum + (p.duration || 0), 0);
            if (cycleDuration <= 0) return null;
            const cycles = exercise.cycles || Math.floor((exercise.duration || 5) * 60 / cycleDuration);
            return Math.round(cycles * cycleDuration);
        }

        // Exercices guidés avec segments
        if (exercise.isGuided && exercise.segments) {
            return Math.round(exercise.segments.reduce((sum, s) => sum + (s.duration || 0), 0));
        }

        // Wim Hof : estimer la partie fixe (breathing + recovery, pas les holds)
        if (exercise.isWimHof) {
            const rounds = exercise.rounds || 3;
            const breaths = exercise.breathsPerRound || 30;
            const breathTime = rounds * breaths * 3;
            const recovery = rounds * 15;
            return Math.round(breathTime + recovery);
        }

        // Si duration en minutes est indiquée directement
        if (exercise.duration && !exercise.isApneaTable && !exercise.isComfortZone && !exercise.isContractionTable) {
            return Math.round(exercise.duration * 60);
        }

        return null;
    }

    // ==========================================
    // Session detail view (accordion)
    // ==========================================

    toggleDetail(session, tr) {
        // If this row already has a detail open, close it
        const existingDetail = tr.nextElementSibling;
        if (existingDetail && existingDetail.classList.contains('journal-detail-row')) {
            existingDetail.remove();
            tr.classList.remove('journal-row-expanded');
            return;
        }

        // Close any other open detail
        const openDetails = this.tbody.querySelectorAll('.journal-detail-row');
        openDetails.forEach(row => {
            row.previousElementSibling?.classList.remove('journal-row-expanded');
            row.remove();
        });

        // Create detail row
        const detailRow = document.createElement('tr');
        detailRow.className = 'journal-detail-row';
        const detailTd = document.createElement('td');
        detailTd.colSpan = tr.children.length;
        detailTd.innerHTML = this.buildDetailContent(session);
        detailRow.appendChild(detailTd);

        tr.classList.add('journal-row-expanded');
        tr.after(detailRow);
    }

    buildDetailContent(session) {
        const date = session.date ? new Date(session.date) : null;
        const fullDate = date ? date.toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }) : '—';
        const time = date ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';

        // Feeling display
        const feelingStars = session.feeling
            ? '★'.repeat(session.feeling) + '☆'.repeat(5 - session.feeling)
            : '—';

        // Stress display
        let stressHtml = '—';
        if (session.stressBefore != null || session.stressAfter != null) {
            const before = session.stressBefore ?? '?';
            const after = session.stressAfter ?? '?';
            const diff = (session.stressBefore != null && session.stressAfter != null)
                ? session.stressAfter - session.stressBefore : null;
            const diffLabel = diff !== null
                ? ` <span class="journal-detail-stress-diff ${diff < 0 ? 'positive' : diff > 0 ? 'negative' : ''}">(${diff > 0 ? '+' : ''}${diff})</span>`
                : '';
            stressHtml = `${before} → ${after}${diffLabel}`;
        }

        // Notes
        const notes = session.notes
            ? `<div class="journal-detail-notes">${this.escapeHtml(session.notes)}</div>`
            : '';

        // Detailed exercise data
        const detailed = this.findDetailedData(session);
        let detailedHtml = '';

        if (detailed) {
            if (detailed.type === 'comfort-zone' || detailed.type === 'comfort-zone-frc') {
                detailedHtml = this.buildComfortZoneDetail(detailed.data, detailed.type);
            } else if (detailed.type === 'contraction') {
                detailedHtml = this.buildContractionDetail(detailed.data);
            }
        }

        return `
            <div class="journal-detail">
                <div class="journal-detail-grid">
                    <div class="journal-detail-section">
                        <div class="journal-detail-label">Exercice</div>
                        <div class="journal-detail-value">${this.escapeHtml(session.exerciseName || '—')}</div>
                    </div>
                    <div class="journal-detail-section">
                        <div class="journal-detail-label">Date</div>
                        <div class="journal-detail-value">${fullDate} ${time}</div>
                    </div>
                    <div class="journal-detail-section">
                        <div class="journal-detail-label">Duree</div>
                        <div class="journal-detail-value">${this.formatDuration(session.duration)}</div>
                    </div>
                    <div class="journal-detail-section">
                        <div class="journal-detail-label">Categorie</div>
                        <div class="journal-detail-value">${this.formatCategory(session.category)}</div>
                    </div>
                    <div class="journal-detail-section">
                        <div class="journal-detail-label">Ressenti</div>
                        <div class="journal-detail-value journal-detail-stars">${feelingStars}</div>
                    </div>
                    <div class="journal-detail-section">
                        <div class="journal-detail-label">Stress</div>
                        <div class="journal-detail-value">${stressHtml}</div>
                    </div>
                </div>
                ${notes}
                ${detailedHtml}
            </div>`;
    }

    buildComfortZoneDetail(data, type) {
        if (!data.holds || data.holds.length === 0) return '';

        const typeLabel = type === 'comfort-zone-frc' ? 'FRC ' : '';
        const maxDuration = Math.max(...data.holds.map(h => h.duration));

        let roundsHtml = '';
        data.holds.forEach((hold, i) => {
            const pct = maxDuration > 0 ? Math.round((hold.duration / maxDuration) * 100) : 0;
            const isBest = hold.duration === data.best;
            roundsHtml += `
                <div class="journal-detail-hold-row${isBest ? ' best' : ''}">
                    <span class="journal-detail-hold-label">Round ${i + 1}</span>
                    <div class="journal-detail-hold-bar-track">
                        <div class="journal-detail-hold-bar" style="width:${pct}%"></div>
                    </div>
                    <span class="journal-detail-hold-value">${this.formatTime(hold.duration)}</span>
                    ${isBest ? '<span class="journal-detail-hold-badge">Record</span>' : ''}
                </div>`;
        });

        return `
            <div class="journal-detail-exercise-data">
                <div class="journal-detail-exercise-title">${typeLabel}Rounds d'apnee</div>
                ${roundsHtml}
                <div class="journal-detail-hold-summary">
                    <span>Meilleur : <strong>${this.formatTime(data.best)}</strong></span>
                    <span>Moyenne : <strong>${this.formatTime(data.average)}</strong></span>
                </div>
            </div>`;
    }

    buildContractionDetail(data) {
        if (!data.cycles || data.cycles.length === 0) return '';

        let cyclesHtml = '';
        data.cycles.forEach((cycle, i) => {
            cyclesHtml += `
                <div class="journal-detail-contraction-row">
                    <span class="journal-detail-hold-label">Cycle ${cycle.cycle || (i + 1)}</span>
                    <span class="journal-detail-hold-value">${this.formatTime(cycle.holdDuration)}</span>
                    <span class="journal-detail-contraction-count">${cycle.contractionCount} contraction${cycle.contractionCount !== 1 ? 's' : ''}</span>
                    ${cycle.contractionOnset ? `<span class="journal-detail-contraction-onset">1ere a ${this.formatTime(cycle.contractionOnset)}</span>` : ''}
                </div>`;
        });

        return `
            <div class="journal-detail-exercise-data">
                <div class="journal-detail-exercise-title">Tolerance aux contractions${data.weekLevel ? ` — Semaine ${data.weekLevel}` : ''}</div>
                ${cyclesHtml}
            </div>`;
    }

    findDetailedData(session) {
        const sessionDate = new Date(session.date).getTime();
        if (isNaN(sessionDate)) return null;

        // Comfort zone
        try {
            const czHistory = JSON.parse(localStorage.getItem('deepbreath_comfort_zone_history') || '[]');
            const czMatch = czHistory.find(h => Math.abs(new Date(h.date).getTime() - sessionDate) < 60000);
            if (czMatch) return { type: 'comfort-zone', data: czMatch };
        } catch (e) {}

        // FRC
        try {
            const frcHistory = JSON.parse(localStorage.getItem('deepbreath_frc_comfort_history') || '[]');
            const frcMatch = frcHistory.find(h => Math.abs(new Date(h.date).getTime() - sessionDate) < 60000);
            if (frcMatch) return { type: 'comfort-zone-frc', data: frcMatch };
        } catch (e) {}

        // Contraction
        try {
            const ctHistory = JSON.parse(localStorage.getItem('deepbreath_contraction_history') || '[]');
            const ctMatch = ctHistory.find(h => Math.abs(new Date(h.date).getTime() - sessionDate) < 60000);
            if (ctMatch) return { type: 'contraction', data: ctMatch };
        } catch (e) {}

        return null;
    }

    formatTime(seconds) {
        if (!seconds && seconds !== 0) return '—';
        seconds = Math.round(seconds);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
        return `${s}s`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==========================================
    // Add / Delete
    // ==========================================

    addSession() {
        const now = new Date();
        const newSession = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            date: now.toISOString(),
            exerciseName: '',
            exerciseId: 'manual-entry',
            category: 'respiration',
            duration: 0,
            completed: true,
            feeling: null,
            stressBefore: null,
            stressAfter: null,
            notes: ''
        };

        const sessions = this.getSessions();
        sessions.unshift(newSession);

        if (window.coach) {
            window.coach.saveSessions();
            window.coach.renderRecentSessions();
            window.coach.updateStatsDisplay();
        }

        // Render and start editing the exercise name of the new row
        this.render();

        // Find the new row and start editing the exercise name
        setTimeout(() => {
            const newRow = this.tbody.querySelector(`tr[data-id="${newSession.id}"]`);
            if (newRow) {
                const exerciseCell = newRow.querySelector('td[data-field="exerciseName"]');
                if (exerciseCell) {
                    this.startEdit(exerciseCell, newSession.id, 'exerciseName');
                }
            }
        }, 50);
    }

    deleteSession(sessionId) {
        const session = this.getSessions().find(s => s.id === sessionId);
        if (!session) return;

        const name = session.exerciseName || 'cette session';
        if (!confirm(`Supprimer "${name}" ?`)) return;

        const sessions = this.getSessions();
        const index = sessions.findIndex(s => s.id === sessionId);
        if (index !== -1) {
            sessions.splice(index, 1);
        }

        if (window.coach) {
            window.coach.saveSessions();
            window.coach.renderRecentSessions();
            window.coach.updateStatsDisplay();
        }

        this.render();
    }

    // ==========================================
    // Sort
    // ==========================================

    sortBy(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = column === 'date' ? 'desc' : 'asc';
        }
        this.render();
    }

    // ==========================================
    // Formatting helpers
    // ==========================================

    formatDate(isoDate) {
        if (!isoDate) return '—';
        const d = new Date(isoDate);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDuration(seconds) {
        if (seconds == null || seconds === '' || isNaN(seconds)) return '—';
        seconds = Math.round(Number(seconds));
        if (seconds <= 0) return '—';
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return sec > 0 ? `${min}m${sec.toString().padStart(2, '0')}s` : `${min} min`;
    }

    formatCategory(category) {
        const map = {
            'respiration': 'Respiration',
            'apnea': 'Apnee',
            'visualisation': 'Visualisation',
            'autre': 'Autre'
        };
        return map[category] || category || '—';
    }
}
