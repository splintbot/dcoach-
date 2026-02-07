export const CONTENT_LIBRARY: Record<
  string,
  { id: string; title: string; videoId: string; description: string }
> = {
  risk_management: {
    id: 'risk_management',
    title: 'Risk Management Essentials',
    videoId: '6b8_aN5y5Kw',
    description:
      'Learn the fundamentals of position sizing, stop-loss placement, and the 1-2% rule that professional traders swear by.',
  },
  trend_analysis: {
    id: 'trend_analysis',
    title: 'Trend Identification Masterclass',
    videoId: 'rxY4K3x7hSw',
    description:
      'How to identify bullish, bearish, and sideways markets using price action and moving averages before placing a trade.',
  },
  market_psychology: {
    id: 'market_psychology',
    title: 'Trading Psychology & Discipline',
    videoId: 'b5sY3qXJbSs',
    description:
      'Overcome revenge trading, FOMO, and emotional decision-making. Build the mental framework of a consistent trader.',
  },
  technical_indicators: {
    id: 'technical_indicators',
    title: 'RSI & MACD Explained',
    videoId: 'mdZ7sPjL-XQ',
    description:
      'Master the two most popular momentum indicators — Relative Strength Index and Moving Average Convergence Divergence.',
  },
};
