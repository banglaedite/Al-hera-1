import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Fingerprint, Users, UserCheck, History, Search, Save, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface BiometricLog {
  id: string;
  biometric_id: string;
  name: string;
  type: 'student' | 'teacher';
  timestamp: string;
  method: string;
  status: string;
}

export function BiometricManager({ addToast }: { addToast: (message: string, type?: 'success' | 'error' | 'info') => void }) {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'history' | 'status'>('register');
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<BiometricLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (activeSubTab === 'history') {
      fetchHistory();
    }
  }, [activeSubTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        fetch("/api/students?limit=1000"),
        fetch("/api/admin/teachers")
      ]);
      const sData = await sRes.json();
      const tData = await tRes.json();
      setStudents(Array.isArray(sData) ? sData : []);
      setTeachers(Array.isArray(tData) ? tData : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/biometric/history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRegister = async (type: 'student' | 'teacher', id: string, biometricId: string) => {
    if (!biometricId) {
      addToast("বায়োমেট্রিক আইডি প্রদান করুন", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, biometric_id: biometricId })
      });
      const result = await res.json();
      if (result.success) {
        addToast("বায়োমেট্রিক আইডি সফলভাবে রেজিস্টার করা হয়েছে", "success");
        fetchUsers();
      } else {
        addToast(result.error || "রেজিস্ট্রেশন ব্যর্থ হয়েছে", "error");
      }
    } catch (error) {
      addToast("সার্ভার সমস্যা", "error");
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.studentId || s.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">বায়োমেট্রিক হাজিরা ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 font-bold">মেশিনের সাথে ছাত্র ও শিক্ষকদের আইডি লিঙ্ক করুন</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveSubTab('register')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeSubTab === 'register' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Fingerprint className="w-4 h-4" /> রেজিস্ট্রেশন
          </button>
          <button 
            onClick={() => setActiveSubTab('history')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeSubTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <History className="w-4 h-4" /> হিস্টোরি
          </button>
          <button 
            onClick={() => setActiveSubTab('status')}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeSubTab === 'status' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Clock className="w-4 h-4" /> মেশিন সেটআপ (API)
          </button>
        </div>
      </div>

      {activeSubTab === 'status' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">বায়োমেট্রিক মেশিন API সেটআপ</h3>
              <p className="text-slate-500 font-medium">মেশিন থেকে ডাটা পুশ করার জন্য নিচের API ব্যবহার করুন</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">API Endpoint URL</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 block bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm font-mono break-all">
                  {window.location.origin}/api/attendance/push
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/attendance/push`);
                    addToast("URL কপি করা হয়েছে", "success");
                  }}
                  className="px-4 py-4 bg-emerald-100 text-emerald-700 rounded-xl font-bold hover:bg-emerald-200 transition-all whitespace-nowrap"
                >
                  কপি করুন
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">HTTP Method</h4>
              <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-black text-sm">POST</span>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">JSON Payload Example</h4>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`{
  "biometric_id": "1001",
  "timestamp": "2023-10-25T08:30:00Z",
  "method": "fingerprint"
}`}
              </pre>
              <p className="text-sm text-slate-500 mt-3 font-medium">
                * <code className="bg-slate-200 px-1 rounded text-slate-700">biometric_id</code>: মেশিনে রেজিস্টার করা আইডি<br/>
                * <code className="bg-slate-200 px-1 rounded text-slate-700">timestamp</code>: (ঐচ্ছিক) বর্তমান সময় না দিলে সার্ভারের সময় ব্যবহার হবে<br/>
                * <code className="bg-slate-200 px-1 rounded text-slate-700">method</code>: (ঐচ্ছিক) fingerprint, face, card ইত্যাদি
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'register' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input 
              type="text" 
              placeholder="নাম বা আইডি দিয়ে খুঁজুন..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-bold text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Students Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-xl text-slate-900">ছাত্র তালিকা</h3>
              </div>
              
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold">কোন ছাত্র পাওয়া যায়নি</div>
                  ) : filteredStudents.map(student => (
                    <div key={student.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={student.photo_url || `https://ui-avatars.com/api/?name=${student.name}`} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-black text-slate-900">{student.name}</p>
                          <p className="text-xs font-bold text-slate-500">ID: {student.studentId || student.id} | Class: {student.class}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="মেশিন আইডি" 
                          defaultValue={student.biometric_id || ""}
                          onBlur={(e) => {
                            if (e.target.value !== student.biometric_id) {
                              handleRegister('student', student.id, e.target.value);
                            }
                          }}
                          className="w-24 p-2 bg-white border rounded-xl text-center font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        {student.biometric_id ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Teachers Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-xl text-slate-900">শিক্ষক তালিকা</h3>
              </div>
              
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                  ) : filteredTeachers.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-bold">কোন শিক্ষক পাওয়া যায়নি</div>
                  ) : filteredTeachers.map(teacher => (
                    <div key={teacher.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={teacher.photo_url || `https://ui-avatars.com/api/?name=${teacher.name}`} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-black text-slate-900">{teacher.name}</p>
                          <p className="text-xs font-bold text-slate-500">{teacher.qualification}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="মেশিন আইডি" 
                          defaultValue={teacher.biometric_id || ""}
                          onBlur={(e) => {
                            if (e.target.value !== teacher.biometric_id) {
                              handleRegister('teacher', teacher.id, e.target.value);
                            }
                          }}
                          className="w-24 p-2 bg-white border rounded-xl text-center font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        {teacher.biometric_id ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> সাম্প্রতিক হাজিরা হিস্টোরি
            </h3>
            <button 
              onClick={fetchHistory}
              className="p-2 hover:bg-slate-100 rounded-full transition-all"
            >
              <History className={`w-5 h-5 text-slate-400 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">নাম ও আইডি</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">টাইপ</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">সময়</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">মেথড</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingHistory ? (
                  <tr><td colSpan={5} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" /></td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400 font-bold">কোন রেকর্ড পাওয়া যায়নি</td></tr>
                ) : history.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-4">
                      <p className="font-black text-slate-900">{log.name}</p>
                      <p className="text-[10px] font-bold text-slate-400">Bio ID: {log.biometric_id}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.type === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {log.type === 'teacher' ? 'শিক্ষক' : 'ছাত্র'}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <p className="font-bold text-slate-700">{new Date(log.timestamp).toLocaleTimeString('bn-BD')}</p>
                      <p className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString('bn-BD')}</p>
                    </td>
                    <td className="px-8 py-4">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{log.method}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${log.status === 'check_in' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {log.status === 'check_in' ? 'প্রবেশ' : 'প্রস্থান'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
