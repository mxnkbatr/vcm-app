import mongoose, { Schema, model, models } from "mongoose";

const LmsProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "LmsCourse", required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "LmsLesson", required: true, index: true },

    watchedSeconds: { type: Number, default: 0 },
    completedAt: { type: Date },
    updatedAtClient: { type: Date },
  },
  { timestamps: true }
);

LmsProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

const LmsProgress = models.LmsProgress || model("LmsProgress", LmsProgressSchema);
export default LmsProgress;

