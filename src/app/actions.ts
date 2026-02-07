'use server';

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { Trade, TradeAnalysis } from '@/lib/types';

const SYSTEM_PROMPT = `You are DCoach, an expert AI trading tutor specializing in Deriv synthetic indices.

YOUR PERSONALITY:
- You are a wise, patient mentor — not a chatbot
- You explain complex concepts using simple analogies a beginner would understand
- You reference the SPECIFIC numbers from the trade (never be generic)
- You are honest about mistakes but always encouraging
- You NEVER give forward-looking advice ("buy X now" or "sell Y tomorrow")
- You ONLY analyze past, completed trades

RULES:
1. Every financial term you use MUST be immediately defined in simple words
2. Reference the actual dollar amounts, asset names, and durations from the trade
3. If you identify a concept the student has already learned, BUILD on it — connect the dots
4. Your lesson should feel like a 1-on-1 tutoring session, not a textbook

RESPOND WITH ONLY RAW JSON — no markdown, no code blocks, no extra text.

The JSON must match this exact shape:
{
  "verdict": "WIN" or "LOSS",
  "mistake": "One clear sentence describing what happened in this trade",
  "concept_id": "MUST be one of: trend_analysis, risk_management, volatility, timing, position_sizing, diversification, psychology, entry_signals",
  "concept_name": "Human-readable name for the concept",
  "lesson": "2-3 paragraphs explaining the concept using THIS trade as the example. Use the actual numbers. End with a clear takeaway.",
  "action_items": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "risk_assessment": "low" or "medium" or "high" or "critical",
  "encouragement": "One motivating sentence to keep the student going"
}`;

function buildUserPrompt(
  trade: Trade,
  recentTrades: Trade[],
  learnedConcepts: string[]
): string {
  const direction = trade.contract_type === 'CALL' ? 'UP' : 'DOWN';
  const result = trade.profit > 0 ? 'WIN' : 'LOSS';

  const recentSummary = recentTrades
    .slice(-5)
    .map(
      (t) =>
        `  - ${t.contract_type} on ${t.underlying_name}, $${t.buy_price} stake, ${t.profit > 0 ? 'WIN' : 'LOSS'} ($${t.profit > 0 ? '+' : ''}${t.profit.toFixed(2)})`
    )
    .join('\n');

  const conceptsList =
    learnedConcepts.length > 0
      ? learnedConcepts.join(', ')
      : 'None yet — this is the student\'s first analysis';

  return `TRADE TO ANALYZE:
- Asset: ${trade.underlying_name} (${trade.underlying_symbol})
- Direction: ${trade.contract_type} (betting price goes ${direction})
- Stake: $${trade.buy_price.toFixed(2)}
- Payout if won: $${trade.payout.toFixed(2)}
- Result: ${result} ($${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)})
- Duration: ${trade.duration}
- Market Trend: ${trade.market_context.trend}
- Market Volatility: ${trade.market_context.volatility}
- Market Context: ${trade.market_context.description}

RECENT TRADING HISTORY (last 5 trades):
${recentSummary}

CONCEPTS ALREADY LEARNED BY THIS STUDENT:
${conceptsList}

Analyze this trade and teach the student something valuable.`;
}

function extractJSON(text: string): TradeAnalysis {
  // Try direct parse
  try {
    return JSON.parse(text) as TradeAnalysis;
  } catch {
    // ignore
  }

  // Try extracting from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as TradeAnalysis;
    } catch {
      // ignore
    }
  }

  // Try finding a JSON object in the text
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]) as TradeAnalysis;
    } catch {
      // ignore
    }
  }

  throw new Error('Could not parse AI response. Please try again.');
}

export async function analyzeTrade(
  trade: Trade,
  recentTrades: Trade[],
  learnedConcepts: string[]
): Promise<TradeAnalysis> {
  const userPrompt = buildUserPrompt(trade, recentTrades, learnedConcepts);

  const { text } = await generateText({
    model: google('gemini-1.5-flash'),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
  });

  const analysis = extractJSON(text);

  // Validate required fields exist
  const required: (keyof TradeAnalysis)[] = [
    'verdict',
    'mistake',
    'concept_id',
    'concept_name',
    'lesson',
    'action_items',
    'risk_assessment',
    'encouragement',
  ];
  for (const field of required) {
    if (!analysis[field]) {
      throw new Error(`AI response missing required field: ${field}`);
    }
  }

  return analysis;
}
