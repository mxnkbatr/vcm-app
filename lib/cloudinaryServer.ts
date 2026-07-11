import { v2 as cloudinary } from "cloudinary";

let configured = false;

function parseCloudinaryUrl(url: string) {
  const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) return null;
  return {
    api_key: match[1],
    api_secret: match[2],
    cloud_name: match[3],
  };
}

export function getCloudinary() {
  if (!configured) {
    const url = process.env.CLOUDINARY_URL;
    const fromUrl = url ? parseCloudinaryUrl(url) : null;

    if (fromUrl && fromUrl.api_secret && fromUrl.api_secret !== "REPLACE_WITH_API_SECRET") {
      cloudinary.config({
        cloud_name: fromUrl.cloud_name,
        api_key: fromUrl.api_key,
        api_secret: fromUrl.api_secret,
        secure: true,
      });
    } else {
      cloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
    configured = true;
  }
  return cloudinary;
}

export function getCloudinaryPublicConfig() {
  const url = process.env.CLOUDINARY_URL;
  const fromUrl = url ? parseCloudinaryUrl(url) : null;
  return {
    cloudName:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      fromUrl?.cloud_name ||
      "",
    apiKey: process.env.CLOUDINARY_API_KEY || fromUrl?.api_key || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || fromUrl?.api_secret || "",
  };
}
