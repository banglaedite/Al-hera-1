import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Phone, Mail, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { LoadingButton } from "./LoadingButton";
import { useToast } from "./ToastContext";
import { useNavigate } from "react-router-dom";

export default function RecruitmentForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cv_url: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/job-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      addToast("আবেদন সফলভাবে জমা হয়েছে!", "success");
    } catch (error) {
      addToast("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-lg border border-emerald-100">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
        <h3 className="text-3xl font-black text-slate-900 mb-4">আবেদন সফল!</h3>
        <p className="text-slate-600 font-bold mb-8">আপনার আবেদনটি সফলভাবে জমা হয়েছে।</p>
        <button onClick={() => navigate("/")} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold">হোমপেজে ফিরে যান</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">নাম *</label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl" placeholder="আপনার নাম" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">ফোন *</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl" placeholder="আপনার ফোন" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">ইমেইল *</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl" placeholder="আপনার ইমেইল" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">সিভি লিংক *</label>
        <div className="relative">
          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input required type="url" name="cv_url" value={formData.cv_url} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl" placeholder="আপনার সিভি লিংক (Google Drive/Public URL)" />
        </div>
      </div>
      <LoadingButton loading={loading} type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
        নিয়োগ আবেদন করুন <ArrowRight className="w-5 h-5" />
      </LoadingButton>
    </form>
  );
}
