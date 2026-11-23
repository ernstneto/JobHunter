import { apiClient } from "@/lib/api";
import type { JobSearchResponse } from "@/types/job";

export interface SearchParams {
    query: string;
    country?: string;
    remote?: boolean;
    page?: number;
    num_pages?: number;
    expand_variants?: boolean;
}

export async function searchJobs(params: SearchParams): Promise<JobSearchResponse> {
    const queryParams: Record<string, string | number | boolean> = {
        q: params.query,
        page: params.page ?? 1,
        num_pages: params.num_pages ?? 2,
        expand_variants: params.expand_variants ?? true,
    };

    if (params.country) queryParams.country = params.country;
    if (params.remote !== undefined) queryParams.remote = String(params.remote);

    const response = await apiClient.get<JobSearchResponse>("/api/v1/jobs", {
        params: queryParams,
    });

    return response.data;
}
