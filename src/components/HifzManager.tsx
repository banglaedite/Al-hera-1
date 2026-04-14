import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Search, Plus, Save, Printer, Download, Calendar, Check, X, Settings, Trash2, BookOpen, CheckCircle2, XCircle, History, GraduationCap, Award, User, FileText, Trophy, ArrowUpDown, AlertTriangle } from "lucide-react";
import { useToast } from "./ToastContext";
import { LoadingButton } from "./LoadingButton";
import { cn } from "../lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";

export function HifzManager({ classesList }: { classesList: string[] }) {
  const { addToast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "reports" | "overview" | "ranking" | "settings">("add");
  
  // Para Selection State
  const [selectedPara, setSelectedPara] = useState<string>("1");
  const [sabokPages, setSabokPages] = useState<string>("");
  const [studentParas, setStudentParas] = useState<Record<string, string>>({});

  // Settings
  const [guardianViewEnabled, setGuardianViewEnabled] = useState(true);
  const [guardianLoginByIdEnabled, setGuardianLoginByIdEnabled] = useState(true);

  // Add Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [satSabok, setSatSabok] = useState(false);
  const [amukhta, setAmukhta] = useState({ from_para: "", to_para: "", total_pages: "", part: "full" as "full" | "first" | "second" });
  const [tilawat, setTilawat] = useState({ from_para: "", to_para: "", total_paras: "" });
  const [sabina, setSabina] = useState({ paras: "", total_paras: "" });

  // Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastReport, setLastReport] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<any>(null);

  const [rankingStartDate, setRankingStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [rankingEndDate, setRankingEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [rankingReports, setRankingReports] = useState<any[]>([]);
  const [rankingCategory, setRankingCategory] = useState<'sabok' | 'sat_sabok' | 'amukhta' | 'tilawat' | 'sabina'>('sabok');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      // Set Para from persistent state or default to 1
      setSelectedPara(studentParas[selectedStudent.id] || "1");
      setSabokPages("");
      fetchLastReport(selectedStudent.id);
      
      if (activeTab === "reports") {
        fetchReports();
      }
    }
  }, [selectedStudent, startDate, endDate, activeTab]);

  useEffect(() => {
    if (activeTab === "overview") {
      fetchAllReports();
    }
  }, [activeTab, selectedDate]);

  const fetchRankingReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hifz-reports?start_date=${rankingStartDate}&end_date=${rankingEndDate}`);
      if (res.ok) {
        setRankingReports(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch ranking reports", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ranking") {
      fetchRankingReports();
    }
  }, [activeTab, rankingStartDate, rankingEndDate]);

  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetails]);

  const fetchLastReport = async (studentId: string) => {
    try {
      const res = await fetch(`/api/admin/hifz-reports?student_id=${studentId}&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setLastReport(data[0]);
        } else {
          setLastReport(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch last report", error);
      addToast("সর্বশেষ রিপোর্ট লোড করতে সমস্যা হয়েছে", "error");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/students?className=All");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const hifzStudents = data
        .filter((s: any) => s.is_hifz === 1 || s.class?.includes("হিফজ") || s.class?.includes("হেফজ"))
        .sort((a: any, b: any) => (Number(a.roll) || 0) - (Number(b.roll) || 0));
      setStudents(hifzStudents);
    } catch (error) {
      console.error("Failed to fetch students", error);
      addToast("ছাত্র তালিকা লোড করতে সমস্যা হয়েছে", "error");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings/hifz");
      if (res.ok) {
        const data = await res.json();
        setGuardianViewEnabled(data.guardian_view_enabled ?? true);
        setGuardianLoginByIdEnabled(data.guardian_login_by_id_enabled ?? true);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      addToast("সেটিংস লোড করতে সমস্যা হয়েছে", "error");
    }
  };

  const toggleSettings = async (key: string) => {
    try {
      const newValue = key === 'view' ? !guardianViewEnabled : !guardianLoginByIdEnabled;
      const res = await fetch("/api/admin/settings/hifz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [key === 'view' ? 'guardian_view_enabled' : 'guardian_login_by_id_enabled']: newValue
        })
      });
      if (res.ok) {
        if (key === 'view') setGuardianViewEnabled(newValue);
        else setGuardianLoginByIdEnabled(newValue);
        addToast("সেটিংস আপডেট হয়েছে", "success");
      } else {
        addToast("সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    }
  };

  const fetchReports = async () => {
    if (!selectedStudent) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hifz-reports?student_id=${selectedStudent.id}&start_date=${startDate}&end_date=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
      addToast("রিপোর্ট লোড করতে সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/hifz-reports?start_date=${selectedDate}&end_date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setAllReports(data);
      }
    } catch (error) {
      console.error("Failed to fetch all reports", error);
      addToast("সকল রিপোর্ট লোড করতে সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyLastAmukhta = () => {
    if (lastReport?.amukhta) {
      setAmukhta({
        from_para: lastReport.amukhta.from_para || "",
        to_para: lastReport.amukhta.to_para || "",
        total_pages: String(lastReport.amukhta.total_pages || "")
      });
    }
  };

  const copyLastTilawat = () => {
    if (lastReport?.tilawat) {
      setTilawat({
        from_para: lastReport.tilawat.from_para || "",
        to_para: lastReport.tilawat.to_para || "",
        total_paras: String(lastReport.tilawat.total_paras || "")
      });
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return addToast("ছাত্র নির্বাচন করুন", "error");
    
    setLoading(true);
    try {
      // Update persistent para for this student
      setStudentParas(prev => ({ ...prev, [selectedStudent.id]: selectedPara }));

      const payload = {
        student_id: selectedStudent.id,
        date,
        sabok: [{ reading: `পারা ${selectedPara}`, page: sabokPages }],
        sat_sabok: satSabok,
        amukhta: {
          from_para: amukhta.from_para,
          to_para: amukhta.to_para,
          total_pages: Number(amukhta.total_pages) || 0
        },
        tilawat: {
          from_para: tilawat.from_para,
          to_para: tilawat.to_para,
          total_paras: Number(tilawat.total_paras) || 0
        },
        sabina: {
          paras: sabina.paras,
          total_paras: Number(sabina.total_paras) || 0
        }
      };

      const res = await fetch("/api/admin/hifz-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast("রিপোর্ট সেভ হয়েছে", "success");
        // Update last report locally
        setLastReport(payload);
        // Refresh reports list
        fetchReports();
        fetchAllReports();
        // Reset form but keep selectedPara
        setSabokPages("");
        setSatSabok(false);
        setAmukhta({ from_para: "", to_para: "", total_pages: "" });
        setTilawat({ from_para: "", to_para: "", total_paras: "" });
        setSabina({ paras: "", total_paras: "" });
      } else {
        const err = await res.json();
        addToast(err.error || "ব্যর্থ হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    setDeleteConfirmId(id);
    setDeletePassword("");
  };

  const executeDelete = async () => {
    if (!deleteConfirmId) return;
    if (!deletePassword) {
      addToast("পাসওয়ার্ড দিন", "error");
      return;
    }
    try {
      const res = await fetch(`/api/admin/hifz-reports/${deleteConfirmId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });
      if (res.ok) {
        addToast("ডিলিট হয়েছে", "success");
        fetchReports();
        fetchAllReports();
        setDeleteConfirmId(null);
      } else {
        addToast("পাসওয়ার্ড ভুল বা সমস্যা হয়েছে", "error");
      }
    } catch (error) {
      addToast("সমস্যা হয়েছে", "error");
    }
  };

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast("পপ-আপ ব্লক করা হয়েছে। দয়া করে পপ-আপ এলাউ করুন।", "error");
      return;
    }

    const html = `
      <html>
        <head>
          <title>হিফজ রিপোর্ট - ${selectedStudent?.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; pb: 20px; }
            .header h1 { margin: 0; color: #0f172a; font-size: 28px; }
            .student-info { display: flex; gap: 40px; margin-bottom: 30px; background: #f8fafc; p: 20px; border-radius: 12px; }
            .student-info div { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 14px; }
            th { background-color: #f1f5f9; font-weight: bold; color: #475569; }
            .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { background: #f1f5f9; padding: 15px; border-radius: 10px; text-align: center; }
            .summary-card h4 { margin: 0; font-size: 10px; color: #64748b; text-transform: uppercase; }
            .summary-card p { margin: 5px 0 0; font-size: 18px; font-weight: bold; color: #0f172a; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>হিফজ রিপোর্ট কার্ড</h1>
            <p>আল-হেরা মাদরাসা ও এতিমখানা</p>
          </div>
          
          <div class="student-info">
            <div>
              <p><strong>ছাত্রের নাম:</strong> ${selectedStudent?.name}</p>
              <p><strong>রোল:</strong> ${selectedStudent?.roll}</p>
            </div>
            <div>
              <p><strong>শ্রেণী:</strong> ${selectedStudent?.class}</p>
              <p><strong>তারিখ:</strong> ${startDate} থেকে ${endDate}</p>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card"><h4>সবক পৃষ্ঠা</h4><p>${reports.reduce((sum, r) => sum + (r.sabok?.length || 0), 0)}</p></div>
            <div class="summary-card"><h4>সাত ছবক</h4><p>${reports.filter(r => r.sat_sabok).length}</p></div>
            <div class="summary-card"><h4>আমুখতা</h4><p>${reports.reduce((sum, r) => sum + (r.amukhta?.total_pages || 0), 0)}</p></div>
            <div class="summary-card"><h4>তিলাওয়াত</h4><p>${reports.reduce((sum, r) => sum + (r.tilawat?.total_paras || 0), 0)}</p></div>
            <div class="summary-card"><h4>সবিনা</h4><p>${reports.reduce((sum, r) => sum + (r.sabina?.total_paras || 0), 0)}</p></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>সবক</th>
                <th>সাত ছবক</th>
                <th>আমুখতা</th>
                <th>তিলাওয়াত</th>
                <th>সবিনা</th>
              </tr>
            </thead>
            <tbody>
              ${reports.map(r => `
                <tr>
                  <td>${new Date(r.date).toLocaleDateString('bn-BD')}</td>
                  <td>${r.sabok?.map((s: any) => `${s.reading} (${s.page})`).join(', ') || '-'}</td>
                  <td>${r.sat_sabok ? 'হ্যাঁ' : 'না'}</td>
                  <td>${r.amukhta?.from_para ? `পারা ${r.amukhta.from_para}-${r.amukhta.to_para} (${r.amukhta.total_pages} পৃ)` : '-'}</td>
                  <td>${r.tilawat?.from_para ? `পারা ${r.tilawat.from_para}-${r.tilawat.to_para} (${r.tilawat.total_paras} পা)` : '-'}</td>
                  <td>${r.sabina?.paras ? `${r.sabina.paras} (${r.sabina.total_paras} পা)` : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 50px; display: flex; justify-content: space-between;">
            <div style="text-align: center; border-top: 1px solid #000; width: 150px; padding-top: 5px;">শিক্ষকের স্বাক্ষর</div>
            <div style="text-align: center; border-top: 1px solid #000; width: 150px; padding-top: 5px;">অভিভাবকের স্বাক্ষর</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handlePrintOverview = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>হিফজ দৈনিক রিপোর্ট - ${selectedDate}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #0f172a; font-size: 24px; }
            .date-info { text-align: center; margin-bottom: 30px; font-weight: bold; color: #64748b; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: center; font-size: 12px; }
            th { background-color: #f8fafc; font-weight: bold; color: #475569; }
            .status-yes { color: #10b981; font-weight: bold; }
            .status-no { color: #f43f5e; opacity: 0.5; }
            .student-name { text-align: left; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>হিফজ দৈনিক রিপোর্ট লিস্ট</h1>
            <p>আল-হেরা মাদরাসা ও এতিমখানা</p>
          </div>
          <div class="date-info">তারিখ: ${new Date(selectedDate).toLocaleDateString('bn-BD')}</div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left;">ছাত্রের নাম</th>
                <th>রোল</th>
                <th>সবক</th>
                <th>৭ ছবক</th>
                <th>আমুখতা</th>
                <th>তিলাওয়াত</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(student => {
                const report = allReports.find(r => r.student_id === student.id);
                return `
                  <tr>
                    <td class="student-name">${student.name}</td>
                    <td>${student.roll}</td>
                    <td class="${report?.sabok?.length > 0 ? 'status-yes' : 'status-no'}">
                      ${report?.sabok?.length > 0 ? `পারা ${report.sabok[0].reading.replace('পারা ', '')} (${report.sabok[0].page})` : '✘'}
                    </td>
                    <td class="${report?.sat_sabok ? 'status-yes' : 'status-no'}">
                      ${report?.sat_sabok ? '✔' : '✘'}
                    </td>
                    <td class="${report?.amukhta?.from_para ? 'status-yes' : 'status-no'}">
                      ${report?.amukhta?.from_para ? `${report.amukhta.from_para}-${report.amukhta.to_para} (${report.amukhta.total_pages} পৃ)` : '✘'}
                    </td>
                    <td class="${report?.tilawat?.from_para ? 'status-yes' : 'status-no'}">
                      ${report?.tilawat?.from_para ? `${report.tilawat.from_para}-${report.tilawat.to_para} (${report.tilawat.total_paras} পা)` : '✘'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF() as any;
    
    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text("Hifz Progress Report", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Student: ${selectedStudent?.name} | Roll: ${selectedStudent?.roll}`, 105, 30, { align: "center" });
    doc.text(`Date Range: ${startDate} to ${endDate}`, 105, 37, { align: "center" });

    // Summary Table
    const summaryData = [[
      reports.reduce((sum, r) => sum + (r.sabok?.length || 0), 0),
      reports.filter(r => r.sat_sabok).length,
      reports.reduce((sum, r) => sum + (r.amukhta?.total_pages || 0), 0),
      reports.reduce((sum, r) => sum + (r.tilawat?.total_paras || 0), 0),
      reports.reduce((sum, r) => sum + (r.sabina?.total_paras || 0), 0)
    ]];

    doc.autoTable({
      startY: 45,
      head: [['Total Sabok', 'Sat Sabok (Days)', 'Amukhta (Pages)', 'Tilawat (Paras)', 'Sabina (Paras)']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    // Detailed Table
    const tableData = reports.map(r => [
      new Date(r.date).toLocaleDateString('bn-BD'),
      r.sabok?.map((s: any) => `${s.reading} (${s.page})`).join('\n') || '-',
      r.sat_sabok ? 'Yes' : 'No',
      r.amukhta?.from_para ? `Para ${r.amukhta.from_para}-${r.amukhta.to_para}\n(${r.amukhta.total_pages} pages)` : '-',
      r.tilawat?.from_para ? `Para ${r.tilawat.from_para}-${r.tilawat.to_para}\n(${r.tilawat.total_paras} paras)` : '-',
      r.sabina?.paras ? `${r.sabina.paras}\n(${r.sabina.total_paras} paras)` : '-'
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Date', 'Sabok', 'Sat Sabok', 'Amukhta', 'Tilawat', 'Sabina']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    doc.save(`Hifz_Report_${selectedStudent?.name}_${startDate}.pdf`);
    addToast("PDF ডাউনলোড শুরু হয়েছে", "success");
  };

  const getSabokMaxPages = (para: string) => {
    if (para === "1") return 21;
    if (para === "29") return 24;
    if (para === "30") return 25;
    return 20;
  };
  const toBn = (n: number) => n.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d] as any);

  const handleTilawatChange = (field: 'from_para' | 'to_para', value: string) => {
    const newTilawat = { ...tilawat, [field]: value };
    if (newTilawat.from_para && newTilawat.to_para) {
      const from = parseInt(newTilawat.from_para);
      const to = parseInt(newTilawat.to_para);
      if (!isNaN(from) && !isNaN(to)) {
        newTilawat.total_paras = String(Math.abs(to - from) + 1);
      }
    }
    setTilawat(newTilawat);
  };

  const getRankingData = () => {
    const aggregated = students.map(student => {
      const studentReports = rankingReports.filter(r => r.student_id === student.id);
      return {
        ...student,
        score: rankingCategory === 'sabok' ? studentReports.reduce((sum, r) => sum + (r.sabok?.length || 0), 0) :
               rankingCategory === 'sat_sabok' ? studentReports.filter(r => r.sat_sabok).length :
               rankingCategory === 'amukhta' ? studentReports.reduce((sum, r) => sum + (Number(r.amukhta?.total_pages) || 0), 0) :
               rankingCategory === 'tilawat' ? studentReports.reduce((sum, r) => sum + (Number(r.tilawat?.total_paras) || 0), 0) :
               studentReports.reduce((sum, r) => sum + (Number(r.sabina?.total_paras) || 0), 0)
      };
    });

    aggregated.sort((a, b) => b.score - a.score);
    return aggregated;
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900">হিফজ বিভাগ</h2>
          <p className="text-slate-500 mt-1">হিফজ ছাত্রদের রিপোর্ট ও ট্র্যাকিং</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setActiveTab("add")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all", activeTab === "add" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <Plus className="w-4 h-4" /> রিপোর্ট তৈরি
          </button>
          <button onClick={() => setActiveTab("reports")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all", activeTab === "reports" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <Calendar className="w-4 h-4" /> রিপোর্ট দেখুন
          </button>
          <button onClick={() => setActiveTab("overview")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all", activeTab === "overview" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <FileText className="w-4 h-4" /> বিভাগের রিপোর্ট
          </button>
          <button onClick={() => setActiveTab("ranking")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all", activeTab === "ranking" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <Trophy className="w-4 h-4" /> র‍্যাংকিং
          </button>
          <button onClick={() => setActiveTab("settings")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all", activeTab === "settings" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
            <Settings className="w-4 h-4" /> সেটিংস
          </button>
        </div>
      </div>

      {activeTab === "settings" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-2xl mx-auto space-y-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6">হিফজ সেটিংস</h3>
          
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800">গার্ডিয়ান রিপোর্ট ভিউ</h4>
              <p className="text-sm text-slate-500 mt-1">অভিভাবকরা তাদের প্রোফাইল থেকে মাসিক ও বাৎসরিক রিপোর্ট দেখতে পারবেন কিনা</p>
            </div>
            <button 
              onClick={() => toggleSettings('view')}
              className={cn("relative inline-flex h-8 w-14 items-center rounded-full transition-colors", guardianViewEnabled ? "bg-emerald-500" : "bg-slate-300")}
            >
              <span className={cn("inline-block h-6 w-6 transform rounded-full bg-white transition-transform", guardianViewEnabled ? "translate-x-7" : "translate-x-1")} />
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800">স্টুডেন্ট আইডি দিয়ে লগইন</h4>
              <p className="text-sm text-slate-500 mt-1">অভিভাবকরা স্টুডেন্ট আইডি/কোড দিয়ে লগইন করতে পারবেন কিনা (বন্ধ করলে শুধু ইমেইল/ফোন দিয়ে লগইন করা যাবে)</p>
            </div>
            <button 
              onClick={() => toggleSettings('login')}
              className={cn("relative inline-flex h-8 w-14 items-center rounded-full transition-colors", guardianLoginByIdEnabled ? "bg-emerald-500" : "bg-slate-300")}
            >
              <span className={cn("inline-block h-6 w-6 transform rounded-full bg-white transition-transform", guardianLoginByIdEnabled ? "translate-x-7" : "translate-x-1")} />
            </button>
          </div>
        </motion.div>
      )}

      {(activeTab === "add" || activeTab === "reports") && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Student List Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[800px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ছাত্র খুঁজুন..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:ring-0 transition-colors"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all border-2 flex items-center gap-4",
                    selectedStudent?.id === student.id 
                      ? "bg-emerald-50 border-emerald-200 shadow-md transform scale-[1.02]" 
                      : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                    {student.photo ? (
                      <img 
                        src={student.photo} 
                        alt={student.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold text-xs">
                        {student.roll || "N/A"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-slate-900 truncate">{student.name}</div>
                    <div className="text-xs text-slate-500 mt-1 flex justify-between items-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md">{student.class}</span>
                      <span className="font-bold text-emerald-600">রোল: {student.roll}</span>
                    </div>
                  </div>
                </button>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                  <User className="w-10 h-10 mb-2 opacity-20" />
                  <p>কোনো ছাত্র পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {!selectedStudent ? (
              <div className="bg-white h-[800px] rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center text-slate-400">
                <Search className="w-16 h-16 mb-4 text-slate-200" />
                <p className="text-xl font-bold">তালিকা থেকে একজন ছাত্র নির্বাচন করুন</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Student Profile Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-6"
                >
                  <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-emerald-50 shadow-lg">
                    {selectedStudent.photo ? (
                      <img 
                        src={selectedStudent.photo} 
                        alt={selectedStudent.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 text-2xl font-black">
                        {selectedStudent.roll}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900">{selectedStudent.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                      <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                        <User className="w-4 h-4" /> রোল: {selectedStudent.roll}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> {selectedStudent.class}
                      </span>
                      <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                        ID: {selectedStudent.studentId || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab("add")}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-bold transition-all",
                        activeTab === "add" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      রিপোর্ট যোগ করুন
                    </button>
                    <button 
                      onClick={() => setActiveTab("reports")}
                      className={cn(
                        "px-6 py-3 rounded-2xl font-bold transition-all",
                        activeTab === "reports" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      রিপোর্ট দেখুন
                    </button>
                  </div>
                </motion.div>

                {activeTab === "add" ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-emerald-50/50 flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">দৈনন্দিন রিপোর্ট তৈরি</h3>
                        <p className="text-slate-600 mt-2 font-medium">ছাত্র: <span className="text-emerald-700 font-bold">{selectedStudent.name}</span></p>
                      </div>
                      {lastReport && (
                        <div className="bg-white px-6 py-3 rounded-2xl border border-emerald-100 shadow-sm">
                          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">সর্বশেষ পড়া (সবক)</div>
                          <div className="text-sm font-bold text-slate-700">
                            {lastReport.sabok?.[0]?.reading} (পৃষ্ঠা: {lastReport.sabok?.[0]?.page})
                          </div>
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleSubmitReport} className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">তারিখ</label>
                          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl" />
                        </div>
                      </div>

                      {/* Sabok */}
                      <div className="space-y-6 p-8 bg-emerald-50/30 rounded-[2.5rem] border-2 border-emerald-100/50 shadow-inner">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-black text-slate-800 text-xl flex items-center gap-2">
                              <BookOpen className="w-6 h-6 text-emerald-600" /> সবক (নতুন পড়া)
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">কুরআন মাজীদ থেকে আজকের নতুন পড়া</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">পারা নির্বাচন করুন</label>
                            <select 
                              value={selectedPara} 
                              onChange={e => setSelectedPara(e.target.value)}
                              className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 transition-all font-bold text-slate-700"
                            >
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>পারা {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2 space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">পৃষ্ঠা নাম্বার (একাধিক হলে কমা দিন)</label>
                            <input 
                              placeholder="যেমন: ৫, ৬, ৭" 
                              value={sabokPages} 
                              onChange={e => setSabokPages(e.target.value)} 
                              className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Array.from({ length: getSabokMaxPages(selectedPara) }, (_, i) => i + 1).map(p => (
                            <button 
                              key={p}
                              type="button"
                              onClick={() => setSabokPages(prev => prev ? `${prev}, ${toBn(p)}` : toBn(p))}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all"
                            >
                              {toBn(p)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sat Sabok */}
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 cursor-pointer" onClick={() => setSatSabok(!satSabok)}>
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-colors", satSabok ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white")}>
                          {satSabok && <Check className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">সাত ছবক</h4>
                          <p className="text-sm text-slate-500">আজ সাত ছবক শুনিয়েছে কিনা?</p>
                        </div>
                      </div>

                      {/* Amukhta */}
                      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-600" /> আমুখতা (রিভিশন)
                          </h4>
                          {lastReport?.amukhta?.from_para && (
                            <button type="button" onClick={copyLastAmukhta} className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg hover:bg-purple-100 transition-all uppercase tracking-wider">
                              আগেরটা কপি করুন
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">পারা নির্বাচন</label>
                            <select 
                              value={amukhta.from_para === amukhta.to_para ? amukhta.from_para : ""} 
                              onChange={e => {
                                const val = e.target.value;
                                if (val) {
                                  setAmukhta({
                                    from_para: val,
                                    to_para: val,
                                    total_pages: "20",
                                    part: "full"
                                  });
                                } else {
                                  setAmukhta({
                                    from_para: "",
                                    to_para: "",
                                    total_pages: "",
                                    part: "full"
                                  });
                                }
                              }}
                              className="w-full p-3 border rounded-xl bg-white"
                            >
                              <option value="">সিঙ্গেল পারা</option>
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>পারা {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          {amukhta.from_para === amukhta.to_para && amukhta.from_para !== "" ? (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">অংশ</label>
                              <select 
                                value={amukhta.part}
                                onChange={e => {
                                  const val = e.target.value as any;
                                  setAmukhta({
                                    ...amukhta, 
                                    part: val,
                                    total_pages: val === "full" ? "20" : "10"
                                  });
                                }}
                                className="w-full p-3 border rounded-xl bg-white"
                              >
                                <option value="full">পুরো পারা (২০ পৃষ্ঠা)</option>
                                <option value="first">প্রথম অংশ (১০ পৃষ্ঠা)</option>
                                <option value="second">শেষ অংশ (১০ পৃষ্ঠা)</option>
                              </select>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">শুরু পারা</label>
                                <select 
                                  value={amukhta.from_para} 
                                  onChange={e => setAmukhta({...amukhta, from_para: e.target.value})}
                                  className="w-full p-3 border rounded-xl bg-white"
                                >
                                  <option value="">নির্বাচন করুন</option>
                                  {Array.from({ length: 30 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>পারা {i + 1}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">শেষ পারা</label>
                                <select 
                                  value={amukhta.to_para} 
                                  onChange={e => setAmukhta({...amukhta, to_para: e.target.value})}
                                  className="w-full p-3 border rounded-xl bg-white"
                                >
                                  <option value="">নির্বাচন করুন</option>
                                  {Array.from({ length: 30 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>পারা {i + 1}</option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">মোট পৃষ্ঠা</label>
                            <input type="number" placeholder="পৃষ্ঠা" value={amukhta.total_pages} onChange={e => setAmukhta({...amukhta, total_pages: e.target.value})} className="w-full p-3 border rounded-xl bg-white" />
                          </div>
                        </div>
                      </div>

                      {/* Tilawat */}
                      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-orange-600" /> দৈনন্দিন তিলাওয়াত
                          </h4>
                          {lastReport?.tilawat?.from_para && (
                            <button type="button" onClick={copyLastTilawat} className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg hover:bg-orange-100 transition-all uppercase tracking-wider">
                              আগেরটা কপি করুন
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">কোন পারা থেকে</label>
                            <select 
                              value={tilawat.from_para} 
                              onChange={e => handleTilawatChange('from_para', e.target.value)}
                              className="w-full p-3 border rounded-xl bg-white"
                            >
                              <option value="">নির্বাচন করুন</option>
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>পারা {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">কোন পারা পর্যন্ত</label>
                            <select 
                              value={tilawat.to_para} 
                              onChange={e => handleTilawatChange('to_para', e.target.value)}
                              className="w-full p-3 border rounded-xl bg-white"
                            >
                              <option value="">নির্বাচন করুন</option>
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>পারা {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">মোট কত পারা</label>
                            <input type="number" placeholder="পারা সংখ্যা" value={tilawat.total_paras} onChange={e => setTilawat({...tilawat, total_paras: e.target.value})} className="w-full p-3 border rounded-xl bg-white" />
                          </div>
                        </div>
                      </div>

                      {/* Sabina */}
                      <div className="space-y-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-600" /> সাপ্তাহিক সবিনা
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">কোন কোন পারা</label>
                            <input placeholder="যেমন: ১, ২, ৩" value={sabina.paras} onChange={e => setSabina({...sabina, paras: e.target.value})} className="w-full p-3 border rounded-xl bg-white" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">মোট কত পারা</label>
                            <input type="number" placeholder="পারা সংখ্যা" value={sabina.total_paras} onChange={e => setSabina({...sabina, total_paras: e.target.value})} className="w-full p-3 border rounded-xl bg-white" />
                          </div>
                        </div>
                      </div>

                      <LoadingButton loading={loading} type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200">
                        <Save className="w-6 h-6 inline mr-2" /> রিপোর্ট সেভ করুন
                      </LoadingButton>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[800px]">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">রিপোর্ট দেখুন</h3>
                        <p className="text-slate-600 mt-2 font-medium">ছাত্র: <span className="text-emerald-700 font-bold">{selectedStudent.name}</span></p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 outline-none text-sm font-bold text-slate-700" />
                          <span className="text-slate-400">-</span>
                          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 outline-none text-sm font-bold text-slate-700" />
                        </div>
                        <button onClick={handlePrint} className="p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 font-bold flex items-center">
                          <Printer className="w-5 h-5 mr-2" /> প্রিন্ট
                        </button>
                        <button onClick={handleDownloadPDF} className="p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 font-bold flex items-center">
                          <Download className="w-5 h-5 mr-2" /> PDF
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8" ref={printRef}>
                      {loading ? (
                        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
                      ) : reports.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-bold text-lg">এই তারিখের মধ্যে কোনো রিপোর্ট পাওয়া যায়নি</div>
                      ) : (
                        <div className="space-y-8">
                          {/* Summary Cards */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center flex flex-col items-center">
                              <BookOpen className="w-5 h-5 text-emerald-600 mb-2" />
                              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">মোট সবক পৃষ্ঠা</p>
                              <p className="text-2xl font-black text-emerald-900">
                                {reports.reduce((sum, r) => sum + (r.sabok?.length || 0), 0)}
                              </p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center flex flex-col items-center">
                              <CheckCircle2 className="w-5 h-5 text-blue-600 mb-2" />
                              <p className="text-xs font-bold text-blue-600 uppercase mb-1">সাত ছবক (দিন)</p>
                              <p className="text-2xl font-black text-blue-900">
                                {reports.filter(r => r.sat_sabok).length}
                              </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center flex flex-col items-center">
                              <History className="w-5 h-5 text-purple-600 mb-2" />
                              <p className="text-xs font-bold text-purple-600 uppercase mb-1">আমুখতা (পৃষ্ঠা)</p>
                              <p className="text-2xl font-black text-purple-900">
                                {reports.reduce((sum, r) => sum + (r.amukhta?.total_pages || 0), 0)}
                              </p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center flex flex-col items-center">
                              <GraduationCap className="w-5 h-5 text-orange-600 mb-2" />
                              <p className="text-xs font-bold text-orange-600 uppercase mb-1">তিলাওয়াত (পারা)</p>
                              <p className="text-2xl font-black text-orange-900">
                                {reports.reduce((sum, r) => sum + (r.tilawat?.total_paras || 0), 0)}
                              </p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center flex flex-col items-center">
                              <Award className="w-5 h-5 text-indigo-600 mb-2" />
                              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">সবিনা (পারা)</p>
                              <p className="text-2xl font-black text-indigo-900">
                                {reports.reduce((sum, r) => sum + (r.sabina?.total_paras || 0), 0)}
                              </p>
                            </div>
                          </div>

                          {/* Detailed Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-100 text-slate-700">
                                  <th className="p-4 rounded-tl-xl font-bold">তারিখ</th>
                                  <th className="p-4 font-bold">সবক</th>
                                  <th className="p-4 font-bold text-center">সাত ছবক</th>
                                  <th className="p-4 font-bold">আমুখতা</th>
                                  <th className="p-4 font-bold">তিলাওয়াত</th>
                                  <th className="p-4 font-bold">সবিনা</th>
                                  <th className="p-4 rounded-tr-xl font-bold text-right print:hidden">অ্যাকশন</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {reports.map((report) => (
                                  <tr key={report.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-bold text-slate-900 whitespace-nowrap">
                                      {new Date(report.date).toLocaleDateString('bn-BD')}
                                    </td>
                                    <td className="p-4 text-sm">
                                      {report.sabok?.map((s: any, i: number) => (
                                        <div key={i}>{s.reading} (পৃষ্ঠা: {s.page})</div>
                                      ))}
                                    </td>
                                    <td className="p-4 text-center">
                                      {report.sat_sabok ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-rose-300 mx-auto" />}
                                    </td>
                                    <td className="p-4 text-sm">
                                      {report.amukhta?.from_para && (
                                        <>পারা {report.amukhta.from_para} - {report.amukhta.to_para} ({report.amukhta.total_pages} পৃষ্ঠা)</>
                                      )}
                                    </td>
                                    <td className="p-4 text-sm">
                                      {report.tilawat?.from_para && (
                                        <>পারা {report.tilawat.from_para} - {report.tilawat.to_para} ({report.tilawat.total_paras} পারা)</>
                                      )}
                                    </td>
                                    <td className="p-4 text-sm">
                                      {report.sabina?.paras && (
                                        <>{report.sabina.paras} ({report.sabina.total_paras} পারা)</>
                                      )}
                                    </td>
                                    <td className="p-4 text-right print:hidden">
                                      <button onClick={() => handleDeleteReport(report.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">দৈনিক রিপোর্ট লিস্ট</h3>
                <p className="text-slate-500 mt-1">বিভাগের সকল ছাত্রের আজকের অবস্থা</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 p-2 border rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400 ml-2" />
                  <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    className="p-2 bg-transparent outline-none text-sm font-bold text-slate-700" 
                  />
                </div>
                <button onClick={handlePrintOverview} className="p-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 font-bold flex items-center">
                  <Printer className="w-5 h-5 mr-2" /> প্রিন্ট
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-slate-500 text-sm uppercase tracking-wider">
                      <th className="px-6 py-4 font-black">ছাত্রের নাম ও রোল</th>
                      <th className="px-6 py-4 font-black text-center">সবক</th>
                      <th className="px-6 py-4 font-black text-center">৭ ছবক</th>
                      <th className="px-6 py-4 font-black text-center">আমুখতা</th>
                      <th className="px-6 py-4 font-black text-center">তিলাওয়াত</th>
                      <th className="px-6 py-4 font-black text-right">বিস্তারিত</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => {
                      const report = allReports.find(r => r.student_id === student.id);
                      
                      return (
                        <tr key={student.id} className="bg-white hover:bg-slate-50 transition-colors group shadow-sm">
                          <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                                {student.roll}
                              </div>
                              <div className="font-bold text-slate-900">{student.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 text-center">
                            {report?.sabok?.length > 0 ? (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600">পারা {report.sabok[0].reading.replace('পারা ', '')}</span>
                              </div>
                            ) : (
                              <XCircle className="w-6 h-6 text-rose-200 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 text-center">
                            {report?.sat_sabok ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="w-6 h-6 text-rose-200 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 text-center">
                            {report?.amukhta?.from_para ? (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600">{report.amukhta.total_pages} পৃ</span>
                              </div>
                            ) : (
                              <XCircle className="w-6 h-6 text-rose-200 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-5 border-y border-slate-100 text-center">
                            {report?.tilawat?.from_para ? (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600">{report.tilawat.total_paras} পা</span>
                              </div>
                            ) : (
                              <XCircle className="w-6 h-6 text-rose-200 mx-auto" />
                            )}
                          </td>
                          <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-100 text-right">
                            <button 
                              onClick={() => setShowDetails({ student, report })}
                              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all"
                            >
                              বিস্তারিত দেখুন
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "ranking" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" /> র‍্যাংকিং
                </h3>
                <p className="text-slate-500 mt-1">নির্দিষ্ট তারিখের মধ্যে ছাত্রদের পারফরম্যান্স র‍্যাংকিং</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 p-2 border rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400 ml-2" />
                  <input 
                    type="date" 
                    value={rankingStartDate} 
                    onChange={e => setRankingStartDate(e.target.value)} 
                    className="p-2 bg-transparent outline-none text-sm font-bold text-slate-700" 
                  />
                  <span className="text-slate-400">থেকে</span>
                  <input 
                    type="date" 
                    value={rankingEndDate} 
                    onChange={e => setRankingEndDate(e.target.value)} 
                    className="p-2 bg-transparent outline-none text-sm font-bold text-slate-700" 
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    { id: 'sabok', label: 'সবক', icon: BookOpen },
                    { id: 'sat_sabok', label: '৭ ছবক', icon: CheckCircle2 },
                    { id: 'amukhta', label: 'আমুখতা', icon: History },
                    { id: 'tilawat', label: 'তিলাওয়াত', icon: GraduationCap },
                    { id: 'sabina', label: 'সবিনা', icon: Award }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setRankingCategory(cat.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all border-2",
                        rankingCategory === cat.id 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" 
                          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <cat.icon className="w-5 h-5" /> {cat.label}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-slate-500 text-sm uppercase tracking-wider">
                        <th className="px-6 py-4 font-black">র‍্যাংক</th>
                        <th className="px-6 py-4 font-black">ছাত্রের নাম ও রোল</th>
                        <th className="px-6 py-4 font-black text-center">মোট পয়েন্ট</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getRankingData().map((student, index) => {
                        const isTop3 = index < 3 && student.score > 0;
                        return (
                          <tr key={student.id} className="bg-white hover:bg-slate-50 transition-colors group shadow-sm">
                            <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-100 font-black text-lg">
                              {isTop3 ? (
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md",
                                  index === 0 ? "bg-yellow-400" : index === 1 ? "bg-slate-300" : "bg-amber-600"
                                )}>
                                  <Trophy className="w-5 h-5" />
                                </div>
                              ) : (
                                <span className="text-slate-400">#{index + 1}</span>
                              )}
                            </td>
                            <td className="px-6 py-5 border-y border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                                  {student.roll}
                                </div>
                                <div className="font-bold text-slate-900">{student.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-100 text-center font-black text-xl text-emerald-600">
                              {student.score} <span className="text-xs text-slate-400 font-bold">
                                {rankingCategory === 'sabok' || rankingCategory === 'amukhta' ? 'পৃষ্ঠা' : 
                                 rankingCategory === 'sat_sabok' ? 'দিন' : 'পারা'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 bg-emerald-50/50 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl">
                  {showDetails.student.roll}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">{showDetails.student.name}</h3>
                  <p className="text-slate-500 font-bold">{new Date(selectedDate).toLocaleDateString('bn-BD')} এর রিপোর্ট</p>
                </div>
              </div>
              <button onClick={() => setShowDetails(null)} className="p-3 bg-white text-slate-400 rounded-2xl hover:text-rose-500 shadow-sm transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              {!showDetails.report ? (
                <div className="text-center py-10">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-10 h-10 text-rose-300" />
                  </div>
                  <p className="text-slate-500 font-bold text-lg">আজকের কোনো রিপোর্ট পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-4">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                      <h4 className="font-black text-emerald-900">সবক</h4>
                    </div>
                    <div className="space-y-2">
                      {showDetails.report.sabok?.map((s: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                          <span className="font-bold text-slate-700">{s.reading}</span>
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black">পৃষ্ঠা: {s.page}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-blue-600" />
                      <h4 className="font-black text-blue-900">সাত ছবক</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                      <span className={cn("font-black text-lg", showDetails.report.sat_sabok ? "text-emerald-600" : "text-rose-400")}>
                        {showDetails.report.sat_sabok ? "আলহামদুলিল্লাহ, শুনিয়েছে" : "আজ শুনায়নি"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <History className="w-6 h-6 text-purple-600" />
                      <h4 className="font-black text-purple-900">আমুখতা</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">পারা:</span>
                        <span className="text-slate-900 font-black">{showDetails.report.amukhta.from_para} - {showDetails.report.amukhta.to_para}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">মোট পৃষ্ঠা:</span>
                        <span className="text-purple-600 font-black">{showDetails.report.amukhta.total_pages} পৃষ্ঠা</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-4">
                      <GraduationCap className="w-6 h-6 text-orange-600" />
                      <h4 className="font-black text-orange-900">তিলাওয়াত</h4>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">পারা:</span>
                        <span className="text-slate-900 font-black">{showDetails.report.tilawat.from_para} - {showDetails.report.tilawat.to_para}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">মোট পারা:</span>
                        <span className="text-orange-600 font-black">{showDetails.report.tilawat.total_paras} পারা</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8 text-center"
          >
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">রিপোর্ট ডিলিট করবেন?</h3>
            <p className="text-slate-500 font-medium mb-8">এই অ্যাকশনটি বাতিল করা যাবে না। নিশ্চিত করতে এডমিন পাসওয়ার্ড দিন।</p>
            
            <input 
              type="password" 
              placeholder="এডমিন পাসওয়ার্ড" 
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-center font-bold tracking-widest focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                বাতিল
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
              >
                ডিলিট করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
