/**
 * Text-to-Speech using Web Speech API (browser).
 * Supports rate, pitch, and language. No external API required for basic TTS.
 */

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  voice?: SpeechSynthesisVoice | null;
}

let _utterance: SpeechSynthesisUtterance | null = null;
let _abortController: AbortController | null = null;

export function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }
    speechSynthesis.onvoiceschanged = () => {
      resolve(speechSynthesis.getVoices());
    };
  });
}

export function speak(text: string, options: TTSOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = options.rate ?? 1;
    u.pitch = options.pitch ?? 1;
    u.lang = options.lang ?? 'en-IN';
    if (options.voice) u.voice = options.voice;
    u.onend = () => resolve();
    u.onerror = (e) => reject(new Error(e.error || 'TTS error'));
    _utterance = u;
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  _utterance = null;
  if (_abortController) {
    _abortController.abort();
    _abortController = null;
  }
}

export function isSpeaking(): boolean {
  return typeof window !== 'undefined' && window.speechSynthesis?.speaking;
}
