import { createFileRoute, redirect } from "@tanstack/react-router";

// spring-iam's default iam.sso.login-url is <frontend>/login, so accept it.
export const Route = createFileRoute("/login")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/signin", search: search as never });
  },
});
