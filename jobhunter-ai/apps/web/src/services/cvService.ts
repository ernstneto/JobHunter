import { apiClient } from "@/lib/api";

export interface QuizResponse {
    job_id: string;
    questions: string[];
}

export interface CVGenerateRequest {
    job_title: string;
    company: string,
    description_snippet: string;
    missing_skills: string[];
    confirmed_skills: string[];
    master_cv_text: string;
}

export async function fetchSkillQuiz(jobId: string, missingSkills: string[]): Promise<QuizResponse> {
    const response = await apiClient.get<QuizResponse>("/api/v1/cv/quiz", {
        params: {
            job_id: jobId,
            missing_skills: missingSkills.join(","),
        },
    });
    return response.data;
}

export async function generateTailoredCv(data: CVGenerateRequest): Promise<{ cv_text: string }> {
    const response = await apiClient.post<{ cv_text: string }>("/api/v1/cv/generate", data);
    return response.data;
}