import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import AccountSwitcher from './AccountSwitcher';
import {
  LayoutDashboard,
  Download,
  Upload,
  History,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
  onKYC: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onDeposit, onWithdraw, onHistory, onKYC }) => {
  const { logout, userData } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openTelegramSupport = () => {
    window.open('https://t.me/nexustradepr', '_blank');
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:flex items-center justify-between px-6 py-4 glass-panel-dark border-b border-border">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-profit to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-lg text-white">Q</span>
            </div>
            <span className="font-bold text-xl text-foreground">QTradeX</span>
          </div>
          <nav className="flex items-center gap-1">
            <button
              onClick={onDeposit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Deposit
            </button>
            <button
              onClick={onWithdraw}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Withdraw
            </button>
            <button
              onClick={onHistory}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={onKYC}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              KYC
              {userData?.kycStatus === 'approved' && (
                <span className="w-2 h-2 bg-profit rounded-full" />
              )}
            </button>
            <button
              onClick={openTelegramSupport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Support
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <AccountSwitcher />
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 glass-panel-dark border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-profit to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">Q</span>
          </div>
          <span className="font-bold text-lg text-foreground">QTradeX</span>
        </div>
        <div className="flex items-center gap-2">
          <AccountSwitcher />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 glass-panel-dark p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg text-foreground">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => { onDeposit(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent rounded-xl transition-colors"
              >
                <Download className="w-5 h-5 text-profit" />
                Deposit
              </button>
              <button
                onClick={() => { onWithdraw(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent rounded-xl transition-colors"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
                Withdraw
              </button>
              <button
                onClick={() => { onHistory(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent rounded-xl transition-colors"
              >
                <History className="w-5 h-5 text-muted-foreground" />
                Trade History
              </button>
              <button
                onClick={() => { onKYC(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent rounded-xl transition-colors"
              >
                <User className="w-5 h-5 text-muted-foreground" />
                KYC Verification
                {userData?.kycStatus === 'approved' && (
                  <span className="ml-auto w-2 h-2 bg-profit rounded-full" />
                )}
              </button>
              <button
                onClick={openTelegramSupport}
                className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-accent rounded-xl transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                Support
              </button>
              <hr className="border-border my-4" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
