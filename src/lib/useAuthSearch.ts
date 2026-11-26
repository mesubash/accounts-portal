import { useRouterState } from "@tanstack/react-router";

import { pickOidcParams, type OidcParams } from "./oidc";

/** Read the OIDC/hand-off params from the current URL and keep them around. */
export function useAuthSearch(): { params: OidcParams; searchStr: string } {
  const search = useRouterState({
    select: (s) => s.location.search as Record<string, unknown>,
  });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  return { params: pickOidcParams(search ?? {}), searchStr: searchStr ?? "" };
}
