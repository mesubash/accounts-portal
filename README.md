# accounts-portal

**Live demo:** [accounts-portal.vercel.app](https://accounts-portal.vercel.app) (no backend, any password works)

The sign-in pages for [spring-iam](https://github.com/mesubash/spring-iam): sign in, sign up,
password reset, email verification and two-step verification, ready to put in front of your apps.

Your apps send people here to sign in; spring-iam sends them back with a one-time code.

## What it covers

| Page               | What happens                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `/signin`          | Email and password, plus any social providers spring-iam has turned on                       |
| `/signup`          | Create an account; spring-iam emails a verification link                                     |
| `/verify-email`    | Opened from that email (`?token=`)                                                           |
| `/forgot-password` | Request a reset link                                                                         |
| `/reset-password`  | Opened from the reset email (`?token=`)                                                      |
| `/mfa`             | Six-digit code from an authenticator app, or a recovery code                                 |
| `/mfa/enroll`      | First-time two-step setup when an account requires it: QR code, then one-time recovery codes |
| `/oauth/callback`  | Where spring-iam returns after Google sign-in                                                |

`/login` redirects to `/signin`, which is spring-iam's default `iam.sso.login-url`.

## Try it without spring-iam

Demo mode answers every request in the browser, so all pages work with no backend:

```sh
bun install
VITE_DEMO=true bun run dev                    # http://localhost:3000
```

A notice above the form lists what to type. Any password works except `wrong`:

- `you@example.com` signs straight in
- `mfa@example.com` asks for a code: `123456`, or recovery code `a1b2c3d4-e5f60718`
- `enroll@example.com` goes through two-step setup (code `123456`)
- `/verify-email?token=demo` and `/reset-password?token=demo` stand in for the email links (`token=bad` shows the failure)

Build with `VITE_DEMO=true` to host a public demo. Never set it in front of a real IAM.

## Run it with spring-iam

```sh
IAM_URL=http://localhost:8080 bun run dev
```

The app server proxies `/api/**` to `IAM_URL`, so spring-iam's refresh cookie is set on this
origin. On the spring-iam side, point its frontend here and allow the OAuth callback:

```sh
APP_FRONTEND_URL=https://accounts.example.com            # SSO sends signed-out users to /login
APP_ALLOWED_REDIRECT_URIS=https://accounts.example.com/oauth/callback
```

## Configuration

Copy `.env.example` to `.env`. All values are read at build time.

| Variable               | Default                 | Purpose                                                       |
| ---------------------- | ----------------------- | ------------------------------------------------------------- |
| `VITE_APP_NAME`        | `Accounts`              | Name in the header, page titles and recovery-code file        |
| `IAM_URL`              | `http://localhost:8080` | Where `/api/**` is proxied                                    |
| `VITE_DEMO`            | (off)                   | `true` answers the API in the browser; for demos only         |
| `VITE_TRUSTED_ORIGINS` | (empty)                 | Extra origins `?continue=` may send users to, comma-separated |

To change the colour, edit `--brand` in `src/styles.css` (one value each for light and dark).

## Deploy

```sh
IAM_URL=https://iam.internal:8080 bun run build
bun run start                                 # node .output/server/index.mjs, port 3000
```

It is a plain Node server. Put it behind your usual TLS proxy.

## Security notes

- After sign-in the page only follows `?continue=` to its own origin or to `VITE_TRUSTED_ORIGINS`.
  Anything else is ignored, so it can't be used as an open redirect.
- MFA challenge and enrolment tokens live in browser history state, not the URL, so they stay out
  of logs and `Referer` headers.
- The QR code is drawn in the browser; the TOTP secret is never sent to a QR service.
- Fonts are self-hosted, so no third party sees who opens the sign-in page.

## Not included yet

- spring-iam's optional SSO consent screen (`iam.sso.consent-url`)
- Account settings (change password, turn MFA off, sessions): this portal covers signing in only

## Development

```sh
bun run lint && bun run typecheck && bun run test && bun run build
```

Stack: TanStack Start, React 19, Tailwind CSS 4, react-hook-form with zod, Vitest.

## License

MIT
