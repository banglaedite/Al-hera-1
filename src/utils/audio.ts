export const playIPhoneNotificationSound = () => {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // iPhone Note sound approx frequencies (Arpeggio)
    playTone(1046.50, 0, 0.12);    // C6
    playTone(1318.51, 0.12, 0.15); // E6
    playTone(1567.98, 0.27, 0.25); // G6
  } catch (e) {
    console.error("Audio error:", e);
  }
};

export const playIPhoneRingtone = () => {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playBurst = (startTime: number) => {
      // Marimba-like tones for iPhone reflection
      const tones = [880, 1108, 1318, 1760]; // A5, C#6, E6, A6
      tones.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime + (i * 0.1));
        gain.gain.setValueAtTime(0, ctx.currentTime + startTime + (i * 0.1));
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + startTime + (i * 0.1) + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + (i * 0.1) + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + startTime + (i * 0.1));
        osc.stop(ctx.currentTime + startTime + (i * 0.1) + 0.3);
      });
    };

    playBurst(0);
    playBurst(0.8);
  } catch (e) {}
};
