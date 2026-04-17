"use client";

import React, { useMemo, useState } from "react";
import DataTable, { Column } from "@/app/components/admin/DataTable";
import { Plus, Pencil, Trash2, UploadCloud } from "lucide-react";
import { signedCloudinaryUpload } from "@/app/components/admin/upload";

type I18n = { en: string; mn: string; de?: string };
type Course = {
  _id: string;
  slug: string;
  title: I18n;
  description: I18n;
  thumbnailUrl?: string;
  price: number;
  currency: string;
  isFree: boolean;
  status: "draft" | "published" | "archived";
  tags?: string[];
  updatedAt?: string;
};

type Module = { _id: string; courseId: string; title: I18n; order: number; updatedAt?: string };
type Lesson = {
  _id: string;
  courseId: string;
  moduleId: string;
  title: I18n;
  description: I18n;
  order: number;
  status: "draft" | "published" | "archived";
  isFreePreview: boolean;
  videoProvider: "cloudinary" | "mux" | "youtube" | "custom";
  videoAssetId: string;
};

export default function LmsAdmin() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [modules, setModules] = React.useState<Module[]>([]);
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refreshCourses = React.useCallback(() => {
    setLoading(true);
    fetch("/api/admin/lms/courses")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCourses(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const refreshModules = React.useCallback((courseId: string) => {
    fetch(`/api/admin/lms/modules?courseId=${courseId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setModules(Array.isArray(d) ? d : []));
  }, []);

  const refreshLessons = React.useCallback((courseId: string, moduleId?: string) => {
    const qs = new URLSearchParams({ courseId });
    if (moduleId) qs.set("moduleId", moduleId);
    fetch(`/api/admin/lms/lessons?${qs.toString()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setLessons(Array.isArray(d) ? d : []));
  }, []);

  React.useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  React.useEffect(() => {
    if (!selectedCourseId) return;
    refreshModules(selectedCourseId);
    refreshLessons(selectedCourseId);
  }, [selectedCourseId, refreshModules, refreshLessons]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="t-title3">LMS Editor</div>
            <div className="t-caption">Create courses, modules, and lessons. Publish when ready.</div>
          </div>
          <CourseModal
            triggerLabel="New course"
            onSaved={() => refreshCourses()}
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-6">
          <div className="t-headline">Loading…</div>
        </div>
      ) : (
        <CoursesTable
          rows={courses}
          onSelect={(id) => setSelectedCourseId(id)}
          selectedId={selectedCourseId}
          onRefresh={refreshCourses}
        />
      )}

      {selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ModulesPanel
            course={selectedCourse}
            modules={modules}
            onRefresh={() => refreshModules(selectedCourse._id)}
            onSelectModule={(moduleId) => refreshLessons(selectedCourse._id, moduleId)}
          />
          <LessonsPanel
            course={selectedCourse}
            modules={modules}
            lessons={lessons}
            onRefresh={() => refreshLessons(selectedCourse._id)}
          />
        </div>
      )}
    </div>
  );
}

function CoursesTable({
  rows,
  selectedId,
  onSelect,
  onRefresh,
}: {
  rows: Course[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRefresh: () => void;
}) {
  const cols: Array<Column<Course>> = [
    {
      key: "title",
      header: "Course",
      render: (c) => (
        <button className="press text-left" onClick={() => onSelect(c._id)}>
          <div className="font-bold">{c.title.en}</div>
          <div className="text-xs" style={{ color: "var(--label2)" }}>
            /{c.slug} • {c.status}
          </div>
        </button>
      ),
      sortValue: (c) => c.title.en,
    },
    {
      key: "price",
      header: "Price",
      render: (c) => (
        <span className="badge" style={{ background: "var(--fill2)", color: "var(--label2)" }}>
          {c.isFree ? "FREE" : `${c.currency} ${c.price}`}
        </span>
      ),
      sortValue: (c) => c.isFree ? 0 : c.price,
    },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className="flex gap-2">
          <CourseModal triggerIcon={<Pencil size={16} />} course={c} onSaved={onRefresh} />
          <button
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              if (!confirm("Delete this course?")) return;
              await fetch(`/api/admin/lms/courses?id=${c._id}`, { method: "DELETE" });
              if (selectedId === c._id) onSelect("");
              onRefresh();
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={cols}
      pageSize={10}
      searchPlaceholder="Search course title / slug…"
      getSearchText={(c) => `${c.title.en} ${c.title.mn} ${c.slug} ${c.status}`}
    />
  );
}

function CourseModal({
  triggerLabel,
  triggerIcon,
  course,
  onSaved,
}: {
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  course?: Course;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    slug: course?.slug || "",
    titleEn: course?.title.en || "",
    titleMn: course?.title.mn || "",
    descEn: course?.description.en || "",
    descMn: course?.description.mn || "",
    thumbnailUrl: course?.thumbnailUrl || "",
    price: course?.price ?? 0,
    currency: course?.currency ?? "MNT",
    isFree: course?.isFree ?? true,
    status: course?.status ?? "draft",
    tags: (course?.tags ?? []).join(", "),
  }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...(course ? { id: course._id } : {}),
        slug: form.slug.trim(),
        title: { en: form.titleEn.trim(), mn: form.titleMn.trim(), de: "" },
        description: { en: form.descEn.trim(), mn: form.descMn.trim(), de: "" },
        thumbnailUrl: form.thumbnailUrl,
        price: Number(form.price || 0),
        currency: form.currency,
        isFree: !!form.isFree,
        status: form.status as any,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      const res = await fetch("/api/admin/lms/courses", {
        method: course ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Save failed");
        return;
      }
      setOpen(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        className={triggerLabel ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
        onClick={() => setOpen(true)}
      >
        {triggerIcon || <Plus size={16} />} {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-5 w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="t-title3">{course ? "Edit course" : "New course"}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
              <Field label="Currency" value={form.currency} onChange={(v) => setForm({ ...form, currency: v })} />
              <Field label="Title (EN)" value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} />
              <Field label="Title (MN)" value={form.titleMn} onChange={(v) => setForm({ ...form, titleMn: v })} />
              <Field label="Price" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
              <Field label="Tags (comma)" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Text label="Description (EN)" value={form.descEn} onChange={(v) => setForm({ ...form, descEn: v })} />
              <Text label="Description (MN)" value={form.descMn} onChange={(v) => setForm({ ...form, descMn: v })} />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="t-caption2 uppercase tracking-widest">Thumbnail</label>
                <div className="flex gap-2">
                  <input
                    className="input"
                    value={form.thumbnailUrl}
                    placeholder="https://..."
                    onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  />
                  <label className="btn btn-secondary btn-sm">
                    <UploadCloud size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const up = await signedCloudinaryUpload({ file: f, folder: "vcm/admin/lms", resourceType: "image" });
                        setForm((s) => ({ ...s, thumbnailUrl: up.secureUrl }));
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="t-caption2 uppercase tracking-widest">Status</label>
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="row press">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                />
                <span className="font-bold">Free course</span>
              </label>
              <button className="btn btn-primary btn-full" onClick={submit} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ModulesPanel({
  course,
  modules,
  onRefresh,
  onSelectModule,
}: {
  course: Course;
  modules: Module[];
  onRefresh: () => void;
  onSelectModule: (moduleId: string) => void;
}) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="t-title3">Modules</div>
          <div className="t-caption">Course: {course.title.en}</div>
        </div>
        <ModuleModal courseId={course._id} onSaved={onRefresh} />
      </div>
      <div className="space-y-2">
        {modules.map((m) => (
          <button key={m._id} className="row w-full text-left press" onClick={() => onSelectModule(m._id)}>
            <div className="flex-1">
              <div className="font-bold">{m.title.en}</div>
              <div className="t-caption">Order: {m.order}</div>
            </div>
            <div className="flex gap-2">
              <ModuleModal courseId={course._id} module={m} onSaved={onRefresh} />
              <button
                className="btn btn-secondary btn-sm"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!confirm("Delete this module?")) return;
                  await fetch(`/api/admin/lms/modules?id=${m._id}`, { method: "DELETE" });
                  onRefresh();
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </button>
        ))}
        {modules.length === 0 && <div className="t-footnote">No modules yet.</div>}
      </div>
    </div>
  );
}

function ModuleModal({
  courseId,
  module,
  onSaved,
}: {
  courseId: string;
  module?: Module;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    titleEn: module?.title.en || "",
    titleMn: module?.title.mn || "",
    order: module?.order ?? 0,
  }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...(module ? { id: module._id } : {}),
        courseId,
        title: { en: form.titleEn.trim(), mn: form.titleMn.trim(), de: "" },
        order: Number(form.order || 0),
      };
      const res = await fetch("/api/admin/lms/modules", {
        method: module ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Save failed");
        return;
      }
      setOpen(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        {module ? <Pencil size={16} /> : <Plus size={16} />} {module ? "" : "Add"}
      </button>
      {open && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-5 w-full max-w-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="t-title3">{module ? "Edit module" : "New module"}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title (EN)" value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} />
              <Field label="Title (MN)" value={form.titleMn} onChange={(v) => setForm({ ...form, titleMn: v })} />
              <Field label="Order" type="number" value={String(form.order)} onChange={(v) => setForm({ ...form, order: Number(v) })} />
            </div>
            <button className="btn btn-primary btn-full" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function LessonsPanel({
  course,
  modules,
  lessons,
  onRefresh,
}: {
  course: Course;
  modules: Module[];
  lessons: Lesson[];
  onRefresh: () => void;
}) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="t-title3">Lessons</div>
          <div className="t-caption">Course: {course.title.en}</div>
        </div>
        <LessonModal courseId={course._id} modules={modules} onSaved={onRefresh} />
      </div>
      <div className="space-y-2">
        {lessons.map((l) => (
          <div key={l._id} className="row">
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate">{l.title.en}</div>
              <div className="t-caption">
                {l.status} • module {modules.find((m) => m._id === l.moduleId)?.title.en || "—"} • order {l.order}
              </div>
            </div>
            <div className="flex gap-2">
              <LessonModal courseId={course._id} modules={modules} lesson={l} onSaved={onRefresh} />
              <button
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  if (!confirm("Delete this lesson?")) return;
                  await fetch(`/api/admin/lms/lessons?id=${l._id}`, { method: "DELETE" });
                  onRefresh();
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {lessons.length === 0 && <div className="t-footnote">No lessons yet.</div>}
      </div>
    </div>
  );
}

function LessonModal({
  courseId,
  modules,
  lesson,
  onSaved,
}: {
  courseId: string;
  modules: Module[];
  lesson?: Lesson;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    moduleId: lesson?.moduleId || modules[0]?._id || "",
    titleEn: lesson?.title.en || "",
    titleMn: lesson?.title.mn || "",
    descEn: lesson?.description.en || "",
    descMn: lesson?.description.mn || "",
    order: lesson?.order ?? 0,
    status: lesson?.status ?? "draft",
    isFreePreview: lesson?.isFreePreview ?? false,
    videoProvider: lesson?.videoProvider ?? "custom",
    videoAssetId: lesson?.videoAssetId ?? "",
    durationSeconds: lesson?.order ?? 0,
  }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...(lesson ? { id: lesson._id } : {}),
        courseId,
        moduleId: form.moduleId,
        title: { en: form.titleEn.trim(), mn: form.titleMn.trim(), de: "" },
        description: { en: form.descEn.trim(), mn: form.descMn.trim(), de: "" },
        order: Number(form.order || 0),
        status: form.status as any,
        isFreePreview: !!form.isFreePreview,
        videoProvider: form.videoProvider as any,
        videoAssetId: form.videoAssetId,
        durationSeconds: Number(form.durationSeconds || 0),
      };
      const res = await fetch("/api/admin/lms/lessons", {
        method: lesson ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || "Save failed");
        return;
      }
      setOpen(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        {lesson ? <Pencil size={16} /> : <Plus size={16} />} {lesson ? "" : "Add"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-5 w-full max-w-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="t-title3">{lesson ? "Edit lesson" : "New lesson"}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>Close</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="t-caption2 uppercase tracking-widest">Module</label>
                <select className="input" value={form.moduleId} onChange={(e) => setForm({ ...form, moduleId: e.target.value })}>
                  {modules.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title.en}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Order" type="number" value={String(form.order)} onChange={(v) => setForm({ ...form, order: Number(v) })} />
              <Field label="Title (EN)" value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} />
              <Field label="Title (MN)" value={form.titleMn} onChange={(v) => setForm({ ...form, titleMn: v })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Text label="Description (EN)" value={form.descEn} onChange={(v) => setForm({ ...form, descEn: v })} />
              <Text label="Description (MN)" value={form.descMn} onChange={(v) => setForm({ ...form, descMn: v })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="t-caption2 uppercase tracking-widest">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </div>
              <label className="row press">
                <input type="checkbox" checked={form.isFreePreview} onChange={(e) => setForm({ ...form, isFreePreview: e.target.checked })} />
                <span className="font-bold">Free preview</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="t-caption2 uppercase tracking-widest">Video URL / publicId</label>
                <input className="input" value={form.videoAssetId} onChange={(e) => setForm({ ...form, videoAssetId: e.target.value })} placeholder="https://… or publicId" />
              </div>
              <div className="space-y-1">
                <label className="t-caption2 uppercase tracking-widest">Provider</label>
                <select className="input" value={form.videoProvider} onChange={(e) => setForm({ ...form, videoProvider: e.target.value as any })}>
                  <option value="custom">custom</option>
                  <option value="youtube">youtube</option>
                  <option value="cloudinary">cloudinary</option>
                  <option value="mux">mux</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary btn-full" onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="t-caption2 uppercase tracking-widest">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="t-caption2 uppercase tracking-widest">{label}</label>
      <textarea className="input" rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

