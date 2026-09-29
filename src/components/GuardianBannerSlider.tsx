import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Bell, 
  CreditCard, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Volume2, 
  Megaphone,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { cn } from "../lib/utils";
import { getDhakaDateString, getDhakaTimeBn } from "../utils/dhakaDate";

interface GuardianBannerSliderProps {
  student: any;
  attendance: any[];
  deviceHistory?: any[];
  notices: any[];
  fees?: any[];
  settings?: any;
  onOpenNotifications?: () => void;
}

export function GuardianBannerSlider({
  student,
  attendance = [],
  deviceHistory = [],
  notices = [],
  fees = [],
  settings,
  onOpenNotifications
}: GuardianBannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sweepKey, setSweepKey] = useState(0);

  // Compute Today's Attendance in Asia/Dhaka timezone
  const todayStr = getDhakaDateString();
  const todayAtt = attendance.find(a => a.date === todayStr);
  const todayDevices = (deviceHistory || []).filter(d => d.date === todayStr);
  const latestDevice = todayDevices.length > 0 ? todayDevices[todayDevices.length - 1] : null;

  const lastAction = latestDevice?.action || (todayAtt?.check_in ? 'check_in' : null);
  const isPresent = todayAtt?.status === 'present' || lastAction === 'check_in' || !!todayAtt?.check_in;
  const isCheckout = lastAction === 'check_out';
  const isAbsent = todayAtt?.status === 'absent';
  
  let timeDisplay = latestDevice?.time || todayAtt?.check_in || "";

  // Convert digits to Bangla if needed
  const toBn = (n: any) => {
    if (!n && n !== 0) return "";
    const banglaDigits: Record<string, string> = {
      '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'
    };
    return String(n).replace(/[0-9]/g, m => banglaDigits[m] || m);
  };

  // Build Slides Array
  const slides: any[] = [];

  // Slide 1: Attendance / Latest Punch Slide (First Slide as requested)
  slides.push({
    id: "attendance",
    badge: isCheckout ? "আজকের প্রস্থান স্ট্যাটাস" : "আজকের উপস্থিতি স্ট্যাটাস",
    bgGradient: isCheckout
      ? "from-amber-950 via-orange-950 to-slate-900"
      : isPresent
        ? "from-emerald-900 via-teal-900 to-slate-900"
        : isAbsent
          ? "from-rose-950 via-rose-900 to-slate-900"
          : "from-slate-900 via-slate-800 to-teal-950",
    border: isCheckout ? "border-amber-500/40" : isPresent ? "border-emerald-500/40" : isAbsent ? "border-rose-500/40" : "border-slate-700/50",
    icon: isCheckout ? Clock : isPresent ? CheckCircle2 : isAbsent ? XCircle : Clock,
    iconColor: isCheckout ? "text-amber-400 bg-amber-500/20" : isPresent ? "text-emerald-400 bg-emerald-500/20" : isAbsent ? "text-rose-400 bg-rose-500/20" : "text-amber-400 bg-amber-500/20",
    title: isCheckout
      ? `মাদরাসা থেকে প্রস্থান: ${timeDisplay ? `${toBn(timeDisplay)} মিনিটে` : ""}`
      : isPresent
        ? `আজ উপস্থিত: ${timeDisplay ? `${toBn(timeDisplay)} মিনিটে প্রবেশ` : "ক্লাসে উপস্থিত"}`
        : isAbsent
          ? "আজ অনুপস্থিত"
          : "আজকের উপস্থিতি প্রক্রিয়া চলছে",
    subtitle: isCheckout
      ? `${student?.name} মাদরাসা থেকে সফলভাবে প্রস্থান করেছে (${toBn(timeDisplay)})।`
      : isPresent
        ? `${student?.name} সময়মতো মাদরাসায় পৌঁছেছে। অভিভাবক হিসেবে নিশ্চিন্ত থাকুন।`
        : isAbsent
          ? `${student?.name} আজ ক্লাসে অনুপস্থিত রয়েছে। বিশেষ প্রয়োজনে যোগাযোগ করুন।`
          : "স্মার্ট কার্ড পাঞ্চ বা শিক্ষকের হাজিরা রেকর্ডের সাথে সাথে লাইভ আপডেট হবে।",
    tag: isCheckout ? "🟠 প্রস্থান সম্পন্ন" : isPresent ? "🟢 উপস্থিত" : isAbsent ? "🔴 অনুপস্থিত" : "⏳ প্রক্রিয়াধীন"
  });

  // Slide 2: Latest Notice / Announcements from Admin Panel (Prominently featured)
  if (Array.isArray(notices) && notices.length > 0) {
    const activeNotice = notices[0];
    slides.push({
      id: `notice-${activeNotice.id || 'latest'}`,
      badge: "সর্বশেষ নোটিশ ও ঘোষণা",
      bgGradient: "from-blue-950 via-indigo-950 to-slate-900",
      border: "border-indigo-500/40",
      icon: Megaphone,
      iconColor: "text-amber-300 bg-amber-400/20",
      title: activeNotice.title || "মাদরাসার সাম্প্রতিক নোটিশ",
      subtitle: (activeNotice.content || "").slice(0, 110) + ((activeNotice.content || "").length > 110 ? "..." : ""),
      tag: "📢 জরুরি নোটিশ",
      image_url: activeNotice.image_url || null,
      link: activeNotice.link || null
    });
  }

  // Slide 3+: Custom Slides from Site Settings (Configured by Admin)
  if (Array.isArray(settings?.custom_slides) && settings.custom_slides.length > 0) {
    settings.custom_slides.filter((cs: any) => cs.active !== false).forEach((cs: any, cIdx: number) => {
      slides.push({
        id: `custom-slide-${cs.id || cIdx}`,
        badge: cs.badge || "বিশেষ ঘোষণা",
        bgGradient: cs.bg_gradient || "from-purple-950 via-slate-900 to-indigo-950",
        border: "border-purple-500/40",
        icon: Sparkles,
        iconColor: "text-purple-300 bg-purple-400/20",
        title: cs.title || "মাদরাসা আপডেট",
        subtitle: cs.subtitle || cs.content || "",
        tag: cs.tag || "✨ আপডেট",
        image_url: cs.image_url || null,
        link: cs.link || null
      });
    });
  }

  // Fee Status Slide
  const unpaidFees = (fees || []).filter(f => f.status === 'unpaid');
  const hasDue = unpaidFees.length > 0;
  slides.push({
    id: "fee_status",
    badge: "বেতন ও ফি তথ্য",
    bgGradient: hasDue
      ? "from-amber-950 via-orange-950 to-slate-900"
      : "from-teal-950 via-emerald-950 to-slate-900",
    border: hasDue ? "border-amber-500/40" : "border-teal-500/40",
    icon: CreditCard,
    iconColor: hasDue ? "text-amber-400 bg-amber-500/20" : "text-emerald-400 bg-emerald-500/20",
    title: hasDue
      ? `বকেয়া ফি: ৳${toBn(unpaidFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0))}`
      : "সব ফি নিয়মিত পরিশোধিত",
    subtitle: hasDue
      ? `${unpaidFees.length}টি ফি পরিশোধের জন্য পেন্ডিং রয়েছে। পেমেন্ট মেনু থেকে দ্রুত পরিশোধ করুন।`
      : "আলহামদুলিল্লাহ! আপনার কোনো বকেয়া নেই। সময়মতো ফি পরিশোধের জন্য ধন্যবাদ।",
    tag: hasDue ? "⚠️ ফি বকেয়া" : "✅ ক্লিয়ার"
  });

  // Islamic Reminder / Institution Quote
  slides.push({
    id: "reminder",
    badge: "দৈনিক ইসলামিক বাণী ও আমল",
    bgGradient: "from-emerald-950 via-slate-900 to-indigo-950",
    border: "border-emerald-500/30",
    icon: Sparkles,
    iconColor: "text-amber-400 bg-amber-500/20",
    title: "ইলম অর্জন প্রত্যেক মুসলমানের ওপর ফরজ",
    subtitle: "সন্তানকে নিয়মিত ৫ ওয়াক্ত নামাজ ও দৈনিক আমলসমূহ আদায় করার জন্য উৎসাহ দিন।",
    tag: "✨ নসীহত"
  });

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % slides.length;
        setSweepKey(k => k + 1);
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    setSweepKey(k => k + 1);
  };

  const nextSlide = () => {
    setCurrentSlide((currentSlide + 1) % slides.length);
    setSweepKey(k => k + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
    setSweepKey(k => k + 1);
  };

  const active = slides[currentSlide] || slides[0];
  const IconComponent = active.icon;

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border transition-all duration-500 bg-slate-900">
      {/* Light Sweep (সাদা আলোর চমৎকার স্থানান্তর এফেক্ট) */}
      <motion.div
        key={`sweep-${sweepKey}`}
        initial={{ x: "-120%", opacity: 0.8 }}
        animate={{ x: "220%", opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
        className="absolute inset-y-0 w-32 pointer-events-none z-30 transform -skew-x-25 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[2px]"
      />

      <div className={cn(
        "relative p-4 sm:p-6 bg-gradient-to-r text-white transition-colors duration-500 min-h-[140px] sm:min-h-[150px] flex flex-col justify-between",
        active.bgGradient,
        active.border
      )}>
        {/* Top bar in slide */}
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 text-white/90">
              {active.badge}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-amber-300">
              {active.tag}
            </span>
          </div>

          {/* Slide Indicators & Navigation Controls + Red Glowing Notification Button */}
          <div className="flex items-center gap-2">
            {onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                title="সকল নোটিফিকেশন দেখুন"
                className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all active:scale-95 shadow-sm group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <Bell className="w-3.5 h-3.5 text-rose-400 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-bold text-rose-200">নোটিশ</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={prevSlide}
                className="p-1 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="পূর্ববর্তী"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold text-white/80 px-1">
                {toBn(currentSlide + 1)}/{toBn(slides.length)}
              </span>
              <button
                type="button"
                onClick={nextSlide}
                className="p-1 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="পরবর্তী"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3.5 sm:gap-4 my-2 relative z-10"
          >
            {active.image_url ? (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-white/20 shadow-md bg-white/10">
                <img src={active.image_url} alt="Slide" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={cn("p-2.5 sm:p-3 rounded-2xl shrink-0 border border-white/10 shadow-inner", active.iconColor)}>
                <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white leading-snug truncate">
                {active.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-2 mt-0.5 leading-relaxed">
                {active.subtitle}
              </p>
              {active.link && (
                <a 
                  href={active.link} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-300 hover:text-amber-200 underline"
                >
                  বিস্তারিত দেখুন →
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1 relative z-10">
          {slides.map((s, idx) => (
            <button
              key={`guardian-slide-${s.id || 'slide'}-${idx}`}
              type="button"
              onClick={() => goToSlide(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentSlide === idx ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
