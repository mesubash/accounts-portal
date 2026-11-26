import { cn } from "@/lib/utils";
import { passwordStrength } from "@/lib/validation";

const TONE = ["", "bg-destructive", "bg-amber-500", "bg-primary", "bg-success"];

/** Four-segment strength hint under a new-password field. */
export function PasswordMeter({ value }: { value: string }) {
  const { score, label } = passwordStrength(value);
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full bg-border transition-colors duration-300 motion-reduce:transition-none",
              score >= i && TONE[score],
            )}
          />
        ))}
      </div>
      <span className="w-16 text-right text-[13px] text-muted-foreground">
        {label ? label : "8+ chars"}
      </span>
    </div>
  );
}
