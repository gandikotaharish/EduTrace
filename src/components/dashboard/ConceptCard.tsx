import { MasteryRing } from "./MasteryRing";
import { Clock, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Concept } from "@/hooks/useConcepts";
import type { ConceptMastery } from "@/hooks/useStudentData";

interface ConceptCardProps {
  concept: Concept;
  mastery?: ConceptMastery;
  onClick?: () => void;
  showProgress?: boolean;
}

export function ConceptCard({ concept, mastery, onClick, showProgress = true }: ConceptCardProps) {
  const isCompleted = mastery && mastery.mastery_score >= 75;
  const needsAttention = mastery && mastery.mastery_score < 55;

  return (
    <div
      className={cn(
        "evidence-card cursor-pointer group",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isCompleted && <CheckCircle className="w-4 h-4 text-success" />}
            {needsAttention && <AlertCircle className="w-4 h-4 text-warning" />}
            <h3 className="font-semibold text-lg">{concept.name}</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">{concept.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{concept.estimated_minutes} min</span>
            </div>
            {mastery && (
              <div className="flex items-center gap-1">
                <span>Attempts: {mastery.evidence_count}</span>
              </div>
            )}
          </div>
        </div>

        {showProgress && mastery && (
          <MasteryRing score={mastery.mastery_score} size="sm" showLabel={false} />
        )}

        {onClick && (
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {mastery && mastery.trend !== 'stable' && (
        <div className={cn(
          "mt-4 pt-4 border-t border-border/50 text-sm",
          mastery.trend === 'improving' ? 'text-success' : 'text-destructive'
        )}>
          {mastery.trend === 'improving' ? '↑ Improving' : '↓ Needs attention'}
        </div>
      )}
    </div>
  );
}
