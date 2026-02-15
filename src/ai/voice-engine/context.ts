/**
 * Context for the voice assistant — which page and concept the user is on.
 * Used to keep AI responses syllabus-scoped and relevant.
 */

export interface VoiceContext {
  page: string;
  route: string;
  conceptId?: string;
  conceptName?: string;
  conceptExplanation?: string;
  subjectName?: string;
}

const defaultContext: VoiceContext = {
  page: 'Unknown',
  route: '/',
};

let _currentContext: VoiceContext = { ...defaultContext };

export function setVoiceContext(ctx: Partial<VoiceContext>): void {
  _currentContext = { ..._currentContext, ...ctx };
}

export function getVoiceContext(): VoiceContext {
  return { ..._currentContext };
}

export function resetVoiceContext(): void {
  _currentContext = { ...defaultContext };
}
