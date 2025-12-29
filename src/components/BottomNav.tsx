import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, HelpCircle, User, Trophy, MoreHorizontal } from 'lucide-react';

interface BottomNavProps {
  onKYC: () => void;
  onDeposit: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onKYC }) => {
  const navigate = useNavigate();

  return (
    <nav className="h-14 bg-[#1a1f2e] border-t border-[#2a3548] flex items-center justify-around shrink-0">
      <button 
        onClick={() => navigate('/analytics')}
        className="flex flex-col items-center gap-1 px-4 py-2"
      >
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </button>
      <button 
        onClick={() => window.open('https://t.me/nexustradepr', '_blank')}
        className="flex flex-col items-center gap-1 px-4 py-2"
      >
        <HelpCircle className="w-5 h-5 text-gray-400" />
      </button>
      <button 
        onClick={onKYC}
        className="flex flex-col items-center gap-1 px-4 py-2"
      >
        <User className="w-5 h-5 text-gray-400" />
      </button>
      <button 
        onClick={() => navigate('/leaderboard')}
        className="flex flex-col items-center gap-1 px-4 py-2"
      >
        <Trophy className="w-5 h-5 text-gray-400" />
      </button>
      <button 
        onClick={() => navigate('/settings')}
        className="flex flex-col items-center gap-1 px-4 py-2"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </button>
    </nav>
  );
};

export default BottomNav;
