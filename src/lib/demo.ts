/**
 * Demo mode: a stand-in for spring-iam that runs in the browser, so every page
 * can be tried without a backend. Turned on with VITE_DEMO=true at build time.
 * Nothing is stored or sent anywhere, and it is not a security boundary.
 *
 * Accounts (any password works except "wrong"):
 *   you@example.com     signs straight in
 *   mfa@example.com     asks for a code: 123456, or recovery code a1b2c3d4-e5f60718
 *   enroll@example.com  sets up two-step verification first (code 123456)
 * Email links: /verify-email?token=demo, /reset-password?token=demo ("bad" fails).
 *
 * Import it only behind an inline `import.meta.env.VITE_DEMO === "true"` check
 * (see DEMO in ./demoFlag) so normal builds drop it entirely.
 */

type Reply = [status: number, body: { success: boolean; message: string; data?: unknown }];

const ok = (message: string, data: unknown = {}): Reply => [200, { success: true, message, data }];
const fail = (status: number, message: string): Reply => [status, { success: false, message }];
const tokens = { accessToken: "demo", tokenType: "Bearer", expiresIn: 900 };
const CODE = "123456";
const RECOVERY = "a1b2c3d4-e5f60718";

type Input = { query: URLSearchParams; body: Record<string, string> };

// Mirrors the spring-iam endpoints in api.ts, keyed "METHOD path".
const routes: Record<string, (input: Input) => Reply> = {
  "POST /api/auth/login": ({ body }) => {
    if (body.password === "wrong") return fail(401, "Invalid email or password");
    if (body.email === "mfa@example.com")
      return ok("MFA required", { status: "MFA_REQUIRED", challenge: "demo" });
    if (body.email === "enroll@example.com")
      return ok("MFA enrollment required", {
        status: "MFA_ENROLLMENT_REQUIRED",
        enrollmentToken: "demo",
      });
    return ok("Login successful", tokens);
  },
  "POST /api/auth/register": ({ body }) =>
    body.email === "taken@example.com"
      ? fail(409, "An account with this email already exists.")
      : ok("Registration successful"),
  "POST /api/auth/forgot-password": () => ok("Password reset email sent"),
  "POST /api/auth/reset-password": ({ body }) =>
    body.token === "bad"
      ? fail(400, "This reset link has expired.")
      : ok("Password reset successful"),
  "POST /api/auth/verify-email": ({ query }) =>
    query.get("token") === "bad"
      ? fail(400, "This verification link has expired.")
      : ok("Email verified successfully"),
  "POST /api/auth/mfa/verify": ({ body }) =>
    body.code === CODE || body.code === RECOVERY
      ? ok("Login successful", tokens)
      : fail(400, "Invalid code"),
  "POST /api/auth/mfa/setup": () =>
    ok("MFA setup started", {
      secret: "JBSWY3DPEHPK3PXP",
      otpauthUri: "otpauth://totp/Demo:enroll@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Demo",
    }),
  "POST /api/auth/mfa/enable": ({ body }) =>
    body.code === CODE
      ? ok("MFA enabled", {
          recoveryCodes: Array.from({ length: 10 }, (_, i) => `a1b2c3d${i}-e5f6071${i}`),
        })
      : fail(400, "Invalid code"),
  "GET /api/auth/oauth/providers": () => ok("OAuth providers retrieved", { providers: ["google"] }),
  "POST /api/auth/oauth/exchange": () => ok("Login successful", tokens),
};

/** Answer a request the way spring-iam would, after a short delay so loading states show. */
export async function demoFetch(
  method: string,
  path: string,
  query: Record<string, string> | undefined,
  body: unknown,
): Promise<Response> {
  await new Promise((r) => setTimeout(r, 400));
  const handler = routes[`${method} ${path}`];
  const [status, json] = handler
    ? handler({ query: new URLSearchParams(query), body: (body ?? {}) as Record<string, string> })
    : fail(404, "Not found");
  return Response.json(json, { status });
}
