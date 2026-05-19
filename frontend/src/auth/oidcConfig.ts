import type { AuthProviderProps } from "react-oidc-context";

const KEYCLOAK_BASE = "http://localhost:8080/realms/flowforge";

export const oidcConfig: AuthProviderProps = {
  authority: KEYCLOAK_BASE,
  client_id: "flowforge-frontend",
  redirect_uri: `${window.location.origin}/callback`,
  post_logout_redirect_uri: window.location.origin,
  scope: "openid profile email",
  // Clear code/state params from the URL after the callback is processed
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
