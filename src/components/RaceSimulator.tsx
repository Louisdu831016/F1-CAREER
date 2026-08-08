import React, { useState, useEffect, useMemo } from 'react';
import { RaceResult, Driver, Team, LapResult, TrackDilemma, TrackChoiceOption, ChoiceImpactFeedback } from '../types';
import { 
  Trophy, 
  Play, 
  Pause, 
  FastForward, 
  SkipForward, 
  Flag, 
  CloudRain, 
  Gauge, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Radio,
  CheckCircle2,
  ArrowRight,
  Zap,
  Flame,
  Timer,
  LayoutGrid,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { generateTrackDilemmasForCircuit, generateContextualTrackDilemma } from '../utils/simulationEngine';
import { ChoiceImpactModal } from './ChoiceImpactModal';

interface RaceSimulatorProps {
  driver: Driver;
  team: Team;
  raceResult: RaceResult;
  onFinishRace: () => void;
  onApplyChoiceImpact?: (impact: ChoiceImpactFeedback) => void;
  geminiCommentary?: string;
}

type SimPhase = 'qualif_prep' | 'qualif_running' | 'qualif_grid' | 'race';
type QualifStrategy = 'agressif' | 'equilibre' | 'prudent';

interface QualifDriverEntry {
  qualifPosition: number;
  driverName: string;
  teamName: string;
  teamColor: string;
  isUser: boolean;
  isTeammate: boolean;
  lapTimeStr: string;
  gapStr: string;
  sector1: string;
  sector2: string;
  sector3: string;
  s1Val: number;
  s2Val: number;
  s3Val: number;
}

export const RaceSimulator: React.FC<RaceSimulatorProps> = ({
  driver,
  team,
  raceResult,
  onFinishRace,
  onApplyChoiceImpact,
  geminiCommentary
}) => {
  // Phase Management
  const [simPhase, setSimPhase] = useState<SimPhase>('qualif_prep');
  const [qualifStrategy, setQualifStrategy] = useState<QualifStrategy>('equilibre');
  const [qualifAnimProgress, setQualifAnimProgress] = useState<number>(0); // 0 to 100
  const [showGridModalInRace, setShowGridModalInRace] = useState<boolean>(false);

  // Race Simulation State
  const [currentLapIndex, setCurrentLapIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(1000); // 1 sec per lap
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Dilemmas State
  const [dilemmas] = useState<TrackDilemma[]>(() => 
    generateTrackDilemmasForCircuit(raceResult.circuit, driver, team, raceResult.strategy)
  );
  const [activeDilemma, setActiveDilemma] = useState<TrackDilemma | null>(null);
  const [activeImpact, setActiveImpact] = useState<ChoiceImpactFeedback | null>(null);
  const [handledDilemmaIds, setHandledDilemmaIds] = useState<Set<string>>(new Set());
  const [isGeneratingAiDilemma, setIsGeneratingAiDilemma] = useState<boolean>(false);

  const totalLaps = raceResult.lapsLog.length;
  const currentLap: LapResult = raceResult.lapsLog[currentLapIndex] || raceResult.lapsLog[0];

  // 1. Génération de la Grille de Qualification complète (20 Pilotes)
  const qualifGrid = useMemo<QualifDriverEntry[]>(() => {
    const basePoleSec = (raceResult.circuit.longueurKm * 48) + 12.0;
    const userPos = raceResult.positionQualif;

    // Prendre les 20 pilotes du classement final et redistribuer les positions de qualif
    const allDrivers = [...raceResult.classementFinal];
    
    // Identifier l'utilisateur
    const userEntry = allDrivers.find(d => d.isUser);
    const rivalsEntries = allDrivers.filter(d => !d.isUser);

    // Bâtir le classement de qualification
    const resultEntries: { driver: typeof allDrivers[0]; pos: number }[] = [];

    let rivalIndex = 0;
    for (let pos = 1; pos <= 20; pos++) {
      if (pos === userPos && userEntry) {
        resultEntries.push({ driver: userEntry, pos });
      } else if (rivalIndex < rivalsEntries.length) {
        resultEntries.push({ driver: rivalsEntries[rivalIndex], pos });
        rivalIndex++;
      }
    }

    const poleTime = basePoleSec;

    return resultEntries.map(({ driver: dr, pos }) => {
      const timeSec = poleTime + (pos - 1) * 0.118 + (Math.sin(pos * 3.7) * 0.03);
      const gapSec = pos === 1 ? 0 : timeSec - poleTime;

      // Découpage fictif en 3 secteurs avec légères variations individuelles
      const s1Ratio = 0.31 + (Math.sin(pos * 2.3) * 0.008);
      const s2Ratio = 0.39 + (Math.cos(pos * 1.9) * 0.008);
      const s3Ratio = 1 - (s1Ratio + s2Ratio);

      const s1Val = parseFloat((timeSec * s1Ratio).toFixed(3));
      const s2Val = parseFloat((timeSec * s2Ratio).toFixed(3));
      const s3Val = parseFloat((timeSec * s3Ratio).toFixed(3));

      const mins = Math.floor(timeSec / 60);
      const secs = (timeSec % 60).toFixed(3);
      const formattedSecs = parseFloat(secs) < 10 ? `0${secs}` : secs;
      const lapTimeStr = mins > 0 ? `${mins}:${formattedSecs}` : `${timeSec.toFixed(3)}s`;

      const isTeammate = !dr.isUser && (
        dr.teamName.toLowerCase().includes(team.nom.toLowerCase()) || 
        team.nom.toLowerCase().includes(dr.teamName.toLowerCase())
      );

      return {
        qualifPosition: pos,
        driverName: dr.driverName,
        teamName: dr.teamName,
        teamColor: dr.teamColor,
        isUser: dr.isUser,
        isTeammate,
        lapTimeStr,
        gapStr: pos === 1 ? 'POLE' : `+${gapSec.toFixed(3)}s`,
        sector1: `${s1Val.toFixed(3)}s`,
        sector2: `${s2Val.toFixed(3)}s`,
        sector3: `${s3Val.toFixed(3)}s`,
        s1Val,
        s2Val,
        s3Val
      };
    }).sort((a, b) => a.qualifPosition - b.qualifPosition);
  }, [raceResult, team.nom]);

  // Animation du tour de qualification
  useEffect(() => {
    if (simPhase !== 'qualif_running') return;

    setQualifAnimProgress(0);
    const interval = setInterval(() => {
      setQualifAnimProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [simPhase]);

  // Animation de la course en direct
  useEffect(() => {
    if (simPhase !== 'race' || !isPlaying || isCompleted || activeDilemma || activeImpact || isGeneratingAiDilemma) return;

    const currentLapNum = currentLap?.lap || 1;
    // Maximum 3 choix par course
    const canTriggerDilemma = handledDilemmaIds.size < 3;
    const dilemmaForLap = canTriggerDilemma ? dilemmas.find(
      d => d.tour === currentLapNum && !handledDilemmaIds.has(d.id)
    ) : null;

    if (dilemmaForLap) {
      setIsPlaying(false);

      const fetchAiDilemma = async () => {
        setIsGeneratingAiDilemma(true);

        const userPos = currentLap.position;
        const allDrivers = raceResult.classementFinal;
        const carAheadEntry = allDrivers.find(d => d.position === userPos - 1);
        const carBehindEntry = allDrivers.find(d => d.position === userPos + 1);
        const teammateEntry = allDrivers.find(d => !d.isUser && (d.teamName.toLowerCase().includes(team.nom.toLowerCase()) || team.nom.toLowerCase().includes(d.teamName.toLowerCase())));
        const rivalName = driver.relations?.nomRival || 'Matteo Rossi';
        const rivalEntry = allDrivers.find(d => d.driverName === rivalName);

        const carAhead = carAheadEntry ? {
          name: carAheadEntry.driverName,
          team: carAheadEntry.teamName,
          position: carAheadEntry.position,
          gapSec: 0.4
        } : null;

        const carBehind = carBehindEntry ? {
          name: carBehindEntry.driverName,
          team: carBehindEntry.teamName,
          position: carBehindEntry.position,
          gapSec: 0.5
        } : null;

        const teammate = teammateEntry ? {
          name: teammateEntry.driverName,
          position: teammateEntry.position
        } : null;

        const rival = rivalEntry ? {
          name: rivalEntry.driverName,
          position: rivalEntry.position
        } : null;

        try {
          const res = await fetch('/api/ai/generate-race-dilemma', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driverName: driver.nom,
              category: raceResult.circuit.id,
              circuitName: raceResult.circuit.nom,
              lap: currentLap.lap,
              totalLaps,
              userPosition: userPos,
              carAhead,
              carBehind,
              teammate,
              rival,
              tireWear: currentLap.tireWearPercent,
              weather: currentLap.weather,
              strategy: raceResult.strategy
            })
          });

          const data = await res.json();
          if (data.success && data.dilemma) {
            setActiveDilemma(data.dilemma);
          } else {
            const fallback = generateContextualTrackDilemma(
              raceResult.circuit,
              driver,
              team,
              currentLap.lap,
              totalLaps,
              userPos,
              carAhead,
              carBehind,
              teammate,
              rival,
              currentLap.tireWearPercent,
              currentLap.weather,
              raceResult.strategy
            );
            setActiveDilemma(fallback);
          }
        } catch (e) {
          console.warn("Error fetching AI race dilemma, using fallback:", e);
          const fallback = generateContextualTrackDilemma(
            raceResult.circuit,
            driver,
            team,
            currentLap.lap,
            totalLaps,
            userPos,
            carAhead,
            carBehind,
            teammate,
            rival,
            currentLap.tireWearPercent,
            currentLap.weather,
            raceResult.strategy
          );
          setActiveDilemma(fallback);
        } finally {
          setIsGeneratingAiDilemma(false);
        }
      };

      fetchAiDilemma();
      return;
    }

    const timer = setTimeout(() => {
      if (currentLapIndex < totalLaps - 1) {
        setCurrentLapIndex(prev => prev + 1);
      } else {
        setIsCompleted(true);
        setIsPlaying(false);
      }
    }, playbackSpeedMs);

    return () => clearTimeout(timer);
  }, [simPhase, isPlaying, currentLapIndex, totalLaps, playbackSpeedMs, isCompleted, activeDilemma, activeImpact, dilemmas, handledDilemmaIds, currentLap, isGeneratingAiDilemma, driver, team, raceResult]);

  const handleSelectOption = (opt: TrackChoiceOption) => {
    if (!activeDilemma) return;

    setHandledDilemmaIds(prev => new Set(prev).add(activeDilemma.id));

    const statLogs: string[] = [];
    if (opt.impacts.statChanges) {
      Object.entries(opt.impacts.statChanges).forEach(([k, v]) => {
        statLogs.push(`+${v} ${k.toUpperCase()}`);
      });
    }

    const impact: ChoiceImpactFeedback = {
      titre: activeDilemma.titre,
      type: 'piste',
      descriptionChoix: opt.texte,
      impactCourseLogs: [
        opt.impactCourseResumee,
        `Usure Pneu: +${opt.impacts.tireWearPenalty}%`,
        `Écart au leader: ${opt.impacts.gapSecDelta > 0 ? '+' : ''}${opt.impacts.gapSecDelta}s`
      ],
      statChanges: statLogs,
      specialiteDebloquee: opt.impacts.unlockSpecialite,
      gainFinancier: 0,
      relationshipsChanges: {
        confianceDirecteur: opt.impacts.confianceDirecteurDelta,
        tensionRival: opt.impacts.tensionRivalDelta,
        relationCoequipier: opt.impacts.relationCoequipierDelta
      }
    };

    if (onApplyChoiceImpact) {
      onApplyChoiceImpact(impact);
    }

    setActiveDilemma(null);
    setActiveImpact(impact);
  };

  const handleCloseImpactModal = () => {
    setActiveImpact(null);
    setIsPlaying(true);
  };

  const handleSkipToEnd = () => {
    setCurrentLapIndex(totalLaps - 1);
    setIsCompleted(true);
    setIsPlaying(false);
  };

  const userQualifEntry = qualifGrid.find(q => q.isUser) || qualifGrid[0];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">

      {/* PHASE 1 : PRÉPARATION DU TOUR CHRONOMÉTRÉ */}
      {simPhase === 'qualif_prep' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Bannière En-tête Qualifications */}
          <div className="bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <Timer className="w-80 h-80 text-white" />
            </div>

            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-red-600/40">
                  <Timer className="w-3.5 h-3.5" /> Séance de Qualifications
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {raceResult.circuit.flag} {raceResult.circuit.nom}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Tour Chronométré & Détermination de la Grille
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Le feu vert s'allume au bout de la voie des stands ! Choisissez la stratégie d'attaque pour votre tour rapide avant de vous élancer en piste contre les 19 autres pilotes.
              </p>
            </div>
          </div>

          {/* Cartes Stratégie d'attaque Hot Lap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <button
              onClick={() => setQualifStrategy('agressif')}
              className={`text-left p-6 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                qualifStrategy === 'agressif'
                  ? 'bg-red-950/80 border-red-500 ring-2 ring-red-500 shadow-xl shadow-red-950/50'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="w-10 h-10 rounded-xl bg-red-900/60 border border-red-700/60 flex items-center justify-center text-red-400 font-bold">
                  <Flame className="w-5 h-5" />
                </span>
                {qualifStrategy === 'agressif' && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Sélectionné
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">Attaque Maximale</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prendre tous les vibreurs et retarder les freinages. Potentiel de gain de chrono élevé mais risque de blocage de roue.
              </p>
              <div className="pt-2 text-[11px] font-mono text-red-400 font-bold">
                +0.35s de potentiel / Risque 20%
              </div>
            </button>

            <button
              onClick={() => setQualifStrategy('equilibre')}
              className={`text-left p-6 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                qualifStrategy === 'equilibre'
                  ? 'bg-amber-950/80 border-amber-500 ring-2 ring-amber-500 shadow-xl shadow-amber-950/50'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-700/60 flex items-center justify-center text-amber-400 font-bold">
                  <Zap className="w-5 h-5" />
                </span>
                {qualifStrategy === 'equilibre' && (
                  <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Recommandé
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">Tour Propre & Équilibré</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trajectoire idéale, réaccélération progressive et zéro erreur. Stratégie optimale pour sécuriser un très bon chrono.
              </p>
              <div className="pt-2 text-[11px] font-mono text-amber-400 font-bold">
                Régularité Optimale / Zéro Faute
              </div>
            </button>

            <button
              onClick={() => setQualifStrategy('prudent')}
              className={`text-left p-6 rounded-2xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                qualifStrategy === 'prudent'
                  ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500 shadow-xl shadow-emerald-950/50'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </span>
                {qualifStrategy === 'prudent' && (
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    Sélectionné
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">Gestion & Prudence</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assurer un temps de référence propre sans abîmer les gommes avant le départ du Grand Prix.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-400 font-bold">
                Économie Gommes / Zéro Risque
              </div>
            </button>

          </div>

          {/* Bouton de Lancement du Tour Rapide */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold block">Conditions Piste</span>
              <p className="text-sm font-semibold text-white font-mono">
                Météo : <span className="text-amber-400 font-bold">{raceResult.meteo}</span> — Température Piste : <span className="text-white font-bold">29°C</span>
              </p>
            </div>

            <button
              onClick={() => setSimPhase('qualif_running')}
              className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:opacity-90 text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-red-600/40 flex items-center gap-3 transition-all text-base cursor-pointer uppercase tracking-wider"
            >
              <Timer className="w-5 h-5 animate-pulse" />
              <span>S'ÉLANCER SUR UN TOUR CHRONOMÉTRÉ ⏱️</span>
            </button>
          </div>

        </div>
      )}

      {/* PHASE 2 : SIMULATION EN DIRECT DU TOUR DE QUALIFICATION */}
      {simPhase === 'qualif_running' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            
            {/* Header Live Qualification */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-red-400 uppercase font-mono">QUALIFICATIONS EN DIRECT</span>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">Tour Rapide en Cours...</h2>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400 block">Temps en Direct</span>
                <span className="text-3xl font-black text-amber-400">
                  {userQualifEntry.lapTimeStr}
                </span>
              </div>
            </div>

            {/* Barre de Progression Générale du Tour */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-slate-400">Progression du Tour</span>
                <span className="text-amber-400">{qualifAnimProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${qualifAnimProgress}%` }}
                />
              </div>
            </div>

            {/* Secteurs du Circuit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {(() => {
                const userEntry = qualifGrid.find(q => q.isUser) || qualifGrid[0];
                const teammateEntry = qualifGrid.find(q => q.isTeammate) || qualifGrid.find(q => !q.isUser && q.qualifPosition !== userEntry.qualifPosition);

                // Recherche des meilleurs secteurs absolus de toute la session (20 pilotes)
                const minS1 = Math.min(...qualifGrid.map(q => q.s1Val));
                const minS2 = Math.min(...qualifGrid.map(q => q.s2Val));
                const minS3 = Math.min(...qualifGrid.map(q => q.s3Val));

                const tmS1 = teammateEntry ? teammateEntry.s1Val : userEntry.s1Val + 0.12;
                const tmS2 = teammateEntry ? teammateEntry.s2Val : userEntry.s2Val + 0.15;
                const tmS3 = teammateEntry ? teammateEntry.s3Val : userEntry.s3Val + 0.10;

                const getSectorStatus = (userVal: number, minVal: number, tmVal: number): 'VIOLET' | 'VERT' | 'JAUNE' => {
                  if (userVal <= minVal + 0.0001) return 'VIOLET'; // Meilleur temps absolu de la session
                  if (userVal < tmVal) return 'VERT'; // Meilleur que son coéquipier
                  return 'JAUNE'; // Moins bon que son coéquipier
                };

                const s1Status = getSectorStatus(userEntry.s1Val, minS1, tmS1);
                const s2Status = getSectorStatus(userEntry.s2Val, minS2, tmS2);
                const s3Status = getSectorStatus(userEntry.s3Val, minS3, tmS3);

                const s1Delta = userEntry.s1Val - tmS1;
                const s2Delta = userEntry.s2Val - tmS2;
                const s3Delta = userEntry.s3Val - tmS3;

                const formatDelta = (delta: number) => {
                  const sign = delta <= 0 ? '-' : '+';
                  const absVal = Math.abs(delta).toFixed(3);
                  return `${sign}${absVal}s`;
                };

                const getSectorCardInfo = (status: 'VIOLET' | 'VERT' | 'JAUNE', active: boolean, deltaVal: number) => {
                  if (!active) return {
                    cardBg: 'bg-slate-950 border-slate-800/80 text-slate-500',
                    badgeBg: '',
                    label: '',
                    deltaFormatted: '',
                    isAhead: false
                  };

                  const deltaFormatted = formatDelta(deltaVal);
                  const isAhead = deltaVal <= 0;

                  if (status === 'VIOLET') return {
                    cardBg: 'bg-purple-950/60 border-purple-500/80 text-white shadow-lg shadow-purple-950/50',
                    badgeBg: 'bg-purple-600 text-white font-black',
                    label: 'VIOLET (Meilleur Session)',
                    deltaFormatted,
                    isAhead
                  };

                  if (status === 'VERT') return {
                    cardBg: 'bg-emerald-950/60 border-emerald-500/80 text-white shadow-lg shadow-emerald-950/50',
                    badgeBg: 'bg-emerald-600 text-white font-black',
                    label: 'VERT (Avance Coéquipier)',
                    deltaFormatted,
                    isAhead
                  };

                  return {
                    cardBg: 'bg-amber-950/60 border-amber-500/80 text-white shadow-lg shadow-amber-950/50',
                    badgeBg: 'bg-amber-500 text-slate-950 font-black',
                    label: 'JAUNE (Retard Coéquipier)',
                    deltaFormatted,
                    isAhead
                  };
                };

                const s1Info = getSectorCardInfo(s1Status, qualifAnimProgress >= 30, s1Delta);
                const s2Info = getSectorCardInfo(s2Status, qualifAnimProgress >= 70, s2Delta);
                const s3Info = getSectorCardInfo(s3Status, qualifAnimProgress >= 100, s3Delta);

                return (
                  <>
                    {/* SECTEUR 1 */}
                    <div className="relative space-y-1">
                      {qualifAnimProgress >= 30 && (
                        <div className={`p-1.5 px-3 rounded-t-xl text-[11px] font-mono font-black flex items-center justify-between border-t border-x animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                          s1Info.isAhead 
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                            : 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/50'
                        }`}>
                          <span className="flex items-center gap-1">
                            {s1Info.isAhead ? '⚡ AVANCE COÉQUIPIER' : '⚠️ RETARD COÉQUIPIER'}
                          </span>
                          <span className="font-extrabold tracking-widest text-xs px-2 py-0.5 rounded bg-black/40">
                            {s1Info.deltaFormatted}
                          </span>
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl border transition-all ${s1Info.cardBg} ${qualifAnimProgress >= 30 ? 'rounded-t-none' : ''}`}>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>SECTEUR 1</span>
                          {qualifAnimProgress >= 30 && (
                            <span className={`${s1Info.badgeBg} text-[9px] px-1.5 py-0.5 rounded font-mono uppercase`}>
                              {s1Info.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-mono font-black mt-2">
                          {qualifAnimProgress >= 30 ? userQualifEntry.sector1 : '--.---s'}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">Vitesse & Ligne Droite</span>
                      </div>
                    </div>

                    {/* SECTEUR 2 */}
                    <div className="relative space-y-1">
                      {qualifAnimProgress >= 70 && (
                        <div className={`p-1.5 px-3 rounded-t-xl text-[11px] font-mono font-black flex items-center justify-between border-t border-x animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                          s2Info.isAhead 
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                            : 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/50'
                        }`}>
                          <span className="flex items-center gap-1">
                            {s2Info.isAhead ? '⚡ AVANCE COÉQUIPIER' : '⚠️ RETARD COÉQUIPIER'}
                          </span>
                          <span className="font-extrabold tracking-widest text-xs px-2 py-0.5 rounded bg-black/40">
                            {s2Info.deltaFormatted}
                          </span>
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl border transition-all ${s2Info.cardBg} ${qualifAnimProgress >= 70 ? 'rounded-t-none' : ''}`}>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>SECTEUR 2</span>
                          {qualifAnimProgress >= 70 && (
                            <span className={`${s2Info.badgeBg} text-[9px] px-1.5 py-0.5 rounded font-mono uppercase`}>
                              {s2Info.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-mono font-black mt-2">
                          {qualifAnimProgress >= 70 ? userQualifEntry.sector2 : '--.---s'}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">Secteur Sinueux & Technique</span>
                      </div>
                    </div>

                    {/* SECTEUR 3 */}
                    <div className="relative space-y-1">
                      {qualifAnimProgress >= 100 && (
                        <div className={`p-1.5 px-3 rounded-t-xl text-[11px] font-mono font-black flex items-center justify-between border-t border-x animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                          s3Info.isAhead 
                            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                            : 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/50'
                        }`}>
                          <span className="flex items-center gap-1">
                            {s3Info.isAhead ? '⚡ AVANCE COÉQUIPIER' : '⚠️ RETARD COÉQUIPIER'}
                          </span>
                          <span className="font-extrabold tracking-widest text-xs px-2 py-0.5 rounded bg-black/40">
                            {s3Info.deltaFormatted}
                          </span>
                        </div>
                      )}
                      <div className={`p-4 rounded-2xl border transition-all ${s3Info.cardBg} ${qualifAnimProgress >= 100 ? 'rounded-t-none' : ''}`}>
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>SECTEUR 3</span>
                          {qualifAnimProgress >= 100 && (
                            <span className={`${s3Info.badgeBg} text-[9px] px-1.5 py-0.5 rounded font-mono uppercase`}>
                              {s3Info.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xl font-mono font-black mt-2">
                          {qualifAnimProgress >= 100 ? userQualifEntry.sector3 : '--.---s'}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">Relance & Ligne d'Arrivée</span>
                      </div>
                    </div>
                  </>
                );
              })()}

            </div>

            {/* Résultat du Tour quand fini */}
            {qualifAnimProgress >= 100 && (
              <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border border-amber-500/80 p-6 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Qualification Terminée !</span>
                    <h3 className="text-2xl font-black text-white mt-0.5">
                      Vous vous qualifiez en <span className="text-amber-400">Position P{raceResult.positionQualif}</span> !
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Temps au tour officiel : <span className="font-mono font-bold text-white">{userQualifEntry.lapTimeStr}</span> (Écart à la Pole: <span className="font-mono text-amber-400">{userQualifEntry.gapStr}</span>)
                    </p>
                  </div>

                  <button
                    onClick={() => setSimPhase('qualif_grid')}
                    className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-xl flex items-center gap-2 transition-all text-sm cursor-pointer uppercase"
                  >
                    <span>DÉCOUVRIR LA GRILLE DE DÉPART DÉFINITIVE 🏁</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* PHASE 3 : GRILLE DE DÉPART OFFICIELLE (20 PILOTES) */}
      {simPhase === 'qualif_grid' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header Grille */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <LayoutGrid className="w-3.5 h-3.5" /> Grille Officielle F1
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {raceResult.circuit.flag} {raceResult.circuit.nom} — 20 Pilotes
                </span>
              </div>
              <h1 className="text-3xl font-black text-white mt-1">Grille de Départ du Grand Prix</h1>
            </div>

            <button
              onClick={() => setSimPhase('race')}
              className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:opacity-90 text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-red-600/40 flex items-center gap-3 transition-all text-base cursor-pointer uppercase tracking-wider"
            >
              <Flag className="w-5 h-5" />
              <span>EXTINCTION DES FEUX — LANCER LA COURSE 🚦</span>
            </button>
          </div>

          {/* Disposition de la Grille en 2 Colonnes (Style F1 Officiel) */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              
              {/* Ligne Médiane de la piste */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-dashed bg-slate-800 -translate-x-1/2 pointer-events-none" />

              {qualifGrid.map((entry) => {
                const isUser = entry.isUser;
                const isTeammate = entry.isTeammate;

                return (
                  <div
                    key={entry.qualifPosition}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isUser
                        ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/90 border-amber-500/80 ring-2 ring-amber-500/80 shadow-2xl shadow-amber-950/50 scale-[1.01]'
                        : isTeammate
                        ? 'bg-slate-900 border-indigo-500/60 text-slate-200'
                        : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Numéro de Position */}
                      <div className={`w-10 h-10 rounded-xl font-mono font-black text-sm flex items-center justify-center shrink-0 ${
                        entry.qualifPosition === 1
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                          : entry.qualifPosition <= 3
                          ? 'bg-slate-800 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}>
                        P{entry.qualifPosition}
                      </div>

                      {/* Info Pilote */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.teamColor }} />
                          <span className="font-bold text-sm text-white truncate">{entry.driverName}</span>
                          {isUser && (
                            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                              VOUS
                            </span>
                          )}
                          {isTeammate && (
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                              COÉQUIPIER
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 block truncate">{entry.teamName}</span>
                      </div>
                    </div>

                    {/* Chrono & Écart */}
                    <div className="text-right font-mono shrink-0">
                      <span className="text-xs font-bold text-white block">{entry.lapTimeStr}</span>
                      <span className="text-[11px] text-amber-400 font-semibold block">{entry.gapStr}</span>
                    </div>
                  </div>
                );
              })}

            </div>

          </div>

          {/* Bouton de confirmation bas de page */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setSimPhase('race')}
              className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:opacity-90 text-white font-black py-4 px-10 rounded-2xl shadow-2xl shadow-red-600/40 flex items-center gap-3 transition-all text-base cursor-pointer uppercase tracking-wider"
            >
              <Flag className="w-5 h-5 animate-pulse" />
              <span>INSTALLATION SUR LA GRILLE & EXTINCTION DES FEUX 🚦</span>
            </button>
          </div>

        </div>
      )}

      {/* PHASE 4 : DÉROULEMENT DU GRAND PRIX (RACE SIMULATOR) */}
      {simPhase === 'race' && (
        <div className="space-y-6">

          {/* Header Grand Prix & Live Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{raceResult.circuit.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-950 text-red-400 font-bold px-2.5 py-0.5 rounded border border-red-800/60 uppercase">
                    {isCompleted ? 'Course Terminée' : 'Grand Prix en Direct'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Météo : <span className="text-white font-bold">{currentLap?.weather || raceResult.meteo}</span>
                  </span>
                  <button
                    onClick={() => setShowGridModalInRace(true)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2.5 py-0.5 rounded border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                  >
                    <LayoutGrid className="w-3 h-3" />
                    Grille (P{raceResult.positionQualif})
                  </button>
                </div>
                <h2 className="text-2xl font-black text-white mt-1">{raceResult.circuit.nom}</h2>
              </div>
            </div>

            {/* Contrôles de vitesse de simulation */}
            {!isCompleted && (
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Lecture'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>

                <button
                  onClick={() => setPlaybackSpeedMs(1000)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    playbackSpeedMs === 1000 ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1x
                </button>

                <button
                  onClick={() => setPlaybackSpeedMs(400)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    playbackSpeedMs === 400 ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2.5x
                </button>

                <button
                  onClick={() => setPlaybackSpeedMs(150)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    playbackSpeedMs === 150 ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  5x
                </button>

                <button
                  onClick={handleSkipToEnd}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors ml-2 cursor-pointer"
                  title="Sauter à la fin"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {!isCompleted ? (
            /* VUE EN DIRECT DES TOURS */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Colonne Gauche: Télémétrie & Live Position */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Live Lap Counter & Position Big Badge */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
                  
                  {/* Position Actuelle */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/30">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-2xl text-white font-mono">
                        P{currentLap?.position || raceResult.positionFinale}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Position en Course</span>
                      <span className="text-lg font-bold text-white">{driver.nom}</span>
                      <span className="text-xs text-slate-500 block">{team.nom}</span>
                    </div>
                  </div>

                  {/* Compteur de Tour & Barre de Progression */}
                  <div className="text-right space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Tour de Course</span>
                    <span className="text-3xl font-black font-mono text-amber-400 block">
                      {currentLap?.lap || 1} <span className="text-slate-600 text-xl">/ {raceResult.circuit.tours}</span>
                    </span>
                    <div className="w-36 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800 ml-auto">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.round(((currentLap?.lap || 1) / raceResult.circuit.tours) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Gauges Télémétrie (Pneus, Ecart, Temps) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Usure Pneus */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold">État des Gommes</span>
                      <span className="font-mono font-bold text-emerald-400">{currentLap?.tireWearPercent || 100}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          (currentLap?.tireWearPercent || 100) < 25 ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${currentLap?.tireWearPercent || 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Écart Leader */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-1">
                    <span className="text-xs text-slate-400 font-semibold block">Écart au Leader</span>
                    <p className="text-xl font-mono font-bold text-white">
                      +{currentLap?.gapToLeaderSec || 0.0}s
                    </p>
                  </div>

                  {/* Temps au Tour */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-1">
                    <span className="text-xs text-slate-400 font-semibold block">Dernier Chrono</span>
                    <p className="text-xl font-mono font-bold text-amber-400">
                      {currentLap?.lapTimeSec || '1:24.50'}s
                    </p>
                  </div>
                </div>

                {/* Radio du Stand / Commentaire Live */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-slate-300">
                    <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                    Radio Écurie & Commentaires
                  </h3>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed">
                    {currentLap?.commentary || 'Départ de la course !'}
                  </div>

                  {currentLap?.event && (
                    <div className="bg-amber-950/50 border border-amber-800/60 p-3 rounded-xl text-amber-300 text-xs flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{currentLap.event}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne Droite: Timing Tower Live */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>Tour de Contrôle</span>
                  <span className="text-xs font-mono text-slate-400">LIVE TIMING</span>
                </h3>

                <div className="space-y-2">
                  {raceResult.classementFinal.slice(0, 10).map((dr, idx) => {
                    const isUser = dr.isUser;

                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isUser
                            ? 'bg-red-950/60 border-red-500 font-bold text-white ring-1 ring-red-500/50'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold w-5 text-slate-400">P{idx + 1}</span>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dr.teamColor }} />
                          <span className="truncate max-w-[120px]">{dr.driverName}</span>
                        </div>

                        <span className="font-mono text-slate-400 text-[11px]">
                          {idx === 0 ? 'LEADER' : `+${(idx * 1.8).toFixed(1)}s`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* VUE RÉSULTAT FINAL & PODIUM */
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Flash Média / Commentary Gemini */}
              {geminiCommentary && (
                <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 border border-red-800/60 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-amber-400" /> Flash Paddock Télévision
                  </span>
                  <p className="text-base sm:text-lg font-serif italic text-white leading-relaxed">
                    "{geminiCommentary}"
                  </p>
                </div>
              )}

              {/* Resultats Principaux & Gains */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-xs text-slate-400 font-semibold block">Position Finale</span>
                  <p className="text-3xl font-black font-mono text-amber-400 mt-1">
                    P{raceResult.positionFinale}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Qualifié P{raceResult.positionQualif}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-xs text-slate-400 font-semibold block">Points Marqués</span>
                  <p className="text-3xl font-black font-mono text-emerald-400 mt-1">
                    +{raceResult.pointsGagnes} pts
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-xs text-slate-400 font-semibold block">Primes & Sponsors</span>
                  <p className="text-3xl font-black font-mono text-emerald-400 mt-1">
                    +{raceResult.gainFinancier.toLocaleString()} €
                  </p>
                  {raceResult.sponsorBonus && (
                    <span className="text-[10px] text-amber-400 font-bold">✓ Prime d'objectif débloquée</span>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                  <span className="text-xs text-slate-400 font-semibold block">Réputation Pilote</span>
                  <p className="text-3xl font-black font-mono text-amber-400 mt-1">
                    +{raceResult.gainReputation}
                  </p>
                </div>
              </div>

              {/* Tableau de Classement Officiel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center justify-between">
                  <span>Classement Officiel du Grand Prix</span>
                  <Trophy className="w-5 h-5 text-amber-400" />
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                        <th className="py-3 px-3">Pos</th>
                        <th className="py-3 px-3">Pilote</th>
                        <th className="py-3 px-3">Écurie</th>
                        <th className="py-3 px-3 text-right">Meilleur Tour</th>
                        <th className="py-3 px-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {raceResult.classementFinal.map((item) => (
                        <tr
                          key={item.position}
                          className={item.isUser ? 'bg-red-950/50 font-bold text-white' : 'hover:bg-slate-800/40 text-slate-300'}
                        >
                          <td className="py-3 px-3 font-mono font-bold">P{item.position}</td>
                          <td className="py-3 px-3 flex items-center gap-2">
                            <span>{item.driverName}</span>
                          </td>
                          <td className="py-3 px-3" style={{ color: item.teamColor }}>
                            {item.teamName}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">{item.bestLapSec}s</td>
                          <td className="py-3 px-3 text-right font-mono font-extrabold text-amber-400">
                            +{item.pointsGained}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={onFinishRace}
                    className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold py-3.5 px-8 rounded-xl shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all text-sm cursor-pointer"
                  >
                    <span>RETOURNER AU TABLEAU DE BORD</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Modal Grille de Départ consultation pendant la course */}
      {showGridModalInRace && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-amber-400" />
                  Grille de Départ Officielle (20 Pilotes)
                </h3>
                <p className="text-xs text-slate-400">Position au départ : P{raceResult.positionQualif}</p>
              </div>

              <button
                onClick={() => setShowGridModalInRace(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qualifGrid.map((entry) => (
                <div
                  key={entry.qualifPosition}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    entry.isUser
                      ? 'bg-red-950/80 border-amber-500 font-bold text-white'
                      : entry.isTeammate
                      ? 'bg-slate-900 border-indigo-500/60 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono font-bold w-6 text-amber-400">P{entry.qualifPosition}</span>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.teamColor }} />
                    <span className="truncate">{entry.driverName}</span>
                    {entry.isUser && <span className="bg-red-600 text-white text-[8px] font-bold px-1 rounded">VOUS</span>}
                    {entry.isTeammate && <span className="bg-indigo-600 text-white text-[8px] font-bold px-1 rounded">COÉQUIPIER</span>}
                  </div>
                  <span className="font-mono text-slate-400">{entry.lapTimeStr} ({entry.gapStr})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Chargement Dilemme IA en Direct */}
      {isGeneratingAiDilemma && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl p-8 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <Radio className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" /> IA OpenRouter / Télémétrie Live
              </span>
              <h3 className="text-xl font-black text-white">Radio Stand en Direct</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                L'IA analyse la télémétrie du tour {currentLap?.lap}/{totalLaps} et votre position réelle en piste (<span className="text-amber-400 font-bold font-mono">P{currentLap?.position}</span>)...
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-left space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Position Actuelle :</span>
                <span className="text-white font-bold">P{currentLap?.position} / 20</span>
              </div>
              <div className="flex justify-between">
                <span>Usure Pneus :</span>
                <span className="text-amber-400 font-bold">{currentLap?.tireWearPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span>Météo :</span>
                <span className="text-indigo-300 font-bold">{currentLap?.weather}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Track Dilemma Modal (In-Race Decision) */}
      {activeDilemma && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 p-6 text-white relative">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/30 w-fit px-3 py-1 rounded-full border border-white/20 mb-2">
                <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Tour {activeDilemma.tour} — Choix sur la Piste !</span>
              </div>

              <h2 className="text-2xl font-black">{activeDilemma.titre}</h2>
              <p className="text-sm text-red-100/90 mt-1">{activeDilemma.situation}</p>
            </div>

            {/* Radio Message Ingénieur */}
            {activeDilemma.consigneIngenieur && (
              <div className="bg-slate-950 border-b border-slate-800 p-4 px-6 flex items-center gap-3">
                <Radio className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
                <p className="text-xs font-serif italic text-amber-300">{activeDilemma.consigneIngenieur}</p>
              </div>
            )}

            {/* Options List */}
            <div className="p-6 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Que décidez-vous en tant que pilote ?
              </span>

              {activeDilemma.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className="w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/80 p-4 rounded-2xl transition-all space-y-2 group cursor-pointer"
                >
                  <div className="flex items-center justify-between font-bold text-sm text-white group-hover:text-amber-400">
                    <span>{opt.texte}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-slate-400">{opt.description}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono">
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {opt.impactCourseResumee}
                    </span>
                    <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-300">
                      {opt.impactPiloteResumee}
                    </span>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Choice Impact Feedback Modal */}
      {activeImpact && (
        <ChoiceImpactModal
          impact={activeImpact}
          onClose={handleCloseImpactModal}
        />
      )}

    </div>
  );
};

