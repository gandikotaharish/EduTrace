import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MasteryRing } from "@/components/dashboard/MasteryRing";
import { ConceptCard } from "@/components/dashboard/ConceptCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { IntegrityBadge } from "@/components/integrity/IntegrityBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useConcepts } from "@/hooks/useConcepts";
import { useStudentMastery, useStudentInsights, useStudentEvidence } from "@/hooks/useStudentData";
import { useIntegrityScore } from "@/hooks/useIntegrity";
import { TrendingUp, Target, BookOpen, ChevronRight, ShieldCheck, Sparkles, Send, Loader2, Calendar, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getCopilotResponse } from "@/ai/copilot";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { userName } = useAuth();
  const displayName = userName || 'Student';
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotReply, setCopilotReply] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);

  const { data: concepts = [], isLoading: conceptsLoading } = useConcepts();
  const { data: studentMastery = [], isLoading: masteryLoading } = useStudentMastery();
  const { data: studentInsights = [], isLoading: insightsLoading } = useStudentInsights();
  const { data: studentEvidence = [] } = useStudentEvidence();
  const { data: integrityData } = useIntegrityScore();

  const lastActivityDate = studentEvidence.length > 0
    ? new Date(Math.max(...studentEvidence.map((e) => new Date(e.created_at).getTime())))
    : null;
  const last14Days = 14 * 24 * 60 * 60 * 1000;
  const recentEvidence = studentEvidence.filter((e) => Date.now() - new Date(e.created_at).getTime() < last14Days);
  const activeDays = new Set(recentEvidence.map((e) => new Date(e.created_at).toDateString())).size;
  const consistencyScore = Math.min(100, Math.round((activeDays / 14) * 100));

  const incompleteMastery = studentMastery.filter((m) => m.mastery_score < 75).sort(
    (a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
  );
  const resumeConcept = incompleteMastery.length > 0
    ? concepts.find((c) => c.id === incompleteMastery[0].concept_id)
    : concepts.find((c) => !studentMastery.some((m) => m.concept_id === c.id));

  const overallMastery = studentMastery.length > 0
    ? Math.round(studentMastery.reduce((sum, m) => sum + m.mastery_score, 0) / studentMastery.length)
    : 0;

  const weakConceptNames = concepts
    .filter((c) => studentMastery.some((m) => m.concept_id === c.id && m.mastery_score < 55))
    .map((c) => c.name);

  const handleCopilotAsk = async () => {
    if (!copilotQuestion.trim() || copilotLoading) return;
    setCopilotLoading(true);
    setCopilotReply('');
    try {
      const reply = await getCopilotResponse(
        copilotQuestion.trim(),
        {
          userName: displayName,
          masteryScore: overallMastery,
          integrityScore: integrityData?.score,
          weakConcepts: weakConceptNames,
        },
        i18n.language || 'en'
      );
      setCopilotReply(reply);
    } catch {
      setCopilotReply('Sorry, I could not respond right now. Please try again.');
    } finally {
      setCopilotLoading(false);
    }
  };

  const isLoading = conceptsLoading || masteryLoading;

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
          {(resumeConcept || nextConcept) && (
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate(`/student/learn/${(resumeConcept || nextConcept)!.id}`)}
            >
              {resumeConcept ? 'Resume Incomplete' : 'Continue Learning'}
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

          {/* Accountability: last activity & consistency */}
          <div className="evidence-card col-span-1 md:col-span-4 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Last activity</div>
                <div className="font-medium">{lastActivityDate ? lastActivityDate.toLocaleDateString() : 'No activity yet'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Consistency (last 14 days)</div>
                <div className="font-medium">{consistencyScore}% — {activeDays} days active</div>
              </div>
            </div>
          </div>

          {/* Integrity Score Card */}
          {integrityData && (
            <div className="evidence-card col-span-1 md:col-span-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1">Academic Integrity</div>
                  <IntegrityBadge score={integrityData.score} size="md" />
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5 text-right">
                  {integrityData.paste_attempts > 0 && <div>{integrityData.paste_attempts} paste attempts</div>}
                  {integrityData.tab_switches > 0 && <div>{integrityData.tab_switches} tab switches</div>}
                  {integrityData.paste_attempts === 0 && integrityData.tab_switches === 0 && <div>Clean record ✓</div>}
                </div>
              </div>
            </div>
          )}
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

        {/* AI Learning Copilot */}
        <div className="evidence-card border-primary/20 bg-primary/5">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Learning Copilot
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Ask for help with concepts, simpler explanations, or what to practice next. I know your mastery and weak areas.
          </p>
          <div className="flex gap-2">
            <Textarea
              placeholder={t('askQuestion')}
              value={copilotQuestion}
              onChange={(e) => setCopilotQuestion(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={copilotLoading}
            />
            <Button onClick={handleCopilotAsk} disabled={copilotLoading || !copilotQuestion.trim()} size="icon" className="shrink-0 h-10 w-10">
              {copilotLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {copilotReply && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">{copilotReply}</div>
          )}
        </div>

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
