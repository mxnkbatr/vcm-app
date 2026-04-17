import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function resolveLocale(): Promise<string> {
  const c = await cookies();
  const fromCookie =
    c.get("NEXT_LOCALE")?.value ||
    c.get("next-intl-locale")?.value ||
    c.get("locale")?.value;

  return (fromCookie || "mn").toLowerCase();
}

export default async function SignInRedirectPage() {
  const locale = await resolveLocale();
  redirect(`/${locale}/sign-in`);
}

