/** Shared program + application status labels (MN / EN) */

export const PROGRAM_LABELS_MN: Record<string, string> = {
  EDU: "EDU хөтөлбөр",
  AND: "АНД хөтөлбөр",
  VCLUB: "V-Club",
  V: "V-Club",
};

export const APPLICATION_STATUS = {
  draft: { mn: "Ноорог", en: "Draft", color: "var(--label3)", bg: "var(--fill2)" },
  pending_general: { mn: "Координатор шалгаж байна", en: "With coordinator", color: "var(--orange)", bg: "var(--orange-dim)" },
  pending_admin: { mn: "Админ баталгаажуулалт", en: "Admin review", color: "var(--blue)", bg: "var(--blue-dim)" },
  approved_volunteer: { mn: "Баталгаажсан", en: "Approved", color: "var(--emerald)", bg: "var(--emerald-dim)" },
  rejected: { mn: "Татгалзсан", en: "Rejected", color: "var(--red)", bg: "var(--red-dim)" },
} as const;

export type ApplicationStatusKey = keyof typeof APPLICATION_STATUS;

export function statusMeta(status: string | undefined) {
  const key = (status || "pending_general") as ApplicationStatusKey;
  return APPLICATION_STATUS[key] ?? APPLICATION_STATUS.pending_general;
}

export function programLabelMn(programId: string | undefined) {
  if (!programId) return "Хөтөлбөр";
  return PROGRAM_LABELS_MN[programId] || programId;
}
