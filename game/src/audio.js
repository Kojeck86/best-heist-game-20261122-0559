// Velvet Hour — all sound is synthesized with WebAudio, no audio files.
// A tiny synth: short blips for pickups, a two-note sting when spotted, a
// low alarm pulse while the meter is high, and a little arpeggio on escape.
export function createAudio() {
  let ctx = null;
  let alarmTimer = null;

  function ensureContext() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      ctx = new AudioContextClass();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, startIn, duration, type, volume) {
    const audio = ensureContext();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t0 = audio.currentTime + startIn;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  return {
    // Call from the first user gesture so the browser unlocks audio.
    unlock() {
      ensureContext();
    },

    click() {
      tone(660, 0, 0.07, 'triangle', 0.12);
    },

    pickup() {
      tone(880, 0, 0.09, 'sine', 0.16);
      tone(1320, 0.07, 0.12, 'sine', 0.14);
    },

    smoke() {
      tone(220, 0, 0.35, 'sawtooth', 0.05);
      tone(180, 0.08, 0.3, 'sawtooth', 0.04);
    },

    jammer() {
      tone(440, 0, 0.1, 'square', 0.06);
      tone(330, 0.1, 0.1, 'square', 0.06);
      tone(220, 0.2, 0.16, 'square', 0.06);
    },

    spotted() {
      tone(196, 0, 0.16, 'square', 0.12);
      tone(147, 0.14, 0.24, 'square', 0.12);
    },

    caught() {
      tone(311, 0, 0.2, 'sawtooth', 0.14);
      tone(233, 0.18, 0.2, 'sawtooth', 0.14);
      tone(155, 0.36, 0.5, 'sawtooth', 0.16);
    },

    win() {
      // A rising four-note getaway arpeggio: C, E, G, high C.
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => tone(freq, i * 0.11, 0.22, 'triangle', 0.15));
    },

    // A soft repeating pulse while the alarm is in the warning band.
    startAlarmPulse() {
      if (alarmTimer !== null) return;
      alarmTimer = window.setInterval(() => tone(520, 0, 0.12, 'sine', 0.05), 650);
    },

    stopAlarmPulse() {
      if (alarmTimer !== null) {
        window.clearInterval(alarmTimer);
        alarmTimer = null;
      }
    },
  };
}
