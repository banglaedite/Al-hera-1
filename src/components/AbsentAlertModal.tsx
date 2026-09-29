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
  Clock, 
  AlertTriangle,
  Search
} from "lucide-react";
import { cn } from "../lib/utils";
import { useToast } from "./ToastContext";

interface AbsentPerson {
  id: string;
  name: string;
  roll?: string | number;
  class?: string;
  designation?: string;
  phone?: string;
  photo_url?: string;
}

interface AbsentAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'student' | 'teacher';
  date: string;
  initialAction?: 'notification' | 'call';
  absentList: AbsentPerson[];
  className?: string;
}

export function AbsentAlertModal({
  isOpen,
  onClose,
  type,
  date,
  initialAction = 'notification',
  absentList = [],
  className
}: AbsentAlertModalProps) {
  const { addToast } = useToast();
  const [action, setAction] = useState<'notification' | 'call'>(initialAction);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [individualSending, setIndividualSending] = useState<string | null>(null);

  useEffect(() => {
    setAction(initialAction);
  }, [initialAction]);

  // By default, select ALL absent individuals as requested
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(absentList.map(p => p.id)));
      setSearchTerm("");
    }
  }, [isOpen, absentList]);

  if (!isOpen) return null;

  const toBn = (n: any) => {
    if (n === undefined || n === null || n === "") return "";
    const banglaDigits: Record<string, string> = {
      '0':'০', '1':'১', '2':'২', '3':'৩', '4':'৪', '5':'৫', '6':'৬', '7':'৭', '8':'৮', '9':'৯'
    };
    return String(n).replace(/[0-9]/g, m => banglaDigits[m] || m);
  };

  const filteredList = absentList.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = (p.name || "").toLowerCase().includes(term);
    const rollMatch = (p.roll || "").toString().includes(term);
    const phoneMatch = (p.phone || "").includes(term);
    return nameMatch || rollMatch || phoneMatch;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(absentList.map(p => p.id)));
  };

  const unselectAll = () => {
    setSelectedIds(new Set());
  };

  // Individual single action
  const handleSingleAction = async (person: AbsentPerson, targetAction: 'notification' | 'call') => {
    setIndividualSending(`${person.id}-${targetAction}`);
    try {
      const res = await fetch("/api/admin/notify/absent-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          person_ids: [person.id],
          action: targetAction,
          date
        })
      });
      const data = await res.json().catch(() => ({ success: true }));
      if (res.ok || data.success) {
        addToast(
          `${person.name}-এর অভিভাবকের অ্যাপে ${targetAction === 'call' ? 'এআই ভয়েস কল (রিং হচ্ছে...)' : 'নোটিফিকেশন'} পাঠানো হয়েছে`,
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
      addToast("অনুগ্রহ করে অন্তত একজনকে নির্বাচন করুন", "error");
      return;
    }

    setSubmitting(true);
    try {
      const idsArray = Array.from(selectedIds);
      const res = await fetch("/api/admin/notify/absent-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          person_ids: idsArray,
          action,
          date
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        addToast(
          data.message || `সফলভাবে ${idsArray.length} জনের নিকট ${action === 'call' ? 'ভয়েস কল' : 'নোটিফিকেশন'} সম্পন্ন হয়েছে`,
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

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
              action === 'call' ? "bg-purple-100 text-purple-700" : "bg-emerald-100 text-emerald-700"
            )}>
              {action === 'call' ? <PhoneCall className="w-5 h-5 animate-pulse" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                অনুপস্থিত তালিকা ও যোগাযোগ
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                তারিখ: {toBn(date)} {className ? `• শ্রেণী: ${className}` : ""} • {type === 'teacher' ? 'শিক্ষক' : 'ছাত্র'}
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

        {/* Action Type Selector & Search */}
        <div className="p-4 sm:p-6 pb-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setAction('notification')}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
                  action === 'notification' 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <Bell className="w-4 h-4" />
                নোটিফিকেশন পাঠান
              </button>
              <button
                type="button"
                onClick={() => setAction('call')}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
                  action === 'call' 
                    ? "bg-purple-600 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <PhoneCall className="w-4 h-4" />
                ভয়েস কল করুন
              </button>
            </div>

            {/* Quick Selection Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                সব নির্বাচন
              </button>
              <button
                type="button"
                onClick={unselectAll}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-colors"
              >
                সব আন-সিলেক্ট
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, রোল বা মোবাইল দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Absent List Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-2 divide-y divide-slate-100">
          {absentList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-600">মাশাআল্লাহ! আজ কোনো অনুপস্থিতি নেই।</p>
              <p className="text-xs">সবাই উপস্থিত রয়েছেন।</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="font-bold">খোঁজা অনুযায়ী কাউকে পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredList.map((person) => {
              const isChecked = selectedIds.has(person.id);
              const isCallingThis = individualSending === `${person.id}-call`;
              const isNotifyingThis = individualSending === `${person.id}-notification`;

              return (
                <div
                  key={person.id}
                  className={cn(
                    "py-3 sm:py-3.5 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors",
                    isChecked ? "bg-slate-50/80" : "hover:bg-slate-50/50"
                  )}
                >
                  {/* Left: Checkbox + Info */}
                  <div 
                    onClick={() => toggleSelect(person.id)} 
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <div className="text-emerald-600 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 fill-emerald-100 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={person.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=f1f5f9&color=0f172a&bold=true`}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{person.name}</h4>
                      <p className="text-xs font-medium text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        {person.roll && <span className="text-slate-700 font-bold">রোল: {toBn(person.roll)}</span>}
                        {person.class && <span>• শ্রেণী: {person.class}</span>}
                        {person.designation && <span>• {person.designation}</span>}
                        {person.phone && <span className="text-emerald-700 font-mono font-bold">({toBn(person.phone)})</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: Individual Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={individualSending !== null}
                      onClick={() => handleSingleAction(person, 'call')}
                      title="এককভাবে কল করুন"
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
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
                      onClick={() => handleSingleAction(person, 'notification')}
                      title="এককভাবে নোটিফিকেশন পাঠান"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
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

        {/* Modal Footer with OK / Send Button */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs sm:text-sm font-bold text-slate-600">
            নির্বাচিত: <span className="text-emerald-700 font-black">{toBn(selectedIds.size)}</span> / {toBn(absentList.length)} জন
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
                action === 'call' ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
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
                  {action === 'call' ? `ওকে / কল করুন (${toBn(selectedIds.size)})` : `ওকে / পাঠান (${toBn(selectedIds.size)})`}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
