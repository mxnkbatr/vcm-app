// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import User from "@/lib/models/User";

// --- AUTH CHECK ---
async function isAdmin() {
  const user = await currentUser();
  if (!user) return false;
  // Check Clerk metadata or DB role
  return user.publicMetadata?.role === 'admin';
}

// 1. GET: Fetch all users for the table (or specific user with documents)
export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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

  // Sort by newest first
  const users = await User.find({}).sort({ createdAt: -1 });

  // Map Mongo _id to string if needed, otherwise send as is
  return NextResponse.json(users);
}

// 2. PUT: The critical part that SAVES changes
export async function PUT(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await connectToDB();
    const body = await req.json();

    // Destructure the payload sent from AdminDashboard.tsx
    const { userId, action, data } = body;

    // --- CASE A: UPDATE USER DETAILS (Role, Country, Step) ---
    if (action === 'update_user') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      // 1. Update MongoDB (The Permanent Save)
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: data.role,
          country: data.country,
          step: data.step,
        },
        { new: true } // Return the updated document
      );

      // 2. Sync Clerk Metadata (So permissions work immediately)
      if (updatedUser && updatedUser.clerkId) {
        const client = await clerkClient();
        await client.users.updateUserMetadata(updatedUser.clerkId, {
          publicMetadata: {
            role: data.role, // "student", "admin", "guest"
          },
        });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    }

    // --- CASE B: APPROVE DOCUMENTS ---
    if (action === 'approve_documents') {
      if (!userId) return NextResponse.json({ error: "Missing User ID" }, { status: 400 });

      const adminUser = await currentUser();
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          documentsReviewedBy: adminUser?.firstName || "Admin",
          documentsApprovedAt: new Date(),
        },
        { new: true }
      );

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Database Update Failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 3. DELETE: Remove user
export async function DELETE(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    // Find user to get Clerk ID
    const userToDelete = await User.findById(id);
    if (!userToDelete) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Delete from Clerk
    if (userToDelete.clerkId) {
      try {
        const client = await clerkClient();
        await client.users.deleteUser(userToDelete.clerkId);
      } catch (err) {
        console.log("Clerk delete error (ignoring):", err);
      }
    }

    // Delete from MongoDB
    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}