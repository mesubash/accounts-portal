export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new ApiError(0, "We couldn't reach the server. Check your connection and try again.");
  }

  const text = await res.text();
  let body: unknown = undefined;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = undefined;
    }
  }
  const data = (body ?? {}) as Record<string, unknown>;

  if (!res.ok) {
    const message =
      typeof data.message === "string"
        ? data.message
        : typeof data.error === "string"
          ? data.error
          : res.status >= 500
            ? "Something went wrong on our end. Please try again in a moment."
            : "That didn't work. Please check your details and try again.";
    throw new ApiError(res.status, message, typeof data.code === "string" ? data.code : undefined);
  }

  return data as T;
}

/** Shared shape: the IAM tells us where to send the browser next. */
export interface RedirectResult {
  redirectTo?: string;
  message?: string;
}

export interface LoginResult extends RedirectResult {
  mfaRequired?: boolean;
  challengeId?: string;
}

export interface MfaSetupResult {
  qrCodeUrl?: string;
  secret?: string;
  otpauthUrl?: string;
}

export const api = {
  login: (input: { email: string; password: string; product?: string | null }) =>
    apiFetch<LoginResult>("/api/auth/login", { method: "POST", body: JSON.stringify(input) }),

  register: (input: { name: string; email: string; password: string }) =>
    apiFetch<RedirectResult>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  forgotPassword: (input: { email: string }) =>
    apiFetch<RedirectResult>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  resetPassword: (input: { token: string; password: string }) =>
    apiFetch<RedirectResult>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  verifyEmail: (input: { token: string }) =>
    apiFetch<RedirectResult>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  resendVerification: (input: { email: string }) =>
    apiFetch<RedirectResult>("/api/auth/verify-email/resend", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  mfaVerify: (input: { challengeId: string; code: string }) =>
    apiFetch<LoginResult>("/api/auth/v1/mfa/verify", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  mfaSetup: () => apiFetch<MfaSetupResult>("/api/auth/v1/mfa/setup"),

  mfaEnable: (input: { code: string }) =>
    apiFetch<RedirectResult>("/api/auth/v1/mfa/enable", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something unexpected happened. Please try again.";
}
