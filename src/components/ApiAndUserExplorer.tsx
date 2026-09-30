import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Database, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  UserCheck, 
  Copy, 
  Check, 
  FileCode, 
  Play, 
  Users, 
  MapPin, 
  ShieldAlert, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { UserAccount, ApiTestResult } from '../types';

interface ApiAndUserExplorerProps {
  currentUser: UserAccount | null;
  onSelectUserForLogin: (username: string) => void;
  onOpenRegisterModal: () => void;
}

interface EndpointPreset {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  description: string;
  defaultBody?: string;
}

const PRESETS: EndpointPreset[] = [
  {
    id: 'get-register',
    name: '1. Get All Registered Users',
    method: 'GET',
    path: '/register',
    description: 'Queries SQLite userData.db: SELECT * FROM user',
  },
  {
    id: 'post-register',
    name: '2. Register New User',
    method: 'POST',
    path: '/register',
    description: 'Hashes password with bcrypt and inserts record into user table',
    defaultBody: JSON.stringify(
      {
        username: `trader_${Math.floor(Math.random() * 900 + 100)}`,
        name: 'Alex Vance',
        password: 'traderpass123',
        gender: 'male',
        location: 'Singapore',
        role: 'user'
      },
      null,
      2
    ),
  },
  {
    id: 'post-login-admin',
    name: '3. Admin Login (Joel Dan)',
    method: 'POST',
    path: '/login/',
    description: 'Validates administrator credentials for Joel Dan (joeldan228@gmail.com / JoelDan2026!)',
    defaultBody: JSON.stringify(
      {
        username: 'joeldan228@gmail.com',
        password: 'JoelDan2026!',
      },
      null,
      2
    ),
  },
  {
    id: 'post-login-client',
    name: '4. Client Login (testing-test-2)',
    method: 'POST',
    path: '/login/',
    description: 'Finds user by username, validates bcrypt password match',
    defaultBody: JSON.stringify(
      {
        username: 'testing-test-2',
        password: 'testing-today',
      },
      null,
      2
    ),
  },
  {
    id: 'put-change-password',
    name: '5. Change Password',
    method: 'PUT',
    path: '/change-password/',
    description: 'Verifies old password match and updates new bcrypt hashed password',
    defaultBody: JSON.stringify(
      {
        username: 'testing-test-2',
        oldPassword: 'testing-today',
        newPassword: 'testing-today',
      },
      null,
      2
    ),
  },
];

export const ApiAndUserExplorer: React.FC<ApiAndUserExplorerProps> = ({
  currentUser,
  onSelectUserForLogin,
  onOpenRegisterModal,
}) => {
  const [activeTab, setActiveTab] = useState<'api-client' | 'database'>('api-client');
  const [selectedPreset, setSelectedPreset] = useState<EndpointPreset>(PRESETS[0]);
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT'>('GET');
  const [requestPath, setRequestPath] = useState('/register');
  const [requestBody, setRequestBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<ApiTestResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Database Explorer state
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(false);
  const [dbSearch, setDbSearch] = useState('');
  const [dbError, setDbError] = useState<string | null>(null);

  // Fetch users from SQLite DB
  const fetchDbUsers = async () => {
    setIsDbLoading(true);
    setDbError(null);
    try {
      const res = await fetch('/register');
      if (!res.ok) throw new Error('Failed to query SQLite database');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setDbError(err.message || 'Error querying database');
    } finally {
      setIsDbLoading(false);
    }
  };

  useEffect(() => {
    fetchDbUsers();
  }, []);

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedPreset(preset);
    setRequestMethod(preset.method);
    setRequestPath(preset.path);
    setRequestBody(preset.defaultBody || '');
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
      };

      if (requestMethod !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(requestPath, options);
      const durationMs = Math.round(performance.now() - startTime);
      const text = await res.text();

      let parsedBody: any;
      try {
        parsedBody = JSON.parse(text);
      } catch {
        parsedBody = text;
      }

      setApiResult({
        endpoint: requestPath,
        method: requestMethod,
        status: res.status,
        statusText: res.statusText || (res.ok ? 'OK' : 'Error'),
        response: parsedBody,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
      });

      // If user was created or password updated, refresh DB view
      if (res.ok && (requestPath.includes('register') || requestPath.includes('change-password'))) {
        fetchDbUsers();
      }
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      setApiResult({
        endpoint: requestPath,
        method: requestMethod,
        status: 500,
        statusText: 'Network Error',
        response: err.message,
        durationMs,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (!apiResult) return;
    const content = typeof apiResult.response === 'object'
      ? JSON.stringify(apiResult.response, null, 2)
      : String(apiResult.response);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter users
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(dbSearch.toLowerCase()) ||
    u.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
    u.location.toLowerCase().includes(dbSearch.toLowerCase())
  );

  return (
    <div className="flex-1 p-3 sm:p-5 max-w-7xl mx-auto w-full flex flex-col gap-4 text-slate-100">
      {/* Top Banner */}
      <div className="bg-[#09132e] border border-blue-900/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-yellow-400 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Backend Integration & API Console</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-semibold">
                app.js + app.http + userData.db
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Live SQLite authentication backend with bcrypt encryption, REST endpoints, and database explorer.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-[#050c1e] p-1 rounded-lg border border-blue-900/60 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('api-client')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'api-client'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-yellow-300" />
            <span>Interactive HTTP Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-yellow-300" />
            <span>SQLite Database ({users.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'api-client' ? (
        /* HTTP CLIENT VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Preset Endpoints */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="bg-[#09132e] border border-blue-900/40 rounded-xl p-4 flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Endpoints from app.http</span>
                <span className="text-[10px] font-mono text-yellow-300 font-semibold">5 test suites</span>
              </div>

              <div className="space-y-2">
                {PRESETS.map(preset => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                        isSelected
                          ? 'bg-blue-950/80 border-yellow-400/60 shadow-sm'
                          : 'bg-[#050c1e] border-blue-900/40 hover:border-blue-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white truncate">{preset.name}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            preset.method === 'GET'
                              ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                              : preset.method === 'POST'
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          {preset.method}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate mb-1">{preset.path}</div>
                      <div className="text-[10px] text-slate-300 line-clamp-2">{preset.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Execution & Response Viewer */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Request Builder Card */}
            <div className="bg-[#09132e] border border-blue-900/40 rounded-xl p-4 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">HTTP Request Dispatcher</span>
                <span className="text-[10px] font-mono text-slate-400">Target: SQLite Server</span>
              </div>

              {/* URL Bar */}
              <div className="flex items-center gap-2">
                <select
                  value={requestMethod}
                  onChange={e => setRequestMethod(e.target.value as any)}
                  className="bg-[#050c1e] border border-blue-900/60 rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-yellow-300 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>

                <input
                  type="text"
                  value={requestPath}
                  onChange={e => setRequestPath(e.target.value)}
                  className="flex-1 bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-yellow-400"
                />

                <button
                  onClick={handleExecuteRequest}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-yellow-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Send Request</span>
                    </>
                  )}
                </button>
              </div>

              {/* JSON Body editor (for POST / PUT) */}
              {requestMethod !== 'GET' && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    JSON Payload Body (application/json)
                  </label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={e => setRequestBody(e.target.value)}
                    className="w-full bg-[#050c1e] border border-blue-900/60 rounded-lg p-2.5 text-xs font-mono text-yellow-300/90 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              )}
            </div>

            {/* Response Card */}
            <div className="bg-[#09132e] border border-blue-900/40 rounded-xl p-4 shadow-md flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Server Response Output</span>
                  {apiResult && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        apiResult.status >= 200 && apiResult.status < 300
                          ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {apiResult.status} {apiResult.statusText}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  {apiResult && (
                    <>
                      <span>{apiResult.durationMs}ms</span>
                      <span>•</span>
                      <span>{apiResult.timestamp}</span>
                      <button
                        onClick={handleCopyResponse}
                        className="text-slate-300 hover:text-white flex items-center gap-1 bg-blue-950/60 px-2 py-1 rounded border border-blue-900/50"
                      >
                        {copied ? <Check className="w-3 h-3 text-yellow-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 mt-3 bg-[#050c1e] border border-blue-900/60 rounded-lg p-3 overflow-auto max-h-[350px]">
                {apiResult ? (
                  <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap">
                    {typeof apiResult.response === 'object'
                      ? JSON.stringify(apiResult.response, null, 2)
                      : String(apiResult.response)}
                  </pre>
                ) : (
                  <div className="text-center py-10 text-slate-500 text-xs font-mono">
                    Select a preset or click "Send Request" to execute an endpoint.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DATABASE VIEW */
        <div className="bg-[#09132e] border border-blue-900/40 rounded-xl p-5 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-yellow-400" />
                <span>SQLite `userData.db` &bull; `user` Table Records</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Direct view of rows from `/register` GET endpoint backed by SQLite sqlite3 driver.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search username or location..."
                value={dbSearch}
                onChange={e => setDbSearch(e.target.value)}
                className="bg-[#050c1e] border border-blue-900/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
              <button
                onClick={fetchDbUsers}
                disabled={isDbLoading}
                className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold border border-blue-900/60 transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDbLoading ? 'animate-spin' : ''}`} />
                <span>Refresh DB</span>
              </button>
              <button
                onClick={onOpenRegisterModal}
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>+ New User</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-blue-900/40 bg-[#050c1e] text-blue-200 font-mono text-[11px]">
                  <th className="py-2.5 px-4">#</th>
                  <th className="py-2.5 px-4">Username</th>
                  <th className="py-2.5 px-4">Full Name</th>
                  <th className="py-2.5 px-4">Gender</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/30 font-mono">
                {filteredUsers.map((u, idx) => (
                  <tr key={u.username + idx} className="hover:bg-blue-950/40 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{u.username}</span>
                        {currentUser?.username === u.username && (
                          <span className="text-[10px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-1 rounded font-sans font-semibold">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-200">{u.name}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded capitalize bg-blue-950/80 text-blue-200 border border-blue-900/60">
                        {u.gender}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{u.location}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onSelectUserForLogin(u.username)}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                      >
                        <UserCheck className="w-3 h-3 text-yellow-300" />
                        <span>Login As</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">
                      No users found matching "{dbSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
