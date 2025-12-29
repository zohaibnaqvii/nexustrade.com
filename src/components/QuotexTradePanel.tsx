import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TradingPair } from '@/services/trading';
import { Plus, Minus, ArrowUp, ArrowDown } from 'lucide-react';

interface Timeframe {
  label: string;
  seconds: number;
}

interface QuotexTradePanelProps {
  selectedPair: TradingPair;
  selectedTimeframe: Timeframe;
  timeframes: Timeframe[];
  onTimeframeChange: (tf: Timeframe) => void;
  amount: number;
  onAmountChange: (amount: number) => void;
  currentPrice: number;
  onPlaceTrade: (direction: 'up' | 'down') => void;
  isTrading: boolean;
}

const QuotexTradePanel: React.FC<QuotexTradePanelProps> = ({
  selectedPair,
  selectedTimeframe,
  timeframes,
  onTimeframeChange,
  amount,
  onAmountChange,
  currentPrice,
  onPlaceTrade,
  isTrading
}) => {
  const { balance, isDemo } = useAuth();

  const adjustAmount = (delta: number) => {
    const newAmount = Math.max(1, amount + delta);
    onAmountChange(newAmount);
  };

  const potentialProfit = amount * (selectedPair.payout / 100);

  return (
    <div className="w-[280px] quotex-panel flex flex-col">
      {/* Timeframe Selector */}
      <div className="p-3 border-b border-border">
        <div className="text-xs text-muted-foreground mb-2 font-medium">Time</div>
        <div className="grid grid-cols-4 gap-1">
          {timeframes.slice(0, 4).map((tf) => (
            <button
              key={tf.label}
              onClick={() => onTimeframeChange(tf)}
              className={`quotex-timeframe ${
                selectedTimeframe.label === tf.label ? 'quotex-timeframe-active' : ''
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 mt-1">
          {timeframes.slice(4).map((tf) => (
            <button
              key={tf.label}
              onClick={() => onTimeframeChange(tf)}
              className={`quotex-timeframe ${
                selectedTimeframe.label === tf.label ? 'quotex-timeframe-active' : ''
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="p-3 border-b border-border">
        <div className="text-xs text-muted-foreground mb-2 font-medium">Investment</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustAmount(-10)}
            className="amount-btn"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(Math.max(1, parseInt(e.target.value) || 0))}
              className="quotex-input pl-7"
            />
          </div>
          <button
            onClick={() => adjustAmount(10)}
            className="amount-btn"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick amounts */}
        <div className="flex gap-1 mt-2">
          {[10, 25, 50, 100].map((a) => (
            <button
              key={a}
              onClick={() => onAmountChange(a)}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                amount === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              ${a}
            </button>
          ))}
        </div>
      </div>

      {/* Payout Info */}
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payout</span>
          <span className="text-[hsl(var(--profit))] font-bold">{selectedPair.payout}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Profit</span>
          <span className="text-[hsl(var(--profit))] font-bold font-mono">+${potentialProfit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Balance</span>
          <span className={`font-bold font-mono ${isDemo ? 'text-muted-foreground' : 'text-foreground'}`}>
            ${balance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Trade Buttons */}
      <div className="flex-1 flex flex-col gap-3 p-3">
        <button
          onClick={() => onPlaceTrade('up')}
          disabled={isTrading || amount <= 0 || amount > balance}
          className="quotex-btn-up flex-1 flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUp className="w-6 h-6" />
          <span>UP</span>
        </button>
        <button
          onClick={() => onPlaceTrade('down')}
          disabled={isTrading || amount <= 0 || amount > balance}
          className="quotex-btn-down flex-1 flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDown className="w-6 h-6" />
          <span>DOWN</span>
        </button>
      </div>
    </div>
  );
};

export default QuotexTradePanel;
