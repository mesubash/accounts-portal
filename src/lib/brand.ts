/** Product name shown in the header, page titles and copy. Set VITE_APP_NAME to rebrand. */
export const APP_NAME: string = import.meta.env.VITE_APP_NAME || "Accounts";

/** Page title helper: "Sign in · Accounts". */
export const pageTitle = (page?: string) => (page ? `${page} · ${APP_NAME}` : APP_NAME);
