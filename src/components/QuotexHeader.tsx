import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TradingPair } from '@/services/trading';
import { ChevronDown, Wallet, History, User, MessageCircle, LogOut, Menu } from 'lucide-react';

interface QuotexHeaderProps {
  selectedPair: TradingPair;
  pairs: TradingPair[];
  onPairChange: (pair: TradingPair) => void;
  onDeposit: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
  onKYC: () => void;
}

const QuotexHeader: React.FC<QuotexHeaderProps> = ({
  selectedPair,
  pairs,
  onPairChange,
  onDeposit,
  onWithdraw,
  onHistory,
  onKYC
}) => {
  const { isDemo, switchAccount, balance, logout, userData } = useAuth();
  const [showPairs, setShowPairs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="quotex-header justify-between z-50">
      {/* Left - Logo & Pair Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--profit))] to-emerald-600 flex items-center justify-center">
            <span className="font-bold text-sm text-white">Q</span>
          </div>
          <span className="font-bold text-foreground hidden sm:block">QTradeX</span>
        </div>

        {/* Pair Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPairs(!showPairs)}
            className="quotex-pair-btn quotex-pair-btn-active"
          >
            <span className="text-lg">{selectedPair.icon}</span>
            <span className="font-medium text-foreground hidden sm:block">{selectedPair.symbol}</span>
            <span className="text-xs text-[hsl(var(--profit))] font-bold">{selectedPair.payout}%</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showPairs ? 'rotate-180' : ''}`} />
          </button>

          {showPairs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowPairs(false)} />
              <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
                {pairs.map((pair) => (
                  <button
                    key={pair.symbol}
                    onClick={() => {
                      onPairChange(pair);
                      setShowPairs(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors ${
                      pair.symbol === selectedPair.symbol ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="text-xl">{pair.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground text-sm">{pair.symbol}</div>
                      <div className="text-xs text-muted-foreground">{pair.name}</div>
                    </div>
                    <span className="text-[hsl(var(--profit))] font-bold text-sm">{pair.payout}%</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right - Account & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Balance Display */}
        <div className="text-right mr-2">
          <div className={`font-mono font-bold text-sm sm:text-base ${isDemo ? 'text-muted-foreground' : 'text-[hsl(var(--profit))]'}`}>
            ${balance.toFixed(2)}
          </div>
        </div>

        {/* Account Switch */}
        <div className="quotex-account-switch">
          <button
            onClick={() => switchAccount(true)}
            className={`quotex-account-btn ${isDemo ? 'quotex-account-active' : 'quotex-account-inactive'}`}
          >
            Demo
          </button>
          <button
            onClick={() => switchAccount(false)}
            className={`quotex-account-btn ${!isDemo ? 'quotex-account-active' : 'quotex-account-inactive'}`}
          >
            Real
          </button>
        </div>

        {/* Deposit Button */}
        <button
          onClick={onDeposit}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[hsl(var(--profit))] text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Wallet className="w-4 h-4" />
          Deposit
        </button>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-xl shadow-xl z-50 py-2">
                <button
                  onClick={() => { onDeposit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground sm:hidden"
                >
                  <Wallet className="w-4 h-4 text-[hsl(var(--profit))]" />
                  <span className="text-sm">Deposit</span>
                </button>
                <button
                  onClick={() => { onWithdraw(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">Withdraw</span>
                </button>
                <button
                  onClick={() => { onHistory(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground"
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm">History</span>
                </button>
                <button
                  onClick={() => { onKYC(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">KYC</span>
                  {userData?.kycStatus === 'approved' && (
                    <span className="ml-auto w-2 h-2 bg-[hsl(var(--profit))] rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => window.open('https://t.me/nexustradepr', '_blank')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-foreground"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Support</span>
                </button>
                <hr className="my-2 border-border" />
                <button
                  onClick={() => { logout(); setShowMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default QuotexHeader;
