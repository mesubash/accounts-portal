import { Outlet, createRootRoute, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "@/styles.css?url";
import { AuthCard } from "@/components/AuthCard";
import { SubmitButton } from "@/components/SubmitButton";
import { TextLink } from "@/components/TextLink";
import { THEME_STORAGE_KEY, ThemeProvider } from "@/components/ThemeProvider";
import { APP_NAME, pageTitle } from "@/lib/brand";

function NotFoundComponent() {
  return (
    <AuthCard
      title="Nothing here"
      subtitle="This address isn't part of the sign-in flow. Check the link, or start from the sign-in page."
      footer={<TextLink to="/signin">Go to sign in</TextLink>}
    />
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <AuthCard
      tone="danger"
      title="This page didn't load"
      subtitle="Something broke while loading this step. Try again; if it keeps happening, start over from sign-in."
      footer={<TextLink to="/signin">Start over</TextLink>}
    >
      <SubmitButton
        type="button"
        onClick={() => {
          void router.invalidate();
          reset();
        }}
      >
        Try again
      </SubmitButton>
    </AuthCard>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: pageTitle() },
      {
        name: "description",
        content: "Sign in to your account.",
      },
      { property: "og:title", content: APP_NAME },
      {
        property: "og:description",
        content: "Sign in to your account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#eef1f4", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0e141a", media: "(prefers-color-scheme: dark)" },
    ],

    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  // The theme script and browser extensions touch <html> and <body> before hydration.
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
