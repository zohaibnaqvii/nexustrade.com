import React, { useEffect, useState } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TradeRecord {
  id: string;
  pair: string;
  direction: 'up' | 'down';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  payout: number;
  result?: 'win' | 'loss';
  profit?: number;
  createdAt: Date;
  isDemo: boolean;
}

const TradeHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDemo } = useAuth();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'demo' | 'live'>('all');

  useEffect(() => {
    const fetchTrades = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Try with ordering first
        let q = query(
          collection(db, 'trades'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        let snapshot = await getDocs(q);
        
        // If empty, try without ordering (in case index is missing)
        if (snapshot.empty) {
          console.log('Trying without orderBy...');
          q = query(
            collection(db, 'trades'),
            where('userId', '==', user.uid)
          );
          snapshot = await getDocs(q);
        }

        const tradeList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || data.startTime ? new Date(data.startTime) : new Date(),
          };
        }) as TradeRecord[];

        // Sort manually if needed
        tradeList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log('Trades fetched:', tradeList.length);
        setTrades(tradeList);
      } catch (error: any) {
        console.error('Error fetching trades:', error);
        // If index error, try without orderBy
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          try {
            const q = query(
              collection(db, 'trades'),
              where('userId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const tradeList = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || data.startTime ? new Date(data.startTime) : new Date(),
              };
            }) as TradeRecord[];
            tradeList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            setTrades(tradeList);
          } catch (e) {
            console.error('Fallback query also failed:', e);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, [user]);

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'demo') return trade.isDemo;
    if (filter === 'live') return !trade.isDemo;
    return true;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#2a3548] sticky top-0 bg-[#0d1117] z-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-[#2a3548] rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-white font-bold text-lg">Trade History</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#2a3548]">
        <button 
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 font-medium text-sm ${filter === 'all' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('demo')}
          className={`flex-1 py-3 font-medium text-sm ${filter === 'demo' ? 'text-orange-400 border-b-2 border-orange-400' : 'text-gray-400'}`}
        >
          Demo
        </button>
        <button 
          onClick={() => setFilter('live')}
          className={`flex-1 py-3 font-medium text-sm ${filter === 'live' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400'}`}
        >
          Live
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTrades.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No trades yet</p>
            <p className="text-gray-500 text-sm">Your trading history will appear here</p>
          </div>
        ) : (
          filteredTrades.map((trade) => (
            <div
              key={trade.id}
              className="bg-[#1a1f2e] rounded-xl border border-[#2a3548] p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    trade.direction === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {trade.direction === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{trade.pair}</div>
                    <div className="text-gray-500 text-xs">{formatDate(trade.createdAt)}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  trade.isDemo ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {trade.isDemo ? 'DEMO' : 'LIVE'}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-gray-400 text-sm">
                  <span className="capitalize">{trade.direction}</span> • ${trade.amount}
                </div>
                {trade.result ? (
                  <div className={`font-bold ${trade.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.result === 'win' ? '+' : '-'}${Math.abs(trade.profit || trade.amount).toFixed(2)}
                  </div>
                ) : (
                  <div className="text-yellow-400 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Active
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeHistoryPage;
