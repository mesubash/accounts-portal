import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { PasswordMeter } from "@/components/PasswordMeter";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { useQueryParam } from "@/lib/useAuthSearch";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: pageTitle("Choose a new password") }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const token = useQueryParam("token");
  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async ({ password }: ResetPasswordValues) => {
    if (!token) return;
    setBanner(null);
    try {
      await api.resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  if (!token) {
    return (
      <AuthCard
        tone="danger"
        title="This link isn't complete"
        subtitle="The reset link is missing its token. Open it straight from the email, or ask for a new one."
        footer={<TextLink to="/forgot-password">Request a new link</TextLink>}
      />
    );
  }

  if (done) {
    return (
      <AuthCard
        tone="success"
        title="Password updated"
        subtitle="You're all set. Sign in with your new password."
        footer={<TextLink to="/signin">Go to sign in</TextLink>}
      />
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Use at least 8 characters. Longer is better.">
      <ErrorBanner message={banner} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          autoFocus
          error={errors.password?.message}
          below={<PasswordMeter value={watch("password") ?? ""} />}
          {...register("password")}
        />
        <FormField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <SubmitButton pending={isSubmitting}>Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}
