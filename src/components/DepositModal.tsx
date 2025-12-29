import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CRYPTO_ADDRESSES } from '@/services/trading';
import { sendTelegramNotification } from '@/services/telegram';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Copy, Check, X, Clock, Bitcoin, Wallet, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Network = 'BTC' | 'ERC20' | 'BEP20' | 'TRC20';

const networkLabels: Record<Network, { name: string; fullName: string; icon: React.ReactNode; color: string }> = {
  BTC: { name: 'Bitcoin', fullName: 'Bitcoin Network', icon: <Bitcoin className="w-6 h-6" />, color: 'text-orange-500' },
  ERC20: { name: 'Ethereum', fullName: 'Ethereum (ERC20)', icon: <Wallet className="w-6 h-6" />, color: 'text-blue-400' },
  BEP20: { name: 'BSC', fullName: 'BNB Smart Chain (BEP20)', icon: <Wallet className="w-6 h-6" />, color: 'text-yellow-500' },
  TRC20: { name: 'Tron', fullName: 'Tron Network (TRC20)', icon: <Wallet className="w-6 h-6" />, color: 'text-red-400' },
};

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'amount' | 'network' | 'payment' | 'pending'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900);

  useEffect(() => {
    if (step === 'payment') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentMade = async () => {
    if (!user || !userData || !selectedNetwork) return;

    const transactionId = `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: userData.email,
        type: 'deposit',
        amount: parseFloat(amount),
        method: selectedNetwork,
        status: 'pending',
        transactionId,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt // Auto-reject after 1 hour
      });

      await sendTelegramNotification({
        type: 'deposit',
        userEmail: userData.email,
        amount: parseFloat(amount),
        method: selectedNetwork,
        transactionId
      });

      // Auto-reject after 1 hour if still pending (balance NOT added until approved)
      setTimeout(async () => {
        try {
          const { getDoc, doc: getDocRef } = await import('firebase/firestore');
          const docSnap = await getDoc(getDocRef(db, 'transactions', docRef.id));
          if (docSnap.exists() && docSnap.data().status === 'pending') {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(getDocRef(db, 'transactions', docRef.id), { 
              status: 'rejected',
              rejectedAt: new Date(),
              rejectionReason: 'Auto-rejected: Not approved within 1 hour'
            });
          }
        } catch (e) {
          console.error('Auto-reject failed:', e);
        }
      }, 60 * 60 * 1000); // 1 hour

      setStep('pending');
      
      // Auto close after 5 seconds and go back
      setTimeout(() => {
        onClose();
        setStep('amount');
        setAmount('');
        setSelectedNetwork(null);
      }, 5000);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit deposit.',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-[#1a2332] to-[#0d1117] border border-[#2a3a4a] rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">NEXUS TRADES</h2>
              <p className="text-white/80 text-xs">Secure Deposit</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-white font-bold text-xl mb-2">Enter Deposit Amount</h3>
                <p className="text-gray-400 text-sm">Minimum deposit: $10 USD</p>
              </div>

              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-bold text-2xl">$</div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#0d1117] border-2 border-[#2a3a4a] focus:border-green-500 rounded-xl pl-12 pr-4 py-4 text-3xl font-bold text-white text-center outline-none transition-colors"
                  placeholder="0.00"
                  min="10"
                />
              </div>

              {/* Quick Amounts */}
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className={`py-2 rounded-lg font-medium transition-colors ${
                      amount === val.toString()
                        ? 'bg-green-500 text-white'
                        : 'bg-[#2a3548] text-gray-300 hover:bg-[#3a4a5e]'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('network')}
                disabled={!amount || parseFloat(amount) < 10}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'network' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-white font-bold text-xl mb-2">Select Network</h3>
                <p className="text-gray-400 text-sm">Choose your preferred cryptocurrency</p>
              </div>

              <div className="space-y-3">
                {(Object.keys(networkLabels) as Network[]).map((network) => (
                  <button
                    key={network}
                    onClick={() => {
                      setSelectedNetwork(network);
                      setStep('payment');
                      setTimeRemaining(900);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-[#1a2332] border border-[#2a3a4a] rounded-xl hover:border-green-500/50 hover:bg-[#2a3548] transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-full bg-[#2a3548] flex items-center justify-center ${networkLabels[network].color}`}>
                      {networkLabels[network].icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-bold">{networkLabels[network].name}</div>
                      <div className="text-gray-500 text-sm">{networkLabels[network].fullName}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('amount')}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {step === 'payment' && selectedNetwork && (
            <div className="space-y-5">
              {/* Amount Display */}
              <div className="text-center bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-1">Send exactly</p>
                <p className="text-4xl font-bold text-white">${amount}</p>
                <p className="text-green-400 text-sm mt-1">via {networkLabels[selectedNetwork].fullName}</p>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                <span className="text-gray-400 text-sm">remaining</span>
              </div>

              {/* Address */}
              <div className="bg-[#0d1117] border border-[#2a3a4a] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Deposit Address</span>
                  <div className={`flex items-center gap-1 ${networkLabels[selectedNetwork].color}`}>
                    {networkLabels[selectedNetwork].icon}
                    <span className="text-sm font-medium">{selectedNetwork}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-green-400 break-all bg-[#1a2332] p-3 rounded-lg">
                    {CRYPTO_ADDRESSES[selectedNetwork]}
                  </code>
                  <button
                    onClick={() => handleCopy(CRYPTO_ADDRESSES[selectedNetwork])}
                    className="p-3 bg-[#2a3548] hover:bg-[#3a4a5e] rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-500/80 text-xs">
                  Send only {selectedNetwork} to this address. Sending any other cryptocurrency may result in permanent loss.
                </p>
              </div>

              <button
                onClick={handlePaymentMade}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30"
              >
                I Have Made Payment
              </button>

              <button
                onClick={() => setStep('network')}
                className="w-full py-3 text-gray-400 hover:text-white transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {step === 'pending' && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center animate-pulse">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Payment Received!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your deposit of <span className="text-green-400 font-bold">${amount}</span> will arrive in approximately 5 minutes.
                </p>
              </div>
              <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-500 font-medium">Processing...</span>
                </div>
              </div>
              <p className="text-gray-500 text-xs">Redirecting back automatically...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Shield className="w-3 h-3" />
            <span>256-bit SSL Encrypted • Secure Transaction</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
