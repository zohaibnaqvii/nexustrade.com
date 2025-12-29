import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trade, TradingPair, TRADING_PAIRS, TIMEFRAMES, getLivePrice, calculateTradeResult } from '@/services/trading';
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TradingChart from '@/components/TradingChart';
import MobileTradePanel from '@/components/MobileTradePanel';
import MobileHeader from '@/components/MobileHeader';
import BottomNav from '@/components/BottomNav';

import WithdrawalModal from '@/components/WithdrawalModal';
import KYCModal from '@/components/KYCModal';
import PairSelectorModal from '@/components/PairSelectorModal';
import AuthPage from './Auth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { user, userData, loading, isDemo, updateBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [chartInterval, setChartInterval] = useState('1');
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[3]); // 1m default
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [isTrading, setIsTrading] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  
  // Result popup state
  const [resultPopup, setResultPopup] = useState<{show: boolean; type: 'win' | 'loss'; amount: number} | null>(null);
  
  // Ref to store current price for immediate access (not stale)
  const currentPriceRef = useRef<number>(0);
  
  // Audio refs for sounds
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const lossSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize sounds
  useEffect(() => {
    // Create audio elements with data URLs (simple beeps)
    winSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleVQxYJ3W3LGAbUR7u9rqxY5YNDWk4u/OkFcpUJLl6NShcEEjleLo27J8PyR5yeXu2KtzKCuK4OvftYdHMGau3fDktnw/O3zA6O/Qon1LRoTO8/C1dUI6dMD08tqhZjlRnOHt47p4PDB+yu/x25xmMFqh5e/hrW85Pp/c7em4fj0zgtHx8NaYXS5bmObn6byBPzaC0PDwyZRWLV+h6Ongt31AN4fO8fHRm2IwYqLq7N+6fUE/h87x8c+WXC1iouns37V7PT+G0fLx0pliMGSl6+3dtXpBQYnQ8/HPl18wZaTr7du1fEFAidDz8c+WWy5ipOnr2rZ8Qj+H0PLx0JhdLmWl7OzYtntCQIfQ8/LQmV4vZKXr7Nm2fEI/iNDz8tCYXi9jo+vs2bZ9Qj+I0PLy0ZhfL2Sk7OzZtXxBP4jQ8vHQmF4vZaTr7Nm1fEE/h8/y8dCYXi5lo+vs2bV8QT+I0PLx0JheL2Sj7OzZtXxBP4fP8vHQl14vZKPs7Nm2fEI/h9Dy8dCYXi9ko+vs2bZ8Qj+H0PLx0JhdL2Sj7OzZtnxCP4fQ8vHQmF4vY6Ps7Ni2fEI/h9Dy8dCYXy9jo+zs2LZ8Qj+H0PLx0JhfL2Oj7OzYtnxCP4fQ8vHQmF8vY6Ps7Ni2fEI=');
    lossSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAB4eHt4eHt7dXNxcXBxcXBxcG9tbm5tbm1sa2tqaWloZ2ZlZGRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQT8+PTw7Ojk4NzY1NDMyMTAvLi0sKyopKCcmJSQjIiEgHx4dHBsaGRgXFhUUExIREA8ODQwLCgkIBwYFBAMCAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    
    return () => {
      winSoundRef.current = null;
      lossSoundRef.current = null;
    };
  }, []);
  
  // Play sound function
  const playSound = (type: 'win' | 'loss') => {
    try {
      if (type === 'win' && winSoundRef.current) {
        winSoundRef.current.currentTime = 0;
        winSoundRef.current.volume = 0.5;
        winSoundRef.current.play().catch(() => {});
      } else if (type === 'loss' && lossSoundRef.current) {
        lossSoundRef.current.currentTime = 0;
        lossSoundRef.current.volume = 0.5;
        lossSoundRef.current.play().catch(() => {});
      }
    } catch (e) {}
  };
  
  // Update ref whenever price changes
  const handlePriceUpdate = useCallback((price: number) => {
    currentPriceRef.current = price;
    setCurrentPrice(price);
  }, []);

  // Trade duration comes from selected timeframe (not chart interval)
  const tradeDuration = selectedTimeframe.seconds;
  
  
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [showPairSelector, setShowPairSelector] = useState(false);
  
  // Trade stats for history button
  const [tradeStats, setTradeStats] = useState({ total: 0, wins: 0, losses: 0 });

  // Track processed trade IDs to prevent double processing
  const processedTradesRef = useRef<Set<string>>(new Set());
  
  // Fetch trade stats
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'trades'),
      where('userId', '==', user.uid),
      orderBy('startTime', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trade[];
      
      const completedTrades = tradesData.filter(t => t.result);
      setTradeStats({
        total: completedTrades.length,
        wins: completedTrades.filter(t => t.result === 'win').length,
        losses: completedTrades.filter(t => t.result === 'loss').length
      });
    });

    return () => unsubscribe();
  }, [user]);


  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      
      const updatedTrades: Trade[] = [];
      const expiredTrades: Trade[] = [];
      
      // Separate active from expired
      for (const trade of activeTrades) {
        if (now >= trade.endTime) {
          expiredTrades.push(trade);
        } else {
          updatedTrades.push(trade);
        }
      }
      
      // Process expired trades
      for (const trade of expiredTrades) {
        // Skip if already processed
        if (processedTradesRef.current.has(trade.id)) continue;
        processedTradesRef.current.add(trade.id);
        
        // Get exit price at exact expiry moment
        const exitPrice = currentPriceRef.current || await getLivePrice(trade.pair);
        
        // Calculate result using ORIGINAL entry price (immutable)
        const result = calculateTradeResult(trade.direction, trade.entryPrice, exitPrice);
        const profit = result === 'win' ? trade.amount * (trade.payout / 100) : 0;

        if (result === 'win') {
          await updateBalance(trade.amount + profit);
          playSound('win');
          setResultPopup({ show: true, type: 'win', amount: profit });
          setTimeout(() => setResultPopup(null), 2000);
        } else {
          playSound('loss');
          setResultPopup({ show: true, type: 'loss', amount: trade.amount });
          setTimeout(() => setResultPopup(null), 2000);
        }

        try {
          await updateDoc(doc(db, 'trades', trade.id), {
            exitPrice, 
            result, 
            profit: result === 'win' ? profit : -trade.amount
          });
        } catch (e) {
          console.error('Failed to update trade:', e);
        }
      }
      
      // Only update state if there are changes
      if (expiredTrades.length > 0) {
        setActiveTrades(updatedTrades);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeTrades, updateBalance, toast]);

  const handlePlaceTrade = useCallback(async (direction: 'up' | 'down') => {
    if (!user || !userData) return;
    
    const currentBalance = isDemo ? userData.demoBalance : userData.realBalance;
    
    if (!isDemo && currentBalance <= 0) {
      toast({ title: 'Insufficient balance', description: 'Please deposit funds to trade', variant: 'destructive' });
      return;
    }
    
    if (amount <= 0 || amount > currentBalance) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }

    // INSTANT - Don't wait for anything, capture price immediately
    const entryPrice = currentPriceRef.current || getBasePrice(selectedPair.symbol);
    const entryTimestamp = Date.now();
    const expiryTimestamp = entryTimestamp + tradeDuration * 1000;

    // Create trade object with FROZEN entry price FIRST for instant UI update
    const tempId = `temp_${entryTimestamp}_${Math.random().toString(36).substr(2, 9)}`;
    const newTrade: Trade = {
      id: tempId,
      pair: selectedPair.symbol,
      direction,
      amount,
      entryPrice,
      payout: selectedPair.payout,
      duration: tradeDuration,
      startTime: entryTimestamp,
      endTime: expiryTimestamp,
      isDemo
    };

    // Add to active trades IMMEDIATELY for instant feedback
    setActiveTrades(prev => [...prev, newTrade]);

    // Do async operations in background (non-blocking)
    (async () => {
      try {
        // Deduct balance
        await updateBalance(-amount);

        // Save trade to database
        const tradeRef = await addDoc(collection(db, 'trades'), {
          userId: user.uid,
          pair: selectedPair.symbol,
          direction,
          amount,
          entryPrice,
          payout: selectedPair.payout,
          duration: tradeDuration,
          startTime: entryTimestamp,
          endTime: expiryTimestamp,
          isDemo,
          createdAt: serverTimestamp()
        });

        // Update the trade ID in activeTrades
        setActiveTrades(prev => prev.map(t => 
          t.id === tempId ? { ...t, id: tradeRef.id } : t
        ));
        
      } catch (error) {
        // Rollback on error
        setActiveTrades(prev => prev.filter(t => t.id !== tempId));
        await updateBalance(amount);
        toast({ title: 'Error', description: 'Trade failed', variant: 'destructive' });
      }
    })();
  }, [user, userData, isDemo, selectedPair, tradeDuration, amount, updateBalance, toast]);

  // Helper function for base price
  const getBasePrice = (symbol: string): number => {
    const prices: Record<string, number> = {
      'EUR/USD': 1.0875, 'GBP/USD': 1.2650, 'USD/JPY': 148.50, 'BTC/USD': 43250, 'ETH/USD': 2280,
    };
    return prices[symbol] || 100;
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const balance = isDemo ? (userData?.demoBalance ?? 0) : (userData?.realBalance ?? 0);
  const potentialProfit = amount * (selectedPair.payout / 100);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0d1117]">
      {/* Win/Loss Popup */}
      {resultPopup?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className={`px-6 py-3 rounded-xl shadow-2xl animate-scale-in ${
            resultPopup.type === 'win' 
              ? 'bg-green-500/90 border border-green-400' 
              : 'bg-red-500/90 border border-red-400'
          }`}>
            <div className="text-center">
              <div className="text-white font-bold text-lg">
                {resultPopup.type === 'win' ? '🎉 WIN' : '📉 LOSS'}
              </div>
              <div className="text-white font-bold text-xl">
                {resultPopup.type === 'win' ? '+' : '-'}${resultPopup.amount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <MobileHeader
        balance={balance}
        isDemo={isDemo}
        onDeposit={() => navigate('/deposit')}
      />

      {/* Chart Area */}
      <div className="flex-1 relative min-h-0">
        <TradingChart
          symbol={selectedPair.symbol}
          tvSymbol={selectedPair.tvSymbol}
          onPriceUpdate={handlePriceUpdate}
          activeTrades={activeTrades}
          chartInterval={chartInterval}
          onChartIntervalChange={setChartInterval}
          onViewHistory={() => navigate('/history')}
          tradeStats={tradeStats}
        />
      </div>

      {/* Bottom Trade Panel */}
      <MobileTradePanel
        selectedPair={selectedPair}
        onOpenPairSelector={() => setShowPairSelector(true)}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        amount={amount}
        onAmountChange={setAmount}
        balance={balance}
        potentialProfit={potentialProfit}
        onPlaceTrade={handlePlaceTrade}
        isTrading={isTrading}
        isDemo={isDemo}
        pendingTradesCount={activeTrades.length}
      />

      {/* Bottom Navigation */}
      <BottomNav
        onKYC={() => setShowKYC(true)}
        onDeposit={() => navigate('/deposit')}
      />

      {/* Modals */}
      <WithdrawalModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} />
      <KYCModal isOpen={showKYC} onClose={() => setShowKYC(false)} />
      <PairSelectorModal 
        isOpen={showPairSelector} 
        onClose={() => setShowPairSelector(false)}
        onSelectPair={setSelectedPair}
        selectedPair={selectedPair}
      />
    </div>
  );
};

export default Index;
