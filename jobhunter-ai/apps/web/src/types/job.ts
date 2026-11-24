export interface Job {
  job_id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  source: string;
  job_type: string;
  match_score: number;
  url: string;
  description_snippet: string;
  salary_range: string | null;
  matched_skills?: string[];
  missing_skills?: string[];
  match_reason?: string;
  required_seniority?: string;
  requires_english?: boolean;
}

export interface JobSearchResponse {
  jobs: Job[];
  total: number;
  query: string;
  sources_used: string[];
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: {
    email: string;
    name: string;
  };
}