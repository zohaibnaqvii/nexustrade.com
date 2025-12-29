import React, { useMemo } from 'react';
import { X, Trophy, Medal, Crown } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Seeded random for consistent leaderboard across all users
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
}

const traderNames = [
  'Trader_Pro', 'CryptoKing', 'FX_Master', 'Alpha_Trades', 'WinStreak',
  'QuickFlip', 'SteadyHands', 'NightOwl', 'GreenCandle', 'BullRunner',
  'ProfitHunter', 'SmartMoney', 'TrendRider', 'GoldenRatio', 'SwingKing',
  'ScalpMaster', 'MomentumX', 'PipCollector', 'RiskManager', 'ChartWizard'
];

// Generate 24-hour leaderboard - same for ALL users, resets every 24 hours
const generateLeaderboard = () => {
  // Seed based on current day (resets every 24 hours at midnight UTC)
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daySeed = Math.floor(utcDate.getTime() / 1000 / 86400);
  
  const rng = new SeededRandom(daySeed * 12345);
  
  // Shuffle and pick 10 traders
  const shuffled = [...traderNames].sort(() => rng.next() - 0.5).slice(0, 10);
  
  return shuffled.map((name, index) => {
    const r1 = rng.next();
    const r2 = rng.next();
    const r3 = rng.next();
    
    // Higher ranks get higher profits
    const baseProfit = (10 - index) * 1500;
    const profit = baseProfit + r1 * 2000;
    const trades = Math.floor(50 + r2 * 300);
    const winRate = 55 + r3 * 25;
    
    return {
      rank: index + 1,
      name,
      profit: Math.round(profit * 100) / 100,
      trades,
      winRate: Math.round(winRate * 10) / 10
    };
  }).sort((a, b) => b.profit - a.profit).map((item, index) => ({
    ...item,
    rank: index + 1
  }));
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-gray-300" />;
    case 3:
      return <Medal className="w-5 h-5 text-orange-400" />;
    default:
      return <span className="text-gray-400 font-bold text-sm w-5 text-center">{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
    case 3:
      return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 border-orange-500/30';
    default:
      return 'bg-[#252d3d] border-[#3a4a5e]';
  }
};

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  // Generate leaderboard - memoized so it's consistent during the session
  const leaderboardData = useMemo(() => generateLeaderboard(), []);
  
  // Calculate time until next reset (midnight UTC)
  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#1a1f2e] rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a3548]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold text-lg">24h Leaderboard</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#2a3548] rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Timer Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-yellow-400 text-sm font-medium">Resets in:</span>
            <span className="text-white font-mono font-bold">{getTimeUntilReset()}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {leaderboardData.map((trader) => (
            <div
              key={trader.rank}
              className={`flex items-center justify-between p-3 rounded-xl border ${getRankBg(trader.rank)}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getRankIcon(trader.rank)}
                </div>
                <div>
                  <div className="text-white font-medium">{trader.name}</div>
                  <div className="text-gray-500 text-xs">{trader.trades} trades • {trader.winRate}% win</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">+${trader.profit.toLocaleString()}</div>
                <div className="text-gray-500 text-xs">USD</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a3548] bg-[#252d3d]/50">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Top traders in the last 24 hours</p>
            <p className="text-gray-500 text-xs mt-1">Rankings are the same for all users</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
