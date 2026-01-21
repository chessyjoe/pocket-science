
import React, { useState, useEffect } from 'react';
import { AppView, Badge, ScienceDiscovery } from './types';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import SnapAndAsk from './components/SnapAndAsk';
import WhyEngine from './components/WhyEngine';
import StoryMode from './components/StoryMode';
import VirtualLab from './components/VirtualLab';
import NatureLab from './components/NatureLab';
import LiveScienceChat from './components/LiveScienceChat';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [discoveries, setDiscoveries] = useState<ScienceDiscovery[]>([]);
  const [childName, setChildName] = useState<string>("Scientist");
  
  // Billing/API Key State
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [pendingView, setPendingView] = useState<AppView | null>(null);

  const [badges, setBadges] = useState<Badge[]>([
    { id: '1', title: 'Backyard Biologist', description: 'Identify 3 plants or bugs', icon: '🌿', color: 'bg-green-100', unlocked: false },
    { id: '2', title: 'Curiosity Cat', description: 'Ask 5 "Why" questions', icon: '🐱', color: 'bg-yellow-100', unlocked: false },
    { id: '3', title: 'Story Explorer', description: 'Generate your first science story', icon: '📖', color: 'bg-purple-100', unlocked: false },
    { id: '4', title: 'Geologist', description: 'Discover a rock or mineral', icon: '💎', color: 'bg-blue-100', unlocked: false },
  ]);

  useEffect(() => {
    setBadges(prev => prev.map(badge => {
      if (badge.id === '1' && discoveries.length >= 3) return { ...badge, unlocked: true };
      if (badge.id === '4' && discoveries.some(d => d.category === 'rock')) return { ...badge, unlocked: true };
      return badge;
    }));
  }, [discoveries]);

  const totalPoints = discoveries.reduce((sum, d) => sum + d.points, 0);

  const handleNavigation = async (view: AppView) => {
    // These views use paid models (Gemini 3 Pro / Live API)
    const paidViews = [AppView.SNAP, AppView.LIVE_CHAT];
    
    if (paidViews.includes(view)) {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setPendingView(view);
          setShowKeyModal(true);
          return;
        }
      }
    }
    
    setCurrentView(view);
  };

  const handleOpenApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race conditions as per instructions
      setShowKeyModal(false);
      if (pendingView) {
        setCurrentView(pendingView);
        setPendingView(null);
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard 
          childName={childName} 
          discoveries={discoveries} 
          badges={badges} 
          onNavigate={handleNavigation} 
        />;
      case AppView.SNAP:
        return <SnapAndAsk 
          onDiscovery={(d) => setDiscoveries([d, ...discoveries])} 
          onBack={() => handleNavigation(AppView.DASHBOARD)} 
        />;
      case AppView.WHY:
        return <WhyEngine 
          onQuestionAsked={() => {}}
          onBack={() => handleNavigation(AppView.DASHBOARD)} 
        />;
      case AppView.STORIES:
        return <StoryMode 
          childName={childName}
          onStoryGenerated={() => {
             setBadges(prev => prev.map(b => b.id === '3' ? { ...b, unlocked: true } : b));
          }}
          onBack={() => handleNavigation(AppView.DASHBOARD)} 
        />;
      case AppView.LAB:
        return <VirtualLab 
          badges={badges} 
          discoveries={discoveries}
          onBack={() => handleNavigation(AppView.DASHBOARD)} 
        />;
      case AppView.NATURE_LAB:
        return <NatureLab onBack={() => handleNavigation(AppView.DASHBOARD)} />;
      case AppView.LIVE_CHAT:
        return <LiveScienceChat onBack={() => handleNavigation(AppView.DASHBOARD)} />;
      default:
        return <Dashboard childName={childName} discoveries={discoveries} badges={badges} onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-sky-50 shadow-xl overflow-hidden relative">
      <header className="bg-white border-b-4 border-sky-200 p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2" onClick={() => handleNavigation(AppView.DASHBOARD)}>
          <div className="text-3xl">🔬</div>
          <h1 className="text-2xl font-bold text-sky-600 tracking-tight cursor-pointer">ScienceBox</h1>
        </div>
        <div className="flex items-center gap-2 bg-sky-100 px-3 py-1 rounded-full border-2 border-sky-200">
          <span className="text-xl">🌟</span>
          <span className="font-bold text-sky-700">{totalPoints} pts</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {renderView()}
      </main>

      <Navigation currentView={currentView} onNavigate={handleNavigation} />

      {/* API Key Modal Overlay */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm animate-in zoom-in-95 duration-200 border-4 border-sky-100 relative">
            <button 
              onClick={() => { setShowKeyModal(false); setPendingView(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"
            >
              ✕
            </button>
            <div className="text-6xl mb-6 animate-bounce">🔑</div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Super Science Mode!</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To use the powerful AI for <strong>{pendingView === AppView.SNAP ? 'Identifying Photos' : 'Voice Chat'}</strong>, we need to unlock the Paid features.
            </p>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-sky-500 underline mb-6 block font-bold hover:text-sky-600">
              Ask a parent about Billing
            </a>
            <button 
              onClick={handleOpenApiKey}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Now</span>
              <span className="text-xl">🔓</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
