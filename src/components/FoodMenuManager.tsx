import React, { useState, useEffect } from "react";
import { Plus, Trash2, Utensils, X, Edit } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FoodMenuManager() {
  const [menu, setMenu] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchMenu = () => {
    fetch("/api/food-menu")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenu(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const [customTitle, setCustomTitle] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("সকালের নাস্তা");

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const data: any = Object.fromEntries(formData.entries());
    data.is_active = formData.get("is_active") ? 1 : 0;
    
    if (selectedTitle === "অন্যান্য" && customTitle) {
      data.title = customTitle;
    }
    
    if (editingItem) {
      await fetch(`/api/admin/food-menu/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    } else {
      await fetch("/api/admin/food-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
    }
    
    setSubmitting(false);
    setIsAdding(false);
    setEditingItem(null);
    fetchMenu();
  };

  const handleDelete = async (id: number) => {
    if (confirm("আপনি কি নিশ্চিত?")) {
      await fetch(`/api/admin/food-menu/${id}`, { method: "DELETE" });
      fetchMenu();
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    const predefined = ["সকালের নাস্তা", "দুপুরের খাবার", "রাতের খাবার"];
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
          <h2 className="text-3xl font-black text-slate-900">খাবারের তালিকা</h2>
          <p className="text-slate-500 font-bold">মাদরাসার প্রতিদিনের খাবারের মেনু</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setIsAdding(true); }}
          className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-5 h-5" /> নতুন খাবার
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Utensils className="text-emerald-600" /> {editingItem ? "খাবার এডিট করুন" : "নতুন খাবার যোগ"}
                </h3>
                <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddMenu} className="p-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">কোন বেলার খাবার?</label>
                  <select 
                    name="title" 
                    required 
                    value={selectedTitle}
                    onChange={(e) => {
                      setSelectedTitle(e.target.value);
                      if (e.target.value !== "অন্যান্য") setCustomTitle("");
                    }}
                    className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="সকালের নাস্তা">সকালের নাস্তা</option>
                    <option value="দুপুরের খাবার">দুপুরের খাবার</option>
                    <option value="রাতের খাবার">রাতের খাবার</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <AnimatePresence>
                  {selectedTitle === "অন্যান্য" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                      <label className="text-sm font-bold text-slate-700">বেলার নাম লিখুন</label>
                      <input 
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="যেমন: বিকেলের নাস্তা" 
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">খাবারের ছবির লিংক (URL)</label>
                  <input name="image_url" defaultValue={editingItem?.image_url || ""} placeholder="https://..." className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">খাবারের বিবরণ</label>
                  <textarea name="description" defaultValue={editingItem?.description || ""} required placeholder="যেমন: ভাত, ডাল, মুরগির মাংস..." className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none focus:ring-2 focus:ring-emerald-500 h-24" />
                </div>
                <div className="flex items-center gap-3 px-2">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    defaultChecked={editingItem ? editingItem.is_active !== 0 : true}
                    className="w-5 h-5 accent-emerald-600"
                    value="1"
                  />
                  <label className="text-sm font-bold text-slate-700">সক্রিয় (Active)</label>
                </div>
                <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all disabled:opacity-50">
                  {submitting ? "লোড হচ্ছে..." : editingItem ? "সেভ করুন" : "সেভ করুন"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {menu.map(item => (
          <motion.div whileHover={{ y: -5 }} key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={() => openEdit(item)}
                className="p-3 bg-white/90 backdrop-blur-sm text-blue-500 rounded-2xl shadow-sm hover:bg-blue-50"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-3 bg-white/90 backdrop-blur-sm text-rose-500 rounded-2xl shadow-sm hover:bg-rose-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-6 mt-2">
              {item.image_url ? (
                <div className="w-full h-48 bg-slate-50 rounded-3xl relative z-10 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                  <img 
                    src={item.image_url} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                    alt={item.title}
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-slate-100 rounded-3xl relative z-10 border-4 border-white shadow-md flex items-center justify-center text-slate-400">
                  <Utensils className="w-12 h-12 opacity-20" />
                </div>
              )}
              
              <div className="absolute -bottom-4 -right-2 z-20 bg-emerald-900 text-white px-4 py-2 rounded-xl font-black text-sm shadow-lg transform rotate-[-5deg]">
                {item.title}
              </div>
            </div>

            <div className="pt-6">
              <p className="text-slate-600 font-medium leading-relaxed">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
        
        {menu.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 font-bold">
            কোন খাবারের তালিকা যোগ করা হয়নি
          </div>
        )}
      </div>
    </div>
  );
}
