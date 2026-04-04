// lib/models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    phone: { type: String, unique: true, sparse: true },
    email: { type: String, sparse: true },
    password: { type: String }, // bcrypt hashed, null for Google-only users
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },

    fullName: { type: String },
    photo: { type: String },

    affiliation: { type: String }, // e.g. School or Organization
    program: { type: String }, // e.g. And, Edu, VClub


    // Roles: guest, volunteer, general_and, general_edu, general_vclub, admin
    role: { type: String, default: "guest" },

    // Legacy: keep for data migration compatibility
    clerkId: { type: String, sparse: true },

    // --- TRACKING ---
    country: { type: String, default: "-" },
    step: { type: String, default: "-" },
    badges: { type: [String], default: [] },

    eventsAttendedCount: { type: Number, default: 0 },
    activityHistory: [{
      type: { type: String },
      title: { type: String },
      date: { type: Date },
      points: { type: Number },
      status: { type: String },
    }],

    // --- DOCUMENT STORAGE ---
    documents: {
      passport: { type: String, default: "" },
      emongoliaCert: { type: String, default: "" },
      marriageCert: { type: String, default: "" },
      residenceCert: { type: String, default: "" },
      birthCert: { type: String, default: "" },
      educationCert: { type: String, default: "" },
      bachelorDiploma: { type: String, default: "" },
      driverLicense: { type: String, default: "" },
      englishCert: { type: String, default: "" },
      medicalRecords: { type: String, default: "" },
      mentalHealthExam: { type: String, default: "" },
      professionalExp: { type: String, default: "" },
    },

    documentsSubmitted: { type: Boolean, default: false },
    documentsReviewedBy: { type: String, default: "" },
    documentsApprovedAt: { type: Date },

    // --- DETAILED PROFILE ---
    profile: {
      sex: { type: String },
      dob: { type: Date },
      placeOfBirth: { type: String },
      nationality: { type: String },
      religion: { type: String },
      phone: { type: String },
      mobile: { type: String },
      skype: { type: String },
      bestTime: { type: String },
      address: {
        street: { type: String },
        number: { type: String },
        postalCode: { type: String },
        city: { type: String },
        country: { type: String },
      },
      fatherProfession: { type: String },
      motherProfession: { type: String },
      brothers: { type: Number },
      sisters: { type: Number },
      hobbies: { type: String },
      educationLevel: { type: String },
      languages: { type: String },
      childcareExperience: { type: [String], default: [] },
      householdTasks: { type: [String], default: [] },
      motivation: { type: String },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;