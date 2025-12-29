import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ArrowDownCircle, History, TrendingUp, Trophy, BarChart3, HelpCircle, LogOut, User, ChevronRight, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import WithdrawalModal from '@/components/WithdrawalModal';
import KYCModal from '@/components/KYCModal';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, userData } = useAuth();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showKYC, setShowKYC] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { 
      icon: <Wallet className="w-5 h-5 text-green-400" />, 
      label: 'Deposit', 
      description: 'Add funds to your account',
      action: () => navigate('/deposit'),
      color: 'from-green-500/20 to-green-600/10'
    },
    { 
      icon: <ArrowDownCircle className="w-5 h-5 text-orange-400" />, 
      label: 'Withdrawal', 
      description: 'Withdraw your earnings',
      action: () => setShowWithdraw(true),
      color: 'from-orange-500/20 to-orange-600/10'
    },
    { 
      icon: <History className="w-5 h-5 text-blue-400" />, 
      label: 'Transaction History', 
      description: 'View all deposits & withdrawals',
      action: () => navigate('/transactions'),
      color: 'from-blue-500/20 to-blue-600/10'
    },
    { 
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />, 
      label: 'Trade History', 
      description: 'View your trading activity',
      action: () => navigate('/history'),
      color: 'from-purple-500/20 to-purple-600/10'
    },
    { 
      icon: <Trophy className="w-5 h-5 text-yellow-400" />, 
      label: 'Leaderboard', 
      description: 'See top traders',
      action: () => navigate('/leaderboard'),
      color: 'from-yellow-500/20 to-yellow-600/10'
    },
    { 
      icon: <BarChart3 className="w-5 h-5 text-cyan-400" />, 
      label: 'Analytics', 
      description: 'Your trading statistics',
      action: () => navigate('/analytics'),
      color: 'from-cyan-500/20 to-cyan-600/10'
    },
    { 
      icon: <User className="w-5 h-5 text-indigo-400" />, 
      label: 'KYC Verification', 
      description: 'Verify your identity',
      action: () => setShowKYC(true),
      color: 'from-indigo-500/20 to-indigo-600/10'
    },
    { 
      icon: <Download className="w-5 h-5 text-pink-400" />, 
      label: 'Install App', 
      description: 'Add to home screen',
      action: () => navigate('/install'),
      color: 'from-pink-500/20 to-pink-600/10'
    },
    { 
      icon: <HelpCircle className="w-5 h-5 text-gray-400" />, 
      label: 'Support', 
      description: 'Get help on Telegram',
      action: () => window.open('https://t.me/nexustradepr', '_blank'),
      color: 'from-gray-500/20 to-gray-600/10'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col">
      {/* Header with Back Button */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Settings</h1>
          <p className="text-xs text-gray-400">{userData?.email || 'User'}</p>
        </div>
      </header>

      {/* Scrollable Menu Items - Compact for mobile */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className={`w-full flex items-center gap-2 p-2.5 bg-gradient-to-r ${item.color} border border-[#30363d] rounded-lg hover:border-[#484f58] transition-all active:scale-[0.98]`}
          >
            <div className="w-7 h-7 bg-[#21262d] rounded-md flex items-center justify-center flex-shrink-0">
              {React.cloneElement(item.icon, { className: 'w-3.5 h-3.5' })}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-white font-medium text-xs">{item.label}</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          </button>
        ))}

        {/* Logout Button - Always visible */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2.5 bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/30 rounded-lg hover:border-red-500/50 transition-all active:scale-[0.98] mt-2"
        >
          <div className="w-7 h-7 bg-red-500/20 rounded-md flex items-center justify-center flex-shrink-0">
            <LogOut className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-red-400 font-medium text-xs">Logout</div>
          </div>
        </button>
      </div>

      {/* Modals */}
      <WithdrawalModal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} />
      <KYCModal isOpen={showKYC} onClose={() => setShowKYC(false)} />
    </div>
  );
};

export default SettingsPage;
