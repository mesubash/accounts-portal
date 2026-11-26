// A stand-in for spring-iam's /api/auth endpoints, for trying the UI without
// running the real IAM. Node stdlib only. Not a security boundary: it accepts
// anything that looks right.
//
//   node dev/mock-iam.mjs          # listens on :8080, which `bun dev` proxies to
//
// Accounts (any password works, except "wrong"):
//   you@example.com     signs straight in
//   mfa@example.com     asks for a code (123456, or recovery code a1b2c3d4-e5f60718)
//   enroll@example.com  must set up two-step verification first (code 123456)
// Email links: /verify-email?token=ok, /reset-password?token=ok ("bad" fails).
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 8080);
const ok = (message, data) => [200, { success: true, message, data }];
const fail = (status, message) => [status, { success: false, message }];
const tokens = { accessToken: "mock.jwt", tokenType: "Bearer", expiresIn: 900 };

const routes = {
  "POST /api/auth/login": ({ body }) => {
    if (body.password === "wrong") return fail(401, "Invalid email or password");
    if (body.email === "mfa@example.com")
      return ok("MFA required", { status: "MFA_REQUIRED", challenge: "c-1" });
    if (body.email === "enroll@example.com")
      return ok("MFA enrollment required", {
        status: "MFA_ENROLLMENT_REQUIRED",
        enrollmentToken: "e-1",
      });
    return ok("Login successful", tokens);
  },
  "POST /api/auth/register": ({ body }) =>
    body.email === "taken@example.com"
      ? fail(409, "An account with this email already exists")
      : [201, { success: true, message: "Registration successful!", data: {} }],
  "POST /api/auth/forgot-password": () => ok("Password reset email sent", {}),
  "POST /api/auth/reset-password": ({ body }) =>
    body.token === "bad"
      ? fail(400, "This reset link has expired.")
      : ok("Password reset successful", {}),
  "POST /api/auth/verify-email": ({ query }) =>
    query.get("token") === "bad"
      ? fail(400, "This verification link has expired.")
      : ok("Email verified successfully", {}),
  "POST /api/auth/mfa/verify": ({ body }) =>
    ["123456", "a1b2c3d4-e5f60718"].includes(body.code)
      ? ok("Login successful", tokens)
      : fail(400, "Invalid code"),
  "POST /api/auth/mfa/setup": () =>
    ok("MFA setup started", {
      secret: "JBSWY3DPEHPK3PXP",
      otpauthUri:
        "otpauth://totp/spring-iam:enroll@example.com?secret=JBSWY3DPEHPK3PXP&issuer=spring-iam",
    }),
  "POST /api/auth/mfa/enable": ({ body }) =>
    body.code === "123456"
      ? ok("MFA enabled", {
          recoveryCodes: Array.from({ length: 10 }, (_, i) => `a1b2c3d${i}-e5f6071${i}`),
        })
      : fail(400, "Invalid code"),
  "GET /api/auth/oauth/providers": () => ok("OAuth providers retrieved", { providers: ["google"] }),
  "GET /api/auth/oauth/login/google": ({ query, res }) => {
    res.writeHead(302, { Location: `${query.get("redirectUri")}?code=oauth-1` }).end();
  },
  "POST /api/auth/oauth/exchange": () => ok("Login successful", tokens),
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const handler = routes[`${req.method} ${url.pathname}`];
  const result = handler
    ? await handler({ body, query: url.searchParams, res })
    : fail(404, "Not found");
  if (!result) return; // handler wrote its own response
  await new Promise((r) => setTimeout(r, 350)); // make pending states visible
  res.writeHead(result[0], { "Content-Type": "application/json" }).end(JSON.stringify(result[1]));
  console.log(req.method, url.pathname, result[0]);
}).listen(PORT, () => console.log(`mock IAM on http://localhost:${PORT}`));
