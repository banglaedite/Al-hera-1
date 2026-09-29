import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, Download, X, Sparkles, CheckCircle2 } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt banner unless dismissed recently
      const dismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = () => {
    // Directly trigger APK file download as requested by user
    const link = document.createElement('a');
    link.href = '/al_hera_madrasah.apk';
    link.download = 'al_hera_madrasah.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      });
      setDeferredPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_prompt_dismissed", "true");
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-[90] bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 rounded-[2rem] shadow-2xl border border-emerald-500/40 backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center border border-emerald-500/30 shrink-0 overflow-hidden shadow-md">
              <img src="https://i.postimg.cc/jSZykhDB/IMG-20260330-WA0001.png" alt="মাদরাসা লোগো" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                অফিসিয়াল মোবাইল অ্যাপ
              </div>
              <h4 className="font-black text-sm text-white">অ্যাপ হিসেবে ইনস্টল করুন</h4>
              <p className="text-slate-300 text-xs font-bold mt-0.5">
                ক্রোম বা ব্রাউজার ছাড়াই সরাসরি ফোনে অ্যাপের মতো ডাউনলোড করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-black rounded-xl transition-colors"
          >
            পরে করবো
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md shadow-amber-400/20 flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            ইনস্টল করুন
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
