import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Filter, 
  User, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink, 
  DollarSign, 
  FileText, 
  Send, 
  Copy, 
  Check, 
  Sparkles,
  Lock,
  Eye,
  ChevronRight,
  Database
} from 'lucide-react';
import { UserAccount, RefundRequest, RequestStatus } from '../types';

interface RequestsManagerProps {
  currentUser: UserAccount | null;
  onOpenAuth: (tab?: 'login' | 'register' | 'change-password') => void;
  onSimulateUser: (user: UserAccount) => void;
}

export const RequestsManager: React.FC<RequestsManagerProps> = ({
  currentUser,
  onOpenAuth,
  onSimulateUser
}) => {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Submit request modal state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitType, setSubmitType] = useState<'refund' | 'withdrawal' | 'deposit_dispute'>('refund');
  const [submitAmount, setSubmitAmount] = useState('500');
  const [submitCurrency, setSubmitCurrency] = useState('USD');
  const [submitReason, setSubmitReason] = useState('Trade slippage compensation request');
  const [submitWallet, setSubmitWallet] = useState('0x71C802...4e89');
  const [submitting, setSubmitting] = useState(false);

  // Admin notes editing
  const [selectedReqForNotes, setSelectedReqForNotes] = useState<RefundRequest | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin user directory state (from /userData.db via server.ts)
  const [allUsersData, setAllUsersData] = useState<UserAccount[]>([]);
  const [showUsersDrawer, setShowUsersDrawer] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const headers: Record<string, string> = {};
      if (currentUser) {
        headers['x-user-role'] = currentUser.role || 'user';
        headers['x-username'] = currentUser.username;
      }
      
      const queryParams = new URLSearchParams();
      if (currentUser?.role === 'admin') {
        queryParams.append('role', 'admin');
      } else if (currentUser) {
        queryParams.append('username', currentUser.username);
      }

      const res = await fetch(`/api/requests?${queryParams.toString()}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch transaction requests');
      const data: RefundRequest[] = await res.json();
      setRequests(data);
      try {
        localStorage.setItem('meridian_requests', JSON.stringify(data));
      } catch {}
    } catch (err: any) {
      // Static GitHub Pages fallback
      const saved = localStorage.getItem('meridian_requests');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRequests(parsed);
          return;
        } catch {}
      }
      const fallbackRequests: RefundRequest[] = [
        {
          id: 'REQ-88910',
          userId: 'user_01',
          username: 'joeldan228@gmail.com',
          clientName: 'Joel Dan',
          amount: 15400,
          currency: 'USD',
          type: 'withdrawal',
          reason: 'Institutional treasury settlement to multisig custody',
          walletAddress: '0x71C802...4e89',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          adminNotes: 'Awaiting secondary custodial verification'
        },
        {
          id: 'REQ-88909',
          userId: 'user_02',
          username: 'sarah.m@apexcap.com',
          clientName: 'Sarah Miller',
          amount: 52000,
          currency: 'USDC',
          type: 'deposit_dispute',
          reason: 'Arbitrage transaction dispute - gas fee rebate',
          walletAddress: '0x32A41B...99f1',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          adminNotes: 'Verified on-chain hash #0x4f... Approved by Head of Ops'
        },
        {
          id: 'REQ-88908',
          userId: 'user_03',
          username: 'marcus.vance@quantfunds.io',
          clientName: 'Marcus Vance',
          amount: 8750,
          currency: 'USD',
          type: 'refund',
          reason: 'Slippage excess refund during high-volatility event',
          walletAddress: '0x99D201...221b',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          adminNotes: 'Refund disbursed to liquid spot wallet'
        }
      ];
      setRequests(fallbackRequests);
      try {
        localStorage.setItem('meridian_requests', JSON.stringify(fallbackRequests));
      } catch {}
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllUsers = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/users?role=admin', {
        headers: { 'x-user-role': 'admin' }
      });
      if (res.ok) {
        const users = await res.json();
        setAllUsersData(users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [currentUser?.username, currentUser?.role]);

  // Admin actions: Approve, Reject, Complete
  const handleUpdateStatus = async (id: string, newStatus: RequestStatus, note?: string) => {
    try {
      setActionLoadingId(id);
      setFeedbackMessage(null);
      
      const bodyPayload: { status: RequestStatus; adminNotes?: string } = { status: newStatus };
      if (note !== undefined) {
        bodyPayload.adminNotes = note;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser) {
        headers['x-username'] = currentUser.username;
        headers['x-user-role'] = currentUser.role || 'user';
      }

      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ ...bodyPayload, username: currentUser?.username }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update transaction status');
      }

      const updated: RefundRequest = await res.json();
      setRequests(prev => {
        const next = prev.map(req => req.id === id ? updated : req);
        try { localStorage.setItem('meridian_requests', JSON.stringify(next)); } catch {}
        return next;
      });
      setFeedbackMessage({
        type: 'success',
        text: `Transaction ${id} successfully marked as ${newStatus.toUpperCase()}!`,
      });
      setSelectedReqForNotes(null);
    } catch (err: any) {
      // Fallback update in local state for static hosting (GitHub Pages)
      setRequests(prev => {
        const next = prev.map(req => {
          if (req.id === id) {
            return {
              ...req,
              status: newStatus,
              adminNotes: note !== undefined ? note : req.adminNotes,
              updatedAt: new Date().toISOString()
            };
          }
          return req;
        });
        try { localStorage.setItem('meridian_requests', JSON.stringify(next)); } catch {}
        return next;
      });
      setFeedbackMessage({
        type: 'success',
        text: `Transaction ${id} marked as ${newStatus.toUpperCase()}!`,
      });
      setSelectedReqForNotes(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit new refund / withdrawal request
  const handleSubmitNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-username': currentUser.username,
          'x-user-role': currentUser.role || 'user',
        },
        body: JSON.stringify({
          userId: `usr_${currentUser.username}`,
          username: currentUser.username,
          clientName: currentUser.name || currentUser.username,
          amount: parseFloat(submitAmount) || 0,
          currency: submitCurrency,
          type: submitType,
          reason: submitReason,
          walletAddress: submitWallet,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit request');
      }

      const created: RefundRequest = await res.json();
      setRequests(prev => {
        const next = [created, ...prev];
        try { localStorage.setItem('meridian_requests', JSON.stringify(next)); } catch {}
        return next;
      });
      setSubmitModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Request ${created.id} submitted for review!`,
      });
      setSubmitReason('');
    } catch (err: any) {
      // Fallback creation for static hosting (GitHub Pages)
      const newReq: RefundRequest = {
        id: `REQ-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: `usr_${currentUser.username}`,
        username: currentUser.username,
        clientName: currentUser.name || currentUser.username,
        amount: parseFloat(submitAmount) || 0,
        currency: submitCurrency,
        type: submitType,
        reason: submitReason,
        walletAddress: submitWallet,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRequests(prev => {
        const next = [newReq, ...prev];
        try { localStorage.setItem('meridian_requests', JSON.stringify(next)); } catch {}
        return next;
      });
      setSubmitModalOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `Request ${newReq.id} submitted for review!`,
      });
      setSubmitReason('');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      req.id.toLowerCase().includes(q) ||
      req.username.toLowerCase().includes(q) ||
      req.clientName.toLowerCase().includes(q) ||
      req.reason.toLowerCase().includes(q) ||
      (req.walletAddress && req.walletAddress.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="flex-1 bg-[#050c1e] text-slate-100 overflow-y-auto p-3 sm:p-6 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-blue-900/40">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-yellow-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Requests & Refund Management
                </h1>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                    ADMIN CONSOLE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-950/80 text-blue-200 border border-blue-800/60 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-yellow-300" />
                    USER PORTAL
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {isAdmin 
                  ? "Admins see all other users' refund & transaction requests from SQLite /userData.db. You have authority to Approve, Reject, and Complete."
                  : "View and submit your own refund and balance withdrawal requests. Admin operators process approvals."}
              </p>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Quick Simulation bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#050c1e] border border-blue-900/60 text-xs">
            <span className="text-[11px] font-mono text-slate-400 px-1.5 hidden sm:inline">Simulate Role:</span>
            <button
              id="switch-to-admin-btn"
              onClick={() => onSimulateUser({
                username: 'joeldan228@gmail.com',
                name: 'Joel Dan (Admin)',
                gender: 'Male',
                location: 'Security HQ',
                role: 'admin'
              })}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                isAdmin 
                  ? 'bg-yellow-400 text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950'
              }`}
            >
              Admin (Joel Dan)
            </button>
            <button
              id="switch-to-user-btn"
              onClick={() => onSimulateUser({
                username: 'testing-test-2',
                name: 'Client User (testing-test-2)',
                gender: 'Male',
                location: 'Private Client Desk',
                role: 'user'
              })}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                !isAdmin && currentUser?.username === 'testing-test-2'
                  ? 'bg-blue-600 text-white shadow-sm font-bold' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950'
              }`}
            >
              Client (testing-test-2)
            </button>
          </div>

          <button
            id="refresh-requests-btn"
            onClick={fetchRequests}
            disabled={refreshing}
            className="p-2 rounded-lg bg-[#09132e] hover:bg-blue-900/60 border border-blue-900/60 text-slate-300 hover:text-white transition-colors"
            title="Refresh requests"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-yellow-400' : ''}`} />
          </button>

          {isAdmin && (
            <button
              id="toggle-users-db-btn"
              onClick={() => setShowUsersDrawer(!showUsersDrawer)}
              className="px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-200 border border-blue-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-yellow-400" />
              <span>User DB ({allUsersData.length})</span>
            </button>
          )}

          <button
            id="submit-request-btn"
            onClick={() => setSubmitModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-yellow-500/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div className={`p-3 rounded-lg flex items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Admin Users Drawer: view all info from other users private collection in /userData.db/server.ts */}
      {isAdmin && showUsersDrawer && (
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Private Users Store (/userData.db - Admin Inspection)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                All User Records Accessible
              </span>
            </div>
            <button onClick={() => setShowUsersDrawer(false)} className="text-xs text-slate-400 hover:text-white">
              Close Panel
            </button>
          </div>
          <p className="text-xs text-slate-400">
            As an administrator, you have full access to inspect private user records stored in SQLite and check each user's assigned role and location data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allUsersData.map(u => (
              <div key={u.username} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white truncate">{u.name}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                    u.role === 'admin' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {u.role || 'user'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyan-300 truncate">@{u.username}</div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>{u.gender || 'not specified'}</span>
                  <span>{u.location || 'Remote'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4">
        <div 
          onClick={() => setFilterStatus('all')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'all' 
              ? 'bg-slate-800/90 border-slate-600 shadow-md' 
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-slate-400">Total Volume</div>
          <div className="text-xl sm:text-2xl font-extrabold text-white mt-1 font-mono">{counts.all}</div>
          <div className="text-[10px] text-slate-500 mt-1">All registered requests</div>
        </div>

        <div 
          onClick={() => setFilterStatus('pending')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'pending' 
              ? 'bg-amber-950/30 border-amber-500/50 shadow-md' 
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300 mt-1 font-mono">{counts.pending}</div>
          <div className="text-[10px] text-amber-400/70 mt-1">Needs admin action</div>
        </div>

        <div 
          onClick={() => setFilterStatus('approved')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'approved' 
              ? 'bg-sky-950/30 border-sky-500/50 shadow-md' 
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-sky-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-sky-300 mt-1 font-mono">{counts.approved}</div>
          <div className="text-[10px] text-sky-400/70 mt-1">Ready for completion</div>
        </div>

        <div 
          onClick={() => setFilterStatus('completed')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'completed' 
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md' 
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Completed</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 mt-1 font-mono">{counts.completed}</div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Executed & settled</div>
        </div>

        <div 
          onClick={() => setFilterStatus('rejected')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            filterStatus === 'rejected' 
              ? 'bg-rose-950/30 border-rose-500/50 shadow-md' 
              : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-300 mt-1 font-mono">{counts.rejected}</div>
          <div className="text-[10px] text-rose-400/70 mt-1">Disapproved / refunded</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'rejected', 'completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterStatus === status 
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {status} ({counts[status]})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by user, ID, reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
            <p className="text-sm">Loading transaction requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/30 rounded-xl border border-slate-800 p-6">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No transaction requests found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {isAdmin 
                ? "There are currently no requests matching this filter in the system." 
                : "You don't have any refund or withdrawal requests recorded under your user account."}
            </p>
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 inline-flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit a Request</span>
            </button>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isCompleted = req.status === 'completed';
            const isRejected = req.status === 'rejected';

            return (
              <div 
                key={req.id} 
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isPending 
                    ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/60' 
                    : isApproved 
                    ? 'bg-slate-900/80 border-sky-500/30' 
                    : isCompleted
                    ? 'bg-slate-900/70 border-emerald-500/30'
                    : 'bg-slate-900/60 border-rose-500/20'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  {/* Left: Identifier, user info, type badge */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      req.type === 'refund' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : req.type === 'withdrawal'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {req.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-white text-sm">{req.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          req.type === 'refund' 
                            ? 'bg-amber-500/20 text-amber-300' 
                            : req.type === 'withdrawal'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {req.type.replace('_', ' ')}
                        </span>
                        
                        {/* Status badge */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold flex items-center gap-1 ${
                          isPending 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : isApproved 
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            : isCompleted 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isPending && <Clock className="w-3 h-3" />}
                          {isApproved && <CheckCircle2 className="w-3 h-3" />}
                          {isCompleted && <Check className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          <span className="uppercase">{req.status}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="text-white font-medium">{req.clientName}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono">@{req.username}</span>
                        <span>•</span>
                        <span className="text-slate-500">{new Date(req.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-left md:text-right">
                    <div className="text-lg sm:text-xl font-mono font-black text-white">
                      {req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-emerald-400 text-sm">{req.currency}</span>
                    </div>
                    {req.walletAddress && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mt-0.5 justify-start md:justify-end">
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{req.walletAddress}</span>
                        <button 
                          onClick={() => copyToClipboard(req.walletAddress || '', req.id)}
                          className="text-slate-500 hover:text-white"
                          title="Copy address"
                        >
                          {copiedId === req.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason & Details */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-medium">Reason/Memo: </span>
                    <span>{req.reason}</span>
                    {req.adminNotes && (
                      <div className="mt-1 text-[11px] font-mono text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block">
                        <span className="text-amber-400 font-bold">Admin Note: </span>
                        {req.adminNotes}
                      </div>
                    )}
                  </div>

                  {/* Admin Action Buttons (Approve, Reject, Complete) */}
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5 w-full md:w-auto justify-end flex-wrap">
                      {/* Approve button */}
                      {req.status !== 'approved' && req.status !== 'completed' && (
                        <button
                          id={`approve-btn-${req.id}`}
                          onClick={() => handleUpdateStatus(req.id, 'approved')}
                          disabled={actionLoadingId === req.id}
                          className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {/* Complete button */}
                      {req.status !== 'completed' && (
                        <button
                          id={`complete-btn-${req.id}`}
                          onClick={() => handleUpdateStatus(req.id, 'completed', 'Transaction completed and funds settled on-chain.')}
                          disabled={actionLoadingId === req.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Complete</span>
                        </button>
                      )}

                      {/* Reject button */}
                      {req.status !== 'rejected' && req.status !== 'completed' && (
                        <button
                          id={`reject-btn-${req.id}`}
                          onClick={() => handleUpdateStatus(req.id, 'rejected', 'Declined by administrator during audit verification.')}
                          disabled={actionLoadingId === req.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Notes button */}
                      <button
                        onClick={() => {
                          setSelectedReqForNotes(req);
                          setAdminNoteInput(req.adminNotes || '');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                        title="Add admin note"
                      >
                        Notes
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono text-slate-500">
                      {isPending && "⏳ Under review by compliance"}
                      {isApproved && "✨ Approved — awaiting final on-chain dispatch"}
                      {isCompleted && "✓ Funds disbursed"}
                      {isRejected && "✕ Disapproved"}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Notes Dialog Modal */}
      {selectedReqForNotes && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Transaction Notes ({selectedReqForNotes.id})</span>
              </h3>
              <button onClick={() => setSelectedReqForNotes(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Administrative Memo / TX Hash:</label>
              <textarea
                value={adminNoteInput}
                onChange={e => setAdminNoteInput(e.target.value)}
                placeholder="e.g. Verified by compliance officer; on-chain TX 0x3f... completed"
                rows={3}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedReqForNotes(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReqForNotes.id, selectedReqForNotes.status, adminNoteInput)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Save Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit New Request Modal */}
      {submitModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0d1424] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Submit Refund or Withdrawal Request</span>
              </h3>
              <button onClick={() => setSubmitModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitNewRequest} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Request Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['refund', 'withdrawal', 'deposit_dispute'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSubmitType(type)}
                      className={`py-2 px-1 rounded-lg border text-center font-semibold capitalize transition-all ${
                        submitType === type 
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Amount</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={submitAmount}
                    onChange={e => setSubmitAmount(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Currency</label>
                  <select
                    value={submitCurrency}
                    onChange={e => setSubmitCurrency(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-medium">Destination / Source Wallet</label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSubmitWallet('TK4HkBbHm2ZaPMYE3PY93WGXb667xheFb5')}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono"
                    >
                      Trc-20
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitWallet('0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4')}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-yellow-300 font-mono"
                    >
                      Bep-20
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitWallet('0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4')}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono"
                    >
                      ERC-20
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={submitWallet}
                  onChange={e => setSubmitWallet(e.target.value)}
                  placeholder="e.g. TK4HkBbHm... or 0xc0c2ef5..."
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Reason / Explanation</label>
                <textarea
                  rows={2}
                  required
                  value={submitReason}
                  onChange={e => setSubmitReason(e.target.value)}
                  placeholder="Provide reason for refund or withdrawal..."
                  className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-sm"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
