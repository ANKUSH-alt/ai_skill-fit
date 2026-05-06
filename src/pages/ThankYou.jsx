import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';

const CATEGORY_LABELS = {
  job_ready:             { kn: '✅ ಉದ್ಯೋಗಕ್ಕೆ ಸಿದ್ಧ',       hi: '✅ नौकरी के लिए तैयार',    en: '✅ Job Ready' },
  needs_training:        { kn: '📚 ತರಬೇತಿ ಅಗತ್ಯ',           hi: '📚 प्रशिक्षण जरूरी',       en: '📚 Needs Training' },
  requires_verification: { kn: '🔍 ಪರಿಶೀಲನೆ ಅಗತ್ಯ',         hi: '🔍 सत्यापन जरूरी',         en: '🔍 Requires Verification' },
  low_quality:           { kn: '⚠️ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',        hi: '⚠️ फिर कोशिश करें',       en: '⚠️ Please Try Again' },
  suspected_fraud:       { kn: '🚨 ಪರಿಶೀಲನೆ ಅಗತ್ಯ',         hi: '🚨 समीक्षा जरूरी',         en: '🚨 Under Review' }
};

const ScoreBar = ({ label, score, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-300">{label}</span>
      <span className="font-bold text-white">{score?.toFixed(1) ?? '—'}/10</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(score || 0) * 10}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`h-2.5 rounded-full ${color}`} />
    </div>
  </div>
);

const ThankYou = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { candidateData, scores, finalScore } = useInterviewStore();

  const lang = language === 'kannada' ? 'kn' : language === 'hindi' ? 'hi' : 'en';

  // Use finalScore from backend or calculate from question scores
  const displayScore = finalScore || (() => {
    if (!scores?.length) return null;
    const n = scores.length;
    return {
      overall: scores.reduce((s, q) => s + (q.overall_score || 0), 0) / n,
      technical: scores.reduce((s, q) => s + (q.technical_score || 0), 0) / n,
      communication: scores.reduce((s, q) => s + (q.communication_score || 0), 0) / n,
      confidence: scores.reduce((s, q) => s + (q.confidence_score || 0), 0) / n,
      language: scores.reduce((s, q) => s + (q.language_score || 0), 0) / n,
      category: 'needs_training'
    };
  })();

  const category = displayScore?.category || 'needs_training';
  const categoryLabel = CATEGORY_LABELS[category]?.[lang] || CATEGORY_LABELS.needs_training[lang];

  const scoreColor = (s) => s >= 7.5 ? 'text-green-400' : s >= 5 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-8 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto">

        {/* Success Header */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className="text-center mb-8">
          <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center text-6xl">
            ✓
          </div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-white mb-3">{t('thankyou_heading')}</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-2xl text-gray-300">{candidateData?.name}!</motion.p>
        </motion.div>

        {/* Completion Message */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="bg-dark-card rounded-3xl shadow-2xl p-6 mb-6 text-center">
          <p className="text-xl text-white mb-4">{t('interview_complete')}</p>
          <div className="bg-primary/10 border-2 border-primary rounded-xl p-4">
            <p className="text-lg text-primary font-semibold">💬 {t('sms_coming')}</p>
          </div>
        </motion.div>

        {/* Scores */}
        {displayScore && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="bg-dark-card rounded-3xl shadow-2xl p-6 mb-6">

            {/* Category Badge */}
            <div className="text-center mb-6">
              <span className="text-2xl font-bold text-white">{categoryLabel}</span>
            </div>

            {/* Overall Score */}
            <div className="text-center mb-6">
              <div className={`text-7xl font-bold ${scoreColor(displayScore.overall)}`}>
                {displayScore.overall?.toFixed(1)}
              </div>
              <div className="text-gray-400 text-lg mt-1">/ 10</div>
              {displayScore.job_readiness_percentage != null && (
                <div className="mt-2 text-gray-300">
                  {language === 'kannada' ? 'ಉದ್ಯೋಗ ಸಿದ್ಧತೆ' :
                   language === 'hindi' ? 'नौकरी तैयारी' : 'Job Readiness'}: {displayScore.job_readiness_percentage}%
                </div>
              )}
            </div>

            {/* Score Bars */}
            <div className="grid md:grid-cols-2 gap-x-8">
              <ScoreBar
                label={language === 'kannada' ? 'ತಾಂತ್ರಿಕ' : language === 'hindi' ? 'तकनीकी' : 'Technical'}
                score={displayScore.technical} color="bg-indigo-500" />
              <ScoreBar
                label={language === 'kannada' ? 'ಸಂವಹನ' : language === 'hindi' ? 'संचार' : 'Communication'}
                score={displayScore.communication} color="bg-blue-500" />
              <ScoreBar
                label={language === 'kannada' ? 'ಆತ್ಮವಿಶ್ವಾಸ' : language === 'hindi' ? 'आत्मविश्वास' : 'Confidence'}
                score={displayScore.confidence} color="bg-purple-500" />
              <ScoreBar
                label={language === 'kannada' ? 'ಭಾಷೆ' : language === 'hindi' ? 'भाषा' : 'Language'}
                score={displayScore.language} color="bg-green-500" />
            </div>

            {/* Per-question scores */}
            {scores?.length > 0 && (
              <div className="mt-6 border-t border-gray-700 pt-4">
                <p className="text-gray-400 text-sm mb-3">
                  {language === 'kannada' ? 'ಪ್ರಶ್ನೆವಾರು ಅಂಕಗಳು' :
                   language === 'hindi' ? 'प्रश्नवार अंक' : 'Per Question Scores'}
                </p>
                <div className="grid grid-cols-7 gap-2">
                  {scores.map((s, i) => (
                    <div key={i} className="text-center">
                      <div className={`text-lg font-bold ${scoreColor(s.overall_score)}`}>
                        {s.overall_score?.toFixed(1) ?? '—'}
                      </div>
                      <div className="text-xs text-gray-500">Q{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {displayScore.strengths?.length > 0 && (
              <div className="mt-4 p-3 bg-success/10 rounded-xl">
                <p className="text-success font-semibold text-sm mb-1">
                  {language === 'kannada' ? '💪 ಶಕ್ತಿಗಳು' : language === 'hindi' ? '💪 ताकत' : '💪 Strengths'}
                </p>
                {displayScore.strengths.map((s, i) => <p key={i} className="text-gray-300 text-sm">✓ {s}</p>)}
              </div>
            )}
          </motion.div>
        )}

        {/* Good Luck */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="bg-dark-card rounded-3xl shadow-2xl p-6 text-center">
          <p className="text-2xl font-bold text-success">{t('good_luck')}</p>
          <button onClick={() => { localStorage.clear(); navigate('/'); }}
            className="mt-4 px-6 py-2 bg-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-600 transition-colors">
            {language === 'kannada' ? 'ಮನೆ ಪುಟಕ್ಕೆ' : language === 'hindi' ? 'होम पेज' : 'Back to Home'}
          </button>
        </motion.div>

        {/* Confetti */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 0.5 }} className="fixed inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <motion.div key={i}
              initial={{ x: Math.random() * window.innerWidth, y: -20, rotate: 0 }}
              animate={{ y: window.innerHeight + 20, rotate: 360 }}
              transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5, ease: 'linear' }}
              className="absolute w-3 h-3 rounded-full"
              style={{ backgroundColor: ['#4F46E5','#10B981','#F59E0B','#3B82F6','#EF4444'][i % 5] }} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
