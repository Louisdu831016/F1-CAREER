import React, { useEffect, useState } from 'react';
import { Play, RotateCw } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
}

export function TitleScreen({ onStartGame }: TitleScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    // Déclencher les animations au montage
    setIsAnimating(true);
    const timer = setTimeout(() => setShowCTA(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 overflow-hidden flex flex-col items-center justify-center relative">
      {/* Fond avec grille animée */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern" style={{
          backgroundImage: 'linear-gradient(0deg, rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      {/* Fond avec dégradé radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/20 rounded-full blur-3xl opacity-30 animate-pulse" />

      {/* Contenu principal */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Logo/Titre avec animation */}
        <div className={`transition-all duration-1000 transform ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="mb-4 inline-block">
            <div className="text-7xl font-black">
              🏁
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-xl">
            F1 CAREER
          </h1>

          <p className="text-lg md:text-xl text-red-300 font-bold tracking-widest uppercase mb-8 drop-shadow-lg">
            Simulateur de Carrière
          </p>

          <div className="h-1 w-20 bg-gradient-to-r from-red-500 to-orange-400 mx-auto mb-8 rounded-full shadow-lg" />

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-12">
            Parcourez les catégories du sport automobile, du Karting à la Formule 1.
            Bâtissez votre légende, une course à la fois.
          </p>
        </div>

        {/* Boutons CTA avec animation */}
        <div className={`transition-all duration-1000 delay-500 transform ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={onStartGame}
            className="group mb-6 px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 flex items-center gap-3 mx-auto"
          >
            <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            <span>COMMENCER</span>
          </button>

          {/* Attributions */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>Powered by Google Gemini & React</p>
            <p>© 2026 F1 CAREER — Simulateur de Carrière Sport Automobile</p>
          </div>
        </div>
      </div>

      {/* Décoration en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-lg" />

      <style>{`
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
