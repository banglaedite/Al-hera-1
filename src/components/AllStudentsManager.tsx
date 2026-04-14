import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Users, X as CloseIcon, Download, Printer, FileText } from "lucide-react";

export function AllStudentsManager({ settings, classesList }: { settings: any, classesList: string[] }) {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [view, setView] = useState<"dashboard" | "list">("dashboard");
  const [classBreakdown, setClassBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const classes = ["All", ...classesList];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/archive/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
      
      // Calculate class breakdown
      const breakdown: any = {};
      data.forEach((s: any) => {
        breakdown[s.class] = (breakdown[s.class] || 0) + 1;
      });
      setClassBreakdown(breakdown);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
    const rollA = Number(a.roll) || Infinity;
    const rollB = Number(b.roll) || Infinity;
    return rollA - rollB;
  });

  const fetchFullProfile = async (id: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/admin/archive/students/${id}/full-profile`);
      if (res.ok) {
        const data = await res.json();
        const safeData = {
          ...data,
          fees: data.fees || [],
          transactions: data.transactions || [],
          results: data.results || [],
          attendance: data.attendance || [],
          examStats: data.examStats || {}
        };
        setFullProfile(safeData);
      } else {
        setFullProfile({ fees: [], transactions: [], results: [], attendance: [], examStats: {} });
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      setFullProfile({ fees: [], transactions: [], results: [], attendance: [], examStats: {} });
    }
    setLoadingProfile(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">ছাত্র তালিকা</h2>
          <p className="text-slate-500 font-bold mt-1">মাদরাসার সকল ছাত্রের তথ্য ব্যবস্থাপনা</p>
        </div>
        {view === "list" && (
          <button onClick={() => setView("dashboard")} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all">
            ড্যাশবোর্ডে ফিরে যান
          </button>
        )}
      </div>

      {view === "dashboard" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-lg transition-all" onClick={() => setView("list")}>
            <h3 className="text-xl font-black text-slate-900 mb-2">মোট ছাত্র সংখ্যা</h3>
            <p className="text-5xl font-black text-emerald-600">{students.length}</p>
            <p className="text-slate-500 font-bold mt-4">বিস্তারিত তালিকা দেখুন</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-4">ক্লাস ভিত্তিক পরিসংখ্যান</h3>
            <div className="space-y-2">
              {classBreakdown && Object.entries(classBreakdown).map(([cls, count]: any) => (
                <div key={cls} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="font-bold text-slate-700">{cls}</span>
                  <span className="font-black text-emerald-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-4">
            <button onClick={() => setView("list")} className="w-full p-6 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all">ছাত্র খুঁজুন</button>
            <button className="w-full p-6 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">নতুন ছাত্র যোগ করুন</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Student List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 sticky top-4">
              <div className="space-y-4">
                <input 
                  placeholder="নাম, আইডি বা রোল দিয়ে খুঁজুন..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                />
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {classes.map(c => (
                    <button 
                      key={c}
                      onClick={() => setSelectedClass(c)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                        selectedClass === c ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {c === "All" ? "সকল" : c}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-12 text-slate-400 font-bold">লোড হচ্ছে...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-bold">কোন ছাত্র পাওয়া যায়নি</div>
                ) : (
                  filteredStudents.map(student => (
                    <div 
                      key={student.id}
                      onClick={() => { setSelectedStudent(student); fetchFullProfile(student.id); }}
                      className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 border ${
                        selectedStudent?.id === student.id 
                          ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                          : "bg-white border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative">
                        <img src={student.photo_url || `https://picsum.photos/seed/${student.id}/50`} className="w-10 h-10 rounded-full object-cover bg-slate-200" />
                        {student.deleted_at && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" title="বাতিলকৃত" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500 font-bold">ID: {student.studentId || student.id} | Roll: {student.roll}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Student Profile */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              loadingProfile ? (
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-center">
                  <p className="text-slate-400 font-bold">প্রোফাইল লোড হচ্ছে...</p>
                </div>
              ) : fullProfile ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  {fullProfile.student.deleted_at && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 font-bold flex items-center gap-2">
                      <CloseIcon className="w-5 h-5" />
                      এই ছাত্রটি বর্তমানে তালিকাভুক্ত নয় (বাতিলকৃত)।
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <img src={fullProfile.student.photo_url || `https://picsum.photos/seed/${fullProfile.student.id}/200`} className="w-40 h-40 rounded-3xl object-cover shadow-lg border-4 border-white" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-3xl font-black text-slate-900">{fullProfile.student.name}</h3>
                          <p className="text-slate-500 font-bold text-lg mt-1">শ্রেণী: {fullProfile.student.class} | রোল: {fullProfile.student.roll}</p>
                        </div>
                        <div className="text-right">
                          <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-black tracking-widest">
                            ID: {fullProfile.student.studentId || fullProfile.student.id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">পিতার নাম</p>
                            <p className="font-bold text-slate-900">{fullProfile.student.father_name}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">মাতার নাম</p>
                            <p className="font-bold text-slate-900">{fullProfile.student.mother_name}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">যোগাযোগ</p>
                            <p className="font-bold text-slate-900">{fullProfile.student.phone}</p>
                            {fullProfile.student.whatsapp && <p className="font-bold text-emerald-600 text-sm mt-1">WA: {fullProfile.student.whatsapp}</p>}
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">ঠিকানা</p>
                            <p className="font-bold text-slate-900">{fullProfile.student.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History Tabs */}
                  <div className="mt-12">
                    <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-slate-400" />
                      লেনদেন ও হিস্টোরি
                    </h4>
                    <div className="space-y-6">
                      {/* Fees History */}
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h5 className="font-bold text-slate-900 mb-4">ফি প্রদানের ইতিহাস</h5>
                        {fullProfile.fees.length === 0 ? (
                          <p className="text-slate-500 text-sm">কোন ফি রেকর্ড পাওয়া যায়নি।</p>
                        ) : (
                          <div className="space-y-2">
                            {fullProfile.fees.map((fee: any) => (
                              <div key={fee.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-900">{fee.category}</p>
                                  <p className="text-xs text-slate-500">{new Date(fee.due_date).toLocaleDateString('bn-BD')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900">৳{fee.amount}</p>
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                    fee.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                  }`}>
                                    {fee.status === 'paid' ? 'পরিশোধিত' : 'বকেয়া'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Transactions History */}
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mt-6">
                        <h5 className="font-bold text-slate-900 mb-4">লেনদেনের ইতিহাস</h5>
                        {fullProfile.transactions && fullProfile.transactions.length === 0 ? (
                          <p className="text-slate-500 text-sm">কোন লেনদেনের রেকর্ড পাওয়া যায়নি।</p>
                        ) : (
                          <div className="space-y-2">
                            {fullProfile.transactions && fullProfile.transactions.map((transaction: any) => (
                              <div key={transaction.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-900">রশিদ নং: {transaction.transaction_id}</p>
                                  <p className="text-xs text-slate-500">{new Date(transaction.date || transaction.paid_date).toLocaleDateString('bn-BD')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-emerald-600">৳{transaction.amount}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Results History */}
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <h5 className="font-bold text-slate-900 mb-4">পরীক্ষার ফলাফল</h5>
                        {fullProfile.results.length === 0 ? (
                          <p className="text-slate-500 text-sm">কোন পরীক্ষার ফলাফল পাওয়া যায়নি।</p>
                        ) : (
                          <div className="space-y-2">
                            {fullProfile.results.map((result: any) => (
                              <div key={result.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                                <div>
                                  <p className="font-bold text-slate-900">{result.exam_name}</p>
                                  <p className="text-xs text-slate-500">{result.subject}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-slate-900">{result.marks}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null
            ) : (
              <div className="bg-slate-50 p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Users className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">ছাত্র নির্বাচন করুন</h3>
                <p className="text-slate-500 font-bold max-w-sm">বিস্তারিত তথ্য ও হিস্টোরি দেখতে বাম পাশের তালিকা থেকে একজন ছাত্র নির্বাচন করুন।</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
