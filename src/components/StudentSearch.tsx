import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  User, 
  GraduationCap, 
  Phone, 
  MapPin, 
  Calendar, 
  Droplet, 
  Printer, 
  ChevronRight,
  Loader2,
  BookOpen
} from "lucide-react";
import IDCard from "./IDCard";
import { cn } from "../lib/utils";
import { useToast } from "./ToastContext";

export default function StudentSearch() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("1");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setLoading(true);
    setError("");
    setStudent(null);

    try {
      // In a real app, we'd search by ID or Roll+Class
      // For this demo, let's assume searchQuery is the ID
      const response = await fetch(`/api/students/${searchQuery}`);
      if (!response.ok) throw new Error("ছাত্র খুঁজে পাওয়া যায়নি");
      const data = await response.json();
      setStudent(data);
    } catch (err: any) {
      setError(err.message);
      addToast(err.message || "ছাত্র খুঁজে পাওয়া যায়নি", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-12 text-center print:hidden">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">ছাত্র প্রোফাইল ও আইডি কার্ড</h1>
        <p className="text-slate-500">আইডি বা রোল নাম্বার দিয়ে ছাত্রের তথ্য অনুসন্ধান করুন</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12 print:hidden">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="স্টুডেন্ট আইডি লিখুন (উদা: AHM-1-001)" 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <button 
            disabled={loading}
            className="px-8 py-4 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "অনুসন্ধান"}
          </button>
        </form>
        {error && <p className="text-rose-500 text-sm mt-3 text-center font-medium">{error}</p>}
      </div>

      <AnimatePresence mode="wait">
        {student ? (
          <motion.div 
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-8 print:hidden">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg bg-slate-100">
                    <img 
                      src={student.photo_url || `https://picsum.photos/seed/${student.id}/200`} 
                      alt={student.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-slate-900">{student.name}</h2>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                        Active Student
                      </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 mb-6">
                      <BookOpen className="w-4 h-4" /> {student.class} শ্রেণী | রোল: {student.roll}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">পিতার নাম</p>
                          <p className="font-medium">{student.father_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">মাতার নাম</p>
                          <p className="font-medium">{student.mother_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">মোবাইল</p>
                          <p className="font-medium">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <Droplet className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">রক্তের গ্রুপ</p>
                          <p className="font-medium">{student.blood_group}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" /> ঠিকানা
                  </h4>
                  <p className="text-slate-600 leading-relaxed">{student.address}</p>
                </div>
              </div>
            </div>

            {/* ID Card View */}
            <div className="flex flex-col items-center gap-6">
              <div className="print:block">
                <IDCard data={student} />
              </div>
              <button 
                onClick={handlePrint}
                className="w-full max-w-[350px] py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm print:hidden"
              >
                <Printer className="w-5 h-5" /> আইডি কার্ড প্রিন্ট করুন
              </button>
            </div>
          </motion.div>
        ) : !loading && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 print:hidden">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">কোন ছাত্র নির্বাচন করা হয়নি</h3>
            <p className="text-slate-400 mt-2">অনুগ্রহ করে উপরে আইডি দিয়ে সার্চ করুন</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
