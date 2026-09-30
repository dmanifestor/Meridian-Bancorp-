import React, { useState, useEffect } from 'react';
import { MarketPair, OrderSide, OrderType, UserWallet, UserOrder, Position } from '../types';
import { ShieldCheck, Info, Zap, AlertCircle } from 'lucide-react';

interface OrderFormProps {
  pair: MarketPair;
  wallet: UserWallet;
  selectedPrice: number | null;
  isPerp: boolean;
  onPlaceOrder: (order: Partial<UserOrder>) => void;
  onOpenPosition: (position: Partial<Position>) => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  pair,
  wallet,
  selectedPrice,
  isPerp,
  onPlaceOrder,
  onOpenPosition,
}) => {
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice] = useState<string>(pair.price.toString());
  const [amount, setAmount] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(10);
  const [sliderPct, setSliderPct] = useState<number>(0);
  const [enableTPSL, setEnableTPSL] = useState<boolean>(false);
  const [tpPrice, setTpPrice] = useState<string>('');
  const [slPrice, setSlPrice] = useState<string>('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Sync selected price from order book click
  useEffect(() => {
    if (selectedPrice) {
      setPrice(selectedPrice.toFixed(pair.precision));
    }
  }, [selectedPrice, pair.precision]);

  // Sync current price if market order
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(pair.price.toFixed(pair.precision));
    }
  }, [orderType, pair.price, pair.precision]);

  const numPrice = parseFloat(price) || pair.price;
  const numAmount = parseFloat(amount) || 0;

  // Available funds in USDT
  const availableUSDT = wallet.availableUsd;
  const availableAsset = wallet.balances[pair.baseAsset]?.free || 0;

  // Order Total
  const totalValue = numPrice * numAmount;
  const marginRequired = isPerp ? totalValue / leverage : totalValue;
  const feeEstimate = totalValue * 0.0004; // 0.04%

  // Estimated Liquidation Price for Perps
  const estLiquidationPrice = isPerp && numPrice > 0 && leverage > 1
    ? side === 'buy'
      ? numPrice * (1 - 0.95 / leverage)
      : numPrice * (1 + 0.95 / leverage)
    : 0;

  // Handle slider quick balance fill
  const handleSlider = (pct: number) => {
    setSliderPct(pct);
    if (side === 'buy') {
      const maxUsd = isPerp ? availableUSDT * leverage : availableUSDT;
      const targetUsd = (maxUsd * (pct / 100));
      const calcAmount = numPrice > 0 ? (targetUsd / numPrice) : 0;
      setAmount(calcAmount > 0 ? calcAmount.toFixed(4) : '');
    } else {
      if (isPerp) {
        const maxUsd = availableUSDT * leverage;
        const targetUsd = (maxUsd * (pct / 100));
        const calcAmount = numPrice > 0 ? (targetUsd / numPrice) : 0;
        setAmount(calcAmount > 0 ? calcAmount.toFixed(4) : '');
      } else {
        const calcAmount = availableAsset * (pct / 100);
        setAmount(calcAmount > 0 ? calcAmount.toFixed(4) : '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    if (isPerp) {
      // Create active position & order
      onOpenPosition({
        pair: pair.symbol,
        side: side === 'buy' ? 'long' : 'short',
        entryPrice: numPrice,
        markPrice: numPrice,
        size: numAmount,
        margin: marginRequired,
        leverage,
        pnl: 0,
        pnlPercent: 0,
        liquidationPrice: estLiquidationPrice,
      });
      setOrderSuccessMsg(`Successfully executed ${side.toUpperCase()} ${numAmount} ${pair.baseAsset} with ${leverage}x leverage!`);
    } else {
      // Spot order
      onPlaceOrder({
        pair: pair.symbol,
        type: orderType,
        side,
        price: numPrice,
        amount: numAmount,
        filled: orderType === 'market' ? numAmount : 0,
        status: orderType === 'market' ? 'filled' : 'open',
        tpPrice: enableTPSL && tpPrice ? parseFloat(tpPrice) : undefined,
        slPrice: enableTPSL && slPrice ? parseFloat(slPrice) : undefined,
      });
      setOrderSuccessMsg(`Order placed: ${side.toUpperCase()} ${numAmount} ${pair.baseAsset} @ $${numPrice.toFixed(pair.precision)}`);
    }

    // Reset amount
    setAmount('');
    setSliderPct(0);
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-[#090e1b] border border-slate-800/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between text-xs select-none" id="order-form-panel">
      <div>
        {/* Buy / Sell Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/90 rounded-lg mb-3 border border-slate-800">
          <button
            type="button"
            id="order-side-buy-btn"
            onClick={() => setSide('buy')}
            className={`py-2.5 min-h-[40px] rounded-md font-bold text-xs uppercase tracking-wider transition-all touch-manipulation ${
              side === 'buy'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isPerp ? 'Open Long' : 'Buy ' + pair.baseAsset}
          </button>
          <button
            type="button"
            id="order-side-sell-btn"
            onClick={() => setSide('sell')}
            className={`py-2.5 min-h-[40px] rounded-md font-bold text-xs uppercase tracking-wider transition-all touch-manipulation ${
              side === 'sell'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isPerp ? 'Open Short' : 'Sell ' + pair.baseAsset}
          </button>
        </div>

        {/* Order Types */}
        <div className="flex items-center justify-between gap-1 mb-3 border-b border-slate-800 pb-2">
          {(['limit', 'market', 'stop-limit'] as OrderType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`px-2 py-1 rounded capitalize font-medium text-[11px] transition-colors ${
                orderType === type
                  ? 'text-emerald-400 bg-slate-800 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'stop-limit' ? 'Stop-Limit' : type}
            </button>
          ))}
        </div>

        {/* Leverage Controls for Perpetuals */}
        {isPerp && (
          <div className="mb-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-400 text-[11px]">Leverage</span>
              <span className="text-cyan-400 font-mono font-bold text-xs bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded">
                {leverage}x
              </span>
            </div>
            <div className="flex gap-1">
              {[2, 5, 10, 20, 50, 100].map(lev => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                    leverage === lev
                      ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Price Input (if not pure market) */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Order Price</span>
              <button 
                type="button"
                onClick={() => setPrice(pair.price.toFixed(pair.precision))} 
                className="text-emerald-400 hover:underline font-mono"
              >
                Last Price
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                disabled={orderType === 'market'}
                value={orderType === 'market' ? 'Market Best' : price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className={`w-full bg-slate-900 border rounded-lg px-3 py-2 text-slate-100 font-mono text-base sm:text-xs focus:outline-none transition-colors ${
                  orderType === 'market' 
                    ? 'border-slate-800 text-slate-400 cursor-not-allowed bg-slate-900/40' 
                    : 'border-slate-800 focus:border-emerald-500'
                }`}
                required={orderType !== 'market'}
              />
              <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-xs">
                {pair.quoteAsset}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Amount</span>
              <span className="text-slate-400 font-mono">
                Avail: {side === 'buy' ? `${availableUSDT.toLocaleString()} USDT` : `${availableAsset} ${pair.baseAsset}`}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={e => {
                  setAmount(e.target.value);
                  setSliderPct(0);
                }}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-base sm:text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
              <span className="absolute right-3 top-2.5 text-slate-400 font-mono text-xs">
                {pair.baseAsset}
              </span>
            </div>
          </div>

          {/* Quick Percentage Slider / Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-0.5">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => handleSlider(pct)}
                className={`py-2 min-h-[36px] rounded text-[11px] font-mono transition-colors border touch-manipulation ${
                  sliderPct === pct
                    ? 'bg-slate-800 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* TP / SL Accordion Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setEnableTPSL(!enableTPSL)}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <input 
                type="checkbox" 
                checked={enableTPSL} 
                onChange={() => {}} 
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 w-3 h-3 pointer-events-none"
              />
              <span>Take Profit / Stop Loss</span>
            </button>

            {enableTPSL && (
              <div className="mt-2 grid grid-cols-2 gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="text-[10px] text-emerald-400 mb-1">TP Price</div>
                  <input
                    type="number"
                    step="any"
                    value={tpPrice}
                    onChange={e => setTpPrice(e.target.value)}
                    placeholder="Profit Price"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-rose-400 mb-1">SL Price</div>
                  <input
                    type="number"
                    step="any"
                    value={slPrice}
                    onChange={e => setSlPrice(e.target.value)}
                    placeholder="Loss Price"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Calculations */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Order Value</span>
              <span className="text-slate-200 font-medium">${totalValue.toFixed(2)}</span>
            </div>
            {isPerp && (
              <>
                <div className="flex justify-between">
                  <span>Margin Required</span>
                  <span className="text-cyan-400 font-medium">${marginRequired.toFixed(2)}</span>
                </div>
                {estLiquidationPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-rose-400/90">Est. Liquidation</span>
                    <span className="text-rose-400 font-bold">${estLiquidationPrice.toFixed(pair.precision)}</span>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-between">
              <span>Estimated Fee (0.04%)</span>
              <span className="text-slate-300">${feeEstimate.toFixed(3)}</span>
            </div>
          </div>

          {/* Submission Success Toast */}
          {orderSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{orderSuccessMsg}</span>
            </div>
          )}

          {/* Place Order CTA */}
          <button
            type="submit"
            id="place-order-submit-btn"
            disabled={numAmount <= 0}
            className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all shadow-lg active:scale-98 ${
              numAmount <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : side === 'buy'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
            }`}
          >
            {isPerp 
              ? `${side === 'buy' ? 'Open Long' : 'Open Short'} ${pair.baseAsset}`
              : `${side === 'buy' ? 'Buy' : 'Sell'} ${pair.baseAsset}`}
          </button>
        </form>
      </div>

      {/* Trust & Safety Assurance Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Cold Storage Backed</span>
        </div>
        <span>0.00% Zero Gas Trading</span>
      </div>
    </div>
  );
};
