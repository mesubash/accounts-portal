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
import {
  passwordStrength,
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: pageTitle("Choose a new password") },
      {
        name: "description",
        content: "Set a new password for your account.",
      },
      { property: "og:title", content: pageTitle("Choose a new password") },
      { property: "og:description", content: "Set a new password for your account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const search = useAuthSearch();
  const token =
    typeof (search.params as Record<string, unknown>).token === "string"
      ? ((search.params as Record<string, unknown>).token as string)
      : new URLSearchParams(search.searchStr).get("token");

  const [banner, setBanner] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const strength = passwordStrength(watch("password") ?? "");

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) return;
    setBanner(null);
    try {
      const result = await api.resetPassword({ token, password: values.password });
      if (!redirectBack(result.redirectTo)) setDone(true);
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

  if (!token) {
    return (
      <AuthCard title="This link isn't valid" footer={signInLink}>
        <p className="text-center text-sm text-muted-foreground">
          The reset link is missing or incomplete. Request a new one from the sign-in page.
        </p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" footer={signInLink}>
        <p className="text-center text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Pick something you haven't used before.">
      <ErrorBanner message={banner} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="New password"
          type="password"
          autoComplete="new-password"
          hint={strength.label ? `Password strength: ${strength.label}` : "At least 8 characters."}
          error={errors.password?.message}
          {...register("password")}
        />
        <SubmitButton pending={isSubmitting}>Update password</SubmitButton>
      </form>
    </AuthCard>
  );
}
