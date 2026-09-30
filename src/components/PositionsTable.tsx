import React, { useState } from 'react';
import { Position, UserOrder, UserWallet } from '../types';
import { CheckCircle2, XCircle, Trash2, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
  orders: UserOrder[];
  wallet: UserWallet;
  onClosePosition: (id: string) => void;
  onCancelOrder: (id: string) => void;
  onCancelAllOrders: () => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  orders,
  wallet,
  onClosePosition,
  onCancelOrder,
  onCancelAllOrders,
}) => {
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history' | 'assets'>('positions');

  const openOrders = orders.filter(o => o.status === 'open');
  const pastOrders = orders.filter(o => o.status !== 'open');

  return (
    <div className="bg-[#090e1b] border border-slate-800/80 rounded-xl flex flex-col min-h-[260px] overflow-hidden select-none" id="positions-table-panel">
      {/* Table Navigation Header */}
      <div className="min-h-10 border-b border-slate-800 px-2 sm:px-4 py-1 flex flex-wrap items-center justify-between gap-1 bg-[#080d19] text-xs">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[32px] rounded font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Positions</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
              {positions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[32px] rounded font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300 font-mono">
              {openOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[32px] rounded font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            History
          </button>

          <button
            onClick={() => setActiveTab('assets')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[32px] rounded font-semibold transition-colors ${
              activeTab === 'assets'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Assets
          </button>
        </div>

        {/* Right Action */}
        {activeTab === 'orders' && openOrders.length > 0 && (
          <button
            onClick={onCancelAllOrders}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium px-2.5 py-1 min-h-[32px] rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Cancel All ({openOrders.length})</span>
          </button>
        )}
      </div>

      {/* Content Panels */}
      <div className="flex-1 p-2">
        {/* 1. POSITIONS TAB */}
        {activeTab === 'positions' && (
          positions.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <Layers className="w-6 h-6 text-slate-600" />
              <span>No open positions currently</span>
              <span className="text-[11px] text-slate-600">Open a Long or Short order from the order panel</span>
            </div>
          ) : (
            <div>
              {/* Mobile Card Layout (< md) */}
              <div className="md:hidden space-y-2.5">
                {positions.map(pos => {
                  const isProfit = pos.pnl >= 0;
                  return (
                    <div key={pos.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${pos.side === 'long' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span className="font-bold text-white text-sm">{pos.pair}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                            pos.side === 'long' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {pos.side.toUpperCase()} {pos.leverage}x
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-bold text-xs ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono py-1 border-t border-b border-slate-800/60 text-slate-300">
                        <div>
                          <span className="text-slate-500 text-[10px] block">Size</span>
                          <span>{pos.size}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Entry Price</span>
                          <span>${pos.entryPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Mark Price</span>
                          <span>${pos.markPrice.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">Liq. Price</span>
                          <span className="text-rose-400 font-semibold">${pos.liquidationPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onClosePosition(pos.id)}
                        className="touch-target w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 border border-slate-700 text-xs font-semibold transition-all text-center"
                      >
                        Market Close Position
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table Layout (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-500 border-b border-slate-800/80 uppercase font-sans">
                      <th className="py-2 px-3">Contract</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3">Entry Price</th>
                      <th className="py-2 px-3">Mark Price</th>
                      <th className="py-2 px-3">Liq. Price</th>
                      <th className="py-2 px-3">Margin</th>
                      <th className="py-2 px-3 text-right">PnL (ROE %)</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {positions.map(pos => {
                      const isProfit = pos.pnl >= 0;
                      return (
                        <tr key={pos.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${pos.side === 'long' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                              <span className="font-bold text-slate-100">{pos.pair}</span>
                              <span className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                                pos.side === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {pos.side.toUpperCase()} {pos.leverage}x
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-200">{pos.size}</td>
                          <td className="py-2.5 px-3 text-slate-300">${pos.entryPrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-slate-300">${pos.markPrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-rose-400 font-semibold">${pos.liquidationPrice.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-slate-400">${pos.margin.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold">
                            <div className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                              {isProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%)
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => onClosePosition(pos.id)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-sans font-medium transition-colors"
                            >
                              Market Close
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* 2. OPEN ORDERS TAB */}
        {activeTab === 'orders' && (
          openOrders.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
              <CheckCircle2 className="w-6 h-6 text-slate-600" />
              <span>No active open orders</span>
            </div>
          ) : (
            <div>
              {/* Mobile Card View (< md) */}
              <div className="md:hidden space-y-2">
                {openOrders.map(order => (
                  <div key={order.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{order.pair}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          order.side === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {order.side} {order.type}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono">
                        ${order.price.toLocaleString()} • {order.amount}
                      </div>
                      <div className="text-slate-500 text-[10px] font-mono">{order.createdAt}</div>
                    </div>
                    <button
                      onClick={() => onCancelOrder(order.id)}
                      className="touch-target px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-semibold border border-rose-500/30 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-500 border-b border-slate-800/80 uppercase font-sans">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Pair</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Side</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {openOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{order.createdAt}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">{order.pair}</td>
                        <td className="py-2.5 px-3 uppercase text-slate-300 text-[11px]">{order.type}</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold uppercase ${order.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {order.side}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">${order.price.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-slate-200">{order.amount}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onCancelOrder(order.id)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* 3. ORDER HISTORY TAB */}
        {activeTab === 'history' && (
          pastOrders.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-xs">
              No previous order history
            </div>
          ) : (
            <div>
              {/* Mobile Card View (< md) */}
              <div className="md:hidden space-y-2">
                {pastOrders.map(order => (
                  <div key={order.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{order.pair}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          order.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {order.side}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        ${order.price.toLocaleString()} • {order.amount}
                      </div>
                      <div className="text-slate-500 text-[10px]">{order.createdAt}</div>
                    </div>
                    <div>
                      <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-500 border-b border-slate-800/80 uppercase font-sans">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Pair</th>
                      <th className="py-2 px-3">Side</th>
                      <th className="py-2 px-3">Executed Price</th>
                      <th className="py-2 px-3">Executed Amount</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {pastOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{order.createdAt}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-100">{order.pair}</td>
                        <td className={`py-2.5 px-3 uppercase font-bold ${order.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {order.side}
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">${order.price.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-slate-200">{order.amount}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold uppercase">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* 4. ASSETS ALLOCATION TAB */}
        {activeTab === 'assets' && (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-2.5 p-1 font-mono">
            {Object.entries(wallet.balances).map(([asset, data]) => (
              <div key={asset} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="text-slate-400 text-[11px] font-sans font-medium">{asset} Holding</div>
                <div className="text-sm sm:text-base font-bold text-slate-100 mt-1">{data.free} {asset}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">${data.usdValue.toLocaleString()} USD</div>
                <div className="text-[10px] text-slate-500 mt-1">Locked: {data.locked} {asset}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
