import { cn } from "@/lib/utils";
import { getMasteryLevel } from "@/data/sampleData";

interface MasteryRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { ring: 60, stroke: 6, text: 'text-sm' },
  md: { ring: 100, stroke: 8, text: 'text-xl' },
  lg: { ring: 140, stroke: 10, text: 'text-3xl' },
};

export function MasteryRing({ score, size = 'md', showLabel = true, className }: MasteryRingProps) {
  const { ring, stroke, text } = sizeMap[size];
  const radius = (ring - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((100 - score) / 100) * circumference;
  const { level, color } = getMasteryLevel(score);

  // Get color based on mastery level
  const getStrokeColor = () => {
    if (score >= 90) return 'stroke-emerald-500';
    if (score >= 75) return 'stroke-teal-500';
    if (score >= 55) return 'stroke-amber-500';
    if (score >= 35) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: ring, height: ring }}>
        <svg
          className="transform -rotate-90"
          width={ring}
          height={ring}
        >
          {/* Background circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            strokeWidth={stroke}
            className="fill-none stroke-muted"
          />
          {/* Progress circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            className={cn("fill-none transition-all duration-500", getStrokeColor())}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: progress,
            }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", text)}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-sm font-medium px-2 py-1 rounded-full border", color)}>
          {level}
        </span>
      )}
    </div>
  );
}
