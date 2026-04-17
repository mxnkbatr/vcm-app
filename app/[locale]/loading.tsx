export default function Loading() {
  return (
    <div className="min-h-dvh w-full px-4" style={{ background: "var(--bg)", paddingTop: "calc(56px + env(safe-area-inset-top) + 20px)" }}>
      <div className="max-w-[520px] mx-auto space-y-6">
        {/* Banner skeleton */}
        <div className="w-full h-44 rounded-3xl animate-pulse" style={{ background: "var(--fill)" }} />

        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-10 w-32 rounded-xl animate-pulse" style={{ background: "var(--fill)" }} />
          <div className="h-4 w-52 rounded-lg animate-pulse" style={{ background: "var(--fill)" }} />
        </div>

        {/* 2x2 grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-[24px] animate-pulse" style={{ background: "var(--fill)" }} />
          ))}
        </div>

        {/* Section title skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-40 rounded-lg animate-pulse" style={{ background: "var(--fill)" }} />
        </div>

        {/* Horizontal scroll skeleton */}
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-36 h-32 rounded-[24px] animate-pulse" style={{ background: "var(--fill)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}