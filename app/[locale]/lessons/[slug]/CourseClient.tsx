"use client";

import React, { useEffect, useMemo, useState } from "react";
import SharedHero from "@/app/components/SharedHero";
import { Link, usePathname, useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { BookOpen, ChevronRight, Lock, Sparkles, TrendingUp } from "lucide-react";
import Skeleton from "@/app/components/Skeleton";
import { IOSAlert, IOSSheet } from "@/app/components/iOSAlert";
import DetailDock from "@/app/components/DetailDock";
import NativeFeatureUnavailable from "@/app/components/NativeFeatureUnavailable";
import { isNativeApp } from "@/lib/native-perf";
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
  const [nativeApp, setNativeApp] = useState(false);

  useEffect(() => {
    setNativeApp(isNativeApp());
  }, []);

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

  useEffect(() => {
    if (!title) return;
    window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title } }));
    return () => {
      window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: "" } }));
    };
  }, [title]);

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

  // Native shell: free courses only (App Store 3.1.1 — no paid digital content).
  if (nativeApp && !isFree) {
    return (
      <NativeFeatureUnavailable
        locale={locale}
        titleMn="Сургалт апп дээр байхгүй"
        titleEn="Course not available in the app"
        subMn="Энэ сургалт одоогоор зөвхөн веб хувилбар дээр."
        subEn="This course is only available on the website, not in this iOS app."
      />
    );
  }

  const thumb = data.course.thumbnailUrl;

  return (
    <div className="app-detail app-detail--course dc-course-detail">
      <div className="app-detail__hero">
        {thumb ? (
          <SharedHero
            kind="lesson"
            id={data.course.slug}
            src={thumb}
            alt={title}
            imgClassName="app-detail__hero-img object-cover"
            sizes="100vw"
            priority
            radius={0}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(145deg, #0d9488, #0f172a)" }}
          />
        )}
        <div className="app-detail__hero-fade" aria-hidden />
      </div>

      <div className="app-detail__sheet">
        <div className="app-detail__handle" aria-hidden />

        <div className="app-detail__meta">
          <span className={`app-detail__pill ${isFree ? "app-detail__pill--ok" : "app-detail__pill--warn"}`}>
            {isFree ? <Sparkles size={11} /> : <TrendingUp size={11} />}{" "}
            {isFree ? (locale === "mn" ? "Үнэгүй" : "Free") : (locale === "mn" ? "Төлбөртэй" : "Paid")}
          </span>
          <span className="app-detail__pill">
            {(data.lessons ?? []).length} {locale === "mn" ? "хичээл" : "lessons"}
          </span>
          {!isFree ? (
            <span className="app-detail__pill dc-course-detail__price-pill">
              {(data.course.price ?? 0).toLocaleString()}₮
            </span>
          ) : null}
        </div>

        <h1 className="app-detail__title">{title}</h1>
        {desc ? <p className="app-detail__lead">{desc}</p> : null}

        {!data.enrolled && !isFree ? (
          <div className="app-detail__card" style={{ marginTop: 16, padding: 16 }}>
            <div className="flex items-start gap-3">
              <div className="icon-box-sm" style={{ background: "var(--orange-dim)", color: "var(--orange)" }}>
                <Lock size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold" style={{ color: "var(--label)" }}>
                  {locale === "mn" ? "Энэ курс төлбөртэй" : "This is a paid course"}
                </p>
                <p className="text-[13px] mt-1" style={{ color: "var(--label3)" }}>
                  {nativeApp
                    ? locale === "mn"
                      ? "Төлбөртэй сургалтын худалдан авалт iOS апп дээр байхгүй."
                      : "Paid purchases are not available in the iOS app."
                    : locale === "mn"
                      ? "QPay-р төлж бүртгүүлсний дараа бүх хичээлийг үзнэ."
                      : "Pay with QPay to unlock all lessons."}
                </p>
              </div>
            </div>
            {error ? <p className="text-[13px] mt-2" style={{ color: "var(--red)" }}>{error}</p> : null}
          </div>
        ) : null}

        <section style={{ marginTop: 22 }}>
          <p className="app-detail__section-label" style={{ marginBottom: 10 }}>
            {locale === "mn" ? "Хичээлүүд" : "Lessons"}
          </p>
          <div className="space-y-3">
            {(data.modules ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((m) => {
              const mTitle = (m.title as any)[locale] || m.title.en;
              const lessons = lessonsByModule.get(m._id) ?? [];
              return (
                <div key={m._id} className="app-detail__card" style={{ padding: "14px 14px 10px" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="icon-box-sm" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                      <BookOpen size={16} />
                    </div>
                    <div className="text-[15px] font-bold" style={{ color: "var(--label)" }}>{mTitle}</div>
                  </div>
                  <div className="space-y-1">
                    {lessons.length === 0 ? (
                      <p className="text-[13px]" style={{ color: "var(--label3)" }}>
                        {locale === "mn" ? "Хичээл хараахан алга" : "No lessons yet"}
                      </p>
                    ) : (
                      lessons.map((l) => {
                        const lTitle = (l.title as any)[locale] || l.title.en;
                        const accessible = data.enrolled || isFree || !!l.isFreePreview;
                        return (
                          <button
                            key={l._id}
                            type="button"
                            onClick={() => accessible && startLesson(l._id)}
                            className="w-full text-left press flex items-center gap-3 py-3 px-1"
                            style={{ opacity: accessible ? 1 : 0.65, borderTop: "0.5px solid var(--sep)" }}
                          >
                            <div
                              className="icon-box-sm"
                              style={{
                                background: accessible ? "var(--fill2)" : "var(--fill3)",
                                color: "var(--label2)",
                              }}
                            >
                              {accessible ? <ChevronRight size={16} /> : <Lock size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-semibold truncate" style={{ color: "var(--label)" }}>
                                {lTitle}
                              </div>
                              <div className="text-[12px]" style={{ color: "var(--label3)" }}>
                                {l.durationSeconds
                                  ? `${Math.max(1, Math.round((l.durationSeconds ?? 0) / 60))} мин`
                                  : ""}
                                {!accessible && (locale === "mn" ? " · Төлбөртэй" : " · Locked")}
                                {!!l.isFreePreview && !data.enrolled && !isFree
                                  ? locale === "mn"
                                    ? " · Preview"
                                    : " · Preview"
                                  : ""}
                              </div>
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

      <DetailDock
        visible={checkoutStep === "closed"}
        leading={
          !isFree ? (
            <span className="detail-dock__price">₮{(data.course.price ?? 0).toLocaleString()}</span>
          ) : undefined
        }
      >
        {(data.enrolled || isFree) && continueLessonId ? (
          <button
            type="button"
            onClick={() => startLesson(continueLessonId)}
            className="detail-dock__btn detail-dock__btn--primary press"
          >
            {locale === "mn" ? "Үргэлжлүүлэх" : "Continue"}
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        ) : !data.enrolled && !isFree && !nativeApp ? (
          <button
            type="button"
            onClick={() => setCheckoutStep("phone")}
            className="detail-dock__btn detail-dock__btn--primary press"
            disabled={isProcessing}
          >
            {locale === "mn" ? "QPay-р төлөх" : "Pay with QPay"}
          </button>
        ) : (
          <Link href="/lessons" className="detail-dock__btn detail-dock__btn--secondary press">
            {locale === "mn" ? "Сургалтууд" : "Courses"}
          </Link>
        )}
      </DetailDock>

      {/* QPay Sheet — web only */}
      {checkoutStep === "phone" && !nativeApp && (
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

      {checkoutStep === "qpay" && !nativeApp && (
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

