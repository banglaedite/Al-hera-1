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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isConnected = status?.firestore === "connected";

  return (
    <div className="space-y-8">
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
          {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          পুনরায় চেক করুন
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Card */}
        <div className={`p-8 rounded-[2.5rem] border-2 ${isConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-2xl ${isConnected ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {isConnected ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">কানেকশন স্ট্যাটাস</h3>
              <p className={`font-bold ${isConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isConnected ? "সফলভাবে সংযুক্ত" : "সংযুক্ত নয়"}
              </p>
            </div>
          </div>

          {status?.error && (
            <div className="bg-white/50 p-4 rounded-2xl border border-rose-200 mb-6">
              <p className="text-rose-600 text-sm font-bold font-mono break-all">{status.error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-bold">সার্ভার স্ট্যাটাস:</span>
              <span className="text-slate-900 font-black uppercase">{status?.status || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-bold">ডাটাবেস কানেকশন:</span>
              <span className={`font-black uppercase ${isConnected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {status?.firestore || "Disconnected"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-bold">ডাটা এভেইলেবল:</span>
              <span className="text-slate-900 font-black">{status?.data ? "হ্যাঁ" : "না"}</span>
            </div>
          </div>
        </div>

        {/* Config Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            বর্তমান কনফিগারেশন
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Globe className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project ID</p>
                <p className="text-sm font-black text-slate-900 truncate">{status?.config?.projectId || "Not Set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Mail className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Email</p>
                <p className="text-sm font-black text-slate-900 truncate">{status?.config?.clientEmail || "Not Set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Key className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Private Key</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status?.config?.hasPrivateKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <p className="text-sm font-black text-slate-900">
                    {status?.config?.hasPrivateKey ? "সেট করা আছে" : "সেট করা নেই"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Database className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database ID</p>
                <p className="text-sm font-black text-slate-900">{status?.config?.databaseId || "(default)"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
        <h3 className="text-xl font-black mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-amber-400" />
          কিভাবে ঠিক করবেন?
        </h3>
        <div className="space-y-4 text-slate-300 font-bold">
          <p>যদি কানেকশন "সংযুক্ত নয়" দেখায়, তবে নিচের ধাপগুলো অনুসরণ করুন:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Firebase Console থেকে আপনার <span className="text-white">Service Account JSON</span> ফাইলটি চেক করুন।</li>
            <li>Project ID এবং Client Email সঠিক আছে কি না নিশ্চিত করুন।</li>
            <li>Private Key টি সঠিকভাবে কপি করা হয়েছে কি না দেখুন।</li>
            <li>Vercel-এ ডেপ্লয় করার সময় কোনো এরর আসছে কি না তা চেক করুন।</li>
          </ul>
          <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/10">
            <p className="text-sm italic">টিপস: আপনি যদি নতুন কোনো Firebase প্রজেক্ট ব্যবহার করতে চান, তবে আমাকে (AI) বলুন, আমি কোড আপডেট করে দেব।</p>
          </div>
        </div>
      </div>
    </div>
  );
}
