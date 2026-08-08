import React, { useState } from 'react';
import { DrivingStyle, FamilyOrigin } from '../types';
import { 
  NATIONALITIES, 
  DRIVING_STYLES_INFO, 
  FAMILY_ORIGINS_INFO 
} from '../data/gameData';
import { User, Flag, Shield, Wallet, Zap, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

interface DriverCreationProps {
  onCreateDriver: (
    nom: string,
    nationalite: string,
    style: DrivingStyle,
    origine: FamilyOrigin
  ) => void;
  isLoading: boolean;
}

export const DriverCreation: React.FC<DriverCreationProps> = ({
  onCreateDriver,
  isLoading
}) => {
  const [nom, setNom] = useState('Alexandre Moreau');
  const [nationalite, setNationalite] = useState('France');
  const [style, setStyle] = useState<DrivingStyle>('Équilibré');
  const [origine, setOrigine] = useState<FamilyOrigin>('Classe Moyenne Passionnée');

  const selectedStyleInfo = DRIVING_STYLES_INFO[style] || DRIVING_STYLES_INFO['Équilibré'] || Object.values(DRIVING_STYLES_INFO)[0];
  const selectedOriginInfo = FAMILY_ORIGINS_INFO[origine] || FAMILY_ORIGINS_INFO['Classe Moyenne Passionnée'] || Object.values(FAMILY_ORIGINS_INFO)[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    onCreateDriver(nom.trim(), nationalite, style, origine);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-red-950/50 border border-red-800/60 px-4 py-1.5 rounded-full text-red-400 font-semibold text-xs uppercase tracking-wider mb-4 shadow-lg shadow-red-950/40">
          <Zap className="w-4 h-4 fill-red-400" />
          Saison 1 — Karting International
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          CRÉEZ VOTRE PILOTE MOTORSPORT
        </h2>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
          Définissez vos origines familiales, votre profil de pilotage et vos attributs de départ pour débuter votre ascension du Karting vers la Formule 1.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche: Informations & Choix */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identité */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-red-500" />
              1. Identité du Pilote
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nom & Prénom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: Charles Leclerc"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 transition-colors font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nationalité
                </label>
                <div className="relative">
                  <select
                    value={nationalite}
                    onChange={(e) => setNationalite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 transition-colors font-medium text-sm appearance-none cursor-pointer"
                  >
                    {NATIONALITIES.map((n) => (
                      <option key={n.name} value={n.name}>
                        {n.flag} {n.name}
                      </option>
                    ))}
                  </select>
                  <Flag className="w-4 h-4 text-slate-500 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Style de pilotage */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              2. Profil & Style de Pilotage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(DRIVING_STYLES_INFO) as DrivingStyle[]).map((styleKey) => {
                const info = DRIVING_STYLES_INFO[styleKey];
                const isSelected = style === styleKey;

                return (
                  <button
                    type="button"
                    key={styleKey}
                    onClick={() => setStyle(styleKey)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${isSelected ? 'text-red-400' : 'text-white'}`}>
                        {info.label}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-red-500" />}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Origine Familiale */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-emerald-500" />
              3. Origine Familiale & Budget de Départ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(FAMILY_ORIGINS_INFO) as FamilyOrigin[]).map((originKey) => {
                const info = FAMILY_ORIGINS_INFO[originKey];
                const isSelected = origine === originKey;

                return (
                  <button
                    type="button"
                    key={originKey}
                    onClick={() => setOrigine(originKey)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-bold text-sm ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {info.label}
                      </span>
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        {info.startingBudget.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{info.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Colonne Droite: Aperçu des Attributs Calculés */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-24">
            {/* Header Fiche Pilote */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Fiche Pilote</span>
                  <span className="text-[10px] bg-red-950 text-red-300 border border-red-800/80 px-2 py-0.5 rounded font-mono font-bold">
                    12 ans
                  </span>
                </div>
                <h4 className="text-xl font-black text-white">{nom || 'Pilote Anonyme'}</h4>
              </div>
              <span className="text-3xl">{NATIONALITIES.find(n => n.name === nationalite)?.flag}</span>
            </div>

            {/* Note Générale de Départ Preview */}
            {(() => {
              const previewStats = [
                selectedStyleInfo.vitesse + (selectedOriginInfo.statBoosts.vitesse || 0),
                selectedStyleInfo.regularite + (selectedOriginInfo.statBoosts.regularite || 0),
                selectedStyleInfo.gestionPneus + (selectedOriginInfo.statBoosts.gestionPneus || 0),
                selectedStyleInfo.depassement + (selectedOriginInfo.statBoosts.depassement || 0),
                (selectedStyleInfo.defense || 50) + (selectedOriginInfo.statBoosts.defense || 0),
                (selectedStyleInfo.adaptabilite || 50) + (selectedOriginInfo.statBoosts.adaptabilite || 0),
                selectedStyleInfo.talent + (selectedOriginInfo.statBoosts.talent || 0),
              ];
              const noteGen = Math.round((previewStats.reduce((a, b) => a + b, 0) / previewStats.length) * 10) / 10;

              return (
                <div className="bg-gradient-to-r from-amber-500/20 via-slate-950 to-slate-900 border border-amber-500/40 p-3.5 rounded-xl mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block">Note Générale Initiale</span>
                    <span className="text-[11px] text-slate-400">Moyenne des 7 caractéristiques</span>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-black text-amber-400">{noteGen.toFixed(1)}</span>
                    <span className="text-xs text-slate-500 font-bold">/ 100</span>
                  </div>
                </div>
              );
            })()}

            {/* Budget de départ */}
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3.5 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Budget Familial Initial</p>
                <p className="text-xl font-black font-mono text-emerald-300 mt-0.5">
                  {selectedOriginInfo.startingBudget.toLocaleString('fr-FR')} €
                </p>
              </div>
              <Wallet className="w-7 h-7 text-emerald-500/80" />
            </div>

            {/* Statistiques prévisibles */}
            <div className="space-y-2.5 mb-6">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attributs de Départ (12 ans)</h5>
              
              {[
                { label: 'Vitesse Pure', val: selectedStyleInfo.vitesse + (selectedOriginInfo.statBoosts.vitesse || 0) },
                { label: 'Régularité', val: selectedStyleInfo.regularite + (selectedOriginInfo.statBoosts.regularite || 0) },
                { label: 'Gestion des Pneus', val: selectedStyleInfo.gestionPneus + (selectedOriginInfo.statBoosts.gestionPneus || 0) },
                { label: 'Sens du Dépassement', val: selectedStyleInfo.depassement + (selectedOriginInfo.statBoosts.depassement || 0) },
                { label: 'Défense de Position', val: (selectedStyleInfo.defense || 50) + (selectedOriginInfo.statBoosts.defense || 0) },
                { label: 'Adaptabilité (Météo)', val: (selectedStyleInfo.adaptabilite || 50) + (selectedOriginInfo.statBoosts.adaptabilite || 0) },
                { label: 'Talent Brut', val: selectedStyleInfo.talent + (selectedOriginInfo.statBoosts.talent || 0) },
              ].map((st) => {
                const finalVal = Math.min(99, Math.max(10, st.val));
                return (
                  <div key={st.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-300 font-medium">{st.label}</span>
                      <span className="font-bold text-white font-mono">{finalVal} / 100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${finalVal}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Point fort / Point faible */}
            <div className="space-y-2 border-t border-slate-800 pt-4 mb-6">
              <div className="text-xs">
                <span className="text-emerald-400 font-bold">Avantages Style : </span>
                <span className="text-slate-300">{selectedStyleInfo.bonuses.join(', ')}</span>
              </div>
              <div className="text-xs">
                <span className="text-red-400 font-bold">Inconvénients Style : </span>
                <span className="text-slate-300">{selectedStyleInfo.penalties.join(', ')}</span>
              </div>
              <div className="text-xs pt-1 border-t border-slate-800/60">
                <span className="text-emerald-400 font-bold">Atouts Origine : </span>
                <span className="text-slate-300">{selectedOriginInfo.bonuses.join(', ')}</span>
              </div>
              <div className="text-xs">
                <span className="text-amber-400 font-bold">Compromis Origine : </span>
                <span className="text-slate-300">{selectedOriginInfo.penalties.join(', ')}</span>
              </div>
            </div>

            {/* Bouton de validation */}
            <button
              type="submit"
              disabled={isLoading || !nom.trim()}
              className="w-full bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-base"
            >
              {isLoading ? (
                <span>Calcul des Statistiques...</span>
              ) : (
                <>
                  <span>LANCER MA CARRIÈRE KARTING</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
