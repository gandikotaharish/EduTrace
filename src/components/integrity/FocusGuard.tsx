import { useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface FocusGuardProps {
  active: boolean;
  onTabSwitch?: () => void;
  children: React.ReactNode;
}

export function FocusGuard({ active, onTabSwitch, children }: FocusGuardProps) {
  const { toast } = useToast();
  const switchCountRef = useRef(0);

  const handleVisibilityChange = useCallback(() => {
    if (!active) return;
    if (document.hidden) {
      switchCountRef.current += 1;
      onTabSwitch?.();
      toast({
        title: "Please stay focused",
        description: `You've switched away from this task. (${switchCountRef.current} time${switchCountRef.current > 1 ? 's' : ''})`,
        variant: "destructive",
      });
    }
  }, [active, onTabSwitch, toast]);

  useEffect(() => {
    if (!active) return;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [active, handleVisibilityChange]);

  return <>{children}</>;
}
