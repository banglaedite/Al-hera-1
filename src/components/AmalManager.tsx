import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, X, Edit, Loader2, Target, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "./ToastContext";

export function AmalManager() {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/admin/amal-tasks");
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      title: formData.get("title"),
      target: formData.get("target"),
      is_active: true
    };

    try {
      const url = editingItem ? `/api/admin/amal-tasks/${editingItem.id}` : "/api/admin/amal-tasks";
      const method = editingItem ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        addToast(editingItem ? "আমল আপডেট হয়েছে" : "নতুন আমল যোগ হয়েছে", "success");
        setIsAdding(false);
        setEditingItem(null);
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
      addToast("সমস্যা হয়েছে", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই আমলটি ডিলিট করতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/amal-tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        addToast("আমল ডিলিট হয়েছে", "success");
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">দৈনিক আমল ম্যানেজমেন্ট</h2>
          <p className="text-slate-500 font-bold">ছাত্র ও ওস্তাদদের জন্য আমল সেট করুন</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsAdding(true); }}
          className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> নতুন আমল যোগ করুন
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Target className="text-emerald-600" /> {editingItem ? "আমল এডিট করুন" : "নতুন আমল"}
                </h3>
                <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">আমলের নাম (যেমন: ৫ ওয়াক্ত নামাজ, জিকির)</label>
                  <input 
                    name="title"
                    required
                    defaultValue={editingItem?.title || ""}
                    placeholder="আমলের নাম লিখুন" 
                    className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">কাদের জন্য?</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={cn(
                      "flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold",
                      "hover:bg-slate-50"
                    )}>
                      <input type="radio" name="target" value="student" defaultChecked={editingItem?.target !== "teacher"} className="hidden peer" />
                      <div className="flex items-center gap-2 peer-checked:text-emerald-600">
                        <Users className="w-5 h-5" /> ছাত্র
                      </div>
                    </label>
                    <label className={cn(
                      "flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold",
                      "hover:bg-slate-50"
                    )}>
                      <input type="radio" name="target" value="teacher" defaultChecked={editingItem?.target === "teacher"} className="hidden peer" />
                      <div className="flex items-center gap-2 peer-checked:text-emerald-600">
                        <User className="w-5 h-5" /> ওস্তাদ
                      </div>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {submitting ? "লোড হচ্ছে..." : editingItem ? "আপডেট করুন" : "সেভ করুন"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <motion.div 
            layout
            key={task.id} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "p-3 rounded-2xl",
                task.target === "teacher" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {task.target === "teacher" ? <User className="w-6 h-6" /> : <Users className="w-6 h-6" />}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingItem(task); setIsAdding(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(task.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{task.title}</h3>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                task.target === "teacher" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              )}>
                {task.target === "teacher" ? "ওস্তাদ" : "ছাত্র"}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                সক্রিয়
              </span>
            </div>
          </motion.div>
        ))}

        {tasks.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">কোন আমল যোগ করা হয়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
