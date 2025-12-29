import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, ChevronDown, Plane, X, Star } from 'lucide-react';

interface MobileHeaderProps {
  balance: number;
  isDemo: boolean;
  onDeposit: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  balance,
  isDemo,
  onDeposit
}) => {
  const { switchAccount, userData, user } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Generate trader ID from user UID
  const traderId = user?.uid ? `NT${user.uid.slice(0, 8).toUpperCase()}` : 'NT00000000';

  return (
    <>
      <header className="h-14 bg-[#1a1f2e] flex items-center justify-between px-3 shrink-0">
        {/* Left - Account Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full ${
              isDemo 
                ? 'bg-[#2a3548] border border-[#3a4a5e]' 
                : 'bg-[#1e3a2f] border border-[#2e5a4f]'
            }`}
          >
            {isDemo ? (
              <Plane className="w-4 h-4 text-orange-400" />
            ) : (
              <Star className="w-4 h-4 text-green-400 fill-green-400" />
            )}
            <span className={`text-xs font-bold ${isDemo ? 'text-orange-400' : 'text-green-400'}`}>
              {isDemo ? 'DEMO' : 'LIVE'}
            </span>
            <span className="text-white font-bold text-sm">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Full Account Modal - Quotex Style */}
          {showAccountMenu && (
            <>
              <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setShowAccountMenu(false)} />
              <div className="fixed inset-x-4 top-20 bg-[#1a1f2e] border border-[#2a3548] rounded-2xl shadow-2xl z-50 overflow-hidden max-w-sm mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a3548]">
                  <span className="text-white font-bold text-lg">Account</span>
                  <button onClick={() => setShowAccountMenu(false)} className="p-1">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-[#2a3548]">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Email</span>
                      <span className="text-white text-sm font-medium">{userData?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Trader ID</span>
                      <span className="text-white text-sm font-mono">{traderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Currency</span>
                      <span className="text-white text-sm font-bold">USD</span>
                    </div>
                  </div>
                </div>

                {/* Account Type Selection */}
                <div className="p-4 space-y-3">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Select Account</span>
                  
                  {/* Demo Account */}
                  <button
                    onClick={() => { switchAccount(true); setShowAccountMenu(false); }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      isDemo 
                        ? 'bg-orange-500/10 border-2 border-orange-500' 
                        : 'bg-[#252d3d] border border-[#3a4a5e] hover:border-orange-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-orange-400 font-bold">DEMO</div>
                        <div className="text-gray-400 text-xs">Practice Account</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        ${(userData?.demoBalance ?? 10000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {isDemo && <span className="text-orange-400 text-xs">Active</span>}
                    </div>
                  </button>

                  {/* Live Account */}
                  <button
                    onClick={() => { switchAccount(false); setShowAccountMenu(false); }}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      !isDemo 
                        ? 'bg-green-500/10 border-2 border-green-500' 
                        : 'bg-[#252d3d] border border-[#3a4a5e] hover:border-green-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Star className="w-5 h-5 text-green-400 fill-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-green-400 font-bold">LIVE</div>
                        <div className="text-gray-400 text-xs">Real Account</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">
                        ${(userData?.realBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      {!isDemo && <span className="text-green-400 text-xs">Active</span>}
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right - Notifications & Deposit */}
        <div className="flex items-center gap-3">
          <button className="relative p-2">
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={onDeposit}
            className="px-5 py-2 bg-green-500 text-white text-sm font-bold rounded-full"
          >
            Deposit
          </button>
        </div>
      </header>
    </>
  );
};

export default MobileHeader;
