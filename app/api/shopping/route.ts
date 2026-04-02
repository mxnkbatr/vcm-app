import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";

// Public GET — only active items
export async function GET() {
  try {
    await connectToDB();
    const items = await ShoppingItem.find({ isActive: true }).sort({
      createdAt: -1,
    });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shopping items" },
      { status: 500 }
    );
  }
}
