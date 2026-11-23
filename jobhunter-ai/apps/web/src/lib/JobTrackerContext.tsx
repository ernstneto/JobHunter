"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApplicationStatus,
  ApplicationStatusStats,
  JobApplication,
  STORAGE_KEY,
  computeStats,
  generateId,
  loadApplications,
} from "./jobTracker";

export interface AddApplicationInput {
  job_id: string;
  job_title: string;
  company: string;
  url?: string;
  location?: string;
  job_type?: string;
  match_score?: number;
  cv_text?: string;
  note?: string;
  applied_at?: string;
  status?: ApplicationStatus;
}

export interface AddApplicationResult {
  id: string;
  updated: boolean;
}

interface JobTrackerContextValue {
  applications: JobApplication[];
  addApplication: (input: AddApplicationInput) => AddApplicationResult;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  removeApplication: (id: string) => void;
  getByJobId: (jobId: string) => JobApplication | undefined;
  stats: ApplicationStatusStats;
}

const defaultStats: ApplicationStatusStats = {
  candidado: 0,
  entrevista: 0,
  oferta: 0,
  rejeitado: 0,
  total: 0,
};

const JobTrackerContext = createContext<JobTrackerContextValue>({
  applications: [],
  addApplication: () => ({ id: "", updated: false }),
  updateStatus: () => {},
  removeApplication: () => {},
  getByJobId: () => undefined,
  stats: defaultStats,
});

export const useJobTracker = () => useContext(JobTrackerContext);

export function JobTrackerProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Carregar do localStorage no primeiro load
  useEffect(() => {
    setApplications(loadApplications());
  }, []);

  const persist = useCallback((next: JobApplication[]) => {
    setApplications(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Armazenamento indisponível: mantém o estado em memória sem quebrar o fluxo.
    }
  }, []);

  const addApplication = useCallback(
    (input: AddApplicationInput): AddApplicationResult => {
      const now = new Date().toISOString();
      const existing = applications.find((app) => app.job_id === input.job_id);

      // Mesma vaga já registrada: atualiza os campos enviados, preserva os demais.
      if (existing) {
        const updated: JobApplication = {
          ...existing,
          job_title: input.job_title || existing.job_title,
          company: input.company || existing.company,
          url: input.url ?? existing.url,
          location: input.location ?? existing.location,
          job_type: input.job_type ?? existing.job_type,
          match_score: input.match_score ?? existing.match_score,
          cv_text: input.cv_text ?? existing.cv_text,
          note: input.note ?? existing.note,
          status: input.status ?? existing.status,
          applied_at: input.applied_at || existing.applied_at,
        };
        persist(applications.map((app) => (app.id === existing.id ? updated : app)));
        return { id: updated.id, updated: true };
      }

      const record: JobApplication = {
        id: generateId(),
        job_id: input.job_id,
        job_title: input.job_title,
        company: input.company,
        url: input.url,
        location: input.location,
        job_type: input.job_type,
        match_score: input.match_score,
        cv_text: input.cv_text,
        note: input.note,
        applied_at: input.applied_at || now,
        created_at: now,
        status: input.status || "candidado",
      };
      persist([record, ...applications]);
      return { id: record.id, updated: false };
    },
    [applications, persist]
  );

  const updateStatus = useCallback(
    (id: string, status: ApplicationStatus) => {
      persist(applications.map((app) => (app.id === id ? { ...app, status } : app)));
    },
    [applications, persist]
  );

  const removeApplication = useCallback(
    (id: string) => {
      persist(applications.filter((app) => app.id !== id));
    },
    [applications, persist]
  );

  const getByJobId = useCallback(
    (jobId: string) => applications.find((app) => app.job_id === jobId),
    [applications]
  );

  const stats = useMemo(() => computeStats(applications), [applications]);

  return (
    <JobTrackerContext.Provider
      value={{ applications, addApplication, updateStatus, removeApplication, getByJobId, stats }}
    >
      {children}
    </JobTrackerContext.Provider>
  );
}
