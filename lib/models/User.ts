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

    // --- DOCUMENT STORAGE ---
    documents: {
      passport: { type: String, default: "" },           // Cloudinary URL for JPG or PDF
      emongoliaCert: { type: String, default: "" },      // PDF URL
      marriageCert: { type: String, default: "" },       // PDF URL (optional)
      residenceCert: { type: String, default: "" },      // PDF URL
      birthCert: { type: String, default: "" },          // PDF URL
      educationCert: { type: String, default: "" },      // PDF URL
      bachelorDiploma: { type: String, default: "" },    // PDF URL
      driverLicense: { type: String, default: "" },      // Cloudinary or PDF URL
      englishCert: { type: String, default: "" },        // Cloudinary or PDF URL (IELTS/TOEFL)
      medicalRecords: { type: String, default: "" },     // Scanned document URL
      mentalHealthExam: { type: String, default: "" },   // Scanned document URL
      professionalExp: { type: String, default: "" },    // PDF URL (optional)
    },

    // Document submission tracking
    documentsSubmitted: { type: Boolean, default: false },
    documentsReviewedBy: { type: String, default: "" },    // Admin who reviewed
    documentsApprovedAt: { type: Date },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;