export type PasswordPolicyResult =
  | { ok: true }
  | { ok: false; error: string };

export function validatePassword(password: string): PasswordPolicyResult {
  const p = password ?? "";
  if (p.length < 8) return { ok: false, error: "Password must be at least 8 characters" };
  if (p.length > 128) return { ok: false, error: "Password is too long" };

  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasNumber = /\d/.test(p);

  // Keep it simple: require at least 2 categories.
  const score = [hasLower, hasUpper, hasNumber].filter(Boolean).length;
  if (score < 2) {
    return { ok: false, error: "Password must include at least two of: lowercase, uppercase, number" };
  }

  return { ok: true };
}

