"use client";

import { useState } from "react";
import Link from "next/link";
import { useJobTracker } from "@/lib/JobTrackerContext";
import {
  STATUS_META,
  STATUS_ORDER,
  nextStatus,
  formatDate,
  type ApplicationStatus,
  type JobApplication,
} from "@/lib/jobTracker";

type Filter = "all" | ApplicationStatus;

export default function ApplicationsPage() {
  const { applications, updateStatus, removeApplication, stats } = useJobTracker();
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered =
    filter === "all"
      ? applications
      : applications.filter((app) => app.status === filter);

  const statCards: { key: Filter; label: string; value: number; color: string }[] = [
    { key: "all", label: "Total", value: stats.total, color: "bg-gray-100 text-gray-800" },
    { key: "candidado", label: "Candidato", value: stats.candidado, color: "bg-blue-100 text-blue-800" },
    { key: "entrevista", label: "Entrevista", value: stats.entrevista, color: "bg-amber-100 text-amber-800" },
    { key: "oferta", label: "Oferta", value: stats.oferta, color: "bg-green-100 text-green-800" },
    { key: "rejeitado", label: "Rejeitado", value: stats.rejeitado, color: "bg-red-100 text-red-800" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">📋 Track de Candidaturas</h1>
          <Link
            href="/jobs"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Voltar para vagas
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {statCards.map((card) => (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilter(card.key)}
              className={`text-left rounded-xl border p-4 transition hover:shadow-md ${
                filter === card.key ? "border-primary-300 ring-2 ring-primary-100" : "border-gray-200 bg-white"
              }`}
            >
              <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2 ${card.color}`}>
                {card.label}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", ...STATUS_ORDER] as Filter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === s
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_META[s].label}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-lg text-gray-500">Nenhuma candidatura registrada</p>
            <p className="text-sm text-gray-400 mt-2">
              Use o botão “📝 Candidatar-se” em uma vaga da página de busca.
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-4 px-5 py-2 bg-primary-600 text-white text-sm rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Buscar vagas
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((app) => (
              <ApplicationRow
                key={app.id}
                app={app}
                expanded={expandedId === app.id}
                onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                onAdvance={(next) => updateStatus(app.id, next)}
                onRemove={() => removeApplication(app.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

interface ApplicationRowProps {
  app: JobApplication;
  expanded: boolean;
  onToggle: () => void;
  onAdvance: (status: ApplicationStatus) => void;
  onRemove: () => void;
}

function ApplicationRow({ app, expanded, onToggle, onAdvance, onRemove }: ApplicationRowProps) {
  const meta = STATUS_META[app.status];
  const next = nextStatus(app.status);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">{app.job_title}</h3>
          <p className="text-sm text-gray-600 mt-0.5">{app.company}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
            <span>📅 Enviado em {formatDate(app.applied_at)}</span>
            {app.location && <span>📍 {app.location}</span>}
            {app.match_score != null && <span>🎯 {Math.round(app.match_score * 100)}% match</span>}
            {app.cv_text && <span>📄 CV salvo</span>}
          </div>
          {app.note && (
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              {app.note}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${meta.badge}`}>
            {meta.label}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="text-xs text-gray-500 hover:text-gray-800 underline"
          >
            {expanded ? "Ocultar CV" : "Ver CV"}
          </button>
        </div>
      </div>

      {/* CV preview */}
      {expanded && app.cv_text && (
        <div className="mt-4 bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-lg border border-gray-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
          {app.cv_text}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 mt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {next && (
            <button
              type="button"
              onClick={() => onAdvance(next)}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg transition"
            >
              Avançar → {STATUS_META[next].label}
            </button>
          )}
          {app.status !== "rejeitado" && (
            <button
              type="button"
              onClick={() => onAdvance("rejeitado")}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition"
            >
              ❌ Marcar rejeitado
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-700 hover:underline font-medium"
            >
              Abrir vaga ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Remover a candidatura de "${app.job_title}"?`)) onRemove();
            }}
            className="text-xs text-gray-400 hover:text-red-600 font-medium"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
