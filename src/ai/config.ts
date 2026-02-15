/**
 * AI layer configuration — production-ready, env-driven.
 * Supports OpenAI, Claude (via OpenAI-compatible endpoint), and future local LLM.
 */

export type LLMProvider = 'openai' | 'anthropic' | 'local';

export interface AIConfig {
  llm: {
    provider: LLMProvider;
    apiKey: string;
    baseURL?: string; // for Azure / OpenAI-compatible / local
    model: string;
    maxTokens: number;
  };
  voice: {
    defaultTTSRate: number;
    defaultTTSPitch: number;
    sttLanguage: string;
  };
  safety: {
    syllabusScopeOnly: boolean;
    maxContextTokens: number;
  };
}

function getEnv(key: string, fallback: string = ''): string {
  try {
    const v = (import.meta as unknown as { env?: Record<string, unknown> }).env?.[key];
    return v != null ? String(v) : fallback;
  } catch {
    return fallback;
  }
}

export function getAIConfig(): AIConfig {
  const provider = (getEnv('VITE_LLM_PROVIDER', 'openai') || 'openai') as LLMProvider;
  return {
    llm: {
      provider,
      apiKey: getEnv('VITE_OPENAI_API_KEY', '') || getEnv('VITE_ANTHROPIC_API_KEY', ''),
      baseURL: getEnv('VITE_LLM_BASE_URL', '') || undefined,
      model: getEnv('VITE_LLM_MODEL', 'gpt-4o-mini'),
      maxTokens: Math.min(4096, Math.max(256, parseInt(getEnv('VITE_LLM_MAX_TOKENS', '2048'), 10) || 2048)),
    },
    voice: {
      defaultTTSRate: 1,
      defaultTTSPitch: 1,
      sttLanguage: 'en-IN',
    },
    safety: {
      syllabusScopeOnly: true,
      maxContextTokens: 4000,
    },
  };
}

export const aiConfig = getAIConfig();
