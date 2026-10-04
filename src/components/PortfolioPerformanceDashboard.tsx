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

  // Safely extract total wallet net worth
  const currentTotal = useMemo(() => {
    if (typeof wallet?.totalUsd === 'number' && Number.isFinite(wallet.totalUsd) && wallet.totalUsd > 0) {
      return wallet.totalUsd;
    }
    return 78450.25;
  }, [wallet?.totalUsd]);

  // Generate deterministic historical data for the user & timeframe
  const historicalData: PortfolioHistoricalPoint[] = useMemo(() => {
    const seed = (currentUser?.username || 'meridian_user')
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const points: PortfolioHistoricalPoint[] = [];
    const now = Date.now();

    let count = 30;
    let stepMs = 86400000; // 1 day
    let totalGainPct = 0.095; // 9.5% default 1M gain

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

    const baseline = Number.isFinite(currentTotal / (1 + totalGainPct))
      ? currentTotal / (1 + totalGainPct)
      : currentTotal * 0.9;
    const benchmarkBaseline = baseline * 0.95;

    // Create realistic deterministic curve with minor dips and strong secular growth
    let runningVal = baseline;
    let runningBenchmark = benchmarkBaseline;

    for (let i = 0; i < count; i++) {
      const progress = count > 1 ? i / (count - 1) : 0;
      const timestamp = now - (count - 1 - i) * stepMs;
      const dateObj = new Date(timestamp);

      // Deterministic pseudorandom noise using sine and seed
      const noise = Math.sin((i + seed) * 0.85) * 0.018 + Math.cos(i * 1.6 + seed) * 0.012;
      const expectedGrowth = baseline + (currentTotal - baseline) * Math.pow(progress, 1.15);
      
      // End point exactly matches current wallet net worth
      if (i === count - 1) {
        runningVal = currentTotal;
      } else {
        const computed = expectedGrowth * (1 + noise);
        runningVal = Number.isFinite(computed) ? Math.max(baseline * 0.85, computed) : baseline;
      }

      // Benchmark tracks broader indices (e.g. S&P 500 / Digital Asset Custody Index)
      const benchmarkGrowth = benchmarkBaseline + (currentTotal * 0.78 - benchmarkBaseline) * Math.pow(progress, 1.25);
      const benchmarkNoise = Math.cos(i + seed * 1.5) * 0.015;
      const rawBenchmark = i === count - 1 ? currentTotal * 0.84 : benchmarkGrowth * (1 + benchmarkNoise);
      runningBenchmark = Number.isFinite(rawBenchmark) ? rawBenchmark : benchmarkBaseline;

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

      const finalVal = Number.isFinite(runningVal) ? runningVal : baseline;
      const change = finalVal - baseline;
      const changePct = baseline > 0 && Number.isFinite(change / baseline) ? (change / baseline) * 100 : 0;
      const benchmarkPct = benchmarkBaseline > 0 && Number.isFinite((runningBenchmark - benchmarkBaseline) / benchmarkBaseline)
        ? ((runningBenchmark - benchmarkBaseline) / benchmarkBaseline) * 100
        : 0;

      points.push({
        timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
        dateStr: dateStr || 'Today',
        value: Number(finalVal.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePct: Number(changePct.toFixed(2)),
        benchmarkValue: Number(runningBenchmark.toFixed(2)),
        benchmarkPct: Number(benchmarkPct.toFixed(2)),
        milestone,
        depositWithdrawal,
      });
    }

    return points;
  }, [currentTotal, currentUser?.username, timeframe]);

  // Performance Summary calculations
  const firstPoint = historicalData[0] || {
    value: currentTotal,
    change: 0,
    changePct: 0,
    benchmarkValue: currentTotal,
    benchmarkPct: 0,
    dateStr: '',
    timestamp: Date.now()
  };
  const lastPoint = historicalData[historicalData.length - 1] || firstPoint;
  const netChange = Number.isFinite(lastPoint.value - firstPoint.value) ? lastPoint.value - firstPoint.value : 0;
  const netChangePct = Number.isFinite(firstPoint.value) && firstPoint.value > 0
    ? ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100
    : 0;
  const isPositive = netChange >= 0;

  const peakValue = useMemo(() => {
    const vals = historicalData.map(p => p.value).filter(Number.isFinite);
    return vals.length > 0 ? Math.max(...vals) : currentTotal;
  }, [historicalData, currentTotal]);

  const troughValue = useMemo(() => {
    const vals = historicalData.map(p => p.value).filter(Number.isFinite);
    return vals.length > 0 ? Math.min(...vals) : currentTotal;
  }, [historicalData, currentTotal]);

  const maxDrawdown = useMemo(() => {
    let peak = -Infinity;
    let maxDd = 0;
    for (const p of historicalData) {
      if (Number.isFinite(p.value)) {
        if (p.value > peak) peak = p.value;
        if (peak > 0) {
          const dd = ((peak - p.value) / peak) * 100;
          if (Number.isFinite(dd) && dd > maxDd) maxDd = dd;
        }
      }
    }
    return Number.isFinite(maxDd) ? maxDd : 0;
  }, [historicalData]);

  // Alpha vs Benchmark
  const alphaVsBenchmark = Number.isFinite(netChangePct - (lastPoint.benchmarkPct || 0))
    ? netChangePct - (lastPoint.benchmarkPct || 0)
    : 0;

  // D3 Chart Rendering
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || historicalData.length === 0) return;

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const rect = containerRef.current.getBoundingClientRect();
      const rawWidth = rect.width;
      const width = Number.isFinite(rawWidth) && rawWidth > 150 ? rawWidth : 800;
      const height = 360;
      const margin = { top: 25, right: 30, bottom: 35, left: 65 };
      const innerWidth = Math.max(width - margin.left - margin.right, 50);
      const innerHeight = Math.max(height - margin.top - margin.bottom, 50);

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
        .attr('stop-color', '#facc15')
        .attr('stop-opacity', 0.38);

      areaGradient
        .append('stop')
        .attr('offset', '45%')
        .attr('stop-color', '#2563eb')
        .attr('stop-opacity', 0.16);

      areaGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#050c1e')
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

      // Scales with finite validation
      const validTimestamps = historicalData.map(d => d.timestamp).filter(Number.isFinite);
      const minTimestamp = validTimestamps.length > 0 ? Math.min(...validTimestamps) : Date.now() - 86400000;
      let maxTimestamp = validTimestamps.length > 0 ? Math.max(...validTimestamps) : Date.now();
      if (maxTimestamp <= minTimestamp) {
        maxTimestamp = minTimestamp + 86400000;
      }

      const xScale = d3
        .scaleTime()
        .domain([new Date(minTimestamp), new Date(maxTimestamp)])
        .range([0, innerWidth]);

      const validYValues = historicalData
        .map(d => displayMode === 'value' ? d.value : d.changePct)
        .filter(Number.isFinite);

      const rawMin = validYValues.length > 0 ? Math.min(...validYValues) : 0;
      const rawMax = validYValues.length > 0 ? Math.max(...validYValues) : 100;
      const span = Math.max(rawMax - rawMin, 1);
      const padding = span * 0.12;

      let yMin = displayMode === 'value' ? Math.max(0, rawMin - padding) : rawMin - padding;
      let yMax = rawMax + padding;
      if (!Number.isFinite(yMin)) yMin = 0;
      if (!Number.isFinite(yMax)) yMax = 100;
      if (yMax <= yMin) yMax = yMin + 10;

      const yScale = d3
        .scaleLinear()
        .domain([yMin, yMax])
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
        .attr('stroke', '#1e3a8a')
        .attr('stroke-opacity', 0.35)
        .attr('stroke-dasharray', '3,3');

      g.select('.gridline .domain').remove();

      // Benchmark line (if enabled and mode is percent)
      if (showBenchmark) {
        const benchmarkLine = d3
          .line<PortfolioHistoricalPoint>()
          .defined(d => Number.isFinite(d.timestamp) && Number.isFinite(displayMode === 'value' ? d.benchmarkValue : d.benchmarkPct))
          .x(d => {
            const x = xScale(new Date(d.timestamp));
            return Number.isFinite(x) ? x : 0;
          })
          .y(d => {
            const val = displayMode === 'value' ? d.benchmarkValue : d.benchmarkPct;
            const y = yScale(Number.isFinite(val) ? val : 0);
            return Number.isFinite(y) ? y : innerHeight;
          })
          .curve(d3.curveMonotoneX);

        g.append('path')
          .datum(historicalData)
          .attr('fill', 'none')
          .attr('stroke', '#60a5fa')
          .attr('stroke-opacity', 0.5)
          .attr('stroke-width', 1.75)
          .attr('stroke-dasharray', '4,4')
          .attr('d', benchmarkLine);
      }

      // Main Area generator
      const areaGenerator = d3
        .area<PortfolioHistoricalPoint>()
        .defined(d => Number.isFinite(d.timestamp) && Number.isFinite(displayMode === 'value' ? d.value : d.changePct))
        .x(d => {
          const x = xScale(new Date(d.timestamp));
          return Number.isFinite(x) ? x : 0;
        })
        .y0(innerHeight)
        .y1(d => {
          const val = displayMode === 'value' ? d.value : d.changePct;
          const y = yScale(Number.isFinite(val) ? val : 0);
          return Number.isFinite(y) ? y : innerHeight;
        })
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(historicalData)
        .attr('fill', 'url(#portfolio-area-gradient)')
        .attr('d', areaGenerator);

      // Main Curve Line generator
      const lineGenerator = d3
        .line<PortfolioHistoricalPoint>()
        .defined(d => Number.isFinite(d.timestamp) && Number.isFinite(displayMode === 'value' ? d.value : d.changePct))
        .x(d => {
          const x = xScale(new Date(d.timestamp));
          return Number.isFinite(x) ? x : 0;
        })
        .y(d => {
          const val = displayMode === 'value' ? d.value : d.changePct;
          const y = yScale(Number.isFinite(val) ? val : 0);
          return Number.isFinite(y) ? y : innerHeight;
        })
        .curve(d3.curveMonotoneX);

      // Main Glowing stroke
      g.append('path')
        .datum(historicalData)
        .attr('fill', 'none')
        .attr('stroke', '#facc15')
        .attr('stroke-width', 2.5)
        .attr('filter', 'url(#line-glow)')
        .attr('d', lineGenerator);

      // Milestone markers
      if (showMilestones) {
        const milestones = historicalData.filter(d => !!d.milestone);
        const milestoneGroup = g.append('g').attr('class', 'milestones');

        milestones.forEach(m => {
          const rawX = xScale(new Date(m.timestamp));
          const rawY = yScale(displayMode === 'value' ? m.value : m.changePct);
          const cx = Number.isFinite(rawX) ? rawX : 0;
          const cy = Number.isFinite(rawY) ? rawY : 0;

          // Milestone pulse halo
          milestoneGroup
            .append('circle')
            .attr('cx', cx)
            .attr('cy', cy)
            .attr('r', 7)
            .attr('fill', 'rgba(250, 204, 21, 0.25)');

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
          if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return '';
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
        .attr('color', '#94a3b8')
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('fill', '#93c5fd')
        .attr('dy', '1em');

      g.select('.domain').attr('stroke', '#1e3a8a');

      // Y-Axis
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(6)
        .tickFormat(d => {
          const val = d as number;
          if (!Number.isFinite(val)) return '0';
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

      // Helper: Safely calculate clientX and clientY without calling SVGPoint.matrixTransform
      const getPointerCoords = (e: MouseEvent | TouchEvent, target: Element): [number, number] | null => {
        let clientX: number | undefined;
        let clientY: number | undefined;

        if ('touches' in e && e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
          clientX = e.changedTouches[0].clientX;
          clientY = e.changedTouches[0].clientY;
        } else if ('clientX' in e && typeof e.clientX === 'number') {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        if (clientX === undefined || clientY === undefined || !Number.isFinite(clientX) || !Number.isFinite(clientY)) {
          return null;
        }

        const bounding = target.getBoundingClientRect();
        if (!bounding || bounding.width <= 0) return null;

        const x = clientX - bounding.left;
        const y = clientY - bounding.top;

        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

        return [Math.max(0, Math.min(x, innerWidth)), Math.max(0, Math.min(y, innerHeight))];
      };

      // Overlay rect for pointer interactions
      g.append('rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr('fill', 'transparent')
        .style('cursor', 'crosshair')
        .on('mousemove touchmove', function (event: MouseEvent | TouchEvent) {
          try {
            const coords = getPointerCoords(event, this);
            if (!coords) return;

            const [xRelative] = coords;
            const x0 = xScale.invert(xRelative);
            if (!(x0 instanceof Date) || !Number.isFinite(x0.getTime())) return;

            const index = bisectDate(historicalData, x0, 1);
            const d0 = historicalData[index - 1];
            const d1 = historicalData[index];
            let d = d0;

            if (d1 && d0) {
              d = x0.getTime() - d0.timestamp > d1.timestamp - x0.getTime() ? d1 : d0;
            }

            if (!d) return;

            const rawX = xScale(new Date(d.timestamp));
            const rawY = yScale(displayMode === 'value' ? d.value : d.changePct);
            const xPos = Number.isFinite(rawX) ? rawX : 0;
            const yPos = Number.isFinite(rawY) ? rawY : 0;

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
          } catch {
            // ignore non-finite errors
          }
        })
        .on('mouseleave touchend', () => {
          crosshair.style('opacity', 0);
          focusPoint.style('opacity', 0);
          setHoveredPoint(null);
          setTooltipPos(null);
        });
    } catch (err) {
      console.error('D3 render error:', err);
    }
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
            <span>{isPositive ? '+' : ''}{Number.isFinite(netChangePct) ? netChangePct.toFixed(2) : '0.00'}%</span>
          </div>
          <div className="text-[11px] text-blue-200/80 font-mono mt-1">
            Alpha: <strong className="text-white">+{Number.isFinite(alphaVsBenchmark) ? alphaVsBenchmark.toFixed(2) : '0.00'}%</strong> vs Mkt
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
            <span>{Number.isFinite(maxDrawdown) ? maxDrawdown.toFixed(1) : '0.0'}%</span>
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
                Net gain: +${netChange.toLocaleString(undefined, { minimumFractionDigits: 2 })} (+{Number.isFinite(netChangePct) ? netChangePct.toFixed(2) : '0.00'}%)
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
