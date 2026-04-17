import mongoose, { Schema, model, models } from "mongoose";

const LiveSessionSchema = new Schema(
  {
    title: { type: String, required: true },
    room: { type: String, required: true, unique: true, index: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
      index: true,
    },
    createdByUserId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

const LiveSession = models.LiveSession || model("LiveSession", LiveSessionSchema);

export default LiveSession;

