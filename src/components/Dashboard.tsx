import React, { useState } from 'react';
import { 
  Driver, 
  Team, 
  Sponsor, 
  Circuit, 
  Categorie, 
  RaceStrategy, 
  TireCompound, 
  AggressivenessLevel,
  Competitor,
  ChoiceImpactFeedback,
  RdUpgradeOption,
  ActiveRdProject,
  RaceResult
} from '../types';
import { 
  Trophy, 
  Zap, 
  Flag, 
  DollarSign, 
  CloudRain, 
  Gauge, 
  TrendingUp, 
  Newspaper, 
  Flame, 
  Play, 
  Calendar,
  CheckCircle2,
  Dumbbell,
  Users,
  Building2,
  Radio,
  Award,
  ShieldAlert,
  ArrowRight,
  Wrench,
  Clock,
  Sparkles,
  Cpu,
  Layers
} from 'lucide-react';
import { OffTrackHub } from './OffTrackHub';
import { PROPOSED_RD_UPGRADES } from '../data/rdUpgradesData';

interface DashboardProps {
  driver: Driver;
  team: Team;
  sponsors: Sponsor[];
  categorie: Categorie;
  nextCircuit: Circuit;
  currentRaceIndex: number;
  totalRaces: number;
  standings: Competitor[];
  lastRaceResult?: RaceResult | null;
  activeRdProjects?: ActiveRdProject[];
  onStartRdUpgrade?: (upgrade: RdUpgradeOption) => void;
  onStartRace: (strategy: RaceStrategy) => void;
  onTrainStat: (statName: keyof Driver['stats']) => void;
  onApplyOffTrackChoice: (impact: ChoiceImpactFeedback) => void;
  isLoading: boolean;
  systemMessage?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  driver,
  team,
  sponsors,
  categorie,
  nextCircuit,
  currentRaceIndex,
  totalRaces,
  standings,
  lastRaceResult,
  activeRdProjects = [],
  onStartRdUpgrade,
  onStartRace,
  onTrainStat,
  onApplyOffTrackChoice,
  isLoading,
  systemMessage
}) => {
  // Strategy State (préconisé par l'équipe)
  const [pneuDepart, setPneuDepart] = useState<TireCompound>('Medium');
  const [aggressivite, setAggressivite] = useState<AggressivenessLevel>('Normal');
  const [tourPit, setTourPit] = useState<number>(Math.floor(nextCircuit.tours / 2));
  const [pneuApresPit, setPneuApresPit] = useState<TireCompound>('Soft');

  // Dynamic Team Evaluation State
  const [teamEvalStatus, setTeamEvalStatus] = useState<'approved' | 'adapted' | 'refused'>('approved');
  const [teamEvalMessage, setTeamEvalMessage] = useState<string>(
    `"Salut ${driver.nom}. L'équipe préconise un départ en Medium, arrêt au tour ${Math.floor(nextCircuit.tours / 2)} pour des Softs. Tu peux modifier le plan mais l'ingénieur analysera la faisabilité !"`
  );

  const handleApplyStrategy = (newPneu: TireCompound, newAggro: AggressivenessLevel, newSecondPneu: TireCompound = pneuApresPit) => {
    let status: 'approved' | 'adapted' | 'refused' = 'approved';
    let msg = '';
    let adjustedPit = Math.floor(nextCircuit.tours / 2);

    // 1. Refusal check
    if (newPneu === 'Wet' && nextCircuit.probabilitePluie < 20) {
      status = 'refused';
      msg = `❌ STRATÉGIE REFUSÉE : "Inconcevable ${driver.nom} ! Mettre des pneus Pluie sur du sec à ${nextCircuit.nom} est suicidaire. L'ingénieur refuse et rétablit les Mediums !"`;
      setPneuDepart('Medium');
      setAggressivite('Normal');
      setTourPit(adjustedPit);
      setTeamEvalStatus(status);
      setTeamEvalMessage(msg);
      return;
    }

    if (newAggro === 'Banzai' && driver.confianceDirecteur < 45) {
      status = 'refused';
      msg = `❌ STRATÉGIE REFUSÉE : "La direction technique oppose son veto au mode Banzai ! Votre cote de confiance chez ${team.nom} (${driver.confianceDirecteur}%) est trop juste pour tenter un tel risque."`;
      setAggressivite('Attaque');
      setTeamEvalStatus(status);
      setTeamEvalMessage(msg);
      return;
    }

    // 2. Adaptation with Trade-off check
    if ((newAggro === 'Attaque' || newAggro === 'Banzai') && newPneu === 'Soft') {
      status = 'adapted';
      adjustedPit = Math.max(2, Math.floor(nextCircuit.tours * 0.35));
      msg = `⚠️ STRATÉGIE ADAPTÉE (DÉGRADATION FORTE) : "D'accord pour l'attaque Soft ! Vous irez plus vite au départ, mais les gommes vont s'user foudroyamment. L'ingénieur avance donc l'arrêt au tour ${adjustedPit} pour éviter toute crevaison !"`;
    } else if (newAggro === 'Économe' && newPneu === 'Hard') {
      status = 'adapted';
      adjustedPit = Math.floor(nextCircuit.tours * 0.75);
      msg = `🛡️ STRATÉGIE ENDURANTE ADAPTÉE : "Entendu ! En mode Économe avec gommes Hard, nous prolongeons le relais jusqu'au tour ${adjustedPit}. Zéro risque mécanique mais rythme plus prudent."`;
    } else {
      status = 'approved';
      msg = `✅ STRATÉGIE VALIDÉE PAR L'ÉQUIPE : "Plan tactique réaliste et validé par la télémétrie pour ${nextCircuit.nom}. Équilibre parfait entre vitesse et préservation du matériel."`;
    }

    setPneuDepart(newPneu);
    setAggressivite(newAggro);
    setPneuApresPit(newSecondPneu);
    setTourPit(adjustedPit);
    setTeamEvalStatus(status);
    setTeamEvalMessage(msg);
  };

  const [activeTab, setActiveTab] = useState<'strategy' | 'training' | 'rd' | 'offtrack' | 'standings'>('strategy');

  // State pour l'animation des conséquences d'entraînement
  const [lastTrainingLog, setLastTrainingLog] = useState<{
    statName: string;
    oldVal: number;
    newVal: number;
    cost: number;
  } | null>(null);

  const handleTrainWithAnimation = (key: keyof Driver['stats'], name: string) => {
    const oldVal = driver.stats[key];
    onTrainStat(key);
    setLastTrainingLog({
      statName: name,
      oldVal,
      newVal: Math.min(99, oldVal + 2),
      cost: trainingCost
    });
  };

  const handleLaunchRace = () => {
    const strat: RaceStrategy = {
      pneuDepart,
      aggressivite,
      tourPitonPrevu: tourPit,
      pneuApresPit,
      consigneEquipeMsg: `Stratégie validée par l'ingénieur de piste chez ${team.nom}.`
    };
    onStartRace(strat);
  };

  const trainingCost = 2500;
  const rivalName = driver.relations?.nomRival || 'Matteo Rossi';
  const teammateName = driver.relations?.nomCoequipier || 'Lucas Moreau';

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* System Notification Banner */}
      {systemMessage && (
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border border-red-800/60 rounded-2xl p-4 shadow-lg text-slate-200 text-sm flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="leading-snug">{systemMessage}</div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Main Hub Tabs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Prochain Grand Prix Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/10 to-transparent pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="bg-red-950/80 border border-red-800/60 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Manche {currentRaceIndex} / {totalRaces} — {categorie}
              </span>

              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Risque Pluie : <span className="text-white font-bold">{nextCircuit.probabilitePluie}%</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{nextCircuit.flag}</span>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">{nextCircuit.nom}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{nextCircuit.description}</p>
              </div>
            </div>

            {/* Quick Track Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Longueur :</span>
                <span className="font-bold text-white font-mono">{nextCircuit.longueurKm} km ({nextCircuit.tours} tours)</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Dépassement :</span>
                <span className="font-bold text-amber-400 font-mono">{nextCircuit.opportunitesDepassement} / 10</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Usure Pneus :</span>
                <span className="font-bold text-emerald-400 font-mono">{nextCircuit.usurePneusHaute ? 'Élevée' : 'Modérée'}</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-0.5">Complexité :</span>
                <span className="font-bold text-cyan-400 font-mono">{nextCircuit.difficulteTechnique} / 10</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Weekend Preparation Indicator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Préparation du Week-end de Course</span>
              <span className="text-amber-400 font-mono">
                {activeTab === 'strategy' && 'Étape 1 / 5'}
                {activeTab === 'training' && 'Étape 2 / 5'}
                {activeTab === 'rd' && 'Étape 3 / 5'}
                {activeTab === 'offtrack' && 'Étape 4 / 5'}
                {activeTab === 'standings' && 'Étape 5 / 5'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setActiveTab('strategy')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  activeTab === 'strategy'
                    ? 'bg-red-950/80 border-red-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Zap className="w-4 h-4 text-red-500 shrink-0" />
                <div className="truncate">
                  <span className="block text-[9px] text-slate-400 uppercase">1. Briefing</span>
                  <span className="text-[11px]">Stratégie</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('training')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  activeTab === 'training'
                    ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="truncate">
                  <span className="block text-[9px] text-slate-400 uppercase">2. Centre</span>
                  <span className="text-[11px]">Entraînement</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('rd')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  activeTab === 'rd'
                    ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="truncate">
                  <span className="block text-[9px] text-slate-400 uppercase">3. R&D</span>
                  <span className="text-[11px]">Améliorations</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('offtrack')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  activeTab === 'offtrack'
                    ? 'bg-amber-950/80 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="block text-[9px] text-slate-400 uppercase">4. Paddock</span>
                  <span className="text-[11px]">Médias</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('standings')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  activeTab === 'standings'
                    ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <span className="block text-[9px] text-slate-400 uppercase">5. Grille</span>
                  <span className="text-[11px]">Départ</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab 1: Briefing & Consignes Écurie */}
          {activeTab === 'strategy' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Radio Briefing Ingénieur & Évaluation Écurie */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-2 text-red-400">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    Ingénieur de Piste — Négociation & Briefing Tactique
                  </span>
                  <span className="text-slate-500 font-mono">{team.nom}</span>
                </div>

                {/* Response Banner according to teamEvalStatus */}
                <div className={`p-4 rounded-xl border font-serif text-sm leading-relaxed ${
                  teamEvalStatus === 'refused'
                    ? 'bg-red-950/80 border-red-700 text-red-200'
                    : teamEvalStatus === 'adapted'
                    ? 'bg-amber-950/80 border-amber-700 text-amber-200'
                    : 'bg-slate-900/90 border-slate-800 text-slate-200'
                }`}>
                  <div className="font-sans text-xs font-black uppercase mb-1 flex items-center gap-2">
                    {teamEvalStatus === 'refused' && <span className="text-red-400">🔴 Stratégie Refusée par l'Ingénieur</span>}
                    {teamEvalStatus === 'adapted' && <span className="text-amber-400">🟡 Stratégie Adaptée (Compromis & Usure Accrue)</span>}
                    {teamEvalStatus === 'approved' && <span className="text-emerald-400">🟢 Stratégie Validée par l'Équipementier</span>}
                  </div>
                  <p className="italic">{teamEvalMessage}</p>
                </div>

                {/* Modificateurs rapides de stratégie */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleApplyStrategy('Medium', 'Normal', 'Soft')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                  >
                    🎯 Stratégie Équilibrée (Préconisée)
                  </button>
                  <button
                    onClick={() => handleApplyStrategy('Soft', 'Attaque', 'Medium')}
                    className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-300 transition-colors cursor-pointer"
                  >
                    🔥 Stratégie Agressive (Départ Soft + Attaque)
                  </button>
                  <button
                    onClick={() => handleApplyStrategy('Hard', 'Économe', 'Soft')}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300 transition-colors cursor-pointer"
                  >
                    🛡️ Stratégie Endurante (Relais Long Hard)
                  </button>
                </div>
              </div>

              {/* Ajustement des préférences par le pilote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Préférence Gomme au Départ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Soft', 'Medium', 'Hard', 'Wet'] as TireCompound[]).map((cmp) => {
                      const isSel = pneuDepart === cmp;
                      let colorClass = 'text-red-400 border-red-500/50';
                      if (cmp === 'Medium') colorClass = 'text-amber-400 border-amber-500/50';
                      if (cmp === 'Hard') colorClass = 'text-slate-200 border-slate-500/50';
                      if (cmp === 'Wet') colorClass = 'text-cyan-400 border-cyan-500/50';

                      return (
                        <button
                          key={cmp}
                          type="button"
                          onClick={() => handleApplyStrategy(cmp, aggressivite)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? `bg-slate-950 border-2 ${colorClass} shadow-md`
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Pneu {cmp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Niveau d'Agressivité
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Économe', 'Normal', 'Attaque', 'Banzai'] as AggressivenessLevel[]).map((level) => {
                      const isSel = aggressivite === level;

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleApplyStrategy(pneuDepart, level)}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            isSel
                              ? 'bg-red-950/60 border-red-500 text-red-300'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bouton Suivant -> Étape 2 Entraînement */}
              <button
                onClick={() => setActiveTab('training')}
                className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition-all text-base group cursor-pointer"
              >
                <span>VALIDER LA STRATÉGIE ET PASSER À L'ENTRAÎNEMENT (Étape 2/5)</span>
                <CheckCircle2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}

          {/* Tab 4: Off-Track Hub */}
          {activeTab === 'offtrack' && (
            <OffTrackHub
              driver={driver}
              team={team}
              currentRaceIndex={currentRaceIndex}
              categorie={categorie}
              nextCircuit={nextCircuit}
              lastRaceResult={lastRaceResult}
              standings={standings}
              onApplyOffTrackChoice={onApplyOffTrackChoice}
              onCompleteAllOffTrack={() => setActiveTab('standings')}
            />
          )}

          {/* Tab 5: Standings & Start Race */}
          {activeTab === 'standings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Étape 5 sur 5 — Grille de Départ</span>
                  <h3 className="text-lg font-bold text-white">Classement Général - {categorie}</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Avant le Grand Prix de <strong className="text-white">{nextCircuit.nom}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5 px-3">Pos</th>
                      <th className="py-2.5 px-3">Pilote</th>
                      <th className="py-2.5 px-3">Écurie</th>
                      <th className="py-2.5 px-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      {
                        id: 'user',
                        nom: `${driver.nom} (Vous)`,
                        nationalite: driver.nationalite,
                        flag: driver.flagCode,
                        equipeNom: team.nom,
                        equipeCouleur: team.couleurHex,
                        points: driver.pointsChampionnat,
                        isUser: true
                      },
                      ...standings.map(s => ({ ...s, isUser: false }))
                    ]
                      .sort((a, b) => b.points - a.points)
                      .map((item, index) => (
                        <tr
                          key={item.id}
                          className={item.isUser ? 'bg-red-950/40 font-bold text-white' : 'hover:bg-slate-800/40 text-slate-300'}
                        >
                          <td className="py-3 px-3 font-mono font-bold">P{index + 1}</td>
                          <td className="py-3 px-3 flex items-center gap-2">
                            <span>{item.flag}</span>
                            <span>{item.nom}</span>
                          </td>
                          <td className="py-3 px-3" style={{ color: item.equipeCouleur }}>
                            {item.equipeNom}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-400">
                            {item.points} pts
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Bouton Final : Lancement de la Course */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleLaunchRace}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold py-5 px-6 rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition-all text-base group cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                  <span>PRENDRE LE VOLANT — LANCER LE GRAND PRIX DE {nextCircuit.nom.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Driver Training */}
          {activeTab === 'training' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Centre d'Entraînement de Pilotage</h3>
                  <p className="text-xs text-slate-400">Investissez dans votre préparation physique et technique pour booster vos attributs.</p>
                </div>
                <div className="text-xs font-mono bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl text-emerald-400 font-bold">
                  Solde : {driver.budget.toLocaleString()} €
                </div>
              </div>

              {/* Training Consequence Animation Banner */}
              {lastTrainingLog && (
                <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-amber-950 border border-emerald-500/80 p-5 rounded-2xl space-y-3 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                      <Dumbbell className="w-5 h-5 text-emerald-400 animate-bounce" />
                      Session d'Entraînement Terminée !
                    </span>
                    <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                      -{lastTrainingLog.cost.toLocaleString()} €
                    </span>
                  </div>

                  <div className="text-base font-black text-white flex items-center gap-2">
                    <span>{lastTrainingLog.statName} :</span>
                    <span className="text-slate-400 font-mono line-through text-sm">{lastTrainingLog.oldVal}</span>
                    <span className="text-amber-400 font-mono text-lg animate-pulse">➔ {lastTrainingLog.newVal} / 100</span>
                    <span className="text-emerald-400 text-xs bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-md font-bold">+2 PTS</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-snug">
                    Votre investissement produit ses effets. Le staff de {team.nom} a noté vos progrès dans télémétrie.
                  </p>

                  <div className="pt-2 border-t border-emerald-900/60 flex justify-end">
                    <button
                      onClick={() => setLastTrainingLog(null)}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase px-5 py-2 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continuer — Masquer l'Animation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'vitesse' as const, name: 'Vitesse Pure', desc: 'Améliore vos temps au tour en qualification.' },
                  { key: 'regularite' as const, name: 'Régularité', desc: 'Réduit les erreurs de trajectoire et les blocages.' },
                  { key: 'gestionPneus' as const, name: 'Gestion Pneus', desc: 'Diminue l\'usure de la gomme au fil des tours.' },
                  { key: 'depassement' as const, name: 'Dépassement', desc: 'Augmente le taux de succès lors des attaques.' },
                  { key: 'defense' as const, name: 'Défense', desc: 'Permet de fermer la porte et protéger sa position.' },
                  { key: 'adaptabilite' as const, name: 'Adaptabilité (Météo)', desc: 'S\'adapter sous la pluie et conditions changeantes.' },
                  { key: 'talent' as const, name: 'Talent Brut', desc: 'Développe le potentiel naturel et le feeling en piste.' },
                ].map((st) => {
                  const val = driver.stats[st.key] ?? 50;
                  const canAfford = driver.budget >= trainingCost;

                  return (
                    <div key={st.key} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-white">{st.name}</span>
                        <span className="font-mono font-extrabold text-amber-400 text-sm">
                          {typeof val === 'number' ? (val % 1 === 0 ? val : val.toFixed(1)) : val} / 100
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{st.desc}</p>

                      <button
                        onClick={() => handleTrainWithAnimation(st.key, st.name)}
                        disabled={!canAfford || val >= 99}
                        className="w-full bg-slate-800 hover:bg-emerald-600 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>S'entraîner (+2 pts) — {trainingCost.toLocaleString()} €</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bouton Suivant -> Étape 3 Améliorations R&D */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveTab('rd')}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                >
                  <span>PASSER À LA R&D & AMÉLIORATIONS (Étape 3/5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: R&D & Améliorations Écurie */}
          {activeTab === 'rd' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Wrench className="w-4 h-4" />
                    <span>Développement R&D & Pièces Écurie</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">Améliorations Techniques du Matériel</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Commandez les évolutions proposées par l'écurie {team.nom}. Le délai de fabrication se compte en nombre de courses.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Niveau Matériel Voiture</span>
                    <span className="text-lg font-black text-purple-400 font-mono">{team.niveauMateriel} / 100</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Budget Disponible</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">{driver.budget.toLocaleString()} €</span>
                  </div>
                </div>
              </div>

              {/* Section Projets R&D en Cours */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Développements en Cours à l'Usine ({activeRdProjects.length})</span>
                </h4>

                {activeRdProjects.length === 0 ? (
                  <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl text-center text-xs text-slate-400 italic">
                    Aucune pièce n'est actuellement en cours de fabrication dans le bureau d'études.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeRdProjects.map((proj) => (
                      <div key={proj.id} className="bg-purple-950/30 border border-purple-500/40 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="bg-purple-900/80 text-purple-200 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-700">
                            {proj.upgrade.categorie} — {proj.upgrade.taille}
                          </span>
                          <span className="text-amber-400 font-mono font-bold text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            {proj.coursesRestantes === 1 ? '⚡ Prochain GP !' : `${proj.coursesRestantes} courses d'attente`}
                          </span>
                        </div>

                        <h5 className="font-bold text-sm text-white">{proj.upgrade.nom}</h5>
                        <p className="text-xs text-slate-300">{proj.upgrade.description}</p>
                        
                        <div className="pt-2 border-t border-purple-900/60 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Gain Matériel :</span>
                          <span className="text-emerald-400 font-bold font-mono">+{proj.upgrade.gainNiveauMateriel} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Propositions de l'Écurie */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Propositions du Département Technique ({team.nom})</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PROPOSED_RD_UPGRADES.map((upgrade) => {
                    const isAlreadyInDev = activeRdProjects.some(p => p.upgrade.id === upgrade.id);
                    const canAfford = driver.budget >= upgrade.cout;

                    let badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                    if (upgrade.taille === 'Moyenne') badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                    if (upgrade.taille === 'Majeure') badgeColor = 'bg-red-950 text-red-300 border-red-800';

                    return (
                      <div key={upgrade.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                              {upgrade.taille} ({upgrade.delaiCourses} {upgrade.delaiCourses === 1 ? 'course' : 'courses'})
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {upgrade.categorie}
                            </span>
                          </div>

                          <h5 className="font-bold text-sm text-white">{upgrade.nom}</h5>
                          <p className="text-xs text-slate-400 leading-relaxed">{upgrade.description}</p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Gain Matériel Écurie :</span>
                            <span className="text-purple-400 font-mono font-bold">+{upgrade.gainNiveauMateriel} pts</span>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Coût de fabrication :</span>
                            <span className="text-emerald-400 font-mono font-extrabold">{upgrade.cout.toLocaleString()} €</span>
                          </div>

                          <button
                            onClick={() => onStartRdUpgrade && onStartRdUpgrade(upgrade)}
                            disabled={isAlreadyInDev || !canAfford}
                            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              isAlreadyInDev
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : canAfford
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>
                              {isAlreadyInDev
                                ? "Développement en cours à l'usine"
                                : !canAfford
                                ? `Solde insuffisant (${upgrade.cout.toLocaleString()} €)`
                                : `Lancer l'Amélioration (${upgrade.cout.toLocaleString()} €)`}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bouton Suivant -> Étape 4 Hors-Piste & Médias */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveTab('offtrack')}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
                >
                  <span>PASSER AUX MÉDIAS & HORS-PISTE (Étape 4/5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Profil Pilote, Spécialités & Tensions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Spécialités & Traits Débloqués */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Spécialités du Pilote</span>
              <Award className="w-4 h-4 text-amber-400" />
            </h3>

            {driver.specialites && driver.specialites.length > 0 ? (
              <div className="space-y-2.5">
                {driver.specialites.map((spec) => (
                  <div key={spec.id} className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex items-start gap-3">
                    <span className="text-2xl">{spec.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-white">{spec.nom}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{spec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Aucune spécialité débloquée pour l'instant.</p>
            )}
          </div>

          {/* Climat & Relations dans le Paddock */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Tensions & Relations</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </h3>

            <div className="space-y-3.5 text-xs">
              
              {/* Confiance Directeur */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Confiance Écurie ({team.nom})</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {driver.relations?.confianceDirecteur || 75}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all" 
                    style={{ width: `${driver.relations?.confianceDirecteur || 75}%` }} 
                  />
                </div>
              </div>

              {/* Relation Coéquipier */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Coéquipier ({teammateName})</span>
                  <span className="font-bold text-cyan-400 font-mono">
                    {driver.relations?.relationCoequipier || 60}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all" 
                    style={{ width: `${driver.relations?.relationCoequipier || 60}%` }} 
                  />
                </div>
              </div>

              {/* Tension Rival */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Rivalité ({rivalName})</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {driver.relations?.tensionRival || 30}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all" 
                    style={{ width: `${driver.relations?.tensionRival || 30}%` }} 
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Fiche Pilote Stats */}
          {(() => {
            const allStats = [
              driver.stats.vitesse,
              driver.stats.regularite,
              driver.stats.gestionPneus,
              driver.stats.depassement,
              driver.stats.defense ?? 50,
              driver.stats.adaptabilite ?? 50,
              driver.stats.talent
            ];
            const noteGenerale = Math.round((allStats.reduce((a, b) => a + b, 0) / allStats.length) * 10) / 10;

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Fiche Technique Pilote</span>
                    <span className="text-xs bg-red-950 text-red-300 border border-red-800/80 px-2 py-0.5 rounded-full font-mono font-bold">
                      {driver.age ?? 12} ans
                    </span>
                  </div>
                  <span className="text-xl">{driver.flagCode}</span>
                </h3>

                {/* Note Générale / Niveau Pilote */}
                <div className="bg-gradient-to-r from-amber-500/20 via-slate-950 to-slate-900 border border-amber-500/50 p-4 rounded-xl flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">Note Générale</span>
                    <span className="text-xs text-slate-300 font-semibold">Niveau Global Pilote</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-black text-amber-400 drop-shadow">{noteGenerale.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  {[
                    { label: 'Vitesse Pure', val: driver.stats.vitesse },
                    { label: 'Régularité', val: driver.stats.regularite },
                    { label: 'Gestion Pneus', val: driver.stats.gestionPneus },
                    { label: 'Dépassement', val: driver.stats.depassement },
                    { label: 'Défense', val: driver.stats.defense ?? 50 },
                    { label: 'Adaptabilité (Météo)', val: driver.stats.adaptabilite ?? 50 },
                    { label: 'Talent Brut', val: driver.stats.talent },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-400">{s.label}</span>
                        <span className="font-bold text-white font-mono">
                          {typeof s.val === 'number' ? (s.val % 1 === 0 ? s.val : s.val.toFixed(1)) : s.val}/100
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${s.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Sponsors Actifs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Sponsors Contrats</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </h3>

            <div className="space-y-3">
              {sponsors.map((sp) => (
                <div key={sp.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.logoColor }} />
                    <span>{sp.nom}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Obj : {sp.objectif}</p>
                  <p className="font-mono text-emerald-400 font-bold text-[11px]">
                    +{sp.budgetBase.toLocaleString()} € / course (Bonus: +{sp.primeObjectif.toLocaleString()} €)
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

