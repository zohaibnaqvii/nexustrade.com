import React, { useState } from 'react';
import { TradingPair, TRADING_PAIRS, TIMEFRAMES } from '@/services/trading';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

interface TradePanelProps {
  selectedPair: TradingPair;
  onPairChange: (pair: TradingPair) => void;
  currentPrice: number;
  onPlaceTrade: (direction: 'up' | 'down', amount: number, duration: number) => void;
  isTrading: boolean;
}

const TradePanel: React.FC<TradePanelProps> = ({
  selectedPair,
  onPairChange,
  currentPrice,
  onPlaceTrade,
  isTrading
}) => {
  const { balance, isDemo } = useAuth();
  const [amount, setAmount] = useState<string>('10');
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[3]); // 1m default
  const [showPairSelector, setShowPairSelector] = useState(false);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAmount(value);
    } else if (value === '') {
      setAmount('');
    }
  };

  const quickAmounts = [5, 10, 25, 50, 100];

  const potentialProfit = (parseFloat(amount) || 0) * (selectedPair.payout / 100);

  return (
    <div className="flex flex-col h-full">
      {/* Pair Selector */}
      <div className="relative mb-4">
        <button
          onClick={() => setShowPairSelector(!showPairSelector)}
          className="w-full pair-selector"
        >
          <span className="text-2xl">{selectedPair.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-semibold text-foreground">{selectedPair.symbol}</div>
            <div className="text-xs text-muted-foreground">{selectedPair.name}</div>
          </div>
          <div className="text-right">
            <div className="text-profit font-bold">{selectedPair.payout}%</div>
            <div className="text-xs text-muted-foreground">Payout</div>
          </div>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showPairSelector ? 'rotate-180' : ''}`} />
        </button>

        {showPairSelector && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel-dark z-50 max-h-64 overflow-y-auto animate-slide-up">
            {TRADING_PAIRS.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => {
                  onPairChange(pair);
                  setShowPairSelector(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors ${
                  pair.symbol === selectedPair.symbol ? 'bg-accent' : ''
                }`}
              >
                <span className="text-xl">{pair.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{pair.symbol}</div>
                  <div className="text-xs text-muted-foreground">{pair.name}</div>
                </div>
                <span className="text-profit font-semibold">{pair.payout}%</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeframe Selector */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
          Expiry Time
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setSelectedTimeframe(tf)}
              className={`timeframe-btn ${
                selectedTimeframe.label === tf.label ? 'timeframe-btn-active' : ''
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
          Investment
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="trading-input w-full pl-8 pr-4 text-xl font-bold font-mono text-center"
            placeholder="0.00"
          />
        </div>
        <div className="flex gap-2 mt-2">
          {quickAmounts.map((qa) => (
            <button
              key={qa}
              onClick={() => setAmount(qa.toString())}
              className="flex-1 py-1.5 text-xs font-medium bg-secondary rounded-lg hover:bg-accent transition-colors text-foreground"
            >
              ${qa}
            </button>
          ))}
        </div>
      </div>

      {/* Profit Display */}
      <div className="glass-panel p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Potential Profit</span>
          <span className="text-profit font-bold font-mono text-lg">
            +${potentialProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-muted-foreground">Balance</span>
          <span className={`font-bold font-mono ${isDemo ? 'text-muted-foreground' : 'text-foreground'}`}>
            ${balance.toFixed(2)} {isDemo && <span className="text-xs">(Demo)</span>}
          </span>
        </div>
      </div>

      {/* Trade Buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => onPlaceTrade('up', parseFloat(amount) || 0, selectedTimeframe.seconds)}
          disabled={isTrading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="flex-1 btn-profit py-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-lg font-bold">UP</span>
        </button>
        <button
          onClick={() => onPlaceTrade('down', parseFloat(amount) || 0, selectedTimeframe.seconds)}
          disabled={isTrading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
          className="flex-1 btn-loss py-5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrendingDown className="w-6 h-6" />
          <span className="text-lg font-bold">DOWN</span>
        </button>
      </div>
    </div>
  );
};

export default TradePanel;
