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
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validation";
import { useCooldown } from "@/lib/useCooldown";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: pageTitle("Reset your password") },
      {
        name: "description",
        content: "Forgot your password? Enter your email and we'll send a reset link.",
      },
      { property: "og:title", content: pageTitle("Reset your password") },
      {
        property: "og:description",
        content: "Request a password reset link for your account.",
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
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const submit = async (values: ForgotPasswordValues) => {
    setBanner(null);
    try {
      await api.forgotPassword(values);
      setSentTo(values.email);
      start(30);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  const backLink = (
    <Link
      to="/signin"
      search={(prev: Record<string, unknown>) => prev}
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={`If an account exists for ${sentTo}, we've sent a password reset link.`}
        footer={backLink}
      >
        <ErrorBanner message={banner} />
        <button
          type="button"
          disabled={seconds > 0 || isSubmitting}
          onClick={() => submit({ email: sentTo })}
          className="h-11 w-full rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {seconds > 0 ? `Resend in ${seconds}s` : "Resend the email"}
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter the email on your account and we'll send you a reset link."
      footer={backLink}
    >
      <ErrorBanner message={banner} />
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <SubmitButton pending={isSubmitting}>Send reset link</SubmitButton>
      </form>
    </AuthCard>
  );
}
