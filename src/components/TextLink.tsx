import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { useHandoff } from "@/lib/useAuthSearch";

type AuthPath = "/signin" | "/signup" | "/forgot-password";

/** In-flow link that keeps the hand-off params (continue, audience). */
export function TextLink({ to, children }: { to: AuthPath; children: ReactNode }) {
  const handoff = useHandoff();
  return (
    <Link
      to={to}
      search={handoff as never}
      className="font-medium text-primary underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
    >
      {children}
    </Link>
  );
}
