import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import type { LoginOutcome } from "./api";
import { continueToApp, type Handoff } from "./oidc";
import { useHandoff } from "./useAuthSearch";

// Short-lived MFA tokens travel in history state, not the URL, so they stay
// out of server logs, Referer headers and shared links.
declare module "@tanstack/react-router" {
  interface HistoryState {
    challenge?: string;
    enrollmentToken?: string;
  }
}

/**
 * Route the user after a login step: on to MFA, into MFA enrollment, back to
 * the app that sent them, or (with nowhere to go) a "signed in" state.
 */
export function useLoginOutcome(override?: Handoff) {
  const navigate = useNavigate();
  const fromUrl = useHandoff();
  const handoff = override ?? fromUrl;
  const [signedIn, setSignedIn] = useState(false);

  const handle = (outcome: LoginOutcome) => {
    switch (outcome.status) {
      case "MFA_REQUIRED":
        return navigate({
          to: "/mfa",
          search: handoff as never,
          state: { challenge: outcome.challenge },
        });
      case "MFA_ENROLLMENT_REQUIRED":
        return navigate({
          to: "/mfa/enroll",
          search: handoff as never,
          state: { enrollmentToken: outcome.enrollmentToken },
        });
      case "OK":
        if (!continueToApp(handoff)) setSignedIn(true);
    }
  };

  return { handle, signedIn };
}
