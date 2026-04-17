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
    timeString: { type: String, required: true }, // e.g., "14:00 - 16:00"
    location: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ['campaign', 'workshop', 'fundraiser', 'meeting'],
      required: true,
      index: true
    },
    link: { type: String }, // Registration link
    university: { type: String, required: true, default: "MNUMS" },
    status: {
      type: String,
      enum: ['upcoming', 'past', 'cancelled'],
      default: 'upcoming',
      index: true
    },
    featured: { type: Boolean, default: false },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User", index: true }]
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ attendees: 1 });

const Event = models.Event || model("Event", EventSchema);
export default Event;