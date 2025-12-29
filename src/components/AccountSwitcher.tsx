import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const AccountSwitcher: React.FC = () => {
  const { isDemo, switchAccount, balance } = useAuth();

  return (
    <div className="flex items-center gap-3">
      <div className="account-switcher">
        <button
          onClick={() => switchAccount(true)}
          className={`account-btn ${isDemo ? 'account-btn-active' : 'account-btn-inactive'}`}
        >
          Demo
        </button>
        <button
          onClick={() => switchAccount(false)}
          className={`account-btn ${!isDemo ? 'account-btn-active' : 'account-btn-inactive'}`}
        >
          Real
        </button>
      </div>
      <div className="text-right">
        <div className={`font-mono font-bold text-lg ${isDemo ? 'text-muted-foreground' : 'text-profit'}`}>
          ${balance.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">
          {isDemo ? 'Virtual' : 'Available'}
        </div>
      </div>
    </div>
  );
};

export default AccountSwitcher;
