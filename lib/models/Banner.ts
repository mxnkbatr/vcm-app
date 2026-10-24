import mongoose, { Schema, model, models } from "mongoose";

const BannerSchema = new Schema(
  {
    title: {
      mn: { type: String, required: true },
      en: { type: String, default: "" },
    },
    subtitle: {
      mn: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    intervalSec: { type: Number, default: 8 },
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

BannerSchema.index(
  { source: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalId: { $type: "string" } },
  }
);

const Banner = models.Banner || model("Banner", BannerSchema);
export default Banner;
