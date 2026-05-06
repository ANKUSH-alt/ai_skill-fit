"""
Pretrained Model Manager
Loads and caches all pretrained models for assessment
"""
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline
)
from sentence_transformers import SentenceTransformer
from speechbrain.pretrained import EncoderClassifier
import spacy
from functools import lru_cache

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self._models = {}
        self._initialized = True
    
    @lru_cache(maxsize=1)
    def get_sentiment_model(self):
        """Sentiment analysis for confidence detection"""
        if 'sentiment' not in self._models:
            self._models['sentiment'] = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english",
                device=0 if self.device == "cuda" else -1
            )
        return self._models['sentiment']
    
    @lru_cache(maxsize=1)
    def get_emotion_model(self):
        """Emotion detection for confidence scoring"""
        if 'emotion' not in self._models:
            self._models['emotion'] = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                device=0 if self.device == "cuda" else -1,
                top_k=None
            )
        return self._models['emotion']
    
    @lru_cache(maxsize=1)
    def get_sentence_transformer(self):
        """Semantic similarity for technical accuracy"""
        if 'sentence_transformer' not in self._models:
            self._models['sentence_transformer'] = SentenceTransformer(
                'all-MiniLM-L6-v2',
                device=self.device
            )
        return self._models['sentence_transformer']
    
    @lru_cache(maxsize=1)
    def get_speech_quality_model(self):
        """Speech quality assessment"""
        if 'speech_quality' not in self._models:
            self._models['speech_quality'] = EncoderClassifier.from_hparams(
                source="speechbrain/spkrec-xvect-voxceleb",
                savedir="pretrained_models/spkrec"
            )
        return self._models['speech_quality']
    
    @lru_cache(maxsize=1)
    def get_spacy_model(self, lang='en'):
        """NLP model for grammar and fluency"""
        key = f'spacy_{lang}'
        if key not in self._models:
            model_map = {
                'en': 'en_core_web_sm',
                'hi': 'xx_ent_wiki_sm',  # multilingual
                'kn': 'xx_ent_wiki_sm'
            }
            try:
                self._models[key] = spacy.load(model_map.get(lang, 'en_core_web_sm'))
            except:
                # Download if not available
                import subprocess
                subprocess.run(['python', '-m', 'spacy', 'download', model_map.get(lang, 'en_core_web_sm')])
                self._models[key] = spacy.load(model_map.get(lang, 'en_core_web_sm'))
        return self._models[key]
    
    @lru_cache(maxsize=1)
    def get_qa_model(self):
        """Question answering for technical assessment"""
        if 'qa' not in self._models:
            self._models['qa'] = pipeline(
                "question-answering",
                model="deepset/roberta-base-squad2",
                device=0 if self.device == "cuda" else -1
            )
        return self._models['qa']

# Global instance
model_manager = ModelManager()
