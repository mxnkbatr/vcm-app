import { connectToDB } from "@/lib/db";
import Event from "@/lib/models/Events";
import LmsCourse from "@/lib/models/LmsCourse";
import { getHomePrograms } from "@/lib/home-data";
import { withCache } from "@/lib/server-cache";

function serialize<T extends { _id?: unknown }>(doc: T) {
  return {
    ...doc,
    _id: doc._id?.toString?.() ?? doc._id,
  };
}

export async function getTabPrograms() {
  return getHomePrograms();
}

export async function getTabEvents() {
  return withCache("tab:events:all", 45_000, async () => {
    await connectToDB();
    const events = await Event.find({})
      .select("_id title description date timeString location image category status featured attendees university link")
      .sort({ date: 1 })
      .lean();
    return events.map(serialize);
  });
}

export async function getEventById(id: string) {
  return withCache(`tab:event:${id}`, 60_000, async () => {
    await connectToDB();
    const event = await Event.findById(id).lean();
    if (!event) return null;
    const serialized = serialize(event as { _id: unknown });
    return {
      ...serialized,
      attendees: ((event as any).attendees || []).map((a: { toString: () => string }) =>
        a.toString()
      ),
    };
  });
}

export async function getTabCourses() {
  return withCache("tab:lms:courses", 120_000, async () => {
    await connectToDB();
    const courses = await LmsCourse.find({ status: "published" })
      .select("_id slug title description thumbnailUrl price currency isFree tags createdAt")
      .sort({ createdAt: -1 })
      .lean();
    return courses.map(serialize);
  });
}
