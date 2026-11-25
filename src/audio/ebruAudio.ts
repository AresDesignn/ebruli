import type { DropSize, StorySeason } from '../types/ebru';

export class EbruAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private seasonTimer: number | null = null;

  private muted = false;
  private season: StorySeason = 'winter_late';
  private lastCombSoundAt = 0;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.08);
    }
  }

  public unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.7;
    master.connect(ctx.destination);

    this.ctx = ctx;
    this.masterGain = master;

    this.startAmbientWater();
    this.scheduleSeasonalAccents();
  }

  private startAmbientWater() {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // 2-second pink-ish noise buffer for calm kitre/water hush
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.04;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 340;

    const gain = ctx.createGain();
    gain.gain.value = 0.12;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    source.start();

    this.noiseSource = source;
    this.ambientFilter = filter;
    this.ambientGain = gain;
    this.applySeasonTone();
  }

  public setSeason(season: StorySeason) {
    this.season = season;
    this.applySeasonTone();
  }

  private applySeasonTone() {
    if (!this.ctx || !this.ambientFilter || !this.ambientGain) return;
    const now = this.ctx.currentTime;
    const freqMap: Record<StorySeason, number> = {
      winter_late: 260,
      spring: 420,
      summer: 520,
      autumn: 340,
      winter: 240,
      epilogue: 460,
    };
    this.ambientFilter.frequency.setTargetAtTime(freqMap[this.season], now, 0.5);
  }

  private scheduleSeasonalAccents() {
    if (this.seasonTimer !== null) {
      window.clearInterval(this.seasonTimer);
    }
    this.seasonTimer = window.setInterval(() => {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      if (this.season === 'summer' && Math.random() < 0.45) {
        this.playDistantSeagull();
      } else if ((this.season === 'autumn' || this.season === 'winter') && Math.random() < 0.4) {
        this.playSoftNeyNote();
      }
    }, 6500);
  }

  public playDrop(size: DropSize) {
    this.unlock();
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = size === 'large' ? 220 : size === 'medium' ? 310 : 420;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 0.72, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.085);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playSpeckle() {
    this.unlock();
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const start = now + i * 0.032;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const freq = 460 + Math.random() * 240;
      osc.frequency.setValueAtTime(freq * 0.85, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, start + 0.045);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.045, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0005, start + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + 0.075);
    }
  }

  public playCombDrag(speed: number, isFine: boolean) {
    this.unlock();
    if (this.muted || !this.ctx || !this.masterGain) return;
    const nowMs = performance.now();
    if (nowMs - this.lastCombSoundAt < 95) return;
    this.lastCombSoundAt = nowMs;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const clampedSpeed = Math.min(1, Math.max(0.1, speed * 25));
    osc.frequency.setValueAtTime((isFine ? 280 : 190) + clampedSpeed * 90, now);

    filter.type = 'bandpass';
    filter.frequency.value = isFine ? 720 : 440;
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.025 * clampedSpeed, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.11);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playSoftNeyNote() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    // Soft Hicaz / Ussak inspired gentle frequencies (D4, Eb4, F#4, G4, A4)
    const scale = [293.66, 311.13, 369.99, 392.0, 440.0];
    const freq = scale[Math.floor(Math.random() * scale.length)];

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 0.992, now);
    osc.frequency.linearRampToValueAtTime(freq, now + 0.45);

    filter.type = 'lowpass';
    filter.frequency.value = 950;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 2.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  private playDistantSeagull() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(1520, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.32);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.36);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  public playMemoryChord() {
    this.unlock();
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const freqs = [293.66, 392.0, 440.0];

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;

      const t0 = now + idx * 0.14;
      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.045, t0 + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0006, t0 + 2.1);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t0);
      osc.stop(t0 + 2.2);
    });
  }

  public playPurr() {
    this.unlock();
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const t0 = now + i * 0.26;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(52, t0);
      osc.frequency.linearRampToValueAtTime(44, t0 + 0.22);

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.06, t0 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.23);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t0);
      osc.stop(t0 + 0.24);
    }
  }

  public playDoorKnock() {
    this.unlock();
    if (this.muted || !this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    [0, 0.28].forEach((offset) => {
      const t0 = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, t0);
      osc.frequency.exponentialRampToValueAtTime(62, t0 + 0.09);

      gain.gain.setValueAtTime(0.001, t0);
      gain.gain.linearRampToValueAtTime(0.14, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t0);
      osc.stop(t0 + 0.14);
    });
  }

  public destroy() {
    if (this.seasonTimer !== null) {
      window.clearInterval(this.seasonTimer);
      this.seasonTimer = null;
    }
    try {
      this.noiseSource?.stop();
    } catch {
      // Ignore already stopped
    }
    void this.ctx?.close();
    this.ctx = null;
  }
}
