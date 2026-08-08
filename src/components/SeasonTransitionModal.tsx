import React from 'react';
import { Driver, Categorie } from '../types';
import { Trophy, Zap, Star, ArrowRight, Award, Crown } from 'lucide-react';

interface SeasonTransitionModalProps {
  driver: Driver;
  currentCategory: Categorie;
  nextCategory: Categorie | null;
  onAdvanceToNextSeason: (nextCat: Categorie) => void;
}

export const SeasonTransitionModal: React.FC<SeasonTransitionModalProps> = ({
  driver,
  currentCategory,
  nextCategory,
  onAdvanceToNextSeason
}) => {
  const isChampion = driver.pointsChampionnat > 50 && driver.victoires >= 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-300">
        
        {/* Header Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-red-500 p-0.5 shadow-xl shadow-amber-500/30">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            {isChampion ? (
              <Crown className="w-10 h-10 text-yellow-400 fill-yellow-400 animate-bounce" />
            ) : (
              <Trophy className="w-10 h-10 text-amber-400" />
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
            Bilan Officiel de Saison — {currentCategory}
          </span>
          <h2 className="text-3xl font-black text-white mt-3">
            SAISON DE CHAMPIONNAT TERMINÉE
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Félicitations pour vos performances tout au long de cette saison éprouvante en {currentCategory}.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Points Marqués</span>
            <span className="text-xl font-mono font-extrabold text-amber-400">{driver.pointsChampionnat} pts</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Victoires</span>
            <span className="text-xl font-mono font-extrabold text-emerald-400">{driver.victoires}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Podiums</span>
            <span className="text-xl font-mono font-extrabold text-white">{driver.podiums}</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Réputation</span>
            <span className="text-xl font-mono font-extrabold text-cyan-400">{driver.reputation}/100</span>
          </div>
        </div>

        {/* Promotion Message */}
        {nextCategory ? (
          <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border border-red-800/60 p-4 rounded-2xl text-left space-y-1">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Promotion de Catégorie Débloquée !
            </h4>
            <p className="text-xs text-slate-300">
              Grâce à vos résultats et à votre réputation grandissante dans le paddock, les écuries de <span className="font-bold text-red-400">{nextCategory}</span> s'intéressent de près à votre profil.
            </p>
          </div>
        ) : (
          <div className="bg-amber-950/60 border border-amber-800/60 p-4 rounded-2xl text-slate-200 text-xs text-left">
            Vous évoluez au sommet du sport automobile mondial en Formule 1 ! Poursuivez votre domination pour accumuler les titres de Champion du Monde.
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onAdvanceToNextSeason(nextCategory || currentCategory)}
          className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold py-4 px-6 rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all text-base"
        >
          <span>
            {nextCategory ? `MONTER EN CATEGORIE ${nextCategory.toUpperCase()}` : 'ENTAMER LA SAISON SUIVANTE EN F1'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
