import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useLanguageStore from '../store/languageStore';

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguageStore();

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    navigate('/registration');
  };

  const languages = [
    { code: 'kannada', label: 'ಕನ್ನಡ', gradient: 'from-red-500 to-orange-500' },
    { code: 'hindi', label: 'हिंदी', gradient: 'from-orange-500 to-amber-500' },
    { code: 'english', label: 'ENGLISH', gradient: 'from-blue-500 to-indigo-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-card to-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl w-full"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            AI SkillFit
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary to-blue-400 mx-auto rounded-full"></div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {languages.map((lang, index) => (
            <motion.button
              key={lang.code}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguageSelect(lang.code)}
              className={`w-full py-6 rounded-2xl bg-gradient-to-r ${lang.gradient} text-white text-3xl md:text-4xl font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300`}
            >
              {lang.label}
            </motion.button>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-gray-400 text-sm"
        >
          Karnataka Skill Development Corporation
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LanguageSelect;
