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

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, description, to, color }: any) => (
  <Link to={to} className="group">
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all h-full flex flex-col">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 flex-grow">{description}</p>
      <div className="flex items-center text-emerald-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
        শুরু করুন <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </div>
  </Link>
);

export default function DashboardHome() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch("/api/site-settings").then(res => res.json()).then(setSettings);
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-900 text-white p-12 md:p-20">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-800 text-emerald-100 text-sm font-semibold mb-6">
              স্বাগতম আল হেরা মাদ্রাসায়
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              আধুনিক ও দ্বীনি শিক্ষার এক অনন্য সমন্বয়
            </h1>
            <p className="text-emerald-100/80 text-lg mb-8 leading-relaxed">
              আমরা আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ এবং নৈতিক চরিত্র গঠনে প্রতিশ্রুতিবদ্ধ। আমাদের ডিজিটাল ম্যানেজমেন্ট সিস্টেমের মাধ্যমে এখন সবকিছুই আরও সহজ।
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/admission" className="px-8 py-4 bg-white text-emerald-900 rounded-full font-bold hover:bg-emerald-50 transition-colors">
                ভর্তি আবেদন করুন
              </Link>
              {settings.enable_recruitment && (
                <a href="/recruitment" className="px-8 py-4 bg-emerald-700 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors border border-emerald-600">
                  সিভি জমা দিন
                </a>
              )}
              <Link to="/parent" className="px-8 py-4 bg-emerald-800 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors border border-emerald-700">
                অভিভাবক লগইন
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
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
          <QuickAction 
            icon={UserPlus} 
            title="অনলাইন ভর্তি" 
            description="নতুন ছাত্র ভর্তির জন্য অনলাইনে আবেদন করুন এবং ফি জমা দিন।"
            to="/admission"
            color="bg-emerald-600"
          />
          <QuickAction 
            icon={LayoutDashboard} 
            title="ছাত্র/অভিভাবক পোর্টাল" 
            description="হাজিরা, রেজাল্ট এবং পেমেন্ট হিস্ট্রি চেক করতে লগইন করুন।"
            to="/parent"
            color="bg-blue-600"
          />
          <QuickAction 
            icon={Heart} 
            title="অনলাইন অনুদান" 
            description="মাদ্রাসার উন্নয়ন ও এতিমদের কল্যাণে আপনার অনুদান প্রদান করুন।"
            to="/donate"
            color="bg-rose-600"
          />
          <QuickAction 
            icon={ShieldCheck} 
            title="এডমিন প্যানেল" 
            description="কর্তৃপক্ষের জন্য হাজিরা, রেজাল্ট এবং হিসাব ব্যবস্থাপনার ড্যাশবোর্ড।"
            to="/admin"
            color="bg-slate-800"
          />
        </div>
      </section>
    </div>
  );
}
