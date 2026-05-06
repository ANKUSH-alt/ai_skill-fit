"""
Language Manager - Enforces strict language isolation throughout the system
"""

LANGUAGE_CODES = {
    "kannada": "kn",
    "hindi": "hi",
    "english": "en"
}

WHISPER_LANGUAGE_CODES = {
    "kannada": "kn",
    "hindi": "hi",
    "english": "en"
}

QUESTION_LANGUAGE_KEYS = {
    "kannada": "kannada",
    "hindi": "hindi",
    "english": "english"
}

def get_whisper_language(session_language: str) -> str:
    """Get Whisper language code from session language"""
    return WHISPER_LANGUAGE_CODES.get(session_language, "kn")

def get_question_language_key(session_language: str) -> str:
    """Get question bank language key from session language"""
    return QUESTION_LANGUAGE_KEYS.get(session_language, "kannada")

def get_llm_language_instruction(session_language: str) -> str:
    """Get LLM instruction to respond in correct language"""
    instructions = {
        "kannada": "Write your response in Kannada language only. Use Kannada script (ಕನ್ನಡ). Do not use English or Hindi.",
        "hindi": "Write your response in Hindi language only. Use Devanagari script (हिंदी). Do not use English or Kannada.",
        "english": "Write your response in English language only. Do not use Hindi or Kannada."
    }
    return instructions.get(session_language, instructions["kannada"])

def get_sms_template(session_language: str, category: str) -> str:
    """Get SMS template in correct language based on category"""
    templates = {
        "kannada": {
            "job_ready": "ನಿಮ್ಮ ಅರ್ಜಿ ಆಯ್ಕೆಯಾಗಿದೆ. ಸಂದರ್ಶನಕ್ಕೆ ಬರಲು ತಿಳಿಸಲಾಗಿದೆ. - Karnataka Skill Development",
            "needs_training": "ನಿಮ್ಮ ಅರ್ಜಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಇನ್ನಷ್ಟು ತರಬೇತಿ ನಂತರ ಮತ್ತೆ ಅರ್ಜಿ ಹಾಕಿ. - Karnataka Skill Development",
            "low_quality": "ಈ ಬಾರಿ ಆಯ್ಕೆಯಾಗಿಲ್ಲ. ಮುಂದಿನ ಬಾರಿ ಪ್ರಯತ್ನಿಸಿ. - Karnataka Skill Development",
            "requires_verification": "ನಿಮ್ಮ ಅರ್ಜಿ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ. ಶೀಘ್ರದಲ್ಲಿ ತಿಳಿಸಲಾಗುವುದು. - Karnataka Skill Development",
            "suspected_fraud": "ನಿಮ್ಮ ಅರ್ಜಿ ಪರಿಶೀಲನೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. - Karnataka Skill Development"
        },
        "hindi": {
            "job_ready": "आपका आवेदन चुना गया है। इंटरव्यू के लिए बुलाया गया है। - Karnataka Skill Development",
            "needs_training": "आपका आवेदन मिल गया है। और प्रशिक्षण के बाद फिर आवेदन करें। - Karnataka Skill Development",
            "low_quality": "इस बार चयन नहीं हुआ। अगली बार कोशिश करें। - Karnataka Skill Development",
            "requires_verification": "आपका आवेदन समीक्षा में है। जल्द ही सूचित किया जाएगा। - Karnataka Skill Development",
            "suspected_fraud": "आपका आवेदन समीक्षा के लिए भेजा गया है। - Karnataka Skill Development"
        },
        "english": {
            "job_ready": "Your application has been selected. You are called for interview. - Karnataka Skill Development",
            "needs_training": "Application received. Please apply again after more training. - Karnataka Skill Development",
            "low_quality": "You were not selected this time. Please try again. - Karnataka Skill Development",
            "requires_verification": "Your application is under review. You will be notified soon. - Karnataka Skill Development",
            "suspected_fraud": "Your application has been sent for review. - Karnataka Skill Development"
        }
    }
    lang_templates = templates.get(session_language, templates["kannada"])
    return lang_templates.get(category, lang_templates["low_quality"])

def get_gtts_language_code(session_language: str) -> str:
    """Get gTTS language code for audio generation"""
    codes = {
        "kannada": "kn",
        "hindi": "hi",
        "english": "en"
    }
    return codes.get(session_language, "kn")

def validate_language(language: str) -> bool:
    """Validate if language is supported"""
    return language in LANGUAGE_CODES

def get_language_name(language_code: str) -> str:
    """Get full language name from code"""
    names = {
        "kn": "Kannada",
        "hi": "Hindi",
        "en": "English",
        "kannada": "Kannada",
        "hindi": "Hindi",
        "english": "English"
    }
    return names.get(language_code, "Kannada")
