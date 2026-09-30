import React, { useState } from 'react';
import { OrderBookData, MarketPair } from '../types';
import { Layers, ArrowDown, ArrowUp } from 'lucide-react';

interface OrderBookProps {
  orderBook: OrderBookData;
  pair: MarketPair;
  onSelectPrice: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({
  orderBook,
  pair,
  onSelectPrice,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 'bids' | 'asks'>('both');
  const [precisionMultiplier, setPrecisionMultiplier] = useState<number>(1);

  // Calculate max cumulative total for relative depth bars
  const maxBidTotal = orderBook.bids[orderBook.bids.length - 1]?.total || 1;
  const maxAskTotal = orderBook.asks[0]?.total || 1;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  const displayAsks = viewMode === 'bids' ? [] : viewMode === 'asks' ? orderBook.asks : orderBook.asks.slice(-8);
  const displayBids = viewMode === 'asks' ? [] : viewMode === 'bids' ? orderBook.bids : orderBook.bids.slice(0, 8);

  return (
    <div className="bg-[#090e1b] border border-slate-800/80 rounded-xl flex flex-col h-[500px] overflow-hidden text-xs font-mono select-none" id="order-book-panel">
      {/* Header with Title & View Mode Buttons */}
      <div className="h-10 border-b border-slate-800 px-3 flex items-center justify-between bg-[#080d19]">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-sans font-bold text-slate-200">Order Book</span>
        </div>

        {/* View Mode Filters */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('both')}
            className={`px-1.5 py-0.5 rounded text-[11px] ${
              viewMode === 'both' ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
            }`}
            title="Show Bids & Asks"
          >
            All
          </button>
          <button
            onClick={() => setViewMode('bids')}
            className={`px-1.5 py-0.5 rounded text-[11px] ${
              viewMode === 'bids' ? 'bg-emerald-950 text-emerald-400' : 'text-slate-500 hover:text-emerald-400'
            }`}
            title="Show Bids Only"
          >
            Bids
          </button>
          <button
            onClick={() => setViewMode('asks')}
            className={`px-1.5 py-0.5 rounded text-[11px] ${
              viewMode === 'asks' ? 'bg-rose-950 text-rose-400' : 'text-slate-500 hover:text-rose-400'
            }`}
            title="Show Asks Only"
          >
            Asks
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1.5 text-[10px] text-slate-500 font-sans border-b border-slate-800/50">
        <div>Price ({pair.quoteAsset})</div>
        <div className="text-right">Size ({pair.baseAsset})</div>
        <div className="text-right">Total</div>
      </div>

      {/* Main Order Book Body */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden p-1">
        {/* Asks (Sells) */}
        <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col justify-end space-y-0.5">
          {displayAsks.map((ask, idx) => {
            const depthPct = Math.min((ask.total / maxTotal) * 100, 100);
            return (
              <div
                key={`ask-${idx}-${ask.price}`}
                onClick={() => onSelectPrice(ask.price)}
                className="grid grid-cols-3 px-2 py-0.5 relative group cursor-pointer hover:bg-slate-800/40 rounded transition-colors text-[11px]"
              >
                {/* Visual Depth Bar */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none transition-all duration-200"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="text-rose-400 font-medium z-10">
                  {ask.price.toFixed(pair.precision)}
                </span>
                <span className="text-right text-slate-300 z-10 font-normal">
                  {ask.amount.toFixed(3)}
                </span>
                <span className="text-right text-slate-500 z-10">
                  {ask.total.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Middle Spread & Current Price Bar */}
        <div className="py-2 px-3 my-1 bg-[#0c1322] border-y border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold flex items-center gap-1 ${
              pair.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {pair.change24h >= 0 ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />}
              ${pair.price.toFixed(pair.precision)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Spread: <span className="text-slate-300">${orderBook.spread.toFixed(pair.precision)}</span> ({orderBook.spreadPercentage}%)
          </div>
        </div>

        {/* Bids (Buys) */}
        <div className="flex-1 overflow-y-auto scrollbar-none space-y-0.5">
          {displayBids.map((bid, idx) => {
            const depthPct = Math.min((bid.total / maxTotal) * 100, 100);
            return (
              <div
                key={`bid-${idx}-${bid.price}`}
                onClick={() => onSelectPrice(bid.price)}
                className="grid grid-cols-3 px-2 py-0.5 relative group cursor-pointer hover:bg-slate-800/40 rounded transition-colors text-[11px]"
              >
                {/* Visual Depth Bar */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none transition-all duration-200"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="text-emerald-400 font-medium z-10">
                  {bid.price.toFixed(pair.precision)}
                </span>
                <span className="text-right text-slate-300 z-10 font-normal">
                  {bid.amount.toFixed(3)}
                </span>
                <span className="text-right text-slate-500 z-10">
                  {bid.total.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
