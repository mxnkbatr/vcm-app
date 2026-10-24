"use client";

import { GraduationCap, Handshake, Globe, type LucideIcon } from "lucide-react";

export function programIcon(id?: string): LucideIcon {
  const key = (id || "").toLowerCase();
  if (key.includes("and")) return Handshake;
  if (key.includes("vclub") || key.includes("club")) return Globe;
  return GraduationCap;
}

export default function ProgramGlyph({ id, size = 22 }: { id?: string; size?: number }) {
  const Icon = programIcon(id);
  return <Icon size={size} strokeWidth={1.75} />;
}
