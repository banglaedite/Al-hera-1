import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Download, ArrowLeft, Calendar, Filter } from 'lucide-react';
import { printElement } from '../utils/printUtils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toPng } from 'html-to-image';
import { cn } from '../lib/utils';

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

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0); // Dark Green
    doc.text(settings?.title || 'আল-হেরা মাদ্রাসা মধুপুর', 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(type === 'monthly' ? 'মাসিক হিসাব বিবরণী' : 'বাৎসরিক হিসাব বিবরণী', 105, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`${startDate ? new Date(startDate).toLocaleDateString('bn-BD') : ''} থেকে ${endDate ? new Date(endDate).toLocaleDateString('bn-BD') : ''}`, 105, 29, { align: 'center' });
    
    // Income Table
    if (printType === 'all' || printType === 'income') {
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129); // Emerald-500
      doc.text('আয় সমূহ', 14, 40);
      
      const incomeData = Object.entries(groupedByCategory.income).flatMap(([cat, data]: [string, any]) => 
        data.items.map((item: any) => [new Date(item.date).toLocaleDateString('bn-BD'), cat, item.description || 'N/A', `৳${item.amount}`])
      );

      (doc as any).autoTable({
        startY: 45,
        head: [['তারিখ', 'বিভাগ', 'বিবরণ', 'পরিমাণ']],
        body: incomeData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });
    }

    // Expense Table
    if (printType === 'all' || printType === 'expense') {
      const startY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 45;
      doc.setFontSize(14);
      doc.setTextColor(225, 29, 72); // Rose-600
      doc.text('ব্যয় সমূহ', 14, startY);
      
      const expenseData = Object.entries(groupedByCategory.expenses).flatMap(([cat, data]: [string, any]) => 
        data.items.map((item: any) => [new Date(item.date).toLocaleDateString('bn-BD'), cat, item.description || 'N/A', `৳${item.amount}`])
      );

      (doc as any).autoTable({
        startY: startY + 5,
        head: [['তারিখ', 'বিভাগ', 'বিবরণ', 'পরিমাণ']],
        body: expenseData,
        theme: 'striped',
        headStyles: { fillColor: [225, 29, 72] },
      });
    }
    
    doc.save(`Accounting_Report_${type}_${new Date().toLocaleDateString('bn-BD')}.pdf`);
  };

  const groupedByCategory = useMemo(() => {
    if (!data) return { income: {}, expenses: {} };
    
    const group = (items: any[]) => {
      return items.reduce((acc, item) => {
        const cat = item.category || 'Other';
        if (!acc[cat]) acc[cat] = { total: 0, items: [], months: {} };
        acc[cat].total += item.amount || 0;
        acc[cat].items.push(item);
        
        const month = item.date ? item.date.substring(0, 7) : 'Unknown';
        if (!acc[cat].months[month]) acc[cat].months[month] = { total: 0, items: [] };
        acc[cat].months[month].total += item.amount || 0;
        acc[cat].months[month].items.push(item);
        
        return acc;
      }, {} as Record<string, any>);
    };

    return {
      income: group(data.income || []),
      expenses: group(data.expenses || [])
    };
  }, [data]);

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
        <button
          onClick={async (e) => {
            e.stopPropagation();
            const element = document.getElementById(printId);
            if (!element) return;
            try {
              const imgData = await toPng(element, { 
                quality: 1, 
                pixelRatio: 1, 
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight
              });
              const pdf = new jsPDF('p', 'mm', 'a4');
              const pdfWidth = pdf.internal.pageSize.getWidth();
              const margin = 10;
              const contentWidth = pdfWidth - (2 * margin);
              const img = new Image();
              img.src = imgData;
              img.onload = () => {
                const contentHeight = (img.height * contentWidth) / img.width;
                pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                pdf.save(`details-${printId}.pdf`);
              };
            } catch (err) {
              console.error("PDF generation failed", err);
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border text-slate-600 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold"
        >
          <Download className="w-3 h-3" /> পিডিএফ
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
                <td className="p-3 text-sm">{new Date(item.date).toLocaleDateString('bn-BD')}</td>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-slate-700">রিপোর্ট ফিল্টার:</span>
          </div>
          
          {type === 'yearly' ? (
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1">বছর নির্বাচন</label>
              <input 
                type="number" 
                min="2000"
                max="2100"
                placeholder="YYYY"
                value={startDate && endDate && startDate.startsWith(endDate.substring(0, 4)) && startDate.endsWith('-01-01') && endDate.endsWith('-12-31') ? startDate.substring(0, 4) : ''}
                onChange={(e) => {
                  const year = e.target.value;
                  if (year && year.length === 4) {
                    setStartDate(`${year}-01-01`);
                    setEndDate(`${year}-12-31`);
                  } else if (!year) {
                    setStartDate("");
                    setEndDate("");
                  }
                }}
                className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900 w-24"
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1">মাস নির্বাচন</label>
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
                className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1">ধরণ</label>
            <select
              value={printType}
              onChange={(e) => setPrintType(e.target.value as any)}
              className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">সব দেখান</option>
              <option value="income">শুধু আয়</option>
              <option value="expense">শুধু ব্যয়</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm"
          >
            <Printer className="w-4 h-4" />
            প্রিন্ট
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            পিডিএফ
          </button>
        </div>
      </div>

      <div id="monthly-yearly-report" className="bg-white p-8 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <div className="flex items-center gap-4">
            {settings?.logo_url && (
              <img src={settings.logo_url} className="w-16 h-16 object-contain" alt="Logo" referrerPolicy="no-referrer" />
            )}
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">{settings?.title || "আল-হেরা মাদ্রাসা মধুপুর"}</h1>
              <p className="text-slate-600 font-medium">{settings?.address || "মধুপুর, টাঙ্গাইল"}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-800 bg-slate-100 inline-block px-4 py-1 rounded-full mb-2">
                {type === 'monthly' ? 'মাসিক হিসাব বিবরণী' : 'বাৎসরিক হিসাব বিবরণী'}
              </h2>
              <p className="text-slate-500 font-medium">
                {startDate && endDate ? `${new Date(startDate).toLocaleDateString('bn-BD')} থেকে ${new Date(endDate).toLocaleDateString('bn-BD')}` : 'সব সময়'}
              </p>
            </div>
            {settings?.qr_code_url && (
              <img src={settings.qr_code_url} className="w-16 h-16 object-contain" alt="QR Code" referrerPolicy="no-referrer" />
            )}
          </div>
        </div>

        {(printType === 'all' || printType === 'income') && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-emerald-600 mb-4 border-b pb-2">আয় সমূহ</h3>
            {Object.keys(groupedByCategory.income).length > 0 ? (
              renderCategoryList(groupedByCategory.income, true)
            ) : (
              <p className="text-slate-500 italic">কোনো আয় পাওয়া যায়নি</p>
            )}
          </div>
        )}

        {(printType === 'all' || printType === 'expense') && (
          <div>
            <h3 className="text-xl font-bold text-rose-600 mb-4 border-b pb-2">ব্যয় সমূহ</h3>
            {Object.keys(groupedByCategory.expenses).length > 0 ? (
              renderCategoryList(groupedByCategory.expenses, false)
            ) : (
              <p className="text-slate-500 italic">কোনো ব্যয় পাওয়া যায়নি</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
