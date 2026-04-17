import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import { z } from "zod";
import LmsPayment from "@/lib/models/LmsPayment";
import LmsEnrollment from "@/lib/models/LmsEnrollment";
import { qpayCheckInvoicePaid } from "@/lib/qpay";

const Schema = z.object({
  paymentId: z.string().min(1),
  invoiceId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const json = await req.json();
    const parsed = Schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
    }

    await connectToDB();
    const payment = await LmsPayment.findById(parsed.data.paymentId);
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (payment.userId.toString() !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { isPaid, raw } = await qpayCheckInvoicePaid(parsed.data.invoiceId);
    if (!isPaid) return NextResponse.json({ status: "pending", data: raw }, { status: 200 });

    payment.status = "completed";
    payment.invoiceId = parsed.data.invoiceId;
    await payment.save();

    const enrollment = await LmsEnrollment.findOneAndUpdate(
      { userId, courseId: payment.courseId },
      {
        $setOnInsert: { userId, courseId: payment.courseId, startedAt: new Date() },
        $set: { status: "active", access: "paid", paidOrderId: payment._id.toString() },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ status: "paid", enrollment }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to check payment" }, { status: 500 });
  }
}

