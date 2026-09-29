import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, 
  Search, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Filter, 
  Loader2,
  FileText,
  ArrowRight,
  Calendar,
  PhoneCall,
  Bell,
  Users,
  Send,
  Printer,
  Sparkles,
  Phone,
  Radio,
  Check,
  RefreshCw,
  PhoneOff
} from "lucide-react";
import { cn } from "../lib/utils";
import { generateMonthlyReceipt, generateReceipt } from "../utils/pdfGenerator";
import { useToast } from "./ToastContext";
import { SimulatedIncomingCall } from "./SimulatedIncomingCall";

const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default function FeeManagement({ students, settings, onUpdate, initialStudentId, classesList }: any) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'pay' | 'defaulters'>('pay');

  // Pay Fee state
  const [studentId, setStudentId] = useState(initialStudentId || "");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [amountPerMonth, setAmountPerMonth] = useState(500);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isPaying, setIsPaying] = useState(false);

  // Defaulters state
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);
  const [filterClass, setFilterClass] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // Call simulation state
  const [recentReceiptModal, setRecentReceiptModal] = useState<any | null>(null);
  const [callingStudent, setCallingStudent] = useState<any | null>(null);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);

  useEffect(() => {
    if (initialStudentId) {
      handleSearch(new Event('submit') as any);
    }
  }, [initialStudentId]);

  useEffect(() => {
    setTotalAmount(selectedMonths.length * amountPerMonth);
  }, [selectedMonths, amountPerMonth]);

  useEffect(() => {
    if (activeTab === 'defaulters') {
      fetchDefaulters();
    }
  }, [activeTab, filterClass, filterCategory]);

  const fetchDefaulters = async () => {
    setLoadingDefaulters(true);
    try {
      const res = await fetch(`/api/admin/defaulters?class_name=${encodeURIComponent(filterClass)}&category=${encodeURIComponent(filterCategory)}`);
      if (res.ok) {
        const data = await res.json();
        setDefaulters(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDefaulters(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    const idToSearch = studentId || initialStudentId;
    if (!idToSearch) return;
    
    setLoading(true);
    setError("");
    setStudent(null);
    setFees([]);
    setSelectedMonths([]);

    try {
      const studentRes = await fetch(`/api/students/${idToSearch}`);
      if (!studentRes.ok) throw new Error("ছাত্র খুঁজে পাওয়া যায়নি");
      const studentData = await studentRes.json();
      setStudent(studentData);

      await fetchFees(idToSearch);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async (id: string) => {
    try {
      const feesRes = await fetch(`/api/fees/${id}`);
      const feesData = await feesRes.json();
      setFees(Array.isArray(feesData) ? feesData : []);
    } catch (error) {
      console.error("Failed to fetch fees", error);
      setFees([]);
    }
  };

  const handleMonthToggle = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const sendEmail = async (pdfData: string, filename: string, studentEmail: string, addToast: any) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: studentEmail,
          subject: "আপনার ফি রসিদ",
          text: "আপনার ফি রসিদটি সংযুক্ত করা হলো।",
          attachments: [
            {
              filename: filename,
              content: pdfData.split(',')[1],
              encoding: 'base64'
            }
          ]
        })
      });
      if (response.ok) {
        addToast("ইমেইল সফলভাবে পাঠানো হয়েছে!", "success");
      } else {
        addToast("ইমেইল পাঠাতে সমস্যা হয়েছে!", "error");
      }
    } catch (error) {
      console.error("Email error:", error);
      addToast("ইমেইল পাঠাতে সমস্যা হয়েছে!", "error");
    }
  };

  const handlePayMonthlyFees = async () => {
    if (selectedMonths.length === 0 || isPaying) return;
    setIsPaying(true);
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    try {
      const response = await fetch("/api/pay-monthly-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          student_id: student.id,
          student_name: student.name,
          year: selectedYear,
          months: selectedMonths,
          total_amount: totalAmount,
          transaction_id: transactionId 
        })
      });
      
      if (response.ok) {
        addToast("পেমেন্ট সফল হয়েছে", "success");
        setSelectedMonths([]);
        await fetchFees(student.id);
        if (onUpdate) onUpdate();
        
        generateMonthlyReceipt({
          transaction_id: transactionId,
          paid_date: new Date().toISOString(),
          months: selectedMonths,
          year: selectedYear,
          amount: totalAmount
        }, student, sendEmail, addToast, settings);

        setRecentReceiptModal({
          transaction_id: transactionId,
          student_name: student.name,
          student_class: student.class,
          amount: totalAmount,
          category: `মাসিক বেতন (${selectedMonths.join(", ")})`,
          date: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Payment failed", err);
      addToast("পেমেন্ট ব্যর্থ হয়েছে", "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handlePay = async (fee: any) => {
    if (isPaying) return;
    setIsPaying(true);
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    try {
      const response = await fetch("/api/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeId: fee.id, transactionId })
      });
      if (response.ok) {
        addToast("পেমেন্ট সফল হয়েছে", "success");
        await fetchFees(student.id);
        if (onUpdate) onUpdate();
        
        const updatedFee = { ...fee, status: 'paid', paid_date: new Date().toISOString(), transaction_id: transactionId };
        generateReceipt(updatedFee, student, sendEmail, addToast, settings);

        setRecentReceiptModal({
          transaction_id: transactionId,
          student_name: student.name,
          student_class: student.class,
          amount: fee.amount,
          category: fee.category,
          date: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Payment failed", err);
      addToast("পেমেন্ট ব্যর্থ হয়েছে", "error");
    } finally {
      setIsPaying(false);
    }
  };

  // Batch Reminder Runner
  const runBatchReminder = async () => {
    if (defaulters.length === 0) {
      addToast("কোন বকেয়াদার ছাত্র পাওয়া যায়নি", "info");
      return;
    }

    setShowBatchModal(true);
    setIsBatchSending(true);
    setBatchProgress(0);
    setBatchLogs([]);

    const studentIds = defaulters.map(d => d.student_id);

    try {
      await fetch("/api/admin/defaulters/batch-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_ids: studentIds, reminder_type: "voice_call_and_sms" })
      });

      for (let i = 0; i < defaulters.length; i++) {
        const item = defaulters[i];
        await new Promise(r => setTimeout(r, 600));
        setBatchProgress(Math.round(((i + 1) / defaulters.length) * 100));
        setBatchLogs(prev => [
          ...prev,
          `📞 ${item.student_name} (শ্রেণী: ${item.student_class}) - অভিভাবকের ফোন (${item.guardian_phone})-এ তাগাদা কল ও এসএমএস পাঠানো হয়েছে (বকেয়া: ৳${item.total_due})`
        ]);
      }

      addToast("সকল বকেয়াদারের অভিভাবককে সফলভাবে তাগাদা বার্তা পাঠানো হয়েছে", "success");
      fetchDefaulters();
    } catch (e) {
      addToast("তাগাদা পাঠাতে সমস্যা হয়েছে", "error");
    } finally {
      setIsBatchSending(false);
    }
  };

  const printDefaultersList = () => {
    window.print();
  };

  const paidMonthsThisYear = fees
    .filter(f => f.category === 'মাসিক বেতন' && f.year === selectedYear && f.status === 'paid')
    .map(f => f.month);

  const otherFees = fees.filter(f => f.category !== 'মাসিক বেতন');
  const totalAllDue = defaulters.reduce((acc, d) => acc + d.total_due, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Title & Top Tabs Switcher */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">বেতন ও ফি পয়েন্ট</h1>
        <p className="text-slate-500 font-bold max-w-lg mx-auto text-sm">
          ছাত্রদের ফি সংগ্রহ, ডিজিটাল মানি রিসিট ডাউনলোড এবং বকেয়া বেতন আদায়ে স্বয়ংক্রিয় তাগাদা সার্ভিস
        </p>

        <div className="inline-flex bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/60 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className={cn(
              "px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2",
              activeTab === 'pay' ? "bg-emerald-900 text-white shadow-lg" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <CreditCard className="w-4 h-4" />
            ফি প্রদান ও রিসিট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('defaulters')}
            className={cn(
              "px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2",
              activeTab === 'defaulters' ? "bg-emerald-900 text-white shadow-lg" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <PhoneCall className="w-4 h-4 text-amber-400" />
            বকেয়া তালিকা ও অটো তাগাদা
            {defaulters.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                {defaulters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'pay' ? (
        <>
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="স্টুডেন্ট আইডি লিখুন (উদা: AHM-1-001)" 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <button 
                disabled={loading}
                className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-black hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-900/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ফি চেক করুন"}
              </button>
            </form>
            {error && <p className="text-rose-500 text-sm mt-3 text-center font-bold">{error}</p>}
          </div>

          <AnimatePresence mode="wait">
            {student ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
                        <img 
                          src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=064e3b&color=ffffff&bold=true`} 
                          alt={student.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-900">{student.name}</h3>
                        <p className="text-xs font-bold text-slate-500">আইডি: {student.id}</p>
                        <p className="text-xs font-bold text-emerald-700">শ্রেণী: {student.class || '---'} | রোল: {student.roll || '---'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-black uppercase tracking-wider mb-1">মোট পরিশোধিত</p>
                        <p className="text-2xl font-black text-emerald-900">৳ {fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0)}</p>
                      </div>
                      <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                        <p className="text-xs text-rose-600 font-black uppercase tracking-wider mb-1">মোট বকেয়া</p>
                        <p className="text-2xl font-black text-rose-900">৳ {fees.filter(f => f.status === 'unpaid').reduce((acc, f) => acc + f.amount, 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {/* Monthly Fee Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-600" /> মাসিক বেতন পরিশোধ
                      </h3>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {[...Array(5)].map((_, i) => {
                          const year = new Date().getFullYear() - 2 + i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
                      {MONTHS.map(month => {
                        const isPaid = paidMonthsThisYear.includes(month);
                        const isSelected = selectedMonths.includes(month);
                        return (
                          <button
                            key={month}
                            disabled={isPaid}
                            onClick={() => handleMonthToggle(month)}
                            className={cn(
                              "p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border-2",
                              isPaid 
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700 cursor-not-allowed opacity-70" 
                                : isSelected
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                                  : "bg-white border-slate-100 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                            )}
                          >
                            {isPaid && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {month}
                          </button>
                        );
                      })}
                    </div>

                    {selectedMonths.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4"
                      >
                        <div className="flex justify-between items-center pb-4 border-b border-emerald-200/50">
                          <span className="font-bold text-emerald-900 text-sm">নির্বাচিত মাস:</span>
                          <span className="text-emerald-700 font-black text-sm">{selectedMonths.join(", ")}</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                          <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-emerald-700 uppercase mb-1 block">মাসিক ফি (৳)</label>
                            <input 
                              type="number" 
                              value={amountPerMonth}
                              onChange={(e) => setAmountPerMonth(Number(e.target.value))}
                              className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                            />
                          </div>
                          <div className="flex-1 w-full">
                            <label className="text-xs font-bold text-emerald-700 uppercase mb-1 block">সর্বমোট (৳)</label>
                            <input 
                              type="number" 
                              value={totalAmount}
                              onChange={(e) => setTotalAmount(Number(e.target.value))}
                              className="w-full px-4 py-2.5 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-900"
                            />
                          </div>
                          <button 
                            onClick={handlePayMonthlyFees}
                            disabled={isPaying}
                            className="w-full sm:w-auto mt-5 px-8 py-3.5 bg-emerald-900 text-white rounded-xl font-black hover:bg-emerald-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
                          >
                            {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "পেমেন্ট সম্পন্ন করুন"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Other Fees Section */}
                  {otherFees.length > 0 && (
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-8">
                        <History className="w-5 h-5 text-emerald-600" /> অন্যান্য ফি (ভর্তি, হোস্টেল, পরীক্ষা ইত্যাদি)
                      </h3>

                      <div className="space-y-4">
                        {otherFees.map((fee) => (
                          <div key={fee.id} className="p-6 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black",
                                fee.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                              )}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900">{fee.category}</h4>
                                <p className="text-xs text-slate-500 font-bold">তারিখ: {new Date(fee.due_date || fee.created_at).toLocaleDateString('bn-BD')}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-black text-slate-900">৳ {fee.amount}</p>
                                <span className={cn(
                                  "text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full",
                                  fee.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                                )}>
                                  {fee.status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                                </span>
                              </div>
                              
                              {fee.status === 'unpaid' ? (
                                <button 
                                  onClick={() => handlePay(fee)}
                                  className="px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-xs font-black hover:bg-emerald-800 transition-colors shadow-sm"
                                >
                                  পেমেন্ট করুন
                                </button>
                              ) : (
                                <button 
                                  onClick={() => generateReceipt(fee, student, sendEmail, addToast)}
                                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                                  title="রিসিট ডাউনলোড"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : !loading && (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <CreditCard className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-slate-600">কোন তথ্য পাওয়া যায়নি</h3>
                <p className="text-slate-400 text-xs font-bold mt-1">উপরে ছাত্র আইডি দিয়ে সার্চ করে ফি চেক করুন</p>
              </div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Defaulters & Auto Reminders Tab */
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  বকেয়া বেতন ও ফি ট্র্যাকিং তালিকা
                </h3>
                <p className="text-slate-400 text-xs font-bold mt-1">
                  যেসব ছাত্রের কোনো মাসের বেতন বা ভর্তি/পরীক্ষার ফি বাকি আছে তাদের তালিকা ও অটোমেটেড তাগাদা কল ব্যবস্থা
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={printDefaultersList}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  প্রিন্ট / PDF
                </button>

                <button
                  type="button"
                  onClick={runBatchReminder}
                  disabled={defaulters.length === 0 || isBatchSending}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2.5 active:scale-95 disabled:opacity-50"
                >
                  <PhoneCall className="w-5 h-5 fill-slate-950" />
                  ১-ক্লিকে সকল বকেয়াদারকে তাগাদা কল ও SMS পাঠান
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-black text-slate-500">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>ফিল্টার:</span>
              </div>

              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">সকল শ্রেণি</option>
                {classesList && classesList.length > 0 ? (
                  classesList.map((cls: string) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))
                ) : (
                  ["১ম শ্রেণি", "২য় শ্রেণি", "৩য় শ্রেণি", "৪র্থ শ্রেণি", "৫ম শ্রেণি", "হিফজ বিভাগ"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))
                )}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">সকল প্রকার ফি</option>
                <option value="মাসিক বেতন">মাসিক বেতন</option>
                <option value="ভর্তি ফি">ভর্তি ফি</option>
                <option value="পরীক্ষার ফি">পরীক্ষার ফি</option>
                <option value="হোস্টেল ফি">হোস্টেল ফি</option>
              </select>

              <button
                type="button"
                onClick={fetchDefaulters}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl"
                title="রিফ্রেশ"
              >
                <RefreshCw className={cn("w-4 h-4", loadingDefaulters && "animate-spin")} />
              </button>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-slate-400">মোট বকেয়াদার ছাত্র</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{defaulters.length} জন</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-black">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-rose-500">সর্বমোট বকেয়া পরিমাণ</p>
                <p className="text-3xl font-black text-rose-600 mt-1">৳ {totalAllDue}</p>
              </div>
              <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center font-black">
                ৳
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-emerald-600">স্বয়ংক্রিয় ভয়েস ব্রডকাস্ট</p>
                <p className="text-sm font-black text-emerald-800 mt-1">১০০% প্রস্তুত</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black">
                <Radio className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Defaulters Table */}
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
            {loadingDefaulters ? (
              <div className="p-20 text-center text-slate-400 font-bold flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span>বকেয়া তালিকা লোড হচ্ছে...</span>
              </div>
            ) : defaulters.length === 0 ? (
              <div className="p-20 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-800">কোন বকেয়া ফি নেই!</h4>
                <p className="text-xs font-bold text-slate-400">সকল ছাত্রের ফি আলহামদুলিল্লাহ পরিশোধিত রয়েছে</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4 pl-6">ছাত্রের নাম ও আইডি</th>
                      <th className="p-4">শ্রেণি ও রোল</th>
                      <th className="p-4">অভিভাবকের নম্বর</th>
                      <th className="p-4">বকেয়ার কারণ</th>
                      <th className="p-4 text-right">বকেয়া টাকা</th>
                      <th className="p-4 text-center print:hidden">তাগাদা বাটন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-700">
                    {defaulters.map((item) => (
                      <tr key={item.student_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-black text-slate-900">{item.student_name}</p>
                          <span className="text-xs font-mono text-slate-400 font-bold">{item.student_id}</span>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-900 font-bold">{item.student_class}</p>
                          {item.roll && <p className="text-xs text-slate-400">রোল: {item.roll}</p>}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-900">
                          {item.guardian_phone}
                        </td>
                        <td className="p-4 text-xs font-bold text-slate-600">
                          {item.due_items?.map((d: any) => `${d.category} ${d.month ? `(${d.month})` : ''}`).join(", ")}
                        </td>
                        <td className="p-4 text-right font-black text-rose-600 text-base">
                          ৳ {item.total_due}
                        </td>
                        <td className="p-4 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => setCallingStudent({
                              name: item.student_name,
                              class: item.student_class,
                              roll: item.roll,
                              dueAmount: item.total_due
                            })}
                            className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl font-black text-xs transition-all shadow-sm inline-flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            তাগাদা কল দিন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Single Student Call Simulation Modal */}
      <AnimatePresence>
        {callingStudent && (
          <SimulatedIncomingCall
            student={callingStudent}
            settings={{
              ...settings,
              voice_call_message_text: `আসসালামু আলাইকুম। সম্মানিত অভিভাবক, আপনার সন্তান ${callingStudent.name}-এর মোট ৳${callingStudent.dueAmount} টাকা বেতন বকেয়া রয়েছে। অনুগ্রহ করে শীঘ্রই পরিশোধ করার অনুরোধ করা হচ্ছে। ধন্যবাদ।`
            }}
            onDecline={() => setCallingStudent(null)}
          />
        )}
      </AnimatePresence>

      {/* Batch Call/SMS Dispatcher Progress Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl border border-slate-700/60 w-full max-w-2xl p-8 overflow-hidden space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-500/30">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">স্বয়ংক্রিয় তাগাদা ভয়েস ব্রডকাস্ট ড্যাশবোর্ড</h3>
                    <p className="text-xs font-bold text-slate-400">সকল বকেয়াদারের অভিভাবকদের কাছে মেসেজ ও ফোন ডায়াল করা হচ্ছে</p>
                  </div>
                </div>

                {!isBatchSending && (
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black text-xs"
                  >
                    বন্ধ করুন
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black text-slate-300">
                  <span>অগ্রগতি (Progress)</span>
                  <span className="text-amber-400">{batchProgress}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${batchProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Live Broadcast Logs */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 h-64 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar">
                {batchLogs.map((log, idx) => (
                  <div key={idx} className="p-2 bg-slate-900/60 rounded-xl text-slate-300 leading-relaxed border border-slate-800">
                    {log}
                  </div>
                ))}
                {isBatchSending && (
                  <div className="text-amber-400 flex items-center gap-2 p-2 font-bold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    পরবর্তী নম্বরে ডায়াল করা হচ্ছে...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Receipt Completion Modal with Call & Notification Actions */}
      <AnimatePresence>
        {recentReceiptModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 w-full max-w-md text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  পেমেন্ট সফলভাবে গৃহীত হয়েছে
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-2">{recentReceiptModal.student_name}</h3>
                <p className="text-xs font-bold text-slate-400">শ্রেণি: {recentReceiptModal.student_class || '---'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-left text-xs font-bold text-slate-600">
                <div className="flex justify-between">
                  <span>ট্রানজাকশন আইডি:</span>
                  <span className="font-mono text-slate-900 font-black">{recentReceiptModal.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>ক্যাটাগরি:</span>
                  <span className="text-slate-900 font-black">{recentReceiptModal.category}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span>পরিশোধিত পরিমাণ:</span>
                  <span className="font-black text-emerald-700 text-base">৳ {recentReceiptModal.amount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCallingStudent({
                      name: recentReceiptModal.student_name,
                      class: recentReceiptModal.student_class,
                      dueAmount: 0
                    });
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Phone className="w-4 h-4 fill-slate-950" />
                  📞 অভিভাবকের ফোনে ধন্যবাদ কল দিন
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if ('Notification' in window && Notification.permission !== 'granted') {
                      Notification.requestPermission();
                    }
                    addToast("অভিভাবক অ্যাপে পেমেন্ট নোটিফিকেশন ও পিডিএফ রিসিট পাঠানো হয়েছে!", "success");
                  }}
                  className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-800 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  🔔 অভিভাবক অ্যাপে নোটিফিকেশন ও PDF পাঠান
                </button>

                <button
                  type="button"
                  onClick={() => setRecentReceiptModal(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
