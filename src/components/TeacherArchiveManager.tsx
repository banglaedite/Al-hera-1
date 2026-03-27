import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Users, X as CloseIcon, Download, Printer, FileText, Phone, Mail, MapPin, Calendar, Award } from "lucide-react";

export function TeacherArchiveManager({ settings }: { settings: any }) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/archive/teachers");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Failed to fetch archived teachers", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (t.id_code && t.id_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (t.phone && t.phone.includes(searchTerm));
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">শিক্ষক আর্কাইভ</h2>
          <p className="text-slate-500 font-bold mt-1">মাদরাসার প্রাক্তন শিক্ষকদের তালিকা ও তথ্য</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Teacher List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 sticky top-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  placeholder="নাম বা আইডি দিয়ে খুঁজুন..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2 scrollbar-hide">
              {loading ? (
                <div className="text-center py-12 text-slate-400 font-bold">লোড হচ্ছে...</div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold">কোন শিক্ষক পাওয়া যায়নি</div>
              ) : (
                filteredTeachers.map(teacher => (
                  <div 
                    key={teacher.id}
                    onClick={() => setSelectedTeacher(teacher)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border ${
                      selectedTeacher?.id === teacher.id 
                        ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                        : "bg-white border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <div className="relative">
                      <img src={teacher.photo_url || `https://picsum.photos/seed/${teacher.id}/50`} className="w-12 h-12 rounded-full object-cover bg-slate-200" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" title="প্রাক্তন" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{teacher.name}</p>
                      <p className="text-xs text-slate-500 font-bold">ID: {teacher.id_code || "N/A"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Teacher Profile */}
        <div className="lg:col-span-3">
          {selectedTeacher ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                এই শিক্ষকটি বর্তমানে কর্মরত নন (আর্কাইভকৃত)।
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative">
                  <img src={selectedTeacher.photo_url || `https://picsum.photos/seed/${selectedTeacher.id}/200`} className="w-48 h-48 rounded-3xl object-cover shadow-lg border-4 border-white" />
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tight">{selectedTeacher.name}</h3>
                      <p className="text-emerald-600 font-bold text-xl mt-1">{selectedTeacher.qualification}</p>
                    </div>
                    <div className="text-right">
                      <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-black tracking-widest">
                        ID: {selectedTeacher.id_code || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl text-slate-400"><Phone className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ফোন নম্বর</p>
                        <p className="font-bold text-slate-900">{selectedTeacher.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl text-slate-400"><Mail className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ইমেইল</p>
                        <p className="font-bold text-slate-900">{selectedTeacher.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl text-slate-400"><MapPin className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ঠিকানা</p>
                        <p className="font-bold text-slate-900">{selectedTeacher.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-2 bg-white rounded-xl text-slate-400"><Calendar className="w-5 h-5" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">যোগদানের তারিখ</p>
                        <p className="font-bold text-slate-900">{selectedTeacher.join_date ? new Date(selectedTeacher.join_date).toLocaleDateString('bn-BD') : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    ব্যক্তিগত তথ্য
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পিতার নাম</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.father_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">মাতার নাম</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.mother_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">জন্ম তারিখ</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.dob ? new Date(selectedTeacher.dob).toLocaleDateString('bn-BD') : "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    ডকুমেন্টস
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NID নম্বর</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.nid || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">পিতামাতার NID</p>
                      <p className="font-bold text-slate-900">{selectedTeacher.parents_nid || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    আর্কাইভ তথ্য
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আর্কাইভের তারিখ</p>
                      <p className="font-bold text-rose-600">{selectedTeacher.deleted_at ? new Date(selectedTeacher.deleted_at).toLocaleDateString('bn-BD') : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">শেষ বেতন</p>
                      <p className="font-bold text-slate-900">৳{selectedTeacher.salary}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Users className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">শিক্ষক নির্বাচন করুন</h3>
              <p className="text-slate-500 font-bold max-w-sm">বিস্তারিত তথ্য দেখতে বাম পাশের তালিকা থেকে একজন শিক্ষক নির্বাচন করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function History({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
