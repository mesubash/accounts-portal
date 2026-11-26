import { AuthCard } from "./AuthCard";

/** Shown when a login succeeds but no app asked to get the user back. */
export function SignedIn() {
  return (
    <AuthCard
      title="You're signed in"
      subtitle="Your session is active. You can close this tab or go back to the app you came from."
    />
  );
}
