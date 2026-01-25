import mongoose, { Schema, model, models } from "mongoose";

const LessonSchema = new Schema(
    {
        title: {
            mn: { type: String, required: true },
            en: { type: String, required: true },
        },
        description: {
            mn: { type: String, required: true },
            en: { type: String, required: true },
        },
        category: { type: String, required: true }, // e.g., 'grammar', 'culture', 'vocabulary'
        countryTag: { type: String, default: "General" }, // e.g., 'Germany', 'Belgium', 'Austria', 'Switzerland'
        icon: { type: String, default: "FaBook" },
        color: { type: String, default: "blue" },
        focus: {
            mn: [String],
            en: [String],
        },
        imageUrl: { type: String },
        videoUrl: { type: String }, // Optional video link
        status: {
            type: String,
            enum: ["active", "upcoming", "archived"],
            default: "active",
        },
        difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
        attendees: [{ type: Schema.Types.ObjectId, ref: "User" }]
    },
    { timestamps: true }
);

const Lesson = models.Lesson || model("Lesson", LessonSchema);
export default Lesson;
