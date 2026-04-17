import mongoose, { Schema, model, models } from "mongoose";

const LmsCertificateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "LmsCourse", required: true, index: true },

    certNumber: { type: String, required: true, unique: true, index: true },
    pdfUrl: { type: String, default: "" },
    issuedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

LmsCertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const LmsCertificate =
  models.LmsCertificate || model("LmsCertificate", LmsCertificateSchema);
export default LmsCertificate;

