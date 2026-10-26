"use client";

type RnIconButtonProps = {
  label: string;
  onPress?: () => void;
  light?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** RN TouchableOpacity-style round header action. */
export default function RnIconButton({
  label,
  onPress,
  light = false,
  children,
  className = "",
}: RnIconButtonProps) {
  return (
    <button
      type="button"
      className={`rn-icon-btn press ${light ? "rn-icon-btn--light" : ""} ${className}`.trim()}
      onClick={onPress}
      aria-label={label}
    >
      {children}
    </button>
  );
}
