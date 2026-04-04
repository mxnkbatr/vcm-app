// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";
import { withAdminAuth } from "@/lib/adminAuth";
import { getAuthUser } from "@/lib/authHelpers";

// 1. GET: Fetch all users for the table (or specific user with documents)
export const GET = withAdminAuth(async (req: Request) => {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");
  const includeDocuments = searchParams.get("includeDocuments") === "true";

  // If fetching specific user with documents
  if (userId && includeDocuments) {
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  }

  // Fetch all users sorted by update date
  const mongoUsers = await User.find({}).lean();

  // Sort: Admins first, then Students, then Guests
  const roleOrder: Record<string, number> = { admin: 3, student: 2, guest: 1 };
  mongoUsers.sort((a, b) => {
    const roleA = (a.role as string) || "guest";
    const roleB = (b.role as string) || "guest";
    const orderA = roleOrder[roleA.toLowerCase()] || 0;
    const orderB = roleOrder[roleB.toLowerCase()] || 0;
    if (orderA !== orderB) return orderB - orderA;
    return new Date(b.updatedAt || new Date()).getTime() - new Date(a.updatedAt || new Date()).getTime();
  });

  return NextResponse.json(mongoUsers);
});

// 2. PUT: The critical part that SAVES changes
export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();

    // Destructure the payload sent from AdminDashboard.tsx
    const { userId, action, data } = body;

    // Use clerkId if userId doesn't look like a MongoDB ObjectId to support older users migrating
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);
    const query = isMongoId ? { _id: userId } : { clerkId: userId };

    // --- CASE A: UPDATE USER DETAILS (Role, Country, Step) ---
    if (action === 'update_user') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $set: {
            role: data.role,
            country: data.country,
            step: data.step,
            status: data.status,
            fullName: data.fullName,
          }
        },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // --- CASE MASTER: FULL CONTROL ---
    if (action === 'master_update') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      // Clean the data to avoid updating immutable fields if any
      const { _id, clerkId, createdAt, ...updateData } = data;

      const updatedUser = await User.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // --- CASE B: APPROVE DOCUMENTS ---
    if (action === 'approve_documents') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      const adminUser = await getAuthUser();
      const updatedUser = await User.findOneAndUpdate(
        query,
        {
          $set: {
            documentsReviewedBy: adminUser?.fullName || "Admin",
            documentsApprovedAt: new Date(),
          }
        },
        { new: true, upsert: true }
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // --- CASE C: ADMIN PASSWORD RESET ---
    if (action === 'reset_password') {
      if (!userId || !data.password) return NextResponse.json({ error: "Missing User ID or password" }, { status: 400 });

      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const updatedUser = await User.findOneAndUpdate(
        query,
        { $set: { password: hashedPassword } },
        { new: true }
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Database Update Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});

// 3. DELETE: Remove user
export const DELETE = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const query = isMongoId ? { _id: id } : { clerkId: id };

    await User.findOneAndDelete(query);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
});