"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, usePathname } from "@/navigation";
import { useLocale } from "next-intl";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import Skeleton from "@/app/components/Skeleton";

type LmsI18n = { en: string; mn: string; de?: string };
type Lesson = {
  _id: string;
  moduleId: string;
  title: LmsI18n;
  description: LmsI18n;
  order: number;
  videoProvider?: string;
  videoAssetId?: string;
  durationSeconds?: number;
};

import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

export default function LessonPlayerClient() {
  const locale = useLocale();
  const pathname = usePathname();

  const parts = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  const lessonId = parts.at(-1) ?? "";
  const slug = parts.at(-2) ?? "";

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState<any>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [resumeAt, setResumeAt] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/lms/courses/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setCourseData(d);
        const found = (d?.lessons ?? []).find((l: any) => l._id === lessonId);
        setLesson(found ?? null);
        const watched = d?.progressByLesson?.[lessonId]?.watchedSeconds ?? 0;
        setResumeAt(typeof watched === "number" ? watched : 0);
      })
      .finally(() => setLoading(false));
  }, [slug, lessonId]);

  const title = lesson?.title ? ((lesson.title as any)[locale] || lesson.title.en) : "";
  const desc = lesson?.description ? ((lesson.description as any)[locale] || lesson.description.en) : "";

  const saveProgress = async (completed = false) => {
    if (!courseData?.course?._id || !lesson?._id) return;
    setSaving(true);
    setSaveError("");
    try {
      const watchedSeconds =
        videoRef.current?.currentTime != null
          ? Math.floor(videoRef.current.currentTime)
          : 0;
      const res = await fetch("/api/lms/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: courseData.course._id,
          lessonId: lesson._id,
          watchedSeconds,
          completed,
          updatedAtClient: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setSaveError(j.error || "Failed to save progress");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-inner space-y-4">
          <div className="pt-2 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="card overflow-hidden">
            <Skeleton className="h-56 w-full !rounded-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="page">
        <div className="page-inner">
          <div className="card p-8 text-center">
            <p className="t-headline mb-1">{locale === "mn" ? "Хичээл олдсонгүй" : "Lesson not found"}</p>
            <Link href={`/lessons/${slug}`} className="btn btn-secondary btn-sm mt-4">
              {locale === "mn" ? "Буцах" : "Back"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const src = lesson.videoAssetId || "";
  const isUrl = src.startsWith("http://") || src.startsWith("https://");
  const isCloudinary = !isUrl && src.length > 0;

  return (
    <div className="page">
      <div className="page-inner space-y-4">
        <div className="pt-2">
          <Link href={`/lessons/${slug}`} className="t-caption font-bold" style={{ color: "var(--blue)" }}>
            <ChevronLeft size={14} className="inline-block -mt-0.5" /> {locale === "mn" ? "Курс руу" : "Back to course"}
          </Link>
          <h1 className="t-title2 mt-2">{title}</h1>
          {desc && (
            <p className="t-footnote mt-1" style={{ color: "var(--label2)" }}>
              {desc}
            </p>
          )}
        </div>

        <div className="card overflow-hidden">
          {isCloudinary ? (
            <div className="aspect-video w-full">
              <CldVideoPlayer
                width="1920"
                height="1080"
                src={src}
                onPause={() => void saveProgress(false)}
                onEnded={() => void saveProgress(true)}
              />
            </div>
          ) : isUrl ? (
            <video
              ref={videoRef}
              controls
              playsInline
              className="w-full aspect-video"
              src={src}
              onLoadedMetadata={() => {
                if (!videoRef.current) return;
                if (!resumeAt) return;
                const safe = Math.max(0, Math.min(resumeAt, Math.max(0, (videoRef.current.duration || 0) - 1)));
                if (safe > 0) videoRef.current.currentTime = safe;
              }}
              onPause={() => void saveProgress(false)}
              onEnded={() => void saveProgress(true)}
            />
          ) : (
            <div className="p-10 text-center">
              <div className="icon-box mx-auto mb-3" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
                <PlayCircle size={22} />
              </div>
              <p className="t-headline mb-1">{locale === "mn" ? "Видео холбоог тохируулаагүй байна" : "Video not configured"}</p>
              <p className="t-footnote">`videoAssetId` дээр URL оруулна уу.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => void saveProgress(false)} className="btn btn-secondary btn-full" disabled={saving}>
            {saving ? (locale === "mn" ? "Хадгалж байна…" : "Saving…") : (locale === "mn" ? "Явц хадгалах" : "Save")}
          </button>
          <button onClick={() => void saveProgress(true)} className="btn btn-primary btn-full" disabled={saving}>
            {locale === "mn" ? "Дуусгасан" : "Mark done"} <ChevronRight size={16} />
          </button>
        </div>

        {saveError && <p className="t-footnote" style={{ color: "var(--red)" }}>{saveError}</p>}
      </div>
    </div>
  );
}

