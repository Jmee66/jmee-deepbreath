/**
 * Exercise Protocols - Based on Latest Scientific Research (2023-2025)
 * Each exercise includes evidence-based timing and instructions
 */

const EXERCISES = {
    // ==========================================
    // RESPIRATION EXERCISES
    // ==========================================

    'cyclic-sighing': {
        name: 'Cyclic Sighing',
        category: 'respiration',
        description: 'Pratique quotidienne 5 min — double inspiration + expiration longue pour améliorer l\'humeur et réduire le stress',
        science: 'Stanford 2023 — 56% plus efficace que la méditation pour améliorer l\'humeur. Version pratique quotidienne du Soupir Physiologique : même technique, mais répétée sur 5 minutes pour un effet profond et durable sur le système nerveux autonome.',
        duration: 5, // minutes
        phases: [
            { name: 'Inspirez', duration: 2, action: 'inhale' },
            { name: 'Inspirez +', duration: 1, action: 'inhale' },
            { name: 'Expirez lentement', duration: 6, action: 'exhale' }
        ],
        instructions: {
            start: 'Installez-vous confortablement. Nous allons pratiquer le cyclic sighing.',
            'Inspirez': 'Inspirez profondément par le nez, remplissez vos poumons',
            'Inspirez +': 'Sans expirer, prenez une seconde inspiration courte pour remplir complètement',
            'Expirez lentement': 'Expirez lentement et complètement par la bouche'
        },
        cyclesPerMinute: 6.67
    },

    'coherent': {
        name: 'Respiration Cohérente',
        category: 'respiration',
        description: '5.5 respirations par minute pour la cohérence cardiaque',
        science: 'Optimise la variabilité de la fréquence cardiaque (HRV) à la fréquence de résonance',
        duration: 10,
        phases: [
            { name: 'Inspirez', duration: 5.5, action: 'inhale' },
            { name: 'Expirez', duration: 5.5, action: 'exhale' }
        ],
        instructions: {
            start: 'Respirez naturellement au rythme indiqué. Laissez votre cœur se synchroniser.',
            'Inspirez': 'Inspirez doucement par le nez',
            'Expirez': 'Expirez doucement par le nez ou la bouche'
        },
        cyclesPerMinute: 5.45
    },

    'cardiac-coherence': {
        name: 'Cohérence Cardiaque',
        category: 'respiration',
        description: 'Respiration de résonance cardiaque paramétrable — fréquence, ratio et rétention ajustables',
        science: 'Optimise la HRV à la fréquence de résonance individuelle. Ratio et rétention réglables pour s\'adapter à chaque pratiquant.',
        duration: 10,
        phases: [
            { name: 'Inspirez', duration: 5.5, action: 'inhale' },
            { name: 'Retenez', duration: 0, action: 'hold' },
            { name: 'Expirez', duration: 5.5, action: 'exhale' }
        ],
        instructions: {
            start: 'Cohérence cardiaque. Respirez au rythme indiqué. Laissez votre cœur se synchroniser.',
            'Inspirez': 'Inspiration douce par le nez, en gonflant le ventre',
            'Retenez': 'Pause poumons pleins, corps détendu',
            'Expirez': 'Expiration lente et régulière'
        },
        cyclesPerMinute: 5.45
    },

    'box': {
        name: 'Box Breathing',
        category: 'respiration',
        description: 'Technique 4-4-4-4 des Navy SEALs',
        science: 'Augmente le tonus vagal et améliore la concentration tactique',
        duration: 5,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Retenez', duration: 4, action: 'hold' },
            { name: 'Expirez', duration: 4, action: 'exhale' },
            { name: 'Retenez', duration: 4, action: 'hold' }
        ],
        instructions: {
            start: 'Box breathing : inspirez, retenez, expirez, retenez - chaque phase dure 4 secondes.',
            'Inspirez': 'Inspirez lentement par le nez',
            'Retenez': 'Poumons pleins, restez détendu',
            'Expirez': 'Expirez lentement et complètement',
            'Retenez ': 'Poumons vides, restez calme'
        },
        cyclesPerMinute: 3.75
    },

    'wimhof': {
        name: 'Méthode Wim Hof',
        category: 'respiration',
        description: 'Hyperventilation contrôlée + rétention',
        science: 'Étude 2024 - Améliore énergie, clarté mentale et résilience',
        duration: 15,
        isWimHof: true,
        rounds: 3,
        breathsPerRound: 30,
        phases: [
            { name: 'Inspirez profondément', duration: 1.5, action: 'inhale' },
            { name: 'Relâchez', duration: 1.5, action: 'exhale' }
        ],
        retentionPhase: { name: 'Rétention', action: 'hold' },
        recoveryPhase: { name: 'Récupération', duration: 15, action: 'hold' },
        instructions: {
            start: 'Méthode Wim Hof : 30 respirations profondes, puis rétention maximale.',
            'Inspirez profondément': 'Grande inspiration par le nez ou la bouche',
            'Relâchez': 'Laissez l\'air sortir naturellement',
            'Rétention': 'Après la dernière expiration, retenez aussi longtemps que possible',
            'Récupération': 'Inspirez à fond et retenez 15 secondes'
        },
        warning: 'Ne jamais pratiquer dans l\'eau ou en conduisant'
    },

    'co2-tolerance': {
        name: 'Respiration 1:2 (HRV)',
        category: 'respiration',
        description: 'Respiration lente ratio 1:2 (4s/8s) — maximise la variabilité cardiaque et calme le système nerveux avant la plongée',
        science: 'Effet HRV / vagal : la respiration lente (4-6 cycles/min) à ratio 1:2 synchronise la respiration et le rythme cardiaque, maximisant la variabilité cardiaque (HRV). L\'expiration prolongée active le frein vagal parasympathique via les barorécepteurs aortiques. Excellent pour la préparation mentale pré-plongée. Note : ce protocole ne crée pas d\'hypercapnie ni de désensibilisation des chémorécepteurs — pour entraîner la tolérance CO2, voir "Hypoventilation VHL" ou les tables CO2.',
        duration: 5,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Expirez lentement', duration: 8, action: 'exhale' }
        ],
        instructions: {
            start: 'Respiration lente et régulière. Idéale avant une session d\'apnée pour calmer le système nerveux.',
            'Inspirez': 'Inspiration douce et nasale',
            'Expirez lentement': 'Expiration très lente, laissez l\'air sortir sans effort'
        },
        cyclesPerMinute: 5
    },

    'ocean-breath-co2': {
        name: 'Ocean Breath CO2',
        category: 'respiration',
        description: 'Expiration longue freinée (Ujjayi) pour tolérance CO2 — le freinage glottique crée une contre-pression qui ralentit l\'évacuation du CO2 et entraîne l\'hypercapnie progressive',
        science: 'L\'expiration freinée (ratio 1:2:4:1) maintient une pression positive résiduelle dans les voies aériennes, ralentissant l\'élimination du CO2. La PCO2 alvéolaire monte progressivement, stimulant les chémorécepteurs centraux. Le son Ujjayi (contraction partielle de la glotte) active le nerf vague via les mécanorécepteurs laryngés. Combiné avec un remplissage limité à 70% VC, ce protocole évite l\'hyperventilation tout en créant une hypercapnie modérée et sûre.',
        duration: 10,
        phases: [
            { name: 'Inspir Nasale', duration: 4, action: 'inhale',
              subText: 'Remplissage à 70% — pas au max.' },
            { name: 'Pause Plein', duration: 4, action: 'hold',
              subText: 'Épaules relâchées. Gorge ouverte.' },
            { name: 'Expir Ocean', duration: 16, action: 'exhale',
              subText: 'Freinage glottique maximum. Fil de soie constant.' },
            { name: 'Pause Vide', duration: 2, action: 'holdEmpty',
              subText: 'Immobilité. Relâche le ventre.' }
        ],
        instructions: {
            start: 'Ocean Breath CO2 — Endurance 4-4-16-2. Expiration longue freinée pour tolérance CO2.',
            'Inspir Nasale': 'Inspiration nasale fluide. Remplissage à 70% seulement — pas au maximum.',
            'Pause Plein': 'Suspension poumons pleins. Relâchement total des épaules. Gorge ouverte.',
            'Expir Ocean': 'Freinage maximum au fond de la gorge. Le son doit être un fil de soie constant. Régulier du début à la fin.',
            'Pause Vide': 'Immobilité poumons vides. Relâche le ventre. Prépare le prochain cycle.'
        },
        cyclesPerMinute: 2.31
    },

    'co2-vhl': {
        name: 'Hypoventilation VHL CO2',
        category: 'respiration',
        description: 'Hypoventilation à bas volume pulmonaire (Woorons) — désensibilisation réelle des chémorécepteurs par accumulation progressive de CO2',
        science: 'Protocole Woorons VHL (Voluntary Hypoventilation at Low Lung Volume, 2017-2025) & Kapus et al. (PMC3873666) : la pause end-expiratory (poumons bas, ~40% VC) crée une hypercapnie réelle sans hypoxie sévère. La PCO2 artérielle monte de ~40 à ~55 mmHg en quelques cycles. Répété 3x/sem pendant 6 semaines : −45% de sensibilité ventilatoire au CO2 (p=0.03, d=2.81). Mécanisme : recalibration des chémorécepteurs centraux du bulbe rachidien. Utilisé dans les programmes AIDA et Molchanovs comme protocole CO2 principal.',
        isVHL: true,
        duration: 10,
        cycles: 5,
        breathsPerCycle: 3,
        holdDuration: 5,
        restBreaths: 4,
        phases: [
            { name: 'Respirez', duration: 3, action: 'inhale' },
            { name: 'Expirez', duration: 3, action: 'exhale' },
            { name: 'Pause CO2', duration: 5, action: 'holdEmpty' }
        ],
        instructions: {
            start: 'Hypoventilation VHL. Respirez normalement 3 cycles, puis expirez et faites une pause poumons bas. Répétez.',
            breathe: 'Respirez normalement. Préparez la pause.',
            hold: 'Expirez normalement — ne videz pas à fond. Pause. Poumons à mi-vide.',
            rest: 'Respirez librement. Récupérez avant le prochain cycle.',
            complete: 'Session VHL terminée. La tolérance CO2 se construit sur 4 à 6 semaines de pratique régulière.'
        },
        warning: 'Ne pas pratiquer en eau. Arrêtez si vertiges ou fourmillements intenses. Les premières sessions peuvent générer un inconfort marqué — c\'est normal et attendu.'
    },

    'co2-vhl-classic': {
        name: 'VHL Classique Woorons',
        category: 'respiration',
        description: 'Protocole VHL original de Woorons — 2 respirations normales puis pause poumons bas. Durée de pause plus longue (6s). Conçu pour la progression après maîtrise du protocole CO2.',
        science: 'Woorons et al. (2014, 2017) : protocole source des études sur la VHL. 2 respirations normales + pause end-expiratory 6-8s × 8 cycles. Charge CO2 progressive supérieure au protocole court. Recommandé pour les pratiquants ayant complété 4 semaines de VHL CO2 standard.',
        isVHL: true,
        duration: 14,
        cycles: 8,
        breathsPerCycle: 2,
        holdDuration: 6,
        restBreaths: 4,
        phases: [
            { name: 'Respirez', duration: 3, action: 'inhale' },
            { name: 'Expirez', duration: 3, action: 'exhale' },
            { name: 'Pause CO2', duration: 6, action: 'holdEmpty' }
        ],
        instructions: {
            start: 'VHL Classique Woorons. 2 respirations normales, puis expirez normalement et faites une pause poumons bas 6 secondes. 8 cycles.',
            breathe: 'Respirez normalement. Préparez la pause.',
            hold: 'Expirez normalement — pas à fond. Pause 6 secondes. Poumons à mi-vide.',
            rest: 'Respirez librement. Récupérez avant le prochain cycle.',
            complete: 'Session VHL Classique terminée. Protocole source Woorons. Progression vers 8s de pause possible.'
        },
        warning: 'Ne pas pratiquer en eau. Arrêtez si vertiges ou fourmillements intenses. Réservé aux pratiquants ayant déjà maîtrisé le VHL CO2 standard.'
    },

    'co2-vhl-static': {
        name: 'VHL Statique',
        category: 'respiration',
        description: 'Apnée sur bas volume pulmonaire (FRC) avec pause longue. Gorge relâchée, suspension passive — protocole Woorons adapté à l\'entraînement CO2 avancé.',
        science: 'Woorons et al. (2014-2025) : pause end-expiratory longue (≥20s) → accumulation CO2/hypoxie contrôlée. La gorge relâchée (glotte ouverte) réduit la pression réflexe. Progression par paliers : +5s apnée OU −1 souffle récup selon confort (gorgeScore, spasmes).',
        isVHLStatic: true,
        duration: 12,
        cycles: 6,
        holdDuration: 20,
        restBreaths: 3,
        prepDuration: 180,
        volumeMode: 'frc',
        phases: [
            { name: 'Préparez', duration: 180, action: 'exhale' },
            { name: 'Expirez', duration: 3, action: 'holdEmpty' },
            { name: 'Pause VHL', duration: 20, action: 'holdEmpty' },
            { name: 'Récupérez', duration: 18, action: 'inhale' }
        ],
        instructions: {
            start: 'VHL Statique. Préparation cyclic sighing : double inspirez (snif sonore), expirez lentement. 3 minutes.',
            prep: 'Cyclic Sighing. Inspirez profondément, snif court, expirez lentement par le nez. Relâchez tout le visage.',
            hold: 'Expirez passivement — relâche naturelle de la poitrine. Bloque. Gorge ouverte, mâchoire relâchée. Reste passif.',
            rest: 'Respirez librement. Exactement le nombre de souffles paramétrés, puis prochain cycle.',
            complete: 'VHL Statique terminé. Notez vos sensations. La progression se fait sur 3 semaines minimum.'
        },
        warning: 'Ne jamais pratiquer en eau. Arrêter si fourmillements intenses ou perte de contrôle. L\'inconfort CO2 est attendu — la panique ne l\'est pas.'
    },

    'imst': {
        name: 'IMST — Force Inspiratoire',
        category: 'respiration',
        description: 'Inspirations forcées à haute résistance — 30 reps × 5 séries pour renforcer les muscles respiratoires',
        science: 'Craighead et al. (JAHA 2021) : 30 reps × 5 séries, 6j/sem, 6 semaines → −9 mmHg systolique (équivalent à 30 min de marche quotidienne), +9% VO2max, +12% force inspiratoire. Résistance cible : 75% MIP (Maximal Inspiratory Pressure). Sur PowerBreathe ou tout IMT threshold trainer.',
        isIMST: true,
        duration: 15,
        sets: 5,
        repsPerSet: 30,
        inhaleDuration: 2,
        exhaleDuration: 3,
        restDuration: 60,
        mode: 'device', // 'device' | 'free'
        phases: [
            { name: 'Inspirez fort !', duration: 2, action: 'inhale' },
            { name: 'Relâchez', duration: 3, action: 'exhale' }
        ],
        instructions: {
            start: 'IMST — 30 inspirations forcées par série. Inspirez le plus fort et vite possible contre la résistance. 5 séries au total.',
            inhale: 'Inspirez fort !',
            inhale_free: 'Inspiration diaphragmatique maximale !',
            exhale: 'Relâchez passivement.',
            rest: 'Repos. Respirez normalement.',
            complete: 'Session IMST terminée. 5 séries complètes. Pratique régulière 6 jours/semaine = résultats en 6 semaines.'
        },
        warning: 'Commencez à résistance modérée (50% MIP). Augmentez progressivement. Arrêtez si douleur thoracique ou vertiges.'
    },

    'breath-light-co2': {
        name: 'Respiration Réduite CO2',
        category: 'respiration',
        description: 'Réduction progressive de l\'amplitude pour générer un inconfort CO2 contrôlé',
        science: 'McKeown / Oxygen Advantage (2015) & Spengler et al. (2013, PMC3873666) : la réduction du volume courant élève progressivement la PCO2 artérielle, blunts la réponse ventilatoire hypercapnique (−45% de sensibilité au CO2 en 6 semaines) et améliore l\'effet Bohr. Technique inverse du Wim Hof : moins de volume = plus de CO2 = meilleure libération d\'O2 aux tissus.',
        duration: 7,
        isBreathLight: true, // flag pour le moteur d'exercice
        // Paramètres réglables (mode manuel/auto/optimal)
        // inhale = durée inspiration de base (phase 1)
        // exhale = durée expiration de base (ratio 1:1.5)
        // hold = durée pause post-expiration (phases 3 et 4)
        // Les phases sont progressives : chaque round réduit l'amplitude
        rounds: [
            {
                label: 'Phase 1 — Mise en place',
                durationSec: 90,
                instruction: 'Respirez normalement par le nez. Commencez à prendre conscience de votre amplitude.',
                inhale: 4,
                exhale: 6,
                hold: 0
            },
            {
                label: 'Phase 2 — Réduction inspiration',
                durationSec: 90,
                instruction: 'Réduisez légèrement l\'inspiration. À peine moins d\'air qu\'à l\'habitude. L\'inconfort doit rester léger.',
                inhale: 3,
                exhale: 6,
                hold: 0
            },
            {
                label: 'Phase 3 — Réduction + pause',
                durationSec: 120,
                instruction: 'Réduisez aussi l\'expiration. Après chaque expiration, tenez une courte pause. L\'envie de respirer augmente — c\'est normal.',
                inhale: 3,
                exhale: 5,
                hold: 3
            },
            {
                label: 'Phase 4 — Inconfort contrôlé',
                durationSec: 120,
                instruction: 'Amplitude minimale. La faim d\'air est présente — restez calme, c\'est l\'entraînement. Maintenez la pause.',
                inhale: 2.5,
                exhale: 4.5,
                hold: 4
            }
        ],
        // phases plate pour compatibilité moteur — sera overridé par isBreathLight
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Expirez', duration: 6, action: 'exhale' }
        ],
        instructions: {
            start: 'Respiration Réduite CO2 — Méthode Oxygen Advantage. 7 minutes de réduction progressive d\'amplitude pour entraîner votre tolérance au CO2.',
            'Inspirez': 'Inspiration réduite, douce, par le nez uniquement',
            'Expirez': 'Expiration contrôlée et lente, laissez l\'air sortir sans forcer',
            'Pause': 'Pause post-expiration : restez calme, tolérez l\'envie de respirer'
        },
        warning: 'Si vous ressentez des étourdissements, revenez à une respiration normale. Ne pratiquez pas en conduisant.'
    },

    'square-flow': {
        name: 'Square Flow — Cohérence Plus',
        category: 'respiration',
        description: 'Inspir contrôlé (5s) + Suspension poumons pleins (10s) + Expir fluide (5s) + Micro-apnée FRC (2s) — travail de capacité pulmonaire et de relâchement différentiel',
        science: 'La suspension prolongée poumons pleins (kumbhaka) étire le diaphragme au maximum et stimule les mécanorécepteurs pulmonaires (réflexe de Hering-Breuer), amplifiant l\'activation vagale parasympathique. La micro-apnée FRC post-expiration (2s) stabilise le CO2 résiduel et ancre le rythme. L\'ouverture latérale des côtes pendant l\'inspir active les muscles intercostaux externes, augmentant le volume courant de 15-20% sans tension cervicale.',
        isSquareFlow: true,
        duration: 10,
        cycles: 15,
        holdDuration: 10,
        phases: [
            { name: 'Inspirez', duration: 5, action: 'inhale',
              subText: 'Ouverture latérale des côtes — pas seulement le ventre.' },
            { name: 'Suspension', duration: 10, action: 'hold',
              subText: 'Relâchez les trapèzes et la mâchoire. Sentez la pression interne comme un massage.' },
            { name: 'Expirez', duration: 5, action: 'exhale',
              subText: 'Expulsez la tension avec l\'air. Vidage fluide et constant.' },
            { name: 'Immobilité', duration: 2, action: 'holdEmpty',
              subText: 'Immobilité totale.' }
        ],
        instructions: {
            start: 'Square Flow — Cohérence Plus. Installez-vous confortablement. Nous allons pratiquer la suspension poumons pleins avec relâchement différentiel.',
            'Inspirez': 'Inspirez par le nez. Ouvrez les côtes latéralement — pas seulement le ventre. Remplissage contrôlé.',
            'Suspension': 'Suspension poumons pleins. Relâchez les trapèzes et la mâchoire. Glotte ouverte. Sentez la pression interne comme un massage.',
            'Expirez': 'Expirez de façon fluide et constante. Ne lâchez pas l\'air d\'un coup — contrôlez. Expulsez la tension avec l\'air.',
            'Immobilité': 'Micro-apnée poumons vides. Immobilité totale. Préparez le prochain cycle.'
        },
        cyclesPerMinute: 2.73
    },

    'relaxation': {
        name: 'Respiration 4-7-8',
        category: 'respiration',
        description: 'Technique Dr. Andrew Weil pour l\'endormissement',
        science: 'Activation parasympathique profonde',
        duration: 4, // 4 cycles
        cycles: 4,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Retenez', duration: 7, action: 'hold' },
            { name: 'Expirez', duration: 8, action: 'exhale' }
        ],
        instructions: {
            start: 'Technique 4-7-8 : placez la langue derrière les dents du haut.',
            'Inspirez': 'Inspirez silencieusement par le nez',
            'Retenez': 'Retenez votre souffle',
            'Expirez': 'Expirez complètement par la bouche avec un son "whoosh"'
        }
    },

    // ==========================================
    // PRANAYAMA — Techniques yogiques classiques
    // ==========================================

    'pranayama-142': {
        name: 'Pranayama 1-4-2',
        category: 'respiration',
        description: 'Ratio classique yogique : inspir 1x, rétention 4x, expir 2x',
        science: 'Le ratio 1:4:2 est le fondement du Pranayama Vedique (Patanjali). La longue rétention augmente les échanges gazeux alvéolaires de 30% et stimule le nerf vague via la pression intrathoracique.',
        duration: 10,
        phases: [
            { name: 'Pūraka (Inspir)', duration: 4, action: 'inhale' },
            { name: 'Kumbhaka (Rétention)', duration: 16, action: 'hold' },
            { name: 'Rechaka (Expir)', duration: 8, action: 'exhale' }
        ],
        instructions: {
            start: 'Pranayama classique ratio 1:4:2. Asseyez-vous en posture stable, dos droit.',
            'Pūraka (Inspir)': 'Inspirez lentement par le nez en gonflant le ventre puis la poitrine',
            'Kumbhaka (Rétention)': 'Retenez le souffle, menton légèrement vers la poitrine (Jalandhara Bandha)',
            'Rechaka (Expir)': 'Expirez lentement par le nez, en vidant d\'abord la poitrine puis le ventre'
        },
        cyclesPerMinute: 2.14
    },

    'nadi-shodhana': {
        name: 'Nadi Shodhana',
        category: 'respiration',
        description: 'Respiration alternée — équilibre les deux hémisphères cérébraux',
        science: 'Étude 2019 (Telles et al.) : la respiration alternée réduit la pression artérielle systolique de 5 mmHg et augmente la cohérence inter-hémisphérique EEG de 18%. Active alternativement les systèmes sympathique et parasympathique.',
        duration: 10,
        phases: [
            { name: 'Inspir narine gauche', duration: 4, action: 'inhale', instruction: 'Fermez la narine droite avec le pouce. Inspirez par la narine gauche.' },
            { name: 'Rétention', duration: 4, action: 'hold', instruction: 'Fermez les deux narines (pouce + annulaire). Retenez.' },
            { name: 'Expir narine droite', duration: 4, action: 'exhale', instruction: 'Libérez la narine droite. Expirez par la droite.' },
            { name: 'Inspir narine droite', duration: 4, action: 'inhale', instruction: 'Gardez la gauche fermée. Inspirez par la narine droite.' },
            { name: 'Rétention ', duration: 4, action: 'hold', instruction: 'Fermez les deux narines. Retenez.' },
            { name: 'Expir narine gauche', duration: 4, action: 'exhale', instruction: 'Libérez la narine gauche. Expirez par la gauche.' }
        ],
        instructions: {
            start: 'Nadi Shodhana : respiration alternée. Main droite en Vishnu Mudra (pliez index et majeur).',
            'Inspir narine gauche': 'Inspirez par la narine gauche',
            'Rétention': 'Retenez, deux narines fermées',
            'Expir narine droite': 'Expirez par la narine droite',
            'Inspir narine droite': 'Inspirez par la narine droite',
            'Rétention ': 'Retenez, deux narines fermées',
            'Expir narine gauche': 'Expirez par la narine gauche'
        },
        cyclesPerMinute: 2.5
    },

    'kapalabhati': {
        name: 'Kapalabhati',
        category: 'respiration',
        isKapalabhati: true,
        description: 'Respiration du crâne brillant — 30 expirations forcées rapides par round, purification et énergie',
        science: 'Les expirations forcées rapides augmentent le flux sanguin cérébral de 20% (IRM fonctionnelle, 2020). Active le cortex préfrontal, améliore la vigilance et stimule le métabolisme via l\'action répétée du diaphragme.',
        duration: 5,
        cycles: 30,
        phases: [
            { name: 'Expir forcé', duration: 0.5, action: 'exhale' },
            { name: 'Inspir passif', duration: 0.5, action: 'inhale' }
        ],
        instructions: {
            start: 'Kapalabhati : 30 expirations forcées par le nez (1 round = 30 sec). Après le round, inspirez à fond et retenez autant que possible.',
            'Expir forcé': 'Expiration puissante par le nez en contractant les abdominaux',
            'Inspir passif': 'Laissez l\'air rentrer naturellement sans effort'
        },
        warning: 'Déconseillé pendant la grossesse, en cas d\'hypertension ou de problèmes cardiaques',
        cyclesPerMinute: 60
    },

    'ujjayi': {
        name: 'Ujjayi',
        category: 'respiration',
        description: 'Le souffle victorieux — respiration océanique apaisante',
        science: 'La constriction glottique partielle crée une résistance qui ralentit le flux d\'air, prolonge naturellement la respiration et augmente la pression intrathoracique. Cela stimule les barorécepteurs du sinus carotidien, activant le réflexe vagal. Études montrent une réduction de 15% de la fréquence cardiaque en 5 minutes.',
        duration: 10,
        phases: [
            { name: 'Inspirez (Ujjayi)', duration: 5, action: 'inhale' },
            { name: 'Expirez (Ujjayi)', duration: 5, action: 'exhale' }
        ],
        instructions: {
            start: 'Ujjayi : contractez légèrement la glotte (comme pour embuer une vitre) et respirez par le nez. Un son doux et régulier d\'océan doit accompagner chaque souffle.',
            'Inspirez (Ujjayi)': 'Inspirez par le nez, gorge légèrement contractée, créant un son doux',
            'Expirez (Ujjayi)': 'Expirez par le nez, même constriction glottique, même son régulier'
        },
        cyclesPerMinute: 6
    },

    'bhramari': {
        name: 'Bhramari',
        category: 'respiration',
        description: 'Le souffle de l\'abeille — vibration et calme profond',
        science: 'Le bourdonnement produit une vibration à 130-350 Hz qui stimule le nerf vague via les vibrations du palais et des sinus. Étude 2017 (Kuppusamy et al.) : 10 minutes de Bhramari réduisent la fréquence cardiaque de 7 bpm et augmentent la production d\'oxyde nitrique nasal de 15x, améliorant l\'oxygénation.',
        duration: 5,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Bourdonnez (Mmm)', duration: 8, action: 'exhale' }
        ],
        instructions: {
            start: 'Bhramari : inspirez par le nez, puis expirez en produisant un bourdonnement "Mmmmm" continu. Optionnel : fermez les oreilles avec les pouces (Shanmukhi Mudra).',
            'Inspirez': 'Inspiration profonde et silencieuse par le nez',
            'Bourdonnez (Mmm)': 'Expirez en bourdonnant "Mmmmm" — sentez la vibration dans le crâne'
        },
        cyclesPerMinute: 5
    },

    'surya-bhedana': {
        name: 'Surya Bhedana',
        category: 'respiration',
        description: 'Respiration solaire — énergie et chaleur interne',
        science: 'L\'inspiration par la narine droite active préférentiellement le système nerveux sympathique et l\'hémisphère gauche (logique, énergie). Études (Telles, 2017) montrent une augmentation de 12% du métabolisme basal et de la température corporelle. Idéal avant une activité physique ou mentale intense.',
        duration: 5,
        phases: [
            { name: 'Inspir narine droite', duration: 4, action: 'inhale', instruction: 'Fermez la narine gauche. Inspirez par la droite.' },
            { name: 'Rétention', duration: 8, action: 'hold', instruction: 'Fermez les deux narines.' },
            { name: 'Expir narine gauche', duration: 6, action: 'exhale', instruction: 'Expirez par la narine gauche.' }
        ],
        instructions: {
            start: 'Surya Bhedana : respiration solaire activante. Inspirez par la droite, expirez par la gauche.',
            'Inspir narine droite': 'Inspirez lentement par la narine droite',
            'Rétention': 'Retenez le souffle, deux narines fermées',
            'Expir narine gauche': 'Expirez doucement par la narine gauche'
        },
        cyclesPerMinute: 3.33
    },

    // ==========================================
    // VISUALISATION EXERCISES
    // ==========================================

    'body-scan': {
        name: 'Body Scan',
        category: 'visualisation',
        description: 'Parcours attentionnel systématique du corps',
        science: 'Améliore la conscience corporelle et active le système parasympathique',
        duration: 15,
        isGuided: true,
        segments: [
            { zone: 'pieds', duration: 40, instruction: 'Portez votre attention sur vos pieds. Sentez le contact avec le sol, la température, les sensations.' },
            { zone: 'chevilles et mollets', duration: 45, instruction: 'Remontez vers vos chevilles et mollets. Observez toute tension ou détente.' },
            { zone: 'genoux et cuisses', duration: 50, instruction: 'Continuez vers vos genoux et cuisses. Grande zone musculaire. Laissez ces muscles se relâcher.' },
            { zone: 'bassin et hanches', duration: 50, instruction: 'Portez attention à votre bassin et vos hanches. Respirez dans cette zone.' },
            { zone: 'abdomen', duration: 60, instruction: 'Sentez votre abdomen se soulever et s\'abaisser avec la respiration. Centre de votre être.' },
            { zone: 'poitrine', duration: 50, instruction: 'Observez votre poitrine. Sentez votre cœur battre calmement.' },
            { zone: 'dos', duration: 60, instruction: 'Parcourez votre dos du bas vers le haut. Relâchez chaque vertèbre, une par une.' },
            { zone: 'épaules et bras', duration: 50, instruction: 'Détendez vos épaules, laissez vos bras devenir lourds et chauds.' },
            { zone: 'mains', duration: 35, instruction: 'Sentez vos mains, chaque doigt. Notez les sensations de chaleur.' },
            { zone: 'cou et gorge', duration: 40, instruction: 'Relâchez votre cou et votre gorge. Zone de tension fréquente. Laissez aller.' },
            { zone: 'visage', duration: 50, instruction: 'Détendez votre mâchoire, vos joues, vos yeux, votre front. Lissez chaque muscle.' },
            { zone: 'crâne', duration: 30, instruction: 'Sentez votre crâne, le sommet de votre tête. Imaginez une douce lumière.' },
            { zone: 'corps entier', duration: 75, instruction: 'Percevez maintenant votre corps entier, unifié et détendu. Savourez cette sensation de complétude.' }
        ],
        instructions: {
            start: 'Allongez-vous confortablement. Fermez les yeux et respirez naturellement.'
        }
    },

    'pettlep': {
        name: 'Visualisation PETTLEP',
        category: 'visualisation',
        description: 'Protocole en 7 points des athlètes olympiques',
        science: 'Active les mêmes circuits neuronaux que l\'exécution motrice réelle',
        duration: 10,
        isGuided: true,
        segments: [
            { phase: 'Physical', duration: 60, instruction: 'Adoptez la position physique de votre performance. Portez votre tenue mentalement.' },
            { phase: 'Environment', duration: 60, instruction: 'Visualisez l\'environnement en détail : sons, odeurs, température, lumière.' },
            { phase: 'Task', duration: 120, instruction: 'Imaginez la tâche complète avec tous les détails techniques. Voyez chaque mouvement.' },
            { phase: 'Timing', duration: 120, instruction: 'Exécutez mentalement en temps réel. Ne précipitez pas l\'action.' },
            { phase: 'Learning', duration: 60, instruction: 'Visualisez la version améliorée de votre technique. Ajoutez la progression.' },
            { phase: 'Emotion', duration: 60, instruction: 'Ressentez les émotions : confiance, concentration, détermination.' },
            { phase: 'Perspective', duration: 60, instruction: 'Voyez depuis l\'intérieur de votre corps (1ère personne). Sentez les mouvements.' }
        ],
        instructions: {
            start: 'Protocole PETTLEP : imagerie multi-sensorielle utilisée par 70-90% des olympiens.'
        }
    },

    'sophro': {
        name: 'Relaxation Dynamique',
        category: 'visualisation',
        description: 'Méthode IRTER de sophrologie niveau 1',
        science: 'RCT 2019 - Efficace pour réduire anxiété et dépression',
        duration: 20,
        isGuided: true,
        segments: [
            { phase: 'Ancrage', duration: 45, instruction: 'Sentez le contact de votre corps avec le support. Vous êtes stable et en sécurité.' },
            { phase: 'Respiration', duration: 60, instruction: 'Respirez calmement. Chaque expiration approfondit votre relaxation.' },
            { phase: 'IRTER - Tête', duration: 45, instruction: 'Inspirez, retenez, contractez les muscles du visage 5 secondes, expirez, relâchez complètement.' },
            { phase: 'IRTER - Épaules', duration: 45, instruction: 'Inspirez, retenez, haussez les épaules avec force 5 secondes, expirez, laissez tomber.' },
            { phase: 'IRTER - Bras', duration: 45, instruction: 'Inspirez, retenez, serrez les poings très fort 5 secondes, expirez, ouvrez les mains.' },
            { phase: 'IRTER - Abdomen', duration: 45, instruction: 'Inspirez, retenez, contractez l\'abdomen 5 secondes, expirez, relâchez le ventre.' },
            { phase: 'IRTER - Jambes', duration: 45, instruction: 'Inspirez, retenez, pointez les orteils et contractez 5 secondes, expirez, relâchez.' },
            { phase: 'IRTER - Corps', duration: 60, instruction: 'Inspirez, retenez, contractez tout le corps 5 secondes, expirez, relâchement total. Savourez.' },
            { phase: 'Visualisation', duration: 120, instruction: 'Visualisez un lieu de paix. Voyez les couleurs, sentez la température, écoutez les sons.' },
            { phase: 'Intégration', duration: 90, instruction: 'Accueillez cette sensation de calme profond. Elle est maintenant en vous, disponible à tout moment.' },
            { phase: 'Retour', duration: 45, instruction: 'Doucement, reprenez conscience de la pièce. Bougez les doigts, les orteils. Ouvrez les yeux.' }
        ],
        instructions: {
            start: 'Relaxation dynamique sophrologique. Méthode IRTER : Inspiration-Rétention-Tension-Expiration-Relâchement.'
        }
    },

    'pmr': {
        name: 'Relaxation Musculaire Progressive',
        category: 'visualisation',
        description: 'Méthode Jacobson de contraction-relâchement',
        science: 'Validée sur 3400+ participants - Réduit stress, anxiété, dépression',
        duration: 15,
        isGuided: true,
        segments: [
            { muscle: 'Main droite', duration: 25, instruction: 'Serrez le poing droit très fort pendant 5 secondes... puis relâchez complètement. Observez la différence.' },
            { muscle: 'Main gauche', duration: 25, instruction: 'Serrez le poing gauche très fort 5 secondes... et relâchez. Sentez la détente.' },
            { muscle: 'Avant-bras droit', duration: 25, instruction: 'Fléchissez le poignet droit vers vous 5 secondes... et relâchez.' },
            { muscle: 'Avant-bras gauche', duration: 25, instruction: 'Fléchissez le poignet gauche 5 secondes... et relâchez.' },
            { muscle: 'Biceps', duration: 25, instruction: 'Contractez les deux biceps 5 secondes, montrez vos muscles... et relâchez.' },
            { muscle: 'Épaules', duration: 30, instruction: 'Haussez les épaules vers les oreilles 5 secondes... et laissez tomber d\'un coup.' },
            { muscle: 'Front', duration: 25, instruction: 'Levez les sourcils très haut 5 secondes... et relâchez le front.' },
            { muscle: 'Yeux', duration: 25, instruction: 'Fermez les yeux très fort 5 secondes... et détendez.' },
            { muscle: 'Mâchoire', duration: 25, instruction: 'Serrez les dents 5 secondes... et laissez la mâchoire s\'ouvrir légèrement.' },
            { muscle: 'Cou', duration: 25, instruction: 'Poussez la tête vers l\'arrière 5 secondes... et revenez au neutre.' },
            { muscle: 'Poitrine', duration: 30, instruction: 'Inspirez profondément, retenez 5 secondes... et expirez en relâchant tout.' },
            { muscle: 'Abdomen', duration: 25, instruction: 'Contractez l\'abdomen comme pour un coup 5 secondes... et relâchez.' },
            { muscle: 'Cuisses', duration: 25, instruction: 'Contractez les cuisses 5 secondes... et relâchez.' },
            { muscle: 'Mollets', duration: 25, instruction: 'Pointez les orteils vers le bas 5 secondes... et relâchez.' },
            { muscle: 'Pieds', duration: 25, instruction: 'Recourbez les orteils 5 secondes... et détendez complètement.' }
        ],
        instructions: {
            start: 'Relaxation musculaire progressive. Contractez chaque groupe musculaire 5 secondes, puis relâchez 15-20 secondes.'
        }
    },

    'focus': {
        name: 'Entraînement Focus',
        category: 'visualisation',
        description: 'Technique du spotlight pour la concentration',
        science: 'La concentration cognitive suit la concentration visuelle',
        duration: 10,
        isGuided: true,
        segments: [
            { phase: 'Centrage', duration: 60, instruction: 'Fermez les yeux. Respirez calmement. Trouvez votre centre.' },
            { phase: 'Visualisation', duration: 60, instruction: 'Imaginez un faisceau de lumière qui descend sur vous depuis le ciel.' },
            { phase: 'Point focal', duration: 90, instruction: 'Cette lumière se concentre en un point devant vous. Très brillant, très net.' },
            { phase: 'Expansion', duration: 60, instruction: 'Le faisceau illumine l\'objet de votre concentration. Tout le reste est dans l\'ombre.' },
            { phase: 'Maintien', duration: 180, instruction: 'Maintenez votre attention sur ce point lumineux. Si l\'esprit vagabonde, ramenez doucement le faisceau.' },
            { phase: 'Intensification', duration: 90, instruction: 'Augmentez la luminosité. Votre focus devient plus intense, plus clair.' },
            { phase: 'Intégration', duration: 60, instruction: 'Cette capacité de focus est en vous. Vous pouvez y accéder à tout moment.' }
        ],
        instructions: {
            start: 'Entraînement à la concentration par la méthode du spotlight.'
        }
    },

    'predive': {
        name: 'Visualisation Pré-Plongée',
        category: 'visualisation',
        description: 'Routine mentale complète de l\'apnéiste',
        science: 'Réduit l\'anxiété de 20%+ et améliore la performance',
        duration: 10,
        isGuided: true,
        segments: [
            { phase: 'Préparation', duration: 45, instruction: 'Vous êtes sur le bord, calme et prêt. Sentez la température de l\'air sur votre peau.' },
            { phase: 'Respiration', duration: 75, instruction: 'Visualisez votre breathe-up. Respirations lentes, profondes, détendues. Votre cœur ralentit.' },
            { phase: 'Dernière inspiration', duration: 30, instruction: 'Voyez-vous prendre votre dernière grande inspiration. Poumons pleins. Calme total.' },
            { phase: 'Immersion', duration: 40, instruction: 'L\'eau fraîche enveloppe votre visage. Le réflexe de plongée s\'active. Votre cœur ralentit.' },
            { phase: 'Descente', duration: 120, instruction: 'Vous descendez sans effort. La pression augmente doucement. Vous équilibrez naturellement. Chaque mètre est une méditation.' },
            { phase: 'Fond', duration: 75, instruction: 'Vous atteignez votre profondeur cible. Moment de calme absolu. Le silence est total. Vous êtes serein.' },
            { phase: 'Remontée', duration: 75, instruction: 'Vous remontez avec aisance. Le bleu devient plus clair, plus lumineux. Vous êtes patient.' },
            { phase: 'Surface', duration: 35, instruction: 'Vous percez la surface. Récupération calme, contrôlée, souriant. Hook breath.' },
            { phase: 'Succès', duration: 50, instruction: 'Ressentez la satisfaction profonde. Vous avez réussi. Cette plongée est ancrée en vous.' }
        ],
        instructions: {
            start: 'Visualisation pré-plongée. Imaginez votre plongée parfaite dans les moindres détails.'
        }
    },

    // ==========================================
    // APNEA EXERCISES
    // ==========================================

    'co2-table': {
        name: 'Table CO2',
        category: 'apnee',
        description: 'Apnées constantes avec repos décroissant',
        science: 'Développe la tolérance à l\'accumulation de dioxyde de carbone',
        isApneaTable: true,
        tableType: 'co2',
        cycles: 8,
        // Will be calculated based on personal best
        // Default: 50% of max hold, rest decreases from 1:45 to 0:15
        defaultHoldPercent: 0.5,
        restPattern: [105, 90, 75, 60, 45, 30, 20, 15], // seconds
        instructions: {
            start: 'Table CO2 : apnées constantes avec temps de repos décroissant.',
            breathe: 'Respirez calmement et préparez-vous',
            hold: 'Retenez votre souffle, restez détendu'
        }
    },

    'o2-table': {
        name: 'Table O2',
        category: 'apnee',
        description: 'Apnées progressives avec repos constant',
        science: 'Adapte le corps aux faibles niveaux d\'oxygène',
        isApneaTable: true,
        tableType: 'o2',
        cycles: 8,
        // Will be calculated based on personal best
        // Starts at ~30% of max, ends at ~80% of max
        holdPattern: [0.3, 0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
        restDuration: 120, // 2 minutes constant rest
        instructions: {
            start: 'Table O2 : apnées progressives avec repos constant de 2 minutes.',
            breathe: 'Récupérez pendant 2 minutes',
            hold: 'Retenez votre souffle'
        }
    },

    'no-contraction': {
        name: 'Table Sans Contraction',
        category: 'apnee',
        description: 'Méthode douce pour débutants',
        science: 'Développe une relation saine avec l\'envie de respirer',
        isApneaTable: true,
        tableType: 'no-contraction',
        cycles: 6,
        // Stop BEFORE any contractions
        instructions: {
            start: 'Table sans contraction : arrêtez AVANT toute envie de respirer.',
            breathe: 'Respirez calmement',
            hold: 'Retenez jusqu\'à la première envie légère de respirer, puis arrêtez'
        },
        restDuration: 60
    },

    'comfort-zone': {
        name: 'Zone de Confort',
        category: 'apnee',
        description: 'Apnée libre — arrêtez dès l\'inconfort pour progresser naturellement',
        science: 'L\'entraînement en zone de confort développe la tolérance au CO2 sans stress, favorisant une progression durable et une meilleure relaxation en apnée.',
        isComfortZone: true,
        cycles: 5,
        restDuration: 120,
        breatheUpDuration: 60,
        maxHoldDuration: 300,
        instructions: {
            start: 'Installez-vous confortablement. Respirez calmement.',
            breathe: 'Respirez lentement et profondément.',
            hold: 'Apnée. Restez détendu. Arrêtez dès la moindre gêne.',
            stop: 'Bravo ! Respirez calmement.'
        }
    },

    'comfort-zone-frc': {
        name: 'Zone de Confort FRC',
        category: 'apnee',
        description: 'Apnée FRC poumons vides — expirez normalement, retenez, arrêtez dès l\'inconfort',
        science: 'L\'apnée FRC (Functional Residual Capacity) après expiration normale développe une forte tolérance au CO2 avec moins d\'oxygène disponible. C\'est un entraînement plus exigeant qui accélère l\'adaptation physiologique et renforce le réflexe de plongée.',
        isComfortZone: true,
        isFrc: true,
        cycles: 5,
        restDuration: 120,
        breatheUpDuration: 60,
        maxHoldDuration: 180,
        instructions: {
            start: 'Installez-vous confortablement. Respirez calmement.',
            breathe: 'Respirez calmement et naturellement.',
            hold: 'Expirez normalement… puis retenez. Restez détendu. Arrêtez dès la moindre gêne.',
            stop: 'Bravo ! Respirez calmement.'
        }
    },

    'dive-reflex': {
        name: 'Réflexe de Plongée',
        category: 'apnee',
        description: 'Exercices pour optimiser la bradycardie',
        science: 'Les apnéistes entraînés atteignent 20-24 bpm vs 40-60 bpm',
        duration: 10,
        isGuided: true,
        requiresWater: true,
        segments: [
            { phase: 'Préparation', duration: 60, instruction: 'Préparez un bol d\'eau froide (10-15°C). Asseyez-vous confortablement.' },
            { phase: 'Relaxation', duration: 90, instruction: 'Respirez calmement. Diminuez progressivement votre fréquence respiratoire.' },
            { phase: 'Immersion 1', duration: 30, instruction: 'Inspirez, retenez, et plongez le visage dans l\'eau froide 20-30 secondes.' },
            { phase: 'Récupération 1', duration: 60, instruction: 'Ressortez et respirez calmement. Notez le ralentissement cardiaque.' },
            { phase: 'Immersion 2', duration: 40, instruction: 'Inspirez, plongez le visage, cette fois 30-40 secondes.' },
            { phase: 'Récupération 2', duration: 60, instruction: 'Récupérez. Le réflexe de plongée s\'active plus rapidement.' },
            { phase: 'Immersion 3', duration: 45, instruction: 'Dernière immersion, 40-45 secondes. Restez parfaitement détendu.' },
            { phase: 'Intégration', duration: 90, instruction: 'Respirez normalement. Votre corps a appris à déclencher ce réflexe.' }
        ],
        instructions: {
            start: 'Entraînement du réflexe de plongée mammalien. Vous aurez besoin d\'eau froide.'
        }
    },

    'lung-stretch': {
        name: 'Étirements Pulmonaires',
        category: 'apnee',
        description: 'Uddiyana bandha et étirements intercostaux',
        science: 'Augmente la capacité vitale et la flexibilité thoracique',
        duration: 10,
        isGuided: true,
        segments: [
            { phase: 'Échauffement', duration: 60, instruction: 'Respirez profondément plusieurs fois. Mobilisez doucement le thorax.' },
            { phase: 'Étirement latéral droit', duration: 45, instruction: 'Inspirez à fond, bras droit au-dessus, penchez à gauche. Sentez l\'étirement.' },
            { phase: 'Étirement latéral gauche', duration: 45, instruction: 'Même chose de l\'autre côté. Bras gauche au-dessus, penchez à droite.' },
            { phase: 'Extension arrière', duration: 45, instruction: 'Inspirez à fond, les deux bras levés, arquez légèrement le dos.' },
            { phase: 'Uddiyana Bandha 1', duration: 60, instruction: 'Expirez complètement. Fermez la glotte. Tirez l\'abdomen vers le haut et l\'intérieur.' },
            { phase: 'Récupération', duration: 30, instruction: 'Relâchez et respirez normalement.' },
            { phase: 'Uddiyana Bandha 2', duration: 60, instruction: 'Expirez complètement. Créez le vide abdominal. Tenez 10-15 secondes.' },
            { phase: 'Récupération', duration: 30, instruction: 'Relâchez doucement.' },
            { phase: 'Uddiyana Bandha 3', duration: 60, instruction: 'Dernière répétition. Expirez, rentrez, maintenez.' },
            { phase: 'Intégration', duration: 45, instruction: 'Respirez normalement. Sentez l\'espace créé dans votre thorax.' }
        ],
        instructions: {
            start: 'Étirements pulmonaires. Pratiquez à jeun pour Uddiyana Bandha.'
        },
        warning: 'Pratiquer à jeun. Progresser doucement pour éviter les blessures.'
    },

    'diaphragm': {
        name: 'Respiration Diaphragmatique',
        category: 'apnee',
        description: 'Maîtrise de la respiration abdominale en 3 temps',
        science: 'Fondement de tout entraînement apnée - maximise le volume courant',
        duration: 10,
        phases: [
            { name: 'Ventre', duration: 4, action: 'inhale', instruction: 'Gonflez le ventre comme un ballon' },
            { name: 'Côtes', duration: 3, action: 'inhale', instruction: 'Élargissez les côtes latéralement' },
            { name: 'Poitrine', duration: 2, action: 'inhale', instruction: 'Soulevez légèrement la poitrine' },
            { name: 'Pause', duration: 1, action: 'hold', instruction: 'Courte pause poumons pleins' },
            { name: 'Relâchement', duration: 8, action: 'exhale', instruction: 'Laissez l\'air sortir naturellement' }
        ],
        instructions: {
            start: 'Respiration diaphragmatique en 3 temps : ventre, côtes, poitrine.',
            'Ventre': 'Gonflez le ventre en premier',
            'Côtes': 'Élargissez les côtes',
            'Poitrine': 'Soulevez la poitrine',
            'Pause': 'Courte pause',
            'Relâchement': 'Expiration passive et lente'
        },
        cyclesPerMinute: 3.3
    },

    // ==========================================
    // URGENCE / PANIC EXERCISES
    // ==========================================

    'physiological-sigh': {
        name: 'Soupir Physiologique',
        category: 'urgence',
        description: 'Reset nerveux immédiat — 3 cycles suffisent, utilisez au moment du stress ou de la panique',
        science: 'Stanford 2023 — Même double inspiration que le Cyclic Sighing, mais en version SOS : 3 cycles ciblés pour une action immédiate plutôt qu\'une pratique de 5 minutes. Réouvre les alvéoles affaissées et déclenche le frein vagal en quelques secondes.',
        duration: 0.5, // 30 seconds
        cycles: 3,
        phases: [
            { name: 'Inspirez', duration: 2, action: 'inhale' },
            { name: 'Inspirez +', duration: 1, action: 'inhale' },
            { name: 'Expirez longuement', duration: 7, action: 'exhale' }
        ],
        instructions: {
            start: 'Soupir physiologique : le reset le plus rapide pour votre système nerveux.',
            'Inspirez': 'Inspirez par le nez',
            'Inspirez +': 'Une seconde inspiration courte pour remplir complètement',
            'Expirez longuement': 'Longue expiration par la bouche, laissez tout sortir'
        }
    },

    'grounding-555': {
        name: 'Ancrage 5-5-5',
        category: 'urgence',
        description: 'Technique de grounding pour revenir au présent',
        science: 'Interrompt le cycle de rumination et reconnecte au corps',
        duration: 2,
        isGuided: true,
        segments: [
            { phase: 'Respiration', duration: 15, instruction: 'Prenez 3 respirations lentes et profondes.' },
            { phase: '5 choses vues', duration: 30, instruction: 'Regardez autour de vous et nommez mentalement 5 choses que vous VOYEZ.' },
            { phase: '5 sons', duration: 30, instruction: 'Écoutez attentivement et identifiez 5 SONS autour de vous.' },
            { phase: '5 sensations', duration: 30, instruction: 'Notez 5 sensations TACTILES : vêtements, sol, température...' },
            { phase: 'Ancrage', duration: 15, instruction: 'Respirez. Vous êtes ici, maintenant, en sécurité.' }
        ],
        instructions: {
            start: 'Technique 5-5-5 : reconnectez-vous au moment présent.'
        }
    },

    'extended-exhale': {
        name: 'Expiration Prolongée',
        category: 'urgence',
        description: 'Ratio 1:2 pour activation parasympathique rapide',
        science: 'L\'expiration longue stimule directement le nerf vague',
        duration: 2,
        cycles: 10,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Expirez lentement', duration: 8, action: 'exhale' }
        ],
        instructions: {
            start: 'Expiration prolongée : inspirez 4 secondes, expirez 8 secondes.',
            'Inspirez': 'Inspiration calme par le nez',
            'Expirez lentement': 'Expiration très lente, comme à travers une paille'
        }
    },

    'box-quick': {
        name: 'Box Breathing Rapide',
        category: 'urgence',
        description: 'Version courte pour reprendre le contrôle',
        science: 'Technique Navy SEALs - efficace en 4-6 cycles',
        duration: 2,
        cycles: 6,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Retenez', duration: 4, action: 'hold' },
            { name: 'Expirez', duration: 4, action: 'exhale' },
            { name: 'Retenez', duration: 4, action: 'hold' }
        ],
        instructions: {
            start: 'Box breathing rapide : 6 cycles pour reprendre le contrôle.',
            'Inspirez': 'Inspirez par le nez',
            'Retenez': 'Poumons pleins, restez calme',
            'Expirez': 'Expirez complètement',
            'Retenez ': 'Poumons vides, détendez-vous'
        }
    },

    // ==========================================
    // PRÉ-PERFORMANCE EXERCISES
    // ==========================================

    'preperf-protocol': {
        name: 'Protocole 5 Minutes',
        category: 'preperformance',
        description: 'Séquence complète de préparation optimale',
        science: 'Combine relaxation musculaire, cohérence et visualisation',
        duration: 5,
        isGuided: true,
        segments: [
            { phase: 'Ancrage', duration: 20, instruction: 'Fermez les yeux. Sentez vos pieds au sol. Vous êtes stable.' },
            { phase: 'Scan rapide', duration: 30, instruction: 'Parcourez rapidement votre corps. Relâchez toute tension : mâchoire, épaules, mains.' },
            { phase: 'Respiration 1', duration: 30, instruction: 'Respirez lentement. Inspiration 5s, expiration 5s. Trouvez votre rythme.' },
            { phase: 'Respiration 2', duration: 30, instruction: 'Continuez. Chaque expiration vous détend davantage.' },
            { phase: 'Respiration 3', duration: 30, instruction: 'Votre cœur se synchronise. Vous êtes calme et alerte.' },
            { phase: 'Activation', duration: 20, instruction: 'Ressentez une énergie calme monter en vous. Vous êtes prêt.' },
            { phase: 'Visualisation', duration: 60, instruction: 'Visualisez votre performance parfaite. Voyez chaque détail avec confiance.' },
            { phase: 'Intention', duration: 30, instruction: 'Fixez votre intention. Que voulez-vous accomplir ? Voyez-le réalisé.' },
            { phase: 'Ancrage final', duration: 20, instruction: 'Prenez une grande inspiration. Vous êtes prêt. Allez-y.' },
            { phase: 'GO', duration: 10, instruction: 'Ouvrez les yeux. C\'est votre moment.' }
        ],
        instructions: {
            start: 'Protocole pré-performance : 5 minutes pour atteindre votre état optimal.'
        }
    },

    'dive-prep': {
        name: 'Préparation Plongée',
        category: 'preperformance',
        description: 'Breathe-up optimisé pour apnée et chasse',
        science: 'Active le réflexe de plongée et optimise les réserves d\'O2',
        duration: 5,
        isGuided: true,
        segments: [
            { phase: 'Position', duration: 20, instruction: 'Allongez-vous ou installez-vous confortablement. Relâchez tout.' },
            { phase: 'Relâchement', duration: 30, instruction: 'Scannez votre corps. Relâchez mâchoire, épaules, abdomen.' },
            { phase: 'Diaphragme 1', duration: 40, instruction: 'Respiration abdominale lente. Gonflez le ventre à l\'inspiration.' },
            { phase: 'Diaphragme 2', duration: 40, instruction: 'Continuez. Expiration passive, laissez l\'air sortir naturellement.' },
            { phase: 'Ralentissement', duration: 30, instruction: 'Ralentissez encore. Sentez votre cœur se calmer.' },
            { phase: 'Visualisation descente', duration: 40, instruction: 'Visualisez votre descente. Vous glissez sans effort dans le bleu.' },
            { phase: 'Visualisation fond', duration: 30, instruction: 'Vous atteignez votre profondeur. Calme absolu. Confiance totale.' },
            { phase: 'Visualisation remontée', duration: 30, instruction: 'Remontée sereine. Vous percez la surface, souriant.' },
            { phase: 'Dernières respirations', duration: 30, instruction: 'Respirations finales. Lentes, profondes, détendues.' },
            { phase: 'Prêt', duration: 10, instruction: 'Vous êtes prêt. Bonne plongée.' }
        ],
        instructions: {
            start: 'Préparation plongée : breathe-up et visualisation pour une apnée optimale.'
        }
    },

    'quick-coherence': {
        name: 'Cohérence Express',
        category: 'preperformance',
        description: 'Cohérence cardiaque en 3 minutes',
        science: 'Suffisant pour synchroniser le cœur et améliorer la HRV',
        duration: 3,
        phases: [
            { name: 'Inspirez', duration: 5, action: 'inhale' },
            { name: 'Expirez', duration: 5, action: 'exhale' }
        ],
        instructions: {
            start: 'Cohérence express : 3 minutes pour synchroniser cœur et respiration.',
            'Inspirez': 'Inspirez doucement en 5 secondes',
            'Expirez': 'Expirez doucement en 5 secondes'
        },
        cyclesPerMinute: 6
    },

    'power-viz': {
        name: 'Visualisation Express',
        category: 'preperformance',
        description: 'Visualisation rapide de performance optimale',
        science: 'Imagerie mentale - active les circuits moteurs et émotionnels',
        duration: 2,
        isGuided: true,
        segments: [
            { phase: 'Centrage', duration: 15, instruction: 'Fermez les yeux. 3 respirations profondes.' },
            { phase: 'Image de succès', duration: 45, instruction: 'Visualisez-vous en train de réussir parfaitement. Chaque détail.' },
            { phase: 'Ressenti', duration: 30, instruction: 'Ressentez la confiance, la maîtrise, la satisfaction du succès.' },
            { phase: 'Ancrage', duration: 20, instruction: 'Ancrez cette sensation. Elle est en vous, disponible maintenant.' },
            { phase: 'Activation', duration: 10, instruction: 'Ouvrez les yeux. Vous êtes cet athlète confiant.' }
        ],
        instructions: {
            start: 'Visualisation express : voyez et ressentez votre succès en 2 minutes.'
        }
    },

    // ==========================================
    // VISUALISATION - SOMMEIL
    // ==========================================

    'sleep-descent': {
        name: 'Descente vers le Sommeil',
        category: 'visualisation',
        description: 'Protocole d\'endormissement progressif en 7 minutes',
        science: 'Combine relaxation musculaire progressive, respiration 4-7-8 et imagerie hypnagogique',
        duration: 7,
        isGuided: true,
        segments: [
            { phase: 'Installation', duration: 30, instruction: 'Allongez-vous confortablement. Fermez les yeux. Vous n\'avez plus rien à faire.' },
            { phase: 'Respiration 4-7-8', duration: 60, instruction: 'Inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes. Répétez 3 fois.' },
            { phase: 'Relâchement visage', duration: 30, instruction: 'Détendez votre front, vos yeux, votre mâchoire. Laissez votre langue se poser mollement.' },
            { phase: 'Relâchement épaules', duration: 30, instruction: 'Vos épaules s\'enfoncent dans le matelas. Lourdes. Détendues.' },
            { phase: 'Relâchement bras', duration: 30, instruction: 'Vos bras deviennent lourds, très lourds. Impossibles à soulever.' },
            { phase: 'Relâchement jambes', duration: 30, instruction: 'Vos jambes s\'alourdissent. Vos pieds sont chauds et détendus.' },
            { phase: 'Descente niveau 1', duration: 45, instruction: 'Imaginez un escalier qui descend. Vous êtes sur la première marche. Descendez lentement.' },
            { phase: 'Descente niveau 2', duration: 45, instruction: 'Chaque marche vous rapproche du sommeil. 10... 9... 8... Plus profond.' },
            { phase: 'Descente niveau 3', duration: 45, instruction: '7... 6... 5... Votre corps est si lourd qu\'il ne peut plus bouger.' },
            { phase: 'Descente niveau 4', duration: 45, instruction: '4... 3... 2... Vous flottez maintenant dans un espace doux et sombre.' },
            { phase: 'Arrivée', duration: 30, instruction: '1... Vous êtes arrivé. Un lieu de calme absolu. Laissez-vous glisser dans le sommeil.' },
            { phase: 'Silence', duration: 60, instruction: '...' }
        ],
        instructions: {
            start: 'Protocole d\'endormissement. Laissez-vous guider vers un sommeil profond et réparateur.'
        }
    },

    'deep-sleep-478': {
        name: 'Deep Sleep 4-7-8',
        category: 'visualisation',
        description: 'Endormissement profond : blocs 4-7-8 guidés + body scan progressif — 5 à 45 min',
        science: 'Méthode Dr. Andrew Weil — activation GABA et parasympathique profond',
        duration: 15,
        isDeepSleep: true,
        instructions: {
            start:     'Allongez-vous. Fermez les yeux. Vous n\'avez plus rien à faire ce soir.',
            inhale478: 'Inspirez',
            hold478:   'Retenez',
            exhale478: 'Expirez'
        },
        installation: { duration: 30, instruction: 'Allongez-vous. Fermez les yeux. Vous n\'avez plus rien à faire.' },
        segments: [
            { zone: 'Respiration naturelle', duration: 20,  instruction: 'Observez votre respiration naturelle. Ne la contrôlez pas.' },
            { zone: 'Sommet du crâne',       duration: 25,  instruction: 'Portez toute votre attention au sommet de votre crâne. Sentez-le se détendre.' },
            { zone: 'Visage',                duration: 30,  instruction: 'Votre front se détend. Vos yeux sont lourds, très lourds.' },
            { zone: 'Mâchoire et cou',       duration: 25,  instruction: 'Laissez votre mâchoire s\'entrouvrir légèrement. Le cou se relâche.' },
            { zone: 'Épaules',               duration: 30,  instruction: 'Vos épaules s\'enfoncent dans le matelas. Lourdes.' },
            { zone: 'Bras et mains',         duration: 30,  instruction: 'Vos bras sont si lourds qu\'il serait impossible de les soulever.' },
            { zone: 'Poitrine',              duration: 25,  instruction: 'Votre poitrine monte et descend doucement. Sans effort.' },
            { zone: 'Ventre',                duration: 25,  instruction: 'Votre ventre se détend complètement. Chaque expiration apporte plus de paix.' },
            { zone: 'Bas du dos',            duration: 25,  instruction: 'Le bas de votre dos s\'enfonce, soutenu, en sécurité.' },
            { zone: 'Jambes',                duration: 30,  instruction: 'Vos jambes sont lourdes, très lourdes. Elles ne pourraient pas bouger.' },
            { zone: 'Pieds',                 duration: 25,  instruction: 'Vos pieds sont chauds et détendus. Toute tension a disparu.' },
            { zone: 'Corps entier',          duration: 35,  instruction: 'Tout votre corps est lourd, détendu, en sécurité. Comme fondu dans le matelas.' },
            { zone: 'Dissolution',           duration: 40,  instruction: 'Laissez votre conscience se dissoudre doucement dans le silence et le sommeil.' }
        ]
        // Base body scan total = 365s
        // Budget body scan (15 min) = 900 - 30 - 76 - 76 = 718s → ratio ≈ 1.97
    },

    // ==========================================
    // AUTO-HYPNOSE APNÉE
    // ==========================================

    'vakog-static': {
        name: 'VAKOG Statique',
        category: 'autohypnose',
        description: 'Fragmentation sensorielle pour apnée statique',
        science: 'Auto-hypnose par dissociation VAKOG - Réduit la perception des spasmes de 40%',
        duration: 12,
        isGuided: true,
        segments: [
            { phase: 'Installation', duration: 30, instruction: 'Position de statique. Respirez calmement. Préparez votre breathe-up habituel.' },
            { phase: 'Ancrage corporel', duration: 30, instruction: 'Sentez le contact de l\'eau ou du sol. Vous êtes stable, ancré, présent.' },

            // Phase VAKOG - Auditif Externe
            { phase: 'Auditif externe', duration: 45, instruction: 'Écoutez un son lointain. Le plus éloigné que vous puissiez percevoir. Focalisez-vous dessus.' },
            { phase: 'Auditif externe 2', duration: 30, instruction: 'Maintenant un autre son. Plus proche. Observez-le sans le juger. Il existe, c\'est tout.' },

            // Phase VAKOG - Auditif Interne
            { phase: 'Auditif interne', duration: 45, instruction: 'Portez attention à votre cœur. Écoutez son rythme. Ne cherchez pas à le ralentir. Observez simplement.' },
            { phase: 'Auditif interne 2', duration: 30, instruction: 'Entendez le silence entre les battements. Cet espace calme existe toujours.' },

            // Phase VAKOG - Kinesthésique
            { phase: 'Kinesthésique contact', duration: 45, instruction: 'Sentez le contact de vos vêtements ou de l\'eau sur votre peau. Chaque point de contact.' },
            { phase: 'Kinesthésique température', duration: 30, instruction: 'Percevez la température sur votre visage. Froide ou tiède. Simplement observer.' },
            { phase: 'Kinesthésique poids', duration: 30, instruction: 'Sentez le poids de votre corps. Il est soutenu. Vous n\'avez pas besoin de le porter.' },

            // Phase VAKOG - Visuel Interne
            { phase: 'Visuel interne', duration: 45, instruction: 'Derrière vos paupières, observez les couleurs qui apparaissent. Sans les créer. Elles viennent d\'elles-mêmes.' },
            { phase: 'Visuel profondeur', duration: 30, instruction: 'Imaginez un bleu profond. L\'eau calme d\'une piscine profonde. Vous flottez dedans.' },

            // Technique du Switch - Gestion des spasmes
            { phase: 'Préparation Switch', duration: 30, instruction: 'Localisez votre petit orteil gauche. Concentrez toute votre attention sur lui.' },
            { phase: 'Switch training', duration: 45, instruction: 'Si une sensation désagréable apparaît, déplacez instantanément votre focus sur le lobe de votre oreille droite.' },
            { phase: 'Switch practice', duration: 45, instruction: 'Alternez : orteil... lobe d\'oreille... orteil... Vous contrôlez où va votre attention.' },

            // Ancrage final
            { phase: 'Création déclencheur', duration: 45, instruction: 'Pressez légèrement votre pouce contre votre index. Ce geste devient votre déclencheur de calme.' },
            { phase: 'Association', duration: 30, instruction: 'Chaque fois que vous ferez ce geste, cet état de calme observateur reviendra instantanément.' },
            { phase: 'Mémorisation', duration: 30, instruction: 'Votre corps mémorise. Ce déclencheur est maintenant ancré. Il est disponible avant chaque apnée.' }
        ],
        instructions: {
            start: 'Auto-hypnose VAKOG pour apnée statique. Devenez un observateur passif de vos sensations.'
        }
    },

    'scan-sensoriel': {
        name: 'Scan Sensoriel Circulaire',
        category: 'autohypnose',
        description: 'Technique de dissociation pendant l\'apnée statique',
        science: 'Déplace l\'attention des spasmes vers des zones neutres du corps',
        duration: 8,
        isGuided: true,
        segments: [
            { phase: 'Centrage', duration: 20, instruction: 'Fermez les yeux. Prenez une dernière respiration calme.' },

            // Scan circulaire - Haut du corps
            { phase: 'Sommet du crâne', duration: 25, instruction: 'Portez votre attention sur le sommet de votre crâne. Juste observer.' },
            { phase: 'Front', duration: 20, instruction: 'Descendez vers votre front. Sentez sa surface, sa température.' },
            { phase: 'Paupières', duration: 20, instruction: 'Vos paupières. Légères. Closes sans effort.' },
            { phase: 'Oreilles', duration: 25, instruction: 'Vos oreilles. Le lobe gauche. Le lobe droit. Zones neutres, calmes.' },
            { phase: 'Mâchoire', duration: 20, instruction: 'Votre mâchoire. Légèrement entrouverte. Détendue.' },

            // Scan circulaire - Milieu du corps
            { phase: 'Épaule gauche', duration: 20, instruction: 'Épaule gauche. Elle repose. Elle ne porte rien.' },
            { phase: 'Épaule droite', duration: 20, instruction: 'Épaule droite. Même sensation de repos total.' },
            { phase: 'Mains', duration: 25, instruction: 'Vos mains. Ouvertes ou fermées. Simplement là.' },
            { phase: 'Pouce-index', duration: 20, instruction: 'Le contact pouce-index. Votre ancre de calme.' },

            // Scan circulaire - Bas du corps
            { phase: 'Bassin', duration: 20, instruction: 'Votre bassin. Stable. Ancré.' },
            { phase: 'Genoux', duration: 20, instruction: 'Vos genoux. Zones neutres. Sans tension.' },
            { phase: 'Pieds', duration: 25, instruction: 'Vos pieds. Chaque orteil. Le petit orteil gauche.' },

            // Cycle rapide pour les moments difficiles
            { phase: 'Cycle rapide 1', duration: 30, instruction: 'Maintenant plus vite : crâne... oreille... main... orteil... Sautez d\'une zone à l\'autre.' },
            { phase: 'Cycle rapide 2', duration: 30, instruction: 'Continuez : front... épaule... bassin... pied... Vous contrôlez votre attention.' },
            { phase: 'Cycle rapide 3', duration: 30, instruction: 'Encore : lobe d\'oreille... pouce... genou... crâne... Les spasmes ne vous concernent pas.' },

            // Intégration
            { phase: 'Maîtrise', duration: 30, instruction: 'Vous savez maintenant déplacer votre attention à volonté. C\'est votre super-pouvoir en apnée.' },
            { phase: 'Ancrage', duration: 20, instruction: 'Pressez pouce contre index. Cet état est ancré. Disponible instantanément.' }
        ],
        instructions: {
            start: 'Scan Sensoriel Circulaire. Apprenez à déplacer votre attention pendant l\'apnée.'
        }
    },

    'flow-dynamique': {
        name: 'Flow-State Dynamique',
        category: 'autohypnose',
        description: 'État de flow pour apnée dynamique et monopalme',
        science: 'Dissociation corps/esprit pour passer en mode automatique - utilisé par les champions',
        duration: 10,
        isGuided: true,
        segments: [
            { phase: 'Préparation', duration: 30, instruction: 'Visualisez-vous au bord du bassin. Prêt pour votre dynamique.' },

            // Dissociation corps/esprit
            { phase: 'Dissociation intro', duration: 30, instruction: 'Votre corps a deux parties distinctes : le moteur et le passager.' },
            { phase: 'Le moteur', duration: 40, instruction: 'Vos jambes sont le moteur. Elles savent palmer. Elles n\'ont pas besoin de vous.' },
            { phase: 'Le passager', duration: 40, instruction: 'Votre buste est un passager. Détendu. Transporté. Il ne fait rien.' },
            { phase: 'Séparation', duration: 30, instruction: 'Sentez cette séparation. Le moteur travaille. Le passager observe.' },

            // Création du mantra rythmique
            { phase: 'Rythme intro', duration: 30, instruction: 'Nous allons créer votre mantra de palmage. Un rythme automatique.' },
            { phase: 'Glisse', duration: 35, instruction: 'Premier mot : GLISSE. Dites-le mentalement sur chaque coup de palme. Glisse...' },
            { phase: 'Relâche', duration: 35, instruction: 'Deuxième mot : RELÂCHE. Pendant la phase de retour. Relâche...' },
            { phase: 'Cycle mantra', duration: 45, instruction: 'Ensemble maintenant : Glisse... Relâche... Glisse... Relâche... C\'est votre rythme.' },
            { phase: 'Automatisation', duration: 40, instruction: 'Le mantra devient automatique. Vous n\'y pensez plus. Il tourne tout seul.' },

            // Visualisation dynamique
            { phase: 'Départ', duration: 30, instruction: 'Visualisez votre départ. Coulée parfaite. Streamline impeccable.' },
            { phase: 'Premiers mètres', duration: 40, instruction: 'Les premiers coups de palme. Puissants mais détendus. Glisse... Relâche...' },
            { phase: 'Milieu de bassin', duration: 40, instruction: 'Vous êtes au milieu. Le moteur tourne. Le passager flotte, serein.' },
            { phase: 'Virage', duration: 35, instruction: 'Le virage approche. Votre corps sait. Il fait le culbute sans que vous y pensiez.' },
            { phase: 'Retour', duration: 40, instruction: 'Le retour. Même rythme. Glisse... Relâche... Le mur se rapproche.' },
            { phase: 'Derniers mètres', duration: 35, instruction: 'Les derniers mètres. Le moteur maintient le rythme. Pas d\'accélération, pas de panique.' },
            { phase: 'Sortie', duration: 30, instruction: 'Vous touchez le mur. Sortie calme. Protocole de récupération.' },

            // Ancrage état de flow
            { phase: 'Ancrage flow', duration: 35, instruction: 'Cet état de flow est maintenant ancré. Pouce contre index pour l\'activer.' },
            { phase: 'Déclencheur', duration: 30, instruction: 'Avant chaque dynamique, pressez pouce-index et dites mentalement : Glisse... Relâche...' },
            { phase: 'Intégration', duration: 25, instruction: 'Votre corps connaît le chemin. Faites-lui confiance. Vous êtes un passager serein.' }
        ],
        instructions: {
            start: 'Flow-State pour apnée dynamique. Passez du mode pilotage au mode automatique.'
        }
    },

    'hypno-apnee-debutant': {
        name: 'Initiation Auto-Hypnose',
        category: 'autohypnose',
        description: 'Introduction aux techniques d\'auto-hypnose pour l\'apnée',
        science: 'Bases de l\'auto-hypnose - Induction progressive et création d\'ancres',
        duration: 15,
        isGuided: true,
        segments: [
            // Induction
            { phase: 'Confort', duration: 30, instruction: 'Installez-vous très confortablement. Ce qui suit va vous transformer.' },
            { phase: 'Respiration', duration: 45, instruction: 'Respirez naturellement. Chaque expiration vous détend un peu plus.' },
            { phase: 'Fermeture yeux', duration: 30, instruction: 'Laissez vos paupières devenir lourdes. Si lourdes qu\'elles se ferment d\'elles-mêmes.' },

            // Approfondissement
            { phase: 'Escalier intro', duration: 30, instruction: 'Imaginez un escalier de 10 marches qui descend. Vous êtes en haut.' },
            { phase: 'Marches 10-8', duration: 40, instruction: '10... 9... 8... Chaque marche vous enfonce plus profondément dans la détente.' },
            { phase: 'Marches 7-5', duration: 40, instruction: '7... 6... 5... Votre corps est de plus en plus lourd, de plus en plus détendu.' },
            { phase: 'Marches 4-2', duration: 40, instruction: '4... 3... 2... Vous êtes presque arrivé dans votre espace de calme profond.' },
            { phase: 'Marche 1', duration: 30, instruction: '1... Vous y êtes. Un lieu de paix absolue. Votre sanctuaire intérieur.' },

            // Création de l'ancre
            { phase: 'Ancre intro', duration: 30, instruction: 'Nous allons maintenant créer votre déclencheur personnel.' },
            { phase: 'Geste ancre', duration: 40, instruction: 'Pressez doucement votre pouce contre votre index. Maintenez ce contact.' },
            { phase: 'Association', duration: 45, instruction: 'Pendant que vous maintenez ce contact, ressentez profondément ce calme. Associez les deux.' },
            { phase: 'Renforcement', duration: 40, instruction: 'Relâchez. Puis refaites le geste. Le calme revient instantanément. C\'est votre ancre.' },
            { phase: 'Test ancre', duration: 35, instruction: 'Testez encore. Pouce-index. Le calme arrive. C\'est automatique maintenant.' },

            // Application à l'apnée
            { phase: 'Contexte apnée', duration: 30, instruction: 'Imaginez-vous maintenant prêt pour une apnée. Respirez calmement.' },
            { phase: 'Activation ancre', duration: 35, instruction: 'Pressez pouce-index. Sentez le calme vous envahir instantanément.' },
            { phase: 'Visualisation apnée', duration: 45, instruction: 'Visualisez-vous en apnée, parfaitement calme. L\'ancre maintient cet état.' },
            { phase: 'Gestion spasme', duration: 40, instruction: 'Un spasme imaginaire arrive. Pressez l\'ancre. Le calme revient. Vous êtes maître.' },

            // Suggestion post-hypnotique
            { phase: 'Suggestion', duration: 45, instruction: 'Chaque fois que vous utiliserez cette ancre avant une apnée, elle sera plus puissante.' },
            { phase: 'Programmation', duration: 40, instruction: 'Votre inconscient sait maintenant. L\'ancre est programmée. Elle fonctionnera automatiquement.' },

            // Sortie
            { phase: 'Remontée 1', duration: 30, instruction: 'Nous allons remonter. À 5, vous serez éveillé, alerte, et votre ancre sera active.' },
            { phase: 'Remontée 2', duration: 25, instruction: '1... 2... Vous commencez à revenir.' },
            { phase: 'Remontée 3', duration: 25, instruction: '3... 4... Plus éveillé, plus présent.' },
            { phase: 'Éveil', duration: 20, instruction: '5... Yeux ouverts. Parfaitement éveillé. Votre ancre est prête.' }
        ],
        instructions: {
            start: 'Initiation à l\'auto-hypnose pour apnéistes. Création de votre ancre personnelle de calme.'
        }
    },

    // ==========================================
    // NOUVEAUX EXERCICES P1 - Apnée Performance
    // ==========================================

    'meditation-lacher-prise': {
        name: 'Méditation Lâcher-Prise',
        category: 'autohypnose',
        description: 'Apprendre à lâcher prise par la respiration passive et l\'acceptation',
        science: 'ACT (Acceptance & Commitment Therapy) - La défusion cognitive réduit l\'anxiété de performance de 35%',
        duration: 10,
        isGuided: true,
        segments: [
            // Breathe-Down (2 min)
            { phase: 'Respiration passive', duration: 30, instruction: 'Laissez votre respiration se faire d\'elle-même. N\'essayez pas de la contrôler. Observez simplement.' },
            { phase: 'Observation', duration: 30, instruction: 'Remarquez comment l\'air entre et sort naturellement. Votre corps sait respirer sans vous.' },
            { phase: 'Non-intervention', duration: 30, instruction: 'Si vous avez l\'envie de contrôler, notez-la simplement. Elle passera. Laissez faire.' },
            { phase: 'Courant naturel', duration: 30, instruction: 'Votre respiration trouve son propre rythme. Comme une vague qui monte et descend sans effort.' },

            // Progressive Surrender (3 min)
            { phase: 'Relâcher le corps', duration: 36, instruction: 'Lâchez chaque muscle. Votre mâchoire s\'ouvre légèrement. Vos épaules tombent. Vos mains s\'ouvrent.' },
            { phase: 'Relâcher le souffle', duration: 36, instruction: 'Arrêtez de guider votre respiration. Elle n\'a pas besoin de vous. Laissez-la devenir irrégulière si elle le veut.' },
            { phase: 'Relâcher l\'attention', duration: 36, instruction: 'Arrêtez de surveiller. Arrêtez de juger. Laissez votre esprit flotter sans direction.' },
            { phase: 'Surrender total', duration: 36, instruction: 'Il n\'y a rien à faire, rien à réussir, rien à contrôler. Vous êtes simplement là.' },
            { phase: 'Espace', duration: 36, instruction: 'Dans ce lâcher-prise, un espace s\'ouvre. Vaste, calme, accueillant. Restez-y.' },

            // ACT Acceptance (2 min)
            { phase: 'Observer la tension', duration: 30, instruction: 'Si une tension existe quelque part, observez-la. Ne la combattez pas. Dites : "Je remarque cette tension."' },
            { phase: 'Permettre', duration: 30, instruction: '"Je permets à cette sensation d\'être là." Elle a le droit d\'exister. Vous n\'avez pas à la changer.' },
            { phase: 'Coexistence', duration: 30, instruction: 'Vous pouvez être détendu ET avoir des sensations. Les deux coexistent. C\'est normal.' },
            { phase: 'Défusion', duration: 30, instruction: 'Vos pensées ne sont que des mots. "Je ne peux pas" est juste une phrase. Observez-la passer comme un nuage.' },

            // Cue-word conditioning (2 min)
            { phase: 'Mot-clé intro', duration: 20, instruction: 'Nous allons ancrer un mot-clé. À chaque expiration, prononcez mentalement le mot "lâche".' },
            { phase: 'Lâche 1', duration: 20, instruction: 'Expirez... "lâche". Sentez le relâchement qui accompagne ce mot.' },
            { phase: 'Lâche 2', duration: 20, instruction: 'Expirez... "lâche". Le mot et la sensation deviennent un.' },
            { phase: 'Lâche 3', duration: 20, instruction: 'Expirez... "lâche". Plus vous répétez, plus le lien se renforce.' },
            { phase: 'Lâche 4', duration: 20, instruction: 'Expirez... "lâche". Ce mot est maintenant votre déclencheur de détente instantanée.' },
            { phase: 'Ancrage', duration: 20, instruction: 'Désormais, avant chaque apnée, dites "lâche" sur l\'expiration. Le lâcher-prise viendra automatiquement.' },

            // Integration (1 min)
            { phase: 'Intégration', duration: 30, instruction: 'Restez dans cet état. Vous venez d\'apprendre à lâcher prise. Ce n\'est pas un effort, c\'est une permission.' },
            { phase: 'Ancrage final', duration: 30, instruction: 'Emportez cette sensation avec vous. Elle est disponible avant chaque apnée, chaque plongée, chaque moment de stress.' }
        ],
        instructions: {
            start: 'Méditation lâcher-prise. Vous allez apprendre à ne plus lutter, à ne plus contrôler. C\'est la clé de l\'apnée.'
        }
    },

    'dry-to-wet-bridge': {
        name: 'Programme Dry-to-Wet',
        category: 'autohypnose',
        description: 'Programme 8 semaines pour transférer vos performances du sec vers l\'eau',
        science: 'La désensibilisation progressive réduit l\'anxiété aquatique de 60% en 8 semaines',
        duration: 12,
        isGuided: true,
        segments: [
            // Intro
            { phase: 'Introduction', duration: 30, instruction: 'Ce programme en 8 semaines vous guide du dry static vers le water static. Votre écart actuel entre sec et eau est normal et peut être comblé.' },
            { phase: 'Évaluation', duration: 30, instruction: 'Votre objectif : transférer progressivement vos capacités dry vers l\'eau. Le blocage est mental, pas physiologique.' },

            // Week 1-2
            { phase: 'Semaines 1-2', duration: 15, instruction: 'Semaines 1 et 2 : fondations. Continuez votre entraînement dry static quotidien.' },
            { phase: 'Exercice sec', duration: 30, instruction: 'Faites vos tables CO2 et Sans Contraction à sec. Ajoutez la méditation lâcher-prise avant chaque session.' },
            { phase: 'Immersion faciale', duration: 30, instruction: 'Après chaque session dry, faites 3 immersions faciales dans l\'eau froide avec l\'exercice Réflexe de Plongée. Associez l\'eau au calme.' },
            { phase: 'Objectif S1-2', duration: 20, instruction: 'Objectif : l\'eau sur le visage déclenche automatiquement le calme et la bradycardie. Pas encore d\'apnée dans l\'eau.' },

            // Week 3-4
            { phase: 'Semaines 3-4', duration: 15, instruction: 'Semaines 3 et 4 : premier transfert. Passez à la baignoire ou au bord de la piscine.' },
            { phase: 'Baignoire', duration: 30, instruction: 'En baignoire, allongé sur le dos, visage hors de l\'eau : faites votre breathe-up structuré, puis immergez le visage pour de courtes apnées.' },
            { phase: 'Courtes apnées', duration: 30, instruction: 'Apnées très courtes : 50% de votre dry max. L\'objectif n\'est PAS la performance, c\'est le confort dans l\'eau.' },
            { phase: 'Mot-clé', duration: 20, instruction: 'Utilisez votre mot-clé "lâche" avant chaque immersion. Le conditionnement du sec se transfère.' },

            // Week 5-6
            { phase: 'Semaines 5-6', duration: 15, instruction: 'Semaines 5 et 6 : piscine avec un buddy. JAMAIS seul dans l\'eau.' },
            { phase: 'Piscine buddy', duration: 30, instruction: 'Static en piscine avec un buddy formé. Commencez à 40% de votre dry max. Augmentez de 10% par session uniquement si la session précédente était confortable.' },
            { phase: 'Protocole surface', duration: 30, instruction: 'Protocole strict : breathe-up structuré, puis apnée, puis hook breathing immédiat à la surface. Le buddy surveille.' },
            { phase: 'Scanner', duration: 20, instruction: 'Pendant l\'apnée en eau, utilisez le body scan ou le scan sensoriel. Gardez votre attention en mouvement.' },

            // Week 7-8
            { phase: 'Semaines 7-8', duration: 15, instruction: 'Semaines 7 et 8 : extension progressive. Vous approchez de votre potentiel en eau.' },
            { phase: 'Extension', duration: 30, instruction: 'Augmentez par paliers de 10 secondes. Notez chaque session dans un journal. L\'écart sec-eau se réduit.' },
            { phase: 'Pleine confiance', duration: 30, instruction: 'À ce stade, votre apnée en eau devrait atteindre 60-70% de votre dry. L\'anxiété a diminué considérablement.' },
            { phase: 'Maintenance', duration: 20, instruction: 'Continuez avec 2-3 sessions eau par semaine. La confiance se construit avec la répétition.' },

            // Closing
            { phase: 'Conclusion', duration: 30, instruction: 'Ce programme est un guide. Adaptez le rythme à vos sensations. Ne forcez jamais. La patience est votre meilleur outil.' },
            { phase: 'Sécurité', duration: 20, instruction: 'Rappel : ne JAMAIS pratiquer l\'apnée dans l\'eau seul. Toujours avec un buddy formé. Votre sécurité prime sur la performance.' }
        ],
        instructions: {
            start: 'Programme Dry-to-Wet : 8 semaines pour combler l\'écart entre vos performances à sec et dans l\'eau.'
        },
        warning: 'Ne jamais pratiquer l\'apnée dans l\'eau seul. Toujours avec un buddy.'
    },

    'flow-release': {
        name: 'Flow & Release',
        category: 'autohypnose',
        description: 'Programme 10 min pour rééduquer le système nerveux et contourner l\'hyper-vigilance',
        science: 'Triple Awareness (Molchanovs/AIDA) — La déconcentration sensorielle sature le cerveau droit pour faire taire le cerveau analytique. Études AIDA : réduit la perception des spasmes de 40% et améliore la tolérance CO2 sans pression de performance.',
        duration: 10,
        isGuided: true,
        segments: [
            // Phase 1 : Activation (0-2 min) — Cyclic Sighing (segments séparés pour les sons)
            { phase: 'Activation — Cyclic Sighing', duration: 15, instruction: 'Phase 1 : Activation (2 min). On commence par le Cyclic Sighing pour baisser le cortisol. Installez-vous confortablement, dos soutenu ou allongé.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Inspirez profondément par le nez.' },
            { phase: 'Inspirez +', duration: 1, instruction: 'Petite inspiration complémentaire — remplissez complètement.' },
            { phase: 'Expirez longuement 1', duration: 8, instruction: 'Expirez très lentement par la bouche. Laissez sortir toute la tension. Sentez vos épaules descendre.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Inspir profonde par le nez.' },
            { phase: 'Inspirez +', duration: 1, instruction: 'Petite inspir complémentaire.' },
            { phase: 'Expirez longuement 2', duration: 8, instruction: 'Longue expiration. Votre système nerveux commence à décélérer.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Inspir profonde.' },
            { phase: 'Inspirez +', duration: 1, instruction: 'Complétez — remplissez jusqu\'au bout.' },
            { phase: 'Expirez longuement 3', duration: 8, instruction: 'Expirez tout. Vous pouvez déjà sentir la différence.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Inspir profonde par le nez.' },
            { phase: 'Inspirez +', duration: 1, instruction: 'Petite inspir complémentaire.' },
            { phase: 'Expirez longuement 4', duration: 8, instruction: 'Longue expiration. Le cortisol baisse. Votre cœur ralentit.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Dernière inspiration profonde.' },
            { phase: 'Inspirez +', duration: 1, instruction: 'Complétez.' },
            { phase: 'Expirez longuement 5', duration: 8, instruction: 'Expiration finale. Laissez aller. Vous êtes prêt pour la phase suivante.' },
            { phase: 'Transition', duration: 15, instruction: 'Respirez naturellement quelques secondes. Notez le calme qui s\'installe.' },

            // Phase 2 : Ouverture (2-4 min) — Mobilisation diaphragme
            { phase: 'Ouverture — Diaphragme', duration: 15, instruction: 'Phase 2 : Ouverture (2 min). Mobilisation douce du diaphragme. Restez assis ou allongé.' },
            { phase: 'Respiration abdominale', duration: 20, instruction: 'Posez les mains sur vos côtes basses. À l\'inspiration, sentez vos mains s\'écarter latéralement. À l\'expiration, les mains reviennent. Respirez en 4 temps.' },
            { phase: 'Massage des côtes', duration: 20, instruction: 'Gardez les mains sur les côtes. Faites de légères pressions circulaires vers l\'extérieur. Libérez la cage thoracique.' },
            { phase: 'Respiration costale', duration: 20, instruction: 'Maintenant inspirez en gonflant d\'abord le ventre, puis les côtes latéralement, puis la poitrine. Expiration douce et complète.' },
            { phase: 'Mouvements doux', duration: 20, instruction: 'Si assis : inclinez très lentement le torse à gauche en inspirant, revenez en expirant. Puis à droite. Libération mécanique du diaphragme.' },
            { phase: 'Extension avant', duration: 20, instruction: 'Inclinez légèrement le menton vers la poitrine en expirant, revenez en inspirant. Sentez l\'allongement de la gorge. Votre glotte se détend.' },
            { phase: 'Respiration libre', duration: 25, instruction: 'Laissez maintenant votre respiration libre. Observez-la sans la contrôler. Le diaphragme est détendu et mobile.' },

            // Phase 3 : Le Cœur — Triple Awareness (4-9 min, 3 à 4 cycles)
            { phase: 'Triple Awareness — Introduction', duration: 20, instruction: 'Phase 3 : Le Cœur (5 min). Les apnées de Déconcentration — méthode Triple Awareness (Molchanovs). L\'objectif : saturer votre cerveau sensoriel pour faire taire le mental analytique.' },
            { phase: 'Breathe-up cycle 1', duration: 30, instruction: 'Respirez calmement. Préparez-vous. Dans quelques secondes vous allez tenir une apnée de 40 à 50 secondes. Pas plus. L\'objectif est 100% confort émotionnel, pas la performance.' },

            // Cycle 1
            { phase: 'Apnée — Niveau 1 : Sécurité', duration: 5, instruction: 'Inspirez normalement... et retenez.' },
            { phase: 'Triple Awareness 1 — Écoute', duration: 15, instruction: 'Identifiez 3 sons. Le plus lointain d\'abord. Un son extérieur... un autre... et un troisième.' },
            { phase: 'Triple Awareness 1 — Toucher', duration: 15, instruction: 'Maintenant 3 sensations tactiles : le poids de vos mains... le tissu sur vos épaules... l\'air frais sur votre visage.' },
            { phase: 'Triple Awareness 1 — Visuel', duration: 15, instruction: 'Yeux fermés : imaginez un point bleu, doux, qui s\'étend lentement à chaque seconde. Il grandit... et grandit...' },
            { phase: 'Fin apnée 1', duration: 5, instruction: 'Respirez. Bien. Arrêtez avant toute envie forte de respirer. C\'est le Niveau 1 : zone de sécurité totale.' },
            { phase: 'Récupération 1', duration: 35, instruction: 'Respirez naturellement. Ne forcez pas. Observez votre cœur revenir au calme. Comment vous sentez-vous ?' },

            // Cycle 2
            { phase: 'Breathe-up cycle 2', duration: 25, instruction: 'Deuxième cycle. Identique au premier. Prenez le temps. La qualité prime sur la durée.' },
            { phase: 'Apnée — Niveau 1 : Sécurité', duration: 5, instruction: 'Inspirez doucement... et retenez.' },
            { phase: 'Triple Awareness 2 — Écoute', duration: 15, instruction: '3 sons lointains. Laissez-les venir à vous sans chercher. Un son de la rue... du bâtiment... de la nature...' },
            { phase: 'Triple Awareness 2 — Toucher', duration: 15, instruction: '3 contacts : le sol ou le matelas sous vous... la température de l\'air qui touche vos narines... la texture de votre vêtement.' },
            { phase: 'Triple Awareness 2 — Visuel', duration: 15, instruction: 'Le point bleu. Il revient. Cette fois il pulse doucement, comme une méduse en eau profonde.' },
            { phase: 'Fin apnée 2', duration: 5, instruction: 'Respirez. Vous pouvez attendre le premier spasme et rester 5 secondes de plus — Niveau 2 optionnel. Puis respirez.' },
            { phase: 'Récupération 2', duration: 35, instruction: 'Récupération. Respirez librement. Notez mentalement la fluidité du moment, pas la durée.' },

            // Cycle 3
            { phase: 'Breathe-up cycle 3', duration: 25, instruction: 'Troisième cycle. Si vous avez envie de rester plus longtemps dans l\'apnée, c\'est bon signe. Mais ne forcez pas.' },
            { phase: 'Apnée — Niveau 1 : Sécurité', duration: 5, instruction: 'Expirez normalement... et retenez en FRC — poumons à moitié vides. Niveau 3 optionnel (Blunery/Néry).' },
            { phase: 'Triple Awareness 3 — Écoute', duration: 15, instruction: 'Sons lointains. 3 sons. Allez au-delà des murs. Que percevez-vous au loin ?' },
            { phase: 'Triple Awareness 3 — Toucher', duration: 15, instruction: '3 sensations : la chaleur dans vos paumes... le poids de vos paupières... votre langue au repos dans la bouche.' },
            { phase: 'Triple Awareness 3 — Visuel', duration: 15, instruction: 'Le point bleu s\'étend maintenant jusqu\'à remplir tout le champ de votre conscience. Calme total.' },
            { phase: 'Fin apnée 3', duration: 5, instruction: 'Respirez. Lentement. Vous venez de pratiquer la déconcentration sensorielle.' },
            { phase: 'Récupération 3', duration: 30, instruction: 'Récupération finale. Votre cerveau analytique a été mis en veille. C\'est exactement ce qu\'on cherchait.' },

            // Phase 4 : Intégration (9-10 min)
            { phase: 'Intégration — Silence', duration: 30, instruction: 'Phase 4 : Intégration (1 min). Posez vos mains sur vos genoux ou sur votre ventre. Fermez les yeux si ce n\'est pas déjà fait.' },
            { phase: 'Observation', duration: 30, instruction: 'Observez simplement votre souffle revenir à son rythme naturel. Ne guidez rien. Soyez témoin.' },
            { phase: 'Ancrage positif', duration: 30, instruction: 'Notez votre score de stress maintenant, de 1 à 5. S\'il est descendu, c\'est la preuve que ça fonctionne. Vos 4 minutes reviendront.' },
            { phase: 'Mot-clé final', duration: 15, instruction: 'Sur l\'expiration : "lâche". Votre déclencheur. Disponible avant chaque plongée.' },
            { phase: 'Clôture', duration: 15, instruction: 'Fin du Flow & Release. Bougez doucement les doigts, les orteils. Ouvrez les yeux quand vous êtes prêt.' }
        ],
        instructions: {
            start: 'Flow & Release — Programme 10 min. Rééduquez votre système nerveux et contournez l\'hyper-vigilance par la Triple Awareness.'
        }
    },

    'hook-breathing': {
        name: 'Hook Breathing',
        category: 'apnee',
        description: 'Technique de récupération post-apnée en 3 rounds progressifs',
        science: 'Prévient le blackout en maintenant la pression intrathoracique — réduit le temps de récupération SpO2 de 50%',
        duration: 8,
        isGuided: true,
        segments: [
            // Introduction
            { phase: 'Introduction', duration: 30, instruction: 'Le hook breathing est la technique de sécurité la plus importante en apnée. Elle maintient l\'oxygène dans votre cerveau après une longue apnée.' },
            { phase: 'Explication', duration: 30, instruction: 'Le cycle : inspirez profondément, fermez la glotte en disant "K" mentalement, pressez le diaphragme 2-3 secondes, puis expirez doucement.' },

            // Round 1: Slow learning (3 reps)
            { phase: 'Round 1 – Lent', duration: 10, instruction: 'Round 1 : apprentissage lent. Suivez mes instructions pas à pas.' },
            { phase: 'Inspirez profondément', duration: 5, instruction: 'Inspirez profondément par la bouche. Remplissez complètement vos poumons.' },
            { phase: 'Hook – Fermez', duration: 4, instruction: 'Fermez la glotte. Dites "K" mentalement. Pressez le diaphragme vers le bas. Maintenez 3 secondes.' },
            { phase: 'Expirez doucement', duration: 4, instruction: 'Relâchez et expirez lentement. Pas trop vite.' },
            { phase: 'Inspirez profondément', duration: 5, instruction: 'Inspirez à nouveau profondément par la bouche.' },
            { phase: 'Hook – Fermez', duration: 4, instruction: 'Hook. Glotte fermée. Diaphragme pressé. 3 secondes.' },
            { phase: 'Expirez doucement', duration: 4, instruction: 'Relâchez, expirez doucement.' },
            { phase: 'Inspirez profondément', duration: 5, instruction: 'Dernière répétition du round. Grande inspiration.' },
            { phase: 'Hook – Fermez', duration: 4, instruction: 'Hook. Verrouillez. Pressez. Maintenez.' },
            { phase: 'Expirez doucement', duration: 4, instruction: 'Expirez. Bien. Le mouvement devient plus naturel.' },
            { phase: 'Repos round 1', duration: 15, instruction: 'Respirez normalement pendant quelques secondes.' },

            // Round 2: Normal speed (4 reps)
            { phase: 'Round 2 – Normal', duration: 8, instruction: 'Round 2 : vitesse normale. Le rythme accélère légèrement.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Grande inspiration, bouche ouverte.' },
            { phase: 'Hook', duration: 3, instruction: 'Hook ! Verrouillez, pressez, maintenez.' },
            { phase: 'Expirez', duration: 3, instruction: 'Expirez.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Inspirez.' },
            { phase: 'Hook', duration: 3, instruction: 'Hook ! Maintenez.' },
            { phase: 'Expirez', duration: 3, instruction: 'Expirez.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Inspirez.' },
            { phase: 'Hook', duration: 3, instruction: 'Hook !' },
            { phase: 'Expirez', duration: 3, instruction: 'Expirez.' },
            { phase: 'Inspirez', duration: 3, instruction: 'Dernière du round. Inspirez.' },
            { phase: 'Hook', duration: 3, instruction: 'Hook !' },
            { phase: 'Expirez', duration: 3, instruction: 'Relâchez.' },
            { phase: 'Repos round 2', duration: 15, instruction: 'Repos. Respirez librement.' },

            // Round 3: Rapid automatization (5 reps)
            { phase: 'Round 3 – Rapide', duration: 8, instruction: 'Round 3 : rythme rapide pour automatiser. Comme après une vraie apnée profonde.' },
            { phase: 'Inspirez–Hook 1', duration: 4, instruction: 'Inspirez ! Hook !' },
            { phase: 'Expirez–Inspirez 1', duration: 3, instruction: 'Expirez. Inspirez.' },
            { phase: 'Hook 2', duration: 3, instruction: 'Hook !' },
            { phase: 'Expirez–Inspirez 2', duration: 3, instruction: 'Expirez. Inspirez.' },
            { phase: 'Hook 3', duration: 3, instruction: 'Hook !' },
            { phase: 'Expirez–Inspirez 3', duration: 3, instruction: 'Expirez. Inspirez.' },
            { phase: 'Hook 4', duration: 3, instruction: 'Hook !' },
            { phase: 'Expirez–Inspirez 4', duration: 3, instruction: 'Expirez. Inspirez.' },
            { phase: 'Hook final', duration: 3, instruction: 'Dernier hook !' },
            { phase: 'Récupération', duration: 5, instruction: 'Expirez et respirez normalement.' },

            // Integration
            { phase: 'Automatisme', duration: 20, instruction: 'Excellent. Ce geste doit devenir un réflexe. Après chaque apnée, les 3 premiers souffles sont des hook breaths. Toujours. Sans exception.' }
        ],
        instructions: {
            start: 'Hook breathing : la technique de récupération essentielle. 3 rounds progressifs pour automatiser ce réflexe vital.'
        },
        warning: 'Pratiquez systématiquement après chaque apnée, même courte.'
    },

    'breathe-up-structure': {
        name: 'Breathe-Up Structuré',
        category: 'preperformance',
        description: 'Préparation pré-plongée en 3 phases : tidal, segmentaire, inspiration finale',
        science: 'Protocole utilisé par les champions du monde — optimise SpO2 sans hyperventilation',
        duration: 6,
        isGuided: true,
        segments: [
            // Phase 1: Tidal breathing 1:2 (2.5 min)
            { phase: 'Phase 1 – Tidal', duration: 10, instruction: 'Phase 1 : respiration tidale. Ratio 1:2. Inspirez 4 secondes par le nez, expirez 8 secondes par la bouche.' },
            { phase: 'Tidal 1', duration: 12, instruction: 'Inspirez 4 secondes... expirez 8 secondes. Doucement. Naturellement.' },
            { phase: 'Tidal 2', duration: 12, instruction: 'Inspirez... expirez lentement. Votre cœur ralentit à chaque expiration.' },
            { phase: 'Tidal 3', duration: 12, instruction: 'Inspirez... expirez. Chaque cycle vous rapproche de l\'état optimal.' },
            { phase: 'Tidal 4', duration: 12, instruction: 'Inspirez... expirez. Relâchez les épaules, la mâchoire, les mains.' },
            { phase: 'Tidal 5', duration: 12, instruction: 'Inspirez... expirez. Vous êtes de plus en plus calme.' },
            { phase: 'Tidal 6', duration: 12, instruction: 'Inspirez... expirez. Le rythme est installé.' },
            { phase: 'Tidal 7', duration: 12, instruction: 'Inspirez... expirez. Sentez le réflexe parasympathique s\'activer.' },
            { phase: 'Tidal 8', duration: 12, instruction: 'Inspirez... expirez. Votre fréquence cardiaque descend.' },
            { phase: 'Tidal 9', duration: 12, instruction: 'Inspirez... expirez. Parfait. Encore un.' },
            { phase: 'Tidal 10', duration: 12, instruction: 'Inspirez... expirez. Phase 1 terminée. Excellent.' },

            // Phase 2: Segmented breathing (1 min)
            { phase: 'Phase 2 – Segmentaire', duration: 10, instruction: 'Phase 2 : respiration segmentaire. Remplissez en 3 étages : ventre, côtes, poitrine.' },
            { phase: 'Ventre', duration: 12, instruction: 'Gonflez le ventre comme un ballon. Sentez le diaphragme descendre.' },
            { phase: 'Côtes', duration: 12, instruction: 'Sans expirer, élargissez les côtes latéralement. Sentez l\'expansion.' },
            { phase: 'Poitrine', duration: 12, instruction: 'Soulevez légèrement la poitrine. Vos poumons sont complètement remplis.' },
            { phase: 'Expirez segmentaire', duration: 12, instruction: 'Expirez lentement et complètement. Relâchez tout dans l\'ordre inverse.' },
            { phase: 'Répétez', duration: 12, instruction: 'À nouveau : ventre... côtes... poitrine... puis expirez lentement. Sentez l\'espace.' },

            // Phase 3: Final breath (30s)
            { phase: 'Phase 3 – Finale', duration: 10, instruction: 'Phase 3 : votre dernière inspiration avant l\'apnée. En 3 étapes précises.' },
            { phase: 'Ventre 4s', duration: 5, instruction: 'Remplissez le ventre pendant 4 secondes. Lentement, profondément.' },
            { phase: 'Côtes 3s', duration: 4, instruction: 'Élargissez les côtes pendant 3 secondes. Continuez à remplir.' },
            { phase: 'Poitrine 2s', duration: 3, instruction: 'Poitrine pendant 2 secondes. Poumons complètement pleins.' },
            { phase: 'Prêt', duration: 8, instruction: 'Poumons pleins. Vous êtes prêt. C\'est votre état optimal pour l\'apnée. Bonne plongée.' }
        ],
        instructions: {
            start: 'Breathe-up structuré : préparation optimale en 3 phases pour maximiser vos réserves sans hyperventiler.'
        }
    },

    'contraction-tolerance': {
        name: 'Tolérance Contractions',
        category: 'apnee',
        description: 'Apnée avec suivi des contractions et coaching de reframing',
        science: 'La réinterprétation cognitive des contractions réduit l\'anxiété et prolonge les apnées de 15-25%',
        isContractionTable: true,
        cycles: 4,
        weekLevel: 1,
        weekConfigs: {
            1: { beyondContraction: 10, label: 'Semaines 1-2 : +10s après 1ère contraction' },
            2: { beyondContraction: 15, label: 'Semaines 3-4 : +15s après 1ère contraction' },
            3: { beyondContraction: 30, label: 'Semaines 5-6 : +30s après 1ère contraction' }
        },
        restDuration: 120,
        reframingCues: [
            'C\'est un étirement du diaphragme. C\'est normal. Vous êtes en sécurité.',
            'Cette sensation est un signal, pas un danger. Votre corps gère parfaitement.',
            'Chaque contraction est une vague. Laissez-la passer. Vous êtes plus fort qu\'elle.',
            'Relâchez la mâchoire. Relâchez les épaules. La contraction ne demande pas de tension.',
            'Observez la contraction comme un spectateur. Elle monte, elle passe. Vous restez calme.',
            'Votre SpO2 est encore très bonne. Vous avez beaucoup de marge. Faites confiance à votre corps.'
        ],
        instructions: {
            start: 'Tolérance aux contractions. Appuyez sur le bouton "Contraction" à chaque spasme. Nous allons apprendre à les accepter.',
            breathe: 'Récupérez. Respirez calmement pendant 2 minutes.',
            hold: 'Retenez votre souffle. Appuyez sur "Contraction" à chaque spasme.',
            contraction: 'Contraction marquée. Restez calme. C\'est normal.'
        }
    },

    'passive-breath-hanger': {
        name: 'Passive Breath Hanger',
        category: 'apnee',
        description: 'Apnée statique à 80% — suspension sur volume intermédiaire avec relâchement glottique profond (Molchanovs / Néry)',
        science: 'Molchanovs T1/T2 Relaxation Phase + Blunery Academy (Néry) : suspension à 80% du volume pulmonaire, plus de flexibilité thoracique que la pleine inspiration, focus glottique pour inhiber l\'envie de respirer. Préparation cyclic sighing (Huberman/Stanford 2023) + souplesse Pelizzari.',
        isPassiveBreathHanger: true,
        cycles: 4,
        prepDuration: 180,
        restDuration: 90,
        maxHoldDuration: 300,
        instructions: {
            start: 'Passive Breath Hanger. Inspirez à environ 80% de votre capacité — pas à fond. Relâchez la gorge complètement.',
            prep: 'Préparation. Double soupir : inspirez profondément, sniff court, expirez lentement. Détendez tout.',
            inhale: 'Inspirez doucement à 80%. Sentez vos poumons aux trois quarts remplis. Pas d\'hyperextension.',
            hold: 'Suspension. Glotte ouverte. Laissez venir les contractions sans résister. Timer en cours.',
            exhale: 'Expirez très lentement par les lèvres pincées. Prolongez au maximum.',
            rest: 'Récupérez. Respirez naturellement. Préparez le prochain cycle.',
            complete: 'Excellent travail. Notez vos sensations ci-dessous pour suivre votre progression.'
        }
    },

    'body-scan-apnea': {
        name: 'Body Scan Apnée',
        category: 'apnee',
        description: 'Apnée guidée avec body scan pour déplacer l\'attention pendant la rétention',
        science: 'La distraction attentionnelle guidée prolonge les apnées de 20% et réduit l\'anxiété',
        isApneaWithGuidance: true,
        cycles: 3,
        breatheUpDuration: 60,
        restDuration: 120,
        holdTargets: [0.4, 0.5, 0.6],
        scanSegments: [
            { zone: 'Tête', duration: 8, instruction: 'Portez attention au sommet de votre crâne. Doux, calme, détendu.' },
            { zone: 'Mâchoire', duration: 8, instruction: 'Relâchez votre mâchoire. Légèrement ouverte. Sans aucune tension.' },
            { zone: 'Épaules', duration: 10, instruction: 'Vos épaules fondent. Elles ne portent rien. Relâchement total.' },
            { zone: 'Bras', duration: 8, instruction: 'Vos bras sont lourds et chauds. Du bout des épaules au bout des doigts.' },
            { zone: 'Mains', duration: 8, instruction: 'Vos mains s\'ouvrent doucement. Chaque doigt se détend, un par un.' },
            { zone: 'Poitrine', duration: 10, instruction: 'Votre poitrine est immobile et calme. Observez simplement. Pas de lutte.' },
            { zone: 'Ventre', duration: 10, instruction: 'Votre ventre est mou. Pas de tension abdominale. Laissez aller complètement.' },
            { zone: 'Jambes', duration: 10, instruction: 'Vos jambes sont lourdes. Impossibles à soulever. Profondément détendues.' },
            { zone: 'Pieds', duration: 8, instruction: 'Vos pieds sont chauds. Chaque orteil se relâche.' },
            { zone: 'Corps entier', duration: 10, instruction: 'Percevez votre corps entier. Unifié. Détendu. En paix avec l\'apnée.' }
        ],
        rapidScanSegments: [
            { zone: 'Mâchoire', duration: 5, instruction: 'Mâchoire. Relâchez.' },
            { zone: 'Épaules', duration: 5, instruction: 'Épaules. Laissez tomber.' },
            { zone: 'Mains', duration: 5, instruction: 'Mains. Ouvrez les doigts.' }
        ],
        silentModeInstruction: 'Observation silencieuse. Restez dans cet état de détente globale. Votre corps flotte.',
        instructions: {
            start: 'Body scan pendant l\'apnée. Le scan guide votre attention loin de l\'envie de respirer.',
            breathe: 'Respirez calmement. Préparez-vous pour le prochain cycle.',
            hold: 'Retenez. Suivez le scan corporel. Laissez-vous guider.'
        }
    }
};

// Export for use
window.EXERCISES = EXERCISES;

// ==========================================
// Guide Details — Science + Practice for each exercise
// ==========================================

window.GUIDE_DETAILS = {
    'cyclic-sighing': {
        science: "Le double soupir exploite un mécanisme réflexe : la seconde inspiration courte rouvre les alvéoles pulmonaires affaissées (atélectasie), maximisant la surface d'échange gazeux. L'expiration prolongée qui suit active le nerf vague via les barorécepteurs aortiques, provoquant une réduction immédiate de la fréquence cardiaque et du cortisol. Étude Stanford 2023 (Balban et al.) : 5 minutes par jour réduisent le stress 56% plus efficacement que la méditation de pleine conscience.",
        practice: [
            "Asseyez-vous ou allongez-vous confortablement, yeux fermés",
            "Inspirez profondément par le nez (2s) pour remplir les poumons aux deux tiers",
            "Sans expirer, prenez une seconde inspiration courte et vive (1s) pour remplir complètement",
            "Expirez très lentement par la bouche (6s), en vidant complètement les poumons",
            "Répétez pendant 5 minutes — l'effet apparaît dès le premier cycle mais se cumule"
        ]
    },
    'coherent': {
        science: "À exactement 5,5 respirations par minute, la variabilité de la fréquence cardiaque (HRV) entre en résonance avec le baroréflexe artériel. Ce couplage cardio-respiratoire optimise l'équilibre sympathique/parasympathique et réduit le cortisol de 23%. La fréquence de résonance individuelle varie entre 4,5 et 6,5 cycles/min, mais 5,5 est le point optimal moyen validé par l'Institut HeartMath.",
        practice: [
            "Installez-vous en position assise, dos droit, pieds à plat",
            "Inspirez par le nez pendant 5,5 secondes en gonflant le ventre",
            "Expirez par le nez ou la bouche pendant 5,5 secondes, sans forcer",
            "Maintenez un rythme fluide et régulier, sans pause entre les phases",
            "Pratiquez 10 minutes matin et soir pour un effet durable sur la HRV"
        ]
    },
    'box': {
        science: "Le carré respiratoire 4-4-4-4 augmente le tonus vagal en imposant un rythme lent et symétrique au système nerveux autonome. Les phases de rétention (poumons pleins et vides) augmentent la pression partielle de CO2, ce qui stimule la tolérance au CO2 et améliore la vasodilatation cérébrale. Technique adoptée par les Navy SEALs pour maintenir la clarté mentale sous stress extrême.",
        practice: [
            "Asseyez-vous droit, épaules relâchées, mains sur les cuisses",
            "Inspirez par le nez pendant 4 secondes",
            "Retenez poumons pleins pendant 4 secondes, corps détendu",
            "Expirez lentement pendant 4 secondes",
            "Retenez poumons vides pendant 4 secondes, sans crispation"
        ]
    },
    'co2-tolerance': {
        science: "La respiration lente en ratio 1:2 (4s inhale / 8s exhale) agit principalement sur le système nerveux autonome via le nerf vague : elle maximise la variabilité cardiaque (HRV) et active le frein parasympathique. Contrairement à ce qui est souvent dit, ce protocole ne crée pas d'hypercapnie significative ni de désensibilisation des chémorécepteurs — l'expiration prolongée évacue le CO2 au lieu de l'accumuler. C'est un excellent outil de régulation nerveuse et de préparation mentale pré-plongée, mais pas un entraînement CO2 au sens physiologique. Pour la désensibilisation réelle des chémorécepteurs, voir l'Hypoventilation VHL (Woorons).",
        practice: [
            "Position assise ou allongée, yeux fermés, corps détendu",
            "Inspirez doucement par le nez (4 sec) — pas besoin de remplir à fond",
            "Expirez très lentement par le nez (8 sec), laissez l'air sortir passivement",
            "Maintenez ce rythme régulier 5 minutes — c'est une pratique de calme, pas d'effort",
            "Idéal 10-15 min avant une session d'apnée pour calmer le système nerveux"
        ]
    },
    'co2-vhl': {
        science: "La VHL (Voluntary Hypoventilation at Low Lung Volume, Woorons 2017-2025) est le protocole CO2 le plus validé scientifiquement à ce jour. En faisant une pause end-expiratory — poumons à mi-vide (~40% de la capacité vitale) — on crée une hypercapnie réelle (PCO2 monte de 40 à ~55 mmHg) sans hypoxie dangereuse. Kapus et al. (PMC3873666, 6 semaines, 3x/sem) : −45% de sensibilité ventilatoire au CO2 (p=0.03, d=2.81 = effet très large). Les chémorécepteurs centraux du bulbe rachidien se recalibrent : les contractions diaphragmatiques arrivent plus tard et moins intensément. Protocole dominant dans les programmes AIDA et Molchanovs. Supérieur aux tables CO2 classiques car il crée un stimulus hypercapnique pur sans hypoxie associée.",
        practice: [
            "Asseyez-vous confortablement, dos droit. Commencez par 2 min de respiration normale",
            "Respirez normalement 3 fois (inhale + exhale naturels)",
            "À la 3e expiration : expirez normalement (pas à fond — poumons mi-vides), puis faites une PAUSE de 5 sec en gardant les poumons à ce niveau bas",
            "Reprenez 3 respirations normales, puis répétez la pause. Cycle : 3 respirations → 1 pause × 5 cycles",
            "Récupérez 4 respirations libres entre chaque série. Augmentez la pause de +1 sec/semaine (5s → 6s → 7s). L'inconfort CO2 durant la pause est le stimulus — observez-le sans y céder"
        ]
    },
    'co2-vhl-static': {
        science: "Le VHL Statique prolonge le principe du VHL CO2 avec une pause FRC beaucoup plus longue (20s+). À la FRC (Functional Residual Capacity — position d'équilibre naturelle du thorax à ~40% CV), le CO2 s'accumule rapidement car le tampon gazeux résiduel est faible. Une pause de 20s à la FRC génère une hypercapnie (PCO2 ~60-65 mmHg) et une légère hypoxie (PO2 ~85-90 mmHg) — une combinaison qui simule efficacement les conditions d'une apnée statique réelle. Le relâchement de la gorge (glotte ouverte, méthode Molchanovs/Néry) réduit la signalisation d'alarme CO2 : la pression perçue diminue sans que la charge physiologique ne change. La préparation par cyclic sighing (Huberman/Stanford 2023) prépare le système nerveux autonome à rester calme sous stress CO2.",
        practice: [
            "Prérequis : maîtrisez le VHL CO2 standard depuis au moins 4 semaines avant de débuter ce protocole",
            "Cyclic Sighing (3 min) : inspirez à fond, ajoutez un snif court en haut, puis expirez très lentement par le nez. Répétez. Cela active le nerf vague et calme le réflexe de panique CO2",
            "Pause VHL : à la fin d'une expiration naturelle (relâchement passif de la poitrine — NE PAS vider à fond), bloquez la respiration",
            "En pause : gorge ouverte (tentez de déglutir — si possible, vous êtes bien relâché), mâchoire détendue, mains ouvertes. Observez l'inconfort CO2 comme une sensation neutre, pas une menace",
            "Appuyez ✋ Sortir quand vous atteignez votre limite, ou laissez le compte à rebours se terminer",
            "Récupération : exactement le nombre de souffles paramétrés, pas un de plus. L'hypercapnie maintenue entre les cycles est l'entraînement",
            "Notez votre gorgeScore (1-5) après chaque session — c'est votre principal indicateur de progression"
        ]
    },
    'wimhof': {
        science: "L'hyperventilation contrôlée provoque une alcalose respiratoire temporaire (le pH sanguin augmente) et abaisse fortement le CO2, supprimant l'envie de respirer pendant la rétention. Pendant la phase de rétention poumons vides, l'adrénaline est libérée, activant le système immunitaire inné. Étude Radboud University 2014 (Kox et al.) : les pratiquants présentent une réponse immunitaire modulée avec moins de symptômes inflammatoires.",
        practice: [
            "Allongez-vous dans un endroit sûr (jamais dans l'eau ni en voiture)",
            "30 respirations profondes : inspirez à fond par le nez/bouche, relâchement passif",
            "Après la 30e expiration, retenez poumons vides aussi longtemps que confortable",
            "Quand l'envie de respirer arrive, inspirez à fond et retenez 15 secondes",
            "Répétez 3 rounds — les rétentions s'allongent naturellement à chaque round"
        ]
    },
    'relaxation': {
        science: "La rétention de 7 secondes poumons pleins augmente la pression intrathoracique et stimule le nerf vague via les barorécepteurs. L'expiration de 8 secondes prolonge l'activation parasympathique. Ce ratio spécifique, conçu par le Dr Andrew Weil, fonctionne comme un tranquillisant naturel pour le système nerveux. Avec la pratique, l'effet sédatif s'intensifie par conditionnement pavlovien.",
        practice: [
            "Placez la pointe de la langue derrière les incisives supérieures",
            "Inspirez silencieusement par le nez pendant 4 secondes",
            "Retenez votre souffle pendant 7 secondes",
            "Expirez complètement par la bouche avec un son 'whoosh' pendant 8 secondes",
            "4 cycles maximum au début. Augmentez à 8 cycles après 4 semaines de pratique"
        ]
    },
    'co2-table': {
        science: "Le repos décroissant entre des apnées de durée fixe force les chémorécepteurs centraux (situés dans le bulbe rachidien) à fonctionner avec des niveaux de CO2 croissants. Cette surcharge progressive recalibre le seuil de déclenchement des contractions diaphragmatiques. Après 4 à 6 semaines d'entraînement régulier, le seuil de première contraction recule significativement, permettant des apnées plus longues et plus confortables.",
        practice: [
            "Déterminez votre record personnel d'apnée (PB). L'apnée sera fixée à 50% du PB",
            "Commencez avec 1min45 de repos, puis réduisez de 15s à chaque cycle (8 cycles)",
            "Restez parfaitement détendu pendant chaque apnée, mâchoire relâchée",
            "Respirez calmement entre les apnées, pas d'hyperventilation",
            "Pratiquez 2-3x/semaine à sec. Ne dépassez jamais le temps fixé"
        ]
    },
    'o2-table': {
        science: "Le repos constant de 2 minutes assure une récupération complète de la SpO2 entre chaque apnée, tandis que la durée croissante des rétentions expose progressivement le corps à des niveaux d'oxygène plus bas (hypoxie contrôlée). Cela stimule la production d'érythropoïétine (EPO) et l'angiogenèse, améliorant le transport d'oxygène à long terme — similaire à l'entraînement en altitude.",
        practice: [
            "Repos constant de 2 minutes entre chaque apnée",
            "Commencez à 30% de votre PB, augmentez de 5-10% à chaque cycle (8 cycles)",
            "Respirez normalement pendant les repos, pas d'hyperventilation",
            "Si une apnée est trop difficile, répétez le même palier au cycle suivant",
            "Pratiquez 1-2x/semaine — plus exigeant que les tables CO2, respectez la fatigue"
        ]
    },
    'no-contraction': {
        science: "En arrêtant systématiquement l'apnée AVANT la première contraction diaphragmatique, le cerveau associe l'apnée à une expérience positive et contrôlée plutôt qu'à une lutte. Ce conditionnement positif réduit l'anxiété anticipatoire et construit une base de confiance essentielle. Les débutants qui commencent par cette méthode progressent plus vite à long terme que ceux qui forcent d'emblée.",
        practice: [
            "Faites 6 apnées courtes avec 1 minute de repos entre chaque",
            "Arrêtez IMMÉDIATEMENT dès la première envie légère de respirer",
            "Ne cherchez jamais la performance : l'objectif est le confort total",
            "Notez vos temps — ils augmenteront naturellement au fil des semaines",
            "Méthode idéale pour débuter ou reprendre après une pause"
        ]
    },
    'comfort-zone': {
        science: "L'entraînement en zone de confort repose sur le principe de conditionnement positif : en s'arrêtant AVANT toute sensation désagréable, le cerveau associe l'apnée à une expérience agréable et contrôlée. Paradoxalement, cette approche sans forçage produit des gains plus durables que l'entraînement en souffrance. La tolérance au CO2 augmente naturellement par exposition répétée sous le seuil d'inconfort. Études en adaptation physiologique : la progression du seuil ventilatoire est de 8-12% par mois avec cette méthode, contre 15% avec forçage mais avec un plateau plus rapide et plus de risques d'aversion.",
        practice: [
            "Inspirez profondément et calmement, puis retenez votre souffle",
            "Le timer compte vers le haut — ne regardez PAS le chrono pendant l'apnée",
            "Dès la MOINDRE gêne (envie de respirer, tension, inconfort), appuyez sur ✋ J'arrête",
            "5 rounds avec 2 minutes de repos entre chaque — respirez calmement pendant le repos",
            "L'app enregistre chaque session : votre progression naturelle apparaît au fil des semaines",
            "Astuce : fermez les yeux et concentrez-vous sur la relaxation musculaire pendant l'apnée"
        ]
    },
    'comfort-zone-frc': {
        science: "L'apnée FRC (Functional Residual Capacity) se pratique après une expiration normale, quand les poumons contiennent environ 2,5L d'air résiduel au lieu de 6L après inspiration maximale. Avec moins d'oxygène disponible, la PaCO2 monte plus vite et le seuil d'inconfort arrive plus tôt (typiquement 40-60% du temps poumons pleins). Cet entraînement est particulièrement efficace pour développer la tolérance au CO2 car l'exposition au stimulus est plus intense. Les apnéistes de haut niveau utilisent les tables FRC pour accélérer leur adaptation chimioréceptrice. Attention : les temps seront naturellement plus courts — c'est normal et attendu.",
        practice: [
            "Respirez calmement pendant la phase de préparation (60s par défaut)",
            "À la fin de la préparation, expirez NORMALEMENT (pas une expiration forcée !) puis retenez",
            "Le timer compte vers le haut — arrêtez dès la moindre gêne avec ✋ J'arrête",
            "Vos temps seront 40-60% plus courts qu'en poumons pleins — c'est normal !",
            "5 rounds avec 2 minutes de repos — la récupération est identique",
            "Commencez par maîtriser la Zone de Confort poumons pleins avant de passer au FRC"
        ]
    },
    'contraction-tolerance': {
        science: "Les contractions diaphragmatiques ne signalent pas un manque d'oxygène dangereux mais un seuil de CO2 atteint. La réinterprétation cognitive (reframing) transforme la perception de menace en signal neutre. Études en psychologie du sport : cette technique de recadrage réduit l'anxiété de 35% et prolonge les apnées de 15-25%. Programme progressif sur 6 semaines pour recalibrer la réponse émotionnelle aux spasmes.",
        practice: [
            "Semaines 1-2 : arrêtez 10s après la 1ère contraction. Semaines 3-4 : 15s. Semaines 5-6 : 30s",
            "Appuyez sur le bouton 'Contraction' à chaque spasme pour le marquer",
            "Écoutez les messages de recadrage : les contractions sont un signal, pas un danger",
            "4 apnées par session avec 2 minutes de repos entre chaque",
            "Relâchement total pendant les contractions : mâchoire, épaules, mains ouvertes"
        ]
    },
    'body-scan-apnea': {
        science: "La théorie du portillon attentionnel (gate control theory, Melzack & Wall) montre que l'attention dirigée vers des zones neutres du corps réduit la perception des sensations désagréables. En guidant l'attention zone par zone pendant l'apnée, le cerveau occupe ses ressources attentionnelles sur des stimuli non-menaçants, réduisant la perception de l'envie de respirer de 20%.",
        practice: [
            "3 cycles d'apnée à 40%, 50% puis 60% de votre PB",
            "Pendant l'apnée, suivez le scan corporel guidé à travers 10 zones",
            "En fin d'apnée, le scan accélère pour occuper l'attention plus intensément",
            "Respirez calmement pendant les 2 minutes de repos entre les cycles",
            "Avec la pratique, vous pourrez faire le scan seul, sans guidage"
        ]
    },
    'hook-breathing': {
        science: "Après une longue apnée, la SpO2 peut chuter rapidement (hypoxie de remontée). Le hook breathing maintient une pression intrathoracique positive en verrouillant la glotte après chaque inspiration, ce qui ralentit la chute de SpO2 et prévient le blackout (syncope hypoxique). Études militaires : cette technique réduit le temps de récupération de la SpO2 de 50%.",
        practice: [
            "Immédiatement après chaque apnée : inspirez profondément par la bouche",
            "Fermez la glotte en disant 'K' mentalement, pressez le diaphragme vers le bas, maintenez 2-3s",
            "Expirez lentement, puis répétez immédiatement",
            "3 hook breaths minimum après CHAQUE apnée, même courte",
            "Pratiquez en 3 rounds progressifs (lent → normal → rapide) jusqu'à automatisme"
        ]
    },
    'dive-reflex': {
        science: "Le réflexe de plongée mammalien est un arc réflexe trigéminale-vagal : l'immersion du visage dans l'eau froide (10-15°C) stimule le nerf trijumeau, qui active le nerf vague, provoquant une bradycardie (réduction de 10-25% de la FC), une vasoconstriction périphérique et un blood shift vers les organes vitaux. Les apnéistes entraînés atteignent 20-24 bpm contre 40-60 bpm chez les non-entraînés.",
        practice: [
            "Préparez un bol d'eau froide (10-15°C) ou utilisez la douche froide sur le visage",
            "Respirez calmement pendant 1-2 minutes pour abaisser la FC",
            "Inspirez, retenez, et plongez le visage dans l'eau 20-30 secondes",
            "3 immersions progressives (20s, 30s, 40s) avec 1 minute de repos",
            "Notez votre FC avant et après : la bradycardie s'améliore avec l'entraînement"
        ]
    },
    'diaphragm': {
        science: "La respiration diaphragmatique en 3 étages (abdominale, costale, claviculaire) exploite la totalité de la capacité pulmonaire, contrairement à la respiration thoracique superficielle qui n'utilise que 30-40% du volume disponible. Le diaphragme, principal muscle inspiratoire, descend de 1 à 10 cm lors d'une inspiration complète. Son entraînement spécifique augmente la capacité vitale et le volume courant — fondation de toute pratique d'apnée.",
        practice: [
            "Allongez-vous, une main sur le ventre, une sur la poitrine",
            "Étage 1 : gonflez le ventre comme un ballon (4s), la main sur la poitrine ne bouge pas",
            "Étage 2 : sans expirer, élargissez les côtes latéralement (3s)",
            "Étage 3 : soulevez légèrement la poitrine (2s), puis pause 1s",
            "Expirez passivement en 8 secondes, en relâchant dans l'ordre inverse"
        ]
    },
    'lung-stretch': {
        science: "La souplesse thoracique est un facteur limitant en apnée profonde : lors de la descente, le volume pulmonaire se comprime selon la loi de Boyle-Mariotte (divisé par 2 à 10m, par 3 à 20m). L'Uddiyana Bandha (verrou abdominal) crée une pression négative intrathoracique qui étire les tissus intercostaux et le diaphragme. En 8 semaines, la capacité vitale peut augmenter de 0,5 à 1 litre.",
        practice: [
            "Pratiquez à jeun (estomac vide depuis 2h minimum)",
            "Échauffement : 5 respirations profondes pour mobiliser le thorax",
            "Étirements latéraux : inspirez à fond, bras au-dessus, penchez latéralement, maintenez 15-20s",
            "Uddiyana Bandha : expirez complètement, fermez la glotte, tirez l'abdomen vers le haut et l'intérieur, 10-15s",
            "3 répétitions de chaque — progressez très doucement pour éviter les blessures intercostales"
        ]
    },
    'breathe-up-structure': {
        science: "Le breathe-up structuré en 3 phases optimise la saturation en oxygène (SpO2) sans hyperventiler — l'hyperventilation causerait une hypocapnie dangereuse qui masque l'envie de respirer et augmente le risque de syncope. La phase tidale 1:2 active le parasympathique. La phase segmentaire maximise le volume pulmonaire. L'inspiration finale en 3 étages remplit 100% de la capacité. Protocole utilisé par les champions du monde.",
        practice: [
            "Phase 1 (2,5 min) : respiration tidale ratio 1:2, inspirez 4s par le nez, expirez 8s par la bouche",
            "Phase 2 (1 min) : respirations segmentaires en 3 étages (ventre → côtes → poitrine), expirez lentement",
            "Phase 3 (30s) : inspiration finale ventre 4s + côtes 3s + poitrine 2s, poumons complètement pleins",
            "Ne JAMAIS hyperventiler : gardez un rythme lent et contrôlé",
            "Utilisez ce protocole avant CHAQUE apnée en eau"
        ]
    },
    'preperf-protocol': {
        science: "Ce protocole combine 3 techniques validées en psychologie du sport : la relaxation musculaire rapide (réduit la tension résiduelle), la cohérence cardiaque courte (synchronise le système nerveux autonome en 2-3 min), et la visualisation ciblée (active les circuits moteurs et émotionnels). L'enchaînement en 5 minutes crée un état de 'calme alerte' optimal pour la performance.",
        practice: [
            "Fermez les yeux, scannez rapidement et relâchez : mâchoire, épaules, mains (30s)",
            "Respirez en cohérence cardiaque 5s/5s pendant 1,5 minute",
            "Visualisez votre performance parfaite dans les moindres détails (1 min)",
            "Choisissez un mot-clé d'ancrage ('focus', 'calme', 'go') et répétez-le 3 fois",
            "Ouvrez les yeux — vous êtes en état optimal"
        ]
    },
    'pettlep': {
        science: "Le protocole PETTLEP (Physical, Environment, Task, Timing, Learning, Emotion, Perspective) est basé sur la théorie de l'équivalence fonctionnelle : l'imagerie mentale active les mêmes aires corticales motrices que l'exécution réelle (cortex prémoteur, aire motrice supplémentaire). L'IRM fonctionnelle montre un chevauchement de 60-80% des activations. Utilisé par 70-90% des athlètes olympiques, ce protocole améliore la performance de 10-15%.",
        practice: [
            "Adoptez la position physique de votre performance (combinaison, palmes mentales, etc.)",
            "Visualisez l'environnement en détail : sons sous-marins, température, lumière, odeurs",
            "Exécutez mentalement chaque geste technique EN TEMPS RÉEL, pas en accéléré",
            "Ajoutez les émotions : confiance, détermination, plaisir",
            "Restez en perspective 1ère personne (à travers vos yeux, pas comme un spectateur)"
        ]
    },
    'body-scan': {
        science: "Le body scan systématique active le cortex somatosensoriel et l'insula, renforçant l'intéroception (conscience des signaux corporels). Cette pratique réduit l'activité de l'amygdale (centre de la peur) et augmente l'activité du cortex préfrontal (régulation émotionnelle). Études MBSR (Kabat-Zinn) : 8 semaines de pratique régulière réduisent l'anxiété de 30-40% et améliorent la conscience corporelle de manière mesurable à l'IRM.",
        practice: [
            "Allongez-vous sur le dos, bras le long du corps, yeux fermés",
            "Portez attention à chaque zone pendant 30-60 secondes, des pieds au crâne",
            "Observez les sensations sans les juger ni chercher à les modifier",
            "Si l'esprit vagabonde, ramenez doucement l'attention sur la dernière zone",
            "Terminez par une perception globale du corps entier, unifié et détendu"
        ]
    },
    'sophro': {
        science: "La méthode IRTER (Inspiration-Rétention-Tension-Expiration-Relâchement) exploite le contraste neuromusculaire : une contraction isométrique de 5 secondes suivie d'un relâchement brusque provoque une inhibition post-tétanique qui détend le muscle bien au-delà de son tonus de repos. Appliquée aux 5 zones corporelles, elle induit une relaxation profonde mesurable par EMG en 10-15 minutes. Essai contrôlé randomisé 2019 : efficace contre l'anxiété.",
        practice: [
            "Debout ou assis, sentez vos pieds ancrés au sol",
            "Pour chaque zone : inspirez, retenez, contractez la zone 5 secondes avec force",
            "Expirez brusquement et relâchez complètement — savourez la différence",
            "Parcourez les 5 zones (tête, épaules, bras, abdomen, jambes), puis contractez le corps entier",
            "Terminez par une visualisation d'un lieu de paix pendant 2 minutes"
        ]
    },
    'meditation-lacher-prise': {
        science: "Basée sur l'ACT (Acceptance and Commitment Therapy, Hayes 2004), cette méditation utilise la défusion cognitive : plutôt que de lutter contre les sensations désagréables, on les observe comme des événements mentaux passagers. En apnée, la lutte contre l'envie de respirer augmente la consommation d'O2 de 15-20%. Le lâcher-prise réduit cette surconsommation. Le mot-clé ('lâche') crée un conditionnement pavlovien relaxation-signal.",
        practice: [
            "Laissez votre respiration se faire seule, sans la contrôler ni la guider",
            "Relâchez progressivement : corps, souffle, puis attention elle-même",
            "Quand une tension apparaît, dites 'Je remarque cette tension' sans la combattre",
            "Sur chaque expiration, prononcez mentalement 'lâche' pour ancrer le conditionnement",
            "Utilisez le mot-clé 'lâche' avant chaque apnée pour activer le lâcher-prise instantanément"
        ]
    },
    'dry-to-wet-bridge': {
        science: "L'écart de performance entre apnée à sec et en eau (souvent 20-40%) est principalement psychologique : l'anxiété aquatique augmente la FC, la consommation d'O2 et la tension musculaire. La désensibilisation systématique (Wolpe, 1958) expose progressivement au stimulus anxiogène tout en maintenant un état de relaxation. Ce programme en 8 semaines réduit l'anxiété aquatique de 60% en procédant par paliers.",
        practice: [
            "Semaines 1-2 : entraînement dry + immersion faciale quotidienne pour associer l'eau au calme",
            "Semaines 3-4 : courtes apnées en baignoire à 50% du PB dry, focus sur le confort",
            "Semaines 5-6 : apnée en piscine avec buddy, début à 40% du PB dry, +10%/session si confortable",
            "Semaines 7-8 : extension progressive par paliers de 10s, objectif 60-70% du PB dry en eau",
            "RÈGLE ABSOLUE : ne JAMAIS pratiquer l'apnée dans l'eau seul — toujours avec un buddy formé"
        ]
    },
    'hypno-apnee-debutant': {
        science: "L'auto-hypnose utilise l'induction progressive (relaxation + comptage descendant) pour atteindre un état de conscience modifié où la suggestibilité augmente. L'ancrage neuro-associatif (geste pouce-index + état de calme) crée un réflexe conditionné via le couplage stimulus-réponse. Après 5-10 répétitions, le simple geste déclenche automatiquement l'état de calme associé. Utilisé en sophrologie sportive et dans les protocoles EMDR.",
        practice: [
            "Installez-vous très confortablement, yeux fermés",
            "Descendez mentalement un escalier de 10 marches, chaque marche approfondissant la détente",
            "En bas de l'escalier, pressez pouce contre index et associez ce geste au calme profond",
            "Répétez le geste 3 fois pour renforcer l'ancrage",
            "Testez l'ancre en contexte d'apnée imaginaire : pressez pouce-index et visualisez une apnée calme"
        ]
    },
    'flow-dynamique': {
        science: "L'état de flow (Csikszentmihalyi, 1990) correspond à un fonctionnement cérébral où le cortex préfrontal dorsolatéral se désactive temporairement (hypofrontalité transitoire), réduisant l'autocritique et la conscience du temps. Les mantras rythmiques ('Glisse-Relâche') synchronisent l'activité motrice avec un pattern verbal automatique, facilitant l'entrée en flow. En apnée dynamique, cette dissociation réduit la consommation d'O2 de 10-15%.",
        practice: [
            "Visualisez la séparation moteur (jambes) / passager (buste détendu)",
            "Créez votre mantra de palmage : 'Glisse' sur le coup de palme, 'Relâche' sur le retour",
            "Répétez jusqu'à ce que le mantra devienne automatique, sans effort conscient",
            "Visualisez une dynamique complète : départ, premier virage, retour, sortie",
            "Ancrez l'état avec pouce-index. Activez avant chaque dynamique en disant 'Glisse... Relâche...'"
        ]
    },

    // ==========================================
    // PRANAYAMA
    // ==========================================

    'pranayama-142': {
        science: "Le ratio 1:4:2 est décrit dans les Yoga Sutras de Patanjali (IIe siècle av. J.-C.) comme le rapport optimal entre Pūraka (inspir), Kumbhaka (rétention) et Rechaka (expir). La longue rétention (4x l'inspir) augmente la surface d'échange alvéolaire en maintenant la pression transpulmonaire, améliorant le transfert d'O2 de 30%. L'expiration double stabilise le CO2 artériel, évitant l'hyperventilation. Étude 2018 (Saoji et al.) : 12 semaines de pratique réduisent le cortisol salivaire de 27% et améliorent le score STAI d'anxiété de 35%.",
        practice: [
            "Asseyez-vous en Sukhasana (tailleur) ou Padmasana (lotus), dos droit, mains sur les genoux en Jnana Mudra (pouce-index)",
            "Commencez par le ratio 1:2:2 (4s-8s-8s) si débutant, puis progressez vers 1:4:2 (4s-16s-8s)",
            "Pūraka : inspirez lentement par le nez en gonflant d'abord le ventre (diaphragme) puis la poitrine",
            "Kumbhaka : retenez en appliquant Jalandhara Bandha (menton vers la poitrine) — restez détendu, ne forcez jamais",
            "Rechaka : expirez par le nez en vidant d'abord la poitrine puis le ventre. Le rythme est plus important que la durée absolue"
        ]
    },
    'nadi-shodhana': {
        science: "Nadi Shodhana ('purification des canaux') équilibre les nadis Ida (lunaire, gauche, parasympathique) et Pingala (solaire, droit, sympathique). L'IRMf montre que la respiration par la narine gauche active l'hémisphère droit (créativité, spatial) et inversement. Étude Telles et al. 2019 : 15 minutes quotidiennes réduisent la pression artérielle systolique de 5 mmHg et augmentent la cohérence EEG inter-hémisphérique de 18%. Le flux d'air alternant normalise le cycle nasal ultradian (alternance naturelle toutes les 2-4h entre narines dominantes).",
        practice: [
            "Main droite en Vishnu Mudra : pliez l'index et le majeur vers la paume, pouce sur narine droite, annulaire sur narine gauche",
            "Cycle complet : fermez la droite → inspirez par la gauche → fermez les deux → expirez par la droite → inspirez par la droite → fermez les deux → expirez par la gauche = 1 cycle",
            "Commencez par le ratio 1:1:1 (4s-4s-4s), puis progressez vers 1:2:2 puis 1:4:2",
            "Gardez les épaules basses et le coude droit relaxé (posez-le sur un coussin si besoin)",
            "Pratiquez 5-10 minutes le matin au réveil et le soir avant de dormir pour un effet optimal sur le système nerveux"
        ]
    },
    'kapalabhati': {
        science: "Kapalabhati ('éclat du crâne') est un Shatkarma (technique de purification) qui utilise des expirations abdominales rapides et forcées. Chaque contraction du transverse crée un massage des viscères et un pompage du liquide céphalo-rachidien. L'IRMf (2020) montre une augmentation de 20% du flux sanguin cérébral frontal. La légère hypocapnie transitoire active le cortex préfrontal et améliore la vigilance. Le métabolisme augmente de 12% pendant 30 minutes après la pratique.",
        practice: [
            "Asseyez-vous dos droit, mains sur les genoux. Inspirez profondément pour commencer",
            "Expirez brusquement par le nez en contractant les abdominaux — l'inspiration est passive et automatique",
            "1 round = 30 expirations forcées à ~1 par seconde (30 secondes). L'app compte les 30 cycles et s'arrête",
            "Après le round : inspirez à fond, retenez 30-60s (poumons pleins), puis expirez lentement. Cette rétention est manuelle",
            "Contre-indiqué : grossesse, hypertension, épilepsie, hernie abdominale. Pratiquer à jeun de préférence"
        ]
    },
    'ujjayi': {
        science: "Ujjayi ('victoire') utilise une constriction partielle de la glotte (rima glottidis) qui crée une résistance au flux d'air de 2-5 cmH2O. Ce frein aérien ralentit naturellement la respiration de 15 à 6 cycles/min, activant les barorécepteurs carotidiens et aortiques. Le son caractéristique (« océan ») à 60-100 Hz fournit un feedback auditif qui aide à maintenir un rythme constant. Études montrent une réduction de 15% de la fréquence cardiaque et une augmentation de 20% de la SpO2 veineuse en 5 minutes.",
        practice: [
            "Ouvrez la bouche et soufflez comme pour embuer une vitre — sentez la contraction dans la gorge",
            "Fermez la bouche et reproduisez exactement cette contraction en respirant par le nez",
            "Un son doux et régulier d'océan doit accompagner chaque inspiration ET chaque expiration",
            "Gardez le son uniforme : même volume, même tonalité. Le son ne doit jamais être forcé ou grinçant",
            "Ujjayi est la respiration de base du Vinyasa Yoga — utilisez-la pendant toute pratique d'asanas pour maintenir l'attention"
        ]
    },
    'bhramari': {
        science: "Bhramari ('abeille') combine respiration lente et vibration sonore. Le bourdonnement nasal (130-350 Hz) fait vibrer le palais mou, les sinus paranasaux et l'os ethmoïde, stimulant le nerf vague par voie mécanosensorielle. Étude Kuppusamy 2017 : 10 minutes réduisent la FC de 7 bpm et la PA systolique de 3 mmHg. Le bourdonnement augmente la production d'oxyde nitrique (NO) nasal de 15x (Weitzberg & Lundberg, 2002), améliorant la vasodilatation et l'oxygénation. Le Shanmukhi Mudra (fermeture des sens) amplifie le pratyahara (retrait sensoriel).",
        practice: [
            "Asseyez-vous confortablement. Optionnel : Shanmukhi Mudra — pouces sur les oreilles, index sur les yeux fermés, majeurs sur le nez, annulaires au-dessus des lèvres, auriculaires en dessous",
            "Inspirez profondément par le nez (4s), puis fermez la bouche et produisez un bourdonnement grave 'Mmmm' pendant toute l'expiration (8s+)",
            "Sentez la vibration dans le palais, les sinus frontaux, et l'ensemble du crâne",
            "Variante : essayez différentes fréquences (grave à aigu) et observez où la vibration résonne le plus",
            "Pratiquez 5-10 minutes avant le sommeil ou en cas de stress — effet calmant immédiat dès le 3e cycle"
        ]
    },
    'imst': {
        science: "L'IMST (Inspiratory Muscle Strength Training) est un protocole de renforcement des muscles inspiratoires validé par Craighead et al. (JAHA 2021) : 30 répétitions × 5 séries × 6 jours/semaine pendant 6 semaines → −9 mmHg systolique (effet identique à 30 min de marche quotidienne), +9% VO2max, +12% force inspiratoire maximale (MIP). La résistance cible est 75% de ta MIP — typiquement 50-70 cmH₂O sur un threshold trainer (PowerBreathe, Threshold PEP). Mécanisme : les contractions répétées des muscles intercostaux et du diaphragme contre forte résistance réduisent les métaborécepteurs musculaires qui signalent la fatigue au cerveau ('inspiratory muscle metaboreflex'), libérant ainsi davantage de débit cardiaque vers les muscles locomoteurs. Bénéfices secondaires : augmentation de la compliance thoracique, amélioration de la mécanique ventilatoire en apnée, réduction de la charge respiratoire perçue.",
        practice: [
            "Réglage device : ajuste la résistance jusqu'à ce que la répétition 28-30 soit difficile mais réalisable. Commence à 50% MIP (résistance modérée), augmente de +5% par semaine",
            "Sans device : inspiration diaphragmatique volontaire maximale — le ventre sort, la poitrine monte. Effort maximal comme si tu soulevais quelque chose de lourd avec le souffle",
            "Rythme : inspire fort sur 2 sec (bouche fermée ou sur l'embout), relâche passivement sur 3 sec. 30 reps = ~2 min 30 par série",
            "Repos 60 sec entre chaque série — respire normalement, ne force pas",
            "Progression : 6 semaines minimum pour voir les effets tensionnels. Les gains de force inspiratoire sont visibles dès 3 semaines",
            "Contre-indications : pneumothorax récent, douleur thoracique, maladie pulmonaire obstructive sévère non contrôlée. Consulte un médecin si doute"
        ]
    },
    'breath-light-co2': {
        science: "La Respiration Réduite CO2 (McKeown / Oxygen Advantage, 2015) est l'inverse exact du Wim Hof : au lieu de vider le CO2 par hyperventilation, on l'accumule progressivement en réduisant l'amplitude respiratoire. Spengler et al. (2013, PMC3873666) démontrent que cette exposition répétée désensibilise les chémorécepteurs centraux de 45% en 6 semaines, reculant significativement le seuil de déclenchement des contractions diaphragmatiques. L'exercice comporte 4 phases progressives : mise en place (amplitude normale), réduction inspiration, réduction + pause post-expiration, inconfort contrôlé à amplitude minimale. Durée totale ~7 minutes.",
        practice: [
            "Phase 1 (1:30) — Inspiration nasale normale (4 sec), expiration lente (6 sec). Rythme calme, volume habituel. Fermez les yeux et établissez une respiration régulière",
            "Phase 2 (1:30) — Réduisez l'inspiration à ~3 sec : inspirez aux deux tiers seulement. L'expiration reste longue (6 sec). Pas de forçage — juste moins d'air",
            "Phase 3 (2:00) — Inspiration réduite (3 sec) + expiration réduite (5 sec) + pause post-expiration (3 sec). La légère envie de respirer pendant la pause est normale et recherchée",
            "Phase 4 (2:00) — Amplitude minimale (~2,5/4,5 sec) avec pause rallongée (4 sec). Observez l'inconfort CO2 sans y céder — exactement comme lors d'une apnée",
            "Si étourdissements : revenez à une respiration normale immédiatement. L'inconfort doit disparaître en 30 sec après l'exercice"
        ]
    },
    'passive-breath-hanger': {
        science: "Le Passive Breath Hanger (Molchanovs T1/T2) est une apnée statique à 80% du volume pulmonaire. Contrairement à l'apnée à pleine inspiration, le volume intermédiaire évite la sur-activation des mécanorécepteurs pulmonaires (réflexe de Hering-Breuer) et offre plus de flexibilité thoracique pour absorber les contractions diaphragmatiques. Le relâchement glottique (Blunery/Néry) crée une légère résistance passive qui inhibe la signalisation CO2 sans effort musculaire. La préparation par cyclic sighing (Huberman/Stanford 2023) optimise les échanges gazeux et active le nerf vague. Le logging subjectif (Gorge Score, Mental State, Trachea Comfort) permet une progression structurée semaine après semaine.",
        practice: [
            "Phase préparatoire (3 min) : double soupir répété — inspire profond, sniff court, expire très lentement. Objectif : calmer le système nerveux avant la suspension",
            "Inspirez doucement jusqu'à environ 80% de votre capacité. Pas une inspiration forcée — arrêtez avant le maximum",
            "En suspension : relâchez activement la gorge (glotte ouverte), les épaules, les mains. Observez les contractions diaphragmatiques sans les combattre",
            "Exhale très lente par les lèvres pincées à la fin — maximum 10 secondes pour cette phase",
            "Répétez 3 à 5 cycles. Notez votre Gorge Score (1-5) et Mental State après chaque session"
        ]
    },
    'surya-bhedana': {
        science: "Surya Bhedana ('percement du soleil') est la respiration unilatérale droite. L'inspiration par la narine droite (Pingala nadi) active préférentiellement le système nerveux sympathique et l'hémisphère gauche (logique, langage, énergie). Études de Telles (2017) : augmentation de 12% du métabolisme basal, hausse de la température corporelle de 0,3°C, et amélioration des performances cognitives analytiques. L'expiration par la narine gauche assure le retour au calme en fin de cycle, évitant l'hyper-activation.",
        practice: [
            "Main droite en Vishnu Mudra. Fermez la narine gauche avec l'annulaire",
            "Inspirez lentement par la narine droite (4s), sentez l'énergie solaire entrer",
            "Fermez les deux narines, retenez (8s) avec Jalandhara Bandha si confortable",
            "Libérez la narine gauche, expirez lentement par la gauche (6s)",
            "Idéal le matin ou avant une activité intense. Éviter le soir (peut perturber le sommeil)"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — Exercices urgence / express
    // ==========================================

    'physiological-sigh': {
        science: "Le soupir physiologique exploite un mécanisme réflexe de réouverture des alvéoles pulmonaires affaissées. La double inspiration (nasale profonde + sniff court supplémentaire) augmente la pression transpulmonaire, rouvrant les sacs alvéolaires et maximisant la surface d'échange gazeux. L'expiration prolongée qui suit active immédiatement le nerf vague via les barorécepteurs aortiques. Étude Stanford 2023 (Balban et al.) : 1 à 3 cycles suffisent pour une réduction mesurable du cortisol et de la fréquence cardiaque. C'est la version SOS du Cyclic Sighing — même technique, utilisée comme outil d'intervention ponctuelle plutôt que comme pratique quotidienne.",
        practice: [
            "Dès que vous ressentez stress, panique ou tension : stoppez ce que vous faites",
            "Inspirez profondément par le nez pour remplir les poumons aux deux tiers (2s)",
            "Sans expirer, prenez une seconde inspiration courte et vive par le nez pour remplir complètement (1s)",
            "Expirez très lentement et longuement par la bouche, en vidant entièrement les poumons (7s+)",
            "Répétez 1 à 3 fois — l'effet est quasi-immédiat dès le premier cycle"
        ]
    },

    'extended-exhale': {
        science: "L'expiration prolongée en ratio 1:2 (inspire 4s / expire 8s) exploite l'asymétrie du système nerveux autonome : l'inspiration active le système sympathique (accélération cardiaque), l'expiration active le parasympathique via le nerf vague (décélération cardiaque). En allongeant l'expiration à deux fois la durée de l'inspiration, on crée un déséquilibre volontaire en faveur du frein vagal parasympathique. 10 cycles suffisent pour réduire la fréquence cardiaque de 5-8 bpm et abaisser le niveau de cortisol salivaire. Protocole identique à 'Respiration 1:2' mais en version urgence ciblée sur 2 minutes.",
        practice: [
            "Installez-vous ou restez où vous êtes — cet exercice se pratique partout",
            "Inspirez calmement par le nez pendant 4 secondes, gonflant le ventre",
            "Expirez très lentement, comme à travers une paille imaginaire, pendant 8 secondes",
            "Maintenez un rythme régulier sans forcer — la douceur est plus efficace que l'effort",
            "10 cycles suffisent pour un effet notable — répétez jusqu'à ressentir le calme"
        ]
    },

    'box-quick': {
        science: "Le box breathing 4-4-4-4 est adopté par les Navy SEALs pour maintenir la clarté mentale sous stress extrême. La symétrie des quatre phases impose un rythme de 3,75 cycles/min qui augmente la variabilité cardiaque (HRV) et stimule le tonus vagal. Les deux phases de rétention (poumons pleins et poumons vides) augmentent transitoirement la pCO2, ce qui améliore la vasodilatation cérébrale. 6 cycles (2 minutes) suffisent pour une récupération significative de l'état de stress aigu. La version rapide est identique au box breathing complet, mais avec un objectif ciblé : reprendre le contrôle rapidement.",
        practice: [
            "Inspirez par le nez pendant 4 secondes en gonflant le ventre puis la poitrine",
            "Retenez poumons pleins pendant 4 secondes — corps détendu, mâchoire relâchée",
            "Expirez lentement et complètement pendant 4 secondes",
            "Retenez poumons vides pendant 4 secondes — sans crispation",
            "6 cycles (2 min) suffisent pour reprendre le contrôle. Pratiquez partout, discrètement"
        ]
    },

    'grounding-555': {
        science: "La technique 5-5-5 (5 choses vues, 5 sons, 5 sensations) est une technique de grounding cognitivo-sensorielle issue de la thérapie cognitive comportementale (TCC). Elle exploite le phénomène de la 'saturation attentionnelle' : en mobilisant les trois canaux sensoriels principaux (visuel, auditif, kinesthésique), elle interrompt le circuit de rumination et d'anxiété en forçant le cortex préfrontal à traiter des stimuli concrets et présents. Ce mécanisme de 'grounding' active les zones corticales de traitement sensoriel au détriment de l'amygdale hyperactive. Études TCC : 2-3 minutes de grounding réduisent l'intensité perçue d'une attaque de panique de 35-50%.",
        practice: [
            "Prenez 3 respirations lentes et profondes pour poser le corps",
            "Regardez autour de vous et nommez MENTALEMENT 5 choses que vous voyez (couleur, forme, détail)",
            "Écoutez attentivement et identifiez 5 sons distincts dans votre environnement",
            "Notez 5 sensations tactiles : le poids de vos vêtements, le sol sous vos pieds, la température de l'air",
            "Terminez par une respiration profonde — vous êtes ici, maintenant, en sécurité"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — Pré-performance
    // ==========================================

    'quick-coherence': {
        science: "La cohérence cardiaque complète nécessite normalement 10-20 minutes pour un effet profond sur la HRV (variabilité de la fréquence cardiaque). Cependant, la recherche de l'Institut HeartMath montre qu'un minimum de 3 minutes à 5,5 cycles/min suffit pour amorcer la synchronisation cardio-respiratoire et réduire le cortisol. Cette version express est conçue pour s'insérer dans les dernières minutes avant une performance, un examen ou une décision importante. L'effet est moins profond qu'une session complète, mais immédiatement accessible.",
        practice: [
            "Asseyez-vous ou restez debout, dos droit, yeux mi-fermés",
            "Inspirez doucement par le nez pendant exactement 5 secondes",
            "Expirez doucement pendant exactement 5 secondes — aucune pause entre les phases",
            "Maintenez un rythme fluide et régulier — imaginez une vague montante et descendante",
            "3 minutes suffisent avant une performance. Pour un effet durable, pratiquez 10 min matin et soir"
        ]
    },

    'power-viz': {
        science: "L'imagerie mentale de performance active les mêmes circuits neuronaux que l'exécution réelle : le cortex prémoteur, l'aire motrice supplémentaire et le cervelet s'activent à 60-80% de leur niveau d'activation physique (IRMf, Decety et al.). En 2 minutes ciblées, ce protocole court utilise trois éléments clés : l'image de succès (activation motrice), le ressenti émotionnel (ancrage limbique), et l'ancrage physique (conditionnement pavlovien). Idéal comme dernière étape mentale avant une compétition ou une performance.",
        practice: [
            "Fermez les yeux. Prenez 3 respirations profondes pour centrer l'attention",
            "Visualisez-vous en train de réussir parfaitement — en première personne, à travers vos yeux",
            "Ajoutez les détails sensoriels : sons, température, sensations musculaires",
            "Ressentez la confiance, la maîtrise, la satisfaction — laissez ces émotions monter pleinement",
            "Ancrez cet état : pressez pouce contre index. Rouvrez les yeux. Vous êtes cet athlète."
        ]
    },

    'dive-prep': {
        science: "Le breathe-up pré-plongée combine trois mécanismes physiologiques : (1) la respiration diaphragmatique lente amène la FC sous 60-70 bpm via le baroréflexe, (2) la visualisation du parcours active le pré-encodage moteur (cortex préfrontal) réduisant l'anxiété anticipatoire de 20-30%, et (3) le relâchement progressif minimise la consommation d'O2 au repos, maximisant les réserves disponibles pour l'apnée. Ce protocole est la version guidée du 'breathe-up structuré', adapté pour les conditions de plage ou de bord de piscine.",
        practice: [
            "Allongez-vous ou asseyez-vous confortablement. Relâchez mâchoire, épaules, abdomen",
            "Respirez en diaphragmatique lente (ventre → côtes → poitrine), expiration passive 6-8s",
            "Ralentissez jusqu'à ressentir votre cœur se calmer — objectif : FC < 65 bpm",
            "Visualisez votre plongée complète : descente, fond, remontée, surface. Restez serein à chaque étape",
            "Dernières respirations : lentes, profondes, détendues. Bonne plongée."
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — Visualisation / Sommeil
    // ==========================================

    'sleep-descent': {
        science: "Ce protocole combine la relaxation musculaire progressive de Jacobson (contraction-relâchement), la respiration 4-7-8 du Dr Andrew Weil (effets sédatifs via stimulation vagale prolongée), et l'imagerie hypnagogique (induction de l'état de transition veille-sommeil par visualisation descendante). L'imagerie d'escalier descendant exploite la métaphore d'approfondissement de conscience utilisée en hypnose clinique (Milton Erickson). L'enchaînement des trois techniques en 7 minutes crée une transition progressive vers le sommeil lent profond.",
        practice: [
            "Allongez-vous dans votre lit, yeux fermés, bras le long du corps",
            "3 cycles de respiration 4-7-8 : inspirez 4s (nez), retenez 7s, expirez 8s (bouche avec son 'whoosh')",
            "Relâchement progressif : front → yeux → mâchoire → épaules → bras → jambes",
            "Imaginez un escalier de 10 marches descendant vers le sommeil. Descendez lentement, une marche à la fois",
            "À la marche 1, laissez votre conscience se dissoudre. Ne cherchez pas le sommeil — il viendra seul"
        ]
    },

    'deep-sleep-478': {
        science: "Le protocole Deep Sleep 4-7-8 combine deux mécanismes distincts. Le ratio 4-7-8 du Dr. Andrew Weil agit comme un tranquillisant naturel : la rétention de 7 secondes poumons pleins augmente la pression intrathoracique et stimule le nerf vague via les barorécepteurs, provoquant une libération de GABA et une activation parasympathique profonde. L'expiration de 8 secondes prolonge cet effet et abaisse la fréquence cardiaque de 8-12 bpm. Le body scan progressif active le cortex somatosensoriel zone par zone, détournant le réseau de mode par défaut (amygdale, ruminations) vers une attention corporelle neutre — mécanisme identique à la thérapie MBSR (Kabat-Zinn). L'enchaînement blocs 4-7-8 ouverture → body scan → blocs 4-7-8 clôture crée un tunnel d'endormissement en trois phases : activation vagale, dissolution attentionnelle, scellement du sommeil.",
        practice: [
            "Allongez-vous dans votre lit, éteindre les écrans. Lumière nulle ou veilleuse très faible",
            "Bloc ouverture : 4 cycles 4-7-8 avec voix comptée et cercle animé — laissez le rythme s'installer",
            "Body scan : suivez la voix zone par zone, de la tête aux pieds. Ne cherchez pas à rester éveillé",
            "Bloc clôture : les 4 derniers cycles 4-7-8 scellent l'endormissement — il est normal de s'endormir avant la fin",
            "Le ratio 4-7-8 est FIXE selon la méthode Dr. Weil — la durée totale est le seul paramètre",
            "Pratiquer chaque soir pendant 21 jours pour conditionner le réflexe d'endormissement"
        ]
    },

    'focus': {
        science: "La visualisation du 'faisceau de lumière' pour la concentration repose sur la métaphore du spotlight attentionnel (Posner, 1980). En imagerie mentale, diriger un projecteur lumineux vers l'objet d'attention active préférentiellement le réseau attentionnel dorsal (cortex pariétal postérieur + frontal oculomoteur). Le maintien de 3 minutes sur un point focal renforce le contrôle inhibiteur (cortex préfrontal dorsolatéral), réduisant la distractibilité. Études de neurofeedback : 8-10 minutes d'entraînement attentionnel quotidien augmentent la densité de matière grise dans le cortex préfrontal en 8 semaines.",
        practice: [
            "Asseyez-vous confortablement, dos droit. Respirez calmement pendant 1 minute",
            "Fermez les yeux et visualisez un faisceau de lumière focalisé devant vous",
            "Dirigez ce faisceau vers l'objet de votre concentration (tâche, objectif, performance)",
            "Maintenez l'attention sur ce point lumineux. Quand l'esprit vagabonde, recentrez le faisceau sans jugement",
            "Pratiquez quotidiennement : l'attention est un muscle qui se renforce avec l'entraînement"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — Auto-hypnose / Apnée
    // ==========================================

    'vakog-static': {
        science: "Le modèle VAKOG (Visuel, Auditif, Kinesthésique, Olfactif, Gustatif) est le cadre de la Programmation Neuro-Linguistique (Bandler & Grinder, 1975) adapté à l'apnée statique. En fragmentant l'attention en canaux sensoriels distincts et en les faisant alterner rapidement, on sature le réseau de mode par défaut (Default Mode Network) — responsable des ruminations et de l'hypervigilance CO2. La technique du 'Switch' (orteil → lobe d'oreille) exploite le phénomène de gate control (Melzack & Wall) : un nouveau stimulus sensoriel fort peut atténuer la perception d'un autre stimulus. Études en auto-hypnose : réduction de 40% de la perception des contractions diaphragmatiques.",
        practice: [
            "En position de statique, préparez votre breathe-up habituel avant de lancer l'exercice",
            "Suivez le guide VAKOG : parcourez les modalités dans l'ordre (Auditif externe → Auditif interne → Kinesthésique → Visuel interne)",
            "Technique Switch : si une contraction ou sensation désagréable arrive, déplacez INSTANTANÉMENT le focus vers le petit orteil gauche, puis le lobe d'oreille droit",
            "Créez votre ancre : pressez pouce contre index lors du moment de calme le plus profond",
            "Utilisez l'ancre (pouce-index) avant chaque statique pour réactiver l'état VAKOG rapidement"
        ]
    },

    'scan-sensoriel': {
        science: "Le scan sensoriel circulaire applique la 'gate control theory' (Melzack & Wall, 1965) : l'attention focalisée sur des zones corporelles neutres active les interneurones inhibiteurs de la corne dorsale, réduisant la signalisation douloureuse ou inconfortable vers le cortex. En rotation rapide entre les zones (crâne → oreilles → mains → orteils), on maintient le traitement attentionnel en mouvement constant, empêchant l'amygdale de se fixer sur les contractions diaphragmatiques. Utilisé par les apnéistes de haut niveau pour les apnées statiques longues (6+ minutes).",
        practice: [
            "Position de statique, yeux fermés. Prenez une dernière respiration calme avant le guide",
            "Suivez le scan corporel du crâne vers les pieds, zone par zone, en observant sans juger",
            "Lorsque le scan s'accélère (cycles rapides), changez de zone au rythme du guide",
            "Si une sensation désagréable apparaît : sautez immédiatement vers le petit orteil gauche ou le lobe d'oreille — zones neutres ancrées",
            "Avec la pratique, vous pourrez faire le scan seul sans guide, à votre propre rythme"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — CO2 / Apnée avancée
    // ==========================================

    'co2-vhl-classic': {
        science: "Le VHL Classique Woorons est le protocole source des études scientifiques sur la VHL (Woorons et al., 2014, 2017). Avec seulement 2 respirations de récupération entre les pauses (vs 3 dans le protocole CO2), la charge hypercapnique inter-cycle est plus élevée : la PCO2 ne redescend pas complètement avant la pause suivante, créant une exposition cumulée plus intense. La pause end-expiratory de 6 secondes (vs 5s) génère une PCO2 artérielle d'environ 58-62 mmHg — davantage que le protocole court. Recommandé uniquement après avoir complété 4 semaines de VHL CO2 standard. Les 8 cycles sur 14 minutes constituent le protocole complet de l'étude originale.",
        practice: [
            "Prérequis : complétez 4 semaines de VHL CO2 standard avant de débuter ce protocole",
            "Respirez normalement 2 fois (inhale + exhale naturels)",
            "À la 2e expiration : expirez normalement (poumons mi-vides, NE PAS vider à fond), puis PAUSE de 6 secondes",
            "Reprenez 2 respirations normales, puis répétez la pause. Cycle : 2 respirations → 1 pause × 8 cycles",
            "Récupérez 4 respirations libres entre chaque série. La pause plus longue et l'intervalle plus court créent une charge CO2 supérieure au protocole standard"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — Visualisation apnée
    // ==========================================

    'predive': {
        science: "La routine mentale pré-plongée complète combine plusieurs techniques validées en psychologie du sport : (1) le breathe-up visualisé active le système parasympathique par conditionnement associatif, (2) la visualisation de la descente en première personne encode le parcours moteur dans le cortex prémoteur, réduisant les décisions conscientes pendant l'apnée, (3) la visualisation positive de la surface conditionne une sortie calme et contrôlée. Étude Swann et al. (2012) : les athlètes qui pratiquent une routine mentale pré-performance montrent une réduction de 25% de l'anxiété précompétitive et une amélioration de 15% des performances.",
        practice: [
            "Commencez 10 minutes avant la plongée, dans un environnement calme",
            "Visualisez le breathe-up en temps réel : sentez votre cœur ralentir, vos muscles se détendre",
            "Visualisez la descente en première personne : chaque mètre, chaque équilibrage, la sensation de glisse",
            "Au fond : ressentez le calme absolu, le silence. Voyez-vous serein et maître de la situation",
            "Visualisez la remontée et la sortie parfaite. Ancrez la sensation de succès avec pouce-index"
        ]
    },

    'flow-release': {
        science: "Le Flow & Release combine la Triple Awareness (technique Molchanovs/AIDA) avec un breathe-up structuré. La Triple Awareness — percevoir simultanément l'environnement externe, les sensations corporelles internes, et l'espace mental — sature le réseau de mode par défaut pour le faire taire. Cette déconcentration sensorielle active le réseau attentionnel ventral (traitement passif, non-analytique), facilitant l'entrée en état de flow (Csikszentmihalyi). La phase de 'cyclic sighing' préalable prépare le nerf vague et calme l'hypervigilance CO2 avant l'apnée.",
        practice: [
            "Phase 1 — Cyclic Sighing (5 cycles) : double inspiration nasale + longue expiration. Active le nerf vague",
            "Phase 2 — Diaphragme segmentaire (3 étages) : ventre, côtes, poitrine. Maximise le volume résiduel",
            "Phase 3 — Triple Awareness : percevez simultanément un son lointain, une sensation corporelle, et le calme de votre esprit",
            "Maintenez la Triple Awareness pendant l'apnée — si l'attention se fixe sur une contraction, revenez au son lointain",
            "Sortie : expirez lentement en restant dans cet état de perception élargie"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — PMR
    // ==========================================

    'pmr': {
        science: "La Relaxation Musculaire Progressive (Edmund Jacobson, 1929) est l'une des techniques de relaxation les mieux validées scientifiquement. Méta-analyse de Manzoni et al. (2008) portant sur 3400 participants : réduction significative du stress, de l'anxiété et de la dépression. Le principe est neurophysiologique : une contraction isométrique maximale de 5-8 secondes épuise localement l'acétylcholine aux plaques motrices, provoquant une inhibition post-tétanique — le muscle se détend bien au-delà de son tonus de repos. Ce contraste contraction-relâchement entraîne également la conscience proprioceptive de la tension résiduelle, facilitant son élimination volontaire.",
        practice: [
            "Allongez-vous confortablement. Parcourez 15 groupes musculaires de la main au pied",
            "Pour chaque groupe : contractez fort pendant 5-8 secondes (sans douleur), puis relâchez brusquement",
            "Observez la différence entre tension et détente — c'est cette conscience qui constitue l'entraînement",
            "Ne sautez aucun groupe : la progression systématique de haut en bas du corps est essentielle",
            "Pratiquez quotidiennement 2-4 semaines pour un effet durable. Ensuite, la détente profonde devient accessible en quelques minutes"
        ]
    },

    // ==========================================
    // GUIDE_DETAILS — Cohérence Cardiaque Avancée
    // ==========================================

    'cardiac-coherence': {
        science: "La cohérence cardiaque est atteinte lorsque la respiration oscille à la fréquence de résonance du baroréflexe artériel (~0.1 Hz). À cette fréquence, les oscillations de la pression artérielle et du rythme cardiaque entrent en phase, maximisant la variabilité de la fréquence cardiaque (HRV). L'Institut HeartMath (McCraty et al., 2015) a établi que la fréquence de résonance individuelle varie de 4.5 à 7 cycles/min (optimum moyen : 5.5 cycles/min). La rétention poumons pleins amplifie l'effet en maintenant la pression transpulmonaire et en stimulant les barorécepteurs aortiques. Le ratio inhale:exhale modifie l'équilibre sympathique/parasympathique : ratio 1:1 = équilibre ANS, ratio 1:1.5 ou 1:2 = dominance parasympathique plus marquée. 5-10 minutes de pratique réduisent le cortisol salivaire de 23% (Karavidas et al., 2007) et améliorent le score SDNN de HRV de 55% après 10 semaines.",
        practice: [
            "Asseyez-vous dos droit, pieds à plat. Une main sur le ventre pour sentir l'expansion abdominale",
            "Choisissez votre fréquence : commencez par 5.5 cycles/min (5.5s/5.5s). Si 5.5s semble long, démarrez à 4.5s/4.5s",
            "Inspiration : gonflez le ventre en premier (diaphragme), puis élargissez les côtes. Douce, sans effort",
            "Rétention (si activée) : pause naturelle poumons pleins, corps détendu, mâchoire relâchée",
            "Expiration : lente et régulière. Le ratio 1:1.5 ou 1:2 renforce l'activation parasympathique",
            "Maintenez un rythme parfaitement régulier — la régularité du rythme est plus importante que la durée absolue",
            "Pratiquez 10 min matin et soir pour un effet mesurable sur la HRV en 4 semaines"
        ]
    }
};

// ==========================================
// PROTOCOLES CHASSE SOUS-MARINE & APNÉE
// Basés sur les dernières recherches scientifiques (2022-2025)
// ==========================================

const CHASSE_PROTOCOLS = {

    // ----- CHASSE SOUS-MARINE -----

    'chasse-terre': {
        id: 'chasse-terre',
        name: 'Arrivée Plage — Récupération Post-Équipement',
        category: 'chasse',
        phase: 'terre',
        icon: '🏖️',
        badge: 'Phase 1',
        badgeColor: 'sand',
        description: 'Après l\'effort de transport et d\'habillage. Amène la FC sous 75 bpm avant la mise à l\'eau.',
        science: 'L\'habillage en combinaison épaisse (5-7mm) génère un effort physique non négligeable : montée de FC et de CO₂. Entrer dans l\'eau avec un organisme en dette métabolique compromet les premières apnées. (German Journal of Sports Medicine, 2024)',
        duration: 5,
        phases: [
            { name: 'Normoventilation', duration: 300, action: 'hold', breathType: 'normo',
              instruction: 'Asseyez-vous ou allongez-vous. Respiration naturelle et passive : inspire 3s par le nez, expire 5s par la bouche. Ne forcez rien.' }
        ],
        tips: [
            'Habillez-vous lentement, dans un endroit frais si possible',
            'Asseyez-vous ou allongez-vous après l\'habillage — ne restez pas debout avec les palmes',
            'Objectif : FC < 75 bpm avant l\'entrée dans l\'eau',
            'Respiration diaphragmatique calme — ventre qui gonfle à l\'inspire'
        ],
        instructions: {
            start: 'Asseyez-vous ou allongez-vous après l\'habillage. Respiration calme et naturelle.',
            'Normoventilation': 'Inspire 3s par le nez, expire 5s par la bouche. Ne forcez rien.'
        },
        breathDetails: {
            type: 'Normoventilation',
            rhythm: 'Inspire 3s (nez) / Expire 5s (bouche)',
            rate: '~10 cycles/min',
            amplitude: 'Modérée — volume courant normal (~500 mL)',
            goal: 'PaCO₂ stable à 40 mmHg, FC < 75 bpm'
        }
    },

    'chasse-eau': {
        id: 'chasse-eau',
        name: 'Acclimatation Eau — Premières Minutes',
        category: 'chasse',
        phase: 'eau',
        icon: '🌊',
        badge: 'Phase 2',
        badgeColor: 'ocean',
        description: 'Mise à l\'eau progressive et activation du réflexe de plongée avant les premières apnées.',
        science: 'La rate se contracte dès l\'immersion en eau tempérée, libérant des érythrocytes avant même les apnées. Ce temps en surface n\'est pas perdu — c\'est de la préparation active. (American Journal of Physiology, 2022)',
        duration: 8,
        phases: [
            { name: 'Entrée progressive', duration: 60, action: 'hold', breathType: 'normo',
              instruction: 'Entrez lentement dans l\'eau. Immergez le visage 2-3 secondes pour amorcer le réflexe de plongée. Respirez normalement.' },
            { name: 'Flottaison calme', duration: 180, action: 'hold', breathType: 'diaphragm',
              instruction: 'Allongez-vous sur le ventre, masque dans l\'eau, tuba en bouche. Ne regardez pas encore le fond. Respirez au tuba.' },
            { name: 'Respiration diaphragmatique', duration: 240, action: 'hold', breathType: 'diaphragm',
              instruction: '4-6 cycles : inspire 4s (ventre gonfle) → pause 1s → expire 6-8s (passive, lente). Yeux semi-fermés. Relâchement progressif.' }
        ],
        tips: [
            'Entrée lente : le choc thermique peut déclencher une inspiration réflexe involontaire (cold shock)',
            'Immersion du visage = amorce du MDR (réflexe de plongée mammalien) et bradycardie',
            'En eau froide < 18°C : acclimatation 2-3 min minimum avant la première apnée',
            'Les 3-4 premières plongées d\'une session sont toujours moins efficaces (rate froide) — c\'est normal'
        ],
        instructions: {
            start: 'Entrez lentement dans l\'eau. Activez le réflexe de plongée.',
            'Entrée progressive': 'Immergez le visage 2-3 secondes. Respirez normalement.',
            'Flottaison calme': 'Allongez-vous sur le ventre. Respirez au tuba.',
            'Respiration diaphragmatique': 'Inspire 4s → pause 1s → expire 6-8s. Relâchement.'
        },
        breathDetails: {
            type: 'Respiration diaphragmatique calme',
            rhythm: 'Inspire 4s (nez) / Pause 1s / Expire 6-8s (bouche, passive)',
            rate: '~5-6 cycles/min',
            amplitude: 'Modérée-profonde, ventre d\'abord',
            goal: 'Activer le MDR, pré-contracter la rate, FC < 70 bpm'
        }
    },

    'chasse-breatheup': {
        id: 'chasse-breatheup',
        name: 'Breathe-Up Pré-Descente',
        category: 'chasse',
        phase: 'breatheup',
        icon: '🫁',
        badge: 'Phase 3',
        badgeColor: 'blue',
        description: 'Protocole identique avant chaque descente. 90 secondes de préparation optimale.',
        science: 'Même 15 secondes d\'hyperventilation modeste avant une série d\'apnées augmentent significativement le risque de désaturation sévère. UN SEUL cycle profond final après normoventilation est le consensus scientifique. (Frontiers in Physiology, 2024)',
        duration: 2,
        phases: [
            { name: 'Centrage', duration: 30, action: 'hold', breathType: 'coherence',
              instruction: 'Stop. Position stationnaire. Ferme les yeux. Relâchement progressif : pieds → mollets → cuisses → abdomen → épaules → mâchoire. 3 respirations calmes.' },
            { name: 'Breathe-up diaphragmatique', duration: 40, action: 'hold', breathType: 'breatheup',
              instruction: 'Inspire 5s (diaphragme, ventre gonfle) → pause 1-2s → expire 10s lente et passive. Répète 2-3 fois. Corps relâché.' },
            { name: 'Cycle final', duration: 10, action: 'inhale', breathType: 'lastbreath',
              instruction: 'UNE SEULE grande expiration (80-90% de l\'air sorti) → UNE SEULE grande inspiration en 3 phases : ventre → côtes → épaules. Duck-dive immédiatement.' }
        ],
        tips: [
            'RÈGLE ABSOLUE : un seul cycle profond final — jamais plusieurs souffles forts de suite',
            'Visualise mentalement ta descente avant le cycle final',
            'Le corps doit "tomber" dans l\'eau par son propre poids — pas forcer avec les bras',
            'Palmage lent et ample : 1 palme toutes les 1,5-2 secondes en surface'
        ],
        instructions: {
            start: '90 secondes de préparation optimale avant la descente.',
            'Centrage': 'Position stationnaire. Ferme les yeux. Relâchement progressif.',
            'Breathe-up diaphragmatique': 'Inspire 5s → pause 1-2s → expire 10s. Corps relâché.',
            'Cycle final': 'UNE SEULE grande inspiration en 3 phases. Duck-dive immédiatement.'
        },
        breathDetails: {
            type: 'Breathe-up diaphragmatique lent + Last breath en 3 phases',
            rhythm: 'Breathe-up : Inspire 5s / Expire 10s. Last breath : Abdo → Costal → Apical',
            rate: '4 cycles/min pendant le breathe-up',
            volume: 'TLC 100% pour la chasse',
            goal: 'PaCO₂ stable, SvO₂ maximale, FC < 65 bpm'
        }
    },

    'chasse-fond': {
        id: 'chasse-fond',
        name: 'Technique au Fond — Affût',
        category: 'chasse',
        phase: 'fond',
        icon: '🐟',
        badge: 'Au Fond',
        badgeColor: 'deep',
        description: 'Économiser l\'O₂ au maximum. La tension musculaire est ton premier ennemi.',
        science: 'La rate continue de se contracter au fond, libérant +10-15% d\'hémoglobine circulante. La PaO₂ est paradoxalement élevée au fond (hyperoxie de compression). Le danger est aux 10 derniers mètres de remontée. (European Journal of Applied Physiology, 2025)',
        tips: [
            'Position HORIZONTALE — jamais debout (consommation O₂ maximale)',
            'Ne bouge que les yeux pour scanner la zone',
            'Attends que le poisson vienne à toi (technique d\'affût / aspetto)',
            'Égalisation PRÉVENTIVE dès 0,5m — jamais forcée',
            'Remonte DÈS les 2ème-3ème contractions diaphragmatiques',
            'Lestage précis : neutre à ta profondeur (±1 kg) → pas de lutte contre la flottabilité'
        ],
        warning: 'Le danger n\'est PAS au fond — c\'est aux 10 derniers mètres de remontée que la PaO₂ chute brutalement.'
    },

    'chasse-recup': {
        id: 'chasse-recup',
        name: 'Récupération en Surface',
        category: 'chasse',
        phase: 'recup',
        icon: '♻️',
        badge: 'Surface',
        badgeColor: 'green',
        description: 'Entre chaque apnée. Respecter le temps de récup est aussi important que la plongée elle-même.',
        science: 'La récupération insuffisante est la cause principale des mauvaises performances et des incidents. La rate se pré-contracte progressivement en cours de session : les plongées s\'améliorent après 20-30 min. (DAN/UCSD Workshop, 2023)',
        duration: 4,
        phases: [
            { name: 'Expirations actives', duration: 30, action: 'exhale', breathType: 'recovery',
              instruction: '4-5 EXPIRATIONS ACTIVES et forcées (souffle fort pour évacuer le CO₂ résiduel), puis inspirations normales. Stabilise-toi en surface, voies aériennes hors de l\'eau.' },
            { name: 'Normoventilation horizontale', duration: 210, action: 'hold', breathType: 'normo',
              instruction: 'RESTE HORIZONTAL — nager en surface consomme 30-40% d\'O₂ de plus. Respiration normale au tuba. Ne fixe pas ta zone de chasse (évite l\'excitation sympathique).' }
        ],
        recoveryTable: [
            { depth: '< 10 m', minRatio: '× 2 le temps d\'apnée', recRatio: '× 3' },
            { depth: '10-30 m', minRatio: '× 3 le temps d\'apnée', recRatio: '× 4' },
            { depth: '30-40 m', minRatio: '8 min minimum', recRatio: '10-12 min' }
        ],
        readyCheck: [
            'FC revenue sous 70-75 bpm',
            'Respiration redevenue calme et non-laborieuse',
            'Aucun sifflement, oppression thoracique ou tête lourde',
            'Délai minimum respecté selon la profondeur'
        ],
        instructions: {
            start: 'Récupération entre chaque apnée. Le temps de récup est aussi important que la plongée.',
            'Expirations actives': '4-5 expirations forcées puis inspirations normales. Stabilise-toi en surface.',
            'Normoventilation horizontale': 'RESTE HORIZONTAL. Respiration normale au tuba.'
        },
        breathDetails: {
            type: 'Expirations actives → Normoventilation',
            rhythm: 'Phase 1 : Expire fort 2s / Inspire 3s (×4-5). Phase 2 : Inspire 3s / Expire 5s',
            warning: 'Si forte envie de respirer dans les 30 premières secondes de la plongée suivante → surface interval trop court'
        }
    },

    // ----- APNÉE STATIQUE -----

    'statique-prep': {
        id: 'statique-prep',
        name: 'Préparation Apnée Statique',
        category: 'statique',
        icon: '🧘',
        badge: 'Statique',
        badgeColor: 'purple',
        description: 'Protocole complet avant une apnée statique. Cohérence cardiaque → breathe-up → last breath.',
        science: 'Le breathe-up diaphragmatique passif maintient le PaCO₂ à 40 mmHg et maximise la SvO₂. Ne pas dépasser 2 minutes de breathe-up pour éviter la dérive vers l\'hyperventilation. (PFI, Molchanovs)',
        duration: 4,
        phases: [
            { name: 'Cohérence cardiaque', duration: 120, action: 'hold', breathType: 'coherence',
              instruction: 'Position allongée. Inspire 5s → expire 5s. Diaphragmatique, yeux fermés. Active le système parasympathique. FC cible < 65 bpm.' },
            { name: 'Breathe-up (PFI)', duration: 90, action: 'hold', breathType: 'breatheup',
              instruction: 'Inspire 2-5s → pause 1-2s → expire 8-10s très lente et passive. 4 cycles/min. Corps relâché. PaCO₂ stable. Maximum 2 min.' },
            { name: 'Last breath complet', duration: 8, action: 'inhale', breathType: 'lastbreath',
              instruction: '1. Ventre gonfle (lobes inférieurs) → 2. Côtes s\'écartent (lobes médians) → 3. Épaules montent légèrement (apex). Fluide, 4-5s. TLC 100%. Glotte fermée → apnée.' }
        ],
        tips: [
            'TLC 100% : capacité pulmonaire totale complète',
            'Pendant l\'arrêt : glotte fermée, muscles respiratoires relâchés',
            'Tolérer les contractions involontaires du diaphragme (signal CO₂ normal)',
            'Remonter à la 2ème-3ème contraction intense'
        ],
        breathDetails: {
            type: 'Cohérence cardiaque → Breathe-up diaphragmatique → Last breath 3 phases',
            phase1: 'Cohérence : Inspire 5s / Expire 5s (2 min)',
            phase2: 'Breathe-up : Inspire 5s / Expire 10s (max 2 min)',
            phase3: 'Last breath : Abdo → Costal → Apical — TLC 100%',
            recovery: '6 cleansing breaths après l\'arrêt (expirations/inspirations actives rapides)'
        },
        instructions: {
            start: 'Protocole complet avant apnée statique. Cohérence → breathe-up → last breath.',
            'Cohérence cardiaque': 'Inspire 5s → expire 5s. Diaphragmatique, yeux fermés. FC cible < 65 bpm.',
            'Breathe-up (PFI)': 'Inspire 2-5s → pause 1-2s → expire 8-10s. Corps relâché. Maximum 2 min.',
            'Last breath complet': 'Ventre → côtes → épaules. Fluide, 4-5s. TLC 100%. Glotte fermée.'
        }
    },

    // ----- APNÉE DYNAMIQUE -----

    'dynamique-prep': {
        id: 'dynamique-prep',
        name: 'Préparation Apnée Dynamique',
        category: 'dynamique',
        icon: '🏊',
        badge: 'Dynamique',
        badgeColor: 'cyan',
        description: 'Protocole adapté pour la dynamique. Breathe-up plus long, last breath à 90-95% du TLC.',
        science: 'Le métabolisme en dynamique est 3-5× supérieur à la statique. L\'acide lactique peut atteindre 10 mmol/L après la nage. Volume à 90-95% du TLC (pas 100%) pour réduire la traînée hydrodynamique. (PMC8176094, 2021)',
        duration: 4,
        phases: [
            { name: 'Cohérence cardiaque', duration: 120, action: 'hold', breathType: 'coherence',
              instruction: 'Au mur, au repos. Inspire 5s → expire 5s. Diaphragmatique. Ne pas faire d\'échauffement intense juste avant (monte le métabolisme de base). FC cible < 65 bpm.' },
            { name: 'Breathe-up (3 min)', duration: 120, action: 'hold', breathType: 'breatheup',
              instruction: 'Inspire 5s → pause 1-2s → expire 10s. Plus long qu\'en statique : la nage va générer plus de CO₂. Corps immobile, position horizontale si possible.' },
            { name: 'Last breath 90-95%', duration: 8, action: 'inhale', breathType: 'lastbreath',
              instruction: '1. Ventre gonfle → 2. Côtes s\'écartent → 3. Épaules montent — mais STOP à 90-95% du max. Pas le maximum absolu : évite la tension corporelle et la traînée. Push → nage.' }
        ],
        tips: [
            '90-95% du TLC (pas 100%) : réduit la tension et la traînée hydrodynamique',
            'Palmage économe, glissades maximales pour minimiser la consommation d\'O₂',
            'La dette en lactate prolonge l\'inconfort post-nage : normoventilation plus longue nécessaire',
            'Remonter avant que les contractions diaphragmatiques deviennent incontrôlables'
        ],
        breathDetails: {
            type: 'Cohérence → Breathe-up long → Last breath partiel',
            phase1: 'Cohérence : Inspire 5s / Expire 5s (2 min)',
            phase2: 'Breathe-up : Inspire 5s / Expire 10s (2-3 min)',
            phase3: 'Last breath : Abdo → Costal → Apical — 90-95% TLC',
            recovery: '6 cleansing breaths après la nage'
        },
        instructions: {
            start: 'Protocole adapté pour la dynamique. Breathe-up plus long, last breath à 90-95% TLC.',
            'Cohérence cardiaque': 'Inspire 5s → expire 5s. Au mur, au repos. FC cible < 65 bpm.',
            'Breathe-up (3 min)': 'Inspire 5s → pause 1-2s → expire 10s. Plus long qu\'en statique.',
            'Last breath 90-95%': 'Ventre → côtes → épaules. STOP à 90-95% du max.'
        }
    },

    // ----- APNÉE EN PROFONDEUR -----

    'profondeur-prep': {
        id: 'profondeur-prep',
        name: 'Préparation Apnée en Profondeur',
        category: 'profondeur',
        icon: '🤿',
        badge: 'Profondeur',
        badgeColor: 'indigo',
        description: 'Protocole complet pour l\'apnée en profondeur. Breathe-up méditatif + last breath 100% TLC.',
        science: 'La loi de Boyle compresse les poumons pendant la descente (TLC → Volume Résiduel vers 30-40m). Plus le volume de départ est grand, plus la PaO₂ initiale est haute et plus la compression à VR est repoussée. Le hook breathing accélère la récupération de SaO₂ (PubMed 2025, essai randomisé croisé à -40m).',
        duration: 6,
        phases: [
            { name: 'Cohérence + méditation', duration: 180, action: 'hold', breathType: 'coherence',
              instruction: 'Flottaison dorsale idéale. Inspire 5s → expire 5s. Yeux fermés. Visualise ta plongée : trajectoire, virages, comportement. État semi-méditatif. FC cible < 60 bpm.' },
            { name: 'Breathe-up profond', duration: 120, action: 'hold', breathType: 'breatheup',
              instruction: 'Inspire 5s → pause 1-2s → expire 10s. Le plus lent et le plus méditatif des 3 disciplines. Certains athlètes : jusqu\'à 5 min. Laisse le corps guider.' },
            { name: 'Last breath TLC 100%', duration: 10, action: 'inhale', breathType: 'lastbreath',
              instruction: '1. Ventre gonfle (lobes inférieurs) → 2. Côtes s\'écartent (lobes médians) → 3. Épaules montent, gorge grande ouverte (apex). MAXIMUM physiologique. Descente fluide et verticale.' }
        ],
        tips: [
            'TLC 100% obligatoire en profondeur (loi de Boyle)',
            'Égalisation PRÉVENTIVE dès 0,5m — Frenzel ou Mouthfill, jamais forcée',
            'À partir de 10-15m : glisse passive (flottabilité négative)',
            'DANGER aux 10 derniers mètres de remontée : chute brutale de PaO₂',
            'NE JAMAIS plonger sans buddy entraîné aux sauvetages apnée'
        ],
        hookBreathing: {
            title: 'Récupération : Hook Breathing (profondeur uniquement)',
            steps: [
                'Inspire profonde et rapide',
                'Début d\'expiration → ARRÊT brusque (son "k" retenu, glotte fermée)',
                'Expire lente contre résistance de la glotte',
                'Répéter 3 fois',
                'Puis 3 cleansing breaths normales',
                'Signal OK verbal + visuel'
            ],
            science: 'Valide scientifiquement (PubMed 2025) : SaO₂ à 95% en ~60s vs >120s sans hook breathing.'
        },
        breathDetails: {
            type: 'Cohérence méditée → Breathe-up profond → Last breath TLC 100%',
            phase1: 'Cohérence : Inspire 5s / Expire 5s (2-3 min)',
            phase2: 'Breathe-up : Inspire 5s / Expire 10s (2-5 min)',
            phase3: 'Last breath : Abdo → Costal → Apical — TLC 100%',
            recovery: '3 HOOK BREATHS + 3 cleansing breaths'
        },
        instructions: {
            start: 'Protocole complet pour l\'apnée en profondeur. Breathe-up méditatif + last breath TLC 100%.',
            'Cohérence + méditation': 'Inspire 5s → expire 5s. Yeux fermés. État semi-méditatif. FC cible < 60 bpm.',
            'Breathe-up profond': 'Inspire 5s → pause 1-2s → expire 10s. Le plus lent des 3 disciplines.',
            'Last breath TLC 100%': 'Ventre → côtes → épaules, gorge grande ouverte. MAXIMUM physiologique.'
        }
    }
};
