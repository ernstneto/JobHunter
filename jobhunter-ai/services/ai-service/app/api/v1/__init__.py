"""
API v1 Router - Aggregates all v1 endpoints
"""

from fastapi import APIRouter
from app.api.v1.endpoints import jobs, cv, ats, matching, profile

router = APIRouter()

router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
router.include_router(cv.router, prefix="/cv", tags=["CV Generation"])
router.include_router(ats.router, prefix="/ats", tags=["ATS Analysis"])
router.include_router(matching.router, prefix="/matching", tags=["Matching"])
router.include_router(profile.router, prefix="/profile", tags=["Profile"])