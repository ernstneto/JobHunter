"""
ATS Analysis endpoints - Multi-reviewer impartial evaluation
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional

router = APIRouter()


class ATSAnalysisRequest(BaseModel):
    cv_text: str
    cv_content: Optional[Dict] = None
    job_title: str
    job_description: str
    job_requirements: List[str]

class ATSReviewDetail(BaseModel):
    reviewer: str
    reviewer_type: str # "ai" or "programmatic"
    overall_score: float
    keyword_score: float
    format_score: float
    content_score: float
    issues: List[Dict]
    suggestions: List[str]

class ATSAnalysisResponse(BaseModel):
    final_score: float
    min_score: float
    max_score: float
    reviews: List[ATSReviewDetail]
    matched_keywords: List[str]
    missing_keywords: List[str]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: str


@router.post("/analyze", response_model=ATSAnalysisRequest)
async def analyze_ats(request: ATSAnalysisRequest):
    """
    Analyze a CV against a job description using multiple independent reviewrs.

    KEY PRINCIPLE: The AI model that GENERATED the cv is NEVER used to REVIEW it.
    This eliminates self-evaluation bias.

    Reviewers:
    1. Programmatic (rule-based, deterministic, zero bias) - 40% weight
    2. AI Reviewer A (different model from generator) - 30% weight
    3. AI Reviewer B (another different model) - 30% weight
    """
    # TODO: Implement actual multi-reviewer analysis
    mock_reviews = [
        ATSReviewDetail(
            reviewer="programmatic_ats",
            reviewer_type="prommatic",
            overall_score=88.0,
            keyword_score=82.0,
            format_score=95.0,
            content_score=87.0,
            issues=[
                {
                    "severity": "medium",
                    "issue": "Missing 3 keyword from job description",
                    "fix": "Add: Kubernetes, CI/CD, Terraform",
                }
            ],
            suggestions=[
                "Add more quantifiable metrics (%, $, #)",
                "Include 'Kubernetes' in skills section",
            ],
        ),
        ATSReviewDetail(
            reviewer="gemini-1.5-flash",
            reviewer_type="ai",
            overall_score=85.5,
            keyword_score=80.0,
            format_score=90.0,
            content_score=86.0,
            issues=[
                {
                    "severity": "low",
                    "issue": "Summary could be more targeted to the role",
                    "fix": "Mention the specific job title in your summary",
                }
            ],
            suggestions=[
                "Tailor summary to mention 'Backend Engineer' explicitly",
                "Add a 'Projects' section for relevant side projects",
            ],
        ),
        ATSReviewDetail(
            reviewer="mixtral-8x7b",
            reviewer_type="ai",
            overall_score=86.3,
            keyword_score=83.0,
            format_score=88.0,
            content_score=88.0,
            issues=[],
            suggestions=[
                "Consider adding certifications section",
                "Use more action verbs (Led, Architected, Optimized)",
            ],
        ),
    ]

    all_scores = [r.overall_score for r in mock_reviews]

    return ATSAnalysisResponse(
        final_score=round(sum(all_scores) / len(all_scores), 1),
        min_score=min(all_scores),
        max_score=max(all_scores),
        score_variance=round(max(all_scores) - min(all_scores), 1),
        reviews=mock_reviews,
        matched_keywords=["Python", "Docker", "PostgreSQL", "REST API", "Git"],
        missing_keywords=["Kubernetes", "CI/CD", "Terraform"],
        strengths=[
            "Strong technical skills match",
            "Clean ATS-friendly format",
            "Good use of action verbs",
        ],
        weaknesses=[
            "Missing cloud/DevOps keywords",
            "No quantifiable metrics in experience",
        ],
        recommendation="GOOD_MATCH — Apply with minor improvements",
    )
