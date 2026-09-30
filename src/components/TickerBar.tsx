import React from 'react';
import { MarketPair } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerBarProps {
  markets: MarketPair[];
  onSelectPair: (pair: MarketPair) => void;
  activePair: MarketPair;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  markets,
  onSelectPair,
  activePair,
}) => {
  return (
    <div className="bg-[#060a13] border-b border-slate-800/60 h-8 flex items-center px-3 overflow-x-auto scrollbar-none text-[11px] font-mono select-none">
      <div className="flex items-center gap-5 whitespace-nowrap">
        {markets.map(m => {
          const isPositive = m.change24h >= 0;
          return (
            <div
              key={m.id}
              onClick={() => onSelectPair(m)}
              className={`flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-800/50 transition-colors ${
                m.id === activePair.id ? 'bg-slate-800/80 font-bold' : ''
              }`}
            >
              <span className="text-slate-300 font-semibold">{m.symbol}</span>
              <span className="text-slate-100">${m.price > 1 ? m.price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : m.price}</span>
              <span className={`flex items-center text-[10px] ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? '+' : ''}{m.change24h}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
