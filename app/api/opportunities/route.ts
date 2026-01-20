import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Opportunity from "@/lib/models/Opportunity";

export async function GET() {
  try {
    await connectToDB();
    const opportunities = await Opportunity.find({}).sort({ createdAt: -1 });
    return NextResponse.json(opportunities, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch opportunities", error);
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 });
  }
}