/**
 * Armazenamento local da versão do CV gerada pelo Tailor CV.
 *
 * O resultado é salvo em localStorage (POC) para que a pagina /cv-preview,
 * aberta em uma nova aba, consiga carregar o texto completo do CV.
 */

export interface TailoredCvRecord {
  cv_text: string;
  job_title: string;
  company: string;
  created_at: string; // ISO datetime
}

export const TAILOR_CV_KEY = "tailored_cv_preview";

export const saveTailoredCv = (record: Omit<TailoredCvRecord, "created_at">): void => {
  try {
    window.localStorage.setItem(
      TAILOR_CV_KEY,
      JSON.stringify({ ...record, created_at: new Date().toISOString() })
    );
  } catch {
    // Armazenamento indisponível: o preview em nova aba pode ser aberto sem cache.
  }
};

export const loadTailoredCv = (): TailoredCvRecord | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TAILOR_CV_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as TailoredCvRecord).cv_text === "string"
    ) {
      return parsed as TailoredCvRecord;
    }
  } catch {
    // dados corrompidos: ignora e volta para o estado vazio
  }
  return null;
};
