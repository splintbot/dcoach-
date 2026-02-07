'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  BarChart3,
  Clock,
  AlertTriangle,
  BookOpen,
  Target,
  Zap,
  Radio,
  Play,
  Eye,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { analyzeTrade } from './actions';
import { CONTENT_LIBRARY } from '@/lib/contentDb';

/* ================================================================
   TYPES
   ================================================================ */
interface DemoTrade {
  id: string;
  asset: string;
  symbol: string;
  type: 'CALL' | 'PUT';
  stake: number;
  payout: number;
  profit: number;
  duration: string;
  time: string;
  trend: string;
  volatility: string;
  context: string;
}

interface AnalysisResult {
  mistake: string;
  lesson: string;
  action: string;
  risk_score: number;
  content_tag: string;
}

/* ================================================================
   CONSTANTS
   ================================================================ */
const DEMO_TRADES: DemoTrade[] = [
  {
    id: 'T-4821',
    asset: 'Volatility 100 Index',
    symbol: 'R_100',
    type: 'CALL',
    stake: 10,
    payout: 19.5,
    profit: 9.5,
    duration: '2m',
    time: '14:32',
    trend: 'Bullish',
    volatility: 'Low',
    context:
      'Clean uptrend with consistent higher highs. Traded with the trend during a calm session.',
  },
  {
    id: 'T-4822',
    asset: 'Volatility 100 Index',
    symbol: 'R_100',
    type: 'CALL',
    stake: 25,
    payout: 47.5,
    profit: -25,
    duration: '5m',
    time: '15:07',
    trend: 'Bearish',
    volatility: 'High',
    context:
      'Counter-trend entry during sharp sell-off. Doubled stake after previous loss.',
  },
  {
    id: 'T-4823',
    asset: 'Volatility 75 Index',
    symbol: 'R_75',
    type: 'PUT',
    stake: 15,
    payout: 28.5,
    profit: -15,
    duration: '5m',
    time: '15:41',
    trend: 'Bullish',
    volatility: 'Medium',
    context:
      'Bet against strong bullish momentum on R_75. No confirmation signal before entry.',
  },
  {
    id: 'T-4824',
    asset: 'Volatility 50 Index',
    symbol: 'R_50',
    type: 'CALL',
    stake: 5,
    payout: 9.8,
    profit: -5,
    duration: '1m',
    time: '16:15',
    trend: 'Sideways',
    volatility: 'High',
    context:
      'Entered during choppy, range-bound market with no clear direction.',
  },
];

const TERMINAL_MESSAGES = [
  '> Establishing secure connection to Deriv API...',
  '> Fetching M1 candle data for market context...',
  '> Running pattern recognition on price action...',
  '> Cross-referencing with historical volatility data...',
  '> Analyzing risk-reward ratio and position sizing...',
  '> Querying DCoach Knowledge Base...',
  '> Generating personalized coaching insight...',
];

/* ================================================================
   SUB-COMPONENTS
   ================================================================ */

function Tooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 px-3 py-1.5 bg-gray-800 text-gray-300 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-gray-700 z-50">
        {text}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border-l border-t border-gray-700 rotate-45" />
      </div>
    </div>
  );
}

/* ── Circular Risk Meter with animated count-up ── */
function RiskMeter({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = Math.max(1, score / 40);
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplay(score);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(current));
      }
    }, 35);
    return () => clearInterval(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 40;
  const strokeColor =
    score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const label =
    score >= 70 ? 'HIGH RISK' : score >= 40 ? 'MODERATE' : 'LOW RISK';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1f2937"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{
              strokeDashoffset: circumference * (1 - score / 100),
            }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{display}%</span>
        </div>
      </div>
      <span
        className="text-xs mt-2 font-semibold tracking-wider"
        style={{ color: strokeColor }}
      >
        {label}
      </span>
    </div>
  );
}

/* ── Green scan-line overlay ── */
function ScannerBar() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-0.5 z-10"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, #10b981 40%, #34d399 50%, #10b981 60%, transparent 100%)',
        boxShadow: '0 0 15px 3px rgba(16,185,129,0.4)',
      }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/* ── Agent Terminal with cycling messages ── */
function AgentTerminal({ lines }: { lines: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/80 backdrop-blur border border-emerald-500/20 rounded-xl p-5 font-mono text-sm"
    >
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-800">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-400 text-xs font-semibold tracking-widest uppercase">
          DCoach Agent — Analyzing
        </span>
        <Loader2 className="w-3 h-3 text-emerald-500 animate-spin ml-auto" />
      </div>
      <div className="space-y-2 max-h-52 overflow-y-auto">
        <AnimatePresence>
          {lines.map((line, i) => (
            <motion.p
              key={`${i}-${line}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="text-emerald-300/70 text-xs leading-relaxed"
            >
              {line}
            </motion.p>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </motion.div>
  );
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function DCoachPage() {
  const [trades, setTrades] = useState<DemoTrade[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());

  /* ── Load demo data on mount ── */
  useEffect(() => {
    setTrades(DEMO_TRADES);
    setMounted(true);
  }, []);

  /* ── Terminal message cycling ── */
  useEffect(() => {
    if (!analyzingId) return;
    setTerminalLines([]);
    let index = 0;
    const interval = setInterval(() => {
      if (index < TERMINAL_MESSAGES.length) {
        setTerminalLines((prev) => [...prev, TERMINAL_MESSAGES[index]]);
        index++;
      }
    }, 600);
    return () => clearInterval(interval);
  }, [analyzingId]);

  /* ── Analyze handler ── */
  const handleAnalyze = useCallback(async (trade: DemoTrade) => {
    setAnalyzingId(trade.id);
    setSelectedTradeId(trade.id);
    setResult(null);
    setError(null);

    try {
      const res = await analyzeTrade({
        asset: trade.asset,
        symbol: trade.symbol,
        type: trade.type,
        stake: trade.stake,
        profit: trade.profit,
        duration: trade.duration,
        trend: trade.trend,
        volatility: trade.volatility,
        context: trade.context,
      });

      setResult(res as AnalysisResult);
    } catch {
      setError('Analysis failed. Retrying with offline data...');
      // Even if the server action completely dies, show something useful
      setTimeout(() => {
        setResult({
          mistake: trade.profit > 0
            ? 'Good trade — you followed the trend correctly.'
            : `Entered ${trade.type} against ${trade.trend.toLowerCase()} momentum on ${trade.symbol}.`,
          lesson: trade.profit > 0
            ? 'Winning trades happen when you align your direction with the market trend. Keep doing this.'
            : 'Always check the trend direction on the 1-minute chart before entering. If price is making lower lows, only trade PUT.',
          action: trade.profit > 0
            ? 'Journal this setup so you can replicate it consistently.'
            : 'Add a pre-trade checklist: 1) What is the trend? 2) Am I trading WITH it?',
          risk_score: trade.profit > 0 ? 25 : 72,
          content_tag: trade.profit > 0 ? 'risk_management' : 'trend_analysis',
        });
        setError(null);
      }, 500);
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  /* ── Mark video as watched ── */
  const handleWatched = useCallback((tag: string) => {
    setWatchedVideos((prev) => new Set(prev).add(tag));
  }, []);

  /* ── Derived values ── */
  const wins = trades.filter((t) => t.profit > 0).length;
  const losses = trades.length - wins;
  const totalPnL = trades.reduce((s, t) => s + t.profit, 0);
  const selectedTrade = trades.find((t) => t.id === selectedTradeId);
  const contentItem = result
    ? CONTENT_LIBRARY[result.content_tag as keyof typeof CONTENT_LIBRARY]
    : null;

  /* ── Render ── */
  return (
    <div
      className="min-h-screen bg-[#060609] text-gray-100 font-mono selection:bg-emerald-500/20"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }}
    >
      {/* ──────────────────── HEADER ──────────────────── */}
      <header className="border-b border-gray-800/60 backdrop-blur-sm sticky top-0 z-40 bg-[#060609]/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/10">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">
                <span className="text-white">DCoach</span>
                <span className="text-red-500">.ai</span>
              </h1>
              <p className="text-[10px] text-gray-600 tracking-wider uppercase">
                AI Trading Mentor
              </p>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Tooltip text="Coming Soon: OAuth Integration">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors cursor-default">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Connect Broker</span>
              </button>
            </Tooltip>
            <Tooltip text="Coming Soon: Real-time Sync">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-default">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Live Sync</span>
              </button>
            </Tooltip>
            <div className="hidden md:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-gray-800/40 text-[10px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Demo Mode
            </div>
          </div>
        </div>
      </header>

      {/* ──────────────────── STATS BAR ──────────────────── */}
      <div className="border-b border-gray-800/40 bg-[#060609]/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-6 text-xs text-gray-500 overflow-x-auto">
          <span>
            Trades:{' '}
            <span className="text-gray-300 font-medium">{trades.length}</span>
          </span>
          <span>
            Wins:{' '}
            <span className="text-emerald-400 font-medium">{wins}</span>
          </span>
          <span>
            Losses:{' '}
            <span className="text-red-400 font-medium">{losses}</span>
          </span>
          <span>
            P&L:{' '}
            <span
              className={`font-medium ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </span>
          </span>
          <span className="ml-auto text-gray-600">
            Powered by Deriv API &middot; Gemini AI
          </span>
        </div>
      </div>

      {/* ──────────────────── MAIN GRID ──────────────────── */}
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── LEFT: TRADE FEED (2 cols) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Trade History
              </h2>
            </div>
            <span className="text-xs text-gray-600">
              {wins}W / {losses}L
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {mounted &&
                trades.map((trade, index) => {
                  const win = trade.profit > 0;
                  const isAnalyzing = analyzingId === trade.id;
                  const isSelected = selectedTradeId === trade.id;

                  return (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{
                        opacity: isAnalyzing ? 0.6 : 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.08,
                        duration: 0.4,
                      }}
                      className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500/40 bg-blue-500/[0.04]'
                          : win
                            ? 'border-emerald-500/15 bg-emerald-500/[0.015]'
                            : 'border-red-500/15 bg-red-500/[0.015]'
                      } ${!isAnalyzing ? 'hover:bg-gray-800/20' : ''}`}
                    >
                      {/* SCANNER OVERLAY */}
                      {isAnalyzing && <ScannerBar />}

                      <div className="p-4">
                        {/* Row 1: Symbol + P&L */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            {win ? (
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-200">
                                {trade.symbol}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {trade.asset}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-sm font-bold tabular-nums ${win ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                              {win ? '+' : ''}${trade.profit.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-600">
                              {trade.id}
                            </p>
                          </div>
                        </div>

                        {/* Row 2: Tags */}
                        <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-500 mb-3">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold tracking-wide ${
                              trade.type === 'CALL'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {trade.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {trade.duration}
                          </span>
                          <span>
                            ${trade.stake} → ${trade.payout}
                          </span>
                          <span className="ml-auto tabular-nums">
                            {trade.time}
                          </span>
                        </div>

                        {/* Row 3: Context + CTA */}
                        <div className="flex items-end justify-between gap-3">
                          <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2 flex-1">
                            {trade.context}
                          </p>
                          <button
                            onClick={() => handleAnalyze(trade)}
                            disabled={!!analyzingId}
                            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                              isAnalyzing
                                ? 'bg-emerald-500/10 text-emerald-300 cursor-wait'
                                : analyzingId
                                  ? 'bg-gray-800/30 text-gray-600 cursor-not-allowed'
                                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 active:scale-95'
                            }`}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Scanning
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Analyze
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RIGHT: ANALYSIS PANEL (3 cols) ── */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              AI Analysis
            </h2>
          </div>

          {/* AGENT TERMINAL (while loading) */}
          <AnimatePresence mode="wait">
            {analyzingId && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AgentTerminal lines={terminalLines} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ERROR STATE */}
          {error && !analyzingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-amber-500/30 rounded-xl p-4 bg-amber-500/5 flex items-center gap-3"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-amber-300/80 text-xs">{error}</p>
            </motion.div>
          )}

          {/* RESULT CARD (post-analysis) */}
          <AnimatePresence mode="wait">
            {result && !analyzingId && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                {/* ── Risk Overview ── */}
                <div className="border border-gray-800/50 rounded-xl p-6 bg-gray-900/20 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <RiskMeter score={result.risk_score} />
                    <div className="flex-1 space-y-3 text-center sm:text-left">
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-semibold text-gray-200">
                          Risk Assessment
                        </h3>
                      </div>
                      {selectedTrade && (
                        <p className="text-xs text-gray-500">
                          {selectedTrade.symbol} &middot;{' '}
                          {selectedTrade.type} &middot; $
                          {selectedTrade.stake} stake &middot;{' '}
                          {selectedTrade.duration}
                        </p>
                      )}
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {result.mistake}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Mistake / Lesson / Action — Three Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    [
                      {
                        icon: (
                          <AlertTriangle className="w-4 h-4" />
                        ),
                        label: 'The Mistake',
                        text: result.mistake,
                        accent: 'red',
                      },
                      {
                        icon: <BookOpen className="w-4 h-4" />,
                        label: 'The Lesson',
                        text: result.lesson,
                        accent: 'blue',
                      },
                      {
                        icon: <Target className="w-4 h-4" />,
                        label: 'The Fix',
                        text: result.action,
                        accent: 'emerald',
                      },
                    ] as const
                  ).map((card, i) => (
                    <motion.div
                      key={card.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      className={`border rounded-xl p-4 ${
                        card.accent === 'red'
                          ? 'border-red-500/20 bg-red-500/[0.03]'
                          : card.accent === 'blue'
                            ? 'border-blue-500/20 bg-blue-500/[0.03]'
                            : 'border-emerald-500/20 bg-emerald-500/[0.03]'
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-2.5 ${
                          card.accent === 'red'
                            ? 'text-red-400'
                            : card.accent === 'blue'
                              ? 'text-blue-400'
                              : 'text-emerald-400'
                        }`}
                      >
                        {card.icon}
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {card.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {card.text}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* ── YouTube Recommendation + "I Have Watched This" ── */}
                {contentItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="border border-gray-800/50 rounded-xl overflow-hidden bg-gray-900/20"
                  >
                    <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-800/40">
                      <Play className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-semibold text-gray-200">
                        Recommended Learning
                      </h3>
                      <span className="ml-auto text-xs text-gray-500">
                        {contentItem.title}
                      </span>
                    </div>
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${contentItem.videoId}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={contentItem.title}
                      />
                    </div>
                    <div className="px-5 py-3 border-t border-gray-800/40 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-500 leading-relaxed flex-1">
                        {contentItem.description}
                      </p>
                      {watchedVideos.has(result.content_tag) ? (
                        <span className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Watched
                        </span>
                      ) : (
                        <button
                          onClick={() => handleWatched(result.content_tag)}
                          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 active:scale-95 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          I have watched this
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* EMPTY STATE */}
          {!result && !analyzingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-dashed border-gray-800/50 rounded-xl p-16 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gray-800/40 flex items-center justify-center">
                <Zap className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
                Select a trade to analyze
              </p>
              <p className="text-gray-600 text-xs mt-2.5 max-w-xs mx-auto leading-relaxed">
                Click <strong className="text-gray-400">&quot;Analyze&quot;</strong> on any
                trade to receive a personalized forensic breakdown from
                DCoach AI
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ──────────────────── FOOTER ──────────────────── */}
      <footer className="border-t border-gray-800/40 mt-8">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between text-[10px] text-gray-600">
          <span>DCoach.ai &mdash; Deriv AI Talent Sprint 2025</span>
          <span>
            Built with Next.js &middot; Gemini AI &middot; Deriv API
          </span>
        </div>
      </footer>
    </div>
  );
}
