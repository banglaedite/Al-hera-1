import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { 
  UserPlus, 
  Search, 
  CreditCard, 
  LayoutDashboard, 
  ArrowRight,
  GraduationCap,
  Users,
  Calendar,
  CheckCircle2,
  Heart,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "./ToastContext";

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 flex items-center gap-5 hover:shadow-2xl transition-all duration-300"
  >
    <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, description, to, color }: any) => (
  <Link to={to} className="group h-full">
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-3xl shadow-lg shadow-slate-200/30 border border-slate-100 hover:border-emerald-300 hover:shadow-2xl transition-all duration-500 h-full flex flex-col"
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm mb-8 flex-grow leading-relaxed">{description}</p>
      <div className="flex items-center text-emerald-700 font-bold text-sm group-hover:translate-x-2 transition-transform">
        শুরু করুন <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </motion.div>
  </Link>
);

export default function DashboardHome() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [rankingCriteria, setRankingCriteria] = useState<"amal" | "result" | "attendance">("amal");
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/top-students?type=${rankingCriteria}`)
      .then(res => res.json())
      .then(setTopStudents)
      .catch(console.error);
  }, [rankingCriteria]);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load settings");
        return res.json();
      })
      .then(setSettings)
      .catch(err => {
        console.error("Failed to load settings:", err);
        addToast("সাইট সেটিংস লোড করতে সমস্যা হয়েছে", "error");
      });
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-900 to-emerald-700 text-white p-12 md:p-20 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-sm font-bold mb-8">
              স্বাগতম আল হেরা মাদ্রাসায়
            </span>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-8 tracking-tight">
              আধুনিক ও দ্বীনি শিক্ষার এক অনন্য সমন্বয়
            </h1>
            <p className="text-emerald-50 text-lg mb-10 leading-relaxed max-w-lg">
              আমরা আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ এবং নৈতিক চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ। আমাদের ডিজিটাল ম্যানেজমেন্ট সিস্টেমের মাধ্যমে এখন সবকিছুই আরও সহজ।
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admission" className="px-8 py-4 bg-white text-emerald-900 rounded-full font-black hover:bg-emerald-50 transition-all shadow-lg hover:shadow-emerald-900/20">
                ভর্তি আবেদন করুন
              </Link>
              {settings.enable_recruitment && (
                <a href="/recruitment" className="px-8 py-4 bg-emerald-600 text-white rounded-full font-black hover:bg-emerald-500 transition-all border border-emerald-500">
                  সিভি জমা দিন
                </a>
              )}
              <Link to="/parent" className="px-8 py-4 bg-emerald-800/50 backdrop-blur-sm text-white rounded-full font-black hover:bg-emerald-800 transition-all border border-emerald-600">
                অভিভাবক লগইন
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <GraduationCap className="w-full h-full -rotate-12 translate-x-1/4" />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="মোট ছাত্র" value="৪৫০+" color="bg-blue-500" />
        <StatCard icon={GraduationCap} label="মোট শিক্ষক" value="২৫+" color="bg-emerald-500" />
        <StatCard icon={CheckCircle2} label="সাফল্যের হার" value="৯৮%" color="bg-amber-500" />
        <StatCard icon={Calendar} label="প্রতিষ্ঠা সাল" value="২০১০" color="bg-rose-500" />
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">দ্রুত সেবা সমূহ</h2>
            <p className="text-slate-500 mt-2">আপনার প্রয়োজনীয় সেবাটি বেছে নিন</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(() => {
            const actions = [
              { id: 'admission', icon: UserPlus, title: "অনলাইন ভর্তি", description: "নতুন ছাত্র ভর্তির জন্য অনলাইনে আবেদন করুন এবং ফি জমা দিন।", to: "/admission", color: "bg-emerald-600" },
              { id: 'portal', icon: LayoutDashboard, title: "ছাত্র/অভিভাবক পোর্টাল", description: "হাজিরা, রেজাল্ট এবং পেমেন্ট হিস্ট্রি চেক করতে লগইন করুন।", to: "/parent", color: "bg-blue-600" },
              { id: 'donate', icon: Heart, title: "অনলাইন অনুদান", description: "মাদ্রাসার উন্নয়ন ও এতিমদের কল্যাণে আপনার অনুদান প্রদান করুন।", to: "/donate", color: "bg-rose-600" },
              { id: 'admin', icon: ShieldCheck, title: "এডমিন প্যানেল", description: "কর্তৃপক্ষের জন্য হাজিরা, রেজাল্ট এবং হিসাব ব্যবস্থাপনার ড্যাশবোর্ড।", to: "/admin", color: "bg-slate-800" },
            ];
            const orderedActions = settings.button_order 
              ? [...actions].sort((a, b) => settings.button_order.indexOf(a.id) - settings.button_order.indexOf(b.id))
              : actions;
            return orderedActions.map(action => (
              <QuickAction key={action.id} {...action} />
            ));
          })()}
        </div>
      </section>

      {/* Student Ranking */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-slate-900">সেরা ছাত্ররা</h2>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
            {(["amal", "result", "attendance"] as const).map(c => (
              <button 
                key={c}
                onClick={() => setRankingCriteria(c)}
                className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${rankingCriteria === c ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {c === "amal" ? "আমল" : c === "result" ? "রেজাল্ট" : "হাজিরা"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {topStudents.map((student, index) => (
            <div key={student.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 mb-4 overflow-hidden">
                <img src={student.photo_url || `https://picsum.photos/seed/${student.id}/100`} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-black text-slate-900">{student.name}</h3>
              <p className="text-emerald-600 font-bold text-sm mt-1">র‍্যাংক: {index + 1}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
