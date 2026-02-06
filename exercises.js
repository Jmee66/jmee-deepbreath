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
        description: 'Double inspiration suivie d\'une expiration prolongée',
        science: 'Stanford 2023 - 56% plus efficace que la méditation pour améliorer l\'humeur',
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
        name: 'Tolérance CO2',
        category: 'respiration',
        description: 'Expirations prolongées ratio 1:2',
        science: 'Améliore la capacité aérobie via l\'effet Bohr',
        duration: 5,
        phases: [
            { name: 'Inspirez', duration: 4, action: 'inhale' },
            { name: 'Expirez lentement', duration: 8, action: 'exhale' }
        ],
        instructions: {
            start: 'Expirations deux fois plus longues que les inspirations pour augmenter la tolérance au CO2.',
            'Inspirez': 'Inspiration normale par le nez',
            'Expirez lentement': 'Expiration très lente et contrôlée'
        },
        cyclesPerMinute: 5
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
        description: 'Le reset nerveux le plus rapide - 1 à 3 cycles suffisent',
        science: 'Stanford 2023 - Active immédiatement le nerf vague via les alvéoles pulmonaires',
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
