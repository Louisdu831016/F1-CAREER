import { 
  Driver, 
  DriverStats, 
  DrivingStyle, 
  FamilyOrigin, 
  Team, 
  Sponsor, 
  Categorie,
  RaceResult,
  Circuit,
  RaceStrategy,
  DriverPositionResult,
  LapResult,
  GameResponseJSON,
  Competitor,
  Specialite,
  TrackDilemma,
  TrackChoiceOption,
  ChoiceImpactFeedback
} from '../types';

import { 
  DRIVING_STYLES_INFO, 
  FAMILY_ORIGINS_INFO, 
  DEFAULT_TEAMS_BY_CATEGORY, 
  SPONSORS_POOL, 
  NATIONALITIES,
  CATEGORY_CIRCUITS,
  GENERATED_COMPETITORS
} from '../data/gameData';

export const SPECIALITES_PRESETS: Specialite[] = [
  { id: 'spec-frein-tard', nom: 'Freine-Tard Audacieux', description: 'Permet des dépassements incisifs sur les freinages extrêmes.', icon: '⚡', statBonus: { depassement: 5 } },
  { id: 'spec-metronome', nom: 'Métronome Chirurgical', description: 'Excellente régularité au tour par tour sans dégradation excessive.', icon: '⏱️', statBonus: { regularite: 5 } },
  { id: 'spec-pluie', nom: 'Virtuose du Mouillé', description: 'Capacité exceptionnelle à lire les trajectoires sous la pluie.', icon: '🌧️', statBonus: { talent: 5 } },
  { id: 'spec-rebelle', nom: 'Loup Solitaire', description: 'Priorise sa propre victoire sur les consignes d\'équipe.', icon: '🐺', statBonus: { motivation: 6 } },
  { id: 'spec-media', nom: 'Chouchou des Médias', description: 'Attire l\'attention de la presse et augmente le prestige auprès des sponsors.', icon: '🎤', statBonus: { vitesse: 3 } }
];

// 1. Initialisation Pilote
export function createInitialDriver(
  nom: string,
  nationalite: string,
  style: DrivingStyle,
  origine: FamilyOrigin
): { driver: Driver; initialTeams: Team[]; initialSponsors: Sponsor[] } {
  const styleInfo = DRIVING_STYLES_INFO[style] || DRIVING_STYLES_INFO['Équilibré'] || Object.values(DRIVING_STYLES_INFO)[0];
  const originInfo = FAMILY_ORIGINS_INFO[origine] || FAMILY_ORIGINS_INFO['Classe Moyenne Passionnée'] || Object.values(FAMILY_ORIGINS_INFO)[0];
  const natObj = NATIONALITIES.find(n => n.name === nationalite) || NATIONALITIES[0];

  const baseStats: DriverStats = {
    vitesse: Math.min(99, Math.max(10, styleInfo.vitesse + (originInfo.statBoosts.vitesse || 0))),
    regularite: Math.min(99, Math.max(10, styleInfo.regularite + (originInfo.statBoosts.regularite || 0))),
    gestionPneus: Math.min(99, Math.max(10, styleInfo.gestionPneus + (originInfo.statBoosts.gestionPneus || 0))),
    depassement: Math.min(99, Math.max(10, styleInfo.depassement + (originInfo.statBoosts.depassement || 0))),
    defense: Math.min(99, Math.max(10, (styleInfo.defense || 50) + (originInfo.statBoosts.defense || 0))),
    adaptabilite: Math.min(99, Math.max(10, (styleInfo.adaptabilite || 50) + (originInfo.statBoosts.adaptabilite || 0))),
    talent: Math.min(99, Math.max(10, styleInfo.talent + (originInfo.statBoosts.talent || 0))),
    motivation: Math.min(99, Math.max(10, styleInfo.motivation + (originInfo.statBoosts.motivation || 0))),
  };

  const initialSpecialite = style === 'Agressif' ? SPECIALITES_PRESETS[0] 
    : style === 'Calculateur' ? SPECIALITES_PRESETS[1] 
    : style === 'Spécialiste Pluie' ? SPECIALITES_PRESETS[2] 
    : SPECIALITES_PRESETS[4];

  const driver: Driver = {
    nom: nom || 'Alexandre Moreau',
    nationalite: natObj.name,
    flagCode: natObj.flag,
    age: 12,
    style,
    origine,
    stats: baseStats,
    budget: originInfo.startingBudget,
    reputation: 15,
    pointsChampionnat: 0,
    victoires: 0,
    podiums: 0,
    poles: 0,
    coursesTotales: 0,
    titres: 0,
    niveauExperience: 1,
    specialites: [initialSpecialite],
    relations: {
      confianceDirecteur: 75,
      relationCoequipier: 60,
      tensionRival: 30,
      nomRival: 'Matteo Rossi',
      nomCoequipier: 'Lucas Moreau'
    }
  };

  const initialTeams = DEFAULT_TEAMS_BY_CATEGORY['Karting'];
  const initialSponsors = [SPONSORS_POOL[0], SPONSORS_POOL[1]];

  return { driver, initialTeams, initialSponsors };
}

// Format JSON Strict selon le contrat de l'utilisateur
export function buildJSONResponse(
  gameState: GameResponseJSON['gameState'],
  driver: Driver,
  categorie: Categorie,
  teams: Team[],
  sponsors: Sponsor[],
  message: string
): GameResponseJSON {
  return {
    gameState,
    pilote: {
      nom: driver.nom,
      nationalite: driver.nationalite,
      style: driver.style,
      origine: driver.origine,
      stats: { ...driver.stats },
      budget: driver.budget,
      reputation: driver.reputation,
      specialites: driver.specialites,
      relations: driver.relations
    },
    categorieActuelle: categorie,
    sponsors: sponsors.map(s => ({
      nom: s.nom,
      budgetBase: s.budgetBase,
      primeObjectif: s.primeObjectif,
      objectif: s.objectif
    })),
    equipesDisponibles: teams.map(t => ({
      id: t.id,
      nom: t.nom,
      prestige: t.prestige,
      coutSaison: t.coutSaison,
      niveauMateriel: t.niveauMateriel,
      objectifSaison: t.objectifSaison
    })),
    messageSystème: message
  };
}

// Générer un dilemme de course contextualisé et réaliste (Fallback local & logique backend)
export function generateContextualTrackDilemma(
  circuit: Circuit,
  driver: Driver,
  team: Team,
  lap: number,
  totalLaps: number,
  userPosition: number,
  carAhead?: { name: string; team: string; position: number; gapSec: number } | null,
  carBehind?: { name: string; team: string; position: number; gapSec: number } | null,
  teammate?: { name: string; position: number } | null,
  rival?: { name: string; position: number } | null,
  tireWear: number = 40,
  weather: string = 'Sec',
  strategy?: RaceStrategy
): TrackDilemma {
  const targetAheadName = carAhead?.name || (userPosition > 1 ? `Voiture P${userPosition - 1}` : null);
  const targetAheadPos = carAhead?.position || userPosition - 1;
  const targetBehindName = carBehind?.name || (userPosition < 20 ? `Voiture P${userPosition + 1}` : null);

  const stratMode = strategy?.aggressivite || 'Normal';
  const tireStart = strategy?.pneuDepart || 'Medium';

  let radioConsigne = `Radio Ingénieur : "Suis notre plan de course en pneus ${tireStart} (mode ${stratMode}) !"`;
  if (stratMode === 'Économe') {
    radioConsigne = `Radio Ingénieur : "Tu es en mode Économe. Gère bien tes pneus ${tireStart} et conserve tes écarts !"`;
  } else if (stratMode === 'Attaque' || stratMode === 'Banzai') {
    radioConsigne = `Radio Ingénieur : "Attaque maximale en mode ${stratMode} ! Pousse le rythme sur ${targetAheadName || 'les concurrents'} !"`;
  }

  // CAS 1: Pilote en tête (P1)
  if (userPosition === 1) {
    return {
      id: `dilemma-p1-${lap}`,
      tour: lap,
      titre: `Défense de la 1ère place à ${circuit.nom}`,
      situation: `Vous menez le Grand Prix au tour ${lap}/${totalLaps} (Stratégie ${stratMode}, pneus ${tireStart}) ! ${targetBehindName || 'Votre poursuivant'} se montre pressant à ${(carBehind?.gapSec || 0.6).toFixed(1)}s.`,
      consigneIngenieur: radioConsigne,
      options: [
        {
          id: 'opt-defend-p1',
          texte: 'Trajectoire défensive stricte (Fermer toutes les portes)',
          description: 'Rentrées de virages à l\'intérieur pour empêcher tout plongeon.',
          type: 'audacieux',
          impactCourseResumee: '🛡️ Conserve la P1, usure pneu +5%',
          impactPiloteResumee: '👤 +0.3 Défense, +10 Confiance Écurie',
          impacts: {
            positionDelta: 0,
            gapSecDelta: -0.3,
            tireWearPenalty: 5,
            statChanges: { defense: 0.3, regularite: 0.2 },
            confianceDirecteurDelta: 10,
            tensionRivalDelta: 10
          }
        },
        {
          id: 'opt-fluid-p1',
          texte: 'Garder la trajectoire idéale et miser sur la réaccélération',
          description: 'Conserver un pilotage fluide pour maximiser la vitesse de sortie.',
          type: 'prudent',
          impactCourseResumee: '🏎️ Préserve les gommes, écart stable',
          impactPiloteResumee: '👤 +0.3 Régularité, +0.2 Gestion Pneus',
          impacts: {
            positionDelta: 0,
            gapSecDelta: 0.1,
            tireWearPenalty: 0,
            statChanges: { regularite: 0.3, gestionPneus: 0.2 },
            confianceDirecteurDelta: 5
          }
        },
        {
          id: 'opt-map-p1',
          texte: 'Activer le mode moteur attaque (Push to Pass)',
          description: 'Augmenter la richesse du mélange essence pour creuser l\'écart.',
          type: 'strategique',
          impactCourseResumee: '⚡ +0.5s d\'avance gagnés sur un tour',
          impactPiloteResumee: '👤 +0.3 Vitesse Pure, +0.2 Talent',
          impacts: {
            positionDelta: 0,
            gapSecDelta: -0.6,
            tireWearPenalty: 3,
            statChanges: { vitesse: 0.3, talent: 0.2 },
            confianceDirecteurDelta: 5
          }
        }
      ]
    };
  }

  // CAS 2: Fortes dégradations de pneus (Santé restante <= 35%)
  if (tireWear <= 35 && Math.random() > 0.4) {
    return {
      id: `dilemma-tyre-${lap}`,
      tour: lap,
      titre: `Alerte Usure Pneus (${Math.round(100 - tireWear)}% usure)`,
      situation: `Vos gommes faiblissent au tour ${lap}/${totalLaps} (santé restante : ${Math.round(tireWear)}%). La voiture glisse à la réaccélération en P${userPosition}.`,
      consigneIngenieur: stratMode === 'Économe' 
        ? `Radio Stand : "Conserve ton calme, ta stratégie Économe te permet de lisser la dégradation jusqu'au relais !" `
        : `Radio Stand : "Les pneus souffrent en mode ${stratMode}, adopte le Lift & Coast ou adapte ton pilotage !"`,
      options: [
        {
          id: 'opt-lift-coast',
          texte: 'Lift & Coast (Gérer la dégradation et lever le pied)',
          description: 'Rendre 0.4s au tour mais économiser les gommes jusqu\'au drapeau à damier.',
          type: 'prudent',
          impactCourseResumee: '🛡️ Sauvegarde la gomme (-5% usure), rythme modéré',
          impactPiloteResumee: '👤 +0.4 Gestion Pneus, +0.2 Régularité',
          impacts: {
            positionDelta: 0,
            gapSecDelta: 0.4,
            tireWearPenalty: -5,
            statChanges: { gestionPneus: 0.4, regularite: 0.2 },
            confianceDirecteurDelta: 10
          }
        },
        {
          id: 'opt-keep-pushing',
          texte: 'Maintenir le rythme malgré le manque de grip',
          description: 'Attaquer fort en acceptant de faire glisser le train arrière.',
          type: 'audacieux',
          impactCourseResumee: '⚡ Maintien de l\'écart, risque de blocage +8%',
          impactPiloteResumee: '👤 +0.3 Vitesse Pure, +0.3 Motivation',
          impacts: {
            positionDelta: 0,
            gapSecDelta: -0.3,
            tireWearPenalty: 6,
            statChanges: { vitesse: 0.3, motivation: 0.3 },
            confianceDirecteurDelta: -5
          }
        },
        {
          id: 'opt-pit-early',
          texte: 'Box Box ! Rentrer au stand anticipé',
          description: 'Effectuer un arrêt au stand imprévu pour chausser des gommes fraiches.',
          type: 'strategique',
          impactCourseResumee: '🛠️ Pneus neufs en piste, ressort en peloton',
          impactPiloteResumee: '👤 +0.3 Adaptabilité, +0.2 Talent',
          impacts: {
            positionDelta: 2,
            gapSecDelta: -2.5,
            tireWearPenalty: -40,
            statChanges: { adaptabilite: 0.3, talent: 0.2 },
            confianceDirecteurDelta: 5
          }
        }
      ]
    };
  }

  // CAS 3: Situation générale de course (Attaque/Défense en P${userPosition})
  return {
    id: `dilemma-battle-${lap}`,
    tour: lap,
    titre: `Bataille pour la P${targetAheadPos > 0 ? targetAheadPos : userPosition} à ${circuit.nom}`,
    situation: `Au tour ${lap}/${totalLaps}, vous êtes actuellement P${userPosition} en rythme ${stratMode}. ${targetAheadName ? `Vous êtes à ${(carAhead?.gapSec || 0.4).toFixed(1)}s de ${targetAheadName} (P${targetAheadPos}).` : `Un groupe compact se forme autour de vous.`}`,
    consigneIngenieur: radioConsigne,
    options: [
      {
        id: 'opt-attack-ahead',
        texte: `Plonger à l'intérieur de ${targetAheadName || 'la voiture devant'} (Attaque P${targetAheadPos > 0 ? targetAheadPos : userPosition})`,
        description: 'Freinage tardif au virage suivant pour tenter de gagner une position.',
        type: 'audacieux',
        impactCourseResumee: `⚡ Gain potentiel de la P${targetAheadPos > 0 ? targetAheadPos : userPosition}, usure pneu +4%`,
        impactPiloteResumee: '👤 +0.3 Dépassement, +0.2 Vitesse Pure',
        impacts: {
          positionDelta: -1,
          gapSecDelta: -0.8,
          tireWearPenalty: 4,
          statChanges: { depassement: 0.3, vitesse: 0.2 },
          confianceDirecteurDelta: 5,
          tensionRivalDelta: 10
        }
      },
      {
        id: 'opt-stay-patient',
        texte: `Patienter dans l'aspiration et préserver les pneus`,
        description: 'Observation de la trajectoire adverse sans prise de risque excessive.',
        type: 'prudent',
        impactCourseResumee: `🛡️ Conserve la P${userPosition}, trajectoire propre`,
        impactPiloteResumee: '👤 +0.3 Régularité, +0.2 Gestion Pneus',
        impacts: {
          positionDelta: 0,
          gapSecDelta: 0.1,
          tireWearPenalty: 0,
          statChanges: { regularite: 0.3, gestionPneus: 0.2 },
          confianceDirecteurDelta: 10
        }
      },
      {
        id: 'opt-switchback',
        texte: `Croiser la trajectoire à la réaccélération`,
        description: 'Feinter une attaque extérieure pour mieux ressortir en motricité à l\'intérieur.',
        type: 'strategique',
        impactCourseResumee: '🎯 Dépassement propre tenté en sortie de virage',
        impactPiloteResumee: '👤 +0.3 Talent, +0.2 Vitesse',
        impacts: {
          positionDelta: Math.random() > 0.5 ? -1 : 0,
          gapSecDelta: -0.5,
          tireWearPenalty: 2,
          statChanges: { talent: 0.3, vitesse: 0.2 },
          confianceDirecteurDelta: 5
        }
      }
    ]
  };
}

// Générer les déclencheurs de dilemmes de course pour le circuit (Strictement 3 choix par course)
export function generateTrackDilemmasForCircuit(circuit: Circuit, driver: Driver, team: Team, strategy?: RaceStrategy): TrackDilemma[] {
  const totalLaps = circuit.tours;
  const lap1 = Math.max(2, Math.floor(totalLaps * 0.25));
  let lap2 = Math.max(lap1 + 2, Math.floor(totalLaps * 0.55));
  let lap3 = Math.max(lap2 + 2, Math.floor(totalLaps * 0.80));

  if (lap3 >= totalLaps) lap3 = Math.max(lap2 + 1, totalLaps - 1);
  if (lap2 >= lap3) lap2 = Math.max(lap1 + 1, lap3 - 1);

  return [
    generateContextualTrackDilemma(circuit, driver, team, lap1, totalLaps, 12, null, null, null, null, 85, 'Sec', strategy),
    generateContextualTrackDilemma(circuit, driver, team, lap2, totalLaps, 10, null, null, null, null, 60, 'Sec', strategy),
    generateContextualTrackDilemma(circuit, driver, team, lap3, totalLaps, 8, null, null, null, null, 35, 'Sec', strategy)
  ];
}

// 2. Moteur de calcul de la course
export function calculateRaceExecution(
  driver: Driver,
  team: Team,
  sponsors: Sponsor[],
  circuit: Circuit,
  strategy: RaceStrategy,
  competitors: Competitor[]
): RaceResult {
  // Déterminer la météo de la course
  const rainRoll = Math.random() * 100;
  let meteo: 'Sec' | 'Pluie Légère' | 'Pluie Intense' = 'Sec';
  if (rainRoll < circuit.probabilitePluie) {
    meteo = rainRoll < (circuit.probabilitePluie / 2) ? 'Pluie Intense' : 'Pluie Légère';
  }

  // 1. Préparation de la grille de 20 pilotes (10 écuries x 2 pilotes, dont le Joueur)
  // Trouver les pilotes de l'écurie du joueur présents dans la liste
  const teamDrivers = competitors.filter(c => 
    c.equipeNom.toLowerCase().includes(team.nom.toLowerCase()) || 
    team.nom.toLowerCase().includes(c.equipeNom.toLowerCase())
  );

  let gridCompetitors = [...competitors];
  if (teamDrivers.length >= 2) {
    // Si la liste contient encore les 2 pilotes IA de l'écurie, le joueur remplace le 1er
    const replacedId = teamDrivers[0].id;
    gridCompetitors = competitors.filter(c => c.id !== replacedId);
  } else if (teamDrivers.length === 1) {
    // La liste contient déjà uniquement le coéquipier (19 concurrents), on conserve toute la liste
    gridCompetitors = [...competitors];
  } else {
    // Si pas de correspondance exacte, garder 19 rivaux + 1 joueur
    gridCompetitors = competitors.slice(0, 19);
  }

  // Garantir que le coéquipier restant partage EXACTEMENT les mêmes performances voiture (niveauMateriel)
  const effectiveCompetitors = gridCompetitors.map(c => {
    const isTeammate = c.equipeNom.toLowerCase().includes(team.nom.toLowerCase()) || 
                       team.nom.toLowerCase().includes(c.equipeNom.toLowerCase());
    if (isTeammate) {
      return {
        ...c,
        equipeNom: team.nom,
        equipeCouleur: team.couleurHex,
        niveauVoiture: team.niveauMateriel // Même performance voiture garantie pour le coéquipier !
      };
    }
    return c;
  });

  // Calcul du score de qualification (Realiste : la voiture compte a 60%, le pilote a 40%)
  const carLevel = team.niveauMateriel;
  let qualifScore = (carLevel * 0.60) + (driver.stats.vitesse * 0.28) + (driver.stats.talent * 0.12);
  if (driver.style === 'Bête de Qualification') qualifScore += 4;
  if (driver.style === 'Agressif') qualifScore += 2;
  if (meteo !== 'Sec' && (driver.style === 'Spécialiste Pluie' || driver.style === 'King of Wet')) qualifScore += 12; // La pluie nivelle les performances materiel!

  // Calcul des scores des rivaux
  const gridScores = effectiveCompetitors.map(c => ({
    competitor: c,
    score: (c.niveauVoiture * 0.62) + (c.niveauPilote * 0.38) + (Math.random() * 2.5 - 1.25)
  }));

  // Ajouter le joueur
  const userQualifScore = qualifScore + (Math.random() * 2.5 - 1.25);
  gridScores.sort((a, b) => b.score - a.score);

  // Position qualif du joueur
  let positionQualif = 1;
  for (let i = 0; i < gridScores.length; i++) {
    if (userQualifScore < gridScores[i].score) {
      positionQualif = i + 2;
    }
  }
  if (positionQualif > effectiveCompetitors.length + 1) positionQualif = effectiveCompetitors.length + 1;

  // Calcul du plafond de performance sous le sec (Realiste : une ecurie de fond de grille ne peut pas faire P1-P3 sur le sec sans chaos)
  // Calcul du niveau moyen des top 5 voitures
  const sortedCarLevels = effectiveCompetitors.map(c => c.niveauVoiture).sort((a, b) => b - a);
  const topCarsAverage = sortedCarLevels.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
  const carDeficit = Math.max(0, topCarsAverage - carLevel); // Déficit de puissance par rapport aux tops

  // Plafond minimum de position sous le sec : si voiture très faible, impossible de descendre en dessous de P8-P12 sur le sec
  let realisticPositionCeiling = 1;
  if (meteo === 'Sec') {
    if (carDeficit > 45) {
      realisticPositionCeiling = 10; // Ecurie très faible (ex: 35 vs 85) -> P10 maximum sur le sec
    } else if (carDeficit > 30) {
      realisticPositionCeiling = 7;  // Ecurie milieu/bas de tableau -> P7 maximum
    } else if (carDeficit > 15) {
      realisticPositionCeiling = 4;  // Ecurie milieu haut -> P4 maximum
    }
  } else {
    // Sous la pluie, le talent prime : le plafond descend jusqu'à P1 ou P2 si gros talent
    if (driver.stats.talent > 70 || driver.style === 'Spécialiste Pluie' || driver.style === 'King of Wet') {
      realisticPositionCeiling = 1;
    } else {
      realisticPositionCeiling = 3;
    }
  }

  // Simulation tour par tour
  const totalLaps = circuit.tours;
  let currentPosition = positionQualif;
  let currentTireWear = 100;
  let currentCompound = strategy.pneuDepart;
  let gapToLeader = (positionQualif - 1) * 1.5;
  const incidentLog: string[] = [];
  const lapsLog: LapResult[] = [];

  const baseLapTime = 60 + (circuit.longueurKm * 15);

  let isMeilleurTour = false;
  let bestLapTime = 999;

  for (let lap = 1; lap <= totalLaps; lap++) {
    // Usure des pneus selon composant et style
    let wearRate = 3.2;
    if (currentCompound === 'Soft') wearRate = 6.8;
    if (currentCompound === 'Medium') wearRate = 4.5;
    if (currentCompound === 'Hard') wearRate = 2.8;
    if (currentCompound === 'Wet' && meteo === 'Sec') wearRate = 14; // Destruction rapide du pneu pluie sur le sec

    if (driver.style === 'Agressif') wearRate *= 1.25;
    if (driver.style === 'Calculateur') wearRate *= 0.8;
    if (circuit.usurePneusHaute) wearRate *= 1.3;

    currentTireWear = Math.max(5, currentTireWear - wearRate);

    // Pit Stop ?
    let hasPitStop = false;
    if (strategy.tourPitonPrevu === lap || currentTireWear < 18) {
      hasPitStop = true;
      currentTireWear = 100;
      currentCompound = strategy.pneuApresPit;
      gapToLeader += 22.5; // Perte de temps pit stop
      incidentLog.push(`Tour ${lap}: Pit stop effectué chez ${team.nom}. Passage en pneus ${currentCompound}.`);
    }

    // Impact météo sur le pneu
    let tirePenalty = 0;
    if (meteo !== 'Sec' && currentCompound !== 'Wet') {
      tirePenalty += 5.2; // Glissades extrêmes sans pneus pluie
    } else if (meteo === 'Sec' && currentCompound === 'Wet') {
      tirePenalty += 3.8; // Surchauffe
    }

    // Impact usure pneu
    if (currentTireWear < 35) {
      tirePenalty += (35 - currentTireWear) * 0.18;
    }

    // Vitesse du tour du joueur (La voiture compte pour 50% du rythme de course)
    let driverPace = (driver.stats.vitesse * 0.28) + (driver.stats.regularite * 0.22) + (carLevel * 0.50);
    if (strategy.aggressivite === 'Attaque') driverPace += 2.5;
    if (strategy.aggressivite === 'Banzai') driverPace += 5.0;
    if (strategy.aggressivite === 'Économe') driverPace -= 4.0;

    const lapTimeSec = baseLapTime - (driverPace * 0.08) + tirePenalty + (Math.random() * 0.7);
    if (lapTimeSec < bestLapTime) {
      bestLapTime = lapTimeSec;
      if (lap > 2 && Math.random() > 0.45 && carLevel > 65) isMeilleurTour = true;
    }

    // Évolution des dépassements et commentaires TV
    let comment = `🎙️ Tour ${lap} : ${driver.nom} en P${currentPosition}. Gommes ${currentCompound} (${Math.round(currentTireWear)}%).`;
    let event: string | null = null;

    // 1. Pit Stop Annonce Commentateur
    if (hasPitStop) {
      comment = `🎙️ COMMENTATEUR TV : "ENTRÉE AU STANDS pour ${driver.nom} ! Les mécaniciens de ${team.nom} exécutent l'arrêt. Reparti en pneus ${currentCompound} neufs !"`;
      event = `🛑 Pit stop réussi (Pneu ${currentCompound})`;
    }

    // 2. Événements de Course Majeurs (Safety Car, Accidents, Pluie Soudaine, Pannes)
    const randomEvent = Math.random() * 100;

    // A. Voiture de Sécurité (SC / VSC)
    if (randomEvent < 2.0 && !incidentLog.some(i => i.includes('Safety Car'))) {
      gapToLeader = Math.max(0.5, gapToLeader * 0.25); // Regroupement du peloton
      event = "🟡 SAFETY CAR EN PISTE ! Peloton regroupé !";
      comment = `🎙️ COMMENTATEUR TV : "VOITURE DE SÉCURITÉ EN PISTE ! Énorme crash dans le peloton ! Tous les écarts sont effacés !"`;
      incidentLog.push(`Tour ${lap}: Voiture de Sécurité déployée ! Écarts resserrés.`);
    } 
    // B. Panne Moteur d'un Leader / Rival devant
    else if (randomEvent >= 2.0 && randomEvent < 4.2 && currentPosition > 1) {
      currentPosition = Math.max(1, currentPosition - 1);
      gapToLeader = Math.max(0, gapToLeader - 2.8);
      const abandonedDriver = competitors[(currentPosition + lap) % competitors.length]?.nom || 'un rival';
      event = `💥 Panne Moteur de ${abandonedDriver} ! Gain P${currentPosition}`;
      comment = `🎙️ COMMENTATEUR TV : "COUP DE THÉÂTRE ! Fumée blanche pour ${abandonedDriver} ! Abandon ! ${driver.nom} passe P${currentPosition} !"`;
      incidentLog.push(`Tour ${lap}: Abandon de ${abandonedDriver} (Moteur) ! ${driver.nom} passe P${currentPosition}.`);
    }
    // C. Changement Météo Soudain (Pluie Imprévue)
    else if (randomEvent >= 4.2 && randomEvent < 6.0 && meteo === 'Sec' && lap > 3 && lap < totalLaps - 2) {
      meteo = 'Pluie Intense';
      realisticPositionCeiling = 1; // La pluie rebat totalement les cartes !
      event = "🌧️ DÉLUGE SOUDAIN SUR LA PISTE !";
      comment = `🎙️ COMMENTATEUR TV : "LE DÉLUGE S'ABAT SUR LE CIRCUIT ! Les monoplaces glissent ! Tout le monde doit rentrer d'urgence chausser les pneus Pluie !"`;
      incidentLog.push(`Tour ${lap}: Pluie torrentielle soudaine ! Piste inondée.`);
    }
    // D. Incident ou Erreur du pilote
    else {
      const incidentChance = (strategy.aggressivite === 'Banzai' ? 12 : 3.0) + (driver.style === 'Agressif' ? 4.0 : 0) + (meteo !== 'Sec' && currentCompound !== 'Wet' ? 20 : 0);
      if (Math.random() * 100 < incidentChance) {
        if (Math.random() > 0.5) {
          event = "⚠️ Blocage de roue appuyé au freinage !";
          gapToLeader += 2.1;
          comment = `🎙️ COMMENTATEUR TV : "OH LE GROS BLOCAGE DE ROUE pour ${driver.nom} ! Un nuage de fumée bleue au virage !"`;
        } else {
          event = "💥 Excursion sur le vibreur extérieur !";
          if (currentPosition < competitors.length + 1) {
            currentPosition += 1;
            gapToLeader += 2.5;
            comment = `🎙️ COMMENTATEUR TV : "ERREUR DE TRAJECTOIRE ! ${driver.nom} sort large sur le vibreur et perd une position ! P${currentPosition}."`;
          }
        }
        incidentLog.push(`Tour ${lap}: ${event}`);
      }
    }

    // 3. Attaque / Dépassement du joueur (Calcul réaliste de la possibilité de dépasser)
    // Trouver le niveau de voiture du concurrent juste devant
    const rivalAhead = competitors[(currentPosition - 2 + competitors.length) % competitors.length];
    const rivalCarLevel = rivalAhead ? rivalAhead.niveauVoiture : 75;
    const carDelta = carLevel - rivalCarLevel; // Différence de performance voiture

    // Si la voiture devant est beaucoup plus performante, le dépassement est très difficile sauf si gros delta pneu ou pluie
    let overtakeDifficulty = 0;
    if (carDelta < -20) overtakeDifficulty = 35; // Voiture devant nettement supérieure !
    else if (carDelta < -10) overtakeDifficulty = 20;

    const overtakeSuccessChance = (driver.stats.depassement * 0.35) + (circuit.opportunitesDepassement * 2.5) - overtakeDifficulty - (currentPosition <= 3 ? 20 : 0);
    
    // Le dépassement ne peut réussir QUE si currentPosition > realisticPositionCeiling
    if (currentPosition > realisticPositionCeiling && !hasPitStop && Math.random() * 100 < overtakeSuccessChance) {
      if (currentTireWear > 28) {
        currentPosition = Math.max(realisticPositionCeiling, currentPosition - 1);
        gapToLeader = Math.max(0, gapToLeader - 1.2);
        const rivalName = rivalAhead?.nom || 'le concurrent';
        
        event = `🚀 DÉPASSEMENT RÉUSSI ! Passage P${currentPosition}`;
        comment = `🎙️ COMMENTATEUR TV : "MAGNIFIQUE MANOEVRE ! ${driver.nom} plonge au freinage sur ${rivalName} et s'empare de la P${currentPosition} !"`;
        incidentLog.push(`Tour ${lap}: Dépassement réussi sur ${rivalName} (P${currentPosition}) !`);
      }
    } else if (currentPosition < competitors.length + 1 && (currentTireWear < 30 || carDelta < -15) && Math.random() > 0.60) {
      // 4. Les voitures plus rapides derrière dépassent naturellement si voiture du joueur sous-performante
      currentPosition += 1;
      gapToLeader += 1.9;
      event = `📉 Pression du peloton ! Perte de position P${currentPosition}`;
      comment = `🎙️ COMMENTATEUR TV : "LA PUISSANCE PARLE ! La monoplace de ${driver.nom} manque de vitesse de pointe et ne peut contenir ses poursuivants. P${currentPosition}."`;
    } else if (currentPosition > 1 && Math.random() > 0.72) {
      // 5. Défense sous pression
      comment = `🎙️ COMMENTATEUR TV : "BATAILLE INTENSE ! ${driver.nom} défend sa position avec véhémence au freinage !"`;
    }

    lapsLog.push({
      lap,
      position: currentPosition,
      weather: meteo,
      tireWearPercent: Math.round(currentTireWear),
      gapToLeaderSec: parseFloat(gapToLeader.toFixed(1)),
      lapTimeSec: parseFloat(lapTimeSec.toFixed(2)),
      commentary: comment,
      event,
      hasPitStop
    });
  }

  const positionFinale = currentPosition;

  // Calcul du classement final complet
  const classementFinal: DriverPositionResult[] = [];
  
  // Placer le joueur
  classementFinal.push({
    position: positionFinale,
    driverName: driver.nom,
    teamName: team.nom,
    teamColor: team.couleurHex,
    isUser: true,
    timeGapSec: parseFloat(gapToLeader.toFixed(1)),
    bestLapSec: parseFloat(bestLapTime.toFixed(2)),
    pointsGained: getPointsForPosition(positionFinale),
    status: 'Finished'
  });

  // Placer les rivaux
  let posCount = 1;
  effectiveCompetitors.forEach((c) => {
    if (posCount === positionFinale) posCount++;
    const gap = (posCount - 1) * 2.1 + (Math.random() * 1.5);
    classementFinal.push({
      position: posCount,
      driverName: c.nom,
      teamName: c.equipeNom,
      teamColor: c.equipeCouleur,
      isUser: false,
      timeGapSec: parseFloat(gap.toFixed(1)),
      bestLapSec: parseFloat((bestLapTime + Math.random() * 1.2).toFixed(2)),
      pointsGained: getPointsForPosition(posCount),
      status: 'Finished'
    });
    posCount++;
  });

  classementFinal.sort((a, b) => a.position - b.position);

  // Calcules de primes et objectifs
  const pointsGagnes = getPointsForPosition(positionFinale);
  let sponsorPayed = 0;
  let sponsorBonus = false;

  sponsors.forEach(s => {
    sponsorPayed += s.budgetBase;
    if (positionFinale <= s.objectifMaxPosition) {
      sponsorPayed += s.primeObjectif;
      sponsorBonus = true;
    }
  });

  // Salaires / Gains
  let gainFinancier = sponsorPayed;
  if (team.f1Salary) {
    gainFinancier += Math.round(team.f1Salary / 10); // salaire par course
  }

  const gainReputation = Math.max(-5, Math.round((10 - positionFinale) * 1.5 + (pointsGagnes > 0 ? 3 : 0)));
  const gainMotivation = positionFinale <= 3 ? 10 : (positionFinale <= 8 ? 2 : -5);

  return {
    circuit,
    meteo,
    strategy,
    positionQualif,
    positionFinale,
    meilleurTour: parseFloat(bestLapTime.toFixed(2)),
    isMeilleurTourCourse: isMeilleurTour,
    lapsLog,
    classementFinal,
    pointsGagnes,
    gainFinancier,
    gainReputation,
    gainMotivation,
    sponsorPayed,
    sponsorBonus,
    incidentLog,
    choixEffectues: []
  };
}

export function getPointsForPosition(pos: number): number {
  const pointsMap: Record<number, number> = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1
  };
  return pointsMap[pos] || 0;
}
