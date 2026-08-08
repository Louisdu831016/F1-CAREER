import React, { useState, useEffect } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { 
  GameState, 
  Driver, 
  DriverStats,
  Team, 
  Sponsor, 
  Categorie, 
  RaceResult, 
  RaceStrategy, 
  DrivingStyle, 
  FamilyOrigin, 
  Competitor,
  GameResponseJSON,
  ChoiceImpactFeedback,
  RdUpgradeOption,
  ActiveRdProject
} from './types';
import { 
  CATEGORY_CIRCUITS, 
  DEFAULT_TEAMS_BY_CATEGORY, 
  SPONSORS_POOL, 
  GENERATED_COMPETITORS 
} from './data/gameData';
import { Header } from './components/Header';
import { DriverCreation } from './components/DriverCreation';
import { TeamSelection } from './components/TeamSelection';
import { Dashboard } from './components/Dashboard';
import { RaceSimulator } from './components/RaceSimulator';
import { SeasonTransitionModal } from './components/SeasonTransitionModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('creation_pilote');
  const [driver, setDriver] = useState<Driver | null>(null);
  const [categorie, setCategorie] = useState<Categorie>('Karting');
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>(DEFAULT_TEAMS_BY_CATEGORY['Karting']);
  const [availableSponsors, setAvailableSponsors] = useState<Sponsor[]>(SPONSORS_POOL);
  const [currentRaceIndex, setCurrentRaceIndex] = useState<number>(1);
  const [standings, setStandings] = useState<Competitor[]>(GENERATED_COMPETITORS['Karting']);
  const [lastRaceResult, setLastRaceResult] = useState<RaceResult | null>(null);
  const [activeRdProjects, setActiveRdProjects] = useState<ActiveRdProject[]>([]);
  const [geminiCommentary, setGeminiCommentary] = useState<string>('');
  const [systemMessage, setSystemMessage] = useState<string>('Bienvenue dans Pole Position X ! Créez votre pilote pour entamer votre ascension.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Appliquer l'impact d'un choix pilote (sur piste ou hors piste)
  const handleApplyChoiceImpact = (impact: ChoiceImpactFeedback) => {
    setDriver(prev => {
      if (!prev) return null;

      const updatedStats = { ...prev.stats };
      if (impact.statChanges) {
        impact.statChanges.forEach(log => {
          const match = log.match(/([+-]?\d+(?:\.\d+)?)\s+(.+)/);
          const num = match ? parseFloat(match[1]) : null;

          const applyChange = (key: keyof DriverStats, defaultVal: number) => {
            const val = num !== null ? num : defaultVal;
            const current = updatedStats[key] || 50;
            const updated = Math.min(99, Math.max(10, current + val));
            updatedStats[key] = Math.round(updated * 10) / 10;
          };

          if (log.includes('DÉPASSEMENT')) applyChange('depassement', 0.3);
          else if (log.includes('VITESSE')) applyChange('vitesse', 0.3);
          else if (log.includes('TALENT')) applyChange('talent', 0.3);
          else if (log.includes('MOTIVATION')) applyChange('motivation', 0.5);
          else if (log.includes('RÉGULARITÉ')) applyChange('regularite', 0.3);
          else if (log.includes('DÉFENSE')) applyChange('defense', 0.3);
          else if (log.includes('ADAPTABILITÉ') || log.includes('PLUIE') || log.includes('MÉTÉO')) applyChange('adaptabilite', 0.3);
          else if (log.includes('PNEU') || log.includes('GESTION')) applyChange('gestionPneus', 0.3);
        });
      }

      const updatedSpecialites = [...(prev.specialites || [])];
      if (impact.specialiteDebloquee) {
        if (!updatedSpecialites.some(s => s.id === impact.specialiteDebloquee?.id)) {
          updatedSpecialites.push(impact.specialiteDebloquee);
        }
      }

      const currentRel = prev.relations || {
        confianceDirecteur: 75,
        relationCoequipier: 60,
        tensionRival: 30,
        nomRival: 'Matteo Rossi',
        nomCoequipier: 'Lucas Moreau'
      };

      const updatedRel = {
        ...currentRel,
        confianceDirecteur: Math.min(100, Math.max(0, currentRel.confianceDirecteur + (impact.relationshipsChanges.confianceDirecteur || 0))),
        relationCoequipier: Math.min(100, Math.max(0, currentRel.relationCoequipier + (impact.relationshipsChanges.relationCoequipier || 0))),
        tensionRival: Math.min(100, Math.max(0, currentRel.tensionRival + (impact.relationshipsChanges.tensionRival || 0)))
      };

      return {
        ...prev,
        stats: updatedStats,
        budget: prev.budget + (impact.gainFinancier || 0),
        specialites: updatedSpecialites,
        relations: updatedRel
      };
    });
  };

  // Persistence Locale dans localStorage
  useEffect(() => {
    const savedSave = localStorage.getItem('pole_position_x_save');
    if (savedSave) {
      try {
        const parsed = JSON.parse(savedSave);
        if (parsed.driver && parsed.categorie) {
          const loadedDriver: Driver = {
            ...parsed.driver,
            specialites: parsed.driver.specialites || [],
            relations: parsed.driver.relations || {
              confianceDirecteur: 75,
              relationCoequipier: 60,
              tensionRival: 30,
              nomRival: 'Matteo Rossi',
              nomCoequipier: 'Lucas Moreau'
            },
            budget: parsed.driver.budget ?? 15000,
            reputation: parsed.driver.reputation ?? 25,
            pointsChampionnat: parsed.driver.pointsChampionnat ?? 0,
            victoires: parsed.driver.victoires ?? 0,
            podiums: parsed.driver.podiums ?? 0,
            poles: parsed.driver.poles ?? 0,
            coursesTotales: parsed.driver.coursesTotales ?? 0,
            titres: parsed.driver.titres ?? 0,
            niveauExperience: parsed.driver.niveauExperience ?? 1,
            stats: parsed.driver.stats || { vitesse: 50, regularite: 50, depassement: 50, gestionPneus: 50, talent: 50, motivation: 75 }
          };

          let loadedStandings = parsed.standings || GENERATED_COMPETITORS[parsed.categorie as Categorie] || [];
          if (parsed.currentTeam && loadedStandings.length >= 20) {
            const teamDrivers = loadedStandings.filter(c => 
              c.equipeNom.toLowerCase().includes(parsed.currentTeam.nom.toLowerCase()) ||
              parsed.currentTeam.nom.toLowerCase().includes(c.equipeNom.toLowerCase())
            );
            if (teamDrivers.length >= 2) {
              loadedStandings = loadedStandings.filter(c => c.id !== teamDrivers[0].id);
            }
          }

          setDriver(loadedDriver);
          setCategorie(parsed.categorie);
          setCurrentTeam(parsed.currentTeam || null);
          setSponsors(parsed.sponsors || []);
          setCurrentRaceIndex(parsed.currentRaceIndex || 1);
          setStandings(loadedStandings);

          // Safe state resolution
          let targetState: GameState = parsed.gameState || 'tableau_de_bord';
          if (targetState === 'resultat_course') {
            targetState = 'tableau_de_bord';
          }
          if (targetState === 'tableau_de_bord' && !parsed.currentTeam) {
            targetState = 'choix_equipe';
          }
          setGameState(targetState);
        }
      } catch (e) {
        console.error("Erreur de chargement de la sauvegarde:", e);
        localStorage.removeItem('pole_position_x_save');
      }
    }
  }, []);

  // Sauvegarder automatiquement lors des changements d'état
  useEffect(() => {
    if (driver) {
      const saveData = {
        driver,
        categorie,
        gameState,
        currentTeam,
        sponsors,
        currentRaceIndex,
        standings
      };
      localStorage.setItem('pole_position_x_save', JSON.stringify(saveData));
    }
  }, [driver, categorie, gameState, currentTeam, sponsors, currentRaceIndex, standings]);

  const circuitsList = CATEGORY_CIRCUITS[categorie] || CATEGORY_CIRCUITS['Karting'];
  const nextCircuit = circuitsList[Math.min(currentRaceIndex - 1, circuitsList.length - 1)];

  // 1. Création de Pilote -> Appel API /api/simular
  const handleCreateDriver = async (
    nom: string,
    nationalite: string,
    style: DrivingStyle,
    origine: FamilyOrigin
  ) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'creation_pilote',
          nom,
          nationalite,
          style,
          origine
        })
      });

      const data: GameResponseJSON = await res.json();

      // Construire le pilote local enrichi
      const createdDriver: Driver = {
        nom: data.pilote.nom,
        nationalite: data.pilote.nationalite,
        flagCode: getFlagForNationality(data.pilote.nationalite),
        age: 12,
        style: data.pilote.style as DrivingStyle,
        origine: data.pilote.origine as FamilyOrigin,
        stats: data.pilote.stats,
        budget: data.pilote.budget,
        reputation: data.pilote.reputation,
        pointsChampionnat: 0,
        victoires: 0,
        podiums: 0,
        poles: 0,
        coursesTotales: 0,
        titres: 0,
        niveauExperience: 1,
        specialites: data.pilote.specialites || [],
        relations: data.pilote.relations || {
          confianceDirecteur: 75,
          relationCoequipier: 60,
          tensionRival: 30,
          nomRival: 'Matteo Rossi',
          nomCoequipier: 'Lucas Moreau'
        }
      };

      setDriver(createdDriver);
      setCategorie(data.categorieActuelle);
      setAvailableTeams(DEFAULT_TEAMS_BY_CATEGORY[data.categorieActuelle]);
      setAvailableSponsors(SPONSORS_POOL);
      setSystemMessage(data.messageSystème);
      setGameState('choix_equipe');
    } catch (error) {
      console.error("Erreur création pilote:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Choix d'Écurie et Sponsors -> Appel API /api/simular
  const handleSelectTeamAndSponsors = async (teamId: string, sponsorIds: string[]) => {
    if (!driver) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'choix_equipe',
          driverState: driver,
          teamId,
          sponsorIds,
          categorieCurrent: categorie
        })
      });

      const data: GameResponseJSON = await res.json();
      const catTeams = DEFAULT_TEAMS_BY_CATEGORY[categorie];
      const selectedT = catTeams.find(t => t.id === teamId) || catTeams[0];
      const selectedSps = SPONSORS_POOL.filter(s => sponsorIds.includes(s.id));

      // Synchroniser les 19 rivaux : le joueur prend la place du 1er pilote de son écurie
      const catCompetitors = GENERATED_COMPETITORS[categorie] || [];
      const teamDrivers = catCompetitors.filter(c => 
        c.equipeNom.toLowerCase().includes(selectedT.nom.toLowerCase()) ||
        selectedT.nom.toLowerCase().includes(c.equipeNom.toLowerCase())
      );

      let filteredCompetitors = [...catCompetitors];
      let teammateName = driver.relations?.nomCoequipier || 'Lucas Moreau';

      if (teamDrivers.length >= 2) {
        const replacedDriver = teamDrivers[0];
        const teammate = teamDrivers[1];
        teammateName = teammate.nom;
        filteredCompetitors = catCompetitors.filter(c => c.id !== replacedDriver.id);
      } else if (teamDrivers.length === 1) {
        teammateName = teamDrivers[0].nom;
      }

      setDriver(prev => prev ? { 
        ...prev, 
        budget: data.pilote.budget,
        relations: {
          ...prev.relations,
          nomCoequipier: teammateName
        }
      } : null);

      setCurrentTeam(selectedT);
      setSponsors(selectedSps);
      setStandings(filteredCompetitors);
      setSystemMessage(data.messageSystème);
      setGameState('tableau_de_bord');
    } catch (error) {
      console.error("Erreur choix équipe:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Lancer la Course -> Appel API /api/simular & Gemini Commentary
  const handleStartRace = async (strategy: RaceStrategy) => {
    if (!driver || !currentTeam) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'course',
          driverState: driver,
          teamId: currentTeam.id,
          circuitId: nextCircuit.id,
          strategy,
          categorieCurrent: categorie
        })
      });

      const data = await res.json();
      const raceRes: RaceResult = data.resultatDetaille;

      // Mettre à jour l'état du pilote
      setDriver(prev => prev ? {
        ...prev,
        budget: data.pilote.budget,
        reputation: data.pilote.reputation,
        pointsChampionnat: prev.pointsChampionnat + raceRes.pointsGagnes,
        coursesTotales: prev.coursesTotales + 1,
        victoires: raceRes.positionFinale === 1 ? prev.victoires + 1 : prev.victoires,
        podiums: raceRes.positionFinale <= 3 ? prev.podiums + 1 : prev.podiums,
        poles: raceRes.positionQualif === 1 ? prev.poles + 1 : prev.poles
      } : null);

      setLastRaceResult(raceRes);
      setSystemMessage(data.messageSystème);

      // Mettre à jour les points des rivaux dans le classement du championnat
      if (raceRes && raceRes.classementFinal) {
        setStandings(prevStandings => {
          return prevStandings.map(s => {
            const rivalInRace = raceRes.classementFinal.find(item => item.driverName === s.nom);
            if (rivalInRace) {
              return {
                ...s,
                points: s.points + rivalInRace.pointsGained
              };
            }
            return s;
          });
        });
      }

      // Récupérer un commentaire Gemini immersif
      fetchGeminiCommentary(driver.nom, nextCircuit.nom, raceRes.positionFinale, raceRes.meteo);

      setGameState('resultat_course');
    } catch (error) {
      console.error("Erreur simulation course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGeminiCommentary = async (
    driverName: string, 
    circuitName: string, 
    position: number, 
    weather: string
  ) => {
    try {
      const res = await fetch('/api/gemini/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName,
          circuitName,
          position,
          weather,
          category: categorie
        })
      });
      const data = await res.json();
      if (data.commentary) setGeminiCommentary(data.commentary);
    } catch (e) {
      console.warn("Flash commentaire indisponible:", e);
    }
  };

  // 4. Lancer un projet de R&D
  const handleStartRdUpgrade = (upgrade: RdUpgradeOption) => {
    if (!driver || driver.budget < upgrade.cout) return;

    setDriver(prev => prev ? { ...prev, budget: prev.budget - upgrade.cout } : null);

    const newProject: ActiveRdProject = {
      id: `rd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      upgrade,
      coursesRestantes: upgrade.delaiCourses,
      courseLancementIndex: currentRaceIndex
    };

    setActiveRdProjects(prev => [...prev, newProject]);
    setSystemMessage(`🔨 Amélioration lancée : "${upgrade.nom}" ! Elle sera installée sur la monoplace dans ${upgrade.delaiCourses} course(s).`);
  };

  // 5. Fin de course -> Décrémenter les délais R&D, passer au tour suivant ou Fin de Saison
  const handleFinishRace = () => {
    // Gestion du délai des projets R&D
    setActiveRdProjects(prev => {
      const nextProjects: ActiveRdProject[] = [];
      let totalGainMateriel = 0;
      const completedNames: string[] = [];

      prev.forEach(p => {
        const remaining = p.coursesRestantes - 1;
        if (remaining <= 0) {
          totalGainMateriel += p.upgrade.gainNiveauMateriel;
          completedNames.push(p.upgrade.nom);
        } else {
          nextProjects.push({ ...p, coursesRestantes: remaining });
        }
      });

      if (totalGainMateriel > 0 && currentTeam) {
        setCurrentTeam(t => t ? { ...t, niveauMateriel: Math.min(100, t.niveauMateriel + totalGainMateriel) } : null);
        setSystemMessage(`🎉 Amélioration(s) R&D livrée(s) : ${completedNames.join(', ')} ! Le niveau matériel de la voiture augmente de +${totalGainMateriel} pts.`);
      }

      return nextProjects;
    });

    if (currentRaceIndex < circuitsList.length) {
      setCurrentRaceIndex(prev => prev + 1);
      setGameState('tableau_de_bord');
    } else {
      setGameState('transition_saison');
    }
  };

  // 5. Entraînement Pilote
  const handleTrainStat = (statName: keyof Driver['stats']) => {
    const cost = 2500;
    if (!driver || driver.budget < cost) return;

    setDriver(prev => {
      if (!prev) return null;
      const currentVal = prev.stats[statName];
      const newVal = Math.min(99, currentVal + 2);

      return {
        ...prev,
        budget: prev.budget - cost,
        stats: {
          ...prev.stats,
          [statName]: newVal
        }
      };
    });
  };

  // 6. Passage à la saison suivante / Categorie supérieure
  const handleAdvanceToNextSeason = (nextCat: Categorie) => {
    setCategorie(nextCat);
    setCurrentRaceIndex(1);
    setAvailableTeams(DEFAULT_TEAMS_BY_CATEGORY[nextCat]);
    setStandings(GENERATED_COMPETITORS[nextCat]);
    
    // Réinitialiser les points de saison
    setDriver(prev => prev ? { ...prev, pointsChampionnat: 0 } : null);
    setCurrentTeam(null);
    setGameState('choix_equipe');
  };

  // Reset Complet Trigger
  const handleResetCareer = () => {
    setShowResetModal(true);
  };

  const confirmResetCareer = () => {
    localStorage.removeItem('pole_position_x_save');
    setDriver(null);
    setCategorie('Karting');
    setCurrentTeam(null);
    setSponsors([]);
    setCurrentRaceIndex(1);
    setGameState('creation_pilote');
    setLastRaceResult(null);
    setGeminiCommentary('');
    setSystemMessage('Nouvelle carrière démarrée ! Créez votre pilote pour entamer votre ascension.');
    setShowResetModal(false);
  };

  function getFlagForNationality(nat: string): string {
    const map: Record<string, string> = {
      'France': '🇫🇷',
      'Belgique': '🇧🇪',
      'Suisse': '🇨🇭',
      'Royaume-Uni': '🇬🇧',
      'Italie': '🇮🇹',
      'Espagne': '🇪🇸',
      'Allemagne': '🇩🇪',
      'Pays-Bas': '🇳🇱',
      'Monaco': '🇲🇨',
      'Japon': '🇯🇵',
      'Brésil': '🇧🇷',
      'États-Unis': '🇺🇸'
    };
    return map[nat] || '🏁';
  }

  function getNextCategory(cat: Categorie): Categorie | null {
    if (cat === 'Karting') return 'F4';
    if (cat === 'F4') return 'F3';
    if (cat === 'F3') return 'F2';
    if (cat === 'F2') return 'F1';
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-red-500 selection:text-white flex flex-col">
      <Header
        driver={driver}
        categorie={categorie}
        currentRaceIndex={currentRaceIndex}
        totalRaces={circuitsList.length}
        onResetCareer={handleResetCareer}
      />

      <main className="flex-1 pb-12">
        {!driver || gameState === 'creation_pilote' ? (
          <DriverCreation
            onCreateDriver={handleCreateDriver}
            isLoading={isLoading}
          />
        ) : !currentTeam || gameState === 'choix_equipe' ? (
          <TeamSelection
            driver={driver}
            categorie={categorie}
            availableTeams={availableTeams}
            availableSponsors={availableSponsors}
            onSelectTeamAndSponsors={handleSelectTeamAndSponsors}
            isLoading={isLoading}
          />
        ) : gameState === 'resultat_course' && lastRaceResult ? (
          <RaceSimulator
            driver={driver}
            team={currentTeam}
            raceResult={lastRaceResult}
            onFinishRace={handleFinishRace}
            onApplyChoiceImpact={handleApplyChoiceImpact}
            geminiCommentary={geminiCommentary}
          />
        ) : gameState === 'transition_saison' ? (
          <SeasonTransitionModal
            driver={driver}
            currentCategory={categorie}
            nextCategory={getNextCategory(categorie)}
            onAdvanceToNextSeason={handleAdvanceToNextSeason}
          />
        ) : (
          <Dashboard
            driver={driver}
            team={currentTeam}
            sponsors={sponsors}
            categorie={categorie}
            nextCircuit={nextCircuit}
            currentRaceIndex={currentRaceIndex}
            totalRaces={circuitsList.length}
            standings={standings}
            lastRaceResult={lastRaceResult}
            activeRdProjects={activeRdProjects}
            onStartRdUpgrade={handleStartRdUpgrade}
            onStartRace={handleStartRace}
            onTrainStat={handleTrainStat}
            onApplyOffTrackChoice={handleApplyChoiceImpact}
            isLoading={isLoading}
            systemMessage={systemMessage}
          />
        )}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-950/80 border border-red-800/60 rounded-2xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Recommencer la Carrière ?</h3>
                <p className="text-xs text-slate-400">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
              Votre progression actuelle, les statistiques de votre pilote, vos spécialités débloquées et l'historique de votre écurie seront réinitialisés.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmResetCareer}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Oui, recommencer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        Pole Position X — Simulateur de Carrière Sport Automobile © 2026
      </footer>
    </div>
  );
}
