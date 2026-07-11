"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number | null | undefined;
  /** Shown in mobile card layout */
  mobile?: boolean | "primary" | "secondary";
};

export default function DataTable<T>({
  rows,
  columns,
  pageSize = 20,
  searchPlaceholder = "Хайх…",
  getSearchText,
  onRowClick,
}: {
  rows: T[];
  columns: Array<Column<T>>;
  pageSize?: number;
  searchPlaceholder?: string;
  getSearchText: (row: T) => string;
  onRowClick?: (row: T) => void;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rows;
    return rows.filter((r) => getSearchText(r).toLowerCase().includes(qq));
  }, [rows, q, getSearchText]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const aa = av ?? "";
      const bb = bv ?? "";
      if (aa < bb) return sortDir === "asc" ? -1 : 1;
      if (aa > bb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(start, start + pageSize);

  const mobileColumns = useMemo(() => {
    const tagged = columns.filter((c) => c.mobile && c.key !== "actions");
    if (tagged.length > 0) return tagged;
    return columns.filter((c) => c.key !== "actions").slice(0, 3);
  }, [columns]);

  const toggleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="space-y-3">
      <div className="card p-3">
        <div className="flex items-center gap-2">
          <div className="icon-box-sm" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
            <Search size={16} />
          </div>
          <input
            className="w-full bg-transparent outline-none t-body"
            placeholder={searchPlaceholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
          <div className="badge shrink-0" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
            {sorted.length}
          </div>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {pageRows.map((r, idx) => (
          <div
            key={idx}
            className={`card p-4 admin-data-card ${onRowClick ? "press cursor-pointer" : ""}`}
            onClick={onRowClick ? () => onRowClick(r) : undefined}
            onKeyDown={
              onRowClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(r);
                    }
                  }
                : undefined
            }
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
          >
            {mobileColumns.map((c, ci) => (
              <div
                key={c.key}
                className={ci > 0 ? "mt-2 pt-2 border-t" : ""}
                style={ci > 0 ? { borderColor: "var(--sep)" } : undefined}
              >
                {c.mobile !== "primary" && c.mobile !== true && (
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--label3)" }}>
                    {c.header}
                  </div>
                )}
                {c.render(r)}
              </div>
            ))}
            {columns.some((c) => c.key === "actions") && (
              <div className="mt-3 pt-3 border-t flex justify-end" style={{ borderColor: "var(--sep)" }}>
                {columns.find((c) => c.key === "actions")?.render(r)}
              </div>
            )}
          </div>
        ))}
        {pageRows.length === 0 && (
          <div className="card p-10 text-center t-caption" style={{ color: "var(--label2)" }}>
            Илэрц олдсонгүй
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ background: "var(--bg3)" }}>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="text-left px-4 py-3 whitespace-nowrap select-none"
                    style={{ color: "var(--label2)" }}
                    onClick={() => (c.sortValue ? toggleSort(c.key) : null)}
                  >
                    <span className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                      {c.header}
                      {sortKey === c.key && <span>{sortDir === "asc" ? "↑" : "↓"}</span>}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, idx) => (
                <tr
                  key={idx}
                  style={{ borderTop: "0.5px solid var(--sep)" }}
                  className={onRowClick ? "cursor-pointer hover:bg-[var(--fill3)]" : undefined}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top">
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center" style={{ color: "var(--label2)" }}>
                    Илэрц олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="t-caption">
          {safePage} / {totalPages} хуудас
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm press"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            aria-label="Өмнөх хуудас"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm press"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            aria-label="Дараагийн хуудас"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
