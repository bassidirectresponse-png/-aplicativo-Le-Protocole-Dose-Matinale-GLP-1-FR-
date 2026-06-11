import React, { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user dismissed it before
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    
    const ready = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', ready);

    return () => {
      window.removeEventListener('beforeinstallprompt', ready);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-40 animate-slide-up">
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-4 shadow-xl text-white flex flex-col gap-3">
        <div>
          <h4 className="font-bold text-lg mb-1">Installer Protocole Pink Salt Burn</h4>
          <p className="text-sm opacity-90">Add to your home screen for easy daily tracking and recipes.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDismiss}
            className="flex-1 py-2 px-4 rounded-xl font-bold bg-white/20 hover:bg-white/30 transition-colors"
          >
            Maybe Later
          </button>
          <button 
            onClick={handleInstallClick}
            className="flex-1 py-2 px-4 rounded-xl font-bold bg-white text-pink-600 hover:bg-pink-50 transition-colors shadow-sm"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
};
