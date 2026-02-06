import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConceptCard } from "@/components/dashboard/ConceptCard";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  concepts, 
  sampleMasteryData,
  htmlSubject
} from "@/data/sampleData";
import { BookOpen, CheckCircle2, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AllConcepts() {
  const navigate = useNavigate();
  const { userName } = useAuth();
  
  // For now, use first sample student's data - in production this would be user-specific
  const sampleStudentId = 'student-1';
  const studentMastery = sampleMasteryData.filter(m => m.studentId === sampleStudentId);
  
  // Calculate stats
  const completedCount = studentMastery.filter(m => m.masteryScore >= 75).length;
  const inProgressCount = studentMastery.filter(m => m.masteryScore > 0 && m.masteryScore < 75).length;
  const notStartedCount = concepts.length - studentMastery.length;
  const overallProgress = Math.round((completedCount / concepts.length) * 100);

  // Group concepts by prerequisite completion
  const getConceptStatus = (conceptId: string) => {
    const mastery = studentMastery.find(m => m.conceptId === conceptId);
    if (!mastery) return 'not-started';
    if (mastery.masteryScore >= 75) return 'completed';
    return 'in-progress';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">All Concepts</h1>
          <p className="text-muted-foreground mt-1">
            Master each concept step by step. Complete prerequisites to unlock advanced topics.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="evidence-card">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="font-semibold">{htmlSubject.name}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{htmlSubject.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Course Progress</span>
                  <span className="font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>
            
            <div className="flex gap-4 md:gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-xs text-muted-foreground">Mastered</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 mx-auto mb-2">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div className="text-2xl font-bold">{inProgressCount}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-2">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{notStartedCount}</div>
                <div className="text-xs text-muted-foreground">Not Started</div>
              </div>
            </div>
          </div>
        </div>

        {/* Concept Grid */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold">Learning Path</h2>
            <Badge variant="outline" className="text-xs">
              {concepts.length} concepts
            </Badge>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concepts.map((concept) => {
              const mastery = studentMastery.find(m => m.conceptId === concept.id);
              const status = getConceptStatus(concept.id);
              
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

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Mastered (75%+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Not Started</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
