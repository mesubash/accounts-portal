import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { DEMO, DEMO_OAUTH_RETURN } from "@/lib/demoFlag";
import { saveHandoff } from "@/lib/handoffStore";
import { useHandoff } from "@/lib/useAuthSearch";

const LABELS: Record<string, string> = {
  google: "Google",
  github: "GitHub",
  microsoft: "Microsoft",
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"
      />
      <path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9l3.7-2.8z" />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"
      />
    </svg>
  );
}

// One fetch per page load; navigating between sign-in and sign-up reuses it.
let cached: Promise<string[]> | null = null;
const loadProviders = () => (cached ??= api.oauthProviders().catch(() => []));

/**
 * An "or" divider and one button per provider the IAM reports. Renders nothing until the list
 * loads, or at all if social login is off, so the page never offers a dead button.
 */
export function SocialButtons() {
  const handoff = useHandoff();
  const [providers, setProviders] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    // A failed lookup means no social login: the email form still works.
    void loadProviders().then((list) => !cancelled && setProviders(list));
    return () => {
      cancelled = true;
    };
  }, []);

  if (providers.length === 0) return null;

  const start = (provider: string) => {
    saveHandoff(handoff);
    if (DEMO) return window.location.assign(DEMO_OAUTH_RETURN);
    const query = new URLSearchParams({ redirectUri: `${window.location.origin}/oauth/callback` });
    if (handoff.audience) query.set("audience", handoff.audience);
    window.location.assign(`/api/auth/oauth/login/${encodeURIComponent(provider)}?${query}`);
  };

  return (
    <div className="grid gap-2.5">
      <div className="my-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      {providers.map((p) => (
        <Button
          key={p}
          type="button"
          variant="outline"
          className="h-11 w-full gap-2.5 font-normal"
          onClick={() => start(p)}
        >
          {p === "google" ? <GoogleMark /> : null}
          Continue with {LABELS[p] ?? p.charAt(0).toUpperCase() + p.slice(1)}
        </Button>
      ))}
    </div>
  );
}
