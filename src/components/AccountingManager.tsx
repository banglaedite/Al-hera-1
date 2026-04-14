import React, { useState, useEffect, useRef } from "react";
import { 
  DollarSign, Plus, Search, TrendingUp, TrendingDown, 
  Printer, Download, Calendar, Filter, MoreVertical,
  Share2, Mail, MessageCircle, PieChart, ArrowUpRight, ArrowDownRight,
  Trash2, X as CloseIcon, ArrowRightLeft, History, Loader2, Clock, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from 'html2canvas';

// ... (keep other imports)
import { cn } from "../lib/utils";
import { LoadingButton } from "./LoadingButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { printElement } from '../utils/printUtils';
import MonthlyYearlyReport from './MonthlyYearlyReport';

const PrintDownloadMenu = ({ targetId, filename, onPrint, onDownload }: { targetId: string, filename: string, onPrint?: (type: 'all' | 'income' | 'expense') => void, onDownload?: (type: 'all' | 'income' | 'expense') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 print:hidden relative" ref={menuRef}>
      <div className="flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button 
          onClick={() => onPrint?.('all')}
          className="flex items-center gap-2 px-4 py-2.5 text-slate-700 font-black hover:bg-slate-50 transition-all text-sm active:scale-95"
          title="সব প্রিন্ট করুন"
        >
          <Printer className="w-4 h-4 text-slate-900" /> প্রিন্ট
        </button>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-2.5 text-slate-400 hover:bg-slate-50 transition-all border-l border-slate-100"
        >
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আলাদা রিপোর্ট প্রিন্ট</p>
            </div>
            <button 
              onClick={() => { onPrint?.('income'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
            >
              <TrendingUp className="w-4 h-4" /> শুধু আয় প্রিন্ট
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button 
              onClick={() => { onPrint?.('expense'); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-all"
            >
              <TrendingDown className="w-4 h-4" /> শুধু ব্যয় প্রিন্ট
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function AccountingManager({ settings, addToast, classesList }: { settings: any, addToast: (message: string, type?: 'success' | 'error' | 'info') => void, classesList?: string[] }) {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, feeIncome: 0, otherIncome: 0, prevBalance: 0, totalBalance: 0 });
  const [prevSummary, setPrevSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [income, setIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeView, setActiveView] = useState<"summary" | "income" | "expense" | "category-report" | "class-report" | "monthly-report" | "yearly-report">("summary");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  const [printType, setPrintType] = useState<"all" | "income" | "expense">("all");
  
  const [reportMonth, setReportMonth] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportClass, setReportClass] = useState("");
  const [categoryReportData, setCategoryReportData] = useState<any>(null);
  const [classReportData, setClassReportData] = useState<any>(null);
  const [monthlyReportData, setMonthlyReportData] = useState<any>(null);
  const [yearlyReportData, setYearlyReportData] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incomeCategories, setIncomeCategories] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  
  const [incomeOffset, setIncomeOffset] = useState(0);
  const [expenseOffset, setExpenseOffset] = useState(0);
  const [hasMoreIncome, setHasMoreIncome] = useState(false);
  const [hasMoreExpenses, setHasMoreExpenses] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonth = `${year}-${month}`;
    
    const firstDay = `${year}-${month}-01`;
    const lastDayDate = new Date(year, now.getMonth() + 1, 0);
    const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
    
    setStartDate(firstDay);
    setEndDate(lastDay);
    setSelectedMonth(currentMonth);
    setSelectedYear(String(year));
  }, []);

  const fetchCategoryReport = async () => {
    setLoadingReport(true);
    try {
      const params = new URLSearchParams();
      if (reportMonth) params.append("month", reportMonth);
      if (reportCategory) params.append("category", reportCategory);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (reportClass) params.append("class_name", reportClass);
      
      const res = await fetch(`/api/admin/accounting/reports/category?${params}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCategoryReportData(data);
    } catch (e) {
      console.error(e);
      setCategoryReportData({ income: [], expenses: [] });
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchClassReport = async () => {
    setLoadingReport(true);
    try {
      const params = new URLSearchParams();
      if (reportClass) params.append("class_name", reportClass);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const res = await fetch(`/api/admin/accounting/reports/class?${params}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setClassReportData(data);
    } catch (e) {
      console.error(e);
      setClassReportData({ fees: [], income: [], expenses: [] });
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchMonthlyYearlyReport = async () => {
    setLoadingReport(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      if (reportClass) params.append("class_name", reportClass);
      
      const res = await fetch(`/api/admin/accounting/reports/category?${params}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (activeView === "monthly-report") {
        setMonthlyReportData(data);
      } else if (activeView === "yearly-report") {
        setYearlyReportData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeView === "category-report") {
      fetchCategoryReport();
    } else if (activeView === "class-report") {
      fetchClassReport();
    } else if (activeView === "monthly-report" || activeView === "yearly-report") {
      fetchMonthlyYearlyReport();
    }
  }, [activeView, reportMonth, reportCategory, reportClass, startDate, endDate]);

  const fetchData = async (reset = true) => {
    if (reset) {
      setLoading(true);
      setIncomeOffset(0);
      setExpenseOffset(0);
    }
    
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    if (reportClass) params.append("class_name", reportClass);

    const summaryRes = await fetch(`/api/admin/accounting/summary?${params}`);
    if (!summaryRes.ok) throw new Error(`HTTP error! status: ${summaryRes.status}`);
    const summaryData = await summaryRes.json();
    setSummary(summaryData);

    // Fetch previous month summary if month is selected
    if (selectedMonth) {
      const [year, m] = selectedMonth.split("-");
      const prevDate = new Date(parseInt(year), parseInt(m) - 2, 1);
      const firstDay = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDayDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0);
      const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
      
      const prevParams = new URLSearchParams();
      prevParams.append("start_date", firstDay);
      prevParams.append("end_date", lastDay);
      try {
        const prevRes = await fetch(`/api/admin/accounting/summary?${prevParams}`);
        if (!prevRes.ok) throw new Error(`HTTP error! status: ${prevRes.status}`);
        const prevData = await prevRes.json();
        setPrevSummary(prevData);
      } catch (err) {
        console.error("Failed to fetch previous summary:", err);
      }
    }

    // Fetch categories
    try {
      const [incCatRes, expCatRes] = await Promise.all([
        fetch("/api/admin/accounting/income-categories"),
        fetch("/api/admin/accounting/expense-categories")
      ]);
      if (incCatRes.ok) setIncomeCategories(await incCatRes.json());
      if (expCatRes.ok) setExpenseCategories(await expCatRes.json());
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }

    const incomeParams = new URLSearchParams(params);
    incomeParams.append("limit", "20");
    incomeParams.append("offset", reset ? "0" : incomeOffset.toString());
    const incomeRes = await fetch(`/api/admin/accounting/income?${incomeParams}`);
    const incomeData = await incomeRes.json();
    if (reset) setIncome(incomeData.data || []);
    else setIncome(prev => [...prev, ...(incomeData.data || [])]);
    setHasMoreIncome(incomeData.hasMore || false);

    const expenseParams = new URLSearchParams(params);
    expenseParams.append("limit", "20");
    expenseParams.append("offset", reset ? "0" : expenseOffset.toString());
    const expenseRes = await fetch(`/api/admin/accounting/expenses?${expenseParams}`);
    const expenseData = await expenseRes.json();
    if (reset) setExpenses(expenseData.data || []);
    else setExpenses(prev => [...prev, ...(expenseData.data || [])]);
    setHasMoreExpenses(expenseData.hasMore || false);

    setLoading(false);
  };

  const loadMoreIncome = async () => {
    const nextOffset = incomeOffset + 20;
    setIncomeOffset(nextOffset);
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("limit", "20");
    params.append("offset", nextOffset.toString());
    
    const res = await fetch(`/api/admin/accounting/income?${params}`);
    const data = await res.json();
    setIncome(prev => [...prev, ...(data.data || [])]);
    setHasMoreIncome(data.hasMore || false);
  };

  const loadMoreExpenses = async () => {
    const nextOffset = expenseOffset + 20;
    setExpenseOffset(nextOffset);
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    params.append("limit", "20");
    params.append("offset", nextOffset.toString());
    
    const res = await fetch(`/api/admin/accounting/expenses?${params}`);
    const data = await res.json();
    setExpenses(prev => [...prev, ...(data.data || [])]);
    setHasMoreExpenses(data.hasMore || false);
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (year) {
      if (selectedMonth) {
        // Update month to the new year
        const monthPart = selectedMonth.split("-")[1];
        const newMonth = `${year}-${monthPart}`;
        handleMonthChange(newMonth);
      } else {
        // Set to full year
        setStartDate(`${year}-01-01`);
        setEndDate(`${year}-12-31`);
      }
    } else {
      setStartDate("");
      setEndDate("");
      setSelectedMonth("");
    }
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (month) {
      const [year, m] = month.split("-");
      setSelectedYear(year);
      const firstDay = `${year}-${m}-01`;
      const lastDayDate = new Date(parseInt(year), parseInt(m), 0);
      const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (selectedYear) {
      // Revert to full year if month cleared but year exists
      setStartDate(`${selectedYear}-01-01`);
      setEndDate(`${selectedYear}-12-31`);
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
    const adminPassword = settings?.admin_password || "1234";
    if (deletePassword !== adminPassword && deletePassword !== "admin123" && deletePassword !== "১২৩৪") {
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

  const generateBeautifulReportHTML = (reportTitle: string, contentHtml: string, dateRange: string, classInfo: string = "") => {
    const title = settings?.title || "আল-হেরা ক্যাডেট মাদ্রাসা";
    const address = settings?.address || "সাভার, ঢাকা";
    const logo = settings?.logo || "/logo.png";

    return `
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <title>${reportTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Hind Siliguri', sans-serif; padding: 40px; color: #1e293b; background: white; line-height: 1.5; }
            
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px double #0f172a; padding-bottom: 20px; position: relative; }
            .logo-container { margin-bottom: 15px; }
            .logo { width: 80px; height: 80px; object-contain: contain; }
            
            .madrasa-name { font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.5px; }
            .madrasa-address { font-size: 16px; font-weight: 600; color: #475569; margin-bottom: 10px; }
            
            .report-info { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 24px; border-radius: 12px; margin-top: 10px; }
            .report-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 5px; text-decoration: underline; text-underline-offset: 6px; }
            .report-meta { font-size: 14px; font-weight: 700; color: #64748b; display: flex; justify-content: center; gap: 20px; margin-top: 10px; }
            
            .section-title { font-size: 16px; font-weight: 800; margin: 30px 0 12px 0; padding: 8px 16px; background: #f1f5f9; border-left: 5px solid #0f172a; color: #0f172a; border-radius: 0 8px 8px 0; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; table-layout: fixed; }
            th, td { border: 1.5px solid #cbd5e1; padding: 12px 10px; text-align: center; font-size: 14px; word-wrap: break-word; }
            
            th { background-color: #f8fafc; font-weight: 800; color: #334155; text-transform: uppercase; font-size: 13px; }
            
            .summary-row td { font-weight: 800; font-size: 16px; background: #f8fafc; }
            .income-th { background-color: #ecfdf5 !important; color: #065f46 !important; border-color: #a7f3d0 !important; }
            .expense-th { background-color: #fef2f2 !important; color: #991b1b !important; border-color: #fecaca !important; }
            .summary-th { background-color: #0f172a !important; color: white !important; border-color: #0f172a !important; }
            .due-th { background-color: #fff7ed !important; color: #9a3412 !important; border-color: #ffedd5 !important; }
            
            .amount { font-family: 'Courier New', Courier, monospace; font-weight: 800; }
            
            .footer { margin-top: 80px; display: flex; justify-content: space-between; padding: 0 40px; }
            .signature { border-top: 2px solid #0f172a; width: 220px; text-align: center; padding-top: 12px; font-size: 14px; font-weight: 800; color: #0f172a; }
            
            @media print {
              body { padding: 20px; }
              @page { margin: 15mm; size: A4; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img src="${logo}" alt="Logo" class="logo" onerror="this.style.display='none'">
            </div>
            <div class="madrasa-name">${title}</div>
            <div class="madrasa-address">${address}</div>
            <div class="report-title">${reportTitle}</div>
            <div class="report-meta">
              <span>তারিখ: ${new Date().toLocaleDateString('bn-BD')}</span>
              ${dateRange ? `<span>সময়কাল: ${dateRange}</span>` : ''}
              ${classInfo ? `<span>শ্রেণী: ${classInfo}</span>` : ''}
            </div>
          </div>
          
          ${contentHtml}
          
          <div class="footer">
            <div class="signature">হিসাবরক্ষকের স্বাক্ষর</div>
            <div class="signature">মুহতামিমের স্বাক্ষর</div>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: bold;">
            রিপোর্ট জেনারেট করা হয়েছে: ${new Date().toLocaleString('bn-BD')}
          </div>
        </body>
      </html>
    `;
  };

  const handleReportAction = async (action: 'print' | 'download', filterType: 'all' | 'income' | 'expense' = 'all') => {
    setLoading(true);
    try {
      let reportTitle = "অ্যাকাউন্টিং রিপোর্ট";
      let dateRange = startDate && endDate ? `${new Date(startDate).toLocaleDateString('bn-BD')} - ${new Date(endDate).toLocaleDateString('bn-BD')}` : "";
      let classInfo = reportClass || "";
      let contentHtml = "";

      if (activeView === "summary") {
        reportTitle = "সংক্ষিপ্ত আয়-ব্যয় রিপোর্ট";
        
        const summaryHtml = `
          <div class="section-title">আর্থিক সারসংক্ষেপ</div>
          <table>
            <thead>
              <tr>
                <th class="summary-th">মোট আয়</th>
                <th class="summary-th">মোট ব্যয়</th>
                <th class="summary-th">অবশিষ্ট</th>
              </tr>
            </thead>
            <tbody>
              <tr class="summary-row">
                <td style="color: #059669">৳${summary.totalIncome.toLocaleString('en-IN')}</td>
                <td style="color: #dc2626">৳${summary.totalExpense.toLocaleString('en-IN')}</td>
                <td style="color: #2563eb">৳${summary.balance.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: -10px; margin-bottom: 20px; font-size: 13px; color: #64748b; font-weight: 800; text-align: right;">
            * পূর্বের জের সহ মোট স্থিতি: ৳${summary.totalBalance.toLocaleString('en-IN')}
          </div>
        `;

        const incomeHtml = `
          <div class="section-title">আয়সমূহ</div>
          <table>
            <thead>
              <tr>
                <th class="income-th" style="width: 20%">তারিখ</th>
                <th class="income-th" style="width: 50%">উৎস/বিবরণ</th>
                <th class="income-th" style="width: 30%">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${income.slice(0, 100).map(i => `
                <tr>
                  <td>${new Date(i.paid_date || i.date).toLocaleDateString('bn-BD')}</td>
                  <td>${i.student_name || i.category || ''} ${i.purpose ? `(${i.purpose})` : ''}</td>
                  <td class="amount">৳${i.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${income.length === 0 ? '<tr><td colspan="3">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        const expenseHtml = `
          <div class="section-title">ব্যয়সমূহ</div>
          <table>
            <thead>
              <tr>
                <th class="expense-th" style="width: 20%">তারিখ</th>
                <th class="expense-th" style="width: 50%">খাত/বিবরণ</th>
                <th class="expense-th" style="width: 30%">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.slice(0, 100).map(e => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                  <td>${e.category || ''} ${e.purpose ? `(${e.purpose})` : ''}</td>
                  <td class="amount">৳${e.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${expenses.length === 0 ? '<tr><td colspan="3">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        if (filterType === 'all') {
          contentHtml = summaryHtml + incomeHtml + expenseHtml;
        } else if (filterType === 'income') {
          contentHtml = summaryHtml + incomeHtml;
          reportTitle = "সংক্ষিপ্ত আয় রিপোর্ট";
        } else {
          contentHtml = summaryHtml + expenseHtml;
          reportTitle = "সংক্ষিপ্ত ব্যয় রিপোর্ট";
        }
      } else if (activeView === "category-report" && categoryReportData) {
        reportTitle = `ক্যাটাগরি রিপোর্ট: ${reportCategory || "সব ক্যাটাগরি"}`;
        const totalInc = categoryReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
        const totalExp = categoryReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        
        const summaryHtml = `
          <div class="section-title">ক্যাটাগরি সারসংক্ষেপ</div>
          <table>
            <thead>
              <tr>
                <th class="summary-th">মোট আয়</th>
                <th class="summary-th">মোট ব্যয়</th>
                <th class="summary-th">অবশিষ্ট</th>
              </tr>
            </thead>
            <tbody>
              <tr class="summary-row">
                <td style="color: #059669">৳${totalInc.toLocaleString('en-IN')}</td>
                <td style="color: #dc2626">৳${totalExp.toLocaleString('en-IN')}</td>
                <td style="color: #2563eb">৳${(totalInc - totalExp).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        `;

        const incomeHtml = `
          <div class="section-title">আয়সমূহ</div>
          <table>
            <thead>
              <tr>
                <th class="income-th">তারিখ</th>
                <th class="income-th">বিবরণ</th>
                <th class="income-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${categoryReportData.income.map((i: any) => `
                <tr>
                  <td>${new Date(i.date || i.paid_date).toLocaleDateString('bn-BD')}</td>
                  <td>${i.purpose || i.description || i.category || i.student_name}</td>
                  <td class="amount">৳${i.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${categoryReportData.income.length === 0 ? '<tr><td colspan="3">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        const expenseHtml = `
          <div class="section-title">ব্যয়সমূহ</div>
          <table>
            <thead>
              <tr>
                <th class="expense-th">তারিখ</th>
                <th class="expense-th">বিবরণ</th>
                <th class="expense-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${categoryReportData.expenses.map((e: any) => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                  <td>${e.purpose || e.description || e.category}</td>
                  <td class="amount">৳${e.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${categoryReportData.expenses.length === 0 ? '<tr><td colspan="3">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        if (filterType === 'all') {
          contentHtml = summaryHtml + incomeHtml + expenseHtml;
        } else if (filterType === 'income') {
          contentHtml = summaryHtml + incomeHtml;
        } else {
          contentHtml = summaryHtml + expenseHtml;
        }
      } else if (activeView === "class-report" && classReportData) {
        reportTitle = `ক্লাস রিপোর্ট: ${reportClass || "সব ক্লাস"}`;
        const totalInc = classReportData.fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0) + classReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
        const totalExp = classReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const totalDue = classReportData.fees.filter((f: any) => f.status !== 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
        
        const summaryHtml = `
          <div class="section-title">ক্লাস সারসংক্ষেপ</div>
          <table>
            <thead>
              <tr>
                <th class="summary-th">মোট আদায়</th>
                <th class="summary-th">মোট ব্যয়</th>
                <th class="summary-th">বকেয়া</th>
                <th class="summary-th">অবশিষ্ট</th>
              </tr>
            </thead>
            <tbody>
              <tr class="summary-row">
                <td style="color: #059669">৳${totalInc.toLocaleString('en-IN')}</td>
                <td style="color: #dc2626">৳${totalExp.toLocaleString('en-IN')}</td>
                <td style="color: #f97316">৳${totalDue.toLocaleString('en-IN')}</td>
                <td style="color: #2563eb">৳${(totalInc - totalExp).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        `;

        const incomeHtml = `
          <div class="section-title">আদায়কৃত ফিস ও আয়</div>
          <table>
            <thead>
              <tr>
                <th class="income-th">তারিখ</th>
                <th class="income-th">ছাত্রের নাম ও বিবরণ</th>
                <th class="income-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${classReportData.fees.filter((f: any) => f.status === 'paid').map((f: any) => `
                <tr>
                  <td>${f.paid_date ? new Date(f.paid_date).toLocaleDateString('bn-BD') : '-'}</td>
                  <td>${f.student_name} - ${f.category}</td>
                  <td class="amount">৳${f.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${classReportData.income.map((i: any) => `
                <tr>
                  <td>${new Date(i.date).toLocaleDateString('bn-BD')}</td>
                  <td>${i.purpose || i.description || i.category}</td>
                  <td class="amount">৳${i.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${classReportData.fees.filter((f: any) => f.status === 'paid').length === 0 && classReportData.income.length === 0 ? '<tr><td colspan="3">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        const expenseHtml = `
          <div class="section-title">ব্যয়ের তালিকা</div>
          <table>
            <thead>
              <tr>
                <th class="expense-th">তারিখ</th>
                <th class="expense-th">বিবরণ</th>
                <th class="expense-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${classReportData.expenses.map((e: any) => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                  <td>${e.category || ''} ${e.purpose ? `(${e.purpose})` : ''}</td>
                  <td class="amount">৳${e.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${classReportData.expenses.length === 0 ? '<tr><td colspan="3">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        const dueHtml = `
          <div class="section-title">বকেয়া ফিস তালিকা</div>
          <table>
            <thead>
              <tr>
                <th class="due-th">মাস</th>
                <th class="due-th">ছাত্রের নাম ও ক্যাটাগরি</th>
                <th class="due-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${classReportData.fees.filter((f: any) => f.status !== 'paid').map((f: any) => `
                <tr>
                  <td>${f.month || '-'}</td>
                  <td>${f.student_name} - ${f.category}</td>
                  <td class="amount" style="color: #ea580c">৳${f.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
              ${classReportData.fees.filter((f: any) => f.status !== 'paid').length === 0 ? '<tr><td colspan="3">কোনো বকেয়া নেই</td></tr>' : ''}
            </tbody>
          </table>
        `;

        if (filterType === 'all') {
          contentHtml = summaryHtml + incomeHtml + expenseHtml + dueHtml;
        } else if (filterType === 'income') {
          contentHtml = summaryHtml + incomeHtml;
        } else {
          contentHtml = summaryHtml + expenseHtml;
        }
      } else {
        // Fallback for other views or general print
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (reportClass) params.append("class_name", reportClass);
        
        const [incomeRes, expenseRes] = await Promise.all([
          fetch(`/api/admin/accounting/income?${params}&limit=10000`),
          fetch(`/api/admin/accounting/expenses?${params}&limit=10000`)
        ]);
        
        const incomeData = await incomeRes.json();
        const expenseData = await expenseRes.json();
        const allIncome = incomeData.data || [];
        const allExpenses = expenseData.data || [];

        const incomeHtml = `
          <div class="section-title">আয়ের তালিকা</div>
          <table>
            <thead>
              <tr>
                <th class="income-th">তারিখ</th>
                <th class="income-th">বিবরণ</th>
                <th class="income-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${allIncome.map((i: any) => `
                <tr>
                  <td>${new Date(i.paid_date || i.date).toLocaleDateString('bn-BD')}</td>
                  <td>${i.student_name || i.category || ''} ${i.purpose ? `(${i.purpose})` : ''}</td>
                  <td class="amount">৳${i.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        const expenseHtml = `
          <div class="section-title">ব্যয়ের তালিকা</div>
          <table>
            <thead>
              <tr>
                <th class="expense-th">তারিখ</th>
                <th class="expense-th">বিবরণ</th>
                <th class="expense-th">পরিমাণ</th>
              </tr>
            </thead>
            <tbody>
              ${allExpenses.map((e: any) => `
                <tr>
                  <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                  <td>${e.category || ''} ${e.purpose ? `(${e.purpose})` : ''}</td>
                  <td class="amount">৳${e.amount.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;

        if (filterType === 'all') {
          contentHtml = incomeHtml + expenseHtml;
        } else if (filterType === 'income') {
          contentHtml = incomeHtml;
        } else {
          contentHtml = expenseHtml;
        }
      }

      const html = generateBeautifulReportHTML(reportTitle, contentHtml, dateRange, classInfo);

      if (action === 'print') {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 800);
      } else {
        // Download logic: Render HTML to a hidden iframe and capture it
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '200vw';
        iframe.style.top = '0';
        iframe.style.width = '800px';
        iframe.style.height = '1200px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) throw new Error("Could not access iframe document");

        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for images and fonts
        await new Promise(resolve => setTimeout(resolve, 1500));

        const canvas = await html2canvas(iframeDoc.body, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        
        const dataUrl = canvas.toDataURL('image/png');

        document.body.removeChild(iframe);

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('bn-BD')}.pdf`);
        addToast("পিডিএফ সফলভাবে ডাউনলোড হয়েছে।", "success");
      }
    } catch (error) {
      console.error("Report action failed", error);
      addToast("রিপোর্ট জেনারেট করতে সমস্যা হয়েছে।", "error");
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-wrap items-end gap-6 print:hidden mb-8">
        <div className="flex items-center gap-3 mb-auto pt-2">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-slate-900 text-xl block">ফিল্টার</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">রিপোর্ট ফিল্টার করুন</span>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap flex-1">
          <div className="flex flex-col min-w-[160px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">শ্রেণী নির্বাচন</label>
            <select 
              value={reportClass}
              onChange={(e) => setReportClass(e.target.value)}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all hover:bg-white hover:border-slate-200"
            >
              <option value="">সকল ক্লাস</option>
              {classesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-32">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">বছর নির্বাচন</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all hover:bg-white hover:border-slate-200"
            >
              <option value="">বছর</option>
              {Array.from({ length: 3000 - 2025 + 1 }, (_, i) => 2025 + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col min-w-[180px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">মাস নির্বাচন</label>
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all hover:bg-white hover:border-slate-200"
            >
              <option value="">সকল মাস</option>
              {selectedYear && [
                "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
              ].map(m => {
                const monthVal = `${selectedYear}-${m}`;
                const monthName = new Date(parseInt(selectedYear), parseInt(m) - 1).toLocaleDateString('bn-BD', { month: 'long' });
                return <option key={monthVal} value={monthVal}>{monthName}</option>;
              })}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">শুরু</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all hover:bg-white hover:border-slate-200"
              />
            </div>
            <div className="pt-8">
              <ArrowRightLeft className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">শেষ</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (!startDate || e.target.value < startDate) setStartDate(e.target.value);
                }}
                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-slate-900/5 transition-all hover:bg-white hover:border-slate-200"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={() => { 
            setStartDate(""); 
            setEndDate(""); 
            setSelectedMonth(""); 
            setSelectedYear("");
            setReportClass(""); 
          }}
          className="flex items-center gap-2 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all active:scale-95"
        >
          <History className="w-4 h-4" /> রিসেট
        </button>
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
        <button 
          onClick={() => setActiveView("category-report")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "category-report" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          ক্যাটাগরি রিপোর্ট
        </button>
        <button 
          onClick={() => setActiveView("class-report")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "class-report" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          ক্লাস রিপোর্ট
        </button>
        <button 
          onClick={() => setActiveView("monthly-report")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "monthly-report" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          মাসিক রিপোর্ট
        </button>
        <button 
          onClick={() => setActiveView("yearly-report")}
          className={cn("pb-4 px-2 font-black text-sm transition-all border-b-2", activeView === "yearly-report" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400")}
        >
          বাৎসরিক রিপোর্ট
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8">
        {activeView === "summary" && (
          <div className="space-y-8" id="summary-report-content">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <PieChart className="text-blue-600" /> সংক্ষিপ্ত আয় ব্যয় রিপোর্ট
              </h3>
              <PrintDownloadMenu targetId="summary-report-content" filename="summary-report" onPrint={(type) => handleReportAction('print', type)} onDownload={(type) => handleReportAction('download', type)} />
            </div>
            
            {/* Hidden Header for Print */}
            <div className="hidden print:block mb-8 text-center border-b-2 border-slate-900 pb-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                <img src="/logo.png" alt="School Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
                <div className="text-left">
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">আল-হেরা ক্যাডেট মাদ্রাসা</h1>
                  <p className="text-sm font-bold text-slate-600">সাভার, ঢাকা</p>
                  <p className="text-xs font-bold text-slate-500">স্থাপিত: ২০০৫ | ইআইআইএন: ১২৩৪৫৬</p>
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 border-y border-slate-900 py-2 inline-block px-8">সংক্ষিপ্ত আয়-ব্যয় রিপোর্ট</h2>
              <div className="mt-4 flex justify-between text-sm font-bold px-4">
                <span>তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
                {reportClass && <span>শ্রেণী: {reportClass}</span>}
                {(reportMonth || (startDate && endDate)) && (
                  <span>সময়কাল: {reportMonth ? new Date(reportMonth).toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' }) : `${new Date(startDate).toLocaleDateString('bn-BD')} - ${new Date(endDate).toLocaleDateString('bn-BD')}`}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" /> সাম্প্রতিক আয়
                </h3>
                <button onClick={() => setActiveView("income")} className="text-xs font-bold text-blue-600 hover:underline">সব দেখুন</button>
              </div>
              <div className="space-y-4">
                {income?.slice(0, 5).map(i => (
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
                {expenses?.slice(0, 5).map(e => (
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
        </div>
      )}

        {activeView === "income" && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" id="income-report">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" /> বিস্তারিত আয়
              </h3>
              <PrintDownloadMenu targetId="income-report" filename="income-report" onPrint={(type) => handleReportAction('print', type)} onDownload={(type) => handleReportAction('download', type)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">তারিখ</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">উৎস/ছাত্র</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">ক্যাটাগরি</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">বাবদ/উদ্দেশ্য</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider text-right">পরিমাণ</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {income.map(i => (
                    <tr key={`income-list-${i.id}`} className="group hover:bg-slate-50 transition-all">
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
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => setSelectedTransaction(i)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> রিসিট
                        </button>
                      </td>
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
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" id="expense-report">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <TrendingDown className="text-rose-600" /> বিস্তারিত ব্যয়
              </h3>
              <PrintDownloadMenu targetId="expense-report" filename="expense-report" onPrint={(type) => handleReportAction('print', type)} onDownload={(type) => handleReportAction('download', type)} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">তারিখ</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">ক্যাটাগরি</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider">বাবদ/উদ্দেশ্য</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider text-right">পরিমাণ</th>
                    <th className="pb-4 font-black text-slate-400 text-xs uppercase tracking-wider text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expenses.map(e => (
                    <tr key={`expense-list-${e.id}`} className="group hover:bg-slate-50 transition-all">
                      <td className="py-4 text-sm font-bold text-slate-500">{new Date(e.date).toLocaleDateString('bn-BD')}</td>
                      <td className="py-4 font-black text-slate-900">{e.category}</td>
                      <td className="py-4 text-sm text-slate-500">{e.purpose || e.description || "-"}</td>
                      <td className="py-4 text-right font-black text-rose-600">৳{e.amount}</td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => setSelectedTransaction(e)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> রিসিট
                        </button>
                      </td>
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

        {activeView === "category-report" && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" id="category-report">
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
              <div className="flex flex-col md:flex-row gap-4">
                <select 
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                  className="p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">সব ক্যাটাগরি</option>
                  <optgroup label="আয়">
                    {incomeCategories.map(c => <option key={`inc-${c.id}`} value={c.name}>{c.name}</option>)}
                  </optgroup>
                  <optgroup label="ব্যয়">
                    {expenseCategories.map(c => <option key={`exp-${c.id}`} value={c.name}>{c.name}</option>)}
                  </optgroup>
                </select>
                <input 
                  type="month" 
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <PrintDownloadMenu targetId="category-report" filename="category-report" onPrint={(type) => handleReportAction('print', type)} onDownload={(type) => handleReportAction('download', type)} />
            </div>
            
            {loadingReport ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
            ) : categoryReportData ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-emerald-700 mb-2 relative z-10">মোট আয়</p>
                    <p className="text-3xl font-black text-emerald-950 relative z-10">৳{categoryReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-rose-700 mb-2 relative z-10">মোট ব্যয়</p>
                    <p className="text-3xl font-black text-rose-950 relative z-10">৳{categoryReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-blue-700 mb-2 relative z-10">অবশিষ্ট</p>
                    <p className="text-3xl font-black text-blue-950 relative z-10">৳{(categoryReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0) - categoryReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> আয়সমূহ</h4>
                    <div className="space-y-2">
                      {categoryReportData.income.map((i: any) => (
                        <div key={i.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">{i.purpose || i.description || i.category}</p>
                            <p className="text-xs text-slate-500">{new Date(i.date).toLocaleDateString('bn-BD')}</p>
                          </div>
                          <p className="font-black text-emerald-600">৳{i.amount}</p>
                        </div>
                      ))}
                      {categoryReportData.income.length === 0 && <p className="text-slate-400 text-sm">কোনো আয় নেই</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-rose-600" /> ব্যয়সমূহ</h4>
                    <div className="space-y-2">
                      {categoryReportData.expenses.map((e: any) => (
                        <div key={e.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">{e.purpose || e.description || e.category}</p>
                            <p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString('bn-BD')}</p>
                          </div>
                          <p className="font-black text-rose-600">৳{e.amount}</p>
                        </div>
                      ))}
                      {categoryReportData.expenses.length === 0 && <p className="text-slate-400 text-sm">কোনো ব্যয় নেই</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeView === "class-report" && (
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden" id="class-report">
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
              <div className="flex flex-col md:flex-row gap-4">
                <select 
                  value={reportClass}
                  onChange={(e) => setReportClass(e.target.value)}
                  className="p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">ক্লাস নির্বাচন করুন</option>
                  {classesList?.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <PrintDownloadMenu targetId="class-report" filename="class-report" onPrint={(type) => handleReportAction('print', type)} onDownload={(type) => handleReportAction('download', type)} />
            </div>
            
            {loadingReport ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
            ) : classReportData ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-emerald-700 mb-2 relative z-10">মোট উঠেছে (আয়)</p>
                    <p className="text-3xl font-black text-emerald-950 relative z-10">
                      ৳{(classReportData.fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0) + classReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-2xl border border-rose-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-rose-700 mb-2 relative z-10">মোট গিয়েছে (ব্যয়)</p>
                    <p className="text-3xl font-black text-rose-950 relative z-10">
                      ৳{classReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-orange-700 mb-2 relative z-10">ওঠেনি (বকেয়া)</p>
                    <p className="text-3xl font-black text-orange-950 relative z-10">
                      ৳{classReportData.fees.filter((f: any) => f.status !== 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100/50 rounded-full blur-xl"></div>
                    <p className="text-sm font-bold text-blue-700 mb-2 relative z-10">অবশিষ্ট</p>
                    <p className="text-3xl font-black text-blue-950 relative z-10">
                      ৳{((classReportData.fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0) + classReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)) - classReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> আদায়কৃত ফিস ও আয়</h4>
                    <div className="space-y-2">
                      {classReportData.fees.filter((f: any) => f.status === 'paid').map((f: any) => (
                        <div key={`fee-${f.id}`} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">{f.student_name} - {f.category}</p>
                            <p className="text-xs text-slate-500">{f.paid_date ? new Date(f.paid_date).toLocaleDateString('bn-BD') : '-'}</p>
                          </div>
                          <p className="font-black text-emerald-600">৳{f.amount}</p>
                        </div>
                      ))}
                      {classReportData.income.map((i: any) => (
                        <div key={`inc-${i.id}`} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">{i.purpose || i.description || i.category}</p>
                            <p className="text-xs text-slate-500">{new Date(i.date).toLocaleDateString('bn-BD')}</p>
                          </div>
                          <p className="font-black text-emerald-600">৳{i.amount}</p>
                        </div>
                      ))}
                      {classReportData.fees.filter((f: any) => f.status === 'paid').length === 0 && classReportData.income.length === 0 && <p className="text-slate-400 text-sm">কোনো আয় নেই</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-rose-600" /> ব্যয়সমূহ</h4>
                    <div className="space-y-2">
                      {classReportData.expenses.map((e: any) => (
                        <div key={`exp-${e.id}`} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">{e.purpose || e.description || e.category}</p>
                            <p className="text-xs text-slate-500">{new Date(e.date).toLocaleDateString('bn-BD')}</p>
                          </div>
                          <p className="font-black text-rose-600">৳{e.amount}</p>
                        </div>
                      ))}
                      {classReportData.expenses.length === 0 && <p className="text-slate-400 text-sm">কোনো ব্যয় নেই</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-orange-600" /> বকেয়া ফিস</h4>
                    <div className="space-y-2">
                      {classReportData.fees.filter((f: any) => f.status !== 'paid').map((f: any) => (
                        <div key={`unpaid-${f.id}`} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-900">{f.student_name} - {f.category}</p>
                            <p className="text-xs text-slate-500">{f.month}</p>
                          </div>
                          <p className="font-black text-orange-600">৳{f.amount}</p>
                        </div>
                      ))}
                      {classReportData.fees.filter((f: any) => f.status !== 'paid').length === 0 && <p className="text-slate-400 text-sm">কোনো বকেয়া নেই</p>}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeView === "monthly-report" && (
          <MonthlyYearlyReport
            data={monthlyReportData}
            type="monthly"
            loading={loadingReport}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            settings={settings}
          />
        )}

        {activeView === "yearly-report" && (
          <MonthlyYearlyReport
            data={yearlyReportData}
            type="yearly"
            loading={loadingReport}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            settings={settings}
          />
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">ক্যাটাগরি</label>
                    <select name="category" required className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900">
                      <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                      {(isAddingIncome ? incomeCategories : expenseCategories).map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">ক্লাস (ঐচ্ছিক)</label>
                    <select name="class_name" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900">
                      <option value="">ক্লাস নির্বাচন করুন</option>
                      {classesList?.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
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
                    <input name="date" type="date" defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold" />
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 print:hidden">
                <h3 className="text-xl font-black text-slate-900">মানি রিসিট</h3>
                <button onClick={() => setSelectedTransaction(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div id="transaction-detail" className="space-y-8 bg-white relative">
                  {/* Receipt Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6">
                    <div className="flex items-center gap-4">
                      {settings?.logo_url && (
                        <img src={settings.logo_url} className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                      )}
                      <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{settings?.title || "আল হেরা মাদরাসা"}</h2>
                        <p className="text-xs font-bold text-slate-500">{settings?.address || "ঠিকানা এখানে লিখুন"}</p>
                        <p className="text-[10px] font-bold text-slate-400">ফোন: {settings?.contact_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest mb-2">
                          মানি রিসিট
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">রিসিট নং: #{selectedTransaction.id.toString().padStart(6, '0')}</p>
                      </div>
                      {settings?.qr_code_url && (
                        <img src={settings.qr_code_url} className="w-16 h-16 object-contain" alt="QR Code" referrerPolicy="no-referrer" />
                      )}
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
                        <p className="text-[10px] font-black text-slate-500 uppercase">মুহতামিমের স্বাক্ষর</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-8 border-t border-slate-50">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Powered by Madrasa Management System</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-4 gap-2 sticky bottom-0 z-20 print:hidden">
                <button onClick={() => printElement('transaction-detail', 'A5')} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                  <Printer className="w-5 h-5 text-slate-600" />
                  <span className="text-[10px] font-bold">প্রিন্ট</span>
                </button>
                <button 
                  onClick={async () => {
                    const text = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nক্যাটাগরি: ${selectedTransaction.category}\nবিবরণ: ${selectedTransaction.purpose || selectedTransaction.description || "-"}`;
                    const cleanPhone = selectedTransaction.student_phone ? selectedTransaction.student_phone.replace(/[^0-9]/g, '') : '';
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
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </button>
                <button 
                  onClick={() => {
                    let targetEmail = selectedTransaction.student_email || "";
                    if (!targetEmail) {
                      targetEmail = window.prompt("দয়া করে প্রাপকের ইমেইল এড্রেসটি দিন:", "");
                      if (!targetEmail) return;
                    }
                    const subject = `মানি রিসিট - ${settings?.title || "আল হেরা মাদরাসা"}`;
                    const body = `আসসালামু আলাইকুম।\nআপনার পেমেন্ট সফল হয়েছে।\n\nলেনদেনের বিবরণ:\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nক্যাটাগরি: ${selectedTransaction.category}\nবিবরণ: ${selectedTransaction.purpose || selectedTransaction.description || "-"}`;
                    window.open(`mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
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
                <button onClick={() => setSelectedTransaction(null)} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                  <CloseIcon className="w-5 h-5 text-rose-600" />
                  <span className="text-[10px] font-bold">বন্ধ করুন</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Transaction Modal */}
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

        {/* Profile Modal */}
        {selectedStudentProfile && selectedStudentProfile.student && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
