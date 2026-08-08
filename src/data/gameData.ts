import { 
  Categorie, 
  Circuit, 
  DrivingStyle, 
  FamilyOrigin, 
  Sponsor, 
  Team,
  Competitor,
  Driver
} from '../types';

export const NATIONALITIES = [
  { name: 'France', flag: '🇫🇷', code: 'FR' },
  { name: 'Belgique', flag: '🇧🇪', code: 'BE' },
  { name: 'Suisse', flag: '🇨🇭', code: 'CH' },
  { name: 'Royaume-Uni', flag: '🇬🇧', code: 'GB' },
  { name: 'Italie', flag: '🇮🇹', code: 'IT' },
  { name: 'Espagne', flag: '🇪🇸', code: 'ES' },
  { name: 'Allemagne', flag: '🇩🇪', code: 'DE' },
  { name: 'Pays-Bas', flag: '🇳🇱', code: 'NL' },
  { name: 'Monaco', flag: '🇲🇨', code: 'MC' },
  { name: 'Japon', flag: '🇯🇵', code: 'JP' },
  { name: 'Brésil', flag: '🇧🇷', code: 'BR' },
  { name: 'États-Unis', flag: '🇺🇸', code: 'US' },
  { name: 'Canada', flag: '🇨🇦', code: 'CA' },
  { name: 'Australie', flag: '🇦🇺', code: 'AU' },
  { name: 'Mexique', flag: '🇲🇽', code: 'MX' }
];

export const DRIVING_STYLES_INFO: Record<DrivingStyle, {
  label: string;
  description: string;
  bonuses: string[];
  penalties: string[];
  vitesse: number;
  regularite: number;
  gestionPneus: number;
  depassement: number;
  defense: number;
  adaptabilite: number;
  talent: number;
  motivation: number;
}> = {
  'Agressif': {
    label: 'Agressif',
    description: 'Pilote incisif qui ne recule devant aucun dépassement au prix d\'une usure accélérée des gommes et de risques accrus.',
    bonuses: ['+Vitesse pure (+8)', '+Dépassements chauds (+12)'],
    penalties: ['-Usure pneus très rapide (-20%)', '+Risque d\'incident de course (+10%)'],
    vitesse: 54,
    regularite: 44,
    gestionPneus: 40,
    depassement: 58,
    defense: 48,
    adaptabilite: 46,
    talent: 52,
    motivation: 75
  },
  'Calculateur': {
    label: 'Calculateur',
    description: 'Stratège métronome qui préserve le matériel et le carburant pour frapper dans les derniers tours de course.',
    bonuses: ['+Gestion parfaite des pneus (+18)', '+Régularité chirurgicale (+15)'],
    penalties: ['-Vitesse qualification (-10%)', '-Prise de risque au départ (-8)'],
    vitesse: 44,
    regularite: 56,
    gestionPneus: 58,
    depassement: 42,
    defense: 54,
    adaptabilite: 48,
    talent: 50,
    motivation: 70
  },
  'Équilibré': {
    label: 'Équilibré',
    description: 'Profil polyvalent, capable de s\'adapter à toutes les situations de course sans point faible majeur.',
    bonuses: ['Polyvalence globale équilibrée', 'Performances constantes en tout temps'],
    penalties: ['Aucune spécialité extrême'],
    vitesse: 50,
    regularite: 50,
    gestionPneus: 50,
    depassement: 50,
    defense: 50,
    adaptabilite: 50,
    talent: 50,
    motivation: 75
  },
  'Bête de Qualification': {
    label: 'Bête de Qualification',
    description: 'Spécialiste du tour chrono parfait en pneus neufs. Souffre davantage en rythme de course dégradé.',
    bonuses: ['+Vitesse explosive sur 1 tour (+15)', '+Grille de départ favorisée (+2 à +4 pos)'],
    penalties: ['-Chute de rythme en fin de relais (-12%)', '-Usure pneus précoce (-10)'],
    vitesse: 58,
    regularite: 44,
    gestionPneus: 40,
    depassement: 48,
    defense: 44,
    adaptabilite: 46,
    talent: 52,
    motivation: 75
  },
  'Spécialiste Pluie': {
    label: 'Spécialiste Pluie',
    description: 'Formidable virtuose sous le déluge. Trouve du grip là où les autres glissent, mais légèrement en deçà sur le sec.',
    bonuses: ['+Performance décuplée sur pluie (+20)', '+Sens de la trajectoire humide'],
    penalties: ['-Vitesse pure sur piste sèche (-5%)'],
    vitesse: 45,
    regularite: 48,
    gestionPneus: 48,
    depassement: 50,
    defense: 46,
    adaptabilite: 64,
    talent: 52,
    motivation: 75
  },
  'King of Wet': {
    label: 'King of Wet (Pluie Extrême)',
    description: 'Véritable prodige sous l\'orage cataclysmique. Transforme les courses détrempées en démonstrations de maître.',
    bonuses: ['+Invincibilité sous la tempête (+28)', '+Réflexes sur l\'aquaplaning (+15)'],
    penalties: ['-Destruction rapide des gommes si la piste sèche (-25%)', '-Régularité moyenne sur le sec'],
    vitesse: 44,
    regularite: 46,
    gestionPneus: 44,
    depassement: 52,
    defense: 46,
    adaptabilite: 66,
    talent: 54,
    motivation: 80
  },
  'Préservateur Mécanique': {
    label: 'Préservateur Mécanique',
    description: 'Expert de la mécanique et du respect des composants. Zéro casse, longévité maximale du matériel.',
    bonuses: ['+Fiabilité moteur & boite (+25%)', '+Durée de vie des gommes max (+20%)'],
    penalties: ['-Incisivité au freinage (-10)', '-Temps au tour plus prudent'],
    vitesse: 42,
    regularite: 56,
    gestionPneus: 60,
    depassement: 42,
    defense: 52,
    adaptabilite: 46,
    talent: 48,
    motivation: 70
  },
  'Freineur Tardif': {
    label: 'Freineur Tardif',
    description: 'Incisivité maximale aux points de freinage. Capable de dépasser dans des trous de souris improbables.',
    bonuses: ['+Capacité de dépassement d\'élite (+22)', '+Défense de position imprenable'],
    penalties: ['-Blocages de roues fréquents (+12%)', '-Méplat sur le pneu provoquant des vibrations'],
    vitesse: 52,
    regularite: 44,
    gestionPneus: 42,
    depassement: 60,
    defense: 56,
    adaptabilite: 46,
    talent: 52,
    motivation: 75
  },
  'Virtuose du Départ': {
    label: 'Virtuose du Départ',
    description: 'Spécialiste de l\'extinction des feux. Gagne systématiquement 2 à 4 positions dans le premier tour.',
    bonuses: ['+Envol canon au départ (+3 positions)', '+Agressivité du 1er tour (+15)'],
    penalties: ['-Régularité en milieu de course (-8)', '-Sensibilité à la fatigue'],
    vitesse: 52,
    regularite: 46,
    gestionPneus: 44,
    depassement: 56,
    defense: 52,
    adaptabilite: 46,
    talent: 50,
    motivation: 75
  },
  'Pilote Analyste Télémétrique': {
    label: 'Pilote Analyste Télémétrique',
    description: 'Ingénieur en combinaison. Comprend les données de télémétrie comme personne pour régler la voiture.',
    bonuses: ['+Confiance Directeur d\'Écurie (+20)', '+Adaptation rapide aux nouveaux réglages (+15)'],
    penalties: ['-Pilotage parfois trop cérébral (-6 talent instinctif)', '-Prise de risque minimale'],
    vitesse: 46,
    regularite: 56,
    gestionPneus: 54,
    depassement: 44,
    defense: 50,
    adaptabilite: 52,
    talent: 48,
    motivation: 72
  }
};

export const FAMILY_ORIGINS_INFO: Record<FamilyOrigin, {
  label: string;
  description: string;
  startingBudget: number;
  bonuses: string[];
  penalties: string[];
  statBoosts: Partial<Record<keyof Driver['stats'], number>>;
}> = {
  'Repéré en Karting Local': {
    label: 'Repéré en Karting Local',
    description: 'Pilote repéré lors d\'une course régionale. Aucun piston, un talent pur brut apprécié des médias.',
    startingBudget: 15000,
    bonuses: ['+Motivation & Faim de Vaincre (+15)', '+Sympathie des Médias et Paddock (+10)'],
    penalties: ['-Budget très serré pour la première saison', '-Aucun matériel de rechange'],
    statBoosts: { talent: 8, motivation: 15, depassement: 6 }
  },
  'Famille Modeste & Sacrifices': {
    label: 'Famille Modeste & Sacrifices',
    description: 'Budget financé par les économies et sacrifices familiaux. Zéro droit à l\'erreur financière.',
    startingBudget: 8000,
    bonuses: ['+Mental d\'acier & Sang-froid (+12)', '+Régularité sous haute pression (+8)'],
    penalties: ['-Budget minimaliste (8 000 €)', '+Composants de rechange d\'occasion'],
    statBoosts: { talent: 10, motivation: 18, regularite: 8 }
  },
  'Classe Moyenne Passionnée': {
    label: 'Classe Moyenne Passionnée',
    description: 'Famille passionnée financée par un petit réseau de sponsors locaux. Équilibre sain.',
    startingBudget: 35000,
    bonuses: ['+Confiance Écurie initiale (+5)', '+Équilibre financier serein'],
    penalties: ['Aucun statut privilégié dans le Paddock'],
    statBoosts: { motivation: 6, vitesse: 4, regularite: 4 }
  },
  'Famille Aisée / Entrepreneur': {
    label: 'Famille Aisée / Entrepreneur',
    description: 'Soutien financier solide permettant d\'acheter le meilleur châssis et des moteurs préparés.',
    startingBudget: 95000,
    bonuses: ['+Budget confortable (95 000 €)', '+Matériel haut de gamme au départ'],
    penalties: ['-Image de "Pay-Driver" auprès des fans (-5 réput)', '-Exigence sponsor accrue (+10%)'],
    statBoosts: { gestionPneus: 6, vitesse: 6 }
  },
  'Fils/Fille de Rentier': {
    label: 'Fils / Fille de Rentier',
    description: 'Fortune personnelle massive. Les écuries vous accueillent à bras ouverts pour votre chèque.',
    startingBudget: 180000,
    bonuses: ['+Fortune personnelle immense (180 000 €)', '+Portes des meilleures écuries grand ouvertes'],
    penalties: ['-Méfiance du Directeur d\'écurie (-10% confiance)', '-Hostilité des rivaux en piste'],
    statBoosts: { vitesse: 5, gestionPneus: 5 }
  },
  'Dynastie Sport Automobile': {
    label: 'Dynastie Sport Automobile',
    description: 'Enfant d\'un ancien pilote de renom. Nom célèbre, carnet d\'adresses fourni mais pression médiatique colossale.',
    startingBudget: 100000,
    bonuses: ['+Carnet d\'adresses Paddock & Sponsors (+25)', '+Connaissance innée des ficelles de course'],
    penalties: ['-Comparaison permanente avec le parent légende', '-Pression médiatique destructrice (+20%)'],
    statBoosts: { talent: 8, depassement: 8, vitesse: 6 }
  },
  'Pistonné Académie Constructeur': {
    label: 'Pistonné Académie Constructeur',
    description: 'Membre du programme des jeunes pilotes d\'une grande marque. Accompagnement pro et coaching intensif.',
    startingBudget: 60000,
    bonuses: ['+Soutien officiel du Constructeur', '+Coaching & Télémétrie d\'écurie (+15)'],
    penalties: ['-Pression d\'éviction en cas de mauvais résultats', '-Rivalité interne féroce avec le coéquipier'],
    statBoosts: { regularite: 8, vitesse: 6, talent: 6 }
  }
};

// Circuits par catégorie (25 Grands Prix par saison dans toutes les catégories)
export const CATEGORY_CIRCUITS: Record<Categorie, Circuit[]> = {
  Karting: [
    { id: 'kart-genk', nom: 'Karting Genk - Home of Champions', pays: 'Belgique', flag: '🇧🇪', longueurKm: 1.36, tours: 12, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 35, description: 'Tracé mythique où Schumacher et Verstappen ont forgé leur légende.' },
    { id: 'kart-lonato', nom: 'South Garda Karting Lonato', pays: 'Italie', flag: '🇮🇹', longueurKm: 1.20, tours: 14, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 15, description: 'Circuit ultra-technique italien exigeant une précision chirurgicale.' },
    { id: 'kart-lemans', nom: 'International Karting Le Mans', pays: 'France', flag: '🇫🇷', longueurKm: 1.38, tours: 12, difficulteTechnique: 6, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 40, description: 'Grandesses courbes rapides et freinages puissants.' },
    { id: 'kart-wackersdorf', nom: 'Prokart Raceland Wackersdorf', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 1.19, tours: 14, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 30, description: 'Tracé sélectif allemand réputé pour ses enchaînements rapides.' },
    { id: 'kart-sarno', nom: 'Circuito Internazionale Napoli (Sarno)', pays: 'Italie', flag: '🇮🇹', longueurKm: 1.55, tours: 11, difficulteTechnique: 9, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 20, description: 'Longue ligne droite de retour favorisant les aspirations folles.' },
    { id: 'kart-zuera', nom: 'International Circuit Zuera', pays: 'Espagne', flag: '🇪🇸', longueurKm: 1.70, tours: 10, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 10, description: 'Un des plus longs circuits de karting au monde, très rapide.' },
    { id: 'kart-kristianstad', nom: 'Åsum Ring Kristianstad', pays: 'Suède', flag: '🇸🇪', longueurKm: 1.23, tours: 13, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 45, description: 'Météo scandinave piégeuse et virages en aveugle.' },
    { id: 'kart-franciacorta', nom: 'Franciacorta Karting Track', pays: 'Italie', flag: '🇮🇹', longueurKm: 1.30, tours: 13, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 25, description: 'Infrastructures modernes et revêtement très abrasif.' },
    { id: 'kart-portimao', nom: 'Kartódromo Internacional do Algarve', pays: 'Portugal', flag: '🇵🇹', longueurKm: 1.53, tours: 11, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Dénivelés spectaculaires au bord de l\'Atlantique.' },
    { id: 'kart-campillos', nom: 'Karting Campillos Malaga', pays: 'Espagne', flag: '🇪🇸', longueurKm: 1.58, tours: 11, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 10, description: 'Chaleur Andalouse et freinages en descente.' },
    { id: 'kart-salbris', nom: 'Circuit International de Salbris', pays: 'France', flag: '🇫🇷', longueurKm: 1.50, tours: 11, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 35, description: 'Tracé français historique très apprécié des pilotes européens.' },
    { id: 'kart-ampfing', nom: 'Ampfing Outdoor Kart Track', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 1.06, tours: 15, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 30, description: 'Piste bavaroise sinueuse et serrée.' },
    { id: 'kart-vaddargenton', nom: 'Circuit du Val d\'Argenton', pays: 'France', flag: '🇫🇷', longueurKm: 1.28, tours: 13, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 40, description: 'Virages relevés uniques en Europe.' },
    { id: 'kart-adria', nom: 'Adria International Raceway Kart', pays: 'Italie', flag: '🇮🇹', longueurKm: 1.30, tours: 13, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 25, description: 'Piste moderne éclairée pour les courses nocturnes.' },
    { id: 'kart-whilton', nom: 'Whilton Mill Kart Circuit', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 1.20, tours: 14, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 55, description: 'Tracé technique britannique exigeant un contrôle parfait sur sol mouillé.' },
    { id: 'kart-pfi', nom: 'PF International Kart Circuit (PFI)', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 1.38, tours: 12, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 50, description: 'Célèbre pont supérieur et virages inclinés.' },
    { id: 'kart-varennes', nom: 'Circuit de Varennes-sur-Allier', pays: 'France', flag: '🇫🇷', longueurKm: 1.50, tours: 11, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 35, description: 'Piste très rapide avec de grosses opportunités de dépassement.' },
    { id: 'kart-laconca', nom: 'Circuito La Conca (Muro Leccese)', pays: 'Italie', flag: '🇮🇹', longueurKm: 1.25, tours: 13, difficulteTechnique: 9, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 15, description: 'Grip phénoménal en Italie du Sud.' },
    { id: 'kart-chiva', nom: 'Kartódromo Lucas Guerrero (Chiva)', pays: 'Espagne', flag: '🇪🇸', longueurKm: 1.42, tours: 12, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 15, description: 'Complexe moderne près de Valence.' },
    { id: 'kart-ryehouse', nom: 'Rye House Kart Raceway', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 1.00, tours: 15, difficulteTechnique: 9, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 50, description: 'Le circuit d\'enfance de Lewis Hamilton.' },
    { id: 'kart-alain', nom: 'Al Ain Raceway International', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 1.60, tours: 11, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'Course sous la chaleur du désert émirati.' },
    { id: 'kart-betocarrero', nom: 'Kartódromo Beto Carrero', pays: 'Brésil', flag: '🇧🇷', longueurKm: 1.20, tours: 14, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 30, description: 'Tracé spectaculaire sud-américain.' },
    { id: 'kart-suzuka', nom: 'Suzuka Circuit South Kart Track', pays: 'Japon', flag: '🇯🇵', longueurKm: 1.26, tours: 13, difficulteTechnique: 9, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 35, description: 'Piste adjacente au mythique tracé de Formule 1.' },
    { id: 'kart-mariembourg', nom: 'Karting des Fagnes Mariembourg', pays: 'Belgique', flag: '🇧🇪', longueurKm: 1.37, tours: 12, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 45, description: 'Classique européen dans la forêt ardennaise.' },
    { id: 'kart-genk-finale', nom: 'Karting Genk Season Finale', pays: 'Belgique', flag: '🇧🇪', longueurKm: 1.36, tours: 14, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 40, description: 'Grand Dénouement du Championnat International Karting.' }
  ],
  F4: [
    { id: 'f4-nogaro', nom: 'Circuit Paul Armagnac (Nogaro)', pays: 'France', flag: '🇫🇷', longueurKm: 3.63, tours: 16, difficulteTechnique: 6, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 30, description: 'Circuit technique idéal pour apprendre le pilotage en monoplace.' },
    { id: 'f4-imola', nom: 'Autodromo Enzo e Dino Ferrari (Imola)', pays: 'Italie', flag: '🇮🇹', longueurKm: 4.90, tours: 15, difficulteTechnique: 9, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 25, description: 'Tracé à l\'ancienne avec des vibreurs agressifs et des murs proches.' },
    { id: 'f4-silverstone-nat', nom: 'Silverstone National Circuit', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 2.64, tours: 18, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 50, description: 'Météo britannique capricieuse et virages rapides légendaires.' },
    { id: 'f4-misano', nom: 'Misano World Circuit Marco Simoncelli', pays: 'Italie', flag: '🇮🇹', longueurKm: 4.22, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 20, description: 'Tracé italien fluide exigeant une bonne stabilité au freinage.' },
    { id: 'f4-magnycours', nom: 'Circuit de Nevers Magny-Cours', pays: 'France', flag: '🇫🇷', longueurKm: 4.41, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 35, description: 'Chicanes rapides Grande Courbe et Adélaïde.' },
    { id: 'f4-brandshatch', nom: 'Brands Hatch Indy Circuit', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 1.94, tours: 22, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: false, probabilitePluie: 45, description: 'Toboggan en montagnes russes dans le Kent.' },
    { id: 'f4-hockenheim', nom: 'Hockenheimring Baden-Württemberg', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 4.57, tours: 16, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 30, description: 'Épingle de la Parabolika idéale pour les dépassements.' },
    { id: 'f4-catalunya', nom: 'Circuit de Barcelona-Catalunya F4', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.67, tours: 15, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 15, description: 'Test de référence aérodynamique pour les jeunes pilotes.' },
    { id: 'f4-paulricard', nom: 'Circuit Paul Ricard (Le Castellet)', pays: 'France', flag: '🇫🇷', longueurKm: 5.84, tours: 14, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 15, description: 'Ligne droite du Mistral et bandes de dégagement multicolores.' },
    { id: 'f4-mugello', nom: 'Autodromo Internazionale del Mugello', pays: 'Italie', flag: '🇮🇹', longueurKm: 5.24, tours: 15, difficulteTechnique: 9, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 25, description: 'Enchaînements Arrabbiata 1 et 2 exigeants pour la nuque.' },
    { id: 'f4-redbullring', nom: 'Red Bull Ring (Spielberg)', pays: 'Autriche', flag: '🇦🇹', longueurKm: 4.31, tours: 17, difficulteTechnique: 6, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 30, description: 'Grosses accélérations et freinages en montée.' },
    { id: 'f4-zandvoort', nom: 'Circuit Zandvoort F4', pays: 'Pays-Bas', flag: '🇳🇱', longueurKm: 4.25, tours: 16, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 40, description: 'Bankings impressionnants dans les dunes néerlandaises.' },
    { id: 'f4-donington', nom: 'Donington Park National', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 3.15, tours: 18, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 50, description: 'Virages de Craner Curves spectaculaires.' },
    { id: 'f4-spa', nom: 'Circuit de Spa-Francorchamps F4', pays: 'Belgique', flag: '🇧🇪', longueurKm: 7.00, tours: 11, difficulteTechnique: 9, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 55, description: 'Raidillon de l\'Eau Rouge et météo ardennaise imprévisible.' },
    { id: 'f4-vallelunga', nom: 'Autodromo Vallelunga Piero Taruffi', pays: 'Italie', flag: '🇮🇹', longueurKm: 4.08, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 20, description: 'Piste technique près de Rome.' },
    { id: 'f4-jerez', nom: 'Circuito de Jerez-Ángel Nieto', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.43, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 15, description: 'Circuit d\'entraînement hivernal espagnol.' },
    { id: 'f4-nurburgring', nom: 'Nürburgring GP-Strecke F4', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 3.63, tours: 17, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 45, description: 'Brume et pluie fréquentes dans l\'Eifel.' },
    { id: 'f4-oultonpark', nom: 'Oulton Park Island Circuit', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 3.64, tours: 16, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: false, probabilitePluie: 50, description: 'Piste étroite bordée d\'arbres sans marge d\'erreur.' },
    { id: 'f4-varano', nom: 'Autodromo Riccardo Paletti (Varano)', pays: 'Italie', flag: '🇮🇹', longueurKm: 2.35, tours: 20, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: false, probabilitePluie: 20, description: 'Circuit d\'agilité sinueux.' },
    { id: 'f4-dijon', nom: 'Circuit de Dijon-Prenois', pays: 'France', flag: '🇫🇷', longueurKm: 3.80, tours: 17, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 35, description: 'Courbe de Pouas et longue ligne droite aveugle.' },
    { id: 'f4-estoril', nom: 'Autódromo do Estoril', pays: 'Portugal', flag: '🇵🇹', longueurKm: 4.18, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 25, description: 'Vent fort et longue ligne droite du Portugal.' },
    { id: 'f4-ledenon', nom: 'Circuit de Lédenon', pays: 'France', flag: '🇫🇷', longueurKm: 3.15, tours: 18, difficulteTechnique: 10, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 20, description: 'Le grand huit gardois aux dénivelés vertigineux.' },
    { id: 'f4-snetterton', nom: 'Snetterton 300 Circuit', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 4.78, tours: 15, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 45, description: 'Longues lignes droites et virages lents en Angleterre.' },
    { id: 'f4-valencia', nom: 'Circuit Ricardo Tormo (Valencia)', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.01, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 15, description: 'Tracé style stadium avec vue panoramique.' },
    { id: 'f4-paulricard-finale', nom: 'Paul Ricard Season Finale F4', pays: 'France', flag: '🇫🇷', longueurKm: 5.84, tours: 15, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Ultime explication pour le titre de champion de F4.' }
  ],
  F3: [
    { id: 'f3-sakhir', nom: 'Bahrain International Circuit (Sakhir)', pays: 'Bahreïn', flag: '🇧🇭', longueurKm: 5.41, tours: 16, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 5, description: 'Inauguration sous les projecteurs du désert bahreïni.' },
    { id: 'f3-melbourne', nom: 'Albert Park Circuit (Melbourne)', pays: 'Australie', flag: '🇦🇺', longueurKm: 5.28, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 20, description: 'Piste semi-urbaine autour du lac d\'Albert Park.' },
    { id: 'f3-imola', nom: 'Autodromo Enzo e Dino Ferrari F3', pays: 'Italie', flag: '🇮🇹', longueurKm: 4.90, tours: 16, difficulteTechnique: 9, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 30, description: 'Murs proches et freinage d\'Acque Minerali.' },
    { id: 'f3-monaco', nom: 'Circuit de Monaco F3', pays: 'Monaco', flag: '🇲🇨', longueurKm: 3.33, tours: 18, difficulteTechnique: 10, opportunitesDepassement: 2, usurePneusHaute: false, probabilitePluie: 25, description: 'Qualifications capitales dans les rues de la Principauté.' },
    { id: 'f3-catalunya', nom: 'Circuit de Barcelona-Catalunya F3', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.67, tours: 17, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 15, description: 'Gestion de la dégradation pneumatique sur l\'asphalte catalan.' },
    { id: 'f3-redbullring', nom: 'Red Bull Ring (Spielberg)', pays: 'Autriche', flag: '🇦🇹', longueurKm: 4.31, tours: 18, difficulteTechnique: 6, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 30, description: 'Tracé court avec 3 zones DRS stratégiques.' },
    { id: 'f3-silverstone', nom: 'Silverstone GP Circuit F3', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 5.89, tours: 15, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 45, description: 'Les célèbres enchaînements Maggotts et Becketts.' },
    { id: 'f3-hungaroring', nom: 'Hungaroring (Budapest)', pays: 'Hongrie', flag: '🇭🇺', longueurKm: 4.38, tours: 17, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 25, description: 'Le tourniquet hongrois, très sinueux et étouffant.' },
    { id: 'f3-spa', nom: 'Circuit de Spa-Francorchamps', pays: 'Belgique', flag: '🇧🇪', longueurKm: 7.00, tours: 14, difficulteTechnique: 9, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 55, description: 'Le toboggan des Ardennes avec le Raidillon de l\'Eau Rouge.' },
    { id: 'f3-monza', nom: 'Autodromo Nazionale Monza F3', pays: 'Italie', flag: '🇮🇹', longueurKm: 5.79, tours: 16, difficulteTechnique: 5, opportunitesDepassement: 10, usurePneusHaute: false, probabilitePluie: 20, description: 'Aspiration massive et freinage brutal à la Prima Variante.' },
    { id: 'f3-zandvoort', nom: 'Circuit Zandvoort', pays: 'Pays-Bas', flag: '🇳🇱', longueurKm: 4.25, tours: 17, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 35, description: 'Virages en banking uniques et tracé étroit au bord de la mer.' },
    { id: 'f3-hockenheim', nom: 'Hockenheimring Grand Prix F3', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 4.57, tours: 16, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 30, description: 'Secteur du Stadium bondé de supporters.' },
    { id: 'f3-mugello', nom: 'Circuit du Mugello F3', pays: 'Italie', flag: '🇮🇹', longueurKm: 5.24, tours: 15, difficulteTechnique: 9, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 20, description: 'Piste toscane rapide et vallonnée.' },
    { id: 'f3-paulricard', nom: 'Circuit Paul Ricard F3', pays: 'France', flag: '🇫🇷', longueurKm: 5.84, tours: 15, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 15, description: 'Grandes zones de dégagement et chicane Nord.' },
    { id: 'f3-portimao', nom: 'Autódromo Internacional do Algarve F3', pays: 'Portugal', flag: '🇵🇹', longueurKm: 4.65, tours: 16, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Montagnes russes portugaises.' },
    { id: 'f3-jerez', nom: 'Circuito de Jerez F3', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.43, tours: 17, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 15, description: 'Tracé technique de la province de Cadix.' },
    { id: 'f3-nurburgring', nom: 'Nürburgring Grand Prix F3', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 5.15, tours: 15, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 45, description: 'Virage Schumacher et chicane Veedol.' },
    { id: 'f3-brandshatch', nom: 'Brands Hatch Grand Prix Circuit', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 3.91, tours: 18, difficulteTechnique: 9, opportunitesDepassement: 6, usurePneusHaute: false, probabilitePluie: 50, description: 'Tracé GP complet à travers la forêt britannique.' },
    { id: 'f3-losail', nom: 'Lusail International Circuit F3', pays: 'Qatar', flag: '🇶🇦', longueurKm: 5.42, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'Piste ultra-fluide et nocturne au Qatar.' },
    { id: 'f3-yasmarina', nom: 'Yas Marina Circuit F3', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 5.28, tours: 16, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 5, description: 'Sous les lumières d\'Abu Dhabi.' },
    { id: 'f3-macau', nom: 'Guia Circuit Macau FIA F3 World Cup', pays: 'Macao', flag: '🇲🇴', longueurKm: 6.12, tours: 12, difficulteTechnique: 10, opportunitesDepassement: 4, usurePneusHaute: false, probabilitePluie: 20, description: 'Le coupe-gorge légendaire de Macao, épreuve ultime de F3.' },
    { id: 'f3-sepang', nom: 'Sepang International Circuit F3', pays: 'Malaisie', flag: '🇲🇾', longueurKm: 5.54, tours: 15, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 60, description: 'Averses tropicales torrentielles garanties.' },
    { id: 'f3-hermanos', nom: 'Autódromo Hermanos Rodríguez F3', pays: 'Mexique', flag: '🇲🇽', longueurKm: 4.30, tours: 18, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 25, description: 'Air raréfié en altitude et secteur du Foro Sol.' },
    { id: 'f3-magnycours', nom: 'Magny-Cours Grand Prix F3', pays: 'France', flag: '🇫🇷', longueurKm: 4.41, tours: 17, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 35, description: 'Chicanes exigeantes d\'Imola et du Château d\'Eau.' },
    { id: 'f3-yasmarina-finale', nom: 'Yas Marina World Finale F3', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 5.28, tours: 17, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'Dernière manche décisive pour la couronne mondiale F3.' }
  ],
  F2: [
    { id: 'f2-sakhir', nom: 'Bahrain International Circuit (Sakhir)', pays: 'Bahreïn', flag: '🇧🇭', longueurKm: 5.41, tours: 18, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 5, description: 'Chaleur et forte dégradation des gommes arrière.' },
    { id: 'f2-jeddah', nom: 'Jeddah Corniche Circuit', pays: 'Arabie Saoudite', flag: '🇸🇦', longueurKm: 6.17, tours: 16, difficulteTechnique: 10, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 5, description: 'Le circuit urbain le plus rapide du monde entre les murs.' },
    { id: 'f2-melbourne', nom: 'Albert Park Circuit (Melbourne)', pays: 'Australie', flag: '🇦🇺', longueurKm: 5.28, tours: 18, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 25, description: 'Zones DRS ultra-rapides au bord du lac.' },
    { id: 'f2-baku', nom: 'Baku City Circuit', pays: 'Azerbaïdjan', flag: '🇦🇿', longueurKm: 6.00, tours: 16, difficulteTechnique: 9, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 10, description: 'Circuit urbain extrême entre mur de la vieille ville et ligne droite de 2 km.' },
    { id: 'f2-imola', nom: 'Autodromo Enzo e Dino Ferrari F2', pays: 'Italie', flag: '🇮🇹', longueurKm: 4.90, tours: 18, difficulteTechnique: 9, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 30, description: 'Freinage de Rivazza et Variante Alta.' },
    { id: 'f2-monaco', nom: 'Circuit de Monaco F2', pays: 'Monaco', flag: '🇲🇨', longueurKm: 3.33, tours: 22, difficulteTechnique: 10, opportunitesDepassement: 2, usurePneusHaute: false, probabilitePluie: 25, description: 'Stratégie d\'arrêt aux stands cruciale en Principauté.' },
    { id: 'f2-catalunya', nom: 'Circuit de Barcelona-Catalunya', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.67, tours: 18, difficulteTechnique: 8, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 15, description: 'Test ultime de l\'aérodynamique et de la gestion du pneu avant gauche.' },
    { id: 'f2-redbullring', nom: 'Red Bull Ring (Spielberg)', pays: 'Autriche', flag: '🇦🇹', longueurKm: 4.31, tours: 20, difficulteTechnique: 6, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 30, description: 'Batailles de freinages roues contre roues.' },
    { id: 'f2-silverstone', nom: 'Silverstone Grand Prix F2', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 5.89, tours: 17, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 45, description: 'Charge aérodynamique extrême dans Copse et Stowe.' },
    { id: 'f2-hungaroring', nom: 'Hungaroring (Budapest) F2', pays: 'Hongrie', flag: '🇭🇺', longueurKm: 4.38, tours: 19, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 25, description: 'Surchauffe des gommes sous le soleil hongrois.' },
    { id: 'f2-spa', nom: 'Circuit de Spa-Francorchamps F2', pays: 'Belgique', flag: '🇧🇪', longueurKm: 7.00, tours: 15, difficulteTechnique: 9, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 55, description: 'Combe et Blanchimont à plus de 290 km/h.' },
    { id: 'f2-monza', nom: 'Autodromo Nazionale Monza', pays: 'Italie', flag: '🇮🇹', longueurKm: 5.79, tours: 18, difficulteTechnique: 5, opportunitesDepassement: 10, usurePneusHaute: false, probabilitePluie: 20, description: 'Le temple de la vitesse! Aspiration et freinages d\'outre-tombe à la chicane.' },
    { id: 'f2-losail', nom: 'Lusail International Circuit F2', pays: 'Qatar', flag: '🇶🇦', longueurKm: 5.42, tours: 18, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'Virages à moyenne et haute vitesse sollicitant les pneus.' },
    { id: 'f2-yasmarina', nom: 'Yas Marina Circuit F2', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 5.28, tours: 18, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 5, description: 'Ligne droite du grand hôtel et marina.' },
    { id: 'f2-paulricard', nom: 'Circuit Paul Ricard F2', pays: 'France', flag: '🇫🇷', longueurKm: 5.84, tours: 17, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 15, description: 'Virage de Signes pris à fond.' },
    { id: 'f2-nurburgring', nom: 'Nürburgring GP F2', pays: 'Allemagne', flag: '🇩🇪', longueurKm: 5.15, tours: 17, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 45, description: 'Météo changeante au cœur des montagnes allemandes.' },
    { id: 'f2-portimao', nom: 'Autódromo do Algarve Portimão F2', pays: 'Portugal', flag: '🇵🇹', longueurKm: 4.65, tours: 18, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Virages en aveugle et dénivelés intenses.' },
    { id: 'f2-sepang', nom: 'Sepang International Circuit F2', pays: 'Malaisie', flag: '🇲🇾', longueurKm: 5.54, tours: 16, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 60, description: 'Deux immenses lignes droites parallèles.' },
    { id: 'f2-zandvoort', nom: 'Circuit Zandvoort F2', pays: 'Pays-Bas', flag: '🇳🇱', longueurKm: 4.25, tours: 19, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 35, description: 'Ambiance orange sur la côte de la Mer du Nord.' },
    { id: 'f2-suzuka', nom: 'Suzuka International Circuit F2', pays: 'Japon', flag: '🇯🇵', longueurKm: 5.81, tours: 16, difficulteTechnique: 10, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 40, description: 'Le S-Curves et le 130R réputés mondalement.' },
    { id: 'f2-montreal', nom: 'Circuit Gilles-Villeneuve F2', pays: 'Canada', flag: '🇨🇦', longueurKm: 4.36, tours: 20, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 35, description: 'Le Mur des Champions sur l\'Île Notre-Dame.' },
    { id: 'f2-interlagos', nom: 'Autódromo José Carlos Pace (Interlagos)', pays: 'Brésil', flag: '🇧🇷', longueurKm: 4.31, tours: 20, difficulteTechnique: 8, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 60, description: 'S de Senna et ambiance passionnée à São Paulo.' },
    { id: 'f2-singapore', nom: 'Marina Bay Street Circuit F2', pays: 'Singapour', flag: '🇸🇬', longueurKm: 4.94, tours: 17, difficulteTechnique: 10, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 35, description: 'Humidité extrême et course de nuit physique.' },
    { id: 'f2-austin', nom: 'Circuit of the Americas (COTA) F2', pays: 'États-Unis', flag: '🇺🇸', longueurKm: 5.51, tours: 17, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Montée vers le virage 1 aveugle.' },
    { id: 'f2-yasmarina-finale', nom: 'Yas Marina Championship Finale F2', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 5.28, tours: 19, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'Dernière opportunité pour décrocher un baquet en F1.' }
  ],
  F1: [
    { id: 'f1-bahrain', nom: 'Bahrain Grand Prix (Sakhir)', pays: 'Bahreïn', flag: '🇧🇭', longueurKm: 5.41, tours: 20, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 5, description: 'Ouverture officielle de la saison sous les projecteurs du désert.' },
    { id: 'f1-jeddah', nom: 'Saudi Arabian Grand Prix (Jeddah)', pays: 'Arabie Saoudite', flag: '🇸🇦', longueurKm: 6.17, tours: 18, difficulteTechnique: 10, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 5, description: 'Circuit urbain à plus de 250 km/h de moyenne.' },
    { id: 'f1-australia', nom: 'Australian Grand Prix (Melbourne)', pays: 'Australie', flag: '🇦🇺', longueurKm: 5.28, tours: 20, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: false, probabilitePluie: 25, description: 'Le rendez-vous mythique d\'Albert Park.' },
    { id: 'f1-suzuka', nom: 'Japanese Grand Prix (Suzuka)', pays: 'Japon', flag: '🇯🇵', longueurKm: 5.81, tours: 20, difficulteTechnique: 10, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 40, description: 'Tracé mythique en 8 exigeant la plus pure virtuosité de pilotage.' },
    { id: 'f1-shanghai', nom: 'Chinese Grand Prix (Shanghai)', pays: 'Chine', flag: '🇨🇳', longueurKm: 5.45, tours: 19, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 30, description: 'L\'interminable virage 1 en escargot.' },
    { id: 'f1-miami', nom: 'Miami Grand Prix (Hard Rock Stadium)', pays: 'États-Unis', flag: '🇺🇸', longueurKm: 5.41, tours: 20, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Spectacle américain autour du Hard Rock Stadium.' },
    { id: 'f1-imola', nom: 'Emilia-Romagna Grand Prix (Imola)', pays: 'Italie', flag: '🇮🇹', longueurKm: 4.90, tours: 21, difficulteTechnique: 9, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 30, description: 'Histoire et passion au cœur de l\'Émilie-Romagne.' },
    { id: 'f1-monaco', nom: 'Circuit de Monaco', pays: 'Monaco', flag: '🇲🇨', longueurKm: 3.33, tours: 24, difficulteTechnique: 10, opportunitesDepassement: 2, usurePneusHaute: false, probabilitePluie: 25, description: 'Le joyau de la F1. Zéro tolérance à l\'erreur dans les rails monégasques.' },
    { id: 'f1-montreal', nom: 'Canadian Grand Prix (Montréal)', pays: 'Canada', flag: '🇨🇦', longueurKm: 4.36, tours: 22, difficulteTechnique: 8, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 40, description: 'Gros freinages et le célèbre Mur des Champions.' },
    { id: 'f1-barcelona', nom: 'Spanish Grand Prix (Barcelona)', pays: 'Espagne', flag: '🇪🇸', longueurKm: 4.67, tours: 21, difficulteTechnique: 8, opportunitesDepassement: 7, usurePneusHaute: true, probabilitePluie: 15, description: 'Test complet pour la performance globale des monoplaces.' },
    { id: 'f1-spielberg', nom: 'Austrian Grand Prix (Red Bull Ring)', pays: 'Autriche', flag: '🇦🇹', longueurKm: 4.31, tours: 23, difficulteTechnique: 6, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 30, description: 'Temps au tour ultra-court et luttes en paquet.' },
    { id: 'f1-silverstone', nom: 'Silverstone Grand Prix', pays: 'Royaume-Uni', flag: '🇬🇧', longueurKm: 5.89, tours: 20, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 45, description: 'Maggotts, Becketts, Chapel : la référence absolue des G latéraux.' },
    { id: 'f1-hungaroring', nom: 'Hungarian Grand Prix (Budapest)', pays: 'Hongrie', flag: '🇭🇺', longueurKm: 4.38, tours: 21, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 20, description: 'Chaleur estivale et tracé très physique.' },
    { id: 'f1-spa', nom: 'Belgian Grand Prix (Spa-Francorchamps)', pays: 'Belgique', flag: '🇧🇪', longueurKm: 7.00, tours: 18, difficulteTechnique: 10, opportunitesDepassement: 9, usurePneusHaute: true, probabilitePluie: 55, description: 'Eau Rouge, Pouhon et météo légendaire des Ardennes.' },
    { id: 'f1-zandvoort', nom: 'Dutch Grand Prix (Zandvoort)', pays: 'Pays-Bas', flag: '🇳🇱', longueurKm: 4.25, tours: 22, difficulteTechnique: 9, opportunitesDepassement: 5, usurePneusHaute: true, probabilitePluie: 35, description: 'Marée orange et virages relevés en bord de mer.' },
    { id: 'f1-monza', nom: 'Italian Grand Prix (Monza)', pays: 'Italie', flag: '🇮🇹', longueurKm: 5.79, tours: 20, difficulteTechnique: 5, opportunitesDepassement: 10, usurePneusHaute: false, probabilitePluie: 20, description: 'Le temple de la vitesse et la ferveur des Tifosi.' },
    { id: 'f1-baku', nom: 'Azerbaijan Grand Prix (Baku)', pays: 'Azerbaïdjan', flag: '🇦🇿', longueurKm: 6.00, tours: 19, difficulteTechnique: 9, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 10, description: 'Ligne droite de 2,2 km et chausse-trappes urbaines.' },
    { id: 'f1-singapore', nom: 'Singapore Grand Prix (Marina Bay)', pays: 'Singapour', flag: '🇸🇬', longueurKm: 4.94, tours: 19, difficulteTechnique: 10, opportunitesDepassement: 6, usurePneusHaute: true, probabilitePluie: 30, description: 'La course de nuit la plus exigeante physiquement du calendrier.' },
    { id: 'f1-austin', nom: 'United States Grand Prix (Austin COTA)', pays: 'États-Unis', flag: '🇺🇸', longueurKm: 5.51, tours: 19, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 20, description: 'Montée spectaculaire vers le virage 1 texan.' },
    { id: 'f1-mexico', nom: 'Mexico City Grand Prix (Hermanos Rodríguez)', pays: 'Mexique', flag: '🇲🇽', longueurKm: 4.30, tours: 22, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 25, description: 'Ambiance survoltée dans le stadium du Foro Sol.' },
    { id: 'f1-interlagos', nom: 'Autódromo José Carlos Pace (Interlagos)', pays: 'Brésil', flag: '🇧🇷', longueurKm: 4.31, tours: 22, difficulteTechnique: 8, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 60, description: 'Ambiance volcanique et météo dantesque garantie en fin de saison.' },
    { id: 'f1-lasvegas', nom: 'Las Vegas Grand Prix (Strip)', pays: 'États-Unis', flag: '🇺🇸', longueurKm: 6.20, tours: 18, difficulteTechnique: 7, opportunitesDepassement: 9, usurePneusHaute: false, probabilitePluie: 10, description: 'Vitesse folle au cœur du Las Vegas Strip éclairé.' },
    { id: 'f1-losail', nom: 'Qatar Grand Prix (Lusail)', pays: 'Qatar', flag: '🇶🇦', longueurKm: 5.42, tours: 20, difficulteTechnique: 8, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'Fortes contraintes latérales sur les pneumatiques.' },
    { id: 'f1-abu-dhabi', nom: 'Abu Dhabi Grand Prix (Yas Marina)', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 5.28, tours: 20, difficulteTechnique: 7, opportunitesDepassement: 8, usurePneusHaute: false, probabilitePluie: 5, description: 'Crépuscule sur la marina d\'Abu Dhabi.' },
    { id: 'f1-world-finale', nom: 'Grand Prix Finale de Saison World Championship', pays: 'Émirats Arabes Unis', flag: '🇦🇪', longueurKm: 5.28, tours: 22, difficulteTechnique: 9, opportunitesDepassement: 8, usurePneusHaute: true, probabilitePluie: 5, description: 'L\'ultime combat pour le Titre Suprême de Champion du Monde de F1.' }
  ]
};

// Équipes par défaut par catégorie (10 écuries par catégorie pour une grille complète de 20 pilotes)
export const DEFAULT_TEAMS_BY_CATEGORY: Record<Categorie, Team[]> = {
  Karting: [
    { id: 'kart-team-1', nom: 'Apex Karting Junior', prestige: 35, coutSaison: 8000, niveauMateriel: 42, objectifSaison: 'Entrer régulièrement dans le Top 15', couleurHex: '#3b82f6', moteur: 'IAME X30', pays: 'France' },
    { id: 'kart-team-2', nom: 'Kart Republic Junior', prestige: 45, coutSaison: 12000, niveauMateriel: 52, objectifSaison: 'Entrer dans les points régulièrement', couleurHex: '#6366f1', moteur: 'IAME X30', pays: 'Royaume-Uni' },
    { id: 'kart-team-3', nom: 'Praga Karting', prestige: 52, coutSaison: 16000, niveauMateriel: 60, objectifSaison: 'Se qualifier en finale Top 10', couleurHex: '#06b6d4', moteur: 'TM Racing', pays: 'Tchéquie' },
    { id: 'kart-team-4', nom: 'Energy Corse', prestige: 58, coutSaison: 20000, niveauMateriel: 65, objectifSaison: 'Viser le Top 8', couleurHex: '#eab308', moteur: 'TM Racing', pays: 'Italie' },
    { id: 'kart-team-5', nom: 'Parolin Motorsport', prestige: 65, coutSaison: 26000, niveauMateriel: 70, objectifSaison: 'Viser les premières lignes et Top 5', couleurHex: '#3b82f6', moteur: 'TM Racing', pays: 'Italie' },
    { id: 'kart-team-6', nom: 'Kosmic Kart Racing', prestige: 70, coutSaison: 32000, niveauMateriel: 74, objectifSaison: 'Accéder aux podiums', couleurHex: '#8b5cf6', moteur: 'Vortex OK', pays: 'Italie' },
    { id: 'kart-team-7', nom: 'Sodi Racing Performance', prestige: 75, coutSaison: 38000, niveauMateriel: 78, objectifSaison: 'Décrocher des podiums réguliers', couleurHex: '#ef4444', moteur: 'Rotax Max', pays: 'France' },
    { id: 'kart-team-8', nom: 'Birel ART Racing', prestige: 82, coutSaison: 45000, niveauMateriel: 84, objectifSaison: 'Se battre pour des victoires', couleurHex: '#dc2626', moteur: 'TM Racing', pays: 'Suisse' },
    { id: 'kart-team-9', nom: 'CRG Factory Team', prestige: 88, coutSaison: 52000, niveauMateriel: 88, objectifSaison: 'Lutter pour les victoires et le podium général', couleurHex: '#f97316', moteur: 'TM Racing', pays: 'Italie' },
    { id: 'kart-team-10', nom: 'Tony Kart Factory Squadra', prestige: 95, coutSaison: 65000, niveauMateriel: 92, objectifSaison: 'Lutter pour le Titre de Champion Karting', couleurHex: '#10b981', moteur: 'Vortex OK', pays: 'Italie' }
  ],
  F4: [
    { id: 'f4-team-1', nom: 'G4 Racing Entry', prestige: 38, coutSaison: 65000, niveauMateriel: 50, objectifSaison: 'Marquer des points sur chaque meeting', couleurHex: '#8b5cf6', moteur: 'Abarth 1.4L Turbo', pays: 'Suisse' },
    { id: 'f4-team-2', nom: 'Jenzer Motorsport F4', prestige: 45, coutSaison: 80000, niveauMateriel: 58, objectifSaison: 'Fréquenter le Top 12 régulièrement', couleurHex: '#06b6d4', moteur: 'Abarth 1.4L Turbo', pays: 'Suisse' },
    { id: 'f4-team-3', nom: 'Cram Motorsport F4', prestige: 50, coutSaison: 95000, niveauMateriel: 62, objectifSaison: 'Entrer dans le Top 10', couleurHex: '#ec4899', moteur: 'Abarth 1.4L Turbo', pays: 'Italie' },
    { id: 'f4-team-4', nom: 'BVM Racing F4', prestige: 58, coutSaison: 110000, niveauMateriel: 68, objectifSaison: 'Viser le Top 8', couleurHex: '#10b981', moteur: 'Abarth 1.4L Turbo', pays: 'Italie' },
    { id: 'f4-team-5', nom: 'AKM Motorsport F4', prestige: 62, coutSaison: 125000, niveauMateriel: 72, objectifSaison: 'Accéder aux points réguliers', couleurHex: '#9333ea', moteur: 'Abarth 1.4L Turbo', pays: 'Italie' },
    { id: 'f4-team-6', nom: 'MP Motorsport F4 Academy', prestige: 70, coutSaison: 145000, niveauMateriel: 78, objectifSaison: 'Top 5 au classement général', couleurHex: '#f59e0b', moteur: 'Abarth 1.4L Turbo', pays: 'Pays-Bas' },
    { id: 'f4-team-7', nom: 'Van Amersfoort Racing F4', prestige: 76, coutSaison: 165000, niveauMateriel: 82, objectifSaison: 'Lutter pour les podiums', couleurHex: '#f97316', moteur: 'Abarth 1.4L Turbo', pays: 'Pays-Bas' },
    { id: 'f4-team-8', nom: 'R-ace GP F4', prestige: 82, coutSaison: 185000, niveauMateriel: 85, objectifSaison: 'Victoires de manche et Top 3 général', couleurHex: '#3b82f6', moteur: 'Abarth 1.4L Turbo', pays: 'France' },
    { id: 'f4-team-9', nom: 'US Racing F4', prestige: 88, coutSaison: 210000, niveauMateriel: 88, objectifSaison: 'Challenger pour le titre de champion', couleurHex: '#2563eb', moteur: 'Abarth 1.4L Turbo', pays: 'Allemagne' },
    { id: 'f4-team-10', nom: 'Prema Racing F4 Dominance', prestige: 96, coutSaison: 240000, niveauMateriel: 94, objectifSaison: 'Décrocher le titre de champion F4', couleurHex: '#dc2626', moteur: 'Abarth 1.4L Turbo', pays: 'Italie' }
  ],
  F3: [
    { id: 'f3-team-1', nom: 'Jenzer Motorsport F3', prestige: 48, coutSaison: 350000, niveauMateriel: 58, objectifSaison: 'Viser des arrivées dans le Top 12', couleurHex: '#06b6d4', moteur: 'Mecachrome 3.4L V6', pays: 'Suisse' },
    { id: 'f3-team-2', nom: 'AIX Racing F3', prestige: 52, coutSaison: 400000, niveauMateriel: 62, objectifSaison: 'Accéder régulièrement aux points', couleurHex: '#34d399', moteur: 'Mecachrome 3.4L V6', pays: 'Allemagne' },
    { id: 'f3-team-3', nom: 'Rodin Carlin F3', prestige: 58, coutSaison: 480000, niveauMateriel: 68, objectifSaison: 'Viser le Top 8', couleurHex: '#1d4ed8', moteur: 'Mecachrome 3.4L V6', pays: 'Royaume-Uni' },
    { id: 'f3-team-4', nom: 'Van Amersfoort Racing F3', prestige: 64, coutSaison: 550000, niveauMateriel: 72, objectifSaison: 'Entrer régulièrement dans le Top 6', couleurHex: '#f97316', moteur: 'Mecachrome 3.4L V6', pays: 'Pays-Bas' },
    { id: 'f3-team-5', nom: 'MP Motorsport F3', prestige: 70, coutSaison: 620000, niveauMateriel: 76, objectifSaison: 'Disputer des podiums', couleurHex: '#06b6d4', moteur: 'Mecachrome 3.4L V6', pays: 'Pays-Bas' },
    { id: 'f3-team-6', nom: 'Campos Racing F3', prestige: 75, coutSaison: 700000, niveauMateriel: 80, objectifSaison: 'Gagner des courses et viser le Top 5', couleurHex: '#f59e0b', moteur: 'Mecachrome 3.4L V6', pays: 'Espagne' },
    { id: 'f3-team-7', nom: 'Hitech Grand Prix F3', prestige: 80, coutSaison: 780000, niveauMateriel: 82, objectifSaison: 'Lutter pour les victoires', couleurHex: '#8b5cf6', moteur: 'Mecachrome 3.4L V6', pays: 'Royaume-Uni' },
    { id: 'f3-team-8', nom: 'ART Grand Prix F3', prestige: 85, coutSaison: 850000, niveauMateriel: 85, objectifSaison: 'Lutter pour des victoires de manche', couleurHex: '#ffffff', moteur: 'Mecachrome 3.4L V6', pays: 'France' },
    { id: 'f3-team-9', nom: 'Prema Racing F3', prestige: 92, coutSaison: 950000, niveauMateriel: 92, objectifSaison: 'Viser le titre de Champion F3', couleurHex: '#dc2626', moteur: 'Mecachrome 3.4L V6', pays: 'Italie' },
    { id: 'f3-team-10', nom: 'Trident Racing F3', prestige: 95, coutSaison: 1050000, niveauMateriel: 94, objectifSaison: 'Remporter le Championnat F3', couleurHex: '#1e40af', moteur: 'Mecachrome 3.4L V6', pays: 'Italie' }
  ],
  F2: [
    { id: 'f2-team-1', nom: 'Trident F2 Squad', prestige: 55, coutSaison: 950000, niveauMateriel: 65, objectifSaison: 'Entrer occasionnellement dans les points', couleurHex: '#3b82f6', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Italie' },
    { id: 'f2-team-2', nom: 'Van Amersfoort Racing F2', prestige: 60, coutSaison: 1100000, niveauMateriel: 70, objectifSaison: 'Marquer des points réguliers', couleurHex: '#f97316', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Pays-Bas' },
    { id: 'f2-team-3', nom: 'Hitech Pulse-Eight F2', prestige: 68, coutSaison: 1300000, niveauMateriel: 75, objectifSaison: 'Viser le Top 8', couleurHex: '#8b5cf6', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Royaume-Uni' },
    { id: 'f2-team-4', nom: 'Rodin Motorsport F2', prestige: 72, coutSaison: 1450000, niveauMateriel: 78, objectifSaison: 'Viser des podiums de sprint/course principale', couleurHex: '#1d4ed8', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Royaume-Uni' },
    { id: 'f2-team-5', nom: 'Campos Racing F2', prestige: 78, coutSaison: 1600000, niveauMateriel: 80, objectifSaison: 'Chasser les victoires de course', couleurHex: '#f59e0b', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Espagne' },
    { id: 'f2-team-6', nom: 'Invicta Racing F2', prestige: 82, coutSaison: 1750000, niveauMateriel: 82, objectifSaison: 'Top 5 constructeur et podiums réguliers', couleurHex: '#e11d48', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Royaume-Uni' },
    { id: 'f2-team-7', nom: 'DAMS Lucas Oil F2', prestige: 85, coutSaison: 1900000, niveauMateriel: 84, objectifSaison: 'Viser le Top 3 Équipes', couleurHex: '#6366f1', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'France' },
    { id: 'f2-team-8', nom: 'MP Motorsport F2', prestige: 88, coutSaison: 2100000, niveauMateriel: 86, objectifSaison: 'Se battre pour le titre pilotes', couleurHex: '#f59e0b', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Pays-Bas' },
    { id: 'f2-team-9', nom: 'ART Grand Prix F2', prestige: 92, coutSaison: 2300000, niveauMateriel: 90, objectifSaison: 'Viser le titre F2 et promotion F1', couleurHex: '#ffffff', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'France' },
    { id: 'f2-team-10', nom: 'Prema Racing F2 Elite', prestige: 97, coutSaison: 2500000, niveauMateriel: 95, objectifSaison: 'S\'emparer du Titre F2 & Ticket F1', couleurHex: '#b91c1c', moteur: 'Mecachrome 3.4L V6 Turbo', pays: 'Italie' }
  ],
  F1: [
    { id: 'f1-team-1', nom: 'Stake F1 Team Kick Sauber', prestige: 55, coutSaison: 0, f1Salary: 500000, niveauMateriel: 58, objectifSaison: 'Se battre pour quitter la dernière place', couleurHex: '#10b981', moteur: 'Ferrari V6 Turbo Hybrid', pays: 'Suisse' },
    { id: 'f1-team-2', nom: 'MoneyGram Haas F1', prestige: 60, coutSaison: 0, f1Salary: 750000, niveauMateriel: 64, objectifSaison: 'Marquer des points réguliers en milieu de peloton', couleurHex: '#94a3b8', moteur: 'Ferrari 1.6L V6 Turbo Hybrid', pays: 'États-Unis' },
    { id: 'f1-team-3', nom: 'Visa Cash App RB', prestige: 65, coutSaison: 0, f1Salary: 1000000, niveauMateriel: 70, objectifSaison: 'Viser la 6e place constructeur', couleurHex: '#1d4ed8', moteur: 'Honda Red Bull Powertrains', pays: 'Italie' },
    { id: 'f1-team-4', nom: 'Williams Racing', prestige: 68, coutSaison: 0, f1Salary: 1200000, niveauMateriel: 72, objectifSaison: 'Accéder régulièrement à la Q3 et aux points', couleurHex: '#3b82f6', moteur: 'Mercedes V6 Hybrid', pays: 'Royaume-Uni' },
    { id: 'f1-team-5', nom: 'Alpine F1 Team', prestige: 75, coutSaison: 0, f1Salary: 2500000, niveauMateriel: 76, objectifSaison: 'Se battre pour le Top 5 constructeur', couleurHex: '#2563eb', moteur: 'Renault V6 Hybrid', pays: 'France' },
    { id: 'f1-team-6', nom: 'Aston Martin Aramco', prestige: 82, coutSaison: 0, f1Salary: 4000000, niveauMateriel: 88, objectifSaison: 'Viser les podiums et titiller les tops teams', couleurHex: '#047857', moteur: 'Mercedes V6 Hybrid', pays: 'Royaume-Uni' },
    { id: 'f1-team-7', nom: 'Mercedes AMG F1', prestige: 90, coutSaison: 0, f1Salary: 6000000, niveauMateriel: 92, objectifSaison: 'Gagner des Grands Prix et assurer le Top 3', couleurHex: '#06b6d4', moteur: 'Mercedes V6 Hybrid', pays: 'Allemagne' },
    { id: 'f1-team-8', nom: 'McLaren F1 Team', prestige: 94, coutSaison: 0, f1Salary: 7500000, niveauMateriel: 95, objectifSaison: 'Lutter pour le Championnat Constructeurs', couleurHex: '#f97316', moteur: 'Mercedes V6 Hybrid', pays: 'Royaume-Uni' },
    { id: 'f1-team-9', nom: 'Scuderia Ferrari HP', prestige: 98, coutSaison: 0, f1Salary: 8500000, niveauMateriel: 96, objectifSaison: 'Gagner le Championnat du Monde de Formule 1', couleurHex: '#e11d48', moteur: 'Ferrari V6 Hybrid', pays: 'Italie' },
    { id: 'f1-team-10', nom: 'Red Bull Racing', prestige: 99, coutSaison: 0, f1Salary: 9500000, niveauMateriel: 97, objectifSaison: 'Dominer la F1 et décrocher les titres Pilotes & Constructeurs', couleurHex: '#1e3a8a', moteur: 'Honda Red Bull Powertrains', pays: 'Autriche' }
  ]
};

// Sponsors disponibles
export const SPONSORS_POOL: Sponsor[] = [
  { id: 'sp-1', nom: 'TotalEnergies Local', budgetBase: 2500, primeObjectif: 3000, objectif: 'Arriver dans le Top 8', objectifMaxPosition: 8, logoColor: '#ef4444', contratSaisonsRestantes: 1 },
  { id: 'sp-2', nom: 'Motul Lubricants', budgetBase: 4000, primeObjectif: 5000, objectif: 'Arriver dans le Top 5', objectifMaxPosition: 5, logoColor: '#dc2626', contratSaisonsRestantes: 1 },
  { id: 'sp-3', nom: 'Red Bull Junior Program', budgetBase: 8000, primeObjectif: 12000, objectif: 'Finir sur le Podium (Top 3)', objectifMaxPosition: 3, logoColor: '#1d4ed8', contratSaisonsRestantes: 2 },
  { id: 'sp-4', nom: 'Richard Mille Watches', budgetBase: 15000, primeObjectif: 25000, objectif: 'Remporter la Victoire', objectifMaxPosition: 1, logoColor: '#d97706', contratSaisonsRestantes: 2 }
];

// Concurrents générés par catégorie : 20 pilotes par catégorie répartis équitablement dans 10 écuries (2 pilotes par écurie)
export const GENERATED_COMPETITORS: Record<Categorie, Competitor[]> = {
  Karting: [
    // 1. Tony Kart (92)
    { id: 'k1', nom: 'Matteo Rossi', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Tony Kart Factory Squadra', equipeCouleur: '#10b981', niveauPilote: 88, niveauVoiture: 92, points: 0 },
    { id: 'k2', nom: 'Luigi Cucinotta', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Tony Kart Factory Squadra', equipeCouleur: '#10b981', niveauPilote: 82, niveauVoiture: 92, points: 0 },
    // 2. CRG Factory (88)
    { id: 'k3', nom: 'Lars Van Der Meer', nationalite: 'Pays-Bas', flag: '🇳🇱', equipeNom: 'CRG Factory Team', equipeCouleur: '#f97316', niveauPilote: 86, niveauVoiture: 88, points: 0 },
    { id: 'k4', nom: 'Gabriel Gomez', nationalite: 'Brésil', flag: '🇧🇷', equipeNom: 'CRG Factory Team', equipeCouleur: '#f97316', niveauPilote: 85, niveauVoiture: 88, points: 0 },
    // 3. Birel ART (84)
    { id: 'k5', nom: 'Arthur Leclerc Jr', nationalite: 'Monaco', flag: '🇲🇨', equipeNom: 'Birel ART Racing', equipeCouleur: '#dc2626', niveauPilote: 82, niveauVoiture: 84, points: 0 },
    { id: 'k6', nom: 'Pedro Hiltbrand', nationalite: 'Espagne', flag: '🇪🇸', equipeNom: 'Birel ART Racing', equipeCouleur: '#dc2626', niveauPilote: 81, niveauVoiture: 84, points: 0 },
    // 4. Sodi Racing (78)
    { id: 'k7', nom: 'Lucas Moreau', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Sodi Racing Performance', equipeCouleur: '#ef4444', niveauPilote: 78, niveauVoiture: 78, points: 0 },
    { id: 'k8', nom: 'Jules Caranta', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Sodi Racing Performance', equipeCouleur: '#ef4444', niveauPilote: 76, niveauVoiture: 78, points: 0 },
    // 5. Kosmic Kart (74)
    { id: 'k9', nom: 'Sora Takahashi', nationalite: 'Japon', flag: '🇯🇵', equipeNom: 'Kosmic Kart Racing', equipeCouleur: '#8b5cf6', niveauPilote: 78, niveauVoiture: 74, points: 0 },
    { id: 'k10', nom: 'Kenzo Shirakawa', nationalite: 'Japon', flag: '🇯🇵', equipeNom: 'Kosmic Kart Racing', equipeCouleur: '#8b5cf6', niveauPilote: 74, niveauVoiture: 74, points: 0 },
    // 6. Parolin Motorsport (70)
    { id: 'k11', nom: 'Christian Costoya', nationalite: 'Espagne', flag: '🇪🇸', equipeNom: 'Parolin Motorsport', equipeCouleur: '#3b82f6', niveauPilote: 76, niveauVoiture: 70, points: 0 },
    { id: 'k12', nom: 'Zac Drummond', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Parolin Motorsport', equipeCouleur: '#3b82f6', niveauPilote: 72, niveauVoiture: 70, points: 0 },
    // 7. Energy Corse (65)
    { id: 'k13', nom: 'Alex Powell', nationalite: 'Jamaïque', flag: '🇯🇲', equipeNom: 'Energy Corse', equipeCouleur: '#eab308', niveauPilote: 75, niveauVoiture: 65, points: 0 },
    { id: 'k14', nom: 'Dmitry Matveev', nationalite: 'Suisse', flag: '🇨🇭', equipeNom: 'Energy Corse', equipeCouleur: '#eab308', niveauPilote: 71, niveauVoiture: 65, points: 0 },
    // 8. Praga Karting (60)
    { id: 'k15', nom: 'Tommie van der Struijs', nationalite: 'Pays-Bas', flag: '🇳🇱', equipeNom: 'Praga Karting', equipeCouleur: '#06b6d4', niveauPilote: 70, niveauVoiture: 60, points: 0 },
    { id: 'k16', nom: 'Markas Silkunas', nationalite: 'Lituanie', flag: '🇱🇹', equipeNom: 'Praga Karting', equipeCouleur: '#06b6d4', niveauPilote: 67, niveauVoiture: 60, points: 0 },
    // 9. Kart Republic Junior (52)
    { id: 'k17', nom: 'Oliver Smith', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Kart Republic Junior', equipeCouleur: '#6366f1', niveauPilote: 65, niveauVoiture: 52, points: 0 },
    { id: 'k18', nom: 'Archie Clark', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Kart Republic Junior', equipeCouleur: '#6366f1', niveauPilote: 62, niveauVoiture: 52, points: 0 },
    // 10. Apex Karting Junior (42)
    { id: 'k19', nom: 'Hugo Mercier', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Apex Karting Junior', equipeCouleur: '#3b82f6', niveauPilote: 60, niveauVoiture: 42, points: 0 },
    { id: 'k20', nom: 'Thomas Fabre', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Apex Karting Junior', equipeCouleur: '#3b82f6', niveauPilote: 58, niveauVoiture: 42, points: 0 }
  ],
  F4: [
    // 1. Prema Racing F4 (94)
    { id: 'f4-1', nom: 'Freddie Slater', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Prema Racing F4 Dominance', equipeCouleur: '#dc2626', niveauPilote: 90, niveauVoiture: 94, points: 0 },
    { id: 'f4-2', nom: 'Kean Nakamura-Berta', nationalite: 'Japon', flag: '🇯🇵', equipeNom: 'Prema Racing F4 Dominance', equipeCouleur: '#dc2626', niveauPilote: 86, niveauVoiture: 94, points: 0 },
    // 2. US Racing F4 (88)
    { id: 'f4-3', nom: 'Jack Beeton', nationalite: 'Australie', flag: '🇦🇺', equipeNom: 'US Racing F4', equipeCouleur: '#2563eb', niveauPilote: 85, niveauVoiture: 88, points: 0 },
    { id: 'f4-4', nom: 'Matheus Ferreira', nationalite: 'Brésil', flag: '🇧🇷', equipeNom: 'US Racing F4', equipeCouleur: '#2563eb', niveauPilote: 82, niveauVoiture: 88, points: 0 },
    // 3. R-ace GP F4 (85)
    { id: 'f4-5', nom: 'Tuukka Taponen', nationalite: 'Finlande', flag: '🇫🇮', equipeNom: 'R-ace GP F4', equipeCouleur: '#3b82f6', niveauPilote: 86, niveauVoiture: 85, points: 0 },
    { id: 'f4-6', nom: 'Enzo Deligny', nationalite: 'France', flag: '🇫🇷', equipeNom: 'R-ace GP F4', equipeCouleur: '#3b82f6', niveauPilote: 84, niveauVoiture: 85, points: 0 },
    // 4. Van Amersfoort Racing F4 (82)
    { id: 'f4-7', nom: 'Hiyu Yamakoshi', nationalite: 'Japon', flag: '🇯🇵', equipeNom: 'Van Amersfoort Racing F4', equipeCouleur: '#f97316', niveauPilote: 83, niveauVoiture: 82, points: 0 },
    { id: 'f4-8', nom: 'Gustav Jonsson', nationalite: 'Suède', flag: '🇸🇪', equipeNom: 'Van Amersfoort Racing F4', equipeCouleur: '#f97316', niveauPilote: 80, niveauVoiture: 82, points: 0 },
    // 5. MP Motorsport F4 (78)
    { id: 'f4-9', nom: 'René Lammers', nationalite: 'Pays-Bas', flag: '🇳🇱', equipeNom: 'MP Motorsport F4 Academy', equipeCouleur: '#f59e0b', niveauPilote: 80, niveauVoiture: 78, points: 0 },
    { id: 'f4-10', nom: 'Maciej Gładysz', nationalite: 'Pologne', flag: '🇵🇱', equipeNom: 'MP Motorsport F4 Academy', equipeCouleur: '#f59e0b', niveauPilote: 78, niveauVoiture: 78, points: 0 },
    // 6. AKM Motorsport F4 (72)
    { id: 'f4-11', nom: 'Emanuele Olivieri', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'AKM Motorsport F4', equipeCouleur: '#9333ea', niveauPilote: 76, niveauVoiture: 72, points: 0 },
    { id: 'f4-12', nom: 'Mattia Colnaghi', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'AKM Motorsport F4', equipeCouleur: '#9333ea', niveauPilote: 74, niveauVoiture: 72, points: 0 },
    // 7. BVM Racing F4 (68)
    { id: 'f4-13', nom: 'Jan Przyrowski', nationalite: 'Pologne', flag: '🇵🇱', equipeNom: 'BVM Racing F4', equipeCouleur: '#10b981', niveauPilote: 75, niveauVoiture: 68, points: 0 },
    { id: 'f4-14', nom: 'Davide Larini', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'BVM Racing F4', equipeCouleur: '#10b981', niveauPilote: 72, niveauVoiture: 68, points: 0 },
    // 8. Cram Motorsport F4 (62)
    { id: 'f4-15', nom: 'Kai Diyanov', nationalite: 'Suisse', flag: '🇨🇭', equipeNom: 'Cram Motorsport F4', equipeCouleur: '#ec4899', niveauPilote: 72, niveauVoiture: 62, points: 0 },
    { id: 'f4-16', nom: 'Filippo Fiorentino', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Cram Motorsport F4', equipeCouleur: '#ec4899', niveauPilote: 70, niveauVoiture: 62, points: 0 },
    // 9. Jenzer Motorsport F4 (58)
    { id: 'f4-17', nom: 'Enea Frey', nationalite: 'Suisse', flag: '🇨🇭', equipeNom: 'Jenzer Motorsport F4', equipeCouleur: '#06b6d4', niveauPilote: 71, niveauVoiture: 58, points: 0 },
    { id: 'f4-18', nom: 'Ethan Ischer', nationalite: 'Suisse', flag: '🇨🇭', equipeNom: 'Jenzer Motorsport F4', equipeCouleur: '#06b6d4', niveauPilote: 70, niveauVoiture: 58, points: 0 },
    // 10. G4 Racing Entry (50)
    { id: 'f4-19', nom: 'Lucas Moreau', nationalite: 'France', flag: '🇫🇷', equipeNom: 'G4 Racing Entry', equipeCouleur: '#8b5cf6', niveauPilote: 68, niveauVoiture: 50, points: 0 },
    { id: 'f4-20', nom: 'Romain Bressan', nationalite: 'France', flag: '🇫🇷', equipeNom: 'G4 Racing Entry', equipeCouleur: '#8b5cf6', niveauPilote: 65, niveauVoiture: 50, points: 0 }
  ],
  F3: [
    // 1. Trident Racing F3 (94)
    { id: 'f3-1', nom: 'Leonardo Fornaroli', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Trident Racing F3', equipeCouleur: '#1e40af', niveauPilote: 90, niveauVoiture: 94, points: 0 },
    { id: 'f3-2', nom: 'Sami Meguetounif', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Trident Racing F3', equipeCouleur: '#1e40af', niveauPilote: 86, niveauVoiture: 94, points: 0 },
    // 2. Prema Racing F3 (92)
    { id: 'f3-3', nom: 'Gabriele Minì', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Prema Racing F3', equipeCouleur: '#dc2626', niveauPilote: 89, niveauVoiture: 92, points: 0 },
    { id: 'f3-4', nom: 'Arvid Lindblad', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Prema Racing F3', equipeCouleur: '#dc2626', niveauPilote: 88, niveauVoiture: 92, points: 0 },
    // 3. ART Grand Prix F3 (85)
    { id: 'f3-5', nom: 'Nikola Tsolov', nationalite: 'Bulgarie', flag: '🇧🇬', equipeNom: 'ART Grand Prix F3', equipeCouleur: '#ffffff', niveauPilote: 84, niveauVoiture: 85, points: 0 },
    { id: 'f3-6', nom: 'Christian Mansell', nationalite: 'Australie', flag: '🇦🇺', equipeNom: 'ART Grand Prix F3', equipeCouleur: '#ffffff', niveauPilote: 83, niveauVoiture: 85, points: 0 },
    // 4. Hitech Grand Prix F3 (82)
    { id: 'f3-7', nom: 'Luke Browning', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Hitech Grand Prix F3', equipeCouleur: '#8b5cf6', niveauPilote: 87, niveauVoiture: 82, points: 0 },
    { id: 'f3-8', nom: 'Martinius Stenshorne', nationalite: 'Norvège', flag: '🇳🇴', equipeNom: 'Hitech Grand Prix F3', equipeCouleur: '#8b5cf6', niveauPilote: 82, niveauVoiture: 82, points: 0 },
    // 5. Campos Racing F3 (80)
    { id: 'f3-9', nom: 'Oliver Goethe', nationalite: 'Allemagne', flag: '🇩🇪', equipeNom: 'Campos Racing F3', equipeCouleur: '#f59e0b', niveauPilote: 84, niveauVoiture: 80, points: 0 },
    { id: 'f3-10', nom: 'Mari Boya', nationalite: 'Espagne', flag: '🇪🇸', equipeNom: 'Campos Racing F3', equipeCouleur: '#f59e0b', niveauPilote: 81, niveauVoiture: 80, points: 0 },
    // 6. MP Motorsport F3 (76)
    { id: 'f3-11', nom: 'Tim Tramnitz', nationalite: 'Allemagne', flag: '🇩🇪', equipeNom: 'MP Motorsport F3', equipeCouleur: '#06b6d4', niveauPilote: 83, niveauVoiture: 76, points: 0 },
    { id: 'f3-12', nom: 'Alex Dunne', nationalite: 'Irlande', flag: '🇮🇪', equipeNom: 'MP Motorsport F3', equipeCouleur: '#06b6d4', niveauPilote: 82, niveauVoiture: 76, points: 0 },
    // 7. Van Amersfoort Racing F3 (72)
    { id: 'f3-13', nom: 'Noel León', nationalite: 'Mexique', flag: '🇲🇽', equipeNom: 'Van Amersfoort Racing F3', equipeCouleur: '#f97316', niveauPilote: 80, niveauVoiture: 72, points: 0 },
    { id: 'f3-14', nom: 'Tommy Smith', nationalite: 'Australie', flag: '🇦🇺', equipeNom: 'Van Amersfoort Racing F3', equipeCouleur: '#f97316', niveauPilote: 72, niveauVoiture: 72, points: 0 },
    // 8. Rodin Carlin F3 (68)
    { id: 'f3-15', nom: 'Callum Voisin', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Rodin Carlin F3', equipeCouleur: '#1d4ed8', niveauPilote: 79, niveauVoiture: 68, points: 0 },
    { id: 'f3-16', nom: 'Joseph Loake', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Rodin Carlin F3', equipeCouleur: '#1d4ed8', niveauPilote: 74, niveauVoiture: 68, points: 0 },
    // 9. AIX Racing F3 (62)
    { id: 'f3-17', nom: 'Tasanapol Inthraphuvasak', nationalite: 'Thaïlande', flag: '🇹🇭', equipeNom: 'AIX Racing F3', equipeCouleur: '#34d399', niveauPilote: 75, niveauVoiture: 62, points: 0 },
    { id: 'f3-18', nom: 'Nikita Bedrin', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'AIX Racing F3', equipeCouleur: '#34d399', niveauPilote: 76, niveauVoiture: 62, points: 0 },
    // 10. Jenzer Motorsport F3 (58)
    { id: 'f3-19', nom: 'Matías Zagazeta', nationalite: 'Pérou', flag: '🇵🇪', equipeNom: 'Jenzer Motorsport F3', equipeCouleur: '#06b6d4', niveauPilote: 73, niveauVoiture: 58, points: 0 },
    { id: 'f3-20', nom: 'Max Esterson', nationalite: 'États-Unis', flag: '🇺🇸', equipeNom: 'Jenzer Motorsport F3', equipeCouleur: '#06b6d4', niveauPilote: 72, niveauVoiture: 58, points: 0 }
  ],
  F2: [
    // 1. Prema Racing F2 Elite (95)
    { id: 'f2-1', nom: 'Oliver Bearman', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Prema Racing F2 Elite', equipeCouleur: '#b91c1c', niveauPilote: 92, niveauVoiture: 95, points: 0 },
    { id: 'f2-2', nom: 'Andrea Kimi Antonelli', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Prema Racing F2 Elite', equipeCouleur: '#b91c1c', niveauPilote: 90, niveauVoiture: 95, points: 0 },
    // 2. ART Grand Prix F2 (90)
    { id: 'f2-3', nom: 'Victor Martins', nationalite: 'France', flag: '🇫🇷', equipeNom: 'ART Grand Prix F2', equipeCouleur: '#ffffff', niveauPilote: 89, niveauVoiture: 90, points: 0 },
    { id: 'f2-4', nom: 'Zak O\'Sullivan', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'ART Grand Prix F2', equipeCouleur: '#ffffff', niveauPilote: 85, niveauVoiture: 90, points: 0 },
    // 3. MP Motorsport F2 (86)
    { id: 'f2-5', nom: 'Dennis Hauger', nationalite: 'Norvège', flag: '🇳🇴', equipeNom: 'MP Motorsport F2', equipeCouleur: '#f59e0b', niveauPilote: 86, niveauVoiture: 86, points: 0 },
    { id: 'f2-6', nom: 'Franco Colapinto', nationalite: 'Argentine', flag: '🇦🇷', equipeNom: 'MP Motorsport F2', equipeCouleur: '#f59e0b', niveauPilote: 87, niveauVoiture: 86, points: 0 },
    // 4. DAMS Lucas Oil F2 (84)
    { id: 'f2-7', nom: 'Jak Crawford', nationalite: 'États-Unis', flag: '🇺🇸', equipeNom: 'DAMS Lucas Oil F2', equipeCouleur: '#6366f1', niveauPilote: 84, niveauVoiture: 84, points: 0 },
    { id: 'f2-8', nom: 'Juan Manuel Correa', nationalite: 'États-Unis', flag: '🇺🇸', equipeNom: 'DAMS Lucas Oil F2', equipeCouleur: '#6366f1', niveauPilote: 80, niveauVoiture: 84, points: 0 },
    // 5. Invicta Racing F2 (82)
    { id: 'f2-9', nom: 'Gabriel Bortoleto', nationalite: 'Brésil', flag: '🇧🇷', equipeNom: 'Invicta Racing F2', equipeCouleur: '#e11d48', niveauPilote: 91, niveauVoiture: 82, points: 0 },
    { id: 'f2-10', nom: 'Kush Maini', nationalite: 'Inde', flag: '🇮🇳', equipeNom: 'Invicta Racing F2', equipeCouleur: '#e11d48', niveauPilote: 82, niveauVoiture: 82, points: 0 },
    // 6. Campos Racing F2 (80)
    { id: 'f2-11', nom: 'Isack Hadjar', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Campos Racing F2', equipeCouleur: '#f59e0b', niveauPilote: 90, niveauVoiture: 80, points: 0 },
    { id: 'f2-12', nom: 'Pepe Martí', nationalite: 'Espagne', flag: '🇪🇸', equipeNom: 'Campos Racing F2', equipeCouleur: '#f59e0b', niveauPilote: 83, niveauVoiture: 80, points: 0 },
    // 7. Rodin Motorsport F2 (78)
    { id: 'f2-13', nom: 'Zane Maloney', nationalite: 'Barbade', flag: '🇧🇧', equipeNom: 'Rodin Motorsport F2', equipeCouleur: '#1d4ed8', niveauPilote: 87, niveauVoiture: 78, points: 0 },
    { id: 'f2-14', nom: 'Ritomo Miyata', nationalite: 'Japon', flag: '🇯🇵', equipeNom: 'Rodin Motorsport F2', equipeCouleur: '#1d4ed8', niveauPilote: 80, niveauVoiture: 78, points: 0 },
    // 8. Hitech Pulse-Eight F2 (75)
    { id: 'f2-15', nom: 'Paul Aron', nationalite: 'Estonie', flag: '🇪🇪', equipeNom: 'Hitech Pulse-Eight F2', equipeCouleur: '#8b5cf6', niveauPilote: 88, niveauVoiture: 75, points: 0 },
    { id: 'f2-16', nom: 'Amaury Cordeel', nationalite: 'Belgique', flag: '🇧🇪', equipeNom: 'Hitech Pulse-Eight F2', equipeCouleur: '#8b5cf6', niveauPilote: 76, niveauVoiture: 75, points: 0 },
    // 9. Van Amersfoort Racing F2 (70)
    { id: 'f2-17', nom: 'Enzo Fittipaldi', nationalite: 'Brésil', flag: '🇧🇷', equipeNom: 'Van Amersfoort Racing F2', equipeCouleur: '#f97316', niveauPilote: 83, niveauVoiture: 70, points: 0 },
    { id: 'f2-18', nom: 'Rafael Villagómez', nationalite: 'Mexique', flag: '🇲🇽', equipeNom: 'Van Amersfoort Racing F2', equipeCouleur: '#f97316', niveauPilote: 75, niveauVoiture: 70, points: 0 },
    // 10. Trident F2 Squad (65)
    { id: 'f2-19', nom: 'Richard Verschoor', nationalite: 'Pays-Bas', flag: '🇳🇱', equipeNom: 'Trident F2 Squad', equipeCouleur: '#3b82f6', niveauPilote: 84, niveauVoiture: 65, points: 0 },
    { id: 'f2-20', nom: 'Roman Staněk', nationalite: 'Tchéquie', flag: '🇨🇿', equipeNom: 'Trident F2 Squad', equipeCouleur: '#3b82f6', niveauPilote: 78, niveauVoiture: 65, points: 0 }
  ],
  F1: [
    // 1. Red Bull Racing (97)
    { id: 'f1-1', nom: 'Max Verstappen', nationalite: 'Pays-Bas', flag: '🇳🇱', equipeNom: 'Red Bull Racing', equipeCouleur: '#1e3a8a', niveauPilote: 99, niveauVoiture: 97, points: 0 },
    { id: 'f1-2', nom: 'Sergio Pérez', nationalite: 'Mexique', flag: '🇲🇽', equipeNom: 'Red Bull Racing', equipeCouleur: '#1e3a8a', niveauPilote: 86, niveauVoiture: 97, points: 0 },
    // 2. Scuderia Ferrari HP (96)
    { id: 'f1-3', nom: 'Charles Leclerc', nationalite: 'Monaco', flag: '🇲🇨', equipeNom: 'Scuderia Ferrari HP', equipeCouleur: '#e11d48', niveauPilote: 96, niveauVoiture: 96, points: 0 },
    { id: 'f1-4', nom: 'Lewis Hamilton', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Scuderia Ferrari HP', equipeCouleur: '#e11d48', niveauPilote: 97, niveauVoiture: 96, points: 0 },
    // 3. McLaren F1 Team (95)
    { id: 'f1-5', nom: 'Lando Norris', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'McLaren F1 Team', equipeCouleur: '#f97316', niveauPilote: 95, niveauVoiture: 95, points: 0 },
    { id: 'f1-6', nom: 'Oscar Piastri', nationalite: 'Australie', flag: '🇦🇺', equipeNom: 'McLaren F1 Team', equipeCouleur: '#f97316', niveauPilote: 94, niveauVoiture: 95, points: 0 },
    // 4. Mercedes AMG F1 (92)
    { id: 'f1-7', nom: 'George Russell', nationalite: 'Royaume-Uni', flag: '🇬🇧', equipeNom: 'Mercedes AMG F1', equipeCouleur: '#06b6d4', niveauPilote: 93, niveauVoiture: 92, points: 0 },
    { id: 'f1-8', nom: 'Kimi Antonelli', nationalite: 'Italie', flag: '🇮🇹', equipeNom: 'Mercedes AMG F1', equipeCouleur: '#06b6d4', niveauPilote: 88, niveauVoiture: 92, points: 0 },
    // 5. Aston Martin Aramco (88)
    { id: 'f1-9', nom: 'Fernando Alonso', nationalite: 'Espagne', flag: '🇪🇸', equipeNom: 'Aston Martin Aramco', equipeCouleur: '#047857', niveauPilote: 95, niveauVoiture: 88, points: 0 },
    { id: 'f1-10', nom: 'Lance Stroll', nationalite: 'Canada', flag: '🇨🇦', equipeNom: 'Aston Martin Aramco', equipeCouleur: '#047857', niveauPilote: 80, niveauVoiture: 88, points: 0 },
    // 6. Alpine F1 Team (76)
    { id: 'f1-11', nom: 'Pierre Gasly', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Alpine F1 Team', equipeCouleur: '#2563eb', niveauPilote: 88, niveauVoiture: 76, points: 0 },
    { id: 'f1-12', nom: 'Esteban Ocon', nationalite: 'France', flag: '🇫🇷', equipeNom: 'Alpine F1 Team', equipeCouleur: '#2563eb', niveauPilote: 87, niveauVoiture: 76, points: 0 },
    // 7. Williams Racing (72)
    { id: 'f1-13', nom: 'Carlos Sainz', nationalite: 'Espagne', flag: '🇪🇸', equipeNom: 'Williams Racing', equipeCouleur: '#3b82f6', niveauPilote: 92, niveauVoiture: 72, points: 0 },
    { id: 'f1-14', nom: 'Alexander Albon', nationalite: 'Thaïlande', flag: '🇹🇭', equipeNom: 'Williams Racing', equipeCouleur: '#3b82f6', niveauPilote: 87, niveauVoiture: 72, points: 0 },
    // 8. Visa Cash App RB (70)
    { id: 'f1-15', nom: 'Yuki Tsunoda', nationalite: 'Japon', flag: '🇯🇵', equipeNom: 'Visa Cash App RB', equipeCouleur: '#1d4ed8', niveauPilote: 85, niveauVoiture: 70, points: 0 },
    { id: 'f1-16', nom: 'Liam Lawson', nationalite: 'Nouvelle-Zélande', flag: '🇳🇿', equipeNom: 'Visa Cash App RB', equipeCouleur: '#1d4ed8', niveauPilote: 83, niveauVoiture: 70, points: 0 },
    // 9. MoneyGram Haas F1 (64)
    { id: 'f1-17', nom: 'Nico Hülkenberg', nationalite: 'Allemagne', flag: '🇩🇪', equipeNom: 'MoneyGram Haas F1', equipeCouleur: '#94a3b8', niveauPilote: 86, niveauVoiture: 64, points: 0 },
    { id: 'f1-18', nom: 'Kevin Magnussen', nationalite: 'Danemark', flag: '🇩🇰', equipeNom: 'MoneyGram Haas F1', equipeCouleur: '#94a3b8', niveauPilote: 82, niveauVoiture: 64, points: 0 },
    // 10. Stake F1 Team Kick Sauber (58)
    { id: 'f1-19', nom: 'Valtteri Bottas', nationalite: 'Finlande', flag: '🇫🇮', equipeNom: 'Stake F1 Team Kick Sauber', equipeCouleur: '#10b981', niveauPilote: 85, niveauVoiture: 58, points: 0 },
    { id: 'f1-20', nom: 'Guanyu Zhou', nationalite: 'Chine', flag: '🇨🇳', equipeNom: 'Stake F1 Team Kick Sauber', equipeCouleur: '#10b981', niveauPilote: 78, niveauVoiture: 58, points: 0 }
  ]
};

