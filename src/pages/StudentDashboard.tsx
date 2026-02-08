import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { ConceptCard } from "@/components/dashboard/ConceptCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/hooks/useConcepts";
import { useStudentMastery, useStudentInsights } from "@/hooks/useStudentData";
import { TrendingUp, Target, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  const displayName = userName || 'Student';

  const { data: concepts = [], isLoading: conceptsLoading } = useConcepts();
  const { data: studentMastery = [], isLoading: masteryLoading } = useStudentMastery();
  const { data: studentInsights = [], isLoading: insightsLoading } = useStudentInsights();

  const isLoading = conceptsLoading || masteryLoading;

  const overallMastery = studentMastery.length > 0
    ? Math.round(studentMastery.reduce((sum, m) => sum + m.mastery_score, 0) / studentMastery.length)
    : 0;

  const strengths = studentMastery.filter(m => m.mastery_score >= 75);
  const weaknesses = studentMastery.filter(m => m.mastery_score < 55);

  const learnedConceptIds = studentMastery.map(m => m.concept_id);
  const nextConcept = concepts.find(c => !learnedConceptIds.includes(c.id));

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-72" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {displayName.split(' ')[0]}!</h1>
            <p className="text-muted-foreground mt-1">Track your understanding, not just your scores.</p>
          </div>
          {nextConcept && (
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate(`/student/learn/${nextConcept.id}`)}
            >
              Continue Learning
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="evidence-card col-span-1 flex flex-col items-center justify-center py-8">
            <MasteryRing score={overallMastery} size="lg" />
            <p className="text-sm text-muted-foreground mt-4">Overall Mastery</p>
          </div>

          <div className="evidence-card col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{strengths.length}</div>
                <div className="text-sm text-muted-foreground">Concepts Mastered</div>
              </div>
            </div>
            <div className="text-xs text-success">
              {strengths.length > 0 ? 'Keep up the great work!' : 'Start learning to master concepts'}
            </div>
          </div>

          <div className="evidence-card col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{weaknesses.length}</div>
                <div className="text-sm text-muted-foreground">Need Practice</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">Focus on these to improve</div>
          </div>

          <div className="evidence-card col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{studentMastery.length}/{concepts.length}</div>
                <div className="text-sm text-muted-foreground">Concepts Started</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {concepts.length - studentMastery.length} more to explore
            </div>
          </div>
        </div>

        {/* Learning Insights */}
        {studentInsights.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Personal Insights
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {studentInsights.map((insight) => {
                const concept = concepts.find(c => c.id === insight.concept_id);
                return (
                  <InsightCard 
                    key={insight.id} 
                    insight={insight}
                    conceptName={concept?.name}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Concept Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Concepts</h2>
            <Button variant="ghost" onClick={() => navigate('/student/learn')}>
              View All
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.slice(0, 6).map((concept) => {
              const mastery = studentMastery.find(m => m.concept_id === concept.id);
              return (
                <ConceptCard
                  key={concept.id}
                  concept={concept}
                  mastery={mastery}
                  onClick={() => navigate(`/student/learn/${concept.id}`)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
