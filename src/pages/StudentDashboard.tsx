import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { ConceptCard } from "@/components/dashboard/ConceptCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Button } from "@/components/ui/button";
import { 
  currentStudent, 
  concepts, 
  sampleMasteryData, 
  sampleGapInsights 
} from "@/data/sampleData";
import { TrendingUp, Target, BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  // Get student's mastery data
  const studentMastery = sampleMasteryData.filter(m => m.studentId === currentStudent.id);
  const studentInsights = sampleGapInsights.filter(i => i.studentId === currentStudent.id);
  
  // Calculate overall mastery
  const overallMastery = studentMastery.length > 0
    ? Math.round(studentMastery.reduce((sum, m) => sum + m.masteryScore, 0) / studentMastery.length)
    : 0;
  
  // Get strengths and weaknesses
  const strengths = studentMastery
    .filter(m => m.masteryScore >= 75)
    .map(m => concepts.find(c => c.id === m.conceptId)!)
    .filter(Boolean);
  
  const weaknesses = studentMastery
    .filter(m => m.masteryScore < 55)
    .map(m => concepts.find(c => c.id === m.conceptId)!)
    .filter(Boolean);

  // Next concept to learn
  const learnedConceptIds = studentMastery.map(m => m.conceptId);
  const nextConcept = concepts.find(c => !learnedConceptIds.includes(c.id));

  return (
    <DashboardLayout userRole="student" userName={currentStudent.name}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {currentStudent.name.split(' ')[0]}!</h1>
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
          {/* Overall Mastery */}
          <div className="evidence-card col-span-1 flex flex-col items-center justify-center py-8">
            <MasteryRing score={overallMastery} size="lg" />
            <p className="text-sm text-muted-foreground mt-4">Overall Mastery</p>
          </div>

          {/* Quick Stats */}
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
            <div className="text-xs text-success">Keep up the great work!</div>
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
                const concept = concepts.find(c => c.id === insight.conceptId);
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
              const mastery = studentMastery.find(m => m.conceptId === concept.id);
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
