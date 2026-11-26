import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { pageTitle } from "@/lib/brand";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { api, errorMessage } from "@/lib/api";
import { redirectBack } from "@/lib/oidc";
import { useAuthSearch } from "@/lib/useAuthSearch";
import { codeFormSchema, type CodeValues } from "@/lib/validation";

export const Route = createFileRoute("/mfa/")({
  head: () => ({
    meta: [
      { title: pageTitle("Two-step verification") },
      {
        name: "description",
        content: "Enter the 6-digit code from your authenticator app to finish signing in.",
      },
      { property: "og:title", content: pageTitle("Two-step verification") },
      { property: "og:description", content: "Confirm it's you with a 6-digit code." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Mfa,
});

function Mfa() {
  const { searchStr } = useAuthSearch();
  const challengeId = new URLSearchParams(searchStr).get("challengeId") ?? "";
  const [banner, setBanner] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

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
      const result = await api.mfaVerify({ challengeId, code: values.code });
      if (!redirectBack(result.redirectTo)) setSignedIn(true);
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

  if (signedIn) {
    return (
      <AuthCard title="You're signed in" footer={signInLink}>
        <p className="text-center text-sm text-muted-foreground">
          There's nowhere to send you back to, so you can close this tab.
        </p>
      </AuthCard>
    );
  }

  if (!challengeId) {
    return (
      <AuthCard title="Start again" footer={signInLink}>
        <p className="text-center text-sm text-muted-foreground">
          This verification step expired. Sign in again to get a new code.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Confirm it's you"
      subtitle="Enter the 6-digit code from your authenticator app."
      footer={signInLink}
    >
      <ErrorBanner message={banner} />
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
        <SubmitButton pending={isSubmitting}>Verify</SubmitButton>
      </form>
    </AuthCard>
  );
}
