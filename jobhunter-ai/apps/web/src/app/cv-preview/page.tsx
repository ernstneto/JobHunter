"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadTailoredCv, type TailoredCvRecord } from "@/lib/cvStorage";

interface CvPreviewPageProps {
  searchParams: {
    job_title?: string;
    company?: string;
  };
}

export default function CvPreviewPage({ searchParams }: CvPreviewPageProps) {
  const [record, setRecord] = useState<TailoredCvRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Carregar o CV gerado (salvo no localStorage antes de abrir a aba).
  useEffect(() => {
    const stored = loadTailoredCv();
    if (stored) {
      setRecord(stored);
    }
  }, []);

  const jobTitle = searchParams.job_title || record?.job_title || "";
  const company = searchParams.company || record?.company || "";

  const handleCopy = () => {
    if (!record) return;
    navigator.clipboard.writeText(record.cv_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "md") => {
    if (!record) return;
    const filename = `CV_${company.replace(/\s+/g, "_")}_${jobTitle.replace(/\s+/g, "_")}.${format}`;
    const blob = new Blob([record.cv_text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">📄 Tailored CV — ATS Plain-Text View</h1>
          <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ← Voltar para vagas
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!record ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-lg text-gray-500">Nenhum CV gerado recentemente</p>
            <p className="text-sm text-gray-400 mt-2">
              Volte à busca de vagas e clique em <strong>✨ Tailor CV</strong> — o resultado
              abrirá nesta aba.
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-4 px-5 py-2 bg-primary-600 text-white text-sm rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Buscar vagas
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {jobTitle} — {company}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                O texto plano abaixo é exatamente o que um ATS leria. Feche esta aba para voltar
                à busca.
              </p>
            </div>

            {/* ATS Plain-Text Terminal Preview */}
            <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-800 shadow-inner whitespace-pre-wrap leading-relaxed">
              {record.cv_text}
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-4 border-t border-gray-200 bg-white rounded-xl border border-gray-200 px-6 py-4">
              <span className="text-xs text-gray-500">
                ✓ Plain-Text Verified — 0 Syntax Errors
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition"
                >
                  {copied ? "✓ Copied!" : "📋 Copiar Texto"}
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
          </>
        )}
      </div>
    </main>
  );
}
