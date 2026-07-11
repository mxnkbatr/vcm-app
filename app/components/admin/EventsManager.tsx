"use client";

import React, { useState } from "react";
import DataTable, { Column } from "./DataTable";

type EventRow = {
  _id: string;
  title?: { mn?: string; en?: string };
  description?: { mn?: string; en?: string };
  date?: string;
  timeString?: string;
  category?: string;
  status?: string;
  location?: { mn?: string; en?: string };
  image?: string;
  link?: string;
  featured?: boolean;
  attendees?: unknown[];
};

const CATEGORIES = [
  { value: "workshop", label: "Сургалт" },
  { value: "campaign", label: "Аян" },
  { value: "fundraiser", label: "Хандив" },
  { value: "meeting", label: "Уулзалт" },
];

const STATUSES = [
  { value: "upcoming", label: "Удахгүй", color: "var(--blue)", bg: "var(--blue-dim)" },
  { value: "past", label: "Дууссан", color: "var(--label3)", bg: "var(--fill2)" },
  { value: "cancelled", label: "Цуцлагдсан", color: "var(--red)", bg: "var(--red-dim)" },
];

const empty = {
  titleMn: "",
  titleEn: "",
  descMn: "",
  descEn: "",
  date: "",
  timeString: "10:00 - 12:00",
  locMn: "Улаанбаатар",
  locEn: "Ulaanbaatar",
  category: "workshop",
  status: "upcoming",
  image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
  link: "",
  featured: false,
  ticketPrice: 0,
};

function statusMeta(status?: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

export default function EventsManager({
  events,
  onRefresh,
}: {
  events: EventRow[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setForm(empty);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (e: EventRow) => {
    setEditingId(e._id);
    setShowForm(true);
    setError("");
    setForm({
      titleMn: e.title?.mn || "",
      titleEn: e.title?.en || "",
      descMn: e.description?.mn || "",
      descEn: e.description?.en || "",
      date: e.date ? new Date(e.date).toISOString().slice(0, 10) : "",
      timeString: e.timeString || "10:00 - 12:00",
      locMn: e.location?.mn || "Улаанбаатар",
      locEn: e.location?.en || "Ulaanbaatar",
      category: e.category || "workshop",
      status: e.status || "upcoming",
      image: e.image || empty.image,
      link: e.link || "",
      featured: Boolean(e.featured),
      ticketPrice: (e as any).ticketPrice || 0,
    });
  };

  const save = async () => {
    if (!form.titleMn.trim()) {
      setError("Гарчиг (MN) оруулна уу.");
      return;
    }
    if (!form.date) {
      setError("Огноо сонгоно уу.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const payload = {
        id: editingId,
        title: { mn: form.titleMn, en: form.titleEn || form.titleMn },
        description: { mn: form.descMn || form.titleMn, en: form.descEn || form.titleEn || form.titleMn },
        date: form.date,
        timeString: form.timeString,
        location: { mn: form.locMn, en: form.locEn },
        category: form.category,
        status: form.status,
        image: form.image,
        link: form.link || undefined,
        featured: form.featured,
        ticketPrice: Number(form.ticketPrice) || 0,
      };
      const res = await fetch("/api/admin/events", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Хадгалахад алдаа гарлаа");
      reset();
      onRefresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Энэ арга хэмжээг устгах уу?")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const columns: Array<Column<EventRow>> = [
    {
      key: "title",
      header: "Гарчиг",
      render: (e) => (
        <div>
          <div className="font-semibold">{e.title?.mn || e.title?.en || "—"}</div>
          {e.featured && (
            <span className="text-[10px] font-bold" style={{ color: "var(--orange)" }}>
              Онцлох
            </span>
          )}
        </div>
      ),
      sortValue: (e) => e.title?.mn || "",
    },
    {
      key: "date",
      header: "Огноо",
      render: (e) => (
        <div className="text-sm">
          <div>{e.date ? new Date(e.date).toLocaleDateString("mn-MN") : "—"}</div>
          <div className="text-xs" style={{ color: "var(--label3)" }}>{e.timeString}</div>
        </div>
      ),
      sortValue: (e) => (e.date ? new Date(e.date).getTime() : 0),
    },
    {
      key: "category",
      header: "Төрөл",
      render: (e) => (
        <span className="badge" style={{ background: "var(--fill2)" }}>
          {CATEGORIES.find((c) => c.value === e.category)?.label || e.category}
        </span>
      ),
    },
    {
      key: "attendees",
      header: "Оролцогч",
      render: (e) => <span>{Array.isArray(e.attendees) ? e.attendees.length : 0}</span>,
      sortValue: (e) => (Array.isArray(e.attendees) ? e.attendees.length : 0),
    },
    {
      key: "status",
      header: "Төлөв",
      render: (e) => {
        const st = statusMeta(e.status);
        return (
          <span className="badge" style={{ background: st.bg, color: st.color }}>
            {st.label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (e) => (
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost btn-sm press" onClick={() => startEdit(e)}>
            Засах
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm press"
            style={{ color: "var(--red)" }}
            onClick={() => remove(e._id)}
          >
            Устгах
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-5 flex justify-between items-center gap-3">
        <div>
          <div className="t-title3">Арга хэмжээ</div>
          <div className="t-caption">Нэмэх, засах, устгах — фронтэнд шууд шинэчлэгдэнэ</div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm press"
          onClick={() => {
            reset();
            setShowForm(true);
          }}
        >
          + Нэмэх
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <div className="t-headline">{editingId ? "Арга хэмжээ засах" : "Шинэ арга хэмжээ"}</div>

          {error && (
            <p className="text-sm p-3 rounded-xl" style={{ background: "var(--red-dim)", color: "var(--red)" }}>
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block md:col-span-2">
              <span className="t-caption2 block mb-1">Гарчиг (MN) *</span>
              <input className="input" value={form.titleMn} onChange={(e) => setForm({ ...form, titleMn: e.target.value })} />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Гарчиг (EN)</span>
              <input className="input" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Огноо *</span>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="t-caption2 block mb-1">Тайлбар (MN)</span>
              <textarea className="input min-h-[80px]" value={form.descMn} onChange={(e) => setForm({ ...form, descMn: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="t-caption2 block mb-1">Тайлбар (EN)</span>
              <textarea className="input min-h-[80px]" value={form.descEn} onChange={(e) => setForm({ ...form, descEn: e.target.value })} />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Цаг</span>
              <input className="input" value={form.timeString} onChange={(e) => setForm({ ...form, timeString: e.target.value })} placeholder="10:00 - 12:00" />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Байршил (MN)</span>
              <input className="input" value={form.locMn} onChange={(e) => setForm({ ...form, locMn: e.target.value })} />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Төрөл</span>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Төлөв</span>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="t-caption2 block mb-1">Зураг URL</span>
              <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="t-caption2 block mb-1">Бүртгэлийн холбоос (заавал биш)</span>
              <input className="input" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Тасалбарын үнэ (₮)</span>
              <input
                type="number"
                min={0}
                className="input"
                value={form.ticketPrice}
                onChange={(e) => setForm({ ...form, ticketPrice: Number(e.target.value) || 0 })}
              />
            </label>
            <label className="flex items-center gap-2 md:col-span-2 t-caption">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              Онцлох арга хэмжээ
            </label>
          </div>

          {form.image && (
            <img src={form.image} alt="" className="w-full max-h-40 object-cover rounded-xl" />
          )}

          <div className="flex gap-2">
            <button type="button" className="btn btn-primary press" disabled={busy} onClick={save}>
              {busy ? "Хадгалж байна..." : "Хадгалах"}
            </button>
            <button type="button" className="btn btn-ghost press" onClick={reset}>Болих</button>
          </div>
        </div>
      )}

      <DataTable
        rows={events}
        columns={columns}
        getSearchText={(e) => `${e.title?.mn} ${e.title?.en} ${e.status} ${e.category}`}
      />
    </div>
  );
}
