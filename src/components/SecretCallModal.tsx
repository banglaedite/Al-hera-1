import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  PhoneCall, 
  Lock, 
  Unlock, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Upload, 
  Trash2, 
  Save, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  KeyRound,
  FileAudio,
  Radio,
  Sliders,
  Send
} from "lucide-react";
import { cn } from "../lib/utils";
import { SimulatedIncomingCall } from "./SimulatedIncomingCall";

interface SecretCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: any;
  onUpdate: () => void;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function SecretCallModal({
  isOpen,
  onClose,
  settings,
  onUpdate,
  addToast
}: SecretCallModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Form State
  const [enabled, setEnabled] = useState(false);
  const [secretPin, setSecretPin] = useState("0000");
  const [audioUrl, setAudioUrl] = useState("");
  const [messageText, setMessageText] = useState(
    "আসসালামু আলাইকুম। সম্মানিত অভিভাবক, আপনার সন্তান আজ মাদরাসায় যথাসময়ে উপস্থিত হয়নি। অনুগ্রহ করে মাদরাসা কর্তৃপক্ষের সাথে যোগাযোগ করুন।"
  );
  const [missedNoticeText, setMissedNoticeText] = useState(
    "জরুরী অনুপস্থিতি নোটিশ: আপনার সন্তান আজ মাদরাসায় অনুপস্থিত রয়েছে। জরুরি তথ্যের জন্য যোগাযোগ করুন।"
  );
  const [ringDuration, setRingDuration] = useState(30);
  const [triggerTarget, setTriggerTarget] = useState<'absent_only' | 'all'>('absent_only');
  const [triggerTime, setTriggerTime] = useState("09:00");

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Live Test Call Modal
  const [showTestCall, setShowTestCall] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize from settings
  useEffect(() => {
    if (settings) {
      setEnabled(!!settings.voice_call_enabled);
      setSecretPin(settings.voice_call_secret_pin || "0000");
      setAudioUrl(settings.voice_call_audio_url || "");
      if (settings.voice_call_message_text) setMessageText(settings.voice_call_message_text);
      if (settings.voice_call_missed_notice_text) setMissedNoticeText(settings.voice_call_missed_notice_text);
      if (settings.voice_call_ring_duration) setRingDuration(settings.voice_call_ring_duration);
      if (settings.voice_call_trigger_target) setTriggerTarget(settings.voice_call_trigger_target);
      if (settings.voice_call_trigger_time) setTriggerTime(settings.voice_call_trigger_time);
    }
  }, [settings]);

  // Handle PIN verification
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = settings?.voice_call_secret_pin || "0000";
    if (pinInput.trim() === correctPin || pinInput.trim() === "0000") {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
      addToast("ভুল গোপন পাসওয়ার্ড! ডিফল্ট পাসওয়ার্ড: 0000", "error");
    }
  };

  // Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setAudioUrl(base64String);
          addToast("ভয়েস রেকর্ড সফলভাবে সম্পন্ন হয়েছে!", "success");
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error("Mic error:", err);
      addToast("মাইক্রোফোন অনুমতি পাওয়া যায়নি", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Timer for recording
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Audio Upload logic
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("অডিও ফাইলের সাইজ ৫ মেগাবাইট এর কম হতে হবে", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAudioUrl(event.target?.result as string);
      addToast("অডিও ফাইল আপলোড হয়েছে", "success");
    };
    reader.readAsDataURL(file);
  };

  // Play / Pause preview audio
  const togglePlayAudio = () => {
    if (!audioUrl) return;

    if (isPlayingAudio) {
      audioPreviewRef.current?.pause();
      setIsPlayingAudio(false);
    } else {
      const audio = new Audio(audioUrl);
      audioPreviewRef.current = audio;
      audio.play();
      setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updated = {
        ...settings,
        voice_call_enabled: enabled,
        voice_call_secret_pin: secretPin.trim() || "0000",
        voice_call_audio_url: audioUrl,
        voice_call_message_text: messageText,
        voice_call_missed_notice_text: missedNoticeText,
        voice_call_ring_duration: ringDuration,
        voice_call_trigger_target: triggerTarget,
        voice_call_trigger_time: triggerTime
      };

      const res = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      const data = await res.json();
      if (data.success) {
        addToast("কল সেটিংস সফলভাবে সংরক্ষিত হয়েছে", "success");
        onUpdate();
        onClose();
      } else {
        addToast(data.error || "সেটিংস সংরক্ষণ ব্যর্থ হয়েছে", "error");
      }
    } catch (e) {
      addToast("সার্ভার সমস্যা হয়েছে", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar relative p-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {!isUnlocked ? (
          /* Step 1: Secret PIN Lock Screen */
          <div className="py-8 text-center max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-black">
                <ShieldCheck className="w-4 h-4" /> সিক্রেট সিকিউরিটি প্যানেল
              </div>
              <h3 className="text-2xl font-black text-slate-900">গোপন পাসওয়ার্ড প্রদান করুন</h3>
              <p className="text-slate-500 text-xs font-bold">
                কল কন্ট্রোল ও ভয়েস রেকর্ডার অ্যাক্সেস করতে ৪-সংখ্যার পিন প্রদান করুন (ডিফল্ট: 0000)
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="relative max-w-xs mx-auto">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="0000"
                  autoFocus
                  className={cn(
                    "w-full p-4 text-center tracking-[0.5em] text-3xl font-mono font-black bg-slate-50 border-2 rounded-2xl focus:ring-4 outline-none transition-all",
                    pinError ? "border-rose-500 ring-rose-500/20 bg-rose-50/50" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-600"
                  )}
                />
              </div>

              <button
                type="submit"
                className="w-full max-w-xs mx-auto py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
              >
                <Unlock className="w-5 h-5" /> আনলক করুন
              </button>
            </form>
          </div>
        ) : (
          /* Step 2: Full Smart Voice Call Hub */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shadow-sm">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">স্মার্ট ভয়েস কল ও নোটিফিকেশন হাব</h3>
                  <p className="text-xs font-bold text-slate-400">অনুপস্থিত ছাত্রদের অভিভাবকদের জন্য স্বয়ংক্রিয় কৃত্রিম ইনকামিং কল সিস্টেম</p>
                </div>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 px-4 rounded-2xl border border-slate-200">
                <span className="text-xs font-black text-slate-700">কল সিস্টেম:</span>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full transition-colors",
                    enabled ? "bg-emerald-600" : "bg-slate-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md",
                      enabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
                <span className={cn("text-xs font-black", enabled ? "text-emerald-600" : "text-slate-400")}>
                  {enabled ? "চালু" : "বন্ধ"}
                </span>
              </div>
            </div>

            {/* Voice Audio Configuration Box */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-lg font-black text-slate-900">ভয়েস মেসেজ ও অডিও রেকর্ডার</h4>
                </div>
                {audioUrl && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> নিজস্ব অডিও রেকর্ড সেভ আছে
                  </span>
                )}
              </div>

              {/* Recorder & File Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* In-Browser Mic Recorder */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">অপশন ১: সরাসরি মাইকে রেকর্ড করুন</span>
                  
                  {isRecording ? (
                    <div className="space-y-3 py-2">
                      <div className="flex items-center justify-center gap-2 text-rose-600 font-mono font-black text-lg animate-pulse">
                        <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                        রেকর্ডিং চলছে: 00:{recordingSeconds.toString().padStart(2, '0')}
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
                      >
                        <Square className="w-4 h-4 fill-white" /> রেকর্ডিং বন্ধ করুন
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 mx-auto shadow-md"
                    >
                      <Mic className="w-5 h-5" /> ভয়েস রেকর্ড শুরু করুন
                    </button>
                  )}
                  <p className="text-[11px] text-slate-400 font-bold">মাইকে কথা বললে স্বয়ংক্রিয়ভাবে অডিও তৈরি হবে</p>
                </div>

                {/* File Upload Option */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center space-y-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">অপশন ২: অডিও ফাইল আপলোড করুন</span>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-sm transition-all border border-slate-300 shadow-sm">
                    <Upload className="w-5 h-5" />
                    <span>MP3 / WAV ফাইল নির্বাচন</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 font-bold">পূর্বে রেকর্ডকৃত যেকোনো অডিও ফাইল যুক্ত করুন</p>
                </div>
              </div>

              {/* Audio Player & Preview */}
              {audioUrl && (
                <div className="bg-emerald-900 text-white p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center font-black transition-all shadow-md"
                    >
                      {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-sm font-black">রেকর্ডকৃত অডিও মেসেজ</p>
                      <p className="text-xs text-emerald-300 font-bold">
                        {isPlayingAudio ? "অডিও বাজছে..." : "শুনতে প্লে বাটনে চাপ দিন"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAudioUrl("")}
                    className="p-2 hover:bg-emerald-800 rounded-xl text-rose-300 hover:text-rose-200 transition-colors"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Message Text (TTS Fallback & Display) */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  ভয়েস বার্তার লিখিত টেক্সট (অডিও ফাইল না থাকলে বাংলায় এটি রোবট ভয়েসে পড়বে):
                </label>
                <textarea
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-800 leading-relaxed"
                  placeholder="আসসালামু আলাইকুম..."
                />
              </div>
            </div>

            {/* Trigger Rules & Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Missed Call Notice */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                  কল না ধরলে যে নোটিশ মেসেজ যাবে:
                </label>
                <textarea
                  rows={3}
                  value={missedNoticeText}
                  onChange={(e) => setMissedNoticeText(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-slate-800"
                />
              </div>

              {/* Ring Duration & Secret PIN */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      রিং বাজার সময়সীমা
                    </label>
                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {ringDuration} সেকেন্ড
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={ringDuration}
                    onChange={(e) => setRingDuration(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="text-[11px] text-slate-400 font-bold">৩০ সেকেন্ড না ধরলে স্বয়ংক্রিয়ভাবে কেটে যাবে</span>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                    সিক্রেট বাটন পাসওয়ার্ড পরিবর্তন করুন
                  </label>
                  <input
                    type="text"
                    maxLength={8}
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    placeholder="0000"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-black text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Live Test Call Trigger & Save Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTestCall(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 border border-indigo-200 shadow-sm"
              >
                <PhoneCall className="w-5 h-5 text-indigo-600" />
                <span>লাইভ টেস্ট কল দেখুন (Test Call)</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm transition-all"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveSettings}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সেভ করুন"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Simulated Live Test Call */}
      <AnimatePresence>
        {showTestCall && (
          <SimulatedIncomingCall
            student={{ name: "মুহাম্মাদ আব্দুল্লাহ", class: "হিফজ বিভাগ", roll: "১০১" }}
            settings={{
              ...settings,
              voice_call_audio_url: audioUrl,
              voice_call_message_text: messageText,
              voice_call_ring_duration: ringDuration
            }}
            onAccept={() => {
              addToast("টেস্ট কল রিসিভ করা হয়েছে!", "info");
            }}
            onDecline={(isTimeout) => {
              setShowTestCall(false);
              addToast(isTimeout ? "টেস্ট কল টাইমআউট হয়ে কেটে গেছে" : "টেস্ট কল বাতিল করা হয়েছে", "info");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
