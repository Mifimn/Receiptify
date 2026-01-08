import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 animate-in fade-in slide-in-from-top duration-500">
      <div className="max-w-md mx-auto bg-zinc-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
             <img src="/favicon.png" alt="Logo" className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest">MifimnPay</p>
            <p className="text-[10px] text-zinc-400">Install for faster access</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="px-3 py-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-white transition-colors"
          >
            Later
          </button>
          <button 
            onClick={handleInstallClick}
            className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase rounded-lg hover:bg-zinc-200 transition-all active:scale-95"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
