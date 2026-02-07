export interface Trade {
  transaction_id: string;
  contract_id: number;
  purchase_time: number;
  sell_time: number;
  buy_price: number;
  sell_price: number;
  profit: number;
  underlying_symbol: string;
  underlying_name: string;
  contract_type: 'CALL' | 'PUT';
  duration: string;
  payout: number;
  market_context: MarketContext;
}

export interface MarketContext {
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  description: string;
}

export interface TradeAnalysis {
  verdict: 'WIN' | 'LOSS';
  mistake: string;
  concept_id: string;
  concept_name: string;
  lesson: string;
  action_items: string[];
  risk_assessment: 'low' | 'medium' | 'high' | 'critical';
  encouragement: string;
}

export interface LearningConcept {
  id: string;
  name: string;
  level: number;
  description: string;
  icon: string;
}

export interface ConceptProgress {
  unlocked: boolean;
  interactions: number;
  mastered: boolean;
}

export interface LearningState {
  [conceptId: string]: ConceptProgress;
}
