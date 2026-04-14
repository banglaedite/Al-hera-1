import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useToast } from "./ToastContext";
import { useLocation } from "react-router-dom";

export const NoticeBoard = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        addToast("সাইট সেটিংস লোড করতে সমস্যা হয়েছে", "error");
      }
    };
    fetchSettings();
  }, []);

  if (!settings?.announcement || location.pathname === "/secret-admin-access") return null;

  return (
    <div className="bg-emerald-50 border-b border-emerald-100 py-2 overflow-hidden whitespace-nowrap">
      <div className="flex animate-marquee">
        <span className="mx-8 text-sm font-bold text-emerald-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> {settings.announcement}
        </span>
        {/* Duplicate for seamless loop */}
        <span className="mx-8 text-sm font-bold text-emerald-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> {settings.announcement}
        </span>
        <span className="mx-8 text-sm font-bold text-emerald-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> {settings.announcement}
        </span>
        <span className="mx-8 text-sm font-bold text-emerald-900 flex items-center gap-2">
          <Bell className="w-4 h-4" /> {settings.announcement}
        </span>
      </div>
    </div>
  );
};
