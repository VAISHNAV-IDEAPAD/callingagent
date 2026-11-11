// Browser Web Audio API telephony sound generator & Web Speech synthesis

export type VoicePersona = "grok_girl" | "heera";

class TelephonyAudio {
  private ctx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play Indian/Standard Call Ringing Tone (400Hz + 450Hz beep-beep)
  playRingbackTone(durationMs = 3000): Promise<void> {
    return new Promise((resolve) => {
      this.initContext();
      if (!this.ctx) {
        setTimeout(resolve, durationMs);
        return;
      }

      this.stop();

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.frequency.value = 400;
      osc2.frequency.value = 450;
      osc1.type = "sine";
      osc2.type = "sine";

      // Pulsing effect (0.8s on, 0.4s off, 0.8s on)
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gain.gain.setValueAtTime(0.12, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.4);
      gain.gain.setValueAtTime(0.001, now + 1.8);
      gain.gain.linearRampToValueAtTime(0.12, now + 1.9);
      gain.gain.setValueAtTime(0.12, now + 2.8);
      gain.gain.linearRampToValueAtTime(0, now + durationMs / 1000);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      this.currentOscillators = [osc1, osc2];
      this.gainNode = gain;

      setTimeout(() => {
        this.stop();
        resolve();
      }, durationMs);
    });
  }

  // Play Disconnect / Busy Tone (beep beep beep)
  playDisconnectTone(durationMs = 1500): Promise<void> {
    return new Promise((resolve) => {
      this.initContext();
      if (!this.ctx) {
        setTimeout(resolve, durationMs);
        return;
      }

      this.stop();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.value = 480;
      osc.type = "sine";

      const now = this.ctx.currentTime;
      // 3 fast beeps
      [0, 0.4, 0.8, 1.2].forEach((offset) => {
        if (now + offset < now + durationMs / 1000) {
          gain.gain.setValueAtTime(0.15, now + offset);
          gain.gain.setValueAtTime(0, now + offset + 0.25);
        }
      });

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      this.currentOscillators = [osc];
      this.gainNode = gain;

      setTimeout(() => {
        this.stop();
        resolve();
      }, durationMs);
    });
  }

  stop() {
    this.currentOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore
      }
    });
    this.currentOscillators = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
  }

  // Speak Script using SpeechSynthesis with tailored Female / Girl voice
  speakScript(
    text: string,
    persona: VoicePersona = "grok_girl",
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onStart) onStart();
        setTimeout(() => {
          if (onEnd) onEnd();
          resolve();
        }, 2500);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      if (persona === "grok_girl") {
        // Grok Girl Voice: Sassy, energetic, youthful female voice
        utterance.rate = 1.05;
        utterance.pitch = 1.22; // Higher, brighter girl voice pitch

        // Find best energetic female voice
        const girlVoice =
          voices.find(
            (v) =>
              (v.name.includes("Google") && v.name.includes("English") && !v.name.includes("Male")) ||
              v.name.toLowerCase().includes("zira") ||
              v.name.toLowerCase().includes("samantha") ||
              v.name.toLowerCase().includes("victoria") ||
              v.name.toLowerCase().includes("karen") ||
              v.name.toLowerCase().includes("jenny") ||
              v.name.toLowerCase().includes("aria")
          ) ||
          voices.find((v) => v.name.toLowerCase().includes("female")) ||
          voices.find((v) => v.lang.startsWith("en"));

        if (girlVoice) {
          utterance.voice = girlVoice;
        }
      } else {
        // Heera Persona: Indian English voice
        utterance.rate = 0.95;
        utterance.pitch = 1.05;

        const indianVoice = voices.find(
          (v) =>
            v.lang.toLowerCase() === "en-in" ||
            v.lang.toLowerCase() === "hi-in" ||
            v.name.toLowerCase().includes("india") ||
            v.name.toLowerCase().includes("heera") ||
            v.name.toLowerCase().includes("aditi") ||
            v.name.toLowerCase().includes("neerja")
        );

        const femaleVoice =
          indianVoice ||
          voices.find(
            (v) =>
              v.name.toLowerCase().includes("female") ||
              v.name.toLowerCase().includes("zira") ||
              v.name.toLowerCase().includes("samantha")
          );

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (onEnd) onEnd();
        resolve();
      };

      utterance.onerror = () => {
        if (onEnd) onEnd();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const telephonyAudio = new TelephonyAudio();
