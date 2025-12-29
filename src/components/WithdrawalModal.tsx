import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendTelegramNotification } from '@/services/telegram';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, Clock, Wallet, Smartphone, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WithdrawalMethod = 'crypto' | 'easypaisa' | 'jazzcash';

const MIN_WITHDRAWAL = 10;

const methodConfig: Record<WithdrawalMethod, { 
  name: string; 
  icon: React.ReactNode;
  color: string;
  placeholder: string;
  label: string;
}> = {
  crypto: { 
    name: 'Cryptocurrency', 
    icon: <Wallet className="w-5 h-5" />,
    color: 'from-orange-500 to-amber-600',
    placeholder: 'Enter your USDT (TRC20) wallet address',
    label: 'Wallet Address'
  },
  easypaisa: { 
    name: 'EasyPaisa', 
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-green-500 to-emerald-600',
    placeholder: '03XX-XXXXXXX',
    label: 'EasyPaisa Number'
  },
  jazzcash: { 
    name: 'JazzCash', 
    icon: <Smartphone className="w-5 h-5" />,
    color: 'from-red-500 to-rose-600',
    placeholder: '03XX-XXXXXXX',
    label: 'JazzCash Number'
  },
};

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { user, userData, balance, isDemo } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'pending'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const isValidAmount = numericAmount >= MIN_WITHDRAWAL && numericAmount <= balance;

  const handleClose = () => {
    setStep('amount');
    setAmount('');
    setSelectedMethod(null);
    setAddress('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!user || !userData || !selectedMethod || isSubmitting) return;

    setIsSubmitting(true);
    const transactionId = `WTH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: userData.email,
        type: 'withdrawal',
        amount: numericAmount,
        method: selectedMethod,
        address,
        status: 'pending',
        transactionId,
        createdAt: serverTimestamp()
      });

      await sendTelegramNotification({
        type: 'withdrawal',
        userEmail: userData.email,
        amount: numericAmount,
        method: selectedMethod,
        transactionId
      });

      setStep('pending');
      toast({
        title: 'Withdrawal Requested',
        description: 'Your request is being processed.',
      });
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit withdrawal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Demo account view
  if (isDemo) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
            <button onClick={handleClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">Demo Account</p>
            <p className="text-sm text-muted-foreground mt-2">Switch to real account to withdraw funds.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border/50 rounded-2xl w-full max-w-md overflow-hidden animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-profit/20 to-profit/5 p-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {step !== 'amount' && step !== 'pending' && (
                <button 
                  onClick={() => setStep(step === 'details' ? 'method' : 'amount')}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
              )}
              <h2 className="text-xl font-bold text-foreground">Withdraw Funds</h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {/* Progress Steps */}
          {step !== 'pending' && (
            <div className="flex items-center gap-2 mt-4">
              {['amount', 'method', 'details'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${
                    ['amount', 'method', 'details'].indexOf(step) >= i ? 'bg-profit' : 'bg-muted'
                  }`} />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          {/* Amount Step */}
          {step === 'amount' && (
            <div className="space-y-5">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-profit font-mono">${balance.toFixed(2)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Withdrawal Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-2xl">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-xl pl-12 pr-4 py-4 text-2xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-profit/50 focus:border-profit transition-all"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-muted-foreground">Min: ${MIN_WITHDRAWAL}</span>
                  <button 
                    onClick={() => setAmount(balance.toString())}
                    className="text-profit hover:text-profit/80 font-medium"
                  >
                    Max
                  </button>
                </div>

                {amount && numericAmount < MIN_WITHDRAWAL && (
                  <p className="text-loss text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Minimum withdrawal is ${MIN_WITHDRAWAL}
                  </p>
                )}

                {amount && numericAmount > balance && (
                  <p className="text-loss text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Insufficient balance
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep('method')}
                disabled={!isValidAmount}
                className="w-full bg-profit hover:bg-profit/90 disabled:bg-muted disabled:text-muted-foreground text-profit-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Method Selection Step */}
          {step === 'method' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select withdrawal method:</p>
              
              <div className="space-y-3">
                {(Object.keys(methodConfig) as WithdrawalMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => {
                      setSelectedMethod(method);
                      setStep('details');
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-muted/50 border border-border rounded-xl hover:border-profit/50 hover:bg-muted transition-all group"
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${methodConfig[method].color} flex items-center justify-center text-white`}>
                      {methodConfig[method].icon}
                    </div>
                    <span className="font-semibold text-foreground flex-1 text-left">{methodConfig[method].name}</span>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-profit transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Details Step */}
          {step === 'details' && selectedMethod && (
            <div className="space-y-5">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-xl font-bold text-foreground font-mono">${numericAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${methodConfig[selectedMethod].color} flex items-center justify-center text-white`}>
                      {React.cloneElement(methodConfig[selectedMethod].icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
                    </div>
                    <span className="font-medium text-foreground">{methodConfig[selectedMethod].name}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {methodConfig[selectedMethod].label}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-profit/50 focus:border-profit transition-all"
                  placeholder={methodConfig[selectedMethod].placeholder}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!address.trim() || isSubmitting}
                className="w-full bg-profit hover:bg-profit/90 disabled:bg-muted disabled:text-muted-foreground text-profit-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Withdrawal
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Pending Step */}
          {step === 'pending' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-20 h-20 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Request Submitted</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Your withdrawal of <span className="text-foreground font-semibold">${numericAmount.toFixed(2)}</span> is being processed.
                </p>
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                Processing time: 1-24 hours. You'll be notified once approved.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3.5 bg-muted hover:bg-accent rounded-xl font-semibold text-foreground transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
