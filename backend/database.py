"""
Database - Supabase connection and all CRUD operations
Falls back to in-memory store if Supabase not configured (for demo)
"""
import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from config import settings

# In-memory store for demo when Supabase not configured
_memory_store = {
    "candidates": {},
    "sessions": {},
    "responses": {},
    "assessments": {},
    "face_encodings": {},
    "admin_users": {
        "admin@skillfit.in": {
            "id": "admin-1",
            "email": "admin@skillfit.in",
            "name": "Admin User",
            "role": "admin",
            "password_hash": "admin123"  # Demo only
        }
    }
}

_supabase_client = None

def get_supabase():
    """Get Supabase client, return None if not configured"""
    global _supabase_client
    if _supabase_client is None and settings.supabase_url and settings.supabase_key:
        try:
            from supabase import create_client
            _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
        except Exception as e:
            print(f"Supabase connection failed: {e}. Using in-memory store.")
    return _supabase_client

def _use_memory() -> bool:
    """Check if we should use in-memory store"""
    return get_supabase() is None

# ─── Candidates ───────────────────────────────────────────────────────────────

def create_candidate(data: Dict) -> Dict:
    candidate_id = str(uuid.uuid4())
    candidate = {
        "id": candidate_id,
        "name": data["name"],
        "phone": data["phone"],
        "district": data["district"],
        "applied_role": data["role"],
        "preferred_language": data["language"],
        "education": data.get("education", ""),
        "experience_years": data.get("experience_years", 0),
        "photo_url": data.get("photo_url", ""),
        "created_at": datetime.utcnow().isoformat()
    }

    if _use_memory():
        _memory_store["candidates"][candidate_id] = candidate
        return candidate

    sb = get_supabase()
    result = sb.table("candidates").insert(candidate).execute()
    return result.data[0] if result.data else candidate

def get_candidate_by_phone(phone: str) -> Optional[Dict]:
    if _use_memory():
        return next((c for c in _memory_store["candidates"].values() if c["phone"] == phone), None)
    sb = get_supabase()
    result = sb.table("candidates").select("*").eq("phone", phone).execute()
    return result.data[0] if result.data else None

def get_candidate_by_id(candidate_id: str) -> Optional[Dict]:
    if _use_memory():
        return _memory_store["candidates"].get(candidate_id)
    sb = get_supabase()
    result = sb.table("candidates").select("*").eq("id", candidate_id).execute()
    return result.data[0] if result.data else None

def get_all_candidates(filters: Dict = None) -> List[Dict]:
    if _use_memory():
        candidates = list(_memory_store["candidates"].values())
        if filters:
            if filters.get("district"):
                candidates = [c for c in candidates if c.get("district") == filters["district"]]
            if filters.get("applied_role"):
                candidates = [c for c in candidates if c.get("applied_role") == filters["applied_role"]]
            if filters.get("preferred_language"):
                candidates = [c for c in candidates if c.get("preferred_language") == filters["preferred_language"]]
        return candidates

    sb = get_supabase()
    query = sb.table("candidates").select("*, assessments(*)")
    if filters:
        if filters.get("district"):
            query = query.eq("district", filters["district"])
        if filters.get("applied_role"):
            query = query.eq("applied_role", filters["applied_role"])
        if filters.get("preferred_language"):
            query = query.eq("preferred_language", filters["preferred_language"])
    result = query.order("created_at", desc=True).execute()
    return result.data or []

# ─── Sessions ─────────────────────────────────────────────────────────────────

def create_session(candidate_id: str, language: str, device_info: Dict = None) -> Dict:
    session_id = str(uuid.uuid4())
    session = {
        "id": session_id,
        "candidate_id": candidate_id,
        "status": "active",
        "language": language,
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": None,
        "device_info": device_info or {},
        "session_metadata": {}
    }

    if _use_memory():
        _memory_store["sessions"][session_id] = session
        return session

    sb = get_supabase()
    result = sb.table("interview_sessions").insert(session).execute()
    return result.data[0] if result.data else session

def get_session(session_id: str) -> Optional[Dict]:
    if _use_memory():
        return _memory_store["sessions"].get(session_id)
    sb = get_supabase()
    result = sb.table("interview_sessions").select("*").eq("id", session_id).execute()
    return result.data[0] if result.data else None

def update_session_status(session_id: str, status: str):
    update_data = {"status": status}
    if status == "completed":
        update_data["completed_at"] = datetime.utcnow().isoformat()

    if _use_memory():
        if session_id in _memory_store["sessions"]:
            _memory_store["sessions"][session_id].update(update_data)
        return

    sb = get_supabase()
    sb.table("interview_sessions").update(update_data).eq("id", session_id).execute()

# ─── Responses ────────────────────────────────────────────────────────────────

def save_response(session_id: str, question_id: str, question_text: str,
                   question_type: str, video_url: str) -> Dict:
    response_id = str(uuid.uuid4())
    response = {
        "id": response_id,
        "session_id": session_id,
        "question_id": question_id,
        "question_text": question_text,
        "question_type": question_type,
        "video_url": video_url,
        "processing_status": "pending",
        "created_at": datetime.utcnow().isoformat()
    }

    if _use_memory():
        _memory_store["responses"][response_id] = response
        return response

    sb = get_supabase()
    result = sb.table("question_responses").insert(response).execute()
    return result.data[0] if result.data else response

def update_response_scores(response_id: str, scores: Dict):
    if _use_memory():
        if response_id in _memory_store["responses"]:
            _memory_store["responses"][response_id].update({**scores, "processing_status": "completed"})
        return
    sb = get_supabase()
    sb.table("question_responses").update({**scores, "processing_status": "completed"}).eq("id", response_id).execute()

def get_session_responses(session_id: str) -> List[Dict]:
    if _use_memory():
        return [r for r in _memory_store["responses"].values() if r["session_id"] == session_id]
    sb = get_supabase()
    result = sb.table("question_responses").select("*").eq("session_id", session_id).execute()
    return result.data or []

# ─── Assessments ──────────────────────────────────────────────────────────────

def save_assessment(candidate_id: str, session_id: str, assessment_data: Dict) -> Dict:
    assessment_id = str(uuid.uuid4())
    assessment = {
        "id": assessment_id,
        "candidate_id": candidate_id,
        "session_id": session_id,
        **assessment_data,
        "final_status": "pending_review",
        "created_at": datetime.utcnow().isoformat()
    }

    if _use_memory():
        _memory_store["assessments"][assessment_id] = assessment
        return assessment

    sb = get_supabase()
    result = sb.table("assessments").insert(assessment).execute()
    return result.data[0] if result.data else assessment

def get_assessment_by_candidate(candidate_id: str) -> Optional[Dict]:
    if _use_memory():
        return next((a for a in _memory_store["assessments"].values()
                     if a["candidate_id"] == candidate_id), None)
    sb = get_supabase()
    result = sb.table("assessments").select("*").eq("candidate_id", candidate_id).order("created_at", desc=True).limit(1).execute()
    return result.data[0] if result.data else None

def update_assessment_status(assessment_id: str, status: str, notes: str = ""):
    update_data = {"final_status": status}
    if notes:
        update_data["recruiter_notes"] = notes

    if _use_memory():
        if assessment_id in _memory_store["assessments"]:
            _memory_store["assessments"][assessment_id].update(update_data)
        return

    sb = get_supabase()
    sb.table("assessments").update(update_data).eq("id", assessment_id).execute()

def get_all_assessments(filters: Dict = None) -> List[Dict]:
    if _use_memory():
        assessments = list(_memory_store["assessments"].values())
        if filters:
            if filters.get("category"):
                assessments = [a for a in assessments if a.get("category") == filters["category"]]
            if filters.get("final_status"):
                assessments = [a for a in assessments if a.get("final_status") == filters["final_status"]]
        return sorted(assessments, key=lambda x: x.get("overall_score", 0), reverse=True)

    sb = get_supabase()
    query = sb.table("assessments").select("*, candidates(*)")
    if filters:
        if filters.get("category"):
            query = query.eq("category", filters["category"])
        if filters.get("final_status"):
            query = query.eq("final_status", filters["final_status"])
    result = query.order("overall_score", desc=True).execute()
    return result.data or []

# ─── Stats ────────────────────────────────────────────────────────────────────

def get_dashboard_stats() -> Dict:
    if _use_memory():
        assessments = list(_memory_store["assessments"].values())
        candidates = list(_memory_store["candidates"].values())
        return {
            "total_candidates": len(candidates),
            "job_ready": sum(1 for a in assessments if a.get("category") == "job_ready"),
            "needs_training": sum(1 for a in assessments if a.get("category") == "needs_training"),
            "requires_verification": sum(1 for a in assessments if a.get("category") == "requires_verification"),
            "low_quality": sum(1 for a in assessments if a.get("category") == "low_quality"),
            "suspected_fraud": sum(1 for a in assessments if a.get("category") == "suspected_fraud"),
            "pending_review": sum(1 for a in assessments if a.get("final_status") == "pending_review"),
            "shortlisted": sum(1 for a in assessments if a.get("final_status") == "shortlisted"),
            "by_language": {
                "kannada": sum(1 for c in candidates if c.get("preferred_language") == "kannada"),
                "hindi": sum(1 for c in candidates if c.get("preferred_language") == "hindi"),
                "english": sum(1 for c in candidates if c.get("preferred_language") == "english"),
            },
            "by_role": {}
        }

    sb = get_supabase()
    candidates_result = sb.table("candidates").select("id, preferred_language, applied_role").execute()
    assessments_result = sb.table("assessments").select("category, final_status").execute()
    candidates = candidates_result.data or []
    assessments = assessments_result.data or []

    return {
        "total_candidates": len(candidates),
        "job_ready": sum(1 for a in assessments if a.get("category") == "job_ready"),
        "needs_training": sum(1 for a in assessments if a.get("category") == "needs_training"),
        "requires_verification": sum(1 for a in assessments if a.get("category") == "requires_verification"),
        "low_quality": sum(1 for a in assessments if a.get("category") == "low_quality"),
        "suspected_fraud": sum(1 for a in assessments if a.get("category") == "suspected_fraud"),
        "pending_review": sum(1 for a in assessments if a.get("final_status") == "pending_review"),
        "shortlisted": sum(1 for a in assessments if a.get("final_status") == "shortlisted"),
        "by_language": {
            "kannada": sum(1 for c in candidates if c.get("preferred_language") == "kannada"),
            "hindi": sum(1 for c in candidates if c.get("preferred_language") == "hindi"),
            "english": sum(1 for c in candidates if c.get("preferred_language") == "english"),
        },
        "by_role": {}
    }

# ─── Admin Auth ───────────────────────────────────────────────────────────────

def get_admin_by_email(email: str) -> Optional[Dict]:
    if _use_memory():
        return _memory_store["admin_users"].get(email)
    sb = get_supabase()
    result = sb.table("admin_users").select("*").eq("email", email).execute()
    return result.data[0] if result.data else None

# ─── Face Encodings ───────────────────────────────────────────────────────────

def save_face_encoding(candidate_id: str, photo_url: str, encoding: List[float] = None):
    record = {
        "id": str(uuid.uuid4()),
        "candidate_id": candidate_id,
        "photo_url": photo_url,
        "encoding": encoding,
        "created_at": datetime.utcnow().isoformat()
    }
    if _use_memory():
        _memory_store["face_encodings"][candidate_id] = record
        return record
    sb = get_supabase()
    result = sb.table("face_encodings").insert(record).execute()
    return result.data[0] if result.data else record

def get_all_face_encodings() -> List[Dict]:
    if _use_memory():
        return list(_memory_store["face_encodings"].values())
    sb = get_supabase()
    result = sb.table("face_encodings").select("*").execute()
    return result.data or []
