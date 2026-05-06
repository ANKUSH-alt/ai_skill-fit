import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLanguage from '../hooks/useLanguage';
import useInterviewStore from '../store/interviewStore';
// Simple icons

const Instructions = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { candidateData } = useInterviewStore();

  const instructions = [
    'instruction1',
    'instruction2',
    'instruction3',
    'instruction4',
    'instruction5',
    'instruction6'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-card rounded-3xl shadow-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t('instructions_heading')}
            </h2>
            <p className="text-2xl text-gray-300">
              {t('greeting')} {candidateData.name}!
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {instructions.map((instruction, index) => (
              <motion.div
                key={instruction}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-dark/50 rounded-xl"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-200 text-lg flex-1 pt-1">
                  {t(instruction)}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-primary/10 border-2 border-primary rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary text-2xl">✓</span>
              <p className="text-primary font-bold text-lg">{t('tip_camera')}</p>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary text-2xl">✓</span>
              <p className="text-primary font-bold text-lg">{t('tip_speak')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary text-2xl">✓</span>
              <p className="text-primary font-bold text-lg">{t('tip_light')}</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/camera-check')}
            className="w-full py-5 bg-gradient-to-r from-success to-green-600 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-success/50 transition-all"
          >
            {t('start_interview')}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Instructions;
