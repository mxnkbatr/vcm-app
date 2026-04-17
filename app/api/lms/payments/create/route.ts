import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { getAuthUserId } from "@/lib/authHelpers";
import LmsCourse from "@/lib/models/LmsCourse";
import LmsPayment from "@/lib/models/LmsPayment";
import { z } from "zod";
import { qpayCreateInvoice } from "@/lib/qpay";

const Schema = z.object({
  courseId: z.string().min(1),
  phoneNumber: z.string().min(6),
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
    const course = await LmsCourse.findById(parsed.data.courseId).lean();
    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const amount = Number((course as any).price || 0);
    if (amount <= 0) {
      return NextResponse.json({ error: "Course is free" }, { status: 400 });
    }

    const payment = await LmsPayment.create({
      userId,
      courseId: (course as any)._id,
      amount,
      currency: (course as any).currency || "MNT",
      phoneNumber: parsed.data.phoneNumber,
      invoiceReceiverCode: parsed.data.phoneNumber,
      status: "pending",
      provider: "QPay",
    });

    const invoiceData = await qpayCreateInvoice({
      senderInvoiceNo: payment._id.toString(),
      receiverCode: parsed.data.phoneNumber,
      description: `VCM Course Enrollment: ${(course as any).slug}`,
      amount,
    });

    const invoiceId =
      invoiceData.invoice_id ||
      invoiceData.id ||
      invoiceData.invoiceId ||
      invoiceData.qpay_invoice_id ||
      "";

    if (invoiceId) {
      await LmsPayment.findByIdAndUpdate(payment._id, { $set: { invoiceId } });
    }

    return NextResponse.json(
      {
        paymentId: payment._id.toString(),
        invoiceId,
        qpay: invoiceData,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to create payment" }, { status: 500 });
  }
}

