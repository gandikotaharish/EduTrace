-- Optional: store AI-generated or teacher-edited concept translations per locale
CREATE TABLE IF NOT EXISTS public.concept_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  locale TEXT NOT NULL,
  name TEXT,
  description TEXT,
  explanation TEXT,
  simplified_explanation TEXT,
  edited_by_teacher BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(concept_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_concept_translations_concept_locale ON public.concept_translations(concept_id, locale);

ALTER TABLE public.concept_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read concept_translations"
  ON public.concept_translations FOR SELECT
  USING (true);

CREATE POLICY "Teachers and admins can insert/update concept_translations"
  ON public.concept_translations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('teacher', 'admin'))
  );
