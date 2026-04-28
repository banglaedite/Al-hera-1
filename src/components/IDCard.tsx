import { QRCodeSVG } from "qrcode.react";
import { GraduationCap, MapPin, Phone, Droplet, Calendar } from "lucide-react";
import { cn } from "../lib/utils";

interface IDCardProps {
  data: any;
  type?: "student" | "guardian";
  settings?: any;
}

export default function IDCard({ data, type = "student", settings }: IDCardProps) {
  const isGuardian = type === "guardian";
  
  return (
    <div className="w-[350px] h-[500px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col mx-auto print:shadow-none print:border-slate-300">
      {/* Header */}
      <div className={cn(
        "p-6 text-white text-center relative overflow-hidden",
        isGuardian ? "bg-indigo-900" : "bg-emerald-900"
      )}>
        <div className="relative z-10">
          {settings?.logo_url ? (
             <img src={settings.logo_url} alt="Logo" className="w-12 h-12 mx-auto mb-2 object-contain brightness-0 invert" />
          ) : (
             <GraduationCap className="w-10 h-10 mx-auto mb-2 text-white/80" />
          )}
          <h2 className="text-xl font-bold tracking-tight">{settings?.title || "মাদরাসা"}</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            {isGuardian ? "Digital Guardian ID Card" : "Digital Student ID Card"}
          </p>
        </div>
        <div className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-50",
          isGuardian ? "bg-indigo-800" : "bg-emerald-800"
        )} />
      </div>

      {/* Body */}
      <div className="flex-grow p-6 flex flex-col items-center">
        <div className={cn(
          "w-32 h-32 rounded-2xl border-4 overflow-hidden mb-4 shadow-md bg-slate-100",
          isGuardian ? "border-indigo-50" : "border-emerald-50"
        )}>
          <img 
            src={data.photo_url || `https://picsum.photos/seed/${data.id}/200`} 
            alt={data.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">{data.name}</h3>
        <p className={cn("font-bold mb-6", isGuardian ? "text-indigo-700" : "text-emerald-700")}>
          ID: {data.id}
        </p>

        <div className="w-full space-y-3 text-sm">
          {!isGuardian ? (
            <>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">শ্রেণী</span>
                <span className="font-bold text-slate-700">{data.class}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">রোল</span>
                <span className="font-bold text-slate-700">{data.roll}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">ছাত্রের নাম</span>
                <span className="font-bold text-slate-700">{data.student_name || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">সম্পর্ক</span>
                <span className="font-bold text-slate-700">{data.relation || "অভিভাবক"}</span>
              </div>
            </>
          )}
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">রক্তের গ্রুপ</span>
            <span className="font-bold text-rose-600">{data.blood_group || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400">ফোন</span>
            <span className="font-bold text-slate-700">{data.phone || "-"}</span>
          </div>
        </div>

        <div className="mt-auto pt-6 flex flex-col items-center">
          <div className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm">
            <QRCodeSVG value={`https://alhera-madrasa.app/verify/${data.id}`} size={80} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">Scan to Verify</p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-500 font-medium">আদর্শ দ্বীনি শিক্ষা প্রতিষ্ঠান</p>
      </div>
    </div>
  );
}
