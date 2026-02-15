import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageCircle,
  Loader2,
  X,
  ChevronUp,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  speak,
  stopSpeaking,
  isSpeaking,
  getVoices,
  createSpeechRecognizer,
  startListening,
  stopListening,
  isSTTSupported,
  askVoiceAssistant,
} from '@/ai/voice-engine';

const VOICE_STORAGE_KEY = 'edutrace-voice-rate';

function getStoredRate(): number {
  try {
    const v = localStorage.getItem(VOICE_STORAGE_KEY);
    const n = v ? parseFloat(v) : 1;
    return Number.isFinite(n) && n >= 0.5 && n <= 2 ? n : 1;
  } catch {
    return 1;
  }
}

function setStoredRate(rate: number): void {
  try {
    localStorage.setItem(VOICE_STORAGE_KEY, String(rate));
  } catch {}
}

export function VoiceAssistant() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsRate, setTtsRate] = useState(getStoredRate);
  const [voices, setVoices] = useState<globalThis.SpeechSynthesisVoice[]>([]);
  const recRef = useRef<SpeechRecognition | null>(null);
  const interimRef = useRef('');

  const langCode = i18n.language || 'en';
  const sttLang = langCode === 'en' ? 'en-IN' : langCode;

  useEffect(() => {
    getVoices().then(setVoices);
  }, []);

  useEffect(() => {
    setStoredRate(ttsRate);
  }, [ttsRate]);

  const handleSpeak = useCallback(() => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    const text = reply || question;
    if (!text.trim()) return;
    const voiceForLang = voices.find((v: globalThis.SpeechSynthesisVoice) => v.lang.startsWith(langCode)) || voices[0];
    setPlaying(true);
    speak(text, { rate: ttsRate, lang: langCode === 'en' ? 'en-IN' : langCode, voice: voiceForLang ?? undefined })
      .then(() => setPlaying(false))
      .catch(() => setPlaying(false));
  }, [playing, reply, question, ttsRate, voices, langCode]);

  const handleAsk = useCallback(async () => {
    const q = (question || interimRef.current).trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setReply('');
    try {
      const answer = await askVoiceAssistant(q, langCode);
      setReply(answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [question, loading, langCode]);

  const toggleListen = useCallback(() => {
    if (listening && recRef.current) {
      stopListening(recRef.current);
      recRef.current = null;
      setListening(false);
      const final = interimRef.current.trim();
      if (final) setQuestion(final);
      return;
    }
    if (!isSTTSupported()) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    const rec = createSpeechRecognizer(
      (result) => {
        if (result.isFinal) {
          interimRef.current = result.transcript;
          setQuestion((prev) => (prev ? prev + ' ' + result.transcript : result.transcript));
        } else {
          interimRef.current = result.transcript;
        }
      },
      () => {
        setListening(false);
        recRef.current = null;
      },
      { lang: sttLang, continuous: true, interimResults: true }
    );
    if (rec) {
      recRef.current = rec;
      startListening(rec);
      setListening(true);
      setError(null);
    }
  }, [listening, sttLang]);

  useEffect(() => {
    return () => {
      if (recRef.current) {
        try {
          stopListening(recRef.current);
        } catch {}
        recRef.current = null;
      }
      stopSpeaking();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2">
      {open && (
        <div
          className={cn(
            'w-full max-w-sm rounded-2xl border bg-card shadow-xl overflow-hidden',
            'animate-in slide-in-from-bottom-4 duration-200'
          )}
          role="dialog"
          aria-label={t('voiceAssistant')}
        >
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <span className="font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              {t('voiceAssistant')}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="p-3 space-y-3">
            <Textarea
              placeholder={t('askQuestion')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={loading}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={listening ? 'destructive' : 'secondary'}
                onClick={toggleListen}
                disabled={!isSTTSupported()}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="ml-1">{listening ? 'Stop' : t('listen')}</span>
              </Button>
              <Button size="sm" onClick={handleAsk} disabled={loading || !question.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="ml-1">Ask</span>
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {reply && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p className="whitespace-pre-wrap">{reply}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={handleSpeak}
                  disabled={!reply.trim()}
                >
                  {playing ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  <span className="ml-1">{playing ? 'Stop' : t('speak')}</span>
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Speed:</span>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={ttsRate}
                onChange={(e) => setTtsRate(parseFloat(e.target.value))}
                className="w-24"
              />
              <span>{ttsRate.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      )}
      <Button
        size="lg"
        className="rounded-full h-14 w-14 shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : t('voiceAssistant')}
      >
        {open ? <ChevronUp className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
