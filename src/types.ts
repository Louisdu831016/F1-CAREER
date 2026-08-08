export type GameState = 
  | 'creation_pilote' 
  | 'choix_equipe' 
  | 'tableau_de_bord' 
  | 'choix_hors_piste'
  | 'resultat_course' 
  | 'transition_saison';

export type Categorie = 'Karting' | 'F4' | 'F3' | 'F2' | 'F1';

export type DrivingStyle = 
  | 'Agressif' 
  | 'Calculateur' 
  | 'Équilibré' 
  | 'Bête de Qualification' 
  | 'Spécialiste Pluie'
  | 'King of Wet'
  | 'Préservateur Mécanique'
  | 'Freineur Tardif'
  | 'Virtuose du Départ'
  | 'Pilote Analyste Télémétrique';

export type FamilyOrigin = 
  | 'Repéré en Karting Local'
  | 'Famille Modeste & Sacrifices' 
  | 'Classe Moyenne Passionnée' 
  | 'Famille Aisée / Entrepreneur' 
  | 'Fils/Fille de Rentier'
  | 'Dynastie Sport Automobile'
  | 'Pistonné Académie Constructeur';

export interface DriverStats {
  vitesse: number; // 0-100
  regularite: number; // 0-100
  gestionPneus: number; // 0-100
  depassement: number; // 0-100
  defense: number; // 0-100
  adaptabilite: number; // 0-100 (météo & conditions)
  talent: number; // 0-100
  motivation: number; // 0-100
}

export interface Specialite {
  id: string;
  nom: string;
  description: string;
  icon: string;
  statBonus?: Partial<DriverStats>;
}

export interface DriverRelationships {
  confianceDirecteur: number; // 0-100 (0 = menacé, 100 = favori absolu)
  relationCoequipier: number; // 0-100 (0 = guerre totale, 100 = parfaite harmonie)
  tensionRival: number; // 0-100 (0 = respect, 100 = vendetta sur la piste)
  nomRival: string;
  nomCoequipier: string;
}

export interface Driver {
  nom: string;
  nationalite: string;
  flagCode: string;
  age: number; // Début de carrière à 12 ans
  style: DrivingStyle;
  origine: FamilyOrigin;
  stats: DriverStats;
  budget: number;
  reputation: number; // 0-100
  pointsChampionnat: number;
  victoires: number;
  podiums: number;
  poles: number;
  coursesTotales: number;
  titres: number;
  niveauExperience: number;
  specialites: Specialite[];
  relations: DriverRelationships;
}

export interface Sponsor {
  id: string;
  nom: string;
  budgetBase: number; // Prime par course
  primeObjectif: number; // Bonus si objectif atteint
  objectif: string; // Ex: "Top 5 à chaque course", "Podium"
  objectifMaxPosition: number;
  logoColor: string;
  contratSaisonsRestantes: number;
}

export interface Team {
  id: string;
  nom: string;
  prestige: number; // 0-100
  coutSaison: number; // Coût annuel pour le pilote
  niveauMateriel: number; // 0-100
  objectifSaison: string;
  couleurHex: string;
  moteur: string;
  pays: string;
  f1Salary?: number;
  directeurNom?: string;
  coequipierNom?: string;
}

export interface Circuit {
  id: string;
  nom: string;
  pays: string;
  flag: string;
  longueurKm: number;
  tours: number;
  difficulteTechnique: number; // 1-10
  opportunitesDepassement: number; // 1-10
  usurePneusHaute: boolean;
  probabilitePluie: number; // 0-100%
  description: string;
}

export type TireCompound = 'Soft' | 'Medium' | 'Hard' | 'Wet';
export type AggressivenessLevel = 'Économe' | 'Normal' | 'Attaque' | 'Banzai';

export interface RaceStrategy {
  pneuDepart: TireCompound;
  aggressivite: AggressivenessLevel;
  tourPitonPrevu: number | null;
  pneuApresPit: TireCompound;
  consigneEquipeMsg?: string;
}

export interface TrackChoiceOption {
  id: string;
  texte: string;
  description: string;
  type: 'prudent' | 'audacieux' | 'rebelle' | 'strategique';
  impactCourseResumee: string;
  impactPiloteResumee: string;
  impacts: {
    gapSecDelta: number;
    positionDelta: number; // -1 = gain d'1 position, +1 = perte
    tireWearPenalty: number;
    statChanges?: Partial<DriverStats>;
    moneyChange?: number;
    reputationChange?: number;
    confianceDirecteurDelta?: number;
    relationCoequipierDelta?: number;
    tensionRivalDelta?: number;
    unlockSpecialite?: Specialite;
  };
}

export interface TrackDilemma {
  id: string;
  tour: number;
  titre: string;
  situation: string;
  consigneIngenieur: string;
  options: TrackChoiceOption[];
}

export interface OffTrackDilemma {
  id: string;
  titre: string;
  categorie: 'Media' | 'Paddock' | 'Entraînement' | 'Sponsor';
  interlocuteur: string;
  description: string;
  options: {
    id: string;
    texte: string;
    description: string;
    impacts: {
      statsBoost?: Partial<DriverStats>;
      moneyChange?: number;
      reputationChange?: number;
      motivationChange?: number;
      confianceDirecteurDelta?: number;
      relationCoequipierDelta?: number;
      tensionRivalDelta?: number;
      unlockSpecialite?: Specialite;
    };
  }[];
}

export interface RdUpgradeOption {
  id: string;
  nom: string;
  categorie: 'Moteur' | 'Aérodynamique' | 'Châssis' | 'Fiabilité';
  taille: 'Mineure' | 'Moyenne' | 'Majeure';
  delaiCourses: number; // 1 course (Mineure), 2 courses (Moyenne), 3 courses (Majeure)
  cout: number;
  gainNiveauMateriel: number;
  statBoost?: Partial<DriverStats>;
  description: string;
}

export interface ActiveRdProject {
  id: string;
  upgrade: RdUpgradeOption;
  coursesRestantes: number;
  courseLancementIndex?: number;
}

export interface ChoiceImpactFeedback {
  titre: string;
  type: 'piste' | 'paddock' | 'media';
  descriptionChoix: string;
  impactCourseLogs: string[];
  statChanges: string[];
  specialiteDebloquee?: Specialite;
  gainFinancier: number;
  relationshipsChanges: {
    confianceDirecteur?: number;
    relationCoequipier?: number;
    tensionRival?: number;
  };
}

export interface Competitor {
  id: string;
  nom: string;
  nationalite: string;
  flag: string;
  equipeNom: string;
  equipeCouleur: string;
  niveauPilote: number;
  niveauVoiture: number;
  points: number;
}

export interface LapResult {
  lap: number;
  position: number;
  weather: 'Sec' | 'Pluie Légère' | 'Pluie Intense';
  tireWearPercent: number;
  gapToLeaderSec: number;
  lapTimeSec: number;
  commentary: string;
  event: string | null;
  hasPitStop: boolean;
}

export interface DriverPositionResult {
  position: number;
  driverName: string;
  teamName: string;
  teamColor: string;
  isUser: boolean;
  timeGapSec: number;
  bestLapSec: number;
  pointsGained: number;
  status: 'Finished' | 'Abandon (Accident)' | 'Abandon (Panne Mécanique)';
}

export interface RaceResult {
  circuit: Circuit;
  meteo: 'Sec' | 'Pluie Légère' | 'Pluie Intense';
  strategy?: RaceStrategy;
  positionQualif: number;
  positionFinale: number;
  meilleurTour: number;
  isMeilleurTourCourse: boolean;
  lapsLog: LapResult[];
  classementFinal: DriverPositionResult[];
  pointsGagnes: number;
  gainFinancier: number;
  gainReputation: number;
  gainMotivation: number;
  sponsorPayed: number;
  sponsorBonus: boolean;
  incidentLog: string[];
  choixEffectues: ChoiceImpactFeedback[];
}

export interface GameResponseJSON {
  gameState: GameState;
  pilote: {
    nom: string;
    nationalite: string;
    style: string;
    origine: string;
    stats: DriverStats;
    budget: number;
    reputation: number;
    specialites?: Specialite[];
    relations?: DriverRelationships;
  };
  categorieActuelle: Categorie;
  sponsors: {
    nom: string;
    budgetBase: number;
    primeObjectif: number;
    objectif: string;
  }[];
  equipesDisponibles: {
    id: string;
    nom: string;
    prestige: number;
    coutSaison: number;
    niveauMateriel: number;
    objectifSaison: string;
  }[];
  messageSystème: string;
}

export interface NewsArticle {
  id: string;
  titre: string;
  source: string;
  date: string;
  contenu: string;
  categorie: string;
}

