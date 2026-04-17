"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Lock, Sparkles, TrendingUp } from "lucide-react";
import Skeleton from "@/app/components/Skeleton";
import { IOSAlert, IOSSheet } from "@/app/components/iOSAlert";

type LmsI18n = { en: string; mn: string; de?: string };
type Course = {
  _id: string;
  slug: string;
  title: LmsI18n;
  description: LmsI18n;
  thumbnailUrl?: string;
  price?: number;
  currency?: string;
  isFree?: boolean;
};
type Module = { _id: string; title: LmsI18n; order: number };
type Lesson = {
  _id: string;
  courseId: string;
  moduleId: string;
  title: LmsI18n;
  description: LmsI18n;
  order: number;
  durationSeconds?: number;
  isFreePreview?: boolean;
};

export default function CourseClient() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const slug = useMemo(() => pathname.split("/").filter(Boolean).pop() ?? "", [pathname]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    course: Course;
    modules: Module[];
    lessons: Lesson[];
    enrolled: boolean;
    progressByLesson?: Record<string, { watchedSeconds: number; completedAt?: string }>;
    lastLessonId?: string | null;
  } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string>("");
  const [checkoutStep, setCheckoutStep] = useState<"closed" | "phone" | "qpay" | "success">("closed");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [qpayResponse, setQpayResponse] = useState<any>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lms/courses/${slug}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError("Failed to load course"))
      .finally(() => setLoading(false));
  }, [slug]);

  const title = data?.course?.title ? ((data.course.title as any)[locale] || data.course.title.en) : "";
  const desc = data?.course?.description ? ((data.course.description as any)[locale] || data.course.description.en) : "";
  const isFree = !!data?.course?.isFree || ((data?.course?.price ?? 0) === 0);

  const lessonsByModule = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const l of data?.lessons ?? []) {
      const arr = map.get(l.moduleId) ?? [];
      arr.push(l);
      map.set(l.moduleId, arr);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      map.set(k, arr);
    }
    return map;
  }, [data?.lessons]);

  const startLesson = (lessonId: string) => {
    router.push(`/lessons/${slug}/${lessonId}`);
  };

  const continueLessonId =
    (data?.lastLessonId as string | null) ??
    (data?.lessons?.[0]?._id ?? null);

  const refresh = async () => {
    const fresh = await fetch(`/api/lms/courses/${slug}`).then((r) => r.json());
    setData(fresh);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-inner space-y-5">
          <div className="pt-2 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="divider" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="page">
        <div className="page-inner">
          <div className="card p-8 text-center">
            <p className="t-headline mb-1">{locale === "mn" ? "Курс олдсонгүй" : "Course not found"}</p>
            <Link href="/lessons" className="btn btn-secondary btn-sm mt-4">
              {locale === "mn" ? "Буцах" : "Back"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-inner space-y-6">
        <div className="pt-2 space-y-2">
          <Link href="/lessons" className="t-caption font-bold" style={{ color: "var(--blue)" }}>
            {locale === "mn" ? "← Сургалтууд" : "← Courses"}
          </Link>
          <h1 className="t-title1">{title}</h1>
          <p className="t-body" style={{ color: "var(--label2)" }}>
            {desc}
          </p>
          <div className="flex gap-2 pt-1">
            <span
              className="badge"
              style={{
                background: isFree ? "var(--emerald-dim)" : "var(--orange-dim)",
                color: isFree ? "var(--emerald)" : "var(--orange)",
              }}
            >
              {isFree ? <Sparkles size={12} /> : <TrendingUp size={12} />}{" "}
              {isFree ? (locale === "mn" ? "Үнэгүй" : "Free") : (locale === "mn" ? "Төлбөртэй" : "Paid")}
            </span>
            {!isFree && (
              <span className="badge" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
                {data.course.currency || "MNT"} {data.course.price ?? 0}
              </span>
            )}
          </div>
        </div>

        {(data.enrolled || isFree) && continueLessonId && (
          <button
            onClick={() => startLesson(continueLessonId)}
            className="btn btn-primary btn-full"
          >
            {locale === "mn" ? "Үргэлжлүүлэх" : "Continue"}
            <ChevronRight size={16} className="ml-1" />
          </button>
        )}

        {!data.enrolled && !isFree && (
          <div className="card p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="icon-box-sm" style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>
                <Lock size={16} />
              </div>
              <div className="min-w-0">
                <div className="t-headline" style={{ fontSize: 15 }}>
                  {locale === "mn" ? "Энэ курс төлбөртэй" : "This is a paid course"}
                </div>
                <div className="t-footnote">
                  {locale === "mn"
                    ? "Одоохондоо demo байдлаар “Enroll” дарж идэвхжүүлж болно. Дараа нь төлбөрийн баталгаажуулалт холбоно."
                    : "For now you can tap “Enroll” to activate (demo). We'll wire payments next."}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setCheckoutStep("phone");
              }}
              className="btn btn-primary btn-full"
              disabled={isProcessing}
            >
              {locale === "mn" ? "QPay-р төлөх" : "Pay with QPay"}
            </button>
            {error && <p className="t-footnote" style={{ color: "var(--red)" }}>{error}</p>}
          </div>
        )}

        <section className="space-y-3">
          <div className="sec-label">{locale === "mn" ? "Хичээлүүд" : "Lessons"}</div>
          <div className="space-y-3">
            {(data.modules ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((m) => {
              const mTitle = (m.title as any)[locale] || m.title.en;
              const lessons = lessonsByModule.get(m._id) ?? [];
              return (
                <div key={m._id} className="card p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                      <BookOpen size={16} />
                    </div>
                    <div className="t-headline" style={{ fontSize: 15 }}>{mTitle}</div>
                  </div>
                  <div className="divider" />
                  <div className="space-y-2">
                    {lessons.length === 0 ? (
                      <div className="t-footnote">{locale === "mn" ? "Хичээл хараахан алга" : "No lessons yet"}</div>
                    ) : (
                      lessons.map((l) => {
                        const lTitle = (l.title as any)[locale] || l.title.en;
                        const accessible = data.enrolled || isFree || !!l.isFreePreview;
                        return (
                          <button
                            key={l._id}
                            onClick={() => accessible && startLesson(l._id)}
                            className="row w-full text-left press"
                            style={{ opacity: accessible ? 1 : 0.65 }}
                          >
                            <div className="icon-box-sm" style={{ background: accessible ? "var(--fill2)" : "var(--fill3)", color: "var(--label2)" }}>
                              {accessible ? <ChevronRight size={16} /> : <Lock size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="t-headline truncate" style={{ fontSize: 14 }}>{lTitle}</div>
                              <div className="t-caption">
                                {l.durationSeconds ? `${Math.max(1, Math.round((l.durationSeconds ?? 0) / 60))} min` : ""}
                                {!accessible && (locale === "mn" ? " • Төлбөртэй" : " • Locked")}
                                {!!l.isFreePreview && !data.enrolled && !isFree && (locale === "mn" ? " • Preview" : " • Preview")}
                              </div>
                            </div>
                            <div className="t-caption2" style={{ color: "var(--label3)" }}>
                              {accessible ? (locale === "mn" ? "Үзэх" : "Watch") : (locale === "mn" ? "Түгжээтэй" : "Locked")}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* QPay Sheet */}
      {checkoutStep === "phone" && (
        <IOSSheet
          isOpen={true}
          onClose={() => setCheckoutStep("closed")}
          title={locale === "mn" ? "Төлбөр" : "Payment"}
        >
          <div className="p-6 space-y-4">
            <div className="t-headline">{locale === "mn" ? "Утасны дугаар" : "Phone number"}</div>
            <input
              className="input"
              type="tel"
              value={phoneNumber}
              placeholder={locale === "mn" ? "Жишээ: 99112233" : "e.g. 99112233"}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <button className="btn btn-secondary btn-sm" onClick={() => setCheckoutStep("closed")}>
                {locale === "mn" ? "Болих" : "Cancel"}
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={isProcessing}
                onClick={async () => {
                  if (!data?.course?._id) return;
                  if (!phoneNumber || phoneNumber.length < 6) {
                    setError(locale === "mn" ? "Утасны дугаараа зөв оруулна уу." : "Enter a valid phone number.");
                    return;
                  }
                  setIsProcessing(true);
                  setError("");
                  try {
                    const res = await fetch("/api/lms/payments/create", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ courseId: data.course._id, phoneNumber }),
                    });
                    const j = await res.json();
                    if (!res.ok) {
                      setError(j.error || "Failed to create invoice");
                      return;
                    }
                    setQpayResponse(j.qpay);
                    setPaymentId(j.paymentId);
                    setInvoiceId(j.invoiceId);
                    setCheckoutStep("qpay");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? <div className="ios-spinner !w-4 !h-4" /> : (locale === "mn" ? "Үргэлжлүүлэх" : "Continue")}
              </button>
            </div>
          </div>
        </IOSSheet>
      )}

      {checkoutStep === "qpay" && (
        <IOSSheet
          isOpen={true}
          onClose={() => setCheckoutStep("phone")}
          title="QPay"
        >
          <div className="p-6 flex flex-col items-center space-y-4">
            {qpayResponse?.qr_image ? (
              <div className="w-56 h-56 bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                <img
                  src={`data:image/png;base64,${qpayResponse.qr_image}`}
                  alt="QPay QR"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-56 h-56 skeleton" />
            )}

            {qpayResponse?.qPay_shortUrl && (
              <a
                className="btn btn-secondary btn-full"
                href={qpayResponse.qPay_shortUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {locale === "mn" ? "QPay апп-аар төлөх" : "Pay in QPay app"}
              </a>
            )}

            <button
              className="btn btn-primary btn-full"
              disabled={isProcessing}
              onClick={async () => {
                if (!paymentId || !invoiceId) return;
                setIsProcessing(true);
                setError("");
                try {
                  const res = await fetch("/api/lms/payments/check", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentId, invoiceId }),
                  });
                  const j = await res.json();
                  if (res.ok && j.status === "paid") {
                    await refresh();
                    setCheckoutStep("success");
                  } else {
                    setError(locale === "mn" ? "Төлбөр хараахан ороогүй байна." : "Payment not received yet.");
                  }
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
              {isProcessing ? <div className="ios-spinner !w-5 !h-5" /> : (locale === "mn" ? "Төлбөр шалгах" : "Check payment")}
            </button>
          </div>
        </IOSSheet>
      )}

      <IOSAlert
        isOpen={checkoutStep === "success"}
        onClose={() => {
          setCheckoutStep("closed");
        }}
        title={locale === "mn" ? "Амжилттай!" : "Success!"}
        message={locale === "mn" ? "Төлбөр баталгаажлаа. Та курсээ үзэж болно." : "Payment confirmed. You can access the course now."}
        type="success"
        confirmText={locale === "mn" ? "Ойлголоо" : "OK"}
      />

      <IOSAlert
        isOpen={!!error && checkoutStep !== "phone" && checkoutStep !== "closed"}
        onClose={() => setError("")}
        title={locale === "mn" ? "Алдаа" : "Error"}
        message={error}
        type="error"
      />
    </div>
  );
}

