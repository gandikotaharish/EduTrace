
-- Integrity violations log table
CREATE TABLE public.integrity_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  concept_id UUID REFERENCES public.concepts(id),
  violation_type TEXT NOT NULL, -- 'paste_attempt', 'suspicious_typing', 'tab_switch', 'too_fast_submission', 'low_originality'
  details TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.integrity_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can insert own violations"
  ON public.integrity_violations FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own violations"
  ON public.integrity_violations FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all violations"
  ON public.integrity_violations FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins can view all violations"
  ON public.integrity_violations FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Integrity scores table
CREATE TABLE public.integrity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 100,
  paste_attempts INTEGER NOT NULL DEFAULT 0,
  suspicious_entries INTEGER NOT NULL DEFAULT 0,
  tab_switches INTEGER NOT NULL DEFAULT 0,
  low_originality_count INTEGER NOT NULL DEFAULT 0,
  shallow_reflections INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.integrity_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own integrity score"
  ON public.integrity_scores FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can upsert own integrity score"
  ON public.integrity_scores FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own integrity score"
  ON public.integrity_scores FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all integrity scores"
  ON public.integrity_scores FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins can view all integrity scores"
  ON public.integrity_scores FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to recalculate integrity score
CREATE OR REPLACE FUNCTION public.recalculate_integrity_score(p_student_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_paste INTEGER;
  v_suspicious INTEGER;
  v_tabs INTEGER;
  v_originality INTEGER;
  v_shallow INTEGER;
  v_score INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE violation_type = 'paste_attempt'),
    COUNT(*) FILTER (WHERE violation_type = 'suspicious_typing'),
    COUNT(*) FILTER (WHERE violation_type = 'tab_switch'),
    COUNT(*) FILTER (WHERE violation_type = 'low_originality'),
    COUNT(*) FILTER (WHERE violation_type = 'shallow_reflection')
  INTO v_paste, v_suspicious, v_tabs, v_originality, v_shallow
  FROM integrity_violations
  WHERE student_id = p_student_id;

  -- Score: start at 100, deduct per violation type
  v_score := GREATEST(0, 100 - (v_paste * 3) - (v_suspicious * 5) - (v_tabs * 1) - (v_originality * 4) - (v_shallow * 2));

  INSERT INTO integrity_scores (student_id, score, paste_attempts, suspicious_entries, tab_switches, low_originality_count, shallow_reflections, updated_at)
  VALUES (p_student_id, v_score, v_paste, v_suspicious, v_tabs, v_originality, v_shallow, now())
  ON CONFLICT (student_id)
  DO UPDATE SET
    score = EXCLUDED.score,
    paste_attempts = EXCLUDED.paste_attempts,
    suspicious_entries = EXCLUDED.suspicious_entries,
    tab_switches = EXCLUDED.tab_switches,
    low_originality_count = EXCLUDED.low_originality_count,
    shallow_reflections = EXCLUDED.shallow_reflections,
    updated_at = now();
END;
$$;

-- Trigger: recalculate score after each violation
CREATE OR REPLACE FUNCTION public.trigger_recalculate_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recalculate_integrity_score(NEW.student_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_integrity_violation_insert
  AFTER INSERT ON public.integrity_violations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_integrity();
