import mongoose, { Schema, model, models } from "mongoose";

const LmsCourseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
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
    thumbnailUrl: { type: String, default: "" },
    price: { type: Number, default: 0 },
    currency: { type: String, default: "MNT" },
    isFree: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

const LmsCourse = models.LmsCourse || model("LmsCourse", LmsCourseSchema);
export default LmsCourse;

