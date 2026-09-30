import React from 'react';
import { Trade, MarketPair } from '../types';
import { Activity } from 'lucide-react';

interface RecentTradesProps {
  trades: Trade[];
  pair: MarketPair;
}

export const RecentTrades: React.FC<RecentTradesProps> = ({ trades, pair }) => {
  return (
    <div className="bg-[#090e1b] border border-slate-800/80 rounded-xl flex flex-col h-[500px] overflow-hidden text-xs font-mono select-none" id="recent-trades-panel">
      {/* Header */}
      <div className="h-10 border-b border-slate-800 px-3 flex items-center justify-between bg-[#080d19]">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-sans font-bold text-slate-200">Market Trades</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Feed</span>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-slate-500 font-sans border-b border-slate-800/50">
        <div>Price ({pair.quoteAsset})</div>
        <div className="text-right">Size ({pair.baseAsset})</div>
        <div className="text-right">Time</div>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto space-y-0.5 p-1 scrollbar-none">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 px-2 py-1 rounded hover:bg-slate-800/40 transition-colors text-[11px]"
          >
            <span className={`font-semibold ${trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trade.price.toFixed(pair.precision)}
            </span>
            <span className="text-right text-slate-200 font-medium">
              {trade.amount.toFixed(3)}
            </span>
            <span className="text-right text-slate-500 text-[10px]">
              {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
