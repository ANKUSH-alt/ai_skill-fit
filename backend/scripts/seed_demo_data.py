"""
Demo Data Seeder - Creates 60 realistic candidates for hackathon demo
Run: python scripts/seed_demo_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import datetime, timedelta
import random
import database as db

KANNADA_NAMES = ["ರಾಜೇಶ್ ಕುಮಾರ್","ಸುರೇಶ್ ಗೌಡ","ಮಹೇಶ್ ನಾಯಕ","ರಮೇಶ್ ಶೆಟ್ಟಿ","ಪ್ರಕಾಶ್ ರೆಡ್ಡಿ",
                 "ವಿಜಯ್ ಕುಮಾರ್","ಅನಿಲ್ ಕುಮಾರ್","ಸಂತೋಷ್ ಕುಮಾರ್","ದೀಪಕ್ ಕುಮಾರ್","ಅಶೋಕ್ ಕುಮಾರ್",
                 "ಮೋಹನ್ ದಾಸ್","ಶಿವಕುಮಾರ್","ಗಣೇಶ್ ಭಟ್","ನಾಗರಾಜ್","ಕಿರಣ್ ಕುಮಾರ್",
                 "ಭರತ್ ಕುಮಾರ್","ಸತೀಶ್ ಕುಮಾರ್","ಮಂಜುನಾಥ್","ಹರೀಶ್ ಕುಮಾರ್","ಯೋಗೇಶ್"]
HINDI_NAMES = ["राजेश कुमार","सुरेश यादव","महेश सिंह","रमेश पटेल","प्रकाश वर्मा",
               "विजय कुमार","अनिल कुमार","संतोष कुमार","दीपक कुमार","अशोक कुमार",
               "मोहन लाल","शिव कुमार","गणेश प्रसाद","नागराज","किरण कुमार",
               "भरत कुमार","सतीश कुमार","मंजुनाथ","हरीश कुमार","योगेश"]
ENGLISH_NAMES = ["Rajesh Kumar","Suresh Gowda","Mahesh Naik","Ramesh Shetty","Prakash Reddy",
                 "Vijay Kumar","Anil Kumar","Santosh Kumar","Deepak Kumar","Ashok Kumar",
                 "Mohan Das","Shiva Kumar","Ganesh Bhat","Nagaraj","Kiran Kumar",
                 "Bharat Kumar","Satish Kumar","Manjunath","Harish Kumar","Yogesh"]

DISTRICTS = ["Bengaluru Urban","Bengaluru Rural","Mysuru","Mangaluru","Hubballi Dharwad",
             "Belagavi","Kalaburagi","Shivamogga","Tumakuru","Udupi","Hassan","Chikkamagaluru"]
ROLES = ["electrician","plumber","welder","carpenter","mason","painter","other"]
EDUCATION = ["10th Standard SSLC","ITI Certificate","Diploma","8th Standard","12th Standard PUC"]

# Category distribution: job_ready(30%), needs_training(35%), requires_verification(15%), low_quality(15%), suspected_fraud(5%)
CATEGORIES = (["job_ready"]*6 + ["needs_training"]*7 + ["requires_verification"]*3 +
              ["low_quality"]*3 + ["suspected_fraud"]*1)

SCORE_RANGES = {
    "job_ready": (7.5, 9.5),
    "needs_training": (5.0, 7.4),
    "requires_verification": (5.0, 7.0),
    "low_quality": (2.0, 4.9),
    "suspected_fraud": (3.0, 6.0)
}

FRAUD_FLAGS_POOL = [
    "Multiple faces detected in responses",
    "Very low eye contact - possibly reading from screen",
    "Abnormally low blink rate",
    "Duplicate face detected",
    "Suspiciously fluent responses with no pauses"
]

def random_score(category):
    lo, hi = SCORE_RANGES[category]
    return round(random.uniform(lo, hi), 2)

def make_phone():
    return f"9{random.randint(100000000, 999999999)}"

def seed_language_group(names, language, count=20):
    print(f"\nSeeding {count} {language} candidates...")
    for i in range(count):
        name = names[i % len(names)]
        phone = make_phone()
        district = random.choice(DISTRICTS)
        role = random.choice(ROLES)
        education = random.choice(EDUCATION)
        experience = random.randint(0, 15)
        category = random.choice(CATEGORIES)

        # Create candidate
        candidate = db.create_candidate({
            "name": name,
            "phone": phone,
            "district": district,
            "role": role,
            "language": language,
            "education": education,
            "experience_years": experience,
            "photo_url": ""
        })

        # Create session
        session = db.create_session(candidate["id"], language)
        db.update_session_status(session["id"], "completed")

        # Generate scores
        overall = random_score(category)
        technical = round(overall + random.uniform(-1, 1), 2)
        communication = round(overall + random.uniform(-1, 1), 2)
        confidence = round(overall + random.uniform(-1, 1), 2)
        lang_score = round(overall + random.uniform(-0.5, 0.5), 2)

        # Clamp scores
        def clamp(v): return max(0.0, min(10.0, v))
        technical = clamp(technical)
        communication = clamp(communication)
        confidence = clamp(confidence)
        lang_score = clamp(lang_score)

        # Fraud flags
        fraud_flags = []
        fraud_score = 0.0
        if category == "suspected_fraud":
            fraud_flags = random.sample(FRAUD_FLAGS_POOL, random.randint(2, 4))
            fraud_score = round(random.uniform(0.7, 0.95), 2)
        elif category == "requires_verification":
            fraud_flags = random.sample(FRAUD_FLAGS_POOL, 1)
            fraud_score = round(random.uniform(0.3, 0.6), 2)

        # Strengths/weaknesses
        strengths = []
        weaknesses = []
        if technical >= 7: strengths.append("Strong technical knowledge")
        else: weaknesses.append("Needs technical training")
        if communication >= 7: strengths.append("Excellent communication")
        else: weaknesses.append("Communication needs improvement")
        if confidence >= 7: strengths.append("Confident and composed")
        else: weaknesses.append("Lacks confidence")

        # Training gaps
        training_gaps = []
        if technical < 6: training_gaps.append(f"Basic {role} skills")
        if communication < 6: training_gaps.append("Communication skills")

        # AI summary
        summaries = {
            "job_ready": f"{name} demonstrates strong {role} skills with {experience} years of experience. Excellent communication and technical knowledge. Recommended for immediate placement.",
            "needs_training": f"{name} shows potential as a {role} with {experience} years of experience. Some gaps in technical knowledge. Recommended for skill enhancement training.",
            "requires_verification": f"{name} applied for {role} position. Some inconsistencies detected during interview. Manual verification recommended before proceeding.",
            "low_quality": f"{name} applied for {role} position but demonstrated insufficient skills. Does not meet minimum requirements at this time.",
            "suspected_fraud": f"{name} applied for {role} position. Multiple fraud indicators detected. Immediate manual review required."
        }

        # Save assessment
        db.save_assessment(candidate["id"], session["id"], {
            "overall_score": overall,
            "technical_score": technical,
            "communication_score": communication,
            "confidence_score": confidence,
            "language_score": lang_score,
            "job_readiness_percentage": int(min(100, overall * 10)),
            "category": category,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "training_gaps": training_gaps,
            "training_recommendations": [{"gap": g, "recommendation": f"Training on {g}", "resource": "Karnataka Skill Development Portal", "duration": "2-4 weeks"} for g in training_gaps],
            "recommended_roles": [role] if overall >= 5 else [f"Assistant {role}"],
            "ai_summary": summaries[category],
            "recruiter_recommendation": {
                "job_ready": "✅ SHORTLIST - Candidate is job-ready.",
                "needs_training": "📚 TRAINING - Recommend for training program.",
                "requires_verification": "🔍 VERIFY - Manual review recommended.",
                "low_quality": "❌ REJECT - Does not meet requirements.",
                "suspected_fraud": "⚠️ BLOCK - Suspected fraud."
            }[category],
            "fraud_score": fraud_score,
            "fraud_flags": fraud_flags,
            "final_status": "shortlisted" if category == "job_ready" and random.random() > 0.5 else "pending_review"
        })

        print(f"  ✓ {name} ({language}) - {role} - {category} - {overall:.1f}/10")

def main():
    print("=" * 60)
    print("AI SkillFit - Demo Data Seeder")
    print("=" * 60)
    print("Creating 60 demo candidates (20 per language)...")

    seed_language_group(KANNADA_NAMES, "kannada", 20)
    seed_language_group(HINDI_NAMES, "hindi", 20)
    seed_language_group(ENGLISH_NAMES, "english", 20)

    stats = db.get_dashboard_stats()
    print("\n" + "=" * 60)
    print("✅ Demo data seeded successfully!")
    print(f"Total candidates: {stats['total_candidates']}")
    print(f"Job Ready: {stats['job_ready']}")
    print(f"Needs Training: {stats['needs_training']}")
    print(f"Requires Verification: {stats['requires_verification']}")
    print(f"Low Quality: {stats['low_quality']}")
    print(f"Suspected Fraud: {stats['suspected_fraud']}")
    print("\nLogin to admin dashboard:")
    print("  URL: http://localhost:5174/admin")
    print("  Email: admin@skillfit.in")
    print("  Password: admin123")
    print("=" * 60)

if __name__ == "__main__":
    main()
