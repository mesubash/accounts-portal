import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AuthCard } from "@/components/AuthCard";
import { SignedIn } from "@/components/SignedIn";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { takeHandoff } from "@/lib/handoffStore";
import type { Handoff } from "@/lib/oidc";
import { useQueryParam } from "@/lib/useAuthSearch";
import { useLoginOutcome } from "@/lib/useLoginOutcome";

export const Route = createFileRoute("/oauth/callback")({
  head: () => ({
    meta: [{ title: pageTitle("Signing you in") }, { name: "robots", content: "noindex" }],
  }),
  component: OAuthCallback,
});

/** Where spring-iam sends the browser after Google (or another provider) with ?code=… */
function OAuthCallback() {
  const code = useQueryParam("code");
  const providerError = useQueryParam("error");
  const [handoff] = useState<Handoff>(() => (typeof window === "undefined" ? {} : takeHandoff()));
  const { handle, signedIn } = useLoginOutcome(handoff);
  const [failure, setFailure] = useState<string | null>(null);
  const sent = useRef(false);

  useEffect(() => {
    if (!code || sent.current) return;
    sent.current = true; // single-use code
    api
      .oauthExchange(code)
      .then(handle)
      .catch((err) => setFailure(errorMessage(err)));
    // handle is stable enough for a one-shot effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (signedIn) return <SignedIn />;

  if (failure || providerError || !code) {
    return (
      <AuthCard
        title="Couldn't sign you in"
        subtitle={
          failure ??
          (providerError
            ? "The sign-in was cancelled or the provider turned it down."
            : "This page needs a sign-in code, and none came back.")
        }
        footer={<TextLink to="/signin">Try again</TextLink>}
      />
    );
  }

  return (
    <AuthCard title="Signing you in">
      <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Finishing up with your provider.
      </p>
    </AuthCard>
  );
}
