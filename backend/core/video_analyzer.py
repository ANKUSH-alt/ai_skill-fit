"""
Video Analyzer - Analyzes video quality and candidate behavior using MediaPipe
Evaluates: face presence, eye contact, multiple faces, lighting, stability
"""
import numpy as np
from dataclasses import dataclass
from typing import List, Tuple, Optional

# Lazy imports for optional dependencies
cv2 = None
mp = None

def _ensure_dependencies():
    """Lazy load heavy dependencies"""
    global cv2, mp
    if cv2 is None:
        try:
            import cv2 as _cv2
            cv2 = _cv2
        except ImportError:
            raise ImportError("opencv-python not installed. Video analysis disabled.")
    if mp is None:
        try:
            import mediapipe as _mp
            mp = _mp
        except ImportError:
            raise ImportError("mediapipe not installed. Video analysis disabled.")

@dataclass
class VideoFeatures:
    """Video analysis results"""
    face_presence_ratio: float  # Ratio of frames with face detected
    eye_contact_ratio: float  # Ratio of frames with good eye contact
    multiple_face_detected: bool  # Multiple faces in any frame
    multiple_face_ratio: float  # Ratio of frames with multiple faces
    avg_face_size: float  # Average face size (0-1)
    face_too_far: bool  # Face too small
    face_too_close: bool  # Face too large
    head_movement_std: float  # Head stability (lower is better)
    head_stable: bool  # Head reasonably stable
    blink_count: int  # Number of blinks detected
    blink_rate_per_minute: float  # Blinks per minute
    lighting_quality: str  # "good", "acceptable", "poor"
    avg_brightness: float  # Average frame brightness
    brightness_variance: float  # Lighting consistency
    video_quality_score: float  # 0-10
    frames_analyzed: int  # Total frames processed
    fraud_flags: List[str]  # List of suspicious patterns

class VideoAnalyzer:
    def __init__(self):
        """Initialize video analyzer with lazy dependency loading"""
        _ensure_dependencies()
        # Initialize MediaPipe Face Detection
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_face_mesh = mp.solutions.face_mesh
        
        # Thresholds
        self.min_face_size = 0.15  # Minimum face size ratio
        self.max_face_size = 0.85  # Maximum face size ratio
        self.eye_contact_threshold = 0.3  # Threshold for eye contact
        self.min_blink_rate = 10  # Minimum blinks per minute (liveness)
        self.max_blink_rate = 40  # Maximum blinks per minute
    
    def analyze(self, video_path: str, sample_rate: int = 5) -> VideoFeatures:
        """
        Analyze video file and return comprehensive features
        
        Args:
            video_path: Path to video file
            sample_rate: Analyze every Nth frame (default 5 for performance)
        
        Returns:
            VideoFeatures with all metrics
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise Exception(f"Cannot open video file: {video_path}")
        
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_seconds = total_frames / fps if fps > 0 else 0
        
        # Initialize detectors
        face_detection = self.mp_face_detection.FaceDetection(
            model_selection=1,  # Full range model
            min_detection_confidence=0.5
        )
        face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Metrics storage
        frames_with_face = 0
        frames_with_eye_contact = 0
        frames_with_multiple_faces = 0
        face_sizes = []
        head_positions = []
        brightness_values = []
        blink_states = []
        fraud_flags = []
        
        frame_count = 0
        analyzed_count = 0
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Sample frames for performance
                if frame_count % sample_rate != 0:
                    continue
                
                analyzed_count += 1
                
                # Convert to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                h, w, _ = frame.shape
                
                # Analyze brightness
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                brightness = np.mean(gray) / 255.0
                brightness_values.append(brightness)
                
                # Detect faces
                results = face_detection.process(rgb_frame)
                
                if results.detections:
                    num_faces = len(results.detections)
                    frames_with_face += 1
                    
                    # Check for multiple faces
                    if num_faces > 1:
                        frames_with_multiple_faces += 1
                        fraud_flags.append(f"Multiple faces at frame {frame_count}")
                    
                    # Analyze first face
                    detection = results.detections[0]
                    bbox = detection.location_data.relative_bounding_box
                    
                    # Calculate face size
                    face_width = bbox.width
                    face_height = bbox.height
                    face_size = (face_width + face_height) / 2
                    face_sizes.append(face_size)
                    
                    # Track head position
                    head_x = bbox.xmin + bbox.width / 2
                    head_y = bbox.ymin + bbox.height / 2
                    head_positions.append((head_x, head_y))
                    
                    # Analyze eye contact using face mesh
                    mesh_results = face_mesh.process(rgb_frame)
                    if mesh_results.multi_face_landmarks:
                        landmarks = mesh_results.multi_face_landmarks[0]
                        
                        # Check eye gaze (simplified)
                        # Using nose tip and eye positions
                        nose_tip = landmarks.landmark[1]
                        left_eye = landmarks.landmark[33]
                        right_eye = landmarks.landmark[263]
                        
                        # Calculate if looking at camera (nose aligned with eyes)
                        eye_center_x = (left_eye.x + right_eye.x) / 2
                        gaze_offset = abs(nose_tip.x - eye_center_x)
                        
                        if gaze_offset < self.eye_contact_threshold:
                            frames_with_eye_contact += 1
                        
                        # Detect blinks (simplified using eye aspect ratio)
                        # Eye landmarks: 33, 133 (left), 263, 362 (right)
                        left_eye_open = abs(landmarks.landmark[33].y - landmarks.landmark[133].y)
                        right_eye_open = abs(landmarks.landmark[263].y - landmarks.landmark[362].y)
                        avg_eye_open = (left_eye_open + right_eye_open) / 2
                        
                        blink_states.append(avg_eye_open < 0.01)  # Threshold for closed eye
        
        finally:
            cap.release()
            face_detection.close()
            face_mesh.close()
        
        # Calculate metrics
        face_presence_ratio = frames_with_face / analyzed_count if analyzed_count > 0 else 0.0
        eye_contact_ratio = frames_with_eye_contact / frames_with_face if frames_with_face > 0 else 0.0
        multiple_face_ratio = frames_with_multiple_faces / analyzed_count if analyzed_count > 0 else 0.0
        
        avg_face_size = float(np.mean(face_sizes)) if face_sizes else 0.0
        face_too_far = avg_face_size < self.min_face_size
        face_too_close = avg_face_size > self.max_face_size
        
        # Calculate head stability
        if len(head_positions) > 1:
            positions_array = np.array(head_positions)
            head_movement_std = float(np.std(positions_array))
            head_stable = head_movement_std < 0.1
        else:
            head_movement_std = 0.0
            head_stable = True
        
        # Count blinks
        blink_count = 0
        if len(blink_states) > 1:
            for i in range(1, len(blink_states)):
                if not blink_states[i-1] and blink_states[i]:  # Transition to closed
                    blink_count += 1
        
        blink_rate_per_minute = (blink_count / duration_seconds * 60) if duration_seconds > 0 else 0
        
        # Lighting quality
        avg_brightness = float(np.mean(brightness_values)) if brightness_values else 0.0
        brightness_variance = float(np.var(brightness_values)) if brightness_values else 0.0
        lighting_quality = self._determine_lighting_quality(avg_brightness, brightness_variance)
        
        # Check for fraud patterns
        if face_presence_ratio < 0.7:
            fraud_flags.append("Low face presence (possible screen recording)")
        
        if eye_contact_ratio < 0.15:
            fraud_flags.append("Very low eye contact (possibly reading from screen)")
        
        if blink_rate_per_minute < self.min_blink_rate:
            fraud_flags.append("Abnormally low blink rate (possible static image)")
        
        if multiple_face_ratio > 0.1:
            fraud_flags.append("Multiple faces detected frequently")
        
        # Calculate overall video quality score
        video_quality_score = self._calculate_video_quality_score(
            face_presence_ratio, eye_contact_ratio, avg_face_size,
            head_stable, lighting_quality, len(fraud_flags)
        )
        
        return VideoFeatures(
            face_presence_ratio=face_presence_ratio,
            eye_contact_ratio=eye_contact_ratio,
            multiple_face_detected=frames_with_multiple_faces > 0,
            multiple_face_ratio=multiple_face_ratio,
            avg_face_size=avg_face_size,
            face_too_far=face_too_far,
            face_too_close=face_too_close,
            head_movement_std=head_movement_std,
            head_stable=head_stable,
            blink_count=blink_count,
            blink_rate_per_minute=blink_rate_per_minute,
            lighting_quality=lighting_quality,
            avg_brightness=avg_brightness,
            brightness_variance=brightness_variance,
            video_quality_score=video_quality_score,
            frames_analyzed=analyzed_count,
            fraud_flags=fraud_flags
        )
    
    def _determine_lighting_quality(self, avg_brightness: float, brightness_variance: float) -> str:
        """Determine lighting quality"""
        if 0.3 < avg_brightness < 0.7 and brightness_variance < 0.01:
            return "good"
        elif 0.2 < avg_brightness < 0.8 and brightness_variance < 0.02:
            return "acceptable"
        else:
            return "poor"
    
    def _calculate_video_quality_score(self, face_presence: float, eye_contact: float,
                                        face_size: float, head_stable: bool,
                                        lighting: str, fraud_flag_count: int) -> float:
        """Calculate overall video quality score (0-10)"""
        score = 10.0
        
        # Penalize low face presence
        if face_presence < 0.8:
            score -= 2.0
        elif face_presence < 0.9:
            score -= 1.0
        
        # Penalize low eye contact
        if eye_contact < 0.3:
            score -= 2.0
        elif eye_contact < 0.5:
            score -= 1.0
        
        # Penalize poor face size
        if face_size < 0.15 or face_size > 0.85:
            score -= 1.5
        
        # Penalize unstable head
        if not head_stable:
            score -= 1.0
        
        # Penalize poor lighting
        if lighting == "poor":
            score -= 2.0
        elif lighting == "acceptable":
            score -= 0.5
        
        # Penalize fraud flags
        score -= fraud_flag_count * 0.5
        
        return max(0.0, min(10.0, score))

# Singleton instance
_video_analyzer = None

def get_video_analyzer() -> Optional[VideoAnalyzer]:
    """Get singleton video analyzer instance (returns None if dependencies not available)"""
    global _video_analyzer
    if _video_analyzer is None:
        try:
            _video_analyzer = VideoAnalyzer()
        except ImportError:
            return None
    return _video_analyzer
