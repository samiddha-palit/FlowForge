const BASE = "/api";

type TokenGetter = (() => string | undefined) | null;
let _getToken: TokenGetter = null;

export function setTokenGetter(fn: TokenGetter): void {
  _getToken = fn;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = _getToken?.();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}
