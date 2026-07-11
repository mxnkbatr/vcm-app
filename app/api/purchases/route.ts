import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Purchase from "@/lib/models/Purchase";
import PromoCode from "@/lib/models/PromoCode";
import ShoppingItem from "@/lib/models/ShoppingItem";
import { validatePromoForShop, incrementPromoUsage } from "@/lib/promo";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const data = await req.json();

    const { itemId, phoneNumber, amount, promoCode } = data;

    if (!itemId || !phoneNumber || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let finalAmount = Number(amount);
    let originalAmount = finalAmount;
    let discountAmount = 0;
    let promoId: string | undefined;

    if (promoCode) {
      const promo = await PromoCode.findOne({ code: String(promoCode).trim().toUpperCase() }).lean();
      const item = await ShoppingItem.findById(itemId).lean();
      if (!promo || !item) {
        return NextResponse.json({ error: "Промо код буруу байна." }, { status: 400 });
      }
      const result = validatePromoForShop(promo as any, [
        { id: String(item._id), price: item.price, quantity: 1 },
      ]);
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      originalAmount = item.price;
      discountAmount = result.discountAmount;
      finalAmount = result.finalAmount;
      promoId = result.promoId;
    }

    const newPurchase = new Purchase({
      itemId,
      phoneNumber,
      amount: finalAmount,
      originalAmount,
      discountAmount,
      promoCode: promoCode ? String(promoCode).trim().toUpperCase() : undefined,
      promoId,
      status: "pending",
      paymentMethod: "QPay",
    });

    await newPurchase.save();

    // 2. QPay Authentication
    const basicAuth = Buffer.from(`${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`).toString('base64');
    const authRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/auth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json"
      }
    });

    if (!authRes.ok) {
      console.error("QPay auth failed:", await authRes.text());
      throw new Error("Failed to authenticate with QPay");
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 3. QPay Create Invoice
    const invoiceRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/invoice`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: newPurchase._id.toString(),
        invoice_receiver_code: phoneNumber,
        invoice_description: "VCM Shop Purchase",
        amount: finalAmount
      })
    });

    if (!invoiceRes.ok) {
      console.error("QPay invoice failed:", await invoiceRes.text());
      throw new Error("Failed to create QPay invoice");
    }

    const invoiceData = await invoiceRes.json();

    if (promoId) {
      await incrementPromoUsage(promoId);
    }

    return NextResponse.json({
      message: "Invoice created successfully", 
      purchase: newPurchase,
      qpay: invoiceData
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error processing purchase:", error);
    return NextResponse.json({ error: error.message || "Failed to process purchase" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    
    // Fetch purchases, populate itemId to get product details
    const purchases = await Purchase.find()
      .populate("itemId", "name price image category")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(purchases);
  } catch (error: any) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch purchases" }, { status: 500 });
  }
}
