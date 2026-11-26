/** True only in builds made with VITE_DEMO=true. A literal after build, so dead branches drop out. */
export const DEMO = import.meta.env.VITE_DEMO === "true";

/** In demo mode, social sign-in skips the provider and lands straight on the callback. */
export const DEMO_OAUTH_RETURN = "/oauth/callback?code=demo";
