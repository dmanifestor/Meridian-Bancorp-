import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowLeftRight, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronDown, 
  Landmark,
  Terminal,
  Home,
  User,
  LogOut,
  Key,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { ActiveTab, UserWallet, UserAccount } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  wallet: UserWallet;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSwap: () => void;
  latency: number;
  currentUser: UserAccount | null;
  onOpenAuth: (tab?: 'login' | 'register' | 'change-password') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wallet,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSwap,
  latency,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="border-b border-blue-900/40 bg-[#070e24]/95 backdrop-blur-md sticky top-0 z-40 px-2 sm:px-4 lg:px-6 h-14 flex items-center justify-between select-none">
        {/* Left: Brand & Desktop Navigation */}
        <div className="flex items-center gap-2 sm:gap-6">
          {/* Mobile Hamburger Toggle (Touch target 44px) */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden touch-target text-slate-300 hover:text-white hover:bg-blue-950/60 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-yellow-400" /> : <Menu className="w-5 h-5 text-white" />}
          </button>

          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer group"
            id="brand-logo-btn"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-blue-500 to-yellow-400 p-0.5 shadow-lg shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-all flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#050c1e] rounded-[6px] flex items-center justify-center">
                <Landmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-extrabold text-xs sm:text-base tracking-tight text-white whitespace-nowrap">
                  MERIDIAN <span className="text-yellow-400 font-black">BANCORP</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-blue-600/30 text-blue-200 border border-blue-500/40 font-semibold">
                  PRIVATE
                </span>
              </div>
              <span className="text-[9px] font-medium text-slate-400 tracking-wider hidden lg:block">
                Private Wealth & Digital Custody
              </span>
            </div>
          </div>

          {/* Desktop Primary Nav Items */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-home-btn"
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'home' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              id="nav-login-btn"
              onClick={() => handleNavClick('login')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'login' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-yellow-400" />
              <span>User Login</span>
            </button>
            <button
              id="nav-spot-btn"
              onClick={() => handleNavClick('trade')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'trade' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              Spot
            </button>
            <button
              id="nav-perps-btn"
              onClick={() => handleNavClick('perps')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'perps' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              Futures
              <span className="text-[10px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-1 py-0.2 rounded font-mono font-bold">
                100x
              </span>
            </button>
            <button
              id="nav-swap-btn"
              onClick={onOpenSwap}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'swap' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Instant Swap
            </button>
            <button
              id="nav-markets-btn"
              onClick={() => handleNavClick('markets')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'markets' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              Markets
            </button>
            <button
              id="nav-portfolio-btn"
              onClick={() => handleNavClick('portfolio')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'portfolio' 
                  ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-slate-300" />
              Portfolio
            </button>
            <button
              id="nav-client-dashboard-btn"
              onClick={() => handleNavClick('client-dashboard')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'client-dashboard' 
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <User className="w-3.5 h-3.5 text-yellow-400" />
              <span>Client Dashboard</span>
              <span className="text-[10px] px-1 rounded bg-yellow-400/20 text-yellow-300 font-mono font-bold">$48k</span>
            </button>
            <button
              id="nav-requests-btn"
              onClick={() => handleNavClick('requests')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'requests' 
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-yellow-400" />
              <span>Requests</span>
              {currentUser?.role === 'admin' ? (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-400/30 text-yellow-200 font-mono font-black border border-yellow-400/40">
                  ADMIN
                </span>
              ) : (
                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-950 text-blue-200 font-mono">
                  Refunds
                </span>
              )}
            </button>
            <button
              id="nav-api-btn"
              onClick={() => handleNavClick('api-docs')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'api-docs' 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-300 hover:text-white hover:bg-blue-950/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-blue-300" />
              <span>API & DB</span>
            </button>
          </nav>
        </div>

        {/* Right: Actions, Balance & System Status */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Network & Latency Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/80 border border-blue-900/40 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-slate-400">L2 Engine:</span>
            <span className="text-yellow-300 font-medium">{latency}ms</span>
          </div>

          {/* Deposit Button (Yellow & White accent) */}
          <button
            id="quick-deposit-btn"
            onClick={onOpenDeposit}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[38px] bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-sm shadow-yellow-500/20 transition-all touch-manipulation"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline">Deposit</span>
          </button>

          {/* Withdraw Button */}
          <button
            id="quick-withdraw-btn"
            onClick={onOpenWithdraw}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] bg-blue-900/40 hover:bg-blue-800/50 active:scale-95 text-white font-semibold text-xs rounded-lg border border-blue-700/50 transition-all touch-manipulation"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>Withdraw</span>
          </button>

          {/* Wallet Balance Dropdown Trigger */}
          <div className="relative">
            <button
              id="wallet-dropdown-trigger"
              onClick={() => setShowWalletDropdown(!showWalletDropdown)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg bg-blue-950/70 hover:bg-blue-900/60 border border-blue-900/50 text-xs transition-colors min-h-[36px] sm:min-h-[38px]"
            >
              <div className="w-2 h-2 rounded-full bg-yellow-400 shrink-0"></div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-blue-200/70 font-mono leading-none hidden sm:block">Balance</span>
                <span className="font-mono font-bold text-white text-[11px] sm:text-xs leading-tight">
                  ${wallet.totalUsd >= 1000 ? `${(wallet.totalUsd / 1000).toFixed(1)}k` : wallet.totalUsd.toFixed(0)}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Wallet Dropdown Panel */}
            {showWalletDropdown && (
              <div 
                id="wallet-dropdown-menu"
                className="absolute right-0 mt-2 w-64 sm:w-72 max-w-[calc(100vw-1rem)] bg-[#09132e] border border-blue-900/60 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="flex justify-between items-center pb-2 border-b border-blue-900/40">
                  <span className="text-xs font-semibold text-white">Wallet Overview</span>
                  <span className="text-[11px] font-mono text-yellow-300 font-medium">
                    +${wallet.unrealizedPnl.toFixed(2)} (PnL)
                  </span>
                </div>
                <div className="py-2.5 space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(wallet.balances).map(([asset, data]) => (
                    <div key={asset} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{asset}</span>
                      <div className="text-right font-mono">
                        <div className="text-slate-100 font-medium">{data.free} {asset}</div>
                        <div className="text-[10px] text-blue-300">${data.usdValue.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-blue-900/40 flex gap-2">
                  <button
                    onClick={() => {
                      setShowWalletDropdown(false);
                      handleNavClick('portfolio');
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-colors text-center shadow"
                  >
                    Manage Portfolio
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Session Profile */}
          <div className="relative">
            {currentUser ? (
              <div>
                <button
                  id="user-profile-trigger"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 min-h-[36px] sm:min-h-[38px] rounded-lg bg-blue-950/80 border border-blue-900/60 hover:border-blue-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-[11px] font-semibold text-white leading-none truncate max-w-[90px]">
                      {currentUser.name || currentUser.username}
                    </span>
                    <span className="text-[9px] text-blue-200/80 font-mono">
                      {currentUser.role === 'admin' ? 'Admin' : 'Client'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
                </button>

                {/* User Dropdown */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-60 sm:w-64 max-w-[calc(100vw-1rem)] bg-[#09132e] border border-blue-900/60 rounded-xl shadow-2xl p-3 z-50 text-xs">
                    <div className="pb-2.5 border-b border-blue-900/40">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          currentUser.role === 'admin' 
                            ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40' 
                            : 'bg-blue-900/40 text-blue-200 border border-blue-700/40'
                        }`}>
                          {currentUser.role || 'user'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-yellow-300 truncate">@{currentUser.username}</div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                        <span className="capitalize">{currentUser.gender}</span>
                        <span>•</span>
                        <span className="truncate">{currentUser.location}</span>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleNavClick('client-dashboard');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-blue-900/40 text-slate-200 hover:text-white flex items-center gap-2 transition-colors min-h-[40px]"
                      >
                        <User className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <div className="flex justify-between items-center w-full">
                          <span>My Portfolio & Custody</span>
                          <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded font-mono font-bold">$48k</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleNavClick('requests');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-blue-900/40 text-slate-200 hover:text-white flex items-center gap-2 transition-colors min-h-[40px]"
                      >
                        <FileText className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <div className="flex justify-between items-center w-full">
                          <span>Requests & Refunds</span>
                          {currentUser.role === 'admin' && (
                            <span className="text-[9px] bg-yellow-400/20 text-yellow-300 px-1 rounded font-mono font-bold">Admin</span>
                          )}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenAuth('change-password');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-blue-900/40 text-slate-200 hover:text-white flex items-center gap-2 transition-colors min-h-[40px]"
                      >
                        <Key className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          handleNavClick('api-docs');
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-blue-900/40 text-slate-200 hover:text-white flex items-center gap-2 transition-colors min-h-[40px]"
                      >
                        <Terminal className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span>API & DB Console</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-blue-900/40">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-2 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 transition-colors min-h-[40px]"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="sign-in-header-btn"
                onClick={() => handleNavClick('login')}
                className="px-2.5 sm:px-3 py-1.5 min-h-[36px] sm:min-h-[38px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                <span className="hidden sm:inline">User Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Slide-Down Navigation Menu (Drawer for screens < 768px) */}
      {mobileMenuOpen && (
        <div 
          id="mobile-navigation-drawer"
          className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-[#070e24]/95 backdrop-blur-md z-30 flex flex-col p-4 border-b border-blue-900/50 overflow-y-auto animate-in slide-in-from-top duration-200"
        >
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 pt-1 pb-1">
              Navigation
            </div>
            
            <button
              onClick={() => handleNavClick('home')}
              className={`touch-target w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'home' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-yellow-400" />
                <span>Home Page</span>
              </div>
              <span className="text-xs text-blue-200/70 font-mono">Overview & Portal</span>
            </button>

            <button
              onClick={() => handleNavClick('login')}
              className={`touch-target w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'login' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-yellow-400" />
                <span>Login Page</span>
              </div>
              <span className="text-xs text-blue-200/70 font-mono">Account Portal</span>
            </button>

            <button
              onClick={() => handleNavClick('trade')}
              className={`touch-target w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'trade' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <span>Spot Trading</span>
              </div>
              <span className="text-xs text-blue-200/70 font-mono">Live Pro Terminal</span>
            </button>

            <button
              onClick={() => handleNavClick('perps')}
              className={`touch-target w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'perps' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span>Perpetuals / Futures</span>
              </div>
              <span className="text-xs text-yellow-300 font-mono font-bold">100x Leverage</span>
            </button>

            <button
              onClick={() => handleNavClick('portfolio')}
              className={`touch-target w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'portfolio' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-yellow-400" />
                <span>Portfolio & Balances</span>
              </div>
              <span className="text-xs text-slate-300 font-mono">
                ${wallet.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </button>

            {/* Private Client Dashboard Nav Item */}
            <button
              onClick={() => handleNavClick('client-dashboard')}
              className={`touch-target w-full px-4 py-3.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                activeTab === 'client-dashboard' 
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-lg' 
                  : 'bg-blue-950/40 text-white border border-blue-900/50 hover:bg-blue-900/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white">{currentUser?.name || 'Private Client Portfolio'}</div>
                  <div className="text-[11px] text-yellow-300/80 font-normal">Private Custody Dashboard</div>
                </div>
              </div>
              <span className="text-xs font-mono font-black bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-md">
                $47,986.00
              </span>
            </button>

            {/* Requests & Refunds Tab Nav Item */}
            <button
              onClick={() => handleNavClick('requests')}
              className={`touch-target w-full px-4 py-3.5 rounded-xl text-sm font-bold flex items-center justify-between transition-all ${
                activeTab === 'requests' 
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 shadow-lg' 
                  : 'bg-blue-950/40 text-slate-200 border border-blue-900/50 hover:bg-blue-900/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-white">Requests & Refunds</div>
                  <div className="text-[11px] text-slate-400 font-normal">
                    {currentUser?.role === 'admin' ? 'Admin Approval Console' : 'User Refund Requests'}
                  </div>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                currentUser?.role === 'admin' ? 'bg-yellow-400 text-slate-950 font-black' : 'bg-blue-900 text-blue-200'
              }`}>
                {currentUser?.role === 'admin' ? 'ADMIN' : 'REFUND'}
              </span>
            </button>

            <button
              onClick={() => handleNavClick('api-docs')}
              className={`touch-target w-full px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                activeTab === 'api-docs' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-blue-950/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-blue-300" />
                <span>API & DB Console</span>
              </div>
              <span className="text-[10px] bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded font-mono">
                SQLite
              </span>
            </button>

            {/* Mobile Actions: Deposit & Withdraw */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-900/50 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDeposit();
                }}
                className="touch-target py-3 px-3 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit Funds</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenWithdraw();
                }}
                className="touch-target py-3 px-3 bg-blue-900/50 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs rounded-xl border border-blue-700/50 transition-all flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4 text-yellow-400" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
