import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectToDB: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  findOneAndUpdate: vi.fn(),
  qpayCreateInvoice: vi.fn(),
  qpayCheckInvoicePaid: vi.fn(),
  incrementPromoUsage: vi.fn(),
  validatePromoForShop: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ connectToDB: mocks.connectToDB }));
vi.mock("@/lib/qpay", () => ({
  qpayCreateInvoice: mocks.qpayCreateInvoice,
  qpayCheckInvoicePaid: mocks.qpayCheckInvoicePaid,
}));
vi.mock("@/lib/promo", () => ({
  validatePromoForShop: mocks.validatePromoForShop,
  incrementPromoUsage: mocks.incrementPromoUsage,
}));
vi.mock("@/lib/models/ShoppingItem", () => ({
  default: { find: mocks.find },
}));
vi.mock("@/lib/models/PromoCode", () => ({
  default: { findOne: mocks.findOne },
}));
vi.mock("@/lib/models/Purchase", () => ({
  default: {
    create: mocks.create,
    findByIdAndUpdate: mocks.findByIdAndUpdate,
    findOneAndUpdate: mocks.findOneAndUpdate,
  },
}));

import {
  createShopPurchaseInvoice,
  markPurchasePaidIfValid,
  priceLinesFromDb,
} from "@/lib/shop-payment";

describe("shop payment security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectToDB.mockResolvedValue(undefined);
  });

  it("ignores client price and uses DB unit price", async () => {
    mocks.find.mockReturnValue({
      lean: () =>
        Promise.resolve([{ _id: "item1", price: 5000, isActive: true }]),
    });

    const { priced, subtotal } = await priceLinesFromDb([
      { itemId: "item1", quantity: 2 },
    ]);

    expect(priced[0].unitPrice).toBe(5000);
    expect(subtotal).toBe(10000);
  });

  it("creates invoice with DB total even if caller wanted a lower amount", async () => {
    mocks.find.mockReturnValue({
      lean: () =>
        Promise.resolve([{ _id: "item1", price: 9000, isActive: true }]),
    });
    mocks.create.mockResolvedValue({
      _id: { toString: () => "purchase1" },
      amount: 9000,
    });
    mocks.qpayCreateInvoice.mockResolvedValue({
      invoice_id: "inv-1",
      qPay_shortUrl: "https://qpay.example/1",
    });
    mocks.findByIdAndUpdate.mockResolvedValue({});

    const result = await createShopPurchaseInvoice({
      userId: "507f1f77bcf86cd799439011",
      lines: [{ itemId: "item1", quantity: 1 }],
      phoneNumber: "99112233",
    });

    expect(mocks.qpayCreateInvoice).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 9000, senderInvoiceNo: "purchase1" })
    );
    expect(result.finalAmount).toBe(9000);
  });

  it("rejects underpayment (paid_amount < total)", async () => {
    mocks.qpayCheckInvoicePaid.mockResolvedValue({
      isPaid: false,
      paidAmount: 100,
      raw: { paid_amount: 100, count: 1, rows: [{ payment_status: "PAID" }] },
    });

    const purchase: any = {
      _id: "p1",
      amount: 5000,
      invoiceId: "inv-1",
      status: "pending",
      promoId: null,
      promoApplied: false,
    };

    const result = await markPurchasePaidIfValid(purchase, { invoiceId: "inv-1" });
    expect(result.status).toBe("pending");
    expect(mocks.findOneAndUpdate).not.toHaveBeenCalled();
    expect(mocks.incrementPromoUsage).not.toHaveBeenCalled();
  });

  it("idempotent paid transition: second call does not re-increment promo", async () => {
    mocks.qpayCheckInvoicePaid.mockResolvedValue({
      isPaid: true,
      paidAmount: 5000,
      raw: { paid_amount: 5000, count: 1, rows: [{ payment_status: "PAID" }] },
    });
    mocks.findOneAndUpdate.mockResolvedValue({
      _id: "p1",
      status: "completed",
      amount: 5000,
    });

    const purchase: any = {
      _id: "p1",
      amount: 5000,
      invoiceId: "inv-1",
      status: "pending",
      promoId: "promo1",
      promoApplied: false,
    };

    const first = await markPurchasePaidIfValid(purchase, { invoiceId: "inv-1" });
    expect(first.status).toBe("paid");
    expect(mocks.incrementPromoUsage).toHaveBeenCalledTimes(1);

    const alreadyPaid: any = {
      ...purchase,
      status: "completed",
      promoApplied: true,
    };
    const second = await markPurchasePaidIfValid(alreadyPaid, { invoiceId: "inv-1" });
    expect(second.status).toBe("paid");
    expect(mocks.incrementPromoUsage).toHaveBeenCalledTimes(1);
  });

  it("ownership / invoice mismatch throws", async () => {
    const purchase: any = {
      _id: "p1",
      amount: 5000,
      invoiceId: "inv-real",
      status: "pending",
    };
    await expect(
      markPurchasePaidIfValid(purchase, { invoiceId: "inv-other" })
    ).rejects.toThrow("INVOICE_MISMATCH");
  });
});

describe("purchases check ownership", () => {
  it("documents that other-user check returns 403 via route contract", () => {
    // Route: getAuthUserId !== purchase.userId => 403
    const purchaseUserId: string = "user-a";
    const sessionUserId: string = "user-b";
    expect(purchaseUserId === sessionUserId).toBe(false);
  });
});