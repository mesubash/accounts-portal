import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
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
import { useAuthSearch } from "@/lib/useAuthSearch";
import { passwordStrength, signUpSchema, type SignUpValues } from "@/lib/validation";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: pageTitle("Create your account") },
      {
        name: "description",
        content:
          "Create an account: one sign-in for every connected app.",
      },
      { property: "og:title", content: pageTitle("Create your account") },
      {
        property: "og:description",
        content: "One sign-in for every connected app.",
      },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const { searchStr } = useAuthSearch();
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

  const strength = passwordStrength(watch("password") ?? "");

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
        title="Verify your email"
        subtitle={`We sent a verification link to ${created}. Open it to finish setting up your account.`}
        footer={
          <Link
            to="/signin"
            search={(prev: Record<string, unknown>) => prev}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        <p className="text-center text-sm text-muted-foreground">
          The link expires in 24 hours. If it doesn't arrive, check your spam folder.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="One account works across every connected app."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/signin"
            search={(prev: Record<string, unknown>) => prev}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ErrorBanner message={banner} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField
          label="Full name"
          autoComplete="name"
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
          hint={strength.label ? `Password strength: ${strength.label}` : "At least 8 characters."}
          error={errors.password?.message}
          {...register("password")}
        />

        <SubmitButton pending={isSubmitting}>Create account</SubmitButton>
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
