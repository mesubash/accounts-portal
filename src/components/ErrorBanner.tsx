import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function ErrorBanner({ message }: { message?: string | null }) {
  return (
    <div aria-live="polite" aria-atomic="true">
      {message ? (
        <Alert variant="destructive" className="mb-4 text-left">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
