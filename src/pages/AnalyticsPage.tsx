import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<TradeStats>({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalProfit: 0,
    totalLoss: 0,
    netPnL: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'trades'),
          where('userId', '==', user.uid),
          where('isDemo', '==', false),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        
        let wins = 0;
        let losses = 0;
        let totalProfit = 0;
        let totalLoss = 0;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.result === 'win') {
            wins++;
            totalProfit += data.profit || 0;
          } else if (data.result === 'loss') {
            losses++;
            totalLoss += data.amount || 0;
          }
        });

        const totalTrades = wins + losses;
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const netPnL = totalProfit - totalLoss;

        setStats({ totalTrades, wins, losses, winRate, totalProfit, totalLoss, netPnL });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#2a3548] sticky top-0 bg-[#0d1117] z-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-[#2a3548] rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-white font-bold text-lg">Analytics (Live Account)</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-xs">Total Trades</span>
                </div>
                <span className="text-white text-2xl font-bold">{stats.totalTrades}</span>
              </div>

              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-xs">Win Rate</span>
                </div>
                <span className={`text-2xl font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.winRate.toFixed(1)}%
                </span>
              </div>

              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-xs">Wins</span>
                </div>
                <span className="text-green-400 text-2xl font-bold">{stats.wins}</span>
              </div>

              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2a3548]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-gray-400 text-xs">Losses</span>
                </div>
                <span className="text-red-400 text-2xl font-bold">{stats.losses}</span>
              </div>
            </div>

            {/* P&L Section */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2a3548]">
              <h3 className="text-gray-400 text-sm mb-4">Profit & Loss</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Profit</span>
                  <span className="text-green-400 font-bold">+${stats.totalProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Loss</span>
                  <span className="text-red-400 font-bold">-${stats.totalLoss.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#2a3548] pt-3 flex justify-between items-center">
                  <span className="text-white font-medium">Net P&L</span>
                  <span className={`text-xl font-bold ${stats.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.netPnL >= 0 ? '+' : ''}{stats.netPnL.toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Win Rate Progress */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2a3548]">
              <h3 className="text-gray-400 text-sm mb-3">Win Rate Progress</h3>
              <div className="h-3 bg-[#0d1117] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.winRate}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-gray-500">0%</span>
                <span className={`font-bold ${stats.winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.winRate.toFixed(1)}%
                </span>
                <span className="text-gray-500">100%</span>
              </div>
            </div>

            {stats.totalTrades === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No trades on live account yet</p>
                <p className="text-gray-500 text-sm">Start trading to see your analytics</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
