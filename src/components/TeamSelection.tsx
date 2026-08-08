import React, { useState } from 'react';
import { Driver, Team, Sponsor, Categorie } from '../types';
import { SPONSORS_POOL } from '../data/gameData';
import { Shield, Trophy, DollarSign, Wrench, CheckCircle2, AlertCircle, ArrowRight, Star } from 'lucide-react';

interface TeamSelectionProps {
  driver: Driver;
  categorie: Categorie;
  availableTeams: Team[];
  availableSponsors: Sponsor[];
  onSelectTeamAndSponsors: (teamId: string, sponsorIds: string[]) => void;
  isLoading: boolean;
}

export const TeamSelection: React.FC<TeamSelectionProps> = ({
  driver,
  categorie,
  availableTeams,
  availableSponsors,
  onSelectTeamAndSponsors,
  isLoading
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(availableTeams[0]?.id || '');
  const [selectedSponsorIds, setSelectedSponsorIds] = useState<string[]>([
    availableSponsors[0]?.id || SPONSORS_POOL[0].id
  ]);

  const selectedTeam = availableTeams.find(t => t.id === selectedTeamId) || availableTeams[0];
  const canAfford = driver.budget >= (selectedTeam?.coutSaison || 0);

  const toggleSponsor = (sId: string) => {
    if (selectedSponsorIds.includes(sId)) {
      if (selectedSponsorIds.length > 1) {
        setSelectedSponsorIds(selectedSponsorIds.filter(id => id !== sId));
      }
    } else {
      if (selectedSponsorIds.length < 2) {
        setSelectedSponsorIds([...selectedSponsorIds, sId]);
      }
    }
  };

  const handleConfirm = () => {
    if (!selectedTeamId) return;
    onSelectTeamAndSponsors(selectedTeamId, selectedSponsorIds);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Banner */}
      <div className="text-center mb-8">
        <span className="bg-amber-950/60 border border-amber-800/60 text-amber-400 text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Mercato Saison — Catégorie {categorie}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
          SÉLECTIONNEZ VOTRE ÉCURIE & VOS SPONSORS
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl mx-auto">
          En {categorie}, vous devez financer votre baquet. Plus l'écurie est prestigieuse, plus le coût annuel est élevé mais meilleures sont vos chances de podiums.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Choix des Écuries (3 offres) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            1. Offres d'Écuries Disponibles ({availableTeams.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableTeams.map((team, idx) => {
              const isSelected = team.id === selectedTeamId;
              const isAffordable = driver.budget >= team.coutSaison;
              const isF1 = categorie === 'F1';

              let tierLabel = "Bas de Plateau";
              if (idx === 1) tierLabel = "Milieu de Grille";
              if (idx === 2) tierLabel = "Top Team Dominant";

              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/30 shadow-xl'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div>
                    {/* Badge Tier */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {tierLabel}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-red-500" />}
                    </div>

                    <h4 className="font-extrabold text-base text-white leading-tight mb-1" style={{ color: team.couleurHex || '#ffffff' }}>
                      {team.nom}
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">Moteur : {team.moteur}</p>

                    {/* Stats Clés */}
                    <div className="space-y-2.5 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 mb-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Prestige :</span>
                        <span className="font-bold text-amber-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> {team.prestige}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Matériel/Châssis :</span>
                        <span className="font-bold text-emerald-400 font-mono">{team.niveauMateriel}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{isF1 ? 'Salaire Versé :' : 'Coût Saison :'}</span>
                        <span className={`font-bold font-mono ${isF1 ? 'text-emerald-400' : isAffordable ? 'text-white' : 'text-red-400'}`}>
                          {isF1 ? `+${(team.f1Salary || 0).toLocaleString()} €` : `${team.coutSaison.toLocaleString()} €`}
                        </span>
                      </div>
                    </div>

                    {/* Objectif Saison */}
                    <div className="text-xs bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30 text-slate-300">
                      <span className="font-bold text-amber-400 block mb-0.5">Objectif Fixé :</span>
                      "{team.objectifSaison}"
                    </div>
                  </div>

                  {!isF1 && !isAffordable && (
                    <div className="mt-3 text-[11px] text-red-400 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Budget familial insuffisant
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Choix des Sponsors */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              2. Partenaires & Sponsors Principaux (1 à 2 max)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableSponsors.map((sp) => {
                const isSelected = selectedSponsorIds.includes(sp.id);

                return (
                  <div
                    key={sp.id}
                    onClick={() => toggleSponsor(sp.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sp.logoColor }} />
                        <h5 className="font-bold text-sm text-white">{sp.nom}</h5>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">Objectif : <span className="text-slate-200 font-medium">{sp.objectif}</span></p>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-emerald-400 font-bold">
                          +{sp.budgetBase.toLocaleString()} € / race
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-amber-400 font-bold">
                          Bonus : +{sp.primeObjectif.toLocaleString()} €
                        </span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Récapitulatif Financier du Bilan */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24 shadow-2xl">
            <h4 className="text-lg font-extrabold text-white mb-4 border-b border-slate-800 pb-3">
              Bilan Financier & Engagement
            </h4>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-slate-400">
                <span>Budget Actuel :</span>
                <span className="font-mono font-bold text-white">{driver.budget.toLocaleString('fr-FR')} €</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Coût Écurie ({selectedTeam?.nom}) :</span>
                <span className="font-mono font-bold text-red-400">
                  -{(selectedTeam?.coutSaison || 0).toLocaleString('fr-FR')} €
                </span>
              </div>

              <div className="border-t border-slate-800 pt-3 flex justify-between font-bold text-base">
                <span className="text-slate-200">Solde Restant :</span>
                <span className={`font-mono ${canAfford ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(driver.budget - (selectedTeam?.coutSaison || 0)).toLocaleString('fr-FR')} €
                </span>
              </div>
            </div>

            {!canAfford && (
              <div className="bg-red-950/50 border border-red-800/60 p-3 rounded-xl text-red-300 text-xs mb-6 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>
                  Vous n'avez pas assez de fond pour payer cette écurie. Choisissez une écurie de gamme inférieure ou sponsorisez davantage.
                </span>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isLoading || (!canAfford && categorie !== 'F1')}
              className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span>SIGNER LE CONTRAT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
