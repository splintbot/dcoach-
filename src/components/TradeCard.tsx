'use client';

import { Trade } from '@/lib/types';

interface TradeCardProps {
  trade: Trade;
  isSelected: boolean;
  onAnalyze: () => void;
  isLoading: boolean;
}

function timeAgo(epochSeconds: number): string {
  const seconds = Math.floor(Date.now() / 1000) - epochSeconds;
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function TradeCard({
  trade,
  isSelected,
  onAnalyze,
  isLoading,
}: TradeCardProps) {
  const isWin = trade.profit > 0;
  const borderColor = isSelected
    ? 'border-blue-500'
    : isWin
      ? 'border-emerald-500/30'
      : 'border-red-500/30';
  const profitColor = isWin ? 'text-emerald-400' : 'text-red-400';
  const badge = isWin ? 'WIN' : 'LOSS';
  const badgeBg = isWin
    ? 'bg-emerald-500/10 text-emerald-400'
    : 'bg-red-500/10 text-red-400';

  return (
    <div
      className={`border ${borderColor} rounded-lg p-4 bg-gray-900/50 transition-all hover:bg-gray-900/80 ${isSelected ? 'ring-1 ring-blue-500/50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${badgeBg}`}
        >
          {isWin ? '▲' : '▼'} {badge}
        </span>
        <span className={`text-lg font-bold ${profitColor}`}>
          {isWin ? '+' : ''}${trade.profit.toFixed(2)}
        </span>
      </div>

      <div className="text-xs text-gray-400 space-y-1 mb-3">
        <p>
          {trade.underlying_symbol} &middot; {trade.contract_type} &middot;{' '}
          {trade.duration}
        </p>
        <p>
          Stake: ${trade.buy_price.toFixed(2)} &rarr; $
          {trade.sell_price.toFixed(2)}
        </p>
        <p className="text-gray-500">{timeAgo(trade.purchase_time)}</p>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className={`w-full text-xs font-semibold py-2 px-3 rounded transition-all ${
          isLoading
            ? 'bg-blue-500/20 text-blue-300 cursor-wait'
            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          '🔍 Analyze This Trade'
        )}
      </button>
    </div>
  );
}
