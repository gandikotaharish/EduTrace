import { getLLMProvider } from '@/ai/llm/provider';
import type { SupportedLocale } from './types';
import { LOCALE_NAMES } from './types';

const SCOPE =
  'You are a translator for an educational platform. Translate only the given text. Preserve meaning and educational clarity. Do not add or remove content. Output only the translation, no explanations.';

export async function translateText(
  text: string,
  targetLocale: SupportedLocale,
  sourceLocale: SupportedLocale = 'en'
): Promise<string> {
  if (targetLocale === sourceLocale) return text;
  const llm = getLLMProvider();
  const targetName = LOCALE_NAMES[targetLocale];
  const msg = `Translate the following educational content from ${sourceLocale} to ${targetName} (locale: ${targetLocale}).\n\n${SCOPE}\n\nContent:\n${text}`;
  const out = await llm.complete([{ role: 'user', content: msg }], {
    systemPrompt: SCOPE,
    temperature: 0.2,
    maxTokens: 2048,
  });
  return (out || text).trim();
}

export async function translateAndSimplify(
  text: string,
  targetLocale: SupportedLocale
): Promise<{ translated: string; simplified: string }> {
  const llm = getLLMProvider();
  const targetName = LOCALE_NAMES[targetLocale];
  const prompt = `Target language: ${targetName} (${targetLocale}).

1) Translate this educational content to ${targetName}. Output only the translation.
2) Then, in a second paragraph starting with "SIMPLIFIED:", provide a shorter, simpler version for regional clarity (same language).

Content:\n${text}`;
  const out = await llm.complete([{ role: 'user', content: prompt }], {
    systemPrompt: SCOPE,
    temperature: 0.2,
    maxTokens: 2048,
  });
  const simplifiedMatch = /SIMPLIFIED:\s*([\s\S]*)/i.exec(out || '');
  const simplified = simplifiedMatch ? simplifiedMatch[1].trim() : out?.trim() ?? text;
  const translated = simplifiedMatch ? (out?.replace(simplifiedMatch[0], '').trim() ?? text) : (out?.trim() ?? text);
  return { translated, simplified };
}
