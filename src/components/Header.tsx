import React from 'react';
import { Driver, Categorie } from '../types';
import { Flag, Trophy, DollarSign, Star, RefreshCw, Zap, Flame } from 'lucide-react';

interface HeaderProps {
  driver: Driver | null;
  categorie: Categorie;
  currentRaceIndex: number;
  totalRaces: number;
  onResetCareer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  driver,
  categorie,
  currentRaceIndex,
  totalRaces,
  onResetCareer
}) => {
  const categoriesList: Categorie[] = ['Karting', 'F4', 'F3', 'F2', 'F1'];
  const [aiProvider, setAiProvider] = React.useState<'openrouter' | 'gemini' | 'none'>('none');

  React.useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        if (data.activeProvider) {
          setAiProvider(data.activeProvider);
        }
      })
      .catch(() => setAiProvider('none'));
  }, []);

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 text-slate-100 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Category Progression */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-red-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-xl tracking-wider bg-gradient-to-r from-red-500 via-amber-400 to-white bg-clip-text text-transparent italic">
                  F1 <span className="text-white font-extrabold not-italic">CAREER</span>
                </h1>
                {aiProvider === 'openrouter' && (
                  <span className="text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="IA OpenRouter activée pour des dilemmes et choix ultra-diversifiés">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    OpenRouter AI
                  </span>
                )}
                {aiProvider === 'gemini' && (
                  <span className="text-[10px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm" title="IA Gemini activée">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                    Gemini AI
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Motorsport Career Sim
              </p>
            </div>
          </div>

          {/* Echelle des catégories */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">
            {categoriesList.map((cat, idx) => {
              const isCurrent = cat === categorie;
              const isPast = categoriesList.indexOf(categorie) > idx;

              return (
                <React.Fragment key={cat}>
                  {idx > 0 && <span className="text-slate-700 text-xs">›</span>}
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : isPast
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    {cat}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Pilote & Stats rapides */}
        {driver ? (
          <div className="flex flex-wrap items-center gap-3 md:gap-5 text-xs sm:text-sm">
            {/* Pilote Badge & Jauge Motivation Horizontale */}
            <div className="flex items-center gap-3 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span className="text-lg">{driver.flagCode}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-100 leading-none">{driver.nom}</p>
                  <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-800/60 px-1.5 py-0.2 rounded font-mono font-bold">
                    {driver.age ?? 12} ans
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{driver.style}</p>
              </div>

              {/* Jauge Horizontale de Motivation */}
              <div className="flex flex-col gap-1 ml-1 pl-2 border-l border-slate-700/60 w-24">
                <div className="flex justify-between items-center text-[10px] leading-none">
                  <span className="text-slate-400 font-semibold flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    Motiv.
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.round(driver.stats.motivation)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, driver.stats.motivation))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Driver Specialties */}
            {driver.specialites && driver.specialites.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                {driver.specialites.map((spec) => (
                  <span key={spec.id} className="text-xs" title={`${spec.nom}: ${spec.description}`}>
                    {spec.icon}
                  </span>
                ))}
              </div>
            )}

            {/* Budget */}
            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-lg text-emerald-400 font-mono font-bold">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{(driver.budget ?? 0).toLocaleString('fr-FR')} €</span>
            </div>

            {/* Réputation */}
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/50 px-3 py-1.5 rounded-lg text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{driver.reputation ?? 0} <span className="text-[10px] text-amber-500/70">/100</span></span>
            </div>

            {/* Points & Victoires */}
            <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-yellow-400">{driver.pointsChampionnat ?? 0} pts</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">{driver.victoires ?? 0} vic.</span>
            </div>

            {/* Progression Saison */}
            <div className="hidden xl:flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/30 text-xs">
              <span className="text-slate-400 font-medium">Course:</span>
              <span className="font-bold text-white">{currentRaceIndex} / {totalRaces}</span>
            </div>

            {/* Recommencer */}
            <button
              onClick={onResetCareer}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-red-950/80 border border-slate-700/60 hover:border-red-500/60 text-slate-300 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="Recommencer une nouvelle carrière"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Nouvelle Carrière</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-xs text-amber-400 bg-amber-950/30 px-3 py-1 rounded-full border border-amber-800/40 font-medium">
              Création de Carrière Pilote
            </div>
            <button
              onClick={onResetCareer}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-red-950/80 border border-slate-700/60 hover:border-red-500/60 text-slate-300 hover:text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="Réinitialiser"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs">Réinitialiser</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
