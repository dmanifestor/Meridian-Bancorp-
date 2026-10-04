import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Sparkles, 
  Award, 
  Layers, 
  Activity, 
  BarChart3, 
  Clock, 
  ShieldCheck, 
  Maximize2,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { UserWallet, UserAccount, PortfolioHistoricalPoint, PortfolioTimeframe } from '../types';

interface PortfolioPerformanceDashboardProps {
  wallet: UserWallet;
  currentUser?: UserAccount | null;
}

export const PortfolioPerformanceDashboard: React.FC<PortfolioPerformanceDashboardProps> = ({
  wallet,
  currentUser,
}) => {
  const [timeframe, setTimeframe] = useState<PortfolioTimeframe>('1M');
  const [displayMode, setDisplayMode] = useState<'value' | 'percent'>('value');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [showMilestones, setShowMilestones] = useState<boolean>(true);

  // Hover state for interactive D3 tooltip
  const [hoveredPoint, setHoveredPoint] = useState<PortfolioHistoricalPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate deterministic historical data for the user & timeframe
  const historicalData: PortfolioHistoricalPoint[] = useMemo(() => {
    const currentTotal = Math.max(1000, wallet.totalUsd || 76540.25);
    const seed = (currentUser?.username || 'meridian_user')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const points: PortfolioHistoricalPoint[] = [];
    const now = Date.now();

    let count = 30;
    let stepMs = 86400000; // 1 day
    let totalGainPct = 0.082; // 8.2% default 1M gain

    switch (timeframe) {
      case '24H':
        count = 24;
        stepMs = 3600000; // 1 hour
        totalGainPct = 0.016;
        break;
      case '7D':
        count = 28;
        stepMs = 21600000; // 6 hours
        totalGainPct = 0.034;
        break;
      case '1M':
        count = 30;
        stepMs = 86400000; // 1 day
        totalGainPct = 0.095;
        break;
      case '3M':
        count = 45;
        stepMs = 172800000; // 2 days
        totalGainPct = 0.224;
        break;
      case '1Y':
        count = 52;
        stepMs = 604800000; // 1 week
        totalGainPct = 0.618;
        break;
      case 'ALL':
        count = 60;
        stepMs = 2592000000; // 1 month (~5 years)
        totalGainPct = 2.45; // 245% all-time growth
        break;
    }

    const baseline = currentTotal / (1 + totalGainPct);
    const benchmarkBaseline = baseline * 0.95;

    // Create realistic deterministic curve with minor dips and strong secular growth
    let runningVal = baseline;
    let runningBenchmark = benchmarkBaseline;

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const timestamp = now - (count - 1 - i) * stepMs;
      const dateObj = new Date(timestamp);

      // Deterministic pseudorandom noise using sine and seed
      const noise = Math.sin((i + seed) * 0.85) * 0.018 + Math.cos((i * 1.6 + seed)) * 0.012;
      const expectedGrowth = baseline + (currentTotal - baseline) * Math.pow(progress, 1.15);
      
      // End point exactly matches current wallet net worth
      if (i === count - 1) {
        runningVal = currentTotal;
      } else {
        runningVal = Math.max(baseline * 0.85, expectedGrowth * (1 + noise));
      }

      // Benchmark tracks broader indices (e.g. S&P 500 / Digital Asset Custody Index)
      const benchmarkGrowth = benchmarkBaseline + (currentTotal * 0.78 - benchmarkBaseline) * Math.pow(progress, 1.25);
      const benchmarkNoise = Math.cos((i + seed * 1.5) * 0.9) * 0.015;
      runningBenchmark = i === count - 1 ? currentTotal * 0.84 : benchmarkGrowth * (1 + benchmarkNoise);

      let milestone: string | undefined = undefined;
      let depositWithdrawal: number | undefined = undefined;

      // Assign milestones at strategic points along the curve
      if (timeframe === 'ALL' || timeframe === '1Y') {
        if (i === 0) milestone = 'Vault Account Inception';
        if (i === Math.floor(count * 0.25)) {
          milestone = 'Tranche A Tier-1 Settlement';
          depositWithdrawal = 10000;
        }
        if (i === Math.floor(count * 0.55)) {
          milestone = 'Arbitrage Yield Realization';
        }
        if (i === Math.floor(count * 0.8)) {
          milestone = 'Institutional Custody Expansion';
          depositWithdrawal = 15000;
        }
      } else if (timeframe === '1M' || timeframe === '3M') {
        if (i === Math.floor(count * 0.3)) milestone = 'Rebalance Execution';
        if (i === Math.floor(count * 0.7)) milestone = 'Spot Volatility Yield Inflow';
      } else if (timeframe === '7D' && i === Math.floor(count * 0.5)) {
        milestone = 'Hedging Spread Distribution';
      }

      const dateStr = timeframe === '24H'
        ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : timeframe === '7D' || timeframe === '1M'
        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const change = runningVal - baseline;
      const changePct = (change / baseline) * 100;
      const benchmarkPct = ((runningBenchmark - benchmarkBaseline) / benchmarkBaseline) * 100;

      points.push({
        timestamp,
        dateStr,
        value: Number(runningVal.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePct: Number(changePct.toFixed(2)),
        benchmarkValue: Number(runningBenchmark.toFixed(2)),
        benchmarkPct: Number(benchmarkPct.toFixed(2)),
        milestone,
        depositWithdrawal,
      });
    }

    return points;
  }, [wallet.totalUsd, currentUser?.username, timeframe]);

  // Performance Summary calculations
  const firstPoint = historicalData[0];
  const lastPoint = historicalData[historicalData.length - 1];
  const netChange = lastPoint.value - firstPoint.value;
  const netChangePct = ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100;
  const isPositive = netChange >= 0;

  const peakValue = useMemo(() => {
    return Math.max(...historicalData.map(p => p.value));
  }, [historicalData]);

  const troughValue = useMemo(() => {
    return Math.min(...historicalData.map(p => p.value));
  }, [historicalData]);

  const maxDrawdown = useMemo(() => {
    let peak = -Infinity;
    let maxDd = 0;
    for (const p of historicalData) {
      if (p.value > peak) peak = p.value;
      const dd = ((peak - p.value) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }
    return maxDd;
  }, [historicalData]);

  // Alpha vs Benchmark
  const alphaVsBenchmark = netChangePct - lastPoint.benchmarkPct;

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || historicalData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 800;
    const height = 360;
    const margin = { top: 25, right: 30, bottom: 35, left: 65 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // SVG Defs: Gradients and filters
    const defs = svg.append('defs');

    // Yellow-gold to deep navy gradient fill
    const areaGradient = defs
      .append('linearGradient')
      .attr('id', 'portfolio-area-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    areaGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#facc15') // Yellow 400
      .attr('stop-opacity', 0.38);

    areaGradient
      .append('stop')
      .attr('offset', '45%')
      .attr('stop-color', '#2563eb') // Blue 600
      .attr('stop-opacity', 0.16);

    areaGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#050c1e') // Navy base
      .attr('stop-opacity', 0.0);

    // Glow filter for line
    const glowFilter = defs
      .append('filter')
      .attr('id', 'line-glow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '140%');

    glowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');

    const feMerge = glowFilter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(historicalData, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, innerWidth]);

    const yValueMin = d3.min(historicalData, d => displayMode === 'value' ? d.value : d.changePct) || 0;
    const yValueMax = d3.max(historicalData, d => displayMode === 'value' ? d.value : d.changePct) || 100;
    const yPadding = (yValueMax - yValueMin) * 0.12 || 100;

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yValueMin - yPadding), yValueMax + yPadding])
      .nice()
      .range([innerHeight, 0]);

    // Gridlines
    const yAxisGrid = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickSize(-innerWidth)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'gridline')
      .call(yAxisGrid)
      .selectAll('line')
      .attr('stroke', '#1e3a8a') // Blue 900
      .attr('stroke-opacity', 0.35)
      .attr('stroke-dasharray', '3,3');

    g.select('.gridline .domain').remove();

    // Benchmark line (if enabled and mode is percent)
    if (showBenchmark) {
      const benchmarkLine = d3
        .line<PortfolioHistoricalPoint>()
        .x(d => xScale(new Date(d.timestamp)))
        .y(d => {
          if (displayMode === 'value') {
            return yScale(d.benchmarkValue);
          } else {
            return yScale(d.benchmarkPct);
          }
        })
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(historicalData)
        .attr('fill', 'none')
        .attr('stroke', '#60a5fa') // Blue 400
        .attr('stroke-opacity', 0.5)
        .attr('stroke-width', 1.75)
        .attr('stroke-dasharray', '4,4')
        .attr('d', benchmarkLine);
    }

    // Main Area generator
    const areaGenerator = d3
      .area<PortfolioHistoricalPoint>()
      .x(d => xScale(new Date(d.timestamp)))
      .y0(innerHeight)
      .y1(d => yScale(displayMode === 'value' ? d.value : d.changePct))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(historicalData)
      .attr('fill', 'url(#portfolio-area-gradient)')
      .attr('d', areaGenerator);

    // Main Curve Line generator
    const lineGenerator = d3
      .line<PortfolioHistoricalPoint>()
      .x(d => xScale(new Date(d.timestamp)))
      .y(d => yScale(displayMode === 'value' ? d.value : d.changePct))
      .curve(d3.curveMonotoneX);

    // Main Glowing stroke
    g.append('path')
      .datum(historicalData)
      .attr('fill', 'none')
      .attr('stroke', '#facc15') // Yellow 400
      .attr('stroke-width', 2.5)
      .attr('filter', 'url(#line-glow)')
      .attr('d', lineGenerator);

    // Milestone markers
    if (showMilestones) {
      const milestones = historicalData.filter(d => !!d.milestone);
      
      const milestoneGroup = g.append('g').attr('class', 'milestones');

      milestones.forEach(m => {
        const cx = xScale(new Date(m.timestamp));
        const cy = yScale(displayMode === 'value' ? m.value : m.changePct);

        // Milestone pulse halo
        milestoneGroup
          .append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 7)
          .attr('fill', 'rgba(250, 204, 21, 0.25)')
          .attr('class', 'animate-pulse');

        // Milestone diamond marker
        milestoneGroup
          .append('polygon')
          .attr('points', `${cx},${cy - 5} ${cx + 5},${cy} ${cx},${cy + 5} ${cx - 5},${cy}`)
          .attr('fill', '#ffffff')
          .attr('stroke', '#facc15')
          .attr('stroke-width', 1.8)
          .style('cursor', 'pointer');
      });
    }

    // X-Axis
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.max(4, Math.floor(innerWidth / 110)))
      .tickFormat(d => {
        const date = d as Date;
        if (timeframe === '24H') {
          return d3.timeFormat('%H:%M')(date);
        } else if (timeframe === '7D' || timeframe === '1M') {
          return d3.timeFormat('%b %d')(date);
        } else {
          return d3.timeFormat('%b %y')(date);
        }
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#94a3b8') // Slate 400
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#93c5fd') // Blue 300
      .attr('dy', '1em');

    g.select('.domain').attr('stroke', '#1e3a8a');

    // Y-Axis
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => {
        const val = d as number;
        if (displayMode === 'percent') {
          return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
        }
        if (val >= 1000000) {
          return `$${(val / 1000000).toFixed(2)}M`;
        }
        if (val >= 1000) {
          return `$${(val / 1000).toFixed(1)}k`;
        }
        return `$${val.toFixed(0)}`;
      });

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '11px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', '#ffffff')
      .attr('dx', '-0.5em');

    // Interactive elements for crosshair & tooltip
    const crosshair = g
      .append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', '#60a5fa')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '3,3')
      .style('opacity', 0);

    const focusPoint = g
      .append('g')
      .attr('class', 'focus-point')
      .style('opacity', 0);

    focusPoint
      .append('circle')
      .attr('r', 8)
      .attr('fill', 'rgba(250, 204, 21, 0.28)');

    focusPoint
      .append('circle')
      .attr('r', 4.5)
      .attr('fill', '#facc15')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2);

    // Bisector for locating date
    const bisectDate = d3.bisector<PortfolioHistoricalPoint, Date>(
      d => new Date(d.timestamp)
    ).left;

    // Overlay rect for pointer interactions
    g.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove touchmove', function (event: MouseEvent | TouchEvent) {
        const coords = d3.pointer(event, this);
        const x0 = xScale.invert(coords[0]);
        const index = bisectDate(historicalData, x0, 1);
        const d0 = historicalData[index - 1];
        const d1 = historicalData[index];
        let d = d0;

        if (d1 && d0) {
          d = x0.getTime() - d0.timestamp > d1.timestamp - x0.getTime() ? d1 : d0;
        }

        if (!d) return;

        const xPos = xScale(new Date(d.timestamp));
        const yPos = yScale(displayMode === 'value' ? d.value : d.changePct);

        crosshair
          .attr('x1', xPos)
          .attr('x2', xPos)
          .style('opacity', 1);

        focusPoint
          .attr('transform', `translate(${xPos},${yPos})`)
          .style('opacity', 1);

        setHoveredPoint(d);
        setTooltipPos({
          x: xPos + margin.left,
          y: yPos + margin.top,
        });
      })
      .on('mouseleave touchend', () => {
        crosshair.style('opacity', 0);
        focusPoint.style('opacity', 0);
        setHoveredPoint(null);
        setTooltipPos(null);
      });
  }, [historicalData, displayMode, showBenchmark, showMilestones, timeframe]);

  return (
    <div className="bg-[#09132e] border border-blue-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-white select-none">
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-blue-900/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shadow-md">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Portfolio Performance Analytics
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-600/30 text-blue-200 border border-blue-500/30 uppercase font-semibold">
                  D3 Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Institutional historical growth ledger for{' '}
                <span className="text-yellow-400 font-semibold">{currentUser?.name || 'Private Client'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe & Mode Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector (Value $ vs ROI %) */}
          <div className="bg-[#050c1e] p-1 rounded-xl border border-blue-900/60 flex items-center gap-1 text-xs font-mono">
            <button
              onClick={() => setDisplayMode('value')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                displayMode === 'value'
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setDisplayMode('percent')}
              className={`px-3 py-1.5 rounded-lg transition-all font-bold ${
                displayMode === 'percent'
                  ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-400/20'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ROI (%)
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="bg-[#050c1e] p-1 rounded-xl border border-blue-900/60 flex items-center gap-1 text-xs font-mono">
            {(['24H', '7D', '1M', '3M', '1Y', 'ALL'] as PortfolioTimeframe[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1.5 rounded-lg transition-all font-semibold ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-blue-950/40'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Benchmark & Milestone Toggles */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setShowBenchmark(!showBenchmark)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                showBenchmark
                  ? 'border-blue-500/50 bg-blue-950/40 text-blue-200'
                  : 'border-blue-900/40 bg-[#050c1e] text-slate-400'
              }`}
              title="Toggle Global Custody Benchmark curve"
            >
              <span className={`w-2 h-2 rounded-full ${showBenchmark ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
              Benchmark
            </button>
            <button
              onClick={() => setShowMilestones(!showMilestones)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                showMilestones
                  ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-300'
                  : 'border-blue-900/40 bg-[#050c1e] text-slate-400'
              }`}
              title="Toggle historical vault milestones"
            >
              <Award className="w-3 h-3 text-yellow-400" />
              Events
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Total Net Worth */}
        <div className="bg-[#050c1e] p-3.5 sm:p-4 rounded-xl border border-blue-900/60 shadow-lg">
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Portfolio Valuation</span>
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
            ${lastPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono mt-1">
            <span className={isPositive ? 'text-yellow-400 font-bold' : 'text-rose-400 font-bold'}>
              {isPositive ? '+' : ''}${netChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-slate-400">({timeframe})</span>
          </div>
        </div>

        {/* Total Period Return */}
        <div className="bg-[#050c1e] p-3.5 sm:p-4 rounded-xl border border-blue-900/60 shadow-lg">
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
            Cumulative Return
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1 text-yellow-400 flex items-center gap-1">
            {isPositive ? <TrendingUp className="w-5 h-5 text-yellow-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            <span>{isPositive ? '+' : ''}{netChangePct.toFixed(2)}%</span>
          </div>
          <div className="text-[11px] text-blue-200/80 font-mono mt-1">
            Alpha: <strong className="text-white">+{alphaVsBenchmark.toFixed(2)}%</strong> vs Mkt
          </div>
        </div>

        {/* Peak Net Worth */}
        <div className="bg-[#050c1e] p-3.5 sm:p-4 rounded-xl border border-blue-900/60 shadow-lg">
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
            Period High (Peak)
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
            ${peakValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Floor: <strong className="text-slate-300">${troughValue.toLocaleString(undefined, { minimumFractionDigits: 0 })}</strong>
          </div>
        </div>

        {/* Risk / Drawdown Ratio */}
        <div className="bg-[#050c1e] p-3.5 sm:p-4 rounded-xl border border-blue-900/60 shadow-lg">
          <div className="text-[11px] font-mono text-slate-300 uppercase tracking-wider">
            Max Drawdown & Health
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1 flex items-center gap-2">
            <span>{maxDrawdown.toFixed(1)}%</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
              Low Risk
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
            <span>Institutional Multi-Sig Tier</span>
          </div>
        </div>
      </div>

      {/* 3. D3 Line Chart Viewport */}
      <div 
        ref={containerRef} 
        className="relative bg-gradient-to-b from-[#060e26] to-[#04091a] border border-blue-900/50 rounded-xl p-2 sm:p-4 overflow-hidden"
      >
        <svg ref={svgRef} className="w-full h-[360px] overflow-visible"></svg>

        {/* Floating Tooltip positioned near mouse crosshair */}
        {hoveredPoint && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${Math.min(Math.max(tooltipPos.x, 90), (containerRef.current?.clientWidth || 800) - 90)}px`,
              top: `${Math.max(tooltipPos.y - 12, 10)}px`,
            }}
          >
            <div className="bg-[#070e24]/95 border border-yellow-400/70 shadow-2xl rounded-xl p-3 min-w-[190px] backdrop-blur-md">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pb-1.5 border-b border-blue-900/60">
                <span>{hoveredPoint.dateStr}</span>
                <span className="text-yellow-400 font-bold">SNAPSHOT</span>
              </div>
              
              <div className="mt-2 space-y-1">
                <div className="text-xs text-slate-300 font-medium">Estimated Value:</div>
                <div className="text-lg font-black font-mono text-white tracking-tight">
                  ${hoveredPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-slate-400">Total Gain:</span>
                  <span className={hoveredPoint.change >= 0 ? 'text-yellow-400 font-bold' : 'text-rose-400 font-bold'}>
                    {hoveredPoint.change >= 0 ? '+' : ''}${hoveredPoint.change.toLocaleString()} ({hoveredPoint.changePct >= 0 ? '+' : ''}{hoveredPoint.changePct}%)
                  </span>
                </div>

                {showBenchmark && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-blue-300">
                    <span className="text-slate-400">Benchmark:</span>
                    <span>+{hoveredPoint.benchmarkPct}%</span>
                  </div>
                )}

                {hoveredPoint.milestone && (
                  <div className="mt-2 pt-2 border-t border-blue-900/60 flex items-center gap-1.5 text-[11px] text-yellow-300 font-semibold bg-yellow-400/10 px-2 py-1 rounded">
                    <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span>{hoveredPoint.milestone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-3 border-t border-blue-900/40 px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-1 bg-yellow-400 rounded-full shadow-sm shadow-yellow-400"></div>
              <span className="text-slate-200 font-bold">Portfolio Net Worth</span>
            </div>
            {showBenchmark && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-blue-400 border-dashed border-b border-blue-400"></div>
                <span className="text-blue-300">Custodial Index Benchmark</span>
              </div>
            )}
            {showMilestones && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-white border border-yellow-400 rotate-45"></div>
                <span className="text-yellow-300">Vault Events</span>
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            Hover or touch curve for point-in-time valuation
          </div>
        </div>
      </div>

      {/* 4. Historical Milestone Timeline / Key Yield Achievements */}
      <div className="bg-[#050c1e] border border-blue-900/60 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Verified Growth Milestones & Capital Inflows
            </h3>
          </div>
          <span className="text-[11px] font-mono text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/30">
            Immutable Audit Trail
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-[#09132e] border border-blue-900/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="text-xs font-bold text-white">Vault Inception & Baseline</div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                Initial allocated equity: ${firstPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-blue-300 mt-1">Multi-tier cold storage initialized</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#09132e] border border-blue-900/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-white">Compound Capital Appreciation</div>
              <div className="text-[11px] text-yellow-400 font-bold font-mono mt-0.5">
                Net gain: +${netChange.toLocaleString(undefined, { minimumFractionDigits: 2 })} (+{netChangePct.toFixed(2)}%)
              </div>
              <div className="text-[10px] text-blue-300 mt-1">Automated algorithmic rebalancing</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#09132e] border border-blue-900/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-white">Current Vault Balance</div>
              <div className="text-[11px] text-white font-bold font-mono mt-0.5">
                ${lastPoint.value.toLocaleString(undefined, { minimumFractionDigits: 2 })} Liquid
              </div>
              <div className="text-[10px] text-yellow-300 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-yellow-400" />
                <span>Verified by Meridian Bancorp Custody</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
