import mongoose, { Schema, model, models } from "mongoose";

const EventSchema = new Schema(
  {
    title: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    description: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    date: { type: Date, required: true, index: true },
    timeString: { type: String, required: true },
    location: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ["campaign", "workshop", "fundraiser", "meeting"],
      required: true,
      index: true,
    },
    link: { type: String },
    university: { type: String, required: true, default: "MNUMS" },
    status: {
      type: String,
      enum: ["upcoming", "past", "cancelled"],
      default: "upcoming",
      index: true,
    },
    featured: { type: Boolean, default: false },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    ticketPrice: { type: Number, default: 0, min: 0 },
    source: {
      type: String,
      enum: ["vcm", "volunteer.org.mn"],
      default: "vcm",
      index: true,
    },
    externalId: { type: String },
    externalUrl: { type: String },
    syncedAt: { type: Date },
  },
  { timestamps: true }
);

EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ attendees: 1 });
EventSchema.index(
  { source: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalId: { $type: "string" } },
  }
);

const Event = models.Event || model("Event", EventSchema);
export default Event;
