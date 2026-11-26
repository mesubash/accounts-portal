import { pickHandoff, type Handoff } from "./oidc";

// The OAuth round-trip leaves this site, so the hand-off params ride in
// sessionStorage (this tab only) instead of the provider's redirect URL.
const KEY = "accounts:handoff";

export function saveHandoff(handoff: Handoff) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(handoff));
  } catch {
    // Storage blocked: the user lands on "signed in" instead of their app.
  }
}

export function takeHandoff(): Handoff {
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    return raw ? pickHandoff(JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
