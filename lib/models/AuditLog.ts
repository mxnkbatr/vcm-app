import mongoose, { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    actorName: { type: String, default: "" },
    actorRole: { type: String, default: "" },

    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true, index: true },
    targetId: { type: String, default: "", index: true },

    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
export default AuditLog;

