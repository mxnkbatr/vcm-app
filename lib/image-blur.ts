/** Tiny neutral blur placeholder for next/image (avoids white flash). */
export const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10"><rect width="100%" height="100%" fill="#E5E5EA"/></svg>`
  );
