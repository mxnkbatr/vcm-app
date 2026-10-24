import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPurchaseLineItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  lineItems: IPurchaseLineItem[];
  quantity: number;
  phoneNumber: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  promoCode?: string;
  promoId?: mongoose.Types.ObjectId;
  invoiceId?: string;
  status: "pending" | "completed" | string;
  paymentMethod: string;
  promoApplied?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<IPurchaseLineItem>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "ShoppingItem", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchase>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, ref: "ShoppingItem", required: true },
    lineItems: { type: [LineItemSchema], default: [] },
    quantity: { type: Number, default: 1, min: 1 },
    phoneNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    originalAmount: { type: Number },
    discountAmount: { type: Number, default: 0 },
    promoCode: { type: String },
    promoId: { type: Schema.Types.ObjectId, ref: "PromoCode" },
    invoiceId: { type: String, index: true },
    status: { type: String, required: true, default: "pending", index: true },
    paymentMethod: { type: String, required: true, default: "QPay" },
    promoApplied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Purchase: Model<IPurchase> =
  mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", PurchaseSchema);

export default Purchase;
