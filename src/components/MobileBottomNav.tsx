import React from 'react';
import { 
  Home,
  TrendingUp, 
  ArrowLeftRight, 
  Wallet, 
  Layers, 
  Terminal, 
  User,
  Search,
  FileText
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSwap: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenSwap,
}) => {
  return (
    <div 
      id="mobile-bottom-navbar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090e1b]/95 backdrop-blur-lg border-t border-slate-800/90 px-1 py-1 flex items-center justify-around select-none shadow-[0_-8px_20px_rgba(0,0,0,0.45)] pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      {/* 0. Home */}
      <button
        onClick={() => {
          setActiveTab('home');
          window.location.hash = 'homepage';
        }}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
          activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-home"
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-semibold leading-tight">Home</span>
      </button>

      {/* 0.1 User Login */}
      <button
        onClick={() => {
          setActiveTab('login');
          window.location.hash = 'loginpage';
        }}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
          activeTab === 'login' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-login"
      >
        <User className="w-4 h-4 mb-0.5" />
        <span className="text-[9px] font-semibold leading-tight">Login</span>
      </button>

      {/* 1. Trade (Spot) */}
      <button
        onClick={() => {
          setActiveTab('trade');
          window.location.hash = 'trade';
        }}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
          activeTab === 'trade' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-trade"
      >
        <TrendingUp className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold leading-tight">Spot</span>
      </button>

      {/* 2. Futures (Perps) */}
      <button
        onClick={() => setActiveTab('perps')}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors relative ${
          activeTab === 'perps' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-futures"
      >
        <Layers className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold leading-tight">Futures</span>
        <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
      </button>

      {/* 3. Client Dashboard ($48k) */}
      <button
        onClick={() => setActiveTab('client-dashboard')}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-all ${
          activeTab === 'client-dashboard' 
            ? 'text-emerald-300 font-bold' 
            : 'text-slate-300 hover:text-white'
        }`}
        id="mobile-nav-client"
      >
        <div className={`p-1 rounded-lg ${activeTab === 'client-dashboard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/80 text-emerald-400'}`}>
          <User className="w-4 h-4" />
        </div>
        <span className="text-[9px] font-mono leading-tight text-emerald-400 mt-0.5">$48k</span>
      </button>

      {/* 4. Instant Swap */}
      <button
        onClick={onOpenSwap}
        className="touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
        id="mobile-nav-swap"
      >
        <ArrowLeftRight className="w-5 h-5 mb-0.5 text-amber-400" />
        <span className="text-[10px] font-semibold leading-tight">Swap</span>
      </button>

      {/* 5. Requests & Refunds */}
      <button
        onClick={() => setActiveTab('requests')}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
          activeTab === 'requests' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-requests"
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold leading-tight">Requests</span>
      </button>

      {/* 6. Portfolio */}
      <button
        onClick={() => setActiveTab('portfolio')}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
          activeTab === 'portfolio' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-portfolio"
      >
        <Wallet className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold leading-tight">Portfolio</span>
      </button>

      {/* 6. API / Database Console */}
      <button
        onClick={() => setActiveTab('api-docs')}
        className={`touch-target flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
          activeTab === 'api-docs' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
        }`}
        id="mobile-nav-api"
      >
        <Terminal className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-semibold leading-tight">API/DB</span>
      </button>
    </div>
  );
};
