import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  Mic, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  School,
  Radio,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { cn } from "../lib/utils";
import { formatBengaliNameForSpeech, buildAbsenceVoiceCallDialogue } from "../utils/pronunciation";

// Web Audio API Synthesized Ringtone Generator
class RingtonePlayer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: any = null;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      const playRingBurst = () => {
        if (!this.isPlaying || !this.ctx) return;

        // Standard 440Hz + 480Hz dual-frequency telephone ring tone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc2.frequency.setValueAtTime(480, this.ctx.currentTime);

        // Ring pattern: Ring (1.5s) -> Silence (2s)
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + 1.4);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 1.5);
        osc2.stop(this.ctx.currentTime + 1.5);

        // Trigger vibration if supported
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([500, 200, 500]);
          } catch (e) {}
        }
      };

      playRingBurst();
      this.timer = setInterval(playRingBurst, 3500);
    } catch (e) {
      console.error("Ringtone error:", e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
      this.ctx = null;
    }
  }
}

interface SimulatedIncomingCallProps {
  student?: any;
  settings?: any;
  onAccept?: () => void;
  onDecline: (isTimeout: boolean) => void;
  onClose?: () => void;
}

export function SimulatedIncomingCall({
  student,
  settings,
  onAccept,
  onDecline,
  onClose
}: SimulatedIncomingCallProps) {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [connectedDuration, setConnectedDuration] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const ringtoneRef = useRef<RingtonePlayer | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);

  const madrasaName = settings?.title || settings?.name || "আল-হেরা মাদরাসা";
  const customAudioUrl = settings?.voice_call_audio_url;
  const rawMessage = settings?.voice_call_message_text || "";
  
  // Format Bengali spoken name (e.g. মোঃ -> মোহাম্মদ) and build clean single-greeting absence dialogue
  const voiceMessageText = buildAbsenceVoiceCallDialogue(student?.name, rawMessage);

  // Start Ringtone on mount
  useEffect(() => {
    ringtoneRef.current = new RingtonePlayer();
    ringtoneRef.current.start();

    return () => {
      ringtoneRef.current?.stop();
    };
  }, []);

  // 30 Seconds Ring Countdown Timer
  useEffect(() => {
    if (callState !== 'incoming') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDecline(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  // Connected Call Duration Timer
  useEffect(() => {
    if (callState !== 'connected') return;

    const timer = setInterval(() => {
      setConnectedDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  // Handle Call Acceptance
  const handleAccept = () => {
    ringtoneRef.current?.stop();
    setCallState('connected');
    onAccept?.();

    // Play Voice Audio or Text-to-Speech
    if (customAudioUrl) {
      try {
        const audio = new Audio(customAudioUrl);
        audioElemRef.current = audio;
        audio.play().then(() => {
          setIsPlayingAudio(true);
        }).catch((err) => {
          console.error("Audio playback error, falling back to TTS:", err);
          playTTS();
        });

        audio.onended = () => {
          setIsPlayingAudio(false);
        };
      } catch (e) {
        playTTS();
      }
    } else {
      playTTS();
    }
  };

  const playTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceMessageText);
      utterance.lang = 'bn-BD';
      utterance.rate = 1.0; // Natural human conversational speed
      utterance.pitch = 1.0;

      // Select natural sounding Bengali voice if available
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(v => 
        (v.lang.includes('bn') || v.lang.includes('BN') || v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bangla')) &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('male'))
      ) || voices.find(v => v.lang.includes('bn') || v.lang.includes('BN'));

      if (bnVoice) {
        utterance.voice = bnVoice;
      }

      setIsPlayingAudio(true);

      utterance.onend = () => {
        setIsPlayingAudio(false);
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDecline = (isTimeout: boolean = false) => {
    ringtoneRef.current?.stop();
    if (audioElemRef.current) {
      audioElemRef.current.pause();
      audioElemRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState('ended');
    setTimeout(() => {
      onDecline(isTimeout);
    }, 600);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-[3rem] p-8 shadow-2xl border border-slate-700/60 relative overflow-hidden flex flex-col items-center text-center justify-between min-h-[580px]"
      >
        {/* Ambient background glowing circles */}
        <div className="absolute top-1/4 -left-20 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header Badge */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/90 rounded-full border border-slate-700 text-xs font-bold text-slate-300">
            {callState === 'incoming' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>ইনকামিং ভয়েস কল</span>
              </>
            ) : callState === 'connected' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>কল চলছে • {formatTimer(connectedDuration)}</span>
              </>
            ) : (
              <span>কল সমাপ্ত</span>
            )}
          </div>

          {callState === 'incoming' && (
            <div className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/50">
              {secondsRemaining}s
            </div>
          )}
        </div>

        {/* Center Section: Student Avatar & Live Info */}
        <div className="relative z-10 my-auto py-4 flex flex-col items-center space-y-4 w-full">
          {/* Animated Avatar with Student Photo */}
          <div className="relative flex items-center justify-center">
            {callState === 'incoming' && (
              <>
                <div className="absolute w-40 h-40 rounded-full bg-emerald-500/20 animate-ping duration-1000"></div>
                <div className="absolute w-48 h-48 rounded-full bg-emerald-500/10 animate-pulse duration-700"></div>
              </>
            )}

            {callState === 'connected' && isPlayingAudio && (
              <div className="absolute w-40 h-40 rounded-full bg-purple-500/20 animate-pulse"></div>
            )}

            <div className="relative w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-500 p-1.5 shadow-2xl border-4 border-slate-800">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <img 
                  src={student?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student?.name || 'Student')}&background=065f46&color=fff&size=200&bold=true`} 
                  alt={student?.name || "Student"} 
                  className="w-full h-full object-cover" 
                />
              </div>
              {settings?.logo_url && (
                <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-slate-900 border-2 border-emerald-400 overflow-hidden shadow-md">
                  <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Student Identity Highlights */}
          <div className="space-y-2 text-center w-full max-w-sm">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {student?.name || "শিক্ষার্থী"}
            </h3>

            {/* Badges for Class and Roll */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 font-black rounded-full text-xs sm:text-sm border border-emerald-500/30 shadow-inner">
                {student?.class ? `${student.class} শ্রেণী` : "মাদরাসা ছাত্র"}
              </span>
              {student?.roll && (
                <span className="px-3.5 py-1 bg-blue-500/20 text-blue-300 font-black rounded-full text-xs sm:text-sm border border-blue-500/30 shadow-inner">
                  রোল: {student.roll}
                </span>
              )}
            </div>

            <p className="text-slate-400 text-xs font-bold pt-1">
              {madrasaName} • অনুপস্থিতি ভয়েস কল
            </p>
          </div>

          {/* Connected Call Live Voice Waveform Visualizer (Without text transcription) */}
          {callState === 'connected' && (
            <div className="space-y-2 w-full max-w-xs pt-3">
              <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                {[35, 75, 25, 95, 60, 100, 40, 85, 50, 70, 45, 90, 30].map((h, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 rounded-full bg-emerald-400 transition-all duration-300",
                      isPlayingAudio ? "animate-pulse" : "opacity-30"
                    )}
                    style={{ height: isPlayingAudio ? `${h}%` : '20%' }}
                  ></div>
                ))}
              </div>
              <p className="text-[11px] text-emerald-400/90 font-bold text-center animate-pulse">
                {isPlayingAudio ? "🔊 ভয়েস বার্তা প্লে হচ্ছে..." : "কল সংযুক্ত রয়েছে"}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls (Accept / Decline) */}
        <div className="relative z-10 w-full pt-4">
          {callState === 'incoming' ? (
            <div className="flex items-center justify-around gap-6 w-full">
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDecline(false)}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-xs font-bold text-slate-300">কেটে দিন</span>
              </div>

              {/* Accept Button */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all animate-bounce"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <span className="text-xs font-bold text-emerald-400">রিসিভ করুন</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => handleDecline(false)}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95 transition-all"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-xs font-bold text-slate-300">কল কাটুন</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
