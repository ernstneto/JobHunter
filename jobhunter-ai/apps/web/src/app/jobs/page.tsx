"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchJobs } from "@/services/jobService";
import { isAuthenticated, logout } from "@/lib/auth";
import { useJobTracker } from "@/lib/JobTrackerContext";
import { useProfile } from "@/lib/ProfileContext";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [showApplied, setShowApplied] = useState(false);

  const { applications } = useJobTracker();
  const { profile } = useProfile();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IDs das vagas já candidatadas (Track de Candidaturas)
  const appliedIds = useMemo(
    () => new Set(applications.map((a) => a.job_id)),
    [applications]
  );

  // Jobs visíveis: esconde as já candidatadas (pode liberar com o toggle)
  const visibleJobs = useMemo(() => {
    if (showApplied) return jobs;
    return jobs.filter((j) => !appliedIds.has(j.job_id));
  }, [jobs, appliedIds, showApplied]);
  const hiddenAppliedCount = jobs.length - visibleJobs.length;

  const mergeJobs = useCallback((incoming: Job[]) => {
    setJobs((prev) => {
      const seen = new Set(prev.map((j) => j.job_id));
      const merged = [...prev];
      for (const job of incoming) {
        if (!seen.has(job.job_id)) {
          seen.add(job.job_id);
          merged.push(job);
        }
      }
      return merged;
    });
  }, []);

  const runSearch = useCallback(
    async (page: number, numPages: number, expand: boolean) =>
      searchJobs({
        query: query.trim(),
        country,
        remote: remoteOnly || undefined,
        page,
        num_pages: numPages,
        expand_variants: expand,
        profile,
      }),
    [query, country, remoteOnly, profile]
  );

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
    setJobs([]);
    setNextPage(null);
    setHasMore(false);
    setShowApplied(false);
    setSearched(false);

    try {
      // Primeira busca: 2 páginas + variantes de consulta
      const result = await runSearch(1, 2, true);
      setJobs(result.jobs);
      setSearched(true);
      if (result.jobs.length > 0) {
        setNextPage(3); // páginas 1 e 2 já vieram
        setHasMore(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to search jobs";
      setError(message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  const handleLoadMore = useCallback(async () => {
    if (!nextPage || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      // Páginas sequenciais da consulta principal (sem variantes)
      const result = await runSearch(nextPage, 1, false);
      if (result.jobs.length > 0) {
        mergeJobs(result.jobs);
        setNextPage(nextPage + 1);
      } else {
        setHasMore(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load more jobs";
      setError(message);
    } finally {
      setLoadingMore(false);
    }
  }, [nextPage, loadingMore, hasMore, runSearch, mergeJobs]);

  // Scroll infinito: ao chegar perto do fim, carrega a próxima página
  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, handleLoadMore]);

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
        {!loading && searched && visibleJobs.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {visibleJobs.length} job{visibleJobs.length !== 1 ? "s" : ""} found
              </h2>
              {hiddenAppliedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowApplied(!showApplied)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  {showApplied
                    ? "Ocultar aplicadas"
                    : `${hiddenAppliedCount} vaga${hiddenAppliedCount !== 1 ? "s" : ""} já candidatada${hiddenAppliedCount !== 1 ? "s" : ""} (ocultadas)`}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleJobs.map((job) => (
                <JobCard key={job.job_id} job={job} />
              ))}
            </div>

            {/* Sentinel + Load more */}
            {hasMore && (
              <div ref={sentinelRef} className="flex flex-col items-center py-6">
                {loadingMore && (
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-primary-600 mb-2"></div>
                )}
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold disabled:opacity-50 text-sm"
                >
                  {loadingMore ? "Carregando mais..." : "⬇ Carregar mais vagas"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty states */}
        {!loading && searched && visibleJobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {hiddenAppliedCount > 0 ? (
              <>
                <p className="text-lg">
                  Todas as vagas encontradas já foram candidatadas 🙏
                </p>
                <button
                  type="button"
                  onClick={() => setShowApplied(true)}
                  className="mt-3 px-5 py-2 bg-primary-600 text-white text-sm rounded-lg font-semibold hover:bg-primary-700 transition"
                >
                  Mostrar vagas aplicadas
                </button>
              </>
            ) : (
              <>
                <p className="text-lg">No jobs found for "{query}"</p>
                <p className="text-sm mt-2">Try a different keyword or country.</p>
              </>
            )}
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
