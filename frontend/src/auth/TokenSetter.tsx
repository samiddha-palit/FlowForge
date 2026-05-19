import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

import { setTokenGetter } from "../api/client";

/**
 * Invisible component — keeps the module-level token getter in sync with
 * the current OIDC user so all apiFetch calls carry a Bearer token.
 */
export default function TokenSetter() {
  const { user } = useAuth();

  useEffect(() => {
    setTokenGetter(() => user?.access_token);
    return () => setTokenGetter(null);
  }, [user?.access_token]);

  return null;
}
