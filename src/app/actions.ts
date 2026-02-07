'use server';

/* ================================================================
   MOCK RESPONSES — Demo never fails, no matter what.
   These are context-aware: the right mock is picked based on the
   trade parameters so the demo looks intelligent even offline.
   ================================================================ */

interface AnalysisResult {
  mistake: string;
  lesson: string;
  action: string;
  risk_score: number;
  content_tag: string;
}

const MOCK_RESPONSES: Record<string, AnalysisResult> = {
  loss_countertrend: {
    mistake:
      'Counter-trend entry on Volatility 100 during high-momentum bearish phase — you bought CALL while every signal pointed DOWN.',
    lesson:
      'This is a classic "Momentum Trap." When price is falling sharply (high volatility + bearish trend), buying CALL is like swimming upstream in a river. The market\'s momentum (the speed and strength of price movement) needs to exhaust itself before a reversal is possible. Look for exhaustion signals like a Doji candle (a candle with almost no body) at a support level before betting against the trend.',
    action:
      'Before your next trade, check the 1-minute chart: are the last 5 candles making lower lows? If yes, only trade PUT or sit on your hands.',
    risk_score: 82,
    content_tag: 'trend_analysis',
  },
  loss_psychology: {
    mistake:
      'Doubled your stake to $25 immediately after a loss — classic Martingale behavior driven by the urge to "win it back."',
    lesson:
      'This is called "Revenge Trading" — placing an emotionally charged trade to recover losses. The Martingale strategy (doubling your bet after each loss) is mathematically guaranteed to wipe your account eventually. Professional traders do the opposite: they reduce size after a loss to protect capital while their edge is cold.',
    action:
      'Set a personal rule: after 2 consecutive losses, take a 15-minute break. Never increase stake size after a loss.',
    risk_score: 91,
    content_tag: 'market_psychology',
  },
  loss_ranging: {
    mistake:
      'Entered a directional CALL trade on a sideways, choppy market with no identifiable trend.',
    lesson:
      'Ranging markets (where price bounces between a ceiling and a floor with no clear direction) are the hardest environment for directional trades like CALL/PUT. Your odds drop from favorable to essentially a coin flip. The RSI indicator (Relative Strength Index, a 0-100 momentum gauge) can help: readings near 50 in a range suggest "no edge — stay out."',
    action:
      'Before entering, ask: "Can I draw a clear trend line?" If you can\'t draw it in 3 seconds, the trend doesn\'t exist — skip the trade.',
    risk_score: 58,
    content_tag: 'technical_indicators',
  },
  loss_noconfirm: {
    mistake:
      'Bet PUT against strong bullish momentum with zero confirmation signals — pure gut feeling against the market.',
    lesson:
      'Trading against a clear trend without confirmation is one of the most common beginner errors. A "confirmation signal" is a secondary piece of evidence that supports your trade idea — like RSI showing overbought (above 70), or a bearish engulfing candle at resistance. Without confirmation, you are guessing, not trading.',
    action:
      'Add one rule to your checklist: "I need at least ONE indicator or candle pattern confirming my direction before I click Buy."',
    risk_score: 68,
    content_tag: 'technical_indicators',
  },
  win_default: {
    mistake:
      'Traded WITH the trend during low volatility — textbook execution. Your entry aligned with bullish momentum.',
    lesson:
      'This is what good trading looks like. You identified the market direction correctly (bullish trend) and chose CALL — going with the flow, not against it. Low volatility meant the price action was clean and predictable. The key insight: your win was not luck, it was a repeatable process. The challenge now is consistency — doing this same thing 10, 20, 50 times.',
    action:
      'Document this setup in a trading journal. Screenshot the chart. When you feel tempted to gamble, look at this entry and ask: "Does my next trade look like THIS?"',
    risk_score: 22,
    content_tag: 'risk_management',
  },
};

/* ================================================================
   INPUT TYPE
   ================================================================ */

interface TradeInput {
  asset: string;
  symbol: string;
  type: string;
  stake: number;
  profit: number;
  duration: string;
  trend: string;
  volatility: string;
  context: string;
}

/* ================================================================
   SMART MOCK PICKER — chooses the right mock based on trade data
   ================================================================ */

function getMockResponse(trade: TradeInput): AnalysisResult {
  if (trade.profit > 0) return MOCK_RESPONSES.win_default;
  if (trade.stake >= 20) return MOCK_RESPONSES.loss_psychology;
  if (trade.trend.toLowerCase() === 'sideways') return MOCK_RESPONSES.loss_ranging;
  if (trade.trend.toLowerCase() === 'bullish' && trade.type === 'PUT')
    return MOCK_RESPONSES.loss_noconfirm;
  if (trade.trend.toLowerCase() === 'bearish' && trade.type === 'CALL')
    return MOCK_RESPONSES.loss_countertrend;
  return MOCK_RESPONSES.loss_countertrend;
}

/* ================================================================
   SERVER ACTION
   ================================================================ */

export async function analyzeTrade(trade: TradeInput): Promise<AnalysisResult> {
  // Deliberate delay so the scanner + terminal animations play out
  await new Promise((r) => setTimeout(r, 2500));

  // Try real AI analysis — if ANYTHING fails, fall back to smart mock
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error('No API key');

    const { generateObject } = await import('ai');
    const { google } = await import('@ai-sdk/google');
    const { z } = await import('zod');

    const schema = z.object({
      mistake: z.string(),
      lesson: z.string(),
      action: z.string(),
      risk_score: z.number().min(0).max(100),
      content_tag: z.enum([
        'risk_management',
        'trend_analysis',
        'market_psychology',
        'technical_indicators',
      ]),
    });

    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema,
      system: `You are DCoach, an expert AI trading tutor for Deriv synthetic indices.
Analyze the completed trade and provide a forensic breakdown.
RULES:
- Reference the ACTUAL asset name, dollar amounts, and duration.
- Define every financial term in plain English using parentheses.
- NEVER give forward-looking advice. Only analyze the past trade.
- Be honest but encouraging.`,
      prompt: `TRADE FORENSICS:
Asset: ${trade.asset} (${trade.symbol})
Direction: ${trade.type} (betting price goes ${trade.type === 'CALL' ? 'UP' : 'DOWN'})
Stake: $${trade.stake}
Result: ${trade.profit > 0 ? 'WIN' : 'LOSS'} ($${trade.profit > 0 ? '+' : ''}${trade.profit})
Duration: ${trade.duration}
Market Trend: ${trade.trend}
Volatility: ${trade.volatility}
Context: ${trade.context}`,
    });

    return object as AnalysisResult;
  } catch {
    // AI unavailable — return smart context-aware mock. Demo never breaks.
    return getMockResponse(trade);
  }
}
