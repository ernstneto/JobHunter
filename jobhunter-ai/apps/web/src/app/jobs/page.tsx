"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchJobs } from "@/services/jobService";
import { isAuthenticated, logout } from "@/lib/auth";
import JobCard from "@/components/JobCard";
import type { Job } from "@/types/job";
import Link from "next/link";

export default function JobsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("Python Developer");
  const [country, setCountry] = useState("us");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchJobs({
        query: query.trim(),
        country,
        remote: remoteOnly || undefined,
      });
      setJobs(result.jobs);
      setSearched(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to search jobs";
      setError(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">🎯 JobHunter AI</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/applications"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              📋 Track de Candidaturas
            </Link>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job title or keyword
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Python Developer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
              >
                <option value="us">🇺🇸 United States</option>
                <option value="br">🇧🇷 Brazil</option>
                <option value="ca">🇨🇦 Canada</option>
                <option value="gb">🇬🇧 United Kingdom</option>
                <option value="de">🇩🇪 Germany</option>
              </select>
            </div>

            <div className="md:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search Jobs"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="mr-2 rounded border-gray-300"
              />
              Remote only
            </label>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <p>Searching jobs across multiple sources...</p>
          </div>
        )}

        {/* Results */}
        {!loading && jobs.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.job_id} job={job} />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && searched && jobs.length === 0 && !error && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No jobs found for "{query}"</p>
            <p className="text-sm mt-2">Try a different keyword or country.</p>
          </div>
        )}

        {/* Initial state */}
        {!loading && !searched && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">👆 Enter a keyword and click Search Jobs</p>
          </div>
        )}
      </div>
    </main>
  );
}