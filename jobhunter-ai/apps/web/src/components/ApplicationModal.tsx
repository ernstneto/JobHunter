"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import { useJobTracker } from "@/lib/JobTrackerContext";
import { STATUS_META, STATUS_ORDER, type ApplicationStatus } from "@/lib/jobTracker";

interface ApplicationModalProps {
  job: Job;
  /** Texto do CV gerado na sessão, se houver — é salvo como versão enviada. */
  cvText?: string | null;
  onClose: () => void;
}

export default function ApplicationModal({ job, cvText, onClose }: ApplicationModalProps) {
  const { addApplication, getByJobId } = useJobTracker();
  const existing = getByJobId(job.job_id);

  const [status, setStatus] = useState<ApplicationStatus>(existing?.status ?? "candidado");
  const [note, setNote] = useState<string>(existing?.note ?? "");
  const [saveCv, setSaveCv] = useState<boolean>(Boolean(existing?.cv_text || cvText));
  const [registered, setRegistered] = useState<boolean>(false);

  const handleRegister = () => {
    const result = addApplication({
      job_id: job.job_id,
      job_title: job.title,
      company: job.company,
      url: job.url,
      location: job.location,
      job_type: job.job_type,
      match_score: job.match_score,
      cv_text: saveCv ? cvText ?? undefined : undefined,
      note: note.trim() || undefined,
      status,
    });
    setRegistered(true);
    // Feedback breve e fechamento automático
    setTimeout(onClose, result.updated ? 600 : 1200);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">📝 Candidatar-se</h2>
        <p className="text-sm text-gray-600 mb-6">
          Registrar esta vaga no Job Tracker. Dados salvos localmente (POC em localStorage).
        </p>

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4">
          <p className="text-sm font-semibold text-gray-900">{job.title}</p>
          <p className="text-xs text-gray-600">
            {job.company} · {job.location}, {job.country}
          </p>
          {existing && (
            <p className="text-xs text-amber-700 mt-1">
              Esta vaga já está no tracker — confirmar atualiza o registro.
            </p>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status inicial
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Link da vaga, contato, prazos, observações..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm resize-none"
            />
          </div>

          {cvText && (
            <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer bg-purple-50 border border-purple-100 rounded-lg p-3">
              <input
                type="checkbox"
                checked={saveCv}
                onChange={(e) => setSaveCv(e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <span>
                Salvar a versão do CV gerada nesta vaga como <strong>CV enviado</strong>
                (texto plano ATS).
              </span>
            </label>
          )}

          {existing?.cv_text && !cvText && (
            <p className="text-xs text-gray-500">
              ⚠ Versão do CV já registrada: {existing.cv_text.slice(0, 60)}...
            </p>
          )}
        </div>

        {registered && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
            ✓ Vaga registrada no Job Tracker! Acompanhe em “Track de Candidaturas”.
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRegister}
            className="px-6 py-2 bg-primary-600 text-white text-sm rounded-lg font-bold hover:bg-primary-700 transition"
          >
            Confirmar candidatura →
          </button>
        </div>
      </div>
    </div>
  );
}
