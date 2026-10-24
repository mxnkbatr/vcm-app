"use client";

import { QRCodeSVG } from "qrcode.react";

/** Profile volunteer ID QR — scanned at events for attendance. */
export default function VolunteerIdQr({
  userId,
  name,
  locale = "mn",
}: {
  userId: string;
  name?: string;
  locale?: string;
}) {
  const payload = `vcm-volunteer:${userId}`;

  return (
    <div
      className="flex flex-col items-center gap-3 px-4 py-5"
      style={{
        borderRadius: "var(--r-2xl)",
        background: "var(--card)",
        boxShadow: "var(--s-card)",
      }}
    >
      <p className="ios-caption uppercase tracking-wide" style={{ color: "var(--label2)" }}>
        {locale === "mn" ? "Сайн дурын үнэмлэх" : "Volunteer ID"}
      </p>
      <div className="bg-white p-3 rounded-2xl" style={{ border: "0.5px solid var(--sep)" }}>
        <QRCodeSVG value={payload} size={148} level="M" includeMargin={false} />
      </div>
      {name ? (
        <p className="text-[15px] font-semibold text-center" style={{ color: "var(--label)" }}>
          {name}
        </p>
      ) : null}
      <p className="text-[12px] text-center px-4" style={{ color: "var(--label3)" }}>
        {locale === "mn"
          ? "Эвент дээр энэ QR-ийг уншуулж ирцээ бүртгүүлнэ үү"
          : "Show this QR at events to check in"}
      </p>
    </div>
  );
}
