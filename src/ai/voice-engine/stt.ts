/**
 * Speech-to-Text using Web Speech API (browser).
 * Supports continuous/interim results and language.
 */

export interface STTOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence?: number;
}

const SpeechRecognition =
  typeof window !== 'undefined'
    ? (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
    : undefined;

export function isSTTSupported(): boolean {
  return !!SpeechRecognition;
}

export function createSpeechRecognizer(
  onResult: (result: STTResult) => void,
  onEnd?: () => void,
  options: STTOptions = {}
): SpeechRecognition | null {
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.continuous = options.continuous ?? true;
  rec.interimResults = options.interimResults ?? true;
  rec.lang = options.lang ?? 'en-IN';
  rec.onresult = (event: SpeechRecognitionEvent) => {
    const last = event.resultIndex;
    const item = event.results[last];
    const transcript = item[0]?.transcript ?? '';
    onResult({
      transcript,
      isFinal: item.isFinal,
      confidence: item[0]?.confidence,
    });
  };
  rec.onend = () => onEnd?.();
  return rec;
}

export function startListening(rec: SpeechRecognition): void {
  try {
    rec.start();
  } catch (e) {
    // already started or not allowed
  }
}

export function stopListening(rec: SpeechRecognition): void {
  try {
    rec.stop();
  } catch {
    // ignore
  }
}
