import React, { useState } from 'react';
import { UserWallet, MarketPair, Position } from '../types';
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, TrendingUp, ShieldCheck, PieChart } from 'lucide-react';

interface PortfolioViewProps {
  wallet: UserWallet;
  positions: Position[];
  markets: MarketPair[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSwap: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  wallet,
  positions,
  markets,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'balances' | 'positions' | 'history'>('balances');

  // Compute total position value and PnL
  const totalPositionMargin = positions.reduce((acc, p) => acc + p.margin, 0);
  const totalPositionPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  return (
    <div className="p-3 lg:p-6 max-w-7xl mx-auto space-y-6 select-none" id="portfolio-view">
      {/* Portfolio Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1424] to-[#090e1b] border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
            <span>Estimated Total Net Worth</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
              +4.82% All-Time
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            ${wallet.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+$1,420.50 (Today)</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deposit
            </button>
            <button
              onClick={onOpenWithdraw}
              className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1 border border-slate-700"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw
            </button>
            <button
              onClick={onOpenSwap}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 transition-all border border-slate-700"
              title="Instant Swap"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spot Account */}
        <div className="p-5 rounded-2xl bg-[#090e1b] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">Spot Wallet Balance</div>
            <div className="text-xl font-bold text-slate-100 font-mono">
              ${(wallet.totalUsd - totalPositionMargin).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Available to trade: <strong className="text-slate-200 font-mono">${wallet.availableUsd.toLocaleString()}</strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/80">
            Unencumbered capital in high-security custodial vault
          </div>
        </div>

        {/* Futures Margin & Unrealized PnL */}
        <div className="p-5 rounded-2xl bg-[#090e1b] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-400 mb-1">Futures Margin & Unrealized PnL</div>
            <div className="text-xl font-bold text-cyan-400 font-mono">
              ${totalPositionMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-mono mt-1">
              Unrealized PnL: <strong className={totalPositionPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {totalPositionPnl >= 0 ? '+' : ''}${totalPositionPnl.toFixed(2)}
              </strong>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-800/80">
            {positions.length} active leveraged positions running
          </div>
        </div>
      </div>

      {/* Asset Balances Table */}
      <div className="bg-[#090e1b] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-slate-200">Asset Holdings & Allocation</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time Valuation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[11px] text-slate-500 border-b border-slate-800/80 bg-[#080d19] font-sans uppercase">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Total Balance</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">In Orders / Margin</th>
                <th className="py-3 px-4">USD Valuation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {Object.entries(wallet.balances).map(([asset, data]) => {
                const total = data.free + data.locked;
                const pct = ((data.usdValue / wallet.totalUsd) * 100).toFixed(1);
                return (
                  <tr key={asset} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                          {asset[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 font-sans text-sm">{asset}</div>
                          <div className="text-[10px] text-slate-400">{pct}% of Portfolio</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-200">
                      {total} {asset}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {data.free} {asset}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {data.locked} {asset}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                      ${data.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={onOpenDeposit}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={onOpenSwap}
                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-sans transition-colors border border-emerald-500/20"
                        >
                          Swap
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
