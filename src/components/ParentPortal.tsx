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
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPayMonths, setSelectedPayMonths] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  
  // Live Payment Modal State
  const [showLivePayment, setShowLivePayment] = useState(false);
  const [livePaymentMethod, setLivePaymentMethod] = useState("");
  const [livePaymentStep, setLivePaymentStep] = useState(1);
  const [livePaymentPhone, setLivePaymentPhone] = useState("");
  const [livePaymentOTP, setLivePaymentOTP] = useState("");
  const [livePaymentPIN, setLivePaymentPIN] = useState("");

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
    setLivePaymentOTP("");
    setLivePaymentPIN("");
    setShowLivePayment(true);
  };

  const processLivePayment = async () => {
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
          method: `live_${livePaymentMethod}`
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setPaymentMessage(data.message);
        setShowLivePayment(false);
        setSelectedPayMonths([]);
        // Refresh fees
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
        window.location.href = data.payment_url;
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
    
    // Auto login if identifier exists in localStorage
    const savedIdentifier = localStorage.getItem("guardianPhone");
    if (savedIdentifier) {
      handleLogin(null, savedIdentifier);
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
        throw new Error(errData.error || "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড সঠিক নয়");
      }
      const data = await response.json();
      setStudent(data);
      localStorage.setItem("guardianPhone", loginIdentifier);
      
      // Fetch related data
      const [attRes, resRes, hifzRes, profileRes, deviceRes] = await Promise.all([
        fetch(`/api/attendance/${data.id}`),
        fetch(`/api/results/${data.id}`),
        fetch(`/api/hifz/${data.id}`),
        fetch(`/api/students/${data.id}/full-profile`),
        fetch(`/api/parent/device-history/${data.id}`)
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
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড</label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="যেমন: 01712345678"
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
            { id: "payment", label: "পেমেন্ট", icon: CreditCard },
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
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

                      <h4 className="font-bold text-slate-900 mb-4">পেমেন্ট মেথড নির্বাচন করুন</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {settings?.udyoktapay_api_key && settings?.udyoktapay_api_url && (
                          <button 
                            disabled={paying}
                            onClick={() => handlePayment("udyoktapay")}
                            className="p-4 border rounded-2xl font-bold text-emerald-700 border-emerald-200 bg-emerald-100 hover:bg-emerald-200 transition-colors flex justify-center items-center gap-2"
                          >
                            {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Udyokta Pay"}
                          </button>
                        )}
                        {settings?.enable_bkash ? (
                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("bkash")}
                            className="p-4 border rounded-2xl font-bold text-pink-600 border-pink-100 bg-pink-50 hover:bg-pink-100 transition-colors flex flex-col items-center gap-1"
                          >
                            <span>বিকাশ</span>
                          </button>
                        ) : null}
                        {settings?.enable_nagad ? (
                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("nagad")}
                            className="p-4 border rounded-2xl font-bold text-orange-600 border-orange-100 bg-orange-50 hover:bg-orange-100 transition-colors flex flex-col items-center gap-1"
                          >
                            <span>নগদ</span>
                          </button>
                        ) : null}
                        {settings?.enable_rocket ? (
                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("rocket")}
                            className="p-4 border rounded-2xl font-bold text-purple-600 border-purple-100 bg-purple-50 hover:bg-purple-100 transition-colors flex flex-col items-center gap-1"
                          >
                            <span>রকেট</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "hifz" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">হিফজ ট্র্যাকিং</h3>
                  <div className="space-y-6">
                    {hifzRecords.length > 0 ? hifzRecords.map((rec, i) => (
                      <div key={i} className="p-6 border border-slate-100 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                          <span className="font-bold text-slate-900">{new Date(rec.date).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সবক</p>
                            <p className="font-bold text-emerald-700">{rec.sabak}</p>
                          </div>
                          <div className="text-center border-x border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সবকি</p>
                            <p className="font-bold text-emerald-700">{rec.sabki}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">মঞ্জিল</p>
                            <p className="font-bold text-emerald-700">{rec.manzil}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-slate-400 py-12">কোন হিফজ রেকর্ড পাওয়া যায়নি</p>
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
                  <p className="text-center text-slate-600 font-medium">আপনার {livePaymentMethod} একাউন্ট নাম্বার দিন</p>
                  <input 
                    type="text" 
                    placeholder="e.g 01XXXXXXXXX"
                    className="w-full text-center text-2xl tracking-widest p-4 border-b-2 border-slate-200 focus:border-slate-800 outline-none transition-colors"
                    value={livePaymentPhone}
                    onChange={(e) => setLivePaymentPhone(e.target.value)}
                  />
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowLivePayment(false)}
                      className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (livePaymentPhone.length >= 11) setLivePaymentStep(2);
                        else alert("সঠিক নাম্বার দিন");
                      }}
                      className={cn(
                        "flex-1 py-4 font-bold text-white rounded-xl transition-colors",
                        livePaymentMethod === "bkash" ? "bg-[#E2136E] hover:bg-[#c4105f]" : 
                        livePaymentMethod === "nagad" ? "bg-[#F7941D] hover:bg-[#d67f18]" : 
                        "bg-[#8C1515] hover:bg-[#6b1010]"
                      )}
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}

              {livePaymentStep === 2 && (
                <div className="space-y-6">
                  <p className="text-center text-slate-600 font-medium">আপনার মোবাইলে পাঠানো OTP দিন</p>
                  <input 
                    type="text" 
                    placeholder="XXXXXX"
                    className="w-full text-center text-3xl tracking-[0.5em] p-4 border-b-2 border-slate-200 focus:border-slate-800 outline-none transition-colors"
                    value={livePaymentOTP}
                    onChange={(e) => setLivePaymentOTP(e.target.value)}
                  />
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setLivePaymentStep(1)}
                      className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (livePaymentOTP.length >= 4) setLivePaymentStep(3);
                        else alert("সঠিক OTP দিন");
                      }}
                      className={cn(
                        "flex-1 py-4 font-bold text-white rounded-xl transition-colors",
                        livePaymentMethod === "bkash" ? "bg-[#E2136E] hover:bg-[#c4105f]" : 
                        livePaymentMethod === "nagad" ? "bg-[#F7941D] hover:bg-[#d67f18]" : 
                        "bg-[#8C1515] hover:bg-[#6b1010]"
                      )}
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              )}

              {livePaymentStep === 3 && (
                <div className="space-y-6">
                  <p className="text-center text-slate-600 font-medium">আপনার {livePaymentMethod} PIN দিন</p>
                  <input 
                    type="password" 
                    placeholder="••••"
                    className="w-full text-center text-3xl tracking-[0.5em] p-4 border-b-2 border-slate-200 focus:border-slate-800 outline-none transition-colors"
                    value={livePaymentPIN}
                    onChange={(e) => setLivePaymentPIN(e.target.value)}
                  />
                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setLivePaymentStep(2)}
                      className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                      disabled={paying}
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => {
                        if (livePaymentPIN.length >= 4) processLivePayment();
                        else alert("সঠিক PIN দিন");
                      }}
                      disabled={paying}
                      className={cn(
                        "flex-1 py-4 font-bold text-white rounded-xl transition-colors flex justify-center items-center gap-2",
                        livePaymentMethod === "bkash" ? "bg-[#E2136E] hover:bg-[#c4105f]" : 
                        livePaymentMethod === "nagad" ? "bg-[#F7941D] hover:bg-[#d67f18]" : 
                        "bg-[#8C1515] hover:bg-[#6b1010]"
                      )}
                    >
                      {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payment"}
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
