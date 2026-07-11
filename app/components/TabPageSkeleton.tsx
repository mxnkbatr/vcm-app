import Skeleton from "./Skeleton";
import PremiumPageShell from "./PremiumPageShell";

type Variant = "cards" | "grid" | "list" | "shop";

export default function TabPageSkeleton({ variant = "cards" }: { variant?: Variant }) {
  return (
    <PremiumPageShell>
      <div className="space-y-5 pt-2">
        <div className="space-y-2 pt-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>

        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {variant === "grid" && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 rounded-[24px]" />
            ))}
          </div>
        )}

        {variant === "shop" && (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-36 rounded-[20px]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {(variant === "cards" || variant === "list") && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-56 rounded-[24px]" />
            ))}
          </div>
        )}
      </div>
    </PremiumPageShell>
  );
}
