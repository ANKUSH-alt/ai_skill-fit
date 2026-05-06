"""
Assessment Engine - Complete AI-powered candidate assessment
Combines: Whisper transcription, audio analysis, video analysis, LLM evaluation
"""
import os
from dataclasses import dataclass, asdict
from typing import List, Dict, Any, Optional
from core.speech_engine import get_speech_engine
from core.audio_analyzer import get_audio_analyzer, AudioFeatures
from core.video_analyzer import get_video_analyzer, VideoFeatures
from core.llm_engine import get_llm_engine
from core.language_manager import get_llm_language_instruction

@dataclass
class QuestionScore:
    question_id: str
    question_text: str
    transcript: str
    technical_score: float
    communication_score: float
    confidence_score: float
    language_score: float
    relevance_score: float
    overall_score: float
    audio_features: Dict[str, Any]
    video_features: Dict[str, Any]
    keywords_found: List[str]
    keywords_missing: List[str]
    red_flags: List[str]
    ai_feedback: str
    follow_up_needed: bool
    follow_up_question: Optional[str] = None

@dataclass
class FinalAssessment:
    candidate_id: str
    session_id: str
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    language_score: float
    category: str
    job_readiness_percentage: int
    strengths: List[str]
    weaknesses: List[str]
    training_gaps: List[str]
    training_recommendations: List[Dict[str, str]]
    recommended_roles: List[str]
    ai_summary: str
    recruiter_recommendation: str
    fraud_score: float
    fraud_flags: List[str]
    question_scores: List[QuestionScore]

class AssessmentEngine:
    def __init__(self):
        self.speech_engine = get_speech_engine()
        self.audio_analyzer = get_audio_analyzer()
        self.video_analyzer = get_video_analyzer()
        self.llm_engine = get_llm_engine()

    async def assess_response(self, video_path: str, question: Dict, language: str, role: str) -> QuestionScore:
        """Assess a single question response"""
        # Transcribe
        transcription = self.speech_engine.transcribe_video(video_path, language)

        # Audio analysis
        audio_path = f"{video_path}_audio.wav"
        self.speech_engine.extract_audio(video_path, audio_path)
        audio_features = self.audio_analyzer.analyze(audio_path, transcription.transcript, language)
        if os.path.exists(audio_path):
            os.remove(audio_path)

        # Video analysis
        video_features = self.video_analyzer.analyze(video_path)

        # LLM evaluation
        llm_scores = await self._evaluate_with_llm(question, transcription.transcript, language, role)

        # Component scores
        technical_score = float(llm_scores.get('technical_score', 5.0))
        relevance_score = float(llm_scores.get('relevance_score', 5.0))
        language_score = float(llm_scores.get('language_score', 5.0))
        communication_score = audio_features.clarity_score
        confidence_score = (audio_features.confidence_score + video_features.video_quality_score) / 2

        overall_score = (
            technical_score * 0.35 +
            communication_score * 0.25 +
            confidence_score * 0.20 +
            language_score * 0.10 +
            relevance_score * 0.10
        )

        # Red flags
        red_flags = []
        if audio_features.audio_quality == "poor":
            red_flags.append("Poor audio quality")
        if video_features.lighting_quality == "poor":
            red_flags.append("Poor lighting")
        if video_features.face_presence_ratio < 0.7:
            red_flags.append("Face not visible in many frames")
        if audio_features.filler_ratio > 0.15:
            red_flags.append("Excessive filler words")
        red_flags.extend(video_features.fraud_flags)

        # Follow-up
        follow_up_needed = 3.0 < overall_score < 7.0 and relevance_score < 6.0
        follow_up_question = None
        if follow_up_needed:
            follow_up_question = await self._generate_follow_up(question, transcription.transcript, language)

        return QuestionScore(
            question_id=question.get('id', ''),
            question_text=question.get('text', ''),
            transcript=transcription.transcript,
            technical_score=round(technical_score, 2),
            communication_score=round(communication_score, 2),
            confidence_score=round(confidence_score, 2),
            language_score=round(language_score, 2),
            relevance_score=round(relevance_score, 2),
            overall_score=round(overall_score, 2),
            audio_features=asdict(audio_features),
            video_features=asdict(video_features),
            keywords_found=llm_scores.get('keywords_found', []),
            keywords_missing=llm_scores.get('keywords_missing', []),
            red_flags=red_flags,
            ai_feedback=llm_scores.get('feedback', ''),
            follow_up_needed=follow_up_needed,
            follow_up_question=follow_up_question
        )

    async def generate_final_assessment(
        self, candidate_id: str, session_id: str,
        question_scores: List[QuestionScore],
        fraud_result: Dict, candidate_data: Dict
    ) -> FinalAssessment:
        """Generate final assessment from all question scores"""
        n = len(question_scores)
        overall_score = sum(q.overall_score for q in question_scores) / n
        technical_score = sum(q.technical_score for q in question_scores) / n
        communication_score = sum(q.communication_score for q in question_scores) / n
        confidence_score = sum(q.confidence_score for q in question_scores) / n
        language_score = sum(q.language_score for q in question_scores) / n

        fraud_score = fraud_result.get('confidence', 0.0)
        fraud_flags = fraud_result.get('fraud_flags', [])

        # Classify
        if fraud_score > 0.7 or len(fraud_flags) > 3:
            category = "suspected_fraud"
        elif overall_score >= 7.5 and not fraud_flags:
            category = "job_ready"
        elif overall_score >= 5.0:
            category = "needs_training"
        elif fraud_flags:
            category = "requires_verification"
        else:
            category = "low_quality"

        job_readiness_percentage = int(min(100, overall_score * 10))

        strengths, weaknesses = self._identify_strengths_weaknesses(question_scores)
        training_gaps = self._identify_training_gaps(question_scores, candidate_data)
        training_recommendations = self._generate_training_recommendations(training_gaps, candidate_data.get('role', ''))
        recommended_roles = self._recommend_roles(candidate_data.get('role', ''), overall_score)
        ai_summary = await self._generate_ai_summary(candidate_data, question_scores, overall_score, category)
        recruiter_recommendation = self._generate_recruiter_recommendation(category, overall_score, fraud_flags)

        return FinalAssessment(
            candidate_id=candidate_id,
            session_id=session_id,
            overall_score=round(overall_score, 2),
            technical_score=round(technical_score, 2),
            communication_score=round(communication_score, 2),
            confidence_score=round(confidence_score, 2),
            language_score=round(language_score, 2),
            category=category,
            job_readiness_percentage=job_readiness_percentage,
            strengths=strengths,
            weaknesses=weaknesses,
            training_gaps=training_gaps,
            training_recommendations=training_recommendations,
            recommended_roles=recommended_roles,
            ai_summary=ai_summary,
            recruiter_recommendation=recruiter_recommendation,
            fraud_score=fraud_score,
            fraud_flags=fraud_flags,
            question_scores=question_scores
        )

    async def _evaluate_with_llm(self, question: Dict, transcript: str, language: str, role: str) -> Dict:
        """Evaluate response using LLM"""
        keywords = question.get('keywords', [])
        prompt = f"""You are evaluating a {role} candidate's interview response.

Question: {question.get('text', '')}
Expected keywords: {', '.join(keywords)}
Candidate response: {transcript}

Score the response (0-10) for:
1. Technical accuracy
2. Relevance to question
3. Language fluency

Respond ONLY with valid JSON:
{{
    "technical_score": 7,
    "relevance_score": 6,
    "language_score": 8,
    "keywords_found": ["keyword1"],
    "keywords_missing": ["keyword2"],
    "feedback": "Brief feedback here"
}}"""

        result = await self.llm_engine.generate_json(prompt, "english")
        if not result:
            # Fallback scoring based on keyword matching
            found = [k for k in keywords if k.lower() in transcript.lower()]
            score = min(10.0, (len(found) / max(len(keywords), 1)) * 10)
            return {
                'technical_score': score,
                'relevance_score': score,
                'language_score': 7.0,
                'keywords_found': found,
                'keywords_missing': [k for k in keywords if k not in found],
                'feedback': 'Assessment based on keyword matching.'
            }
        return result

    async def _generate_follow_up(self, question: Dict, transcript: str, language: str) -> str:
        """Generate follow-up question in candidate's language"""
        lang_instruction = get_llm_language_instruction(language)
        prompt = f"""{lang_instruction}

Original question: {question.get('text', '')}
Candidate response: {transcript}

Generate ONE short follow-up question to clarify their answer."""
        try:
            return (await self.llm_engine.generate(prompt, language)).strip()
        except Exception:
            return ""

    async def _generate_ai_summary(self, candidate_data: Dict, question_scores: List[QuestionScore],
                                    overall_score: float, category: str) -> str:
        """Generate AI summary in English for admin"""
        n = len(question_scores)
        prompt = f"""Write a 3-sentence professional summary for a government recruiter:

Candidate: {candidate_data.get('name', 'Unknown')}
Role: {candidate_data.get('role', 'Unknown')}
Experience: {candidate_data.get('experience_years', 0)} years
Overall Score: {overall_score:.1f}/10
Category: {category}
Questions answered: {n}
Avg technical: {sum(q.technical_score for q in question_scores)/n:.1f}
Avg communication: {sum(q.communication_score for q in question_scores)/n:.1f}"""
        try:
            return (await self.llm_engine.generate(prompt, "english")).strip()
        except Exception:
            return f"Candidate scored {overall_score:.1f}/10 overall. Category: {category}."

    def _identify_strengths_weaknesses(self, question_scores: List[QuestionScore]):
        strengths, weaknesses = [], []
        n = len(question_scores)
        avg_t = sum(q.technical_score for q in question_scores) / n
        avg_c = sum(q.communication_score for q in question_scores) / n
        avg_conf = sum(q.confidence_score for q in question_scores) / n

        if avg_t >= 7.5: strengths.append("Strong technical knowledge")
        elif avg_t < 5.0: weaknesses.append("Needs technical training")
        if avg_c >= 7.5: strengths.append("Excellent communication")
        elif avg_c < 5.0: weaknesses.append("Communication needs improvement")
        if avg_conf >= 7.5: strengths.append("Confident and composed")
        elif avg_conf < 5.0: weaknesses.append("Lacks confidence")
        return strengths, weaknesses

    def _identify_training_gaps(self, question_scores: List[QuestionScore], candidate_data: Dict):
        gaps = []
        n = len(question_scores)
        if sum(q.technical_score for q in question_scores) / n < 5.0:
            gaps.append(f"Basic {candidate_data.get('role', 'trade')} skills")
        if sum(q.communication_score for q in question_scores) / n < 5.0:
            gaps.append("Communication and presentation skills")
        if sum(q.confidence_score for q in question_scores) / n < 5.0:
            gaps.append("Confidence building")
        return gaps

    def _generate_training_recommendations(self, training_gaps: List[str], role: str):
        return [{'gap': g, 'recommendation': f"Training module on {g}",
                 'resource': "Karnataka Skill Development Portal", 'duration': "2-4 weeks"}
                for g in training_gaps]

    def _recommend_roles(self, applied_role: str, overall_score: float):
        if overall_score >= 7.5:
            return [applied_role, f"Senior {applied_role}"]
        elif overall_score >= 5.0:
            return [applied_role]
        else:
            return [f"Assistant {applied_role}", "General Labor"]

    def _generate_recruiter_recommendation(self, category: str, overall_score: float, fraud_flags: List[str]):
        recs = {
            "suspected_fraud": "⚠️ REJECT - Suspected fraud. Manual verification required.",
            "job_ready": "✅ SHORTLIST - Candidate is job-ready. Recommend for immediate hiring.",
            "needs_training": "📚 TRAINING - Shows potential. Recommend for training program.",
            "requires_verification": "🔍 VERIFY - Some concerns detected. Manual review recommended.",
            "low_quality": "❌ REJECT - Does not meet minimum requirements at this time."
        }
        return recs.get(category, "Review manually.")

_assessment_engine = None

def get_assessment_engine() -> AssessmentEngine:
    global _assessment_engine
    if _assessment_engine is None:
        _assessment_engine = AssessmentEngine()
    return _assessment_engine
