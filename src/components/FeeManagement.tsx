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
  Calendar
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { cn } from "../lib/utils";

const MONTHS = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

export default function FeeManagement() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [error, setError] = useState("");
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [amountPerMonth, setAmountPerMonth] = useState(500);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    setTotalAmount(selectedMonths.length * amountPerMonth);
  }, [selectedMonths, amountPerMonth]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    
    setLoading(true);
    setError("");
    setStudent(null);
    setFees([]);
    setSelectedMonths([]);

    try {
      const studentRes = await fetch(`/api/students/${studentId}`);
      if (!studentRes.ok) throw new Error("ছাত্র খুঁজে পাওয়া যায়নি");
      const studentData = await studentRes.json();
      setStudent(studentData);

      await fetchFees(studentId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async (id: string) => {
    const feesRes = await fetch(`/api/fees/${id}`);
    const feesData = await feesRes.json();
    setFees(feesData);
  };

  const handleMonthToggle = (month: string) => {
    setSelectedMonths(prev => 
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const handlePayMonthlyFees = async () => {
    if (selectedMonths.length === 0) return;
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
        setSelectedMonths([]);
        await fetchFees(student.id);
        
        // Generate receipt automatically
        generateMonthlyReceipt({
          transaction_id: transactionId,
          paid_date: new Date().toISOString(),
          months: selectedMonths,
          year: selectedYear,
          amount: totalAmount
        });
      }
    } catch (err) {
      console.error("Payment failed", err);
    } finally {
      setIsPaying(false);
    }
  };

  const handlePay = async (fee: any) => {
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    try {
      const response = await fetch("/api/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeId: fee.id, transactionId })
      });
      if (response.ok) {
        await fetchFees(student.id);
      }
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const generateMonthlyReceipt = (data: any) => {
    const doc = new jsPDF();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("AL HERA MADRASA", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("Monthly Fee Receipt", 105, 32, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Receipt No: ${data.transaction_id}`, 20, 55);
    doc.text(`Date: ${new Date(data.paid_date).toLocaleDateString()}`, 150, 55);

    doc.setFontSize(14);
    doc.text("Student Information", 20, 70);
    doc.setFontSize(10);
    doc.text(`Name: ${student.name}`, 20, 80);
    doc.text(`ID: ${student.id}`, 20, 85);
    doc.text(`Class: ${student.class}`, 20, 90);
    doc.text(`Roll: ${student.roll}`, 20, 95);

    (doc as any).autoTable({
      startY: 110,
      head: [["Category", "Months", "Year", "Amount", "Transaction ID"]],
      body: [
        ["Monthly Fee", data.months.join(", "), data.year, `BDT ${data.amount}`, data.transaction_id]
      ],
      theme: "striped",
      headStyles: { fillColor: [6, 78, 59] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Total Paid:", 140, finalY);
    doc.setFontSize(16);
    doc.text(`BDT ${data.amount}.00`, 170, finalY);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

    doc.save(`Receipt_${student.id}_${data.transaction_id}.pdf`);
  };

  const generateReceipt = (fee: any) => {
    const doc = new jsPDF();
    doc.setFillColor(6, 78, 59);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("AL HERA MADRASA", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("Digital Payment Receipt", 105, 32, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Receipt No: ${fee.transaction_id}`, 20, 55);
    doc.text(`Date: ${new Date(fee.paid_date).toLocaleDateString()}`, 150, 55);

    doc.setFontSize(14);
    doc.text("Student Information", 20, 70);
    doc.setFontSize(10);
    doc.text(`Name: ${student.name}`, 20, 80);
    doc.text(`ID: ${student.id}`, 20, 85);
    doc.text(`Class: ${student.class}`, 20, 90);
    doc.text(`Roll: ${student.roll}`, 20, 95);

    (doc as any).autoTable({
      startY: 110,
      head: [["Category", "Amount", "Status", "Transaction ID"]],
      body: [
        [fee.category, `BDT ${fee.amount}`, fee.status.toUpperCase(), fee.transaction_id]
      ],
      theme: "striped",
      headStyles: { fillColor: [6, 78, 59] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.text("Total Paid:", 140, finalY);
    doc.setFontSize(16);
    doc.text(`BDT ${fee.amount}.00`, 170, finalY);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This is a computer-generated receipt. No signature required.", 105, 280, { align: "center" });

    doc.save(`Receipt_${student.id}_${fee.id}.pdf`);
  };

  const paidMonthsThisYear = fees
    .filter(f => f.category === 'মাসিক বেতন' && f.year === selectedYear && f.status === 'paid')
    .map(f => f.month);

  const otherFees = fees.filter(f => f.category !== 'মাসিক বেতন');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">বেতন ও ফি ব্যবস্থাপনা</h1>
        <p className="text-slate-500">অনলাইনে ফি প্রদান করুন এবং মানি রিসিট ডাউনলোড করুন</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="স্টুডেন্ট আইডি লিখুন (উদা: AHM-1-001)" 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <button 
            disabled={loading}
            className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ফি চেক করুন"}
          </button>
        </form>
        {error && <p className="text-rose-500 text-sm mt-3 text-center font-medium">{error}</p>}
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
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={student.photo_url || `https://picsum.photos/seed/${student.id}/200`} 
                      alt={student.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.id}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">মোট পরিশোধিত</p>
                    <p className="text-2xl font-bold text-emerald-900">৳ {fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0)}</p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">মোট বকেয়া</p>
                    <p className="text-2xl font-bold text-rose-900">৳ {fees.filter(f => f.status === 'unpaid').reduce((acc, f) => acc + f.amount, 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Monthly Fee Section */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" /> মাসিক বেতন
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
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-emerald-200/50">
                      <span className="font-bold text-emerald-900">নির্বাচিত মাস:</span>
                      <span className="text-emerald-700">{selectedMonths.join(", ")}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-emerald-700 uppercase mb-1 block">মাসিক ফি (৳)</label>
                        <input 
                          type="number" 
                          value={amountPerMonth}
                          onChange={(e) => setAmountPerMonth(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-emerald-700 uppercase mb-1 block">সর্বমোট (৳)</label>
                        <input 
                          type="number" 
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(Number(e.target.value))}
                          className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-900"
                        />
                      </div>
                      <button 
                        onClick={handlePayMonthlyFees}
                        disabled={isPaying}
                        className="w-full sm:w-auto mt-5 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : "পেমেন্ট করুন"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Other Fees Section */}
              {otherFees.length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-8">
                    <History className="w-5 h-5 text-emerald-600" /> অন্যান্য ফি
                  </h3>

                  <div className="space-y-4">
                    {otherFees.map((fee) => (
                      <div key={fee.id} className="p-6 border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            fee.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                          )}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{fee.category}</h4>
                            <p className="text-xs text-slate-500">তারিখ: {new Date(fee.due_date || fee.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">৳ {fee.amount}</p>
                            <span className={cn(
                              "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                              fee.status === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                            )}>
                              {fee.status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                            </span>
                          </div>
                          
                          {fee.status === 'unpaid' ? (
                            <button 
                              onClick={() => handlePay(fee)}
                              className="px-6 py-2 bg-emerald-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-800 transition-colors"
                            >
                              পেমেন্ট করুন
                            </button>
                          ) : (
                            <button 
                              onClick={() => generateReceipt(fee)}
                              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
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
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <CreditCard className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">কোন তথ্য পাওয়া যায়নি</h3>
            <p className="text-slate-400 mt-2">অনুগ্রহ করে স্টুডেন্ট আইডি দিয়ে ফি চেক করুন</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
