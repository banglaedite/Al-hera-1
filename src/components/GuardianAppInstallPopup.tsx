import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone, Download, X, Sparkles, CheckCircle2, Share2, PlusSquare } from "lucide-react";

export function GuardianAppInstallPopup() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed in this session
    const sessionDismissed = sessionStorage.getItem("guardian_pwa_dismissed");
    if (sessionDismissed) {
      return;
    }

    // Show popup immediately after login as requested by user
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionDismissed) {
        setShowPopup(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPopup(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowPopup(false);
      }
      setDeferredPrompt(null);
    } else {
      // Show manual 2-step guide
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem("guardian_pwa_dismissed", "true");
  };

  if (isInstalled || !showPopup) return null;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[400px] z-[99] bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-5 rounded-3xl shadow-2xl border border-emerald-500/40 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center border border-emerald-500/40 shrink-0">
                <Smartphone className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  মাদরাসা অভিভাবক অ্যাপ
                </div>
                <h4 className="font-black text-sm sm:text-base text-white mt-0.5">
                  অ্যাপটি ফোনে ইনস্টল করুন
                </h4>
                <p className="text-slate-300 text-xs font-medium mt-1 leading-relaxed">
                  সন্তানের লাইভ হাজিরা, রেজাল্ট ও নোটিফিকেশন পেতে অ্যাপ হিসেবে ফোনে ডাউনলোড করে নিন।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-colors"
            >
              পরে করবো
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Download className="w-4 h-4" />
              ইনস্টল করুন
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Manual Installation Guide Modal if browser doesn't support 1-click install */}
      <AnimatePresence>
        {showManualGuide && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  অ্যাপ ইনস্টল করার সহজ নিয়ম
                </h3>
                <button
                  type="button"
                  onClick={() => setShowManualGuide(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-3 text-sm font-medium text-slate-600">
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">১</span>
                    <p>সাফারি ব্রাউজারের নিচে <strong>শেয়ার বাটন</strong> (<Share2 className="w-4 h-4 inline text-blue-600" />) চাপুন।</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">২</span>
                    <p>নিচে স্ক্রল করে <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-4 h-4 inline text-slate-700" />) সিলেক্ট করুন।</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">৩</span>
                    <p>উপরে ডানপাশে <strong>"Add"</strong> বাটনে চাপলেই সরাসরি অ্যাপ ইনস্টল হয়ে যাবে!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm font-medium text-slate-600">
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">১</span>
                    <p>ব্রাউজারের উপরে ডানপাশের <strong>তিনটি ডট (⋮)</strong> মেনুতে চাপুন।</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">২</span>
                    <p><strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> বাটনে ক্লিক করুন।</p>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0">৩</span>
                    <p>এখন এটি আপনার ফোনে নিয়মিত মোবাইল অ্যাপের মতো থাকবে!</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowManualGuide(false);
                  handleDismiss();
                }}
                className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-colors"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
