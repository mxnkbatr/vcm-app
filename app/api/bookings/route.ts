import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { sendBookingRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();
    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { service, date, time, name, email, phone, note } = body;

    if (!service || !date || !time || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDB();

    // Create a unique room name for LiveKit
    // Format: booking_{userId}_{timestamp}
    const livekitRoom = `booking_${user.id}_${Date.now()}`;

    const newBooking = await Booking.create({
      userId: user.id,
      serviceId: service.id,
      serviceTitle: service.title,
      date: date.full,
      time,
      name,
      email,
      phone,
      note,
      status: 'pending', // Changed to pending - requires admin approval
      livekitRoom
    });

    // Send notification email to admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendBookingRequestEmail(adminEmail, {
        serviceTitle: service.title,
        date: date.full,
        time,
        name,
        email,
        phone,
        note
      });
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}