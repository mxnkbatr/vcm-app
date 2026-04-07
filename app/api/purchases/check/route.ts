import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Purchase from "@/lib/models/Purchase";

export async function POST(req: Request) {
  try {
    const { purchaseId, invoiceId } = await req.json();

    if (!purchaseId || !invoiceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. QPay Authentication
    const basicAuth = Buffer.from(`${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`).toString('base64');
    const authRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/auth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type": "application/json"
      }
    });

    if (!authRes.ok) {
      throw new Error("Failed to authenticate with QPay");
    }

    const authData = await authRes.json();
    const accessToken = authData.access_token;

    // 2. QPay Payment Check
    // QPay payment check accepts object_type and object_id
    const checkRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/payment/check`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        object_type: "INVOICE",
        object_id: invoiceId
      })
    });

    if (!checkRes.ok) {
      throw new Error("Failed to check QPay payment status");
    }

    const checkData = await checkRes.json();
    
    // checkData.count > 0 and checkData.rows contains the payment
    const isPaid = checkData.count > 0 && checkData.rows?.some((row: any) => row.payment_status === "PAID" || row.payment_status === "SUCCESS");

    // Some versions of QPay return paid_amount
    const totalPaid = checkData.paid_amount || 0;
    
    if (isPaid || totalPaid > 0) {
      await connectToDB();
      const updatedPurchase = await Purchase.findByIdAndUpdate(
        purchaseId,
        { status: "completed" },
        { new: true }
      );
      return NextResponse.json({ status: "paid", purchase: updatedPurchase });
    }

    return NextResponse.json({ status: "pending", data: checkData });
  } catch (error: any) {
    console.error("Error checking payment:", error);
    return NextResponse.json({ error: error.message || "Failed to check payment" }, { status: 500 });
  }
}
