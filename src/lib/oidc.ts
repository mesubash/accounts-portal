/**
 * Hand-off back to the app that sent the user here.
 *
 * spring-iam's /api/auth/sso/authorize sends a signed-out user to this portal
 * with ?continue=<authorize URL>. After sign-in we navigate there, and the IAM
 * redirects on to the app with a one-time code. `continue` comes from the URL,
 * so it is untrusted: only same-origin URLs, or origins listed in
 * VITE_TRUSTED_ORIGINS (comma-separated), are followed. Anything else would
 * make this page an open redirect.
 */

/** Query params carried across every page of the flow. */
export const HANDOFF_KEYS = ["continue", "audience"] as const;

export type Handoff = Partial<Record<(typeof HANDOFF_KEYS)[number], string>>;

export function pickHandoff(search: Record<string, unknown>): Handoff {
  const out: Handoff = {};
  for (const key of HANDOFF_KEYS) {
    const value = search[key];
    if (typeof value === "string" && value.length > 0) out[key] = value;
  }
  return out;
}

const trustedOrigins = (import.meta.env.VITE_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((s: string) => s.trim())
  .filter(Boolean);

/** Returns the URL to follow, or null when it is missing or not trusted. */
export function safeContinueUrl(
  raw: string | undefined,
  currentOrigin: string,
  trusted: readonly string[] = trustedOrigins,
): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw, currentOrigin);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.origin !== currentOrigin && !trusted.includes(url.origin)) return null;
  return url.href;
}

/**
 * Follow `continue` if it is safe. Returns false when there is nowhere to go,
 * so the page can show a plain "you're signed in" state instead.
 */
export function continueToApp(handoff: Handoff): boolean {
  if (typeof window === "undefined") return false;
  const next = safeContinueUrl(handoff.continue, window.location.origin);
  if (!next) return false;
  window.location.assign(next);
  return true;
}
