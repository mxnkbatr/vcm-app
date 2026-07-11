import { redirect } from "@/navigation";
import { requireAdmin } from "@/lib/rbac";
import AdminShell from "./shell";
import { Suspense } from "react";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await requireAdmin();
  if (!admin) {
    redirect({ href: "/sign-in", locale });
  }

  return (
    <Suspense fallback={<div className="p-6 t-headline">Admin…</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

