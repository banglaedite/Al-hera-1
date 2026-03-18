import React, { useState, useEffect, useRef } from "react";
import { 
  DollarSign, Plus, Search, TrendingUp, TrendingDown, 
  Printer, Download, Calendar, Filter, MoreVertical,
  Share2, Mail, MessageCircle, PieChart, ArrowUpRight, ArrowDownRight,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from 'html-to-image';
import { cn } from "../lib/utils";
import { LoadingButton } from "./LoadingButton";
import jsPDF from "jspdf";

export function AccountingManager({ settings, addToast }: { settings: any, addToast: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, feeIncome: 0, otherIncome: 0 });
  const [income, setIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeView, setActiveView] = useState<"summary" | "income" | "expense">("summary");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [incomeOffset, setIncomeOffset] = useState(0);
  const [expenseOffset, setExpenseOffset] = useState(0);
  const [hasMoreIncome, setHasMoreIncome] = useState(false);
  const [hasMoreExpenses, setHasMoreExpenses] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setIncomeOffset(0);
      setExpenseOffset(0);
    }
    
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const summaryRes = await fetch(`/api/admin/accounting/summary?${params}`);
    setSummary(await summaryRes.json());

    const incomeParams = new URLSearchParams(params);
    incomeParams.append("limit", "50");
    incomeParams.append("offset", reset ? "0" : incomeOffset.toString());
    const incomeRes = await fetch(`/api/admin/accounting/income?${incomeParams}`);
    const incomeData = await incomeRes.json();
    if (reset) setIncome(incomeData.data);
    else setIncome(prev => [...prev, ...incomeData.data]);
    setHasMoreIncome(incomeData.hasMore);

    const expenseParams = new URLSearchParams(params);
    expenseParams.append("limit", "50");
    expenseParams.append("offset", reset ? "0" : expenseOffset.toString());
    const expenseRes = await fetch(`/api/admin/accounting/expenses?${expenseParams}`);
    const expenseData = await expenseRes.json();
    if (reset) setExpenses(expenseData.data);
    else setExpenses(prev => [...prev, ...expenseData.data]);
    setHasMoreExpenses(expenseData.hasMore);

    setLoading(false);
  };

  const loadMoreIncome = async () => {
    const nextOffset = incomeOffset + 50;
    setIncomeOffset(nextOffset);
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("limit", "50");
    params.append("offset", nextOffset.toString());
    
    const res = await fetch(`/api/admin/accounting/income?${params}`);
    const data = await res.json();
    setIncome(prev => [...prev, ...data.data]);
    setHasMoreIncome(data.hasMore);
  };

  const loadMoreExpenses = async () => {
    const nextOffset = expenseOffset + 50;
    setExpenseOffset(nextOffset);
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("limit", "50");
    params.append("offset", nextOffset.toString());
    
    const res = await fetch(`/api/admin/accounting/expenses?${params}`);
    const data = await res.json();
    setExpenses(prev => [...prev, ...data.data]);
    setHasMoreExpenses(data.hasMore);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (month) {
      const [year, m] = month.split("-");
      const firstDay = `${year}-${m}-01`;
      const lastDay = new Date(parseInt(year), parseInt(m), 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else {
      setStartDate("");
      setEndDate("");
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

  const handleAddTransaction = async (e: React.FormEvent, type: 'income' | 'expense') => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    const url = type === 'income' ? "/api/admin/accounting/income" : "/api/admin/accounting/expenses";
    
    setIsSubmitting(true);
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      setIsAddingExpense(false);
      setIsAddingIncome(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    setPasswordError("");
    if (deletePassword !== "admin123") {
      setPasswordError("ভুল পাসওয়ার্ড!");
      return;
    }

    setIsSubmitting(true);
    const isIncome = selectedTransaction.paid_date || selectedTransaction.type === 'Other';
    const url = isIncome 
      ? `/api/admin/accounting/income/${selectedTransaction.id}` 
      : `/api/admin/accounting/expenses/${selectedTransaction.id}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });

      if (res.ok) {
        setIsDeletingTransaction(false);
        setDeletePassword("");
        setSelectedTransaction(null);
        fetchData();
      } else {
        const data = await res.json();
        setPasswordError(data.error || "ডিলিট করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      console.error(error);
      setPasswordError("ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900">হিসাব-নিকাশ</h2>
          <p className="text-slate-500 font-bold">মাদরাসার আয়-ব্যয়ের বিস্তারিত পরিসংখ্যান</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddingIncome(true)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-5 h-5" /> আয় যোগ করুন
          </button>
          <button 
            onClick={() => setIsAddingExpense(true)}
            className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-5 h-5" /> খরচ যোগ করুন
          </button>
          <button 
            onClick={handlePrint}
            className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
          >
            <Printer className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="font-bold text-slate-700">ফিল্টার:</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1">মাস নির্বাচন</label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1">শুরু</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-slate-400 mt-5">থেকে</span>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1">শেষ</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setStartDate(""); setEndDate(""); setSelectedMonth(""); }}
          className="text-slate-400 hover:text-slate-600 font-bold text-sm ml-auto mt-5"
        >
          রিসেট
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                {calculatePercentage(summary.totalIncome, summary.totalIncome + summary.totalExpense)}% Total
              </span>
            </div>
          </div>
          <p className="text-slate-500 font-bold text-sm">মোট আয়</p>
          <h3 className="text-2xl font-black text-slate-900">৳{summary.totalIncome}</h3>
          <div className="mt-4 flex gap-2 text-[10px] font-bold">
            <span className="text-blue-500">ফি: ৳{summary.feeIncome}</span>
            <span className="text-emerald-500">অন্যান্য: ৳{summary.otherIncome}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><TrendingDown className="w-6 h-6" /></div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 px-2 py-1 rounded-full">
                {calculatePercentage(summary.totalExpense, summary.totalIncome + summary.totalExpense)}% Total
              </span>
            </div>
          </div>
          <p className="text-slate-500 font-bold text-sm">মোট খরচ</p>
          <h3 className="text-2xl font-black text-slate-900">৳{summary.totalExpense}</h3>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><PieChart className="w-6 h-6" /></div>
          </div>
          <p className="text-slate-500 font-bold text-sm">বর্তমান ব্যালেন্স</p>
          <h3 className="text-2xl font-black text-slate-900">৳{summary.balance}</h3>
          <p className={cn("text-xs font-bold mt-2", summary.balance >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {summary.balance >= 0 ? "উদ্বৃত্ত" : "ঘাটতি"}
          </p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-slate-900 p-6 rounded-[2rem] shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 text-white rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          </div>
          <p className="text-slate-400 font-bold text-sm">আয়-ব্যয় অনুপাত</p>
          <h3 className="text-2xl font-black text-white">
            {summary.totalExpense > 0 ? (summary.totalIncome / summary.totalExpense).toFixed(2) : summary.totalIncome}
          </h3>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-1000" 
              style={{ width: `${calculatePercentage(summary.totalIncome, summary.totalIncome + summary.totalExpense)}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100 print:hidden">
        <button 
          onClick={() => setActiveView("summary")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "summary" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          সংক্ষিপ্ত রিপোর্ট
        </button>
        <button 
          onClick={() => setActiveView("income")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "income" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          বিস্তারিত আয়
        </button>
        <button 
          onClick={() => setActiveView("expense")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "expense" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          বিস্তারিত ব্যয়
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8">
        {activeView === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" /> সাম্প্রতিক আয়
                </h3>
                <button onClick={() => setActiveView("income")} className="text-xs font-bold text-blue-600 hover:underline">সব দেখুন</button>
              </div>
              <div className="space-y-4">
                {income.slice(0, 5).map(i => (
                  <div key={`summary-income-${i.id}`} onClick={() => setSelectedTransaction(i)} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{i.student_name || i.category}</p>
                        <p className="text-[10px] font-bold text-slate-500">{new Date(i.paid_date || i.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                    <p className="font-black text-emerald-600">৳{i.amount}</p>
                  </div>
                ))}
                {income.length === 0 && <p className="text-center py-8 text-slate-400 font-bold">কোন আয়ের রেকর্ড নেই</p>}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingDown className="text-rose-600" /> সাম্প্রতিক খরচ
                </h3>
                <button onClick={() => setActiveView("expense")} className="text-xs font-bold text-blue-600 hover:underline">সব দেখুন</button>
              </div>
              <div className="space-y-4">
                {expenses.slice(0, 5).map(e => (
                  <div key={`summary-expense-${e.id}`} onClick={() => setSelectedTransaction(e)} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                        <ArrowDownRight className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">{e.category}</p>
                        <p className="text-[10px] font-bold text-slate-500">{new Date(e.date).toLocaleDateString('bn-BD')}</p>
                      </div>
                    </div>
                    <p className="font-black text-rose-600">৳{e.amount}</p>
                  </div>
                ))}
                {expenses.length === 0 && <p className="text-center py-8 text-slate-400 font-bold">কোন খরচের রেকর্ড নেই</p>}
              </div>
            </div>
          </div>
        )}

        {activeView === "income" && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">তারিখ</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">উৎস/ছাত্র</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">ক্যাটাগরি</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">বাবদ/উদ্দেশ্য</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {income.map(i => (
                    <tr key={`income-list-${i.id}`} onClick={() => setSelectedTransaction(i)} className="group hover:bg-slate-50 cursor-pointer transition-all">
                      <td className="py-4 text-sm font-bold text-slate-500">{new Date(i.paid_date || i.date).toLocaleDateString('bn-BD')}</td>
                      <td className="py-4 font-black text-slate-900">
                        <span 
                          onClick={(e) => {
                            if (i.student_id) {
                              e.stopPropagation();
                              handleViewProfile(i.student_id);
                            }
                          }}
                          className={cn(i.student_id ? "hover:text-emerald-600 hover:underline cursor-pointer" : "")}
                        >
                          {i.student_name || "অন্যান্য"}
                        </span>
                        {i.student_deleted_at && <span className="ml-2 text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">(ডিলিটেড)</span>}
                      </td>
                      <td className="py-4 text-sm font-bold text-slate-600">{i.category}</td>
                      <td className="py-4 text-sm text-slate-500">{i.purpose || i.description || "-"}</td>
                      <td className="py-4 text-right font-black text-emerald-600">৳{i.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMoreIncome && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={loadMoreIncome}
                    className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    আরো দেখুন
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "expense" && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">তারিখ</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">ক্যাটাগরি</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">বাবদ/উদ্দেশ্য</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.map(e => (
                    <tr key={`expense-list-${e.id}`} onClick={() => setSelectedTransaction(e)} className="group hover:bg-slate-50 cursor-pointer transition-all">
                      <td className="py-4 text-sm font-bold text-slate-500">{new Date(e.date).toLocaleDateString('bn-BD')}</td>
                      <td className="py-4 font-black text-slate-900">{e.category}</td>
                      <td className="py-4 text-sm text-slate-500">{e.purpose || e.description || "-"}</td>
                      <td className="py-4 text-right font-black text-rose-600">৳{e.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMoreExpenses && (
                <div className="mt-8 flex justify-center">
                  <button 
                    onClick={loadMoreExpenses}
                    className="px-8 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
                  >
                    আরো দেখুন
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {(isAddingExpense || isAddingIncome) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">{isAddingIncome ? "নতুন আয়" : "নতুন খরচ"}</h3>
                <button onClick={() => { setIsAddingExpense(false); setIsAddingIncome(false); }} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <form onSubmit={(e) => handleAddTransaction(e, isAddingIncome ? 'income' : 'expense')} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">ক্যাটাগরি</label>
                  <input name="category" required placeholder="যেমন: দান, বেতন, মেরামত" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">বাবদ/উদ্দেশ্য</label>
                  <input name="purpose" required placeholder="বিস্তারিত লিখুন" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">পরিমাণ (টাকা)</label>
                    <input name="amount" type="number" required placeholder="0.00" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">তারিখ</label>
                    <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">অতিরিক্ত বর্ণনা (ঐচ্ছিক)</label>
                  <textarea name="description" className="w-full p-4 bg-slate-50 border rounded-2xl font-medium h-20" placeholder="অন্যান্য তথ্য..." />
                </div>
                <LoadingButton 
                  loading={isSubmitting}
                  type="submit" 
                  className={cn(
                    "w-full py-4 text-white rounded-2xl font-black transition-all",
                    isAddingIncome ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  )}
                >
                  সেভ করুন
                </LoadingButton>
              </form>
            </motion.div>
          </motion.div>
        )}

        {selectedTransaction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center print:hidden">
                <h3 className="text-xl font-black text-slate-900">মানি রিসিট</h3>
                <button onClick={() => setSelectedTransaction(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div id="transaction-detail" className="p-8 space-y-8 bg-white relative">
                {/* Receipt Header */}
                <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-6">
                  {settings?.logo_url && (
                    <img src={settings.logo_url} className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{settings?.title || "আল হেরা মাদরাসা"}</h2>
                    <p className="text-xs font-bold text-slate-500">{settings?.address || "ঠিকানা এখানে লিখুন"}</p>
                    <p className="text-[10px] font-bold text-slate-400">ফোন: {settings?.contact_phone}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-2">
                      মানি রিসিট
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">রিসিট নং: #{selectedTransaction.id.toString().padStart(6, '0')}</p>
                  </div>
                </div>

                {/* Receipt Body */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">তারিখ</p>
                      <p className="font-bold text-slate-900">{new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">ছাত্রের নাম/উৎস</p>
                      <p className="font-bold text-slate-900">{selectedTransaction.student_name || "অন্যান্য"}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">ক্যাটাগরি</p>
                      <p className="font-bold text-slate-900">{selectedTransaction.category}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">লেনদেনের ধরণ</p>
                      <p className="font-bold text-slate-900">{(selectedTransaction.paid_date || selectedTransaction.type === 'Other') ? "আয়" : "ব্যয়"}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 border-dashed">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">বিবরণ/উদ্দেশ্য</p>
                    <p className="font-bold text-slate-900 leading-relaxed">{selectedTransaction.purpose || selectedTransaction.description || "-"}</p>
                  </div>

                  <div className="flex justify-between items-center p-6 bg-slate-900 text-white rounded-3xl shadow-lg">
                    <p className="font-bold uppercase tracking-widest text-xs">মোট পরিমাণ</p>
                    <h2 className="text-3xl font-black">৳{selectedTransaction.amount}</h2>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-12 pt-12">
                  <div className="text-center">
                    <div className="border-t border-slate-300 pt-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase">আদায়কারীর স্বাক্ষর</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-slate-300 pt-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase">পরিচালক স্বাক্ষর</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-8 border-t border-slate-50">
                  <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Powered by Madrasa Management System</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-5 gap-2 print:hidden">
                <button onClick={() => window.print()} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                  <Printer className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] font-bold">প্রিন্ট</span>
                </button>
                <button onClick={async () => {
                  const element = document.getElementById('transaction-detail');
                  if (!element) return;
                  try {
                    const imgData = await toPng(element, { 
                      quality: 1,
                      pixelRatio: 2,
                      backgroundColor: '#ffffff',
                      style: {
                        backgroundColor: '#ffffff'
                      }
                    });
                    const pdf = new jsPDF('p', 'mm', 'a5');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const margin = 10;
                    const contentWidth = pdfWidth - (2 * margin);
                    
                    const img = new Image();
                    img.src = imgData;
                    img.onload = () => {
                      const contentHeight = (img.height * contentWidth) / img.width;
                      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                      pdf.save(`receipt-${selectedTransaction.id}.pdf`);
                    };
                  } catch (err) {
                    console.error("PDF generation failed", err);
                    addToast("PDF তৈরি করতে সমস্যা হয়েছে।", "error");
                  }
                }} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                  <Download className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] font-bold">ডাউনলোড</span>
                </button>
                <button 
                  onClick={async () => {
                    const element = document.getElementById('transaction-detail');
                    if (element) {
                      try {
                        const imgData = await toPng(element, { 
                          quality: 1,
                          pixelRatio: 2,
                          backgroundColor: '#ffffff',
                          style: {
                            backgroundColor: '#ffffff'
                          }
                        });
                        const pdf = new jsPDF('p', 'mm', 'a5');
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const margin = 10;
                        const contentWidth = pdfWidth - (2 * margin);
                        
                        const img = new Image();
                        img.src = imgData;
                        await new Promise((resolve) => {
                          img.onload = () => {
                            const contentHeight = (img.height * contentWidth) / img.width;
                            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                            pdf.save(`receipt-${selectedTransaction.id}.pdf`);
                            resolve(null);
                          };
                        });
                      } catch (err) {
                        console.error("PDF generation failed", err);
                      }
                    }
                    const text = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nক্যাটাগরি: ${selectedTransaction.category}\nবিবরণ: ${selectedTransaction.purpose || selectedTransaction.description || "-"}\n\nরশিদের পিডিএফ ফাইলটি ডাউনলোড হয়েছে, দয়া করে সেটি এখানে সংযুক্ত করুন।`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </button>
                <button 
                  onClick={async () => {
                    const element = document.getElementById('transaction-detail');
                    if (!element) return;

                    const toastId = addToast("ইমেইল পাঠানো হচ্ছে...", "info");

                    try {
                      const imgData = await toPng(element, { 
                        quality: 1,
                        pixelRatio: 2,
                        backgroundColor: '#ffffff',
                        style: { backgroundColor: '#ffffff' }
                      });
                      
                      const pdf = new jsPDF('p', 'mm', 'a5');
                      const pdfWidth = pdf.internal.pageSize.getWidth();
                      const margin = 10;
                      const contentWidth = pdfWidth - (2 * margin);
                      
                      const img = new Image();
                      img.src = imgData;
                      
                      await new Promise((resolve) => {
                        img.onload = () => {
                          const contentHeight = (img.height * contentWidth) / img.width;
                          pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                          resolve(null);
                        };
                      });

                      const pdfBase64 = pdf.output('datauristring').split(',')[1];

                      const response = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: "", // User will need to provide email if not available
                          subject: `মানি রিসিট - ${settings?.title || "আল হেরা মাদরাসা"}`,
                          text: `আসসালামু আলাইকুম,\nআপনার পেমেন্ট সফল হয়েছে। রিসিটটি সংযুক্ত করা হলো।\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nধন্যবাদ।`,
                          attachments: [
                            {
                              filename: `Receipt_${selectedTransaction.id}.pdf`,
                              content: pdfBase64,
                              encoding: 'base64'
                            }
                          ]
                        })
                      });

                      if (response.ok) {
                        addToast("ইমেইল সফলভাবে পাঠানো হয়েছে।", "success");
                      } else {
                        // If to is empty, mailto fallback
                        const subject = `মানি রিসিট - ${settings?.title || "আল হেরা মাদরাসা"}`;
                        const body = `লেনদেনের বিবরণ:\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nক্যাটাগরি: ${selectedTransaction.category}\nবিবরণ: ${selectedTransaction.purpose || selectedTransaction.description || "-"}`;
                        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                        addToast("ইমেইল পাঠানোর উইন্ডো ওপেন হয়েছে।", "info");
                      }
                    } catch (err) {
                      console.error("Email sending failed", err);
                      // Fallback to mailto
                      const subject = `মানি রিসিট - ${settings?.title || "আল হেরা মাদরাসা"}`;
                      const body = `লেনদেনের বিবরণ:\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nক্যাটাগরি: ${selectedTransaction.category}\nবিবরণ: ${selectedTransaction.purpose || selectedTransaction.description || "-"}`;
                      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
                    }
                  }}
                  className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold">ইমেইল</span>
                </button>
                <button onClick={() => setIsDeletingTransaction(true)} className="flex flex-col items-center gap-1 p-2 hover:bg-rose-100 rounded-xl transition-all text-rose-600">
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold">ডিলিট</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Transaction Modal */}
        <AnimatePresence>
          {isDeletingTransaction && (
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
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setPasswordError("");
                  }}
                  className={cn(
                    "w-full p-4 bg-slate-50 border rounded-2xl font-bold mb-2 text-center focus:ring-2 outline-none",
                    passwordError ? "border-rose-500 focus:ring-rose-500" : "border-slate-200 focus:ring-rose-500"
                  )}
                />
                {passwordError && <p className="text-rose-500 text-xs font-bold mb-4">{passwordError}</p>}
                
                <div className="flex gap-4">
                  <button 
                    disabled={isSubmitting}
                    onClick={() => { setIsDeletingTransaction(false); setDeletePassword(""); setPasswordError(""); }}
                    className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    বাতিল
                  </button>
                  <LoadingButton 
                    loading={isSubmitting}
                    onClick={handleDeleteTransaction}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all"
                  >
                    ডিলিট করুন
                  </LoadingButton>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        {selectedStudentProfile && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900">ছাত্রের প্রোফাইল</h3>
                <button onClick={() => setSelectedStudentProfile(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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
      </AnimatePresence>
    </div>
  );
}
