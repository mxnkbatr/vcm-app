import mongoose, { Schema, model, models } from "mongoose";

const LmsEnrollmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "LmsCourse", required: true, index: true },

    access: { type: String, enum: ["free", "paid", "admin"], default: "free" },
    status: { type: String, enum: ["active", "revoked"], default: "active", index: true },

    paidOrderId: { type: String, default: "" },
    startedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

LmsEnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
LmsEnrollmentSchema.index({ userId: 1, status: 1 });

const LmsEnrollment =
  models.LmsEnrollment || model("LmsEnrollment", LmsEnrollmentSchema);
export default LmsEnrollment;

