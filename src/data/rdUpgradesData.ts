import { RdUpgradeOption } from '../types';

export const PROPOSED_RD_UPGRADES: RdUpgradeOption[] = [
  {
    id: 'rd-aero-minor',
    nom: "Équilibrage Aileron Avant & Défléchisseurs",
    categorie: 'Aérodynamique',
    taille: 'Mineure',
    delaiCourses: 1,
    cout: 3500,
    gainNiveauMateriel: 2,
    statBoost: { vitesse: 0.3 },
    description: "Ajustement fin du flux d'air sous le nez de la voiture. Développement rapide sur 1 course pour optimiser l'appui en virage moyen."
  },
  {
    id: 'rd-engine-minor',
    nom: "Cartographie d'Allumage & Bougies Compétition",
    categorie: 'Moteur',
    taille: 'Mineure',
    delaiCourses: 1,
    cout: 4500,
    gainNiveauMateriel: 2,
    statBoost: { vitesse: 0.4 },
    description: "Mise à jour du calculateur moteur pour libérer quelques chevaux supplémentaires en ligne droite. Disponible au prochain Grand Prix."
  },
  {
    id: 'rd-chassis-medium',
    nom: "Triangles de Suspension Allégés & Géométrie A",
    categorie: 'Châssis',
    taille: 'Moyenne',
    delaiCourses: 2,
    cout: 12000,
    gainNiveauMateriel: 5,
    statBoost: { gestionPneus: 0.5, vitesse: 0.2 },
    description: "Nouveaux éléments de suspension en fibre de carbone ultra-rigide. Améliore la stabilité au freinage et réduit l'usure des pneumatiques. Nécessite 2 courses d'usinage."
  },
  {
    id: 'rd-aero-medium',
    nom: "Dériveurs de Pontons & Fond Plat Révisé",
    categorie: 'Aérodynamique',
    taille: 'Moyenne',
    delaiCourses: 2,
    cout: 16000,
    gainNiveauMateriel: 6,
    statBoost: { vitesse: 0.5, adaptabilite: 0.3 },
    description: "Plaque de fond plat redessinée en soufflerie pour générer plus d'effet de sol. Testé et fabriqué en 2 courses."
  },
  {
    id: 'rd-reliability-medium',
    nom: "Radiateurs Élargis & Refroidissement Moteur",
    categorie: 'Fiabilité',
    taille: 'Moyenne',
    delaiCourses: 2,
    cout: 9500,
    gainNiveauMateriel: 4,
    statBoost: { regularite: 0.5, gestionPneus: 0.3 },
    description: "Système de refroidissement optimisé pour éviter les surchauffes moteur en peloton compact. Fabrication en 2 courses."
  },
  {
    id: 'rd-aero-major',
    nom: "Package Aérodynamique Majeur 'Spécification B'",
    categorie: 'Aérodynamique',
    taille: 'Majeure',
    delaiCourses: 3,
    cout: 32000,
    gainNiveauMateriel: 10,
    statBoost: { vitesse: 0.8, adaptabilite: 0.5 },
    description: "Refonte globale de l'aileron arrière, des pontons et du diffuseur. Gain de performance massif mais nécessite 3 courses de production en usine."
  },
  {
    id: 'rd-engine-major',
    nom: "Bloc Moteur Usine & Turbo Évolution III",
    categorie: 'Moteur',
    taille: 'Majeure',
    delaiCourses: 3,
    cout: 40000,
    gainNiveauMateriel: 12,
    statBoost: { vitesse: 1.0, talent: 0.4 },
    description: "Nouveau moteur directement fourni par le constructeur usine. Vitesse de pointe décuplée. Temps de fabrication et d'assemblage : 3 courses."
  }
];
