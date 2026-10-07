export type PasswordValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Use at least 8 characters.");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Add an uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Add a lowercase letter.");
  }
  if (!/\d/.test(password)) {
    errors.push("Add a number.");
  }

  return { valid: errors.length === 0, errors };
}
