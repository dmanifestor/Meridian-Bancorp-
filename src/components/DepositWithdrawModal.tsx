import React, { useState } from 'react';
import { UserWallet } from '../types';
import { X, Copy, Check, QrCode, ArrowDownLeft, ArrowUpRight, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface DepositWithdrawModalProps {
  isOpen: boolean;
  mode: 'deposit' | 'withdraw';
  onClose: () => void;
  wallet: UserWallet;
  onConfirmTransaction: (type: 'deposit' | 'withdraw', asset: string, amount: number) => void;
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  mode: initialMode,
  onClose,
  wallet,
  onConfirmTransaction,
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>(initialMode);
  const [asset, setAsset] = useState<string>('USDT');
  const [network, setNetwork] = useState<string>('Arbitrum One');
  const [amount, setAmount] = useState<string>('1000');
  const [address, setAddress] = useState<string>('0x71C85A3A3b2A69De6Dbf7f01ED13B2108B2c43e7');
  const [copied, setCopied] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const depositAddress = '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7';

  const handleCopy = () => {
    navigator.clipboard?.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (num <= 0) return;
    onConfirmTransaction('deposit', asset, num);
    setFeedback(`Successfully credited deposit of +${num} ${asset}!`);
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1500);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (num <= 0) return;
    onConfirmTransaction('withdraw', asset, num);
    setFeedback(`Withdrawal of ${num} ${asset} broadcasted to ${network}!`);
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1500);
  };

  const availableBal = asset === 'USDT' ? wallet.availableUsd : (wallet.balances[asset]?.free || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="bg-[#09132e] border border-blue-900/50 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-5 relative animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto text-slate-100">
        {/* Header with Mode Switcher */}
        <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('deposit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'deposit'
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20 font-black'
                  : 'text-slate-300 hover:text-white bg-[#050c1e] border border-blue-900/50'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('withdraw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMode === 'withdraw'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white bg-[#050c1e] border border-blue-900/50'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Withdraw
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-blue-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4 space-y-3.5">
          {/* Asset Select */}
          <div>
            <label className="text-xs text-slate-300 font-medium mb-1 block">Select Asset</label>
            <select
              value={asset}
              onChange={e => setAsset(e.target.value)}
              className="w-full bg-[#050c1e] border border-blue-900/60 text-white text-xs font-semibold py-2 px-3 rounded-lg focus:outline-none focus:border-yellow-400"
            >
              {['USDT', 'BTC', 'ETH', 'SOL'].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Network Select */}
          <div>
            <label className="text-xs text-slate-300 font-medium mb-1 block">Transfer Network</label>
            <select
              value={network}
              onChange={e => setNetwork(e.target.value)}
              className="w-full bg-[#050c1e] border border-blue-900/60 text-white text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-yellow-400 font-mono"
            >
              <option value="Arbitrum One">Arbitrum One (L2) - Instant, $0.05 fee</option>
              <option value="Ethereum (ERC20)">Ethereum (ERC20) - 12 confirmations</option>
              <option value="Solana">Solana SPL - 400ms finality</option>
              <option value="Bitcoin Native">Bitcoin Native SegWit</option>
            </select>
          </div>

          {activeMode === 'deposit' ? (
            /* DEPOSIT TAB */
            <div className="space-y-3 pt-1">
              <div className="flex flex-col items-center justify-center p-4 bg-[#050c1e] rounded-xl border border-blue-900/50">
                <div className="w-28 h-28 bg-white rounded-lg p-2 shadow-inner flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <span className="text-[11px] text-yellow-300/90 mt-2 font-mono">Scan QR to deposit {asset}</span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 mb-1 block">Your Deposit Address</label>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050c1e] border border-blue-900/50 font-mono text-xs">
                  <span className="text-white truncate mr-2">{depositAddress}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-yellow-300 hover:text-yellow-200 px-2 py-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 transition-colors shrink-0 text-[11px]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDepositSubmit}
                className="w-full py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-yellow-500/20"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Simulate Instant On-Chain Deposit (+{amount} {asset})</span>
              </button>
            </div>
          ) : (
            /* WITHDRAW TAB */
            <form onSubmit={handleWithdrawSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-xs text-slate-300 mb-1 block">Recipient Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Amount to Withdraw</span>
                  <button
                    type="button"
                    onClick={() => setAmount(availableBal.toString())}
                    className="text-yellow-400 hover:underline font-mono text-[11px]"
                  >
                    Max: {availableBal.toLocaleString()} {asset}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-yellow-400"
                  required
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#050c1e] border border-blue-900/50 text-[11px] font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Estimated Network Fee:</span>
                  <span className="text-white font-medium">0.0001 {asset}</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Layer:</span>
                  <span className="text-yellow-400 font-semibold">Cold Multi-Sig Enforced</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Confirm Withdrawal
              </button>
            </form>
          )}

          {feedback && (
            <div className="p-2.5 rounded-lg bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
