
import React from 'react';
import { AppView, Badge, ScienceDiscovery } from '../types';

interface DashboardProps {
  childName: string;
  discoveries: ScienceDiscovery[];
  badges: Badge[];
  onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ childName, discoveries, badges, onNavigate }) => {
  const recentDiscovery = discoveries[0];
  const unlockedBadgesCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <section className="bg-white rounded-3xl p-6 shadow-md border-b-4 border-sky-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hi, {childName}! 👋</h2>
          <p className="text-gray-500">Ready to explore today?</p>
        </div>
        <div className="text-5xl">🎒</div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate(AppView.SNAP)}
          className="kid-card bg-orange-400 p-6 rounded-3xl text-white text-left space-y-2 shadow-lg h-full"
        >
          <span className="text-4xl block">📸</span>
          <h3 className="font-bold text-lg">Snap & Ask</h3>
          <p className="text-sm opacity-90 leading-tight">Identify bugs & plants!</p>
        </button>
        <button 
          onClick={() => onNavigate(AppView.WHY)}
          className="kid-card bg-blue-500 p-6 rounded-3xl text-white text-left space-y-2 shadow-lg h-full"
        >
          <span className="text-4xl block">💭</span>
          <h3 className="font-bold text-lg">Ask Why</h3>
          <p className="text-sm opacity-90 leading-tight">Got a big question?</p>
        </button>
      </div>

      <button 
        onClick={() => onNavigate(AppView.LIVE_CHAT)}
        className="w-full bg-gradient-to-r from-sky-600 to-blue-500 p-6 rounded-3xl text-white text-left space-y-2 shadow-lg flex items-center justify-between group overflow-hidden relative"
      >
        <div className="relative z-10">
          <h3 className="font-bold text-xl">Talk to Professor Spark 🎙️</h3>
          <p className="text-sm opacity-90">Real-time voice chat adventure!</p>
        </div>
        <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform">🎓</div>
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </button>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Recent Discoveries</h3>
          <button 
            onClick={() => onNavigate(AppView.LAB)} 
            className="text-sky-600 font-bold text-sm"
          >
            See All
          </button>
        </div>
        {discoveries.length > 0 ? (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-50 flex items-center gap-4">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center text-3xl">
              {recentDiscovery.category === 'plant' ? '🌿' : recentDiscovery.category === 'animal' ? '🦋' : '💎'}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800">{recentDiscovery.name}</h4>
              <p className="text-sm text-gray-500 truncate">{recentDiscovery.description.substring(0, 60)}...</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white/50 rounded-3xl border-2 border-dashed border-sky-200">
            <p className="text-gray-400">Your discovery log is empty. Go snap something cool!</p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">My Badges ({unlockedBadgesCount}/{badges.length})</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {badges.map(badge => (
            <div 
              key={badge.id}
              className={`flex-shrink-0 w-24 h-24 rounded-3xl flex flex-col items-center justify-center border-2 transition-all ${
                badge.unlocked ? badge.color + ' border-sky-200' : 'bg-gray-100 border-gray-200 grayscale opacity-50'
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <span className="text-[10px] font-bold text-center mt-1 uppercase leading-tight px-1">{badge.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
