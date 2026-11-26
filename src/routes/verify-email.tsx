import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { pageTitle } from "@/lib/brand";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { api, errorMessage } from "@/lib/api";
import { redirectBack } from "@/lib/oidc";
import { useAuthSearch } from "@/lib/useAuthSearch";
import { useCooldown } from "@/lib/useCooldown";
import { emailSchema } from "@/lib/validation";
import { z } from "zod";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: pageTitle("Verify your email") },
      {
        name: "description",
        content: "Confirm your email address to activate your account.",
      },
      { property: "og:title", content: pageTitle("Verify your email") },
      { property: "og:description", content: "Confirm your email to activate your account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmail,
});

const resendSchema = z.object({ email: emailSchema });
type ResendValues = z.infer<typeof resendSchema>;

type State = "checking" | "success" | "failed" | "no-token";

function VerifyEmail() {
  const { searchStr } = useAuthSearch();
  const token = new URLSearchParams(searchStr).get("token");
  const [state, setState] = useState<State>(token ? "checking" : "no-token");
  const [banner, setBanner] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const { seconds, start } = useCooldown();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .verifyEmail({ token })
      .then((result) => {
        if (cancelled) return;
        if (!redirectBack(result.redirectTo)) setState("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setBanner(errorMessage(err));
        setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: { email: "" },
  });

  const resend = async (values: ResendValues) => {
    setBanner(null);
    try {
      await api.resendVerification(values);
      setResent(true);
      start(30);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  const signInLink = (
    <Link
      to="/signin"
      search={(prev: Record<string, unknown>) => prev}
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      Go to sign in
    </Link>
  );

  if (state === "checking") {
    return (
      <AuthCard title="Verifying your email">
        <p aria-live="polite" className="text-center text-sm text-muted-foreground">
          One moment while we confirm your link.
        </p>
      </AuthCard>
    );
  }

  if (state === "success") {
    return (
      <AuthCard title="Email verified" footer={signInLink}>
        <p className="text-center text-sm text-muted-foreground">
          Your account is ready. You can sign in now.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={state === "no-token" ? "Verify your email" : "That link didn't work"}
      subtitle={
        state === "no-token"
          ? "Enter your email and we'll send a fresh verification link."
          : "The link may have expired or already been used. We can send a new one."
      }
      footer={signInLink}
    >
      <ErrorBanner message={banner} />

      {resent ? (
        <p aria-live="polite" className="mb-4 text-center text-sm text-muted-foreground">
          Sent. Check your inbox for the new link.
        </p>
      ) : null}

      <form onSubmit={handleSubmit(resend)} noValidate className="space-y-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <SubmitButton pending={isSubmitting} disabled={seconds > 0}>
          {seconds > 0 ? `Resend in ${seconds}s` : "Send verification link"}
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
