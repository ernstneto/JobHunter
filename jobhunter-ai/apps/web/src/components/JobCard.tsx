"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import { fetchSkillQuiz, generateTailoredCv } from "@/services/cvService";
import { useJobTracker } from "@/lib/JobTrackerContext";
import SkillQuiz from "./SkillQuiz";
import CVPreviewModal from "./CVPreviewModal";
import ApplicationModal from "./ApplicationModal";

function getTypeBadgeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "remote":
      return "bg-green-100 text-green-800";
    case "hybrid":
      return "bg-blue-100 text-blue-800";
    case "onsite":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getScoreBadgeColor(score: number): string {
  if (score >= 0.8) return "bg-green-100 text-green-800 border-green-300";
  if (score >= 0.5) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-gray-100 text-gray-700 border-gray-300";
}

export default function JobCard({ job }: { job: Job }) {
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<string[] | null>(null);
  const [generatingCv, setGeneratingCv] = useState(false);
  const [tailoredCvText, setTailoredCvText] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const { getByJobId } = useJobTracker();
  const tracked = Boolean(getByJobId(job.job_id));
  
  const scorePercent = Math.round(Number(job.match_score || 0) * 100);
  const seniorityStr = job.required_seniority ? String(job.required_seniority) : "";

  // 1. Inicia o fluxo carregando o Quiz de Skills
  const handleStartTailoring = async () => {
    const gaps = job.missing_skills || [];
    if (gaps.length === 0) {
      // Se nao houver gaps, gera direto
      handleGenerateCv([]);
      return;
    }

    setLoadingQuiz(true);
    try {
      const res = await fetchSkillQuiz(job.job_id, gaps);
      setQuizQuestions(res.questions);
    } catch {
      // Fallback em caso de erro no Quiz
      handleGenerateCv([]);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // 2. Chama a geracao de CV apos resposta do Quiz
  const handleGenerateCv = async (confirmedSkills: string[]) => {
    setQuizQuestions(null);
    setGeneratingCv(true);

    const masterCvText = `
ERNST - Python & Full Stack Developer
Location: Brazil / Remote | English: Advanced
Skills: Python, FastAPI, PostgreSQL, SQL, Docker, Git, React, TypeScript, REST APIs

Professional Experience:
- Developed scalable REST APIs using FastAPI and PostgreSQL.
- Implemented microservices and containerized environments with Docker.
- Integrated LLMs and AI matching engines for web applications.
`;

    try {
      const res = await generateTailoredCv({
        job_title: job.title,
        company: job.company,
        description_snippet: job.description_snippet || "",
        missing_skills: job.missing_skills || [],
        confirmed_skills: confirmedSkills,
        master_cv_text: masterCvText,
      });

      setTailoredCvText(res.cv_text);
    } catch {
      alert("Error generating tailored CV. Please try again.");
    } finally {
      setGeneratingCv(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{job.title}</h3>
              <p className="text-sm font-medium text-gray-600 mt-1">{job.company}</p>
            </div>
            {scorePercent > 0 && (
              <div className={`ml-4 px-3 py-1 rounded-full text-xs font-bold border ${getScoreBadgeColor(job.match_score)}`}>
                🎯 {scorePercent}% Match
              </div>
            )}
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center text-xs text-gray-500">
              📍 {job.location}, {job.country}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(job.job_type)}`}>
              {job.job_type}
            </span>
            {seniorityStr !== "" && seniorityStr !== "unspecified" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                👨‍💻 {seniorityStr.toUpperCase()}
              </span>
            )}
            {job.requires_english && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                🌐 English
              </span>
            )}
            {job.salary_range && (
              <span className="inline-flex items-center text-xs text-green-700 font-medium">
                💰 {job.salary_range}
              </span>
            )}
          </div>

          {/* AI Reason */}
          {job.match_reason && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-2.5 rounded-r-lg mb-3">
              <p className="text-xs text-blue-900 font-medium">
                💡 <span className="font-semibold">AI Match Profile:</span> {job.match_reason}
              </p>
            </div>
          )}

          {/* Description snippet */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {job.description_snippet}
          </p>

          {/* Skills breakdown */}
          {((job.matched_skills && job.matched_skills.length > 0) || (job.missing_skills && job.missing_skills.length > 0)) && (
            <div className="space-y-2 mb-4 pt-3 border-t border-gray-100">
              {job.matched_skills && job.matched_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 mr-1">Matching:</span>
                  {job.matched_skills.map((skill, idx) => (
                    <span key={idx} className="bg-green-50 text-green-700 border border-green-200 text-[11px] px-2 py-0.5 rounded font-medium">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              )}
              {job.missing_skills && job.missing_skills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 mr-1">Gaps:</span>
                  {job.missing_skills.map((skill, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] px-2 py-0.5 rounded font-medium">
                      ⚠ {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
          <button
            onClick={handleStartTailoring}
            disabled={loadingQuiz || generatingCv}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg transition disabled:opacity-50"
          >
            {loadingQuiz ? "Loading Quiz..." : generatingCv ? "Creating CV..." : "✨ Tailor CV"}
          </button>

          <button
            onClick={() => setApplying(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition border ${
              tracked
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
            }`}
          >
            {tracked ? "✓ No Tracker" : "📝 Candidatar-se"}
          </button>

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Apply →
          </a>
        </div>
      </div>

      {/* Modais */}
      {quizQuestions && (
        <SkillQuiz
          jobId={job.job_id}
          questions={quizQuestions}
          onConfirm={(confirmed) => handleGenerateCv(confirmed)}
          onCancel={() => setQuizQuestions(null)}
        />
      )}

      {tailoredCvText && (
        <CVPreviewModal
          jobTitle={job.title}
          company={job.company}
          cvText={tailoredCvText}
          onClose={() => setTailoredCvText(null)}
        />
      )}

      {applying && (
        <ApplicationModal
          job={job}
          cvText={tailoredCvText}
          onClose={() => setApplying(false)}
        />
      )}
    </>
  );
}