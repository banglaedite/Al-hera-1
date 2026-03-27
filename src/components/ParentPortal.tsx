import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Bell, 
  BookOpen, 
  CreditCard, 
  CheckCircle2,
  AlertCircle,
  LogOut,
  GraduationCap,
  User,
  Users,
  History
} from "lucide-react";
import { cn } from "../lib/utils";

export default function ParentPortal() {
  const [identifier, setIdentifier] = useState(() => localStorage.getItem("guardianPhone") || "");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [deviceHistory, setDeviceHistory] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [hifzRecords, setHifzRecords] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [hifzSettings, setHifzSettings] = useState<any>(null);
  const [hifzStartDate, setHifzStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [hifzEndDate, setHifzEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPayMonths, setSelectedPayMonths] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  
  // Live Payment Modal State
  const [showLivePayment, setShowLivePayment] = useState(false);
  const [livePaymentMethod, setLivePaymentMethod] = useState("");
  const [livePaymentStep, setLivePaymentStep] = useState(1);
  const [livePaymentPhone, setLivePaymentPhone] = useState("");
  const [livePaymentTrxID, setLivePaymentTrxID] = useState("");
  const [livePaymentReference, setLivePaymentReference] = useState("");

  const monthsList = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  const initiateLivePayment = (method: string) => {
    if (selectedPayMonths.length === 0) {
      alert("অন্তত একটি মাস নির্বাচন করুন");
      return;
    }
    setLivePaymentMethod(method);
    setLivePaymentStep(1);
    setLivePaymentPhone("");
    setLivePaymentTrxID("");
    setLivePaymentReference("");
    setShowLivePayment(true);
  };

  const processLivePayment = async () => {
    if (!livePaymentTrxID || !livePaymentReference) {
      alert("Transaction ID এবং Reference দিন");
      return;
    }
    setPaying(true);
    setPaymentMessage("");
    try {
      const amount = selectedPayMonths.length * (student.monthly_fee || 500);
      const res = await fetch("/api/parent/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email || `${student.student_code}@madrasa.com`,
          months: selectedPayMonths,
          year: selectedYear,
          amount,
          method: `manual_${livePaymentMethod}`,
          transactionId: livePaymentTrxID,
          senderPhone: livePaymentPhone,
          reference: livePaymentReference
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setPaymentMessage(data.message);
        setShowLivePayment(false);
        setSelectedPayMonths([]);
        // Refresh fees and history
        const [profileRes, historyRes] = await Promise.all([
          fetch(`/api/students/${student.id}/full-profile`),
          fetch(`/api/parent/payment-history/${student.id}`)
        ]);
        const profileData = await profileRes.json();
        setFees(profileData.fees || []);
        setPaymentHistory(await historyRes.json());
      } else {
        alert(data.error || "পেমেন্ট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("পেমেন্ট ব্যর্থ হয়েছে");
    }
    setPaying(false);
  };

  const handlePayment = async (method: string) => {
    if (selectedPayMonths.length === 0) {
      alert("অন্তত একটি মাস নির্বাচন করুন");
      return;
    }
    setPaying(true);
    setPaymentMessage("");
    try {
      const amount = selectedPayMonths.length * (student.monthly_fee || 500);
      const res = await fetch("/api/parent/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email || `${student.student_code}@madrasa.com`,
          months: selectedPayMonths,
          year: selectedYear,
          amount,
          method
        })
      });
      const data = await res.json();
      
      if (method === "udyoktapay" && data.payment_url) {
        // Open payment gateway in a new tab to avoid iframe/security blocking
        const paymentWindow = window.open(data.payment_url, '_blank');
        if (!paymentWindow) {
          // If popup is blocked, try same window as fallback
          window.location.href = data.payment_url;
        } else {
          setPaymentMessage("পেমেন্ট গেটওয়ে নতুন ট্যাবে ওপেন হয়েছে। পেমেন্ট শেষ করে এখানে ফিরে আসুন।");
        }
      } else if (data.success) {
        setPaymentMessage(data.message);
        // Refresh fees after manual payment instruction
        const profileRes = await fetch(`/api/students/${student.id}/full-profile`);
        const profileData = await profileRes.json();
        setFees(profileData.fees || []);
      } else {
        alert(data.error || "পেমেন্ট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("পেমেন্ট ব্যর্থ হয়েছে");
    }
    setPaying(false);
  };

  useEffect(() => {
    fetch("/api/site-settings").then(res => res.json()).then(setSettings);
    fetch("/api/admin/settings/hifz").then(res => res.json()).then(setHifzSettings);
    
    // Auto login if identifier exists in localStorage
    const savedIdentifier = localStorage.getItem("guardianPhone");
    if (savedIdentifier) {
      handleLogin(null, savedIdentifier);
    }

    // Handle payment verification from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const invoiceId = urlParams.get("invoice_id");

    if (paymentStatus === "success" && invoiceId) {
      setPaymentMessage("পেমেন্ট যাচাই করা হচ্ছে, দয়া করে অপেক্ষা করুন...");
      fetch("/api/udyoktapay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaymentMessage(data.message);
          // Remove query params from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setPaymentMessage(data.message);
        }
      })
      .catch(() => {
        setPaymentMessage("পেমেন্ট যাচাই করতে সমস্যা হয়েছে।");
      });
    } else if (paymentStatus === "cancel") {
      setPaymentMessage("পেমেন্ট বাতিল করা হয়েছে।");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent | null, loginIdentifier: string = identifier) => {
    if (e) e.preventDefault();
    if (!loginIdentifier) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/parent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const loginByIdEnabled = hifzSettings?.guardian_login_by_id_enabled !== false;
        throw new Error(errData.error || (loginByIdEnabled ? "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড সঠিক নয়" : "মোবাইল নম্বর বা ইমেইল সঠিক নয়"));
      }
      const data = await response.json();
      setStudent(data);
      localStorage.setItem("guardianPhone", loginIdentifier);
      
      // Fetch related data
      const [attRes, resRes, hifzRes, profileRes, deviceRes, noticeRes, historyRes, settingsRes, hifzSettingsRes] = await Promise.all([
        fetch(`/api/attendance/${data.id}`),
        fetch(`/api/results/${data.id}`),
        fetch(`/api/hifz/${data.id}`),
        fetch(`/api/students/${data.id}/full-profile`),
        fetch(`/api/parent/device-history/${data.id}`),
        fetch("/api/notices"),
        fetch(`/api/parent/payment-history/${data.id}`),
        fetch("/api/site-settings"),
        fetch("/api/admin/settings/hifz")
      ]);
      
      const attData = await attRes.json();
      setAttendance(Array.isArray(attData) ? attData : []);
      
      const resData = await resRes.json();
      setResults(Array.isArray(resData) ? resData : []);
      
      const hifzData = await hifzRes.json();
      setHifzRecords(Array.isArray(hifzData) ? hifzData : []);
      
      const deviceData = await deviceRes.json();
      setDeviceHistory(Array.isArray(deviceData) ? deviceData : []);
      
      const profileData = await profileRes.json();
      setFees(profileData.fees || []);

      const noticeData = await noticeRes.json();
      setNotices(Array.isArray(noticeData) ? noticeData : []);

      const historyData = await historyRes.json();
      setPaymentHistory(Array.isArray(historyData) ? historyData : []);

      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      const hifzSettingsData = await hifzSettingsRes.json();
      setHifzSettings(hifzSettingsData);
    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem("guardianPhone");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("guardianPhone");
    setStudent(null);
    setIdentifier("");
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <Users className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">প্যারেন্ট পোর্টাল</h2>
            <p className="text-slate-500 font-medium">আপনার সন্তানের তথ্য দেখতে লগইন করুন</p>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                {hifzSettings?.guardian_login_by_id_enabled !== false 
                  ? "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড" 
                  : "মোবাইল নম্বর বা ইমেইল"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder={hifzSettings?.guardian_login_by_id_enabled !== false 
                    ? "যেমন: 01712345678 বা AH-001" 
                    : "যেমন: 01712345678"}
                  required
                />
                <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-rose-100"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>লগইন করুন <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">প্যারেন্ট পোর্টাল</h1>
            <p className="text-slate-500 font-medium">আপনার সন্তানের সব আপডেট এখানে দেখুন</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all shadow-sm border border-rose-100 self-start"
          >
            <LogOut className="w-4 h-4" /> লগ আউট
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-3 mb-10 pb-2 scrollbar-hide">
          {[
            { id: "overview", label: "একনজরে", icon: LayoutDashboard },
            { id: "attendance", label: "হাজিরা", icon: CheckCircle2 },
            { id: "device-history", label: "স্মার্ট হাজিরা লগ", icon: History },
            { id: "results", label: "রেজাল্ট", icon: BookOpen },
            { id: "notices", label: "নোটিশ", icon: Bell },
            { id: "payment", label: "পেমেন্ট", icon: CreditCard },
            { id: "payment-history", label: "পেমেন্ট হিস্টোরি", icon: History },
            student.is_hifz ? { id: "hifz", label: "হিফজ ট্র্যাকিং", icon: GraduationCap } : null
          ].filter(Boolean).map((tab: any) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all whitespace-nowrap border",
                activeTab === tab.id 
                  ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 border-emerald-900" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Student Profile Card (Left) */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 sticky top-24"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 mb-8 border-4 border-emerald-50">
                  <img 
                    src={student.photo_url || `https://picsum.photos/seed/${student.id}/200`} 
                    alt={student.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{student.name}</h3>
                <p className="text-emerald-700 font-black text-lg mb-8 bg-emerald-50 px-6 py-2 rounded-full">{student.class} শ্রেণী | রোল: {student.roll}</p>
                
                <div className="w-full space-y-5 pt-8 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">স্টুডেন্ট আইডি</span>
                    <span className="font-black text-slate-900">{student.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">স্টুডেন্ট কোড</span>
                    <span className="font-black text-emerald-700">{student.student_code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">রক্তের গ্রুপ</span>
                    <span className="font-black text-rose-600">{student.blood_group}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area (Right) */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">উপস্থিতি</p>
                        <p className="text-xl font-bold text-slate-900">
                          {attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" /> ব্যক্তিগত তথ্য
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">পিতার নাম</p>
                        <p className="font-bold text-slate-900">{student.father_name || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">মাতার নাম</p>
                        <p className="font-bold text-slate-900">{student.mother_name || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">ফোন</p>
                        <p className="font-bold text-slate-900">{student.phone || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">ঠিকানা</p>
                        <p className="font-bold text-slate-900">{student.address || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-emerald-600" /> সাম্প্রতিক আপডেট
                    </h3>
                    <div className="space-y-4">
                      {results.length > 0 ? (
                        <div className="p-4 border border-emerald-50 bg-emerald-50/30 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">নতুন রেজাল্ট প্রকাশিত</h4>
                              <p className="text-xs text-slate-400">{results[results.length-1].exam_name}</p>
                            </div>
                          </div>
                          <button onClick={() => setActiveTab("results")} className="text-emerald-600 font-bold text-xs">দেখুন</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "attendance" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">হাজিরা রিপোর্ট</h3>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={async (e) => {
                          setSelectedMonth(e.target.value);
                          const res = await fetch(`/api/attendance/student/${student.id}/month/${e.target.value}`);
                          setAttendance(await res.json());
                        }}
                        className="bg-transparent border-none focus:ring-0 font-bold text-slate-600 px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const now = new Date();
                      const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month;
                      
                      const daysInMonth = new Date(year, month, 0).getDate();
                      const daysToShow = isCurrentMonth ? now.getDate() : daysInMonth;

                      const days = [];
                      for (let d = 1; d <= daysToShow; d++) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const record = attendance.find(a => a.date === dateStr);
                        
                        days.push(
                          <div key={d} className={cn(
                            "p-4 rounded-2xl border flex flex-col items-center justify-center transition-all",
                            record?.status === 'present' 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                              : record?.status === 'absent'
                                ? "bg-rose-50 border-rose-100 text-rose-700"
                                : "bg-slate-50 border-slate-100 text-slate-400"
                          )}>
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                              {new Date(dateStr).toLocaleDateString('bn-BD', { weekday: 'short' })}
                            </span>
                            <span className="text-xl font-black">{d}</span>
                            <span className="text-[10px] font-bold mt-1">
                              {record?.status === 'present' ? 'উপস্থিত' : record?.status === 'absent' ? 'অনুপস্থিত' : 'তথ্য নেই'}
                            </span>
                          </div>
                        );
                      }
                      return days;
                    })()}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-slate-500">উপস্থিত</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-xs font-bold text-slate-500">অনুপস্থিত</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span className="text-xs font-bold text-slate-500">তথ্য নেই</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "device-history" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">স্মার্ট হাজিরা লগ</h3>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold">
                      ডিভাইস এন্ট্রি (প্রবেশ ও প্রস্থান)
                    </div>
                  </div>

                  <div className="space-y-4">
                    {deviceHistory.length > 0 ? deviceHistory.map((log, i) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                            log.action === 'check_in' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {log.action === 'check_in' ? "IN" : "OUT"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{log.action === 'check_in' ? "মাদরাসায় প্রবেশ" : "মাদরাসা থেকে প্রস্থান"}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(log.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">{log.time}</p>
                          <p className="text-[10px] text-slate-400 font-bold">ডিভাইস আইডি: {log.id?.slice(-4)}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">এখনো কোন স্মার্ট হাজিরা লগ পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "results" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">পরীক্ষার ফলাফল</h3>
                  <div className="space-y-6">
                    {results.length > 0 ? results.map((res, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{res.exam_name}</p>
                          <h4 className="text-lg font-bold text-slate-900">{res.subject}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-700">{res.marks}</p>
                          <p className="text-sm font-bold text-slate-500">গ্রেড: {res.grade}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-slate-400 py-12">কোন রেজাল্ট পাওয়া যায়নি</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "payment" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">বাকি মাসের পেমেন্ট</h3>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => { setSelectedYear(e.target.value); setSelectedPayMonths([]); }}
                      className="p-2 border rounded-xl font-bold text-slate-700"
                    >
                      {[...Array(5)].map((_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
                    {monthsList.map((month) => {
                      const isPaid = fees.some(f => f.month === month && f.year === selectedYear && f.status === "paid");
                      return (
                        <label key={month} className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all border",
                          isPaid ? "bg-emerald-50 border-emerald-200 opacity-50 cursor-not-allowed" : 
                          selectedPayMonths.includes(month) ? "bg-emerald-100 border-emerald-500 shadow-sm" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        )}>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            disabled={isPaid}
                            checked={selectedPayMonths.includes(month)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPayMonths([...selectedPayMonths, month]);
                              } else {
                                setSelectedPayMonths(selectedPayMonths.filter(m => m !== month));
                              }
                            }}
                          />
                          <span className="font-bold text-slate-700">{month}</span>
                          {isPaid ? (
                            <span className="text-xs font-bold text-emerald-600">পরিশোধিত</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-500">৳{student.monthly_fee || 500}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Other Fees Section */}
                  <div className="mt-12">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      অন্যান্য ফি (Other Fees)
                    </h4>
                    <div className="space-y-4">
                      {fees.filter(f => !f.month && f.status === "unpaid").length > 0 ? (
                        fees.filter(f => !f.month && f.status === "unpaid").map((fee) => (
                          <div key={fee.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{fee.category}</p>
                              <h4 className="text-lg font-bold text-slate-900">{fee.name || fee.category}</h4>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-xl font-black text-slate-900">৳{fee.amount}</p>
                                <p className="text-[10px] font-bold text-rose-500 uppercase">বকেয়া</p>
                              </div>
                              <button 
                                onClick={() => {
                                  // For other fees, we'll use a slightly different payment flow or just reuse the manual one
                                  setLivePaymentMethod("");
                                  setLivePaymentStep(1);
                                  setLivePaymentPhone("");
                                  setLivePaymentTrxID("");
                                  setLivePaymentReference(`Fee: ${fee.category}`);
                                  // We need to handle single fee payment in processLivePayment
                                  // For now, let's just alert that they should contact admin or I'll implement it
                                  alert("এই ফি-টি পরিশোধ করতে মুহতামিম সাহেবের সাথে যোগাযোগ করুন অথবা শীঘ্রই অনলাইন পেমেন্ট যুক্ত করা হবে।");
                                }}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
                              >
                                পরিশোধ করুন
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-8 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">কোন অন্যান্য ফি বকেয়া নেই</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedPayMonths.length > 0 && (
                    <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-700">মোট পরিমাণ:</span>
                        <span className="text-2xl font-black text-emerald-700">৳{selectedPayMonths.length * (student.monthly_fee || 500)}</span>
                      </div>
                      
                      {paymentMessage && (
                        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-center">
                          {paymentMessage}
                        </div>
                      )}

                      <h4 className="font-bold text-slate-900 mb-6 text-center">পেমেন্ট মেথড নির্বাচন করুন</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("bkash")}
                            className="p-4 bg-white border-2 border-pink-50 hover:border-pink-200 rounded-3xl transition-all flex flex-col items-center gap-2 group active:scale-95"
                          >
                            <img src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg" className="w-10 h-10 group-hover:scale-110 transition-transform" alt="bkash" />
                            <span className="text-xs font-bold text-pink-600">বিকাশ</span>
                          </button>
                          
                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("nagad")}
                            className="p-4 bg-white border-2 border-orange-50 hover:border-orange-200 rounded-3xl transition-all flex flex-col items-center gap-2 group active:scale-95"
                          >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="nagad" />
                            <span className="text-xs font-bold text-orange-600">নগদ</span>
                          </button>

                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("rocket")}
                            className="p-4 bg-white border-2 border-purple-50 hover:border-purple-200 rounded-3xl transition-all flex flex-col items-center gap-2 group active:scale-95"
                          >
                            <img src="https://www.rocket.com.bd/assets/images/rocket-logo.png" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="rocket" />
                            <span className="text-xs font-bold text-purple-600">রকেট</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "payment-history" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">পেমেন্ট হিস্টোরি</h3>
                  <div className="space-y-4">
                    {paymentHistory.length > 0 ? paymentHistory.map((payment, i) => (
                      <div key={payment.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{payment.months.join(", ")} {payment.year}</p>
                          <p className="text-xs text-slate-500 uppercase">{payment.method} • {new Date(payment.createdAt).toLocaleDateString('bn-BD')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-700">৳{payment.amount}</p>
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full",
                            payment.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                            payment.status === "rejected" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {payment.status === "completed" ? "এপ্রুভড" : payment.status === "rejected" ? "বাতিল" : "পেন্ডিং"}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">এখনো কোন পেমেন্ট হিস্টোরি নেই</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "hifz" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h3 className="text-2xl font-bold text-slate-900">হিফজ ট্র্যাকিং</h3>
                    {hifzSettings?.guardian_view_enabled && (
                      <div className="flex gap-2">
                        <input type="date" value={hifzStartDate} onChange={e => setHifzStartDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                        <input type="date" value={hifzEndDate} onChange={e => setHifzEndDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    )}
                  </div>

                  {hifzSettings?.guardian_view_enabled && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">মোট সবক</p>
                        <p className="text-2xl font-black text-emerald-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.sabok?.length || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">সাত ছবক</p>
                        <p className="text-2xl font-black text-blue-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).filter(r => r.sat_sabok).length}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">আমুখতা (পৃষ্ঠা)</p>
                        <p className="text-2xl font-black text-purple-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.amukhta?.total_pages || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                        <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">তিলাওয়াত (পারা)</p>
                        <p className="text-2xl font-black text-orange-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.tilawat?.total_paras || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">সাবীনা (পারা)</p>
                        <p className="text-2xl font-black text-rose-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.sabina?.total_paras || 0), 0)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {hifzRecords.filter(r => !hifzSettings?.guardian_view_enabled || (r.date >= hifzStartDate && r.date <= hifzEndDate)).length > 0 ? hifzRecords.filter(r => !hifzSettings?.guardian_view_enabled || (r.date >= hifzStartDate && r.date <= hifzEndDate)).map((rec, i) => (
                      <div key={i} className="p-6 border border-slate-100 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                          <span className="font-bold text-slate-900">{new Date(rec.date).toLocaleDateString('bn-BD')}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সবক</p>
                            <div className="text-sm font-bold text-emerald-700">
                              {rec.sabok?.map((s: any, idx: number) => (
                                <div key={idx}>{s.reading} (পৃষ্ঠা {s.page})</div>
                              ))}
                            </div>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সাত ছবক</p>
                            <p className="font-bold text-emerald-700">{rec.sat_sabok ? "হ্যাঁ" : "না"}</p>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">আমুখতা</p>
                            <p className="font-bold text-emerald-700">{rec.amukhta?.from_para} - {rec.amukhta?.to_para} ({rec.amukhta?.total_pages} পৃষ্ঠা)</p>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">তিলাওয়াত</p>
                            <p className="font-bold text-emerald-700">{rec.tilawat?.from_para} - {rec.tilawat?.to_para} ({rec.tilawat?.total_paras} পারা)</p>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সাবীনা</p>
                            <p className="font-bold text-emerald-700">{rec.sabina?.paras} ({rec.sabina?.total_paras} পারা)</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-slate-400 py-12">কোন হিফজ রেকর্ড পাওয়া যায়নি</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "notices" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">নোটিশ বোর্ড</h3>
                  <div className="space-y-6">
                    {notices.length > 0 ? notices.map((notice, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-slate-900">{notice.title}</h4>
                          <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                            {new Date(notice.date).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{notice.content}</p>
                        {notice.image_url && (
                          <a href={notice.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block mt-4">
                            <img 
                              src={notice.image_url} 
                              alt={notice.title} 
                              className="rounded-2xl object-cover w-full" 
                              style={{ maxWidth: notice.width ? `${notice.width}px` : '100%', height: notice.height ? `${notice.height}px` : 'auto' }}
                              referrerPolicy="no-referrer"
                            />
                          </a>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-20">
                        <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">এখনো কোন নোটিশ পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showLivePayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className={cn(
              "p-6 text-white text-center",
              livePaymentMethod === "bkash" ? "bg-[#E2136E]" : 
              livePaymentMethod === "nagad" ? "bg-[#F7941D]" : 
              "bg-[#8C1515]"
            )}>
              <h2 className="text-2xl font-bold capitalize">{livePaymentMethod} Payment</h2>
              <p className="opacity-90 mt-1">Total Amount: ৳{selectedPayMonths.length * (student.monthly_fee || 500)}</p>
            </div>
            
            <div className="p-8">
              {livePaymentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap">
                      {livePaymentMethod === "bkash" && settings?.bkash_instructions}
                      {livePaymentMethod === "nagad" && settings?.nagad_instructions}
                      {livePaymentMethod === "rocket" && settings?.rocket_instructions}
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-slate-600 font-medium">নিচের নাম্বারে টাকা পাঠিয়ে TrxID দিন</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-sm text-slate-500 font-bold uppercase">{livePaymentMethod} Number (Personal)</p>
                      <p className="text-2xl font-black text-slate-900">
                        {livePaymentMethod === "bkash" ? settings?.bkash_number : 
                         livePaymentMethod === "nagad" ? settings?.nagad_number : 
                         settings?.rocket_number || "Not Set"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">আপনার {livePaymentMethod} নাম্বার</label>
                      <input 
                        type="text" 
                        placeholder="01XXXXXXXXX"
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                        value={livePaymentPhone}
                        onChange={(e) => setLivePaymentPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">Transaction ID (TrxID)</label>
                      <input 
                        type="text" 
                        placeholder="ABC123XYZ"
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold uppercase"
                        value={livePaymentTrxID}
                        onChange={(e) => setLivePaymentTrxID(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">Reference</label>
                      <input 
                        type="text" 
                        placeholder="Reference"
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                        value={livePaymentReference}
                        onChange={(e) => setLivePaymentReference(e.target.value)}
                      />
                    </div>
                  </div>

                  {settings?.payment_special_note && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-800 whitespace-pre-wrap">{settings?.payment_special_note}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowLivePayment(false)}
                      className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      বাতিল
                    </button>
                    <button 
                      onClick={processLivePayment}
                      disabled={paying}
                      className={cn(
                        "flex-1 py-4 font-bold text-white rounded-xl transition-colors flex justify-center items-center gap-2",
                        livePaymentMethod === "bkash" ? "bg-[#E2136E] hover:bg-[#c4105f]" : 
                        livePaymentMethod === "nagad" ? "bg-[#F7941D] hover:bg-[#d67f18]" : 
                        "bg-[#8C1515] hover:bg-[#6b1010]"
                      )}
                    >
                      {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : "পেমেন্ট নিশ্চিত করুন"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
  </svg>
);
