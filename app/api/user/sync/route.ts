import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUser } from "@/lib/authHelpers";

export async function POST(req: Request) {
  console.log("--------------- STARTING USER SYNC ---------------");
  try {
    await connectToDB();
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    console.error("!!!!! SYNC FAILED !!!!!");
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}