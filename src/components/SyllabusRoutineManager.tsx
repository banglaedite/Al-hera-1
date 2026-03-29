import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  Link as LinkIcon, 
  Save, 
  X,
  Check,
  FileText
} from "lucide-react";
import { cn } from "../lib/utils";

export default function SyllabusRoutineManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", link: "" });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/syllabus-routines");
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch syllabus/routines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `/api/admin/syllabus-routines/${editingId}` 
        : "/api/admin/syllabus-routines";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchItems();
        setIsAdding(false);
        setEditingId(null);
        setFormData({ title: "", link: "" });
      }
    } catch (err) {
      console.error("Failed to save item:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/syllabus-routines/${id}`, {
        method: "DELETE"
      });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">সিলেবাস ও রুটিন</h2>
          <p className="text-slate-500 font-bold">মাদরাসার সব রুটিন ও সিলেবাস এখান থেকে ম্যানেজ করুন</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus className="w-5 h-5" /> নতুন যোগ করুন
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
              <button 
                onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ title: "", link: "" }); }}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {editingId ? "রুটিন আপডেট করুন" : "নতুন রুটিন যোগ করুন"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">রুটিনের নাম (যেমন: পরীক্ষার রুটিন)</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                    placeholder="রুটিনের নাম লিখুন..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">পিডিএফ বা ড্রাইভ লিঙ্ক</label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                      placeholder="https://..."
                    />
                    <LinkIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-6 h-6" /> {editingId ? "আপডেট করুন" : "সেভ করুন"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => { setEditingId(item.id); setFormData({ title: item.title, link: item.link }); setIsAdding(true); }}
                    className="p-2 hover:bg-amber-50 text-amber-600 rounded-xl transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h4 className="font-black text-lg text-slate-900 mb-2">{item.title}</h4>
              <p className="text-xs font-bold text-slate-400 mb-6 truncate">{item.link}</p>
              
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-50 text-slate-600 py-3 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-4 h-4" /> লিঙ্ক ওপেন করুন
              </a>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">কোন সিলেবাস বা রুটিন যোগ করা হয়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <div className={cn("w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin", className)} />
);
