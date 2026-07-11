import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Application from "@/lib/models/Application";
import User from "@/lib/models/User";
import { getAuthUser } from "@/lib/authHelpers";

function isGeneral(role: string) {
  return role === 'general_and' || role === 'general_edu' || role === 'general_vclub';
}

export async function GET() {
  try {
    await connectToDB();
    const user = await getAuthUser();
    
    if (!user || (!isGeneral(user.role) && user.role !== 'admin')) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await Application.find({ 
      generalId: user._id, 
      status: 'pending_general' 
    }).sort({ createdAt: -1 }).lean();
    
    const enrichedApplications = await Promise.all(applications.map(async (app: any) => {
      if (app.userId) {
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(app.userId);
        const query = isMongoId ? { _id: app.userId } : { clerkId: app.userId };
        const applicantUser = await User.findOne(query).select('profile').lean();
        return { ...app, userProfile: applicantUser?.profile || null };
      }
      return { ...app, userProfile: null };
    }));

    return NextResponse.json(enrichedApplications);
  } catch (error) {
    console.error("Fetch generals applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDB();
    const user = await getAuthUser();
    
    if (!user || (!isGeneral(user.role) && user.role !== 'admin')) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, action } = body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.generalId !== user._id && user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized to modify this application" }, { status: 403 });
    }

    if (action === 'accept') {
      application.status = 'pending_admin';
    } else if (action === 'reject') {
      application.status = 'rejected';
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await application.save();
    return NextResponse.json(application);
  } catch (error) {
    console.error("Update general application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
