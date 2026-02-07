import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/learn" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AllConcepts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/learn/:conceptId" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ConceptLearning />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/progress" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProgress />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/students" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/concepts" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherConcepts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher/analytics" 
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <TeacherAnalytics />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
