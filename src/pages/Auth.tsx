import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, TrendingUp, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WelcomePage from './Welcome';

const AuthPage: React.FC = () => {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (error: any) {
      let message = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        message = 'Email already registered. Please login.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account with this email.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password must be 6+ characters.';
      }

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return <WelcomePage onContinue={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0e17] via-[#0d1520] to-[#0a0e17] flex items-center justify-center p-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Back Button */}
        <button
          onClick={() => setShowWelcome(true)}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl rotate-6 opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/40">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">NEXUS TRADES</h1>
          <p className="text-sm text-gray-500">Professional Binary Options Trading</p>
        </div>

        {/* Auth Form */}
        <div className="bg-[#1a2332]/80 backdrop-blur border border-[#2a3a4a] rounded-2xl p-6">
          <div className="flex mb-6 bg-[#0d1117] rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                isLogin ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-gray-500'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                !isLogin ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pl-11 pr-11 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? 'Logging in...' : 'Creating...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 flex justify-center gap-8 text-center">
          <div>
            <div className="text-xl font-bold text-green-500">95%</div>
            <div className="text-xs text-gray-500">Payout</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">5s</div>
            <div className="text-xs text-gray-500">Min Trade</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">$10K</div>
            <div className="text-xs text-gray-500">Demo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
