import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trade } from '@/services/trading';
import { X, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface TradeHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(
      collection(db, 'trades'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      setTrades(tradesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel-dark w-full max-w-lg p-6 animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Trade History</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No trades yet</p>
            </div>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className={`p-4 rounded-xl bg-secondary/50 border-l-4 ${
                  trade.result === 'win' ? 'border-l-profit' : trade.result === 'loss' ? 'border-l-destructive' : 'border-l-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {trade.direction === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-profit" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-medium text-foreground">{trade.pair}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${trade.isDemo ? 'bg-muted text-muted-foreground' : 'bg-profit/20 text-profit'}`}>
                      {trade.isDemo ? 'Demo' : 'Real'}
                    </span>
                  </div>
                  <span className={`font-bold font-mono ${
                    trade.result === 'win' ? 'text-profit' : trade.result === 'loss' ? 'text-destructive' : 'text-muted-foreground'
                  }`}>
                    {trade.result === 'win' ? '+' : trade.result === 'loss' ? '-' : ''}
                    ${trade.result === 'win' ? (trade.profit || 0).toFixed(2) : trade.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Entry: {trade.entryPrice?.toFixed(4) || '-'}</span>
                  <span>Exit: {trade.exitPrice?.toFixed(4) || '-'}</span>
                  <span>{new Date(trade.startTime).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;
