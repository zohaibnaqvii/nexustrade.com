import React, { useState } from 'react';
import { PAYOUT_PERCENTAGE } from '../constants';

interface TradePanelProps { balance: number; onTrade: (direction: 'UP' | 'DOWN', amount: number, duration: number) => void; candleCountdown: number; }

const TradePanel: React.FC<TradePanelProps> = ({ balance, onTrade }) => {
  const [amount, setAmount] = useState<number>(100);
  const [duration, setDuration] = useState<number>(60);
  const profit = amount * PAYOUT_PERCENTAGE;

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s === 0 ? `${m}m` : `${m}m ${s}s`;
  };

  const adjustDuration = (val: number) => {
    setDuration(prev => Math.max(5, prev + val));
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] px-4 py-2 gap-2 overflow-hidden border-t-2 border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
      
      {/* Input Section */}
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[8px] uppercase font-black px-1 tracking-widest">STAKE AMOUNT</label>
          <div className="flex items-center bg-black border-2 border-white/10 rounded-xl overflow-hidden h-[40px] shadow-inner focus-within:border-blue-500/50 transition-all">
            <button onClick={() => setAmount(Math.max(1, amount - 10))} className="px-4 h-full hover:bg-white/5 text-gray-400 font-black transition-all active:scale-90 text-lg">−</button>
            <input type="number" value={amount} onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-transparent text-white text-center font-black text-sm focus:outline-none" />
            <button onClick={() => setAmount(amount + 10)} className="px-4 h-full hover:bg-white/5 text-gray-400 font-black transition-all active:scale-90 text-lg">+</button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-gray-500 text-[8px] uppercase font-black px-1 tracking-widest">TRADE DURATION</label>
          <div className="flex items-center bg-black border-2 border-white/10 rounded-xl overflow-hidden h-[40px] shadow-inner focus-within:border-blue-500/50 transition-all">
            <button onClick={() => adjustDuration(-15)} className="px-4 h-full hover:bg-white/5 text-gray-400 font-black transition-all active:scale-90 text-lg">−</button>
            <div className="w-full text-white text-center font-black text-sm select-none">{formatDuration(duration)}</div>
            <button onClick={() => adjustDuration(15)} className="px-4 h-full hover:bg-white/5 text-gray-400 font-black transition-all active:scale-90 text-lg">+</button>
          </div>
        </div>
      </div>

      {/* Extremely Thin Expected Profit Box */}
      <div className="bg-black/60 py-0.5 rounded-md border border-white/5 flex flex-col items-center justify-center shrink-0 shadow-lg">
        <span className="text-gray-500 text-[6px] uppercase font-black tracking-[0.2em] mb-0 opacity-60">PROFIT (+{Math.round(PAYOUT_PERCENTAGE*100)}%)</span>
        <span className="text-green-500 font-black text-lg tracking-tighter leading-none">$ {(amount + profit).toFixed(2)}</span>
      </div>

      {/* Action Buttons - MOVED HIGHER TO ENSURE VISIBILITY ON MOBILE CONTAINERS */}
      <div className="flex gap-4 shrink-0 mt-1 mb-20 pb-16">
        <button 
          onClick={() => onTrade('UP', amount, duration)}
          className="flex-1 bg-[#089981] hover:bg-[#067d6a] active:scale-[0.97] transition-all rounded-xl py-4 flex flex-col items-center justify-center gap-1 shadow-[0_12px_30px_rgba(8,153,129,0.4)] border-2 border-green-400/20"
        >
          <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 15l7-7 7 7"></path></svg>
          <span className="text-[10px] font-black text-white tracking-[0.15em] uppercase">CALL / UP</span>
        </button>

        <button 
          onClick={() => onTrade('DOWN', amount, duration)}
          className="flex-1 bg-[#f23645] hover:bg-[#d12e3b] active:scale-[0.97] transition-all rounded-xl py-4 flex flex-col items-center justify-center gap-1 shadow-[0_12px_30px_rgba(242,54,69,0.4)] border-2 border-red-400/20"
        >
          <span className="text-[10px] font-black text-white tracking-[0.15em] uppercase">PUT / DOWN</span>
          <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default TradePanel;
