# EduTrace AI Layer

Production-ready, modular AI integration for EduTrace.

## Structure

- **config** — Env-driven LLM and voice config (OpenAI/Claude/local-ready).
- **llm** — API-based provider; switchable model and base URL.
- **voice-engine** — TTS (Web Speech API), STT, context-aware assistant.
- **evaluation-engine** — LLM answer evaluation and reflection analysis (structured JSON).
- **translation-engine** — AI translation and simplified versions for 7 locales.
- **adaptive-engine** — Revision and difficulty suggestions from mastery/integrity.
- **teacher-intelligence** — Class summary, re-teaching alerts, risk predictions.
- **copilot** — Personal learning copilot (mastery, weak concepts, integrity).
- **safety** — Syllabus-scoped prompts; no external content or hallucination.
- **analytics** — Types for predictive analytics (exam risk, dropout, mastery forecast).
- **learning-personality** — Types for learning style detection.
- **certification** — Types for mastery certificates.

## Environment

Copy `.env.example` and set:

- `VITE_OPENAI_API_KEY` — Required for voice assistant, evaluation, teacher insights, copilot.
- `VITE_LLM_PROVIDER` — `openai` (default) or `anthropic`.
- `VITE_LLM_MODEL` — e.g. `gpt-4o-mini`.
- `VITE_LLM_BASE_URL` — Optional; use for Azure or OpenAI-compatible proxies.

## Features

1. **Global Voice Assistant** — Floating on all pages; TTS/STT; context-aware (current concept); multi-language.
2. **Multilingual** — i18n (EN, HI, TE, TA, KN, BN, MR); language selector in dashboard; voice and UI sync.
3. **LLM Evaluation** — `evaluateAnswer()`, `analyzeReflection()`; structured scores and feedback.
4. **Adaptive Suggestions** — `getAdaptiveSuggestions()` from mastery/integrity and weak concepts.
5. **Teacher AI** — `useTeacherAIInsights()` for class summary, re-teaching alerts, risk predictions.
6. **Student Copilot** — Dashboard panel; asks using mastery, integrity, weak concepts.
7. **Safety** — All prompts use syllabus/context injection; no external browsing.

## Adding a New Language

1. Add locale to `SUPPORTED_LOCALES` and `LOCALE_NAMES` in `translation-engine/types.ts`.
2. Add translation keys in `i18n/index.ts` for the new locale.
