import { getAuthUser } from "@/lib/authHelpers";
import { NextResponse } from "next/server";

export function withAdminAuth(handler: (req: Request, context: any) => Promise<NextResponse>) {
  return async (req: Request, context: any) => {
    try {
      const user = await getAuthUser();
      
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
      }

      return handler(req, context);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}
