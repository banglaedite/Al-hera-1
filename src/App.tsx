import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { db } from "./firebase";
import { 
  Home, 
  UserPlus, 
  Users, 
  CreditCard, 
  Search, 
  LayoutDashboard, 
  Menu, 
  X,
  GraduationCap,
  BookOpen,
  Bell,
  Heart,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdmissionForm from "./components/AdmissionForm";
import StudentSearch from "./components/StudentSearch";
import FeeManagement from "./components/FeeManagement";
import ParentPortal from "./components/ParentPortal";
import TeacherPortal from "./components/TeacherPortal";
import DashboardHome from "./components/DashboardHome";
import AdminPanel from "./components/AdminPanel";
import LandingPage from "./components/LandingPage";
import FloatingContact from "./components/FloatingContact";
import { NoticeBoard } from "./components/NoticeBoard";
import { ToastProvider } from "./components/ToastContext";
import { RFIDTerminal } from "./components/RFIDTerminal";
import { SecretLogoTrigger } from "./components/SecretLogoTrigger";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { cn } from "./lib/utils";
import { SimulatedIncomingCall } from "./components/SimulatedIncomingCall";
import { requestForToken, onMessageListener } from "./firebase";
import { playIPhoneNotificationSound } from "./utils/audio";

import { useToast } from "./components/ToastContext";

// Component to handle Push Notification Subscriptions
const PushNotificationManager = () => {
  useEffect(() => {
    const setupPush = async () => {
      // 1. Request Permission
      if (!("Notification" in window)) return;
      
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission === "granted") {
        // 2. Get Token
        const token = await requestForToken();
        if (token) {
          const phone = localStorage.getItem("guardianPhone");
          const studentData = localStorage.getItem("studentData");
          let studentId = null;
          if (studentData) {
            try {
              studentId = JSON.parse(studentData).id;
            } catch (e) {}
          }

          // 3. Send to Server
          if (phone || studentId) {
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token, phone, studentId })
            }).catch(console.error);
          }
        }
      }
    };

    setupPush();

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      console.log("Foreground message received:", payload);
      playIPhoneNotificationSound();
    }).catch(err => console.log('failed: ', err));
  }, []);

  return null;
};

// Global Component to listen for active calls regardless of the page
const GlobalGuardianCallListener = ({ settings }: { settings: any }) => {
  const { addToast } = useToast();
  const [activeCallData, setActiveCallData] = useState<any>(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    const phone = localStorage.getItem("guardianPhone");
    if (!phone) {
      setStudent(null);
      return;
    }

    // Fetch basic student info for the listener
    fetch("/api/parent-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: phone })
    })
    .then(r => r.ok ? r.json() : null)
    .then(d => d && setStudent(d))
    .catch(() => {});
  }, []);

  useEffect(() => {
    if (!student?.id) return;

    let lastCheckedPunchId = sessionStorage.getItem(`last_notified_punch_${student.id}`) || "";

    const checkActiveCalls = async () => {
      try {
        // 1. Check for Active Calls
        const res = await fetch(`/api/parent/active-call/${student.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.active && data.call && (!activeCallData || activeCallData.id !== data.call.id)) {
            setActiveCallData(data.call);
            setShowIncomingCall(true);

            // System Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                const notif = new Notification(`📞 ${data.call.caller || "মাদরাসা অফিস"} থেকে ভয়েস কল আসছে...`, {
                  body: `${student.name}-এর জরুরি কল। রিসিভ করতে স্পর্শ করুন।`,
                  icon: settings?.logo_url || '/favicon.ico',
                  tag: `call-${data.call.id}`,
                  requireInteraction: true
                });
                notif.onclick = () => {
                  window.focus();
                  notif.close();
                };
              } catch (e) {}
            }
          } else if (!data.active) {
            setShowIncomingCall(false);
            setActiveCallData(null);
          }
        }

        // 2. Check for Instant Punch Notifications (Added for better real-time experience)
        const punchRes = await fetch(`/api/parent/latest-punch/${student.id}`);
        if (punchRes.ok) {
          const pData = await punchRes.json();
          if (pData.punch && pData.punch.id !== lastCheckedPunchId) {
            const punchTime = new Date(pData.punch.timestamp || Date.now()).getTime();
            const now = Date.now();
            // Only notify if it happened in last 3 minutes
            if (now - punchTime < 180000) {
              lastCheckedPunchId = pData.punch.id;
              sessionStorage.setItem(`last_notified_punch_${student.id}`, pData.punch.id);
              
              const title = pData.punch.action === 'check_in' ? '🟢 সফল প্রবেশ' : '🟠 সফল প্রস্থান';
              const body = `${student.name} আজ ${pData.punch.time || 'এইমাত্র'} মিনিটে মাদরাসায় ${pData.punch.action === 'check_in' ? 'প্রবেশ করেছে' : 'প্রস্থান করেছে'}।`;
              
              addToast(body, "success");
              playIPhoneNotificationSound();

              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  const notif = new Notification(title, {
                    body,
                    icon: settings?.logo_url || '/favicon.ico',
                    tag: `punch-${pData.punch.id}`
                  });
                } catch (e) {}
              }
            }
          }
        }
      } catch (e) {}
    };

    checkActiveCalls();
    const interval = setInterval(checkActiveCalls, 3000); 
    return () => clearInterval(interval);
  }, [student?.id, activeCallData, settings?.logo_url]);

  const handleCallResponse = async (status: string, isTimeout: boolean = false) => {
    setShowIncomingCall(false);
    if (activeCallData?.id) {
      fetch("/api/parent/call/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: activeCallData.id, status: isTimeout ? "missed" : status })
      }).catch(() => {});
      
      if (status === 'accepted') {
        addToast("কল সংযুক্ত হয়েছে", "success");
      } else {
        addToast(isTimeout ? "কল টাইমআউট হয়েছে" : "কল কেটে দেওয়া হয়েছে", "info");
      }
    }
    setActiveCallData(null);
  };

  if (!showIncomingCall) return null;

  return (
    <SimulatedIncomingCall
      student={student}
      settings={settings}
      onAccept={() => handleCallResponse('accepted')}
      onDecline={(isTimeout) => handleCallResponse('declined', isTimeout)}
      onClose={() => setShowIncomingCall(false)}
    />
  );
};

const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("siteSettings");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setSettings(data);
            localStorage.setItem("siteSettings", JSON.stringify(data));
            
            // Apply Site Title & Favicon Globally
            if (data.title) {
              document.title = data.title;
            }
            if (data.logo_url) {
              let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              link.href = data.logo_url;

              let appleLink = document.querySelector("link[rel~='apple-touch-icon']") as HTMLLinkElement;
              if (!appleLink) {
                appleLink = document.createElement('link');
                appleLink.rel = 'apple-touch-icon';
                document.head.appendChild(appleLink);
              }
              appleLink.href = data.logo_url;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <PushNotificationManager />
      <Navbar settings={settings} />
      <GlobalGuardianCallListener settings={settings} />
      {children}
      <footer className="bg-emerald-950 text-emerald-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Link to="/secret-admin-access" className="group relative p-2" title="Admin Access">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <BookOpen className="w-10 h-10 opacity-50 group-hover:opacity-100 transition-opacity duration-300 relative z-10 cursor-pointer" />
            </Link>
          </div>
          <h3 className="text-xl font-bold mb-2">{settings?.title || "মাদরাসা"}</h3>
          <p className="text-sm opacity-70 mb-8">{settings?.address || "একটি আদর্শ দ্বীনি শিক্ষা প্রতিষ্ঠান"}</p>
          <div className="border-t border-emerald-900 pt-8 text-xs opacity-50">
            © {new Date().getFullYear()} {settings?.title || "মাদরাসা"}। সর্বস্বত্ব সংরক্ষিত।
          </div>
        </div>
      </footer>
    </>
  );
};

const Navbar = ({ settings }: { settings: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === "/") return null;

  const navItems = [
    { name: "হোম", path: "/dashboard", icon: Home },
    { name: "ভর্তি", path: "/admission", icon: UserPlus },
    { name: "রেজাল্ট", path: "/parent?tab=results", icon: BookOpen },
    { name: "প্যারেন্ট পোর্টাল", path: "/parent", icon: LayoutDashboard },
    { name: "শিক্ষক পোর্টাল", path: "/teacher", icon: GraduationCap },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <SecretLogoTrigger logoUrl={settings?.logo_url} title={settings?.title} />
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                    location.pathname === item.path 
                      ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-emerald-900 border-t border-emerald-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium flex items-center gap-3",
                    location.pathname === item.path 
                      ? "bg-emerald-800 text-white" 
                      : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const GlobalPopup = () => {
  const [settings, setSettings] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && data.popup_enabled) {
            setSettings(data);
            // Show popup once per session/initial load
            if (!hasShown) {
              setTimeout(() => {
                setShow(true);
                setHasShown(true);
              }, 1500); // Small delay for better UX

              // Auto hide if duration is set
              const duration = (data.popup_duration || 0) * 1000;
              if (duration > 0) {
                setTimeout(() => {
                  setShow(false);
                }, duration + 1500);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load popup settings:", err);
      }
    };
    fetchSettings();
  }, [hasShown]);

  if (!settings || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100"
          >
            {settings.popup_show_close && (
              <button 
                onClick={() => setShow(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-slate-500 hover:text-rose-500 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {(settings.popup_video_url || settings.popup_video) ? (
              <div className="relative overflow-hidden aspect-video bg-slate-950">
                {(settings.popup_video_url || settings.popup_video).includes("youtube.com") || (settings.popup_video_url || settings.popup_video).includes("youtu.be") ? (
                  <iframe
                    src={(settings.popup_video_url || settings.popup_video)
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/")}
                    title="Announcement Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={settings.popup_video_url || settings.popup_video}
                    controls
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : settings.popup_image ? (
              <div className="relative group overflow-hidden h-48 sm:h-64">
                <img 
                  src={settings.popup_image} 
                  alt="Announcement" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  onClick={() => settings.popup_link && window.open(settings.popup_link, '_blank')}
                />
                {settings.popup_link && (
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-black text-sm shadow-xl">বিস্তারিত দেখুন</span>
                  </div>
                )}
              </div>
            ) : null}

            <div className="p-8 text-center">
              {settings.popup_title && (
                <h3 className="text-2xl font-black text-emerald-900 mb-4">{settings.popup_title}</h3>
              )}
              {settings.popup_description && (
                <p className="text-slate-600 font-bold leading-relaxed whitespace-pre-wrap">{settings.popup_description}</p>
              )}
              
              <div className="mt-8 flex flex-col gap-3">
                {settings.popup_link && (
                  <a 
                    href={settings.popup_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
                  >
                    বিস্তারিত তথ্য <GraduationCap className="w-5 h-5" />
                  </a>
                )}
                {!settings.popup_show_close && (
                  <button 
                    onClick={() => setShow(false)}
                    className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                  >
                    বন্ধ করুন
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const RFIDTerminalWrapper = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d && setSettings(d))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <RFIDTerminal settings={settings} addToast={addToast} />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <SiteSettingsProvider>
          <div className="min-h-screen bg-[#fdfcf8] font-sans text-slate-900">
            <GlobalPopup />
            <NoticeBoard />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/rfid-terminal" element={<RFIDTerminalWrapper />} />
                <Route path="/admission" element={<div className="max-w-7xl mx-auto px-4 py-12"><AdmissionForm /></div>} />
                <Route path="/students" element={<div className="max-w-7xl mx-auto px-4 py-12"><StudentSearch /></div>} />
                <Route path="/fees" element={<div className="max-w-7xl mx-auto px-4 py-12"><FeeManagement /></div>} />
                <Route path="/parent" element={<div className="max-w-7xl mx-auto px-4 py-12"><ParentPortal /></div>} />
                <Route path="/teacher" element={<TeacherPortal />} />
                <Route path="/secret-admin-access" element={<div className="max-w-7xl mx-auto px-4 py-12"><AdminPanel /></div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            <FloatingContact />
            <PWAInstallPrompt />
          </div>
        </SiteSettingsProvider>
      </ToastProvider>
    </Router>
  );
}
