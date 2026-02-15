// Central AI module — production-ready, modular

export { aiConfig, getAIConfig } from './config';
export type { AIConfig, LLMProvider } from './config';

export { getLLMProvider, setLLMProvider } from './llm/provider';
export type { ChatMessage, ILLMProvider, LLMCompletionOptions } from './llm/types';

export { speak, stopSpeaking, isSpeaking, getVoices, setVoiceContext, getVoiceContext, resetVoiceContext, askVoiceAssistant } from './voice-engine';
export type { TTSOptions, STTOptions, STTResult, VoiceContext } from './voice-engine';
export { createSpeechRecognizer, startListening, stopListening, isSTTSupported } from './voice-engine';

export { evaluateAnswer, analyzeReflection } from './evaluation-engine';
export type { EvaluationResult, ReflectionAnalysisResult } from './evaluation-engine';

export { translateText, translateAndSimplify } from './translation-engine';
export type { SupportedLocale, TranslatedConcept } from './translation-engine/types';
export { SUPPORTED_LOCALES, LOCALE_NAMES } from './translation-engine';

export { getAdaptiveSuggestions } from './adaptive-engine';
export type { AdaptiveSuggestion } from './adaptive-engine';

export { systemPromptWithContext, evaluationSystemPrompt, reflectionAnalysisSystemPrompt, adaptiveSuggestionSystemPrompt } from './safety';
