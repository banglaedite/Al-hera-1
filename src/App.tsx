import React, { useState, useEffect } from "react";
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
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AdmissionForm from "./components/AdmissionForm";
import StudentSearch from "./components/StudentSearch";
import FeeManagement from "./components/FeeManagement";
import ParentPortal from "./components/ParentPortal";
import DashboardHome from "./components/DashboardHome";
import AdminPanel from "./components/AdminPanel";
import LandingPage from "./components/LandingPage";
import FloatingContact from "./components/FloatingContact";
import { ToastProvider } from "./components/ToastContext";
import { cn } from "./lib/utils";

const NoticeBoard = () => {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch("/api/notices");
        if (res.ok) {
          const data = await res.json();
          setNotices(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load notices:", err);
      }
    };
    fetchNotices();
  }, []);

  if (notices.length === 0) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-100 py-2 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee">
        {notices.map((n, i) => (
          <span key={i} className="mx-8 text-sm font-bold text-amber-900 flex items-center gap-2">
            <Bell className="w-4 h-4" /> {n.title}: {n.content}
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {notices.map((n, i) => (
          <span key={`dup-${i}`} className="mx-8 text-sm font-bold text-amber-900 flex items-center gap-2">
            <Bell className="w-4 h-4" /> {n.title}: {n.content}
          </span>
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object' && Object.keys(data).length > 0) setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  if (location.pathname === "/") return null;

  const navItems = [
    { name: "হোম", path: "/", icon: Home },
    { name: "ভর্তি", path: "/admission", icon: UserPlus },
    { name: "পোর্টাল", path: "/parent", icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <NoticeBoard />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-900 p-2 rounded-xl shadow-lg shadow-emerald-900/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight font-display text-slate-900">
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

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="min-h-screen bg-[#fdfcf8] font-sans text-slate-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/admission" element={<div className="max-w-7xl mx-auto px-4 py-12"><AdmissionForm /></div>} />
              <Route path="/students" element={<div className="max-w-7xl mx-auto px-4 py-12"><StudentSearch /></div>} />
              <Route path="/fees" element={<div className="max-w-7xl mx-auto px-4 py-12"><FeeManagement /></div>} />
              <Route path="/parent" element={<div className="max-w-7xl mx-auto px-4 py-12"><ParentPortal /></div>} />
              <Route path="/secret-admin-access" element={<div className="max-w-7xl mx-auto px-4 py-12"><AdminPanel /></div>} />
            </Routes>
          </main>
          
          <FloatingContact />
          
          <footer className="bg-emerald-950 text-emerald-100 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex justify-center gap-4 mb-6">
                <BookOpen className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-xl font-bold mb-2">আল হেরা মাদ্রাসা</h3>
              <p className="text-sm opacity-70 mb-8">একটি আদর্শ দ্বীনি শিক্ষা প্রতিষ্ঠান</p>
              <div className="border-t border-emerald-900 pt-8 text-xs opacity-50">
                © {new Date().getFullYear()} আল হেরা মাদ্রাসা। সর্বস্বত্ব সংরক্ষিত।
              </div>
            </div>
          </footer>
        </div>
      </ToastProvider>
    </Router>
  );
}
