import mongoose, { Schema, model, models } from "mongoose";

const LmsModuleSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "LmsCourse", required: true, index: true },
    title: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, default: "" },
    },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

LmsModuleSchema.index({ courseId: 1, order: 1 });

const LmsModule = models.LmsModule || model("LmsModule", LmsModuleSchema);
export default LmsModule;

