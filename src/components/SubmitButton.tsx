import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  pending,
  children,
  disabled,
}: {
  pending?: boolean;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" className="h-11 w-full" disabled={pending || disabled}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}
