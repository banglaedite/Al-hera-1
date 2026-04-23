import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { cn } from "../lib/utils";
import { LoadingButton } from "./LoadingButton";
import { useToast } from "./ToastContext";
import { useNavigate } from "react-router-dom";

export default function AdmissionForm() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    address: "",
    phone: "",
    previous_school: "",
    className: "",
  });

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings:", err));

    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const activeClasses = data.filter((c: any) => c.is_active !== 0);
          setClasses(activeClasses);
          if (activeClasses.length > 0) {
            setFormData(prev => ({ ...prev, className: activeClasses[0].name }));
          }
        }
      })
      .catch(err => console.error("Failed to load classes:", err));
  }, []);

  const getClassLabel = (className: string) => {
    if (className === "৪র্থ শ্রেণী" || className === "৪র্থ শ্রেণি" || className === "৪র্থ" || className === "চতুর্থ শ্রেণি" || className === "চতুর্থ শ্রেণী") {
      return "চতুর্থ শ্রেণি ও হিফজ বিভাগ";
    }
    if (className === "৫ম শ্রেণী" || className === "৫ম শ্রেণি" || className === "৫ম" || className === "পঞ্চম শ্রেণি" || className === "পঞ্চম শ্রেণী") {
      return "পঞ্চম শ্রেণি ও হিফজ বিভাগ";
    }
    return className;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        addToast("আবেদন সফলভাবে জমা হয়েছে!", "success");
      } else {
        addToast("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
      }
    } catch (error) {
      addToast("নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-24 px-4">
        <div className="max-w-md mx-auto bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-slate-100">
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">আবেদন সফল!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">আপনার আবেদনটি সফলভাবে জমা হয়েছে। মাদ্রাসা কর্তৃপক্ষ শীঘ্রই আপনার সাথে যোগাযোগ করবে।</p>
          <button 
            onClick={() => navigate("/")}
            className="w-full px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
          >
            হোমপেজে ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">অনলাইন ভর্তি আবেদন</h1>
          <p className="text-slate-600">নিচের তথ্যগুলো সঠিকভাবে পূরণ করুন</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100">
          {settings?.admission_rules && (
            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
              <h4 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" /> ভর্তির নিয়মাবলী:
              </h4>
              <ul className="space-y-3">
                {settings.admission_rules.split('\n').filter((line: string) => line.trim()).map((rule: string, i: number) => (
                  <li key={i} className="flex gap-3 text-amber-800 text-sm leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ছাত্রের নাম *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500" placeholder="ছাত্রের পূর্ণ নাম" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">পিতার নাম *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input required type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500" placeholder="পিতার নাম" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ঠিকানা *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <textarea required name="address" value={formData.address} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 min-h-[100px]" placeholder="ছাত্রের পূর্ণ ঠিকানা" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">মোবাইল নাম্বার *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500" placeholder="মোবাইল নাম্বার" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">পূর্বের মাদ্রাসা (যদি থাকে)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500" placeholder="পূর্বের মাদ্রাসার নাম" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">কোন ক্লাসে ভর্তি হতে ইচ্ছুক *</label>
                <select name="className" value={formData.className} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500">
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {getClassLabel(cls.name)}
                    </option>
                  ))}
                  {classes.length === 0 && <option value="">লোড হচ্ছে...</option>}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <LoadingButton
                loading={loading}
                type="submit"
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                আবেদন জমা দিন <ArrowRight className="w-5 h-5" />
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
