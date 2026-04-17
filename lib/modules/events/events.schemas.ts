import { z } from "zod";

const I18nTextSchema = z
  .union([
    z.string(),
    z.object({
      en: z.string().optional(),
      mn: z.string().optional(),
      de: z.string().optional(),
    }),
  ])
  .transform((val) => {
    if (typeof val === "string") {
      const t = val.trim();
      return { en: t, mn: t, de: "" };
    }
    const en = (val.en ?? "").trim();
    const mn = (val.mn ?? "").trim();
    const de = (val.de ?? "").trim();
    return { en, mn, de };
  })
  .refine((v) => v.en.length > 0 && v.mn.length > 0, {
    message: "Both EN and MN are required",
  });

export const EventCategorySchema = z.enum([
  "campaign",
  "workshop",
  "fundraiser",
  "meeting",
]);

export const CreateEventSchema = z.object({
  title: I18nTextSchema,
  description: I18nTextSchema,
  location: I18nTextSchema,
  image: z.string().min(1),
  category: EventCategorySchema,
  link: z.string().url().optional().or(z.literal("")),
  university: z.string().optional(),
  date: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
  timeString: z.string().min(1),
  featured: z.boolean().optional(),
  status: z.enum(["upcoming", "past", "cancelled"]).optional(),
});

