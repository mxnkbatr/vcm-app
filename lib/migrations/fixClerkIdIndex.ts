import mongoose from "mongoose";
import User from "@/lib/models/User";

let fixed = false;

/**
 * Clerk migration left a non-sparse unique index on clerkId.
 * New credential users omit clerkId, but MongoDB stores null and only
 * allows one null in a non-sparse unique index (E11000).
 */
export async function ensureClerkIdIndex() {
  if (fixed) return;

  const collection = mongoose.connection.collection("users");

  const unset = await collection.updateMany({ clerkId: null }, { $unset: { clerkId: "" } });
  if (unset.modifiedCount > 0) {
    console.log(`Unset clerkId on ${unset.modifiedCount} user(s)`);
  }

  const indexes = await collection.indexes();
  const clerkIndex = indexes.find((idx) => idx.name === "clerkId_1");
  if (clerkIndex) {
    await collection.dropIndex("clerkId_1");
  }

  await User.syncIndexes();
  fixed = true;
}
