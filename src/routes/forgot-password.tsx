import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { useCooldown } from "@/lib/useCooldown";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: pageTitle("Reset your password") },
      {
        name: "description",
        content: "Forgot your password? Enter your email and we'll send a reset link.",
      },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [banner, setBanner] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { seconds, start } = useCooldown();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const send = async ({ email }: ForgotPasswordValues) => {
    setBanner(null);
    try {
      await api.forgotPassword(email);
      setSentTo(email);
      start(30);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  const back = <TextLink to="/signin">Back to sign in</TextLink>;

  if (sentTo) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={
          <>
            If an account exists for <strong className="text-foreground">{sentTo}</strong>, a reset
            link is on its way. It works once and expires soon.
          </>
        }
        footer={back}
      >
        <ErrorBanner message={banner} />
        <SubmitButton
          variant="outline"
          type="button"
          pending={isSubmitting}
          disabled={seconds > 0}
          onClick={() => void send({ email: getValues("email") })}
        >
          {seconds > 0 ? `Send again in ${seconds}s` : "Send again"}
        </SubmitButton>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a reset link."
      footer={back}
    >
      <ErrorBanner message={banner} />
      <form onSubmit={handleSubmit(send)} noValidate className="grid gap-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <SubmitButton pending={isSubmitting}>Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}
