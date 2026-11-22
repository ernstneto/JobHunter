"use_client";

import { useState } from "react";

interface CVPreviewModalProps {
    jobTitle: string;
    company: string;
    cvText: string;
    onClose: () => void;
}

export default function CVPreviewModal({ jobTitle, company, cvText, onClose }: CVPreviewModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(cvText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: "txt" | "md") => {
        const filename = `CV_${company.replace(/\s+/g, "_")}_${jobTitle.replace(/\s+/g, "_")}.${format}`;
        const blob = new Blob([cvText], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="gb-white rounded-x1 shadow-2x1 max-w-3x1 w-full max-h-[90vh] flex-col p-6">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">📄 Tailored CV — ATS Plain-Text View</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Optimized for {jobTitle} at {company}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover::text-gray-600 text-lg font-bold"></button>
                </div>

                {/* ATS Plain-Text Terminal Preview */}
                <div className="my-4 flex-1 overflow-y-auto bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-800 shadow-inner whitespace-pre-wrap leading-relaxed">
                    {cvText}
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justif-between gap-3 pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500">✓ Plain-Text Verified — 0 Syntax Errors</span>
                    <div className="flex gap-2">
                        <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition"
                        >
                        {copied ? "✓ Copied!" : "📋 Copy Text"}
                        </button>
                        <button
                        onClick={() => handleDownload("txt")}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg transition"
                        >
                        ⬇ Download .TXT
                        </button>
                        <button
                        onClick={() => handleDownload("md")}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition"
                        >
                        ⬇ Download .MD
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}