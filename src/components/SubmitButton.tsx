import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

/** Full-width primary action with a pending spinner. */
export function SubmitButton({
  pending,
  children,
  disabled,
  type = "submit",
  ...props
}: ButtonProps & { pending?: boolean; children: ReactNode }) {
  return (
    <Button
      type={type}
      className="h-11 w-full text-[15px]"
      disabled={pending || disabled}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
