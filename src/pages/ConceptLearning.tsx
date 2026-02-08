import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useConceptWithContent } from "@/hooks/useConcepts";
import { useSubmitEvidence } from "@/hooks/useSubmitEvidence";
import { BookOpen, Lightbulb, MessageCircle, Wrench, ChevronRight, ChevronLeft, Check, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LearningStep = 'explanation' | 'thinking' | 'reflection' | 'application' | 'complete';

const steps: { key: LearningStep; icon: typeof BookOpen; label: string }[] = [
  { key: 'explanation', icon: BookOpen, label: 'Learn' },
  { key: 'thinking', icon: Lightbulb, label: 'Think' },
  { key: 'reflection', icon: MessageCircle, label: 'Reflect' },
  { key: 'application', icon: Wrench, label: 'Apply' },
];

export default function ConceptLearning() {
  const { conceptId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useConceptWithContent(conceptId);
  const submitEvidence = useSubmitEvidence();

  const [currentStep, setCurrentStep] = useState<LearningStep>('explanation');
  const [thinkingAnswer, setThinkingAnswer] = useState('');
  const [confusionPoint, setConfusionPoint] = useState('');
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [confidence, setConfidence] = useState<number>(3);
  const [applicationAnswer, setApplicationAnswer] = useState('');

  // Time tracking
  const stepStartTime = useRef(Date.now());
  const thinkingTime = useRef(0);
  const applicationTime = useRef(0);
  const thinkingAttempts = useRef(1);

  const concept = data?.concept;
  const content = data?.content;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  if (!concept || !content) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Concept not found</h1>
          <p className="text-muted-foreground mb-6">This concept doesn't have learning content yet.</p>
          <Button onClick={() => navigate('/student/learn')}>Browse All Concepts</Button>
        </div>
      </DashboardLayout>
    );
  }

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = currentStep === 'complete' ? 100 : ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = async () => {
    const now = Date.now();
    const elapsed = Math.round((now - stepStartTime.current) / 1000);

    if (currentStep === 'thinking') {
      thinkingTime.current = elapsed;
    } else if (currentStep === 'application') {
      applicationTime.current = elapsed;
    }

    stepStartTime.current = now;

    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    } else {
      // Submit evidence to database
      await submitEvidence.mutateAsync({
        conceptId: concept.id,
        thinkingAnswer,
        thinkingTimeSeconds: thinkingTime.current,
        thinkingAttempts: thinkingAttempts.current,
        thinkingCorrectness: evaluateThinkingCorrectness(),
        confusionPoint,
        mistakeDescription,
        confidenceScore: confidence,
        applicationAnswer,
        applicationTimeSeconds: applicationTime.current,
        applicationCorrectness: evaluateApplicationCorrectness(),
      });
      setCurrentStep('complete');
    }
  };

  const evaluateThinkingCorrectness = (): 'correct' | 'partial' | 'incorrect' => {
    if (!content.thinking_task_expected_insights) return 'partial';
    const answer = thinkingAnswer.toLowerCase();
    const insights = content.thinking_task_expected_insights;
    const matchCount = insights.filter(insight => {
      const keywords = insight.toLowerCase().split(' ').filter(w => w.length > 4);
      return keywords.some(keyword => answer.includes(keyword));
    }).length;
    const ratio = matchCount / insights.length;
    if (ratio >= 0.6) return 'correct';
    if (ratio >= 0.3) return 'partial';
    return 'incorrect';
  };

  const evaluateApplicationCorrectness = (): 'correct' | 'partial' | 'incorrect' => {
    if (!content.micro_app_rubric) return 'partial';
    const answer = applicationAnswer.toLowerCase();
    const rubric = content.micro_app_rubric;
    const matchCount = rubric.filter(item => {
      const keywords = item.toLowerCase().split(' ').filter(w => w.length > 4);
      return keywords.some(keyword => answer.includes(keyword));
    }).length;
    const ratio = matchCount / rubric.length;
    if (ratio >= 0.6) return 'correct';
    if (ratio >= 0.3) return 'partial';
    return 'incorrect';
  };

  const handlePrevious = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'thinking':
        return thinkingAnswer.trim().length >= 20;
      case 'reflection':
        return confusionPoint.trim().length >= 10;
      case 'application':
        return applicationAnswer.trim().length >= 20;
      default:
        return true;
    }
  };

  const nextConceptHandler = () => {
    // Navigate to the learning page to pick next concept
    navigate('/student/learn');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/student/learn')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Concepts
          </Button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{concept.name}</h1>
              <p className="text-muted-foreground">{concept.description}</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>~{concept.estimated_minutes} min</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-6">
            {steps.map((step, i) => {
              const isActive = step.key === currentStep;
              const isComplete = currentStepIndex > i || currentStep === 'complete';
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                    isActive && "bg-primary text-primary-foreground",
                    isComplete && !isActive && "text-success",
                    !isActive && !isComplete && "text-muted-foreground"
                  )}>
                    {isComplete && !isActive ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                    <span className="font-medium hidden sm:inline">{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-2",
                      isComplete ? "bg-success" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="evidence-card mb-6">
          {currentStep === 'explanation' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Understanding the Concept
              </h2>
              <div className="prose prose-slate max-w-none">
                {content.explanation.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'thinking' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Thinking Task
              </h2>
              <p className="text-muted-foreground">
                {content.thinking_task_prompt}
              </p>
              {content.thinking_task_context && (
                <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  {content.thinking_task_context}
                </pre>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Answer</label>
                <Textarea
                  placeholder="Explain your thinking here... What do you notice? What's wrong and why does it matter?"
                  value={thinkingAnswer}
                  onChange={(e) => setThinkingAnswer(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  Write at least 20 characters to continue ({thinkingAnswer.length}/20)
                </p>
              </div>
            </div>
          )}

          {currentStep === 'reflection' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-info" />
                Reflect on Your Learning
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {content.reflection_prompts?.[0] || 'What part of this concept confused you the most?'}
                  </label>
                  <Textarea
                    placeholder="Describe any confusion or difficulty you experienced..."
                    value={confusionPoint}
                    onChange={(e) => setConfusionPoint(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {content.reflection_prompts?.[1] || 'What mistake did you make while working through this?'}
                  </label>
                  <Textarea
                    placeholder="Describe any mistakes or misconceptions you had..."
                    value={mistakeDescription}
                    onChange={(e) => setMistakeDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {content.reflection_prompts?.[2] || 'How confident are you about this concept?'}
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfidence(level)}
                        className={cn(
                          "flex-1 py-3 rounded-lg border-2 transition-all font-medium",
                          confidence === level
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Not confident</span>
                    <span>Very confident</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'application' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-success" />
                Micro Application
              </h2>
              <p className="text-muted-foreground">
                {content.micro_app_prompt}
              </p>
              
              {content.micro_app_rubric && content.micro_app_rubric.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">You'll be evaluated on:</h4>
                  <ul className="space-y-1">
                    {content.micro_app_rubric.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Solution</label>
                <Textarea
                  placeholder="Write your solution here..."
                  value={applicationAnswer}
                  onChange={(e) => setApplicationAnswer(e.target.value)}
                  className="min-h-[150px] font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Write at least 20 characters to continue ({applicationAnswer.length}/20)
                </p>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Concept Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Your learning evidence has been captured and your mastery score updated.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate('/student')}>
                  Back to Dashboard
                </Button>
                <Button variant="hero" onClick={nextConceptHandler}>
                  Next Concept
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        {currentStep !== 'complete' && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed() || submitEvidence.isPending}
            >
              {submitEvidence.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {currentStepIndex === steps.length - 1 ? 'Complete' : 'Continue'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
