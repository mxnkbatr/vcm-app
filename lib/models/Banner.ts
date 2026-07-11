import mongoose, { Schema, model, models } from "mongoose";

const BannerSchema = new Schema(
  {
    title: {
      mn: { type: String, required: true },
      en: { type: String, default: "" },
    },
    subtitle: {
      mn: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    /** Auto-rotate interval in seconds (0 = use global default) */
    intervalSec: { type: Number, default: 8 },
  },
  { timestamps: true }
);

const Banner = models.Banner || model("Banner", BannerSchema);
export default Banner;
