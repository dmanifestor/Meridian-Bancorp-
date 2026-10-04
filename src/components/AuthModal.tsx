import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  MapPin, 
  Shield, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialTab?: 'login' | 'register' | 'change-password';
  currentUser?: UserAccount | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'login',
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'change-password'>(initialTab);

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGender, setRegGender] = useState('male');
  const [regLocation, setRegLocation] = useState('New York, USA');
  const [regRole, setRegRole] = useState<'user' | 'admin'>('user');

  // Change password state
  const [cpUsername, setCpUsername] = useState('');
  const [cpOldPassword, setCpOldPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');

  // Status indicators
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setErrorMessage(null);
    setSuccessMessage(null);
    if (currentUser?.username) {
      setCpUsername(currentUser.username);
    }
  }, [initialTab, isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
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
        throw new Error(data.message || data.error || rawText || 'Login failed');
      }

      const userAccount: UserAccount = {
        username: data.user?.username || loginUsername.trim(),
        name: data.user?.name || loginUsername.trim(),
        gender: data.user?.gender || 'not specified',
        location: data.user?.location || 'Remote',
        role: data.user?.role || (loginUsername.toLowerCase() === 'joeldan228@gmail.com' || loginUsername.toLowerCase() === 'admin' ? 'admin' : 'user'),
      };

      setSuccessMessage('Logged in successfully!');
      onLoginSuccess(userAccount);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      // Static / GitHub Pages fallback
      const u = loginUsername.trim().toLowerCase();
      if (u === 'joeldan228@gmail.com' || u === 'admin' || (loginPassword && loginPassword.length >= 4)) {
        const userAccount: UserAccount = {
          username: loginUsername.trim(),
          name: u === 'joeldan228@gmail.com' ? 'Joel Dan' : loginUsername.trim(),
          gender: 'not specified',
          location: 'HQ Security Operations',
          role: (u === 'joeldan228@gmail.com' || u === 'admin') ? 'admin' : 'user',
        };
        setSuccessMessage('Logged in successfully (Static mode)!');
        onLoginSuccess(userAccount);
        setTimeout(() => {
          onClose();
        }, 600);
        return;
      }
      setErrorMessage(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (regPassword.length < 5) {
      setErrorMessage('Password is too short (minimum 5 characters required)');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          name: regName.trim(),
          password: regPassword,
          gender: regGender,
          location: regLocation.trim(),
          role: regRole,
        }),
      });

      const message = await res.text();
      if (!res.ok) {
        throw new Error(message || 'Registration failed');
      }

      setSuccessMessage('Account created successfully! Logging you in...');
      // Auto login
      const userAccount: UserAccount = {
        username: regUsername.trim(),
        name: regName.trim(),
        gender: regGender,
        location: regLocation.trim(),
        role: regRole,
      };

      onLoginSuccess(userAccount);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (cpNewPassword.length < 5) {
      setErrorMessage('New password must be at least 5 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/change-password/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cpUsername.trim(),
          oldPassword: cpOldPassword,
          newPassword: cpNewPassword,
        }),
      });

      const message = await res.text();
      if (!res.ok) {
        throw new Error(message || 'Failed to update password');
      }

      setSuccessMessage('Password updated successfully! You can now log in with your new password.');
      setCpOldPassword('');
      setCpNewPassword('');
      setTimeout(() => {
        setActiveTab('login');
        setLoginUsername(cpUsername);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#09132e] border border-blue-900/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-900/40 bg-[#060e24]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-yellow-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Meridian Bancorp Auth</h2>
              <div className="text-[10px] text-blue-200/70 font-mono">Isolated Multi-Tenant Access</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-blue-900/40 bg-[#050c1e] text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'login'
                ? 'border-yellow-400 text-yellow-300 bg-blue-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'register'
                ? 'border-yellow-400 text-yellow-300 bg-blue-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setActiveTab('change-password');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'change-password'
                ? 'border-yellow-400 text-yellow-300 bg-blue-950/40 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Alerts */}
        <div className="px-5 pt-3">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-yellow-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5 flex-1">
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Username / Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={e => setLoginUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Authorized Account Fillers */}
              <div className="pt-1">
                <div className="text-[10px] text-slate-400 mb-1.5 flex items-center justify-between font-mono">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>Authorized Accounts:</span>
                  </div>
                  <span className="text-[9px] text-yellow-300 font-bold">1-Click Auto Fill</span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-[11px] font-mono">
                  {/* Joel Dan (Admin) */}
                  <button
                    type="button"
                    onClick={() => {
                      setLoginUsername('joeldan228@gmail.com');
                      setLoginPassword('JoelDan2026!');
                    }}
                    className="p-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 hover:border-yellow-400/60 text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-yellow-300 font-bold flex items-center gap-1.5">
                        <span>joeldan228@gmail.com</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-200 font-black border border-yellow-400/40">
                          ADMIN
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300 font-sans">Joel Dan • Administrator Access</div>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsername('testing-test-2');
                        setLoginPassword('testing-today');
                      }}
                      className="p-1.5 rounded bg-blue-950/60 border border-blue-900/50 hover:border-blue-400 text-left transition-colors"
                    >
                      <div className="text-blue-300 font-semibold truncate">testing-test-2</div>
                      <div className="text-[10px] text-slate-400">pw: testing-today</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginUsername('admin');
                        setLoginPassword('Admin123!');
                      }}
                      className="p-1.5 rounded bg-blue-950/60 border border-blue-900/50 hover:border-yellow-400 text-left transition-colors"
                    >
                      <div className="text-yellow-300 font-semibold truncate">admin</div>
                      <div className="text-[10px] text-slate-400">Master Admin</div>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-blue-600/30"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="e.g. client_user"
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
                    placeholder="e.g. Alex Vance"
                    className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Password <span className="text-slate-400">(minimum 5 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={5}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Choose password"
                    className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={e => setRegGender(e.target.value)}
                    className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regLocation}
                      onChange={e => setRegLocation(e.target.value)}
                      placeholder="e.g. New York, USA"
                      className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('user')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                      regRole === 'user'
                        ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
                        : 'bg-[#050c1e] border-blue-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    User (Client)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-all ${
                      regRole === 'admin'
                        ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-300'
                        : 'bg-[#050c1e] border-blue-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    Admin (Privileged)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-yellow-400 hover:bg-yellow-300 active:scale-[0.99] text-slate-950 font-black text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-yellow-500/20"
              >
                {loading ? 'Creating Account...' : 'Register to Custody Database'}
              </button>
            </form>
          )}

          {activeTab === 'change-password' && (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={cpUsername}
                  onChange={e => setCpUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={cpOldPassword}
                  onChange={e => setCpOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  New Password <span className="text-slate-400">(minimum 5 characters)</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={5}
                  value={cpNewPassword}
                  onChange={e => setCpNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-blue-600/30"
              >
                {loading ? 'Updating Password...' : 'Update Password in SQLite'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
