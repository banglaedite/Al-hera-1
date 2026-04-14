import React, { useState, useEffect } from "react";
import { MessageCircle, Phone, Facebook, X, MessageSquare, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router-dom";

const FloatingContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(setSettings)
      .catch(err => console.error("Failed to load settings:", err));
  }, []);

  if (!settings || location.pathname.includes("admin")) return null;

  const actions = [
    {
      icon: Phone,
      label: "কল করুন",
      color: "bg-emerald-500",
      href: `tel:${settings.contact_phone}`,
    },
    {
      icon: MessageSquare,
      label: "হোয়াটসঅ্যাপ",
      color: "bg-green-500",
      href: `https://wa.me/${settings.whatsapp_number?.replace(/[^0-9]/g, '').startsWith('0') ? '88' + settings.whatsapp_number?.replace(/[^0-9]/g, '') : settings.whatsapp_number?.replace(/[^0-9]/g, '')}`,
    },
    {
      icon: Facebook,
      label: "ফেসবুক",
      color: "bg-blue-600",
      href: settings.facebook_url,
    },
    {
      icon: Youtube,
      label: "ইউটিউব",
      color: "bg-red-600",
      href: settings.youtube_url,
    },
  ].filter(action => action.href);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-20 right-0 flex flex-col gap-4 items-end">
            {actions.map((action, i) => (
              <motion.a
                key={i}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 group"
              >
                <span className="bg-white px-3 py-1.5 rounded-xl shadow-lg text-sm font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <div className={`${action.color} text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6" />
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? "bg-slate-800" : "bg-emerald-600"
        } text-white p-5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 relative`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-8 h-8" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-8 h-8" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
};

export default FloatingContact;
