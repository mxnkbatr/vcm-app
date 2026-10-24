import { ExternalLink } from "lucide-react";

export default function SourceAttribution({
  source,
  href,
}: {
  source?: string | null;
  href?: string | null;
}) {
  if (source !== "volunteer.org.mn") return null;
  const url = href || "https://volunteer.org.mn";
  return (
    <p className="mt-4 text-[12px]" style={{ color: "var(--label3)" }}>
      Эх сурвалж:{" "}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold"
        style={{ color: "var(--blue)" }}
      >
        volunteer.org.mn
        <ExternalLink size={12} strokeWidth={2} aria-hidden />
      </a>
    </p>
  );
}
