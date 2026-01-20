// lib/models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    fullName: { type: String },
    photo: { type: String },
    role: { type: String, default: "guest" }, // admin, student, guest
    
    // --- NEW FIELDS FOR TRACKING ---
    country: { type: String, default: "-" }, // e.g. "Germany"
    step: { type: String, default: "-" },    // e.g. "Visa Process"
    
    badges: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;