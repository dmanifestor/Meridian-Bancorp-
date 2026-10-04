import React, { useState, useEffect, useCallback } from 'react';
import { 
  MarketPair, 
  CandleData, 
  OrderBookData, 
  Trade, 
  UserWallet, 
  Position, 
  UserOrder, 
  TimeFrame, 
  ActiveTab 
} from './types';
import { 
  INITIAL_MARKETS, 
  INITIAL_WALLET, 
  INITIAL_POSITIONS, 
  INITIAL_ORDERS, 
  generateCandles, 
  generateOrderBook, 
  generateRecentTrades 
} from './data/mockData';
import { Header } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { MarketOverviewBar } from './components/MarketOverviewBar';
import { TradingChart } from './components/TradingChart';
import { OrderBook } from './components/OrderBook';
import { RecentTrades } from './components/RecentTrades';
import { OrderForm } from './components/OrderForm';
import { PositionsTable } from './components/PositionsTable';
import { SwapModal } from './components/SwapModal';
import { DepositWithdrawModal } from './components/DepositWithdrawModal';
import { MarketScreener } from './components/MarketScreener';
import { PortfolioView } from './components/PortfolioView';
import { ApiAndUserExplorer } from './components/ApiAndUserExplorer';
import { ClientDashboard } from './components/ClientDashboard';
import { RequestsManager } from './components/RequestsManager';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { UserAccount } from './types';

export function App() {
  // State
  const [markets, setMarkets] = useState<MarketPair[]>(INITIAL_MARKETS);
  const [activePair, setActivePair] = useState<MarketPair>(INITIAL_MARKETS[0]);
  const [timeframe, setTimeframe] = useState<TimeFrame>('15m');
  
  // Initial tab resolution: supports /#loginpage or /#homepage as the first web app output
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (typeof window !== 'undefined') {
      const raw = window.location.hash.replace('#', '').replace('/', '').toLowerCase();
      if (raw === 'loginpage' || raw === 'login' || raw === 'signin') {
        return 'login';
      }
      if (raw === 'homepage' || raw === 'home') {
        return 'home';
      }
      if (raw === 'requests' || raw === 'requests-tab') {
        return 'requests';
      }
      if (raw === 'client-dashboard' || raw === 'client') {
        return 'client-dashboard';
      }
      if (raw === 'portfolio') {
        return 'portfolio';
      }
      if (raw === 'markets') {
        return 'markets';
      }
      if (raw === 'api-docs' || raw === 'api') {
        return 'api-docs';
      }
      if (raw === 'trade' || raw === 'spot') {
        return 'trade';
      }
      if (raw === 'perps' || raw === 'futures') {
        return 'perps';
      }
    }
    // Default to 'home' per user request: "Want /#loginpage or /#homepage show be the first web app output"
    return 'home';
  });

  const [candles, setCandles] = useState<CandleData[]>(() => generateCandles(INITIAL_MARKETS[0].price, 60, '15m'));
  const [orderBook, setOrderBook] = useState<OrderBookData>(() => generateOrderBook(INITIAL_MARKETS[0].price, INITIAL_MARKETS[0].precision));
  const [trades, setTrades] = useState<Trade[]>(() => generateRecentTrades(INITIAL_MARKETS[0].price, INITIAL_MARKETS[0].precision));
  const [wallet, setWallet] = useState<UserWallet>(INITIAL_WALLET);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [orders, setOrders] = useState<UserOrder[]>(INITIAL_ORDERS);
  const [selectedOrderBookPrice, setSelectedOrderBookPrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<'buy' | 'sell' | null>(null);
  const [latency, setLatency] = useState<number>(14);

  // Modals
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [depWithModalOpen, setDepWithModalOpen] = useState(false);
  const [depWithMode, setDepWithMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'change-password'>('login');

  // Active User Account (loaded from SQLite DB or localStorage)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('meridian_user') || localStorage.getItem('bit_trade_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.role) {
          parsed.role = (parsed.username === 'joeldan228@gmail.com' || parsed.username === 'admin') ? 'admin' : 'user';
        }
        return parsed;
      }
      return {
        username: 'joeldan228@gmail.com',
        name: 'Joel Dan',
        gender: 'Male',
        location: 'HQ Security Operations',
        role: 'admin'
      };
    } catch {
      return null;
    }
  });

  // Navigate helper that keeps URL hash in sync
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    const hash = tab === 'home' ? 'homepage' : tab === 'login' ? 'loginpage' : tab;
    window.location.hash = hash;
  };

  // Handle URL hash changes (e.g. #loginpage, #homepage, #requests, #client-dashboard, #trade)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').replace('/', '').toLowerCase();
      if (hash === 'loginpage' || hash === 'login' || hash === 'signin') {
        setActiveTab('login');
      } else if (hash === 'homepage' || hash === 'home' || hash === '') {
        setActiveTab('home');
      } else if (hash === 'requests' || hash === 'requests-tab') {
        setActiveTab('requests');
      } else if (hash === 'client-dashboard' || hash === 'client') {
        setActiveTab('client-dashboard');
      } else if (hash === 'portfolio') {
        setActiveTab('portfolio');
      } else if (hash === 'markets') {
        setActiveTab('markets');
      } else if (hash === 'api-docs' || hash === 'api') {
        setActiveTab('api-docs');
      } else if (hash === 'trade' || hash === 'spot') {
        setActiveTab('trade');
      } else if (hash === 'perps' || hash === 'futures') {
        setActiveTab('perps');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    // Ensure role is assigned
    const userWithRole: UserAccount = {
      ...user,
      role: user.role || (user.username === 'joeldan228@gmail.com' || user.username === 'admin' ? 'admin' : 'user')
    };
    setCurrentUser(userWithRole);
    if (userWithRole.role === 'admin') {
      // Admins benefit from direct view of requests or their desired destination
      setActiveTab('requests');
    } else {
      setActiveTab('client-dashboard');
    }
    try {
      localStorage.setItem('meridian_user', JSON.stringify(userWithRole));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('meridian_user');
      localStorage.removeItem('bit_trade_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAuth = (tab: 'login' | 'register' | 'change-password' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  // Load new candles & book when active pair or timeframe changes
  useEffect(() => {
    setCandles(generateCandles(activePair.price, 60, timeframe));
    setOrderBook(generateOrderBook(activePair.price, activePair.precision));
    setTrades(generateRecentTrades(activePair.price, activePair.precision));
  }, [activePair.id, timeframe]);

  // Real-time market tick simulator
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate latency slightly
      setLatency(Math.floor(Math.random() * 8) + 12);

      // Fluctuate current active pair price slightly
      const isUp = Math.random() > 0.49;
      const volatility = activePair.price * 0.0004;
      const delta = (Math.random() * volatility) * (isUp ? 1 : -1);
      const newPrice = Number(Math.max(activePair.price * 0.5, activePair.price + delta).toFixed(activePair.precision));

      setPriceFlash(isUp ? 'buy' : 'sell');
      setTimeout(() => setPriceFlash(null), 700);

      // Update active pair and market list
      setMarkets(prevMarkets =>
        prevMarkets.map(m => {
          if (m.id === activePair.id) {
            const high24h = Math.max(m.high24h, newPrice);
            const low24h = Math.min(m.low24h, newPrice);
            return {
              ...m,
              price: newPrice,
              high24h,
              low24h,
              volume24h: m.volume24h + Math.round(Math.random() * 5000),
            };
          }
          return m;
        })
      );

      setActivePair(prev => ({
        ...prev,
        price: newPrice,
        high24h: Math.max(prev.high24h, newPrice),
        low24h: Math.min(prev.low24h, newPrice),
      }));

      // Append new tick to candles
      setCandles(prevCandles => {
        if (prevCandles.length === 0) return prevCandles;
        const last = { ...prevCandles[prevCandles.length - 1] };
        last.close = newPrice;
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        last.volume += Math.round(Math.random() * 4);
        return [...prevCandles.slice(0, -1), last];
      });

      // Add real-time trade to tape
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newTrade: Trade = {
        id: `t-${Date.now()}`,
        price: newPrice,
        amount: Number((Math.random() * 0.8 + 0.02).toFixed(3)),
        time: timeStr,
        side: isUp ? 'buy' : 'sell',
      };
      setTrades(prevTrades => [newTrade, ...prevTrades.slice(0, 24)]);

      // Update Order Book spread
      setOrderBook(generateOrderBook(newPrice, activePair.precision));

      // Recalculate open positions PnL dynamically
      setPositions(prevPos =>
        prevPos.map(pos => {
          if (pos.pair === activePair.symbol) {
            const diff = pos.side === 'long' ? newPrice - pos.entryPrice : pos.entryPrice - newPrice;
            const pnl = diff * pos.size;
            const pnlPercent = (pnl / pos.margin) * 100;
            return {
              ...pos,
              markPrice: newPrice,
              pnl: Number(pnl.toFixed(2)),
              pnlPercent: Number(pnlPercent.toFixed(2)),
            };
          }
          return pos;
        })
      );
    }, 2200);

    return () => clearInterval(interval);
  }, [activePair.id, activePair.price, activePair.precision, activePair.symbol]);

  // Handlers
  const handleSelectPair = (pair: MarketPair, isPerp = false) => {
    setActivePair(pair);
    if (isPerp) {
      setActiveTab('perps');
    } else if (activeTab === 'markets' || activeTab === 'portfolio') {
      setActiveTab('trade');
    }
  };

  const handlePlaceOrder = (newOrderData: Partial<UserOrder>) => {
    const order: UserOrder = {
      id: `ord-${Date.now()}`,
      pair: newOrderData.pair || activePair.symbol,
      type: newOrderData.type || 'limit',
      side: newOrderData.side || 'buy',
      price: newOrderData.price || activePair.price,
      amount: newOrderData.amount || 0,
      filled: newOrderData.filled || 0,
      status: newOrderData.status || 'open',
      createdAt: new Date().toTimeString().split(' ')[0],
      tpPrice: newOrderData.tpPrice,
      slPrice: newOrderData.slPrice,
    };

    setOrders(prev => [order, ...prev]);

    // If market order, instantly fill and update wallet
    if (order.type === 'market') {
      const cost = order.price * order.amount;
      setWallet(prev => {
        const base = activePair.baseAsset;
        const currentBal = prev.balances[base] || { free: 0, locked: 0, usdValue: 0 };
        return {
          ...prev,
          availableUsd: order.side === 'buy' ? Math.max(0, prev.availableUsd - cost) : prev.availableUsd + cost,
          balances: {
            ...prev.balances,
            [base]: {
              ...currentBal,
              free: order.side === 'buy' ? currentBal.free + order.amount : Math.max(0, currentBal.free - order.amount),
              usdValue: (currentBal.free + (order.side === 'buy' ? order.amount : -order.amount)) * order.price,
            }
          }
        };
      });
    }
  };

  const handleOpenPosition = (newPosData: Partial<Position>) => {
    const pos: Position = {
      id: `pos-${Date.now()}`,
      pair: newPosData.pair || activePair.symbol,
      side: newPosData.side || 'long',
      entryPrice: newPosData.entryPrice || activePair.price,
      markPrice: newPosData.markPrice || activePair.price,
      size: newPosData.size || 0,
      margin: newPosData.margin || 0,
      leverage: newPosData.leverage || 10,
      pnl: 0,
      pnlPercent: 0,
      liquidationPrice: newPosData.liquidationPrice || 0,
      createdAt: 'Just now',
    };

    setPositions(prev => [pos, ...prev]);
    // Deduct margin from available USD
    setWallet(prev => ({
      ...prev,
      availableUsd: Math.max(0, prev.availableUsd - pos.margin),
    }));
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    // Refund margin + PnL
    const refund = Math.max(0, pos.margin + pos.pnl);
    setWallet(prev => ({
      ...prev,
      availableUsd: prev.availableUsd + refund,
      totalUsd: prev.totalUsd + pos.pnl,
    }));

    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const handleCancelOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const handleCancelAllOrders = () => {
    setOrders(prev => prev.filter(o => o.status !== 'open'));
  };

  const handleExecuteSwap = (fromAsset: string, toAsset: string, fromAmount: number, toAmount: number) => {
    setWallet(prev => {
      const prevFrom = prev.balances[fromAsset] || { free: 0, locked: 0, usdValue: 0 };
      const prevTo = prev.balances[toAsset] || { free: 0, locked: 0, usdValue: 0 };

      const updatedFromFree = Math.max(0, prevFrom.free - fromAmount);
      const updatedToFree = prevTo.free + toAmount;

      return {
        ...prev,
        balances: {
          ...prev.balances,
          [fromAsset]: {
            ...prevFrom,
            free: updatedFromFree,
            usdValue: updatedFromFree * (fromAsset === 'USDT' ? 1 : (markets.find(m => m.baseAsset === fromAsset)?.price || 1)),
          },
          [toAsset]: {
            ...prevTo,
            free: updatedToFree,
            usdValue: updatedToFree * (toAsset === 'USDT' ? 1 : (markets.find(m => m.baseAsset === toAsset)?.price || 1)),
          }
        }
      };
    });
  };

  const handleConfirmTransaction = (type: 'deposit' | 'withdraw', asset: string, amount: number) => {
    setWallet(prev => {
      const assetBal = prev.balances[asset] || { free: 0, locked: 0, usdValue: 0 };
      const price = asset === 'USDT' ? 1 : (markets.find(m => m.baseAsset === asset)?.price || 1);
      const change = type === 'deposit' ? amount : -amount;
      const newFree = Math.max(0, assetBal.free + change);

      return {
        ...prev,
        totalUsd: prev.totalUsd + change * price,
        availableUsd: asset === 'USDT' ? Math.max(0, prev.availableUsd + change) : prev.availableUsd,
        balances: {
          ...prev.balances,
          [asset]: {
            ...assetBal,
            free: newFree,
            usdValue: newFree * price,
          }
        }
      };
    });
  };

  const isPerpMode = activeTab === 'perps';

  return (
    <div className="min-h-screen bg-[#050c1e] text-white flex flex-col antialiased overflow-x-hidden">
      {/* 1. Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        wallet={wallet}
        onOpenDeposit={() => {
          setDepWithMode('deposit');
          setDepWithModalOpen(true);
        }}
        onOpenWithdraw={() => {
          setDepWithMode('withdraw');
          setDepWithModalOpen(true);
        }}
        onOpenSwap={() => setSwapModalOpen(true)}
        latency={latency}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* 2. Live Ticker Bar */}
      <TickerBar
        markets={markets}
        onSelectPair={handleSelectPair}
        activePair={activePair}
      />

      {/* 3. Main Views */}
      <main className="flex-1 flex flex-col pb-16 md:pb-0">
        {activeTab === 'login' ? (
          <LoginPage
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onNavigate={handleTabChange}
          />
        ) : activeTab === 'home' ? (
          <HomePage
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onNavigate={handleTabChange}
            initialAuthMode="login"
          />
        ) : activeTab === 'client-dashboard' ? (
          <ClientDashboard
            currentUser={currentUser}
            onOpenDepositModal={() => {
              setDepWithMode('deposit');
              setDepWithModalOpen(true);
            }}
          />
        ) : activeTab === 'requests' ? (
          <RequestsManager
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onSimulateUser={handleLoginSuccess}
          />
        ) : activeTab === 'api-docs' ? (
          <ApiAndUserExplorer
            currentUser={currentUser}
            onSelectUserForLogin={() => {
              setAuthModalTab('login');
              setAuthModalOpen(true);
            }}
            onOpenRegisterModal={() => {
              setAuthModalTab('register');
              setAuthModalOpen(true);
            }}
          />
        ) : activeTab === 'markets' ? (
          <MarketScreener markets={markets} onSelectPair={handleSelectPair} />
        ) : activeTab === 'portfolio' ? (
          <PortfolioView
            wallet={wallet}
            positions={positions}
            markets={markets}
            currentUser={currentUser}
            onOpenDeposit={() => {
              setDepWithMode('deposit');
              setDepWithModalOpen(true);
            }}
            onOpenWithdraw={() => {
              setDepWithMode('withdraw');
              setDepWithModalOpen(true);
            }}
            onOpenSwap={() => setSwapModalOpen(true)}
          />
        ) : (
          /* TRADING TERMINAL (Spot or Futures / Perps) */
          <div className="flex-1 flex flex-col">
            {/* Active Pair Overview Banner */}
            <MarketOverviewBar
              markets={markets}
              activePair={activePair}
              onSelectPair={handleSelectPair}
              isPerp={isPerpMode}
              priceFlash={priceFlash}
            />

            {/* Trading Workspace Grid */}
            <div className="flex-1 p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3">
              {/* Left & Center: Chart & Bottom Position Tables (8 cols on lg, 9 on xl) */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-2 sm:gap-3">
                {/* Pro Chart */}
                <TradingChart
                  candles={candles}
                  pair={activePair}
                  timeframe={timeframe}
                  onChangeTimeframe={setTimeframe}
                />

                {/* Positions, Open Orders, History */}
                <PositionsTable
                  positions={positions}
                  orders={orders}
                  wallet={wallet}
                  onClosePosition={handleClosePosition}
                  onCancelOrder={handleCancelOrder}
                  onCancelAllOrders={handleCancelAllOrders}
                />
              </div>

              {/* Right Side: Order Book, Recent Trades & Order Entry Form (4 cols on lg, 3 on xl) */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-2 sm:gap-3">
                {/* Order Execution Form */}
                <OrderForm
                  pair={activePair}
                  wallet={wallet}
                  selectedPrice={selectedOrderBookPrice}
                  isPerp={isPerpMode}
                  onPlaceOrder={handlePlaceOrder}
                  onOpenPosition={handleOpenPosition}
                />

                {/* Tabs for Order Book vs Recent Trades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
                  <OrderBook
                    orderBook={orderBook}
                    pair={activePair}
                    onSelectPrice={price => setSelectedOrderBookPrice(price)}
                  />
                  <RecentTrades
                    trades={trades}
                    pair={activePair}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenSwap={() => setSwapModalOpen(true)}
      />

      {/* Instant Swap Modal */}
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        markets={markets}
        wallet={wallet}
        onExecuteSwap={handleExecuteSwap}
      />

      {/* Deposit / Withdraw Modal */}
      <DepositWithdrawModal
        isOpen={depWithModalOpen}
        mode={depWithMode}
        onClose={() => setDepWithModalOpen(false)}
        wallet={wallet}
        onConfirmTransaction={handleConfirmTransaction}
      />

      {/* SQLite User Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />
    </div>
  );
}
