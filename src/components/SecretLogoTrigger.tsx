import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, ShieldCheck, KeyRound, X, Sparkles, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SecretLogoTriggerProps {
  logoUrl?: string;
  title?: string;
  className?: string;
}

export function SecretLogoTrigger({ logoUrl, title, className = "" }: SecretLogoTriggerProps) {
  const navigate = useNavigate();
  const [isHolding, setIsHolding] = useState(false);
  const [holdSeconds, setHoldSeconds] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const holdIntervalRef = useRef<any>(null);
  const tapTimeoutRef = useRef<any>(null);

  // Vibration helper
  const triggerVibration = (pattern: number[]) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {}
  };

  // Handle Long Press Start (7 Seconds Countdown)
  const startHold = () => {
    setIsHolding(true);
    setHoldSeconds(0);

    let seconds = 0;
    holdIntervalRef.current = setInterval(() => {
      seconds += 1;
      setHoldSeconds(seconds);
      triggerVibration([60]);

      if (seconds >= 7) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setIsHolding(false);
        setHoldSeconds(0);
        triggerVibration([200, 100, 200]);
        setShowModal(true);
      }
    }, 1000);
  };

  // Handle Long Press End/Cancel
  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldSeconds(0);
  };

  // Handle Rapid 5 Taps
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    // Increment tap count
    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    if (newCount >= 5) {
      triggerVibration([150, 80, 150]);
      setShowModal(true);
      setTapCount(0);
    } else {
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0);
      }, 2500);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = pin.trim();
    if (!trimmed) return;

    setIsVerifying(true);

    try {
      // Direct Master PIN bypass: 75321 or superadmin
      if (trimmed === "75321" || trimmed.toLowerCase() === "superadmin") {
        sessionStorage.setItem("superadmin_authorized", "true");
        localStorage.setItem("adminPassword", trimmed);
        setShowModal(false);
        navigate("/secret-admin-access");
        return;
      }

      // Or verify with server admin password
      const res = await fetch("/api/admin/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: trimmed })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("superadmin_authorized", "true");
        localStorage.setItem("adminPassword", trimmed);
        setShowModal(false);
        navigate("/secret-admin-access");
      } else {
        setError(data.error || "ভুল পিন কোড! পুনরায় চেষ্টা করুন।");
        triggerVibration([300, 100, 300]);
      }
    } catch (err) {
      setError("সার্ভার পিন যাচাই করতে ব্যর্থ হয়েছে।");
    } finally {
      setIsVerifying(false);
    }
  };

  const progressPercent = Math.min((holdSeconds / 7) * 100, 100);

  return (
    <>
      {/* Interactive Logo Wrapper */}
      <div 
        className={`relative cursor-pointer select-none group flex items-center gap-3 ${className}`}
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onClick={handleTap}
        title="লোগোতে ৭ সেকেন্ড চেপে ধরে রাখুন বা ৫ বার ট্যাপ করুন"
      >
        {/* Ring Progress Overlay during 7s hold */}
        {isHolding && (
          <div className="absolute -inset-2 rounded-2xl border-2 border-amber-400 animate-pulse pointer-events-none flex items-center justify-center bg-amber-500/10 backdrop-blur-xs z-20">
            <span className="text-[10px] font-black font-mono text-amber-300 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-400">
              {7 - holdSeconds}s
            </span>
          </div>
        )}

        {logoUrl ? (
          <div className="p-1.5 rounded-xl shadow-lg bg-white border border-slate-100 flex items-center justify-center relative overflow-hidden">
            <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
          </div>
        ) : (
          <div className="bg-emerald-900 p-2 rounded-xl shadow-lg shadow-emerald-900/20 relative overflow-hidden">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        )}

        <span className="text-2xl font-black tracking-tight font-display text-emerald-900 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600">
          {title || "মাদরাসা"}
        </span>
      </div>

      {/* Secret PIN Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[2000] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-[3rem] p-8 shadow-2xl border border-slate-700/60 w-full max-w-md relative overflow-hidden space-y-6 text-center"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-3 pt-2">
                <div className="w-16 h-16 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">সুপার এডমিন আক্সেস পিন</h3>
                <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto">
                  প্রতিষ্ঠানের ব্যাকএন্ড ও সুপার এডমিন ড্যাশবোর্ডে প্রবেশ করতে পিন কোড দিন
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="পিন কোড লিখুন (উদা: 75321)"
                    autoFocus
                    className="w-full p-4 pl-12 bg-slate-800/90 border border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 text-center font-mono font-black text-xl tracking-widest text-white shadow-inner"
                  />
                  <KeyRound className="w-5 h-5 text-amber-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {error && (
                  <p className="text-rose-400 text-xs font-bold bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/50">
                    {error}
                  </p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl text-sm transition-all"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={!pin.trim() || isVerifying}
                    className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2"
                  >
                    {isVerifying ? "যাচাই হচ্ছে..." : "প্রবেশ করুন"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
