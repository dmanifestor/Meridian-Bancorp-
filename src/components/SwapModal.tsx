import React, { useState } from 'react';
import { ArrowDown, ArrowUpDown, Settings, Zap, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { MarketPair, UserWallet } from '../types';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  markets: MarketPair[];
  wallet: UserWallet;
  onExecuteSwap: (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number) => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  markets,
  wallet,
  onExecuteSwap,
}) => {
  const [fromAsset, setFromAsset] = useState<string>('USDT');
  const [toAsset, setToAsset] = useState<string>('BTC');
  const [fromAmount, setFromAmount] = useState<string>('1000');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate rate based on markets
  const getAssetPrice = (asset: string) => {
    if (asset === 'USDT') return 1;
    const pair = markets.find(m => m.baseAsset === asset);
    return pair ? pair.price : 1;
  };

  const fromPrice = getAssetPrice(fromAsset);
  const toPrice = getAssetPrice(toAsset);
  const rate = fromPrice / toPrice;

  const numFrom = parseFloat(fromAmount) || 0;
  const numTo = numFrom * rate;

  const handleFlip = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
    setFromAmount('');
  };

  const handleMax = () => {
    if (fromAsset === 'USDT') {
      setFromAmount(wallet.availableUsd.toString());
    } else {
      const bal = wallet.balances[fromAsset]?.free || 0;
      setFromAmount(bal.toString());
    }
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numFrom <= 0) return;

    onExecuteSwap(fromAsset, toAsset, numFrom, numTo);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1800);
  };

  const tokenList = ['USDT', 'BTC', 'ETH', 'SOL', 'RENDER', 'SUI', 'AVAX', 'LINK'];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#0c1220] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-5 relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Instant Token Swap</h3>
              <p className="text-[10px] text-slate-400 font-mono">Guaranteed Best Rate • Zero Gas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Swap Form */}
        <form onSubmit={handleSwapSubmit} className="mt-4 space-y-3">
          {/* FROM CARD */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>You Pay</span>
              <button
                type="button"
                onClick={handleMax}
                className="text-emerald-400 hover:underline font-mono text-[11px]"
              >
                Max: {fromAsset === 'USDT' ? `${wallet.availableUsd.toLocaleString()} USDT` : `${wallet.balances[fromAsset]?.free || 0} ${fromAsset}`}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                step="any"
                value={fromAmount}
                onChange={e => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="w-full bg-transparent text-slate-100 text-lg sm:text-xl font-mono font-bold focus:outline-none"
                required
              />
              <select
                value={fromAsset}
                onChange={e => setFromAsset(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none"
              >
                {tokenList.map(t => (
                  <option key={t} value={t} disabled={t === toAsset}>{t}</option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              ≈ ${(numFrom * fromPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* FLIP BUTTON */}
          <div className="flex justify-center -my-1">
            <button
              type="button"
              onClick={handleFlip}
              className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* TO CARD */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>You Receive (Estimated)</span>
              <span className="text-[11px] font-mono text-slate-400">
                1 {fromAsset} = {rate > 1 ? rate.toFixed(4) : rate.toFixed(8)} {toAsset}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                readOnly
                value={numTo > 0 ? (toPrice < 1 ? numTo.toFixed(6) : numTo.toFixed(4)) : '0.00'}
                className="w-full bg-transparent text-emerald-400 text-lg sm:text-xl font-mono font-bold focus:outline-none"
              />
              <select
                value={toAsset}
                onChange={e => setToAsset(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold py-1.5 px-2.5 rounded-lg focus:outline-none"
              >
                {tokenList.map(t => (
                  <option key={t} value={t} disabled={t === fromAsset}>{t}</option>
                ))}
              </select>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              ≈ ${(numTo * toPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Slippage & Routing Info */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono space-y-1.5">
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>Slippage Tolerance</span>
              <div className="flex gap-1">
                {[0.1, 0.5, 1.0].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlippage(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      slippage === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Network Fee</span>
              <span className="text-emerald-400 font-bold">$0.00 (Subsidized)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Price Impact</span>
              <span className="text-slate-300">&lt; 0.01%</span>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {isSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Swap completed successfully! Balances updated.</span>
            </div>
          )}

          {/* CTA BUTTON */}
          <button
            type="submit"
            disabled={numFrom <= 0 || isSuccess}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-sm uppercase tracking-wide transition-all shadow-lg shadow-emerald-500/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
          >
            {isSuccess ? 'Swapped!' : `Swap ${fromAsset} for ${toAsset}`}
          </button>
        </form>
      </div>
    </div>
  );
};
