import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";
import { withAdminAuth } from "@/lib/adminAuth";
import { programLabelMn, statusMeta } from "@/lib/applicationLabels";
import { createUserNotification } from "@/lib/notifications";

export const GET = withAdminAuth(async (req: Request) => {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const programId = searchParams.get("programId");

    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (programId && programId !== "all") filter.programId = programId.toUpperCase();

    const applications = await Application.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const enrichedApplications = await Promise.all(
      applications.map(async (app: any) => {
        let userProfile = null;
        if (app.userId) {
          const isMongoId = /^[0-9a-fA-F]{24}$/.test(app.userId);
          const query = isMongoId ? { _id: app.userId } : { clerkId: app.userId };
          const user = await User.findOne(query).select("profile fullName email phone").lean();
          userProfile = user || null;
        }

        const st = statusMeta(app.status);
        return {
          ...app,
          userProfile,
          programLabel: programLabelMn(app.programId),
          statusLabel: st.mn,
          statusColor: st.color,
        };
      })
    );

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

    if (status === "approved_volunteer" && application.userId) {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(application.userId);
      const query = isMongoId ? { _id: application.userId } : { clerkId: application.userId };

      await User.findOneAndUpdate(
        query,
        {
          $set: {
            role: "volunteer",
            country: programLabelMn(application.programId),
            program: application.programId,
            step: "Documents",
            fullName: `${application.firstName} ${application.lastName}`,
            email: application.email,
            "profile.phone": application.phone,
            "profile.languages": application.level ? `Level: ${application.level}` : "",
            "profile.motivation": application.message,
          },
        },
        { new: true }
      );
    }

    if (application.userId) {
      const st = statusMeta(status);
      void createUserNotification({
        userId: String(application.userId),
        type: "application_status",
        title: "Өргөдлийн төлөв шинэчлэгдлээ",
        body: `${programLabelMn(application.programId)} — ${st.mn}`,
        payload: { applicationId: application._id.toString(), status },
      });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
});
