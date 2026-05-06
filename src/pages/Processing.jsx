import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Processing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { sessionId, setFinalScore } = useInterviewStore();
  const [completedSteps, setCompletedSteps] = useState(0);

  const steps = ['processing_step1', 'processing_step2', 'processing_step3', 'processing_step4'];

  useEffect(() => {
    const run = async () => {
      // Animate steps
      for (let i = 0; i < steps.length; i++) {
        await new Promise(r => setTimeout(r, 1500));
        setCompletedSteps(i + 1);
      }

      // Call backend to complete interview
      try {
        const sid = sessionId || localStorage.getItem('session_id');
        if (sid && !sid.startsWith('demo')) {
          const res = await fetch(`${API}/api/interview/${sid}/complete`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            setFinalScore({
              overall: data.overall_score,
              technical: data.scores?.technical,
              communication: data.scores?.communication,
              confidence: data.scores?.confidence,
              language: data.scores?.language,
              category: data.category,
              job_readiness_percentage: data.job_readiness_percentage,
              strengths: data.strengths || [],
              weaknesses: data.weaknesses || [],
              fraud_flags: data.fraud_flags || [],
              recruiter_recommendation: data.recruiter_recommendation
            });
          }
        }
      } catch (e) { console.error(e); }

      await new Promise(r => setTimeout(r, 800));
      navigate('/thank-you');
    };
    run();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-dark-card rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center mb-12">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 mx-auto mb-6 text-7xl">⚙️</motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('processing_heading')}</h2>
          <p className="text-xl text-gray-400">{t('please_wait')}</p>
        </div>
        <div className="space-y-4">
          {steps.map((step, i) => {
            const done = i < completedSteps;
            const current = i === completedSteps;
            return (
              <motion.div key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  done ? 'bg-success/10 border-success' : current ? 'bg-primary/10 border-primary' : 'bg-gray-800/50 border-gray-700'
                }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-success' : current ? 'bg-primary' : 'bg-gray-700'
                }`}>
                  {done ? <span className="text-white text-2xl">✓</span> :
                   current ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-2xl">⚙️</motion.div> :
                   <span className="text-white font-bold">{i + 1}</span>}
                </div>
                <p className={`text-lg font-semibold ${done ? 'text-success' : current ? 'text-primary' : 'text-gray-500'}`}>
                  {t(step)}
                </p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-3 h-3 bg-primary rounded-full" />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Processing;
