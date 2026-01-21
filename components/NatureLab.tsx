
import React, { useState, useEffect } from 'react';

interface NatureLabProps {
  onBack: () => void;
}

const NatureLab: React.FC<NatureLabProps> = ({ onBack }) => {
  const [sun, setSun] = useState(0);
  const [water, setWater] = useState(0);
  const [sugar, setSugar] = useState(0);
  const [phase, setPhase] = useState<'SEED' | 'SPROUT' | 'FLOWER'>('SEED');

  useEffect(() => {
    if (sun > 50 && water > 50) {
      const growth = Math.min(100, sugar + 0.5);
      setSugar(growth);
      if (growth > 80) setPhase('FLOWER');
      else if (growth > 30) setPhase('SPROUT');
    } else if (sugar > 0) {
      setSugar(s => Math.max(0, s - 0.1));
    }
    
    // Decay values slowly
    const timer = setInterval(() => {
      setSun(s => Math.max(0, s - 2));
      setWater(w => Math.max(0, w - 1.5));
    }, 1000);
    return () => clearInterval(timer);
  }, [sun, water, sugar]);

  return (
    <div className="p-6 space-y-6 h-full flex flex-col bg-sky-50">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-2xl bg-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center">⬅️</button>
        <h2 className="text-2xl font-bold text-gray-800">Photosynthesis Lab ☀️</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg border-b-4 border-sky-100 relative overflow-hidden flex-1 flex flex-col">
        <div className="absolute top-4 right-4 text-center">
          <div className="text-xs font-bold text-gray-400 uppercase">Energy Meter</div>
          <div className="w-32 h-4 bg-gray-100 rounded-full mt-1 border border-gray-200 overflow-hidden">
            <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: `${sugar}%` }}></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="text-8xl mb-4 transition-transform duration-1000" style={{ transform: `scale(${1 + sugar/100})` }}>
            {phase === 'SEED' ? '🌰' : phase === 'SPROUT' ? '🌱' : '🌸'}
          </div>
          <p className="font-bold text-sky-700 capitalize">{phase}</p>
          
          {sun > 50 && water > 50 && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="animate-ping absolute w-32 h-32 rounded-full bg-yellow-400/20"></div>
              <div className="animate-pulse text-2xl absolute top-1/4">✨ Making Sugar! ✨</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button 
            onClick={() => setSun(s => Math.min(100, s + 20))}
            className="flex flex-col items-center bg-orange-50 p-4 rounded-2xl border-2 border-orange-100 active:scale-95 transition-all"
          >
            <span className="text-3xl mb-1">☀️</span>
            <span className="text-xs font-bold text-orange-600">ADD SUNLIGHT</span>
            <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${sun}%` }}></div>
            </div>
          </button>
          <button 
            onClick={() => setWater(w => Math.min(100, w + 20))}
            className="flex flex-col items-center bg-blue-50 p-4 rounded-2xl border-2 border-blue-100 active:scale-95 transition-all"
          >
            <span className="text-3xl mb-1">💧</span>
            <span className="text-xs font-bold text-blue-600">ADD WATER</span>
            <div className="w-full h-1 bg-gray-200 rounded-full mt-2">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${water}%` }}></div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-sky-100 p-4 rounded-2xl border border-sky-200">
        <p className="text-xs text-sky-800 font-medium">
          <strong>Mission:</strong> Balance sunlight and water to help the seed grow! Plants use CO2, Water, and Sun to make sugar (energy) through <strong>Photosynthesis</strong>.
        </p>
      </div>
    </div>
  );
};

export default NatureLab;
