"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Upload, FileText, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { IOSAlert } from "@/app/components/iOSAlert";

const DOCUMENT_KEYS = [
    { key: "passport", type: "image-or-pdf", required: false },
    { key: "emongoliaCert", type: "pdf", required: false },
    { key: "marriageCert", type: "pdf", required: false },
    { key: "residenceCert", type: "pdf", required: false },
    { key: "birthCert", type: "pdf", required: false },
    { key: "educationCert", type: "pdf", required: false },
    { key: "bachelorDiploma", type: "pdf", required: false },
    { key: "driverLicense", type: "image-or-pdf", required: false },
    { key: "englishCert", type: "image-or-pdf", required: false },
    { key: "medicalRecords", type: "pdf", required: false },
    { key: "mentalHealthExam", type: "pdf", required: false },
    { key: "professionalExp", type: "pdf", required: false },
];

export default function SubmitDocuments() {
    const t = useTranslations("SubmitDocuments");
    const { data: session } = useSession();
    const user = session?.user;
    const [documents, setDocuments] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const DOCUMENT_FIELDS = DOCUMENT_KEYS.map(field => ({
        ...field,
        label: t(`labels.${field.key}`)
    }));

    const handleUpload = async (key: string, file: File) => {
        setUploading({ ...uploading, [key]: true });

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload-document", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { url } = await res.json();
            setDocuments({ ...documents, [key]: url });
        } catch (error) {
            console.error("Upload error:", error);
            setAlert({ title: "Алдаа", message: t("uploadError"), type: 'error' });
        } finally {
            setUploading({ ...uploading, [key]: false });
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            const res = await fetch("/api/user/submit-documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents }),
            });

            if (res.ok) {
                setAlert({ title: "Амжилттай!", message: t("successMsg"), type: 'success' });
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            setAlert({ title: "Алдаа", message: t("submitError"), type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const uploadedCount = Object.values(documents).filter(Boolean).length;

    return (
        <div className="page">
            <div className="page-inner space-y-6">
                {/* Header */}
                <div className="pt-2">
                    <Link href="/dashboard" className="inline-flex items-center gap-1.5 py-2 opacity-60 active:opacity-100 transition-opacity font-semibold text-[13px]" style={{ color: 'var(--blue)' }}>
                        <ArrowLeft size={16} /> {t("back")}
                    </Link>
                    <h1 className="t-large-title">{t("title")}</h1>
                    <p className="t-subhead mt-1" style={{ color: 'var(--label2)' }}>{t("subtitle")}</p>

                    {/* Progress Bar */}
                    <div className="card p-4 mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="t-caption font-bold" style={{ color: 'var(--label2)' }}>{t("progress")}</span>
                            <span className="t-caption font-bold" style={{ color: 'var(--blue)' }}>{uploadedCount} / {DOCUMENT_FIELDS.length}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                            <motion.div
                                className="h-full"
                                style={{ background: 'var(--blue)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(uploadedCount / DOCUMENT_FIELDS.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Document Upload Grid */}
                <div className="space-y-4 stagger">
                    {DOCUMENT_FIELDS.map((field) => (
                        <DocumentUploadCard
                            key={field.key}
                            field={field}
                            url={documents[field.key]}
                            uploading={uploading[field.key]}
                            onUpload={(file) => handleUpload(field.key, file)}
                            t={t}
                        />
                    ))}
                </div>

                {/* Submit Button */}
                <div className="card p-5 space-y-4">
                    <div>
                        <p className="t-headline mb-1">{t("finishTitle")}</p>
                        <p className="t-footnote" style={{ color: 'var(--label2)' }}>{t("finishDesc")}</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn btn-primary btn-full"
                    >
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="ios-spinner !w-4 !h-4" /> {t("processing")}
                            </span>
                        ) : (
                            t("submitBtn")
                        )}
                    </button>
                </div>
            </div>

            <IOSAlert 
                isOpen={!!alert} 
                onClose={() => {
                    const wasSuccess = alert?.type === 'success';
                    setAlert(null);
                    if (wasSuccess) window.location.href = "/dashboard";
                }} 
                title={alert?.title || ""} 
                message={alert?.message || ""} 
                type={alert?.type} 
            />
        </div>
    );
}

const DocumentUploadCard = ({ field, url, uploading, onUpload, t }: {
    field: any;
    url: string;
    uploading: boolean;
    onUpload: (file: File) => void;
    t: any;
}) => (
    <div className={`card p-5 transition-all ${url ? "ring-1 ring-emerald-500/30 bg-emerald-50/10" : ""}`}>
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <p className="t-headline mb-1">{field.label}</p>
                <p className="t-caption" style={{ color: 'var(--label3)' }}>
                    {field.type === "pdf" ? t("card.pdfOnly") : t("card.imageOrPdf")}
                </p>
            </div>
            {field.required && !url && (
                <span className="badge text-[10px] uppercase" style={{ background: 'var(--red-dim)', color: 'var(--red)' }}>
                    {t("card.required")}
                </span>
            )}
            {url && (
                <div className="icon-box-sm" style={{ background: 'var(--emerald-dim)' }}>
                    <CheckCircle size={16} style={{ color: 'var(--emerald)' }} />
                </div>
            )}
        </div>

        {url ? (
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 t-caption font-semibold" style={{ color: 'var(--emerald)' }}>
                    <FileText size={14} /> {t("card.uploaded")}
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="t-caption font-semibold"
                    style={{ color: 'var(--blue)' }}
                >
                    {t("card.viewFile")}
                </a>
            </div>
        ) : (
            <label className="cursor-pointer block">
                <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl border border-dashed transition-all" 
                     style={{ borderColor: 'var(--label4)', background: 'var(--bg)' }}>
                    {uploading ? (
                        <>
                            <div className="ios-spinner mb-2" />
                            <span className="t-caption font-bold" style={{ color: 'var(--blue)' }}>{t("card.uploading")}</span>
                        </>
                    ) : (
                        <>
                            <Upload size={20} style={{ color: 'var(--label3)' }} className="mb-2" />
                            <span className="t-caption font-bold" style={{ color: 'var(--label2)' }}>{t("card.clickUpload")}</span>
                            <span className="t-caption2 mt-1" style={{ color: 'var(--label3)' }}>{t("card.maxSize")}</span>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept={field.type === "pdf" ? ".pdf" : "image/*,.pdf"}
                    onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                    disabled={uploading}
                />
            </label>
        )}
    </div>
);
