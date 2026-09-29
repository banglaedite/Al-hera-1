import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  PhoneCall, 
  X, 
  CheckSquare, 
  Square, 
  Loader2, 
  Users, 
  Send, 
  CheckCircle2, 
  Calendar, 
  CreditCard,
  Search,
  Filter,
  Layers
} from "lucide-react";
import { cn } from "../lib/utils";
import { useToast } from "./ToastContext";

interface DefaultersAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  classesList: string[];
  initialAction?: 'notification' | 'call';
}

const MONTHS_BN = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

export function DefaultersAlertModal({
  isOpen,
  onClose,
  classesList = [],
  initialAction = 'notification'
}: DefaultersAlertModalProps) {
  const { addToast } = useToast();
  const [action, setAction] = useState<'notification' | 'call'>(initialAction);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // Default to current Bengali month
  const currentMonthIdx = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS_BN[currentMonthIdx] || "জানুয়ারি");
  
  // Selected classes: empty or includes "All" means all classes
  const [isAllClasses, setIsAllClasses] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [individualSending, setIndividualSending] = useState<string | null>(null);

  useEffect(() => {
    setAction(initialAction);
  }, [initialAction]);

  // Fetch defaulters whenever year, month, or class selection changes
  const fetchDueStudents = async () => {
    setLoading(true);
    try {
      const classesPayload = isAllClasses ? ["All"] : selectedClasses;
      const res = await fetch("/api/admin/defaulters/class-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedYear,
          month: selectedMonth,
          classes: classesPayload
        })
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.defaulters) ? data.defaulters : [];
        setDefaulters(list);
        // By default, select ALL due students as requested
        setSelectedIds(new Set(list.map((s: any) => s.id)));
      }
    } catch (e) {
      console.error(e);
      addToast("বকেয়া তালিকা আনতে সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDueStudents();
    }
  }, [isOpen, selectedYear, selectedMonth, isAllClasses, selectedClasses]);

  if (!isOpen) return null;

  const toBn = (n: any) => {
    if (n === undefined || n === null || n === "") return "";
    const banglaDigits: Record<string, string> = {
      '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'
    };
    return String(n).replace(/[0-9]/g, m => banglaDigits[m] || m);
  };

  const handleClassToggle = (className: string) => {
    if (className === "All") {
      setIsAllClasses(true);
      setSelectedClasses([]);
      return;
    }

    setIsAllClasses(false);
    setSelectedClasses(prev => {
      const exists = prev.includes(className);
      const next = exists ? prev.filter(c => c !== className) : [...prev, className];
      if (next.length === 0) {
        setIsAllClasses(true);
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(defaulters.map(s => s.id)));
  };

  const unselectAll = () => {
    setSelectedIds(new Set());
  };

  const filteredList = defaulters.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(term) ||
      (s.roll || "").toString().includes(term) ||
      (s.phone || "").includes(term) ||
      (s.class || "").toLowerCase().includes(term)
    );
  });

  const totalDueAmount = defaulters
    .filter(s => selectedIds.has(s.id))
    .reduce((sum, s) => sum + (Number(s.due_amount) || 0), 0);

  // Individual single action
  const handleSingleAction = async (student: any, targetAction: 'notification' | 'call') => {
    setIndividualSending(`${student.id}-${targetAction}`);
    try {
      const res = await fetch("/api/admin/notify/defaulters-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: [student.id],
          action: targetAction,
          year: selectedYear,
          months: [selectedMonth]
        })
      });
      const data = await res.json().catch(() => ({ success: true }));
      if (res.ok || data.success) {
        addToast(
          `${student.name}-এর অভিভাবকের অ্যাপে ${targetAction === 'call' ? 'এআই বকেয়া তাগাদা কল (রিং হচ্ছে...)' : 'নোটিফিকেশন'} পাঠানো হয়েছে`,
          "success"
        );
      } else {
        addToast("অ্যাকশন পাঠাতে সমস্যা হয়েছে", "error");
      }
    } catch (e) {
      addToast("নেটওয়ার্ক সমস্যা হয়েছে", "error");
    } finally {
      setIndividualSending(null);
    }
  };

  // Bulk OK / Send action
  const handleBulkSubmit = async () => {
    if (selectedIds.size === 0) {
      addToast("অনুগ্রহ করে অন্তত একজন শিক্ষার্থীকে নির্বাচন করুন", "error");
      return;
    }

    setSubmitting(true);
    try {
      const idsArray = Array.from(selectedIds);
      const res = await fetch("/api/admin/notify/defaulters-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_ids: idsArray,
          action,
          year: selectedYear,
          months: [selectedMonth]
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        addToast(
          data.message || `সফলভাবে ${idsArray.length} জন শিক্ষার্থীর অভিভাবকের নিকট ${action === 'call' ? 'তাগাদা কল' : 'নোটিফিকেশন'} প্রেরণ করা হয়েছে`,
          "success"
        );
        onClose();
      } else {
        addToast(data.error || "অ্যাকশন পাঠাতে ব্যর্থ হয়েছে", "error");
      }
    } catch (e) {
      addToast("সার্ভার সমস্যা হয়েছে", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const availableYears = [
    (new Date().getFullYear() - 1).toString(),
    new Date().getFullYear().toString(),
    (new Date().getFullYear() + 1).toString()
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              action === 'call' ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700"
            )}>
              {action === 'call' ? <PhoneCall className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                বকেয়া ফি রিমাইন্ডার ও যোগাযোগ
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                মাস ও সাল অনুযায়ী বকেয়া শিক্ষার্থীদের স্বয়ংক্রিয় অ্যালার্ট
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls: Year, Month, Multiple Classes */}
        <div className="p-4 sm:p-6 pb-2 space-y-3.5 bg-slate-50/40 border-b border-slate-100">
          {/* Action Switcher & Year/Month Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setAction('notification')}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
                  action === 'notification' ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Bell className="w-4 h-4" />
                নোটিফিকেশন
              </button>
              <button
                type="button"
                onClick={() => setAction('call')}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all",
                  action === 'call' ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                <PhoneCall className="w-4 h-4" />
                ভয়েস কল
              </button>
            </div>

            {/* Year & Month Selection */}
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500"
              >
                {availableYears.map(y => <option key={y} value={y}>{toBn(y)} সাল</option>)}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-500"
              >
                {MONTHS_BN.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Multiple Class Selection Controls */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                শ্রেণী নির্বাচন (এক বা একাধিক একসাথে নির্বাচন করতে পারেন):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  সব সিলেক্ট
                </button>
                <button
                  type="button"
                  onClick={unselectAll}
                  className="text-xs font-bold text-slate-400 hover:underline"
                >
                  সব আন-সিলেক্ট
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleClassToggle("All")}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition-all border",
                  isAllClasses 
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                )}
              >
                সম্পূর্ণ মাদ্রাসা (সব ক্লাস)
              </button>

              {classesList.map(c => {
                const isSelected = !isAllClasses && selectedClasses.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleClassToggle(c)}
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-bold transition-all border",
                      isSelected 
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                        : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar & Count Banner */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ছাত্রের নাম বা রোল দিয়ে খুঁজুন..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-black shrink-0">
              বকেয়া: {toBn(defaulters.length)} জন
            </div>
          </div>
        </div>

        {/* Due Students List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 divide-y divide-slate-100">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-bold">বকেয়া তথ্য যাচাই করা হচ্ছে...</p>
            </div>
          ) : defaulters.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700">মাশাআল্লাহ! {selectedMonth} {toBn(selectedYear)} এ কোনো বকেয়া নেই।</p>
              <p className="text-xs">নির্বাচিত শ্রেণীর সকল শিক্ষার্থীর বেতন পরিশোধিত।</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="font-bold">খোঁজা অনুযায়ী কোনো ছাত্র পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredList.map((student) => {
              const isChecked = selectedIds.has(student.id);
              const isCallingThis = individualSending === `${student.id}-call`;
              const isNotifyingThis = individualSending === `${student.id}-notification`;

              return (
                <div
                  key={student.id}
                  className={cn(
                    "py-3 sm:py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors",
                    isChecked ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                  )}
                >
                  {/* Left: Checkbox + Student Info */}
                  <div
                    onClick={() => toggleSelect(student.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="text-blue-600 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 fill-blue-100 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 truncate">{student.name}</h4>
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-black text-[10px]">
                          ৳{toBn(student.due_amount)} বাকি
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-slate-700 font-bold">শ্রেণী: {student.class}</span>
                        {student.roll && <span>• রোল: {toBn(student.roll)}</span>}
                        {student.phone && <span className="text-emerald-700 font-mono font-bold">({toBn(student.phone)})</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Individual Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={individualSending !== null}
                      onClick={() => handleSingleAction(student, 'call')}
                      title="এককভাবে তাগাদা কল করুন"
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isCallingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <PhoneCall className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">কল</span>
                    </button>

                    <button
                      type="button"
                      disabled={individualSending !== null}
                      onClick={() => handleSingleAction(student, 'notification')}
                      title="এককভাবে নোটিফিকেশন পাঠান"
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isNotifyingThis ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">মেসেজ</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-bold text-slate-600">
            নির্বাচিত: <span className="text-blue-700 font-black">{toBn(selectedIds.size)}</span> জন • মোট বকেয়া: <span className="text-rose-600 font-black">৳{toBn(totalDueAmount)}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-colors"
            >
              বাতিল
            </button>

            <button
              type="button"
              disabled={submitting || selectedIds.size === 0}
              onClick={handleBulkSubmit}
              className={cn(
                "flex-2 sm:flex-none px-6 py-2.5 text-white rounded-xl font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                action === 'call' ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {action === 'call' ? `ওকে / কল পাঠান (${toBn(selectedIds.size)})` : `ওকে / নোটিফিকেশন পাঠান (${toBn(selectedIds.size)})`}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
