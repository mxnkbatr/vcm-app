import mongoose, { Schema, model, models } from "mongoose";

const LmsPaymentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "LmsCourse", required: true, index: true },

    provider: { type: String, enum: ["QPay"], default: "QPay", index: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending", index: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "MNT" },
    phoneNumber: { type: String, default: "" },

    // QPay invoice identifiers
    invoiceId: { type: String, default: "", index: true },
    invoiceReceiverCode: { type: String, default: "" },
  },
  { timestamps: true }
);

LmsPaymentSchema.index({ userId: 1, courseId: 1, status: 1 });

const LmsPayment = models.LmsPayment || model("LmsPayment", LmsPaymentSchema);
export default LmsPayment;

