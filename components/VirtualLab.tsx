
import React from 'react';
import { Badge, ScienceDiscovery } from '../types';

interface VirtualLabProps {
  badges: Badge[];
  discoveries: ScienceDiscovery[];
  onBack: () => void;
}

const VirtualLab: React.FC<VirtualLabProps> = ({ badges, discoveries, onBack }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'Rare': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'Uncommon': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-left duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-2xl bg-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center">⬅️</button>
        <h2 className="text-2xl font-bold text-gray-800">My Science Book 📖</h2>
      </div>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-sky-700 flex items-center gap-2">
          <span>🏆</span> Medals
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex-shrink-0 w-28 p-4 rounded-3xl border-2 flex flex-col items-center text-center gap-1 transition-all ${
                badge.unlocked 
                  ? 'bg-white border-sky-200 shadow-md' 
                  : 'bg-gray-100 border-gray-200 opacity-60 grayscale'
              }`}
            >
              <span className="text-4xl mb-1">{badge.icon}</span>
              <h4 className="font-bold text-[10px] text-gray-800 uppercase leading-none">{badge.title}</h4>
              {badge.unlocked && <span className="text-[8px] font-bold text-green-500 uppercase tracking-widest mt-1">Found!</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-bold text-orange-600 flex items-center gap-2">
          <span>🔎</span> Collection
        </h3>
        {discoveries.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-orange-200 rounded-3xl p-10 text-center">
            <p className="text-gray-400 font-medium italic">Empty lab! Go snap something cool.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {discoveries.map((d) => (
              <div key={d.id} className="bg-white rounded-3xl p-4 shadow-sm border border-orange-50 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-inner">
                  {d.imageUrl ? (
                    <img src={d.imageUrl} alt={d.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🔬</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-800 truncate">{d.name}</h4>
                    <span className="text-[10px] text-sky-500 font-bold">+{d.points}</span>
                  </div>
                  <div className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border mb-1 ${getRarityColor(d.rarity)}`}>
                    {d.rarity}
                  </div>
                  <p className="text-[10px] text-gray-400">{new Date(d.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <div className="h-20"></div>
    </div>
  );
};

export default VirtualLab;
