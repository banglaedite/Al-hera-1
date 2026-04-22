import React, { useState, useEffect, lazy, Suspense, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
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
  ShieldCheck,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ToastProvider, useToast } from "./components/ToastContext";
import { cn } from "./lib/utils";

// Lazy Load Major Components
const AdmissionForm = lazy(() => import("./components/AdmissionForm"));
const StudentSearch = lazy(() => import("./components/StudentSearch"));
const FeeManagement = lazy(() => import("./components/FeeManagement"));
const ParentPortal = lazy(() => import("./components/ParentPortal"));
const TeacherPortal = lazy(() => import("./components/TeacherPortal"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const LandingPage = lazy(() => import("./components/LandingPage"));
const FloatingContact = lazy(() => import("./components/FloatingContact"));
const NoticeBoard = lazy(() => import("./components/NoticeBoard").then(m => ({ default: m.NoticeBoard })));

// Settings Context
const SettingsContext = createContext<{ settings: any; loading: boolean }>({ settings: null, loading: true });
const useSettings = () => useContext(SettingsContext);

const LoadingOverlay = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#fdfcf8]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-emerald-600" />
        </div>
      </div>
      <p className="text-emerald-900 font-black tracking-widest animate-pulse">লোড হচ্ছে...</p>
    </div>
  </div>
);

const SiteSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setSettings(data);
            if (data.title) document.title = data.title;
            if (data.logo_url) {
              let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              link.href = data.logo_url;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      <Navbar />
      {children}
    </SettingsContext.Provider>
  );
};

const Navbar = () => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === "/") return null;

  const navItems = [
    { name: "হোম", path: "/", icon: Home },
    { name: "ভর্তি", path: "/admission", icon: UserPlus },
    { name: "রেজাল্ট", path: "/parent?tab=results", icon: BookOpen },
    { name: "প্যারেন্ট পোর্টাল", path: "/parent", icon: LayoutDashboard },
    { name: "শিক্ষক পোর্টাল", path: "/teacher", icon: GraduationCap },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
               <div className="p-1.5 rounded-xl shadow-lg bg-white border border-slate-100 flex items-center justify-center">
                 <img src={settings.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
               </div>
            ) : (
               <div className="bg-emerald-900 p-2 rounded-xl shadow-lg shadow-emerald-900/20">
                 <GraduationCap className="w-6 h-6 text-white" />
               </div>
            )}
            <span className="text-2xl font-black tracking-tight font-display text-emerald-900 drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-r from-emerald-900 to-emerald-600">
              {settings?.title || "আল হেরা মাদরাসা"}
            </span>
          </div>
          
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
  const { settings, loading } = useSettings();
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!loading && settings?.popup_enabled && !hasShown) {
      const timer = setTimeout(() => {
        setShow(true);
        setHasShown(true);
      }, 1500);

      const duration = (settings.popup_duration || 0) * 1000;
      if (duration > 0) {
        setTimeout(() => setShow(false), duration + 1500);
      }
      return () => clearTimeout(timer);
    }
  }, [settings, loading, hasShown]);

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

            {settings.popup_image && (
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
            )}

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

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <SiteSettingsProvider>
          <div className="min-h-screen bg-[#fdfcf8] font-sans text-slate-900">
            <GlobalPopup />
            <Suspense fallback={<LoadingOverlay />}>
              <NoticeBoard />
              <main>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/admission" element={<div className="max-w-7xl mx-auto px-4 py-12"><AdmissionForm /></div>} />
                  <Route path="/students" element={<div className="max-w-7xl mx-auto px-4 py-12"><StudentSearch /></div>} />
                  <Route path="/fees" element={<div className="max-w-7xl mx-auto px-4 py-12"><FeeManagement /></div>} />
                  <Route path="/parent" element={<div className="max-w-7xl mx-auto px-4 py-12"><ParentPortal /></div>} />
                  <Route path="/teacher" element={<TeacherPortal />} />
                  <Route path="/secret-admin-access" element={<div className="max-w-7xl mx-auto px-4 py-12"><AdminPanel /></div>} />
                </Routes>
              </main>
              <FloatingContact />
            </Suspense>
            
            <footer className="bg-emerald-950 text-emerald-100 py-12 mt-20">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex justify-center gap-4 mb-6">
                  <Link to="/secret-admin-access" className="group relative p-2" title="Admin Access">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <BookOpen className="w-10 h-10 opacity-50 group-hover:opacity-100 transition-opacity duration-300 relative z-10 cursor-pointer" />
                  </Link>
                </div>
                <h3 className="text-xl font-bold mb-2">আল হেরা মাদ্রাসা</h3>
                <p className="text-sm opacity-70 mb-8">একটি আদর্শ দ্বীনি শিক্ষা প্রতিষ্ঠান</p>
                <div className="border-t border-emerald-900 pt-8 text-xs opacity-50">
                  © {new Date().getFullYear()} আল হেরা মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
                </div>
              </div>
            </footer>
          </div>
        </SiteSettingsProvider>
      </ToastProvider>
    </Router>
  );
}
