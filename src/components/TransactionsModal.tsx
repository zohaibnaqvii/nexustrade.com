import React, { useEffect, useState } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  method: string;
  createdAt: Date;
}

const TransactionsModal: React.FC<TransactionsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const txns = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Transaction[];

        setTransactions(txns);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#1a1f2e] rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a3548]">
          <h2 className="text-white font-bold text-lg">Transactions</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#2a3548] rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
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
                className="flex items-center justify-between p-4 bg-[#252d3d] rounded-xl border border-[#3a4a5e]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.type === 'deposit' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    {txn.type === 'deposit' ? (
                      <ArrowDownRight className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium capitalize">{txn.type}</div>
                    <div className="text-gray-500 text-xs">{txn.method} • {formatDate(txn.createdAt)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${txn.type === 'deposit' ? 'text-green-400' : 'text-orange-400'}`}>
                    {txn.type === 'deposit' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(txn.status)}`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsModal;
