/**
 * OIDC / hand-off params carried in the URL query.
 * We only ever *preserve* them across pages and hand them to the IAM backend.
 * We never navigate to a URL we built ourselves — see redirectBack().
 */
export const OIDC_KEYS = [
  "redirect_uri",
  "continue",
  "state",
  "client_id",
  "product",
  "scope",
  "code_challenge",
  "code_challenge_method",
  "nonce",
  "response_type",
] as const;

export type OidcParams = Partial<Record<(typeof OIDC_KEYS)[number], string>>;

export function pickOidcParams(search: Record<string, unknown>): OidcParams {
  const out: OidcParams = {};
  for (const key of OIDC_KEYS) {
    const value = search[key];
    if (typeof value === "string" && value.length > 0) out[key] = value;
  }
  return out;
}

/**
 * Navigate to the destination the backend handed back.
 * Returns false when there is nothing to redirect to, so the page can render
 * a plain "you're signed in" state instead.
 */
export function redirectBack(redirectTo?: string): boolean {
  if (!redirectTo || typeof redirectTo !== "string") return false;
  if (typeof window === "undefined") return false;
  window.location.assign(redirectTo);
  return true;
}
