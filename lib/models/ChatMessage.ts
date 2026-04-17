import mongoose, { Schema, model, models } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    room: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, default: "" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatMessage = models.ChatMessage || model("ChatMessage", ChatMessageSchema);

export default ChatMessage;

