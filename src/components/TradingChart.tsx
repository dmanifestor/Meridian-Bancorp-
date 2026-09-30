import React, { useRef, useEffect, useState } from 'react';
import { CandleData, TimeFrame, MarketPair } from '../types';
import { BarChart3, LineChart, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface TradingChartProps {
  candles: CandleData[];
  pair: MarketPair;
  timeframe: TimeFrame;
  onChangeTimeframe: (tf: TimeFrame) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  pair,
  timeframe,
  onChangeTimeframe,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hoverCandle, setHoverCandle] = useState<CandleData | null>(null);
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showEMA, setShowEMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Timeframes available
  const timeframes: TimeFrame[] = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

  // Setup ResizeObserver to respond dynamically to container sizing changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Handle canvas drawing with crisp pixel ratio and dynamic resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Padding & dimensions (adaptive for mobile widths < 480px)
    const isMobile = width < 500;
    const paddingRight = isMobile ? 54 : 75; // for price axis
    const paddingBottom = 26; // for time axis
    const chartWidth = Math.max(width - paddingRight, 10);
    const chartHeight = Math.max(height - paddingBottom, 10);
    const volumeHeight = showVolume ? chartHeight * (isMobile ? 0.18 : 0.22) : 0;
    const candleChartHeight = chartHeight - volumeHeight;

    // Calculate price bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach(c => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    });

    const priceBuffer = (maxPrice - minPrice) * 0.08 || 1;
    minPrice -= priceBuffer;
    maxPrice += priceBuffer;

    const priceRange = maxPrice - minPrice || 1;

    // Coordinate mapping
    const getX = (index: number) => {
      const candleWidth = chartWidth / candles.length;
      return index * candleWidth + candleWidth / 2;
    };

    const getY = (price: number) => {
      return candleChartHeight - ((price - minPrice) / priceRange) * candleChartHeight;
    };

    // 1. Draw Grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 1;

    // Horizontal price grid lines
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange / gridSteps) * i;
      const y = getY(p);

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price label on right axis
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p > 1 ? p.toFixed(pair.precision) : p.toFixed(pair.precision), chartWidth + 8, y + 3);
    }

    // Vertical time grid lines
    const timeSteps = 5;
    for (let i = 0; i <= timeSteps; i++) {
      const idx = Math.floor((candles.length - 1) * (i / timeSteps));
      const c = candles[idx];
      if (!c) continue;
      const x = getX(idx);

      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, chartHeight);
      ctx.stroke();

      // Time label on bottom axis
      const date = new Date(c.time);
      const timeStr = timeframe === '1D' || timeframe === '1W'
        ? `${date.getMonth() + 1}/${date.getDate()}`
        : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, chartHeight + 18);
    }

    // 2. Draw Volume Bars
    if (showVolume && maxVolume > 0) {
      const candleWidth = chartWidth / candles.length;
      const barW = Math.max(candleWidth * 0.75, 2);

      candles.forEach((c, i) => {
        const x = getX(i) - barW / 2;
        const vHeight = (c.volume / maxVolume) * (volumeHeight - 10);
        const y = chartHeight - vHeight;

        const isBull = c.close >= c.open;
        ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.22)';
        ctx.fillRect(x, y, barW, vHeight);
      });
    }

    // 3. Draw EMA indicators (EMA20: cyan, EMA50: amber)
    if (showEMA && candles.length > 20) {
      const calcEMA = (period: number) => {
        const k = 2 / (period + 1);
        let ema = candles[0].close;
        const emaPoints: { x: number; y: number }[] = [];

        candles.forEach((c, idx) => {
          ema = c.close * k + ema * (1 - k);
          if (idx >= period - 1) {
            emaPoints.push({ x: getX(idx), y: getY(ema) });
          }
        });
        return emaPoints;
      };

      const ema20 = calcEMA(20);
      const ema50 = calcEMA(50);

      // Draw EMA 20
      if (ema20.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ema20.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }

      // Draw EMA 50
      if (ema50.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ema50.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
      }
    }

    // 4. Draw Candlesticks OR Mountain Line
    const candleWidth = chartWidth / candles.length;
    const bodyWidth = Math.max(candleWidth * 0.72, 2.5);

    if (chartType === 'candles') {
      candles.forEach((c, i) => {
        const x = getX(i);
        const isBull = c.close >= c.open;
        const color = isBull ? '#10b981' : '#f43f5e';

        // Draw Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, getY(c.high));
        ctx.lineTo(x, getY(c.low));
        ctx.stroke();

        // Draw Candle Body
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const topY = Math.min(openY, closeY);
        const height = Math.max(Math.abs(closeY - openY), 1.5);

        ctx.fillStyle = color;
        ctx.fillRect(x - bodyWidth / 2, topY, bodyWidth, height);
      });
    } else {
      // Line / Area Chart
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Gradient Fill
      const grad = ctx.createLinearGradient(0, 0, 0, candleChartHeight);
      grad.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.lineTo(getX(candles.length - 1), candleChartHeight);
      ctx.lineTo(getX(0), candleChartHeight);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Main line
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 5. Current Price Horizontal Dotted Line & Tag
    const latestCandle = candles[candles.length - 1];
    if (latestCandle) {
      const currentY = getY(latestCandle.close);
      const isBull = latestCandle.close >= latestCandle.open;
      const tagColor = isBull ? '#10b981' : '#f43f5e';

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = tagColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentY);
      ctx.lineTo(chartWidth, currentY);
      ctx.stroke();
      ctx.restore();

      // Tag on right axis
      ctx.fillStyle = tagColor;
      ctx.fillRect(chartWidth + 2, currentY - 10, paddingRight - 6, 20);
      ctx.fillStyle = '#060a12';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(latestCandle.close.toFixed(pair.precision), chartWidth + (paddingRight - 4) / 2, currentY + 3.5);
    }
  }, [candles, chartType, showEMA, showVolume, timeframe, pair.precision, containerSize]);

  // Handle Mouse / Touch inspection
  const handlePositionInspect = (clientX: number) => {
    if (!containerRef.current || candles.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const isMobile = rect.width < 500;
    const paddingRight = isMobile ? 54 : 75;
    const chartWidth = Math.max(rect.width - paddingRight, 10);

    if (x >= 0 && x <= chartWidth) {
      const candleWidth = chartWidth / candles.length;
      const idx = Math.min(Math.max(Math.floor(x / candleWidth), 0), candles.length - 1);
      setHoverCandle(candles[idx]);
    } else {
      setHoverCandle(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePositionInspect(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      handlePositionInspect(e.touches[0].clientX);
    }
  };

  const handleMouseLeave = () => {
    setHoverCandle(null);
  };

  const activeCandle = hoverCandle || candles[candles.length - 1] || null;

  return (
    <div 
      className={`bg-[#090e1b] border border-slate-800/80 rounded-xl flex flex-col overflow-hidden relative ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[330px] sm:h-[400px] lg:h-[460px]'
      }`}
      id="trading-chart-container"
    >
      {/* Chart Control Toolbar */}
      <div className="min-h-10 py-1 border-b border-slate-800 px-2 sm:px-3 flex flex-wrap items-center justify-between gap-1.5 bg-[#080d19] text-xs font-mono select-none">
        {/* Left: Timeframe pills */}
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none py-0.5">
          {timeframes.map(tf => (
            <button
              key={tf}
              onClick={() => onChangeTimeframe(tf)}
              className={`px-2 py-1 min-h-[28px] sm:min-h-[30px] rounded text-xs transition-colors font-semibold touch-manipulation ${
                timeframe === tf
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Center: Open High Low Close tooltip display */}
        {activeCandle && (
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-400 font-medium overflow-x-auto scrollbar-none">
            <span className="hidden sm:inline">O: <strong className="text-slate-200">{activeCandle.open.toFixed(pair.precision)}</strong></span>
            <span className="hidden sm:inline">H: <strong className="text-emerald-400">{activeCandle.high.toFixed(pair.precision)}</strong></span>
            <span className="hidden sm:inline">L: <strong className="text-rose-400">{activeCandle.low.toFixed(pair.precision)}</strong></span>
            <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
              {activeCandle.close.toFixed(pair.precision)}
            </strong></span>
            {showVolume && (
              <span className="hidden lg:inline">Vol: <strong className="text-slate-300">{activeCandle.volume.toLocaleString()}</strong></span>
            )}
          </div>
        )}

        {/* Right: Indicators & Tools */}
        <div className="flex items-center gap-1">
          {/* Chart Type Toggle */}
          <button
            onClick={() => setChartType(chartType === 'candles' ? 'line' : 'candles')}
            className={`p-1.5 min-h-[28px] min-w-[28px] rounded transition-colors flex items-center justify-center ${
              chartType === 'candles' ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Candle / Line"
            aria-label="Toggle Candle or Line Chart"
          >
            {chartType === 'candles' ? <BarChart3 className="w-3.5 h-3.5" /> : <LineChart className="w-3.5 h-3.5" />}
          </button>

          {/* EMA Toggle */}
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-1.5 sm:px-2 py-1 min-h-[28px] rounded text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors ${
              showEMA ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle EMA 20/50"
          >
            EMA
          </button>

          {/* Volume Toggle */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-1.5 sm:px-2 py-1 min-h-[28px] rounded text-[10px] sm:text-[11px] flex items-center gap-1 transition-colors ${
              showVolume ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Volume"
          >
            VOL
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 min-h-[28px] min-w-[28px] rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
        className="flex-1 w-full relative cursor-crosshair overflow-hidden touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>
    </div>
  );
};
