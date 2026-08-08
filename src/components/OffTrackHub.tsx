import React, { useState, useEffect } from 'react';
import { Driver, Team, Categorie, Circuit, OffTrackDilemma, ChoiceImpactFeedback, RaceResult, Competitor } from '../types';
import { 
  Newspaper, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Building2,
  DollarSign,
  Award,
  Flame,
  Sparkles,
  RefreshCw,
  Radio
} from 'lucide-react';
import { SPECIALITES_PRESETS } from '../utils/simulationEngine';

interface OffTrackHubProps {
  driver: Driver;
  team: Team;
  currentRaceIndex: number;
  categorie: Categorie;
  nextCircuit: Circuit;
  lastRaceResult?: RaceResult | null;
  standings?: Competitor[];
  onApplyOffTrackChoice: (impact: ChoiceImpactFeedback) => void;
  onCompleteAllOffTrack?: () => void;
}

export const OffTrackHub: React.FC<OffTrackHubProps> = ({
  driver,
  team,
  currentRaceIndex,
  categorie,
  nextCircuit,
  lastRaceResult,
  standings,
  onApplyOffTrackChoice,
  onCompleteAllOffTrack
}) => {
  const [selectedDilemmaId, setSelectedDilemmaId] = useState<string>('media-1');
  const [answeredMap, setAnsweredMap] = useState<Record<string, ChoiceImpactFeedback>>({});
  const [aiDilemmas, setAiDilemmas] = useState<OffTrackDilemma[]>([]);
  const [isGeneratingAiEvent, setIsGeneratingAiEvent] = useState<boolean>(false);

  const rivalName = driver.relations?.nomRival || 'Matteo Rossi';
  const teammateName = driver.relations?.nomCoequipier || 'Lucas Moreau';
  const isFirstRace = currentRaceIndex === 1;
  const lastPos = lastRaceResult?.positionFinale || null;

  // Récupérer le classement actuel dans le championnat
  let rank = 1;
  if (standings && standings.length > 0) {
    const sorted = [...standings].sort((a, b) => b.points - a.points);
    const userIndex = sorted.findIndex(c => c.id === 'user' || c.nom.toLowerCase().includes(driver.nom.toLowerCase()));
    if (userIndex >= 0) rank = userIndex + 1;
  }

  // Fonction de chargement dynamique IA des questions médias, paddock & sponsors
  const fetchAiOffTrackDilemmas = async () => {
    setIsGeneratingAiEvent(true);
    try {
      const res = await fetch('/api/ai/generate-offtrack-dilemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: driver.nom,
          driverAge: driver.age,
          category: categorie,
          teamName: team.nom,
          currentRaceIndex,
          totalRaces: 8,
          nextCircuitName: nextCircuit.nom,
          lastRacePosition: lastPos,
          championshipRank: rank,
          championshipPoints: driver.pointsChampionnat,
          budget: driver.budget,
          reputation: driver.reputation,
          rivalName,
          teammateName
        })
      });

      const data = await res.json();
      if (data.success && data.dilemmas && data.dilemmas.length > 0) {
        setAiDilemmas(data.dilemmas);
        setSelectedDilemmaId(data.dilemmas[0].id);
      }
    } catch (e) {
      console.warn("Erreur chargement IA Offtrack:", e);
    } finally {
      setIsGeneratingAiEvent(false);
    }
  };

  // Lancer la génération IA dès le montage du composant
  useEffect(() => {
    fetchAiOffTrackDilemmas();
  }, [currentRaceIndex, lastPos]);

  // 1 Média + 1 Paddock + 1 Sponsor = Strictement 3 Dilemmes par week-end de course
  const baseDilemmas: OffTrackDilemma[] = isFirstRace ? [
    // --- COURSE 1 : PREMIER GRAND PRIX EN CARRIÈRE ---
    {
      id: 'media-1',
      titre: `Presse : Premier Grand Prix en carrière dans ${categorie}`,
      categorie: 'Media',
      interlocuteur: `Canal+ & Eurosport`,
      description: `Journaliste : "C'est votre toute première course dans le championnat ${categorie} avec l'écurie ${team.nom} ! Comment gérez-vous la pression et l'émotion de ce premier départ ?"`,
      options: [
        {
          id: 'm1-o1',
          texte: `Humble et appliqué : "Je viens pour apprendre, rassurer l'écurie et emmener la voiture au bout."`,
          description: `Adopter un discours mesuré axé sur l'apprentissage et la régularité.`,
          impacts: {
            confianceDirecteurDelta: 12,
            statsBoost: { regularite: 0.3 },
            moneyChange: 3000
          }
        },
        {
          id: 'm1-o2',
          texte: `Affamé et combatif : "L'équipe a fait un travail fantastique, je suis là pour attaquer et marquer des points !"`,
          description: `Exprimer l'enthousiasme de la jeunesse et afficher une faim de victoires.`,
          impacts: {
            motivationChange: 0.5,
            reputationChange: 8,
            confianceDirecteurDelta: 5
          }
        },
        {
          id: 'm1-o3',
          texte: `Arrogance médiatique : "Je vais ridiculiser la concurrence dès le premier freinage !"`,
          description: `Assumer un style provocateur et marquer les esprits auprès des médias.`,
          impacts: {
            reputationChange: 15,
            confianceDirecteurDelta: -20,
            tensionRivalDelta: 25,
            motivationChange: -0.5
          }
        },
        {
          id: 'm1-o4',
          texte: `Critique publique du moteur : "Honnêtement, notre voiture manque cruellement de vitesse en ligne droite..."`,
          description: `Pointer publiquement les faiblesses du bloc moteur pour pousser au développement.`,
          impacts: {
            statsBoost: { vitesse: 0.3 },
            confianceDirecteurDelta: -25,
            relationCoequipierDelta: -15,
            moneyChange: -5000
          }
        },
        {
          id: 'm1-o5',
          texte: `Promesse de podium intenable : "Je vous promets un podium ce week-end devant nos sponsors !"`,
          description: `Faire une promesse audacieuse pour enthousiasmer les investisseurs.`,
          impacts: {
            moneyChange: 12000,
            motivationChange: -1.0,
            reputationChange: -8,
            confianceDirecteurDelta: -10
          }
        }
      ]
    },
    {
      id: 'paddock-1',
      titre: `Paddock : Réglages du Volant & Télémétrie de Débutant`,
      categorie: 'Paddock',
      interlocuteur: `Ingénieur en Chef & ${teammateName}`,
      description: `Pour cette course à ${nextCircuit.nom}, l'ingénieur vous propose de configurer la monoplace. Quelle est votre décision ?`,
      options: [
        {
          id: 'p1-o1',
          texte: `Développer vos propres réglages sur mesure avec les mécaniciens`,
          description: `Travailler directement avec votre ingénieur pour adapter le train roulant à votre pilotage.`,
          impacts: {
            statsBoost: { vitesse: 0.4, talent: 0.3 },
            confianceDirecteurDelta: 8
          }
        },
        {
          id: 'p1-o2',
          texte: `Adopter la télémétrie de référence éprouvée de ${teammateName}`,
          description: `Reprendre la configuration validée par l'autre côté du garage.`,
          impacts: {
            relationCoequipierDelta: 15,
            statsBoost: { regularite: 0.5 }
          }
        },
        {
          id: 'p1-o3',
          texte: `Supprimer tout l'aileron arrière pour braquer en vitesse de pointe extrême`,
          description: `Réduire au minimum l'appui aérodynamique pour viser la vitesse maximale en ligne droite.`,
          impacts: {
            statsBoost: { vitesse: 0.8, regularite: -1.5 },
            motivationChange: 0.3
          }
        },
        {
          id: 'p1-o4',
          texte: `Modifier en secret la pression des pneus sur la grille sans avertir l'ingénieur`,
          description: `Ajuster vous-même la pression des pneumatiques au tout dernier moment.`,
          impacts: {
            confianceDirecteurDelta: -25,
            statsBoost: { gestionPneus: -1.2 },
            moneyChange: -5000
          }
        },
        {
          id: 'p1-o5',
          texte: `Conserver un composant moteur usé pour économiser de l'argent`,
          description: `Pousser un bloc moteur usagé sur un week-end supplémentaire pour épargner le budget.`,
          impacts: {
            moneyChange: 8000,
            statsBoost: { vitesse: -0.6 },
            confianceDirecteurDelta: -10
          }
        }
      ]
    },
    {
      id: 'sponsor-1',
      titre: `Sponsor : Présentation Officielle des Partenaires`,
      categorie: 'Sponsor',
      interlocuteur: `Partenaires VIP de ${team.nom}`,
      description: `Les sponsors majeurs organisent un événement de lancement la veille de la course. Quelle est votre attitude ?`,
      options: [
        {
          id: 's1-o1',
          texte: `Participer au cocktail VIP et séduire les investisseurs avec élégance`,
          description: `Représenter l'écurie auprès des décideurs et partenaires financiers.`,
          impacts: {
            moneyChange: 15000,
            reputationChange: 10
          }
        },
        {
          id: 's1-o2',
          texte: `Décliner poliment pour enchaîner 4 heures de simulateur nocturne`,
          description: `Accorder une priorité absolue au travail de pilotage et aux trajectoires.`,
          impacts: {
            statsBoost: { vitesse: 0.4, gestionPneus: 0.3 },
            confianceDirecteurDelta: 10
          }
        },
        {
          id: 's1-o3',
          texte: `Faire la fête sans limite au cocktail jusqu'à 4 heures du matin`,
          description: `Profiter de la soirée VIP pour nouer de riches contacts informels.`,
          impacts: {
            moneyChange: 25000,
            statsBoost: { regularite: -1.2 },
            confianceDirecteurDelta: -15
          }
        },
        {
          id: 's1-o4',
          texte: `Exiger agressivement un doublement des primes au micro devant les invités`,
          description: `Profiter de la tribune pour négocier publiquement la valeur de vos prestations.`,
          impacts: {
            moneyChange: -15000,
            reputationChange: -15,
            confianceDirecteurDelta: -15
          }
        },
        {
          id: 's1-o5',
          texte: `Sécher l'événement sans prévenir pour dormir à l'hôtel`,
          description: `Privilégier votre repos et votre niveau d'énergie pour la séance d'essais.`,
          impacts: {
            moneyChange: -12000,
            reputationChange: -10,
            confianceDirecteurDelta: -12
          }
        }
      ]
    }
  ] : [
    // --- COURSES SUIVANTES (COURSE 2+) ---
    {
      id: 'media-1',
      titre: `Presse : Tension et Bataille en Piste avec ${rivalName}`,
      categorie: 'Media',
      interlocuteur: `L'Équipe & Eurosport`,
      description: `Journaliste : "Les esprits s'échauffent autour de votre rivalité avec ${rivalName}. Pensez-vous qu'il pilote au-delà de la limite ?"`,
      options: [
        {
          id: 'm1-b1',
          texte: `Réponse professionnelle : "Bataille intense mais correcte, nous réglons ça sur la piste."`,
          description: `Conserver une attitude mesurée devant la presse.`,
          impacts: {
            confianceDirecteurDelta: 10,
            statsBoost: { regularite: 0.3 }
          }
        },
        {
          id: 'm1-b2',
          texte: `Éloges calculés : "${rivalName} est un rival formidable qui me force à élever mon niveau."`,
          description: `Saluant la valeur de l'adversaire pour instaurer un respect mutuel.`,
          impacts: {
            motivationChange: 0.6,
            reputationChange: 6,
            tensionRivalDelta: -5
          }
        },
        {
          id: 'm1-b3',
          texte: `Provocation cash : "${rivalName} perd ses moyens dès qu'on lui met la pression !"`,
          description: `Lancer une pique psychologique pour déstabiliser votre concurrent direct.`,
          impacts: {
            motivationChange: 0.4,
            reputationChange: 10,
            tensionRivalDelta: 30,
            unlockSpecialite: SPECIALITES_PRESETS[4]
          }
        },
        {
          id: 'm1-b4',
          texte: `Accusation de tricherie : "Leur moteur a une cartographie illégale, la FIA doit enquêter !"`,
          description: `Mettre en doute la conformité technique de la monoplace rivale.`,
          impacts: {
            reputationChange: 12,
            tensionRivalDelta: 40,
            moneyChange: -8000,
            confianceDirecteurDelta: -15
          }
        },
        {
          id: 'm1-b5',
          texte: `Menace physique : "S'il me touche encore une fois au freinage, ça finira dans le mur !"`,
          description: `Envoyer un avertissement musclé pour imposer le respect en piste.`,
          impacts: {
            reputationChange: -10,
            confianceDirecteurDelta: -25,
            moneyChange: -10000
          }
        }
      ]
    },
    {
      id: 'paddock-1',
      titre: `Paddock : Demande de Télémétrie de ${teammateName}`,
      categorie: 'Paddock',
      interlocuteur: `Directeur Technique & ${teammateName}`,
      description: `${teammateName} peine avec son train arrière et sollicite un accès complet à votre télémétrie.`,
      options: [
        {
          id: 'p1-b1',
          texte: `Partager l'intégralité de vos fichiers de données`,
          description: `Donner un libre accès à vos télémétries et vos réglages.`,
          impacts: {
            relationCoequipierDelta: 25,
            confianceDirecteurDelta: 15
          }
        },
        {
          id: 'p1-b2',
          texte: `Proposer un débriefing conjoint guidé avec l'ingénieur`,
          description: `Organiser une séance de travail partagée encadrée par le staff.`,
          impacts: {
            relationCoequipierDelta: 15,
            statsBoost: { talent: 0.3 },
            confianceDirecteurDelta: 8
          }
        },
        {
          id: 'p1-b3',
          texte: `Lui fournir sciemment de fausses données de télémétrie altérées`,
          description: `Transmettre des courbes de télémétrie modifiées pour conserver votre avance.`,
          impacts: {
            statsBoost: { vitesse: 0.5 },
            relationCoequipierDelta: -40,
            confianceDirecteurDelta: -25,
            moneyChange: -5000
          }
        },
        {
          id: 'p1-b4',
          texte: `Refuser froidement : "Qu'il apprenne à régler sa voiture tout seul !"`,
          description: `Trancher net et garder l'exclusivité de votre travail de mise au point.`,
          impacts: {
            relationCoequipierDelta: -30,
            confianceDirecteurDelta: -15
          }
        },
        {
          id: 'p1-b5',
          texte: `Exiger qu'il vous verse 10 000 € personnels pour accéder à vos fichiers`,
          description: `Monnayer directement l'accès à vos données auprès de votre coéquipier.`,
          impacts: {
            relationCoequipierDelta: -35,
            confianceDirecteurDelta: -25,
            moneyChange: -6000
          }
        }
      ]
    },
    {
      id: 'sponsor-1',
      titre: `Sponsor : Soirée Prestigieuse du Partenaire Titre`,
      categorie: 'Sponsor',
      interlocuteur: `Sponsors VIP`,
      description: `Un sponsor de luxe organise un dîner de gala la veille des essais libres.`,
      options: [
        {
          id: 's1-b1',
          texte: `Assister au dîner et animer la soirée partenaires avec charisme`,
          description: `Assurer la présence auprès des partenaires majeurs de l'écurie.`,
          impacts: {
            moneyChange: 18000,
            reputationChange: 8
          }
        },
        {
          id: 's1-b2',
          texte: `Rentrer tôt à l'hôtel pour 9 heures de sommeil et analyse vidéo des virages`,
          description: `Privilégier la préparation physique et la récupération avant les essais.`,
          impacts: {
            statsBoost: { vitesse: 0.3, gestionPneus: 0.3 },
            confianceDirecteurDelta: 10
          }
        },
        {
          id: 's1-b3',
          texte: `Consommer de l'alcool sans modération avec les VIP jusqu'au matin`,
          description: `Partager une nuit festive mémorable avec les patrons de marques sponsors.`,
          impacts: {
            moneyChange: 28000,
            statsBoost: { regularite: -1.5 },
            confianceDirecteurDelta: -18
          }
        },
        {
          id: 's1-b4',
          texte: `Critiquer le produit du sponsor au micro pendant le toast officiel`,
          description: `Exprimer un avis tranché et sans filtre sur les produits présentés.`,
          impacts: {
            moneyChange: -25000,
            reputationChange: -20,
            confianceDirecteurDelta: -20
          }
        },
        {
          id: 's1-b5',
          texte: `Envoyer un mécanicien à votre place sans avertir les organisateurs`,
          description: `Déléguer votre présence RP à un membre de l'équipe technique.`,
          impacts: {
            moneyChange: -15000,
            confianceDirecteurDelta: -15,
            reputationChange: -10
          }
        }
      ]
    }
  ];

  const dilemmas = aiDilemmas.length > 0 ? aiDilemmas : baseDilemmas;

  const currentDilemma = dilemmas.find(d => d.id === selectedDilemmaId) || dilemmas[0];
  const isCurrentAnswered = !!answeredMap[currentDilemma?.id || ''];

  const totalAnsweredCount = Object.keys(answeredMap).length;
  const isAllAnswered = totalAnsweredCount >= dilemmas.length;

  const handleSelectOption = (opt: typeof currentDilemma['options'][0]) => {
    if (isCurrentAnswered) return;

    const statLogs: string[] = [];
    if (opt.impacts.statsBoost) {
      Object.entries(opt.impacts.statsBoost).forEach(([k, v]) => {
        statLogs.push(`+${v} ${k.toUpperCase()}`);
      });
    }
    if (opt.impacts.motivationChange) statLogs.push(`${opt.impacts.motivationChange > 0 ? '+' : ''}${opt.impacts.motivationChange} MOTIVATION`);
    if (opt.impacts.reputationChange) statLogs.push(`${opt.impacts.reputationChange > 0 ? '+' : ''}${opt.impacts.reputationChange} RÉPUTATION`);

    const impact: ChoiceImpactFeedback = {
      titre: currentDilemma.titre,
      type: currentDilemma.categorie === 'Media' ? 'media' : 'paddock',
      descriptionChoix: opt.texte,
      impactCourseLogs: [opt.description],
      statChanges: statLogs,
      specialiteDebloquee: opt.impacts.unlockSpecialite,
      gainFinancier: opt.impacts.moneyChange || 0,
      relationshipsChanges: {
        confianceDirecteur: opt.impacts.confianceDirecteurDelta,
        relationCoequipier: opt.impacts.relationCoequipierDelta,
        tensionRival: opt.impacts.tensionRivalDelta
      }
    };

    setAnsweredMap(prev => ({
      ...prev,
      [currentDilemma.id]: impact
    }));

    onApplyOffTrackChoice(impact);
  };

  const handleNextDilemmaClick = () => {
    const nextUnanswered = dilemmas.find(d => !answeredMap[d.id]);
    if (nextUnanswered) {
      setSelectedDilemmaId(nextUnanswered.id);
    } else if (onCompleteAllOffTrack) {
      onCompleteAllOffTrack();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Vie de Paddock, Médias & Sponsors (Cohérence IA)</span>
          </div>
          <h3 className="text-xl font-black text-white mt-1">
            {isFirstRace ? 'Débuts en Carrière & Premières Réactions' : 'Vos Décisions Hors-Piste du Week-end'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Répondez aux médias, au Paddock et aux Sponsors ({totalAnsweredCount} / {dilemmas.length} effectués).
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-purple-950/80 border border-purple-600/60 text-purple-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
              Généré par l'IA d'après vos résultats : {lastPos ? `Course P${lastPos}` : 'Saison'} | Champ. P{rank}
            </span>

            <button
              onClick={fetchAiOffTrackDilemmas}
              disabled={isGeneratingAiEvent}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isGeneratingAiEvent ? 'animate-spin' : ''}`} />
              <span>Régénérer par l'IA</span>
            </button>
          </div>
        </div>

        {/* Progress Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {dilemmas.map((d, idx) => {
            const isDone = !!answeredMap[d.id];
            const isSel = selectedDilemmaId === d.id;

            return (
              <button
                key={d.id}
                onClick={() => setSelectedDilemmaId(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSel
                    ? 'bg-red-600 border-red-500 text-white shadow-lg'
                    : isDone
                    ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{d.categorie} #{idx + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading banner for AI Generation */}
      {isGeneratingAiEvent && (
        <div className="bg-purple-950/40 border border-purple-500/50 p-4 rounded-2xl flex items-center gap-3 text-purple-200 text-xs animate-pulse">
          <Radio className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
          <div>
            <strong className="block font-bold text-purple-300">L'IA analyse vos résultats de la saison (P{lastPos || 'N/A'}, P{rank} au classement)...</strong>
            <span>Création des questions des médias (Canal+, L'Équipe), du Paddock et des choix sponsors en cours...</span>
          </div>
        </div>
      )}

      {/* Current Dilemma Display */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <span className="text-xs bg-amber-950/80 text-amber-300 px-3 py-1 rounded-full border border-amber-800/60 font-bold uppercase flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            {currentDilemma.interlocuteur}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Catégorie : <strong className="text-white">{currentDilemma.categorie}</strong>
          </span>
        </div>

        <div>
          <h4 className="text-lg font-extrabold text-white">{currentDilemma.titre}</h4>
          <p className="text-sm text-slate-200 mt-2 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800 italic">
            "{currentDilemma.description}"
          </p>
        </div>

        {/* If Answered: Display Consequences & Hide Options */}
        {isCurrentAnswered ? (
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-700/80 rounded-2xl p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Choix Validé — Conséquences Appliquées !
              </span>
              <span className="bg-emerald-900/60 text-emerald-300 px-2.5 py-0.5 rounded text-[10px]">Définitif</span>
            </div>

            <div className="text-sm font-extrabold text-white">
              "{answeredMap[currentDilemma.id].descriptionChoix}"
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {answeredMap[currentDilemma.id].impactCourseLogs.join(' • ')}
            </p>

            {/* Breakdown Badges */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-900/50">
              {answeredMap[currentDilemma.id].statChanges?.map((st, i) => (
                <span key={i} className="bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                  {st}
                </span>
              ))}

              {answeredMap[currentDilemma.id].gainFinancier > 0 && (
                <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                  +{answeredMap[currentDilemma.id].gainFinancier.toLocaleString('fr-FR')} €
                </span>
              )}

              {answeredMap[currentDilemma.id].relationshipsChanges.confianceDirecteur !== undefined && (
                <span className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                  Confiance Écurie : {answeredMap[currentDilemma.id].relationshipsChanges.confianceDirecteur! > 0 ? '+' : ''}{answeredMap[currentDilemma.id].relationshipsChanges.confianceDirecteur}%
                </span>
              )}

              {answeredMap[currentDilemma.id].relationshipsChanges.relationCoequipier !== undefined && (
                <span className="bg-slate-900 border border-slate-700 text-cyan-300 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                  Relation Coéquipier : {answeredMap[currentDilemma.id].relationshipsChanges.relationCoequipier! > 0 ? '+' : ''}{answeredMap[currentDilemma.id].relationshipsChanges.relationCoequipier}%
                </span>
              )}

              {answeredMap[currentDilemma.id].relationshipsChanges.tensionRival !== undefined && (
                <span className="bg-slate-900 border border-slate-700 text-red-400 text-xs font-mono font-bold px-2.5 py-1 rounded-lg">
                  Tension Rival : {answeredMap[currentDilemma.id].relationshipsChanges.tensionRival! > 0 ? '+' : ''}{answeredMap[currentDilemma.id].relationshipsChanges.tensionRival}%
                </span>
              )}

              {answeredMap[currentDilemma.id].specialiteDebloquee && (
                <span className="bg-amber-950 border border-amber-700 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Spécialité : {answeredMap[currentDilemma.id].specialiteDebloquee?.nom}
                </span>
              )}
            </div>

            {/* Explicit Continuer Button */}
            <div className="pt-3 border-t border-emerald-900/50 flex justify-end">
              <button
                onClick={handleNextDilemmaClick}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
              >
                <span>
                  {dilemmas.some(d => !answeredMap[d.id]) ? 'Continuer — Question Suivante' : 'Continuer — Valider les choix'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* Display Selectable Options */
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Quelle décision ou réponse donnez-vous ? (Choix unique et définitif)
            </span>

            {currentDilemma.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/80 p-4 rounded-xl transition-all space-y-1.5 group cursor-pointer"
              >
                <div className="flex items-center justify-between font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  <span>{opt.texte}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">{opt.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {isAllAnswered && onCompleteAllOffTrack && (
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border border-amber-500/50 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-extrabold text-white">Tous vos choix hors-piste sont validés !</h4>
              <p className="text-xs text-slate-300">Vos relations et statistiques ont été mises à jour. Vous êtes prêt pour la course.</p>
            </div>
          </div>

          <button
            onClick={onCompleteAllOffTrack}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Passer au Classement & Grand Prix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
