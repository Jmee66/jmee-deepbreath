/**
 * wbu-timer.js — W&B Up timers (Warm & Breath Up)
 * Autonome, sans dépendance sur app.js, chargé sans defer
 */

var WBU = (function () {

    // ── Protocoles ──────────────────────────────────────────────
    var PROTOCOLS = {
        'chasse-terre': {
            title: 'Récupération Post-Équipement',
            phases: [
                { label: 'Normoventilation', duration: 300, color: 'hold',
                  instruction: 'Assieds-toi ou allonge-toi. Respiration naturelle : inspire 3s par le nez, expire 5s par la bouche. Objectif : FC < 75 bpm avant l\'entrée dans l\'eau.' }
            ]
        },
        'chasse-eau': {
            title: 'Acclimatation Eau',
            phases: [
                { label: 'Entrée progressive', duration: 60, color: 'hold',
                  instruction: 'Entrée lente dans l\'eau. Immerse le visage 2-3 secondes. Respiration normale — amorce le réflexe de plongée.' },
                { label: 'Flottaison calme', duration: 180, color: 'exhale',
                  instruction: 'Allonge-toi sur le ventre, masque dans l\'eau, tuba en bouche. Ne regarde pas encore le fond. Respiration calme.' },
                { label: 'Respiration diaphragmatique', duration: 240, color: 'inhale',
                  instruction: 'Inspire 4s (ventre gonfle) → Pause 1s → Expire 6-8s passive. Yeux semi-fermés. Relâchement progressif. La rate se pré-contracte.' }
            ]
        },
        'chasse-breatheup': {
            title: 'Breathe-Up Pré-Descente',
            phases: [
                { label: 'Centrage', duration: 30, color: 'hold',
                  instruction: 'Stop. Ferme les yeux. Relâchement progressif : pieds → mollets → cuisses → abdomen → épaules → mâchoire.' },
                { label: 'Breathe-up (Expire 10s)', duration: 40, color: 'exhale',
                  instruction: 'Inspire 5s → Pause 1-2s → Expire 10s lente et passive. 2-3 cycles. Corps relâché. Diaphragme.' },
                { label: 'Visualisation', duration: 10, color: 'hold',
                  instruction: 'Visualise ta descente : trajectoire, équilibration, fond. Prépare le cycle final.' },
                { label: 'Cycle final — Expire', duration: 5, color: 'exhale',
                  instruction: 'Grande expiration : 80-90% de l\'air sorti, lente.' },
                { label: 'Last breath — Inspire', duration: 5, color: 'inhale',
                  instruction: 'Grande inspiration en 3 phases : ventre → côtes → épaules. TLC 100%. Duck-dive immédiatement !' }
            ]
        },
        'statique-coherence': {
            title: 'Cohérence Cardiaque — Statique',
            phases: [
                { label: 'Cohérence cardiaque', duration: 120, color: 'hold',
                  instruction: 'Inspire 5s / Expire 5s. Diaphragmatique. Yeux fermés. Allongé si possible. FC cible < 65 bpm.' }
            ]
        },
        'statique-prep': {
            title: 'Préparation Apnée Statique',
            phases: [
                { label: 'Cohérence cardiaque', duration: 120, color: 'hold',
                  instruction: 'Inspire 5s / Expire 5s. Diaphragmatique. Yeux fermés. Allongé. FC cible < 65 bpm.' },
                { label: 'Breathe-up PFI', duration: 90, color: 'exhale',
                  instruction: 'Inspire 2-5s → Pause 1-2s → Expire 8-10s lente et passive. 4 cycles/min. Corps relâché.' },
                { label: 'Expire 80-90%', duration: 5, color: 'exhale',
                  instruction: 'Grande expiration passive : 80-90% de l\'air sorti.' },
                { label: 'Last breath — TLC 100%', duration: 8, color: 'inhale',
                  instruction: 'Ventre → Côtes → Épaules. Fluide, 4-5s. TLC 100%. Glotte fermée.' }
            ]
        },
        'dynamique-coherence': {
            title: 'Cohérence Cardiaque — Dynamique',
            phases: [
                { label: 'Cohérence cardiaque', duration: 120, color: 'hold',
                  instruction: 'Au mur, immobile. Inspire 5s / Expire 5s. Diaphragmatique. FC cible < 65 bpm.' }
            ]
        },
        'dynamique-prep': {
            title: 'Préparation Apnée Dynamique',
            phases: [
                { label: 'Cohérence cardiaque', duration: 120, color: 'hold',
                  instruction: 'Au mur, immobile. Inspire 5s / Expire 5s. Corps relâché. FC cible < 65 bpm.' },
                { label: 'Breathe-up long', duration: 120, color: 'exhale',
                  instruction: 'Inspire 5s → Pause 1-2s → Expire 10s. Plus long qu\'en statique. Position horizontale si possible.' },
                { label: 'Expire', duration: 5, color: 'exhale',
                  instruction: 'Grande expiration douce.' },
                { label: 'Last breath — 90-95% TLC', duration: 8, color: 'inhale',
                  instruction: 'Abdo → Costal → Apical. STOP à 90-95% du maximum. Push-off → nage.' }
            ]
        },
        'profondeur-coherence': {
            title: 'Cohérence Méditée — Profondeur',
            phases: [
                { label: 'Cohérence + méditation', duration: 180, color: 'hold',
                  instruction: 'Flottaison dorsale. Inspire 5s / Expire 5s. Yeux fermés. Visualise ta plongée. FC cible < 60 bpm.' }
            ]
        },
        'profondeur-prep': {
            title: 'Préparation Apnée en Profondeur',
            phases: [
                { label: 'Cohérence méditée', duration: 180, color: 'hold',
                  instruction: 'Flottaison dorsale. Inspire 5s / Expire 5s. Yeux fermés. Visualise ta plongée complète. FC cible < 60 bpm.' },
                { label: 'Breathe-up profond', duration: 120, color: 'exhale',
                  instruction: 'Inspire 5s → Pause 1-2s → Expire 10s. Le plus lent et méditatif.' },
                { label: 'Expire', duration: 5, color: 'exhale',
                  instruction: 'Grande expiration lente.' },
                { label: 'Last breath — TLC 100%', duration: 10, color: 'inhale',
                  instruction: 'Abdo → Costal → Apical. MAXIMUM physiologique. Gorge grande ouverte. Égalisation dès 0,5m.' }
            ]
        }
    };

    // ── État guided timer ────────────────────────────────────────
    var gTimer = null;
    var gPhases = [];
    var gPhaseIdx = 0;
    var gRemaining = 0;
    var gPaused = false;
    var CIRC = 2 * Math.PI * 62; // r=62

    // ── État recup timer ─────────────────────────────────────────
    var rTimer = null;
    var rTotal = 0;
    var rRemaining = 0;
    var CIRC_R = 2 * Math.PI * 52; // r=52

    // ── Helpers ──────────────────────────────────────────────────
    function el(id) { return document.getElementById(id); }

    function fmtTime(s) {
        var m = Math.floor(s / 60);
        var sec = s % 60;
        return m > 0 ? m + ':' + (sec < 10 ? '0' : '') + sec : String(s);
    }

    // ── Guided timer ─────────────────────────────────────────────
    function startProtocol(id) {
        var def = PROTOCOLS[id];
        if (!def) { alert('Protocole introuvable : ' + id); return; }

        gPhases = def.phases;
        gPhaseIdx = 0;
        gPaused = false;

        var modal = el('chasseTimerModal');
        var title = el('chasseTimerTitle');
        if (!modal) { alert('Modal timer introuvable dans le HTML'); return; }
        if (title) title.textContent = def.title;
        modal.classList.add('open');

        runPhase();
    }

    function runPhase() {
        if (gTimer) clearInterval(gTimer);
        if (gPhaseIdx >= gPhases.length) { completeGuided(); return; }

        var phase = gPhases[gPhaseIdx];
        gRemaining = phase.duration;

        var phaseEl = el('chasseTimerPhase');
        var instrEl = el('chasseTimerInstruction');
        var actionEl = el('chasseTimerAction');
        var ring = el('chasseRingProgress');

        if (phaseEl) phaseEl.textContent = 'Phase ' + (gPhaseIdx + 1) + ' / ' + gPhases.length + ' — ' + phase.label;
        if (instrEl) instrEl.textContent = phase.instruction;
        if (actionEl) actionEl.textContent = phase.label;
        if (ring) ring.className = 'chasse-ring-progress ' + (phase.color || 'hold');

        updateGuidedRing(gRemaining, phase.duration);

        gTimer = setInterval(function () {
            if (gPaused) return;
            gRemaining--;
            updateGuidedRing(gRemaining, phase.duration);
            if (gRemaining <= 0) {
                clearInterval(gTimer);
                gPhaseIdx++;
                setTimeout(runPhase, 500);
            }
        }, 1000);
    }

    function updateGuidedRing(remaining, total) {
        var countEl = el('chasseTimerCount');
        var ring = el('chasseRingProgress');
        if (countEl) countEl.textContent = fmtTime(remaining);
        if (ring) {
            var offset = CIRC * (1 - remaining / total);
            ring.style.strokeDasharray = CIRC;
            ring.style.strokeDashoffset = offset;
        }
    }

    function completeGuided() {
        var phaseEl = el('chasseTimerPhase');
        var instrEl = el('chasseTimerInstruction');
        var countEl = el('chasseTimerCount');
        var ring = el('chasseRingProgress');
        if (phaseEl) phaseEl.textContent = 'Terminé !';
        if (instrEl) instrEl.textContent = 'Protocole terminé. Respire naturellement.';
        if (countEl) countEl.textContent = '✓';
        if (ring) { ring.style.strokeDashoffset = 0; ring.style.stroke = '#34d399'; }
        setTimeout(stopGuided, 3000);
    }

    function togglePause() {
        gPaused = !gPaused;
        var btn = el('chasseTimerPauseBtn');
        if (btn) btn.textContent = gPaused ? 'Reprendre' : 'Pause';
    }

    function stopGuided() {
        if (gTimer) clearInterval(gTimer);
        gTimer = null; gPaused = false;
        var modal = el('chasseTimerModal');
        if (modal) modal.classList.remove('open');
    }

    // ── Recup timer ──────────────────────────────────────────────
    function startRecup(seconds, btn) {
        document.querySelectorAll('.btn-recup-quick').forEach(function(b) { b.classList.remove('active'); });
        if (btn) btn.classList.add('active');
        if (rTimer) clearInterval(rTimer);

        rTotal = seconds;
        rRemaining = seconds;

        var display = el('recupTimerDisplay');
        if (!display) { alert('Timer récup introuvable'); return; }
        display.style.display = 'flex';

        updateRecupRing(rRemaining, rTotal);

        rTimer = setInterval(function () {
            rRemaining--;
            updateRecupRing(rRemaining, rTotal);
            if (rRemaining <= 0) {
                stopRecup();
                var countEl = el('recupTimerCount');
                var phaseEl = el('recupTimerPhase');
                var ring = el('recupRingProgress');
                if (countEl) countEl.textContent = '✓';
                if (phaseEl) phaseEl.textContent = 'Prêt à replonger !';
                if (ring) ring.style.stroke = '#34d399';
                var display2 = el('recupTimerDisplay');
                if (display2) display2.style.display = 'flex';
            }
        }, 1000);
    }

    function updateRecupRing(remaining, total) {
        var countEl = el('recupTimerCount');
        var phaseEl = el('recupTimerPhase');
        var ring = el('recupRingProgress');
        if (countEl) countEl.textContent = fmtTime(remaining);
        if (phaseEl) phaseEl.textContent = remaining > 0 ? 'Récupération' : 'Prêt !';
        if (ring) {
            var offset = CIRC_R * (1 - remaining / total);
            ring.style.strokeDasharray = CIRC_R;
            ring.style.strokeDashoffset = offset;
        }
    }

    function stopRecup() {
        if (rTimer) clearInterval(rTimer);
        rTimer = null;
        document.querySelectorAll('.btn-recup-quick').forEach(function(b) { b.classList.remove('active'); });
        var display = el('recupTimerDisplay');
        if (display) display.style.display = 'none';
    }

    // ── Version injection (avant app.js defer) ───────────────────
    var VERSION = '1.08';

    function injectVersion() {
        var pin   = el('appVersionPin');
        var badge = el('appVersionBadge');
        if (pin)   pin.textContent   = 'v' + VERSION;
        if (badge) badge.textContent = 'BETA v' + VERSION + ' — Expérimentale, non vérifiée. Ne pas utiliser en conditions réelles.';
    }

    // ── Setup modal buttons (appelé au DOMContentLoaded) ─────────
    function setup() {
        injectVersion();
        var pauseBtn = el('chasseTimerPauseBtn');
        var stopBtn  = el('chasseTimerStopBtn');
        if (pauseBtn) pauseBtn.onclick = togglePause;
        if (stopBtn)  stopBtn.onclick  = stopGuided;
    }

    document.addEventListener('DOMContentLoaded', setup);

    // ── API publique ─────────────────────────────────────────────
    return {
        startProtocol: startProtocol,
        startRecup: startRecup,
        stopRecup: stopRecup
    };

})();

// Fonctions globales appelées par les onclick HTML
function startProtocol(id)        { WBU.startProtocol(id); }
function startRecup(seconds, btn) { WBU.startRecup(seconds, btn); }
function stopRecup()              { WBU.stopRecup(); }
