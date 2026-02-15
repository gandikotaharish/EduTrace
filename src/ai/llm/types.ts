export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCompletionOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface ILLMProvider {
  complete(messages: ChatMessage[], options?: LLMCompletionOptions): Promise<string>;
  completeJSON<T>(messages: ChatMessage[], options?: LLMCompletionOptions): Promise<T>;
}
