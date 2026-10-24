import { NextResponse } from "next/server";

/** Never leak internal Error.message to clients. */
export function jsonError(
  status: number,
  publicMessage: string,
  logError?: unknown
) {
  if (logError !== undefined) {
    console.error(publicMessage, logError);
  }
  return NextResponse.json({ error: publicMessage }, { status });
}
