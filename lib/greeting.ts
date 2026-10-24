/** Time-of-day Mongolian greeting + compact date label. */

export function timeGreetingMn(date = new Date()): string {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Өглөөний мэнд";
  if (h >= 12 && h < 17) return "Өдрийн мэнд";
  if (h >= 17 && h < 22) return "Оройн мэнд";
  return "Сайн байна уу";
}

export function personalGreetingMn(name?: string | null, date = new Date()): string {
  const base = timeGreetingMn(date);
  const first = (name || "").trim().split(/\s+/)[0];
  return first ? `${base}, ${first}` : base;
}

export function todayLabelMn(date = new Date()): string {
  try {
    return date.toLocaleDateString("mn-MN", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}
