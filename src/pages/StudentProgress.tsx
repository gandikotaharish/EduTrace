import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConcepts } from "@/hooks/useConcepts";
import { useStudentMastery, useStudentInsights } from "@/hooks/useStudentData";
import { useVoiceContext } from "@/hooks/useVoiceContext";
import { getMasteryLevel, getMasteryColorClass } from "@/lib/mastery";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentProgress() {
  useVoiceContext(null);
  const { data: concepts = [], isLoading: conceptsLoading } = useConcepts();
  const { data: studentMastery = [], isLoading: masteryLoading } = useStudentMastery();
  const { data: studentInsights = [] } = useStudentInsights();

  const isLoading = conceptsLoading || masteryLoading;

  const overallMastery = studentMastery.length > 0
    ? Math.round(studentMastery.reduce((sum, m) => sum + m.mastery_score, 0) / studentMastery.length)
    : 0;
  
  const completedCount = studentMastery.filter(m => m.mastery_score >= 75).length;
  const inProgressCount = studentMastery.filter(m => m.mastery_score > 0 && m.mastery_score < 75).length;
  const totalConcepts = concepts.length;
  const completionRate = totalConcepts > 0 ? Math.round((completedCount / totalConcepts) * 100) : 0;
  
  const improvingCount = studentMastery.filter(m => m.trend === 'improving').length;
  
  const totalTimeSpent = studentMastery.reduce((sum, m) => sum + (m.evidence_count * 15), 0);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-success" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-destructive" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-48" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="text-muted-foreground mt-1">
            Track your learning journey and identify areas for improvement.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Mastery</p>
                  <p className="text-3xl font-bold">{overallMastery}%</p>
                </div>
                <MasteryRing score={overallMastery} size="sm" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount}/{totalConcepts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">{totalTimeSpent}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Improving</p>
                  <p className="text-2xl font-bold">{improvingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Course Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{completionRate}% Complete</span>
                <span>{completedCount} of {totalConcepts} concepts mastered</span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span>Mastered ({completedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>In Progress ({inProgressCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span>Not Started ({totalConcepts - studentMastery.length})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Concept Mastery List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Concept Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {concepts.map((concept) => {
                  const mastery = studentMastery.find(m => m.concept_id === concept.id);
                  const score = mastery?.mastery_score || 0;
                  const level = getMasteryLevel(score);
                  
                  return (
                    <div key={concept.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{concept.name}</span>
                          {mastery && getTrendIcon(mastery.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {level.level}
                          </Badge>
                          <span className="text-sm font-medium w-10 text-right">{score}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", getMasteryColorClass(score))}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Learning Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Learning Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentInsights.length > 0 ? (
                <div className="space-y-4">
                  {studentInsights.map((insight) => {
                    const concept = concepts.find(c => c.id === insight.concept_id);
                    
                    return (
                      <div 
                        key={insight.id} 
                        className={cn(
                          "p-4 rounded-lg border-l-4",
                          insight.severity === 'high' && "bg-destructive/5 border-destructive",
                          insight.severity === 'medium' && "bg-warning/5 border-warning",
                          insight.severity === 'low' && "bg-info/5 border-info"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={cn(
                            "w-5 h-5 mt-0.5",
                            insight.severity === 'high' && "text-destructive",
                            insight.severity === 'medium' && "text-warning",
                            insight.severity === 'low' && "text-info"
                          )} />
                          <div>
                            <p className="font-medium text-sm">{concept?.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            <p className="text-xs text-primary mt-2">
                              💡 {insight.suggested_action}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success/50" />
                  <p>No learning gaps detected!</p>
                  <p className="text-sm">Complete concepts to see personalized insights.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentMastery.length > 0 ? (
              <div className="space-y-4">
                {studentMastery.slice(0, 5).map((mastery) => {
                  const concept = concepts.find(c => c.id === mastery.concept_id);
                  const level = getMasteryLevel(mastery.mastery_score);
                  
                  return (
                    <div key={mastery.concept_id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getMasteryColorClass(mastery.mastery_score)
                        )} />
                        <div>
                          <p className="font-medium">{concept?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {mastery.evidence_count} learning activities completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(mastery.trend)}
                        <Badge variant={mastery.mastery_score >= 75 ? "default" : "secondary"}>
                          {mastery.mastery_score}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Start learning concepts to see your progress here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
