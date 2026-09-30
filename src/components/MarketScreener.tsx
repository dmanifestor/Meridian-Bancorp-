import React, { useState } from 'react';
import { MarketPair } from '../types';
import { Search, TrendingUp, TrendingDown, ArrowUpRight, Flame, BarChart2 } from 'lucide-react';

interface MarketScreenerProps {
  markets: MarketPair[];
  onSelectPair: (pair: MarketPair, isPerp?: boolean) => void;
}

export const MarketScreener: React.FC<MarketScreenerProps> = ({
  markets,
  onSelectPair,
}) => {
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [sortField, setSortField] = useState<'price' | 'change24h' | 'volume24h'>('volume24h');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const categories = ['All', 'Layer 1', 'DeFi', 'AI & Data', 'Meme', 'Infra'];

  const filtered = markets
    .filter(m => {
      const matchesCat = category === 'All' || m.category === category;
      const matchesSearch = m.symbol.toLowerCase().includes(search.toLowerCase()) || 
                            m.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });

  // Top gainer & Highest volume
  const topGainer = [...markets].sort((a, b) => b.change24h - a.change24h)[0];
  const topVolume = [...markets].sort((a, b) => b.volume24h - a.volume24h)[0];

  return (
    <div className="p-3 lg:p-6 max-w-7xl mx-auto space-y-6 select-none" id="market-screener-view">
      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Top Gainer */}
        <div className="p-4 rounded-xl bg-[#090e1b] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Top 24h Gainer</span>
            </div>
            <div className="text-base font-bold text-slate-100">{topGainer.name} ({topGainer.baseAsset})</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">${topGainer.price.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-emerald-400 font-mono px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
              +{topGainer.change24h}%
            </span>
          </div>
        </div>

        {/* Highest Volume */}
        <div className="p-4 rounded-xl bg-[#090e1b] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Highest 24h Volume</span>
            </div>
            <div className="text-base font-bold text-slate-100">{topVolume.name}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">${(topVolume.volume24h / 1e9).toFixed(2)}B traded</div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-cyan-400 font-mono px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
              ${topVolume.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="p-4 rounded-xl bg-[#090e1b] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium mb-1">Market Sentiment</div>
            <div className="text-base font-bold text-emerald-400">Greed (74 / 100)</div>
            <div className="text-xs text-slate-500 mt-0.5">Bullish momentum across Layer 1s</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-400 text-xs font-mono">
            74%
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#090e1b] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-semibold whitespace-nowrap ${
                category === cat
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search all markets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Main Markets Table */}
      <div className="bg-[#090e1b] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[11px] text-slate-400 border-b border-slate-800 bg-[#080d19] font-sans">
                <th className="py-3 px-4">Market Asset</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  onClick={() => {
                    setSortField('price');
                    setSortAsc(sortField === 'price' ? !sortAsc : false);
                  }}
                >
                  Price
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  onClick={() => {
                    setSortField('change24h');
                    setSortAsc(sortField === 'change24h' ? !sortAsc : false);
                  }}
                >
                  24h Change
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-slate-200"
                  onClick={() => {
                    setSortField('volume24h');
                    setSortAsc(sortField === 'volume24h' ? !sortAsc : false);
                  }}
                >
                  24h Volume
                </th>
                <th className="py-3 px-4 hidden md:table-cell">7d Trend</th>
                <th className="py-3 px-4 text-right">Quick Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(m => {
                const isPositive = m.change24h >= 0;
                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                          {m.baseAsset[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 font-sans text-sm">{m.name}</div>
                          <div className="text-[11px] text-slate-400">{m.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200 text-sm">
                      ${m.price > 1 ? m.price.toLocaleString(undefined, { minimumFractionDigits: m.precision }) : m.price}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}{m.change24h}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      ${(m.volume24h / 1e6).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {/* Mini Sparkline SVG */}
                      <div className="w-24 h-6">
                        <svg className="w-full h-full" viewBox="0 0 100 24">
                          <polyline
                            fill="none"
                            stroke={isPositive ? '#10b981' : '#f43f5e'}
                            strokeWidth="2"
                            points={m.sparkline.map((val, idx) => {
                              const min = Math.min(...m.sparkline);
                              const max = Math.max(...m.sparkline);
                              const range = max - min || 1;
                              const x = (idx / (m.sparkline.length - 1)) * 100;
                              const y = 24 - ((val - min) / range) * 20 - 2;
                              return `${x},${y}`;
                            }).join(' ')}
                          />
                        </svg>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectPair(m, false)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 font-sans font-semibold text-slate-200 text-xs transition-colors"
                        >
                          Spot
                        </button>
                        <button
                          onClick={() => onSelectPair(m, true)}
                          className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-500 hover:text-slate-950 font-sans font-semibold text-cyan-300 text-xs border border-cyan-800/80 transition-colors"
                        >
                          Perp
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
