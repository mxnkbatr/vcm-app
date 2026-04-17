import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { getCloudinary } from "@/lib/cloudinaryServer";

export const POST = withAdminAuth(async (req: Request) => {
  const { folder = "vcm/admin", resourceType = "image" } = await req.json().catch(() => ({}));

  const timestamp = Math.floor(Date.now() / 1000);
  const cloudinary = getCloudinary();

  const paramsToSign: Record<string, any> = {
    timestamp,
    folder,
  };

  // Cloudinary signature only signs a subset of params; resource_type is not signed by default for upload.
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET || ""
  );

  return NextResponse.json({
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
    resourceType,
  });
});

