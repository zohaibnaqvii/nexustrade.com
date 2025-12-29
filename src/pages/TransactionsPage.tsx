import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Clock, X, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: string;
  createdAt: Date;
  address?: string;
  transactionId?: string;
}

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Try with ordering first
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      let snapshot = await getDocs(q);
      
      // If empty or error, try without ordering
      if (snapshot.empty) {
        console.log('Trying transactions without orderBy...');
        q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid)
        );
        snapshot = await getDocs(q);
      }

      const txns = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      }) as Transaction[];
      
      // Sort manually
      txns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('Transactions fetched:', txns.length);
      setTransactions(txns);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      // If index error, try without orderBy
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        try {
          const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid)
          );
          const snapshot = await getDocs(q);
          const txns = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(),
            };
          }) as Transaction[];
          txns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setTransactions(txns);
        } catch (e) {
          console.error('Fallback query also failed:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleCopyId = async (txnId: string) => {
    await navigator.clipboard.writeText(txnId);
    setCopiedId(txnId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelWithdrawal = async (txnId: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', txnId));
      toast({ title: 'Withdrawal Cancelled', description: 'Your withdrawal request has been cancelled.' });
      fetchTransactions();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel withdrawal.', variant: 'destructive' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'rejected':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#2a3548] sticky top-0 bg-[#0d1117] z-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-[#2a3548] rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <h1 className="text-white font-bold text-lg">Transactions</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto pb-20">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No transactions yet</p>
            <p className="text-gray-500 text-sm">Your deposits and withdrawals will appear here</p>
          </div>
        ) : (
          transactions.map((txn) => (
            <div
              key={txn.id}
              className="bg-[#1a1f2e] rounded-xl border border-[#2a3548] overflow-hidden"
            >
              {/* Main Row */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    txn.type === 'deposit' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    {txn.type === 'deposit' ? (
                      <ArrowDownRight className="w-6 h-6 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-bold capitalize text-lg">{txn.type}</div>
                    <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${getStatusColor(txn.status)}`}>
                      {getStatusIcon(txn.status)}
                      <span className="font-medium">{getStatusText(txn.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${txn.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                    {txn.type === 'deposit' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </div>
                  <div className="text-gray-500 text-xs">USD</div>
                </div>
              </div>

              {/* Details Section */}
              <div className="px-4 pb-4 space-y-2">
                <div className="bg-[#0d1117] rounded-lg p-3 space-y-2">
                  {/* Transaction ID */}
                  {txn.transactionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-xs">Transaction ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                          {txn.transactionId.slice(0, 20)}...
                        </code>
                        <button 
                          onClick={() => handleCopyId(txn.transactionId!)}
                          className="p-1 hover:bg-[#2a3548] rounded transition-colors"
                        >
                          {copiedId === txn.transactionId ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Date</span>
                    <span className="text-white text-xs font-medium">{formatDate(txn.createdAt)}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Time</span>
                    <span className="text-white text-xs font-medium">{formatTime(txn.createdAt)}</span>
                  </div>

                  {/* Method */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Method</span>
                    <span className="text-white text-xs font-medium bg-[#2a3548] px-2 py-0.5 rounded">{txn.method}</span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Amount</span>
                    <span className={`text-xs font-bold ${txn.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                      ${txn.amount.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* Cancel button for pending withdrawals */}
                {txn.type === 'withdrawal' && txn.status === 'pending' && (
                  <button
                    onClick={() => handleCancelWithdrawal(txn.id)}
                    className="w-full py-2.5 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 border border-red-500/30"
                  >
                    <X className="w-4 h-4" />
                    Cancel Withdrawal
                  </button>
                )}

                {/* Status message for rejected */}
                {txn.status === 'rejected' && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                    <p className="text-red-400 text-xs">
                      This transaction was rejected. Contact support for more info.
                    </p>
                  </div>
                )}

                {/* Status message for pending */}
                {txn.status === 'pending' && txn.type === 'deposit' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <p className="text-yellow-400 text-xs">
                      ⏳ Awaiting admin approval. Balance will be added once approved.
                    </p>
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

export default TransactionsPage;