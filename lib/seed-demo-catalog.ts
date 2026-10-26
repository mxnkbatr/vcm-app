/**
 * Upsert demo shop + LMS courses so detail UI can be previewed.
 * Run: npx ts-node --compiler-options "{\"module\":\"commonjs\"}" lib/seed-demo-catalog.ts
 */
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import ShoppingItem from "./models/ShoppingItem";
import LmsCourse from "./models/LmsCourse";
import LmsModule from "./models/LmsModule";
import LmsLesson from "./models/LmsLesson";
import { invalidate } from "./server-cache";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const URI = process.env.MONGODB_URI;
if (!URI) throw new Error("MONGODB_URI missing");

const DEMO_SHOP = [
  {
    name: {
      mn: "VCM Hoodie — Navy",
      en: "VCM Hoodie — Navy",
      de: "VCM Hoodie — Navy",
    },
    description: {
      mn: "Зөөлөн даавуун худи. VCM логотой, өдөр тутмын өмсгөлд тохиромжтой. Detail дизайныг шалгахад зориулсан туршилтын бараа.",
      en: "Soft fleece hoodie with VCM mark. Demo product for shop detail UI.",
      de: "Weicher Hoodie mit VCM-Logo. Demo-Artikel.",
    },
    price: 89000,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop",
    category: "apparel",
    stock: 24,
    isActive: true,
  },
  {
    name: {
      mn: "Сайн дурын савх — Tote",
      en: "Volunteer Tote Bag",
      de: "Freiwilligen-Tasche",
    },
    description: {
      mn: "Хөвөн tote bag. Эвент, сургалт, өдөр тутмын хэрэглээнд. Жинхэнэ апп detail туршилт.",
      en: "Canvas tote for events and daily carry. Demo catalog item.",
      de: "Canvas-Tasche für Events. Demo-Artikel.",
    },
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1200&auto=format&fit=crop",
    category: "accessories",
    stock: 60,
    isActive: true,
  },
  {
    name: {
      mn: "VCM Cap — Cream",
      en: "VCM Cap — Cream",
      de: "VCM Cap — Cream",
    },
    description: {
      mn: "Хөнгөн малгай, VCM бренд. Нөөцтэй, захиалгад бэлэн.",
      en: "Lightweight branded cap. In stock for demo orders.",
      de: "Leichte Cap. Auf Lager.",
    },
    price: 35000,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop",
    category: "apparel",
    stock: 40,
    isActive: true,
  },
  {
    name: {
      mn: "Sticker Pack — VCM",
      en: "Sticker Pack — VCM",
      de: "Sticker-Pack — VCM",
    },
    description: {
      mn: "6 ширхэг sticker. Notebook, laptop, усны саванд наана.",
      en: "Set of 6 stickers for laptop and bottle.",
      de: "6 Sticker für Laptop und Flasche.",
    },
    price: 8000,
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1200&auto=format&fit=crop",
    category: "merch",
    stock: 120,
    isActive: true,
  },
];

const DEMO_COURSES = [
  {
    slug: "vcm-volunteer-basics",
    title: {
      mn: "Сайн дурын үндэс",
      en: "Volunteer Basics",
      de: "Freiwilligen-Basics",
    },
    description: {
      mn: "VCM-д нэгдэхэд хэрэгтэй үндсэн мэдлэг: аюулгүй байдал, харилцаа, эвентийн бэлтгэл. Үнэгүй туршилтын сургалт.",
      en: "Core skills for joining VCM: safety, communication, event prep. Free demo course.",
      de: "Grundlagen für VCM. Kostenloser Demo-Kurs.",
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1400&auto=format&fit=crop",
    price: 0,
    isFree: true,
    status: "published" as const,
    tags: ["volunteer", "demo"],
    modules: [
      {
        title: { mn: "Танилцуулга", en: "Introduction", de: "Einführung" },
        lessons: [
          {
            title: { mn: "VCM гэж юу вэ?", en: "What is VCM?", de: "Was ist VCM?" },
            description: {
              mn: "Байгууллагын товч танилцуулга.",
              en: "Short intro to the organization.",
              de: "Kurze Einführung.",
            },
            youtubeId: "jNQXAC9IVRw",
            durationSeconds: 120,
            isFreePreview: true,
          },
          {
            title: {
              mn: "Сайн дурынхан юу хийдэг вэ?",
              en: "What volunteers do",
              de: "Was Freiwillige tun",
            },
            description: {
              mn: "Эвент, хөтөлбөр дээрх үүрэг.",
              en: "Roles at events and programs.",
              de: "Rollen bei Events.",
            },
            youtubeId: "aqz-KE-bpKQ",
            durationSeconds: 180,
            isFreePreview: true,
          },
        ],
      },
      {
        title: { mn: "Практик", en: "Practice", de: "Praxis" },
        lessons: [
          {
            title: {
              mn: "Эвентийн өдөр — checklist",
              en: "Event day checklist",
              de: "Event-Checkliste",
            },
            description: {
              mn: "Ирэхээсээ өмнө юу бэлдэх вэ.",
              en: "What to prepare before you arrive.",
              de: "Was vorbereiten.",
            },
            youtubeId: "LXb3EKWsInQ",
            durationSeconds: 240,
            isFreePreview: true,
          },
        ],
      },
    ],
  },
  {
    slug: "vcm-leadership-lab",
    title: {
      mn: "Манлайллын лаборатори",
      en: "Leadership Lab",
      de: "Leadership Lab",
    },
    description: {
      mn: "Баг удирдах, feedback өгөх, эвент зохион байгуулах. Туршилтын төлбөртэй курс (preview хичээлтэй).",
      en: "Lead teams, give feedback, run events. Paid demo with free preview.",
      de: "Team führen. Demo-Kurs mit Preview.",
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1400&auto=format&fit=crop",
    price: 49000,
    isFree: false,
    status: "published" as const,
    tags: ["leadership", "demo"],
    modules: [
      {
        title: { mn: "Module 1", en: "Module 1", de: "Modul 1" },
        lessons: [
          {
            title: { mn: "Preview: Feedback", en: "Preview: Feedback", de: "Preview: Feedback" },
            description: {
              mn: "Үнэгүй preview хичээл.",
              en: "Free preview lesson.",
              de: "Kostenlose Vorschau.",
            },
            youtubeId: "9bZkp7q19f0",
            durationSeconds: 200,
            isFreePreview: true,
          },
          {
            title: {
              mn: "Багийн зорилго тохирох",
              en: "Aligning team goals",
              de: "Teamziele",
            },
            description: {
              mn: "Төлбөртэй хичээл (demo).",
              en: "Paid lesson (demo).",
              de: "Bezahlte Lektion (Demo).",
            },
            youtubeId: "kJQP7kiw5Fk",
            durationSeconds: 300,
            isFreePreview: false,
          },
        ],
      },
    ],
  },
  {
    slug: "vcm-public-speaking",
    title: {
      mn: "Илтгэх урлаг — анхан шат",
      en: "Public Speaking Basics",
      de: "Rhetorik Basics",
    },
    description: {
      mn: "Тайзны айдас багасгах, бүтэцтэй илтгэл бэлтгэх, үзэгчтэй холбогдох. VCM demo сургалт.",
      en: "Reduce stage fright, structure a talk, connect with the audience. VCM demo course.",
      de: "Lampenfieber reduzieren und Vorträge strukturieren. Demo-Kurs.",
    },
    thumbnailUrl:
      "https://images.unsplash.com/photo-1475721027785-fbcf2601a071?q=80&w=1400&auto=format&fit=crop",
    price: 29900,
    isFree: false,
    status: "published" as const,
    tags: ["speaking", "demo"],
    modules: [
      {
        title: { mn: "Эхлэл", en: "Getting started", de: "Start" },
        lessons: [
          {
            title: {
              mn: "Яагаад илтгэх чухал вэ?",
              en: "Why speaking matters",
              de: "Warum Rhetorik zählt",
            },
            description: {
              mn: "Үнэгүй preview.",
              en: "Free preview.",
              de: "Kostenlose Vorschau.",
            },
            youtubeId: "Unzc731iCUY",
            durationSeconds: 360,
            isFreePreview: true,
          },
          {
            title: {
              mn: "3 минутын бүтэц",
              en: "A 3-minute structure",
              de: "3-Minuten-Struktur",
            },
            description: {
              mn: "Төлбөртэй хичээл (demo).",
              en: "Paid lesson (demo).",
              de: "Bezahlte Lektion (Demo).",
            },
            youtubeId: "iCvmsMzlF7o",
            durationSeconds: 420,
            isFreePreview: false,
          },
        ],
      },
    ],
  },
];

async function upsertShop() {
  console.log("Shop demo items…");
  for (const item of DEMO_SHOP) {
    await ShoppingItem.findOneAndUpdate(
      { "name.en": item.name.en },
      { $set: item },
      { upsert: true, new: true }
    );
    console.log("  ✓", item.name.mn);
  }
}

async function upsertCourses() {
  console.log("LMS demo courses…");
  for (const courseDef of DEMO_COURSES) {
    const { modules, ...courseFields } = courseDef;
    const course = await LmsCourse.findOneAndUpdate(
      { slug: courseDef.slug },
      { $set: courseFields },
      { upsert: true, new: true }
    );
    console.log("  ✓ course", course.slug);

    // Replace modules/lessons for a clean demo tree
    const oldModules = await LmsModule.find({ courseId: course._id }).select("_id");
    const oldIds = oldModules.map((m) => m._id);
    if (oldIds.length) {
      await LmsLesson.deleteMany({ courseId: course._id });
      await LmsModule.deleteMany({ courseId: course._id });
    }

    let moduleOrder = 0;
    for (const mod of modules) {
      const moduleDoc = await LmsModule.create({
        courseId: course._id,
        title: mod.title,
        order: moduleOrder++,
      });
      let lessonOrder = 0;
      for (const les of mod.lessons) {
        await LmsLesson.create({
          courseId: course._id,
          moduleId: moduleDoc._id,
          title: les.title,
          description: les.description,
          order: lessonOrder++,
          videoProvider: "youtube",
          videoAssetId: les.youtubeId,
          durationSeconds: les.durationSeconds,
          isFreePreview: les.isFreePreview,
          status: "published",
        });
      }
      console.log("    ✓ module", mod.title.mn, `(${mod.lessons.length} lessons)`);
    }
  }
}

async function main() {
  console.log("Connecting…");
  await mongoose.connect(URI!);
  await upsertShop();
  await upsertCourses();
  invalidate("shopping:all");
  invalidate("home:shop");
  invalidate("lms:courses");
  invalidate("lms:courses:v2");
  console.log("Done. Open /shop and /lessons");
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch {
    /* noop */
  }
  process.exit(1);
});
