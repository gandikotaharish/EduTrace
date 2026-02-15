import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface MinTimeGateProps {
  minSeconds: number;
  startTime: number;
  children: (canProceed: boolean, remainingSeconds: number) => React.ReactNode;
}

export function MinTimeGate({ minSeconds, startTime, children }: MinTimeGateProps) {
  const [remaining, setRemaining] = useState(minSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(0, minSeconds - elapsed);
      setRemaining(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [minSeconds, startTime]);

  return <>{children(remaining <= 0, remaining)}</>;
}

export function TimeRemainingIndicator({ seconds }: { seconds: number }) {
  if (seconds <= 0) return null;
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
      <Clock className="w-4 h-4" />
      <span>Please spend at least <strong>{seconds}s</strong> more thinking before submitting.</span>
    </div>
  );
}
