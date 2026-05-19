import { useEffect } from "react";
import { useAuth } from "react-oidc-context";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.error) {
      auth.signinRedirect();
    }
  }, [auth]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-400 flex items-center justify-center text-sm">
        Signing in…
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen bg-gray-950 text-red-400 flex flex-col items-center justify-center gap-3">
        <p className="text-sm">Authentication error: {auth.error.message}</p>
        <button
          onClick={() => auth.signinRedirect()}
          className="text-xs text-gray-400 underline hover:text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!auth.isAuthenticated) return null;

  return <>{children}</>;
}
