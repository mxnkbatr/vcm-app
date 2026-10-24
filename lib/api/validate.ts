import { z } from "zod";
import { jsonError } from "@/lib/api/errors";

export async function parseJsonBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T
): Promise<{ data: z.infer<T> } | { error: Response }> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return { error: jsonError(400, "Invalid JSON body") };
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { error: jsonError(400, "Invalid request") };
  }
  return { data: parsed.data };
}
