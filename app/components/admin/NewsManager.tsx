"use client";

import React, { useState } from "react";
import DataTable, { Column } from "./DataTable";

type NewsRow = {
  _id: string;
  title?: { mn?: string; en?: string };
  status?: string;
  publishedDate?: string;
};

const empty = {
  titleMn: "", titleEn: "", summaryMn: "", summaryEn: "",
  contentMn: "", contentEn: "",
  image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
  status: "published",
};

export default function NewsManager({ news, onRefresh }: { news: NewsRow[]; onRefresh: () => void }) {
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const payload = {
        id: editingId,
        title: { mn: form.titleMn, en: form.titleEn, de: form.titleEn },
        summary: { mn: form.summaryMn, en: form.summaryEn, de: form.summaryEn },
        content: { mn: form.contentMn, en: form.contentEn, de: form.contentEn },
        image: form.image,
        status: form.status,
      };
      const res = await fetch("/api/admin/news", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setShowForm(false);
      onRefresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Устгах уу?")) return;
    await fetch(`/api/admin/news?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const columns: Array<Column<NewsRow>> = [
    { key: "title", header: "Мэдээ", render: (n) => <div className="font-semibold">{n.title?.mn || n.title?.en}</div>, sortValue: (n) => n.title?.mn || "" },
    { key: "status", header: "Төлөв", render: (n) => <span className="badge" style={{ background: "var(--fill2)" }}>{n.status}</span> },
    {
      key: "actions", header: "",
      render: (n) => (
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost btn-sm press" onClick={() => {
            setEditingId(n._id); setShowForm(true);
            setForm({ ...empty, titleMn: n.title?.mn || "", titleEn: n.title?.en || "", status: n.status || "published" });
          }}>Засах</button>
          <button type="button" className="btn btn-ghost btn-sm press" style={{ color: "var(--red)" }} onClick={() => remove(n._id)}>Устгах</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-5 flex justify-between items-center">
        <div><div className="t-title3">Мэдээ</div><div className="t-caption">Нийтлэл удирдлага</div></div>
        <button type="button" className="btn btn-primary btn-sm press" onClick={() => { setEditingId(null); setForm(empty); setShowForm(true); }}>+ Нэмэх</button>
      </div>
      {showForm && (
        <div className="card p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["titleMn", "Гарчиг MN", form.titleMn],
            ["titleEn", "Гарчиг EN", form.titleEn],
            ["summaryMn", "Товч MN", form.summaryMn],
            ["contentMn", "Агуулга MN", form.contentMn],
            ["image", "Зураг URL", form.image],
          ].map(([k, label, val]) => (
            <label key={k} className="block">
              <span className="t-caption2 block mb-1">{label}</span>
              <input className="input" value={val} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </label>
          ))}
          <div className="md:col-span-2 flex gap-2">
            <button type="button" className="btn btn-primary press" disabled={busy} onClick={save}>Хадгалах</button>
            <button type="button" className="btn btn-ghost press" onClick={() => setShowForm(false)}>Болих</button>
          </div>
        </div>
      )}
      <DataTable rows={news} columns={columns} getSearchText={(n) => `${n.title?.mn} ${n.title?.en}`} />
    </div>
  );
}
