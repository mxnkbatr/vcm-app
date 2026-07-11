const PHONE_EMAIL_DOMAIN = "users.vcm.mn";

export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

/** Map phone login to a stable Supabase auth email. */
export function phoneToAuthEmail(phone: string): string {
  const normalized = normalizePhone(phone);
  return `${normalized}@${PHONE_EMAIL_DOMAIN}`;
}

export function isPhoneAuthEmail(email: string | null | undefined): boolean {
  return Boolean(email?.endsWith(`@${PHONE_EMAIL_DOMAIN}`));
}
