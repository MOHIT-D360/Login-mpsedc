import { afterEach, describe, expect, it, vi } from "vitest";

import { authenticate } from "@/lib/auth-service";
import { createCaptcha, matchesCaptcha } from "@/lib/captcha";

afterEach(() => vi.unstubAllGlobals());

describe("CAPTCHA", () => {
  it("matches without regard to letter case", () => {
    expect(matchesCaptcha("7K4P9", "7k4p9")).toBe(true);
  });

  it("generates five alphanumeric characters", () => {
    expect(createCaptcha(() => 0.25)).toMatch(/^[A-Z0-9]{5}$/);
  });
});

describe("Java login service", () => {
  it("sends the requested credentials to the login endpoint", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ success: true, user: { username: "mohit" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(authenticate("user@example.com", "password123")).resolves.toEqual({
      username: "mohit",
    });

    const [url, options] = fetchMock.mock.calls[0] ?? [];
    expect(url).toMatch(/\/api\/auth\/login$/);
    expect(options?.method).toBe("POST");
    expect(JSON.parse(String(options?.body))).toEqual({
      usernameOrEmail: "user@example.com",
      password: "password123",
    });
  });

  it("does not reveal whether the username or password was incorrect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ success: false, message: "Invalid username or password" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(authenticate("unknown", "wrong")).rejects.toThrow(
      "Invalid username or password.",
    );
  });
});