import React, { useState } from 'react';
import { 
  TrendingUp, 
  Shield, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  FileText, 
  Terminal, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Layers, 
  ArrowUpRight, 
  Zap, 
  KeyRound 
} from 'lucide-react';
import { UserAccount, ActiveTab } from '../types';
import { INITIAL_MARKETS } from '../data/mockData';
import { CLIENT_DESTINATION_WALLETS } from '../data/clientDashboardData';

interface HomePageProps {
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onNavigate: (tab: ActiveTab) => void;
  initialAuthMode?: 'login' | 'register';
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigate,
  initialAuthMode = 'login',
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>(initialAuthMode);
  
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Register states
  const [regName, setRegName] = useState('');
  const [regGender, setRegGender] = useState('Male');
  const [regLocation, setRegLocation] = useState('New York, USA');
  const [regRole, setRegRole] = useState<'user' | 'admin'>('user');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username and password are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText };
      }

      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || rawText || 'Invalid username or password');
      }

      const authenticatedUser: UserAccount = {
        username: data.user?.username || username.trim(),
        name: data.user?.name || username.trim(),
        gender: data.user?.gender,
        location: data.user?.location,
        role: data.user?.role || (username.toLowerCase() === 'joeldan228@gmail.com' || username.toLowerCase() === 'admin' ? 'admin' : 'user'),
      };

      setSuccessMessage(`Welcome back, ${authenticatedUser.name}!`);
      onLoginSuccess(authenticatedUser);

      // Auto route after brief feedback
      setTimeout(() => {
        if (authenticatedUser.role === 'admin') {
          onNavigate('requests');
        } else {
          onNavigate('client-dashboard');
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !regName.trim()) {
      setErrorMessage('Username, password, and name are required');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          name: regName.trim(),
          password,
          gender: regGender,
          location: regLocation.trim(),
          role: regRole,
        }),
      });

      const message = await res.text();
      if (!res.ok) {
        throw new Error(message || 'Registration failed');
      }

      setSuccessMessage('Account registered successfully! Logging you in...');
      const newUser: UserAccount = {
        username: username.trim(),
        name: regName.trim(),
        gender: regGender,
        location: regLocation.trim(),
        role: regRole,
      };

      onLoginSuccess(newUser);
      setTimeout(() => {
        if (newUser.role === 'admin') {
          onNavigate('requests');
        } else {
          onNavigate('client-dashboard');
        }
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setAuthTab('login');
    setErrorMessage(null);
  };

  return (
    <div id="homepage-container" className="min-h-screen bg-[#050c1e] text-slate-100 flex flex-col justify-between">
      {/* 1. Hero & Top Banner */}
      <div className="relative overflow-hidden border-b border-blue-900/40 bg-gradient-to-b from-[#0a163a] via-[#07102b] to-[#050c1e]">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Brand, Value Proposition & Key Stats */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>Meridian Bancorp Private Client Custody</span>
                <span className="text-yellow-300 font-mono text-[11px] font-bold">&bull; Dual RBAC</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Next-Generation Institutional <br className="hidden sm:inline" />
                  <span className="text-yellow-400">Digital Custody</span> & Trading
                </h1>
                <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                  Meridian Bancorp provides secure private client wealth management, multi-tenant digital asset custody, 
                  and sub-millisecond spot execution backed by isolated local storage and SQLite ledger architecture.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="hero-launch-terminal-btn"
                  onClick={() => onNavigate('trade')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95"
                >
                  <TrendingUp className="w-4 h-4 text-yellow-300" />
                  <span>Launch Trading Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-client-dashboard-btn"
                  onClick={() => onNavigate('client-dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-yellow-400" />
                  <span>Private Client Portfolio</span>
                  <span className="text-yellow-300 font-mono text-xs px-1.5 py-0.5 rounded bg-yellow-400/20 font-bold">$48k</span>
                </button>

                <button
                  id="hero-requests-btn"
                  onClick={() => onNavigate('requests')}
                  className="px-4 py-2.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800/80 text-yellow-300 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-yellow-400" />
                  <span>Requests & Refunds</span>
                </button>
              </div>

              {/* Trust & Architecture Badges */}
              <div className="pt-4 border-t border-blue-900/40 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-200">
                  <Shield className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Dual RBAC (Admin & User)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Lock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Isolated Multi-Tenancy</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>Fast SQLite Engine</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Login / Register Portal Box */}
            <div className="lg:col-span-5">
              <div className="bg-[#09132e] border border-blue-900/50 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
                
                {/* Header with Switcher Tabs */}
                <div className="flex items-center justify-between pb-4 border-b border-blue-900/40 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-yellow-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white">Client & Admin Portal</h2>
                      <p className="text-[11px] text-blue-200/70">Session Management</p>
                    </div>
                  </div>

                  <div className="flex bg-[#050c1e] p-1 rounded-xl border border-blue-900/60">
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        authTab === 'login'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('register')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        authTab === 'register'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Login Form */}
                {authTab === 'login' ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Username or Email</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="e.g. joeldan228@gmail.com"
                        className="w-full bg-[#050c1e] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-slate-300">Password</label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showPassword ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-[#050c1e] border border-blue-900/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-yellow-300" />
                          <span>Secure Sign In</span>
                        </>
                      )}
                    </button>

                    {/* 1-Click Fill Credentials */}
                    <div className="pt-3 border-t border-blue-900/40">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-between">
                        <span>Authorized Credentials</span>
                        <span className="text-[9px] text-yellow-300 font-mono">1-Click Fill</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickFill('joeldan228@gmail.com', 'JoelDan2026!')}
                          className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 hover:border-yellow-400/60 text-left transition-all group"
                        >
                          <div className="text-yellow-300 font-bold text-xs flex items-center justify-between">
                            <span>Joel Dan</span>
                            <span className="text-[9px] px-1 rounded bg-yellow-400/20 text-yellow-200 font-mono">ADMIN</span>
                          </div>
                          <div className="text-[10px] text-slate-300 font-mono truncate mt-0.5">joeldan228@gmail.com</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickFill('testing-test-2', 'testing-today')}
                          className="p-2 rounded-lg bg-blue-600/15 border border-blue-500/30 hover:border-blue-400 text-left transition-all group"
                          id="quick-fill-client-btn"
                        >
                          <div className="text-blue-200 font-bold text-xs flex items-center justify-between">
                            <span>Client Account</span>
                            <span className="text-[9px] px-1 rounded bg-blue-600/30 text-blue-200 font-mono">USER</span>
                          </div>
                          <div className="text-[10px] text-slate-300 font-mono truncate mt-0.5">testing-test-2 &bull; $48k</div>
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  /* Registration Form */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Username</label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder="e.g. user2026"
                          className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Gender</label>
                        <select
                          value={regGender}
                          onChange={e => setRegGender(e.target.value)}
                          className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">Account Role</label>
                        <select
                          value={regRole}
                          onChange={e => setRegRole(e.target.value as 'user' | 'admin')}
                          className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                        >
                          <option value="user">User (Client Access)</option>
                          <option value="admin">Admin (Requests Manager)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">Location / Residence</label>
                      <input
                        type="text"
                        value={regLocation}
                        onChange={e => setRegLocation(e.target.value)}
                        placeholder="e.g. Sydney, Australia"
                        className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                          <span>Registering Account...</span>
                        </>
                      ) : (
                        <span>Create Client Account</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Footer status link */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => onNavigate('api-docs')}
                    className="text-[11px] text-blue-300 hover:text-white inline-flex items-center gap-1 font-mono transition-colors"
                  >
                    <span>View backend API & Database Documentation</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Live Market Ticker Strip */}
      <div className="border-b border-blue-900/40 bg-[#070e26] py-2.5 px-4 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-bold text-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span>LIVE MARKETS</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
            {INITIAL_MARKETS.slice(0, 5).map(m => (
              <div 
                key={m.symbol}
                onClick={() => onNavigate('trade')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0 text-xs font-mono"
              >
                <span className="text-white font-bold">{m.symbol}</span>
                <span className="text-slate-200">${m.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={m.change24h >= 0 ? 'text-yellow-300 font-semibold' : 'text-rose-400 font-semibold'}>
                  {m.change24h >= 0 ? '+' : ''}{m.change24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('trade')}
            className="text-xs text-blue-300 hover:text-white font-semibold flex items-center gap-1 shrink-0"
          >
            <span>All Markets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Core Operational Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-white">Platform Modules & Data Isolation</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Explore dedicated services protected by strict role permissions and isolated user ledger models.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Module 1: Client Portfolio */}
          <div
            id="portal-card-client"
            onClick={() => onNavigate('client-dashboard')}
            className="p-5 rounded-2xl bg-[#09132e] border border-blue-900/40 hover:border-yellow-400/60 cursor-pointer transition-all group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-3 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Client Portfolio</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Private wealth and digital custody ledger ($47,986.00 available balance) with full historical distributions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-mono">Withdrawal Fee:</span>
              <span className="text-yellow-300 font-mono font-bold">$5,960.00</span>
            </div>
          </div>

          {/* Module 2: Trading Terminal */}
          <div
            id="portal-card-trading"
            onClick={() => onNavigate('trade')}
            className="p-5 rounded-2xl bg-[#09132e] border border-blue-900/40 hover:border-blue-500/60 cursor-pointer transition-all group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 mb-3 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Trading Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 transition-colors" />
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Live candlestick charts, level-2 order book, recent trade stream, and order execution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-mono">Execution:</span>
              <span className="text-yellow-300 font-mono font-bold">&lt; 15ms</span>
            </div>
          </div>

          {/* Module 3: Admin Requests Hub */}
          <div
            id="portal-card-requests"
            onClick={() => onNavigate('requests')}
            className="p-5 rounded-2xl bg-[#09132e] border border-blue-900/40 hover:border-yellow-400/60 cursor-pointer transition-all group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-yellow-400/15 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Requests & Refunds</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-yellow-400 transition-colors" />
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Role-gated transaction hub. Admins approve, reject, or complete user refunds and profit withdrawals.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-mono">Audit Trail:</span>
              <span className="text-yellow-300 font-mono font-bold">Enabled</span>
            </div>
          </div>

          {/* Module 4: API & Database Console */}
          <div
            id="portal-card-api"
            onClick={() => onNavigate('api-docs')}
            className="p-5 rounded-2xl bg-[#09132e] border border-blue-900/40 hover:border-blue-400/60 cursor-pointer transition-all group flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 mb-3 group-hover:scale-105 transition-transform">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>API & Database</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 transition-colors" />
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Direct testbed for SQLite endpoints (`/login`, `/register`, `/change-password`, `/api/requests`).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-mono">DB File:</span>
              <span className="text-yellow-300 font-mono font-bold">userData.db</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Supported Destination Wallets Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
        <div className="p-6 rounded-2xl bg-[#09132e] border border-blue-900/40 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span>Institutional Custodial Destination Wallets</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Designated multisig settlement channels for withdrawal and balance reconciliation
              </p>
            </div>
            <span className="text-xs font-mono text-yellow-300 bg-yellow-400/15 px-2.5 py-1 rounded border border-yellow-400/30 w-fit font-bold">
              3 Supported Networks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CLIENT_DESTINATION_WALLETS.map(w => (
              <div key={w.network} className="p-3 rounded-xl bg-[#050c1e] border border-blue-900/60">
                <div className="flex items-center justify-between text-xs mb-1 font-bold">
                  <span className="text-yellow-300">{w.network}</span>
                  <span className="text-[10px] text-blue-200/70">{w.currency}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-100 break-all select-all bg-blue-950/60 p-2 rounded border border-blue-900/40 mt-1">
                  {w.address}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Minimal Footer */}
      <footer className="border-t border-blue-900/40 py-6 px-4 sm:px-6 lg:px-8 bg-[#040817] text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">MERIDIAN <span className="text-yellow-400">BANCORP</span></span>
            <span>&bull;</span>
            <span>Private Wealth & Asset Custody</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Powered by SQLite `userData.db` &bull; Dual-tier RBAC &bull; Confidential Custody
          </p>
          <div className="flex gap-4">
            <button onClick={() => onNavigate('home')} className="hover:text-white">Home</button>
            <button onClick={() => onNavigate('login')} className="hover:text-white">Sign In</button>
            <button onClick={() => onNavigate('trade')} className="hover:text-white">Spot</button>
            <button onClick={() => onNavigate('client-dashboard')} className="hover:text-white">Portfolio</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
