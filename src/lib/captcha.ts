const CAPTCHA_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function createCaptcha(random = Math.random): string {
  return Array.from({ length: 5 }, () => {
    const index = Math.floor(random() * CAPTCHA_ALPHABET.length);
    return CAPTCHA_ALPHABET[index] ?? CAPTCHA_ALPHABET[0];
  }).join("");
}

export function matchesCaptcha(expected: string, entered: string): boolean {
  return expected.length > 0 && expected.toUpperCase() === entered.trim().toUpperCase();
}