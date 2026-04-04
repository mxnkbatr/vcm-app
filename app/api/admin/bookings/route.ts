import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import User from "@/lib/models/User";
import { sendBookingApprovedEmail, sendBookingRejectedEmail } from "@/lib/email";
import { withAdminAuth } from "@/lib/adminAuth";

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    const { bookingId, status } = await req.json();

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['confirmed', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDB();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking status
    booking.status = status;
    await booking.save();

    // Send email notification to user
    if (status === 'confirmed') {
      await sendBookingApprovedEmail(booking.email, {
        serviceTitle: booking.serviceTitle,
        date: booking.date,
        time: booking.time,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        note: booking.note
      });
    } else if (status === 'rejected') {
      await sendBookingRejectedEmail(booking.email, {
        serviceTitle: booking.serviceTitle,
        date: booking.date,
        time: booking.time,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        note: booking.note
      });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
});