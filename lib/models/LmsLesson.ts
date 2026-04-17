import mongoose, { Schema, model, models } from "mongoose";

const LmsLessonSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "LmsCourse", required: true, index: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "LmsModule", required: true, index: true },

    title: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    description: {
      en: { type: String, default: "" },
      mn: { type: String, default: "" },
      de: { type: String, default: "" },
    },
    order: { type: Number, default: 0, index: true },

    videoProvider: { type: String, enum: ["cloudinary", "mux", "youtube", "custom"], default: "custom" },
    videoAssetId: { type: String, default: "" }, // provider-specific id (or URL if custom)
    durationSeconds: { type: Number, default: 0 },
    isFreePreview: { type: Boolean, default: false, index: true },

    status: { type: String, enum: ["draft", "published", "archived"], default: "draft", index: true },
  },
  { timestamps: true }
);

LmsLessonSchema.index({ courseId: 1, moduleId: 1, order: 1 });
LmsLessonSchema.index({ courseId: 1, status: 1 });

const LmsLesson = models.LmsLesson || model("LmsLesson", LmsLessonSchema);
export default LmsLesson;

