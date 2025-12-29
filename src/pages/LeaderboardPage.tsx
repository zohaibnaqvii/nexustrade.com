import React, { useMemo } from 'react';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

// Generate TODAY's leaderboard - resets every 24 hours at midnight UTC
const generateTodayLeaderboard = () => {
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daySeed = Math.floor(utcDate.getTime() / 1000 / 86400);
  
  const rng = new SeededRandom(daySeed * 12345);
  
  const shuffled = [...traderNames].sort(() => rng.next() - 0.5).slice(0, 10);
  
  return shuffled.map((name, index) => {
    const r1 = rng.next();
    const r2 = rng.next();
    const r3 = rng.next();
    
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

// Get time until next reset
const getTimeUntilReset = () => {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
};

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Generate today's leaderboard - same for all users
  const leaderboardData = useMemo(() => generateTodayLeaderboard(), []);

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Header with back button */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a3548] bg-[#0d1117] flex-shrink-0">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-[#2a3548] rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h1 className="text-white font-bold text-lg">Today's Leaderboard</h1>
        </div>
      </div>

      {/* Timer Banner */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-yellow-500/20 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-yellow-400 text-sm font-medium">Resets in:</span>
          <span className="text-white font-mono font-bold">{getTimeUntilReset()}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {leaderboardData.map((trader) => (
          <div
            key={trader.rank}
            className={`flex items-center justify-between p-2.5 rounded-lg border ${getRankBg(trader.rank)}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center">
                {getRankIcon(trader.rank)}
              </div>
              <div>
                <div className="text-white font-medium text-sm">{trader.name}</div>
                <div className="text-gray-500 text-xs">{trader.trades} trades • {trader.winRate}%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold text-sm">+${trader.profit.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2a3548] bg-[#1a1f2e] flex-shrink-0">
        <p className="text-gray-500 text-xs text-center">Top traders today • Same for all users</p>
      </div>
    </div>
  );
};

export default LeaderboardPage;
