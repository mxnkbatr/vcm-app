"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Upload, FileText, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const DOCUMENT_FIELDS = [
    { key: "passport", label: "Passport", type: "image-or-pdf", required: true },
    { key: "emongoliaCert", label: "E-mongolia Registration Certificate", type: "pdf", required: true },
    { key: "marriageCert", label: "Marriage Certificate", type: "pdf", required: false },
    { key: "residenceCert", label: "Residence Certificate", type: "pdf", required: true },
    { key: "birthCert", label: "Birth Certificate", type: "pdf", required: true },
    { key: "educationCert", label: "Education Certificate (High School)", type: "pdf", required: true },
    { key: "bachelorDiploma", label: "Bachelor's Diploma", type: "pdf", required: true },
    { key: "driverLicense", label: "Driver's License", type: "image-or-pdf", required: true },
    { key: "englishCert", label: "English Certificate (IELTS/TOEFL B1-B2)", type: "image-or-pdf", required: true },
    { key: "medicalRecords", label: "Medical Records", type: "pdf", required: true },
    { key: "mentalHealthExam", label: "Mental Health Examination", type: "pdf", required: true },
    { key: "professionalExp", label: "Professional Experience (Optional)", type: "pdf", required: false },
];

export default function SubmitDocuments() {
    const { user } = useUser();
    const [documents, setDocuments] = useState<Record<string, string>>({});
    const [uploading, setUploading] = useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = useState(false);

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
            alert("Upload failed. Please try again.");
        } finally {
            setUploading({ ...uploading, [key]: false });
        }
    };

    const handleSubmit = async () => {
        // Validate required fields
        const missing = DOCUMENT_FIELDS
            .filter(f => f.required && !documents[f.key])
            .map(f => f.label);

        if (missing.length > 0) {
            alert(`Please upload the following required documents:\n\n${missing.join("\n")}`);
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch("/api/user/submit-documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documents }),
            });

            if (res.ok) {
                alert("Documents submitted successfully! Our team will review them shortly.");
                window.location.href = "/dashboard";
            } else {
                throw new Error("Submission failed");
            }
        } catch (error) {
            alert("Failed to submit documents. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const uploadedCount = Object.values(documents).filter(Boolean).length;
    const requiredCount = DOCUMENT_FIELDS.filter(f => f.required).length;

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-4">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">Submit Required Documents</h1>
                    <p className="text-lg text-slate-500">Upload all required documents to complete your Au Pair application.</p>

                    {/* Progress Bar */}
                    <div className="mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-700">Upload Progress</span>
                            <span className="text-sm font-bold text-[#E31B23]">{uploadedCount} / {DOCUMENT_FIELDS.length}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#E31B23] to-[#00C896]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(uploadedCount / DOCUMENT_FIELDS.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Document Upload Grid */}
                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {DOCUMENT_FIELDS.map((field) => (
                            <DocumentUploadCard
                                key={field.key}
                                field={field}
                                url={documents[field.key]}
                                uploading={uploading[field.key]}
                                onUpload={(file) => handleUpload(field.key, file)}
                            />
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-sm font-bold text-slate-700 mb-1">Ready to submit?</p>
                            <p className="text-xs text-slate-500">Make sure all required documents are uploaded before submitting.</p>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || uploadedCount < requiredCount}
                            className={`min-w-[200px] py-4 px-8 rounded-xl font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 ${submitting || uploadedCount < requiredCount
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                                : "bg-[#E31B23] text-white hover:bg-red-700 shadow-red-100"
                                }`}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} /> Submitting...
                                </span>
                            ) : (
                                "Submit All Documents"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DocumentUploadCard = ({ field, url, uploading, onUpload }: {
    field: typeof DOCUMENT_FIELDS[0];
    url: string;
    uploading: boolean;
    onUpload: (file: File) => void;
}) => (
    <div className={`border-2 border-dashed rounded-2xl p-6 transition-all ${url
        ? "border-[#00C896] bg-green-50/30"
        : field.required
            ? "border-slate-200 hover:border-[#E31B23]"
            : "border-slate-100 hover:border-slate-300"
        }`}>
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 mb-1">{field.label}</p>
                <p className="text-xs text-slate-500">
                    {field.type === "pdf" ? "PDF only" : "JPG, PNG or PDF"}
                </p>
            </div>
            {field.required && !url && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded">
                    Required
                </span>
            )}
            {url && (
                <CheckCircle size={20} className="text-[#00C896]" />
            )}
        </div>

        {url ? (
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#00C896] text-sm font-bold">
                    <CheckCircle size={16} /> Document uploaded
                </div>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#E31B23] hover:underline font-bold flex items-center gap-1"
                >
                    View uploaded file →
                </a>
            </div>
        ) : (
            <label className="cursor-pointer block">
                <div className={`flex flex-col items-center justify-center py-6 px-4 rounded-xl border-2 border-dashed transition-all ${uploading ? "border-[#E31B23] bg-red-50" : "border-slate-200 hover:border-[#E31B23] hover:bg-slate-50"
                    }`}>
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin text-[#E31B23] mb-2" size={24} />
                            <span className="text-sm font-bold text-[#E31B23]">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload size={24} className="text-slate-400 mb-2" />
                            <span className="text-sm font-bold text-slate-600">Click to upload</span>
                            <span className="text-xs text-slate-400 mt-1">Max 10MB</span>
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
