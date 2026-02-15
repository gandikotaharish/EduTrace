import * as React from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";

interface SecureTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onViolation?: (type: 'paste_attempt' | 'suspicious_typing') => void;
  minTimeSeconds?: number;
  stepStartTime?: number;
}

const SecureTextarea = React.forwardRef<HTMLTextAreaElement, SecureTextareaProps>(
  ({ className, value, onChange, onViolation, minTimeSeconds = 30, stepStartTime, ...props }, ref) => {
    const { toast } = useToast();
    const [pasteWarning, setPasteWarning] = React.useState(false);
    const lastLengthRef = React.useRef(value.length);
    const keystrokeTimesRef = React.useRef<number[]>([]);

    // Block paste events
    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      setPasteWarning(true);
      toast({
        title: "Copy-paste is disabled",
        description: "Please write in your own words to demonstrate understanding.",
        variant: "destructive",
      });
      onViolation?.('paste_attempt');
      setTimeout(() => setPasteWarning(false), 3000);
    };

    // Block drop events
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      toast({
        title: "Drag & drop is disabled",
        description: "Please type your answer manually.",
        variant: "destructive",
      });
      onViolation?.('paste_attempt');
    };

    // Detect suspicious typing patterns
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const lengthDiff = newValue.length - lastLengthRef.current;

      // Detect sudden large text insertion (>40 chars in single event)
      if (lengthDiff > 40) {
        toast({
          title: "Suspicious entry detected",
          description: "Large text blocks inserted at once are flagged. Please type your answer.",
          variant: "destructive",
        });
        onViolation?.('suspicious_typing');
        // Still allow the change but flag it
      }

      // Track keystroke timing
      const now = Date.now();
      keystrokeTimesRef.current.push(now);
      // Keep only last 20 keystrokes
      if (keystrokeTimesRef.current.length > 20) {
        keystrokeTimesRef.current = keystrokeTimesRef.current.slice(-20);
      }

      lastLengthRef.current = newValue.length;
      onChange(newValue);
    };

    // Block keyboard paste shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        setPasteWarning(true);
        toast({
          title: "Copy-paste is disabled",
          description: "Please write in your own words.",
          variant: "destructive",
        });
        onViolation?.('paste_attempt');
        setTimeout(() => setPasteWarning(false), 3000);
      }
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            pasteWarning && "border-destructive ring-destructive/20",
            className,
          )}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onKeyDown={handleKeyDown}
          onContextMenu={(e) => e.preventDefault()}
          {...props}
        />
        {pasteWarning && (
          <div className="absolute top-2 right-2 text-destructive animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
        )}
      </div>
    );
  }
);

SecureTextarea.displayName = "SecureTextarea";

export { SecureTextarea };
