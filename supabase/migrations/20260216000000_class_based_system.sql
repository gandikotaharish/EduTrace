-- Class-based teacher-student connection system (institution-grade)
-- Hierarchy: School -> Academic Year -> Grade/Section (Class) -> Class Teacher, Students

-- 1. Academic years per school
CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_academic_years_school ON public.academic_years(school_id);
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage academic_years"
  ON public.academic_years FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view academic_years for their school"
  ON public.academic_years FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin')
  );

-- 2. Link classes to academic year (optional)
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL;

-- 3. Class teacher: one designated class teacher per class
CREATE TABLE IF NOT EXISTS public.class_teacher_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(class_id)
);

CREATE INDEX IF NOT EXISTS idx_class_teacher_class ON public.class_teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_class_teacher_teacher ON public.class_teacher_assignments(teacher_id);
ALTER TABLE public.class_teacher_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage class_teacher_assignments"
  ON public.class_teacher_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view class_teacher_assignments"
  ON public.class_teacher_assignments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 4. Intervention log (class teacher notes: parent meeting, extra help, warning)
CREATE TABLE IF NOT EXISTS public.intervention_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intervention_log_student ON public.intervention_log(student_id);
CREATE INDEX IF NOT EXISTS idx_intervention_log_class ON public.intervention_log(class_id);
ALTER TABLE public.intervention_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and admin can manage intervention_log"
  ON public.intervention_log FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own intervention_log"
  ON public.intervention_log FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

-- 5. Attendance (per student per class per date)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  recorded_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, class_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, date);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and admin can manage attendance"
  ON public.attendance FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own attendance"
  ON public.attendance FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

-- 6. Performance flags (teacher-added: under observation, etc.)
CREATE TABLE IF NOT EXISTS public.performance_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  teacher_id UUID NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_performance_flags_student ON public.performance_flags(student_id);
ALTER TABLE public.performance_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and admin can manage performance_flags"
  ON public.performance_flags FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Students can view own performance_flags"
  ON public.performance_flags FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

-- 7. Credential batches (audit: when teacher bulk-created students)
CREATE TABLE IF NOT EXISTS public.credential_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL,
  student_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credential_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers and admin can view credential_batches"
  ON public.credential_batches FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers and admin can insert credential_batches"
  ON public.credential_batches FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 8. First-login: force password change
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_reset BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Trigger for updated_at on academic_years
CREATE TRIGGER update_academic_years_updated_at
  BEFORE UPDATE ON public.academic_years
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
