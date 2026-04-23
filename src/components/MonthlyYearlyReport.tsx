import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, ArrowLeft, Calendar, Filter, BarChart2, FileText, TrendingUp, TrendingDown, Search, ChevronRight } from 'lucide-react';
import { printElement } from '../utils/printUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';
import { CountUp } from './CountUp';

interface MonthlyYearlyReportProps {
  data: any;
  type: 'monthly' | 'yearly';
  loading: boolean;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  settings?: any;
}

export default function MonthlyYearlyReport({ data, type, loading, startDate, endDate, setStartDate, setEndDate, settings }: MonthlyYearlyReportProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [printType, setPrintType] = useState<"all" | "income" | "expense">("all");

  const handlePrint = () => {
    printElement('monthly-yearly-report', 'A4');
  };

  const groupedByCategory = useMemo(() => {
    if (!data) return { income: {}, expenses: {} };
    
    const group = (items: any[]) => {
      const filtered = selectedCategory 
        ? items.filter(item => item.category === selectedCategory)
        : items;

      return filtered.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = { total: 0, items: [], months: {} };
        acc[cat].total += item.amount || 0;
        acc[cat].items.push(item);
        
        const dateStr = item.paid_date || item.date;
        const month = dateStr ? dateStr.substring(0, 7) : 'Unknown';
        if (!acc[cat].months[month]) acc[cat].months[month] = { total: 0, items: [] };
        acc[cat].months[month].total += item.amount || 0;
        acc[cat].months[month].items.push(item);
        
        return acc;
      }, {} as Record<string, { total: number; items: any[]; months: any }>);
    };

    return {
      income: group(data.income || []),
      expenses: group(data.expenses || [])
    };
  }, [data, selectedCategory]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>;
  }

  if (!data) return null;

  const renderTransactions = (items: any[], printId: string) => (
    <div className="mt-4 border rounded-xl overflow-hidden bg-white">
      <div className="flex justify-end p-2 bg-slate-50 border-b print:hidden gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); printElement(printId, 'A4'); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold"
        >
          <Printer className="w-3 h-3" /> প্রিন্ট
        </button>
      </div>
      <div id={printId}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-3 text-sm font-semibold text-slate-600">তারিখ</th>
              <th className="p-3 text-sm font-semibold text-slate-600">বিবরণ</th>
              <th className="p-3 text-sm font-semibold text-slate-600 text-right">পরিমাণ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3 text-sm">{new Date(item.paid_date || item.date).toLocaleDateString('bn-BD')}</td>
                <td className="p-3 text-sm">{item.description || item.student_name || item.purpose || 'N/A'}</td>
                <td className="p-3 text-sm text-right font-medium">৳{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoryDetails = (category: string, catData: any, isIncome: boolean) => {
    if (type === 'monthly') {
      return (
        <div className="mt-4 pl-4 border-l-2 border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">বিস্তারিত লেনদেন</h4>
          {renderTransactions(catData.items, `print-cat-${category.replace(/\s+/g, '-')}`)}
        </div>
      );
    }

    // Yearly view -> show months
    return (
      <div className="mt-4 pl-4 border-l-2 border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-2">মাসিক বিবরণ</h4>
        <div className="space-y-4">
          {Object.entries(catData.months).map(([month, monthData]: [string, any]) => (
            <div key={month} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMonth(selectedMonth === month ? null : month);
                }}
              >
                <span className="font-medium text-slate-700">{new Date(month + '-01').toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' })}</span>
                <span className={cn("font-bold", isIncome ? "text-emerald-600" : "text-rose-600")}>
                  ৳{monthData.total}
                </span>
              </div>
              
              <AnimatePresence>
                {selectedMonth === month && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {renderTransactions(monthData.items, `print-month-${month}-${category.replace(/\s+/g, '-')}`)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCategoryList = (categories: Record<string, any>, isIncome: boolean) => {
    return Object.entries(categories).map(([category, catData]) => (
      <div key={category} className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => {
            setSelectedCategory(selectedCategory === category ? null : category);
            setSelectedMonth(null);
          }}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", isIncome ? "bg-emerald-500" : "bg-rose-500")} />
            <h3 className="font-bold text-slate-800 text-lg">{category}</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className={cn("font-bold text-xl", isIncome ? "text-emerald-600" : "text-rose-600")}>
              {isIncome ? "+" : "-"} ৳{catData.total}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {selectedCategory === category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {renderCategoryDetails(category, catData, isIncome)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ));
  };

  const totalIncome: number = Object.values(groupedByCategory.income).reduce((sum: number, cat: any) => sum + (Number(cat.total) || 0), 0) as number;
  const totalExpenses: number = Object.values(groupedByCategory.expenses).reduce((sum: number, cat: any) => sum + (Number(cat.total) || 0), 0) as number;
  const prevBalance: number = Number(data.prevBalance) || 0;
  const currentBalance: number = prevBalance + totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-3xl border border-indigo-500 shadow-xl shadow-indigo-600/20 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-2 inline-block">পূর্বের জের</span>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-4xl font-black tracking-tight" style={{ color: '#fff' }}>৳<CountUp end={prevBalance} startColor="#ffffff" endColor="#ffffff" /></span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl border border-emerald-500 shadow-xl shadow-emerald-600/20 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs font-black text-emerald-200 uppercase tracking-widest mb-2 inline-block">মোট আয়</span>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-4xl font-black tracking-tight" style={{ color: '#fff' }}>৳<CountUp end={totalIncome} startColor="#ffffff" endColor="#34d399" /></span>
              <TrendingUp className="w-6 h-6 text-emerald-300 mb-1" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-rose-600 to-rose-800 p-6 rounded-3xl border border-rose-500 shadow-xl shadow-rose-600/20 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs font-black text-rose-200 uppercase tracking-widest mb-2 inline-block">মোট ব্যয়</span>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-4xl font-black tracking-tight" style={{ color: '#fff' }}>৳<CountUp end={totalExpenses} startColor="#ffffff" endColor="#fb7185" /></span>
              <TrendingDown className="w-6 h-6 text-rose-300 mb-1" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl border border-slate-700 shadow-xl shadow-slate-900/20 relative overflow-hidden group text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 group-hover:bg-white/10 transition-all duration-500"></div>
          <div className="relative z-10 flex flex-col h-full">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 inline-block">বর্তমান স্থিতি</span>
            <div className="flex items-end gap-2 mt-auto">
              <span className="text-4xl font-black tracking-tight" style={{ color: '#fff' }}>৳<CountUp end={currentBalance} startColor="#ffffff" endColor="#10b981" /></span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8">
        <div className="flex flex-wrap items-end gap-6 flex-1">
          <div className="flex items-center gap-3 mb-auto pt-2">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg block">রিপোর্ট ফিল্টার</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ডাটা ফিল্টার করুন</span>
            </div>
          </div>
          
          {type === 'yearly' ? (
            <div className="flex flex-col w-32">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">বছর নির্বাচন</label>
              <select 
                value={startDate && endDate && startDate.startsWith(endDate.substring(0, 4)) && startDate.endsWith('-01-01') && endDate.endsWith('-12-31') ? startDate.substring(0, 4) : ''}
                onChange={(e) => {
                  const year = e.target.value;
                  if (year) {
                    setStartDate(`${year}-01-01`);
                    setEndDate(`${year}-12-31`);
                  } else {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all hover:bg-white hover:border-slate-200"
              >
                <option value="">বছর</option>
                {Array.from({ length: 3000 - 2025 + 1 }, (_, i) => 2025 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col min-w-[180px]">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">মাস নির্বাচন</label>
              <input 
                type="month" 
                value={startDate && endDate && startDate.substring(0, 7) === endDate.substring(0, 7) ? startDate.substring(0, 7) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const [year, month] = val.split('-');
                    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                    setStartDate(`${val}-01`);
                    setEndDate(`${val}-${lastDay}`);
                  } else {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all hover:bg-white hover:border-slate-200"
              />
            </div>
          )}

          <div className="flex flex-col min-w-[140px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">ধরণ</label>
            <select
              value={printType}
              onChange={(e) => setPrintType(e.target.value as any)}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all hover:bg-white hover:border-slate-200"
            >
              <option value="all">সব দেখান</option>
              <option value="income">শুধু আয়</option>
              <option value="expense">শুধু ব্যয়</option>
            </select>
          </div>

          <div className="flex flex-col min-w-[160px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">ক্যাটাগরি</label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all hover:bg-white hover:border-slate-200"
            >
              <option value="">সব ক্যাটাগরি</option>
              {[...new Set([
                ...(data.income || []).map((i: any) => i.category),
                ...(data.expenses || []).map((e: any) => e.category)
              ])].filter(Boolean).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-1">
            <button 
              onClick={() => setPrintType("all")}
              className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", printType === "all" ? "bg-slate-900 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50")}
            >
              সব
            </button>
            <button 
              onClick={() => setPrintType("income")}
              className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", printType === "income" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50")}
            >
              আয়
            </button>
            <button 
              onClick={() => setPrintType("expense")}
              className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", printType === "expense" ? "bg-rose-600 text-white shadow-lg" : "text-slate-600 hover:bg-slate-50")}
            >
              ব্যয়
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-sm shadow-lg shadow-slate-200 active:scale-95"
          >
            <Printer className="w-5 h-5" />
            প্রিন্ট
          </button>
        </div>
      </div>

      <div id="monthly-yearly-report" className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm print:border-0 print:p-0">
        <div className="text-center mb-10 border-b-2 border-emerald-600 pb-8 relative">
          <div className="flex justify-center mb-4">
            {settings?.logo_url ? (
              <img src={settings.logo_url} className="w-24 h-24 object-contain" alt="Logo" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <BarChart2 className="w-12 h-12" />
              </div>
            )}
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{settings?.title || "সুন্দর রসিক মাদ্রাসা"}</h1>
          <p className="text-slate-600 font-bold text-lg mb-4">{settings?.address || "মধুপুর, টাঙ্গাইল"}</p>
          
          <div className="inline-block px-8 py-2 bg-emerald-600 text-white rounded-full font-black text-xl mb-4">
            {type === 'monthly' ? 'মাসিক হিসাব বিবরণী' : 'বাৎসরিক হিসাব বিবরণী'}
          </div>
          
          <p className="text-slate-500 font-bold">
            {startDate && endDate ? `${new Date(startDate).toLocaleDateString('bn-BD')} থেকে ${new Date(endDate).toLocaleDateString('bn-BD')}` : 'সব সময়'}
          </p>

          {settings?.qr_code_url && (
            <div className="absolute top-0 right-0 print:block">
              <img src={settings.qr_code_url} className="w-24 h-24 object-contain" alt="QR Code" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>

        {(printType === 'all' || printType === 'income') && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 border-l-8 border-emerald-500 pl-4">
              <h3 className="text-2xl font-black text-emerald-700">আয় সমূহ</h3>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-600 text-white">
                    <th className="p-4 font-black border border-emerald-700">তারিখ</th>
                    <th className="p-4 font-black border border-emerald-700">বিভাগ</th>
                    <th className="p-4 font-black border border-emerald-700">বিবরণ</th>
                    <th className="p-4 font-black border border-emerald-700 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedByCategory.income).length > 0 ? (
                    Object.entries(groupedByCategory.income).flatMap(([cat, data]: [string, any]) => 
                      data.items.map((item: any, idx: number) => (
                        <tr key={`${cat}-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 border border-slate-100">{new Date(item.date).toLocaleDateString('bn-BD')}</td>
                          <td className="p-4 border border-slate-100 font-bold">{cat}</td>
                          <td className="p-4 border border-slate-100">{item.description || item.student_name || 'N/A'}</td>
                          <td className="p-4 border border-slate-100 text-right font-black text-emerald-600">৳{item.amount}</td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic">কোনো আয় পাওয়া যায়নি</td>
                    </tr>
                  )}
                </tbody>
                {Object.entries(groupedByCategory.income).length > 0 && (
                  <tfoot>
                    <tr className="bg-emerald-50 font-black">
                      <td colSpan={3} className="p-4 text-right border border-emerald-100">সর্বমোট আয়:</td>
                      <td className="p-4 text-right text-emerald-700 border border-emerald-100 text-xl">
                        ৳{Object.values(groupedByCategory.income).reduce((sum: number, cat: any) => sum + cat.total, 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {(printType === 'all' || printType === 'expense') && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 border-l-8 border-rose-500 pl-4">
              <h3 className="text-2xl font-black text-rose-700">ব্যয় সমূহ</h3>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-rose-600 text-white">
                    <th className="p-4 font-black border border-rose-700">তারিখ</th>
                    <th className="p-4 font-black border border-rose-700">বিভাগ</th>
                    <th className="p-4 font-black border border-rose-700">বিবরণ</th>
                    <th className="p-4 font-black border border-rose-700 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedByCategory.expenses).length > 0 ? (
                    Object.entries(groupedByCategory.expenses).flatMap(([cat, data]: [string, any]) => 
                      data.items.map((item: any, idx: number) => (
                        <tr key={`${cat}-${idx}`} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 border border-slate-100">{new Date(item.date).toLocaleDateString('bn-BD')}</td>
                          <td className="p-4 border border-slate-100 font-bold">{cat}</td>
                          <td className="p-4 border border-slate-100">{item.description || item.purpose || 'N/A'}</td>
                          <td className="p-4 border border-slate-100 text-right font-black text-rose-600">৳{item.amount}</td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic">কোনো ব্যয় পাওয়া যায়নি</td>
                    </tr>
                  )}
                </tbody>
                {Object.entries(groupedByCategory.expenses).length > 0 && (
                  <tfoot>
                    <tr className="bg-rose-50 font-black">
                      <td colSpan={3} className="p-4 text-right border border-rose-100">সর্বমোট ব্যয়:</td>
                      <td className="p-4 text-right text-rose-700 border border-rose-100 text-xl">
                        ৳{Object.values(groupedByCategory.expenses).reduce((sum: number, cat: any) => sum + cat.total, 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="text-slate-400 text-sm font-bold">
            রিপোর্ট জেনারেট হয়েছে: {new Date().toLocaleString('bn-BD')}
          </div>
          <div className="flex gap-20">
            <div className="text-center">
              <div className="w-32 border-t border-slate-400 mb-2"></div>
              <p className="text-sm font-bold text-slate-600">ক্যাশিয়ার</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-t border-slate-400 mb-2"></div>
              <p className="text-sm font-bold text-slate-600">মুহতামিম</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
