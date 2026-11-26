import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { pageTitle } from "@/lib/brand";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SocialButtons } from "@/components/SocialButtons";
import { SubmitButton } from "@/components/SubmitButton";
import { Separator } from "@/components/ui/separator";
import { api, errorMessage } from "@/lib/api";
import { redirectBack } from "@/lib/oidc";
import { useAuthSearch } from "@/lib/useAuthSearch";
import { signInSchema, type SignInValues } from "@/lib/validation";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: pageTitle("Sign in") },
      {
        name: "description",
        content:
          "Sign in to your account to continue.",
      },
      { property: "og:title", content: pageTitle("Sign in") },
      {
        property: "og:description",
        content: "One account for every app you use.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { params, searchStr } = useAuthSearch();
  const [banner, setBanner] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    setBanner(null);
    try {
      const result = await api.login({ ...values, product: params.product ?? null });

      if (result.mfaRequired && result.challengeId) {
        navigate({
          to: "/mfa",
          search: (prev: Record<string, unknown>) =>
            ({ ...prev, challengeId: result.challengeId }) as never,
        });
        return;
      }

      if (!redirectBack(result.redirectTo)) setSignedIn(true);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  if (signedIn) {
    return (
      <AuthCard title="You're signed in" subtitle="Your account session is active.">
        <p className="text-center text-sm text-muted-foreground">
          There's nowhere to send you back to, so you can close this tab or return to the app you came from.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle={
        params.product
          ? `Use your account to continue to ${params.product}.`
          : "Use your account to continue."
      }
      footer={
        <>
          New here?{" "}
          <Link
            to="/signup"
            search={(prev: Record<string, unknown>) => prev}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="text-right">
          <Link
            to="/forgot-password"
            search={(prev: Record<string, unknown>) => prev}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton pending={isSubmitting}>Sign in</SubmitButton>
      </form>

      <div className="my-6 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <SocialButtons search={searchStr} />
    </AuthCard>
  );
}
