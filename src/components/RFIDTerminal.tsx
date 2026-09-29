import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Search, 
  UserPlus, 
  Clock, 
  Users, 
  UserCheck, 
  Activity, 
  ShieldCheck, 
  Laptop,
  Radio,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Zap,
  PhoneCall,
  Phone
} from "lucide-react";
import { cn } from "../lib/utils";
import { SimulatedIncomingCall } from "./SimulatedIncomingCall";
import { formatBengaliNameForSpeech } from "../utils/pronunciation";

// Web Audio API Synthesized Audio Feedback (No external asset dependency)
const playChime = (type: 'success' | 'checkout' | 'error') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'success') {
      // Pleasant dual chord for check-in
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      osc2.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'checkout') {
      // Amber tone for check-out
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(440.00, ctx.currentTime + 0.2); // A4

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Low double beep for error
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.error("Audio chime error:", e);
  }
};

const speakBengali = (text: string) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const formattedText = formatBengaliNameForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(formattedText);
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.error("Speech error:", e);
  }
};

interface RFIDTerminalProps {
  settings?: any;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function RFIDTerminal({ settings, addToast }: RFIDTerminalProps) {
  const [cardInput, setCardInput] = useState("");
  const [mode, setMode] = useState<'auto' | 'check_in' | 'check_out'>('auto');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceAnnounce, setVoiceAnnounce] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [testCallStudent, setTestCallStudent] = useState<any | null>(null);
  
  // Quick Link & Direct Registration Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'student' | 'teacher'>('teacher');
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [regCardInput, setRegCardInput] = useState("");
  const [unlinkedCard, setUnlinkedCard] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [linking, setLinking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const regInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/device-history");
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPeopleForLinking = async () => {
    try {
      const [sRes, tRes] = await Promise.all([
        fetch("/api/students?limit=500&summary_only=true"),
        fetch("/api/admin/teachers")
      ]);
      if (sRes.ok) setAllStudents(await sRes.json());
      if (tRes.ok) setAllTeachers(await tRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchPeopleForLinking();

    // Auto-focus the input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Global keydown capture for USB RFID Readers (Keyboard Emulation)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If direct registration modal is active, route scanner focus to regInputRef
      if (showRegisterModal) {
        if (
          document.activeElement && 
          document.activeElement.tagName === 'INPUT' && 
          document.activeElement !== regInputRef.current
        ) {
          return;
        }
        if (regInputRef.current && document.activeElement !== regInputRef.current) {
          regInputRef.current.focus();
        }
        return;
      }

      if (unlinkedCard) return;

      // Don't intercept if focusing on a search or modal input
      if (
        document.activeElement && 
        document.activeElement.tagName === 'INPUT' && 
        document.activeElement !== inputRef.current
      ) {
        return;
      }
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [showRegisterModal, unlinkedCard]);

  const handlePunch = async (cardIdToPunch: string) => {
    const trimmed = cardIdToPunch.trim();
    if (!trimmed || processing) return;

    setProcessing(true);
    setCardInput("");

    try {
      const res = await fetch("/api/attendance/rfid-punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: trimmed,
          mode,
          method: "usb_rfid"
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLastScanned({
          ...data.person,
          action: data.action,
          time: data.time,
          timestamp: new Date().toISOString()
        });

        if (soundEnabled) {
          playChime(data.action === 'check_in' ? 'success' : 'checkout');
        }

        if (voiceAnnounce) {
          const actionText = data.action === 'check_in' ? 'প্রবেশ সম্পন্ন' : 'প্রস্থান সম্পন্ন';
          speakBengali(`${data.person.name}, ${actionText}`);
        }

        addToast(
          `${data.person.name} - ${data.action === 'check_in' ? 'প্রবেশ (Check In)' : 'প্রস্থান (Check Out)'} সফল (${data.time})`, 
          "success"
        );
        fetchHistory();
      } else if (res.status === 404 || !data.success) {
        if (soundEnabled) playChime('error');
        if (voiceAnnounce) speakBengali('কার্ডটি নিবন্ধিত নয়');
        setLastScanned({
          error: true,
          card_id: trimmed,
          name: "অনিবন্ধিত / ভুল কার্ড",
          message: data.error || "কার্ডটি কোনো ছাত্র বা শিক্ষকের সাথে লিঙ্ক করা নেই",
          time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true }),
          timestamp: new Date().toISOString()
        });
        addToast(data.error || "কার্ডটি কোনো ছাত্র বা শিক্ষকের সাথে লিঙ্ক করা নেই", "error");
      } else {
        if (soundEnabled) playChime('error');
        setLastScanned({
          error: true,
          card_id: trimmed,
          name: "পাঞ্চ ব্যর্থ",
          message: data.error || "হাজিরা রেকর্ড করতে সমস্যা হয়েছে",
          time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true }),
          timestamp: new Date().toISOString()
        });
        addToast(data.error || "হাজিরা রেকর্ড করতে সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      if (soundEnabled) playChime('error');
      setLastScanned({
        error: true,
        card_id: trimmed,
        name: "কানেকশন এরর",
        message: "সার্ভার কানেকশনে সমস্যা হয়েছে",
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: new Date().toISOString()
      });
      addToast("সার্ভার কানেকশনে সমস্যা হয়েছে", "error");
    } finally {
      setProcessing(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardInput.trim()) {
      handlePunch(cardInput);
    }
  };

  const handleLinkCard = async (type: 'student' | 'teacher', id: string, personName: string, cardCodeOverride?: string) => {
    const cardToLink = (cardCodeOverride || unlinkedCard || "").trim();
    if (!cardToLink) {
      addToast("সঠিক কার্ড নম্বর লিখুন বা কার্ড ছোঁয়ান", "error");
      return;
    }
    if (!id || !id.trim()) {
      addToast("শিক্ষার্থী বা শিক্ষক সিলেক্ট করুন", "error");
      return;
    }
    setLinking(true);
    try {
      const res = await fetch("/api/admin/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          id,
          biometric_id: cardToLink
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`🎉 স্মার্ট কার্ড (${cardToLink}) সফলভাবে ${personName}-এর সাথে লিঙ্ক করা হয়েছে!`, "success");
        if (soundEnabled) playChime('success');
        if (voiceAnnounce) speakBengali(`${personName}, কার্ড সেভ হয়েছে`);
        setUnlinkedCard(null);
        setRegCardInput("");
        setLinkSearch("");
        fetchPeopleForLinking();
        if (unlinkedCard) {
          const savedCard = unlinkedCard;
          setTimeout(() => {
            handlePunch(savedCard);
          }, 300);
        }
      } else {
        addToast(data.error || "লিঙ্ক করতে ব্যর্থ হয়েছে", "error");
        if (soundEnabled) playChime('error');
      }
    } catch (e) {
      addToast("সার্ভার সমস্যা", "error");
      if (soundEnabled) playChime('error');
    } finally {
      setLinking(false);
    }
  };

  const filteredStudents = allStudents.filter(s => 
    (s.name && s.name.toLowerCase().includes(linkSearch.toLowerCase())) ||
    (s.studentId && s.studentId.toLowerCase().includes(linkSearch.toLowerCase())) ||
    (s.roll && s.roll.toString().includes(linkSearch))
  );

  const filteredTeachers = allTeachers.filter(t => 
    t.name && t.name.toLowerCase().includes(linkSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Status Bar */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              ইউএসবি আরএফআইডি / বারকোড লাইভ টার্মিনাল
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
              কার্ড পাঞ্চ লাইভ টার্মিনাল
            </h2>
            <p className="text-slate-400 text-sm font-bold max-w-xl">
              কম্পিউটার বা ফোনে ওটিজি দিয়ে লাগানো যেকোনো USB RFID Reader বা বারকোড স্ক্যানারে কার্ড ছোঁয়ালেই সেকেন্ডের মধ্যে স্বয়ংক্রিয়ভাবে হাজিরা রেকর্ড হবে।
            </p>
          </div>

          {/* Mode Selector & Sound Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-800/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
            <div className="flex bg-slate-900/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('auto')}
                className={cn(
                  "px-3.5 py-2 rounded-lg font-black text-xs transition-all",
                  mode === 'auto' ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                স্বয়ংক্রিয় (Auto)
              </button>
              <button
                type="button"
                onClick={() => setMode('check_in')}
                className={cn(
                  "px-3.5 py-2 rounded-lg font-black text-xs transition-all",
                  mode === 'check_in' ? "bg-emerald-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                শুধু প্রবেশ (In)
              </button>
              <button
                type="button"
                onClick={() => setMode('check_out')}
                className={cn(
                  "px-3.5 py-2 rounded-lg font-black text-xs transition-all",
                  mode === 'check_out' ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                )}
              >
                শুধু প্রস্থান (Out)
              </button>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "সাউন্ড অফ করুন" : "সাউন্ড অন করুন"}
                className={cn(
                  "p-2.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1",
                  soundEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-slate-700 text-slate-400"
                )}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setVoiceAnnounce(!voiceAnnounce)}
                title={voiceAnnounce ? "বাংলা ভয়েস অ্যানাউন্সমেন্ট অন" : "ভয়েস অ্যানাউন্সমেন্ট অফ"}
                className={cn(
                  "p-2.5 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5",
                  voiceAnnounce ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-slate-700 text-slate-400"
                )}
              >
                <Radio className="w-4 h-4" />
                <span className="hidden sm:inline">বাংলা ভয়েস</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  fetchPeopleForLinking();
                  setShowRegisterModal(true);
                }}
                className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-400/20 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>কার্ড রেজিস্ট্রেশন করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Punching Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Card Scanner & Instant Feedback */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card Punch Zone */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700">
                  <CreditCard className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">কার্ড স্ক্যানার ইনপুট</h3>
                  <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    ডিভাইস প্রস্তুত - কার্ড ছোঁয়ান
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                Ready
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={cardInput}
                  onChange={(e) => setCardInput(e.target.value)}
                  placeholder="কার্ড ছোঁয়ালেই এখানে নাম্বার পড়বে..."
                  autoFocus
                  disabled={processing}
                  className="w-full p-5 pl-14 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-2 border-emerald-500/40 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-mono font-black text-lg text-slate-900 transition-all shadow-inner"
                />
                <CreditCard className="w-6 h-6 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                {processing && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-slate-400 font-bold px-1">
                <span>💡 কীবোর্ড বা স্ক্যানার থেকে Enter চাপলে সাথে সাথে পাঞ্চ হবে</span>
                <button
                  type="submit"
                  disabled={!cardInput.trim() || processing}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-black transition-all shadow-md"
                >
                  ম্যানুয়াল পাঞ্চ
                </button>
              </div>
            </form>
          </div>

          {/* Last Scanned Person Display / Red Cross Error Box */}
          <AnimatePresence mode="wait">
            {lastScanned ? (
              lastScanned.error ? (
                <motion.div
                  key={`scanned-error-${lastScanned.timestamp}-${lastScanned.card_id || 'err'}`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-8 rounded-[2.5rem] shadow-2xl border-2 border-rose-500/50 bg-gradient-to-br from-rose-950 via-rose-900 to-slate-950 text-white relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-rose-600/30 border-4 border-rose-500/50 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-900/40">
                        <XCircle className="w-16 h-16 text-rose-400 animate-pulse" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-rose-600 text-white shadow-lg">
                        <XCircle className="w-5 h-5 font-black" />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-200 border border-rose-500/40">
                          ❌ পাঞ্চ ব্যর্থ / অনিবন্ধিত কার্ড
                        </span>
                        <span className="px-2.5 py-1 bg-white/10 rounded-xl text-xs font-bold text-white/80">
                          ভুল পাঞ্চ
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white">কার্ডটি সিস্টেমে পাওয়া যায়নি</h3>

                      <p className="text-sm font-bold text-rose-200">
                        {lastScanned.message || "এই কার্ড আইডি কোনো ছাত্র বা শিক্ষকের সাথে লিঙ্ক করা নেই।"}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-300/80 bg-black/30 px-3 py-1.5 rounded-xl border border-rose-500/20">
                          <span>স্ক্যান করা কার্ড: <span className="font-mono text-white font-black">{lastScanned.card_id}</span></span>
                          <span>•</span>
                          <span>সময়: {lastScanned.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`scanned-success-${lastScanned.timestamp}-${lastScanned.id || lastScanned.biometric_id || 'ok'}`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-8 rounded-[2.5rem] shadow-2xl border-2 text-white relative overflow-hidden",
                    lastScanned.action === 'check_in' 
                      ? "bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 border-emerald-400/40" 
                      : "bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 border-amber-400/40"
                  )}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    <div className="relative">
                      <img
                        src={lastScanned.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lastScanned.name)}&background=ffffff&color=064e3b&bold=true`}
                        alt={lastScanned.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
                      />
                      <div className={cn(
                        "absolute -bottom-2 -right-2 p-2 rounded-2xl shadow-lg",
                        lastScanned.action === 'check_in' ? "bg-emerald-500 text-slate-950" : "bg-amber-400 text-slate-950"
                      )}>
                        {lastScanned.action === 'check_in' ? <ArrowDownRight className="w-5 h-5 font-black" /> : <ArrowUpRight className="w-5 h-5 font-black" />}
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider",
                          lastScanned.action === 'check_in' ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30" : "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                        )}>
                          {lastScanned.action === 'check_in' ? '🟢 প্রবেশ সফল (Check-In)' : '🟠 প্রস্থান সফল (Check-Out)'}
                        </span>
                        <span className="px-2.5 py-1 bg-white/10 rounded-xl text-xs font-bold text-white/80">
                          {lastScanned.type === 'teacher' ? 'শিক্ষক' : 'ছাত্র'}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-white">{lastScanned.name}</h3>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-sm font-bold text-white/80">
                        {lastScanned.class && <span>শ্রেণী: {lastScanned.class}</span>}
                        {lastScanned.roll && <span>রোল: {lastScanned.roll}</span>}
                        {lastScanned.id && <span>আইডি: {lastScanned.id}</span>}
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                          <Clock className="w-4 h-4 text-emerald-300" />
                          <span>সময়: {lastScanned.time}</span>
                          <span>•</span>
                          <span>কার্ড: {lastScanned.biometric_id || lastScanned.card_id}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTestCallStudent({
                            name: lastScanned.name,
                            class: lastScanned.class,
                            roll: lastScanned.roll
                          })}
                          className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                        >
                          <PhoneCall className="w-3.5 h-3.5 fill-slate-950" />
                          অভিভাবককে ভয়েস কল অ্যালার্ট দিন
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            ) : (
              <div className="p-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                  <Activity className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-700">পাঞ্চের অপেক্ষায়...</h4>
                <p className="text-slate-400 text-xs font-bold max-w-sm mx-auto">
                  কার্ড স্ক্যানারে ছোঁয়ান। এখানে ছাত্র বা শিক্ষকের ছবি, নাম ও প্রবেশের সময় সরাসরি দেখতে পাবেন।
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Live Punch Stream / History */}
        <div className="lg:col-span-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">লাইভ হাজিরা হিস্টোরি</h3>
                  <p className="text-xs font-bold text-slate-400">আজকের সাম্প্রতিক কার্ড পাঞ্চ লগ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchHistory}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900"
                title="রিফ্রেশ"
              >
                <RefreshCw className={cn("w-5 h-5", loadingHistory && "animate-spin")} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[480px] space-y-3 custom-scrollbar pr-1">
              {history.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold text-sm">
                  আজকে এখনো কোনো কার্ড পাঞ্চ রেকর্ড পাওয়া যায়নি
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                        item.action === 'check_in' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {item.action === 'check_in' ? 'IN' : 'OUT'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm text-slate-900 truncate">{item.name || item.id}</p>
                        <p className="text-[11px] font-bold text-slate-400">
                          {item.type === 'teacher' ? 'শিক্ষক' : `শ্রেণী: ${item.class || '---'}`} {item.roll ? `| রোল: ${item.roll}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-black inline-block mb-1",
                        item.action === 'check_in' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {item.action === 'check_in' ? 'প্রবেশ' : 'প্রস্থান'}
                      </span>
                      <p className="text-[11px] font-bold text-slate-500">{item.time || '---'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Direct Smart Card Registration Modal (Opened via Registration button at top) */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-xl p-8 overflow-hidden space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">স্মার্ট কার্ড রেজিস্ট্রেশন অপশন</h3>
                    <p className="text-xs font-bold text-slate-400">শ্রেণি, ছাত্র বা ওস্তাদ সিলেক্ট করে নতুন কার্ড কোড সেট করুন</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedPersonId) {
                    addToast("দয়া করে একজন শিক্ষক বা শিক্ষার্থী সিলেক্ট করুন", "error");
                    return;
                  }
                  if (!regCardInput.trim()) {
                    addToast("কার্ড স্ক্যান করুন বা কার্ড নম্বর লিখুন", "error");
                    return;
                  }
                  const personName = selectedType === 'teacher'
                    ? allTeachers.find(t => t.id === selectedPersonId)?.name
                    : allStudents.find(s => s.id === selectedPersonId)?.name;

                  await handleLinkCard(selectedType, selectedPersonId, personName || "ব্যবহারকারী", regCardInput.trim());
                }} 
                className="space-y-4"
              >
                {/* Person Type Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => { setSelectedType('teacher'); setSelectedPersonId(""); }}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-black text-xs transition-all",
                      selectedType === 'teacher' ? "bg-emerald-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    👨‍🏫 শিক্ষক / ওস্তাদ / স্টাফ
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSelectedType('student'); setSelectedPersonId(""); }}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-black text-xs transition-all",
                      selectedType === 'student' ? "bg-emerald-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    🎓 শিক্ষার্থী (শ্রেণি ভিত্তিক)
                  </button>
                </div>

                {/* If Student, Class Filter */}
                {selectedType === 'student' && (
                  <div>
                    <label className="text-xs font-black uppercase text-slate-400 block mb-1">শ্রেণি নির্বাচন করুন</label>
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => { setSelectedClassFilter(e.target.value); setSelectedPersonId(""); }}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm text-slate-900"
                    >
                      <option value="all">সকল শ্রেণি</option>
                      {Array.from(new Set(allStudents.map(s => s.class).filter(Boolean))).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Person Dropdown */}
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">
                    {selectedType === 'teacher' ? 'শিক্ষক / ওস্তাদের নাম' : 'শিক্ষার্থীর নাম'}
                  </label>
                  <select
                    value={selectedPersonId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedPersonId(id);
                      setRegCardInput(""); // Always clear input on person selection so NO prefix numbers exist!
                      setTimeout(() => {
                        regInputRef.current?.focus();
                      }, 100);
                    }}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm text-slate-900"
                  >
                    <option value="">-- নাম বেছে নিন --</option>
                    {selectedType === 'teacher' ? (
                      allTeachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.qualification || 'শিক্ষক'}) {t.biometric_id ? `[বর্তমান কার্ড: ${t.biometric_id}]` : ''}
                        </option>
                      ))
                    ) : (
                      allStudents
                        .filter(s => selectedClassFilter === 'all' || s.class === selectedClassFilter)
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} - শ্রেণি: {s.class || '---'} (রোল: {s.roll || '---'}) {s.biometric_id ? `[বর্তমান কার্ড: ${s.biometric_id}]` : ''}
                          </option>
                        ))
                    )}
                  </select>
                </div>

                {/* Card Punch Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black uppercase text-emerald-700 block">
                      কার্ড রিডারে ছোঁয়ান বা নম্বর লিখুন
                    </label>
                    {regCardInput && (
                      <button
                        type="button"
                        onClick={() => setRegCardInput("")}
                        className="text-[11px] font-black text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md"
                      >
                        ✕ ক্লিয়ার করুন
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      ref={regInputRef}
                      type="text"
                      value={regCardInput}
                      onChange={(e) => setRegCardInput(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="কার্ড ছোঁয়ালেই এখানে খালি জায়গায় কার্ডের নম্বর বসবে..."
                      autoFocus
                      className="w-full p-4 pl-12 pr-20 bg-emerald-50/50 border-2 border-emerald-500/40 rounded-2xl outline-none font-mono font-black text-lg text-slate-900 focus:ring-4 focus:ring-emerald-500/20"
                    />
                    <CreditCard className="w-5 h-5 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedPersonId || !regCardInput.trim() || linking}
                  className="w-full py-4 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {linking ? "সেভ হচ্ছে..." : "স্মার্ট কার্ড সেভ ও রেজিস্ট্রেশন করুন"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Call Modal for RFID Terminal */}
      <AnimatePresence>
        {testCallStudent && (
          <SimulatedIncomingCall
            student={testCallStudent}
            settings={settings}
            onDecline={() => setTestCallStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
