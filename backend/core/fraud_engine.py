"""
Fraud Engine - Duplicate detection and integrity checks using DeepFace
"""
import os
import json
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Any, Optional

@dataclass
class FraudResult:
    is_fraud: bool
    confidence: float  # 0-1
    action: str  # PROCEED, FLAG, BLOCK
    checks: Dict[str, Any]
    fraud_flags: List[str]
    explanation: str

class FraudEngine:
    def __init__(self):
        self._deepface_loaded = False
        self.face_db_path = "./uploads/face_db"
        os.makedirs(self.face_db_path, exist_ok=True)

    def _load_deepface(self):
        if not self._deepface_loaded:
            try:
                from deepface import DeepFace
                self._DeepFace = DeepFace
                self._deepface_loaded = True
            except ImportError:
                print("DeepFace not available, using basic checks")
                self._DeepFace = None
                self._deepface_loaded = True

    def check_registration_photo(self, photo_path: str, candidate_id: str,
                                   existing_encodings: List[Dict] = None) -> FraudResult:
        """
        Check registration photo for duplicates and quality
        Returns FraudResult with action: PROCEED, FLAG, or BLOCK
        """
        self._load_deepface()
        flags = []
        checks = {}

        # 1. Basic image quality check
        quality_ok = self._check_image_quality(photo_path)
        checks['image_quality'] = quality_ok
        if not quality_ok:
            flags.append("Poor image quality or no face detected")

        # 2. Face detection
        face_detected = self._detect_face(photo_path)
        checks['face_detected'] = face_detected
        if not face_detected:
            return FraudResult(
                is_fraud=False,
                confidence=0.0,
                action="BLOCK",
                checks=checks,
                fraud_flags=["No face detected in photo"],
                explanation="No face detected. Please retake photo."
            )

        # 3. Duplicate face check
        is_duplicate = False
        if existing_encodings and self._DeepFace:
            is_duplicate = self._check_duplicate_face(photo_path, existing_encodings)
            checks['duplicate_face'] = is_duplicate
            if is_duplicate:
                flags.append("Duplicate face detected - candidate already registered")

        # Determine action
        if is_duplicate:
            return FraudResult(
                is_fraud=True,
                confidence=0.9,
                action="BLOCK",
                checks=checks,
                fraud_flags=flags,
                explanation="This face is already registered in the system."
            )

        if not quality_ok:
            return FraudResult(
                is_fraud=False,
                confidence=0.3,
                action="FLAG",
                checks=checks,
                fraud_flags=flags,
                explanation="Photo quality is poor. Consider retaking."
            )

        return FraudResult(
            is_fraud=False,
            confidence=0.0,
            action="PROCEED",
            checks=checks,
            fraud_flags=[],
            explanation="Photo verified successfully."
        )

    def analyze_session(self, session_id: str, video_features_list: List[Dict],
                         audio_features_list: List[Dict]) -> FraudResult:
        """
        Analyze complete session for fraud patterns
        """
        flags = []
        checks = {}
        fraud_score = 0.0

        # 1. Check face presence across responses
        avg_face_presence = np.mean([
            vf.get('face_presence_ratio', 1.0) for vf in video_features_list
        ]) if video_features_list else 1.0
        checks['avg_face_presence'] = avg_face_presence
        if avg_face_presence < 0.6:
            flags.append("Low face presence across interview (possible screen recording)")
            fraud_score += 0.3

        # 2. Check for multiple faces
        multiple_face_sessions = sum(
            1 for vf in video_features_list if vf.get('multiple_face_detected', False)
        )
        checks['multiple_face_sessions'] = multiple_face_sessions
        if multiple_face_sessions > 1:
            flags.append(f"Multiple faces detected in {multiple_face_sessions} responses")
            fraud_score += 0.25

        # 3. Check eye contact (reading from screen)
        avg_eye_contact = np.mean([
            vf.get('eye_contact_ratio', 0.5) for vf in video_features_list
        ]) if video_features_list else 0.5
        checks['avg_eye_contact'] = avg_eye_contact
        if avg_eye_contact < 0.15:
            flags.append("Very low eye contact - possibly reading from screen")
            fraud_score += 0.2

        # 4. Check blink rate (liveness)
        avg_blink_rate = np.mean([
            vf.get('blink_rate_per_minute', 15) for vf in video_features_list
        ]) if video_features_list else 15
        checks['avg_blink_rate'] = avg_blink_rate
        if avg_blink_rate < 5:
            flags.append("Abnormally low blink rate - possible static image or recording")
            fraud_score += 0.3

        # 5. Check audio anomalies
        zero_pause_responses = sum(
            1 for af in audio_features_list
            if af.get('pause_count', 1) == 0 and af.get('duration_seconds', 0) > 20
        )
        checks['zero_pause_responses'] = zero_pause_responses
        if zero_pause_responses > 2:
            flags.append("Suspiciously fluent responses with no pauses (possible pre-recorded audio)")
            fraud_score += 0.2

        # 6. Check response timing
        very_fast_responses = sum(
            1 for af in audio_features_list if af.get('duration_seconds', 30) < 5
        )
        checks['very_fast_responses'] = very_fast_responses
        if very_fast_responses > 2:
            flags.append("Multiple very short responses")
            fraud_score += 0.15

        fraud_score = min(1.0, fraud_score)

        if fraud_score > 0.7:
            action = "BLOCK"
        elif fraud_score > 0.4 or len(flags) > 2:
            action = "FLAG"
        else:
            action = "PROCEED"

        return FraudResult(
            is_fraud=fraud_score > 0.7,
            confidence=fraud_score,
            action=action,
            checks=checks,
            fraud_flags=flags,
            explanation=f"Fraud confidence: {fraud_score:.0%}. {len(flags)} suspicious patterns detected."
        )

    def _check_image_quality(self, photo_path: str) -> bool:
        """Check basic image quality"""
        try:
            import cv2
            img = cv2.imread(photo_path)
            if img is None:
                return False
            # Check brightness
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            brightness = np.mean(gray)
            return brightness > 40  # Not too dark
        except Exception:
            return True  # Assume ok if can't check

    def _detect_face(self, photo_path: str) -> bool:
        """Detect if face is present in photo"""
        if self._DeepFace:
            try:
                self._DeepFace.extract_faces(img_path=photo_path, enforce_detection=True)
                return True
            except Exception:
                return False
        else:
            # Fallback: OpenCV face detection
            try:
                import cv2
                img = cv2.imread(photo_path)
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                faces = face_cascade.detectMultiScale(gray, 1.1, 4)
                return len(faces) > 0
            except Exception:
                return True  # Assume ok

    def _check_duplicate_face(self, photo_path: str, existing_encodings: List[Dict]) -> bool:
        """Check if face matches any existing registration"""
        if not self._DeepFace or not existing_encodings:
            return False
        try:
            for existing in existing_encodings:
                existing_photo = existing.get('photo_url', '')
                if existing_photo and os.path.exists(existing_photo):
                    result = self._DeepFace.verify(
                        img1_path=photo_path,
                        img2_path=existing_photo,
                        model_name='Facenet512',
                        enforce_detection=False
                    )
                    if result.get('verified', False):
                        return True
        except Exception as e:
            print(f"Face comparison error: {e}")
        return False

    def get_face_encoding(self, photo_path: str) -> Optional[List[float]]:
        """Get face encoding for storage"""
        self._load_deepface()
        if not self._DeepFace:
            return None
        try:
            embedding = self._DeepFace.represent(
                img_path=photo_path,
                model_name='Facenet512',
                enforce_detection=False
            )
            if embedding:
                return embedding[0].get('embedding', None)
        except Exception as e:
            print(f"Face encoding error: {e}")
        return None

_fraud_engine = None

def get_fraud_engine() -> FraudEngine:
    global _fraud_engine
    if _fraud_engine is None:
        _fraud_engine = FraudEngine()
    return _fraud_engine
