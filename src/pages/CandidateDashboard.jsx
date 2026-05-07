import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useLanguageStore from '../store/languageStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CATEGORY_INFO = {
  job_ready: {
    color: 'bg-green-100 text-green-900 border-green-300',
    icon: '✅',
    label: { kannada: 'ಕೆಲಸಕ್ಕೆ ಸಿದ್ಧ', hindi: 'नौकरी के लिए तैयार', english: 'Job Ready' }
  },
  needs_training: {
    color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    icon: '📚',
    label: { kannada: 'ತರಬೇತಿ ಅಗತ್ಯ', hindi: 'प्रशिक्षण की आवश्यकता', english: 'Needs Training' }
  },
  requires_verification: {
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: '🔍',
    label: { kannada: 'ಪರಿಶೀಲನೆ ಅಗತ್ಯ', hindi: 'सत्यापन आवश्यक', english: 'Requires Verification' }
  }
};

const STATUS_INFO = {
  pending_review: { kannada: 'ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ', hindi: 'समीक्षाधीन', english: 'Under Review' },
  shortlisted: { kannada: 'ಆಯ್ಕೆಯಾಗಿದೆ', hindi: 'चयनित', english: 'Shortlisted' },
  rejected: { kannada: 'ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', hindi: 'अस्वीकृत', english: 'Not Selected' },
  flagged: { kannada: 'ಪರಿಶೀಲನೆಗಾಗಿ', hindi: 'समीक्षा के लिए', english: 'Under Review' }
};

const CandidateDashboard = () => {
  const { t, getLanguage } = useLanguageStore();
  const language = getLanguage();
  const [phone, setPhone] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError(t('enterValidPhone'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/api/candidate/${phone}/dashboard`);
      setData(res.data);
    } catch (err) {
      setError(t('candidateNotFound'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, score, color = 'bg-indigo-500' }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="font-bold text-gray-900">{score?.toFixed(1) ?? 'N/A'}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score || 0) * 10}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-3 rounded-full ${color}`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">
                {language === 'kannada' ? 'ನನ್ನ ಫಲಿತಾಂಶಗಳು' : 
                 language === 'hindi' ? 'मेरे परिणाम' : 'My Results'}
              </h1>
              <p className="text-xs text-gray-600">
                {language === 'kannada' ? 'AI ಸ್ಕಿಲ್‌ಫಿಟ್ ಮೌಲ್ಯಮಾಪನ' :
                 language === 'hindi' ? 'AI स्किलफिट मूल्यांकन' : 'AI SkillFit Assessment'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Form */}
        {!data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {language === 'kannada' ? 'ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ' :
                 language === 'hindi' ? 'अपने परिणाम देखें' : 'View Your Results'}
              </h2>
              <p className="text-gray-600">
                {language === 'kannada' ? 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ' :
                 language === 'hindi' ? 'अपना मोबाइल नंबर दर्ज करें' : 'Enter your mobile number'}
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'kannada' ? 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ' :
                              language === 'hindi' ? 'मोबाइल नंबर' : 'Mobile Number'}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  maxLength={10}
                />
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-900 px-4 py-3 rounded-xl text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? (language === 'kannada' ? 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...' :
                           language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...') :
                          (language === 'kannada' ? 'ಫಲಿತಾಂಶಗಳನ್ನು ನೋಡಿ' :
                           language === 'hindi' ? 'परिणाम देखें' : 'View Results')}
              </button>
            </form>
          </motion.div>
        )}

        {/* Results Display */}
        {data && data.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⏳</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'kannada' ? 'ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ' :
               language === 'hindi' ? 'प्रक्रिया में' : 'Processing'}
            </h2>
            <p className="text-gray-600 mb-4">{data.message}</p>
            <button
              onClick={() => setData(null)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              {language === 'kannada' ? 'ಹಿಂತಿರುಗಿ' :
               language === 'hindi' ? 'वापस जाएं' : 'Go Back'}
            </button>
          </motion.div>
        )}

        {data && data.status === 'completed' && (
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                {data.candidate.photo_url ? (
                  <img
                    src={`${API}${data.candidate.photo_url}`}
                    alt={data.candidate.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600">
                    {data.candidate.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{data.candidate.name}</h2>
                  <p className="text-gray-600">{data.candidate.applied_role}</p>
                  <p className="text-sm text-gray-500">{data.candidate.district}</p>
                </div>
              </div>

              {/* Category Badge */}
              {data.category && CATEGORY_INFO[data.category] && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold ${CATEGORY_INFO[data.category].color}`}>
                  <span className="text-xl">{CATEGORY_INFO[data.category].icon}</span>
                  <span>{CATEGORY_INFO[data.category].label[language]}</span>
                </div>
              )}
            </motion.div>

            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white text-center"
            >
              <p className="text-sm opacity-90 mb-2">
                {language === 'kannada' ? 'ಒಟ್ಟು ಅಂಕ' :
                 language === 'hindi' ? 'कुल अंक' : 'Overall Score'}
              </p>
              <div className="text-6xl font-bold mb-2">{data.overall_score?.toFixed(1)}</div>
              <div className="text-xl opacity-90">
                {language === 'kannada' ? 'ಕೆಲಸ ಸಿದ್ಧತೆ' :
                 language === 'hindi' ? 'नौकरी की तैयारी' : 'Job Readiness'}: {data.job_readiness_percentage}%
              </div>
            </motion.div>

            {/* Score Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                {language === 'kannada' ? 'ವಿವರವಾದ ಅಂಕಗಳು' :
                 language === 'hindi' ? 'विस्तृत अंक' : 'Detailed Scores'}
              </h3>
              <ScoreBar
                label={language === 'kannada' ? 'ತಾಂತ್ರಿಕ ಕೌಶಲ್ಯ' :
                       language === 'hindi' ? 'तकनीकी कौशल' : 'Technical Skills'}
                score={data.scores?.technical}
                color="bg-indigo-500"
              />
              <ScoreBar
                label={language === 'kannada' ? 'ಸಂವಹನ' :
                       language === 'hindi' ? 'संचार' : 'Communication'}
                score={data.scores?.communication}
                color="bg-blue-500"
              />
              <ScoreBar
                label={language === 'kannada' ? 'ಆತ್ಮವಿಶ್ವಾಸ' :
                       language === 'hindi' ? 'आत्मविश्वास' : 'Confidence'}
                score={data.scores?.confidence}
                color="bg-purple-500"
              />
              <ScoreBar
                label={language === 'kannada' ? 'ಭಾಷಾ ಪ್ರವೀಣತೆ' :
                       language === 'hindi' ? 'भाषा प्रवीणता' : 'Language Proficiency'}
                score={data.scores?.language}
                color="bg-green-500"
              />
            </motion.div>

            {/* Strengths */}
            {data.strengths?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-green-50 rounded-2xl border-2 border-green-300 p-6"
              >
                <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                  <span>💪</span>
                  {language === 'kannada' ? 'ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯಗಳು' :
                   language === 'hindi' ? 'आपकी ताकत' : 'Your Strengths'}
                </h3>
                <ul className="space-y-2">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="text-green-800 font-medium flex items-start gap-2">
                      <span className="text-green-600">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Training Recommendations */}
            {data.training_recommendations?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 rounded-2xl border-2 border-blue-300 p-6"
              >
                <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                  <span>📚</span>
                  {language === 'kannada' ? 'ತರಬೇತಿ ಶಿಫಾರಸುಗಳು' :
                   language === 'hindi' ? 'प्रशिक्षण सिफारिशें' : 'Training Recommendations'}
                </h3>
                <div className="space-y-3">
                  {data.training_recommendations.map((rec, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-1">{rec.gap}</p>
                      <p className="text-sm text-blue-700">{rec.resource} • {rec.duration}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                {language === 'kannada' ? 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ' :
                 language === 'hindi' ? 'वर्तमान स्थिति' : 'Current Status'}
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
                <p className="font-bold text-gray-900 text-lg mb-2">
                  {STATUS_INFO[data.final_status]?.[language] || STATUS_INFO.pending_review[language]}
                </p>
                {data.recruiter_notes && (
                  <p className="text-gray-700 text-sm">{data.recruiter_notes}</p>
                )}
                {!data.recruiter_notes && (
                  <p className="text-gray-600 text-sm">
                    {language === 'kannada' ? 'ನಮ್ಮ ತಂಡ ಶೀಘ್ರದಲ್ಲೇ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತದೆ' :
                     language === 'hindi' ? 'हमारी टीम जल्द ही आपसे संपर्क करेगी' :
                     'Our team will contact you soon'}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Back Button */}
            <button
              onClick={() => setData(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 rounded-xl transition-colors"
            >
              {language === 'kannada' ? 'ಹೊಸ ಹುಡುಕಾಟ' :
               language === 'hindi' ? 'नई खोज' : 'New Search'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
