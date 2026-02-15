import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function IntegrityBadge({ score, size = 'md', showLabel = true }: IntegrityBadgeProps) {
  const getColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getIcon = () => {
    if (score >= 80) return ShieldCheck;
    if (score >= 50) return Shield;
    return ShieldAlert;
  };

  const getLabel = () => {
    if (score >= 80) return 'High Integrity';
    if (score >= 50) return 'Moderate';
    return 'Low Integrity';
  };

  const Icon = getIcon();
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className={cn("flex items-center gap-1.5", getColor())}>
      <Icon className={iconSize} />
      {showLabel && (
        <div className="flex flex-col">
          <span className={cn("font-bold", size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base')}>
            {score}%
          </span>
          {size !== 'sm' && (
            <span className="text-xs opacity-80">{getLabel()}</span>
          )}
        </div>
      )}
    </div>
  );
}
