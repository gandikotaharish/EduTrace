import { GapInsight } from "@/types";
import { AlertTriangle, Brain, Link, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface InsightCardProps {
  insight: GapInsight;
  conceptName?: string;
  onAction?: () => void;
}

const insightConfig = {
  fragile_understanding: {
    icon: Lightbulb,
    label: 'Fragile Understanding',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  misconception: {
    icon: Brain,
    label: 'Misconception',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
  missing_prerequisite: {
    icon: Link,
    label: 'Missing Prerequisite',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
  },
  false_confidence: {
    icon: AlertTriangle,
    label: 'False Confidence',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
};

const severityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/20 text-warning',
  high: 'bg-destructive/20 text-destructive',
};

export function InsightCard({ insight, conceptName, onAction }: InsightCardProps) {
  const config = insightConfig[insight.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl border p-5",
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-sm font-medium", config.color)}>
              {config.label}
            </span>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              severityColors[insight.severity]
            )}>
              {insight.severity}
            </span>
          </div>

          {conceptName && (
            <div className="text-sm text-muted-foreground mb-2">
              Concept: <span className="font-medium text-foreground">{conceptName}</span>
            </div>
          )}

          <p className="text-sm text-foreground mb-3">
            {insight.description}
          </p>

          <div className="insight-highlight">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Suggested:</span> {insight.suggestedAction}
            </p>
          </div>

          {onAction && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("mt-3", config.color)}
              onClick={onAction}
            >
              Take Action
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
