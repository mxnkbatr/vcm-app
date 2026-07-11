/** Compact relative time for notification rows */
export function formatRelativeTime(date: string | Date, locale = "mn") {
  const then = new Date(date).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return locale === "mn" ? "Саяхан" : "Just now";
  if (mins < 60) return locale === "mn" ? `${mins} мин өмнө` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "mn" ? `${hours} цагийн өмнө` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return locale === "mn" ? `${days} өдрийн өмнө` : `${days}d ago`;
  return new Date(date).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US", {
    month: "short",
    day: "numeric",
  });
}
