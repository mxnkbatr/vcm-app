import { z } from "zod";

export const ObjectIdSchema = z.string().min(1);

export const EnrollSchema = z.object({
  courseId: ObjectIdSchema,
});

export const UpdateProgressSchema = z.object({
  courseId: ObjectIdSchema,
  lessonId: ObjectIdSchema,
  watchedSeconds: z.number().int().min(0),
  completed: z.boolean().optional(),
  updatedAtClient: z.string().datetime().optional(),
});

