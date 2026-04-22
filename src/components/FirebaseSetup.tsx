import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2, RefreshCw, Database, Key, Mail, Globe } from "lucide-react";
import { useToast } from "./ToastContext";

export function FirebaseSetup() {
  const { addToast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      if (!res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setStatus(data);
        } catch (e) {
          setStatus({ 
            status: "error", 
            firestore: "disconnected", 
            error: `সার্ভার ত্রুটি (HTTP ${res.status}): ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}` 
          });
        }
        return;
      }
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Error checking status:", error);
      setStatus({ status: "error", firestore: "disconnected", error: "সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    await checkStatus();
    setTesting(false);
    addToast("কানেকশন চেক সম্পন্ন হয়েছে", "info");
  };

  const isConnected = status?.firestore === "connected";

  const [formData, setFormData] = useState({
    projectId: "",
    clientEmail: "",
    privateKey: "",
    databaseId: "(default)",
    password: ""
  });
  const [saving, setSaving] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="relative flex items-center justify-center w-12 h-12 mx-auto">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.clientEmail || !formData.privateKey || !formData.password) {
      addToast("সবগুলো ঘর পূরণ করুন", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/update-firebase-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        addToast("কনফিগারেশন সফলভাবে সেভ হয়েছে", "success");
        checkStatus();
        setFormData({ ...formData, password: "" });
      } else {
        addToast(data.error || "সেভ করতে সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">ফায়ারবেস সেটআপ</h2>
          <p className="text-slate-500 font-bold">ডাটাবেস কানেকশন স্ট্যাটাস এবং কনফিগারেশন</p>
        </div>
        <button 
          onClick={handleTestConnection}
          disabled={testing}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-900 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-all disabled:opacity-50"
        >
          {testing ? <div className="relative flex justify-center items-center w-5 h-5">
  <div className="absolute inset-0 rounded-full border-2 border-emerald-100/30"></div>
  <div className="absolute inset-0 rounded-full border-t-2 border-t-emerald-500 border-b-2 border-b-rose-500 animate-spin"></div>
</div> : <RefreshCw className="w-5 h-5" />}
          পুনরায় চেক করুন
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Status Card */}
          <div className={`p-8 rounded-[2.5rem] border-2 ${isConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${isConnected ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {isConnected ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">স্ট্যাটাস</h3>
                <p className={`font-bold ${isConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isConnected ? "সফলভাবে সংযুক্ত" : "সংযুক্ত নয়"}
                </p>
              </div>
            </div>

            {status?.error && (
              <div className="bg-white/50 p-4 rounded-2xl border border-rose-200 mb-6">
                <p className="text-rose-600 text-xs font-bold font-mono break-all leading-relaxed">{status.error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">সার্ভার:</span>
                <span className="text-slate-900 font-black uppercase">{status?.status || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-bold">ডাটাবেস:</span>
                <span className={`font-black uppercase ${isConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {status?.firestore || "Disconnected"}
                </span>
              </div>
            </div>
          </div>

          {/* Current Config Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              বর্তমান কানেকশন
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project ID</p>
                  <p className="text-sm font-black text-slate-900 truncate">{status?.config?.projectId || "Not Set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client Email</p>
                  <p className="text-sm font-black text-slate-900 truncate">{status?.config?.clientEmail || "Not Set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Private Key</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${status?.config?.hasPrivateKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <p className="text-sm font-black text-slate-900">
                      {status?.config?.hasPrivateKey ? "Active" : "Missing"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Setup Form */}
          <form onSubmit={handleSave} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">নতুন কনফিগারেশন</h3>
                <p className="text-sm text-slate-500 font-bold">আপনার ফায়ারবেস ক্রেডেনশিয়াল আপডেট করুন</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Project ID</label>
                <input 
                  type="text"
                  value={formData.projectId}
                  onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                  placeholder="my-project-id"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Database ID</label>
                <input 
                  type="text"
                  value={formData.databaseId}
                  onChange={(e) => setFormData({...formData, databaseId: e.target.value})}
                  placeholder="(default)"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Client Email</label>
                <input 
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="firebase-adminsdk-xxx@project.iam.gserviceaccount.com"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Private Key</label>
                <textarea 
                  rows={4}
                  value={formData.privateKey}
                  onChange={(e) => setFormData({...formData, privateKey: e.target.value})}
                  placeholder="-----BEGIN PRIVATE KEY-----\n..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold font-mono text-xs transition-all resize-none"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">এডমিন পাসওয়ার্ড</label>
                <input 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="সেভ করার জন্য পাসওয়ার্ড দিন"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? <div className="relative flex justify-center items-center w-5 h-5">
  <div className="absolute inset-0 rounded-full border-2 border-emerald-100/30"></div>
  <div className="absolute inset-0 rounded-full border-t-2 border-t-emerald-500 border-b-2 border-b-rose-500 animate-spin"></div>
</div> : <CheckCircle2 className="w-6 h-6" />}
              Save and Connect
            </button>
          </form>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldCheck className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            কিভাবে ক্রেডেনশিয়াল পাবেন?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 text-slate-300 font-bold">
              <p className="text-white text-lg">ধাপ ১: Firebase Console</p>
              <ul className="list-decimal list-inside space-y-3 ml-2">
                <li>Firebase Console-এ যান এবং প্রজেক্ট সিলেক্ট করুন।</li>
                <li>Project Settings (গিয়ার আইকন) থেকে <span className="text-white">Service Accounts</span> ট্যাবে যান।</li>
                <li><span className="text-white">Generate New Private Key</span> বাটনে ক্লিক করুন।</li>
                <li>একটি JSON ফাইল ডাউনলোড হবে।</li>
              </ul>
            </div>
            <div className="space-y-4 text-slate-300 font-bold">
              <p className="text-white text-lg">ধাপ ২: তথ্য ইনপুট</p>
              <ul className="list-decimal list-inside space-y-3 ml-2">
                <li>JSON ফাইল থেকে <span className="text-white">project_id</span> কপি করে এখানে বসান।</li>
                <li><span className="text-white">client_email</span> কপি করে এখানে বসান।</li>
                <li><span className="text-white">private_key</span> পুরোটা (কোটেশন ছাড়া) কপি করে এখানে বসান।</li>
                <li>সবশেষে এডমিন পাসওয়ার্ড দিয়ে <span className="text-white">Save and Connect</span> করুন।</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
