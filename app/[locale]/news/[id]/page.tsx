"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Calendar, Eye, Tag, User, Newspaper, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import RichHtmlContent from "@/app/components/RichHtmlContent";
import DetailDock from "@/app/components/DetailDock";
import { BLUR_DATA_URL } from "@/lib/image-blur";
import { nativeShare } from "@/lib/native-share";

export default function NewsDetailPage() {
  const locale = useLocale() as "en" | "mn" | "de";
  const params = useParams();

  const [mounted, setMounted] = useState(false);
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);
  const id = params.id as string;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/news/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setNews(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!news) return;
    const title = news.title?.[locale] || news.title?.mn || news.title?.en || "";
    window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title } }));
    return () => {
      window.dispatchEvent(new CustomEvent("vcm:page-title", { detail: { title: "" } }));
    };
  }, [news, locale]);

  if (!mounted || loading) {
    return (
      <div className="rn-screen app-detail app-detail--loading">
        <div className="app-detail__skeleton-hero" />
        <div className="app-detail__sheet">
          <div className="app-detail__skeleton-line w-2/5" />
          <div className="app-detail__skeleton-line w-4/5 mt-3" />
          <div className="app-detail__skeleton-line w-full mt-2" />
          <div className="app-detail__skeleton-line w-3/4 mt-2" />
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="rn-screen app-detail app-detail--empty">
        <div className="app-detail__empty-icon">
          <Newspaper size={28} strokeWidth={1.75} />
        </div>
        <h1 className="app-detail__title">Мэдээ олдсонгүй</h1>
        <Link href="/news" className="btn btn-primary auth-cta" style={{ maxWidth: 200, marginTop: 16 }}>
          Буцах
        </Link>
      </div>
    );
  }

  const t = (field: { en: string; mn: string; de: string }) =>
    field?.[locale] || field?.mn || field?.en;

  const title = t(news.title);
  const summary = t(news.summary);
  const content = t(news.content);

  const d = new Date(news.publishedDate);
  const dateFormatted = d.toLocaleDateString(
    locale === "mn" ? "mn-MN" : locale === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const handleShare = async () => {
    await nativeShare({
      title,
      text: locale === "mn" ? `${title} — VCM мэдээ` : `${title} — VCM news`,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      dialogTitle: locale === "mn" ? "Хуваалцах" : "Share",
    });
  };

  return (
    <div className="app-detail app-detail--news">
      <div className="app-detail__hero">
        <Image
          src={news.image || "/logo.jpg"}
          alt={title}
          fill
          priority
          className="app-detail__hero-img object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        <div className="app-detail__hero-fade" aria-hidden />
      </div>

      <div className="app-detail__sheet">
        <div className="app-detail__handle" aria-hidden />
        <div className="app-detail__meta">
          {news.featured ? <span className="app-detail__pill app-detail__pill--accent">Онцлох</span> : null}
          <span className="app-detail__meta-item">
            <Calendar size={13} strokeWidth={2} /> {dateFormatted}
          </span>
          {news.author ? (
            <span className="app-detail__meta-item">
              <User size={13} strokeWidth={2} /> {news.author}
            </span>
          ) : null}
          {typeof news.views === "number" ? (
            <span className="app-detail__meta-item">
              <Eye size={13} strokeWidth={2} /> {news.views}
            </span>
          ) : null}
        </div>

        <h1 className="app-detail__title">{title}</h1>
        {summary ? <p className="app-detail__lead">{summary}</p> : null}

        <div className="app-detail__body">
          <RichHtmlContent html={content} />
        </div>

        {news.tags?.length > 0 ? (
          <div className="app-detail__tags">
            {news.tags.map((tag: string) => (
              <span key={tag} className="app-detail__tag">
                <Tag size={11} strokeWidth={2} /> {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <DetailDock>
        <button
          type="button"
          onClick={() => void handleShare()}
          className="detail-dock__btn detail-dock__btn--primary press"
        >
          <Share2 size={17} strokeWidth={1.85} />
          <span>{locale === "mn" ? "Хуваалцах" : "Share"}</span>
        </button>
      </DetailDock>
    </div>
  );
}
