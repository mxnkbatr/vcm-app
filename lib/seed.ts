

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Event from "./models/Events";
import User from "./models/User";
import Opportunity from "./models/Opportunity";
import Club from "./models/Club";
import News from "./models/News";

// Load environment variables from .env.local
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// --- OCEAN & SKY PALETTE ---
const BRAND = {
  sky: "#00aeef",
  ocean: "#005691",
  deep: "#001829",
  foam: "#e0f2fe",
  white: "#ffffff",
  gold: "#fbbf24", // Added for fundraisers
  teal: "#2dd4bf", // Added for campaigns
  rose: "#f43f5e"  // Added for workshops
};

const seedData = async () => {
  try {
    // 1. Connect to Database
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // 2. Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      Event.deleteMany({}),
      User.deleteMany({}),
      Opportunity.deleteMany({}),
      Club.deleteMany({}),
      News.deleteMany({})
    ]);

    // 3. Seed Users
    console.log("Seeding users...");
    const usersToInsert = [
      // MNUMS Users
      ...Array(5).fill(null).map((_, i) => ({
        clerkId: `user_mnums_${i}`,
        email: `mnums${i}@test.com`,
        studentId: `MNUMS${202400 + i}`,
        fullName: `MNUMS Student ${i}`,
        university: "MNUMS",
        role: "member"
      })),
      // NUM Users
      ...Array(8).fill(null).map((_, i) => ({
        clerkId: `user_num_${i}`,
        email: `num${i}@test.com`,
        studentId: `NUM${202400 + i}`,
        fullName: `NUM Student ${i}`,
        university: "NUM",
        role: "member"
      })),
      // MUST Users
      ...Array(3).fill(null).map((_, i) => ({
        clerkId: `user_must_${i}`,
        email: `must${i}@test.com`,
        studentId: `MUST${202400 + i}`,
        fullName: `MUST Student ${i}`,
        university: "MUST",
        role: "member"
      })),
      // UFE Users
      ...Array(4).fill(null).map((_, i) => ({
        clerkId: `user_ufe_${i}`,
        email: `ufe${i}@test.com`,
        studentId: `UFE${202400 + i}`,
        fullName: `UFE Student ${i}`,
        university: "UFE",
        role: "member"
      }))
    ];
    await User.insertMany(usersToInsert);

    // 4. Seed Events
    console.log("Seeding events...");
    const eventsToInsert = [
      {
        title: { 
          en: "Youth Leadership Summit 2025", 
          mn: "Залуучуудын Манлайллын Чуулган 2025" 
        },
        description: {
          en: "Empowering the next generation of changemakers. Join 500+ students for a weekend of leadership workshops and networking.",
          mn: "Ирээдүйн өөрчлөлтийг бүтээгчдийг чадавхжуулах. 500+ оюутан залуус цугларч манлайллын ур чадварт суралцана."
        },
        date: new Date("2025-10-24T09:00:00.000Z"), 
        timeString: "09:00 - 18:00",
        location: { 
          en: "Shangri-La, Ulaanbaatar", 
          mn: "Шангри-Ла, Улаанбаатар" 
        },
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2070&auto=format&fit=crop",
        category: "campaign",
        status: "upcoming",
        featured: true,
        university: "NUM",
        color: BRAND.sky 
      },
      {
        title: { 
          en: "Book Donation Drive", 
          mn: "Номын Хандивын Аян" 
        },
        description: {
          en: "Help us collect 1,000 books for rural schools in Khovd province. Bring your old textbooks and fiction books.",
          mn: "Ховд аймгийн хөдөөгийн сургуулиудад 1,000 ном цуглуулах аянд нэгдээрэй."
        },
        date: new Date("2025-11-05T10:00:00.000Z"),
        timeString: "All Day",
        location: { 
          en: "MNUMS Campus", 
          mn: "АШУҮИС Кампус" 
        },
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
        category: "fundraiser",
        status: "upcoming",
        featured: false,
        university: "MNUMS",
        color: BRAND.white
      },
      {
        title: { 
          en: "Mental Health Workshop", 
          mn: "Сэтгэл Зүйн Эрүүл Мэнд" 
        },
        description: {
          en: "A safe space to discuss student burnout and stress management techniques with professional psychologists.",
          mn: "Оюутны сэтгэл зүйн эрүүл мэнд, стресс менежментийн талаар мэргэжлийн сэтгэл зүйчтэй ярилцана."
        },
        date: new Date("2025-11-12T14:00:00.000Z"),
        timeString: "14:00 - 16:00",
        location: { 
          en: "Library Hall 404", 
          mn: "Номын Сан 404" 
        },
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop",
        category: "workshop",
        status: "upcoming",
        featured: false,
        university: "MUST",
        color: BRAND.ocean
      },
      {
        title: { 
          en: "Clean Air For Kids", 
          mn: "Цэвэр Агаар - Хүүхдэд" 
        },
        description: {
          en: "Distributing masks and air filters to kindergartens in the ger districts to protect children from pollution.",
          mn: "Гэр хорооллын цэцэрлэгүүдэд маск, агаар шүүгч тарааж бяцхан дүүсээ хамгаалах аян."
        },
        date: new Date("2025-12-01T10:00:00.000Z"),
        timeString: "10:00 - 13:00",
        location: { 
          en: "Sukhbaatar District", 
          mn: "Сүхбаатар Дүүрэг" 
        },
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2070&auto=format&fit=crop",
        category: "campaign",
        status: "upcoming",
        featured: true,
        university: "UFE",
        color: BRAND.sky
      },
      {
        title: { 
          en: "Medical Students Outreach", 
          mn: "Анагаахын Оюутнуудын Орон Нутгийн Ажил" 
        },
        description: {
          en: "MNUMS students visiting rural areas to provide basic health checkups and hygiene education.",
          mn: "АШУҮИС-ийн оюутнууд орон нутагт очиж эрүүл мэндийн анхан шатны зөвлөгөө, ариун цэврийн боловсрол олгох ажил."
        },
        date: new Date("2025-08-15T09:00:00.000Z"),
        timeString: "09:00 - 17:00",
        location: { 
          en: "Arkhangai Province", 
          mn: "Архангай Аймаг" 
        },
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop",
        category: "campaign",
        status: "upcoming",
        featured: false,
        university: "MNUMS",
        color: BRAND.ocean
      },
      {
        title: { 
          en: "First Aid Training", 
          mn: "Анхны Тусламжийн Сургалт" 
        },
        description: {
          en: "Basic life support and first aid training for university students.",
          mn: "Их дээд сургуулийн оюутнуудад зориулсан анхны тусламжийн сургалт."
        },
        date: new Date("2025-09-10T14:00:00.000Z"),
        timeString: "14:00 - 16:00",
        location: { 
          en: "MNUMS Lecture Hall 1", 
          mn: "АШУҮИС-ийн 1-р лекцийн заал" 
        },
        image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=2070&auto=format&fit=crop",
        category: "workshop",
        status: "upcoming",
        featured: false,
        university: "MNUMS",
        color: BRAND.rose
      },
      // PAST EVENT
      {
        title: { 
          en: "Charity Run 2024", 
          mn: "Хандивын Гүйлт 2024" 
        },
        description: {
          en: "Annual charity run to raise awareness for children's rights.",
          mn: "Хүүхдийн эрхийн төлөөх жил бүрийн хандивын гүйлт."
        },
        date: new Date("2024-05-15T09:00:00.000Z"),
        timeString: "09:00 - 12:00",
        location: { 
          en: "National Park", 
          mn: "Үндэсний Цэцэрлэгт Хүрээлэн" 
        },
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
        category: "fundraiser",
        status: "past",
        featured: false,
        university: "MNUMS",
        color: BRAND.gold
      }
    ];
    await Event.insertMany(eventsToInsert);

    // 5. Seed Opportunities
    console.log("Seeding opportunities...");
    const opportunitiesToInsert = [
      {
        type: "scholarship",
        title: { en: "Global Health Scholarship", mn: "Дэлхийн Эрүүл Мэндийн Тэтгэлэг" },
        provider: { en: "UNICEF Mongolia", mn: "ЮНИСЕФ Монгол" },
        location: { en: "Ulaanbaatar", mn: "Улаанбаатар" },
        deadline: "2025-03-30",
        postedDate: "2025-01-01",
        description: { 
          en: "Supporting students committed to improving public health in rural areas.", 
          mn: "Орон нутгийн нийгмийн эрүүл мэндийг сайжруулахад хувь нэмэр оруулах хүсэлтэй оюутнуудад зориулав." 
        },
        requirements: {
          en: ["GPA 3.5+", "Essay on rural health", "Reference letter"],
          mn: ["Голч дүн 3.5+", "Хөдөөгийн эрүүл мэндийн талаар эссэ", "Тодорхойлолт захидал"]
        },
        tags: ["Health", "Public", "Grant"],
        link: "https://www.unicef.org/mongolia",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
      },
      {
        type: "internship",
        title: { en: "Social Media Marketing Intern", mn: "Сошиал Медиа Маркетингийн Дадлагажигч" },
        provider: { en: "Save the Children", mn: "Хүүхдийг Ивээх Сан" },
        location: { en: "Remote / Ulaanbaatar", mn: "Зайнаас / Улаанбаатар" },
        deadline: "2025-02-15",
        postedDate: "2025-01-05",
        description: { 
          en: "Gain experience in non-profit communication and advocacy.", 
          mn: "Ашгийн бус байгууллагын харилцаа холбоо, нөлөөллийн ажилд туршлага хуримтлуулах боломж." 
        },
        requirements: {
          en: ["Strong writing skills", "Basic graphic design", "English proficiency"],
          mn: ["Бичгийн ур чадвар сайн", "График дизайны анхан шатны мэдлэгтэй", "Англи хэлний мэдлэгтэй"]
        },
        tags: ["Marketing", "Social", "NGO"],
        link: "https://mongolia.savethechildren.net/",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop"
      },
      {
        type: "volunteer",
        title: { en: "Youth Health Ambassador", mn: "Залуучуудын Эрүүл Мэндийн Элч" },
        provider: { en: "MNUMS UNICEF Club", mn: "АШУҮИС ЮНИСЕФ Клуб" },
        location: { en: "Universities", mn: "Их дээд сургуулиуд" },
        deadline: "2025-01-20",
        postedDate: "2024-12-25",
        description: { 
          en: "Promote healthy lifestyle choices among university peers.", 
          mn: "Их сургуулийн оюутнуудын дунд эрүүл амьдралын хэв маягийг сурталчлах." 
        },
        requirements: {
          en: ["Active student", "Passion for health", "Communication skills"],
          mn: ["Идэвхтэй оюутан", "Эрүүл мэндийн төлөөх хүсэл эрмэлзэл", "Харилцааны ур чадвар"]
        },
        tags: ["Youth", "Health", "Leadership"],
        link: "#",
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop"
      }
    ];
    await Opportunity.insertMany(opportunitiesToInsert);

    // 6. Seed Clubs
    console.log("Seeding clubs...");
    const clubsToInsert = [
      {
        clubId: "MNUMS",
        name: { en: "Mongolian National University of Medical Sciences", mn: "Анагаахын Шинжлэх Ухааны Үндэсний Их Сургууль (АШУҮИС)" },
        description: {
          en: "The leading medical university in Mongolia, fostering the next generation of healthcare professionals.",
          mn: "Монгол улсын анагаах ухааны тэргүүлэх их сургууль, ирээдүйн эрүүл мэндийн мэргэжилтнүүдийг бэлтгэдэг."
        },
        website: "https://mnums.edu.mn/",
        email: "info@mnums.edu.mn",
        image: "https://images.unsplash.com/photo-1626125345510-470341582301?q=80&w=2070&auto=format&fit=crop"
      },
      {
        clubId: "NUM",
        name: { en: "National University of Mongolia", mn: "Монгол Улсын Их Сургууль (МУИС)" },
        description: {
          en: "The oldest and most prestigious university in Mongolia, known for its research and academic excellence.",
          mn: "Судалгаа, эрдэм шинжилгээний ажлаараа алдартай, Монголын хамгийн ууган, нэр хүндтэй их сургууль."
        },
        website: "https://www.num.edu.mn/",
        email: "contact@num.edu.mn",
        image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1978&auto=format&fit=crop"
      },
      {
        clubId: "MUST",
        name: { en: "Mongolian University of Science and Technology", mn: "Шинжлэх Ухаан, Технологийн Их Сургууль (ШУТИС)" },
        description: {
          en: "A hub for engineering and technological innovation in Mongolia.",
          mn: "Инженерчлэл, технологийн инновацийн төв."
        },
        website: "https://www.must.edu.mn/",
        email: "info@must.edu.mn",
        image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=2070&auto=format&fit=crop"
      },
      {
        clubId: "UFE",
        name: { en: "University of Finance and Economics", mn: "Санхүү, Эдийн Засгийн Их Сургууль (СЭЗИС)" },
        description: {
          en: "Specializing in economics, business, and finance education.",
          mn: "Эдийн засаг, бизнес, санхүүгийн боловсролоор мэргэшсэн."
        },
        website: "https://www.ufe.edu.mn/",
        email: "info@ufe.edu.mn",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2026&auto=format&fit=crop"
      }
    ];
    await Club.insertMany(clubsToInsert);

    // 7. Seed News
    console.log("Seeding news...");
    const newsToInsert = [
      {
        title: { en: "UNICEF Launches New Youth Strategy", mn: "ЮНИСЕФ Залуучуудын Шинэ Стратегиа Танилцууллаа", de: "UNICEF startet neue Jugendstrategie" },
        summary: { 
          en: "A new framework to empower young people across Mongolia.", 
          mn: "Монгол даяар залуучуудыг чадавхжуулах шинэ тогтолцоо.",
          de: "Ein neuer Rahmen zur Stärkung junger Menschen in der ganzen Mongolei."
        },
        content: { 
          en: "Today, UNICEF Mongolia unveiled its comprehensive 5-year strategy focused on adolescent health, climate action, and digital skills. The launch event was attended by government officials and youth representatives.", 
          mn: "Өнөөдөр ЮНИСЕФ Монгол өсвөр үеийнхний эрүүл мэнд, уур амьсгалын өөрчлөлт, дижитал ур чадварт чиглэсэн 5 жилийн цогц стратегиа танилцууллаа. Нээлтийн үйл ажиллагаанд төрийн албан хаагчид болон залуучуудын төлөөлөл оролцов.",
          de: "Heute stellte UNICEF Mongolei seine umfassende 5-Jahres-Strategie vor, die sich auf die Gesundheit von Jugendlichen, Klimaschutz und digitale Fähigkeiten konzentriert. An der Auftaktveranstaltung nahmen Regierungsvertreter und Jugendvertreter teil."
        },
        author: "Admin",
        image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=2070&auto=format&fit=crop",
        tags: ["Strategy", "Youth", "UNICEF"],
        featured: true
      },
      {
        title: { en: "Student Club wins Innovation Award", mn: "Оюутны Клуб Инновацийн Шагнал Хүртлээ", de: "Studentenclub gewinnt Innovationspreis" },
        summary: { 
          en: "MUST UNICEF Club recognized for their air pollution project.", 
          mn: "ШУТИС-ийн ЮНИСЕФ Клуб агаарын бохирдлын төслөөрөө шалгарлаа.",
          de: "MUST UNICEF Club für ihr Luftverschmutzungsprojekt ausgezeichnet."
        },
        content: { 
          en: "The student-led team developed a low-cost air filtration system for ger district kindergartens. They were awarded the 'Green Innovation' prize at the National Youth Tech Fair.", 
          mn: "Оюутнуудын баг гэр хорооллын цэцэрлэгүүдэд зориулсан хямд өртөгтэй агаар шүүгч системийг хөгжүүлжээ. Тэд Үндэсний Залуучуудын Технологийн Үзэсгэлэнгээс 'Ногоон Инноваци' шагнал хүртлээ.",
          de: "Das von Studenten geleitete Team entwickelte ein kostengünstiges Luftfiltersystem für Kindergärten im Ger-Bezirk. Sie wurden auf der National Youth Tech Fair mit dem Preis 'Grüne Innovation' ausgezeichnet."
        },
        author: "Admin",
        image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1974&auto=format&fit=crop",
        tags: ["Innovation", "Awards", "Environment"],
        featured: false
      },
      {
        title: { en: "Volunteer Highlights: October", mn: "Сайн Дурынхны Амжилт: 10-р сар", de: "Freiwilligen-Highlights: Oktober" },
        summary: { 
          en: "Celebrating the contributions of our dedicated members.", 
          mn: "Манай идэвхтэй гишүүдийн хувь нэмрийг тэмдэглэж байна.",
          de: "Wir feiern die Beiträge unserer engagierten Mitglieder."
        },
        content: { 
          en: "This month, over 500 volunteers participated in our 'Clean Streets' campaign. We collected 2 tons of recyclable waste and planted 50 trees in the city center.", 
          mn: "Энэ сард манай 'Цэвэр Гудамж' аянд 500 гаруй сайн дурынхан оролцлоо. Бид 2 тонн дахин боловсруулах хог хаягдал цуглуулж, хотын төвд 50 мод тарьсан.",
          de: "In diesem Monat nahmen über 500 Freiwillige an unserer Kampagne 'Saubere Straßen' teil. Wir sammelten 2 Tonnen recycelbaren Abfall und pflanzten 50 Bäume im Stadtzentrum."
        },
        author: "Admin",
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop",
        tags: ["Community", "Volunteers"],
        featured: false
      }
    ];
    await News.insertMany(newsToInsert);

    console.log("✅ Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    // 5. Close Connection
    await mongoose.connection.close();
    console.log("Connection closed.");
    process.exit(0);
  }
};

seedData();