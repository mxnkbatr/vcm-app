import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function resolveLocale(): string {
  const c = cookies();
  const fromCookie =
    c.get("NEXT_LOCALE")?.value ||
    c.get("next-intl-locale")?.value ||
    c.get("locale")?.value;

  return (fromCookie || "mn").toLowerCase();
}

export default function SignInRedirectPage() {
  const locale = resolveLocale();
  redirect(`/${locale}/sign-in`);
}

