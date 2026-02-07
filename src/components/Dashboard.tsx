'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trade, TradeAnalysis, LearningState } from '@/lib/types';
import { MOCK_TRADES } from '@/lib/mock-data';
import {
  getInitialLearningState,
  updateLearningState,
  calculateRiskScore,
  getLearnedConceptNames,
  getTradingIQ,
} from '@/lib/learning-engine';
import { analyzeTrade } from '@/app/actions';
import TradeCard from './TradeCard';
import CoachPanel from './CoachPanel';

const STORAGE_KEY = 'dcoach_learning';

export default function Dashboard() {
  const [trades] = useState<Trade[]>(MOCK_TRADES);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<TradeAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [learningState, setLearningState] = useState<LearningState>(
    getInitialLearningState()
  );
  const [error, setError] = useState<string | null>(null);

  // Load learning state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLearningState(JSON.parse(saved));
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  // Persist learning state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(learningState));
  }, [learningState]);

  const riskScore = calculateRiskScore(trades);
  const tradingIQ = getTradingIQ(learningState);

  const wins = trades.filter((t) => t.profit > 0).length;
  const losses = trades.length - wins;
  const winRate = Math.round((wins / trades.length) * 100);
  const totalPnL = trades.reduce((sum, t) => sum + t.profit, 0);

  const handleAnalyze = useCallback(
    async (trade: Trade) => {
      setSelectedTrade(trade);
      setLoading(true);
      setError(null);
      setAnalysis(null);

      try {
        const result = await analyzeTrade(
          trade,
          trades,
          getLearnedConceptNames(learningState)
        );
        setAnalysis(result);
        setAnalysisHistory((prev) => [result, ...prev]);
        setLearningState((prev) => updateLearningState(prev, result.concept_id));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Analysis failed. Check your API key in .env.local');
      } finally {
        setLoading(false);
      }
    },
    [trades, learningState]
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-mono">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              DCoach<span className="text-emerald-500">.ai</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              AI Trading Tutor &middot; Powered by Deriv &amp; Gemini
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-block bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">
              DEMO MODE
            </span>
            <div className="text-right text-xs text-gray-400 space-y-0.5">
              <p>
                {wins}W / {losses}L ({winRate}%)
              </p>
              <p className={totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                P&L: {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Trade Feed */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Your Trades
            </h2>
            <span className="text-xs text-gray-600">
              {trades.length} trades
            </span>
          </div>
          <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {trades
              .slice()
              .reverse()
              .map((trade) => (
                <TradeCard
                  key={trade.transaction_id}
                  trade={trade}
                  isSelected={
                    selectedTrade?.transaction_id === trade.transaction_id
                  }
                  onAnalyze={() => handleAnalyze(trade)}
                  isLoading={
                    loading &&
                    selectedTrade?.transaction_id === trade.transaction_id
                  }
                />
              ))}
          </div>
        </div>

        {/* Right Column: Coach Panel */}
        <div className="lg:col-span-2">
          <CoachPanel
            analysis={analysis}
            analysisHistory={analysisHistory}
            loading={loading}
            error={error}
            learningState={learningState}
            riskScore={riskScore}
            tradingIQ={tradingIQ}
          />
        </div>
      </div>
    </main>
  );
}
