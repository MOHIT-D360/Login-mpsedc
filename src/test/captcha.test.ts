import { describe, expect, it } from "vitest";

import { createCaptcha, matchesCaptcha } from "@/lib/captcha";

describe("CAPTCHA", () => {
  it("matches without regard to letter case", () => {
    expect(matchesCaptcha("7K4P9", "7k4p9")).toBe(true);
  });

  it("generates five alphanumeric characters", () => {
    expect(createCaptcha(() => 0.25)).toMatch(/^[A-Z0-9]{5}$/);
  });
});