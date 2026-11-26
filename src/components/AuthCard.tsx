import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/brand";

import { ThemeToggle } from "./ThemeToggle";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="text-sm font-medium tracking-tight text-foreground">{APP_NAME}</span>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-start justify-center px-4 pb-16 sm:items-center sm:px-6">
        <div className="w-full max-w-[400px]">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col items-center text-center">
              <span
                aria-hidden="true"
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-[11px] font-semibold tracking-wide text-primary-foreground"
              >
                {APP_NAME.charAt(0)}
              </span>
              <h1 className="text-xl font-semibold tracking-tight text-card-foreground">{title}</h1>
              {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {children}
          </div>

          {footer ? (
            <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            One account for every connected app
          </p>
        </div>
      </main>
    </div>
  );
}
