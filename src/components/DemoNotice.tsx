import { Link } from "@tanstack/react-router";

import { DEMO } from "@/lib/demoFlag";

const email = "font-mono text-[12.5px] text-foreground";
const link = "font-medium text-primary underline-offset-4 hover:underline";

/** Shown only in demo mode: what to type, and the pages normally reached from an email. */
export function DemoNotice() {
  if (!DEMO) return null;
  return (
    <aside
      aria-label="Demo instructions"
      className="mt-8 rounded-lg border border-dashed border-input px-4 py-3 text-[13px] leading-relaxed text-muted-foreground"
    >
      <p>
        <strong className="font-medium text-foreground">Demo.</strong> Nothing is saved and any
        password works. Sign in as <span className={email}>you@example.com</span>, or try{" "}
        <span className={email}>mfa@example.com</span> (code <span className={email}>123456</span>)
        and <span className={email}>enroll@example.com</span> for two-step verification.
      </p>
      <p className="mt-1.5">
        Pages you'd reach from an email:{" "}
        <Link to="/verify-email" search={{ token: "demo" } as never} className={link}>
          verify email
        </Link>
        ,{" "}
        <Link to="/reset-password" search={{ token: "demo" } as never} className={link}>
          reset password
        </Link>
        .
      </p>
    </aside>
  );
}
