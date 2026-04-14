import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export function RecruitmentManager() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/job-applications")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(setApplications)
      .catch(err => console.error("Failed to load job applications:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900">শিক্ষক নিয়োগ আবেদন</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left font-bold text-slate-600">নাম</th>
              <th className="p-4 text-left font-bold text-slate-600">ফোন</th>
              <th className="p-4 text-left font-bold text-slate-600">ইমেইল</th>
              <th className="p-4 text-left font-bold text-slate-600">সিভি</th>
              <th className="p-4 text-left font-bold text-slate-600">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id} className="border-t border-slate-100">
                <td className="p-4 font-bold text-slate-900">{app.name}</td>
                <td className="p-4 font-bold text-slate-700">{app.phone}</td>
                <td className="p-4 font-bold text-slate-700">{app.email}</td>
                <td className="p-4"><a href={app.cv_url} target="_blank" className="text-emerald-600 font-bold underline">দেখুন</a></td>
                <td className="p-4"><span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-bold text-xs">{app.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
