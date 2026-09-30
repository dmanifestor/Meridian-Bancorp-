import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  HelpCircle,
  Landmark,
  ChevronRight,
  Shield
} from 'lucide-react';
import { UserAccount, ActiveTab } from '../types';

interface LoginPageProps {
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onLogout: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onNavigate,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [location, setLocation] = useState('New York, USA');
  const [role, setRole] = useState<'user' | 'admin'>('user');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both your identifier and password.');
      return;
    }

    setIsLoading(true);

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

      setSuccessMessage(`Credentials verified. Welcome back, ${authenticatedUser.name}.`);
      onLoginSuccess(authenticatedUser);

      setTimeout(() => {
        if (authenticatedUser.role === 'admin') {
          onNavigate('requests');
        } else {
          onNavigate('client-dashboard');
        }
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please recheck your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          name: name.trim(),
          password,
          gender,
          location: location.trim(),
          role,
        }),
      });

      const message = await res.text();

      if (!res.ok) {
        throw new Error(message || 'Account registration failed.');
      }

      setSuccessMessage('Private Client account initialized successfully! Logging you in...');
      
      const newUser: UserAccount = {
        username: username.trim(),
        name: name.trim(),
        gender,
        location: location.trim(),
        role,
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
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setAuthMode('login');
    setErrorMessage(null);
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-56px)] bg-[#050c1e] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Decorative Grid and Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-yellow-400/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-md z-10 my-auto">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-yellow-400 p-0.5 shadow-xl shadow-blue-600/30 mb-3">
            <div className="w-full h-full bg-[#050c1e] rounded-[14px] flex items-center justify-center">
              <Landmark className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            MERIDIAN <span className="text-yellow-400">BANCORP</span>
          </h1>
          <p className="text-xs text-blue-200/80 font-medium tracking-wide mt-1">
            Institutional Digital Custody & Private Wealth Terminal
          </p>
        </div>

        {/* Current Active User Banner if already signed in */}
        {currentUser ? (
          <div className="bg-[#09132e] border border-blue-900/50 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 pb-4 border-b border-blue-900/40">
              <div className="w-10 h-10 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center justify-center font-bold text-sm">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white truncate">{currentUser.name}</h2>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    currentUser.role === 'admin' 
                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40' 
                      : 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                  }`}>
                    {currentUser.role || 'Client'}
                  </span>
                </div>
                <div className="text-xs font-mono text-yellow-300/80 truncate">{currentUser.username}</div>
              </div>
            </div>

            <div className="pt-4 space-y-2.5">
              <button
                onClick={() => {
                  if (currentUser.role === 'admin') {
                    onNavigate('requests');
                  } else {
                    onNavigate('client-dashboard');
                  }
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                id="enter-client-portal-btn"
              >
                <span>Enter Your Private Banking Portal</span>
                <ArrowRight className="w-4 h-4 text-yellow-300" />
              </button>

              <button
                onClick={onLogout}
                className="w-full py-2.5 bg-blue-950/60 hover:bg-blue-900/60 text-slate-300 hover:text-rose-400 text-xs font-semibold rounded-xl border border-blue-900/60 transition-colors text-center"
                id="sign-out-switch-btn"
              >
                Sign Out / Switch Account
              </button>
            </div>
          </div>
        ) : (
          /* User Login Interface Form */
          <div className="bg-[#09132e] border border-blue-900/50 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-[#050c1e] p-1 mb-6 border border-blue-900/60">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-client-login"
              >
                Client Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id="tab-open-account"
              >
                Register Account
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMessage && (
              <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl text-yellow-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="login-username">
                    Client Email or Account ID
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. joeldan228@gmail.com"
                      className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300" htmlFor="login-password">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-[11px] text-blue-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Security Help</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
                  id="submit-login-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Custody Account</span>
                      <ArrowRight className="w-4 h-4 text-yellow-300" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-username">
                    Unique Username / Email Identifier
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. corporate_desk_01"
                    className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-name">
                    Full Legal / Corporate Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alexander Vance"
                    className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-password">
                    Account Access Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters with symbols"
                    className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Corporate / Entity">Corporate / Entity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                      className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="user">User (Client)</option>
                      <option value="admin">Admin (Manager)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jurisdiction / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Zurich, Switzerland"
                    className="w-full bg-[#050c1e] border border-blue-900/60 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
                  id="submit-register-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Initializing Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Custody Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Quick 1-Click Access for Authorized Accounts */}
            <div className="mt-6 pt-5 border-t border-blue-900/40">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Authorized Test Accounts</span>
                </span>
                <span className="text-[10px] text-yellow-300 font-mono">1-Click Fill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Joel Dan Admin Account */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('joeldan228@gmail.com', 'JoelDan2026!')}
                  className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-900/50 hover:border-yellow-400/50 text-left transition-all group"
                  id="quick-fill-joel-login-page"
                >
                  <div className="text-yellow-300 font-bold text-xs flex items-center justify-between">
                    <span>Joel Dan</span>
                    <span className="text-[9px] bg-yellow-400/20 px-1.5 py-0.5 rounded text-yellow-200 font-mono">ADMIN</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono truncate mt-0.5">joeldan228@gmail.com</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pass: JoelDan2026!</div>
                </button>

                {/* Generic Verified Client Account */}
                <button
                  type="button"
                  onClick={() => handleQuickFill('testing-test-2', 'testing-today')}
                  className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-900/50 hover:border-blue-400 text-left transition-all group relative overflow-hidden"
                  id="quick-fill-client-login-page"
                >
                  <div className="text-blue-300 font-bold text-xs flex items-center justify-between">
                    <span>Client Account</span>
                    <span className="text-[9px] bg-blue-600/30 px-1.5 py-0.5 rounded text-blue-200 font-mono">CLIENT</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono truncate mt-0.5">testing-test-2</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Pass: testing-today ($48k)</div>
                </button>
              </div>
            </div>

            {/* Help Drawer Info */}
            {showHelp && (
              <div className="mt-4 p-3.5 bg-[#050c1e] border border-blue-900/60 rounded-xl text-xs text-slate-300 space-y-1.5 animate-in fade-in">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-yellow-400" />
                  <span>Meridian Bancorp Security Protocol</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your Meridian Bancorp session is encrypted using standard banking transport security protocols. Password credentials are hashed via salted bcrypt inside the database. If you experience authentication difficulties, contact your dedicated relationship officer or use the 1-click authorized keys above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Institutional Security Guarantee Banner at Bottom */}
      <div className="max-w-4xl mx-auto w-full mt-10 z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-blue-900/40">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-950/40 border border-blue-900/40">
            <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Segregated Custody</div>
              <div className="text-[11px] text-slate-300 mt-0.5">1:1 Reserve backed assets with institutional multi-party computation.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-950/40 border border-blue-900/40">
            <Building2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Private Wealth Desk</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Dedicated concierge treasury management and withdrawal facilitation.</div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-950/40 border border-blue-900/40">
            <Lock className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">FIPS 140-2 Validated</div>
              <div className="text-[11px] text-slate-300 mt-0.5">Continuous cryptographic audit logs and end-to-end ledger verification.</div>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono mt-6">
          © 2026 Meridian Bancorp • Private Banking & Digital Asset Custody • All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
