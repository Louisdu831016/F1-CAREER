import React from 'react';
import { ChoiceImpactFeedback, Specialite } from '../types';
import { 
  Zap, 
  Trophy, 
  TrendingUp, 
  ShieldAlert, 
  DollarSign, 
  Award, 
  Radio, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Gauge
} from 'lucide-react';

interface ChoiceImpactModalProps {
  impact: ChoiceImpactFeedback;
  onClose: () => void;
}

export const ChoiceImpactModal: React.FC<ChoiceImpactModalProps> = ({ impact, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-700 p-6 text-white relative">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/30 w-fit px-3 py-1 rounded-full border border-white/20 mb-2">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Impact Immédiat du Choix</span>
          </div>

          <h2 className="text-2xl font-black">{impact.titre}</h2>
          <p className="text-sm text-red-100/90 mt-1">{impact.descriptionChoix}</p>
        </div>

        {/* Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* 1. Impact sur la Course */}
          {impact.impactCourseLogs && impact.impactCourseLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Conséquences Directes en Course
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {impact.impactCourseLogs.map((log, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{log}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 2. Évolution du Pilote & Stats */}
          {impact.statChanges && impact.statChanges.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Évolution des Caractéristiques du Pilote
              </h3>
              <div className="flex flex-wrap gap-2">
                {impact.statChanges.map((change, idx) => (
                  <span 
                    key={idx}
                    className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold px-3 py-1 rounded-lg"
                  >
                    {change}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 3. Spécialité Débloquée (Si applicable) */}
          {impact.specialiteDebloquee && (
            <div className="bg-gradient-to-r from-amber-950/90 to-red-950/90 border-2 border-amber-500/80 p-5 rounded-2xl shadow-xl flex items-center gap-4">
              <span className="text-4xl p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                {impact.specialiteDebloquee.icon}
              </span>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  🎉 Nouvelle Spécialité Débloquée !
                </span>
                <h4 className="text-lg font-black text-white">{impact.specialiteDebloquee.nom}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{impact.specialiteDebloquee.description}</p>
              </div>
            </div>
          )}

          {/* 4. Impact Tensions & Relations */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Tensions & Relations dans le Paddock
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              
              {/* Confiance Directeur */}
              {impact.relationshipsChanges.confianceDirecteur !== undefined && (
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Confiance Écurie</span>
                  <span className={`font-mono font-bold text-sm ${
                    impact.relationshipsChanges.confianceDirecteur >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {impact.relationshipsChanges.confianceDirecteur >= 0 ? '+' : ''}
                    {impact.relationshipsChanges.confianceDirecteur}%
                  </span>
                </div>
              )}

              {/* Relation Coéquipier */}
              {impact.relationshipsChanges.relationCoequipier !== undefined && (
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Relation Coéquipier</span>
                  <span className={`font-mono font-bold text-sm ${
                    impact.relationshipsChanges.relationCoequipier >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {impact.relationshipsChanges.relationCoequipier >= 0 ? '+' : ''}
                    {impact.relationshipsChanges.relationCoequipier}%
                  </span>
                </div>
              )}

              {/* Tension Rival */}
              {impact.relationshipsChanges.tensionRival !== undefined && (
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Tension avec Rival</span>
                  <span className={`font-mono font-bold text-sm ${
                    impact.relationshipsChanges.tensionRival > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {impact.relationshipsChanges.tensionRival >= 0 ? '+' : ''}
                    {impact.relationshipsChanges.tensionRival}%
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* 5. Impact Financier */}
          {impact.gainFinancier !== 0 && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase">Conséquence Financière :</span>
              <span className={`font-mono font-black text-base ${
                impact.gainFinancier > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {impact.gainFinancier > 0 ? '+' : ''}{impact.gainFinancier.toLocaleString()} €
              </span>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 text-sm transition-all"
          >
            <span>POURSUIVRE LA COURSE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
