"""
AI Assessment Service using Pretrained Models (Simplified)
No SpeechBrain dependency for faster startup
"""
import numpy as np
from typing import Dict, List
import librosa
from sklearn.metrics.pairwise import cosine_similarity

class PretrainedAssessmentService:
    
    def __init__(self):
        self._models_loaded = False
        self._sentence_transformer = None
        self._sentiment_model = None
        self._emotion_model = None
        self._spacy_model = None
    
    def _load_models(self):
        """Lazy load models on first use"""
        if self._models_loaded:
            return
        
        print("Loading pretrained models...")
        
        from sentence_transformers import SentenceTransformer
        from transformers import pipeline
        import spacy
        
        self._sentence_transformer = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Sentence Transformer loaded")
        
        self._sentiment_model = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english"
        )
        print("✅ Sentiment model loaded")
        
        self._emotion_model = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            top_k=None
        )
        print("✅ Emotion model loaded")
        
        try:
            self._spacy_model = spacy.load('en_core_web_sm')
        except:
            print("Downloading spaCy model...")
            import subprocess
            subprocess.run(['python3', '-m', 'spacy', 'download', 'en_core_web_sm'])
            self._spacy_model = spacy.load('en_core_web_sm')
        print("✅ spaCy model loaded")
        
        self._models_loaded = True
        print("✅ All models ready!")
    
    def assess_answer(
        self,
        transcription: str,
        question: str,
        expected_keywords: List[str],
        audio_path: str,
        language: str = 'en'
    ) -> Dict:
        """Comprehensive assessment using pretrained models"""
        
        self._load_models()
        
        # 1. Technical Score
        technical_score = self._assess_technical_accuracy(
            transcription, question, expected_keywords
        )
        
        # 2. Communication Score
        communication_score = self._assess_communication(transcription, language)
        
        # 3. Confidence Score
        confidence_score = self._assess_confidence(transcription)
        
        # 4. Language Score
        language_score = self._assess_language_quality(audio_path, transcription)
        
        # Overall score
        overall_score = (
            technical_score * 0.35 +
            communication_score * 0.25 +
            confidence_score * 0.20 +
            language_score * 0.20
        )
        
        return {
            'technical_score': round(technical_score, 2),
            'communication_score': round(communication_score, 2),
            'confidence_score': round(confidence_score, 2),
            'language_score': round(language_score, 2),
            'overall_score': round(overall_score, 2),
            'category': self._get_category(overall_score),
            'strengths': self._identify_strengths(
                technical_score, communication_score, confidence_score, language_score
            ),
            'improvements': self._identify_improvements(
                technical_score, communication_score, confidence_score, language_score
            )
        }
    
    def _assess_technical_accuracy(
        self, 
        answer: str, 
        question: str, 
        keywords: List[str]
    ) -> float:
        """Use sentence transformers for semantic similarity"""
        
        if not answer.strip():
            return 0.0
        
        # Encode answer and keywords
        answer_embedding = self._sentence_transformer.encode([answer])[0]
        keyword_embeddings = self._sentence_transformer.encode(keywords)
        
        # Calculate similarity scores
        similarities = cosine_similarity(
            [answer_embedding], 
            keyword_embeddings
        )[0]
        
        # Keyword coverage
        keyword_score = np.mean(similarities) * 10
        
        # Answer length appropriateness
        length_score = min(len(answer.split()) / 20, 1.0) * 10
        
        # Combine scores
        technical_score = (keyword_score * 0.7 + length_score * 0.3)
        
        return min(technical_score, 10.0)
    
    def _assess_communication(self, text: str, language: str) -> float:
        """Use spaCy for grammar and fluency analysis"""
        
        if not text.strip():
            return 0.0
        
        doc = self._spacy_model(text)
        scores = []
        
        # 1. Sentence structure
        sentences = list(doc.sents)
        if len(sentences) > 0:
            avg_sentence_length = np.mean([len(sent) for sent in sentences])
            structure_score = min(avg_sentence_length / 10, 1.0)
            scores.append(structure_score)
        
        # 2. Vocabulary diversity
        words = [token.text.lower() for token in doc if token.is_alpha]
        if len(words) > 0:
            unique_ratio = len(set(words)) / len(words)
            scores.append(unique_ratio)
        
        # 3. Grammar (POS tag diversity)
        pos_tags = [token.pos_ for token in doc]
        if pos_tags:
            pos_diversity = len(set(pos_tags)) / max(len(pos_tags), 1)
            scores.append(pos_diversity)
        
        # 4. Coherence
        entities = len(doc.ents)
        entity_score = min(entities / 3, 1.0)
        scores.append(entity_score)
        
        communication_score = np.mean(scores) * 10 if scores else 5.0
        return min(communication_score, 10.0)
    
    def _assess_confidence(self, text: str) -> float:
        """Use emotion and sentiment models"""
        
        if not text.strip():
            return 0.0
        
        # Sentiment analysis
        sentiment_result = self._sentiment_model(text[:512])[0]
        sentiment_score = (
            sentiment_result['score'] 
            if sentiment_result['label'] == 'POSITIVE' 
            else 1 - sentiment_result['score']
        )
        
        # Emotion analysis
        emotion_results = self._emotion_model(text[:512])[0]
        
        # Confidence-related emotions
        confidence_emotions = {
            'joy': 1.0,
            'neutral': 0.7,
            'surprise': 0.6,
            'sadness': 0.3,
            'fear': 0.2,
            'anger': 0.4,
            'disgust': 0.3
        }
        
        emotion_score = sum(
            result['score'] * confidence_emotions.get(result['label'], 0.5)
            for result in emotion_results
        )
        
        # Combine scores
        confidence_score = (sentiment_score * 0.4 + emotion_score * 0.6) * 10
        
        return min(confidence_score, 10.0)
    
    def _assess_language_quality(self, audio_path: str, transcription: str) -> float:
        """Assess speech quality using audio features"""
        try:
            # Load audio
            y, sr = librosa.load(audio_path, sr=16000)
            
            scores = []
            
            # 1. Speech rate
            duration = librosa.get_duration(y=y, sr=sr)
            words = len(transcription.split())
            speech_rate = words / duration if duration > 0 else 0
            
            # Optimal: 2-3 words/sec
            rate_score = 1.0 - abs(speech_rate - 2.5) / 2.5
            rate_score = max(0, min(rate_score, 1.0))
            scores.append(rate_score)
            
            # 2. Pitch variation
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            pitch_values = []
            for t in range(pitches.shape[1]):
                index = magnitudes[:, t].argmax()
                pitch = pitches[index, t]
                if pitch > 0:
                    pitch_values.append(pitch)
            
            if pitch_values:
                pitch_std = np.std(pitch_values)
                pitch_score = min(pitch_std / 50, 1.0)
                scores.append(pitch_score)
            
            # 3. Energy consistency
            rms = librosa.feature.rms(y=y)[0]
            if len(rms) > 0 and np.mean(rms) > 0:
                energy_score = 1.0 - min(np.std(rms) / np.mean(rms), 1.0)
                scores.append(energy_score)
            
            # 4. Silence ratio
            intervals = librosa.effects.split(y, top_db=30)
            speech_duration = sum([(end - start) / sr for start, end in intervals])
            silence_ratio = 1 - (speech_duration / duration) if duration > 0 else 0
            
            # Optimal: 10-20% silence
            silence_score = 1.0 - abs(silence_ratio - 0.15) / 0.15
            silence_score = max(0, min(silence_score, 1.0))
            scores.append(silence_score)
            
            language_score = np.mean(scores) * 10 if scores else 6.0
            return min(language_score, 10.0)
            
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return 6.0
    
    def _get_category(self, overall_score: float) -> str:
        """Categorize candidate"""
        if overall_score >= 7.5:
            return "Job Ready"
        elif overall_score >= 5.0:
            return "Needs Training"
        else:
            return "Low Quality"
    
    def _identify_strengths(
        self, technical: float, communication: float, 
        confidence: float, language: float
    ) -> List[str]:
        """Identify strengths"""
        scores = {
            'Technical Knowledge': technical,
            'Communication Skills': communication,
            'Confidence': confidence,
            'Language Fluency': language
        }
        
        strengths = [skill for skill, score in scores.items() if score >= 7.0]
        return strengths if strengths else ['Shows potential']
    
    def _identify_improvements(
        self, technical: float, communication: float,
        confidence: float, language: float
    ) -> List[str]:
        """Identify improvements"""
        improvements = []
        
        if technical < 6.0:
            improvements.append('Technical knowledge needs strengthening')
        if communication < 6.0:
            improvements.append('Communication clarity can be improved')
        if confidence < 6.0:
            improvements.append('Build confidence through practice')
        if language < 6.0:
            improvements.append('Language fluency needs development')
        
        return improvements if improvements else ['Continue practicing']

# Global instance
assessment_service = PretrainedAssessmentService()
