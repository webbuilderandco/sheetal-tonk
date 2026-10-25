/**
 * Procedural Web Audio API synthesizer for Hotel Sheetal Tonk.
 * Zero external MP3 / audio file dependencies!
 * Generates an ambient Indian classical drone (Tanpura/sitar harmonic resonant chords)
 * and a gentle water fountain trickle.
 */

class HotelAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private noiseNode: AudioBufferSourceNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop(); // Clear previous nodes if any

      const now = this.ctx.currentTime;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      // Gentle fade in
      this.masterGain.gain.exponentialRampToValueAtTime(0.12, now + 2);
      this.masterGain.connect(this.ctx.destination);

      // Root chord: C# (Sa in Indian classical music, approx 138.59 Hz)
      // Base frequencies corresponding to Sa, Pa, high Sa for meditative tanpura ambiance
      const freqs = [138.59, 207.65, 277.18, 415.3, 554.37];

      this.oscillators = [];
      freqs.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        // Warm triangle and sine waves
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, now);

        // Low pass filter for warmth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500 + idx * 120, now);

        // LFO for gentle pulsation (breathing harmonic drone)
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.15 + idx * 0.08, now);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.02, now);
        lfo.connect(lfoGain);

        oscGain.gain.setValueAtTime(0.04 / (idx + 1), now);
        lfoGain.connect(oscGain.gain);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.masterGain);

        osc.start(now);
        lfo.start(now);
        this.oscillators.push(osc, lfo);
      });

      // Procedural soft water fountain noise (pink noise generator)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.04;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      const waterFilter = this.ctx.createBiquadFilter();
      waterFilter.type = 'bandpass';
      waterFilter.frequency.setValueAtTime(900, now);
      waterFilter.Q.setValueAtTime(1.5, now);

      const waterGain = this.ctx.createGain();
      waterGain.gain.setValueAtTime(0.015, now);

      this.noiseNode.connect(waterFilter);
      waterFilter.connect(waterGain);
      waterGain.connect(this.masterGain);

      this.noiseNode.start(now);

      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext not allowed or supported yet', e);
      this.isPlaying = false;
    }
  }

  public stop() {
    if (!this.isPlaying) return;
    try {
      if (this.masterGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          this.oscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch {}
          });
          this.oscillators = [];
          if (this.noiseNode) {
            try { this.noiseNode.stop(); this.noiseNode.disconnect(); } catch {}
            this.noiseNode = null;
          }
        }, 700);
      }
    } catch {}
    this.isPlaying = false;
  }
}

export const hotelAudio = new HotelAudioSynthesizer();
