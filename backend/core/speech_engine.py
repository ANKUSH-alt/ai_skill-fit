"""
Speech Engine - Whisper-based speech-to-text for Kannada, Hindi, English
"""
import whisper
import ffmpeg
import os
from typing import Dict, Any
from dataclasses import dataclass
from config import settings
from core.language_manager import get_whisper_language

@dataclass
class TranscriptionResult:
    transcript: str
    detected_language: str
    duration_seconds: float
    word_count: int
    confidence: float

class SpeechEngine:
    def __init__(self):
        self.model = None
        self.model_size = settings.whisper_model_size
        
    def _load_model(self):
        """Lazy load Whisper model"""
        if self.model is None:
            print(f"Loading Whisper model: {self.model_size}")
            self.model = whisper.load_model(self.model_size)
            print("Whisper model loaded successfully")
    
    def extract_audio(self, video_path: str, output_path: str = None) -> str:
        """Extract audio from video using FFmpeg"""
        if output_path is None:
            base = os.path.splitext(video_path)[0]
            output_path = f"{base}_audio.wav"
        
        try:
            (
                ffmpeg
                .input(video_path)
                .output(output_path, acodec='pcm_s16le', ac=1, ar='16k')
                .overwrite_output()
                .run(capture_stdout=True, capture_stderr=True)
            )
            return output_path
        except ffmpeg.Error as e:
            print(f"FFmpeg error: {e.stderr.decode()}")
            raise Exception(f"Failed to extract audio: {e}")
    
    def transcribe(self, audio_path: str, language: str = "kannada") -> TranscriptionResult:
        """
        Transcribe audio file to text
        
        Args:
            audio_path: Path to audio file (wav, mp3, webm, etc.)
            language: Session language (kannada, hindi, english)
        
        Returns:
            TranscriptionResult with transcript and metadata
        """
        self._load_model()
        
        # Get Whisper language code
        whisper_lang = get_whisper_language(language)
        
        print(f"Transcribing audio with language: {whisper_lang}")
        
        # Transcribe
        result = self.model.transcribe(
            audio_path,
            language=whisper_lang,
            task="transcribe",
            fp16=False  # Use FP32 for CPU compatibility
        )
        
        transcript = result["text"].strip()
        detected_lang = result.get("language", whisper_lang)
        
        # Calculate duration
        import librosa
        audio, sr = librosa.load(audio_path, sr=None)
        duration = len(audio) / sr
        
        # Count words (approximate for all languages)
        word_count = len(transcript.split())
        
        # Confidence (Whisper doesn't provide this directly, use 0.8 as default)
        confidence = 0.8
        
        return TranscriptionResult(
            transcript=transcript,
            detected_language=detected_lang,
            duration_seconds=duration,
            word_count=word_count,
            confidence=confidence
        )
    
    def transcribe_video(self, video_path: str, language: str = "kannada") -> TranscriptionResult:
        """
        Transcribe video file (extracts audio first)
        
        Args:
            video_path: Path to video file
            language: Session language
        
        Returns:
            TranscriptionResult
        """
        # Extract audio
        audio_path = self.extract_audio(video_path)
        
        try:
            # Transcribe
            result = self.transcribe(audio_path, language)
            return result
        finally:
            # Cleanup extracted audio
            if os.path.exists(audio_path):
                os.remove(audio_path)

# Singleton instance
_speech_engine = None

def get_speech_engine() -> SpeechEngine:
    """Get singleton speech engine instance"""
    global _speech_engine
    if _speech_engine is None:
        _speech_engine = SpeechEngine()
    return _speech_engine
