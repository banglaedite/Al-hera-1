import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Users, 
  ShieldCheck,
  Heart,
  LayoutDashboard,
  Menu,
  X,
  Phone,
  MessageSquare,
  Facebook,
  ChevronRight,
  Star,
  CheckCircle2,
  Award,
  Lightbulb,
  Globe,
  Clock,
  Calendar,
  Utensils
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

function TypingTitle({ text }: { text: string }) {
  return (
    <div className="relative inline-block w-full h-[1.2em]">
      <svg viewBox="0 0 500 100" className="w-full h-full">
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <mask id="textMask">
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-6xl font-black fill-white">
              {text}
            </text>
          </mask>
        </defs>
        
        {/* Stroke Outline */}
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-6xl font-black fill-transparent stroke-slate-200 stroke-[2px]">
          {text}
        </text>
        
        {/* Wave Fill Animation */}
        <motion.rect
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          x="0" y="0" width="500" height="100"
          fill="url(#waveGradient)"
          mask="url(#textMask)"
        />
      </svg>
    </div>
  );
}

// Icon mapping for dynamic rendering
const iconMap: any = {
  BookOpen, Users, ShieldCheck, Heart, Star, Award, Lightbulb, Globe, Clock, Calendar, GraduationCap
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [foodMenu, setFoodMenu] = useState<any[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in and redirect
    if (localStorage.getItem("isAdmin") === "true") {
      navigate("/secret-admin-access");
      return;
    } else if (localStorage.getItem("guardianPhone")) {
      navigate("/parent");
      return;
    }

    const fetchWithTimeout = (url: string, timeout = 15000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
    };

    fetchWithTimeout("/api/site-settings")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.title) {
          setSettings(data);
        } else {
          throw new Error("Invalid settings data");
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setSettings({
          title: 'আল হেরা মাদরাসা',
          description: 'আমাদের মাদরাসায় আপনাকে স্বাগতম।',
          hero_image: 'https://picsum.photos/seed/madrasa/1920/1080',
          contact_phone: '01700000000',
          whatsapp_number: '01700000000',
          facebook_url: '#',
          announcement: 'স্বাগতম',
          logo_url: null
        });
      });

    fetchWithTimeout("/api/features")
      .then((res) => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeatures(data.filter((f: any) => f.is_active !== 0));
        } else {
          console.error("Failed to load features:", data);
        }
      })
      .catch((err) => console.error("Failed to load features:", err));

    fetchWithTimeout("/api/food-menu")
      .then((res) => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFoodMenu(data);
        }
      })
      .catch((err) => console.error("Failed to load food menu:", err));

    fetchWithTimeout("/api/showcase-items")
      .then((res) => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setShowcaseItems(data);
        }
      })
      .catch((err) => console.error("Failed to load showcase items:", err));
  }, []);

  if (!settings) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-emerald-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative bg-white font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      {/* Top Menu */}
      <div className="absolute top-4 right-4 z-50">
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-slate-100 text-emerald-900 hover:bg-emerald-50 transition-all"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="p-2 space-y-1">
                  <Link 
                    to="/admission" 
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-all"
                  >
                    <Users className="w-4 h-4" />
                    ভর্তি আবেদন
                  </Link>
                  <Link 
                    to="/parent" 
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    লগইন
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-white">
          <div className="absolute inset-0 opacity-20">
            <img 
              src={settings.hero_image || 'https://picsum.photos/seed/madrasa/1920/1080'} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              alt="Hero"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white" />
          
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.15] pointer-events-none" 
               style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23064e3b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
          />

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`hero-particle-${i}`}
              className="absolute bg-emerald-500/20 rounded-full pointer-events-none"
              style={{
                width: Math.random() * 80 + 20,
                height: Math.random() * 80 + 20,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.random() * 40 - 20, 0],
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 8 + 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          
           {/* Subtle Accents */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-100/50 rounded-full blur-[150px] mix-blend-multiply pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-100/50 rounded-full blur-[120px] mix-blend-multiply pointer-events-none" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pt-2 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Logo */}
            {settings.logo_url && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-12 block relative mx-auto w-fit"
              >
                {/* Neon Light Effect */}
                {Boolean(settings.enable_neon_light) && (
                  <div 
                    className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-[120%] h-8 rounded-[100%] blur-2xl opacity-40 z-0 ${
                      settings.neon_light_effect === 'pulse' ? 'animate-pulse' : 
                      settings.neon_light_effect === 'rotate' ? 'animate-[spin_4s_linear_infinite]' : ''
                    }`}
                    style={{ 
                      background: `radial-gradient(ellipse at center, ${settings.neon_light_color || '#10b981'} 0%, transparent 70%)`,
                    }}
                  />
                )}
                <motion.img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-32 md:h-44 w-auto mx-auto drop-shadow-2xl relative z-10" 
                  referrerPolicy="no-referrer" 
                />
              </motion.div>
            )}

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold mb-8 shadow-sm"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="tracking-wide">{settings.announcement}</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight font-sans text-slate-900 drop-shadow-sm">
              <TypingTitle text={settings.title} />
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto font-medium font-sans">
              {settings.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Admin Quick Access Strip */}
      <div className="bg-white border-b border-slate-100 relative z-30 -mt-1">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest font-sans">এডমিন প্যানেল এক্সেস</p>
          </div>
          <Link to="/secret-admin-access" className="group px-5 py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold hover:bg-emerald-50 hover:text-emerald-700 transition-all flex items-center gap-2 border border-slate-200 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> এডমিন লগইন <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Content Sections Toggle Buttons */}
      {(settings?.show_features_directly !== 1 || settings?.show_food_directly !== 1 || settings?.show_showcase_directly !== 1) && (
        <div className="bg-white py-8 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
            {settings?.show_features_directly !== 1 && (
              <a href="#features" className="px-8 py-4 bg-emerald-50 text-emerald-900 rounded-2xl font-black shadow-sm border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-2">
                <Star className="w-5 h-5" /> আমাদের বৈশিষ্ট্য
              </a>
            )}
            {settings?.show_food_directly !== 1 && (
              <a href="#food-menu" className="px-8 py-4 bg-rose-50 text-rose-900 rounded-2xl font-black shadow-sm border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2">
                <Heart className="w-5 h-5" /> খাবার মেনু
              </a>
            )}
            {settings?.show_showcase_directly !== 1 && (
              <a href="#showcase" className="px-8 py-4 bg-blue-50 text-blue-900 rounded-2xl font-black shadow-sm border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-2">
                <Globe className="w-5 h-5" /> একাডেমিক শোকেস
              </a>
            )}
          </div>
        </div>
      )}

      {/* Features Section - Dynamic Bento Grid */}
      {(settings?.show_features_directly === 1 || features.length > 0) && (
        <section id="features" className={`py-32 bg-white relative overflow-hidden ${settings?.show_features_directly !== 1 ? 'hidden target:block' : ''}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23064e3b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} 
        />
        
        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute bg-emerald-500/10 rounded-full pointer-events-none"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold mb-6">
              <Star className="w-3 h-3 fill-emerald-600" />
              <span className="uppercase tracking-widest">আমাদের বৈশিষ্ট্য</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight font-sans leading-tight">
              কেন আমাদের মাদরাসা <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800">শ্রেষ্ঠ?</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium font-sans leading-relaxed">
              আমরা শুধু শিক্ষা দেই না, আমরা ভবিষ্যৎ প্রজন্মকে আদর্শ মানুষ হিসেবে গড়ে তুলি। আধুনিক ও দ্বীনি শিক্ষার এক অপূর্ব সমন্বয়।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.length > 0 ? features.map((feature, i) => {
              const Icon = iconMap[feature.icon] || Star;
              return (
                <motion.div 
                  key={feature.id}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {feature.image_url ? (
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-2 relative">
                       <img src={feature.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" alt={feature.title} />
                       <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm relative z-10">
                      <Icon className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 font-display">{feature.title}</h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-sans">{feature.description}</p>
                  </div>
                </motion.div>
              );
            }) : (
              // Fallback if no features
              <div className="col-span-full text-center py-12 text-slate-400">
                <p>কোন বৈশিষ্ট্য যোগ করা হয়নি। এডমিন প্যানেল থেকে যোগ করুন।</p>
              </div>
            )}
          </div>
        </div>
      </section>
    )}

    {/* Food Menu Section */}
    {(settings?.show_food_directly === 1 || foodMenu.length > 0) && (
      <section id="food-menu" className={`py-32 bg-slate-50 relative overflow-hidden ${settings?.show_food_directly !== 1 ? 'hidden target:block' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold mb-6">
                <Heart className="w-3 h-3 fill-rose-600" />
                <span className="uppercase tracking-widest">খাবারের তালিকা</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight font-sans leading-tight">
                পুষ্টিকর ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-rose-800">সুস্বাদু খাবার</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium font-sans leading-relaxed">
                আমাদের ছাত্রদের জন্য আমরা সবসময় পুষ্টিকর ও স্বাস্থ্যসম্মত খাবার নিশ্চিত করি।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {foodMenu.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.03 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 group overflow-hidden flex flex-col"
                >
                  <div className="relative h-64 w-full bg-slate-50 overflow-hidden p-4">
                    {/* Frame Effect */}
                    <div className="absolute inset-2 border-4 border-emerald-100 rounded-[2rem] group-hover:border-emerald-200 transition-colors" />
                    
                    <img 
                      src={item.image_url || `https://picsum.photos/seed/food-${item.id}/600/400`} 
                      className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-105 transition-transform duration-700" 
                      referrerPolicy="no-referrer" 
                      alt={item.title} 
                    />
                  </div>
                  
                  <div className="p-8 flex-1 flex flex-col gap-2">
                    <h3 className="text-2xl font-black text-emerald-900">{item.title}</h3>
                    <p className="text-slate-600 text-lg leading-relaxed font-medium line-clamp-3">
                      {item.description}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                        <Heart className="w-4 h-4 fill-rose-500" />
                        <span className="text-xs font-bold">স্বাস্থ্যসম্মত</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Academic Showcase Section */}
      {(settings?.show_showcase_directly === 1 || showcaseItems.length > 0) && (
        <section id="showcase" className={`py-32 bg-white relative overflow-hidden ${settings?.show_showcase_directly !== 1 ? 'hidden target:block' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6">
                <Globe className="w-3 h-3 fill-blue-600" />
                <span className="uppercase tracking-widest">একাডেমিক শোকেস</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight font-sans leading-tight">
                আমাদের <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">কার্যক্রম</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {showcaseItems.map((item: any, i: number) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all"
                >
                  {item.type === 'video' ? (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-6">
                      <iframe 
                        src={item.url.replace('watch?v=', 'embed/')} 
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-6">
                      <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 font-medium">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Contact Popup */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isContactOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="bg-white p-6 rounded-2xl shadow-2xl border border-emerald-100 w-72 mb-4 origin-bottom-right"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">যোগাযোগ করুন</p>
                  <p className="font-bold text-slate-900">আমাদের সাথে কথা বলুন</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group">
                  <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-slate-700">{settings.contact_phone}</span>
                </a>
                <a href={`https://wa.me/${settings.whatsapp_number?.replace(/[^0-9]/g, '').startsWith('0') ? '88' + settings.whatsapp_number?.replace(/[^0-9]/g, '') : settings.whatsapp_number?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group">
                  <MessageSquare className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-slate-700">হোয়াটসঅ্যাপ</span>
                </a>
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group">
                  <Facebook className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-slate-700">ফেসবুক পেজ</span>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsContactOpen(!isContactOpen)}
          className="group bg-emerald-600 text-white p-4 rounded-full shadow-xl shadow-emerald-900/20 hover:bg-emerald-500 hover:scale-110 transition-all active:scale-95 flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
          {isContactOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageSquare className="w-6 h-6 relative z-10" />}
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
