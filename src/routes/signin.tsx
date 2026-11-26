import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SignedIn } from "@/components/SignedIn";
import { SocialButtons } from "@/components/SocialButtons";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { useHandoff } from "@/lib/useAuthSearch";
import { useLoginOutcome } from "@/lib/useLoginOutcome";
import { signInSchema, type SignInValues } from "@/lib/validation";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: pageTitle("Sign in") },
      { name: "description", content: "Sign in to your account to continue." },
      { property: "og:title", content: pageTitle("Sign in") },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const handoff = useHandoff();
  const { handle, signedIn } = useLoginOutcome();
  const [banner, setBanner] = useState<string | null>(null);

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
      await handle(await api.login({ ...values, audience: handoff.audience }));
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  if (signedIn) return <SignedIn />;

  return (
    <AuthCard
      title="Sign in"
      subtitle="Welcome back. Use your email and password to continue."
      footer={
        <>
          New here? <TextLink to="/signup">Create an account</TextLink>
        </>
      }
    >
      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <FormField
          label="Email"
          type="email"
          autoComplete="username"
          autoFocus
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="current-password"
          labelAside={<TextLink to="/forgot-password">Forgot password?</TextLink>}
          error={errors.password?.message}
          {...register("password")}
        />
        <SubmitButton pending={isSubmitting}>Sign in</SubmitButton>
      </form>

      <SocialButtons />
    </AuthCard>
  );
}
