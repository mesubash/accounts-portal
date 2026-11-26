import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SignedIn } from "@/components/SignedIn";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { useLoginOutcome } from "@/lib/useLoginOutcome";
import { codeFormSchema, recoveryFormSchema, type CodeValues } from "@/lib/validation";

export const Route = createFileRoute("/mfa/")({
  head: () => ({
    meta: [{ title: pageTitle("Two-step verification") }, { name: "robots", content: "noindex" }],
  }),
  component: Mfa,
});

function Mfa() {
  const challenge = useRouterState({ select: (s) => s.location.state.challenge });
  const { handle, signedIn } = useLoginOutcome();
  const [banner, setBanner] = useState<string | null>(null);
  const [useRecovery, setUseRecovery] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CodeValues>({
    resolver: zodResolver(useRecovery ? recoveryFormSchema : codeFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async ({ code }: CodeValues) => {
    if (!challenge) return;
    setBanner(null);
    try {
      await handle(await api.mfaVerify({ challenge, code }));
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  const back = <TextLink to="/signin">Back to sign in</TextLink>;

  if (signedIn) return <SignedIn />;

  if (!challenge) {
    return (
      <AuthCard
        title="Sign in again"
        subtitle="This verification step has expired or was opened in a new tab. Sign in again to get a fresh one."
        footer={back}
      />
    );
  }

  const toggle = () => {
    setUseRecovery((v) => !v);
    setBanner(null);
    reset({ code: "" });
  };

  return (
    <AuthCard
      title="Confirm it's you"
      subtitle={
        useRecovery
          ? "Enter one of the recovery codes you saved when you set up two-step verification."
          : "Enter the 6-digit code from your authenticator app."
      }
      footer={back}
    >
      <ErrorBanner message={banner} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        {useRecovery ? (
          <FormField
            key="recovery"
            label="Recovery code"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
            className="font-mono"
            error={errors.code?.message}
            {...register("code")}
          />
        ) : (
          <FormField
            key="totp"
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.5em]"
            error={errors.code?.message}
            {...register("code")}
          />
        )}
        <SubmitButton pending={isSubmitting}>Verify</SubmitButton>
      </form>
      <button
        type="button"
        onClick={toggle}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
      >
        {useRecovery
          ? "Use your authenticator app instead"
          : "Can't use your app? Use a recovery code"}
      </button>
    </AuthCard>
  );
}
