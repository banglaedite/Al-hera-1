import React, { useState, useEffect } from "react";
import { Plus, Trash2, FileText, X, Edit, Link as LinkIcon, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function RoutineManager() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("বাসায় পড়ার রুটিন");

  const fetchRoutines = () => {
    fetch("/api/routines")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRoutines(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRoutines();
  }, []);

  const handleAddRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    
    if (selectedTitle === "অন্যান্য" && customTitle) {
      data.title = customTitle;
    } else {
      data.title = selectedTitle;
    }
    
    if (editingItem) {
      await fetch(`/api/admin/routines/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      await fetch("/api/admin/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
    
    setSubmitting(false);
    setIsAdding(false);
    setEditingItem(null);
    fetchRoutines();
  };

  const handleDelete = async (id: string) => {
    if (confirm("আপনি কি নিশ্চিত?")) {
      await fetch(`/api/admin/routines/${id}`, { method: "DELETE" });
      fetchRoutines();
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    const predefined = ["বাসায় পড়ার রুটিন", "ক্লাস রুটিন", "পরীক্ষার রুটিন"];
    if (predefined.includes(item.title)) {
      setSelectedTitle(item.title);
      setCustomTitle("");
    } else {
      setSelectedTitle("অন্যান্য");
      setCustomTitle(item.title);
    }
    setIsAdding(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">সিলেবাস ও রুটিন</h2>
          <p className="text-slate-500 font-bold">মাদরাসার বিভিন্ন রুটিন ও সিলেবাস ম্যানেজমেন্ট</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsAdding(true); setSelectedTitle("বাসায় পড়ার রুটিন"); setCustomTitle(""); }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" /> নতুন রুটিন
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <FileText className="text-indigo-600" /> {editingItem ? "রুটিন এডিট করুন" : "নতুন রুটিন যোগ"}
                </h3>
                <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddRoutine} className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">রুটিনের ধরন</label>
                  <select 
                    required 
                    value={selectedTitle}
                    onChange={(e) => {
                      setSelectedTitle(e.target.value);
                      if (e.target.value !== "অন্যান্য") setCustomTitle("");
                    }}
                    className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="বাসায় পড়ার রুটিন">বাসায় পড়ার রুটিন</option>
                    <option value="ক্লাস রুটিন">ক্লাস রুটিন</option>
                    <option value="পরীক্ষার রুটিন">পরীক্ষার রুটিন</option>
                    <option value="অন্যান্য">অন্যান্য (+ নতুন নাম)</option>
                  </select>
                </div>

                <AnimatePresence>
                  {selectedTitle === "অন্যান্য" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                      <label className="text-sm font-bold text-slate-700">রুটিনের নাম লিখুন</label>
                      <input 
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="যেমন: রমজানের রুটিন" 
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">পিডিএফ বা ড্রাইভ লিংক (URL)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      name="link_url" 
                      required
                      defaultValue={editingItem?.link_url || ""} 
                      placeholder="https://drive.google.com/..." 
                      className="w-full p-4 pl-12 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {submitting ? "লোড হচ্ছে..." : editingItem ? "আপডেট করুন" : "সেভ করুন"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map(item => (
          <motion.div 
            layout
            key={item.id} 
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-xs text-slate-400 font-bold truncate mb-4">{item.link_url}</p>
            <a 
              href={item.link_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              <LinkIcon className="w-4 h-4" /> ভিউ রুটিন
            </a>
          </motion.div>
        ))}

        {routines.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">কোন রুটিন বা সিলেবাস যোগ করা হয়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
