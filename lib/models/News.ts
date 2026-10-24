import mongoose, { Schema, model, models } from "mongoose";

const NewsSchema = new Schema(
  {
    title: {
      en: { type: String, default: "" },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    summary: {
      en: { type: String, default: "" },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    content: {
      en: { type: String, default: "" },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    author: { type: String, default: "Admin" },
    publishedDate: { type: Date, default: Date.now },
    image: { type: String, required: true },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
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

NewsSchema.index(
  { source: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalId: { $type: "string" } },
  }
);

const News = models.News || model("News", NewsSchema);
export default News;
