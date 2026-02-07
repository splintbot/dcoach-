'use client';

import { TradeAnalysis, LearningState } from '@/lib/types';
import { CONCEPTS } from '@/lib/learning-engine';

interface CoachPanelProps {
  analysis: TradeAnalysis | null;
  analysisHistory: TradeAnalysis[];
  loading: boolean;
  error: string | null;
  learningState: LearningState;
  riskScore: number;
  tradingIQ: number;
}

function RiskBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-red-500'
      : score >= 60
        ? 'bg-orange-500'
        : score >= 40
          ? 'bg-yellow-500'
          : 'bg-emerald-500';
  const label =
    score >= 80
      ? 'CRITICAL'
      : score >= 60
        ? 'HIGH'
        : score >= 40
          ? 'MODERATE'
          : 'LOW';

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Risk Score</span>
        <span className={score >= 60 ? 'text-red-400' : 'text-gray-300'}>
          {score}/100 &middot; {label}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function IQBar({ iq }: { iq: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Trading IQ</span>
        <span className="text-emerald-400">{iq}/100</span>
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${iq}%` }}
        />
      </div>
    </div>
  );
}

function LearningPath({ state }: { state: LearningState }) {
  const levels = [1, 2, 3];
  const levelLabels = ['Fundamentals', 'Intermediate', 'Advanced'];

  return (
    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
      <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
        Learning Path
      </h3>
      {levels.map((level, idx) => {
        const levelConcepts = CONCEPTS.filter((c) => c.level === level);
        return (
          <div key={level} className="mb-4 last:mb-0">
            <p className="text-xs text-gray-500 mb-2 font-semibold">
              LEVEL {level} — {levelLabels[idx]}
            </p>
            <div className="space-y-2">
              {levelConcepts.map((concept) => {
                const progress = state[concept.id];
                const pct = progress
                  ? Math.min(100, (progress.interactions / 3) * 100)
                  : 0;
                return (
                  <div key={concept.id} className="flex items-center gap-2">
                    <span className="text-sm w-5">{concept.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span
                          className={
                            progress?.unlocked
                              ? 'text-gray-200'
                              : 'text-gray-600'
                          }
                        >
                          {concept.name}
                          {progress?.mastered && (
                            <span className="ml-1 text-emerald-400">✓</span>
                          )}
                        </span>
                        <span className="text-gray-600">
                          {progress?.interactions || 0}/3
                        </span>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progress?.mastered ? 'bg-emerald-400' : progress?.unlocked ? 'bg-blue-500' : 'bg-gray-700'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InsightCard({ analysis }: { analysis: TradeAnalysis }) {
  const riskColor = {
    low: 'text-emerald-400 bg-emerald-500/10',
    medium: 'text-yellow-400 bg-yellow-500/10',
    high: 'text-orange-400 bg-orange-500/10',
    critical: 'text-red-400 bg-red-500/10',
  }[analysis.risk_assessment];

  return (
    <div className="border border-gray-800 rounded-lg p-5 bg-gray-900/30 space-y-4">
      {/* Verdict + Diagnosis */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${analysis.verdict === 'WIN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
          >
            {analysis.verdict}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${riskColor}`}>
            {analysis.risk_assessment.toUpperCase()} RISK
          </span>
        </div>
        <p className="text-gray-200 text-sm font-medium">
          {analysis.mistake}
        </p>
      </div>

      {/* Concept Badge */}
      <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">
        <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">
          Concept:
        </span>
        <span className="text-blue-300 text-sm">{analysis.concept_name}</span>
      </div>

      {/* Lesson */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          The Lesson
        </h4>
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {analysis.lesson}
        </div>
      </div>

      {/* Action Items */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Before Your Next Trade
        </h4>
        <ul className="space-y-1.5">
          {analysis.action_items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-emerald-400 mt-0.5">→</span>
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Encouragement */}
      <div className="border-t border-gray-800 pt-3">
        <p className="text-sm text-emerald-400 italic">
          {analysis.encouragement}
        </p>
      </div>
    </div>
  );
}

export default function CoachPanel({
  analysis,
  analysisHistory,
  loading,
  error,
  learningState,
  riskScore,
  tradingIQ,
}: CoachPanelProps) {
  return (
    <div className="space-y-5">
      {/* Section: Coach's Corner */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
          Coach&apos;s Corner
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="border border-blue-500/30 rounded-lg p-6 bg-blue-500/5 text-center">
            <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-blue-300 text-sm">
              DCoach is analyzing your trade...
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Reading market context, identifying patterns, crafting your lesson
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="border border-red-500/30 rounded-lg p-4 bg-red-500/5">
            <p className="text-red-400 text-sm font-medium">
              Analysis failed
            </p>
            <p className="text-red-300/70 text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Analysis Result */}
        {analysis && !loading && !error && <InsightCard analysis={analysis} />}

        {/* Welcome State */}
        {!analysis && !loading && !error && (
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/30 text-center">
            <p className="text-2xl mb-3">🎓</p>
            <p className="text-gray-300 text-sm font-medium">
              Welcome to DCoach
            </p>
            <p className="text-gray-500 text-xs mt-2 max-w-sm mx-auto">
              Click <strong>&quot;Analyze&quot;</strong> on any trade in your
              history to get a personalized lesson. Each analysis unlocks a new
              concept in your Learning Path.
            </p>
          </div>
        )}
      </div>

      {/* Section: Progress Bars */}
      <div className="grid grid-cols-2 gap-4">
        <RiskBar score={riskScore} />
        <IQBar iq={tradingIQ} />
      </div>

      {/* Section: Learning Path */}
      <LearningPath state={learningState} />

      {/* Section: Analysis History */}
      {analysisHistory.length > 1 && (
        <div className="border border-gray-800 rounded-lg p-4 bg-gray-900/30">
          <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
            Previous Analyses ({analysisHistory.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {analysisHistory.slice(1).map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-xs border-b border-gray-800/50 pb-2 last:border-0"
              >
                <span
                  className={
                    a.verdict === 'WIN'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }
                >
                  {a.verdict === 'WIN' ? '▲' : '▼'}
                </span>
                <div>
                  <p className="text-gray-300">{a.mistake}</p>
                  <p className="text-gray-500 mt-0.5">
                    Concept: {a.concept_name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
