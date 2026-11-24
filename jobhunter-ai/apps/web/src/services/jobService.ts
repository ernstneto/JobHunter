import { apiClient } from "@/lib/api";
import type { JobSearchResponse } from "@/types/job";
import type { UserProfileData } from "@/lib/ProfileContext";

export interface SearchParams {
    query: string;
    country?: string;
    remote?: boolean;
    page?: number;
    num_pages?: number;
    expand_variants?: boolean;
    profile?: UserProfileData;
}

export async function searchJobs(params: SearchParams): Promise<JobSearchResponse> {
    const response = await apiClient.post<JobSearchResponse>("/api/v1/jobs", {
        query: params.query,
        country: params.country ?? "us",
        remote: params.remote ?? false,
        page: params.page ?? 1,
        num_pages: params.num_pages ?? 2,
        expand_variants: params.expand_variants ?? true,
        profile: params.profile ?? undefined,
    });

    return response.data;
}
