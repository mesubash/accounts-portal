import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/brand";

import { DemoNotice } from "./DemoNotice";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Page frame for every step: app name and theme toggle on top, the badge in
 * the middle, secondary links under it.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-foreground">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-md bg-primary text-[13px] font-bold text-primary-foreground"
          >
            {APP_NAME.charAt(0).toUpperCase()}
          </span>
          {APP_NAME}
        </span>
        <ThemeToggle />
      </header>

      {/* Top-anchored, not centred: errors and late content grow the badge downward instead of shifting it. */}
      <main className="flex flex-1 justify-center px-4 pt-6 pb-16 sm:px-6 sm:pt-[min(12vh,120px)]">
        <div className="w-full max-w-[400px]">
          <div className="badge-shadow">
            <div className="badge rounded-xl bg-card px-6 pt-14 pb-7 sm:px-8 sm:pb-8">
              <h1 className="text-[26px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance text-card-foreground">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
              {children ? <div className="mt-6">{children}</div> : null}
            </div>
          </div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}

          <DemoNotice />
        </div>
      </main>
    </div>
  );
}
