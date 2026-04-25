import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import { 
  Clock,
  LayoutDashboard, 
  Phone, 
  ArrowRight, 
  Loader2, 
  Bell, 
  BookOpen, 
  CreditCard, 
  CheckCircle2,
  AlertCircle,
  LogOut,
  GraduationCap,
  User,
  Users,
  History,
  Receipt,
  MessageSquare,
  Send,
  Heart,
  Trophy,
  Calendar,
  Download,
  FileText,
  Star,
  Coffee,
  Utensils,
  Award,
  Hash
} from "lucide-react";
import { cn } from "../lib/utils";
import { useToast } from "./ToastContext";

export default function ParentPortal() {
  const { addToast } = useToast();
  const [identifier, setIdentifier] = useState(() => localStorage.getItem("guardianPhone") || "");
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [deviceHistory, setDeviceHistory] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [hifzRecords, setHifzRecords] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [hifzSettings, setHifzSettings] = useState<any>(null);
  const [hifzStartDate, setHifzStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [hifzEndDate, setHifzEndDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [studentTasks, setStudentTasks] = useState<any[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<any[]>([]);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [selectedClass, setSelectedClass] = useState("সব");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedPayMonths, setSelectedPayMonths] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [noticeVotes, setNoticeVotes] = useState<Record<string, any>>({});
  const [votingOn, setVotingOn] = useState<string | null>(null);
  const [fetchingVotes, setFetchingVotes] = useState<string | null>(null);
  const [voteMessage, setVoteMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Daily Amal State
  const [amalTasks, setAmalTasks] = useState<any[]>([]);
  const [amalLogs, setAmalLogs] = useState<Record<string, boolean>>({});
  const [isAmalSubmitted, setIsAmalSubmitted] = useState(false);
  const [savingAmal, setSavingAmal] = useState(false);
  const [amalDate, setAmalDate] = useState(new Date().toLocaleDateString('en-CA'));
  const todayDate = new Date().toLocaleDateString('en-CA');
  const [amalRankings, setAmalRankings] = useState<any[]>([]);
  const [userAmalStats, setUserAmalStats] = useState<any>(null);

  // Syllabus & Routine State
  const [syllabusRoutines, setSyllabusRoutines] = useState<any[]>([]);
  
  // Live Payment Modal State
  const [showLivePayment, setShowLivePayment] = useState(false);
  const [livePaymentMethod, setLivePaymentMethod] = useState("");
  const [livePaymentStep, setLivePaymentStep] = useState(1);
  const [livePaymentPhone, setLivePaymentPhone] = useState("");
  const [livePaymentTrxID, setLivePaymentTrxID] = useState("");
  const [livePaymentReference, setLivePaymentReference] = useState("");
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [selectedResultExam, setSelectedResultExam] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const [foodMenu, setFoodMenu] = useState<any[]>([]);
  const [loadingFood, setLoadingFood] = useState(false);

  const fetchFoodMenu = async () => {
    setLoadingFood(true);
    try {
      const res = await fetch('/api/food-menu');
      const data = await res.json();
      if (Array.isArray(data)) setFoodMenu(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFood(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'food-menu') fetchFoodMenu();
  }, [activeTab]);

  const monthsList = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  const initiateLivePayment = (method: string) => {
    if (selectedPayMonths.length === 0) {
      alert("অন্তত একটি মাস নির্বাচন করুন");
      return;
    }
    setLivePaymentMethod(method);
    setLivePaymentStep(1);
    setLivePaymentPhone("");
    setLivePaymentTrxID("");
    setLivePaymentReference("");
    setShowLivePayment(true);
  };

  const processLivePayment = async () => {
    if (!livePaymentTrxID || !livePaymentReference) {
      alert("Transaction ID এবং Reference দিন");
      return;
    }
    setPaying(true);
    setPaymentMessage("");
    try {
      const amount = selectedPayMonths.length * (student.monthly_fee || 500);
      const res = await fetch("/api/parent/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email || `${student.student_code}@madrasa.com`,
          months: selectedPayMonths,
          year: selectedYear,
          amount,
          method: `manual_${livePaymentMethod}`,
          transactionId: livePaymentTrxID,
          senderPhone: livePaymentPhone,
          reference: livePaymentReference
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.success) {
        setPaymentMessage(data.message);
        setShowLivePayment(false);
        setSelectedPayMonths([]);
        // Refresh fees and history
        const [profileRes, historyRes] = await Promise.all([
          fetch(`/api/students/${student.id}/full-profile`),
          fetch(`/api/parent/payment-history/${student.id}`)
        ]);
        const profileData = await profileRes.json();
        setFees(profileData.fees || []);
        setPaymentHistory(await historyRes.json());
      } else {
        alert(data.error || "পেমেন্ট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("পেমেন্ট ব্যর্থ হয়েছে");
    }
    setPaying(false);
  };

  const handlePayment = async (method: string) => {
    if (selectedPayMonths.length === 0) {
      alert("অন্তত একটি মাস নির্বাচন করুন");
      return;
    }
    setPaying(true);
    setPaymentMessage("");
    try {
      const amount = selectedPayMonths.length * (student.monthly_fee || 500);
      const res = await fetch("/api/parent/pay-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          studentName: student.name,
          studentEmail: student.email || `${student.student_code}@madrasa.com`,
          months: selectedPayMonths,
          year: selectedYear,
          amount,
          method
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (method === "udyoktapay" && data.payment_url) {
        // Open payment gateway in a new tab to avoid iframe/security blocking
        const paymentWindow = window.open(data.payment_url, '_blank');
        if (!paymentWindow) {
          // If popup is blocked, try same window as fallback
          window.location.href = data.payment_url;
        } else {
          setPaymentMessage("পেমেন্ট গেটওয়ে নতুন ট্যাবে ওপেন হয়েছে। পেমেন্ট শেষ করে এখানে ফিরে আসুন।");
        }
      } else if (data.success) {
        setPaymentMessage(data.message);
        // Refresh fees after manual payment instruction
        const profileRes = await fetch(`/api/students/${student.id}/full-profile`);
        const profileData = await profileRes.json();
        setFees(profileData.fees || []);
      } else {
        alert(data.error || "পেমেন্ট ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("পেমেন্ট ব্যর্থ হয়েছে");
    }
    setPaying(false);
  };

  useEffect(() => {
    fetch("/api/site-settings")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(setSettings)
      .catch(err => console.error("Failed to load settings:", err));
    fetch("/api/admin/settings/hifz")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(setHifzSettings)
      .catch(err => console.error("Failed to load hifz settings:", err));
    
    // Auto login if identifier exists in localStorage
    const savedIdentifier = localStorage.getItem("guardianPhone");
    if (savedIdentifier) {
      handleLogin(null, savedIdentifier);
    }

    // Handle Deep Linking to Tabs
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }

    // Handle payment verification from URL params
    const paymentStatus = urlParams.get("payment");
    const invoiceId = urlParams.get("invoice_id");

    if (paymentStatus === "success" && invoiceId) {
      setPaymentMessage("পেমেন্ট যাচাই করা হচ্ছে, দয়া করে অপেক্ষা করুন...");
      fetch("/api/udyoktapay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_id: invoiceId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaymentMessage(data.message);
          // Remove query params from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setPaymentMessage(data.message);
        }
      })
      .catch(() => {
        setPaymentMessage("পেমেন্ট যাচাই করতে সমস্যা হয়েছে।");
      });
    } else if (paymentStatus === "cancel") {
      setPaymentMessage("পেমেন্ট বাতিল করা হয়েছে।");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("/api/notices");
      if (res.ok) setNotices(await res.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (student) {
      if (activeTab === "amal") {
        fetchAmalData();
        fetchAmalRankings();
      }
      if (student.isTeacher && activeTab === "student-amal") {
        fetchStudentAmalData();
      }
    }
  }, [student, activeTab, amalDate, selectedClass]);

  const fetchStudentAmalData = async () => {
    setFetchingStatus(true);
    try {
      const [tasksRes, statusRes] = await Promise.all([
        fetch("/api/amal-tasks?target=student"),
        fetch(`/api/admin/amal-submission-status?target=student&date=${amalDate}`)
      ]);
      if (tasksRes.ok && statusRes.ok) {
        setStudentTasks(await tasksRes.json());
        let status = await statusRes.json();
        if (selectedClass !== "সব") {
          status = status.filter((s: any) => s.class === selectedClass);
        }
        setSubmissionStatus(status);
      }
    } catch (err) {
      console.error("Failed to fetch student amal data:", err);
    } finally {
      setFetchingStatus(false);
    }
  };

  const toggleStudentAmal = async (studentId: string, taskId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistically update
    setSubmissionStatus(prev => prev.map(s => {
      if (s.userId === studentId) {
        const newLogs = [...s.logs];
        const logIndex = newLogs.findIndex(l => l.task_id === taskId);
        if (logIndex > -1) {
          newLogs[logIndex] = { ...newLogs[logIndex], status: newStatus ? "completed" : "pending" };
        } else {
          newLogs.push({ task_id: taskId, status: newStatus ? "completed" : "pending" });
        }
        return { ...s, submitted: true, logs: newLogs };
      }
      return s;
    }));

    try {
      await fetch("/api/amal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: studentId,
          user_type: "student",
          date: amalDate,
          logs: { [taskId]: newStatus ? "completed" : "pending" }
        })
      });
    } catch (err) {
      console.error("Failed to save student amal log:", err);
      fetchStudentAmalData();
    }
  };

  const fetchAmalRankings = async () => {
    try {
      const target = student.isTeacher ? "teacher" : "student";
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      
      const res = await fetch(`/api/amal-rankings?target=${target}&startDate=${firstDayOfMonth}&endDate=${lastDayOfMonth}`);
      if (res.ok) {
        const data = await res.json();
        setAmalRankings(data);
        const myStats = data.find((r: any) => r.userId === student.id);
        if (myStats) {
          const rank = data.findIndex((r: any) => r.userId === student.id) + 1;
          setUserAmalStats({ ...myStats, rank });
        }
      }
    } catch (error) {
      console.error("Failed to fetch rankings:", error);
    }
  };

  useEffect(() => {
    if (student && activeTab === "syllabus") {
      fetchSyllabusRoutines();
    }
  }, [student, activeTab]);

  const fetchAmalData = async () => {
    try {
      const target = student.isTeacher ? "teacher" : "student";
      const [tasksRes, logsRes] = await Promise.all([
        fetch(`/api/amal-tasks?target=${target}`),
        fetch(`/api/amal-logs?user_id=${student.id}&date=${amalDate}`)
      ]);
      if (tasksRes.ok && logsRes.ok) {
        const tasks = await tasksRes.json();
        const logs = await logsRes.json();
        setAmalTasks(tasks);
        const logMap: Record<string, boolean> = {};
        let submitted = false;
        if (Array.isArray(logs)) {
          logs.forEach((log: any) => {
            if (log.task_id === "submission_record") {
              submitted = true;
            } else {
              logMap[log.task_id] = log.status === "completed";
            }
          });
        }
        setAmalLogs(logMap);
        setIsAmalSubmitted(submitted);
      }
    } catch (err) {
      console.error("Failed to fetch amal data:", err);
    }
  };

  const fetchSyllabusRoutines = async () => {
    try {
      const res = await fetch("/api/admin/syllabus-routines");
      if (res.ok) {
        setSyllabusRoutines(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch syllabus/routines:", err);
    }
  };

  const toggleAmal = (taskId: string) => {
    if (isAmalSubmitted) return;
    setAmalLogs(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const submitAmal = async () => {
    if (isAmalSubmitted) return;
    setSavingAmal(true);
    try {
      const logsToSave: Record<string, string> = {
        "submission_record": "completed"
      };
      
      amalTasks.forEach(task => {
        logsToSave[task.id] = amalLogs[task.id] ? "completed" : "pending";
      });

      const res = await fetch("/api/amal-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: student.id,
          user_type: student.isTeacher ? "teacher" : "student",
          date: amalDate,
          logs: logsToSave
        })
      });
      
      if (res.ok) {
        setIsAmalSubmitted(true);
      } else {
        alert("আমল সাবমিট করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      console.error("Failed to submit amal:", err);
      alert("আমল সাবমিট করতে সমস্যা হয়েছে।");
    } finally {
      setSavingAmal(false);
    }
  };

  const fetchVotes = async (noticeId: string) => {
    setFetchingVotes(noticeId);
    try {
      const res = await fetch(`/api/notices/${noticeId}/votes`);
      if (res.ok) {
        const data = await res.json();
        setNoticeVotes((prev: any) => ({ ...prev, [noticeId]: data }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingVotes(null);
    }
  };

  const handleVote = async (noticeId: string, vote: 'yes' | 'no') => {
    if (!student) return;
    setVotingOn(noticeId);
    setVoteMessage(null);
    try {
      const res = await fetch(`/api/notices/${noticeId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: student.id, student_name: student.name, vote })
      });
      if (res.ok) {
        setVoteMessage({ text: "আপনার ভোট গ্রহণ করা হয়েছে", type: 'success' });
        fetchVotes(noticeId);
      } else {
        const data = await res.json();
        setVoteMessage({ text: data.error || "ভোট দিতে সমস্যা হয়েছে", type: 'error' });
      }
    } catch (error) {
      setVoteMessage({ text: "সার্ভার সমস্যা হয়েছে", type: 'error' });
    } finally {
      setVotingOn(null);
      setTimeout(() => setVoteMessage(null), 3000);
    }
  };

  const toBn = (n: any) => {
    if (n === null || n === undefined) return "---";
    const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return n.toString().replace(/\d/g, (d: string) => banglaDigits[parseInt(d)]);
  };

  const handleLogin = async (e: React.FormEvent | null, loginIdentifier: string = identifier) => {
    if (e) e.preventDefault();
    if (!loginIdentifier) return;
    
    setLoading(true);
    setError("");

    try {
      let response = await fetch("/api/parent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier })
      });

      let isTeacher = false;
      let data;

      if (!response.ok) {
        const teacherResponse = await fetch("/api/teacher-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: loginIdentifier })
        });

        if (!teacherResponse.ok) {
          const errData = await response.json().catch(() => ({}));
          const loginByIdEnabled = hifzSettings?.guardian_login_by_id_enabled !== false;
          throw new Error(errData.error || (loginByIdEnabled ? "মোবাইল নম্বর, ইমেইল বা আইডি সঠিক নয়" : "মোবাইল নম্বর বা ইমেইল সঠিক নয়"));
        }
        
        data = await teacherResponse.json();
        isTeacher = true;
      } else {
        data = await response.json();
      }

      setStudent({ ...data, isTeacher });
      localStorage.setItem("guardianPhone", loginIdentifier);
      fetchFullProfile(data.id);
      
      if (isTeacher) {
        const [attRes, salaryRes, settingsRes] = await Promise.all([
          fetch(`/api/admin/teacher-attendance?date=${new Date().toLocaleDateString('en-CA')}`),
          fetch(`/api/admin/teachers/${data.id}/salaries`),
          fetch("/api/site-settings")
        ]);
        
        const attData = await attRes.json();
        const myAtt = Array.isArray(attData) ? attData.find((a: any) => a.id === data.id) : null;
        setAttendance(myAtt ? [myAtt] : []);
        
        const salaryData = await salaryRes.json();
        setPaymentHistory(Array.isArray(salaryData) ? salaryData : []);
        
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      } else {
        // Fetch related data
        const [attRes, resRes, hifzRes, profileRes, deviceRes, noticeRes, historyRes, settingsRes, hifzSettingsRes] = await Promise.all([
          fetch(`/api/attendance/${data.id}`),
          fetch(`/api/results/${data.id}`),
          fetch(`/api/hifz/${data.id}`),
          fetch(`/api/students/${data.id}/full-profile`),
          fetch(`/api/parent/device-history/${data.id}`),
          fetch("/api/notices"),
          fetch(`/api/parent/payment-history/${data.id}`),
          fetch("/api/site-settings"),
          fetch("/api/admin/settings/hifz")
        ]);
        
        const attData = await attRes.json();
        setAttendance(Array.isArray(attData) ? attData : []);
        
        const resData = await resRes.json();
        setResults(Array.isArray(resData) ? resData : []);
        
        const hifzData = await hifzRes.json();
        setHifzRecords(Array.isArray(hifzData) ? hifzData : []);
        
        const deviceData = await deviceRes.json();
        setDeviceHistory(Array.isArray(deviceData) ? deviceData : []);
        
        const profileData = await profileRes.json();
        setFees(profileData.fees || []);

        const noticeData = await noticeRes.json();
        setNotices(Array.isArray(noticeData) ? noticeData : []);

        const historyData = await historyRes.json();
        setPaymentHistory(Array.isArray(historyData) ? historyData : []);

        const settingsData = await settingsRes.json();
        setSettings(settingsData);

        const hifzSettingsData = await hifzSettingsRes.json();
        setHifzSettings(hifzSettingsData);
      }
    } catch (err: any) {
      setError(err.message);
      addToast(err.message || "লগইন করতে সমস্যা হয়েছে", "error");
      localStorage.removeItem("guardianPhone");
    } finally {
      setLoading(false);
    }
  };

  const fetchFullProfile = async (sId: string) => {
    try {
      const res = await fetch(`/api/students/${sId}/full-profile`);
      if (res.ok) {
        const data = await res.json();
        setFullProfile(data);
        if (data.results && data.results.length > 0) {
          const exams = [...new Set(data.results.map((r: any) => `${r.exam_name}|${r.year || new Date().getFullYear().toString()}`))];
          setSelectedResultExam(exams[exams.length - 1] as string);
        }
      }
    } catch (error) {
      console.error("Error fetching full profile:", error);
    }
  };

  const downloadPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    setDownloading(true);
    try {
      element.classList.remove('hidden');
      // For mobile-friendliness during capture
      const originalStyle = element.style.cssText;
      element.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 800px;
        z-index: -9999;
        background: white;
        display: block !important;
      `;

      const dataUrl = await htmlToImage.toPng(element, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: 'white',
        style: {
          display: 'block'
        }
      });
      
      element.style.cssText = originalStyle;
      element.classList.add('hidden');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(filename);
      addToast("সফলভাবে ডাউনলোড হয়েছে", "success");
    } catch (err) {
      console.error(err);
      addToast("ডাউনলোড করতে সমস্যা হয়েছে", "error");
    } finally {
      setDownloading(false);
      const el = document.getElementById(elementId);
      if (el) el.classList.add('hidden');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("guardianPhone");
    setStudent(null);
    setIdentifier("");
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 w-full max-w-md"
        >
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-emerald-100">
              <Users className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">প্যারেন্ট পোর্টাল</h2>
            <p className="text-slate-500 font-medium">আপনার সন্তানের তথ্য দেখতে লগইন করুন</p>
          </div>

          <form onSubmit={(e) => handleLogin(e)} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                {hifzSettings?.guardian_login_by_id_enabled !== false 
                  ? "মোবাইল নম্বর, ইমেইল বা স্টুডেন্ট কোড" 
                  : "মোবাইল নম্বর বা ইমেইল"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder={hifzSettings?.guardian_login_by_id_enabled !== false 
                    ? "যেমন: 01712345678 বা AH-001" 
                    : "যেমন: 01712345678"}
                  required
                />
                <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2 border border-rose-100"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>লগইন করুন <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">প্যারেন্ট পোর্টাল</h1>
            <p className="text-slate-500 font-medium">আপনার সন্তানের সব আপডেট এখানে দেখুন</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white text-rose-600 rounded-2xl font-bold hover:bg-rose-50 transition-all shadow-sm border border-rose-100 self-start"
          >
            <LogOut className="w-4 h-4" /> লগ আউট
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-3 mb-10 pb-2 scrollbar-hide">
          {student.isTeacher ? [
            { id: "overview", label: "একনজরে", icon: LayoutDashboard },
            { id: "amal", label: "আমার আমল", icon: Heart },
            { id: "student-amal", label: "ছাত্রের আমল", icon: Users },
            { id: "attendance", label: "হাজিরা", icon: CheckCircle2 },
            { id: "payment-history", label: "বেতন হিস্টোরি", icon: CreditCard },
            { id: "notices", label: "নোটিশ", icon: Bell }
          ].map((tab: any) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all whitespace-nowrap border",
                activeTab === tab.id 
                  ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 border-emerald-900" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === "notices" && notices.some(n => {
                const noticeDate = new Date(n.created_at);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return noticeDate >= yesterday;
              }) && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 shadow-sm border-2 border-white z-10 animate-pulse"></span>
              )}
            </motion.button>
          )) : [
            { id: "overview", label: "একনজরে", icon: LayoutDashboard },
            { id: "attendance", label: "হাজিরা", icon: CheckCircle2 },
            { id: "device-history", label: "স্মার্ট হাজিরা লগ", icon: History },
            { id: "food-menu", label: "খাবারের তালিকা", icon: Coffee },
            { id: "results", label: "রেজাল্ট", icon: BookOpen },
            { id: "amal", label: "দৈনিক আমল", icon: Heart },
            { id: "syllabus", label: "রুটিন", icon: BookOpen },
            { id: "notices", label: "নোটিশ", icon: Bell },
            { id: "payment", label: "পেমেন্ট", icon: CreditCard },
            { id: "payment-history", label: "পেমেন্ট হিস্টোরি", icon: History },
            student.is_hifz ? { id: "hifz", label: "হিফজ ট্র্যাকিং", icon: GraduationCap } : null
          ].filter(Boolean).map((tab: any) => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-3 px-8 py-4 rounded-3xl font-black transition-all whitespace-nowrap border",
                activeTab === tab.id 
                  ? "bg-emerald-900 text-white shadow-lg shadow-emerald-900/20 border-emerald-900" 
                  : "bg-white text-slate-500 hover:bg-slate-50 border-slate-200"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === "notices" && notices.some(n => {
                const noticeDate = new Date(n.created_at);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                return noticeDate >= yesterday;
              }) && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-rose-500 shadow-sm border-2 border-white z-10 animate-pulse"></span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card (Left) */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 sticky top-24",
                  activeTab !== 'overview' && "hidden lg:block opacity-60 hover:opacity-100 transition-all"
                )}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500 rounded-[2.5rem] rotate-6 scale-105 opacity-20 group-hover:rotate-12 transition-transform"></div>
                    <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 mb-8 border-4 border-white relative z-10 transition-transform group-hover:scale-105">
                      <img 
                        src={student.photo_url || `https://picsum.photos/seed/${student.id}/200`} 
                        alt={student.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">{student.name}</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {student.isTeacher ? (
                      <span className="text-emerald-700 font-black text-sm bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                        {student.qualification || "শিক্ষক"}
                      </span>
                    ) : (
                      <>
                        <span className="text-emerald-700 font-black text-sm bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                          {student.class} শ্রেণী
                        </span>
                        <span className="text-blue-700 font-black text-sm bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                          রোল: {toBn(student.roll)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="w-full space-y-4 pt-8 border-t border-slate-100 text-left">
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{student.isTeacher ? "শিক্ষক আইডি" : "স্টুডেন্ট আইডি"}</span>
                      <span className="font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg group-hover:bg-slate-100 transition-colors">{student.id}</span>
                    </div>
                    {student.student_code && (
                      <div className="flex justify-between items-center group">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">ইউনিক কোড</span>
                        <span className="font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg group-hover:bg-emerald-100 transition-colors">{student.student_code}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center group">
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">মোবাইল</span>
                      <span className="font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-lg group-hover:bg-rose-100 transition-colors">{toBn(student.phone)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          {/* Main Content Area (Right) */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  {/* Leaderboard Banner */}
                  {amalRankings.length > 0 && userAmalStats && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10 flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 backdrop-blur-sm">
                          <Trophy className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black mb-1">মাসিক লিডারবোর্ড</h3>
                          <p className="text-amber-100 font-medium">আপনার বর্তমান অবস্থান: <span className="font-black text-white text-xl">#{userAmalStats.rank}</span></p>
                        </div>
                      </div>
                      <div className="relative z-10 bg-white/20 px-8 py-4 rounded-3xl backdrop-blur-sm border border-white/30 text-center min-w-[150px]">
                        <div className="text-sm text-amber-100 font-bold uppercase tracking-wider mb-1">মোট পয়েন্ট</div>
                        <div className="text-4xl font-black">{userAmalStats.score}</div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">উপস্থিতি</p>
                        <p className="text-xl font-bold text-slate-900">
                          {attendance.length > 0 ? Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Results Summary Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <BookOpen className="w-5 h-5 text-emerald-600" /> সাম্প্রতিক ফলাফল
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">মোট নম্বর</p>
                          <p className="text-2xl font-black text-emerald-900">
                             {(() => {
                               if (!results || results.length === 0) return toBn(0);
                               const latest = results[results.length-1];
                               const latestResults = results.filter(r => r.exam_name === latest.exam_name && (r.year || new Date().getFullYear().toString()) === (latest.year || new Date().getFullYear().toString()));
                               return toBn(latestResults.reduce((sum, r) => sum + Number(r.marks || 0), 0));
                             })()}
                          </p>
                       </div>
                       <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">গড় (Average)</p>
                          <p className="text-2xl font-black text-blue-900">
                             {(() => {
                               if (!results || results.length === 0) return toBn(0);
                               const latest = results[results.length-1];
                               const latestResults = results.filter(r => r.exam_name === latest.exam_name && (r.year || new Date().getFullYear().toString()) === (latest.year || new Date().getFullYear().toString()));
                               const total = latestResults.reduce((sum, r) => sum + Number(r.marks || 0), 0);
                               return toBn((total / latestResults.length).toFixed(1));
                             })()}
                          </p>
                       </div>
                       <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">গ্রেড (Grade)</p>
                          <p className="text-2xl font-black text-amber-900">
                             {(() => {
                               if (!results || results.length === 0) return "-";
                               const latest = results[results.length-1];
                               const latestResults = results.filter(r => r.exam_name === latest.exam_name && (r.year || new Date().getFullYear().toString()) === (latest.year || new Date().getFullYear().toString()));
                               const total = latestResults.reduce((sum, r) => sum + Number(r.marks || 0), 0);
                               const avg = total / latestResults.length;
                               if (latestResults.some(r => r.grade === 'F')) return "F";
                               return avg >= 80 ? "A+" : avg >= 70 ? "A" : avg >= 60 ? "A-" : avg >= 50 ? "B" : avg >= 40 ? "C" : avg >= 33 ? "D" : "F";
                             })()}
                          </p>
                       </div>
                       <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex flex-col items-center justify-center text-center">
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">র‍্যাঙ্ক (Rank)</p>
                          <p className="text-2xl font-black text-rose-900">
                             {(() => {
                               if (!results || results.length === 0) return "-";
                               const latest = results[results.length-1];
                               const statKey = `${latest.exam_name}|${latest.year || new Date().getFullYear().toString()}`;
                               return fullProfile?.examStats?.[statKey]?.rank ? toBn(fullProfile.examStats[statKey].rank) : "-";
                             })()}
                          </p>
                       </div>
                    </div>
                  </div>

                  {/* Personal Info Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" /> ব্যক্তিগত তথ্য
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">পিতার নাম</p>
                        <p className="font-bold text-slate-900">{student.father_name || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">মাতার নাম</p>
                        <p className="font-bold text-slate-900">{student.mother_name || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">ফোন</p>
                        <p className="font-bold text-slate-900">{student.phone || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">ঠিকানা</p>
                        <p className="font-bold text-slate-900">{student.address || "-"}</p>
                      </div>
                      {student.isTeacher && (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold uppercase">শিক্ষাগত যোগ্যতা</p>
                            <p className="font-bold text-slate-900">{student.qualification || "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold uppercase">যোগদানের তারিখ</p>
                            <p className="font-bold text-slate-900">{student.join_date ? new Date(student.join_date).toLocaleDateString('bn-BD') : "-"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400 font-bold uppercase">মাসিক বেতন</p>
                            <p className="font-bold text-slate-900">৳{student.salary || 0}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-emerald-600" /> সাম্প্রতিক আপডেট
                    </h3>
                    <div className="space-y-4">
                      {results.length > 0 ? (
                        <div className="p-4 border border-emerald-50 bg-emerald-50/30 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">নতুন রেজাল্ট প্রকাশিত</h4>
                              <p className="text-xs text-slate-400">{results[results.length-1].exam_name}</p>
                            </div>
                          </div>
                          <button onClick={() => setActiveTab("results")} className="text-emerald-600 font-bold text-xs">দেখুন</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "attendance" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">হাজিরা রিপোর্ট</h3>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                      <input 
                        type="month" 
                        value={selectedMonth} 
                        onChange={async (e) => {
                          setSelectedMonth(e.target.value);
                          const res = await fetch(`/api/attendance/student/${student.id}/month/${e.target.value}`);
                          setAttendance(await res.json());
                        }}
                        className="bg-transparent border-none focus:ring-0 font-bold text-slate-600 px-4 py-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(() => {
                      const [year, month] = selectedMonth.split('-').map(Number);
                      const now = new Date();
                      const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month;
                      
                      const daysInMonth = new Date(year, month, 0).getDate();
                      const daysToShow = isCurrentMonth ? now.getDate() : daysInMonth;

                      const days = [];
                      for (let d = 1; d <= daysToShow; d++) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        const record = attendance.find(a => a.date === dateStr);
                        
                        days.push(
                          <div key={d} className={cn(
                            "p-4 rounded-2xl border flex flex-col items-center justify-center transition-all",
                            record?.status === 'present' 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                              : record?.status === 'absent'
                                ? "bg-rose-50 border-rose-100 text-rose-700"
                                : "bg-slate-50 border-slate-100 text-slate-400"
                          )}>
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                              {new Date(dateStr).toLocaleDateString('bn-BD', { weekday: 'short' })}
                            </span>
                            <span className="text-xl font-black">{d}</span>
                            <span className="text-[10px] font-bold mt-1">
                              {record?.status === 'present' ? 'উপস্থিত' : record?.status === 'absent' ? 'অনুপস্থিত' : 'তথ্য নেই'}
                            </span>
                          </div>
                        );
                      }
                      return days;
                    })()}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-slate-500">উপস্থিত</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <span className="text-xs font-bold text-slate-500">অনুপস্থিত</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <span className="text-xs font-bold text-slate-500">তথ্য নেই</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "device-history" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">স্মার্ট হাজিরা লগ</h3>
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold">
                      ডিভাইস এন্ট্রি (প্রবেশ ও প্রস্থান)
                    </div>
                  </div>

                  <div className="space-y-4">
                    {deviceHistory.length > 0 ? deviceHistory.map((log, i) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-black",
                            log.action === 'check_in' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {log.action === 'check_in' ? "IN" : "OUT"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{log.action === 'check_in' ? "মাদরাসায় প্রবেশ" : "মাদরাসা থেকে প্রস্থান"}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {new Date(log.timestamp).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-900 text-lg">{log.time}</p>
                          <p className="text-[10px] text-slate-400 font-bold">ডিভাইস আইডি: {log.id?.slice(-4)}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">এখনো কোন স্মার্ট হাজিরা লগ পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "amal" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">দৈনিক আমল</h3>
                        <p className="text-slate-500 font-bold">আপনার আমলগুলো প্রতিদিন রেকর্ড করুন</p>
                      </div>
                      <input 
                        type="date" 
                        value={amalDate}
                        max={todayDate}
                        onChange={(e) => setAmalDate(e.target.value)}
                        className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                      />
                    </div>

                    {amalTasks.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">কোন আমল সেট করা নেই</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {amalTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => toggleAmal(task.id)}
                            disabled={isAmalSubmitted}
                            className={cn(
                              "w-full p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between text-left group",
                              amalLogs[task.id]
                                ? "bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-900/10"
                                : "bg-white border-slate-100",
                              !isAmalSubmitted && !amalLogs[task.id] && "hover:border-emerald-200",
                              isAmalSubmitted && "opacity-70 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-4 rounded-2xl transition-all",
                                amalLogs[task.id] ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400",
                                !isAmalSubmitted && !amalLogs[task.id] && "group-hover:bg-emerald-100 group-hover:text-emerald-500"
                              )}>
                                <Heart className="w-6 h-6 fill-current" />
                              </div>
                              <div>
                                <h4 className={cn(
                                  "font-black text-lg transition-all",
                                  amalLogs[task.id] ? "text-emerald-900" : "text-slate-700"
                                )}>{task.title}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                  {amalLogs[task.id] ? "সম্পন্ন হয়েছে" : "বাকি আছে"}
                                </p>
                              </div>
                            </div>
                            <div className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                              amalLogs[task.id] ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent"
                            )}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {amalTasks.length > 0 && (
                      <div className="mt-8 flex flex-col items-center justify-center border-t border-slate-100 pt-8">
                        {isAmalSubmitted ? (
                          <div className="flex items-center gap-3 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                            <span>এই দিনের আমল সাবমিট করা হয়েছে</span>
                          </div>
                        ) : (
                          <button
                            onClick={submitAmal}
                            disabled={savingAmal}
                            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-3 disabled:opacity-70"
                          >
                            {savingAmal ? <div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div> : <Send className="w-6 h-6" />}
                            আমল সাবমিট করুন
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "student-amal" && student.isTeacher && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">ছাত্রদের আমল</h3>
                        <p className="text-slate-500 font-bold">ছাত্রদের আমলগুলো দেখুন ও টিক দিন</p>
                      </div>
                      <div className="flex gap-4">
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                        >
                          <option value="সব">সব শ্রেণী</option>
                          {settings?.classes?.map((c: string) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <input 
                          type="date" 
                          value={amalDate}
                          max={todayDate}
                          onChange={(e) => setAmalDate(e.target.value)}
                          className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-6 text-sm font-black text-slate-600 uppercase tracking-wider">ছাত্রের নাম</th>
                            <th className="p-6 text-sm font-black text-slate-600 uppercase tracking-wider">আমলসমূহ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fetchingStatus ? (
                            <tr>
                              <td colSpan={2} className="p-12 text-center">
                                <div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div>
                              </td>
                            </tr>
                          ) : submissionStatus.length > 0 ? submissionStatus.map((s) => (
                            <tr key={s.userId} className="hover:bg-slate-50 transition-colors">
                              <td className="p-6">
                                <p className="font-black text-slate-900">{s.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">ID: {s.userId} | {s.class}</p>
                              </td>
                              <td className="p-6">
                                <div className="flex flex-wrap gap-2">
                                  {studentTasks.map(task => {
                                    const log = s.logs.find((l: any) => l.task_id === task.id);
                                    const isCompleted = log?.status === "completed";
                                    return (
                                      <button
                                        key={task.id}
                                        onClick={() => toggleStudentAmal(s.userId, task.id, isCompleted)}
                                        className={cn(
                                          "px-3 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2",
                                          isCompleted 
                                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" 
                                            : "bg-white text-slate-400 border-slate-100 hover:border-emerald-200"
                                        )}
                                      >
                                        {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                                        {task.title}
                                      </button>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={2} className="p-12 text-center text-slate-400 font-bold">কোনো ছাত্র পাওয়া যায়নি</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

        {activeTab === "syllabus" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-1">সিলেবাস ও রুটিন</h3>
                <p className="text-slate-500 font-bold">আপনার প্রয়োজনীয় সব রুটিন ও সিলেবাস এখানে পাবেন</p>
              </div>

              {syllabusRoutines.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">কোন সিলেবাস বা রুটিন পাওয়া যায়নি</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {syllabusRoutines.map((item) => (
                    <div key={item.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-lg text-slate-900">{item.title}</h4>
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-bold border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        দেখুন ও ডাউনলোড করুন <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "food-menu" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Utensils className="text-emerald-600" /> প্রতিদিনের খাবারের মেনু
                </h3>
                <p className="text-slate-500 font-bold mt-2">মাদরাসা থেকে পরিবেশন করা খাবারের তালিকা</p>
            </div>

            {loadingFood ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {foodMenu.sort((a, b) => {
                    const parseSerial = (val: any) => {
                      if (val === undefined || val === null || val === "") return 999999;
                      let s = String(val).trim();
                      const banglaDigits: any = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
                      s = s.replace(/[০-৯]/g, (m: string) => banglaDigits[m]);
                      const n = parseInt(s.replace(/[^0-9]/g, ''));
                      return isNaN(n) ? 999999 : n;
                    };
                    return parseSerial(a.serial || a.order) - parseSerial(b.serial || b.order);
                  }).map((item, idx) => (
                    <div key={item.id || idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                      <div className="relative mb-4">
                        {item.image_url ? (
                          <img src={item.image_url} className="w-full aspect-video object-cover rounded-3xl" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full aspect-video bg-emerald-50 rounded-3xl flex items-center justify-center">
                            <Utensils className="w-12 h-12 text-emerald-200" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl font-black text-xs shadow-sm">
                          {item.title}
                        </div>
                      </div>
                      <p className="text-slate-700 font-bold leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                  {foodMenu.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                      <Utensils className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">কোন খাবারের তালিকা পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
            )}
          </motion.div>
        )}

              {activeTab === "results" && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                  <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                      <div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">পরীক্ষার ফলাফল</h3>
                        <p className="text-slate-500 font-bold">সকল পরীক্ষার বিস্তারিত ফলাফল ও মার্কশিট</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {fullProfile && selectedResultExam && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => downloadPDF('student-marksheet-template', `Marksheet_${student.name}.pdf`)}
                            disabled={downloading}
                            className="flex items-center gap-3 px-8 py-4 bg-emerald-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50"
                          >
                            {downloading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Download className="w-5 h-5" />
                            )}
                            মার্কশিট ডাউনলোড
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-10">
                      {fullProfile?.examStats && Object.keys(fullProfile.examStats).sort((a, b) => b.localeCompare(a)).map(examKey => (
                        <button
                          key={examKey}
                          onClick={() => setSelectedResultExam(examKey)}
                          className={cn(
                            "px-6 py-3 rounded-2xl font-black text-sm transition-all border-2",
                            selectedResultExam === examKey
                              ? "bg-emerald-900 text-white border-emerald-900 shadow-lg shadow-emerald-900/10"
                              : "bg-white text-slate-400 border-slate-100 hover:border-emerald-200 hover:text-emerald-600"
                          )}
                        >
                          {examKey.split('|')[0]} ({toBn(examKey.split('|')[1])})
                        </button>
                      ))}
                    </div>

                    {selectedResultExam && fullProfile?.examStats?.[selectedResultExam] ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-500" /> মোট নম্বর
                            </p>
                            <p className="text-3xl font-black text-slate-900">{toBn(fullProfile.examStats[selectedResultExam].myTotal)}</p>
                          </div>
                          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Award className="w-3 h-3" /> গ্রেড
                            </p>
                            <p className="text-3xl font-black text-emerald-900">
                              {(() => {
                                const [exam, year] = selectedResultExam.split('|');
                                const subResults = fullProfile.results.filter((r: any) => r.exam_name === exam && (r.year || new Date().getFullYear().toString()) === year);
                                const avg = fullProfile.examStats[selectedResultExam].myTotal / subResults.length;
                                if (subResults.some((r: any) => r.grade === 'F')) return "F";
                                return avg >= 80 ? "A+" : avg >= 70 ? "A" : avg >= 60 ? "A-" : avg >= 50 ? "B" : avg >= 40 ? "C" : avg >= 33 ? "D" : "F";
                              })()}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Hash className="w-3 h-3" /> র‍্যাঙ্ক
                            </p>
                            <p className="text-3xl font-black text-blue-900">
                              #{toBn(fullProfile.examStats[selectedResultExam].rank)}
                              <span className="text-sm font-bold text-blue-400 ml-1">/{toBn(fullProfile.examStats[selectedResultExam].totalStudents)}</span>
                            </p>
                          </div>
                          <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100">
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                              <Trophy className="w-3 h-3" /> সর্বোচ্চ
                            </p>
                            <p className="text-3xl font-black text-orange-900">{toBn(fullProfile.examStats[selectedResultExam].highestMarks)}</p>
                          </div>
                        </div>

                        {/* Marks Table */}
                        <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm bg-white">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50">
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">বিষয়</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">প্রাপ্ত নম্বর</th>
                                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">গ্রেড</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {fullProfile.results
                                .filter((r: any) => r.exam_name === selectedResultExam.split('|')[0] && (r.year || new Date().getFullYear().toString()) === selectedResultExam.split('|')[1])
                                .map((res: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-5">
                                      <p className="font-extrabold text-slate-700 group-hover:text-emerald-900 transition-colors">{res.subject}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                      <span className={cn(
                                        "inline-block px-4 py-1.5 rounded-xl font-black text-lg",
                                        Number(res.marks) < 33 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                      )}>
                                        {toBn(res.marks)}
                                      </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                      <span className={cn(
                                        "font-black text-xl",
                                        res.grade === 'F' ? "text-rose-500" : "text-emerald-500"
                                      )}>
                                        {res.grade}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">ফলাফল দেখতে ওপরের পরীক্ষা নির্বাচন করুন</p>
                      </div>
                    )}
                  </div>

                  {/* Marksheet Template (Hidden) */}
                  {fullProfile && (
                    <div id="student-marksheet-template" className="hidden absolute top-0 left-0 bg-white w-[794px] min-h-[1123px] mx-auto text-center" style={{ padding: '80px 48px 48px 48px', overflow: 'hidden', position: 'relative' }}>
                      {/* Watermark Logo/Pattern */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <GraduationCap className="w-96 h-96" style={{ color: '#064e3b' }} />
                      </div>
                      
                      {/* Header Section */}
                      <div className="relative z-10 flex flex-col items-center justify-center mb-10 pb-8" style={{ borderBottom: '4px double #10b981' }}>
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-200">
                          <GraduationCap className="w-12 h-12" style={{ color: '#059669' }} />
                        </div>
                        <h2 className="text-5xl font-black mb-3 drop-shadow-sm" style={{ color: '#064e3b', fontFamily: 'sans-serif' }}>{settings?.title || "আল হেরা মাদরাসা"}</h2>
                        <div className="px-6 py-2 rounded-full" style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981' }}>
                          <p className="text-xl font-bold tracking-wide" style={{ color: '#047857' }}>একাডেমিক ট্রান্সক্রিপ্ট / মার্কশিট</p>
                        </div>
                        <p className="text-lg font-bold mt-4" style={{ color: '#475569' }}>পরীক্ষা: {(() => {
                          if (!selectedResultExam) return "";
                          const [exam, year] = selectedResultExam.split('|');
                          return `${exam} (${year})`;
                        })()}</p>
                      </div>
                      
                      {/* Student Info Section */}
                      <div className="relative z-10 flex justify-between items-center mb-10 text-left p-8 rounded-2xl shadow-sm" style={{ backgroundColor: '#f8fafc', borderLeft: '8px solid #059669', borderRight: '8px solid #059669' }}>
                        <div>
                          <h3 className="text-3xl font-black mb-3" style={{ color: '#0f172a' }}>{fullProfile.student.name}</h3>
                          <div className="grid grid-cols-1 gap-2">
                            <p className="text-lg font-bold" style={{ color: '#334155' }}><span style={{ color: '#64748b' }}>পিতার নাম:</span> {fullProfile.student.father_name}</p>
                            <p className="text-lg font-bold" style={{ color: '#334155' }}><span style={{ color: '#64748b' }}>মাতার নাম:</span> {fullProfile.student.mother_name}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-2xl font-black mb-2" style={{ color: '#059669' }}>আইডি: {fullProfile.student.studentId || fullProfile.student.id}</p>
                          <p className="text-lg font-bold" style={{ color: '#334155' }}><span style={{ color: '#64748b' }}>শ্রেণী:</span> {fullProfile.student.class}</p>
                          <p className="text-lg font-bold" style={{ color: '#334155' }}><span style={{ color: '#64748b' }}>রোল:</span> {fullProfile.student.roll}</p>
                        </div>
                      </div>

                      {/* Stats Section */}
                      {selectedResultExam && fullProfile && fullProfile.examStats && fullProfile.examStats[selectedResultExam] && (
                        <div className="relative z-10 grid grid-cols-3 gap-6 mb-10">
                          <div className="p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
                            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>মোট নম্বর</p>
                            <p className="text-2xl font-black" style={{ color: '#1e293b' }}>{fullProfile.examStats[selectedResultExam].myTotal}</p>
                          </div>
                          <div className="p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #8b5cf6' }}>
                            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>গড় নম্বর</p>
                            <p className="text-2xl font-black" style={{ color: '#1e293b' }}>
                              {(() => {
                                const [exam, year] = selectedResultExam.split('|');
                                const resData = fullProfile.results.filter((r: any) => r.exam_name === exam && (r.year || new Date().getFullYear().toString()) === year);
                                return resData.length > 0 
                                  ? (fullProfile.examStats[selectedResultExam].myTotal / resData.length).toFixed(1)
                                  : "0.0";
                              })()}
                            </p>
                          </div>
                          <div className="p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderTop: '4px solid #10b981' }}>
                            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#059669' }}>মেধা স্থান</p>
                            <p className="text-3xl font-black" style={{ color: '#047857' }}>
                              {fullProfile.examStats[selectedResultExam].rank} <span className="text-lg font-bold" style={{ color: '#10b981' }}>/ {fullProfile.examStats[selectedResultExam].totalStudents}</span>
                            </p>
                          </div>
                          <div className="p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #f59e0b' }}>
                            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>সর্বোচ্চ নম্বর</p>
                            <p className="text-2xl font-black" style={{ color: '#1e293b' }}>{fullProfile.examStats[selectedResultExam].highestMarks}</p>
                          </div>
                          <div className="p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #06b6d4' }}>
                            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>উপস্থিতি</p>
                            <p className="text-2xl font-black" style={{ color: '#1e293b' }}>
                              {fullProfile.attendance.length > 0 
                                ? Math.round((fullProfile.attendance.filter((a: any) => a.status === 'present').length / fullProfile.attendance.length) * 100) 
                                : 0}%
                            </p>
                          </div>
                          <div className="p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderTop: '4px solid #ec4899' }}>
                            <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>ফলাফল</p>
                            <p className={cn("text-2xl font-black", 
                              (() => {
                                const [exam, year] = selectedResultExam.split('|');
                                return fullProfile.results.filter((r: any) => r.exam_name === exam && (r.year || new Date().getFullYear().toString()) === year).some((r: any) => r.grade === 'F') 
                                  ? "text-rose-600" 
                                  : "text-emerald-600"
                              })()
                            )} style={(() => {
                                const [exam, year] = selectedResultExam.split('|');
                                return fullProfile.results.filter((r: any) => r.exam_name === exam && (r.year || new Date().getFullYear().toString()) === year).some((r: any) => r.grade === 'F') 
                                  ? { color: '#e11d48' } : { color: '#059669' };
                              })()}>
                              {(() => {
                                const [exam, year] = selectedResultExam.split('|');
                                const resData = fullProfile.results.filter((r: any) => r.exam_name === exam && (r.year || new Date().getFullYear().toString()) === year);
                                if (resData.length === 0) return "-";
                                const avg = fullProfile.examStats[selectedResultExam].myTotal / resData.length;
                                return resData.some((r: any) => r.grade === 'F') ? "F" : (avg >= 80 ? "A+" : avg >= 70 ? "A" : avg >= 60 ? "A-" : avg >= 50 ? "B" : avg >= 40 ? "C" : avg >= 33 ? "D" : "F");
                              })()}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Marks Table */}
                      <div className="relative z-10 w-full rounded-2xl overflow-hidden" style={{ border: '2px solid #cbd5e1' }}>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr style={{ backgroundColor: '#f1f5f9' }}>
                              <th className="p-5 font-black text-lg" style={{ color: '#334155', borderBottom: '2px solid #cbd5e1' }}>বিষয়</th>
                              <th className="p-5 font-black text-lg text-center" style={{ color: '#334155', borderBottom: '2px solid #cbd5e1', borderLeft: '1px solid #e2e8f0' }}>নম্বর</th>
                              <th className="p-5 font-black text-lg text-center" style={{ color: '#334155', borderBottom: '2px solid #cbd5e1', borderLeft: '1px solid #e2e8f0' }}>গ্রেড</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              if (!selectedResultExam) return [];
                              const [exam, year] = selectedResultExam.split('|');
                              return fullProfile.results.filter((r: any) => r.exam_name === exam && (r.year || new Date().getFullYear().toString()) === year);
                            })().map((r: any, idx: number, arr: any[]) => {
                              const mk = Number(r.marks) || 0;
                              let markColor = '#0f172a'; // default slate-900
                              if (mk < 33) markColor = '#dc2626'; // red-600
                              else if (mk === 100) markColor = '#10b981'; // emerald-500
                              
                              return (
                                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                  <td className="p-5 font-bold text-lg" style={{ color: '#1e293b', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #e2e8f0' }}>{r.subject}</td>
                                  <td className="p-5 font-black text-2xl text-center" style={{ color: markColor, borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0' }}>{r.marks}</td>
                                  <td className="p-5 font-black text-xl text-center" style={{ color: mk < 33 ? '#dc2626' : '#059669', borderBottom: idx === arr.length - 1 ? 'none' : '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0' }}>{r.grade}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="relative z-10 flex justify-between items-end mt-32 px-8">
                        <div className="text-center">
                          <div className="w-64 border-b-[3px] border-slate-800 mb-3 border-dashed"></div>
                          <p className="font-bold text-xl uppercase tracking-widest text-slate-800">শ্রেণী শিক্ষকের স্বাক্ষর</p>
                        </div>
            <div className="text-center relative">
               {settings?.muhtamim_signature_url && settings.show_muhtamim_signature && (
                 <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-16 pointer-events-none z-10">
                   <img 
                     src={settings.muhtamim_signature_url} 
                     className="w-full h-full object-contain mix-blend-multiply opacity-90" 
                     alt="Signature"
                     referrerPolicy="no-referrer"
                   />
                 </div>
               )}
               <div className="w-64 border-b-[3px] border-slate-800 mb-3 border-dashed"></div>
               <p className="font-bold text-xl uppercase tracking-widest text-slate-800">মুহতামিমের স্বাক্ষর</p>
            </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "payment" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">বাকি মাসের পেমেন্ট</h3>
                    <select 
                      value={selectedYear} 
                      onChange={(e) => { setSelectedYear(e.target.value); setSelectedPayMonths([]); }}
                      className="p-2 border rounded-xl font-bold text-slate-700"
                    >
                      {[...Array(5)].map((_, i) => {
                        const y = new Date().getFullYear() - 2 + i;
                        return <option key={y} value={y}>{y}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
                    {monthsList.map((month) => {
                      const isPaid = fees.some(f => f.month === month && f.year === selectedYear && f.status === "paid");
                      return (
                        <label key={month} className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all border",
                          isPaid ? "bg-emerald-50 border-emerald-200 opacity-50 cursor-not-allowed" : 
                          selectedPayMonths.includes(month) ? "bg-emerald-100 border-emerald-500 shadow-sm" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        )}>
                          <input 
                            type="checkbox" 
                            className="hidden"
                            disabled={isPaid}
                            checked={selectedPayMonths.includes(month)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPayMonths([...selectedPayMonths, month]);
                              } else {
                                setSelectedPayMonths(selectedPayMonths.filter(m => m !== month));
                              }
                            }}
                          />
                          <span className="font-bold text-slate-700">{month}</span>
                          {isPaid ? (
                            <span className="text-xs font-bold text-emerald-600">পরিশোধিত</span>
                          ) : (
                            <span className="text-xs font-bold text-slate-500">৳{student.monthly_fee || 500}</span>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Other Fees Section */}
                  <div className="mt-12">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-600" />
                      অন্যান্য ফি (Other Fees)
                    </h4>
                    <div className="space-y-4">
                      {fees.filter(f => !f.month && f.status === "unpaid").length > 0 ? (
                        fees.filter(f => !f.month && f.status === "unpaid").map((fee) => (
                          <div key={fee.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                            <div>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{fee.category}</p>
                              <h4 className="text-lg font-bold text-slate-900">{fee.name || fee.category}</h4>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-xl font-black text-slate-900">৳{fee.amount}</p>
                                <p className="text-[10px] font-bold text-rose-500 uppercase">বকেয়া</p>
                              </div>
                              <button 
                                onClick={() => {
                                  // For other fees, we'll use a slightly different payment flow or just reuse the manual one
                                  setLivePaymentMethod("");
                                  setLivePaymentStep(1);
                                  setLivePaymentPhone("");
                                  setLivePaymentTrxID("");
                                  setLivePaymentReference(`Fee: ${fee.category}`);
                                  // We need to handle single fee payment in processLivePayment
                                  // For now, let's just alert that they should contact admin or I'll implement it
                                  alert("এই ফি-টি পরিশোধ করতে মুহতামিম সাহেবের সাথে যোগাযোগ করুন অথবা শীঘ্রই অনলাইন পেমেন্ট যুক্ত করা হবে।");
                                }}
                                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95"
                              >
                                পরিশোধ করুন
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-slate-400 py-8 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">কোন অন্যান্য ফি বকেয়া নেই</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedPayMonths.length > 0 && (
                    <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-slate-700">মোট পরিমাণ:</span>
                        <span className="text-2xl font-black text-emerald-700">৳{selectedPayMonths.length * (student.monthly_fee || 500)}</span>
                      </div>
                      
                      {paymentMessage && (
                        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-xl font-bold text-center">
                          {paymentMessage}
                        </div>
                      )}

                      <h4 className="font-bold text-slate-900 mb-6 text-center">পেমেন্ট মেথড নির্বাচন করুন</h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("bkash")}
                            className="p-4 bg-white border-2 border-pink-50 hover:border-pink-200 rounded-3xl transition-all flex flex-col items-center gap-2 group active:scale-95"
                          >
                            <img src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg" className="w-10 h-10 group-hover:scale-110 transition-transform" alt="bkash" />
                            <span className="text-xs font-bold text-pink-600">বিকাশ</span>
                          </button>
                          
                          {settings?.enable_nagad && (
                            <button 
                              disabled={paying}
                              onClick={() => initiateLivePayment("nagad")}
                              className="p-4 bg-white border-2 border-orange-50 hover:border-orange-200 rounded-3xl transition-all flex flex-col items-center gap-2 group active:scale-95"
                            >
                              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Nagad_Logo.svg/1200px-Nagad_Logo.svg.png" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="nagad" />
                              <span className="text-xs font-bold text-orange-600">নগদ</span>
                            </button>
                          )}

                          <button 
                            disabled={paying}
                            onClick={() => initiateLivePayment("rocket")}
                            className="p-4 bg-white border-2 border-purple-50 hover:border-purple-200 rounded-3xl transition-all flex flex-col items-center gap-2 group active:scale-95"
                          >
                            <img src="https://seeklogo.com/images/D/dutch-bangla-rocket-logo-B4D1CC458D-seeklogo.com.png" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" alt="rocket" />
                            <span className="text-xs font-bold text-purple-600">রকেট</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "payment-history" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">{student.isTeacher ? "বেতন হিস্টোরি" : "পেমেন্ট হিস্টোরি"}</h3>
                  <div className="space-y-6">
                    {paymentHistory.length > 0 ? (
                      student.isTeacher ? (
                        // Group salary history by month and year for teachers
                        Object.entries(paymentHistory.reduce((acc: any, payment: any) => {
                          const key = `${payment.month} ${payment.year || ''}`;
                          if (!acc[key]) acc[key] = { month: payment.month, year: payment.year, total_paid: 0, total_salary: payment.total_salary || student.salary || 0, payments: [] };
                          acc[key].total_paid += Number(payment.amount);
                          acc[key].payments.push(payment);
                          return acc;
                        }, {})).map(([key, data]: [string, any]) => (
                          <div key={key} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                  <Receipt className="w-7 h-7" />
                                </div>
                                <div>
                                  <h4 className="text-xl font-black text-slate-900">{data.month} {data.year} মাসের বেতন</h4>
                                  <p className="text-sm text-slate-500 font-bold">মূল বেতন: ৳{data.total_salary}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-black text-emerald-600">৳{data.total_paid}</div>
                                <div className={cn(
                                  "text-xs font-bold px-3 py-1 rounded-full inline-block mt-1",
                                  data.total_salary - data.total_paid > 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                                )}>
                                  {data.total_salary - data.total_paid > 0 ? `বাকি: ৳${data.total_salary - data.total_paid}` : "পরিশোধিত"}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-slate-200 border-dashed">
                              {data.payments.map((p: any) => (
                                <div key={p.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2 text-slate-500 font-bold">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(p.date || p.created_at).toLocaleDateString('bn-BD')}
                                    <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600">প্রদানকারী: {p.given_by || "অ্যাডমিন"}</span>
                                  </div>
                                  <div className="font-black text-slate-700">৳{p.amount}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        // Student payment history
                        paymentHistory.map((payment: any, i: number) => (
                          <div key={payment.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Receipt className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-lg">
                                  {(payment.months || []).join(", ")} {payment.year || ''}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-1">
                                  <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(payment.date || payment.created_at || payment.createdAt).toLocaleDateString('bn-BD')}
                                  </p>
                                  <p className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">{payment.method}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="text-2xl font-black text-emerald-600">৳{payment.amount}</p>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-full",
                                payment.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                payment.status === "rejected" ? "bg-rose-100 text-rose-700" :
                                "bg-amber-100 text-amber-700"
                              )}>
                                {payment.status === "completed" ? "এপ্রুভড" : payment.status === "rejected" ? "বাতিল" : "পেন্ডিং"}
                              </span>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">{student.isTeacher ? "এখনো কোন বেতন হিস্টোরি নেই" : "এখনো কোন পেমেন্ট হিস্টোরি নেই"}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "hifz" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h3 className="text-2xl font-bold text-slate-900">হিফজ ট্র্যাকিং</h3>
                    {hifzSettings?.guardian_view_enabled && (
                      <div className="flex gap-2">
                        <input type="date" value={hifzStartDate} onChange={e => setHifzStartDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                        <input type="date" value={hifzEndDate} onChange={e => setHifzEndDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    )}
                  </div>

                  {hifzSettings?.guardian_view_enabled && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">মোট সবক</p>
                        <p className="text-2xl font-black text-emerald-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.sabok?.length || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">সাত ছবক</p>
                        <p className="text-2xl font-black text-blue-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).filter(r => r.sat_sabok).length}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">আমুখতা (পৃষ্ঠা)</p>
                        <p className="text-2xl font-black text-purple-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.amukhta?.total_pages || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                        <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">তিলাওয়াত (পারা)</p>
                        <p className="text-2xl font-black text-orange-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.tilawat?.total_paras || 0), 0)}
                        </p>
                      </div>
                      <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">সাবীনা (পারা)</p>
                        <p className="text-2xl font-black text-rose-900">
                          {hifzRecords.filter(r => r.date >= hifzStartDate && r.date <= hifzEndDate).reduce((sum, r) => sum + (r.sabina?.total_paras || 0), 0)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {hifzRecords.filter(r => !hifzSettings?.guardian_view_enabled || (r.date >= hifzStartDate && r.date <= hifzEndDate)).length > 0 ? hifzRecords.filter(r => !hifzSettings?.guardian_view_enabled || (r.date >= hifzStartDate && r.date <= hifzEndDate)).map((rec, i) => (
                      <div key={i} className="p-6 border border-slate-100 rounded-3xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                          <span className="font-bold text-slate-900">{new Date(rec.date).toLocaleDateString('bn-BD')}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সবক</p>
                            <div className="text-sm font-bold text-emerald-700">
                              {rec.sabok?.map((s: any, idx: number) => (
                                <div key={idx}>{s.reading} (পৃষ্ঠা {s.page})</div>
                              ))}
                            </div>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সাত ছবক</p>
                            <p className="font-bold text-emerald-700">{rec.sat_sabok ? "হ্যাঁ" : "না"}</p>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">আমুখতা</p>
                            <p className="font-bold text-emerald-700">{rec.amukhta?.from_para} - {rec.amukhta?.to_para} ({rec.amukhta?.total_pages} পৃষ্ঠা)</p>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">তিলাওয়াত</p>
                            <p className="font-bold text-emerald-700">{rec.tilawat?.from_para} - {rec.tilawat?.to_para} ({rec.tilawat?.total_paras} পারা)</p>
                          </div>
                          <div className="text-center border-l border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">সাবীনা</p>
                            <p className="font-bold text-emerald-700">{rec.sabina?.paras} ({rec.sabina?.total_paras} পারা)</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-slate-400 py-12">কোন হিফজ রেকর্ড পাওয়া যায়নি</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "notices" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">নোটিশ বোর্ড</h3>
                  <div className="space-y-6">
                    {voteMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl font-bold text-sm border",
                          voteMessage.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
                        )}
                      >
                        {voteMessage.text}
                      </motion.div>
                    )}
                    {notices.length > 0 ? notices.map((notice, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-slate-900">{notice.title}</h4>
                          <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">
                            {new Date(notice.date).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <p className="text-slate-600 whitespace-pre-line leading-relaxed">{notice.content}</p>
                        {notice.image_url && (
                          <a href={notice.link_url || "#"} target="_blank" rel="noopener noreferrer" className="block mt-4">
                            <img 
                              src={notice.image_url} 
                              alt={notice.title} 
                              className="rounded-2xl object-cover w-full" 
                              style={{ maxWidth: notice.width ? `${notice.width}px` : '100%', height: notice.height ? `${notice.height}px` : 'auto' }}
                              referrerPolicy="no-referrer"
                            />
                          </a>
                        )}

                        {notice.allow_poll && (
                          <div className="mt-6 pt-6 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                              <h5 className="text-sm font-bold text-slate-700">আপনার মতামত দিন (পোল):</h5>
                              {voteMessage && (
                                <span className={cn(
                                  "text-xs font-bold px-3 py-1 rounded-full",
                                  voteMessage.type === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                )}>
                                  {voteMessage.text}
                                </span>
                              )}
                              <button 
                                onClick={() => fetchVotes(notice.id)}
                                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                              >
                                {fetchingVotes === notice.id ? <div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div> : <History className="w-3 h-3" />}
                                ফলাফল দেখুন
                              </button>
                            </div>

                            <div className="flex gap-4 mb-6">
                              <button 
                                disabled={votingOn === notice.id}
                                onClick={() => handleVote(notice.id, 'yes')}
                                className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                              >
                                {votingOn === notice.id ? <div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div> : <CheckCircle2 className="w-4 h-4" />}
                                হ্যাঁ
                              </button>
                              <button 
                                disabled={votingOn === notice.id}
                                onClick={() => handleVote(notice.id, 'no')}
                                className="flex-1 py-3 bg-rose-50 text-rose-700 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                              >
                                {votingOn === notice.id ? <div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div> : <AlertCircle className="w-4 h-4" />}
                                না
                              </button>
                            </div>

                            {noticeVotes[notice.id] && (
                              <div className="space-y-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase">হ্যাঁ</p>
                                    <p className="text-xl font-black text-emerald-900">
                                      {Math.round((noticeVotes[notice.id].yes_count / (noticeVotes[notice.id].total_votes || 1)) * 100)}%
                                    </p>
                                    <p className="text-[10px] text-emerald-600">{noticeVotes[notice.id].yes_count} জন</p>
                                  </div>
                                  <div className="text-center p-3 bg-rose-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-rose-600 uppercase">না</p>
                                    <p className="text-xl font-black text-rose-900">
                                      {Math.round((noticeVotes[notice.id].no_count / (noticeVotes[notice.id].total_votes || 1)) * 100)}%
                                    </p>
                                    <p className="text-[10px] text-rose-600">{noticeVotes[notice.id].no_count} জন</p>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">কারা ভোট দিয়েছেন:</p>
                                  <div className="max-h-32 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                    {noticeVotes[notice.id].voters?.map((v: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center text-[10px] py-1 border-b border-slate-50 last:border-0">
                                        <span className="font-bold text-slate-700">{v.student_name}</span>
                                        <span className={cn(
                                          "px-2 py-0.5 rounded-full font-black",
                                          v.vote === 'yes' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                        )}>
                                          {v.vote === 'yes' ? "হ্যাঁ" : "না"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )) : (
                      <div className="text-center py-20">
                        <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold">এখনো কোন নোটিশ পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showLivePayment && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className={cn(
              "p-6 text-white text-center",
              livePaymentMethod === "bkash" ? "bg-[#E2136E]" : 
              livePaymentMethod === "nagad" ? "bg-[#F7941D]" : 
              "bg-[#8C1515]"
            )}>
              <h2 className="text-2xl font-bold capitalize">{livePaymentMethod} Payment</h2>
              <p className="opacity-90 mt-1">Total Amount: ৳{selectedPayMonths.length * (student.monthly_fee || 500)}</p>
            </div>
            
            <div className="p-8">
              {livePaymentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap">
                      {livePaymentMethod === "bkash" && settings?.bkash_instructions}
                      {livePaymentMethod === "nagad" && settings?.nagad_instructions}
                      {livePaymentMethod === "rocket" && settings?.rocket_instructions}
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-slate-600 font-medium">নিচের নাম্বারে টাকা পাঠিয়ে TrxID দিন</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-sm text-slate-500 font-bold uppercase">{livePaymentMethod} Number (Personal)</p>
                      <p className="text-2xl font-black text-slate-900">
                        {livePaymentMethod === "bkash" ? settings?.bkash_number : 
                         livePaymentMethod === "nagad" ? settings?.nagad_number : 
                         settings?.rocket_number || "Not Set"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">আপনার {livePaymentMethod} নাম্বার</label>
                      <input 
                        type="text" 
                        placeholder="01XXXXXXXXX"
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                        value={livePaymentPhone}
                        onChange={(e) => setLivePaymentPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">Transaction ID (TrxID)</label>
                      <input 
                        type="text" 
                        placeholder="ABC123XYZ"
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold uppercase"
                        value={livePaymentTrxID}
                        onChange={(e) => setLivePaymentTrxID(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase ml-2">Reference</label>
                      <input 
                        type="text" 
                        placeholder="Reference"
                        className="w-full p-4 bg-slate-50 border rounded-2xl font-bold"
                        value={livePaymentReference}
                        onChange={(e) => setLivePaymentReference(e.target.value)}
                      />
                    </div>
                  </div>

                  {settings?.payment_special_note && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-800 whitespace-pre-wrap">{settings?.payment_special_note}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => setShowLivePayment(false)}
                      className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      বাতিল
                    </button>
                    <button 
                      onClick={processLivePayment}
                      disabled={paying}
                      className={cn(
                        "flex-1 py-4 font-bold text-white rounded-xl transition-colors flex justify-center items-center gap-2",
                        livePaymentMethod === "bkash" ? "bg-[#E2136E] hover:bg-[#c4105f]" : 
                        livePaymentMethod === "nagad" ? "bg-[#F7941D] hover:bg-[#d67f18]" : 
                        "bg-[#8C1515] hover:bg-[#6b1010]"
                      )}
                    >
                      {paying ? <div className="relative flex items-center justify-center w-12 h-12">
  <div className="absolute inset-0 rounded-full border-[3px] border-emerald-100"></div>
  <div className="absolute inset-0 rounded-full border-t-[3px] border-t-emerald-500 border-b-[3px] border-b-rose-500 animate-spin"></div>
  <div className="absolute inset-2 rounded-full border-l-[3px] border-l-rose-500 border-r-[3px] border-r-emerald-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
</div> : "পেমেন্ট নিশ্চিত করুন"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
  </svg>
);
