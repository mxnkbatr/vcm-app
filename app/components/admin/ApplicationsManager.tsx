"use client";

import React, { useMemo, useState } from "react";
import DataTable, { Column } from "./DataTable";
import { programLabelMn, statusMeta } from "@/lib/applicationLabels";

type Answer = { questionId: string; label: string; value: string };

type AppRow = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: string;
  level?: string;
  message?: string;
  programId?: string;
  programLabel?: string;
  status?: string;
  statusLabel?: string;
  statusColor?: string;
  answers?: Answer[];
  createdAt?: string;
};

type ProgramOption = { code: string; name?: { mn?: string } };

const STATUS_OPTIONS = [
  { value: "all", label: "Бүгд" },
  { value: "pending_general", label: "Координатор шалгаж байна" },
  { value: "pending_admin", label: "Админ баталгаажуулалт" },
  { value: "approved_volunteer", label: "Баталгаажсан" },
  { value: "rejected", label: "Татгалзсан" },
];

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("mn-MN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ApplicationsManager({
  applications,
  programs,
  onRefresh,
}: {
  applications: AppRow[];
  programs: ProgramOption[];
  onRefresh: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (programFilter !== "all" && a.programId !== programFilter) return false;
      return true;
    });
  }, [applications, statusFilter, programFilter]);

  const updateStatus = async (applicationId: string, status: string) => {
    setBusyId(applicationId);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (!res.ok) alert("Амжилтгүй");
      else {
        setSelected(null);
        onRefresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const columns: Array<Column<AppRow>> = [
    {
      key: "name",
      header: "Өргөдөл гаргагч",
      render: (a) => (
        <button type="button" className="text-left press" onClick={() => setSelected(a)}>
          <div className="font-bold">
            {a.firstName} {a.lastName}
          </div>
          <div className="text-xs" style={{ color: "var(--label3)" }}>
            {a.email || a.phone}
          </div>
        </button>
      ),
      sortValue: (a) => `${a.firstName} ${a.lastName}`,
    },
    {
      key: "program",
      header: "Хөтөлбөр",
      render: (a) => (
        <span className="badge" style={{ background: "var(--blue-dim)", color: "var(--blue)" }}>
          {a.programLabel || programLabelMn(a.programId)}
        </span>
      ),
      sortValue: (a) => a.programId || "",
    },
    {
      key: "created",
      header: "Огноо",
      render: (a) => <span className="text-xs">{formatDate(a.createdAt)}</span>,
      sortValue: (a) => a.createdAt || "",
    },
    {
      key: "status",
      header: "Төлөв",
      render: (a) => {
        const st = statusMeta(a.status);
        return (
          <span className="badge" style={{ background: st.bg, color: st.color }}>
            {a.statusLabel || st.mn}
          </span>
        );
      },
      sortValue: (a) => a.status || "",
    },
    {
      key: "actions",
      header: "",
      render: (a) => (
        <div className="flex gap-2 justify-end flex-wrap">
          <button type="button" className="btn btn-ghost btn-sm press" onClick={() => setSelected(a)}>
            Дэлгэрэнгүй
          </button>
          {a.status === "pending_admin" && (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm press"
                disabled={busyId === a._id}
                onClick={() => updateStatus(a._id, "approved_volunteer")}
              >
                Зөвшөөрөх
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm press"
                style={{ color: "var(--red)" }}
                disabled={busyId === a._id}
                onClick={() => updateStatus(a._id, "rejected")}
              >
                Татгалзах
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="card p-5 space-y-4">
        <div>
          <div className="t-title3">Хөтөлбөрийн өргөдлүүд</div>
          <div className="t-caption">Хэрэглэгчдийн илгээсэн бүртгэлийн хүсэлтүүд</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="block">
            <span className="t-caption2 block mb-1">Хөтөлбөр</span>
            <select className="input" value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
              <option value="all">Бүгд</option>
              {programs.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name?.mn || p.code}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="t-caption2 block mb-1">Төлөв</span>
            <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="t-caption" style={{ color: "var(--label3)" }}>
          Нийт: {filtered.length} өргөдөл
        </p>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        getSearchText={(a) =>
          `${a.firstName} ${a.lastName} ${a.email} ${a.phone} ${a.programId} ${a.message}`
        }
      />

      {selected && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="card w-full max-w-lg max-h-[85dvh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="t-title3">
                  {selected.firstName} {selected.lastName}
                </div>
                <div className="t-caption">{programLabelMn(selected.programId)} · {formatDate(selected.createdAt)}</div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm press" onClick={() => setSelected(null)}>
                Хаах
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Имэйл:</strong> {selected.email}</p>
              <p><strong>Утас:</strong> {selected.phone}</p>
              {selected.age && <p><strong>Нас:</strong> {selected.age}</p>}
              {selected.level && <p><strong>Түвшин:</strong> {selected.level}</p>}
              {selected.message && (
                <div className="p-3 rounded-xl" style={{ background: "var(--fill2)" }}>
                  <p className="font-semibold mb-1">Урам зориг</p>
                  <p style={{ color: "var(--label2)" }}>{selected.message}</p>
                </div>
              )}
            </div>

            {selected.answers && selected.answers.length > 0 && (
              <div className="space-y-2">
                <p className="t-headline">Асуултын хариултууд</p>
                {selected.answers.map((ans) => (
                  <div key={ans.questionId} className="p-3 rounded-xl" style={{ background: "var(--fill3)" }}>
                    <p className="text-xs font-bold mb-1" style={{ color: "var(--label3)" }}>{ans.label}</p>
                    <p style={{ color: "var(--label)" }}>{ans.value || "—"}</p>
                  </div>
                ))}
              </div>
            )}

            {selected.status === "pending_admin" && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-primary flex-1 press"
                  disabled={busyId === selected._id}
                  onClick={() => updateStatus(selected._id, "approved_volunteer")}
                >
                  Зөвшөөрөх
                </button>
                <button
                  type="button"
                  className="btn btn-ghost flex-1 press"
                  style={{ color: "var(--red)" }}
                  disabled={busyId === selected._id}
                  onClick={() => updateStatus(selected._id, "rejected")}
                >
                  Татгалзах
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
