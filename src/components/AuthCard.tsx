import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

import { BadgeMark } from "./BadgeMark";
import { DemoNotice } from "./DemoNotice";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Outcome shown on the badge's clip band, like the light on a badge reader:
 * brand while a step is in progress, green when it worked, red when it can't.
 */
export type Tone = "neutral" | "success" | "danger";

const BAND: Record<Tone, string> = {
  neutral: "bg-band",
  success: "bg-band-success",
  danger: "bg-band-danger",
};

/**
 * Page frame for every step: app name and theme toggle on top, the badge in
 * the middle, secondary links under it.
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  tone = "neutral",
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-foreground">
          <BadgeMark className="size-5 text-primary" />
          {APP_NAME}
        </span>
        <ThemeToggle />
      </header>

      {/* Top-anchored, not centred: errors and late content grow the badge downward instead of shifting it. */}
      <main className="flex flex-1 justify-center px-4 pt-6 pb-16 sm:px-6 sm:pt-[min(10vh,96px)]">
        <div className="w-full max-w-[400px]">
          <div className="badge-shadow">
            <div className="badge overflow-hidden rounded-xl bg-card">
              {/* Clip band: the lanyard slot is punched through it (see .badge in styles.css). */}
              <div
                aria-hidden="true"
                className={cn(
                  "h-12 transition-colors duration-500 motion-reduce:transition-none",
                  BAND[tone],
                )}
              />
              <div className="px-6 pt-7 pb-7 sm:px-8 sm:pb-8">
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
