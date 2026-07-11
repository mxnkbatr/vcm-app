"use client";

import React, { useState } from "react";
import DataTable, { Column } from "@/app/components/admin/DataTable";

type UserRow = {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  program?: string;
  country?: string;
  step?: string;
  supabaseId?: string;
  updatedAt?: string;
};

const ROLES = [
  "guest",
  "volunteer",
  "student",
  "general_and",
  "general_edu",
  "general_vclub",
  "admin",
];

type EditForm = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  program: string;
  country: string;
  step: string;
  newPassword: string;
};

export default function UsersTab() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [selected, setSelected] = React.useState<UserRow | null>(null);
  const [edit, setEdit] = React.useState<EditForm>({
    fullName: "",
    email: "",
    phone: "",
    role: "guest",
    program: "",
    country: "",
    step: "",
    newPassword: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    const q = roleFilter !== "all" ? `?role=${roleFilter}` : "";
    fetch(`/api/admin/users${q}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const openEdit = (u: UserRow) => {
    setSelected(u);
    setMessage(null);
    setEdit({
      fullName: u.fullName || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || "guest",
      program: u.program || "",
      country: u.country || "",
      step: u.step || "",
      newPassword: "",
    });
  };

  const saveProfile = async () => {
    if (!selected?._id) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selected._id,
          action: "update_user",
          data: {
            fullName: edit.fullName,
            email: edit.email,
            phone: edit.phone,
            role: edit.role,
            program: edit.program,
            country: edit.country,
            step: edit.step,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Хадгалахад алдаа гарлаа");
      setMessage({ ok: true, text: "Мэдээлэл амжилттай хадгалагдлаа." });
      load();
    } catch (e: unknown) {
      setMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Хадгалахад алдаа гарлаа",
      });
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!selected?._id || !edit.newPassword) {
      setMessage({ ok: false, text: "Шинэ нууц үг оруулна уу." });
      return;
    }
    if (!confirm(`${selected.fullName} хэрэглэгчийн нууц үгийг солих уу?`)) return;

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selected._id,
          action: "reset_password",
          data: { password: edit.newPassword },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Нууц үг солиход алдаа гарлаа");
      setEdit((prev) => ({ ...prev, newPassword: "" }));
      setMessage({ ok: true, text: "Нууц үг амжилттай шинэчлэгдлээ (Supabase + MongoDB)." });
    } catch (e: unknown) {
      setMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Нууц үг солиход алдаа гарлаа",
      });
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async () => {
    if (!selected?._id) return;
    if (!confirm(`${selected.fullName} хэрэглэгчийг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users?id=${selected._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Устгахад алдаа гарлаа");
      setSelected(null);
      load();
    } catch (e: unknown) {
      setMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Устгахад алдаа гарлаа",
      });
    } finally {
      setBusy(false);
    }
  };

  const columns: Array<Column<UserRow>> = [
    {
      key: "name",
      header: "Хэрэглэгч",
      mobile: "primary",
      render: (u) => (
        <div>
          <div className="font-bold">{u.fullName || "—"}</div>
          <div className="text-xs" style={{ color: "var(--label2)" }}>
            {u.email || u.phone || "—"}
          </div>
        </div>
      ),
      sortValue: (u) => u.fullName || "",
    },
    {
      key: "role",
      header: "Эрх",
      mobile: true,
      render: (u) => (
        <span className="badge" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
          {u.role || "guest"}
        </span>
      ),
      sortValue: (u) => u.role || "",
    },
    {
      key: "program",
      header: "Хөтөлбөр",
      mobile: true,
      render: (u) => <span>{u.program || "—"}</span>,
      sortValue: (u) => u.program || "",
    },
    {
      key: "actions",
      header: "",
      render: (u) => (
        <button type="button" className="btn btn-ghost btn-sm press" onClick={() => openEdit(u)}>
          Засах
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="card p-6">
        <div className="t-headline">Хэрэглэгчид ачаалж байна…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="t-title3">Хэрэглэгчид</div>
          <div className="t-caption">Мэдээлэл, эрх, нууц үг засах</div>
        </div>
        <select
          className="input max-w-[180px]"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Бүх эрх</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-end md:items-start md:relative md:inset-auto md:z-auto md:bg-transparent md:p-0"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div
            className="absolute inset-0 bg-black/40 md:hidden"
            onClick={() => setSelected(null)}
            aria-hidden
          />
          <div
            className="relative card w-full md:max-w-none p-5 space-y-4 rounded-t-[24px] md:rounded-[var(--r-xl)] max-h-[92dvh] md:max-h-none overflow-y-auto"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
          >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="t-headline">Хэрэглэгч засах</div>
              <div className="t-caption">{selected.fullName}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm press" onClick={() => setSelected(null)}>
              Хаах
            </button>
          </div>

          {message && (
            <p
              className="text-sm p-3 rounded-xl"
              style={{
                background: message.ok ? "var(--emerald-dim)" : "var(--red-dim)",
                color: message.ok ? "var(--emerald)" : "var(--red)",
              }}
            >
              {message.text}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="block">
              <span className="t-caption2">Бүтэн нэр</span>
              <input
                className="input mt-1"
                value={edit.fullName}
                onChange={(e) => setEdit({ ...edit, fullName: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="t-caption2">Gmail / Имэйл</span>
              <input
                type="email"
                className="input mt-1"
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="t-caption2">Утас</span>
              <input
                className="input mt-1"
                value={edit.phone}
                onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="t-caption2">Эрх</span>
              <select
                className="input mt-1"
                value={edit.role}
                onChange={(e) => setEdit({ ...edit, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="t-caption2">Хөтөлбөр</span>
              <input
                className="input mt-1"
                value={edit.program}
                onChange={(e) => setEdit({ ...edit, program: e.target.value })}
                placeholder="EDU, AND, VCLUB"
              />
            </label>
            <label className="block">
              <span className="t-caption2">Улс / Бүс</span>
              <input
                className="input mt-1"
                value={edit.country}
                onChange={(e) => setEdit({ ...edit, country: e.target.value })}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="t-caption2">Явц / Алхам</span>
              <input
                className="input mt-1"
                value={edit.step}
                onChange={(e) => setEdit({ ...edit, step: e.target.value })}
              />
            </label>
          </div>

          <div className="border-t pt-4" style={{ borderColor: "var(--sep)" }}>
            <div className="t-headline mb-2">Нууц үг солих</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                className="input flex-1"
                placeholder="Шинэ нууц үг (8+ тэмдэгт)"
                value={edit.newPassword}
                onChange={(e) => setEdit({ ...edit, newPassword: e.target.value })}
              />
              <button
                type="button"
                className="btn btn-secondary press"
                disabled={busy || !edit.newPassword}
                onClick={resetPassword}
              >
                Нууц үг солих
              </button>
            </div>
            <p className="t-caption mt-2" style={{ color: "var(--label3)" }}>
              Supabase болон MongoDB дээр хоёуланд нь шинэчлэгдэнэ.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" className="btn btn-primary press" disabled={busy} onClick={saveProfile}>
              {busy ? "Хадгалж байна..." : "Мэдээлэл хадгалах"}
            </button>
            <button
              type="button"
              className="btn btn-ghost press"
              style={{ color: "var(--red)" }}
              disabled={busy}
              onClick={removeUser}
            >
              Хэрэглэгч устгах
            </button>
          </div>
          </div>
        </div>
      )}

      <DataTable
        rows={rows}
        columns={columns}
        pageSize={25}
        searchPlaceholder="Нэр / имэйл / утас хайх…"
        onRowClick={openEdit}
        getSearchText={(u) =>
          `${u.fullName || ""} ${u.email || ""} ${u.phone || ""} ${u.role || ""} ${u.program || ""}`
        }
      />
    </div>
  );
}
