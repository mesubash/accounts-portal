import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { PasswordMeter } from "@/components/PasswordMeter";
import { SocialButtons } from "@/components/SocialButtons";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { api, errorMessage } from "@/lib/api";
import { pageTitle } from "@/lib/brand";
import { signUpSchema, type SignUpValues } from "@/lib/validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: pageTitle("Create your account") },
      { name: "description", content: "Create an account: one sign-in for every connected app." },
      { property: "og:title", content: pageTitle("Create your account") },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const [banner, setBanner] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: SignUpValues) => {
    setBanner(null);
    try {
      await api.register(values);
      setCreated(values.email);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  if (created) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle={
          <>
            We sent a verification link to <strong className="text-foreground">{created}</strong>.
            Open it to finish setting up your account.
          </>
        }
        footer={<TextLink to="/signin">Back to sign in</TextLink>}
      >
        <p className="text-sm text-muted-foreground">
          Nothing there after a few minutes? Check your spam folder.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="One account for every connected app."
      footer={
        <>
          Already have an account? <TextLink to="/signin">Sign in</TextLink>
        </>
      }
    >
      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
        <FormField
          label="Full name"
          autoComplete="name"
          autoFocus
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
          error={errors.password?.message}
          below={<PasswordMeter value={watch("password") ?? ""} />}
          {...register("password")}
        />
        <SubmitButton pending={isSubmitting}>Create account</SubmitButton>
      </form>

      <SocialButtons />
    </AuthCard>
  );
}
