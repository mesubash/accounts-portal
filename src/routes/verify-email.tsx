import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AuthCard } from "@/components/AuthCard";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { useQueryParam } from "@/lib/useAuthSearch";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [{ title: pageTitle("Verify your email") }, { name: "robots", content: "noindex" }],
  }),
  component: VerifyEmail,
});

type State = { kind: "checking" } | { kind: "done" } | { kind: "failed"; message: string };

function VerifyEmail() {
  const token = useQueryParam("token");
  const [state, setState] = useState<State>({ kind: "checking" });
  const sent = useRef(false);

  useEffect(() => {
    // Tokens are single-use: StrictMode's double effect must not spend it twice.
    if (!token || sent.current) return;
    sent.current = true;
    api
      .verifyEmail(token)
      .then(() => setState({ kind: "done" }))
      .catch((err) => setState({ kind: "failed", message: errorMessage(err) }));
  }, [token]);

  const signIn = <TextLink to="/signin">Go to sign in</TextLink>;

  if (!token) {
    return (
      <AuthCard
        tone="danger"
        title="This link isn't complete"
        subtitle="The verification link is missing its token. Open it straight from the email we sent you."
        footer={signIn}
      />
    );
  }

  if (state.kind === "checking") {
    return (
      <AuthCard title="Verifying your email">
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          One moment while we confirm your link.
        </p>
      </AuthCard>
    );
  }

  if (state.kind === "done") {
    return (
      <AuthCard
        tone="success"
        title="Email verified"
        subtitle="Your account is ready. Sign in to get started."
        footer={signIn}
      />
    );
  }

  return (
    <AuthCard
      tone="danger"
      title="That link didn't work"
      subtitle={`${state.message} Links work once and expire, so the newest email is the one to use.`}
      footer={signIn}
    />
  );
}
