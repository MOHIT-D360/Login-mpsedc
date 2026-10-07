import { describe, expect, it } from "vitest";

import { validatePassword } from "@/lib/password-validation";

describe("password validation", () => {
  it("accepts a password that meets every requirement", () => {
    expect(validatePassword("StrongPass1")).toEqual({ valid: true, errors: [] });
  });

  it("rejects passwords shorter than eight characters", () => {
    expect(validatePassword("Abc1")).toEqual({
      valid: false,
      errors: ["Use at least 8 characters."],
    });
  });

  it("requires uppercase, lowercase, and numeric characters", () => {
    expect(validatePassword("alllowercase1")).toEqual({
      valid: false,
      errors: ["Add an uppercase letter."],
    });
    expect(validatePassword("ALLUPPERCASE1")).toEqual({
      valid: false,
      errors: ["Add a lowercase letter."],
    });
    expect(validatePassword("NoNumberAb")).toEqual({
      valid: false,
      errors: ["Add a number."],
    });
  });

  it("reports all missing password requirements together", () => {
    expect(validatePassword("short")).toEqual({
      valid: false,
      errors: ["Use at least 8 characters.", "Add an uppercase letter.", "Add a number."],
    });
  });
});
