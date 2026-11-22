import { apiClient } from "@/lib/api";
import type { JobSearchResponse } from "@/types/job";

export interface SearchParams {
    query: string;
    country?: string;
    remote?: boolean;
}

export async function searchJobs(params: SearchParams): Promise<JobSearchResponse> {
    const queryParams: Record<string, string> = { q: params.query };

    if (params.country) queryParams.country = params.country;
    if (params.remote !== undefined) queryParams.remote = String(params.remote);

    const response = await apiClient.get<JobSearchResponse>("/api/v1/jobs", {
        params: queryParams,
    });

    return response.data;
}