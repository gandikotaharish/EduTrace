export { speak, stopSpeaking, isSpeaking, getVoices } from './tts';
export type { TTSOptions } from './tts';
export { createSpeechRecognizer, startListening, stopListening, isSTTSupported } from './stt';
export type { STTOptions, STTResult } from './stt';
export { setVoiceContext, getVoiceContext, resetVoiceContext } from './context';
export type { VoiceContext } from './context';
export { askVoiceAssistant } from './assistant-query';
