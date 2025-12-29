import React from 'react';
import { TrendingUp, Shield, Zap, Users, ChevronRight } from 'lucide-react';

interface WelcomePageProps {
  onContinue: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#0d1520] to-[#0a0e17] flex flex-col relative overflow-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-60 h-60 bg-green-500/8 rounded-full blur-[80px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-[80px]" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-4 px-4 relative z-10">
        {/* Logo */}
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-xl rotate-6 opacity-40" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-xl shadow-green-500/30">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">NEXUS TRADES</h1>
        <p className="text-gray-400 text-xs mb-6 text-center">
          Professional Binary Options Trading
        </p>

        {/* Features Grid - Compact */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs mb-4">
          <div className="bg-[#1a2332]/60 backdrop-blur border border-[#2a3a4a]/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">95%</div>
                <div className="text-[10px] text-gray-500">Max Payout</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a2332]/60 backdrop-blur border border-[#2a3a4a]/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Secure</div>
                <div className="text-[10px] text-gray-500">Encrypted</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a2332]/60 backdrop-blur border border-[#2a3a4a]/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">5s</div>
                <div className="text-[10px] text-gray-500">Min Trade</div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#1a2332]/60 backdrop-blur border border-[#2a3a4a]/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">24/7</div>
                <div className="text-[10px] text-gray-500">OTC Trading</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Balance Display */}
        <div className="bg-[#1a2332]/80 backdrop-blur border border-green-500/30 rounded-xl p-3 w-full max-w-xs mb-4">
          <div className="text-center">
            <p className="text-gray-400 text-[10px] mb-0.5">FREE DEMO ACCOUNT</p>
            <p className="text-2xl font-bold text-green-400">$10,000</p>
            <p className="text-gray-500 text-[10px]">No deposit required</p>
          </div>
        </div>
      </div>

      {/* Bottom Buttons - Fixed */}
      <div className="sticky bottom-0 p-4 space-y-2 relative z-10 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17] to-transparent pt-6">
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl font-bold text-white text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 active:scale-[0.98]"
        >
          Try Demo Account
          <ChevronRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all flex items-center justify-center gap-2 bg-[#1a2332] border border-[#2a3a4a] hover:border-green-500/50 active:scale-[0.98]"
        >
          Create Account
        </button>
        
        <p className="text-center text-gray-600 text-xs pt-1 pb-2">
          Already have an account?{' '}
          <button onClick={onContinue} className="text-green-400 font-medium">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
