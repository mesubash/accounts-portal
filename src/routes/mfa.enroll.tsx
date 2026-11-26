import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Check, ChevronDown, Copy, Download } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { renderSVG } from "uqr";

import { AuthCard } from "@/components/AuthCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { Button } from "@/components/ui/button";
import { api, errorMessage, type MfaSetup } from "@/lib/api";
import { APP_NAME, pageTitle } from "@/lib/brand";
import { codeFormSchema, type CodeValues } from "@/lib/validation";

export const Route = createFileRoute("/mfa/enroll")({
  head: () => ({
    meta: [
      { title: pageTitle("Set up two-step verification") },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MfaEnroll,
});

function MfaEnroll() {
  const enrollmentToken = useRouterState({ select: (s) => s.location.state.enrollmentToken });
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  useEffect(() => {
    if (!enrollmentToken) return;
    let cancelled = false;
    api
      .mfaSetup(enrollmentToken)
      .then((data) => !cancelled && setSetup(data))
      .catch((err) => !cancelled && setBanner(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, [enrollmentToken]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CodeValues>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async ({ code }: CodeValues) => {
    if (!enrollmentToken) return;
    setBanner(null);
    try {
      const result = await api.mfaEnable({ enrollmentToken, code });
      setRecoveryCodes(result.recoveryCodes ?? []);
    } catch (err) {
      setBanner(errorMessage(err));
    }
  };

  const back = <TextLink to="/signin">Back to sign in</TextLink>;

  if (!enrollmentToken) {
    return (
      <AuthCard
        title="Sign in to continue"
        subtitle="Two-step verification is set up right after you sign in. This page was opened without that step, or it expired."
        footer={back}
      />
    );
  }

  if (recoveryCodes) return <RecoveryCodes codes={recoveryCodes} />;

  return (
    <AuthCard
      title="Set up two-step verification"
      subtitle="This account needs a code from your phone at sign-in. Setting it up takes a minute."
      footer={back}
    >
      <ErrorBanner message={banner} />
      <ol className="grid gap-6">
        <li className="grid gap-3">
          <Step n={1}>Scan this code with an authenticator app</Step>
          <div className="grid justify-items-center gap-3">
            {setup ? (
              <QrCode value={setup.otpauthUri} />
            ) : (
              <div
                className="size-44 animate-pulse rounded-lg border border-border bg-muted"
                aria-hidden="true"
              />
            )}
            {setup ? (
              <details className="group w-full text-center text-sm">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  Can't scan it? Type a setup key instead
                  <ChevronDown
                    className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </summary>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm break-all text-foreground">
                    {setup.secret.replace(/(.{4})/g, "$1 ").trim()}
                  </code>
                  <CopyButton text={setup.secret} label="Copy setup key" />
                </div>
              </details>
            ) : null}
          </div>
        </li>
        <li className="grid gap-3">
          <Step n={2}>Enter the 6-digit code the app shows</Step>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
            <FormField
              label="6-digit code"
              hideLabel
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              className="text-center font-mono text-lg tracking-[0.5em]"
              error={errors.code?.message}
              {...register("code")}
            />
            <SubmitButton pending={isSubmitting} disabled={!setup}>
              Turn on two-step verification
            </SubmitButton>
          </form>
        </li>
      </ol>
    </AuthCard>
  );
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[15px] font-medium text-foreground">
      <span
        aria-hidden="true"
        className="grid size-6 shrink-0 place-items-center rounded-full bg-band text-[13px] font-semibold text-primary"
      >
        {n}
      </span>
      {children}
    </p>
  );
}

function QrCode({ value }: { value: string }) {
  // uqr renders locally: the TOTP secret never goes to a third-party QR service.
  const svg = useMemo(() => renderSVG(value, { border: 2 }), [value]);
  return (
    <div
      role="img"
      aria-label="QR code to add this account to your authenticator app"
      className="size-44 overflow-hidden rounded-lg border border-border bg-white p-1.5 [&>svg]:size-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the text is on screen to copy by hand.
    }
  };
  return (
    <Button type="button" variant="ghost" size="icon" onClick={copy} aria-label={label}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  );
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  const [saved, setSaved] = useState(false);
  const text = codes.join("\n");

  const download = () => {
    const url = URL.createObjectURL(new Blob([`${APP_NAME} recovery codes\n\n${text}\n`]));
    const a = Object.assign(document.createElement("a"), {
      href: url,
      download: "recovery-codes.txt",
    });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthCard
      tone="success"
      title="Save your recovery codes"
      subtitle="If you lose your phone, each code gets you in once. This is the only time they're shown."
    >
      <ol className="mb-4 grid grid-cols-2 gap-x-3 gap-y-1.5 rounded-lg border border-border bg-muted/50 px-4 py-3.5 font-mono text-[13px] whitespace-nowrap text-foreground tabular-nums">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ol>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" className="h-10" onClick={download}>
          <Download className="size-4" aria-hidden="true" /> Download
        </Button>
        <CopyAll text={text} />
      </div>
      <label className="mb-4 flex items-start gap-2.5 text-sm text-foreground">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--primary)]"
        />
        I've saved these codes somewhere safe
      </label>
      <SubmitButton
        type="button"
        disabled={!saved}
        onClick={() => window.location.assign("/signin" + window.location.search)}
      >
        Continue to sign in
      </SubmitButton>
    </AuthCard>
  );
}

function CopyAll({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      className="h-10"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked: the codes are on screen.
        }
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy all"}
    </Button>
  );
}
