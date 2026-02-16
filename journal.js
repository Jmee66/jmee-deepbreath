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
            this.editNotes(session.id, tr);
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
        td.addEventListener('click', () => this.startEdit(td, session.id, field));
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

    editNotes(sessionId, tr) {
        const sessions = this.getSessions();
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        // Close any existing edit
        const existing = document.querySelector('.journal-notes-edit');
        if (existing) existing.remove();

        // Create inline edit row below the current row
        const editRow = document.createElement('tr');
        editRow.className = 'journal-notes-edit';
        const editTd = document.createElement('td');
        editTd.colSpan = tr.children.length;
        editTd.innerHTML = `
            <div class="journal-notes-edit-container">
                <input type="text" class="journal-notes-input"
                    value="${(session.notes || '').replace(/"/g, '&quot;')}"
                    placeholder="Notes, sensations, observations...">
                <button class="journal-notes-save">OK</button>
            </div>`;
        editRow.appendChild(editTd);
        tr.after(editRow);

        const input = editTd.querySelector('.journal-notes-input');
        input.focus();

        const save = () => {
            this.saveEdit(sessionId, 'notes', input.value);
            editRow.remove();
        };

        editTd.querySelector('.journal-notes-save').addEventListener('click', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); save(); }
            if (e.key === 'Escape') { editRow.remove(); }
        });
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
        if (!seconds) return '—';
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
