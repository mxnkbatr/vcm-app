import mongoose, { Schema, model, models } from "mongoose";

const ApplicationSchema = new Schema(
  {
    userId: { type: String }, // Optional: Link to registered user if available
    programId: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: String, required: true },
    level: { type: String, required: true },
    message: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

const Application = models.Application || model("Application", ApplicationSchema);
export default Application;