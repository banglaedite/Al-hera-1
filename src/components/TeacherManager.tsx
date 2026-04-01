import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Users, Plus, Edit, Edit2, Trash2, Search, DollarSign, Printer, Download, MessageCircle, Mail, Loader2, X as CloseIcon, Save } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from 'html-to-image';
import { cn } from "../lib/utils";

import { printElement } from '../utils/printUtils';

export function TeacherManager({ addToast, settings }: { addToast: (message: string, type?: 'success' | 'error' | 'info') => void, settings?: any }) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaries, setSalaries] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<any>(null);
  const [isDeletingSalary, setIsDeletingSalary] = useState<any>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [selectedSalary, setSelectedSalary] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payingSalary, setPayingSalary] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/teachers?t=" + Date.now());
      const data = await res.json();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());
      
      let res;
      if (isEditing) {
        res = await fetch(`/api/admin/teachers/${selectedTeacher.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch("/api/admin/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
      }
      
      const result = await res.json();
      if (result.success) {
        setIsAdding(false);
        setIsEditing(false);
        setSelectedTeacher(null);
        addToast("শিক্ষকের তথ্য সেভ হয়েছে", "success");
        fetchTeachers();
      } else {
        addToast(result.error || "সেভ করতে সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("সার্ভারে সমস্যা হয়েছে", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/teachers/${isDeleting.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();
      if (data.success) {
        addToast("শিক্ষক আর্কাইভ করা হয়েছে", "success");
        setIsDeleting(null);
        setDeletePassword("");
        fetchTeachers();
      } else {
        addToast(data.error || "পাসওয়ার্ড ভুল", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("সার্ভারে সমস্যা হয়েছে", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSalary = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/teachers/salary/${isDeletingSalary.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();
      if (data.success) {
        addToast("বেতন রেকর্ড ডিলিট হয়েছে", "success");
        setIsDeletingSalary(null);
        setDeletePassword("");
        fetchSalaries(selectedTeacher.id);
      } else {
        addToast(data.error || "পাসওয়ার্ড ভুল", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("সার্ভারে সমস্যা হয়েছে", "error");
    } finally {
      setDeleting(false);
    }
  };

  const [editingSalary, setEditingSalary] = useState<any>(null);

  const handlePaySalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payingSalary) return;
    
    setPayingSalary(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const data = Object.fromEntries(formData.entries());

      if (editingSalary) {
        await fetch(`/api/admin/teachers/salary/${editingSalary.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        addToast("বেতন আপডেট সফল হয়েছে", "success");
        setEditingSalary(null);
      } else {
        await fetch(`/api/admin/teachers/${selectedTeacher.id}/salary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        addToast("বেতন প্রদান সফল হয়েছে", "success");
      }

      fetchSalaries(selectedTeacher.id);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      addToast("সার্ভারে সমস্যা হয়েছে", "error");
    } finally {
      setPayingSalary(false);
    }
  };

  const fetchSalaries = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/teachers/${id}/salaries`);
      const data = await res.json();
      setSalaries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch salaries:", error);
      setSalaries([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  const filteredTeachers = teachers.filter(t => t && t.name && t.name.toLowerCase().includes(search.toLowerCase()));

  const currentMonthSalaries = Array.isArray(salaries) ? salaries.filter(s => s.month === monthNames[selectedMonth] && s.year === selectedYear) : [];
  const paidAmount = currentMonthSalaries.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const teacherSalary = Number(selectedTeacher?.salary) || 0;
  const currentDue = teacherSalary - paidAmount;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">শিক্ষক ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 font-bold">শিক্ষকদের তথ্য এবং বেতন পরিচালনা করুন</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setIsEditing(false); setSelectedTeacher(null); }}
          className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> নতুন শিক্ষক
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="শিক্ষকের নাম দিয়ে খুঁজুন..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none font-bold text-slate-700"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map(teacher => (
          <div key={teacher.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-6">
              <img src={teacher.photo_url || `https://ui-avatars.com/api/?name=${teacher.name}&background=random`} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h3 className="font-black text-lg text-slate-900">{teacher.name}</h3>
                <p className="text-sm text-slate-500 font-bold">{teacher.qualification}</p>
              </div>
            </div>
            <div className="space-y-2 mb-6 text-sm font-bold text-slate-600">
              <p>ফোন: {teacher.phone}</p>
              <p>বেতন: ৳{teacher.salary}</p>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => {
                    const cleanPhone = teacher.phone?.replace(/[^0-9]/g, '') || '';
                    const waPhone = cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone;
                    window.open(`https://wa.me/${waPhone}`, '_blank');
                  }}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => window.open(`mailto:${teacher.email}`, '_blank')}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                  title="Email"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setSelectedTeacher(teacher); fetchSalaries(teacher.id); setShowSalaryModal(true); }}
                className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" /> বেতন
              </button>
              <button 
                onClick={() => { setSelectedTeacher(teacher); setIsEditing(true); setIsAdding(true); }}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsDeleting(teacher)}
                className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900">{isEditing ? "শিক্ষক এডিট" : "নতুন শিক্ষক"}</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">নাম</label>
                  <input name="name" required defaultValue={selectedTeacher?.name} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">যোগ্যতা</label>
                  <input name="qualification" defaultValue={selectedTeacher?.qualification} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">ফোন</label>
                  <input name="phone" defaultValue={selectedTeacher?.phone} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">ইমেইল</label>
                  <input name="email" defaultValue={selectedTeacher?.email} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">নির্ধারিত বেতন (টাকা)</label>
                  <input name="salary" type="number" defaultValue={selectedTeacher?.salary} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">জন্ম তারিখ</label>
                  <input name="dob" type="date" defaultValue={selectedTeacher?.dob} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">যোগদানের তারিখ</label>
                  <input name="join_date" type="date" defaultValue={selectedTeacher?.join_date} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">এনআইডি নম্বর</label>
                  <input name="nid" defaultValue={selectedTeacher?.nid} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">পিতার নাম</label>
                  <input name="father_name" defaultValue={selectedTeacher?.father_name} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">মাতার নাম</label>
                  <input name="mother_name" defaultValue={selectedTeacher?.mother_name} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">পিতা/মাতার এনআইডি</label>
                  <input name="parents_nid" defaultValue={selectedTeacher?.parents_nid} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">বায়োমেট্রিক আইডি (মেশিন আইডি)</label>
                  <input name="biometric_id" defaultValue={selectedTeacher?.biometric_id} className="w-full p-4 bg-slate-50 border rounded-2xl" placeholder="যেমন: 201" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">ছবির ইউআরএল</label>
                  <input name="photo_url" defaultValue={selectedTeacher?.photo_url} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">ঠিকানা</label>
                  <textarea name="address" defaultValue={selectedTeacher?.address} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className={cn(
                  "flex items-center justify-center gap-2 w-full py-4 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-600/20",
                  submitting ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {submitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Save className="w-6 h-6" />
                )}
                {submitting ? "প্রসেসিং..." : "সেভ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSalaryModal && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900">বেতন প্রদান: {selectedTeacher.name}</h3>
              <button onClick={() => setShowSalaryModal(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">✕</button>
            </div>
            <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-2">মাস নির্বাচন করুন</label>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                    {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-2">বছর</label>
                  <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">নির্ধারিত বেতন</p>
                  <h3 className="text-xl font-black text-emerald-900">৳{teacherSalary}</h3>
                </div>
                <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">প্রদান করা হয়েছে</p>
                  <h3 className="text-xl font-black text-blue-900">৳{paidAmount}</h3>
                </div>
                <div className="bg-rose-50 p-4 rounded-3xl border border-rose-100">
                  <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">বকেয়া</p>
                  <h3 className="text-xl font-black text-rose-900">৳{currentDue > 0 ? currentDue : 0}</h3>
                </div>
              </div>

              <form onSubmit={handlePaySalary} className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                <input type="hidden" name="month" value={monthNames[selectedMonth]} />
                <input type="hidden" name="year" value={selectedYear} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">টাকার পরিমাণ</label>
                    <input name="amount" type="number" required defaultValue={editingSalary ? editingSalary.amount : (currentDue > 0 ? currentDue : teacherSalary)} className="w-full p-4 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">প্রদানকারী</label>
                    <input name="given_by" placeholder="যিনি বেতন দিয়েছেন" defaultValue={editingSalary?.given_by || ""} className="w-full p-4 bg-white border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    disabled={payingSalary}
                    className={cn(
                      "flex-1 py-4 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2",
                      payingSalary ? "bg-emerald-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
                    )}
                  >
                    {payingSalary ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Save className="w-6 h-6" />
                    )}
                    {payingSalary ? "প্রসেসিং..." : (editingSalary ? "বেতন আপডেট করুন" : "বেতন প্রদান সম্পন্ন করুন")}
                  </button>
                  {editingSalary && !payingSalary && (
                    <button type="button" onClick={() => setEditingSalary(null)} className="py-4 px-6 bg-slate-200 text-slate-700 rounded-2xl font-black text-lg hover:bg-slate-300 transition-all">
                      বাতিল
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-8">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">মূল বেতন</p>
                    <p className="text-lg font-black text-slate-900">৳{teacherSalary}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">মোট প্রদান</p>
                    <p className="text-lg font-black text-emerald-700">৳{paidAmount}</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-2xl border",
                    teacherSalary - paidAmount > 0 ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
                  )}>
                    <p className={cn(
                      "text-[10px] font-black uppercase mb-1",
                      teacherSalary - paidAmount > 0 ? "text-rose-600" : "text-emerald-600"
                    )}>বাকি</p>
                    <p className={cn(
                      "text-lg font-black",
                      teacherSalary - paidAmount > 0 ? "text-rose-700" : "text-emerald-700"
                    )}>৳{Math.max(0, teacherSalary - paidAmount)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="font-black text-slate-900">বেতন প্রদানের ইতিহাস ({monthNames[selectedMonth]} {selectedYear})</h4>
                  <span className="text-xs font-bold text-slate-400">মোট {currentMonthSalaries.length}টি রেকর্ড</span>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {currentMonthSalaries.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl group hover:border-emerald-200 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-black text-slate-700 block text-sm">
                            ৳{s.amount}
                            {s.is_edited && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Edited</span>}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            {s.given_by ? `প্রদানকারী: ${s.given_by}` : 'তথ্য নেই'} • {new Date(s.created_at || Date.now()).toLocaleDateString('bn-BD')}
                          </span>
                          {s.is_edited && s.edit_history && s.edit_history.length > 0 && (
                            <div className="text-[9px] text-slate-400 mt-1 max-w-[200px] truncate" title={s.edit_history[s.edit_history.length - 1].changes}>
                              Last edit: {new Date(s.edit_history[s.edit_history.length - 1].edited_at).toLocaleDateString('bn-BD')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => setSelectedSalary(s)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                          title="রিসিট দেখুন"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setEditingSalary(s)}
                          className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all"
                          title="এডিট করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setIsDeletingSalary(s)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="ডিলিট করুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {currentMonthSalaries.length === 0 && (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold text-sm">এই মাসে কোন বেতন প্রদান করা হয়নি</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      {isDeleting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">শিক্ষক ডিলিট?</h3>
            <p className="text-slate-500 font-bold mb-6">আপনি কি নিশ্চিতভাবে এই শিক্ষকের তথ্য ডিলিট করতে চান?</p>
            
            <input 
              type="password"
              placeholder="অ্যাডমিন পাসওয়ার্ড দিন"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold mb-6 text-center focus:ring-2 focus:ring-rose-500 outline-none"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => { setIsDeleting(null); setDeletePassword(""); }}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                বাতিল
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className={cn(
                  "flex-1 py-4 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                  deleting ? "bg-rose-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {deleting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeletingSalary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">বেতন রেকর্ড ডিলিট?</h3>
            <p className="text-slate-500 font-bold mb-6">আপনি কি নিশ্চিতভাবে এই বেতনের রেকর্ডটি ডিলিট করতে চান?</p>
            
            <input 
              type="password"
              placeholder="অ্যাডমিন পাসওয়ার্ড দিন"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold mb-6 text-center focus:ring-2 focus:ring-rose-500 outline-none"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => { setIsDeletingSalary(null); setDeletePassword(""); }}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                বাতিল
              </button>
              <button 
                onClick={handleDeleteSalary}
                disabled={deleting}
                className={cn(
                  "flex-1 py-4 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2",
                  deleting ? "bg-rose-400 cursor-not-allowed" : "bg-rose-600 hover:bg-rose-700"
                )}
              >
                {deleting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ডিলিট করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Salary Receipt Modal */}
      {selectedSalary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 print:hidden">
              <h3 className="text-xl font-black text-slate-900">বেতন রিসিট</h3>
              <button onClick={() => setSelectedSalary(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              <div id="salary-receipt" className="space-y-8 bg-white relative">
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
                        বেতন রিসিট
                      </div>
                      <p className="text-[10px] font-bold text-slate-400">রিসিট নং: #{selectedSalary.id.toString().substring(0, 6)}</p>
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
                      <p className="font-bold text-slate-900">{new Date(selectedSalary.created_at || Date.now()).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">শিক্ষকের নাম</p>
                      <p className="font-bold text-slate-900">{selectedTeacher?.name}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">মাস ও বছর</p>
                      <p className="font-bold text-slate-900">{selectedSalary.month} {selectedSalary.year}</p>
                    </div>
                    <div className="space-y-1 border-b border-slate-100 pb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">প্রদানকারী</p>
                      <p className="font-bold text-slate-900">{selectedSalary.given_by || "অ্যাডমিন"}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-6 bg-slate-900 text-white rounded-3xl shadow-lg">
                    <p className="font-bold uppercase tracking-widest text-xs">মোট পরিমাণ</p>
                    <h2 className="text-3xl font-black">৳{selectedSalary.amount}</h2>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-12 pt-12">
                  <div className="text-center">
                    <div className="border-t border-slate-300 pt-2">
                      <p className="text-[10px] font-black text-slate-500 uppercase">শিক্ষকের স্বাক্ষর</p>
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
              <button onClick={() => printElement('salary-receipt', 'A5')} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                <Printer className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-bold">প্রিন্ট</span>
              </button>
              <button onClick={async () => {
                const element = document.getElementById('salary-receipt');
                if (!element) return;
                try {
                  const imgData = await toPng(element, { 
                    quality: 1,
                    pixelRatio: 2,
                    backgroundColor: '#ffffff',
                    style: { backgroundColor: '#ffffff' }
                  });
                  const pdf = new jsPDF('p', 'mm', 'a5');
                  const pdfWidth = pdf.internal.pageSize.getWidth();
                  const pdfHeight = pdf.internal.pageSize.getHeight();
                  const margin = 10;
                  const contentWidth = pdfWidth - (2 * margin);
                  
                  const img = new Image();
                  img.src = imgData;
                  img.onload = () => {
                    const contentHeight = (img.height * contentWidth) / img.width;
                    pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);
                    pdf.save(`salary-receipt-${selectedSalary.id}.pdf`);
                  };
                } catch (err) {
                  console.error("PDF generation failed", err);
                  addToast("PDF তৈরি করতে সমস্যা হয়েছে।", "error");
                }
              }} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                <Download className="w-5 h-5 text-slate-600" />
                <span className="text-[10px] font-bold">ডাউনলোড</span>
              </button>
              <button onClick={() => {
                if (!selectedTeacher?.whatsapp) {
                  addToast("শিক্ষকের হোয়াটসঅ্যাপ নম্বর দেওয়া নেই", "error");
                  return;
                }
                const text = `আসসালামু আলাইকুম।\nআপনার ${selectedSalary.month} ${selectedSalary.year} মাসের বেতন ৳${selectedSalary.amount} প্রদান করা হয়েছে।\nধন্যবাদ।`;
                const phone = selectedTeacher.whatsapp.replace(/[^0-9]/g, '');
                const formattedPhone = phone.startsWith('88') ? phone : (phone.startsWith('0') ? `88${phone}` : `880${phone}`);
                window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
              }} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-[10px] font-bold text-green-700">হোয়াটসঅ্যাপ</span>
              </button>
              <button onClick={async () => {
                if (!selectedTeacher?.email) {
                  addToast("শিক্ষকের ইমেইল দেওয়া নেই", "error");
                  return;
                }
                
                const element = document.getElementById('salary-receipt');
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
                      to: selectedTeacher.email,
                      subject: `বেতন রিসিট - ${selectedSalary.month} ${selectedSalary.year}`,
                      text: `আসসালামু আলাইকুম,\nআপনার ${selectedSalary.month} ${selectedSalary.year} মাসের বেতন ৳${selectedSalary.amount} প্রদান করা হয়েছে। রিসিটটি সংযুক্ত করা হলো।\nধন্যবাদ।`,
                      attachments: [
                        {
                          filename: `Salary_Receipt_${selectedSalary.month}_${selectedSalary.year}.pdf`,
                          content: pdfBase64,
                          encoding: 'base64'
                        }
                      ]
                    })
                  });

                  if (response.ok) {
                    addToast("ইমেইল সফলভাবে পাঠানো হয়েছে।", "success");
                  } else {
                    throw new Error("Failed to send email");
                  }
                } catch (err) {
                  console.error("Email sending failed", err);
                  addToast("ইমেইল পাঠাতে সমস্যা হয়েছে।", "error");
                }
              }} className="flex flex-col items-center gap-1 p-2 hover:bg-white rounded-xl transition-all">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-700">ইমেইল</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
