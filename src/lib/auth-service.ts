export type AuthenticatedUser = { username: string };

const SESSION_KEY = "s3-eternals-session";

type LoginPayload = {
  success?: unknown;
  user?: { username?: unknown };
};

export async function authenticate(
  usernameOrEmail: string,
  password: string,
): Promise<AuthenticatedUser> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  } catch {
    throw new Error("Unable to connect to the sign-in service. Please try again.");
  }

  let result: LoginPayload;
  try {
    result = (await response.json()) as LoginPayload;
  } catch {
    throw new Error("Invalid username or password.");
  }

  if (!response.ok || result.success !== true) {
    throw new Error("Invalid username or password.");
  }

  const username =
    typeof result.user?.username === "string" && result.user.username.trim().length > 0
      ? result.user.username.trim()
      : usernameOrEmail.trim();

  return { username };
}

export function saveSession(user: AuthenticatedUser): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function readSession(): AuthenticatedUser | null {
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const parsed: unknown = JSON.parse(value);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "username" in parsed &&
      typeof parsed.username === "string"
    ) {
      return { username: parsed.username };
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY);
}