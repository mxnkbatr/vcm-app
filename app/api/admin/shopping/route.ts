import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import ShoppingItem from "@/lib/models/ShoppingItem";
import { withAdminAuth } from "@/lib/adminAuth";
import { v2 as cloudinary } from "cloudinary";
import { logAdminAction } from "@/lib/audit";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all shopping items (admin)
export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const items = await ShoppingItem.find({}).sort({ createdAt: -1 });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch shopping items" },
      { status: 500 }
    );
  }
});

// CREATE a new shopping item
export const POST = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const data = await req.json();

    const newItem = await ShoppingItem.create({
      name: data.name,
      description: data.description,
      price: data.price,
      image: data.image || "",
      category: data.category || "general",
      stock: data.stock || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    await logAdminAction({
      action: "admin.shop.create",
      targetType: "ShoppingItem",
      targetId: newItem._id.toString(),
      meta: { category: newItem.category, price: newItem.price, stock: newItem.stock },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Shopping item create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// UPDATE a shopping item
export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const data = await req.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updated = await ShoppingItem.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await logAdminAction({
      action: "admin.shop.update",
      targetType: "ShoppingItem",
      targetId: String(id),
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Shopping item update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});

// DELETE a shopping item
export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await ShoppingItem.findByIdAndDelete(id);
    await logAdminAction({
      action: "admin.shop.delete",
      targetType: "ShoppingItem",
      targetId: String(id),
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
