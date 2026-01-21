import mongoose, { Schema, model, models } from "mongoose";

const EventSchema = new Schema(
  {
    title: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
    },
    description: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
    },
    date: { type: Date, required: true },
    timeString: { type: String, required: true }, // e.g., "14:00 - 16:00"
    location: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
    },
    image: { type: String, required: true },
    category: {
      type: String,
      enum: ['campaign', 'workshop', 'fundraiser', 'meeting'],
      required: true
    },
    link: { type: String }, // Registration link
    university: { type: String, required: true, default: "MNUMS" },
    status: {
      type: String,
      enum: ['upcoming', 'past', 'cancelled'],
      default: 'upcoming'
    },
    featured: { type: Boolean, default: false },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const Event = models.Event || model("Event", EventSchema);
export default Event;