
-- =============================================
-- MULTI-SCHOOL ARCHITECTURE MIGRATION
-- =============================================

-- 1. Schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  academic_level TEXT NOT NULL DEFAULT 'K-12',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Classes table
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade_level TEXT,
  section TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Teacher assignments
CREATE TABLE public.teacher_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, school_id, class_id, subject_id)
);

ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

-- 4. Student assignments
CREATE TABLE public.student_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, school_id, class_id)
);

ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- 5. Add is_active column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- =============================================
-- NOW ADD ALL RLS POLICIES (tables exist now)
-- =============================================

-- Schools RLS
CREATE POLICY "Admins can manage schools" ON public.schools
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view their assigned schools" ON public.schools
  FOR SELECT USING (
    public.has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.teacher_assignments ta WHERE ta.school_id = schools.id AND ta.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their assigned school" ON public.schools
  FOR SELECT USING (
    public.has_role(auth.uid(), 'student') AND EXISTS (
      SELECT 1 FROM public.student_assignments sa WHERE sa.school_id = schools.id AND sa.student_id = auth.uid()
    )
  );

-- Classes RLS
CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view their assigned classes" ON public.classes
  FOR SELECT USING (
    public.has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.teacher_assignments ta WHERE ta.class_id = classes.id AND ta.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their assigned class" ON public.classes
  FOR SELECT USING (
    public.has_role(auth.uid(), 'student') AND EXISTS (
      SELECT 1 FROM public.student_assignments sa WHERE sa.class_id = classes.id AND sa.student_id = auth.uid()
    )
  );

-- Teacher assignments RLS
CREATE POLICY "Admins can manage teacher assignments" ON public.teacher_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view own assignments" ON public.teacher_assignments
  FOR SELECT USING (auth.uid() = teacher_id);

-- Student assignments RLS
CREATE POLICY "Admins can manage student assignments" ON public.student_assignments
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can view students in their classes" ON public.student_assignments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'teacher') AND EXISTS (
      SELECT 1 FROM public.teacher_assignments ta 
      WHERE ta.class_id = student_assignments.class_id AND ta.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own assignments" ON public.student_assignments
  FOR SELECT USING (auth.uid() = student_id);

-- Profiles: allow admins to manage all
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- User roles: allow admins
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin access to mastery, evidence, insights
CREATE POLICY "Admins can view all mastery" ON public.concept_mastery
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all evidence" ON public.learning_evidence
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all insights" ON public.gap_insights
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Performance indexes
CREATE INDEX idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_school ON public.teacher_assignments(school_id);
CREATE INDEX idx_student_assignments_student ON public.student_assignments(student_id);
CREATE INDEX idx_student_assignments_school ON public.student_assignments(school_id);
CREATE INDEX idx_student_assignments_class ON public.student_assignments(class_id);
CREATE INDEX idx_classes_school ON public.classes(school_id);
