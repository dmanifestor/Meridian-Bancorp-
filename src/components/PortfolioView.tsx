import React, { useState } from 'react';
import { UserWallet, MarketPair, Position, UserAccount } from '../types';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  TrendingUp, 
  ShieldCheck, 
  PieChart,
  Landmark,
  Layers,
  Sparkles
} from 'lucide-react';
import { PortfolioPerformanceDashboard } from './PortfolioPerformanceDashboard';

interface PortfolioViewProps {
  wallet: UserWallet;
  positions: Position[];
  markets: MarketPair[];
  currentUser?: UserAccount | null;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSwap: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  wallet,
  positions,
  markets,
  currentUser,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'balances' | 'positions' | 'history'>('balances');

  // Compute total position value and PnL
  const totalPositionMargin = positions.reduce((acc, p) => acc + p.margin, 0);
  const totalPositionPnl = positions.reduce((acc, p) => acc + p.pnl, 0);

  return (
    <div className="p-3 lg:p-6 max-w-7xl mx-auto space-y-6 select-none text-white" id="portfolio-view">
      {/* 1. Interactive D3 Visual Performance Dashboard */}
      <PortfolioPerformanceDashboard 
        wallet={wallet} 
        currentUser={currentUser} 
      />

      {/* 2. Portfolio Structure & Allocation Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth & Quick Execution Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e214d] via-[#09132e] to-[#050c1e] border-2 border-yellow-400/50 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center text-xs text-yellow-300 font-mono mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-yellow-400" />
              Verified Total Net Worth
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 font-mono font-bold border border-yellow-400/30">
              +14.82% All-Time
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            ${wallet.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-mono mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+$1,420.50 Today (Active Trading Gain)</span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={onOpenDeposit}
              className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-yellow-400/20"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Deposit
            </button>
            <button
              onClick={onOpenWithdraw}
              className="flex-1 py-2.5 rounded-xl bg-[#050c1e] hover:bg-blue-900/50 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-blue-600/50"
            >
              <ArrowUpRight className="w-4 h-4 text-yellow-400" />
              Withdraw
            </button>
            <button
              onClick={onOpenSwap}
              className="p-2.5 rounded-xl bg-[#050c1e] hover:bg-blue-900/50 active:scale-95 text-yellow-400 transition-all border border-blue-600/50"
              title="Instant Swap"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Spot Account Vault Card */}
        <div className="p-5 rounded-2xl bg-[#09132e] border border-blue-900/60 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-200 font-mono mb-1">
              <span>Spot Wallet Balance</span>
              <span className="text-[10px] bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded font-bold border border-blue-500/30">
                Liquid Vault
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              ${(wallet.totalUsd - totalPositionMargin).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-300 mt-2 font-mono">
              Available to trade: <strong className="text-yellow-400 font-bold font-mono">${wallet.availableUsd.toLocaleString()}</strong>
            </div>
          </div>
          <div className="text-[11px] text-blue-200/70 font-mono pt-3 border-t border-blue-900/60 flex items-center gap-1.5 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Unencumbered capital in custodial multisig vault</span>
          </div>
        </div>

        {/* Futures Margin & Unrealized PnL Card */}
        <div className="p-5 rounded-2xl bg-[#09132e] border border-blue-900/60 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-200 font-mono mb-1">
              <span>Futures Margin & PnL</span>
              <span className="text-[10px] bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded font-bold border border-blue-500/30">
                Leveraged
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              ${totalPositionMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs font-mono mt-2 flex items-center gap-1.5">
              <span className="text-slate-300">Unrealized PnL:</span>
              <strong className={totalPositionPnl >= 0 ? 'text-yellow-400 font-bold' : 'text-rose-400 font-bold'}>
                {totalPositionPnl >= 0 ? '+' : ''}${totalPositionPnl.toFixed(2)}
              </strong>
            </div>
          </div>
          <div className="text-[11px] text-blue-200/70 font-mono pt-3 border-t border-blue-900/60 flex items-center gap-1.5 mt-3">
            <Layers className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>{positions.length} active leveraged positions running</span>
          </div>
        </div>
      </div>

      {/* 3. Asset Holdings & Allocation Table */}
      <div className="bg-[#09132e] border border-blue-900/60 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-blue-900/60 flex flex-wrap items-center justify-between gap-3 bg-[#070e24]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-yellow-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white">Asset Holdings & Allocation</span>
              <span className="text-xs text-slate-300 block font-normal">Real-time custodial valuation across all digital asset sub-ledgers</span>
            </div>
          </div>
          <span className="text-xs text-yellow-300 font-mono bg-yellow-400/10 border border-yellow-400/30 px-2.5 py-1 rounded-full font-bold">
            Live Settlement Prices
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[11px] text-blue-200/80 border-b border-blue-900/60 bg-[#050c1e] font-sans uppercase">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Total Balance</th>
                <th className="py-3 px-4">Available</th>
                <th className="py-3 px-4">In Orders / Margin</th>
                <th className="py-3 px-4">USD Valuation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/40">
              {Object.entries(wallet.balances).map(([asset, data]) => {
                const total = data.free + data.locked;
                const pct = wallet.totalUsd > 0 ? ((data.usdValue / wallet.totalUsd) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={asset} className="hover:bg-blue-950/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-yellow-400/40 flex items-center justify-center font-black text-xs text-yellow-400 shadow-sm">
                          {asset[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white font-sans text-sm">{asset}</div>
                          <div className="text-[10px] text-blue-200/80 font-mono">{pct}% Allocation</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      {total} {asset}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {data.free} {asset}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-medium">
                      {data.locked} {asset}
                    </td>
                    <td className="py-3 px-4 font-black text-yellow-400 text-sm">
                      ${data.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={onOpenDeposit}
                          className="px-3 py-1.5 rounded-lg bg-[#050c1e] hover:bg-blue-900/60 text-white text-xs font-sans font-semibold border border-blue-800 transition-colors"
                        >
                          Deposit
                        </button>
                        <button
                          onClick={onOpenSwap}
                          className="px-3 py-1.5 rounded-lg bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-300 text-xs font-sans font-bold border border-yellow-400/30 transition-colors"
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
