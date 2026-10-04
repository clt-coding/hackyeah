const API_URL = import.meta.env.VITE_API_URL;

export async function apiCall(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }

  return res.json();
}
