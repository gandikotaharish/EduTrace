import { aiConfig } from '@/ai/config';
import type { ChatMessage, ILLMProvider, LLMCompletionOptions } from './types';

/**
 * API-based LLM provider. OpenAI-compatible (works with OpenAI, Azure, local proxies).
 * Switchable via VITE_LLM_PROVIDER and VITE_LLM_BASE_URL.
 */
class LLMProviderImpl implements ILLMProvider {
  private config = aiConfig.llm;

  private async request(body: Record<string, unknown>): Promise<{ choices: { message?: { content?: string } }[] }> {
    const url = this.config.baseURL || 'https://api.openai.com/v1';
    const key = this.config.apiKey;
    if (!key) {
      throw new Error('AI: No API key configured. Set VITE_OPENAI_API_KEY or VITE_LLM_BASE_URL with key.');
    }
    const res = await fetch(`${url.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: body.max_tokens ?? this.config.maxTokens,
        temperature: (body.temperature as number) ?? 0.3,
        messages: body.messages,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM request failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  async complete(messages: ChatMessage[], options?: LLMCompletionOptions): Promise<string> {
    const system = options?.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }]
      : [];
    const all = [...system, ...messages];
    const body: Record<string, unknown> = {
      messages: all,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
      temperature: options?.temperature ?? 0.3,
    };
    const out = await this.request(body);
    const content = out.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content : '';
  }

  async completeJSON<T>(messages: ChatMessage[], options?: LLMCompletionOptions): Promise<T> {
    const system = options?.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt + '\nRespond only with valid JSON, no markdown.' }]
      : [];
    const text = await this.complete([...system, ...messages], { ...options, temperature: 0.2 });
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    return JSON.parse(cleaned) as T;
  }
}

let _provider: ILLMProvider | null = null;

export function getLLMProvider(): ILLMProvider {
  if (!_provider) _provider = new LLMProviderImpl();
  return _provider;
}

export function setLLMProvider(provider: ILLMProvider | null): void {
  _provider = provider;
}
