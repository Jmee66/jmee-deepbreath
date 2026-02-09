/**
 * MultiTimer - Customizable sequence timer manager
 * Allows creating, editing, and running timer sequences
 */
class MultiTimer {
    constructor() {
        this.sequences = this.loadSequences();
        this.currentSequence = null;
        this.currentPhaseIndex = 0;
        this.isRunning = false;
        this.phaseTimer = null;
        this.editingSequenceId = null;

        // Quick Timer state (separate from sequence)
        this.quickTimer = null;
        this.quickTimerValue = 60;
        this.quickTimerRemaining = 60;
        this.quickTimerPaused = false;
        this.quickTimerStartTime = null;
        this.quickTimerDurationMs = 0;
        this.quickTimerPausedAccum = 0;
        this.quickTimerPauseStart = null;
        this.lastQuickWarnSecond = null;

        // Sequence Timer state (separate from quick timer)
        this.sequencePaused = false;
        this.phaseStartTime = null;
        this.phaseDurationMs = 0;
        this.phasePausedAccum = 0;
        this.phasePauseStart = null;
        this.lastPhaseWarnSecond = null;

        // Audio context for beeps
        this.audioContext = null;

        this.init();
    }

    // ==========================================
    // Default Sequences
    // ==========================================

    getDefaultSequences() {
        return {
            'interval-30-30': {
                id: 'interval-30-30',
                name: 'Intervalles 30/30',
                description: '30s effort / 30s repos × 8',
                type: 'interval',
                isDefault: true,
                settings: {
                    work: 30,
                    rest: 30,
                    reps: 8,
                    labelWork: 'Effort',
                    labelRest: 'Repos'
                }
            },
            'tabata': {
                id: 'tabata',
                name: 'Tabata',
                description: '20s effort / 10s repos × 8',
                type: 'interval',
                isDefault: true,
                settings: {
                    work: 20,
                    rest: 10,
                    reps: 8,
                    labelWork: 'Effort',
                    labelRest: 'Repos'
                }
            },
            'pyramid': {
                id: 'pyramid',
                name: 'Pyramide',
                description: '10-20-30-40-30-20-10s',
                type: 'custom',
                isDefault: true,
                phases: [
                    { label: 'Niveau 1', duration: 10, color: 'blue' },
                    { label: 'Repos', duration: 15, color: 'green' },
                    { label: 'Niveau 2', duration: 20, color: 'blue' },
                    { label: 'Repos', duration: 15, color: 'green' },
                    { label: 'Niveau 3', duration: 30, color: 'orange' },
                    { label: 'Repos', duration: 20, color: 'green' },
                    { label: 'Sommet', duration: 40, color: 'red' },
                    { label: 'Repos', duration: 20, color: 'green' },
                    { label: 'Niveau 3', duration: 30, color: 'orange' },
                    { label: 'Repos', duration: 15, color: 'green' },
                    { label: 'Niveau 2', duration: 20, color: 'blue' },
                    { label: 'Repos', duration: 15, color: 'green' },
                    { label: 'Niveau 1', duration: 10, color: 'blue' }
                ]
            }
        };
    }

    // ==========================================
    // Storage
    // ==========================================

    loadSequences() {
        const saved = localStorage.getItem('deepbreath_sequences');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Merge with defaults to ensure they exist
                return { ...this.getDefaultSequences(), ...parsed };
            } catch (e) {
                return this.getDefaultSequences();
            }
        }
        return this.getDefaultSequences();
    }

    saveSequences() {
        // Only save non-default sequences
        const toSave = {};
        for (const [id, seq] of Object.entries(this.sequences)) {
            if (!seq.isDefault) {
                toSave[id] = seq;
            }
        }
        localStorage.setItem('deepbreath_sequences', JSON.stringify(toSave));
    }

    // ==========================================
    // Initialization
    // ==========================================

    init() {
        this.setupQuickTimer();
        this.setupSequenceCards();
        this.setupSequenceEditor();
        this.setupSequenceRunner();
        this.renderSequenceCards();
    }

    initAudio() {
        if (this.audioContext) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playBeep(frequency = 800, duration = 150, type = 'sine') {
        if (!this.audioContext) this.initAudio();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    playPhaseStartBeep() {
        this.playBeep(600, 200);
    }

    playPhaseEndBeep() {
        this.playBeep(400, 150);
    }

    playCompleteBeep() {
        this.playBeep(800, 100);
        setTimeout(() => this.playBeep(1000, 100), 150);
        setTimeout(() => this.playBeep(1200, 200), 300);
    }

    // ==========================================
    // Quick Timer
    // ==========================================

    setupQuickTimer() {
        const minutesInput = document.getElementById('quickTimerMinutes');
        const secondsInput = document.getElementById('quickTimerSeconds');
        const startBtn = document.getElementById('btnQuickTimerStart');
        const pauseBtn = document.getElementById('btnQuickTimerPause');
        const resetBtn = document.getElementById('btnQuickTimerReset');
        const presetBtns = document.querySelectorAll('.preset-btn');

        if (!minutesInput) return;

        // Update timer value when inputs change
        const updateValue = () => {
            this.quickTimerValue = parseInt(minutesInput.value || 0) * 60 + parseInt(secondsInput.value || 0);
            this.quickTimerRemaining = this.quickTimerValue;
            this.updateQuickTimerDisplay();
        };

        minutesInput.addEventListener('input', updateValue);
        secondsInput.addEventListener('input', updateValue);

        // Preset buttons
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const time = parseInt(btn.dataset.time);
                minutesInput.value = Math.floor(time / 60);
                secondsInput.value = time % 60;
                updateValue();
            });
        });

        // Control buttons
        startBtn?.addEventListener('click', () => this.startQuickTimer());
        pauseBtn?.addEventListener('click', () => this.pauseQuickTimer());
        resetBtn?.addEventListener('click', () => this.resetQuickTimer());

        updateValue();
    }

    updateQuickTimerDisplay() {
        const display = document.getElementById('quickTimerValue');
        const status = document.getElementById('quickTimerStatus');

        if (display) {
            display.textContent = this.formatTime(this.quickTimerRemaining);
        }

        if (status) {
            if (this.quickTimer) {
                status.textContent = this.quickTimerPaused ? 'En pause' : 'En cours...';
            } else {
                status.textContent = 'Prêt';
            }
        }
    }

    startQuickTimer() {
        if (this.quickTimer) return;

        this.initAudio();
        this.playPhaseStartBeep();

        const startBtn = document.getElementById('btnQuickTimerStart');
        const pauseBtn = document.getElementById('btnQuickTimerPause');

        if (startBtn) startBtn.style.display = 'none';
        if (pauseBtn) pauseBtn.style.display = 'flex';

        this.quickTimerPaused = false;
        this.quickTimerDurationMs = this.quickTimerValue * 1000;
        this.quickTimerStartTime = Date.now();
        this.quickTimerPausedAccum = 0;
        this.quickTimerPauseStart = null;
        this.lastQuickWarnSecond = null;

        this.quickTimer = setInterval(() => {
            if (this.quickTimerPaused) {
                if (!this.quickTimerPauseStart) this.quickTimerPauseStart = Date.now();
                return;
            }
            if (this.quickTimerPauseStart) {
                this.quickTimerPausedAccum += Date.now() - this.quickTimerPauseStart;
                this.quickTimerPauseStart = null;
            }

            const elapsed = Date.now() - this.quickTimerStartTime - this.quickTimerPausedAccum;
            const remainingMs = this.quickTimerDurationMs - elapsed;
            this.quickTimerRemaining = Math.max(0, Math.ceil(remainingMs / 1000));
            this.updateQuickTimerDisplay();

            // Warning beeps at 3, 2, 1 (anti-duplicate)
            if (this.quickTimerRemaining <= 3 && this.quickTimerRemaining > 0
                && this.quickTimerRemaining !== this.lastQuickWarnSecond) {
                this.lastQuickWarnSecond = this.quickTimerRemaining;
                this.playBeep(500, 100);
            }

            if (remainingMs <= 0) {
                this.completeQuickTimer();
            }
        }, 250);
    }

    pauseQuickTimer() {
        this.quickTimerPaused = !this.quickTimerPaused;

        const pauseBtn = document.getElementById('btnQuickTimerPause');
        if (pauseBtn) {
            if (this.quickTimerPaused) {
                pauseBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    Reprendre
                `;
            } else {
                pauseBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    Pause
                `;
            }
        }

        this.updateQuickTimerDisplay();
    }

    resetQuickTimer() {
        if (this.quickTimer) {
            clearInterval(this.quickTimer);
            this.quickTimer = null;
        }

        this.quickTimerPaused = false;
        this.quickTimerRemaining = this.quickTimerValue;

        const startBtn = document.getElementById('btnQuickTimerStart');
        const pauseBtn = document.getElementById('btnQuickTimerPause');

        if (startBtn) startBtn.style.display = 'flex';
        if (pauseBtn) {
            pauseBtn.style.display = 'none';
            pauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause
            `;
        }

        this.updateQuickTimerDisplay();
    }

    completeQuickTimer() {
        clearInterval(this.quickTimer);
        this.quickTimer = null;

        this.playCompleteBeep();

        const status = document.getElementById('quickTimerStatus');
        if (status) status.textContent = 'Terminé !';

        const startBtn = document.getElementById('btnQuickTimerStart');
        const pauseBtn = document.getElementById('btnQuickTimerPause');

        if (startBtn) startBtn.style.display = 'flex';
        if (pauseBtn) pauseBtn.style.display = 'none';
    }

    // ==========================================
    // Sequence Cards
    // ==========================================

    setupSequenceCards() {
        const addCard = document.getElementById('addSequenceCard');
        const newBtn = document.getElementById('btnNewSequence');

        addCard?.addEventListener('click', () => this.openSequenceEditor(null));
        newBtn?.addEventListener('click', () => this.openSequenceEditor(null));
    }

    renderSequenceCards() {
        const grid = document.getElementById('sequencesGrid');
        if (!grid) return;

        // Clear existing cards except the add card
        const addCard = document.getElementById('addSequenceCard');
        grid.innerHTML = '';

        // Render sequence cards
        for (const [id, sequence] of Object.entries(this.sequences)) {
            const card = this.createSequenceCard(sequence);
            grid.appendChild(card);
        }

        // Re-add the add card
        if (addCard) {
            grid.appendChild(addCard);
        } else {
            // Create add card if it doesn't exist
            const newAddCard = document.createElement('div');
            newAddCard.className = 'sequence-card sequence-card-add';
            newAddCard.id = 'addSequenceCard';
            newAddCard.innerHTML = `
                <div class="sequence-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </div>
                <h4>Créer une séquence</h4>
                <p>Personnalisez vos intervalles</p>
            `;
            newAddCard.addEventListener('click', () => this.openSequenceEditor(null));
            grid.appendChild(newAddCard);
        }
    }

    createSequenceCard(sequence) {
        const card = document.createElement('div');
        card.className = 'sequence-card';
        card.dataset.sequence = sequence.id;

        const stats = this.getSequenceStats(sequence);
        const icon = this.getSequenceIcon(sequence);

        card.innerHTML = `
            <div class="sequence-icon">
                ${icon}
            </div>
            <h4>${sequence.name}</h4>
            <p>${sequence.description}</p>
            <div class="sequence-meta">
                <span>${stats.phases} phases</span>
                <span>•</span>
                <span>${this.formatTime(stats.totalDuration)}</span>
            </div>
            <div class="sequence-actions">
                <button class="btn-start-sequence">Démarrer</button>
                <button class="btn-edit-sequence" title="Modifier">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                    </svg>
                </button>
            </div>
        `;

        // Event listeners
        card.querySelector('.btn-start-sequence').addEventListener('click', () => {
            this.startSequence(sequence.id);
        });

        card.querySelector('.btn-edit-sequence').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSequenceEditor(sequence.id);
        });

        return card;
    }

    getSequenceIcon(sequence) {
        if (sequence.type === 'interval') {
            return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
            </svg>`;
        }
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="21" x2="4" y2="14"/>
            <line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/>
            <line x1="20" y1="12" x2="20" y2="3"/>
        </svg>`;
    }

    getSequenceStats(sequence) {
        const phases = this.generatePhases(sequence);
        const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);
        return { phases: phases.length, totalDuration };
    }

    generatePhases(sequence) {
        if (sequence.type === 'interval') {
            const phases = [];
            const { work, rest, reps, labelWork, labelRest } = sequence.settings;
            for (let i = 0; i < reps; i++) {
                phases.push({ label: labelWork || 'Effort', duration: work, color: 'blue' });
                phases.push({ label: labelRest || 'Repos', duration: rest, color: 'green' });
            }
            return phases;
        }
        return sequence.phases || [];
    }

    // ==========================================
    // Sequence Editor
    // ==========================================

    setupSequenceEditor() {
        const modal = document.getElementById('sequenceEditorModal');
        const closeBtn = document.getElementById('sequenceEditorClose');
        const cancelBtn = document.getElementById('btnCancelSequence');
        const saveBtn = document.getElementById('btnSaveSequence');
        const deleteBtn = document.getElementById('btnDeleteSequence');
        const addPhaseBtn = document.getElementById('btnAddPhase');
        const typeBtns = document.querySelectorAll('.type-btn');

        closeBtn?.addEventListener('click', () => this.closeSequenceEditor());
        cancelBtn?.addEventListener('click', () => this.closeSequenceEditor());
        saveBtn?.addEventListener('click', () => this.saveSequence());
        deleteBtn?.addEventListener('click', () => this.deleteSequence());
        addPhaseBtn?.addEventListener('click', () => this.addPhase());

        // Type selector
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.toggleEditorMode(btn.dataset.type);
            });
        });

        // Live preview updates
        ['intervalWork', 'intervalRest', 'intervalReps'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.updatePreview());
        });

        // Close on backdrop click
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeSequenceEditor();
        });
    }

    openSequenceEditor(sequenceId) {
        const modal = document.getElementById('sequenceEditorModal');
        const title = document.getElementById('sequenceEditorTitle');
        const deleteBtn = document.getElementById('btnDeleteSequence');

        this.editingSequenceId = sequenceId;

        if (sequenceId) {
            const sequence = this.sequences[sequenceId];
            title.textContent = 'Modifier la séquence';
            deleteBtn.style.display = sequence.isDefault ? 'none' : 'inline-block';
            this.populateEditor(sequence);
        } else {
            title.textContent = 'Nouvelle séquence';
            deleteBtn.style.display = 'none';
            this.resetEditor();
        }

        modal.classList.add('active');
        this.updatePreview();
    }

    closeSequenceEditor() {
        const modal = document.getElementById('sequenceEditorModal');
        modal.classList.remove('active');
        this.editingSequenceId = null;
    }

    resetEditor() {
        document.getElementById('sequenceName').value = '';
        document.getElementById('intervalWork').value = 30;
        document.getElementById('intervalRest').value = 30;
        document.getElementById('intervalReps').value = 8;
        document.getElementById('labelWork').value = 'Effort';
        document.getElementById('labelRest').value = 'Repos';

        // Reset type to interval
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === 'interval');
        });
        this.toggleEditorMode('interval');

        // Reset custom phases
        this.resetPhasesList();
    }

    populateEditor(sequence) {
        document.getElementById('sequenceName').value = sequence.name;

        // Set type
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === sequence.type);
        });
        this.toggleEditorMode(sequence.type);

        if (sequence.type === 'interval') {
            document.getElementById('intervalWork').value = sequence.settings.work;
            document.getElementById('intervalRest').value = sequence.settings.rest;
            document.getElementById('intervalReps').value = sequence.settings.reps;
            document.getElementById('labelWork').value = sequence.settings.labelWork || 'Effort';
            document.getElementById('labelRest').value = sequence.settings.labelRest || 'Repos';
        } else {
            this.populatePhasesList(sequence.phases);
        }
    }

    toggleEditorMode(type) {
        const intervalSettings = document.getElementById('intervalSettings');
        const customSettings = document.getElementById('customSettings');

        if (type === 'interval') {
            intervalSettings.style.display = 'block';
            customSettings.style.display = 'none';
        } else {
            intervalSettings.style.display = 'none';
            customSettings.style.display = 'block';
        }

        this.updatePreview();
    }

    resetPhasesList() {
        const list = document.getElementById('phasesList');
        list.innerHTML = '';
        this.addPhase();
    }

    populatePhasesList(phases) {
        const list = document.getElementById('phasesList');
        list.innerHTML = '';

        phases.forEach((phase, index) => {
            this.addPhase(phase);
        });
    }

    addPhase(phaseData = null) {
        const list = document.getElementById('phasesList');
        const index = list.children.length;

        const item = document.createElement('div');
        item.className = 'phase-item';
        item.dataset.index = index;

        item.innerHTML = `
            <input type="text" class="phase-label" value="${phaseData?.label || `Phase ${index + 1}`}" placeholder="Nom">
            <div class="input-with-unit">
                <input type="number" class="phase-duration" min="1" max="600" value="${phaseData?.duration || 30}">
                <span>sec</span>
            </div>
            <select class="phase-color">
                <option value="blue" ${phaseData?.color === 'blue' ? 'selected' : ''}>Bleu</option>
                <option value="green" ${phaseData?.color === 'green' ? 'selected' : ''}>Vert</option>
                <option value="orange" ${phaseData?.color === 'orange' ? 'selected' : ''}>Orange</option>
                <option value="red" ${phaseData?.color === 'red' ? 'selected' : ''}>Rouge</option>
                <option value="purple" ${phaseData?.color === 'purple' ? 'selected' : ''}>Violet</option>
            </select>
            <button class="btn-remove-phase" title="Supprimer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        // Event listeners
        item.querySelector('.btn-remove-phase').addEventListener('click', () => {
            if (list.children.length > 1) {
                item.remove();
                this.updatePreview();
            }
        });

        item.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });

        list.appendChild(item);
        this.updatePreview();
    }

    getEditorSequence() {
        const name = document.getElementById('sequenceName').value || 'Ma séquence';
        const type = document.querySelector('.type-btn.active').dataset.type;

        if (type === 'interval') {
            return {
                name,
                type: 'interval',
                description: `${document.getElementById('intervalWork').value}s / ${document.getElementById('intervalRest').value}s × ${document.getElementById('intervalReps').value}`,
                settings: {
                    work: parseInt(document.getElementById('intervalWork').value),
                    rest: parseInt(document.getElementById('intervalRest').value),
                    reps: parseInt(document.getElementById('intervalReps').value),
                    labelWork: document.getElementById('labelWork').value,
                    labelRest: document.getElementById('labelRest').value
                }
            };
        } else {
            const phases = [];
            document.querySelectorAll('.phase-item').forEach(item => {
                phases.push({
                    label: item.querySelector('.phase-label').value,
                    duration: parseInt(item.querySelector('.phase-duration').value),
                    color: item.querySelector('.phase-color').value
                });
            });

            return {
                name,
                type: 'custom',
                description: `${phases.length} phases personnalisées`,
                phases
            };
        }
    }

    updatePreview() {
        const sequence = this.getEditorSequence();
        const phases = this.generatePhases(sequence);
        const stats = this.getSequenceStats(sequence);

        // Update timeline
        const timeline = document.getElementById('previewTimeline');
        if (timeline) {
            timeline.innerHTML = phases.map(phase => {
                const widthPercent = (phase.duration / stats.totalDuration) * 100;
                const colorClass = sequence.type === 'interval'
                    ? (phase.label.includes('Repos') || phase.label.includes('Rest') ? 'rest' : 'work')
                    : phase.color;
                return `<div class="preview-phase ${colorClass}" style="flex: ${phase.duration};" title="${phase.label}: ${phase.duration}s"></div>`;
            }).join('');
        }

        // Update stats
        document.getElementById('previewDuration').textContent = this.formatTime(stats.totalDuration);
        document.getElementById('previewPhases').textContent = stats.phases;
    }

    saveSequence() {
        const sequence = this.getEditorSequence();

        if (this.editingSequenceId) {
            // Update existing
            sequence.id = this.editingSequenceId;
            sequence.isDefault = this.sequences[this.editingSequenceId]?.isDefault;
            this.sequences[this.editingSequenceId] = sequence;
        } else {
            // Create new
            sequence.id = 'custom-' + Date.now();
            sequence.isDefault = false;
            this.sequences[sequence.id] = sequence;
        }

        this.saveSequences();
        this.renderSequenceCards();
        this.closeSequenceEditor();

        window.app?.showToast('Séquence enregistrée');
    }

    deleteSequence() {
        if (!this.editingSequenceId) return;

        const sequence = this.sequences[this.editingSequenceId];
        if (sequence?.isDefault) {
            window.app?.showToast('Impossible de supprimer une séquence par défaut');
            return;
        }

        if (confirm('Supprimer cette séquence ?')) {
            delete this.sequences[this.editingSequenceId];
            this.saveSequences();
            this.renderSequenceCards();
            this.closeSequenceEditor();
            window.app?.showToast('Séquence supprimée');
        }
    }

    // ==========================================
    // Sequence Runner
    // ==========================================

    setupSequenceRunner() {
        const closeBtn = document.getElementById('sequenceRunnerClose');
        const pauseBtn = document.getElementById('btnRunnerPause');
        const stopBtn = document.getElementById('btnRunnerStop');

        closeBtn?.addEventListener('click', () => this.stopSequence());
        pauseBtn?.addEventListener('click', () => this.togglePauseSequence());
        stopBtn?.addEventListener('click', () => this.stopSequence());
    }

    startSequence(sequenceId) {
        const sequence = this.sequences[sequenceId];
        if (!sequence) return;

        this.initAudio();

        this.currentSequence = sequence;
        this.currentPhases = this.generatePhases(sequence);
        this.currentPhaseIndex = 0;
        this.isRunning = true;
        this.sequencePaused = false;

        // Open runner modal
        const modal = document.getElementById('sequenceRunnerModal');
        document.getElementById('sequenceRunnerTitle').textContent = sequence.name;
        modal.classList.add('active');

        // Build timeline
        this.buildRunnerTimeline();

        // Start first phase
        this.runPhase();
    }

    buildRunnerTimeline() {
        const timeline = document.getElementById('runnerTimeline');
        const totalDuration = this.currentPhases.reduce((sum, p) => sum + p.duration, 0);

        timeline.innerHTML = this.currentPhases.map((phase, index) => {
            const colorClass = phase.color || (phase.label.includes('Repos') ? 'green' : 'blue');
            return `<div class="runner-timeline-phase preview-phase ${colorClass}" data-index="${index}" style="flex: ${phase.duration};"></div>`;
        }).join('');
    }

    runPhase() {
        if (!this.isRunning || this.currentPhaseIndex >= this.currentPhases.length) {
            this.completeSequence();
            return;
        }

        const phase = this.currentPhases[this.currentPhaseIndex];

        this.playPhaseStartBeep();

        // Update UI
        document.getElementById('runnerPhaseLabel').textContent = phase.label;
        document.getElementById('runnerPhaseCounter').textContent =
            `Phase ${this.currentPhaseIndex + 1} / ${this.currentPhases.length}`;

        const nextPhase = this.currentPhases[this.currentPhaseIndex + 1];
        document.getElementById('runnerNextPhase').textContent =
            nextPhase ? nextPhase.label : 'Fin';

        // Update timeline
        document.querySelectorAll('.runner-timeline-phase').forEach((el, i) => {
            el.classList.toggle('completed', i < this.currentPhaseIndex);
            el.classList.toggle('active', i === this.currentPhaseIndex);
        });

        // Progress bar
        const progressBar = document.getElementById('runnerProgressBar');
        const circumference = 2 * Math.PI * 90;
        progressBar.style.strokeDasharray = circumference;

        // Date.now() delta pattern for accurate timing
        this.phaseDurationMs = phase.duration * 1000;
        this.phaseStartTime = Date.now();
        this.phasePausedAccum = 0;
        this.phasePauseStart = null;
        this.lastPhaseWarnSecond = null;

        const updateDisplay = (remaining) => {
            document.getElementById('runnerTimer').textContent = this.formatTime(remaining);
            const progress = 1 - (remaining / phase.duration);
            progressBar.style.strokeDashoffset = circumference * (1 - progress);
        };

        updateDisplay(phase.duration);

        this.phaseTimer = setInterval(() => {
            if (this.sequencePaused) {
                if (!this.phasePauseStart) this.phasePauseStart = Date.now();
                return;
            }
            if (this.phasePauseStart) {
                this.phasePausedAccum += Date.now() - this.phasePauseStart;
                this.phasePauseStart = null;
            }

            const elapsed = Date.now() - this.phaseStartTime - this.phasePausedAccum;
            const remainingMs = this.phaseDurationMs - elapsed;
            const remaining = Math.max(0, Math.ceil(remainingMs / 1000));

            updateDisplay(remaining);

            // Warning beeps at 3, 2, 1 (anti-duplicate)
            if (remaining <= 3 && remaining > 0
                && remaining !== this.lastPhaseWarnSecond) {
                this.lastPhaseWarnSecond = remaining;
                this.playBeep(500, 100);
            }

            if (remainingMs <= 0) {
                clearInterval(this.phaseTimer);
                this.playPhaseEndBeep();
                this.currentPhaseIndex++;
                setTimeout(() => this.runPhase(), 500);
            }
        }, 250);
    }

    togglePauseSequence() {
        this.sequencePaused = !this.sequencePaused;

        const pauseBtn = document.getElementById('btnRunnerPause');
        if (pauseBtn) {
            if (this.sequencePaused) {
                pauseBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                `;
            } else {
                pauseBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                `;
            }
        }
    }

    stopSequence() {
        this.isRunning = false;
        clearInterval(this.phaseTimer);

        const modal = document.getElementById('sequenceRunnerModal');
        modal.classList.remove('active');

        // Reset pause button
        const pauseBtn = document.getElementById('btnRunnerPause');
        if (pauseBtn) {
            pauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            `;
        }
    }

    completeSequence() {
        this.isRunning = false;
        clearInterval(this.phaseTimer);

        this.playCompleteBeep();

        document.getElementById('runnerPhaseLabel').textContent = 'Terminé !';
        document.getElementById('runnerTimer').textContent = '0:00';
        document.getElementById('runnerNextPhase').textContent = '--';

        // Mark all as completed
        document.querySelectorAll('.runner-timeline-phase').forEach(el => {
            el.classList.add('completed');
            el.classList.remove('active');
        });

        // Auto-close after delay
        setTimeout(() => {
            if (!this.isRunning) {
                this.stopSequence();
            }
        }, 3000);
    }

    // ==========================================
    // Utilities
    // ==========================================

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.multiTimer = new MultiTimer();
});
