import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TeacherManager } from "./TeacherManager";
import { TeacherArchiveManager } from "./TeacherArchiveManager";
import { BiometricManager } from "./BiometricManager";
import { AccountingManager } from "./AccountingManager";
import { RecruitmentManager } from "./RecruitmentManager";
import { FoodMenuManager } from "./FoodMenuManager";
import { RoutineManager } from "./RoutineManager";
import { AmalManager } from "./AmalManager";
import { AllStudentsManager } from "./AllStudentsManager";
import { DatabaseResetManager } from "./DatabaseResetManager";
import { HifzManager } from "./HifzManager";
import { 
  LayoutDashboard, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  CreditCard, 
  Bell, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  Loader2,
  GraduationCap,
  Calendar,
  Save,
  UserCheck,
  FileText,
  ArrowRight,
  Settings,
  ShieldCheck,
  UserPlus,
  Check,
  X,
  X as CloseIcon,
  Lock,
  Edit,
  Trash2,
  Filter,
  ChevronRight,
  MoreVertical,
  User,
  Printer,
  Download,
  Award,
  Star,
  Clock,
  History,
  Fingerprint,
  Target,
  ChevronDown,
  MessageCircle,
  MessageSquare,
  Send,
  Mail,
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  LogOut,
  Globe
} from "lucide-react";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toPng } from 'html-to-image';

import { LoadingButton } from "./LoadingButton";

const AdminStat = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const PrintHeader = ({ settings }: { settings: any }) => (
  <div className="hidden print:block print-header mb-8 border-b-4 border-slate-900 pb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-8">
        {settings?.logo_url && settings.logo_url !== "" && (
          <img 
            src={settings.logo_url} 
            className="w-24 h-24 object-contain bg-white p-2 rounded-xl shadow-sm" 
            alt="Logo" 
            referrerPolicy="no-referrer"
          />
        )}
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{settings?.title || "মাদরাসা ম্যানেজমেন্ট সিস্টেম"}</h1>
          <div className="inline-block px-4 py-1.5 bg-slate-900 text-white text-sm font-black rounded-lg uppercase tracking-widest">
            {settings?.announcement || "দ্বীনি ও আধুনিক শিক্ষা প্রতিষ্ঠান"}
          </div>
          <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            {settings?.contact_phone} | {settings?.whatsapp_number}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-right border-l-2 border-slate-100 pl-8">
          <p className="text-slate-400 font-black text-xs uppercase tracking-tighter mb-1">রিপোর্ট জেনারেটেড</p>
          <p className="text-2xl font-black text-slate-900">{new Date().toLocaleDateString('bn-BD')}</p>
          <p className="text-slate-500 font-bold text-sm mt-1">সময়: {new Date().toLocaleTimeString('bn-BD')}</p>
        </div>
        {settings?.enable_qr_code && settings?.qr_code_url && (
          <div className="border-l-2 border-slate-100 pl-8">
            <img 
              src={settings.qr_code_url} 
              className="w-24 h-24 object-contain bg-white p-2 rounded-xl shadow-sm" 
              alt="QR Code" 
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

import { useToast } from "./ToastContext";

const LockedTab = ({ children, addToast }: { children: React.ReactNode, addToast: any }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "1234";
    if (password === adminPassword || password === "১২৩৪") {
      setIsUnlocked(true);
    } else {
      addToast("ভুল পাসওয়ার্ড!", "error");
    }
  };

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center max-w-md mx-auto mt-12">
      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
        <Lock className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">সুরক্ষিত এলাকা</h3>
      <p className="text-slate-500 mb-8">এই সেকশনে প্রবেশ করতে পাসওয়ার্ড দিন</p>
      <form onSubmit={handleUnlock} className="space-y-4">
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="পাসওয়ার্ড"
          className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-center"
          autoFocus
          autoComplete="new-password"
        />
        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
          আনলক করুন
        </button>
      </form>
    </div>
  );
};

function CategoryManager({ type }: { type: "income" | "expense" }) {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "delete">("add");
  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    const res = await fetch(`/api/admin/accounting/${type}-categories`);
    const data = await res.json();
    if (Array.isArray(data)) setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const handleAction = async () => {
    if (!password) {
      addToast("পাসওয়ার্ড দিন", "error");
      return;
    }

    let url = `/api/admin/accounting/${type}-categories`;
    let method = "POST";
    let body: any = { password };

    if (modalType === "add") {
      if (!newCategory.trim()) {
        addToast("ক্যাটাগরির নাম দিন", "error");
        return;
      }
      body.name = newCategory.trim();
    } else if (modalType === "edit") {
      url += `/${selectedCat.id}`;
      method = "PUT";
      body = { ...selectedCat, name: editName.trim(), password };
    } else if (modalType === "delete") {
      url += `/${selectedCat.id}`;
      method = "DELETE";
      // Ensure body is sent for DELETE if server expects it
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        addToast(modalType === "add" ? "ক্যাটাগরি যোগ করা হয়েছে" : modalType === "edit" ? "আপডেট করা হয়েছে" : "ডিলিট করা হয়েছে", "success");
        setShowModal(false);
        setPassword("");
        setNewCategory("");
        fetchCategories();
      } else {
        const data = await res.json();
        addToast(data.error || "ব্যর্থ হয়েছে", "error");
      }
    } catch (error) {
      addToast("সার্ভার সমস্যা হয়েছে", "error");
    }
  };

  const handleToggleHide = async (cat: any) => {
    const pass = window.prompt("পাসওয়ার্ড দিন:");
    if (!pass) return;

    const res = await fetch(`/api/admin/accounting/${type}-categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cat, is_hidden: !cat.is_hidden, password: pass })
    });
    if (res.ok) {
      addToast("আপডেট করা হয়েছে", "success");
      fetchCategories();
    } else {
      const data = await res.json();
      addToast(data.error || "ব্যর্থ হয়েছে", "error");
    }
  };

  return (
    <div className="space-y-4">
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6">
              {modalType === "add" ? "নতুন ক্যাটাগরি যোগ করুন" : modalType === "edit" ? "ক্যাটাগরি এডিট করুন" : "ক্যাটাগরি ডিলিট করুন"}
            </h3>
            
            <div className="space-y-4">
              {modalType === "add" && (
                <input 
                  value={newCategory} 
                  onChange={e => setNewCategory(e.target.value)} 
                  placeholder="ক্যাটাগরির নাম" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                />
              )}
              {modalType === "edit" && (
                <input 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)} 
                  placeholder="ক্যাটাগরির নাম" 
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                />
              )}
              {modalType === "delete" && (
                <p className="text-rose-600 font-bold">আপনি কি নিশ্চিতভাবে "{selectedCat?.name}" ডিলিট করতে চান?</p>
              )}
              
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="অ্যাডমিন পাসওয়ার্ড" 
                className="w-full p-4 bg-slate-50 border rounded-2xl font-bold text-center"
              />
              
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">বাতিল</button>
                <button onClick={handleAction} className={cn("flex-1 py-4 text-white rounded-2xl font-bold", modalType === "delete" ? "bg-rose-600" : "bg-emerald-600")}>
                  {modalType === "add" ? "যোগ করুন" : modalType === "edit" ? "আপডেট করুন" : "ডিলিট করুন"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex gap-2">
        <input 
          value={newCategory} 
          onChange={e => setNewCategory(e.target.value)} 
          placeholder={`নতুন ${type === "income" ? "আয়" : "ব্যয়"} ক্যাটাগরি`} 
          className="flex-1 p-4 bg-slate-50 border rounded-2xl font-bold"
        />
        <button 
          onClick={() => {
            setModalType("add");
            setShowModal(true);
          }} 
          className="px-6 bg-emerald-600 text-white rounded-2xl font-bold"
        >
          যোগ করুন
        </button>
      </div>

      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className={cn("font-bold text-lg", cat.is_hidden && "text-slate-400 line-through")}>{cat.name}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setSelectedCat(cat);
                  setEditName(cat.name);
                  setModalType("edit");
                  setShowModal(true);
                }} 
                className="p-3 text-slate-500 hover:text-blue-600 bg-white rounded-xl shadow-sm"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={() => handleToggleHide(cat)} className="p-3 text-slate-500 hover:text-emerald-600 bg-white rounded-xl shadow-sm">
                {cat.is_hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => {
                  setSelectedCat(cat);
                  setModalType("delete");
                  setShowModal(true);
                }} 
                className="p-3 text-rose-500 hover:text-rose-700 bg-white rounded-xl shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("adminActiveTab") || "dashboard");
  const [stats, setStats] = useState<any>({ students: 0, income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("isAdmin") === "true");
  const [adminRole, setAdminRole] = useState(() => localStorage.getItem("adminRole") || "admin");
  const [adminPermissions, setAdminPermissions] = useState<string[]>(() => {
    const perms = localStorage.getItem("adminPermissions");
    return perms ? JSON.parse(perms) : ["all"];
  });
  const [password, setPassword] = useState("");
  const [initialStudentId, setInitialStudentId] = useState<string | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem("isAdmin", isAuthenticated.toString());
    localStorage.setItem("adminRole", adminRole);
    localStorage.setItem("adminPermissions", JSON.stringify(adminPermissions));
    if (isAuthenticated) {
      fetchStats();
      fetchStudents();
      fetchNotices();
      fetchSettings();
      fetchClasses();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  const fetchSettings = async () => {
    const res = await fetch("/api/site-settings");
    const data = await res.json();
    if (!data.smtp_user) data.smtp_user = "banglaedite@gmail.com";
    if (!data.sender_email) data.sender_email = "banglaedite@gmail.com";
    if (!data.smtp_host) data.smtp_host = "smtp.gmail.com";
    if (!data.smtp_port) data.smtp_port = 587;
    setSettings(data);
  };

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/classes");
      if (res.ok) setClasses(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = password.trim();
    
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier })
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setAdminRole(data.role);
        setAdminPermissions(data.permissions);
      } else {
        const err = await res.json();
        addToast(err.error || "ভুল পাসওয়ার্ড বা ইমেইল!", "error");
      }
    } catch (error) {
      addToast("লগইন করতে সমস্যা হয়েছে", "error");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        setStats(await res.json());
      } else {
        console.error("Failed to fetch stats:", res.status);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    const res = await fetch("/api/students");
    const data = await res.json();
    if (Array.isArray(data)) setStudents(data);
  };

  const fetchNotices = async () => {
    const res = await fetch("/api/notices");
    const data = await res.json();
    if (Array.isArray(data)) setNotices(data);
  };

  const allTabs = [
    { id: "dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { id: "admissions", label: "ভর্তি আবেদন", icon: UserPlus, permission: "admission" },
    { id: "students", label: "ছাত্র তালিকা", icon: Users, permission: "admission" },
    { id: "all-students", label: "সকল ছাত্র (আর্কাইভ)", icon: Users, permission: "admission" },
    { id: "attendance", label: "ছাত্র হাজিরা", icon: UserCheck, permission: "student_attendance" },
    { id: "hifz", label: "হিফজ বিভাগ", icon: GraduationCap },
    { id: "device-attendance", label: "স্মার্ট ডিভাইস হাজিরা", icon: History, permission: "student_attendance" },
    { id: "teacher-attendance", label: "শিক্ষক হাজিরা", icon: UserCheck, permission: "teacher_attendance" },
    { id: "results", label: "রেজাল্ট", icon: BookOpen, permission: "result" },
    { id: "teachers", label: "শিক্ষক", icon: Users, permission: "teacher_attendance" },
    { id: "all-teachers", label: "শিক্ষক (আর্কাইভ)", icon: Users, permission: "teacher_attendance" },
    { id: "biometric", label: "বায়োমেট্রিক হাজিরা", icon: Fingerprint, permission: "teacher_attendance" },
    { id: "accounting", label: "হিসাব-নিকাশ", icon: CreditCard, permission: "fee_collection" },
    { id: "recruitment", label: "নিয়োগ", icon: UserPlus, permission: "teacher_attendance" },
    { id: "food-menu", label: "খাবারের তালিকা", icon: BookOpen, permission: "notice" },
    { id: "fees", label: "বেতন ও ফি", icon: CreditCard, permission: "fee_collection" },
    { id: "history", label: "হিস্টোরি", icon: Clock, permission: "fee_collection" },
    { id: "notices", label: "নোটিশ", icon: Bell, permission: "notice" },
    { id: "features", label: "বৈশিষ্ট্য", icon: Award, permission: "notice" },
    { id: "showcase", label: "শোকেস", icon: Globe, permission: "notice" },
    { id: "routines", label: "সিলেবাস ও রুটিন", icon: FileText, permission: "notice" },
    { id: "amal", label: "দৈনিক আমল", icon: Target, permission: "notice" },
    { id: "delete-history", label: "ডিলিট হিস্টোরি", icon: Trash2 },
    { id: "settings", label: "সেটিংস", icon: Settings },
  ];

  const tabs = adminRole === "admin" 
    ? allTabs 
    : allTabs.filter(tab => !tab.permission || adminPermissions.includes(tab.permission));

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">এডমিন লগইন</h2>
          <p className="text-slate-500 mb-8">গোপন পাসওয়ার্ডটি প্রদান করুন</p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড বা সাব-এডমিন ইমেইল"
                className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <button className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-all">
              প্রবেশ করুন
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading && isAuthenticated) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <>
      <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2 print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-100"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => {
              localStorage.removeItem("isAdmin");
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 mt-8"
          >
            <LogOut className="w-5 h-5" />
            লগআউট
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 print:w-full print:max-w-none">
          <AnimatePresence mode="wait">
            {activeTab === "hifz" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <HifzManager classesList={classes.map(c => c.name)} />
              </motion.div>
            )}
            {activeTab === "dashboard" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <AdminStat label="মোট ছাত্র" value={stats.students} icon={Users} color="bg-blue-500" />
                  <AdminStat label="মোট আয়" value={`৳ ${stats.income}`} icon={TrendingUp} color="bg-emerald-500" />
                  <AdminStat label="মোট ব্যয়" value={`৳ ${stats.expenses}`} icon={TrendingDown} color="bg-rose-500" />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">সাম্প্রতিক ভর্তি</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-slate-400 text-xs uppercase tracking-wider font-bold border-b border-slate-50">
                          <th className="pb-4">ছাত্রের নাম</th>
                          <th className="pb-4">শ্রেণী</th>
                          <th className="pb-4">আইডি</th>
                          <th className="pb-4">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {students?.slice(0, 5).map((s) => (
                          <tr key={s.id} className="border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50" onClick={() => {
                            setActiveTab("students");
                            // Need a way to trigger profile view for this student
                          }}>
                            <td className="py-4 font-bold text-slate-700">{s.name}</td>
                            <td className="py-4 text-slate-500">{s.class}</td>
                            <td className="py-4 font-mono text-emerald-600">{s.id}</td>
                            <td className="py-4 text-slate-400">{new Date(s.admission_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "teachers" && (
              <TeacherManager addToast={addToast} settings={settings} />
            )}

            {activeTab === "all-teachers" && (
              <TeacherArchiveManager settings={settings} />
            )}

            {activeTab === "biometric" && (
              <BiometricManager addToast={addToast} />
            )}

            {activeTab === "accounting" && (
              <AccountingManager settings={settings} addToast={addToast} classesList={classes.filter(c => c.is_active !== false).map(c => c.name)} />
            )}

            {activeTab === "recruitment" && (
              <RecruitmentManager />
            )}

            {activeTab === "food-menu" && (
              <FoodMenuManager />
            )}

            {activeTab === "routines" && (
              <RoutineManager />
            )}

            {activeTab === "amal" && (
              <AmalManager />
            )}

            {activeTab === "admissions" && (
              <AdmissionManager onApprove={fetchStudents} />
            )}

            {activeTab === "students" && (
              <StudentManager 
                settings={settings} 
                onUpdate={fetchStudents} 
                classesList={classes.filter(c => c.is_active !== false).map(c => c.name)} 
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "all-students" && (
              <AllStudentsManager settings={settings} classesList={classes.filter(c => c.is_active !== false).map(c => c.name)} />
            )}

            {activeTab === "attendance" && (
              <AttendanceManager settings={settings} classesList={classes.filter(c => c.is_active !== false).map(c => c.name)} />
            )}

            {activeTab === "device-attendance" && (
              <DeviceAttendanceManager settings={settings} />
            )}

            {activeTab === "teacher-attendance" && (
              <TeacherAttendanceManager settings={settings} />
            )}

            {activeTab === "results" && (
              <ResultManager students={students} settings={settings} classesList={classes.filter(c => c.is_active !== false).map(c => c.name)} />
            )}

            {activeTab === "fees" && (
              <FeeManager students={students} settings={settings} onUpdate={fetchStats} initialStudentId={initialStudentId} classesList={classes.filter(c => c.is_active !== false).map(c => c.name)} />
            )}

            {activeTab === "history" && (
              <TransactionHistory settings={settings} />
            )}

            {activeTab === "notices" && (
              <NoticeManager notices={notices} onUpdate={fetchNotices} />
            )}

            {activeTab === "features" && (
              <FeatureManager />
            )}

            {activeTab === "showcase" && (
              <ShowcaseManager />
            )}

            {activeTab === "delete-history" && (
              <LockedTab addToast={addToast}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DeleteHistory />
                </motion.div>
              </LockedTab>
            )}

            {activeTab === "settings" && (
              <LockedTab addToast={addToast}>
                <div className="space-y-8">
                  <SettingsManager settings={settings} setSettings={setSettings} onUpdate={fetchSettings} classes={classes} fetchClasses={fetchClasses} />
                  <DatabaseResetManager />
                </div>
              </LockedTab>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
    </>
  );
}

// --- Generic Confirm Modal ---
function ConfirmModal({ isOpen, message, onConfirm, onCancel }: { isOpen: boolean, message: string, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">নিশ্চিত করুন</h3>
        </div>
        <p className="text-slate-600 font-bold mb-8">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">বাতিল</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">হ্যাঁ, নিশ্চিত</button>
        </div>
      </motion.div>
    </div>
  );
}

function ShowcaseManager() {
  const { addToast } = useToast();
  const [showcaseItems, setShowcaseItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchShowcaseItems = async () => {
    const res = await fetch("/api/showcase-items");
    const data = await res.json();
    if (Array.isArray(data)) setShowcaseItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchShowcaseItems();
  }, []);

  const handleAddShowcaseItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    if (editingItem) {
      await fetch(`/api/admin/showcase-items/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      setEditingItem(null);
      addToast("শোকেস আইটেম আপডেট করা হয়েছে", "success");
    } else {
      await fetch("/api/admin/showcase-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      addToast("নতুন শোকেস আইটেম যোগ করা হয়েছে", "success");
    }
    
    (e.target as HTMLFormElement).reset();
    fetchShowcaseItems();
  };

  const executeDeleteShowcaseItem = async () => {
    if (!itemToDelete) return;
    await fetch(`/api/admin/showcase-items/${itemToDelete}`, { method: "DELETE" });
    setItemToDelete(null);
    addToast("শোকেস আইটেম ডিলিট করা হয়েছে", "success");
    fetchShowcaseItems();
  };

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={!!itemToDelete} 
        message="আপনি কি নিশ্চিতভাবে এই শোকেস আইটেমটি ডিলিট করতে চান?" 
        onConfirm={executeDeleteShowcaseItem} 
        onCancel={() => setItemToDelete(null)} 
      />
      <h2 className="text-2xl font-black text-slate-900">শোকেস ম্যানেজমেন্ট</h2>
      <form onSubmit={handleAddShowcaseItem} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <input name="title" placeholder="শিরোনাম" required defaultValue={editingItem?.title} className="w-full p-4 bg-slate-50 border rounded-2xl" />
        <textarea name="description" placeholder="বর্ণনা" defaultValue={editingItem?.description} className="w-full p-4 bg-slate-50 border rounded-2xl" />
        <input name="url" placeholder="ইমেজ বা ভিডিও ইউআরএল" required defaultValue={editingItem?.url} className="w-full p-4 bg-slate-50 border rounded-2xl" />
        <select name="type" defaultValue={editingItem?.type} className="w-full p-4 bg-slate-50 border rounded-2xl">
          <option value="image">ইমেজ</option>
          <option value="video">ভিডিও</option>
        </select>
        <button type="submit" className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold">
          {editingItem ? "আপডেট করুন" : "শোকেস আইটেম যোগ করুন"}
        </button>
        {editingItem && (
          <button type="button" onClick={() => setEditingItem(null)} className="w-full py-4 bg-slate-200 text-slate-900 rounded-2xl font-bold">বাতিল করুন</button>
        )}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showcaseItems.map((item: any) => (
          <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative group">
            <div className="absolute top-6 right-6 flex gap-2">
              <button 
                onClick={() => setEditingItem(item)}
                className="p-2 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-100 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setItemToDelete(item.id)}
                className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h4 className="font-bold text-slate-900">{item.title}</h4>
            <p className="text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureManager() {
  const { addToast } = useToast();
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingFeature, setEditingFeature] = useState<any>(null);
  const [featureToDelete, setFeatureToDelete] = useState<string | null>(null);

  const fetchFeatures = async () => {
    const res = await fetch("/api/features");
    const data = await res.json();
    if (Array.isArray(data)) setFeatures(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleAddFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    data.is_active = formData.get("is_active") ? 1 : 0;
    
    try {
      if (editingFeature) {
        await fetch(`/api/admin/features/${editingFeature.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        addToast("বৈশিষ্ট্য আপডেট করা হয়েছে", "success");
      } else {
        await fetch("/api/admin/features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        addToast("নতুন বৈশিষ্ট্য যোগ করা হয়েছে", "success");
      }
      setEditingFeature(null);
      (e.target as HTMLFormElement).reset();
      fetchFeatures();
    } catch (error) {
      addToast("অপারেশন ব্যর্থ হয়েছে", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDeleteFeature = async () => {
    if (!featureToDelete) return;
    try {
      await fetch(`/api/admin/features/${featureToDelete}`, { method: "DELETE" });
      setFeatureToDelete(null);
      addToast("বৈশিষ্ট্য ডিলিট করা হয়েছে", "success");
      fetchFeatures();
    } catch (error) {
      addToast("ডিলিট করতে সমস্যা হয়েছে", "error");
    }
  };

  const icons = ["BookOpen", "Users", "ShieldCheck", "Heart", "Star", "Award", "Lightbulb", "Globe", "Clock", "Calendar", "GraduationCap"];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
      <h2 className="text-2xl font-black text-slate-900">বৈশিষ্ট্য (Features) ম্যানেজমেন্ট</h2>
      
      <ConfirmModal 
        isOpen={!!featureToDelete} 
        message="আপনি কি নিশ্চিত যে আপনি এই বৈশিষ্ট্যটি মুছে ফেলতে চান?" 
        onConfirm={executeDeleteFeature} 
        onCancel={() => setFeatureToDelete(null)} 
      />
      
      <form onSubmit={handleAddFeature} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-800">{editingFeature ? "বৈশিষ্ট্য এডিট করুন" : "নতুন বৈশিষ্ট্য যোগ করুন"}</h3>
          {editingFeature && (
            <button type="button" onClick={() => setEditingFeature(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800">
              বাতিল করুন
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">শিরোনাম</label>
            <input name="title" defaultValue={editingFeature?.title || ""} required className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="যেমন: অভিজ্ঞ শিক্ষক" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">আইকন নির্বাচন করুন</label>
            <select name="icon" defaultValue={editingFeature?.icon || "Star"} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold">
              {icons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">বর্ণনা</label>
            <textarea name="description" defaultValue={editingFeature?.description || ""} required className="w-full p-4 bg-slate-50 border rounded-2xl h-24 font-medium" placeholder="বিস্তারিত লিখুন..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">ইমেজ ইউআরএল (অপশনাল)</label>
            <input name="image_url" defaultValue={editingFeature?.image_url || ""} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" placeholder="https://example.com/image.jpg" />
            <p className="text-xs text-slate-400 font-bold mt-1">ইমেজ দিলে আইকন দেখানো হবে না।</p>
          </div>
          <div className="space-y-2 md:col-span-2 flex items-center gap-3">
            <input 
              type="checkbox" 
              name="is_active" 
              defaultChecked={editingFeature ? editingFeature.is_active !== 0 : true}
              className="w-5 h-5 accent-emerald-600"
              value="1"
            />
            <label className="text-sm font-bold text-slate-700">সক্রিয় (Active)</label>
          </div>
        </div>
        <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-black hover:bg-emerald-800 transition-all disabled:opacity-50">
          {submitting ? "লোড হচ্ছে..." : editingFeature ? "বৈশিষ্ট্য আপডেট করুন" : "বৈশিষ্ট্য যোগ করুন"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature: any) => (
          <div key={feature.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
            <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-100 transition-all">
              <button 
                onClick={() => setEditingFeature(feature)}
                className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setFeatureToDelete(feature.id)}
                className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {feature.image_url ? (
              <img src={feature.image_url} className="w-full h-40 object-cover rounded-2xl mb-4" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 border border-emerald-100">
                <Star className="w-8 h-8" />
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            {feature.icon && !feature.image_url && (
              <p className="text-xs text-slate-400 font-bold mt-4 uppercase tracking-wider">Icon: {feature.icon}</p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AdmissionManager({ onApprove }: { onApprove: () => void }) {
  const { addToast } = useToast();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch("/api/admin/admissions");
      const data = await res.json();
      setAdmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch admissions", error);
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    const res = await fetch("/api/admin/approve-admission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action })
    });
    const data = await res.json();
    if (data.success) {
      addToast(action === 'approve' ? "আবেদন অনুমোদিত হয়েছে" : "আবেদন বাতিল করা হয়েছে", "success");
      fetchAdmissions();
      if (action === 'approve') onApprove();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
      <h3 className="text-2xl font-bold text-slate-900 mb-8">ভর্তি আবেদনসমূহ</h3>
      <div className="space-y-4">
        {admissions.length > 0 ? admissions.map((a) => (
          <div key={a.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-slate-900">{a.name} {a.name_en && <span className="text-slate-400 font-normal ml-2">({a.name_en})</span>}</p>
              <p className="text-sm text-slate-500">{a.class} শ্রেণী | ফোন: {a.phone}</p>
              <p className="text-xs text-slate-400 mt-1">পিতা: {a.father_name} {a.father_name_en && `(${a.father_name_en})`} | মাতা: {a.mother_name} {a.mother_name_en && `(${a.mother_name_en})`}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction(a.id, 'approve')}
                className="px-6 py-2 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                >
                  অনুমোদন করুন
                </button>
                <button 
                  onClick={() => handleAction(a.id, 'reject')}
                  className="px-6 py-2 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all"
                >
                  বাতিল করুন
                </button>
              </div>
            </div>
          )) : <p className="text-slate-500 font-bold text-center py-8">কোন আবেদন নেই</p>}
        </div>
      </div>
    );
  }

function ClassManagerModal({ isOpen, onClose, classes, fetchClasses }: any) {
  const { addToast } = useToast();
  const [newClassName, setNewClassName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !password) return addToast("ক্লাসের নাম এবং পাসওয়ার্ড দিন", "error");
    setLoading(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClassName, order: classes.length, password })
      });
      if (res.ok) {
        addToast("ক্লাস যুক্ত করা হয়েছে", "success");
        setNewClassName("");
        setPassword("");
        fetchClasses();
      } else {
        const err = await res.json();
        addToast(err.error || "সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClass = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        addToast("ক্লাসের স্ট্যাটাস আপডেট করা হয়েছে", "success");
        fetchClasses();
      } else {
        const err = await res.json();
        addToast(err.error || "সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    }
  };

  const handleEditClass = async (id: string, currentName: string) => {
    const newName = prompt("নতুন ক্লাসের নাম দিন:", currentName);
    if (!newName || newName === currentName) return;
    
    const pwd = prompt("ক্লাসটি এডিট করতে পাসওয়ার্ড দিন:");
    if (!pwd) return;

    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, password: pwd })
      });
      if (res.ok) {
        addToast("ক্লাস এডিট করা হয়েছে। সংশ্লিষ্ট সব ডেটা আপডেট হচ্ছে।", "success");
        fetchClasses();
      } else {
        const err = await res.json();
        addToast(err.error || "সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    }
  };

  const handleDeleteClass = async (id: string) => {
    const pwd = prompt("ক্লাসটি ডিলিট করতে পাসওয়ার্ড দিন:");
    if (!pwd) return;
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        addToast("ক্লাস ডিলিট করা হয়েছে", "success");
        fetchClasses();
      } else {
        const err = await res.json();
        addToast(err.error || "সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900">ক্লাস সমূহ</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><CloseIcon className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={handleAddClass} className="mb-8 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-700">নতুন ক্লাস যুক্ত করুন</h4>
          <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="ক্লাসের নাম (যেমন: ১ম)" className="w-full p-3 border rounded-xl" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="এডমিন পাসওয়ার্ড" className="w-full p-3 border rounded-xl" />
          <LoadingButton loading={loading} type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700">
            <Plus className="w-5 h-5 inline mr-2" /> যুক্ত করুন
          </LoadingButton>
        </form>

        <div className="space-y-2">
          {classes.map((c: any) => (
            <div key={c.id} className="flex justify-between items-center p-4 bg-white border rounded-xl">
              <span className="font-bold text-slate-800">{c.name}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={c.is_active} 
                    onChange={() => handleToggleClass(c.id, c.is_active)} 
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className={`text-sm font-medium ${c.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {c.is_active ? 'সক্রিয়' : 'হাইড'}
                  </span>
                </label>
                <button onClick={() => handleEditClass(c.id, c.name)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit className="w-5 h-5" /></button>
                <button onClick={() => handleDeleteClass(c.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
          {classes.length === 0 && <p className="text-center text-slate-500 py-4">কোনো ক্লাস নেই</p>}
        </div>
      </motion.div>
    </div>
  );
}

function SubAdminManagerModal({ isOpen, onClose }: any) {
  const { addToast } = useToast();
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availablePermissions = [
    { id: "admission", label: "ভর্তি আবেদন ও ছাত্র তালিকা" },
    { id: "fee_collection", label: "বেতন ও ফি আদায়" },
    { id: "student_attendance", label: "ছাত্র হাজিরা" },
    { id: "teacher_attendance", label: "শিক্ষক হাজিরা" },
    { id: "result", label: "রেজাল্ট" },
    { id: "notice", label: "নোটিশ" }
  ];

  const fetchSubAdmins = async () => {
    try {
      const res = await fetch("/api/sub-admins");
      if (res.ok) setSubAdmins(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSubAdmins();
  }, [isOpen]);

  const handleTogglePermission = (id: string) => {
    setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleAddSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !password) return addToast("ইমেইল এবং পাসওয়ার্ড দিন", "error");
    setLoading(true);
    try {
      const res = await fetch("/api/sub-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, permissions, password })
      });
      if (res.ok) {
        addToast("সাব-এডমিন যুক্ত করা হয়েছে", "success");
        setNewEmail("");
        setPassword("");
        setPermissions([]);
        fetchSubAdmins();
      } else {
        const err = await res.json();
        addToast(err.error || "সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubAdmin = async (id: string) => {
    const pwd = prompt("সাব-এডমিন ডিলিট করতে পাসওয়ার্ড দিন:");
    if (!pwd) return;
    try {
      const res = await fetch(`/api/sub-admins/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        addToast("সাব-এডমিন ডিলিট করা হয়েছে", "success");
        fetchSubAdmins();
      } else {
        const err = await res.json();
        addToast(err.error || "সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-slate-900">সাব-এডমিন ম্যানেজমেন্ট</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><CloseIcon className="w-6 h-6" /></button>
        </div>
        
        <form onSubmit={handleAddSubAdmin} className="mb-8 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="font-bold text-slate-700">নতুন সাব-এডমিন যুক্ত করুন</h4>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="জিমেইল এড্রেস" className="w-full p-3 border rounded-xl" />
          
          <div className="space-y-2">
            <label className="font-bold text-sm text-slate-600">পারমিশন সিলেক্ট করুন:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availablePermissions.map(p => (
                <label key={p.id} className="flex items-center gap-2 p-3 bg-white border rounded-xl cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={permissions.includes(p.id)} onChange={() => handleTogglePermission(p.id)} className="w-4 h-4 text-emerald-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="মেইন এডমিন পাসওয়ার্ড" className="w-full p-3 border rounded-xl" />
          
          <LoadingButton loading={loading} type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
            <Plus className="w-5 h-5 inline mr-2" /> যুক্ত করুন
          </LoadingButton>
        </form>

        <div className="space-y-3">
          <h4 className="font-bold text-slate-700">বর্তমান সাব-এডমিনগণ</h4>
          {subAdmins.map((admin: any) => (
            <div key={admin.id} className="p-4 bg-white border rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-800">{admin.email}</span>
                <button onClick={() => handleDeleteSubAdmin(admin.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {admin.permissions.map((p: string) => (
                  <span key={p} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md font-medium">
                    {availablePermissions.find(ap => ap.id === p)?.label || p}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {subAdmins.length === 0 && <p className="text-center text-slate-500 py-4">কোনো সাব-এডমিন নেই</p>}
        </div>
      </motion.div>
    </div>
  );
}

function SettingsManager({ settings, setSettings, onUpdate, classes, fetchClasses }: any) {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubAdminModal, setShowSubAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const handleAdvancedSettingsClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "1234";
    if (passwordInput.trim() === adminPassword || passwordInput.trim() === "১২৩৪") {
      setShowAdvancedSettings(true);
      setShowPasswordModal(false);
      setPasswordInput("");
    } else {
      addToast("ভুল পাসওয়ার্ড", "error");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        addToast("সেটিংস সফলভাবে সেভ হয়েছে", "success");
        onUpdate();
      }
    } catch (error) {
      console.error(error);
      addToast("সেটিংস সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-2xl font-bold text-slate-900">ওয়েবসাইট সেটিংস</h3>
        <div className="flex gap-3">
          <button type="button" onClick={() => setShowClassModal(true)} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <BookOpen className="w-5 h-5" /> ক্লাস ম্যানেজমেন্ট
          </button>
          <button type="button" onClick={() => setShowSubAdminModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-200 transition-all">
            <Users className="w-5 h-5" /> সাব-এডমিন
          </button>
          <button type="button" onClick={() => (window as any).setActiveTab("routines")} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-all">
            <FileText className="w-5 h-5" /> সিলেবাস ও রুটিন
          </button>
          <button type="button" onClick={() => (window as any).setActiveTab("amal")} className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-all">
            <Target className="w-5 h-5" /> দৈনিক আমল
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">প্রতিষ্ঠানের নাম</label>
            <input value={settings.title || ""} onChange={(e) => setSettings({...settings, title: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">ঠিকানা</label>
            <textarea value={settings.address || ""} onChange={(e) => setSettings({...settings, address: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">অ্যাডমিন পাসওয়ার্ড (Admin Password)</label>
            <input 
              type="password"
              value={settings.admin_password || ""} 
              onChange={(e) => setSettings({...settings, admin_password: e.target.value})} 
              className="w-full p-4 bg-slate-50 border rounded-2xl" 
              placeholder="পাসওয়ার্ড পরিবর্তন করুন"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">বিকাশ নম্বর</label>
            <input value={settings.bkash_number || ""} onChange={(e) => setSettings({...settings, bkash_number: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">নগদ নম্বর</label>
            <input value={settings.nagad_number || ""} onChange={(e) => setSettings({...settings, nagad_number: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">রকেট নম্বর</label>
            <input value={settings.rocket_number || ""} onChange={(e) => setSettings({...settings, rocket_number: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">বিকাশ পেমেন্ট চালু করুন</label>
            <input type="checkbox" checked={!!settings.enable_bkash} onChange={(e) => setSettings({...settings, enable_bkash: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">নগদ পেমেন্ট চালু করুন</label>
            <input type="checkbox" checked={!!settings.enable_nagad} onChange={(e) => setSettings({...settings, enable_nagad: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">রকেট পেমেন্ট চালু করুন</label>
            <input type="checkbox" checked={!!settings.enable_rocket} onChange={(e) => setSettings({...settings, enable_rocket: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">শিক্ষক নিয়োগ চালু করুন</label>
            <input type="checkbox" checked={!!settings.enable_recruitment} onChange={(e) => setSettings({...settings, enable_recruitment: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">বৈশিষ্ট্য (Features) সরাসরি হোমপেজে দেখান</label>
            <input type="checkbox" checked={!!settings.show_features_directly} onChange={(e) => setSettings({...settings, show_features_directly: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">খাবার মেনু সরাসরি হোমপেজে দেখান</label>
            <input type="checkbox" checked={!!settings.show_food_directly} onChange={(e) => setSettings({...settings, show_food_directly: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">একাডেমিক শোকেস সরাসরি হোমপেজে দেখান</label>
            <input type="checkbox" checked={!!settings.show_showcase_directly} onChange={(e) => setSettings({...settings, show_showcase_directly: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">সিলেবাস ও রুটিন সরাসরি হোমপেজে দেখান</label>
            <input type="checkbox" checked={!!settings.show_routines_directly} onChange={(e) => setSettings({...settings, show_routines_directly: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">লোগোর নিচে নিয়ন লাইট চালু করুন</label>
            <input type="checkbox" checked={!!settings.enable_neon_light} onChange={(e) => setSettings({...settings, enable_neon_light: e.target.checked ? 1 : 0})} className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">নিয়ন লাইটের রঙ (যেমন: #00ff00)</label>
            <input value={settings.neon_light_color || "#00ff00"} onChange={(e) => setSettings({...settings, neon_light_color: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">নিয়ন লাইটের ইফেক্ট</label>
            <select value={settings.neon_light_effect || "pulse"} onChange={(e) => setSettings({...settings, neon_light_effect: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold">
              <option value="rotate">ঘুরবে (Rotate)</option>
              <option value="pulse">জ্বলবে-নিভবে (Pulse)</option>
              <option value="glow">গ্লো (Glow)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">লোগো ইউআরএল (PNG)</label>
            <input value={settings.logo_url || ""} onChange={(e) => setSettings({...settings, logo_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="https://example.com/logo.png" />
          </div>
          <div className="space-y-2 flex items-center gap-3">
            <input type="checkbox" id="auto_whatsapp" checked={!!settings.auto_whatsapp} onChange={(e) => setSettings({...settings, auto_whatsapp: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded text-emerald-600 focus:ring-emerald-500" />
            <label htmlFor="auto_whatsapp" className="text-sm font-bold text-slate-700">অটোমেটিক হোয়াটসঅ্যাপে রশিদ পাঠানো চালু করুন</label>
          </div>
          <div className="space-y-2 flex items-center gap-3">
            <input type="checkbox" id="enable_qr_code" checked={!!settings.enable_qr_code} onChange={(e) => setSettings({...settings, enable_qr_code: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded text-emerald-600 focus:ring-emerald-500" />
            <label htmlFor="enable_qr_code" className="text-sm font-bold text-slate-700">রশিদ ও মার্কশিটে কিউআর কোড (QR Code) দেখান</label>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">কিউআর কোড ইউআরএল (QR Code URL)</label>
            <input value={settings.qr_code_url || ""} onChange={(e) => setSettings({...settings, qr_code_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="https://example.com/qr.png" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">ঘোষণা (Announcement)</label>
            <input value={settings.announcement || ""} onChange={(e) => setSettings({...settings, announcement: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">প্রতিষ্ঠানের বর্ণনা</label>
            <textarea value={settings.description || ""} onChange={(e) => setSettings({...settings, description: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl h-24" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">ভর্তির নিয়মাবলী (প্রতিটি নিয়ম নতুন লাইনে লিখুন)</label>
            <textarea value={settings.admission_rules || ""} onChange={(e) => setSettings({...settings, admission_rules: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl h-32" placeholder="১. আবেদন ফর্মে প্রদত্ত সকল তথ্য অবশ্যই সঠিক হতে হবে।&#10;২. ছাত্রের পাসপোর্ট সাইজের ছবি আপলোড করতে হবে।" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">একাডেমিক শোকেস (JSON Format)</label>
            <textarea value={settings.showcase_content || ""} onChange={(e) => setSettings({...settings, showcase_content: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl h-32 font-mono text-xs" placeholder='[{"type": "video", "url": "https://www.youtube.com/watch?v=...", "title": "ভিডিও টাইটেল", "description": "ভিডিও বর্ণনা"}]' />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-700">হিরো ইমেজ (URL)</label>
            <input value={settings.hero_image || ""} onChange={(e) => setSettings({...settings, hero_image: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">যোগাযোগ ফোন</label>
            <input value={settings.contact_phone || ""} onChange={(e) => setSettings({...settings, contact_phone: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">হোয়াটসঅ্যাপ নম্বর</label>
            <input value={settings.whatsapp_number || ""} onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">ফেসবুক পেজ লিঙ্ক</label>
            <input value={settings.facebook_url || ""} onChange={(e) => setSettings({...settings, facebook_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">ইউটিউব চ্যানেল লিঙ্ক</label>
            <input value={settings.youtube_url || ""} onChange={(e) => setSettings({...settings, youtube_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">মুহতামিম সাহেবের স্বাক্ষর (PNG URL)</label>
            <input value={settings.muhtamim_signature_url || ""} onChange={(e) => setSettings({...settings, muhtamim_signature_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="https://example.com/signature.png" />
          </div>
          <div className="space-y-2 flex items-center gap-3">
            <input type="checkbox" id="show_signature" checked={!!settings.show_muhtamim_signature} onChange={(e) => setSettings({...settings, show_muhtamim_signature: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded text-emerald-600 focus:ring-emerald-500" />
            <label htmlFor="show_signature" className="text-sm font-bold text-slate-700">রশিদে মুহতামিম সাহেবের স্বাক্ষর দেখান</label>
          </div>
          <div className="space-y-2 flex items-center gap-3">
            <input type="checkbox" id="enable_historical_reports" checked={!!settings.enable_historical_reports} onChange={(e) => setSettings({...settings, enable_historical_reports: e.target.checked ? 1 : 0})} className="w-6 h-6 rounded text-emerald-600 focus:ring-emerald-500" />
            <label htmlFor="enable_historical_reports" className="text-sm font-bold text-slate-700">অভিভাবকদের জন্য পুরাতন রেজাল্ট দেখার অনুমতি দিন</label>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <button type="button" onClick={handleAdvancedSettingsClick} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">
            Advanced Settings (Firebase & Payment)
          </button>
          
          {showAdvancedSettings && (
            <div className="mt-8 space-y-8">
              <div className="border-t border-slate-100 pt-8">
                <h4 className="text-lg font-black text-slate-900 mb-4">ফায়ারবেস (Firebase) অটো-সিঙ্ক সেটিংস</h4>
                <p className="text-sm text-slate-500 mb-4 font-bold">
                  আপনার ডাটাবেসটি ফায়ারবেস (Firestore)-এ অটোমেটিক সেভ করার জন্য আপনার ফায়ারবেস প্রজেক্টের Service Account JSON ফাইলের ভেতরের সব লেখা কপি করে নিচের বক্সে পেস্ট করুন।
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Firebase Service Account JSON</label>
                  <textarea 
                    value={settings.firebase_service_account} 
                    onChange={(e) => setSettings({...settings, firebase_service_account: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border rounded-2xl h-48 font-mono text-xs" 
                    placeholder='{"type": "service_account", "project_id": "...", ...}' 
                  />
                </div>
              </div>
              <div className="border-t border-slate-100 pt-8">
                <h4 className="text-lg font-black text-slate-900 mb-4">ম্যানুয়াল পেমেন্ট নম্বর (Manual Payment)</h4>
                <p className="text-sm text-slate-500 mb-4 font-bold">
                  আপনার পার্সোনাল বিকাশ, নগদ এবং রকেট নম্বর দিন যেখানে অভিভাবকরা টাকা পাঠাবে।
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">বিকাশ নম্বর (Personal)</label>
                    <input 
                      value={settings.bkash_number || ""} 
                      onChange={(e) => setSettings({...settings, bkash_number: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl" 
                      placeholder="01XXXXXXXXX" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">নগদ নম্বর (Personal)</label>
                    <input 
                      value={settings.nagad_number || ""} 
                      onChange={(e) => setSettings({...settings, nagad_number: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl" 
                      placeholder="01XXXXXXXXX" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">রকেট নম্বর (Personal)</label>
                    <input 
                      value={settings.rocket_number || ""} 
                      onChange={(e) => setSettings({...settings, rocket_number: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl" 
                      placeholder="01XXXXXXXXX" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">বিকাশ পেমেন্ট নিয়মাবলী</label>
                    <textarea 
                      value={settings.bkash_instructions || ""} 
                      onChange={(e) => setSettings({...settings, bkash_instructions: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl h-32" 
                      placeholder="কিভাবে পেমেন্ট করবে তার নিয়ম..." 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">নগদ পেমেন্ট নিয়মাবলী</label>
                    <textarea 
                      value={settings.nagad_instructions || ""} 
                      onChange={(e) => setSettings({...settings, nagad_instructions: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl h-32" 
                      placeholder="কিভাবে পেমেন্ট করবে তার নিয়ম..." 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">রকেট পেমেন্ট নিয়মাবলী</label>
                    <textarea 
                      value={settings.rocket_instructions || ""} 
                      onChange={(e) => setSettings({...settings, rocket_instructions: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl h-32" 
                      placeholder="কিভাবে পেমেন্ট করবে তার নিয়ম..." 
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <label className="text-sm font-bold text-slate-700">বিশেষ দ্রষ্টব্য (পেমেন্ট পেজের নিচে দেখাবে)</label>
                  <textarea 
                    value={settings.payment_special_note || ""} 
                    onChange={(e) => setSettings({...settings, payment_special_note: e.target.value})} 
                    className="w-full p-4 bg-slate-50 border rounded-2xl h-24" 
                    placeholder="বিশেষ দ্রষ্টব্য..." 
                  />
                </div>
                <div className="mt-6 border-t border-slate-100 pt-8">
                  <h4 className="text-lg font-black text-slate-900 mb-4">মুহতামিম সাহেবের স্বাক্ষর</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <input type="checkbox" checked={!!settings.enable_signature} onChange={(e) => setSettings({...settings, enable_signature: e.target.checked ? 1 : 0})} className="w-6 h-6" />
                    <label className="text-sm font-bold text-slate-700">স্বাক্ষর চালু করুন</label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">স্বাক্ষরের ছবি (PNG URL)</label>
                    <input 
                      value={settings.signature_url || ""} 
                      onChange={(e) => setSettings({...settings, signature_url: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border rounded-2xl" 
                      placeholder="https://example.com/signature.png" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-8 mt-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">ক্যাটাগরি ম্যানেজমেন্ট</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CategoryManager type="income" />
            <CategoryManager type="expense" />
          </div>
        </div>

        <LoadingButton loading={saving} onClick={() => handleSubmit()} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold">
          <Save className="w-5 h-5" /> সেটিংস সেভ করুন
        </LoadingButton>
      </div>

      {/* Password Modal for Advanced Settings */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
              <h3 className="text-xl font-black text-slate-900 mb-4">পাসওয়ার্ড দিন</h3>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-4 bg-slate-50 border rounded-2xl mb-6"
                placeholder="পাসওয়ার্ড"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              <div className="flex gap-4">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">বাতিল</button>
                <button onClick={handlePasswordSubmit} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">নিশ্চিত করুন</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ClassManagerModal 
        isOpen={showClassModal} 
        onClose={() => setShowClassModal(false)} 
        classes={classes} 
        fetchClasses={fetchClasses} 
      />
      
      <SubAdminManagerModal 
        isOpen={showSubAdminModal} 
        onClose={() => setShowSubAdminModal(false)} 
      />
    </div>
  );
}

// Shared Utilities
const downloadPDF = async (elementId: string, fileName: string, addToast: any, size: 'a4' | 'a5' = 'a4') => {
  const element = document.getElementById(elementId);
  if (!element) {
    addToast("এলিমেন্ট পাওয়া যায়নি।", "error");
    return;
  }
  
  const originalClass = element.className;
  const originalStyle = element.getAttribute('style') || '';
  
  element.className = originalClass
    .replace('hidden', 'block')
    .replace('absolute', 'relative')
    .replace('top-0', '')
    .replace('left-0', '');
  
  element.style.width = '800px';
  element.style.position = 'relative';
  element.style.backgroundColor = '#ffffff';
  element.style.padding = '40px';
  
  try {
    const data = await toPng(element, { 
      pixelRatio: 2, 
      backgroundColor: '#ffffff',
      width: 800
    });
    
    const pdf = new jsPDF('p', 'mm', size);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add margins (10mm)
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    
    // Get image dimensions to calculate height
    const img = new Image();
    img.src = data;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    const imgHeight = (img.height * contentWidth) / img.width;
    
    pdf.addImage(data, 'PNG', margin, margin, contentWidth, imgHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error("PDF generation error:", error);
    addToast("PDF জেনারেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।", "error");
  } finally {
    element.className = originalClass;
    element.setAttribute('style', originalStyle);
  }
};

const sendEmailWithPDF = async (elementId: string, student: any, transactionId: string, total: number, addToast: any) => {
  let targetEmail = student.email || "";
  if (!targetEmail) {
    targetEmail = window.prompt("ছাত্রের ইমেইল অ্যাড্রেস নেই! দয়া করে ইমেইল অ্যাড্রেসটি দিন:", "");
    if (!targetEmail) return;
  }

  const element = document.getElementById(elementId);
  if (!element) return;

  const originalClass = element.className;
  const originalStyle = element.getAttribute('style') || '';
  
  element.className = originalClass.replace('hidden', 'block');
  element.style.width = '800px';
  element.style.padding = '40px';

  try {
    const data = await toPng(element, { pixelRatio: 2, backgroundColor: '#ffffff', width: 800 });
    const pdf = new jsPDF('p', 'mm', 'a5');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const img = new Image();
    img.src = data;
    await new Promise((resolve) => { img.onload = resolve; });
    const imgHeight = (img.height * contentWidth) / img.width;
    pdf.addImage(data, 'PNG', margin, margin, contentWidth, imgHeight);
    
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    const filename = `Receipt_${student.id}_${transactionId}.pdf`;

    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: targetEmail,
        subject: "পেমেন্ট রশিদ - আল-হেরা মাদ্রাসা",
        text: `আসসালামু আলাইকুম। আপনার পেমেন্ট সফল হয়েছে। রশিদ নং: ${transactionId}, মোট পরিমাণ: ৳${total}। রশিদটি সংযুক্ত করা হলো।`,
        attachments: [{ filename, content: pdfBase64, encoding: 'base64' }]
      })
    });

    if (response.ok) {
      addToast("ইমেইল সফলভাবে পাঠানো হয়েছে!", "success");
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "ইমেইল পাঠাতে সমস্যা হয়েছে!");
    }
  } catch (error) {
    console.error("Email error:", error);
    addToast("ইমেইল পাঠাতে সমস্যা হয়েছে! দয়া করে সেটিংস চেক করুন।", "error");
    
    // Fallback to mailto
    const subject = encodeURIComponent("পেমেন্ট রশিদ - আল-হেরা মাদ্রাসা");
    const body = encodeURIComponent(`আসসালামু আলাইকুম। আপনার পেমেন্ট সফল হয়েছে। রশিদ নং: ${transactionId}, মোট পরিমাণ: ৳${total}।`);
    window.open(`mailto:${targetEmail}?subject=${subject}&body=${body}`, '_blank');
  } finally {
    element.className = originalClass;
    element.setAttribute('style', originalStyle);
  }
};

const printElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.remove('hidden', 'absolute', 'top-0', 'left-0');
  clone.style.width = '100%';
  clone.style.margin = '0';
  clone.style.padding = '0';
  clone.style.position = 'relative';
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Hind Siliguri', sans-serif; background: white; margin: 0; padding: 0; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            @media print { 
              .no-print { display: none !important; } 
              @page { margin: 0; size: auto; }
              body { padding: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="w-full max-w-4xl mx-auto">${clone.outerHTML}</div>
          <script>
            // Wait for Tailwind and images to load
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            };
            // Fallback if onload doesn't fire
            setTimeout(() => {
              if (!window.closed) {
                window.print();
                window.close();
              }
            }, 3000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
};

function StudentManager({ settings, onUpdate, classesList, setActiveTab }: { settings: any, onUpdate: () => void, classesList: string[], setActiveTab: (tab: string) => void }) {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  
  // Fee Management State
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedUnpaidFees, setSelectedUnpaidFees] = useState<number[]>([]);
  const [feeAmountAdjust, setFeeAmountAdjust] = useState<{[key: number]: number}>({});
  const [generatingFees, setGeneratingFees] = useState(false);
  const [selectedResultExam, setSelectedResultExam] = useState<string>("");
  const [students, setStudents] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (newOffset: number = 0) => {
    setLoading(true);
    const res = await fetch(`/api/students?limit=50&offset=${newOffset}`);
    const data = await res.json();
    if (newOffset === 0) {
      setStudents(data);
    } else {
      setStudents(prev => [...prev, ...data]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const classes = ["All", ...classesList];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const fetchFullProfile = async (studentId: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/students/${studentId}/full-profile`);
      const data = await res.json();
      
      // Ensure arrays exist to prevent undefined errors
      const safeData = {
        ...data,
        fees: data.fees || [],
        transactions: data.transactions || [],
        results: data.results || [],
        attendance: data.attendance || [],
        examStats: data.examStats || {}
      };
      
      setFullProfile(safeData);
      
      // Set default selected exam to the latest one
      if (safeData.results && safeData.results.length > 0) {
        const exams = [...new Set(safeData.results.map((r: any) => r.exam_name))];
        setSelectedResultExam(exams[exams.length - 1] as string);
      }
    } catch (error) {
      console.error("Failed to fetch full profile", error);
      setFullProfile({ fees: [], transactions: [], results: [], attendance: [], examStats: {} });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleGenerateFees = async () => {
    if (!fullProfile) return;
    setGeneratingFees(true);
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const currentYear = new Date().getFullYear();
    const monthlyFee = fullProfile.student.monthly_fee || 0;

    try {
      for (let i = 0; i < months.length; i++) {
        const monthName = months[i];
        const category = `মাসিক বেতন - ${monthName} ${currentYear}`;
        
        const exists = fullProfile.fees.some((f: any) => f.category === category);
        if (!exists) {
          await fetch("/api/admin/fees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              student_id: fullProfile.student.id, 
              category, 
              amount: monthlyFee, 
              due_date: `${currentYear}-${String(i+1).padStart(2, '0')}-10` 
            })
          });
        }
      }
      await fetchFullProfile(fullProfile.student.id);
      addToast("চলতি বছরের সকল মাসের বেতন জেনারেট করা হয়েছে।", "info");
    } catch (error) {
      console.error(error);
      addToast("বেতন জেনারেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setGeneratingFees(false);
    }
  };

  const handleBulkPayProfile = async () => {
    if (selectedUnpaidFees.length === 0) return;
    
    try {
      const feesToPay = fullProfile.fees.filter((f: any) => selectedUnpaidFees.includes(f.id));
      const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      let totalAmount = 0;
      for (const fee of feesToPay) {
        const amount = feeAmountAdjust[fee.id] !== undefined ? feeAmountAdjust[fee.id] : fee.amount;
        totalAmount += amount;
        
        await fetch(`/api/admin/fees/${fee.id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: 'paid', amount: amount })
        });

        await fetch("/api/admin/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: fullProfile.student.id,
            fee_id: fee.id,
            amount: amount,
            transaction_id: transactionId,
            date: new Date().toISOString()
          })
        });
      }

      addToast("পেমেন্ট সফল হয়েছে!", "success");
      
      if (settings.auto_whatsapp && fullProfile.student.whatsapp) {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(6, 78, 59);
        doc.text(settings.title || "Al Hera Madrasa", 105, 20, { align: "center" });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("Payment Receipt", 105, 30, { align: "center" });
        
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text(`Receipt No: ${transactionId}`, 14, 45);
        doc.text(`Date: ${new Date().toLocaleDateString('bn-BD')}`, 14, 52);
        
        doc.text(`Student Name: ${fullProfile.student.name}`, 14, 65);
        doc.text(`Student ID: ${fullProfile.student.studentId || fullProfile.student.id}`, 14, 72);
        doc.text(`Class: ${fullProfile.student.class} | Roll: ${fullProfile.student.roll}`, 14, 79);
        
        const tableData = feesToPay.map((f: any) => [
          f.category,
          `BDT ${feeAmountAdjust[f.id] !== undefined ? feeAmountAdjust[f.id] : f.amount}`,
          "PAID",
          transactionId
        ]);

        (doc as any).autoTable({
          startY: 90,
          head: [["Category", "Amount", "Status", "Transaction ID"]],
          body: tableData,
          theme: "striped",
          headStyles: { fillColor: [6, 78, 59] }
        });

        const finalY = (doc as any).lastAutoTable.finalY + 20;
        doc.text("Total Paid:", 140, finalY);
        doc.setFontSize(16);
        doc.text(`BDT ${totalAmount}.00`, 170, finalY);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

        doc.save(`Receipt_${fullProfile.student.id}_${transactionId}.pdf`);

        const message = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\nরশিদ নং: ${transactionId}\nমোট পরিমাণ: ৳${totalAmount}\n\nরশিদের পিডিএফ ফাইলটি ডাউনলোড হয়েছে, দয়া করে সেটি এখানে সংযুক্ত করুন।`;
        const waUrl = `https://wa.me/${fullProfile.student.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }

      setSelectedUnpaidFees([]);
      setFeeAmountAdjust({});
      setShowFeeModal(false);
      fetchFullProfile(fullProfile.student.id);
      
    } catch (error) {
      console.error(error);
      addToast("পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleViewProfile = (student: any) => {
    setSelectedStudent(student);
    fetchFullProfile(student.id);
  };

  const compressAndUploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Return Base64 string directly
          const base64String = canvas.toDataURL("image/jpeg", 0.7);
          resolve(base64String);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    try {
      // Handle Hifz class logic
      if (data.className?.includes("হিফজ") || data.className?.includes("হেফজ")) {
        data.is_hifz = 1;
      } else {
        data.is_hifz = 0;
      }

      const res = await fetch(`/api/admin/students/${selectedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        addToast("ছাত্রের তথ্য আপডেট করা হয়েছে", "success");
        setIsEditing(false);
        onUpdate();
        fetchFullProfile(selectedStudent.id);
      } else {
        addToast("আপডেট করা সম্ভব হয়নি: " + (result.error || "অজানা সমস্যা"), "error");
      }
    } catch (error) {
      addToast("আপডেট করা সম্ভব হয়নি। নেটওয়ার্ক সমস্যা হতে পারে।", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    try {
      // Handle Hifz class logic
      if (data.className?.includes("হিফজ") || data.className?.includes("হেফজ")) {
        data.is_hifz = 1;
      } else {
        data.is_hifz = 0;
      }

      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        addToast("নতুন ছাত্র সফলভাবে যুক্ত করা হয়েছে", "success");
        setIsAdding(false);
        setOffset(0);
        fetchStudents(0);
        onUpdate();
      } else {
        addToast("ভর্তি করা সম্ভব হয়নি: " + (result.error || "অজানা সমস্যা"), "error");
      }
    } catch (err) {
      addToast("ভর্তি করা সম্ভব হয়নি। নেটওয়ার্ক সমস্যা হতে পারে।", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900">{isAdding ? "নতুন ছাত্র যুক্ত করুন" : "ছাত্রের তথ্য এডিট করুন"}</h3>
                <button onClick={() => { setIsAdding(false); setIsEditing(false); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><CloseIcon className="w-6 h-6" /></button>
              </div>
              <form onSubmit={isAdding ? handleAddStudent : handleEditStudent} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">নাম (বাংলায়)</label>
                    <input name="name" required defaultValue={isEditing ? selectedStudent.name : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Name (English)</label>
                    <input name="name_en" defaultValue={isEditing ? selectedStudent.name_en : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">স্টুডেন্ট আইডি (ঐচ্ছিক)</label>
                    <input name="studentId" defaultValue={isEditing ? (selectedStudent.studentId || selectedStudent.id) : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="যেমন: AHM-1-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">শ্রেণী</label>
                    <select name="className" required defaultValue={isEditing ? selectedStudent.class : ""} className="w-full p-4 bg-slate-50 border rounded-2xl">
                      {classes.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">লিঙ্গ</label>
                    <select name="gender" defaultValue={isEditing ? selectedStudent.gender : "বালক"} className="w-full p-4 bg-slate-50 border rounded-2xl">
                      <option value="বালক">বালক</option>
                      <option value="বালিকা">বালিকা</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">জাতীয়তা</label>
                    <input name="nationality" defaultValue={isEditing ? selectedStudent.nationality : "বাংলাদেশী"} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ধর্ম</label>
                    <input name="religion" defaultValue={isEditing ? selectedStudent.religion : "ইসলাম"} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">পিতার নাম (বাংলায়)</label>
                    <input name="father_name" defaultValue={isEditing ? selectedStudent.father_name : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Father's Name (English)</label>
                    <input name="father_name_en" defaultValue={isEditing ? selectedStudent.father_name_en : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">পিতার পেশা</label>
                    <input name="father_occupation" defaultValue={isEditing ? selectedStudent.father_occupation : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">পিতার মাসিক আয়</label>
                    <input name="father_income" type="number" defaultValue={isEditing ? selectedStudent.father_income : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">পিতার এনআইডি নম্বর</label>
                    <input name="father_nid" defaultValue={isEditing ? selectedStudent.father_nid : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">মাতার নাম (বাংলায়)</label>
                    <input name="mother_name" defaultValue={isEditing ? selectedStudent.mother_name : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mother's Name (English)</label>
                    <input name="mother_name_en" defaultValue={isEditing ? selectedStudent.mother_name_en : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">মাতার পেশা</label>
                    <input name="mother_occupation" defaultValue={isEditing ? selectedStudent.mother_occupation : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">মাতার মাসিক আয়</label>
                    <input name="mother_income" type="number" defaultValue={isEditing ? selectedStudent.mother_income : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">মাতার এনআইডি নম্বর</label>
                    <input name="mother_nid" defaultValue={isEditing ? selectedStudent.mother_nid : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ফোন নম্বর</label>
                    <input name="phone" required defaultValue={isEditing ? selectedStudent.phone : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">হোয়াটসঅ্যাপ নম্বর</label>
                    <input name="whatsapp" defaultValue={isEditing ? selectedStudent.whatsapp : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ইমেইল এড্রেস</label>
                    <input name="email" type="email" defaultValue={isEditing ? selectedStudent.email : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">রক্তের গ্রুপ</label>
                    <select name="blood_group" defaultValue={isEditing ? selectedStudent.blood_group : ""} className="w-full p-4 bg-slate-50 border rounded-2xl">
                      <option value="">নির্বাচন করুন</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">জন্ম তারিখ</label>
                    <input name="dob" type="date" defaultValue={isEditing ? selectedStudent.dob : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">জন্ম নিবন্ধন নম্বর</label>
                    <input name="birth_cert_no" defaultValue={isEditing ? selectedStudent.birth_cert_no : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">পূর্ববর্তী শিক্ষা প্রতিষ্ঠান</label>
                    <input name="previous_school" defaultValue={isEditing ? selectedStudent.previous_school : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">রোল নম্বর</label>
                    <input name="roll" required defaultValue={isEditing ? selectedStudent.roll : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">মাসিক বেতন (টাকা)</label>
                    <input name="monthly_fee" type="number" defaultValue={isEditing ? selectedStudent.monthly_fee : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="যেমন: 500" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">বর্তমান ঠিকানা</label>
                    <textarea name="present_address" defaultValue={isEditing ? selectedStudent.present_address : ""} className="w-full p-4 bg-slate-50 border rounded-2xl h-24" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">স্থায়ী ঠিকানা</label>
                    <textarea name="permanent_address" defaultValue={isEditing ? selectedStudent.permanent_address : ""} className="w-full p-4 bg-slate-50 border rounded-2xl h-24" />
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">অভিভাবকের তথ্য (পিতা/মাতা ব্যতীত অন্য কেউ হলে)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">অভিভাবকের নাম</label>
                        <input name="guardian_name" defaultValue={isEditing ? selectedStudent.guardian_name : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">সম্পর্ক</label>
                        <input name="guardian_relation" defaultValue={isEditing ? selectedStudent.guardian_relation : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">এনআইডি নম্বর</label>
                        <input name="guardian_nid" defaultValue={isEditing ? selectedStudent.guardian_nid : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">মোবাইল নম্বর</label>
                        <input name="guardian_mobile" defaultValue={isEditing ? selectedStudent.guardian_mobile : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <h4 className="text-lg font-bold text-slate-800 mb-4">জরুরী যোগাযোগ</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">নাম</label>
                        <input name="emergency_contact_name" defaultValue={isEditing ? selectedStudent.emergency_contact_name : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">সম্পর্ক</label>
                        <input name="emergency_contact_relation" defaultValue={isEditing ? selectedStudent.emergency_contact_relation : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700">মোবাইল নম্বর</label>
                        <input name="emergency_contact_mobile" defaultValue={isEditing ? selectedStudent.emergency_contact_mobile : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">বায়োমেট্রিক আইডি (মেশিন আইডি)</label>
                    <input name="biometric_id" defaultValue={isEditing ? selectedStudent.biometric_id : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="যেমন: 101" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">স্টুডেন্ট আইডি (AHXX)</label>
                    <input name="student_code" defaultValue={isEditing ? selectedStudent.student_code : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="উদা: AH01" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">ছাত্রের ছবির ইউআরএল (Photo URL)</label>
                    <input name="photo_url" defaultValue={isEditing ? selectedStudent.photo_url : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="https://example.com/photo.jpg" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">জন্ম নিবন্ধন (URL)</label>
                    <input name="birth_cert_url" defaultValue={isEditing ? selectedStudent.birth_cert_url : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="https://example.com/birth_cert.jpg" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">অভিভাবকের এনআইডি (URL)</label>
                    <input name="parent_nid_url" defaultValue={isEditing ? selectedStudent.parent_nid_url : ""} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="https://example.com/nid.jpg" />
                  </div>
                </div>
                <LoadingButton loading={loadingProfile} type="submit" className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold">
                  <Save className="w-5 h-5" /> {isAdding ? "ছাত্র যুক্ত করুন" : "তথ্য আপডেট করুন"}
                </LoadingButton>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showFeeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-2xl font-black text-slate-900">ফিস ম্যানেজমেন্ট</h3>
                <button onClick={() => setShowFeeModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><CloseIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8">
                {/* Generate Monthly Fees */}
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 mb-2">মাসিক বেতন জেনারেট করুন</h4>
                  <p className="text-sm text-emerald-700 mb-4">চলতি বছরের সকল মাসের বেতন অটোমেটিক জেনারেট হবে।</p>
                  <LoadingButton 
                    loading={generatingFees}
                    onClick={handleGenerateFees}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all w-full md:w-auto"
                  >
                    জেনারেট করুন
                  </LoadingButton>
                </div>

                {/* Add Custom Fee */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 mb-4">নতুন ফিস যুক্ত করুন</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const category = (form.elements.namedItem('category') as HTMLInputElement).value;
                    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
                    if (category && amount) {
                      fetch("/api/admin/fees", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ student_id: fullProfile.student.id, category, amount: Number(amount), due_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}` })
                      }).then(() => {
                        fetchFullProfile(fullProfile.student.id);
                        form.reset();
                        addToast("ফিস যুক্ত করা হয়েছে", "success");
                      });
                    }
                  }} className="flex gap-4">
                    <input name="category" placeholder="ফিসের নাম (যেমন: ভর্তি ফি)" className="flex-1 p-3 border rounded-xl" required />
                    <input name="amount" type="number" placeholder="টাকা" className="w-32 p-3 border rounded-xl" required />
                    <button type="submit" className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800"><Plus className="w-5 h-5" /></button>
                  </form>
                </div>

                {/* Unpaid Fees List */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">বকেয়া ফিস সমূহ</h4>
                  <div className="space-y-3">
                    {fullProfile?.fees.filter((f: any) => f.status === 'unpaid').map((f: any) => (
                      <div key={f.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 cursor-pointer" onClick={() => {
                        if (selectedUnpaidFees.includes(f.id)) {
                          setSelectedUnpaidFees(prev => prev.filter(id => id !== f.id));
                        } else {
                          setSelectedUnpaidFees(prev => [...prev, f.id]);
                        }
                      }}>
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedUnpaidFees.includes(f.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                            {selectedUnpaidFees.includes(f.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{f.category}</p>
                            <p className="text-xs text-slate-500">{f.due_date}</p>
                          </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                           <input 
                            type="number" 
                            value={feeAmountAdjust[f.id] !== undefined ? feeAmountAdjust[f.id] : f.amount} 
                            onChange={(e) => setFeeAmountAdjust({...feeAmountAdjust, [f.id]: Number(e.target.value)})}
                            className="w-24 p-2 border rounded-lg text-right font-bold"
                          />
                        </div>
                      </div>
                    ))}
                    {fullProfile?.fees.filter((f: any) => f.status === 'unpaid').length === 0 && (
                      <p className="text-center text-slate-400 py-4">কোন বকেয়া নেই</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {selectedUnpaidFees.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">মোট পেমেন্ট</p>
                    <p className="text-2xl font-black text-slate-900">
                      ৳{selectedUnpaidFees.reduce((sum, id) => {
                        const fee = fullProfile.fees.find((f: any) => f.id === id);
                        const amount = feeAmountAdjust[id] !== undefined ? feeAmountAdjust[id] : (fee?.amount || 0);
                        return sum + amount;
                      }, 0)}
                    </p>
                  </div>
                  <button 
                    onClick={handleBulkPayProfile}
                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                  >
                    পেমেন্ট করুন ({selectedUnpaidFees.length})
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedStudent ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 print:shadow-none print:border-0 print:p-0">
          <PrintHeader settings={settings} />
          <div className="flex justify-between items-center mb-8 print:hidden">
            <button onClick={() => { setSelectedStudent(null); setFullProfile(null); }} className="text-emerald-600 font-bold flex items-center gap-2">
              <ArrowRight className="w-4 h-4 rotate-180" /> ফিরে যান
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"
              >
                <Printer className="w-4 h-4" /> প্রিন্ট
              </button>
              <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-100 transition-all">
                <Edit className="w-4 h-4" /> এডিট প্রোফাইল
              </button>
              <button 
                onClick={() => setIsDeletingStudent(true)} 
                className="px-6 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-100 transition-all"
              >
                <Trash2 className="w-4 h-4" /> ডিলিট অ্যাকাউন্ট
              </button>
            </div>
          </div>
          
          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {isDeletingStudent && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center">
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">অ্যাকাউন্ট ডিলিট?</h3>
                  <p className="text-slate-500 font-bold mb-6">আপনি কি নিশ্চিতভাবে এই ছাত্রের অ্যাকাউন্ট ডিলিট করতে চান? এটি আর ফিরে পাওয়া যাবে না।</p>
                  
                  <input 
                    type="password"
                    placeholder="অ্যাডমিন পাসওয়ার্ড দিন"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold mb-6 text-center focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setIsDeletingStudent(false); setDeletePassword(""); }}
                      className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      বাতিল
                    </button>
                    <button 
                      onClick={async () => {
                        const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "1234";
                        if ((deletePassword === adminPassword || deletePassword === "১২৩৪")) {
                          const res = await fetch(`/api/admin/students/${selectedStudent.id}`, { 
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ password: deletePassword })
                          });
                          if (res.ok) {
                            addToast("ছাত্রের অ্যাকাউন্ট ডিলিট করা হয়েছে", "success");
                            setIsDeletingStudent(false);
                            setDeletePassword("");
                            setSelectedStudent(null);
                            onUpdate();
                          } else {
                            addToast("ডিলিট করতে সমস্যা হয়েছে।", "error");
                          }
                        } else {
                          addToast("ভুল পাসওয়ার্ড!", "error");
                        }
                      }}
                      className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all"
                    >
                      ডিলিট করুন
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {loadingProfile ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>
          ) : fullProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Personal Info */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-8 rounded-[2rem] text-center border border-slate-100 relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => printElement('id-card-template')}
                      className="p-2 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm border border-slate-100 flex items-center gap-2 text-xs font-bold"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button 
                      onClick={() => downloadPDF('id-card-template', `${fullProfile.student.id}_ID_Card.pdf`, addToast)}
                      className="p-2 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all shadow-sm border border-emerald-100 flex items-center gap-2 text-xs font-bold"
                    >
                      <Download className="w-4 h-4" /> PDF
                    </button>
                  </div>
                  <div className="relative inline-block mb-6">
                    <img src={fullProfile.student.photo_url || `https://picsum.photos/seed/${fullProfile.student.id}/200`} className="w-40 h-40 rounded-3xl mx-auto object-cover shadow-xl border-4 border-white" referrerPolicy="no-referrer" />
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
                      <UserCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{fullProfile.student.name}</h3>
                  <p className="text-emerald-600 font-bold text-lg">{fullProfile.student.class} শ্রেণী | রোল: {fullProfile.student.roll}</p>
                  <div className="mt-4 inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest">
                    ID: {fullProfile.student.studentId || fullProfile.student.id}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">ব্যক্তিগত তথ্য</h4>
                  {[
                    { label: "নাম (বাংলা)", value: fullProfile.student.name },
                    { label: "Name (English)", value: fullProfile.student.name_en },
                    { label: "পিতার নাম (বাংলা)", value: fullProfile.student.father_name },
                    { label: "Father's Name (EN)", value: fullProfile.student.father_name_en },
                    { label: "মাতার নাম (বাংলা)", value: fullProfile.student.mother_name },
                    { label: "Mother's Name (EN)", value: fullProfile.student.mother_name_en },
                    { label: "ফোন", value: fullProfile.student.phone },
                    { label: "হোয়াটসঅ্যাপ", value: fullProfile.student.whatsapp },
                    { label: "ইমেইল", value: fullProfile.student.email },
                    { label: "রক্তের গ্রুপ", value: fullProfile.student.blood_group },
                    { label: "জন্ম তারিখ", value: fullProfile.student.dob },
                    { label: "জন্ম নিবন্ধন নম্বর", value: fullProfile.student.birth_cert_no },
                    { label: "পূর্ববর্তী স্কুল", value: fullProfile.student.previous_school },
                    { label: "বর্তমান ঠিকানা", value: fullProfile.student.present_address },
                    { label: "স্থায়ী ঠিকানা", value: fullProfile.student.permanent_address }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-500 text-xs font-bold">{item.label}</span>
                      <span className="text-slate-900 text-sm font-black">{item.value || "N/A"}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">অভিভাবক ও জরুরী যোগাযোগ</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 mb-2">অভিভাবকের তথ্য</p>
                      {[
                        { label: "নাম", value: fullProfile.student.guardian_name },
                        { label: "সম্পর্ক", value: fullProfile.student.guardian_relation },
                        { label: "এনআইডি", value: fullProfile.student.guardian_nid },
                        { label: "মোবাইল", value: fullProfile.student.guardian_mobile }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1">
                          <span className="text-slate-500 text-xs font-bold">{item.label}</span>
                          <span className="text-slate-900 text-xs font-black">{item.value || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-50">
                      <p className="text-xs font-bold text-slate-400 mb-2">জরুরী যোগাযোগ</p>
                      {[
                        { label: "নাম", value: fullProfile.student.emergency_contact_name },
                        { label: "সম্পর্ক", value: fullProfile.student.emergency_contact_relation },
                        { label: "মোবাইল", value: fullProfile.student.emergency_contact_mobile }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-1">
                          <span className="text-slate-500 text-xs font-bold">{item.label}</span>
                          <span className="text-slate-900 text-xs font-black">{item.value || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-4">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">সংযুক্ত নথিপত্র</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {fullProfile.student.birth_cert_url && (
                      <a href={fullProfile.student.birth_cert_url} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-100 transition-all">
                        <FileText className="w-6 h-6 text-emerald-600" />
                        <span className="text-[10px] font-black text-slate-600">জন্ম নিবন্ধন</span>
                      </a>
                    )}
                    {fullProfile.student.parent_nid_url && (
                      <a href={fullProfile.student.parent_nid_url} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2 hover:bg-slate-100 transition-all">
                        <CreditCard className="w-6 h-6 text-emerald-600" />
                        <span className="text-[10px] font-black text-slate-600">অভিভাবক এনআইডি</span>
                      </a>
                    )}
                    {!fullProfile.student.birth_cert_url && !fullProfile.student.parent_nid_url && (
                      <p className="col-span-2 text-center text-xs text-slate-400 font-bold py-4">কোন নথি আপলোড করা হয়নি</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Academic & Financial */}
              <div className="lg:col-span-2 space-y-8">
                {/* Attendance */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-emerald-600" /> হাজিরা রিপোর্ট
                    </h4>
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded-xl bg-slate-50 text-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                    {(() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const daysInMonth = new Date(year, month, 0).getDate();
                      const days = [];
                      for (let d = 1; d <= daysInMonth; d++) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const record = fullProfile.attendance.find((a: any) => a.date === dateStr);
                        days.push(
                          <div key={d} className={cn(
                            "aspect-square rounded-xl border flex flex-col items-center justify-center text-[10px] font-black transition-all",
                            record?.status === 'present' ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200" : 
                            record?.status === 'absent' ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200" : "bg-slate-50 text-slate-400 border-slate-100"
                          )}>
                            {d}
                          </div>
                        );
                      }
                      return days;
                    })()}
                  </div>
                </div>



                {/* Results */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <GraduationCap className="w-6 h-6 text-emerald-600" /> পরীক্ষার ফলাফল
                    </h4>
                    
                    <div className="flex gap-2">
                      <select 
                        value={selectedResultExam} 
                        onChange={(e) => setSelectedResultExam(e.target.value)}
                        className="p-2 border rounded-xl bg-slate-50 text-sm font-bold"
                      >
                        {[...new Set(fullProfile.results.map((r: any) => r.exam_name))].map((exam: any) => (
                          <option key={exam} value={exam}>{exam}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const exam = prompt("পরীক্ষার নাম:");
                          const subject = prompt("বিষয়:");
                          const marks = prompt("প্রাপ্ত নম্বর:");
                          const grade = prompt("গ্রেড:");
                          if (exam && subject && marks) {
                            fetch("/api/results", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ student_id: fullProfile.student.id, exam_name: exam, subject, marks: Number(marks), grade, date: new Date().toISOString() })
                            }).then(() => fetchFullProfile(fullProfile.student.id));
                          }
                        }}
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                        title="Add Result"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {selectedResultExam && fullProfile.examStats && fullProfile.examStats[selectedResultExam] && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">মোট নম্বর</p>
                        <p className="text-2xl font-black text-slate-900">{fullProfile.examStats[selectedResultExam].myTotal}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">গড় নম্বর</p>
                        <p className="text-2xl font-black text-slate-900">
                          {(() => {
                            const results = fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam);
                            return results.length > 0 
                              ? (fullProfile.examStats[selectedResultExam].myTotal / results.length).toFixed(1)
                              : "0.0";
                          })()}
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">মেধা স্থান</p>
                        <p className="text-2xl font-black text-emerald-700">
                          {fullProfile.examStats[selectedResultExam].rank} <span className="text-sm text-emerald-500">/ {fullProfile.examStats[selectedResultExam].totalStudents}</span>
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">সর্বোচ্চ নম্বর</p>
                        <p className="text-2xl font-black text-slate-900">{fullProfile.examStats[selectedResultExam].highestMarks}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">উপস্থিতি</p>
                        <p className="text-2xl font-black text-slate-900">
                          {fullProfile.attendance.length > 0 
                            ? Math.round((fullProfile.attendance.filter((a: any) => a.status === 'present').length / fullProfile.attendance.length) * 100) 
                            : 0}%
                        </p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">ফলাফল</p>
                        <p className={cn("text-2xl font-black", 
                          fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).some((r: any) => r.grade === 'F') 
                            ? "text-rose-600" 
                            : "text-emerald-600"
                        )}>
                          {fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).some((r: any) => r.grade === 'F') ? "ফেইল" : "পাস"}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedResultExam && fullProfile.examStats && fullProfile.examStats[selectedResultExam] && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button 
                        onClick={() => {
                          const exam = selectedResultExam;
                          const stats = fullProfile.examStats[exam];
                          const text = `*${fullProfile.student.name}* এর ${exam} এর ফলাফল:\nমোট নম্বর: ${stats.myTotal}\nমেধা স্থান: ${stats.rank}\n\nবিস্তারিত জানতে মাদরাসায় যোগাযোগ করুন।`;
                          const cleanPhone = fullProfile.student.whatsapp.replace(/[^0-9]/g, '');
                          const formattedPhone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
                          window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        <MessageCircle className="w-4 h-4" /> WhatsApp
                      </button>
                      <button 
                        onClick={() => {
                          if (!fullProfile.student.email) {
                            addToast("ছাত্রের ইমেইল দেওয়া নেই", "error");
                            return;
                          }
                          const exam = selectedResultExam;
                          const stats = fullProfile.examStats[exam];
                          const subject = `${exam} এর ফলাফল - ${fullProfile.student.name}`;
                          const body = `${fullProfile.student.name} এর ${exam} এর ফলাফল:\nমোট নম্বর: ${stats.myTotal}\nমেধা স্থান: ${stats.rank}\n\nবিস্তারিত জানতে মাদরাসায় যোগাযোগ করুন।`;
                          window.open(`mailto:${fullProfile.student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                        }}
                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        <Mail className="w-4 h-4" /> Gmail
                      </button>
                      <button 
                        onClick={() => printElement('marksheet-template')}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        <Printer className="w-4 h-4" /> Print Result
                      </button>
                      <button 
                        onClick={() => downloadPDF('marksheet-template', `${fullProfile.student.id}_${selectedResultExam}_Result.pdf`, addToast)}
                        className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all flex items-center gap-2 text-xs font-bold"
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase">বিষয়</th>
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase">নম্বর</th>
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase">গ্রেড</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).map((r: any) => (
                          <tr key={r.id}>
                            <td className="py-4 text-slate-600 font-bold">{r.subject}</td>
                            <td className="py-4 font-black text-emerald-600">{r.marks}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-black">{r.grade}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fullProfile.results.length === 0 && (
                      <div className="text-center py-8 text-slate-400 font-bold">কোন ফলাফল রেকর্ড পাওয়া যায়নি</div>
                    )}
                  </div>
                </div>

                {/* Hifz Section in Profile */}
                {fullProfile.student.is_hifz === 1 && (
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-emerald-600" /> হিফজ রিপোর্ট
                      </h4>
                      <button 
                        onClick={() => setActiveTab("hifz")}
                        className="text-emerald-600 font-bold text-sm hover:underline"
                      >
                        বিস্তারিত দেখুন
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-500 uppercase mb-4">সর্বশেষ সবক</p>
                        {fullProfile.hifzReports && fullProfile.hifzReports.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-lg font-black text-slate-900">
                              {fullProfile.hifzReports[0].sabok?.map((s: any) => `${s.reading} (${s.page})`).join(', ')}
                            </p>
                            <p className="text-xs text-slate-500">তারিখ: {new Date(fullProfile.hifzReports[0].date).toLocaleDateString('bn-BD')}</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">কোনো রিপোর্ট পাওয়া যায়নি</p>
                        )}
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                        <p className="text-sm font-bold text-emerald-600 uppercase mb-4">সারাংশ</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-emerald-600 font-bold">মোট সবক</p>
                            <p className="text-xl font-black text-emerald-700">
                              {fullProfile.hifzReports?.reduce((sum: number, r: any) => sum + (r.sabok?.length || 0), 0) || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-emerald-600 font-bold">আমুখতা (পৃষ্ঠা)</p>
                            <p className="text-xl font-black text-emerald-700">
                              {fullProfile.hifzReports?.reduce((sum: number, r: any) => sum + (r.amukhta?.total_pages || 0), 0) || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden Templates for PDF Generation */}
              <div id="id-card-template" className="hidden absolute top-0 left-0 bg-white p-8 w-full max-w-[400px] mx-auto border-2 border-emerald-600 rounded-3xl text-center" style={{ borderColor: '#059669' }}>
                <div className="flex items-center justify-center gap-3 mb-6 border-b-2 border-emerald-100 pb-4" style={{ borderColor: '#d1fae5' }}>
                  <GraduationCap className="w-8 h-8 text-emerald-600" style={{ color: '#059669' }} />
                  <h2 className="text-2xl font-black text-emerald-900" style={{ color: '#064e3b' }}>{settings?.title || "আল হেরা মাদরাসা"}</h2>
                </div>
                <img src={fullProfile.student.photo_url || `https://picsum.photos/seed/${fullProfile.student.id}/200`} className="w-32 h-32 rounded-2xl mx-auto object-cover border-4 border-emerald-50 mb-4" crossOrigin="anonymous" style={{ borderColor: '#ecfdf5' }} />
                <h3 className="text-2xl font-black text-slate-900 mb-1" style={{ color: '#0f172a' }}>{fullProfile.student.name}</h3>
                <p className="text-emerald-600 font-bold text-lg mb-4" style={{ color: '#059669' }}>{fullProfile.student.class} শ্রেণী | রোল: {fullProfile.student.roll}</p>
                <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-2 mb-6" style={{ backgroundColor: '#f8fafc' }}>
                  <p className="text-sm font-bold text-slate-600" style={{ color: '#475569' }}>পিতার নাম: <span className="text-slate-900" style={{ color: '#0f172a' }}>{fullProfile.student.father_name}</span></p>
                  <p className="text-sm font-bold text-slate-600" style={{ color: '#475569' }}>রক্তের গ্রুপ: <span className="text-rose-600" style={{ color: '#e11d48' }}>{fullProfile.student.blood_group}</span></p>
                  <p className="text-sm font-bold text-slate-600" style={{ color: '#475569' }}>ফোন: <span className="text-slate-900" style={{ color: '#0f172a' }}>{fullProfile.student.phone}</span></p>
                </div>
                <div className="inline-block px-6 py-2 bg-emerald-900 text-white rounded-xl text-sm font-black tracking-widest" style={{ backgroundColor: '#064e3b', color: '#ffffff' }}>
                  ID: {fullProfile.student.studentId || fullProfile.student.id}
                </div>
              </div>

              <div id="marksheet-template" className="hidden absolute top-0 left-0 bg-white p-12 w-full max-w-[800px] mx-auto border-4 border-double border-emerald-900 text-center" style={{ borderColor: '#064e3b' }}>
                <div className="flex items-center justify-center gap-4 mb-8 border-b-4 border-emerald-100 pb-6" style={{ borderColor: '#d1fae5' }}>
                  <GraduationCap className="w-12 h-12 text-emerald-600" style={{ color: '#059669' }} />
                  <div>
                    <h2 className="text-4xl font-black text-emerald-900" style={{ color: '#064e3b' }}>{settings?.title || "আল হেরা মাদরাসা"}</h2>
                    <p className="text-lg font-bold text-slate-500 mt-1" style={{ color: '#64748b' }}>একাডেমিক ট্রান্সক্রিপ্ট / মার্কশিট - {selectedResultExam}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mb-8 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2" style={{ color: '#0f172a' }}>{fullProfile.student.name}</h3>
                    <p className="text-slate-600 font-bold" style={{ color: '#475569' }}>পিতার নাম: {fullProfile.student.father_name}</p>
                    <p className="text-slate-600 font-bold" style={{ color: '#475569' }}>মাতার নাম: {fullProfile.student.mother_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-700 font-black text-xl mb-1" style={{ color: '#047857' }}>ID: {fullProfile.student.studentId || fullProfile.student.id}</p>
                    <p className="text-slate-600 font-bold" style={{ color: '#475569' }}>শ্রেণী: {fullProfile.student.class}</p>
                    <p className="text-slate-600 font-bold" style={{ color: '#475569' }}>রোল: {fullProfile.student.roll}</p>
                  </div>
                </div>

                {selectedResultExam && fullProfile.examStats && fullProfile.examStats[selectedResultExam] && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <p className="text-xs font-bold text-slate-500 uppercase" style={{ color: '#64748b' }}>মোট নম্বর</p>
                      <p className="text-xl font-black text-slate-900" style={{ color: '#0f172a' }}>{fullProfile.examStats[selectedResultExam].myTotal}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <p className="text-xs font-bold text-slate-500 uppercase" style={{ color: '#64748b' }}>গড় নম্বর</p>
                      <p className="text-xl font-black text-slate-900" style={{ color: '#0f172a' }}>
                        {(() => {
                          const results = fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam);
                          return results.length > 0 
                            ? (fullProfile.examStats[selectedResultExam].myTotal / results.length).toFixed(1)
                            : "0.0";
                        })()}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200" style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
                      <p className="text-xs font-bold text-emerald-600 uppercase" style={{ color: '#059669' }}>মেধা স্থান</p>
                      <p className="text-xl font-black text-emerald-700" style={{ color: '#047857' }}>
                        {fullProfile.examStats[selectedResultExam].rank} <span className="text-sm text-emerald-500" style={{ color: '#10b981' }}>/ {fullProfile.examStats[selectedResultExam].totalStudents}</span>
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <p className="text-xs font-bold text-slate-500 uppercase" style={{ color: '#64748b' }}>সর্বোচ্চ নম্বর</p>
                      <p className="text-xl font-black text-slate-900" style={{ color: '#0f172a' }}>{fullProfile.examStats[selectedResultExam].highestMarks}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <p className="text-xs font-bold text-slate-500 uppercase" style={{ color: '#64748b' }}>উপস্থিতি</p>
                      <p className="text-xl font-black text-slate-900" style={{ color: '#0f172a' }}>
                        {fullProfile.attendance.length > 0 
                          ? Math.round((fullProfile.attendance.filter((a: any) => a.status === 'present').length / fullProfile.attendance.length) * 100) 
                          : 0}%
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200" style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <p className="text-xs font-bold text-slate-500 uppercase" style={{ color: '#64748b' }}>ফলাফল</p>
                      <p className={cn("text-xl font-black", 
                        fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).some((r: any) => r.grade === 'F') 
                          ? "text-rose-600" 
                          : "text-emerald-600"
                      )} style={{ color: fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).some((r: any) => r.grade === 'F') ? '#e11d48' : '#059669' }}>
                        {fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).some((r: any) => r.grade === 'F') ? "ফেইল" : "পাস"}
                      </p>
                    </div>
                  </div>
                )}

                <table className="w-full text-left border-collapse border border-slate-300 mb-8">
                  <thead>
                    <tr className="bg-emerald-50" style={{ backgroundColor: '#ecfdf5' }}>
                      <th className="border border-slate-300 p-4 font-black text-slate-700" style={{ borderColor: '#cbd5e1', color: '#334155' }}>বিষয়</th>
                      <th className="border border-slate-300 p-4 font-black text-slate-700 text-center" style={{ borderColor: '#cbd5e1', color: '#334155' }}>প্রাপ্ত নম্বর</th>
                      <th className="border border-slate-300 p-4 font-black text-slate-700 text-center" style={{ borderColor: '#cbd5e1', color: '#334155' }}>লেটার গ্রেড</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullProfile.results.filter((r: any) => r.exam_name === selectedResultExam).map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 p-4 font-bold text-slate-800" style={{ borderColor: '#cbd5e1', color: '#1e293b' }}>{r.subject}</td>
                        <td className="border border-slate-300 p-4 font-black text-emerald-700 text-center" style={{ borderColor: '#cbd5e1', color: '#047857' }}>{r.marks}</td>
                        <td className="border border-slate-300 p-4 font-black text-emerald-700 text-center" style={{ borderColor: '#cbd5e1', color: '#047857' }}>{r.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex justify-between mt-24 px-12">
                  <div className="border-t-2 border-slate-400 pt-2 font-bold text-slate-600 w-48" style={{ borderColor: '#94a3b8', color: '#475569' }}>শ্রেণী শিক্ষকের স্বাক্ষর</div>
                  <div className="border-t-2 border-slate-400 pt-2 font-bold text-slate-600 w-48" style={{ borderColor: '#94a3b8', color: '#475569' }}>মুহতামিমের স্বাক্ষর</div>
                </div>
              </div>

              {/* Delete Student */}
              {/* Delete Student section removed */}
            </div>
          )}
        </motion.div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h3 className="text-3xl font-black text-slate-900">ছাত্র তালিকা</h3>
              <p className="text-slate-500 font-bold mt-1">মোট ছাত্র: {filteredStudents.length}</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="pl-12 pr-8 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold appearance-none"
                >
                  {classes.map(c => <option key={c} value={c}>{c === "All" ? "সব শ্রেণী" : c}</option>)}
                </select>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
              >
                <Plus className="w-5 h-5" /> ছাত্র যুক্ত করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((s) => (
              <motion.div 
                key={s.id}
                layoutId={s.id}
                onClick={() => handleViewProfile(s)}
                className="group bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex items-center gap-6">
                  <img src={s.photo_url || `https://picsum.photos/seed/${s.id}/100`} className="w-16 h-16 rounded-2xl object-cover shadow-md" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-black text-slate-900 text-lg group-hover:text-emerald-700 transition-colors">{s.name}</h4>
                    <p className="text-emerald-600 font-bold text-sm">{s.class} শ্রেণী | রোল: {s.roll}</p>
                    <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">ID: {s.studentId || s.id}</p>
                  </div>
                </div>
                {s.whatsapp && (
                  <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <a 
                      href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '').startsWith('0') ? '88' + s.whatsapp.replace(/[^0-9]/g, '') : s.whatsapp.replace(/[^0-9]/g, '')}?text=আসসালামু%20আলাইকুম,%20${s.name}%20এর%20অভিভাবক,%20`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                    {s.email && (
                      <a 
                        href={`mailto:${s.email}?subject=মাদরাসা যোগাযোগ - ${s.name}&body=আসসালামু আলাইকুম, ${s.name} এর অভিভাবক, `}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                        title="Gmail"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold">কোন ছাত্র পাওয়া যায়নি</p>
              </div>
            )}
          </div>
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                const newOffset = offset + 50;
                setOffset(newOffset);
                fetchStudents(newOffset);
              }}
              disabled={loading}
              className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all"
            >
              {loading ? "লোড হচ্ছে..." : "আরও দেখুন"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function AttendanceManager({ settings, classesList }: { settings: any, classesList: string[] }) {
  const { addToast } = useToast();
  const [date, setDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [filter, setFilter] = useState<'all' | 'present' | 'absent'>('all');

  const classes = classesList;

  const fetchAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/class/${selectedClass}?date=${date}`);
      const data = await res.json();
      setStudents(data.students || []);
      const initialAttendance: Record<string, any> = {};
      (data.attendance || []).forEach((a: any) => {
        initialAttendance[a.student_id] = {
          status: a.status,
          check_in: a.check_in,
          check_out: a.check_out
        };
      });
      setAttendance(initialAttendance);
      setHasSaved((data.attendance || []).length > 0);
    } catch (error) {
      console.error("Fetch attendance failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedClass, date]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([student_id, data]: [string, any]) => ({
        student_id,
        status: data.status,
        check_in: data.check_in || null,
        check_out: data.check_out || null
      }));

      await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records })
      });
      setHasSaved(true);
      addToast("হাজিরা সফলভাবে সংরক্ষিত হয়েছে", "success");
    } catch (error) {
      addToast("হাজিরা সেভ করতে সমস্যা হয়েছে", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleNotify = async () => {
    setNotifying(true);
    try {
      await fetch("/api/admin/notify/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, className: selectedClass })
      });
      addToast("অভিভাবকদের নোটিফিকেশন পাঠানো হয়েছে", "success");
    } catch (error) {
      addToast("নোটিফিকেশন পাঠাতে সমস্যা হয়েছে", "error");
    } finally {
      setNotifying(false);
    }
  };

  const filteredStudents = students.filter(s => {
    if (filter === "all") return true;
    return (attendance as any)[s.id]?.status === filter;
  });

  return (
    <div className="space-y-6">
      <PrintHeader settings={settings} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 print:shadow-none print:border-0 print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 print:hidden">
          <div>
            <h3 className="text-3xl font-black text-slate-900">স্মার্ট হাজিরা ব্যবস্থাপনা</h3>
            <p className="text-slate-500 font-bold mt-1">ডিভাইস এন্ট্রি ও ম্যানুয়াল হাজিরা</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full">
            <div className="relative w-full md:w-48 shrink-0">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
              />
            </div>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex-1 min-w-[200px]">
              {classes.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-black text-sm transition-all flex items-center gap-2 whitespace-nowrap",
                    selectedClass === c 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                      : "text-slate-500 hover:bg-slate-200"
                  )}
                >
                  <GraduationCap className="w-4 h-4" /> {c}
                </button>
              ))}
            </div>
            <button 
              onClick={() => window.print()}
              className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
            >
              <Printer className="w-6 h-6" />
            </button>
          </div>
        </div>

        {selectedClass ? (
          <>
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6 print:hidden">
              <div className="flex gap-2">
                {(['all', 'present', 'absent'] as const).map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      filter === f ? "bg-emerald-600 text-white" : "bg-white text-slate-500 border border-slate-100"
                    )}
                  >
                    {f === 'all' ? 'সবাই' : f === 'present' ? 'উপস্থিত' : 'অনুপস্থিত'}
                  </button>
                ))}
              </div>
              <p className="text-emerald-700 font-black text-sm">উপস্থিত: {Object.values(attendance).filter((v: any) => v?.status === 'present').length} / {students.length}</p>
            </div>

            <div className="hidden print:block mb-6">
              <h2 className="text-xl font-black text-slate-900 mb-2">হাজিরা রিপোর্ট: {selectedClass} শ্রেণী</h2>
              <p className="text-slate-500 font-bold">তারিখ: {date} | মোট ছাত্র: {students.length}</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible w-full">
                <table className="w-full border-collapse min-w-[600px] print:min-w-0">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="text-left py-4 px-4 font-black text-slate-400 uppercase text-xs tracking-wider">ছাত্রের তথ্য</th>
                      <th className="text-center py-4 px-4 font-black text-slate-400 uppercase text-xs tracking-wider">চেক-ইন</th>
                      <th className="text-center py-4 px-4 font-black text-slate-400 uppercase text-xs tracking-wider">চেক-আউট</th>
                      <th className="text-right py-4 px-4 font-black text-slate-400 uppercase text-xs tracking-wider print:hidden">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-xs">
                              {s.roll}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm">{s.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {s.studentId || s.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-xs">
                            <Clock className="w-3 h-3" />
                            {attendance[s.id]?.check_in || "--:--"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold text-xs">
                            <Clock className="w-3 h-3" />
                            {attendance[s.id]?.check_out || "--:--"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right print:hidden">
                          <div className="flex justify-end gap-1 bg-white p-1 rounded-xl border border-slate-100">
                            <button 
                              onClick={() => setAttendance({ ...attendance, [s.id]: { ...attendance[s.id], status: attendance[s.id]?.status === 'present' ? '' : 'present' } })}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                attendance[s.id]?.status === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "text-slate-300 hover:bg-slate-50"
                              )}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setAttendance({ ...attendance, [s.id]: { ...attendance[s.id], status: attendance[s.id]?.status === 'absent' ? '' : 'absent' } })}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                attendance[s.id]?.status === 'absent' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-slate-300 hover:bg-slate-50"
                              )}
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="hidden print:table-cell py-4 px-4 text-right">
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                            attendance[s.id]?.status === 'present' ? "bg-emerald-100 text-emerald-700" : 
                            attendance[s.id]?.status === 'absent' ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-400"
                          )}>
                            {attendance[s.id]?.status === 'present' ? "উপস্থিত" : attendance[s.id]?.status === 'absent' ? "অনুপস্থিত" : "বকেয়া"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <LoadingButton 
              loading={saving}
              onClick={handleSave} 
              disabled={!selectedClass} 
              className="w-full mt-8 py-4 bg-emerald-900 text-white rounded-2xl font-black print:hidden"
            >
              <Save className="w-5 h-5" /> হাজিরা সেভ করুন
            </LoadingButton>

            {hasSaved && (
              <LoadingButton 
                loading={notifying}
                onClick={handleNotify}
                className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-black print:hidden"
              >
                <Mail className="w-5 h-5" /> অভিভাবকদের জিমেইলে আপডেট পাঠান
              </LoadingButton>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 print:hidden">
            <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">হাজিরা নিতে প্রথমে শ্রেণী নির্বাচন করুন</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function TeacherAttendanceManager({ settings }: { settings: any }) {
  const { addToast } = useToast();
  const [date, setDate] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/teacher-attendance?date=${date}`);
    const data = await res.json();
    const teachersData = Array.isArray(data) ? data : [];
    setTeachers(teachersData);
    const initialAttendance: Record<string, string> = {};
    teachersData.forEach((t: any) => {
      if (t.status) initialAttendance[t.id] = t.status;
    });
    setAttendance(initialAttendance);
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [date]);

  const handleSave = async () => {
    setSaving(true);
    const records = teachers.map(t => ({
      teacher_id: t.id,
      status: attendance[t.id] || null
    }));

    await fetch("/api/admin/teacher-attendance/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, records })
    });
    setSaving(false);
    addToast("শিক্ষক হাজিরা সফলভাবে সংরক্ষিত হয়েছে", "success");
  };

  return (
    <div className="space-y-6">
      <PrintHeader settings={settings} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 print:shadow-none print:border-0 print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 print:hidden">
          <div>
            <h3 className="text-3xl font-black text-slate-900">শিক্ষক হাজিরা ব্যবস্থাপনা</h3>
            <p className="text-slate-500 font-bold mt-1">তারিখ নির্বাচন করে শিক্ষকদের হাজিরা নিন</p>
          </div>
          <div className="flex gap-4">
            <div className="relative w-48">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
              />
            </div>
            <button 
              onClick={() => window.print()}
              className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
            >
              <FileText className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="hidden print:block mb-6">
          <h2 className="text-xl font-black text-slate-900 mb-2">শিক্ষক হাজিরা রিপোর্ট</h2>
          <p className="text-slate-500 font-bold">তারিখ: {date} | মোট শিক্ষক: {teachers.length}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
            {teachers.map((t) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center transition-all hover:bg-white hover:shadow-md print:bg-white print:border print:border-slate-200">
                <div>
                  <p className="font-black text-slate-900 text-sm">{t.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {t.id}</p>
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 print:hidden">
                  <button 
                    onClick={() => setAttendance({ ...attendance, [t.id]: attendance[t.id] === 'present' ? '' : 'present' })}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      attendance[t.id] === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "text-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setAttendance({ ...attendance, [t.id]: attendance[t.id] === 'absent' ? '' : 'absent' })}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      attendance[t.id] === 'absent' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="hidden print:block">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2 py-1 rounded-lg",
                    attendance[t.id] === 'present' ? "bg-emerald-100 text-emerald-700" : 
                    attendance[t.id] === 'absent' ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-400"
                  )}>
                    {attendance[t.id] === 'present' ? "উপস্থিত" : attendance[t.id] === 'absent' ? "অনুপস্থিত" : "বকেয়া"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <LoadingButton 
          loading={saving}
          onClick={handleSave} 
          className="w-full mt-8 py-4 bg-emerald-900 text-white rounded-2xl font-black print:hidden"
        >
          <Save className="w-5 h-5" /> হাজিরা সেভ করুন
        </LoadingButton>
      </motion.div>
    </div>
  );
}

function ResultManager({ students, settings, classesList }: { students: any[], settings: any, classesList: string[] }) {
  const { addToast } = useToast();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("প্রথম সাময়িক");
  const [classResults, setClassResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<"detailed" | "short">("detailed");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentSubjects, setStudentSubjects] = useState<{ name: string, marks: string }[]>([]);
  const [printStudent, setPrintStudent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"results" | "subjects">("results");
  
  // Subject Management State
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState({ name: "", total_marks: 100 });
  const [addingSubject, setAddingSubject] = useState(false);
  
  // Exam Management State
  const [exams, setExams] = useState<any[]>([]);
  const [newExamName, setNewExamName] = useState("");
  const [isAddingExam, setIsAddingExam] = useState(false);

  const classes = classesList;

  const fetchExams = async () => {
    const res = await fetch("/api/exams");
    const data = await res.json();
    const examsData = Array.isArray(data) ? data : [];
    setExams(examsData);
    if (examsData.length > 0 && !selectedExam) {
      setSelectedExam(examsData[0].name);
    }
  };

  const handleAddExam = async () => {
    if (!newExamName) return;
    await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newExamName })
    });
    setNewExamName("");
    setIsAddingExam(false);
    fetchExams();
  };

  const fetchClassResults = async () => {
    if (!selectedClass) return;
    setLoading(true);
    const res = await fetch(`/api/admin/results/class/${selectedClass}?exam_name=${selectedExam}`);
    setClassResults(await res.json());
    setLoading(false);
  };

  const fetchClassSubjects = async () => {
    if (!selectedClass) return;
    const res = await fetch(`/api/subjects/${selectedClass}`);
    const data = await res.json();
    setClassSubjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassResults();
      fetchClassSubjects();
    }
  }, [selectedClass, selectedExam]);

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleAddSubject = async () => {
    if (!newSubject.name) return;
    setAddingSubject(true);
    await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newSubject, className: selectedClass })
    });
    setNewSubject({ name: "", total_marks: 100 });
    setAddingSubject(false);
    fetchClassSubjects();
  };

  const executeDeleteSubject = async () => {
    if (confirmDelete === null) return;
    await fetch(`/api/subjects/${confirmDelete}`, { method: "DELETE" });
    setConfirmDelete(null);
    fetchClassSubjects();
  };

  const handleDeleteSubject = (id: number) => {
    setConfirmDelete(id);
  };
  
  const handleSaveResult = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      for (const sub of studentSubjects) {
        if (!sub.marks) continue; // Skip empty marks
        const grade = Number(sub.marks) >= 80 ? "A+" : Number(sub.marks) >= 70 ? "A" : Number(sub.marks) >= 60 ? "A-" : Number(sub.marks) >= 50 ? "B" : Number(sub.marks) >= 40 ? "C" : Number(sub.marks) >= 33 ? "D" : "F";
        await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: selectedStudent.id,
            exam_name: selectedExam,
            subject: sub.name,
            marks: Number(sub.marks),
            grade,
            date: new Date().toISOString()
          })
        });
      }

      addToast("রেজাল্ট সফলভাবে সংরক্ষিত হয়েছে", "success");
      setIsAdding(false);
      fetchClassResults();
    } catch (error) {
      console.error("Save result failed", error);
    } finally {
      setLoading(false);
    }
  };

  const openResultEntry = (student: any) => {
    setSelectedStudent(student);
    // Initialize subjects from class subjects or existing results
    const existingSubjects = student.subjects || [];
    
    // If we have defined subjects for the class, use them
    if (classSubjects.length > 0) {
      const initialSubjects = classSubjects.map(cs => {
        const existing = existingSubjects.find((es: any) => es.subject === cs.name);
        return {
          name: cs.name,
          marks: existing ? existing.marks.toString() : ""
        };
      });
      setStudentSubjects(initialSubjects);
    } else {
      // Fallback to existing subjects or empty
      if (existingSubjects.length > 0) {
        setStudentSubjects(existingSubjects.map((s: any) => ({ name: s.subject, marks: s.marks.toString() })));
      } else {
        setStudentSubjects([{ name: "", marks: "" }]);
      }
    }
    
    setIsAdding(true);
  };

  const [showAllReports, setShowAllReports] = useState<any>(null);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const fetchAllReports = async (studentId: string) => {
    setLoadingAll(true);
    try {
      const res = await fetch(`/api/results/${studentId}`);
      const data = await res.json();
      setAllReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch all reports", error);
    } finally {
      setLoadingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal 
        isOpen={confirmDelete !== null} 
        message="আপনি কি নিশ্চিত যে আপনি এই বিষয়টি মুছে ফেলতে চান?" 
        onConfirm={executeDeleteSubject} 
        onCancel={() => setConfirmDelete(null)} 
      />
      <PrintHeader settings={settings} />

      {/* All Reports Modal */}
      {showAllReports && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{showAllReports.name} এর সকল রেজাল্ট</h3>
                <p className="text-slate-500 font-bold">রোল: {showAllReports.roll} | ক্লাস: {showAllReports.class}</p>
              </div>
              <button onClick={() => setShowAllReports(null)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 shadow-sm transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {loadingAll ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                  <p className="text-slate-500 font-bold">রেজাল্ট লোড হচ্ছে...</p>
                </div>
              ) : allReports.length > 0 ? (() => {
                const grouped = allReports.reduce((acc: any, res: any) => {
                  if (!acc[res.exam_name]) acc[res.exam_name] = [];
                  acc[res.exam_name].push(res);
                  return acc;
                }, {});

                return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(examName => (
                  <div key={examName} className="mb-10 last:mb-0">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-slate-100"></div>
                      <h4 className="px-6 py-2 bg-slate-100 rounded-full text-sm font-black text-slate-600 uppercase tracking-widest">{examName}</h4>
                      <div className="h-px flex-1 bg-slate-100"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped[examName].map((res: any, i: number) => (
                        <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                          <div>
                            <h5 className="font-bold text-slate-900">{res.subject}</h5>
                            <p className="text-xs text-slate-400 font-bold">পূর্ণমান: ১০০</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-emerald-600">{res.marks}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">গ্রেড: {res.grade}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })() : (
                <div className="text-center py-20">
                  <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">কোন রেজাল্ট পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Marksheet Print View (Hidden) */}
      {printStudent && (
        <div className="hidden print:block p-12 bg-white w-full">
          <PrintHeader settings={settings} />
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest border-b-4 border-slate-900 inline-block pb-2 mb-4">একাডেমিক ট্রান্সক্রিপ্ট</h2>
            <p className="text-xl font-bold text-slate-600">{selectedExam}</p>
          </div>
          <div className="grid grid-cols-2 gap-12 mb-12 bg-slate-50 p-8 rounded-3xl border-2 border-slate-200">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">ছাত্রের নাম:</span>
                <span className="font-black text-slate-900">{printStudent.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">আইডি নম্বর:</span>
                <span className="font-black text-slate-900">{printStudent.id}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">শ্রেণী:</span>
                <span className="font-black text-slate-900">{selectedClass}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">রোল নম্বর:</span>
                <span className="font-black text-slate-900">{printStudent.roll}</span>
              </div>
            </div>
          </div>
          <table className="w-full border-collapse mb-12">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 text-left border border-slate-900">বিষয়</th>
                <th className="p-4 text-center border border-slate-900">পূর্ণমান</th>
                <th className="p-4 text-center border border-slate-900">প্রাপ্ত নম্বর</th>
                <th className="p-4 text-center border border-slate-900">গ্রেড</th>
              </tr>
            </thead>
            <tbody>
              {printStudent.subjects.map((s: any, i: number) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="p-4 font-bold border border-slate-200">{s.subject}</td>
                  <td className="p-4 text-center border border-slate-200">১০০</td>
                  <td className="p-4 text-center font-black border border-slate-200">{s.marks}</td>
                  <td className="p-4 text-center font-black border border-slate-200">{s.grade}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-black">
                <td colSpan={2} className="p-4 text-right border border-slate-200">সর্বমোট নম্বর:</td>
                <td className="p-4 text-center border border-slate-200">{printStudent.totalMarks}</td>
                <td className="p-4 text-center border border-slate-200">গড়: {printStudent.avgMarks.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-between mt-24">
            <div className="text-center">
              <div className="border-t-2 border-slate-900 w-48 pt-2">শ্রেণী শিক্ষকের স্বাক্ষর</div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-slate-900 w-48 pt-2">প্রধান শিক্ষকের স্বাক্ষর</div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-slate-900 w-48 pt-2">মুহতামিমের স্বাক্ষর</div>
            </div>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 print:shadow-none print:border-0 print:p-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 print:hidden">
          <div>
            <h3 className="text-3xl font-black text-slate-900">ফলাফল ও বিষয় ব্যবস্থাপনা</h3>
            <p className="text-slate-500 font-bold mt-1">পরীক্ষার ফলাফল এবং বিষয় নির্ধারণ করুন</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
             <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {classes.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={cn(
                    "px-4 py-2 rounded-xl font-black text-sm transition-all whitespace-nowrap",
                    selectedClass === c ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedClass ? (
          <>
             <div className="flex gap-4 mb-8 border-b border-slate-100 pb-1">
              <button 
                onClick={() => setActiveTab("results")}
                className={cn(
                  "px-6 py-3 font-black text-sm transition-all border-b-2",
                  activeTab === "results" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                ফলাফল তালিকা
              </button>
              <button 
                onClick={() => setActiveTab("subjects")}
                className={cn(
                  "px-6 py-3 font-black text-sm transition-all border-b-2",
                  activeTab === "subjects" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                বিষয় ব্যবস্থাপনা
              </button>
            </div>

            {activeTab === "subjects" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <h4 className="text-lg font-black text-slate-900 mb-6">নতুন বিষয় যুক্ত করুন</h4>
                  <div className="flex gap-4">
                    <input 
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                      placeholder="বিষয় নাম (উদা: বাংলা)"
                      className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl font-bold"
                    />
                    <input 
                      type="number"
                      value={newSubject.total_marks}
                      onChange={(e) => setNewSubject({...newSubject, total_marks: Number(e.target.value)})}
                      placeholder="পূর্ণমান"
                      className="w-32 p-4 bg-white border border-slate-200 rounded-2xl font-bold"
                    />
                    <LoadingButton 
                      loading={addingSubject}
                      onClick={handleAddSubject}
                      className="px-8 bg-emerald-900 text-white rounded-2xl font-black"
                    >
                      যুক্ত করুন
                    </LoadingButton>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classSubjects.map((sub) => (
                    <div key={sub.id} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
                      <div>
                        <p className="font-black text-slate-900 text-lg">{sub.name}</p>
                        <p className="text-xs text-slate-400 font-bold">পূর্ণমান: {sub.total_marks}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  {classSubjects.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400 font-bold">
                      কোন বিষয় যুক্ত করা হয়নি
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "results" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 print:hidden">
                  <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => setViewMode("detailed")}
                      className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all", viewMode === "detailed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}
                    >বিস্তারিত</button>
                    <button 
                      onClick={() => setViewMode("short")}
                      className={cn("px-4 py-2 rounded-xl text-xs font-black transition-all", viewMode === "short" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}
                    >সংক্ষিপ্ত</button>
                  </div>
                  <div className="flex gap-4">
                    <div className="relative flex items-center gap-2">
                      <select 
                        value={selectedExam} 
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none pr-10"
                      >
                        {exams.map(e => <option key={e.id || e.name || e} value={e.name || e}>{e.name || e}</option>)}
                      </select>
                      <ChevronDown className="absolute right-14 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                      <button 
                        onClick={() => setIsAddingExam(!isAddingExam)}
                        className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-200 transition-all"
                        title="নতুন পরীক্ষা যোগ করুন"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      {isAddingExam && (
                        <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-in slide-in-from-top-2 w-64">
                          <input 
                            autoFocus
                            placeholder="পরীক্ষার নাম লিখুন" 
                            value={newExamName}
                            onChange={(e) => setNewExamName(e.target.value)}
                            className="w-full p-3 bg-slate-50 border rounded-xl mb-2 text-sm font-bold"
                          />
                          <button 
                            onClick={handleAddExam}
                            className="w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-black"
                          >
                            যোগ করুন
                          </button>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      <Printer className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b-2 border-slate-100">
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">র‍্যাঙ্ক</th>
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">ছাত্রের নাম</th>
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">রোল</th>
                          {viewMode === 'detailed' && <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">বিষয়সমূহ</th>}
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">মোট নম্বর</th>
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest">গড়</th>
                          <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest print:hidden">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {classResults.map((r, index) => (
                          <tr key={r.id} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-4">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
                                index === 0 ? "bg-yellow-100 text-yellow-700" : 
                                index === 1 ? "bg-slate-200 text-slate-700" :
                                index === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                              )}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-4">
                              <p className="font-black text-slate-900">{r.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">ID: {r.studentId || r.id}</p>
                            </td>
                            <td className="py-4 font-bold text-slate-600">{r.roll}</td>
                            {viewMode === 'detailed' && (
                              <td className="py-4">
                                <div className="flex flex-wrap gap-1">
                                  {r.subjects.map((s: any, i: number) => (
                                    <span key={i} className="text-[10px] bg-white border border-slate-100 px-2 py-0.5 rounded-lg font-bold text-slate-500">
                                      {s.subject}: {s.marks}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            )}
                            <td className="py-4 font-black text-emerald-600">{r.totalMarks}</td>
                            <td className="py-4 font-black text-blue-600">{r.avgMarks.toFixed(2)}</td>
                            <td className="py-4 print:hidden">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setShowAllReports(r);
                                    fetchAllReports(r.studentId || r.id);
                                  }}
                                  title="সকল রিপোর্ট"
                                  className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => openResultEntry(r)}
                                  title="এডিট করুন"
                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    setPrintStudent(r);
                                    setTimeout(() => window.print(), 100);
                                  }}
                                  title="মার্কশিট প্রিন্ট"
                                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">ফলাফল দেখতে প্রথমে শ্রেণী নির্বাচন করুন</p>
          </div>
        )}
      </motion.div>

      {/* Result Entry Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">রেজাল্ট এন্ট্রি</h3>
                  <p className="text-emerald-600 font-bold">{selectedStudent?.name} | {selectedExam}</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><CloseIcon className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                {studentSubjects.map((sub, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="flex-1">
                      <p className="font-bold text-slate-700 mb-1">{sub.name}</p>
                    </div>
                    <div className="w-32">
                      <input 
                        type="number"
                        value={sub.marks} 
                        onChange={(e) => {
                          const newSubs = [...studentSubjects];
                          newSubs[i].marks = e.target.value;
                          setStudentSubjects(newSubs);
                        }}
                        placeholder="নম্বর" 
                        className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-center" 
                      />
                    </div>
                  </div>
                ))}
                
                {classSubjects.length === 0 && (
                   <div className="text-center p-4 bg-amber-50 text-amber-800 rounded-xl text-sm">
                     সতর্কতা: এই শ্রেণীর জন্য কোন বিষয় নির্ধারণ করা হয়নি। 'বিষয় ব্যবস্থাপনা' ট্যাব থেকে বিষয় যুক্ত করুন।
                   </div>
                )}
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <div className="text-slate-900 font-black">
                  মোট: {studentSubjects.reduce((sum, s) => sum + (Number(s.marks) || 0), 0)}
                </div>
                <LoadingButton 
                  loading={loading}
                  onClick={handleSaveResult}
                  className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-black"
                >
                  <Save className="w-5 h-5" /> রেজাল্ট সেভ করুন
                </LoadingButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


function FeeManager({ students, settings, onUpdate, initialStudentId, classesList }: { students: any[], settings: any, onUpdate: () => void, initialStudentId?: string, classesList: string[] }) {
  const { addToast } = useToast();
  const classes = ["All", ...classesList];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthsBn = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

  const [activeTab, setActiveTab] = useState("collection");
  const [selectedClass, setSelectedClass] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeeIds, setSelectedFeeIds] = useState<number[]>([]);
  const [feeAmountAdjust, setFeeAmountAdjust] = useState<{[key: number]: number}>({});
  const [paying, setPaying] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const [confirmApprove, setConfirmApprove] = useState<any>(null);
  const [confirmReject, setConfirmReject] = useState<any>(null);

  // Monthly Fee State
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [monthlyFeeAmountAdjust, setMonthlyFeeAmountAdjust] = useState<number | null>(null);
  const [monthlyFeeDiscount, setMonthlyFeeDiscount] = useState<number>(0);
  const [generalFeeDiscount, setGeneralFeeDiscount] = useState<number>(0);

  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // Setup Form State
  const [setupClass, setSetupClass] = useState("All");
  const [setupAmount, setSetupAmount] = useState("");
  const [classAmounts, setClassAmounts] = useState<{[key: string]: string}>({});
  const [setupName, setSetupName] = useState(""); // For Exam Name
  const [generating, setGenerating] = useState(false);
  const [feeSetups, setFeeSetups] = useState<any[]>([]);
  const [isDeletingSetup, setIsDeletingSetup] = useState<any>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedSetupStatus, setSelectedSetupStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [statusClassFilter, setStatusClassFilter] = useState<string>("All");

  const fetchFeeSetups = async () => {
    try {
      const res = await fetch("/api/admin/fee-setups");
      const data = await res.json();
      setFeeSetups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch fee setups", error);
      setFeeSetups([]);
    }
  };

  useEffect(() => {
    if (activeTab === "setup") {
      fetchFeeSetups();
    }
  }, [activeTab]);

  useEffect(() => {
    if (initialStudentId) {
      const student = students.find(s => s.id === initialStudentId);
      if (student) {
        setSelectedStudent(student);
        setSelectedClass(student.class);
        fetchStudentFees(student.id);
      }
    }
  }, [initialStudentId, students]);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingPayments();
    }
  }, [activeTab]);

  const fetchPendingPayments = async () => {
    setLoadingPending(true);
    try {
      const res = await fetch("/api/admin/online-payments");
      const data = await res.json();
      setPendingPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPendingPayments([]);
    }
    setLoadingPending(false);
  };

  const handleApprovePending = async (payment: any) => {
    setConfirmApprove(payment);
  };

  const executeApprovePending = async () => {
    if (!confirmApprove) return;
    const payment = confirmApprove;
    setConfirmApprove(null);
    try {
      const res = await fetch(`/api/admin/pending-payments/${payment.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        addToast("পেমেন্ট সফলভাবে এপ্রুভ করা হয়েছে।", "success");
        
        // WhatsApp Notification
        if (settings.auto_whatsapp && payment.studentWhatsapp) {
          const message = `আসসালামু আলাইকুম, ${payment.studentName} এর অভিভাবক, আপনার ${payment.months.join(", ")} ${payment.year} মাসের বেতন ৳${payment.amount} সফলভাবে রিসিভ করা হয়েছে। ধন্যবাদ।`;
          const whatsappUrl = `https://wa.me/${payment.studentWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }

        fetchPendingPayments();
        onUpdate();
      } else {
        addToast("পেমেন্ট এপ্রুভ করতে সমস্যা হয়েছে।", "error");
      }
    } catch (error) {
      addToast("পেমেন্ট এপ্রুভ করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleRejectPending = async (payment: any) => {
    setConfirmReject(payment);
  };

  const executeRejectPending = async () => {
    if (!confirmReject) return;
    const payment = confirmReject;
    setConfirmReject(null);
    try {
      const res = await fetch(`/api/admin/pending-payments/${payment.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        addToast("পেমেন্ট বাতিল করা হয়েছে।", "success");
        fetchPendingPayments();
      } else {
        addToast("পেমেন্ট বাতিল করতে সমস্যা হয়েছে।", "error");
      }
    } catch (error) {
      addToast("পেমেন্ট বাতিল করতে সমস্যা হয়েছে।", "error");
    }
  };

  const fetchStudentFees = async (studentId: string) => {
    setLoading(true);
    const res = await fetch(`/api/students/${studentId}/full-profile`);
    const data = await res.json();
    setStudentFees(data.fees);
    setLoading(false);
    setSelectedFeeIds([]);
    setFeeAmountAdjust({});
    setSelectedMonths([]);
    setMonthlyFeeAmountAdjust(null);
  };

  const fetchFeeSetupStatus = async (setupId: string) => {
    setLoadingStatus(true);
    try {
      const res = await fetch(`/api/admin/fee-setups/${setupId}/status`);
      const data = await res.json();
      setSelectedSetupStatus({ ...data, id: setupId });
    } catch (error) {
      console.error(error);
      addToast("স্ট্যাটাস লোড করতে সমস্যা হয়েছে।", "error");
    }
    setLoadingStatus(false);
  };

  const handleMonthToggle = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/fees/bulk-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: setupName,
          amount: setupClass === "All" ? undefined : Number(setupAmount),
          classAmounts: setupClass === "All" ? classAmounts : undefined,
          className: setupClass
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`সফলভাবে ${data.count} জন ছাত্রের ফি জেনারেট করা হয়েছে।`, "success");
        setSetupName("");
        setSetupAmount("");
        fetchFeeSetups();
      } else {
        addToast("ফি জেনারেট করতে সমস্যা হয়েছে।", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("ফি জেনারেট করতে সমস্যা হয়েছে।", "error");
    }
    setGenerating(false);
  };

  const handlePayMonthlyFees = async () => {
    if (selectedMonths.length === 0) return;
    setPaying(true);
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const amountPerMonth = monthlyFeeAmountAdjust !== null ? monthlyFeeAmountAdjust : (selectedStudent?.monthly_fee || 0);
    const subTotal = amountPerMonth * selectedMonths.length;
    const totalAmount = Math.max(0, subTotal - monthlyFeeDiscount);

    try {
      const response = await fetch("/api/pay-monthly-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          student_id: selectedStudent.id,
          student_name: selectedStudent.name,
          year: selectedYear,
          months: selectedMonths,
          total_amount: totalAmount,
          discount: monthlyFeeDiscount,
          transaction_id: transactionId 
        })
      });
      
      if (response.ok) {
        // Prepare Receipt Data
        setReceiptData({
          student: selectedStudent,
          fees: [{ category: `মাসিক বেতন (${selectedMonths.join(", ")} ${selectedYear})`, paidAmount: subTotal }],
          subTotal: subTotal,
          discount: monthlyFeeDiscount,
          total: totalAmount,
          date: new Date().toISOString(),
          transactionId: transactionId
        });
        
        setShowReceipt(true);
        setSelectedMonths([]);
        setMonthlyFeeAmountAdjust(null);
        setMonthlyFeeDiscount(0);
        fetchStudentFees(selectedStudent.id);
        onUpdate();
        
        // WhatsApp logic
        if (settings.auto_whatsapp && selectedStudent.whatsapp) {
          const doc = new jsPDF();
          doc.setFillColor(6, 78, 59);
          doc.rect(0, 0, 210, 40, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(24);
          doc.text("AL HERA MADRASA", 105, 25, { align: "center" });
          doc.setFontSize(10);
          doc.text("Payment Receipt", 105, 32, { align: "center" });

          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          doc.text(`Receipt No: ${transactionId}`, 20, 55);
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 55);

          doc.setFontSize(14);
          doc.text("Student Information", 20, 70);
          doc.setFontSize(10);
          doc.text(`Name: ${selectedStudent.name}`, 20, 80);
          doc.text(`ID: ${selectedStudent.studentId || selectedStudent.id}`, 20, 85);
          doc.text(`Class: ${selectedStudent.class}`, 20, 90);

          const tableData = [[`মাসিক বেতন (${selectedMonths.join(", ")} ${selectedYear})`, `BDT ${subTotal}`]];
          
          (doc as any).autoTable({
            startY: 100,
            head: [['Description', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [6, 78, 59] }
          });

          const finalY = (doc as any).lastAutoTable.finalY || 150;
          doc.setFontSize(10);
          doc.text("Subtotal:", 130, finalY + 10);
          doc.text(`BDT ${subTotal}.00`, 170, finalY + 10);
          
          if (monthlyFeeDiscount > 0) {
            doc.setTextColor(220, 38, 38);
            doc.text("Discount:", 130, finalY + 17);
            doc.text(`- BDT ${monthlyFeeDiscount}.00`, 170, finalY + 17);
            doc.setTextColor(0, 0, 0);
          }

          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Total Paid:", 130, finalY + 27);
          doc.text(`BDT ${totalAmount}.00`, 170, finalY + 27);
          doc.setFont("helvetica", "normal");

          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

          doc.save(`Receipt_${selectedStudent.id}_${transactionId}.pdf`);

          const message = `আসসালামু আলাইকুম,\nআপনার পেমেন্ট সফল হয়েছে।\nরশিদ নং: ${transactionId}\nমোট: ৳${totalAmount}\n\nরশিদের পিডিএফ ফাইলটি ডাউনলোড হয়েছে, দয়া করে সেটি এখানে সংযুক্ত করুন।`;
          const whatsappUrl = `https://wa.me/${selectedStudent.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        }
      } else {
        addToast("পেমেন্ট করতে সমস্যা হয়েছে।", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("পেমেন্ট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (selectedFeeIds.length === 0) return;
    setPaying(true);

    const paidAmounts: any = {};
    let subTotal = 0;
    selectedFeeIds.forEach(id => {
      const amount = feeAmountAdjust[id] !== undefined ? feeAmountAdjust[id] : studentFees.find(f => f.id === id).amount;
      paidAmounts[id] = amount;
      subTotal += amount;
    });

    const totalPaid = Math.max(0, subTotal - generalFeeDiscount);

    try {
      const res = await fetch("/api/admin/fees/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fee_ids: selectedFeeIds,
          paid_amounts: paidAmounts,
          discount: generalFeeDiscount,
          total_paid: totalPaid,
          payment_method: "cash"
        })
      });
      
      if (res.ok) {
        const payData = await res.json();
        const transactionId = payData.transaction_id || `TRX-${Date.now()}`;
        
        // Prepare Receipt Data
        const paidFees = studentFees.filter(f => selectedFeeIds.includes(f.id)).map(f => ({
          ...f,
          paidAmount: paidAmounts[f.id]
        }));
        
        setReceiptData({
          student: selectedStudent,
          fees: paidFees,
          subTotal: subTotal,
          discount: generalFeeDiscount,
          total: totalPaid,
          date: new Date().toISOString(),
          transactionId: transactionId
        });
        
        setShowReceipt(true);
        setGeneralFeeDiscount(0);
        fetchStudentFees(selectedStudent.id);
        onUpdate(); // Update stats

        if (settings.auto_whatsapp && selectedStudent.whatsapp) {
          const doc = new jsPDF();
          // Use the same transactionId
          
          doc.setFontSize(20);
          doc.setTextColor(6, 78, 59);
          doc.text(settings.title || "Al Hera Madrasa", 105, 20, { align: "center" });
          
          doc.setFontSize(12);
          doc.setTextColor(100, 100, 100);
          doc.text("Payment Receipt", 105, 30, { align: "center" });
          
          doc.setFontSize(10);
          doc.setTextColor(50, 50, 50);
          doc.text(`Receipt No: ${transactionId}`, 14, 45);
          doc.text(`Date: ${new Date().toLocaleDateString('bn-BD')}`, 14, 52);
          
          doc.text(`Student Name: ${selectedStudent.name}`, 14, 65);
          doc.text(`Student ID: ${selectedStudent.studentId || selectedStudent.id}`, 14, 72);
          doc.text(`Class: ${selectedStudent.class} | Roll: ${selectedStudent.roll}`, 14, 79);
          
          const tableData = paidFees.map((f: any) => [
            f.category,
            `BDT ${f.paidAmount}`,
            "PAID",
            transactionId
          ]);

          (doc as any).autoTable({
            startY: 90,
            head: [["Category", "Amount", "Status", "Transaction ID"]],
            body: tableData,
            theme: "striped",
            headStyles: { fillColor: [6, 78, 59] }
          });

          const finalY = (doc as any).lastAutoTable.finalY + 10;
          doc.setFontSize(10);
          doc.text("Subtotal:", 130, finalY);
          doc.text(`BDT ${subTotal}.00`, 170, finalY);

          if (generalFeeDiscount > 0) {
            doc.setTextColor(220, 38, 38);
            doc.text("Discount:", 130, finalY + 7);
            doc.text(`- BDT ${generalFeeDiscount}.00`, 170, finalY + 7);
            doc.setTextColor(0, 0, 0);
          }

          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("Total Paid:", 130, finalY + 17);
          doc.text(`BDT ${totalPaid}.00`, 170, finalY + 17);
          doc.setFont("helvetica", "normal");

          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

          doc.save(`Receipt_${selectedStudent.id}_${transactionId}.pdf`);

                    const message = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\nরশিদ নং: ${transactionId}\nমোট পরিমাণ: ৳${totalPaid}\n\nরশিদের পিডিএফ ফাইলটি ডাউনলোড হয়েছে, দয়া করে সেটি এখানে সংযুক্ত করুন।`;
                    const cleanPhone = selectedStudent.whatsapp ? selectedStudent.whatsapp.replace(/[^0-9]/g, '') : '';
                    let phone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
                    
                    if (!phone) {
                      const manualPhone = window.prompt("ছাত্রের হোয়াটসঅ্যাপ নম্বর দেওয়া নেই! দয়া করে নম্বরটি দিন (যেমন: 01712345678):", "");
                      if (manualPhone) {
                        const cleanManual = manualPhone.replace(/[^0-9]/g, '');
                        phone = cleanManual.startsWith('0') ? '88' + cleanManual : cleanManual;
                      } else {
                        return;
                      }
                    }
                    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                    window.open(waUrl, '_blank');
        }
      } else {
        addToast("পেমেন্ট ব্যর্থ হয়েছে।", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("পেমেন্ট ব্যর্থ হয়েছে।", "error");
    }
    setPaying(false);
  };

  const handleDeleteSetup = async () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "1234";
    if ((deletePassword !== adminPassword && deletePassword !== "১২৩৪")) {
      addToast("ভুল পাসওয়ার্ড!", "error");
      return;
    }

    try {
      const res = await fetch(`/api/admin/fee-setups/${isDeletingSetup.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });
      if (res.ok) {
        addToast("ফি সেটআপ সফলভাবে ডিলিট করা হয়েছে।", "success");
        setIsDeletingSetup(null);
        setDeletePassword("");
        fetchFeeSetups();
      } else {
        addToast("ডিলিট করতে সমস্যা হয়েছে।", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("ডিলিট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const filteredStudents = students.filter(s => {
    if (selectedClass === "All") return false; // Require class selection
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.roll.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && s.class === selectedClass;
  });

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={!!confirmApprove} 
        message="আপনি কি নিশ্চিত যে এই পেমেন্টটি এপ্রুভ করতে চান?" 
        onConfirm={executeApprovePending} 
        onCancel={() => setConfirmApprove(null)} 
      />
      <ConfirmModal 
        isOpen={!!confirmReject} 
        message="আপনি কি নিশ্চিত যে এই পেমেন্টটি বাতিল করতে চান?" 
        onConfirm={executeRejectPending} 
        onCancel={() => setConfirmReject(null)} 
      />
      <div className="flex gap-4 bg-white p-2 rounded-2xl w-fit shadow-sm border border-slate-100">
        <button 
          onClick={() => setActiveTab("collection")}
          className={cn("px-6 py-2 rounded-xl font-bold transition-all", activeTab === "collection" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
        >
          বেতন আদায়
        </button>
        <button 
          onClick={() => setActiveTab("pending")}
          className={cn("px-6 py-2 rounded-xl font-bold transition-all", activeTab === "pending" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
        >
          অনলাইন পেমেন্ট
        </button>
        <button 
          onClick={() => setActiveTab("setup")}
          className={cn("px-6 py-2 rounded-xl font-bold transition-all", activeTab === "setup" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
        >
          ফি সেটআপ
        </button>
      </div>

      {activeTab === "pending" && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6">অনলাইন পেমেন্ট হিস্টোরি</h3>
          {loadingPending ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : pendingPayments.length === 0 ? (
            <p className="text-center text-slate-400 py-12 font-bold">কোনো অনলাইন পেমেন্ট নেই</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-slate-500 text-sm">ছাত্রের নাম</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">মাস ও বছর</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">পরিমাণ</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">মেথড</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">TrxID / Phone</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">রেফারেন্স</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">তারিখ</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm">স্ট্যাটাস</th>
                    <th className="pb-4 font-bold text-slate-500 text-sm text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-4 font-bold text-slate-900">{payment.studentName}</td>
                      <td className="py-4 text-slate-600">{payment.months.join(", ")} {payment.year}</td>
                      <td className="py-4 font-bold text-emerald-700">৳{payment.amount}</td>
                      <td className="py-4 uppercase text-xs font-black text-slate-500">{payment.method}</td>
                      <td className="py-4">
                        {payment.transactionId && (
                          <div className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">
                            {payment.transactionId}
                          </div>
                        )}
                        {payment.senderPhone && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            Phone: {payment.senderPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-slate-600 text-xs font-bold">{payment.reference || "-"}</td>
                      <td className="py-4 text-slate-400 text-xs">{new Date(payment.createdAt).toLocaleString()}</td>
                      <td className="py-4 text-xs font-bold">
                        {payment.status === "completed" ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">সফল</span>
                        ) : payment.status === "rejected" ? (
                          <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">বাতিল</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">পেন্ডিং</span>
                        )}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {payment.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleApprovePending(payment)}
                              className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200"
                            >
                              এপ্রুভ
                            </button>
                            <button 
                              onClick={() => handleRejectPending(payment)}
                              className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200"
                            >
                              বাতিল
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "setup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fee Setup Form */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600"><FileText className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900">নতুন ফি সেটআপ</h3>
            </div>
            
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ফি এর নাম</label>
                <input 
                  value={setupName} 
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="যেমন: বার্ষিক পরীক্ষা ২০২৪"
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">শ্রেণী</label>
                <select 
                  value={setupClass} 
                  onChange={(e) => setSetupClass(e.target.value)}
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                >
                  {classes.map(c => <option key={c} value={c}>{c === "All" ? "সকল শ্রেণী" : c}</option>)}
                </select>
              </div>

              {setupClass !== "All" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">টাকার পরিমাণ</label>
                  <input 
                    type="number" 
                    value={setupAmount} 
                    onChange={(e) => setSetupAmount(e.target.value)}
                    placeholder="যেমন: 300"
                    className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                    required
                  />
                </div>
              )}

              {setupClass === "All" && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500">প্রতিটি শ্রেণীর জন্য টাকার পরিমাণ নির্ধারণ করুন:</p>
                  {classes.filter(c => c !== "All").map(c => (
                    <div key={c} className="flex items-center gap-4">
                      <label className="w-24 font-bold text-slate-700">{c} শ্রেণী</label>
                      <input
                        type="number"
                        placeholder="পরিমাণ"
                        value={classAmounts[c] || ""}
                        onChange={(e) => setClassAmounts({...classAmounts, [c]: e.target.value})}
                        className="flex-1 p-3 bg-slate-50 border rounded-xl font-bold"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <LoadingButton loading={generating} type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700">
                ফি জেনারেট করুন
              </LoadingButton>
            </form>
          </div>

          {/* Existing Setups List */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><History className="w-6 h-6" /></div>
              <h3 className="text-xl font-black text-slate-900">পূর্বের সেটআপসমূহ</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {feeSetups.length > 0 ? feeSetups.map((setup) => (
                <div 
                  key={setup.id} 
                  onClick={() => fetchFeeSetupStatus(setup.id)}
                  className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">
                      ফি সেটআপ
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeletingSetup(setup);
                      }}
                      className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-lg mb-1">{setup.name}</h4>
                    <p className="text-xs text-slate-500 font-bold">শ্রেণী: {setup.className === "All" ? "সকল" : setup.className}</p>
                    <p className="text-xs text-slate-400 font-bold mt-2">তারিখ: {new Date(setup.created_at).toLocaleDateString('bn-BD')}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center py-20 text-slate-400 font-bold bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  কোন সেটআপ পাওয়া যায়নি
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fee Setup Status Modal */}
      <AnimatePresence>
        {selectedSetupStatus && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">ফি স্ট্যাটাস</h3>
                  <p className="text-slate-500 font-bold mt-1">মোট: {selectedSetupStatus.total} | পরিশোধিত: {selectedSetupStatus.paidCount} | বকেয়া: {selectedSetupStatus.unpaidCount}</p>
                </div>
                <button onClick={() => setSelectedSetupStatus(null)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm border border-slate-100">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 flex gap-4 bg-white border-b border-slate-100">
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl flex-1">
                  <button onClick={() => setStatusFilter('all')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm transition-all", statusFilter === 'all' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>সকল</button>
                  <button onClick={() => setStatusFilter('paid')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm transition-all", statusFilter === 'paid' ? "bg-emerald-50 text-emerald-600 shadow-sm" : "text-slate-500")}>পরিশোধিত</button>
                  <button onClick={() => setStatusFilter('unpaid')} className={cn("flex-1 py-2 rounded-lg font-bold text-sm transition-all", statusFilter === 'unpaid' ? "bg-rose-50 text-rose-600 shadow-sm" : "text-slate-500")}>বকেয়া</button>
                </div>
                <select 
                  value={statusClassFilter} 
                  onChange={(e) => setStatusClassFilter(e.target.value)}
                  className="p-3 bg-slate-50 border rounded-xl font-bold outline-none min-w-[150px]"
                >
                  {classes.map(c => <option key={c} value={c}>{c === "All" ? "সকল শ্রেণী" : c}</option>)}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(statusFilter === 'all' || statusFilter === 'paid' ? selectedSetupStatus.paidStudents : [])
                    .filter((s: any) => statusClassFilter === "All" || s.student_class === statusClassFilter)
                    .map((student: any) => (
                    <div key={student.id} className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{student.student_name}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1">শ্রেণী: {student.student_class} | রোল: {student.student_roll}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black">পরিশোধিত</span>
                        <p className="text-sm font-black text-slate-900 mt-1">৳{student.amount}</p>
                      </div>
                    </div>
                  ))}
                  
                  {(statusFilter === 'all' || statusFilter === 'unpaid' ? selectedSetupStatus.unpaidStudents : [])
                    .filter((s: any) => statusClassFilter === "All" || s.student_class === statusClassFilter)
                    .map((student: any) => (
                    <div key={student.id} className="p-4 bg-white rounded-2xl border border-rose-100 shadow-sm flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900">{student.student_name}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1">শ্রেণী: {student.student_class} | রোল: {student.student_roll}</p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-black">বকেয়া</span>
                        <button 
                          onClick={() => {
                            setSelectedSetupStatus(null);
                            setActiveTab("collection");
                            setSelectedClass(student.student_class);
                            setSelectedStudent({ id: student.student_id, name: student.student_name, class: student.student_class, roll: student.student_roll });
                            fetchStudentFees(student.student_id);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                        >
                          পরিশোধ করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Setup Confirmation Modal */}
      <AnimatePresence>
        {isDeletingSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">সেটআপ ডিলিট করুন</h3>
              <p className="text-slate-500 mb-6 font-bold">আপনি কি নিশ্চিত? এটি সকল ছাত্রের এই ফি টি ডিলিট করে দিবে।</p>
              
              <div className="space-y-4">
                <input 
                  type="password" 
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="এডমিন পাসওয়ার্ড দিন"
                  className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold text-center"
                />
                <div className="flex gap-4">
                  <button onClick={() => setIsDeletingSetup(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">বাতিল</button>
                  <button onClick={handleDeleteSetup} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">ডিলিট করুন</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === "collection" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 sticky top-4">
              <div className="space-y-4">
                <input 
                  placeholder="নাম, আইডি বা রোল দিয়ে খুঁজুন..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                />
                <div className="flex flex-wrap gap-2 pb-2">
                  {classes.map(c => (
                    <button 
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                        selectedClass === c ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {c === "All" ? "সকল" : c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
                {selectedClass === "All" ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Users className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold">ছাত্রদের তালিকা দেখতে একটি শ্রেণী নির্বাচন করুন</p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold">কোন ছাত্র পাওয়া যায়নি</div>
                ) : (
                  filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => { setSelectedStudent(student); fetchStudentFees(student.id); }}
                      className={cn(
                        "p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border",
                        selectedStudent?.id === student.id 
                          ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                          : "bg-white border-transparent hover:bg-slate-50"
                      )}
                    >
                      <img src={student.photo_url || `https://picsum.photos/seed/${student.id}/50`} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                      <div>
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500 font-bold">ID: {student.studentId || student.id} | Roll: {student.roll}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Fee Collection Panel */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6 mb-8 border-b border-slate-100 pb-6">
                  <img src={selectedStudent.photo_url || `https://picsum.photos/seed/${selectedStudent.id}/100`} className="w-20 h-20 rounded-2xl object-cover bg-slate-100" />
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h2>
                    <p className="text-slate-500 font-bold">শ্রেণী: {selectedStudent.class} | রোল: {selectedStudent.roll}</p>
                    <p className="text-emerald-600 font-bold text-sm mt-1">মাসিক বেতন: ৳{selectedStudent.monthly_fee || 0}</p>
                  </div>
                </div>

                {/* Monthly Fee Section */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-slate-900 text-lg">মাসিক বেতন</h3>
                    <select 
                      value={selectedYear}
                      onChange={(e) => { setSelectedYear(e.target.value); setSelectedMonths([]); }}
                      className="p-2 bg-slate-50 border rounded-xl font-bold text-slate-700 outline-none"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = (new Date().getFullYear() - 2 + i).toString();
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {monthsBn.map(month => {
                      const isPaid = studentFees.some(f => 
                        (f.category === 'মাসিক বেতন' && f.year === selectedYear && f.month === month && f.status === 'paid') ||
                        (f.category === `মাসিক বেতন - ${month} ${selectedYear}` && f.status === 'paid')
                      );
                      const isSelected = selectedMonths.includes(month);
                      return (
                        <button
                          key={month}
                          disabled={isPaid}
                          onClick={() => handleMonthToggle(month)}
                          className={cn(
                            "p-3 rounded-2xl text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 border-2",
                            isPaid 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600 cursor-not-allowed opacity-70" 
                              : isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                                : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                          )}
                        >
                          {isPaid && <CheckCircle2 className="w-4 h-4" />}
                          {month}
                        </button>
                      );
                    })}
                  </div>

                  {selectedMonths.length > 0 && (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mt-4">
                      <div>
                        <p className="text-emerald-800 font-bold">মোট {selectedMonths.length} মাসের বেতন</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-emerald-600 font-bold">৳</span>
                          <input 
                            type="number" 
                            value={monthlyFeeAmountAdjust !== null ? monthlyFeeAmountAdjust : (selectedStudent?.monthly_fee || 0)}
                            onChange={(e) => setMonthlyFeeAmountAdjust(Number(e.target.value))}
                            className="w-24 p-1 border border-emerald-200 rounded-lg font-bold text-right bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="text-emerald-600 font-bold text-sm">/ মাস</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-rose-600 font-bold text-xs uppercase tracking-wider">ডিসকাউন্ট:</span>
                          <input 
                            type="number" 
                            value={monthlyFeeDiscount}
                            onChange={(e) => setMonthlyFeeDiscount(Number(e.target.value))}
                            placeholder="৳ ০"
                            className="w-20 p-1 border border-rose-200 rounded-lg font-bold text-right bg-white focus:ring-2 focus:ring-rose-500 outline-none text-rose-600"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">
                          {monthlyFeeDiscount > 0 && (
                            <p className="text-xs font-bold text-slate-400 line-through">
                              ৳{(monthlyFeeAmountAdjust !== null ? monthlyFeeAmountAdjust : (selectedStudent?.monthly_fee || 0)) * selectedMonths.length}
                            </p>
                          )}
                          <p className="text-2xl font-black text-emerald-700">
                            ৳{Math.max(0, ((monthlyFeeAmountAdjust !== null ? monthlyFeeAmountAdjust : (selectedStudent?.monthly_fee || 0)) * selectedMonths.length) - monthlyFeeDiscount)}
                          </p>
                        </div>
                        <LoadingButton 
                          loading={paying}
                          onClick={handlePayMonthlyFees}
                          className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all text-sm"
                        >
                          বেতন নিন
                        </LoadingButton>
                      </div>
                    </div>
                  )}
                </div>

                {/* Other Fees Section */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-black text-slate-900 text-lg">অন্যান্য বকেয়া ফিস</h3>
                  {loading ? (
                    <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
                  ) : studentFees.filter(f => f.status === 'unpaid' && f.category !== 'মাসিক বেতন' && !f.category.startsWith('মাসিক বেতন -')).length > 0 ? (
                    <div className="space-y-3">
                      {studentFees.filter(f => f.status === 'unpaid' && f.category !== 'মাসিক বেতন' && !f.category.startsWith('মাসিক বেতন -')).map(fee => (
                        <div 
                          key={fee.id}
                          onClick={() => {
                            if (selectedFeeIds.includes(fee.id)) {
                              setSelectedFeeIds(prev => prev.filter(id => id !== fee.id));
                            } else {
                              setSelectedFeeIds(prev => [...prev, fee.id]);
                            }
                          }}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                            selectedFeeIds.includes(fee.id) ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                              selectedFeeIds.includes(fee.id) ? "bg-emerald-500 border-emerald-500" : "border-slate-300"
                            )}>
                              {selectedFeeIds.includes(fee.id) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{fee.category}</p>
                              <p className="text-xs text-slate-500 font-bold">Due: {fee.due_date}</p>
                            </div>
                          </div>
                          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold text-sm">৳</span>
                            <input 
                              type="number" 
                              value={feeAmountAdjust[fee.id] !== undefined ? feeAmountAdjust[fee.id] : fee.amount}
                              onChange={(e) => setFeeAmountAdjust({...feeAmountAdjust, [fee.id]: Number(e.target.value)})}
                              className="w-24 p-2 border rounded-xl font-bold text-right bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">কোন বকেয়া ফিস নেই</p>
                    </div>
                  )}
                </div>

                {selectedFeeIds.length > 0 && (
                  <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4 shadow-xl shadow-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">উপ-মোট (Subtotal)</p>
                        <p className="text-xl font-black mt-1">
                          ৳{selectedFeeIds.reduce((sum, id) => {
                            const amount = feeAmountAdjust[id] !== undefined ? feeAmountAdjust[id] : studentFees.find(f => f.id === id).amount;
                            return sum + amount;
                          }, 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-rose-400 text-xs font-bold uppercase tracking-wider">ডিসকাউন্ট</p>
                        <input 
                          type="number" 
                          value={generalFeeDiscount}
                          onChange={(e) => setGeneralFeeDiscount(Number(e.target.value))}
                          placeholder="৳ ০"
                          className="w-24 p-2 mt-1 bg-slate-800 border border-slate-700 rounded-xl font-bold text-right text-rose-400 focus:ring-2 focus:ring-rose-500 outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="h-px bg-slate-800" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">মোট পেমেন্ট (Net Total)</p>
                        <p className="text-3xl font-black mt-1">
                          ৳{Math.max(0, selectedFeeIds.reduce((sum, id) => {
                            const amount = feeAmountAdjust[id] !== undefined ? feeAmountAdjust[id] : studentFees.find(f => f.id === id).amount;
                            return sum + amount;
                          }, 0) - generalFeeDiscount)}
                        </p>
                        <p className="text-slate-400 text-sm font-bold mt-1">{selectedFeeIds.length} টি ফিস সিলেক্ট করা হয়েছে</p>
                      </div>
                      <LoadingButton 
                        loading={paying}
                        onClick={handlePay}
                        className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/20"
                      >
                        পেমেন্ট কনফার্ম করুন
                      </LoadingButton>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
                <Users className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-black text-slate-900 mb-2">ছাত্র নির্বাচন করুন</h3>
                <p>বাম পাশের তালিকা থেকে ছাত্র নির্বাচন করে বেতন আদায় করুন</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && receiptData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" /> পেমেন্ট সফল হয়েছে
                </h3>
                <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><CloseIcon className="w-6 h-6" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div id="payment-receipt" className="bg-white p-6 border-4 border-slate-900 rounded-3xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6 border-b-2 border-slate-900 pb-4">
                      <div className="flex items-center gap-3">
                        {settings?.logo_url && (
                          <img src={settings.logo_url} className="w-12 h-12 object-contain" alt="Logo" referrerPolicy="no-referrer" />
                        )}
                        <div>
                          <h2 className="text-xl font-black text-slate-900 leading-tight">{settings?.title || "আল-হেরা মাদ্রাসা মধুপুর"}</h2>
                          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{settings?.address || "মাদরাসা ঠিকানা এখানে"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="inline-block px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-md uppercase tracking-widest mb-1">টাকা জমার রশিদ</div>
                          <p className="text-[8px] font-bold text-slate-400">রশিদ নং: <span className="text-slate-900">{receiptData.transactionId}</span></p>
                        </div>
                        {settings?.enable_qr_code && settings?.qr_code_url && (
                          <img src={settings.qr_code_url} className="w-12 h-12 object-contain" alt="QR Code" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ছাত্রের নাম</p>
                          <p className="text-sm font-black text-slate-900">{receiptData.student.name}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">শ্রেণী ও রোল</p>
                          <p className="text-sm font-black text-slate-900">{receiptData.student.class} | রোল: {receiptData.student.roll}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">আইডি নম্বর</p>
                          <p className="text-sm font-black text-slate-900">{receiptData.student.id}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">তারিখ</p>
                          <p className="text-sm font-black text-slate-900">{new Date(receiptData.date).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-slate-900 rounded-xl overflow-hidden mb-6">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="text-left p-2 px-3 font-black text-[10px] uppercase tracking-widest">বিবরণ</th>
                            <th className="text-right p-2 px-3 font-black text-[10px] uppercase tracking-widest">পরিমাণ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {receiptData.fees.map((fee: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-2 px-3 text-xs font-bold text-slate-700">{fee.category}</td>
                              <td className="p-2 px-3 text-xs font-black text-slate-900 text-right">৳{fee.paidAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t-2 border-slate-900">
                          <tr className="bg-slate-50">
                            <td className="p-1 px-3 text-[10px] font-bold text-slate-500">উপ-মোট (Subtotal)</td>
                            <td className="p-1 px-3 text-[10px] font-bold text-slate-500 text-right">৳{receiptData.subTotal || receiptData.total}</td>
                          </tr>
                          {receiptData.discount > 0 && (
                            <tr className="bg-slate-50">
                              <td className="p-1 px-3 text-[10px] font-bold text-rose-500">ডিসকাউন্ট (Discount)</td>
                              <td className="p-1 px-3 text-[10px] font-bold text-rose-500 text-right">- ৳{receiptData.discount}</td>
                            </tr>
                          )}
                          <tr className="bg-slate-100">
                            <td className="p-2 px-3 font-black text-slate-900 text-sm">সর্বমোট আদায় (Net Total)</td>
                            <td className="p-2 px-3 font-black text-emerald-600 text-right text-lg">৳{receiptData.total}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="mt-12 flex justify-between items-end px-4">
                      <div className="text-center">
                        <div className="w-32 border-t-2 border-slate-900 mb-1"></div>
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">আদায়কারীর স্বাক্ষর</p>
                      </div>
                      <div className="text-center relative">
                        {settings?.show_muhtamim_signature && settings?.muhtamim_signature_url && (
                          <img 
                            src={settings.muhtamim_signature_url} 
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-10 object-contain pointer-events-none" 
                            alt="Signature" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="w-32 border-t-2 border-slate-900 mb-1"></div>
                        <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">মুহতামিম সাহেবের স্বাক্ষর</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3 justify-center sticky bottom-0 z-20">
                <button 
                  onClick={() => printElement('payment-receipt')}
                  className="px-5 py-2.5 bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all text-sm"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট করুন
                </button>
                <button 
                  onClick={() => downloadPDF('payment-receipt', `Receipt_${receiptData.transactionId}.pdf`, addToast, 'a5')}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all text-sm"
                >
                  <Download className="w-4 h-4" /> PDF ডাউনলোড
                </button>
                <button 
                  onClick={async () => {
                    await downloadPDF('payment-receipt', `Receipt_${receiptData.transactionId}.pdf`, addToast, 'a5');
                    const details = receiptData.fees.map((item: any) => `${item.category}: ৳${item.paidAmount}`).join('\n');
                    const text = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\nরশিদ নং: ${receiptData.transactionId}\nতারিখ: ${new Date(receiptData.date).toLocaleDateString('bn-BD')}\n\nবিস্তারিত:\n${details}\n------------------\nমোট পরিমাণ: ৳${receiptData.total}\n\nরশিদের পিডিএফ ফাইলটি ডাউনলোড হয়েছে, দয়া করে সেটি এখানে সংযুক্ত করুন।`;
                    const cleanPhone = receiptData.student.whatsapp ? receiptData.student.whatsapp.replace(/[^0-9]/g, '') : '';
                    const phone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp শেয়ার
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="px-5 py-2.5 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-all text-sm"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TransactionHistory({ settings }: { settings: any }) {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDeleting, setIsDeleting] = useState<any>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [historySearch, setHistorySearch] = useState("");
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [displayCount, setDisplayCount] = useState(30);

  const fetchTransactions = () => {
    setLoading(true);
    setDisplayCount(30);
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    
    fetch(`/api/admin/all-history?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const sortedData = Array.isArray(data) 
          ? [...data].sort((a, b) => new Date(b.timestamp || b.date || 0).getTime() - new Date(a.timestamp || a.date || 0).getTime())
          : [];
        setTransactions(sortedData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history", err);
        setTransactions([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate]);

  const handleDelete = async () => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "1234";
    if ((deletePassword !== adminPassword && deletePassword !== "১২৩৪")) {
      addToast("ভুল পাসওয়ার্ড!", "error");
      return;
    }

    try {
      const res = await fetch(`/api/admin/all-history/${isDeleting.type}/${isDeleting.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });

      if (res.ok) {
        addToast("হিস্টোরি সফলভাবে ডিলিট করা হয়েছে।", "success");
        setIsDeleting(null);
        setDeletePassword("");
        fetchTransactions();
      } else {
        const data = await res.json();
        addToast(data.error || "ডিলিট করতে সমস্যা হয়েছে।", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("ডিলিট করতে সমস্যা হয়েছে।", "error");
    }
  };

  const handleViewProfile = async (studentId: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/students/${studentId}/full-profile`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudentProfile(data);
      } else {
        addToast("প্রোফাইল পাওয়া যায়নি।", "error");
      }
    } catch (error) {
      console.error(error);
      addToast("প্রোফাইল লোড করতে সমস্যা হয়েছে।", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleViewReceipt = (t: any) => {
    setReceiptData({
      transactionId: t.transaction_id,
      student: {
        name: t.student_name,
        class: t.student_class,
        roll: t.student_roll,
        id: t.student_id,
        whatsapp: t.student_whatsapp || ""
      },
      date: t.date,
      fees: [{ category: t.category, paidAmount: t.amount }],
      total: t.amount
    });
    setShowReceipt(true);
  };

  const filteredTransactions = transactions.filter(t => 
    (t.transaction_id || "").toLowerCase().includes(historySearch.toLowerCase()) ||
    (t.student_name || "").toLowerCase().includes(historySearch.toLowerCase()) ||
    (t.receipt_number || "").toLowerCase().includes(historySearch.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(historySearch.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 print:shadow-none print:border-0 gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-900">সকল হিস্টোরি</h3>
          <p className="text-slate-500 font-bold mt-1">আয়, ব্যয় এবং বেতনের বিস্তারিত তালিকা</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (!endDate || e.target.value > endDate) setEndDate(e.target.value);
              }}
              className="p-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
            <span className="text-slate-400 font-bold">থেকে</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (!startDate || e.target.value < startDate) setStartDate(e.target.value);
              }}
              className="p-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              placeholder="রশিদ নং বা নাম দিয়ে খুঁজুন..." 
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button onClick={() => window.print()} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all print:hidden">
            <Printer className="w-6 h-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden print:shadow-none print:border-0 print:overflow-visible print:p-0">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">তারিখ ও সময়</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">ধরন</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">নাম/বিবরণ</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">খাত</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">রশিদ নং</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">পরিমাণ</th>
                  <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right print:hidden">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTransactions.slice(0, displayCount).map((t) => (
                  <tr key={`trans-${t.id}`} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="p-4 font-bold text-slate-500 text-sm" onClick={() => t.type === 'fee' && handleViewReceipt(t)}>
                      {new Date(t.date).toLocaleString('bn-BD')}
                    </td>
                    <td className="p-4" onClick={() => t.type === 'fee' && handleViewReceipt(t)}>
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-xs font-black uppercase tracking-widest",
                        t.type === 'fee' ? "bg-emerald-100 text-emerald-700" :
                        t.type === 'income' ? "bg-blue-100 text-blue-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {t.type === 'fee' ? 'বেতন' : t.type === 'income' ? 'আয়' : 'ব্যয়'}
                      </span>
                    </td>
                    <td className="p-4 font-black text-slate-900" onClick={() => t.type === 'fee' && handleViewProfile(t.student_id)}>
                      {t.student_name || t.description || '-'}
                      {t.student_class && <span className="ml-2 text-xs font-bold text-slate-500">({t.student_class} | রোল: {t.student_roll})</span>}
                      {t.student_deleted_at && <span className="ml-2 text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">(ডিলিটেড)</span>}
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-600" onClick={() => t.type === 'fee' && handleViewReceipt(t)}>
                      {t.category}
                    </td>
                    <td className="p-4 text-xs font-mono font-bold text-slate-400 bg-slate-50 rounded-lg inline-block my-2 px-2 py-1" onClick={() => t.type === 'fee' && handleViewReceipt(t)}>
                      {t.transaction_id || 'N/A'}
                    </td>
                    <td className={cn(
                      "p-4 font-black text-right",
                      t.type === 'expense' ? "text-rose-600" : "text-emerald-600"
                    )} onClick={() => t.type === 'fee' && handleViewReceipt(t)}>
                      {t.type === 'expense' ? '-' : '+'}৳{t.amount}
                    </td>
                    <td className="p-4 text-right print:hidden">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleting(t);
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-bold">কোন হিস্টোরি পাওয়া যায়নি</td></tr>
                )}
              </tbody>
            </table>
            
            {filteredTransactions.length > displayCount && (
              <div className="p-6 border-t border-slate-100 flex justify-center print:hidden">
                <button 
                  onClick={() => setDisplayCount(prev => prev + 30)}
                  className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  আরো দেখুন ({filteredTransactions.length - displayCount} টি বাকি)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && receiptData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">পেমেন্ট রসিদ</h3>
                </div>
                <button onClick={() => setShowReceipt(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div id="history-receipt" className="bg-white p-8 border-4 border-slate-900 rounded-3xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-6">
                      <div className="flex items-center gap-4">
                        {settings?.logo_url && (
                          <img src={settings.logo_url} className="w-16 h-16 object-contain" alt="Logo" referrerPolicy="no-referrer" />
                        )}
                        <div>
                          <h2 className="text-2xl font-black text-slate-900 leading-tight">{settings?.title || "আল-হেরা মাদ্রাসা মধুপুর"}</h2>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{settings?.address || "মাদরাসা ঠিকানা এখানে"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-2">টাকা জমার রশিদ</div>
                          <p className="text-[10px] font-bold text-slate-400">রশিদ নং: <span className="text-slate-900">{receiptData.transactionId}</span></p>
                        </div>
                        {settings?.enable_qr_code && settings?.qr_code_url && (
                          <img src={settings.qr_code_url} className="w-16 h-16 object-contain" alt="QR Code" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ছাত্রের নাম</p>
                          <p className="font-black text-slate-900">{receiptData.student.name}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">শ্রেণী ও রোল</p>
                          <p className="font-black text-slate-900">{receiptData.student.class} | রোল: {receiptData.student.roll}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">আইডি নম্বর</p>
                          <p className="font-black text-slate-900">{receiptData.student.id}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">তারিখ</p>
                          <p className="font-black text-slate-900">{new Date(receiptData.date).toLocaleDateString('bn-BD')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-slate-900 rounded-2xl overflow-hidden mb-8">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-900 text-white">
                            <th className="text-left p-4 font-black text-xs uppercase tracking-widest">বিবরণ</th>
                            <th className="text-right p-4 font-black text-xs uppercase tracking-widest">পরিমাণ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {receiptData.fees.map((fee: any, idx: number) => (
                            <tr key={idx}>
                              <td className="p-4 text-sm font-bold text-slate-700">{fee.category}</td>
                              <td className="p-4 text-sm font-black text-slate-900 text-right">৳{fee.paidAmount}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 border-t-2 border-slate-900">
                            <td className="p-4 font-black text-slate-900">সর্বমোট আদায়</td>
                            <td className="p-4 font-black text-emerald-600 text-right text-xl">৳{receiptData.total}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="mt-16 flex justify-between items-end px-4">
                      <div className="text-center">
                        <div className="w-40 border-t-2 border-slate-900 mb-2"></div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">আদায়কারীর স্বাক্ষর</p>
                      </div>
                      <div className="text-center">
                        <div className="w-40 border-t-2 border-slate-900 mb-2"></div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">মুহতামিম সাহেব</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 justify-center sticky bottom-0 z-20">
                <button 
                  onClick={() => printElement('history-receipt')}
                  className="px-6 py-3 bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg shadow-slate-200"
                >
                  <Printer className="w-5 h-5" /> প্রিন্ট করুন
                </button>
                <button 
                  onClick={() => downloadPDF('history-receipt', `Receipt_${receiptData.transactionId}.pdf`, addToast, 'a5')}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  <Download className="w-5 h-5" /> PDF ডাউনলোড
                </button>
                <button 
                  onClick={async () => {
                    await downloadPDF('history-receipt', `Receipt_${receiptData.transactionId}.pdf`, addToast, 'a5');
                    const text = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\nরশিদ নং: ${receiptData.transactionId}\nমোট পরিমাণ: ৳${receiptData.total}\n\nরশিদের পিডিএফ ফাইলটি ডাউনলোড হয়েছে, দয়া করে সেটি এখানে সংযুক্ত করুন।`;
                    const cleanPhone = receiptData.student.whatsapp ? receiptData.student.whatsapp.replace(/[^0-9]/g, '') : '';
                    const phone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                >
                  <MessageCircle className="w-5 h-5" /> WhatsApp শেয়ার
                </button>
                <button 
                  onClick={() => sendEmailWithPDF('history-receipt', receiptData.student, receiptData.transactionId, receiptData.total, addToast)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <Mail className="w-5 h-5" /> Gmail পাঠান
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {selectedStudentProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-20">
              <h3 className="text-2xl font-black text-slate-900">ছাত্রের প্রোফাইল</h3>
              <button onClick={() => setSelectedStudentProfile(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              <div className="text-center mb-6">
                <img src={selectedStudentProfile.student.photo_url || `https://picsum.photos/seed/${selectedStudentProfile.student.id}/200`} className="w-32 h-32 rounded-3xl mx-auto object-cover shadow-lg mb-4" referrerPolicy="no-referrer" />
                <h3 className="text-2xl font-black text-slate-900">{selectedStudentProfile.student.name}</h3>
                <p className="text-emerald-600 font-bold text-lg">{selectedStudentProfile.student.class} শ্রেণী | রোল: {selectedStudentProfile.student.roll}</p>
                {selectedStudentProfile.student.deleted_at && (
                  <div className="mt-2 inline-block px-4 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black uppercase tracking-widest">
                    ডিলিট করা হয়েছে: {new Date(selectedStudentProfile.student.deleted_at).toLocaleDateString('bn-BD')}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">পিতার নাম</p>
                  <p className="font-black text-slate-900">{selectedStudentProfile.student.father_name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">মাতার নাম</p>
                  <p className="font-black text-slate-900">{selectedStudentProfile.student.mother_name}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">ফোন</p>
                  <p className="font-black text-slate-900">{selectedStudentProfile.student.phone}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase">ঠিকানা</p>
                  <p className="font-black text-slate-900">{selectedStudentProfile.student.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">লেনদেন ডিলিট?</h3>
              <p className="text-slate-500 font-bold mb-6">আপনি কি নিশ্চিতভাবে এই লেনদেনটি ডিলিট করতে চান? এটি ডিলিট হিস্টোরিতে সংরক্ষিত থাকবে।</p>
              
              <input 
                type="password"
                placeholder="অ্যাডমিন পাসওয়ার্ড দিন"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold mb-6 text-center focus:ring-2 focus:ring-rose-500 outline-none"
              />
              
              <div className="flex gap-4">
                <button 
                  onClick={() => { setIsDeleting(null); setDeletePassword(""); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  বাতিল
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all"
                >
                  ডিলিট করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function DeleteHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  const fetchHistory = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    }
    const offset = reset ? 0 : (page + 1) * 50;
    const params = new URLSearchParams();
    params.append("limit", "50");
    params.append("offset", offset.toString());
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    try {
      const res = await fetch(`/api/admin/delete-history?${params}`);
      const data = await res.json();
      const historyData = Array.isArray(data.data) ? data.data : [];
      if (reset) setHistory(historyData);
      else {
        setHistory(prev => [...prev, ...historyData]);
        setPage(p => p + 1);
      }
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [startDate, endDate]);

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch (e) {
      return details;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-slate-900">ডিলিট হিস্টোরি</h3>
          <p className="text-slate-500 font-bold mt-1">সিস্টেম থেকে ডিলিট করা সকল রেকর্ডের তালিকা (মোট: {total})</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (!endDate || e.target.value > endDate) setEndDate(e.target.value);
            }}
            className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
          />
          <span className="text-slate-400">থেকে</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (!startDate || e.target.value < startDate) setStartDate(e.target.value);
            }}
            className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm"
          />
          <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-xs font-bold text-slate-400 hover:text-slate-600">রিসেট</button>
        </div>
      </div>

      {loading && history.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((h) => {
            const details = parseDetails(h.details);
            return (
              <motion.div 
                key={`history-${h.id}`} 
                whileHover={{ y: -5 }}
                onClick={() => setSelectedHistory(h)}
                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    h.type === 'student' ? "bg-blue-100 text-blue-600" :
                    h.type === 'income' ? "bg-emerald-100 text-emerald-600" :
                    h.type === 'expense' ? "bg-rose-100 text-rose-600" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {h.type === 'student' ? 'ছাত্র' : h.type === 'income' ? 'আয়' : h.type === 'expense' ? 'ব্যয়' : h.type}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400">{new Date(h.deleted_at).toLocaleDateString('bn-BD')}</p>
                </div>
                <h4 className="font-black text-slate-900 mb-1 truncate">
                  {h.type === 'student' ? details.name : 
                   h.type === 'income' || h.type === 'expense' ? details.purpose || details.category :
                   'বিস্তারিত তথ্য'}
                </h4>
                <p className="text-xs text-slate-500 font-bold mb-4">
                  {h.type === 'student' ? `ID: ${details.studentId || details.id}` : 
                   h.type === 'income' || h.type === 'expense' ? `৳${details.amount}` :
                   ''}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">বিস্তারিত দেখুন</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
          {history.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">কোন রেকর্ড পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button 
            onClick={() => fetchHistory(false)}
            className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            আরো দেখুন
          </button>
        </div>
      )}

      {/* History Detail Modal */}
      <AnimatePresence>
        {selectedHistory && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">ডিলিট করা রেকর্ডের বিস্তারিত</h3>
                <button onClick={() => setSelectedHistory(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
                {/* Deletion Info */}
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest">ডিলিট করা হয়েছে</p>
                    <p className="font-bold text-slate-900">{new Date(selectedHistory.deleted_at).toLocaleString('bn-BD')}</p>
                  </div>
                </div>

                {/* Original Record Content */}
                <div className="space-y-6">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">মূল রেকর্ড তথ্য</h4>
                  
                  {selectedHistory.type === 'student' ? (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 flex items-center gap-6 mb-4">
                        <img src={parseDetails(selectedHistory.details).photo_url || `https://picsum.photos/seed/${parseDetails(selectedHistory.details).id}/100`} className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md" />
                        <div>
                          <h2 className="text-2xl font-black text-slate-900">{parseDetails(selectedHistory.details).name}</h2>
                          <p className="text-emerald-600 font-bold">ID: {parseDetails(selectedHistory.details).studentId || parseDetails(selectedHistory.details).id}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase">পিতার নাম</p>
                        <p className="font-bold text-slate-900">{parseDetails(selectedHistory.details).father_name}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase">শ্রেণী</p>
                        <p className="font-bold text-slate-900">{parseDetails(selectedHistory.details).class}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase">মোবাইল</p>
                        <p className="font-bold text-slate-900">{parseDetails(selectedHistory.details).phone}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase">ঠিকানা</p>
                        <p className="font-bold text-slate-900">{parseDetails(selectedHistory.details).address}</p>
                      </div>
                    </div>
                  ) : (selectedHistory.type === 'income' || selectedHistory.type === 'expense') ? (
                    <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 relative overflow-hidden">
                      {/* Receipt Style */}
                      
                      <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-6">
                          <div>
                            <h3 className="text-xl font-black text-slate-900">মানি রিসিট (ডিলিটেড)</h3>
                            <p className="text-xs font-bold text-slate-400">রশিদ নং: {parseDetails(selectedHistory.details).id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-400">তারিখ</p>
                            <p className="font-bold text-slate-900">{new Date(parseDetails(selectedHistory.details).date || parseDetails(selectedHistory.details).created_at).toLocaleDateString('bn-BD')}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">বিবরণ</p>
                            <p className="font-bold text-slate-900 text-lg">{parseDetails(selectedHistory.details).purpose || parseDetails(selectedHistory.details).category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">পরিমাণ</p>
                            <p className="text-3xl font-black text-emerald-600">৳{parseDetails(selectedHistory.details).amount}</p>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-dashed border-slate-200">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">অন্যান্য তথ্য</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-xs font-bold text-slate-600">পেমেন্ট মেথড: {parseDetails(selectedHistory.details).payment_method || 'Cash'}</div>
                            <div className="text-xs font-bold text-slate-600 text-right">সংগৃহীত: {parseDetails(selectedHistory.details).received_by || 'Admin'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                      <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-4 mb-4">বিস্তারিত তথ্য</h4>
                      <div className="space-y-3">
                        {Object.entries(parseDetails(selectedHistory.details)).map(([key, value]) => (
                          <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-50 last:border-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                            <span className="font-bold text-slate-900 text-sm break-all">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setSelectedHistory(null)} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">বন্ধ করুন</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoticeManager({ notices, onUpdate }: any) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ title: "", content: "", is_active: 1, image_url: "", link_url: "", width: "", height: "", allow_comments: false });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);

  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      await fetch(`/api/admin/notices/${editingNotice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      setEditingNotice(null);
    } else {
      await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
    }
    setFormData({ title: "", content: "", is_active: 1, image_url: "", link_url: "", width: "", height: "", allow_comments: false });
    onUpdate();
  };

  const executeDeleteNotice = async () => {
    if (confirmDelete === null) return;
    await fetch(`/api/admin/notices/${confirmDelete}`, { method: "DELETE" });
    setConfirmDelete(null);
    onUpdate();
  };

  const handleDelete = (id: number) => {
    setConfirmDelete(id);
  };

  const handleEdit = (notice: any) => {
    setEditingNotice(notice);
    setFormData({ 
      title: notice.title, 
      content: notice.content, 
      is_active: notice.is_active,
      image_url: notice.image_url || "",
      link_url: notice.link_url || "",
      width: notice.width || "",
      height: notice.height || "",
      allow_comments: !!notice.allow_comments
    });
  };

  const handleSendEmail = async () => {
    if (!formData.title || !formData.content) {
      addToast("দয়া করে শিরোনাম এবং বিস্তারিত লিখুন", "error");
      return;
    }
    
    setSendingEmail(true);
    try {
      // Fetch all students to get their emails
      const res = await fetch("/api/students");
      const students = await res.json();
      const emails = students.map((s: any) => s.email).filter(Boolean);
      
      if (emails.length === 0) {
        addToast("কোনো অভিভাবকের ইমেইল পাওয়া যায়নি।", "error");
        setSendingEmail(false);
        return;
      }

      addToast("নোটিশ সফলভাবে ওয়েবসাইটে আপডেট করা হয়েছে।", "success");
    } catch (error) {
      console.error("Notice error:", error);
      addToast("নোটিশ আপডেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmModal 
        isOpen={confirmDelete !== null} 
        message="আপনি কি নিশ্চিত যে আপনি এই নোটিশটি মুছে ফেলতে চান?" 
        onConfirm={executeDeleteNotice} 
        onCancel={() => setConfirmDelete(null)} 
      />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900">{editingNotice ? "নোটিশ এডিট করুন" : "নতুন নোটিশ"}</h3>
          {editingNotice && (
            <button type="button" onClick={() => { setEditingNotice(null); setFormData({ title: "", content: "" }); }} className="text-sm font-bold text-slate-500 hover:text-slate-800">
              বাতিল করুন
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required placeholder="নোটিশের শিরোনাম" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          <textarea required placeholder="বিস্তারিত" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl h-32" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="ইমেজ ইউআরএল (ঐচ্ছিক)" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
            <input placeholder="লিঙ্ক ইউআরএল (ঐচ্ছিক)" value={formData.link_url} onChange={(e) => setFormData({...formData, link_url: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
            <input placeholder="প্রস্থ (px)" value={formData.width} onChange={(e) => setFormData({...formData, width: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
            <input placeholder="উচ্চতা (px)" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} className="w-full p-4 bg-slate-50 border rounded-2xl" />
          </div>
          <div className="flex items-center gap-6 px-2">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={formData.is_active !== 0}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-5 h-5 accent-emerald-600"
              />
              <label className="text-sm font-bold text-slate-700">সক্রিয় (Active)</label>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="allow_comments"
                checked={formData.allow_comments}
                onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                className="w-5 h-5 accent-emerald-600"
              />
              <label htmlFor="allow_comments" className="text-sm font-bold text-slate-700">কমেন্ট সেকশন চালু করুন</label>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="submit" className="flex-1 py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors">{editingNotice ? "আপডেট করুন" : "নোটিশ পাবলিশ করুন"}</button>
          </div>
        </form>
      </motion.div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">সাম্প্রতিক নোটিশ</h3>
        <div className="space-y-4">
          {notices.map((n: any) => (
            <div key={n.id} className="p-4 border-b border-slate-50 relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-all">
                <button onClick={() => handleEdit(n)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(n.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h4 className="font-bold text-slate-800 pr-16">
                {n.title} 
                {n.is_active === 0 && <span className="text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded-full ml-2">Inactive</span>}
                {n.allow_comments && <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full ml-2 flex items-center gap-1 inline-flex"><MessageSquare className="w-3 h-3" /> {n.comment_count || 0}</span>}
              </h4>
              <p className="text-sm text-slate-500 mt-1">{n.content}</p>
              {n.image_url && (
                <a href={n.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block mt-4">
                  <img 
                    src={n.image_url} 
                    alt={n.title} 
                    className="rounded-2xl object-cover" 
                    style={{ width: n.width || '100%', height: n.height || 'auto' }}
                    referrerPolicy="no-referrer"
                  />
                </a>
              )}
              <p className="text-[10px] text-slate-400 mt-2">{new Date(n.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function DeviceAttendanceManager({ settings }: { settings: any }) {
  const { addToast } = useToast();
  const [deviceId, setDeviceId] = useState("");
  const [type, setType] = useState<"student" | "teacher" | "guardian">("student");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<"online" | "offline">("online");

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/admin/device-history");
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Fetch history failed", error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handlePushAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/device/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deviceId, type })
      });
      const result = await res.json();
      if (result.success) {
        addToast(`${type === 'student' ? 'ছাত্র' : type === 'teacher' ? 'শিক্ষক' : 'অভিভাবক'} ${result.action === 'check_in' ? 'প্রবেশ' : 'প্রস্থান'} সফলভাবে রেকর্ড হয়েছে (${result.time})`, "success");
        setDeviceId("");
        fetchHistory();
      } else {
        addToast("রেকর্ড করতে সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সার্ভার এরর", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900">স্মার্ট ডিভাইস হাজিরা</h2>
          <p className="text-slate-500 font-bold mt-1">ZKTeco K40 ও অন্যান্য ডিভাইসের সাথে কানেকশন</p>
        </div>
        <div className={cn(
          "px-6 py-2 rounded-2xl font-black text-sm flex items-center gap-2",
          deviceStatus === "online" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        )}>
          <div className={cn("w-2 h-2 rounded-full", deviceStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500")}></div>
          ডিভাইস স্ট্যাটাস: {deviceStatus === "online" ? "অনলাইন" : "অফলাইন"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> ম্যানুয়াল এন্ট্রি (টেস্ট)
            </h3>
            <form onSubmit={handlePushAttendance} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">আইডি টাইপ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['student', 'teacher', 'guardian'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        "py-3 rounded-xl font-bold text-xs transition-all",
                        type === t ? "bg-emerald-900 text-white" : "bg-slate-50 text-slate-500 border border-slate-100"
                      )}
                    >
                      {t === 'student' ? 'ছাত্র' : t === 'teacher' ? 'শিক্ষক' : 'অভিভাবক'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ডিভাইস আইডি / কার্ড নাম্বার</label>
                <input 
                  type="text" 
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  placeholder="যেমন: S101"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                  required
                />
              </div>
              <LoadingButton loading={loading} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/20">
                রেকর্ড পুশ করুন
              </LoadingButton>
            </form>
          </div>

          <div className="bg-emerald-900 p-8 rounded-[2.5rem] text-white shadow-xl">
            <h3 className="text-xl font-black mb-4">ডিভাইস কানেকশন গাইড</h3>
            <div className="space-y-4 text-emerald-100 text-sm font-bold">
              <p>যেহেতু মেশিনের বাটনে ইংরেজি টাইপ করা কষ্টকর, তাই আপনি আপনার মোবাইল ফোন ব্যবহার করে খুব সহজেই মেশিনের সেটিং করতে পারবেন। আপনার ফোনটি অবশ্যই মাদরাসার ওয়াইফাই (যে রাউটারে মেশিন লাগানো) এর সাথে কানেক্ট থাকতে হবে।</p>
              <ol className="list-decimal list-inside space-y-3 mt-4">
                <li><strong>মেশিনের IP বের করুন:</strong> মেশিনের Menu &gt; Comm. &gt; Ethernet এ গিয়ে IP Address টি (যেমন: 192.168.1.201) লিখে রাখুন।</li>
                <li><strong>ফোনে ব্রাউজার ওপেন করুন:</strong> আপনার ফোনের Google Chrome ব্রাউজারে গিয়ে ওই IP Address টি লিখে Enter দিন।</li>
                <li><strong>লগইন করুন:</strong> মেশিনের একটি ওয়েব পেজ আসবে। সেখানে লগইন করুন (সাধারণত পাসওয়ার্ড লাগে না, লাগলে admin দিয়ে চেষ্টা করুন)।</li>
                <li><strong>Cloud Server সেটিং:</strong> ওয়েব পেজের মেনু থেকে <strong>Cloud Server Setting</strong> বা <strong>ADMS</strong> অপশনে যান।</li>
                <li><strong>সার্ভার এড্রেস বসান:</strong> Server Address এর ঘরে <code className="bg-emerald-800 px-2 py-1 rounded select-all">{window.location.hostname}</code> কপি করে বসিয়ে দিন।</li>
                <li><strong>পোর্ট ও ডোমেইন:</strong> Server Port <code className="bg-emerald-800 px-2 py-1 rounded">80</code> (বা 443) দিন এবং Enable Domain Name অপশনটি ON করে দিন।</li>
                <li>সবশেষে <strong>Save</strong> করে মেশিনটি একবার বন্ধ করে চালু (Restart) করুন।</li>
              </ol>
              <div className="mt-4 p-4 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-200 text-sm">
                <strong>নোট:</strong> মেশিনে ছাত্রদের যে ID (যেমন: 101) দিয়ে ফিঙ্গারপ্রিন্ট সেভ করবেন, সফটওয়্যারেও ছাত্রদের রোল বা স্টুডেন্ট আইডি হুবহু একই হতে হবে। তাহলে সফটওয়্যার অটোমেটিক বুঝে নেবে কে উপস্থিত হয়েছে।
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" /> সাম্প্রতিক ডিভাইস লগ
              </h3>
              <button onClick={fetchHistory} className="p-2 text-slate-400 hover:text-emerald-600 transition-all">
                <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
              </button>
            </div>

            <div className="space-y-4">
              {history.length > 0 ? history.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={log.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                      log.action === 'check_in' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {log.action === 'check_in' ? "IN" : "OUT"}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{log.name || log.id}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {log.type === 'student' ? 'ছাত্র' : log.type === 'teacher' ? 'শিক্ষক' : 'অভিভাবক'} | ID: {log.studentId || log.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{log.time}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(log.timestamp).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20">
                  <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">এখনো কোন লগ পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
