import React, { useState } from "react";
import { Trash2, RefreshCcw, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function DatabaseResetManager() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [confirmAction, setConfirmAction] = useState<{ type: 'reset' | 'recover' | 'permanent', message: string } | null>(null);

  const executeAction = async () => {
    if (!confirmAction) return;
    if (!password) {
      setMessage({ text: "পাসওয়ার্ড দিন", type: "error" });
      return;
    }
    
    setLoading(true);
    setMessage({ text: "", type: "" });
    const actionType = confirmAction.type;
    setConfirmAction(null);

    try {
      const endpoint = actionType === 'reset' ? '/api/admin/database/reset' :
                       actionType === 'recover' ? '/api/admin/database/recover' :
                       '/api/admin/database/permanent-delete';
                       
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      
      if (data.success) {
        if (actionType === 'reset') {
          setMessage({ text: "সফলভাবে সকল ডেটা ট্র্যাশে পাঠানো হয়েছে। অ্যাপ এখন সম্পূর্ণ নতুন।", type: "success" });
          setTimeout(() => window.location.reload(), 2000);
        } else if (actionType === 'recover') {
          setMessage({ text: "সফলভাবে সকল ডেটা পুনরুদ্ধার করা হয়েছে।", type: "success" });
          setTimeout(() => window.location.reload(), 2000);
        } else {
          setMessage({ text: "সফলভাবে সকল ডেটা চিরতরে মুছে ফেলা হয়েছে।", type: "success" });
          setPassword("");
        }
      } else {
        setMessage({ text: data.error || "ভুল পাসওয়ার্ড", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "সমস্যা হয়েছে।", type: "error" });
    }
    setLoading(false);
  };

  const handleReset = () => {
    setMessage({ text: "", type: "" });
    setConfirmAction({ type: 'reset', message: "আপনি কি নিশ্চিত? এটি সকল ডেটা ট্র্যাশে পাঠিয়ে দিবে এবং অ্যাপ নতুন করে শুরু হবে।" });
  };

  const handleRecover = () => {
    setMessage({ text: "", type: "" });
    setConfirmAction({ type: 'recover', message: "আপনি কি নিশ্চিত? এটি ট্র্যাশ থেকে সকল ডেটা পুনরুদ্ধার করবে।" });
  };

  const handlePermanentDelete = () => {
    setMessage({ text: "", type: "" });
    setConfirmAction({ type: 'permanent', message: "সতর্কতা: এটি ট্র্যাশ থেকে সকল ডেটা চিরতরে মুছে ফেলবে। এটি আর পুনরুদ্ধার করা সম্ভব নয়। আপনি কি নিশ্চিত?" });
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-rose-100 mt-8 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-rose-900">ডেটাবেস রিসেট (All Delete)</h3>
          <p className="text-slate-600 font-bold text-sm">বছরের শুরুতে সবকিছু মুছে নতুন করে শুরু করার জন্য</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-2xl font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleReset}
            disabled={loading}
            className="p-4 bg-orange-100 text-orange-700 rounded-2xl font-black hover:bg-orange-200 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Trash2 className="w-6 h-6" />
            সব ট্র্যাশে পাঠান (রিসেট)
          </button>
          
          <button 
            onClick={handleRecover}
            disabled={loading}
            className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black hover:bg-emerald-200 transition-all flex flex-col items-center justify-center gap-2"
          >
            <RefreshCcw className="w-6 h-6" />
            ট্র্যাশ থেকে রিকভার করুন
          </button>

          <button 
            onClick={handlePermanentDelete}
            disabled={loading}
            className="p-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all flex flex-col items-center justify-center gap-2 shadow-lg shadow-rose-200"
          >
            <Trash2 className="w-6 h-6" />
            ট্র্যাশ চিরতরে মুছুন
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900">নিশ্চিত করুন</h3>
              </div>
              <p className="text-slate-600 font-bold mb-6">{confirmAction.message}</p>
              
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="এডমিন পাসওয়ার্ড দিন"
                className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-rose-500 outline-none font-bold mb-8 text-center"
                autoFocus
              />

              <div className="flex gap-4">
                <button onClick={() => { setConfirmAction(null); setPassword(""); }} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">বাতিল</button>
                <button onClick={executeAction} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">হ্যাঁ, নিশ্চিত</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
