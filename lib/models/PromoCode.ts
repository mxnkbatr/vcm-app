import mongoose, { Schema, model, models } from "mongoose";

const PromoCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    label: { type: String, default: "" },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    shopItemIds: [{ type: Schema.Types.ObjectId, ref: "ShoppingItem" }],
    eventIds: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    allShopItems: { type: Boolean, default: false },
    allEvents: { type: Boolean, default: false },
    active: { type: Boolean, default: true, index: true },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const PromoCode = models.PromoCode || model("PromoCode", PromoCodeSchema);
export default PromoCode;
