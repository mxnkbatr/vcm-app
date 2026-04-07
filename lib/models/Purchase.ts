import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchase extends Document {
  itemId: mongoose.Types.ObjectId;
  phoneNumber: string;
  amount: number;
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
    status: { type: String, required: true, default: "pending" }, // 'pending', 'completed', 'failed'
    paymentMethod: { type: String, required: true, default: "QPay" },
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default Purchase;
