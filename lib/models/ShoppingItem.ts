import mongoose, { Schema, model, models } from "mongoose";

const ShoppingItemSchema = new Schema(
  {
    name: {
      en: { type: String, required: true },
      mn: { type: String, required: true },
      de: { type: String, required: true },
    },
    description: {
      en: { type: String, default: "" },
      mn: { type: String, default: "" },
      de: { type: String, default: "" },
    },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "general" },
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ShoppingItem =
  models.ShoppingItem || model("ShoppingItem", ShoppingItemSchema);
export default ShoppingItem;
