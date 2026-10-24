import { Link } from "@/navigation";
import type { LucideIcon } from "lucide-react";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  href?: string;
}) {
  return (
    <div className="ios-empty">
      <div className="ios-empty__art" aria-hidden>
        <div className="ios-empty__icon">
          <Icon size={36} strokeWidth={1.5} />
        </div>
      </div>
      <p className="ios-empty__title">{title}</p>
      <p className="ios-empty__desc">{description}</p>
      {actionLabel && href ? (
        <Link href={href} className="btn btn-primary glass-press ios-empty__cta inline-flex items-center justify-center px-5">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
