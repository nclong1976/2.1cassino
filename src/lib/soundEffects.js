// Sound effects utility module using Web Audio API and HTML5 Audio fallback

// Helper to create Web Audio synthesized sound if external audio fails or is blocked
const createAudioContext = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  return AudioCtx ? new AudioCtx() : null;
};

// Play synthesized cartoon tut-tu-tut-tu sound (Chat message notification)
export const playChatMessageSound = () => {
  try {
    // Attempt HTML Audio first
    const audio = new Audio("https://media.base44.com/audio/public/notification_tut.mp3");
    audio.volume = 0.7;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => playSynthesizedTutTu());
    }
  } catch {
    playSynthesizedTutTu();
  }
};

const playSynthesizedTutTu = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Notes sequence: C5, E5, G5, C6 (cheerful cartoon tut-tu-tut-tu)
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.3, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.12);
    });
  } catch {
    /* ignore audio autoplay restrictions */
  }
};

// Play train horn sound (Withdrawal alert for Admin)
export const playWithdrawalSound = () => {
  try {
    const audio = new Audio("https://media.base44.com/audio/public/train_horn.mp3");
    audio.volume = 0.85;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => playSynthesizedTrainHorn());
    }
  } catch {
    playSynthesizedTrainHorn();
  }
};

const playSynthesizedTrainHorn = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Low dual-tone chord for train horn (D3 & F#3 & A3)
    const tones = [146.83, 185.00, 220.00];
    tones.forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.setValueAtTime(0.25, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.9);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.9);
    });
  } catch {
    /* ignore audio autoplay restrictions */
  }
};
