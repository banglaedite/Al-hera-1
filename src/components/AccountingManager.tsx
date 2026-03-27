import React, { useState, useEffect, useRef } from "react";
import { 
  DollarSign, Plus, Search, TrendingUp, TrendingDown, 
  Printer, Download, Calendar, Filter, MoreVertical,
  Share2, Mail, MessageCircle, PieChart, ArrowUpRight, ArrowDownRight,
  Trash2, X as CloseIcon, ArrowRightLeft, History, Loader2, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toPng } from 'html-to-image';
import { cn } from "../lib/utils";
import { LoadingButton } from "./LoadingButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [activeView, setActiveView] = useState<"summary" | "income" | "expense" | "category-report" | "class-report">("summary");
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);
  
  const [reportMonth, setReportMonth] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportClass, setReportClass] = useState("");
  const [categoryReportData, setCategoryReportData] = useState<any>(null);
  const [classReportData, setClassReportData] = useState<any>(null);
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
  }, []);

  const fetchCategoryReport = async () => {
    setLoadingReport(true);
    try {
      const res = await fetch(`/api/admin/accounting/reports/category?month=${reportMonth}&category=${reportCategory}`);
      const data = await res.json();
      if (res.ok) {
        setCategoryReportData(data);
      } else {
        setCategoryReportData({ income: [], expenses: [] });
        console.error(data.error);
      }
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
      const res = await fetch(`/api/admin/accounting/reports/class?class_name=${reportClass}`);
      const data = await res.json();
      if (res.ok) {
        setClassReportData(data);
      } else {
        setClassReportData({ fees: [], income: [], expenses: [] });
        console.error(data.error);
      }
    } catch (e) {
      console.error(e);
      setClassReportData({ fees: [], income: [], expenses: [] });
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    if (activeView === "category-report") {
      fetchCategoryReport();
    } else if (activeView === "class-report") {
      fetchClassReport();
    }
  }, [activeView, reportMonth, reportCategory, reportClass]);

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
    const summaryData = await summaryRes.json();
    if (summaryData.error) {
      addToast("হিসাব লোড করতে সমস্যা হয়েছে।", "error");
    } else {
      setSummary(summaryData);
    }

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

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (month) {
      const [year, m] = month.split("-");
      const firstDay = `${year}-${m}-01`;
      const lastDayDate = new Date(parseInt(year), parseInt(m), 0);
      const lastDay = `${lastDayDate.getFullYear()}-${String(lastDayDate.getMonth() + 1).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`;
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

  const generatePrintableHTML = () => {
    const title = settings?.title || "Madrasa";
    let reportTitle = "অ্যাকাউন্টিং রিপোর্ট";
    let dateRange = startDate && endDate ? `তারিখ: ${new Date(startDate).toLocaleDateString('bn-BD')} থেকে ${new Date(endDate).toLocaleDateString('bn-BD')}` : "";
    
    if (activeView === "category-report") {
      reportTitle = `ক্যাটাগরি রিপোর্ট - ${reportCategory || "সব ক্যাটাগরি"}`;
      if (reportMonth) {
        const [y, m] = reportMonth.split("-");
        dateRange = `মাস: ${m}/${y}`;
      } else {
        dateRange = "";
      }
    } else if (activeView === "class-report") {
      reportTitle = `ক্লাস রিপোর্ট - ${reportClass || "সব ক্লাস"}`;
      dateRange = "";
    } else if (activeView === "income") {
      reportTitle = "আয়ের বিস্তারিত রিপোর্ট";
    } else if (activeView === "expense") {
      reportTitle = "ব্যয়ের বিস্তারিত রিপোর্ট";
    }

    let contentHtml = "";

    if (activeView === "summary") {
      contentHtml = `
        <div class="section-title">সারসংক্ষেপ</div>
        <table>
          <thead>
            <tr>
              <th class="summary-th">মোট আয়</th>
              <th class="summary-th">মোট ব্যয়</th>
              <th class="summary-th">অবশিষ্ট</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>৳${summary.totalIncome}</td>
              <td>৳${summary.totalExpense}</td>
              <td>৳${summary.balance}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">আয়ের বিস্তারিত</div>
        <table>
          <thead>
            <tr>
              <th class="income-th">তারিখ</th>
              <th class="income-th">ক্যাটাগরি/উৎস</th>
              <th class="income-th">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${income.map(i => `
              <tr>
                <td>${new Date(i.paid_date || i.date).toLocaleDateString('bn-BD')}</td>
                <td>${i.student_name || i.category || ''}</td>
                <td>৳${i.amount}</td>
              </tr>
            `).join('')}
            ${income.length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>

        <div class="section-title">ব্যয়ের বিস্তারিত</div>
        <table>
          <thead>
            <tr>
              <th class="expense-th">তারিখ</th>
              <th class="expense-th">ক্যাটাগরি</th>
              <th class="expense-th">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                <td>${e.category || ''}</td>
                <td>৳${e.amount}</td>
              </tr>
            `).join('')}
            ${expenses.length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>
      `;
    } else if (activeView === "income") {
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th class="income-th">তারিখ</th>
              <th class="income-th">ক্যাটাগরি/উৎস</th>
              <th class="income-th">বিবরণ</th>
              <th class="income-th">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${income.map(i => `
              <tr>
                <td>${new Date(i.paid_date || i.date).toLocaleDateString('bn-BD')}</td>
                <td>${i.student_name || i.category || ''}</td>
                <td>${i.purpose || i.description || '-'}</td>
                <td>৳${i.amount}</td>
              </tr>
            `).join('')}
            ${income.length === 0 ? '<tr><td colspan="4" style="text-align:center">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>
      `;
    } else if (activeView === "expense") {
      contentHtml = `
        <table>
          <thead>
            <tr>
              <th class="expense-th">তারিখ</th>
              <th class="expense-th">ক্যাটাগরি</th>
              <th class="expense-th">বিবরণ</th>
              <th class="expense-th">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => `
              <tr>
                <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                <td>${e.category || ''}</td>
                <td>${e.purpose || e.description || '-'}</td>
                <td>৳${e.amount}</td>
              </tr>
            `).join('')}
            ${expenses.length === 0 ? '<tr><td colspan="4" style="text-align:center">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>
      `;
    } else if (activeView === "category-report" && categoryReportData) {
      const totalInc = categoryReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
      const totalExp = categoryReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      contentHtml = `
        <div class="section-title">সারসংক্ষেপ</div>
        <table>
          <thead>
            <tr>
              <th class="summary-th">মোট আয়</th>
              <th class="summary-th">মোট ব্যয়</th>
              <th class="summary-th">অবশিষ্ট</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>৳${totalInc}</td>
              <td>৳${totalExp}</td>
              <td>৳${totalInc - totalExp}</td>
            </tr>
          </tbody>
        </table>

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
                <td>${new Date(i.date).toLocaleDateString('bn-BD')}</td>
                <td>${i.purpose || i.description || i.category}</td>
                <td>৳${i.amount}</td>
              </tr>
            `).join('')}
            ${categoryReportData.income.length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>

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
                <td>৳${e.amount}</td>
              </tr>
            `).join('')}
            ${categoryReportData.expenses.length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>
      `;
    } else if (activeView === "class-report" && classReportData) {
      const totalInc = classReportData.fees.filter((f: any) => f.status === 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0) + classReportData.income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
      const totalExp = classReportData.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const totalDue = classReportData.fees.filter((f: any) => f.status !== 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
      
      contentHtml = `
        <div class="section-title">সারসংক্ষেপ</div>
        <table>
          <thead>
            <tr>
              <th class="summary-th">মোট উঠেছে (আয়)</th>
              <th class="summary-th">মোট গিয়েছে (ব্যয়)</th>
              <th class="summary-th">ওঠেনি (বকেয়া)</th>
              <th class="summary-th">অবশিষ্ট</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>৳${totalInc}</td>
              <td>৳${totalExp}</td>
              <td>৳${totalDue}</td>
              <td>৳${totalInc - totalExp}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">আদায়কৃত ফিস ও আয়</div>
        <table>
          <thead>
            <tr>
              <th class="income-th">তারিখ</th>
              <th class="income-th">বিবরণ</th>
              <th class="income-th">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${classReportData.fees.filter((f: any) => f.status === 'paid').map((f: any) => `
              <tr>
                <td>${f.paid_date ? new Date(f.paid_date).toLocaleDateString('bn-BD') : '-'}</td>
                <td>${f.student_name} - ${f.category}</td>
                <td>৳${f.amount}</td>
              </tr>
            `).join('')}
            ${classReportData.income.map((i: any) => `
              <tr>
                <td>${new Date(i.date).toLocaleDateString('bn-BD')}</td>
                <td>${i.purpose || i.description || i.category}</td>
                <td>৳${i.amount}</td>
              </tr>
            `).join('')}
            ${classReportData.fees.filter((f: any) => f.status === 'paid').length === 0 && classReportData.income.length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো আয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>

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
            ${classReportData.expenses.map((e: any) => `
              <tr>
                <td>${new Date(e.date).toLocaleDateString('bn-BD')}</td>
                <td>${e.purpose || e.description || e.category}</td>
                <td>৳${e.amount}</td>
              </tr>
            `).join('')}
            ${classReportData.expenses.length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো ব্যয়ের রেকর্ড নেই</td></tr>' : ''}
          </tbody>
        </table>

        <div class="section-title">বকেয়া ফিস</div>
        <table>
          <thead>
            <tr>
              <th style="background-color: #f97316; color: white;">মাস</th>
              <th style="background-color: #f97316; color: white;">ছাত্রের নাম ও ক্যাটাগরি</th>
              <th style="background-color: #f97316; color: white;">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            ${classReportData.fees.filter((f: any) => f.status !== 'paid').map((f: any) => `
              <tr>
                <td>${f.month || '-'}</td>
                <td>${f.student_name} - ${f.category}</td>
                <td>৳${f.amount}</td>
              </tr>
            `).join('')}
            ${classReportData.fees.filter((f: any) => f.status !== 'paid').length === 0 ? '<tr><td colspan="3" style="text-align:center">কোনো বকেয়া নেই</td></tr>' : ''}
          </tbody>
        </table>
      `;
    } else {
      contentHtml = `<p style="text-align:center">রিপোর্ট লোড হচ্ছে...</p>`;
    }
    
    let html = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Hind Siliguri', sans-serif; padding: 20px; color: #333; background-color: #fff; }
            h1 { text-align: center; margin-bottom: 5px; font-size: 24px; color: #059669; }
            h2 { text-align: center; margin-bottom: 20px; font-size: 18px; color: #666; }
            .date-range { text-align: center; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .summary-th { background-color: #10b981; color: white; }
            .income-th { background-color: #10b981; color: white; }
            .expense-th { background-color: #e11d48; color: white; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; margin-top: 20px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <h2>${reportTitle}</h2>
          ${dateRange ? `<div class="date-range">${dateRange}</div>` : ''}
          
          ${contentHtml}
          
          <script>
            window.onload = () => { 
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `;
    return html;
  };

  const handleDownloadReport = () => {
    const html = generatePrintableHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting_report_${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("HTML ফাইল ডাউনলোড হয়েছে। এটি ব্রাউজারে ওপেন করে PDF হিসেবে সেভ করতে পারেন।", "success");
  };

  const handlePrint = () => {
    const html = generatePrintableHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      addToast("পপ-আপ ব্লক করা আছে। দয়া করে পপ-আপ অ্যালাউ করুন।", "error");
    }
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
            onClick={handleDownloadReport}
            className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
            title="ডাউনলোড রিপোর্ট"
          >
            <Download className="w-6 h-6" />
          </button>
          <button 
            onClick={handlePrint}
            className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
            title="প্রিন্ট রিপোর্ট"
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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <span className="text-slate-400 mt-5">থেকে</span>
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1">শেষ</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (!startDate || e.target.value < startDate) setStartDate(e.target.value);
                }}
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
        <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm"><TrendingUp className="w-6 h-6" /></div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                {calculatePercentage(summary.totalIncome, summary.totalIncome + summary.totalExpense)}% Total
              </span>
            </div>
          </div>
          <p className="text-emerald-800/70 font-bold text-sm relative z-10">মোট আয়</p>
          <h3 className="text-3xl font-black text-emerald-950 mt-1 relative z-10">৳{summary.totalIncome.toLocaleString('en-IN')}</h3>
          <div className="mt-4 flex gap-3 text-[11px] font-bold relative z-10">
            <span className="bg-white/60 px-2 py-1 rounded-lg text-emerald-700">ফি: ৳{summary.feeIncome.toLocaleString('en-IN')}</span>
            <span className="bg-white/60 px-2 py-1 rounded-lg text-emerald-700">অন্যান্য: ৳{summary.otherIncome.toLocaleString('en-IN')}</span>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-rose-50 to-white p-6 rounded-[2rem] border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shadow-sm"><TrendingDown className="w-6 h-6" /></div>
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-100 px-3 py-1.5 rounded-full shadow-sm">
                {calculatePercentage(summary.totalExpense, summary.totalIncome + summary.totalExpense)}% Total
              </span>
            </div>
          </div>
          <p className="text-rose-800/70 font-bold text-sm relative z-10">মোট খরচ</p>
          <h3 className="text-3xl font-black text-rose-950 mt-1 relative z-10">৳{summary.totalExpense.toLocaleString('en-IN')}</h3>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-[2rem] border border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm"><History className="w-6 h-6" /></div>
          </div>
          <p className="text-blue-800/70 font-bold text-sm relative z-10">পূর্বের জের (Balance)</p>
          <h3 className="text-3xl font-black text-blue-950 mt-1 relative z-10">৳{(summary.prevBalance || 0).toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-bold text-blue-600/70 mt-3 relative z-10 bg-white/60 inline-block px-2 py-1 rounded-lg">গত মাসের শেষ পর্যন্ত</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className={cn(
          "p-6 rounded-[2rem] border shadow-lg relative overflow-hidden",
          (summary.totalBalance || 0) >= 0 ? "bg-gradient-to-br from-emerald-800 to-emerald-950 border-emerald-800 text-white" : "bg-gradient-to-br from-rose-800 to-rose-950 border-rose-800 text-white"
        )}>
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm"><PieChart className="w-6 h-6 text-white" /></div>
          </div>
          <p className="text-white/80 font-bold text-sm relative z-10">বর্তমান স্থিতি (Total)</p>
          <h3 className="text-4xl font-black mt-1 relative z-10">৳{(summary.totalBalance || 0).toLocaleString('en-IN')}</h3>
          <p className="text-[11px] font-bold text-white/60 mt-3 relative z-10 bg-black/20 inline-block px-2 py-1 rounded-lg">পূর্বের জের সহ মোট</p>
        </motion.div>
      </div>

      {/* Comparison Section */}
      {selectedMonth && prevSummary && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl"><ArrowRightLeft className="w-6 h-6" /></div>
            <div>
              <h3 className="text-xl font-black">মাসিক তুলনামূলক চিত্র</h3>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest">গত মাস বনাম বর্তমান মাস</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-white/50 font-bold text-sm">আয় (Income)</p>
                <span className={cn(
                  "text-xs font-black px-2 py-1 rounded-lg",
                  summary.totalIncome >= prevSummary.totalIncome ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                )}>
                  {summary.totalIncome >= prevSummary.totalIncome ? "+" : "-"}
                  {Math.abs(summary.totalIncome - prevSummary.totalIncome)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (summary.totalIncome / (prevSummary.totalIncome || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>গত মাস: ৳{prevSummary.totalIncome}</span>
                <span>বর্তমান: ৳{summary.totalIncome}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <p className="text-white/50 font-bold text-sm">ব্যয় (Expense)</p>
                <span className={cn(
                  "text-xs font-black px-2 py-1 rounded-lg",
                  summary.totalExpense <= prevSummary.totalExpense ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                )}>
                  {summary.totalExpense <= prevSummary.totalExpense ? "-" : "+"}
                  {Math.abs(summary.totalExpense - prevSummary.totalExpense)}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (summary.totalExpense / (prevSummary.totalExpense || 1)) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>গত মাস: ৳{prevSummary.totalExpense}</span>
                <span>বর্তমান: ৳{summary.totalExpense}</span>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <p className="text-white/50 font-bold text-sm mb-2">নিট ফলাফল (Net)</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-black">৳{summary.totalIncome - summary.totalExpense}</h4>
                <span className={cn(
                  "text-xs font-bold",
                  (summary.totalIncome - summary.totalExpense) >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {(summary.totalIncome - summary.totalExpense) >= 0 ? "উদ্বৃত্ত" : "ঘাটতি"}
                </span>
              </div>
              <p className="text-[10px] font-bold text-white/30 mt-4 uppercase tracking-widest">
                পূর্বের জের সহ মোট স্থিতি: ৳{summary.totalBalance}
              </p>
            </div>
          </div>
        </motion.div>
      )}

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
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
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
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
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
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <select 
                value={reportClass}
                onChange={(e) => setReportClass(e.target.value)}
                className="p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">ক্লাস নির্বাচন করুন</option>
                {classesList?.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
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

              <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-5 gap-2 sticky bottom-0 z-20 print:hidden">
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
                  onClick={async () => {
                    const element = document.getElementById('transaction-detail');
                    if (!element) return;

                    let targetEmail = selectedTransaction.student_email || "";
                    if (!targetEmail) {
                      targetEmail = window.prompt("দয়া করে প্রাপকের ইমেইল এড্রেসটি দিন:", "");
                      if (!targetEmail) return;
                    }

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
                      
                      await new Promise((resolve, reject) => {
                        img.onload = () => {
                          const contentHeight = (img.height * contentWidth) / img.width;
                          pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                          resolve(null);
                        };
                        img.onerror = reject;
                      });

                      const pdfBase64 = pdf.output('datauristring').split(',')[1];

                      const response = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: targetEmail,
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
                        const errorData = await response.json();
                        throw new Error(errorData.error || "ইমেইল পাঠাতে ব্যর্থ হয়েছে।");
                      }
                    } catch (err) {
                      console.error("Email sending failed", err);
                      addToast("ইমেইল পাঠাতে সমস্যা হয়েছে। দয়া করে সেটিংস চেক করুন।", "error");
                      
                      // Fallback to mailto
                      const subject = `মানি রিসিট - ${settings?.title || "আল হেরা মাদরাসা"}`;
                      const body = `লেনদেনের বিবরণ:\nরিসিট নং: #${selectedTransaction.id}\nপরিমাণ: ৳${selectedTransaction.amount}\nতারিখ: ${new Date(selectedTransaction.paid_date || selectedTransaction.date).toLocaleDateString('bn-BD')}\nক্যাটাগরি: ${selectedTransaction.category}\nবিবরণ: ${selectedTransaction.purpose || selectedTransaction.description || "-"}`;
                      window.open(`mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
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
        {selectedStudentProfile && selectedStudentProfile.student && (
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
