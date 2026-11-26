import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { pageTitle } from "@/lib/brand";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { api, errorMessage, type MfaSetupResult } from "@/lib/api";
import { redirectBack } from "@/lib/oidc";
import { codeFormSchema, type CodeValues } from "@/lib/validation";

export const Route = createFileRoute("/mfa/enroll")({
  head: () => ({
    meta: [
      { title: pageTitle("Set up two-step verification") },
      {
        name: "description",
        content:
          "Add an authenticator app to your account for two-step verification.",
      },
      { property: "og:title", content: pageTitle("Set up two-step verification") },
      { property: "og:description", content: "Add an authenticator app to your account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MfaEnroll,
});

function MfaEnroll() {
  const [setup, setSetup] = useState<MfaSetupResult | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .mfaSetup()
      .then((data) => !cancelled && setSetup(data))
      .catch((err) => !cancelled && setBanner(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CodeValues>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: CodeValues) => {
    setBanner(null);
    try {
      const result = await api.mfaEnable({ code: values.code });
      if (!redirectBack(result.redirectTo)) setEnabled(true);
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
      Back to sign in
    </Link>
  );

  if (enabled) {
    return (
      <AuthCard title="Two-step verification is on" footer={signInLink}>
        <p className="text-center text-sm text-muted-foreground">
          From now on we'll ask for a code from your authenticator app when you sign in.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set up two-step verification"
      subtitle="Scan the code with your authenticator app, then enter the 6-digit code it shows."
      footer={signInLink}
    >
      <ErrorBanner message={banner} />

      <div className="mb-6 flex flex-col items-center gap-3">
        {setup?.qrCodeUrl ? (
          <img
            src={setup.qrCodeUrl}
            alt="QR code for setting up two-step verification in your authenticator app"
            className="h-40 w-40 rounded-md border border-border bg-white p-2"
          />
        ) : (
          <div className="h-40 w-40 animate-pulse rounded-md border border-border bg-muted" />
        )}

        {setup?.secret ? (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Can't scan? Enter this key instead</p>
            <code className="mt-1 inline-block rounded bg-muted px-2 py-1 font-mono text-sm break-all text-foreground">
              {setup.secret}
            </code>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em]"
          error={errors.code?.message}
          {...register("code")}
        />
        <SubmitButton pending={isSubmitting}>Turn on two-step verification</SubmitButton>
      </form>
    </AuthCard>
  );
}
