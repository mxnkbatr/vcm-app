"use client";

import React from "react";
import DataTable, { Column } from "@/app/components/admin/DataTable";

type UserRow = {
  _id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  program?: string;
  updatedAt?: string;
};

export default function UsersTab() {
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const columns: Array<Column<UserRow>> = [
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div className="min-w-[220px]">
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
      header: "Role",
      render: (u) => (
        <span className="badge" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
          {(u.role || "guest").toString()}
        </span>
      ),
      sortValue: (u) => u.role || "",
    },
    {
      key: "program",
      header: "Program",
      render: (u) => <span>{u.program || "—"}</span>,
      sortValue: (u) => u.program || "",
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (u) => (
        <span style={{ color: "var(--label2)" }}>
          {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "—"}
        </span>
      ),
      sortValue: (u) => (u.updatedAt ? new Date(u.updatedAt).getTime() : 0),
    },
  ];

  if (loading) {
    return (
      <div className="card p-6">
        <div className="t-headline">Loading users…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="t-title3">Users</div>
        <div className="t-caption">Search, sort, and manage users</div>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        pageSize={25}
        searchPlaceholder="Search name / email / phone…"
        getSearchText={(u) => `${u.fullName || ""} ${u.email || ""} ${u.phone || ""} ${u.role || ""}`}
      />
    </div>
  );
}

