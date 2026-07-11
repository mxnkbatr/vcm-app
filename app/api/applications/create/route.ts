import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Application from "@/lib/models/Application";
import Program from "@/lib/models/Program";
import { getAuthUserId } from "@/lib/authHelpers";
import { invalidate } from "@/lib/server-cache";
import { createUserNotification } from "@/lib/notifications";
import {
  answersFromForm,
  sortQuestions,
  validateApplicationAnswers,
  type ApplicationAnswer,
} from "@/lib/programQuestions";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
    }

    const data = await req.json();
    const {
      programId,
      firstName,
      lastName,
      email,
      phone,
      age,
      level,
      message,
      generalId,
      answers = [],
    } = data;

    if (!programId || !firstName || !lastName || !email || !phone || !generalId) {
      return NextResponse.json(
        { error: "Үндсэн мэдээллийг бүрэн бөглөнө үү." },
        { status: 400 }
      );
    }

    const program = await Program.findOne({
      $or: [{ code: String(programId).toUpperCase() }, { slug: String(programId).toLowerCase() }],
      active: true,
    }).lean();

    if (!program) {
      return NextResponse.json({ error: "Хөтөлбөр олдсонгүй." }, { status: 404 });
    }

    const questions = sortQuestions(program.applicationQuestions || []);
    let normalizedAnswers: ApplicationAnswer[] = Array.isArray(answers) ? answers : [];

    if (questions.length > 0) {
      const formAnswers: Record<string, string> = {};
      for (const a of normalizedAnswers) {
        if (a?.questionId) formAnswers[a.questionId] = a.value;
      }
      const validationError = validateApplicationAnswers(questions, normalizedAnswers);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      normalizedAnswers = answersFromForm(questions, formAnswers);
    } else if (!message?.trim()) {
      return NextResponse.json(
        { error: "Урам зориг / зорилгоо бичнэ үү." },
        { status: 400 }
      );
    }

    const existing = await Application.findOne({
      userId,
      programId: program.code,
      status: { $nin: ["rejected"] },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Та энэ хөтөлбөрт өргөдөл аль хэдийн илгээсэн байна." },
        { status: 409 }
      );
    }

    const motivation =
      normalizedAnswers.find((a) => a.questionId === "motivation")?.value ||
      message ||
      "";

    const application = await Application.create({
      programId: program.code,
      firstName,
      lastName,
      email,
      phone,
      age: age || normalizedAnswers.find((a) => a.questionId === "age")?.value || "",
      level: level || normalizedAnswers.find((a) => a.questionId === "english_level")?.value || "",
      message: motivation,
      answers: normalizedAnswers,
      generalId,
      userId,
      status: "pending_general",
    });

    invalidate(`user-dash:${userId}`);

    const programName = program.name?.mn || program.code;
    void createUserNotification({
      userId,
      type: "application_submitted",
      title: "Өргөдөл хүлээн авлаа",
      body: `${programName} хөтөлбөрт өргөдөл илгээгдлээ.`,
      payload: { applicationId: application._id.toString(), programId: program.code },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: unknown) {
    console.error("Application creation error:", error);
    return NextResponse.json({ error: "Өргөдөл илгээхэд алдаа гарлаа." }, { status: 500 });
  }
}
