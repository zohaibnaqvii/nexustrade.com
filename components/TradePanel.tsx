import React, { useState } from 'react';
import { PAYOUT_PERCENTAGE } from '../constants';

interface TradePanelProps {
  balance: number;
  onTrade: (direction: 'UP' | 'DOWN', amount: number, duration: number) => void;
  candleCountdown: number;
}

const TradePanel: React.FC<TradePanelProps> = ({ balance, onTrade }) => {
  const [amount, setAmount] = useState<number>(100);
  const [duration, setDuration] = useState<number>(60); // Default 60 seconds
  const profit = amount * PAYOUT_PERCENTAGE;

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
  };

  const adjustDuration = (val: number) => {
    setDuration(prev => Math.max(5, prev + val)); // Min 5 seconds
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] px-3 py-1.5 gap-1.5 overflow-hidden border-t-2 border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
      
      {/* Compact Split Input Section */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[8px] uppercase font-black px-1 tracking-widest">AMOUNT ($)</label>
          <div className="flex items-center bg-black border border-white/10 rounded-lg overflow-hidden h-[38px] shadow-inner transition-colors focus-within:border-blue-500/50">
            <button onClick={() => setAmount(Math.max(1, amount - 10))} className="px-3 h-full hover:bg-white/10 text-gray-400 font-black transition-all active:scale-90 text-lg">−</button>
            <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-transparent text-white text-center font-black text-sm focus:outline-none placeholder:text-gray-800"
            />
            <button onClick={() => setAmount(amount + 10)} className="px-3 h-full hover:bg-white/10 text-gray-400 font-black transition-all active:scale-90 text-lg">+</button>
          </div>
        </div>

        {/* Right: Duration */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[8px] uppercase font-black px-1 tracking-widest">EXPIRY</label>
          <div className="flex items-center bg-black border border-white/10 rounded-lg overflow-hidden h-[38px] shadow-inner transition-colors focus-within:border-blue-500/50">
            <button onClick={() => adjustDuration(-15)} className="px-3 h-full hover:bg-white/10 text-gray-400 font-black transition-all active:scale-90 text-lg">−</button>
            <div className="w-full text-white text-center font-black text-sm select-none">
                {formatDuration(duration)}
            </div>
            <button onClick={() => adjustDuration(15)} className="px-3 h-full hover:bg-white/10 text-gray-400 font-black transition-all active:scale-90 text-lg">+</button>
          </div>
        </div>
      </div>

      {/* Smaller Payout Box */}
      <div className="bg-black/60 py-1 rounded-lg border border-white/5 flex flex-col items-center justify-center shrink-0 shadow-lg">
        <span className="text-gray-500 text-[7px] uppercase font-black tracking-[0.2em] mb-0.5 opacity-70">PAYOUT (+{Math.round(PAYOUT_PERCENTAGE*100)}%)</span>
        <span className="text-green-500 font-black text-xl tracking-tighter leading-none">$ {(amount + profit).toFixed(2)}</span>
      </div>

      {/* Action Buttons - Moved Slightly Up (Added mb-2) */}
      <div className="flex gap-3 shrink-0 mt-auto mb-2">
        <button 
          onClick={() => onTrade('UP', amount, duration)}
          className="flex-1 bg-[#089981] hover:bg-[#067d6a] active:scale-[0.98] transition-all rounded-xl py-3 flex flex-col items-center justify-center gap-0.5 shadow-[0_8px_20px_rgba(8,153,129,0.3)] border-2 border-green-400/30"
        >
          <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7"></path></svg>
          <span className="text-[10px] font-black text-white tracking-[0.1em] uppercase">CALL / UP</span>
        </button>

        <button 
          onClick={() => onTrade('DOWN', amount, duration)}
          className="flex-1 bg-[#f23645] hover:bg-[#d12e3b] active:scale-[0.98] transition-all rounded-xl py-3 flex flex-col items-center justify-center gap-0.5 shadow-[0_8px_20px_rgba(242,54,69,0.3)] border-2 border-red-400/30"
        >
          <span className="text-[10px] font-black text-white tracking-[0.1em] uppercase">PUT / DOWN</span>
          <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default TradePanel;