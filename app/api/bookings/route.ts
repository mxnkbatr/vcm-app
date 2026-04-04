import { NextResponse } from "next/server";
import { getAuthUserId, getAuthUser } from "@/lib/authHelpers";
import { connectToDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { sendBookingRequestEmail } from "@/lib/email";

export async function GET() {
  try {
    const userId = await getAuthUserId();
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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { service, date, time, name, email, phone, note } = body;

    if (!service || !date || !time || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDB();

    const newBooking = new Booking({
      userId: user._id.toString(),
      serviceId: service.id,
      serviceTitle: service.title,
      date: date.full,
      time,
      name,
      email,
      phone,
      note,
      status: 'pending'
    });

    // Use the persistent database ID for the LiveKit room
    newBooking.livekitRoom = `room_${newBooking._id}`;
    await newBooking.save();

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