import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Smartphone, Check, Share, Plus, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage: React.FC = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1a2332] flex flex-col">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-[#21262d] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-bold text-white">Install App</h1>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* App Preview Card */}
        <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <span className="text-3xl font-bold text-white">NT</span>
          </div>
          <h2 className="text-white font-bold text-xl mb-1">Nexus Trades</h2>
          <p className="text-gray-400 text-sm">Binary Options Trading</p>
        </div>

        {isInstalled ? (
          /* Already Installed */
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-green-400 font-bold text-lg mb-2">Already Installed!</h3>
            <p className="text-gray-400 text-sm">
              Nexus Trades is already installed on your device. Open it from your home screen.
            </p>
          </div>
        ) : deferredPrompt ? (
          /* Android/Desktop Install Button */
          <div className="space-y-4">
            <button
              onClick={handleInstall}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-3"
            >
              <Download className="w-6 h-6" />
              Install Now
            </button>
            <p className="text-gray-400 text-sm text-center">
              Install the app for faster access and offline support
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Instructions */
          <div className="space-y-4">
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                Install on iPhone/iPad
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Tap Share button</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      Tap <Share className="w-4 h-4" /> at the bottom of Safari
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Add to Home Screen</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      Scroll down and tap <Plus className="w-4 h-4" /> "Add to Home Screen"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Tap Add</p>
                    <p className="text-gray-400 text-sm mt-1">Confirm by tapping "Add" in the top right</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isAndroid ? (
          /* Android Manual Instructions */
          <div className="space-y-4">
            <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-400" />
                Install on Android
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Tap Menu</p>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      Tap <MoreVertical className="w-4 h-4" /> in the browser
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Install App or Add to Home Screen</p>
                    <p className="text-gray-400 text-sm mt-1">Look for "Install App" or "Add to Home Screen"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Confirm Install</p>
                    <p className="text-gray-400 text-sm mt-1">Tap "Install" to confirm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Instructions */
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4">
            <h3 className="text-white font-bold mb-4">Install on Desktop</h3>
            <p className="text-gray-400 text-sm">
              Look for the install icon in your browser's address bar, or use the browser menu to install this app.
            </p>
          </div>
        )}

        {/* Features */}
        <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4">
          <h3 className="text-white font-bold mb-4">App Features</h3>
          <div className="space-y-3">
            {[
              'Works offline - trade anytime',
              'Faster loading than browser',
              'Full screen experience',
              'Push notifications for trades',
              'Home screen access'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPage;
