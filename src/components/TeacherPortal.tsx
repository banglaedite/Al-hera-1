import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Bell, 
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Users,
  History,
  Heart,
  Target,
  Send
} from "lucide-react";
import { cn } from "../lib/utils";

export default function TeacherPortal() {
  const [identifier, setIdentifier] = useState(() => localStorage.getItem("teacherPhone") || "");
  const [loading, setLoading] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("সব");
  const [submissionStatus, setSubmissionStatus] = useState<any[]>([]);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [studentTasks, setStudentTasks] = useState<any[]>([]);
  
  // Daily Amal State
  const [amalTasks, setAmalTasks] = useState<any[]>([]);
  const [amalLogs, setAmalLogs] = useState<Record<string, boolean>>({});
  const [isAmalSubmitted, setIsAmalSubmitted] = useState(false);
  const [savingAmal, setSavingAmal] = useState(false);
  const [amalDate, setAmalDate] = useState(new Date().toLocaleDateString('en-CA'));

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(setSettings)
      .catch(err => console.error("Failed to load settings:", err));
    
    const savedIdentifier = localStorage.getItem("teacherPhone");
    if (savedIdentifier) {
      handleLogin(null, savedIdentifier);
    }
  }, []);

  useEffect(() => {
    if (teacher) {
      if (activeTab === "amal") {
        fetchAmalData();
      }
      if (activeTab === "student-amal") {
        fetchStudentAmalData();
      }
    }
  }, [teacher, activeTab, amalDate, selectedClass]);

  const fetchStudentAmalData = async () => {
    setFetchingStatus(true);
    try {
      const [tasksRes, statusRes] = await Promise.all([
        fetch("/api/amal-tasks?target=student"),
        fetch(`/api/admin/amal-submission-status?target=student&date=${amalDate}`)
      ]);
      
      if (!tasksRes.ok) throw new Error(`Tasks fetch failed: ${tasksRes.status}`);
      if (!statusRes.ok) throw new Error(`Status fetch failed: ${statusRes.status}`);

      setStudentTasks(await tasksRes.json());
      let status = await statusRes.json();
      if (selectedClass !== "সব") {
        status = status.filter((s: any) => s.class === selectedClass);
      }
      setSubmissionStatus(status);
    } catch (err) {
      console.error("Failed to fetch student amal data:", err);
    } finally {
      setFetchingStatus(false);
    }
  };

  const toggleStudentAmal = async (studentId: string, taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistically update
    setSubmissionStatus(prev => prev.map(s => {
      if (s.userId === studentId) {
        const newLogs = [...s.logs];
        const logIndex = newLogs.findIndex(l => l.task_id === taskId);
        if (logIndex > -1) {
          newLogs[logIndex] = { ...newLogs[logIndex], status: newStatus ? "completed" : "pending" };
        } else {
          newLogs.push({ task_id: taskId, status: newStatus ? "completed" : "pending" });
        }
        return { ...s, submitted: true, logs: newLogs };
      }
      return s;
    }));

    try {
      await fetch("/api/amal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: studentId,
          user_type: "student",
          date: amalDate,
          logs: { [taskId]: newStatus ? "completed" : "pending" }
        })
      });
    } catch (err) {
      console.error("Failed to save student amal log:", err);
      // Revert on error
      fetchStudentAmalData();
    }
  };

  const fetchAmalData = async () => {
    try {
      const [tasksRes, logsRes] = await Promise.all([
        fetch("/api/amal-tasks?target=teacher"),
        fetch(`/api/amal-logs?user_id=${teacher.id}&date=${amalDate}`)
      ]);
      
      if (!tasksRes.ok) throw new Error(`Tasks fetch failed: ${tasksRes.status}`);
      if (!logsRes.ok) throw new Error(`Logs fetch failed: ${logsRes.status}`);

      const tasks = await tasksRes.json();
      const logs = await logsRes.json();
      setAmalTasks(Array.isArray(tasks) ? tasks : []);
      const logMap: Record<string, boolean> = {};
      let submitted = false;
      if (Array.isArray(logs)) {
        logs.forEach((log: any) => {
          if (log.task_id === "submission_record") {
            submitted = true;
          } else {
            logMap[log.task_id] = log.status === "completed";
          }
        });
      }
      setAmalLogs(logMap);
      setIsAmalSubmitted(submitted);
    } catch (err) {
      console.error("Failed to fetch amal data:", err);
    }
  };

  const toggleAmal = (taskId: string) => {
    if (isAmalSubmitted) return;
    setAmalLogs(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const submitAmal = async () => {
    if (isAmalSubmitted) return;
    setSavingAmal(true);
    try {
      const logsToSave: Record<string, string> = {
        "submission_record": "completed"
      };
      
      amalTasks.forEach(task => {
        logsToSave[task.id] = amalLogs[task.id] ? "completed" : "pending";
      });

      const res = await fetch("/api/amal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: teacher.id,
          user_type: "teacher",
          date: amalDate,
          logs: logsToSave
        })
      });
      
      if (res.ok) {
        setIsAmalSubmitted(true);
      } else {
        alert("আমল সাবমিট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error("Failed to submit amal:", err);
      alert("আমল সাবমিট করতে সমস্যা হয়েছে।");
    } finally {
      setSavingAmal(false);
    }
  };

  const handleLogin = async (e: React.FormEvent | null, loginIdentifier: string = identifier) => {
    if (e) e.preventDefault();
    if (!loginIdentifier) return;
    
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/teacher-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "শিক্ষক খুঁজে পাওয়া যায়নি");
      }
      const data = await response.json();
      setTeacher(data);
      localStorage.setItem("teacherPhone", loginIdentifier);
      
      // Fetch related data
      const [attRes, noticeRes] = await Promise.all([
        fetch(`/api/admin/teacher-attendance?teacher_id=${data.id}`),
        fetch("/api/notices")
      ]);
      
      if (attRes.ok) setAttendance(await attRes.json());
      if (noticeRes.ok) setNotices(await noticeRes.json());
    } catch (err: any) {
      setError(err.message);
      localStorage.removeItem("teacherPhone");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("teacherPhone");
    setTeacher(null);
    setIdentifier("");
  };

  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <User className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">শিক্ষক পোর্টাল</h2>
            <p className="text-slate-500 font-medium">আপনার একাউন্টে প্রবেশ করতে লগইন করুন</p>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                মোবাইল নম্বর, ইমেইল বা আইডি কোড
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="যেমন: 01712345678"
                  required
                />
                <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-rose-100"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>লগইন করুন <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">শিক্ষক পোর্টাল</h1>
            <p className="text-slate-500 font-medium">স্বাগতম, {teacher.name}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all shadow-sm border border-rose-100 self-start"
          >
            <LogOut className="w-4 h-4" /> লগ আউট
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-3 mb-10 pb-2 scrollbar-hide">
          {[
            { id: "overview", label: "একনজরে", icon: LayoutDashboard },
            { id: "amal", label: "দৈনিক আমল", icon: Heart },
            { id: "student-amal", label: "ছাত্রের আমল", icon: Users },
            { id: "attendance", label: "হাজিরা", icon: CheckCircle2 },
            { id: "notices", label: "নোটিশ", icon: Bell },
          ].map((tab: any) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all whitespace-nowrap border",
                activeTab === tab.id 
                  ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 border-emerald-900" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === "notices" && notices.some(n => {
                const noticeDate = new Date(n.created_at);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return noticeDate >= yesterday;
              }) && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 shadow-sm border-2 border-white z-10 animate-pulse"></span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teacher Profile Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 sticky top-24"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 mb-8 border-4 border-emerald-50">
                  <img 
                    src={teacher.photo_url || `https://ui-avatars.com/api/?name=${teacher.name}`} 
                    alt={teacher.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{teacher.name}</h3>
                <p className="text-emerald-700 font-black text-lg mb-8 bg-emerald-50 px-6 py-2 rounded-full">{teacher.qualification}</p>
                
                <div className="w-full space-y-5 pt-8 border-t border-slate-100 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">আইডি কোড</span>
                    <span className="font-black text-slate-900">{teacher.id_code || teacher.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">ফোন</span>
                    <span className="font-black text-slate-900">{teacher.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">ইমেইল</span>
                    <span className="font-black text-slate-900">{teacher.email || "-"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-600" /> আজকের আমল স্ট্যাটাস
                    </h3>
                    <div className="flex items-center gap-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Heart className="w-8 h-8 text-emerald-600 fill-current" />
                       </div>
                       <div>
                          <p className="text-sm text-emerald-800 font-bold">আপনি আজকের আমলগুলো সম্পন্ন করেছেন?</p>
                          <button onClick={() => setActiveTab("amal")} className="text-emerald-600 font-black text-xs mt-1 underline">আমল চেক করুন</button>
                       </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-emerald-600" /> সাম্প্রতিক নোটিশ
                    </h3>
                    <div className="space-y-4">
                      {notices.slice(0, 3).map((notice) => (
                        <div key={notice.id} className="p-4 border border-slate-50 bg-slate-50/50 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <Bell className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">{notice.title}</h4>
                              <p className="text-[10px] text-slate-400 font-bold">{notice.date}</p>
                            </div>
                          </div>
                          <button onClick={() => setActiveTab("notices")} className="text-emerald-600 font-bold text-xs">দেখুন</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "amal" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">দৈনিক আমল</h3>
                        <p className="text-slate-500 font-bold">আপনার আমলগুলো প্রতিদিন রেকর্ড করুন</p>
                      </div>
                      <input 
                        type="date" 
                        value={amalDate}
                        max={new Date().toLocaleDateString('en-CA')}
                        onChange={(e) => setAmalDate(e.target.value)}
                        className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                      />
                    </div>

                    {amalTasks.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">কোন আমল সেট করা নেই</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {amalTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleAmal(task.id)}
                            disabled={isAmalSubmitted}
                            className={cn(
                              "p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group",
                              amalLogs[task.id]
                                ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-900/10"
                                : "bg-white border-slate-100",
                              !isAmalSubmitted && !amalLogs[task.id] && "hover:border-emerald-200",
                              isAmalSubmitted && "opacity-70 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-4 rounded-2xl transition-all",
                                amalLogs[task.id] ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400",
                                !isAmalSubmitted && !amalLogs[task.id] && "group-hover:bg-emerald-100 group-hover:text-emerald-500"
                              )}>
                                <Heart className="w-6 h-6 fill-current" />
                              </div>
                              <div>
                                <h4 className={cn(
                                  "font-black text-lg transition-all",
                                  amalLogs[task.id] ? "text-emerald-900" : "text-slate-700"
                                )}>{task.title}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  {amalLogs[task.id] ? "সম্পন্ন হয়েছে" : "বাকি আছে"}
                                </p>
                              </div>
                            </div>
                            <div className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                              amalLogs[task.id] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent"
                            )}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {amalTasks.length > 0 && (
                      <div className="mt-8 flex flex-col items-center justify-center border-t border-slate-100 pt-8">
                        {isAmalSubmitted ? (
                          <div className="flex items-center gap-3 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                            <span>এই দিনের আমল সাবমিট করা হয়েছে</span>
                          </div>
                        ) : (
                          <button
                            onClick={submitAmal}
                            disabled={savingAmal}
                            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3 disabled:opacity-70"
                          >
                            {savingAmal ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            আমল সাবমিট করুন
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "student-amal" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">ছাত্রদের আমল</h3>
                        <p className="text-slate-500 font-bold">ছাত্রদের আমলগুলো দেখুন ও টিক দিন</p>
                      </div>
                      <div className="flex gap-4">
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                        >
                          <option value="সব">সব শ্রেণী</option>
                          {settings?.classes?.map((c: string) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <input 
                          type="date" 
                          value={amalDate}
                          max={new Date().toLocaleDateString('en-CA')}
                          onChange={(e) => setAmalDate(e.target.value)}
                          className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-6 text-sm font-black text-slate-600 uppercase tracking-wider">ছাত্রের নাম</th>
                            <th className="p-6 text-sm font-black text-slate-600 uppercase tracking-wider">আমলসমূহ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fetchingStatus ? (
                            <tr>
                              <td colSpan={2} className="p-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                              </td>
                            </tr>
                          ) : submissionStatus.length > 0 ? submissionStatus.map((student) => (
                            <tr key={student.userId} className="hover:bg-slate-50 transition-colors">
                              <td className="p-6">
                                <p className="font-black text-slate-900">{student.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">ID: {student.userId} | {student.class}</p>
                              </td>
                              <td className="p-6">
                                <div className="flex flex-wrap gap-2">
                                  {studentTasks.map(task => {
                                    const log = student.logs.find((l: any) => l.task_id === task.id);
                                    const isCompleted = log?.status === "completed";
                                    return (
                                      <button
                                        key={task.id}
                                        onClick={() => toggleStudentAmal(student.userId, task.id, isCompleted)}
                                        className={cn(
                                          "px-3 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2",
                                          isCompleted 
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" 
                                            : "bg-white text-slate-400 border-slate-100 hover:border-emerald-200"
                                        )}
                                      >
                                        {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                                        {task.title}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={2} className="p-12 text-center text-slate-400 font-bold">কোনো ছাত্র পাওয়া যায়নি</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "attendance" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">হাজিরা রিপোর্ট</h3>
                  <div className="space-y-4">
                    {attendance.length > 0 ? attendance.map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                            log.status === 'present' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {log.status === 'present' ? "P" : "A"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{log.status === 'present' ? "উপস্থিত" : "অনুপস্থিত"}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.date}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">এখনো কোন হাজিরা লগ পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "notices" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                          <Bell className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900">{notice.title}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{notice.date}</p>
                        </div>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed mb-6">{notice.content}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
