"use client";

type Ring = { value: number; max: number; color: string; label: string };

export default function FitnessRing({
  rings,
  size = 120,
}: {
  rings: Ring[];
  size?: number;
}) {
  const stroke = 10;
  const gap = 6;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {rings.map((r, i) => {
          const radius = size / 2 - stroke / 2 - i * (stroke + gap);
          const circ = 2 * Math.PI * radius;
          const pct = Math.min(1, Math.max(0, r.max ? r.value / r.max : 0));
          return (
            <g key={r.label}>
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="var(--fill2)"
                strokeWidth={stroke}
              />
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={r.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${circ * pct} ${circ}`}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            </g>
          );
        })}
      </svg>
      <div className="space-y-2">
        {rings.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
            <div>
              <p className="ios-caption" style={{ color: "var(--label2)" }}>{r.label}</p>
              <p className="ios-headline" style={{ fontSize: 15 }}>
                {r.value}<span className="ios-footnote"> / {r.max}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
