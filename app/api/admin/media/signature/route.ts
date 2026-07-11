import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/adminAuth";
import { getCloudinary, getCloudinaryPublicConfig } from "@/lib/cloudinaryServer";

export const POST = withAdminAuth(async (req: Request) => {
  const { folder = "vcm/admin", resourceType = "image" } = await req.json().catch(() => ({}));

  const timestamp = Math.floor(Date.now() / 1000);
  const cloudinary = getCloudinary();
  const { cloudName, apiKey, apiSecret } = getCloudinaryPublicConfig();

  const paramsToSign: Record<string, any> = {
    timestamp,
    folder,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    resourceType,
  });
});

