/**
 * Job Tracker CRM — modelo de dados, status e helpers de persistência.
 *
 * POC de fase: persistência em localStorage (chave `job_applications`).
 * Produção futura: migrar para Supabase (mesmo contrato de dados, trocando
 * apenas a camada de armazenamento no JobTrackerContext).
 */

export type ApplicationStatus = "candidado" | "entrevista" | "oferta" | "rejeitado";

export interface JobApplication {
  id: string;
  job_id: string;
  job_title: string;
  company: string;
  url?: string;
  location?: string;
  job_type?: string;
  match_score?: number;
  /** Versão do CV enviada para esta vaga (texto plano ATS). */
  cv_text?: string;
  note?: string;
  applied_at: string; // ISO date
  created_at: string; // ISO datetime
  status: ApplicationStatus;
}

export interface ApplicationStatusStats {
  candidado: number;
  entrevista: number;
  oferta: number;
  rejeitado: number;
  total: number;
}

export const STATUS_ORDER: ApplicationStatus[] = [
  "candidado",
  "entrevista",
  "oferta",
  "rejeitado",
];

export const STATUS_META: Record<ApplicationStatus, { label: string; badge: string }> = {
  candidado: { label: "Candidato", badge: "bg-blue-100 text-blue-800" },
  entrevista: { label: "Entrevista", badge: "bg-amber-100 text-amber-800" },
  oferta: { label: "Oferta", badge: "bg-green-100 text-green-800" },
  rejeitado: { label: "Rejeitado", badge: "bg-red-100 text-red-800" },
};

export const STORAGE_KEY = "job_applications";

/** Próximo status no pipeline (candidado → entrevista → oferta). */
export const nextStatus = (status: ApplicationStatus): ApplicationStatus | null => {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx < 0 || idx === STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
};

export const generateId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `app_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const isValidApplication = (value: unknown): value is JobApplication => {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.job_id === "string" &&
    typeof v.job_title === "string" &&
    typeof v.company === "string" &&
    typeof v.status === "string" &&
    STATUS_ORDER.includes(v.status as ApplicationStatus)
  );
};

export const loadApplications = (): JobApplication[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidApplication);
  } catch {
    return [];
  }
};

export const computeStats = (applications: JobApplication[]): ApplicationStatusStats => {
  const stats: ApplicationStatusStats = {
    candidado: 0,
    entrevista: 0,
    oferta: 0,
    rejeitado: 0,
    total: applications.length,
  };
  for (const app of applications) {
    if (app.status in stats) {
      stats[app.status] += 1;
    }
  }
  return stats;
};

export const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};
