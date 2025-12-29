import React, { useState } from 'react';
import { TradingPair, TIMEFRAMES } from '@/services/trading';
import { ChevronDown, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileTradePanelProps {
  selectedPair: TradingPair;
  onOpenPairSelector: () => void;
  selectedTimeframe: { label: string; seconds: number };
  onTimeframeChange: (tf: { label: string; seconds: number }) => void;
  amount: number;
  onAmountChange: (amount: number) => void;
  balance: number;
  potentialProfit: number;
  onPlaceTrade: (direction: 'up' | 'down') => void;
  isTrading: boolean;
  isDemo: boolean;
  pendingTradesCount: number;
}

const MobileTradePanel: React.FC<MobileTradePanelProps> = ({
  selectedPair,
  onOpenPairSelector,
  selectedTimeframe,
  onTimeframeChange,
  amount,
  onAmountChange,
  balance,
  potentialProfit,
  onPlaceTrade,
  isTrading,
  isDemo,
  pendingTradesCount
}) => {
  const { toast } = useToast();
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [inputValue, setInputValue] = useState(amount.toString());
  const [showTimeframes, setShowTimeframes] = useState(false);

  const canTrade = isDemo || balance > 0;
  const isDisabled = isTrading || amount <= 0 || amount > balance || !canTrade;

  const handleAmountSubmit = () => {
    const newAmount = parseFloat(inputValue) || 0;
    if (newAmount > 0) {
      onAmountChange(newAmount);
    }
    setIsEditingAmount(false);
  };

  const handlePendingTradesClick = () => {
    if (pendingTradesCount === 0) {
      toast({
        title: 'No Pending Trades',
        description: 'No pending trades available now',
      });
    }
  };

  return (
    <div className="bg-[#1a1f2e] border-t border-[#2a3548] shrink-0">
      {/* Pair Selector Row */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a3548]">
        <button
          onClick={onOpenPairSelector}
          className="flex items-center gap-2"
        >
          <span className="text-lg">{selectedPair.icon}</span>
          <span className="text-white font-semibold text-sm">{selectedPair.symbol}</span>
          <span className="text-green-400 font-bold text-sm">{selectedPair.payout}%</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>
        
        {/* Pending Trades Toggle */}
        <button
          onClick={handlePendingTradesClick}
          className="flex items-center gap-2"
        >
          <span className="text-blue-400 text-[10px] font-medium">PENDING TRADE</span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${
            pendingTradesCount > 0 ? 'bg-blue-500' : 'bg-gray-600'
          }`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
              pendingTradesCount > 0 ? 'right-0.5' : 'left-0.5'
            }`} />
          </div>
        </button>
      </div>

      {/* Time & Investment Row */}
      <div className="flex gap-2 px-3 py-2 border-b border-[#2a3548]">
        {/* Time Selector - Clickable dropdown */}
        <div className="flex-1 relative">
          <div className="text-gray-500 text-[10px] mb-0.5">Time</div>
          <button
            onClick={() => setShowTimeframes(!showTimeframes)}
            className="w-full bg-[#252d3d] border border-[#3a4a5e] rounded-lg px-2 py-2 flex items-center justify-between"
          >
            <span className="text-white font-mono font-bold text-sm">{selectedTimeframe.label}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          
          {showTimeframes && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTimeframes(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#252d3d] border border-[#3a4a5e] rounded-lg shadow-xl z-50 py-1 max-h-48 overflow-y-auto">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.label}
                    onClick={() => {
                      onTimeframeChange(tf);
                      setShowTimeframes(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      tf.label === selectedTimeframe.label
                        ? 'bg-green-500/20 text-green-400'
                        : 'text-gray-300 hover:bg-[#3a4a5e]'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Investment - Editable */}
        <div className="flex-1">
          <div className="text-gray-500 text-[10px] mb-0.5">Investment</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAmountChange(Math.max(1, amount - 10))}
              className="w-8 h-9 bg-[#252d3d] border border-[#3a4a5e] rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold active:bg-[#3a4a5e]"
            >
              -
            </button>
            
            {isEditingAmount ? (
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleAmountSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleAmountSubmit()}
                autoFocus
                className="flex-1 h-9 bg-[#252d3d] border border-green-500 rounded-lg px-2 text-center text-white font-mono font-bold text-sm outline-none"
              />
            ) : (
              <button
                onClick={() => {
                  setInputValue(amount.toString());
                  setIsEditingAmount(true);
                }}
                className="flex-1 h-9 bg-[#252d3d] border border-[#3a4a5e] rounded-lg flex items-center justify-center"
              >
                <span className="text-white font-mono font-bold text-sm">${amount.toLocaleString()}</span>
              </button>
            )}
            
            <button
              onClick={() => onAmountChange(amount + 10)}
              className="w-8 h-9 bg-[#252d3d] border border-[#3a4a5e] rounded-lg flex items-center justify-center text-gray-400 text-lg font-bold active:bg-[#3a4a5e]"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Payout */}
      <div className="text-center py-1.5 border-b border-[#2a3548]">
        <span className="text-gray-400 text-xs">Payout: </span>
        <span className="text-white font-bold text-sm">${potentialProfit.toFixed(2)}</span>
      </div>

      {/* Trade Buttons - Always show colors */}
      <div className="flex gap-2 p-2">
        <button
          onClick={() => onPlaceTrade('down')}
          disabled={isDisabled}
          className="flex-1 h-12 rounded-lg font-bold text-white text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
          style={{
            background: 'linear-gradient(180deg, #ff1744 0%, #d50000 100%)',
            boxShadow: '0 4px 15px rgba(255, 23, 68, 0.4)',
          }}
        >
          <ArrowDown className="w-5 h-5" />
          <span>Down</span>
        </button>
        <button
          onClick={() => onPlaceTrade('up')}
          disabled={isDisabled}
          className="flex-1 h-12 rounded-lg font-bold text-white text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
          style={{
            background: 'linear-gradient(180deg, #00c853 0%, #00a152 100%)',
            boxShadow: '0 4px 15px rgba(0, 200, 83, 0.4)',
          }}
        >
          <span>Up</span>
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
      
      {!isDemo && balance <= 0 && (
        <div className="px-3 pb-2 text-center">
          <span className="text-red-400 text-xs">Deposit required to trade on Live account</span>
        </div>
      )}
    </div>
  );
};

export default MobileTradePanel;
