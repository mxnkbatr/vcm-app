import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true }, // e.g. live_started, order_paid
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    payload: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Notification =
  models.Notification || model("Notification", NotificationSchema);

export default Notification;

