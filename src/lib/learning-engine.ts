import { Trade, LearningConcept, LearningState } from './types';

export const CONCEPTS: LearningConcept[] = [
  {
    id: 'trend_analysis',
    name: 'Trend Analysis',
    level: 1,
    description: 'Reading market direction before placing a trade',
    icon: '📈',
  },
  {
    id: 'risk_management',
    name: 'Risk Management',
    level: 1,
    description: 'Controlling how much you risk per trade',
    icon: '🛡️',
  },
  {
    id: 'volatility',
    name: 'Understanding Volatility',
    level: 1,
    description: 'How price movement intensity affects your trades',
    icon: '🌊',
  },
  {
    id: 'timing',
    name: 'Entry Timing',
    level: 2,
    description: 'When to enter a trade for the best odds',
    icon: '⏱️',
  },
  {
    id: 'position_sizing',
    name: 'Position Sizing',
    level: 2,
    description: 'How much to stake relative to your balance',
    icon: '⚖️',
  },
  {
    id: 'diversification',
    name: 'Asset Selection',
    level: 2,
    description: 'Choosing the right market for your strategy',
    icon: '🎯',
  },
  {
    id: 'psychology',
    name: 'Trading Psychology',
    level: 3,
    description: 'Managing emotions and avoiding revenge trading',
    icon: '🧠',
  },
  {
    id: 'entry_signals',
    name: 'Entry Confirmation',
    level: 3,
    description: 'Using multiple signals to confirm trade direction',
    icon: '✅',
  },
];

export function getInitialLearningState(): LearningState {
  const state: LearningState = {};
  CONCEPTS.forEach((c) => {
    state[c.id] = { unlocked: false, interactions: 0, mastered: false };
  });
  return state;
}

export function updateLearningState(
  state: LearningState,
  conceptId: string
): LearningState {
  const current = state[conceptId] || {
    unlocked: false,
    interactions: 0,
    mastered: false,
  };
  return {
    ...state,
    [conceptId]: {
      unlocked: true,
      interactions: current.interactions + 1,
      mastered: current.interactions + 1 >= 3,
    },
  };
}

export function calculateRiskScore(trades: Trade[]): number {
  let score = 50;
  const recent = trades.slice(-10);
  if (recent.length === 0) return score;

  // Martingale detection: doubling stake after a loss
  for (let i = 1; i < recent.length; i++) {
    if (
      recent[i - 1].profit < 0 &&
      recent[i].buy_price >= recent[i - 1].buy_price * 1.5
    ) {
      score += 15;
    }
  }

  // High loss rate
  const lossRate =
    recent.filter((t) => t.profit < 0).length / recent.length;
  if (lossRate > 0.7) score += 15;
  else if (lossRate > 0.5) score += 5;

  // Oversized individual stakes
  const avgStake =
    recent.reduce((sum, t) => sum + t.buy_price, 0) / recent.length;
  const maxStake = Math.max(...recent.map((t) => t.buy_price));
  if (maxStake > avgStake * 3) score += 10;

  // Revenge trading: quick re-entry after a loss
  for (let i = 1; i < recent.length; i++) {
    const gap = recent[i].purchase_time - recent[i - 1].sell_time;
    if (gap < 300 && recent[i - 1].profit < 0) {
      score += 5;
    }
  }

  return Math.min(100, Math.max(0, score));
}

export function getLearnedConceptNames(state: LearningState): string[] {
  return Object.entries(state)
    .filter(([, progress]) => progress.unlocked)
    .map(([id]) => {
      const concept = CONCEPTS.find((c) => c.id === id);
      return concept?.name || id;
    });
}

export function getTradingIQ(state: LearningState): number {
  let iq = 0;
  Object.values(state).forEach((progress) => {
    if (progress.unlocked) iq += 5;
    iq += progress.interactions * 3;
    if (progress.mastered) iq += 10;
  });
  return Math.min(100, iq);
}
