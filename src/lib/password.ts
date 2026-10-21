/**
 * Shared password policy (mirrors OpenWide): 12+ characters and not a
 * common password. Used client-side for instant feedback and server-side
 * in signupSchema so the API enforces the same rules.
 */
export const PASSWORD_MIN_LENGTH = 12;

export const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "p@ssw0rd",
  "p@ssword",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "12345678910",
  "qwerty",
  "qwertyuiop",
  "qwerty123",
  "abc123",
  "abcdefgh",
  "abcd1234",
  "letmein",
  "welcome",
  "welcome1",
  "iloveyou",
  "admin",
  "administrator",
  "changeme",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "sunshine",
  "princess",
  "trustno1",
  "whatever",
  "starwars",
  "000000",
  "111111",
  "666666",
  "654321",
  "zaq12wsx",
  "1q2w3e4r",
  "1qaz2wsx",
]);

export function passwordError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "Please choose a less common password.";
  }
  return null;
}
