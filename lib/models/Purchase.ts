import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchase extends Document {
  itemId: mongoose.Types.ObjectId;
  phoneNumber: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  promoCode?: string;
  promoId?: mongoose.Types.ObjectId;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "ShoppingItem", required: true },
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    originalAmount: { type: Number },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String },
    promoId: { type: Schema.Types.ObjectId, ref: "PromoCode" },
    status: { type: String, required: true, default: "pending" },
    paymentMethod: { type: String, required: true, default: "QPay" },
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default Purchase;
