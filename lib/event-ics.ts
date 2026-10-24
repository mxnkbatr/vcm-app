/** Build a minimal .ics calendar invite for an event. */
export function buildEventIcs(opts: {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  durationHours?: number;
  url?: string;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const toStamp = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const start = opts.start;
  const end = new Date(start.getTime() + (opts.durationHours ?? 2) * 60 * 60 * 1000);
  const escape = (s: string) =>
    s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VCM//Volunteer Center Mongolia//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:vcm-event-${opts.id}@volunteer.org.mn`,
    `DTSTAMP:${toStamp(new Date())}`,
    `DTSTART:${toStamp(start)}`,
    `DTEND:${toStamp(end)}`,
    `SUMMARY:${escape(opts.title)}`,
  ];
  if (opts.description) lines.push(`DESCRIPTION:${escape(opts.description)}`);
  if (opts.location) lines.push(`LOCATION:${escape(opts.location)}`);
  if (opts.url) lines.push(`URL:${opts.url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
