import { NextResponse } from "next/server";
import { qpayCreateInvoice } from "@/lib/qpay";

export async function POST(req: Request) {
  try {
    const { amount, description } = await req.json();
    
    // Call QPay API
    const qpayData = await qpayCreateInvoice({
      amount,
      description,
      senderInvoiceNo: `INV-${Date.now()}`,
      receiverCode: "USER",
    });

    return NextResponse.json(qpayData);
  } catch (error: any) {
    console.error("QPay Invoice Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
