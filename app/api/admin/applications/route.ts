import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";
import { withAdminAuth } from "@/lib/adminAuth";

const PROGRAM_MAP: Record<string, string> = {
  "DE": "Germany",
  "BE": "Belgium",
  "AT": "Austria",
  "CH": "Switzerland"
};

export const GET = withAdminAuth(async () => {
  try {
    await connectToDB();
    
    // We want to fetch applications strictly awaiting Final Admin Approval
    const applications = await Application.find({ status: 'pending_admin' }).sort({ createdAt: -1 }).lean();
    
    const enrichedApplications = await Promise.all(applications.map(async (app: any) => {
      if (app.userId) {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(app.userId);
        const query = isMongoId ? { _id: app.userId } : { clerkId: app.userId };
        const user = await User.findOne(query).select('profile').lean();
        return { ...app, userProfile: user?.profile || null };
      }
      return { ...app, userProfile: null };
    }));

    return NextResponse.json(enrichedApplications);
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
});

export const PUT = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();
    const body = await req.json();
    const { applicationId, status } = body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    application.status = status;
    await application.save();

    // If approved and user exists, upgrade user to volunteer and sync latest info
    if (status === 'approved_volunteer' && application.userId) {
       const country = PROGRAM_MAP[application.programId] || "Volunteer Program";
       const isMongoId = /^[0-9a-fA-F]{24}$/.test(application.userId);
       const query = isMongoId ? { _id: application.userId } : { clerkId: application.userId };
       
       await User.findOneAndUpdate(
         query,
         { 
            $set: {
                role: 'volunteer', 
                country: country,
                step: "Documents",
                fullName: `${application.firstName} ${application.lastName}`,
                email: application.email,
                "profile.phone": application.phone,
                "profile.languages": `Level: ${application.level}`,
                "profile.motivation": application.message
            }
         },
         { new: true, upsert: true }
       );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
});