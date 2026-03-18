import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Users, 
  Calendar, 
  Droplet, 
  MapPin, 
  Phone, 
  Camera, 
  FileText, 
  CreditCard,
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
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    mother_name: "",
    dob: "",
    blood_group: "",
    address: "",
    phone: "",
    whatsapp: "",
    email: "",
    className: "১ম",
    studentId: "",
    photo_url: "",
    is_hifz: false,
    birth_cert_url: "",
    parent_nid_url: ""
  });

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submissionData = { ...formData, status: 'pending', applied_date: new Date().toISOString() };

      // Save to local SQLite backend
      const res = await fetch("/api/admission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData)
      });

      if (res.ok) {
        setSubmitted({ success: true });
        setStep(3);
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      console.error("Admission failed", error);
      addToast("আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।", "error");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3 && submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white p-12 rounded-[2.5rem] shadow-xl border border-emerald-100 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">আবেদন জমা হয়েছে!</h2>
        <p className="text-slate-500 mb-8">আল হেরা মাদ্রাসায় ভর্তির জন্য আপনার আবেদনটি সফলভাবে গৃহীত হয়েছে। মাদ্রাসা কর্তৃপক্ষ আপনার সাথে শীঘ্রই যোগাযোগ করবে ইনশাআল্লাহ।</p>
        
        <div className="bg-slate-50 p-8 rounded-3xl mb-8 text-center">
          <p className="text-sm text-slate-600 font-bold">আপনার আবেদনের বর্তমান অবস্থা: <span className="text-emerald-600">পেন্ডিং</span></p>
        </div>

        <button 
          onClick={() => window.location.href = "/"}
          className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
        >
          হোম পেজে ফিরে যান <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white text-slate-600 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-2 font-bold"
        >
          <ArrowLeft className="w-5 h-5" /> ফিরে যান
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-black text-slate-900">ভর্তি আবেদন ফরম</h1>
          <p className="text-slate-500 font-bold">নতুন ছাত্র ভর্তির জন্য আবেদন</p>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] mb-8">
        <h3 className="text-lg font-black text-emerald-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> ভর্তির নিয়মাবলী
        </h3>
        <ul className="list-disc list-inside text-sm text-emerald-800 space-y-2 font-bold">
          {settings?.admission_rules ? (
            settings.admission_rules.split('\n').map((rule: string, i: number) => (
              <li key={i}>{rule}</li>
            ))
          ) : (
            <>
              <li>আবেদন ফর্মে প্রদত্ত সকল তথ্য অবশ্যই সঠিক হতে হবে।</li>
              <li>ছাত্রের পাসপোর্ট সাইজের ছবি আপলোড করতে হবে (সর্বোচ্চ সাইজ ৫ মেগাবাইট)।</li>
              <li>জন্ম নিবন্ধন এবং অভিভাবকের এনআইডি কার্ডের স্পষ্ট ছবি/লিংক প্রদান করতে হবে।</li>
              <li>ভর্তি ফি (৫০০ টাকা) বিকাশ, নগদ বা রকেটের মাধ্যমে পরিশোধ করতে হবে।</li>
              <li>ভর্তি বাতিল বা ফি রিফান্ডের কোনো সুযোগ নেই।</li>
            </>
          )}
        </ul>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors",
              step >= s ? "bg-emerald-900 text-white" : "bg-slate-200 text-slate-500"
            )}>
              {s}
            </div>
            {s < 3 && (
              <div className={cn(
                "h-1 flex-1 mx-4 rounded-full",
                step > s ? "bg-emerald-900" : "bg-slate-200"
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <User className="text-emerald-600" /> ব্যক্তিগত তথ্য
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ছাত্রের নাম</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="পূর্ণ নাম লিখুন" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">স্টুডেন্ট আইডি (ঐচ্ছিক)</label>
                <input name="studentId" value={formData.studentId} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="যেমন: AHM-1-001" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">শ্রেণী</label>
                <select name="className" value={formData.className} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                  <option value="১ম">১ম শ্রেণী</option>
                  <option value="২য়">২য় শ্রেণী</option>
                  <option value="৩য়">৩য় শ্রেণী</option>
                  <option value="৪র্থ">৪র্থ শ্রেণী</option>
                  <option value="৫ম">৫ম শ্রেণী</option>
                  <option value="হিফজ">হিফজ বিভাগ</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">পিতার নাম</label>
                <input required name="father_name" value={formData.father_name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="পিতার নাম লিখুন" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">মাতার নাম</label>
                <input required name="mother_name" value={formData.mother_name} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="মাতার নাম লিখুন" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">জন্ম তারিখ</label>
                <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">রক্তের গ্রুপ</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                  <option value="">নির্বাচন করুন</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">বর্তমান ঠিকানা</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-32" placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">মোবাইল নম্বর (অভিভাবক)</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="017XXXXXXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">হোয়াটসঅ্যাপ নম্বর</label>
                <input required type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="017XXXXXXXX" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">ইমেইল এড্রেস (অভিভাবক)</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="example@email.com" />
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="w-full py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors">পরবর্তী ধাপ</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="text-emerald-600" /> ডকুমেন্ট আপলোড (লিঙ্ক)
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Camera className="w-4 h-4" /> ছাত্রের ছবি (URL)
                </label>
                <input name="photo_url" value={formData.photo_url} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="ছবির লিঙ্ক দিন" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> জন্ম নিবন্ধন (URL)
                </label>
                <input name="birth_cert_url" value={formData.birth_cert_url} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="জন্ম নিবন্ধনের লিঙ্ক দিন" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4" /> অভিভাবকের এনআইডি (URL)
                </label>
                <input name="parent_nid_url" value={formData.parent_nid_url} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="এনআইডি লিঙ্ক দিন" />
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors">পূর্ববর্তী</button>
              <LoadingButton loading={loading} type="submit" className="flex-1 py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors">
                আবেদন জমা দিন
              </LoadingButton>
            </div>
          </motion.div>
        )}
      </form>
    </div>
  );
}
