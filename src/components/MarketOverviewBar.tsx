import React, { useState } from 'react';
import { ChevronDown, Search, Star, TrendingUp, TrendingDown, Clock, ShieldAlert } from 'lucide-react';
import { MarketPair } from '../types';

interface MarketOverviewBarProps {
  markets: MarketPair[];
  activePair: MarketPair;
  onSelectPair: (pair: MarketPair) => void;
  isPerp: boolean;
  priceFlash: 'buy' | 'sell' | null;
}

export const MarketOverviewBar: React.FC<MarketOverviewBarProps> = ({
  markets,
  activePair,
  onSelectPair,
  isPerp,
  priceFlash,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredMarkets = markets.filter(m => {
    const matchesSearch = m.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#090e1b] border-b border-slate-800/80 px-3 lg:px-6 py-2 flex flex-wrap items-center justify-between gap-y-2 text-xs relative z-30">
      {/* Pair Selector and Quick Switcher */}
      <div className="flex items-center gap-3">
        {/* Main Selector */}
        <div className="relative">
          <button
            id="market-pair-selector-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-slate-600 transition-colors group"
          >
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-emerald-400">
              {activePair.baseAsset[0]}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-wide">
                  {activePair.symbol}
                </span>
                {isPerp && (
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1 py-0.2 rounded font-mono font-semibold">
                    PERP
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {activePair.name}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1 group-hover:text-slate-200 transition-colors" />
          </button>

          {/* Pair Search Dropdown */}
          {dropdownOpen && (
            <div 
              id="market-pair-dropdown"
              className="absolute left-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-[#0c1220] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search token or symbol..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  autoFocus
                />
              </div>

              {/* Quick Categories */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-1 border-b border-slate-800/80 scrollbar-none text-[11px]">
                {['All', 'Layer 1', 'DeFi', 'AI & Data', 'Meme'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors ${
                      filterCategory === cat
                        ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Pair List */}
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredMarkets.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSelectPair(m);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors text-left ${
                      m.id === activePair.id ? 'bg-slate-800/90 border border-slate-700/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{m.symbol}</span>
                      <span className="text-[10px] text-slate-400">{m.name}</span>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-slate-200 font-medium">
                        ${m.price > 1 ? m.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : m.price}
                      </div>
                      <div className={`text-[10px] font-semibold ${m.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {m.change24h >= 0 ? '+' : ''}{m.change24h}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Tickers */}
        <div className="hidden xl:flex items-center gap-1.5 border-l border-slate-800 pl-3">
          {markets.slice(0, 4).map(m => (
            <button
              key={m.id}
              onClick={() => onSelectPair(m)}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                m.id === activePair.id 
                  ? 'bg-slate-800 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {m.baseAsset}
              <span className={`ml-1 text-[10px] ${m.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {m.change24h >= 0 ? '+' : ''}{m.change24h}%
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Metric Indicators */}
      <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs overflow-x-auto">
        {/* Main Price */}
        <div className={`flex flex-col transition-colors duration-300 px-2 py-0.5 rounded ${
          priceFlash === 'buy' ? 'bg-emerald-500/20' : priceFlash === 'sell' ? 'bg-rose-500/20' : ''
        }`}>
          <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">Index Price</div>
          <div className={`text-base sm:text-lg font-black tracking-tight ${
            activePair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            ${activePair.price > 1 ? activePair.price.toLocaleString(undefined, { minimumFractionDigits: activePair.precision }) : activePair.price}
          </div>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">24h Change</div>
          <div className={`font-bold flex items-center gap-0.5 ${
            activePair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {activePair.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {activePair.change24h >= 0 ? '+' : ''}{activePair.change24h}%
          </div>
        </div>

        {/* 24h High */}
        <div className="hidden sm:flex flex-col">
          <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">24h High</div>
          <div className="text-slate-200 font-semibold">
            ${activePair.high24h.toLocaleString(undefined, { minimumFractionDigits: activePair.precision })}
          </div>
        </div>

        {/* 24h Low */}
        <div className="hidden sm:flex flex-col">
          <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">24h Low</div>
          <div className="text-slate-200 font-semibold">
            ${activePair.low24h.toLocaleString(undefined, { minimumFractionDigits: activePair.precision })}
          </div>
        </div>

        {/* 24h Volume */}
        <div className="hidden md:flex flex-col">
          <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">24h Volume</div>
          <div className="text-slate-200 font-semibold">
            ${(activePair.volume24h / 1e6).toFixed(2)}M
          </div>
        </div>

        {/* Perpetuals Funding & Countdown */}
        {isPerp && (
          <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-slate-800">
            <div className="flex flex-col">
              <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">Funding / Countdown</div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span>{(activePair.fundingRate! * 100).toFixed(4)}%</span>
                <span className="text-slate-500 font-normal">in</span>
                <span className="text-slate-300">03:41:20</span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] text-slate-400 font-sans uppercase font-medium">Mark Price</div>
              <div className="text-slate-300 font-semibold">
                ${(activePair.price * 1.0002).toFixed(activePair.precision)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
