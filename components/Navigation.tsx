
import React from 'react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onNavigate }) => {
  const items = [
    { view: AppView.DASHBOARD, label: 'Home', icon: '🏠' },
    { view: AppView.SNAP, label: 'Snap', icon: '📸' },
    { view: AppView.WHY, label: 'Ask', icon: '❓' },
    { view: AppView.NATURE_LAB, label: 'Lab', icon: '☀️' },
    { view: AppView.LAB, label: 'Book', icon: '📖' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t-4 border-sky-200 h-20 flex justify-around items-center px-2 z-50">
      {items.map((item) => (
        <button
          key={item.view}
          onClick={() => onNavigate(item.view)}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === item.view ? 'text-sky-600 scale-110' : 'text-gray-400'
          }`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase">{item.label}</span>
          {currentView === item.view && <div className="w-1.5 h-1.5 bg-sky-600 rounded-full mt-0.5"></div>}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
