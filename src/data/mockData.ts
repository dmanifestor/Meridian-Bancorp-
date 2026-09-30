import { MarketPair, CandleData, OrderBookData, Trade, UserWallet, Position, UserOrder, TimeFrame } from '../types';

export const INITIAL_MARKETS: MarketPair[] = [
  {
    id: 'BTC-USDT',
    symbol: 'BTC/USDT',
    baseAsset: 'BTC',
    quoteAsset: 'USDT',
    name: 'Bitcoin',
    price: 89450.00,
    change24h: 3.42,
    high24h: 90210.00,
    low24h: 86120.00,
    volume24h: 2845620180,
    fundingRate: 0.0100,
    category: 'Layer 1',
    precision: 2,
    minAmount: 0.0001,
    sparkline: [86100, 86450, 87200, 86900, 88100, 87800, 88900, 89200, 89450],
  },
  {
    id: 'ETH-USDT',
    symbol: 'ETH/USDT',
    baseAsset: 'ETH',
    quoteAsset: 'USDT',
    name: 'Ethereum',
    price: 3415.50,
    change24h: 4.85,
    high24h: 3480.00,
    low24h: 3240.20,
    volume24h: 1423890400,
    fundingRate: 0.0085,
    category: 'Layer 1',
    precision: 2,
    minAmount: 0.001,
    sparkline: [3240, 3270, 3310, 3290, 3350, 3380, 3420, 3400, 3415],
  },
  {
    id: 'SOL-USDT',
    symbol: 'SOL/USDT',
    baseAsset: 'SOL',
    quoteAsset: 'USDT',
    name: 'Solana',
    price: 194.75,
    change24h: 7.62,
    high24h: 198.50,
    low24h: 179.30,
    volume24h: 984500120,
    fundingRate: 0.0125,
    category: 'Layer 1',
    precision: 2,
    minAmount: 0.01,
    sparkline: [179, 182, 185, 183, 189, 191, 196, 193, 194.75],
  },
  {
    id: 'RENDER-USDT',
    symbol: 'RENDER/USDT',
    baseAsset: 'RENDER',
    quoteAsset: 'USDT',
    name: 'Render Network',
    price: 7.82,
    change24h: 12.40,
    high24h: 8.15,
    low24h: 6.90,
    volume24h: 312400900,
    fundingRate: 0.0150,
    category: 'AI & Data',
    precision: 3,
    minAmount: 0.1,
    sparkline: [6.9, 7.1, 7.0, 7.3, 7.5, 7.4, 7.7, 7.9, 7.82],
  },
  {
    id: 'SUI-USDT',
    symbol: 'SUI/USDT',
    baseAsset: 'SUI',
    quoteAsset: 'USDT',
    name: 'Sui Network',
    price: 3.28,
    change24h: -1.84,
    high24h: 3.45,
    low24h: 3.19,
    volume24h: 420950300,
    fundingRate: 0.0075,
    category: 'Layer 1',
    precision: 3,
    minAmount: 1,
    sparkline: [3.35, 3.40, 3.42, 3.38, 3.31, 3.25, 3.22, 3.26, 3.28],
  },
  {
    id: 'LINK-USDT',
    symbol: 'LINK/USDT',
    baseAsset: 'LINK',
    quoteAsset: 'USDT',
    name: 'Chainlink',
    price: 18.64,
    change24h: 5.12,
    high24h: 19.10,
    low24h: 17.65,
    volume24h: 198750400,
    fundingRate: 0.0090,
    category: 'Infra',
    precision: 2,
    minAmount: 0.1,
    sparkline: [17.6, 17.9, 18.2, 18.0, 18.4, 18.5, 18.8, 18.7, 18.64],
  },
  {
    id: 'AVAX-USDT',
    symbol: 'AVAX/USDT',
    baseAsset: 'AVAX',
    quoteAsset: 'USDT',
    name: 'Avalanche',
    price: 34.20,
    change24h: 2.15,
    high24h: 35.10,
    low24h: 33.15,
    volume24h: 165400200,
    fundingRate: 0.0060,
    category: 'Layer 1',
    precision: 2,
    minAmount: 0.1,
    sparkline: [33.2, 33.5, 33.8, 33.6, 34.0, 34.3, 34.5, 34.1, 34.2],
  },
  {
    id: 'PEPE-USDT',
    symbol: 'PEPE/USDT',
    baseAsset: 'PEPE',
    quoteAsset: 'USDT',
    name: 'Pepe',
    price: 0.00001245,
    change24h: 15.80,
    high24h: 0.00001320,
    low24h: 0.00001050,
    volume24h: 580400100,
    fundingRate: 0.0210,
    category: 'Meme',
    precision: 8,
    minAmount: 10000,
    sparkline: [0.0000105, 0.000011, 0.0000115, 0.0000112, 0.000012, 0.0000122, 0.0000128, 0.0000126, 0.00001245],
  }
];

export function generateCandles(basePrice: number, count = 60, interval: TimeFrame = '15m'): CandleData[] {
  const candles: CandleData[] = [];
  const now = Date.now();
  
  let stepMs = 15 * 60 * 1000;
  if (interval === '1m') stepMs = 60 * 1000;
  if (interval === '5m') stepMs = 5 * 60 * 1000;
  if (interval === '1H') stepMs = 60 * 60 * 1000;
  if (interval === '4H') stepMs = 4 * 60 * 60 * 1000;
  if (interval === '1D') stepMs = 24 * 60 * 60 * 1000;
  if (interval === '1W') stepMs = 7 * 24 * 60 * 60 * 1000;

  let currentPrice = basePrice * 0.94;

  for (let i = count; i >= 0; i--) {
    const time = now - (i * stepMs);
    const volatility = basePrice * 0.008;
    const delta = (Math.random() - 0.48) * volatility;
    const open = currentPrice;
    const close = Math.max(open * 0.5, open + delta);
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    const volume = Math.round((Math.random() * 25 + 5) * (basePrice > 1000 ? 1 : 100));

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });
    currentPrice = close;
  }
  return candles;
}

export function generateOrderBook(currentPrice: number, precision: number): OrderBookData {
  const bids = [];
  const asks = [];
  const step = currentPrice * 0.0003;

  let bidTotal = 0;
  for (let i = 1; i <= 14; i++) {
    const price = Number((currentPrice - (i * step)).toFixed(precision));
    const amount = Number((Math.random() * 1.8 + 0.1).toFixed(3));
    bidTotal += amount;
    bids.push({ price, amount, total: Number(bidTotal.toFixed(3)) });
  }

  let askTotal = 0;
  for (let i = 1; i <= 14; i++) {
    const price = Number((currentPrice + (i * step)).toFixed(precision));
    const amount = Number((Math.random() * 1.8 + 0.1).toFixed(3));
    askTotal += amount;
    asks.push({ price, amount, total: Number(askTotal.toFixed(3)) });
  }

  asks.reverse(); // Asks displayed descending towards spread

  const bestBid = bids[0]?.price || currentPrice;
  const bestAsk = asks[asks.length - 1]?.price || currentPrice;
  const spread = Number(Math.abs(bestAsk - bestBid).toFixed(precision));
  const spreadPercentage = Number(((spread / currentPrice) * 100).toFixed(4));

  return {
    bids,
    asks,
    spread,
    spreadPercentage,
  };
}

export function generateRecentTrades(currentPrice: number, precision: number): Trade[] {
  const trades: Trade[] = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const side: 'buy' | 'sell' = Math.random() > 0.48 ? 'buy' : 'sell';
    const delta = (Math.random() - 0.5) * (currentPrice * 0.001);
    const price = Number((currentPrice + delta).toFixed(precision));
    const amount = Number((Math.random() * 1.4 + 0.05).toFixed(3));
    const t = new Date(now.getTime() - i * 2200);
    const time = t.toTimeString().split(' ')[0];

    trades.push({
      id: `trade-${Date.now()}-${i}`,
      price,
      amount,
      time,
      side,
    });
  }
  return trades;
}

export const INITIAL_WALLET: UserWallet = {
  totalUsd: 78450.25,
  unrealizedPnl: 1420.50,
  availableUsd: 42800.00,
  balances: {
    USDT: { free: 42800.00, locked: 1250.00, usdValue: 44050.00 },
    BTC: { free: 0.285, locked: 0.02, usdValue: 27282.25 },
    ETH: { free: 1.84, locked: 0, usdValue: 6284.52 },
    SOL: { free: 4.25, locked: 0, usdValue: 827.69 },
  }
};

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    pair: 'BTC/USDT',
    side: 'long',
    entryPrice: 88120.00,
    markPrice: 89450.00,
    size: 0.5,
    margin: 4406.00,
    leverage: 10,
    pnl: 665.00,
    pnlPercent: 15.09,
    liquidationPrice: 79800.00,
    createdAt: '12 mins ago',
  },
  {
    id: 'pos-2',
    pair: 'SOL/USDT',
    side: 'long',
    entryPrice: 186.20,
    markPrice: 194.75,
    size: 25,
    margin: 931.00,
    leverage: 5,
    pnl: 213.75,
    pnlPercent: 22.95,
    liquidationPrice: 152.00,
    createdAt: '45 mins ago',
  }
];

export const INITIAL_ORDERS: UserOrder[] = [
  {
    id: 'ord-1',
    pair: 'BTC/USDT',
    type: 'limit',
    side: 'buy',
    price: 87500.00,
    amount: 0.25,
    filled: 0,
    status: 'open',
    createdAt: '10:14:02',
    leverage: 10,
  },
  {
    id: 'ord-2',
    pair: 'ETH/USDT',
    type: 'limit',
    side: 'sell',
    price: 3550.00,
    amount: 1.0,
    filled: 0,
    status: 'open',
    createdAt: '09:42:18',
    tpPrice: 3600.00,
    slPrice: 3380.00,
  }
];
