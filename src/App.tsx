import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import AllConcepts from "./pages/AllConcepts";
import StudentProgress from "./pages/StudentProgress";
import ConceptLearning from "./pages/ConceptLearning";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherConcepts from "./pages/TeacherConcepts";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import TeacherMyClasses from "./pages/TeacherMyClasses";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSchools from "./pages/AdminSchools";
import AdminTeachers from "./pages/AdminTeachers";
import AdminStudents from "./pages/AdminStudents";
import AdminSubjects from "./pages/AdminSubjects";
import ProfileSettings from "./pages/ProfileSettings";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/admin" element={<AdminLogin />} />
            
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/learn" element={<ProtectedRoute allowedRoles={['student']}><AllConcepts /></ProtectedRoute>} />
            <Route path="/student/learn/:conceptId" element={<ProtectedRoute allowedRoles={['student']}><ConceptLearning /></ProtectedRoute>} />
            <Route path="/student/progress" element={<ProtectedRoute allowedRoles={['student']}><StudentProgress /></ProtectedRoute>} />
            
            {/* Teacher Routes */}
            <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/students" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherStudents /></ProtectedRoute>} />
            <Route path="/teacher/concepts" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherConcepts /></ProtectedRoute>} />
            <Route path="/teacher/analytics" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherAnalytics /></ProtectedRoute>} />
            <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherMyClasses /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/schools" element={<ProtectedRoute allowedRoles={['admin']}><AdminSchools /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachers /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubjects /></ProtectedRoute>} />
            
            {/* Shared Routes */}
            <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <VoiceAssistant />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
