/**
 * Client for the spring-iam auth API (https://github.com/mesubash/spring-iam).
 *
 * Every call is same-origin under /api: in development Vite proxies it to the
 * IAM (see vite.config.ts); in production put both behind one reverse proxy so
 * the IAM's refresh cookie is first-party.
 */

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** spring-iam wraps every response as { success, message, data }. */
interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const GENERIC_4XX = "That didn't work. Check your details and try again.";
const GENERIC_5XX = "Something went wrong on our end. Try again in a moment.";
const OFFLINE = "We couldn't reach the server. Check your connection and try again.";

async function request<T>(
  method: "GET" | "POST",
  path: string,
  options: { query?: Record<string, string>; body?: unknown } = {},
): Promise<T> {
  const url = options.query ? `${path}?${new URLSearchParams(options.query)}` : path;
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, OFFLINE);
  }

  let envelope: Envelope<T> = {};
  try {
    envelope = (await res.json()) as Envelope<T>;
  } catch {
    // Empty or non-JSON body (e.g. a proxy error page): fall through to generic copy.
  }

  if (!res.ok || envelope.success === false) {
    const fallback = res.status >= 500 ? GENERIC_5XX : GENERIC_4XX;
    throw new ApiError(res.status, envelope.message || fallback);
  }
  return envelope.data as T;
}

/** What a login, OAuth exchange or MFA check can lead to. */
export type LoginOutcome =
  | { status: "OK" }
  | { status: "MFA_REQUIRED"; challenge: string }
  | { status: "MFA_ENROLLMENT_REQUIRED"; enrollmentToken: string };

type RawLogin =
  | { status: "MFA_REQUIRED"; challenge: string }
  | { status: "MFA_ENROLLMENT_REQUIRED"; enrollmentToken: string }
  | { status?: undefined; accessToken: string };

/** A successful login carries tokens and no status; the refresh cookie is already set. */
export function toOutcome(raw: RawLogin | undefined): LoginOutcome {
  if (raw?.status === "MFA_REQUIRED") return { status: raw.status, challenge: raw.challenge };
  if (raw?.status === "MFA_ENROLLMENT_REQUIRED") {
    return { status: raw.status, enrollmentToken: raw.enrollmentToken };
  }
  return { status: "OK" };
}

export interface MfaSetup {
  otpauthUri: string;
  secret: string;
}

export const api = {
  login: async (input: { email: string; password: string; audience?: string }) =>
    toOutcome(await request<RawLogin>("POST", "/api/auth/login", { body: input })),

  register: (input: { name: string; email: string; password: string }) =>
    request<unknown>("POST", "/api/auth/register", { body: input }),

  forgotPassword: (email: string) =>
    request<unknown>("POST", "/api/auth/forgot-password", { query: { email } }),

  resetPassword: (input: { token: string; newPassword: string }) =>
    request<unknown>("POST", "/api/auth/reset-password", { body: input }),

  verifyEmail: (token: string) =>
    request<unknown>("POST", "/api/auth/verify-email", { query: { token } }),

  mfaVerify: async (input: { challenge: string; code: string }) =>
    toOutcome(await request<RawLogin>("POST", "/api/auth/mfa/verify", { body: input })),

  mfaSetup: (enrollmentToken: string) =>
    request<MfaSetup>("POST", "/api/auth/mfa/setup", { body: { enrollmentToken } }),

  mfaEnable: (input: { enrollmentToken: string; code: string }) =>
    request<{ recoveryCodes: string[] }>("POST", "/api/auth/mfa/enable", { body: input }),

  oauthProviders: async () =>
    (await request<{ providers?: string[] }>("GET", "/api/auth/oauth/providers")).providers ?? [],

  oauthExchange: async (code: string) =>
    toOutcome(await request<RawLogin>("POST", "/api/auth/oauth/exchange", { body: { code } })),
};

export function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : "Something unexpected happened. Try again.";
}
