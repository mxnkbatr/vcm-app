"use client";

import React, { useEffect, useState } from "react";
import DataTable, { Column } from "./DataTable";

type PromoRow = {
  _id: string;
  code: string;
  label?: string;
  discountPercent: number;
  allShopItems?: boolean;
  allEvents?: boolean;
  shopItemIds?: Array<{ _id: string; name?: { mn?: string } }>;
  eventIds?: Array<{ _id: string; title?: { mn?: string } }>;
  active?: boolean;
  maxUses?: number | null;
  usedCount?: number;
  expiresAt?: string;
};

type ShopItem = { _id: string; name?: { mn?: string; en?: string }; price?: number };
type EventItem = { _id: string; title?: { mn?: string; en?: string }; date?: string };

const emptyForm = {
  code: "",
  label: "",
  discountPercent: 10,
  allShopItems: false,
  allEvents: false,
  shopItemIds: [] as string[],
  eventIds: [] as string[],
  active: true,
  maxUses: "",
  expiresAt: "",
};

export default function PromoCodesManager({
  promos,
  onRefresh,
}: {
  promos: PromoRow[];
  onRefresh: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    if (!showForm) return;
    Promise.all([
      fetch("/api/admin/shopping").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/events").then((r) => (r.ok ? r.json() : [])),
    ]).then(([shop, ev]) => {
      setShopItems(Array.isArray(shop) ? shop : []);
      setEvents(Array.isArray(ev) ? ev : []);
    });
  }, [showForm]);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: PromoRow) => {
    setEditingId(p._id);
    setShowForm(true);
    setForm({
      code: p.code,
      label: p.label || "",
      discountPercent: p.discountPercent,
      allShopItems: Boolean(p.allShopItems),
      allEvents: Boolean(p.allEvents),
      shopItemIds: (p.shopItemIds || []).map((i) => String(i._id)),
      eventIds: (p.eventIds || []).map((i) => String(i._id)),
      active: p.active !== false,
      maxUses: p.maxUses ? String(p.maxUses) : "",
      expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "",
    });
  };

  const toggleId = (list: "shopItemIds" | "eventIds", id: string) => {
    setForm((prev) => {
      const arr = prev[list];
      const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
      return { ...prev, [list]: next };
    });
  };

  const save = async () => {
    if (!form.code.trim()) return alert("Код оруулна уу");
    setBusy(true);
    try {
      const payload = {
        id: editingId,
        code: form.code.trim().toUpperCase(),
        label: form.label,
        discountPercent: Number(form.discountPercent),
        allShopItems: form.allShopItems,
        allEvents: form.allEvents,
        shopItemIds: form.allShopItems ? [] : form.shopItemIds,
        eventIds: form.allEvents ? [] : form.eventIds,
        active: form.active,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      };
      const res = await fetch("/api/admin/promo-codes", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      reset();
      onRefresh();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Алдаа");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Промо код устгах уу?")) return;
    await fetch(`/api/admin/promo-codes?id=${id}`, { method: "DELETE" });
    onRefresh();
  };

  const columns: Array<Column<PromoRow>> = [
    {
      key: "code",
      header: "Код",
      render: (p) => (
        <div>
          <div className="font-black tracking-wide">{p.code}</div>
          {p.label && <div className="text-xs" style={{ color: "var(--label3)" }}>{p.label}</div>}
        </div>
      ),
      sortValue: (p) => p.code,
    },
    {
      key: "discount",
      header: "Хөнгөлөлт",
      render: (p) => (
        <span className="badge" style={{ background: "var(--emerald-dim)", color: "var(--emerald)" }}>
          -{p.discountPercent}%
        </span>
      ),
    },
    {
      key: "scope",
      header: "Хамрах хүрээ",
      render: (p) => (
        <div className="text-xs space-y-0.5" style={{ color: "var(--label2)" }}>
          {p.allShopItems ? <div>Бүх бараа</div> : <div>Бараа: {p.shopItemIds?.length || 0}</div>}
          {p.allEvents ? <div>Бүх арга хэмжээ</div> : <div>Арга: {p.eventIds?.length || 0}</div>}
        </div>
      ),
    },
    {
      key: "usage",
      header: "Ашиглалт",
      render: (p) => (
        <span>
          {p.usedCount || 0}
          {p.maxUses ? ` / ${p.maxUses}` : ""}
        </span>
      ),
    },
    {
      key: "active",
      header: "Төлөв",
      render: (p) => (
        <span
          className="badge"
          style={{
            background: p.active ? "var(--emerald-dim)" : "var(--red-dim)",
            color: p.active ? "var(--emerald)" : "var(--red)",
          }}
        >
          {p.active ? "Идэвхтэй" : "Идэвхгүй"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost btn-sm press" onClick={() => startEdit(p)}>
            Засах
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm press"
            style={{ color: "var(--red)" }}
            onClick={() => remove(p._id)}
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
          <div className="t-title3">Промо код</div>
          <div className="t-caption">Бараа, арга хэмжээнд хөнгөлөлт тохируулах</div>
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
          <div className="t-headline">{editingId ? "Промо код засах" : "Шинэ промо код"}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="t-caption2 block mb-1">Код *</span>
              <input
                className="input uppercase"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER20"
              />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Тайлбар</span>
              <input
                className="input"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Зуны хөнгөлөлт"
              />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Хөнгөлөлт (%) *</span>
              <input
                type="number"
                min={1}
                max={100}
                className="input"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
              />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Хэрэглэх хязгаар</span>
              <input
                type="number"
                className="input"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Хязгааргүй"
              />
            </label>
            <label className="block">
              <span className="t-caption2 block mb-1">Дуусах огноо</span>
              <input
                type="date"
                className="input"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 t-caption pt-6">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Идэвхтэй
            </label>
          </div>

          <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--sep)" }}>
            <label className="flex items-center gap-2 t-caption font-bold">
              <input
                type="checkbox"
                checked={form.allShopItems}
                onChange={(e) => setForm({ ...form, allShopItems: e.target.checked })}
              />
              Бүх дэлгүүрийн бараанд хамаарна
            </label>
            {!form.allShopItems && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 rounded-xl" style={{ background: "var(--fill3)" }}>
                {shopItems.map((item) => (
                  <label key={item._id} className="flex items-center gap-2 text-sm press">
                    <input
                      type="checkbox"
                      checked={form.shopItemIds.includes(item._id)}
                      onChange={() => toggleId("shopItemIds", item._id)}
                    />
                    <span className="truncate">
                      {item.name?.mn || item.name?.en} — ₮{(item.price || 0).toLocaleString()}
                    </span>
                  </label>
                ))}
                {shopItems.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--label3)" }}>Бараа байхгүй</p>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--sep)" }}>
            <label className="flex items-center gap-2 t-caption font-bold">
              <input
                type="checkbox"
                checked={form.allEvents}
                onChange={(e) => setForm({ ...form, allEvents: e.target.checked })}
              />
              Бүх арга хэмжээнд хамаарна
            </label>
            {!form.allEvents && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 rounded-xl" style={{ background: "var(--fill3)" }}>
                {events.map((ev) => (
                  <label key={ev._id} className="flex items-center gap-2 text-sm press">
                    <input
                      type="checkbox"
                      checked={form.eventIds.includes(ev._id)}
                      onChange={() => toggleId("eventIds", ev._id)}
                    />
                    <span className="truncate">{ev.title?.mn || ev.title?.en || "Event"}</span>
                  </label>
                ))}
                {events.length === 0 && (
                  <p className="text-xs" style={{ color: "var(--label3)" }}>Арга хэмжээ байхгүй</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn btn-primary press" disabled={busy} onClick={save}>
              {busy ? "..." : "Хадгалах"}
            </button>
            <button type="button" className="btn btn-ghost press" onClick={reset}>
              Болих
            </button>
          </div>
        </div>
      )}

      <DataTable rows={promos} columns={columns} getSearchText={(p) => `${p.code} ${p.label}`} />
    </div>
  );
}
