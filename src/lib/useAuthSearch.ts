import { useRouterState } from "@tanstack/react-router";

import { pickHandoff, type Handoff } from "./oidc";

/** The hand-off params (continue, audience) from the current URL. */
export function useHandoff(): Handoff {
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  });
  return pickHandoff(search ?? {});
}

/** A single string query param, e.g. ?token=… on email links. */
export function useQueryParam(name: string): string | null {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  return new URLSearchParams(searchStr ?? "").get(name);
}
